import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  setDoc
} from 'firebase/firestore';
import { 
  CreditCard, 
  Phone, 
  User as UserIcon, 
  Lock, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  ArrowRight, 
  Plus, 
  Clock, 
  ArrowLeft,
  Sparkles,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  ShoppingBag
} from 'lucide-react';
import { Kit, Client, Paiement, CatalogProduct } from '../types';

const getProductEmoji = (fullName: string) => {
  const name = (fullName || '').toLowerCase();
  if (name.includes('riz')) return '🍚';
  if (name.includes('huile')) return '🛢️';
  if (name.includes('spaghetti') || name.includes('pâte')) return '🍝';
  if (name.includes('tomate')) return '🥫';
  if (name.includes('sucre')) return '🍬';
  if (name.includes('lait')) return '🥛';
  if (name.includes('mixeur') || name.includes('blendeur') || name.includes('robot')) return '🔌';
  if (name.includes('bouilloire')) return '🫖';
  if (name.includes('cuiseur')) return '🍚⚡';
  if (name.includes('jus')) return '🧃';
  if (name.includes('sardines') || name.includes('thon') || name.includes('poisson')) return '🐟';
  if (name.includes('savon')) return '🧼';
  if (name.includes('café') || name.includes('thé')) return '☕';
  if (name.includes('table') || name.includes('assiette') || name.includes('vaisselle')) return '🍽️';
  if (name.includes('gaz')) return '🔥';
  if (name.includes('congelateur') || name.includes('refrigerateur')) return '❄️';
  if (name.includes('poulet') || name.includes('viande')) return '🍗';
  return '📦';
};

const getCategoryBadgeClass = (categoryId: string) => {
  const cat = (categoryId || '').toLowerCase();
  if (cat.includes('bronze')) return 'bg-amber-50 text-amber-900 border-amber-200/50';
  if (cat.includes('argent')) return 'bg-slate-50 text-slate-900 border-slate-200/50';
  if (cat.includes('or')) return 'bg-yellow-50 text-yellow-900 border-yellow-200/50';
  if (cat.includes('platine')) return 'bg-violet-50 text-violet-900 border-violet-200/50';
  return 'bg-blue-50 text-blue-900 border-blue-200/50';
};

const getCategoryLabel = (categoryId: string) => {
  const cat = (categoryId || '').toLowerCase();
  if (cat.includes('bronze')) return 'Gamme Bronze';
  if (cat.includes('argent')) return 'Gamme Argent';
  if (cat.includes('or')) return 'Gamme Or';
  if (cat.includes('platine')) return 'Gamme Platine';
  return 'Kit Spécial';
};

interface PaymentDashboardProps {
  kits: Kit[];
  onBack: () => void;
  whatsappNumber?: string;
  products?: CatalogProduct[];
}

export default function PaymentDashboard({ kits, onBack, whatsappNumber = '+2250703397921', products = [] }: PaymentDashboardProps) {
  // Authentication & Session
  const [localClientId, setLocalClientId] = useState<string | null>(() => {
    return localStorage.getItem('saved_client_profile_uid') || null;
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Computed user object for perfect backwards compatibility with standard functions
  const user = localClientId ? { uid: localClientId } : null;
  
  // Auth Form Fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedKitId, setSelectedKitId] = useState('');
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Firestore Database Client State
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Paiement[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  // Payment Initiation Form
  const [payAmount, setPayAmount] = useState<number>(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'orange' | 'mtn' | 'moov' | 'djamo'>('wave');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // --------------------------------------------------------------------
  // Sync Profile Name-Only Autologin from Submission
  // --------------------------------------------------------------------
  useEffect(() => {
    const autoLogin = async () => {
      const storedName = localStorage.getItem('saved_client_profile_name');
      const storedUid = localStorage.getItem('saved_client_profile_uid');

      if (storedUid) {
        setLocalClientId(storedUid);
        setAuthLoading(false);
      } else if (storedName) {
        try {
          const response = await fetch('/api/clients/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom: storedName })
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.client) {
              setLocalClientId(data.client.uid);
              localStorage.setItem('saved_client_profile_uid', data.client.uid);
            }
          }
        } catch (e) {
          console.error("Auto login by name failed:", e);
        } finally {
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    };

    autoLogin();
  }, []);

  // --------------------------------------------------------------------
  // Real-time Firestore Sync for Profile & Payments
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!user) {
      setClientProfile(null);
      setPayments([]);
      return;
    }

    setProfileLoading(true);
    
    // 1. Real-time stream for the user's Client document
    const profileRef = doc(db, 'clients', user.uid);
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setClientProfile(docSnap.data() as Client);
      } else {
        setClientProfile(null);
      }
      setProfileLoading(false);
    }, (err) => {
      console.error("Profile onSnapshot failed:", err);
      setProfileLoading(false);
    });

    // 2. Real-time stream for the payments collection where clientId = user.uid
    const paymentsRef = collection(db, 'paiements');
    const q = query(paymentsRef, where('clientId', '==', user.uid));
    const unsubPayments = onSnapshot(q, (querySnapshot) => {
      const logs: Paiement[] = [];
      querySnapshot.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...docSnap.data() } as Paiement);
      });
      // Sort in memory by date descending (to avoid composite index requirement immediately)
      logs.sort((a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime());
      setPayments(logs);
    }, (err) => {
      console.error("Payments onSnapshot failed:", err);
    });

    return () => {
      unsubProfile();
      unsubPayments();
    };
  }, [user]);

  // Handle format conversion for WA phones: e.g. +225 or 07...
  const formatPhoneToEmail = (rawPhone: string) => {
    const clean = rawPhone.replace(/[^0-9]/g, '');
    if (clean.length < 8) {
      throw new Error("Numéro de téléphone invalide. Veuillez entrer au moins 8 chiffres.");
    }
    return `phone_${clean}@kit2026.com`;
  };

  // --------------------------------------------------------------------
  // Sign up action (automatically registers on local DB and logs in)
  // --------------------------------------------------------------------
  const handleSignUpAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    
    if (!cleanName) {
      setFormError("Nom complet requis.");
      return;
    }
    if (!cleanPhone) {
      setFormError("Numéro de téléphone requis.");
      return;
    }
    if (!selectedKitId) {
      setFormError("Veuillez sélectionner votre kit alimentaire ou confort.");
      return;
    }

    const selectedKit = kits.find(k => k.id === selectedKitId);
    if (!selectedKit) {
      setFormError("Kit sélectionné introuvable.");
      return;
    }

    // Convert total value to clean number: e.g. "120.000 FCFA" -> 120000
    const rawTotal = selectedKit.totalValue;
    const cleanTotal = parseInt(rawTotal.replace(/[^0-9]/g, ''), 10) || 50000;

    setActionLoading(true);
    try {
      const response = await fetch('/api/clients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: cleanName,
          telephone: cleanPhone,
          whatsapp: cleanPhone,
          produit: selectedKit.name,
          prixTotal: cleanTotal,
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success && resData.clientId) {
        setLocalClientId(resData.clientId);
        localStorage.setItem('saved_client_profile_uid', resData.clientId);
        localStorage.setItem('saved_client_profile_name', cleanName);
        console.log("Client created successfully via local DB:", resData.clientId);
      } else {
        throw new Error(resData.error || "Échec de l'enregistrement de votre profil.");
      }
    } catch (err: any) {
      console.error("Failed to sign up client:", err);
      setFormError(err.message || "Erreur de création de compte.");
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------------------------
  // Login action (profile name-only based)
  // --------------------------------------------------------------------
  const handleSignInAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    const cleanName = fullName.trim();
    if (!cleanName) {
      setFormError("Veuillez entrer votre nom complet de profil.");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/clients/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: cleanName })
      });

      const resData = await response.json();
      if (response.ok && resData.success && resData.client) {
        setLocalClientId(resData.client.uid);
        localStorage.setItem('saved_client_profile_uid', resData.client.uid);
        localStorage.setItem('saved_client_profile_name', resData.client.nom);
      } else {
        setFormError(resData.error || "Une erreur s'est produite lors de la connexion.");
      }
    } catch (err: any) {
      console.error("Sign in failed:", err);
      setFormError("Aucun profil correspondant n'a été trouvé. Veuillez vérifier l'orthographe.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOutAction = async () => {
    try {
      localStorage.removeItem('saved_client_profile_uid');
      localStorage.removeItem('saved_client_profile_name');
      setLocalClientId(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // --------------------------------------------------------------------
  // PayDunya checkout redirect
  // --------------------------------------------------------------------
  const initiatePaydunyaCheckout = async (amountToPay: number) => {
    if (!clientProfile || !user) return;
    
    setFormError('');
    setPaymentSuccessMsg('');
    setPaymentLoading(true);

    try {
      const response = await fetch('/api/paydunya/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user.uid,
          amount: amountToPay,
          productName: clientProfile.produit,
          clientName: clientProfile.nom,
          clientPhone: clientProfile.telephone
        })
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || "Le serveur de paiement n'a pas pu traiter l'appel.");
      }

      const checkoutData = await response.json();
      
      if (checkoutData.success && checkoutData.url) {
        if (checkoutData.simulation) {
          // If in sandbox simulation mode, provide inline modal alert notification
          setPaymentSuccessMsg(`Simulation de paiement initiée : Versement de ${amountToPay} FCFA via PayDunya. Redirection...`);
          setTimeout(() => {
            window.location.href = checkoutData.url;
          }, 1800);
        } else {
          // Real checkout redirection
          window.location.href = checkoutData.url;
        }
      } else {
        throw new Error("Token de redirection non reçu.");
      }
    } catch (err: any) {
      console.error("Payment registration failed:", err);
      setFormError(err.message || "Une erreur s'est produite lors de la connexion à PayDunya.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // --------------------------------------------------------------------
  // Immediate Backend Dev Simulation (Highly dynamic for preview testing)
  // --------------------------------------------------------------------
  const triggerMockVersement = async (amountToSimulate: number) => {
    if (!user || !clientProfile) return;
    setFormError('');
    setPaymentLoading(true);

    try {
      const methodStr = {
        wave: "Wave Côte d'Ivoire",
        orange: "Orange Money C.I.",
        mtn: "MTN Mobile Money C.I.",
        moov: "Moov Money C.I.",
        djamo: "Djamo C.I."
      }[selectedMethod];

      const response = await fetch('/api/paydunya/verify-checkout-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user.uid,
          amount: amountToSimulate,
          moyenPaiement: methodStr
        })
      });

      if (!response.ok) {
        throw new Error("Le serveur simulé a échoué.");
      }

      const resJson = await response.json();
      if (resJson.success) {
        setPaymentSuccessMsg(`🎉 Versement de ${amountToSimulate} FCFA validé instantanément ! Votre cagnotte a été approvisionnée.`);
        setTimeout(() => setPaymentSuccessMsg(''), 5500);
      }
    } catch (e: any) {
      setFormError("La simulation rapide n'a pas pu être exécutée.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Helper values
  const currentPayAmt = customAmount ? parseInt(customAmount, 10) || 0 : payAmount;

  // Render preloading
  if (authLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-2 border-[#0D47FF]/30 border-t-[#0D47FF] animate-spin mb-3"></div>
        <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Vérification de session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      
      {/* Return button */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-slate-100 py-2 px-3.5 rounded-full"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour au catalogue
      </button>

      {/* Hero Header Card */}
      <div className="mb-6 text-center space-y-1">
        <div className="mx-auto w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[#0D47FF]" />
        </div>
        <h2 className="font-display font-extrabold text-[17px] text-slate-900 uppercase tracking-wide">
          Espace Cotisation Progressif
        </h2>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          Payez votre Kit 2026 à votre propre rythme grâce à notre passerelle sécurisée PayDunya.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ==================================================================== */}
        {/* OUT OF SESSION: AUTHENTICATION FORMS */}
        {/* ==================================================================== */}
        {!user ? (
          <motion.div 
            key="auth-box"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white border rounded-3xl p-6 shadow-sm space-y-6"
          >
            {/* Toggle switch */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setFormError(''); }}
                className={`py-2 px-4 rounded-lg font-display font-medium text-xs transition-colors cursor-pointer text-center ${
                  authMode === 'login' 
                    ? 'bg-white text-[#0D47FF] shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                S'identifier
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setFormError(''); }}
                className={`py-2 px-4 rounded-lg font-display font-medium text-xs transition-colors cursor-pointer text-center ${
                  authMode === 'register' 
                    ? 'bg-white text-[#0D47FF] shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Souscrire un Kit
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 font-medium flex gap-2 items-start">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* FORM CONTAINER */}
            <form onSubmit={authMode === 'login' ? handleSignInAction : handleSignUpAction} className="space-y-4">
              
              {/* Full Profile Name: ALWAYS visible to login or sign up */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {authMode === 'login' ? "Entrez votre Nom de Profil complet" : "Votre Nom Complet"}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kouassi Koffi Jean"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
              
              {authMode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Numéro de Téléphone (Mobile Money)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 0707070707"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Sélectionnez votre Kit 2026 (Cliquez sur une image)
                    </label>
                    
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {kits.map(k => {
                        const isSelected = selectedKitId === k.id;
                        return (
                          <div
                            key={k.id}
                            type="button"
                            onClick={() => setSelectedKitId(k.id)}
                            className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col gap-2 relative ${
                              isSelected
                                ? 'border-[#0D47FF] bg-[#0D47FF]/5 ring-1.5 ring-[#0D47FF]/35'
                                : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/50'
                            }`}
                          >
                            {/* Selected Check overlay badge */}
                            <div className="absolute top-2.5 right-2.5 z-10">
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-[#0D47FF] text-white flex items-center justify-center shadow-md">
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-slate-300 bg-white flex items-center justify-center" />
                              )}
                            </div>

                            {/* Main core details */}
                            <div className="flex gap-3 items-start">
                              {/* Left column: Image of the pack */}
                              {k.images && k.images.length > 0 ? (
                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                                  <img 
                                    src={k.images[0]} 
                                    alt={k.name} 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-xl shrink-0 bg-blue-50 border border-blue-100 flex items-center justify-center font-display text-[11px] text-[#0D47FF] font-bold">
                                  Kit 🎁
                                </div>
                              )}

                              {/* Right column: Texts */}
                              <div className="flex-1 min-w-0 pr-6">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-widest border ${getCategoryBadgeClass(k.categoryId)}`}>
                                    {getCategoryLabel(k.categoryId)}
                                  </span>
                                </div>
                                <h4 className="font-display font-extrabold text-[11px] text-slate-800 leading-tight">
                                  {k.name}
                                </h4>
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className="text-[12px] font-black text-[#0D47FF]">
                                    {k.totalValue}
                                  </span>
                                  {k.dailyAmount && (
                                    <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-sm">
                                      {k.dailyAmount} / jour
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Beautiful visual composition of components with real images from the database */}
                            <div className="pt-2 border-t border-slate-100/80">
                              <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3 text-[#0D47FF]" />
                                Contenu détaillé du Kit ({k.products.length} articles) :
                              </p>
                              
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {(() => {
                                  // Gather unique products and count mapping
                                  const counts: { [name: string]: number } = {};
                                  const uniques: string[] = [];
                                  (k.products || []).forEach(prodName => {
                                    if (!prodName) return;
                                    const trimmed = prodName.trim();
                                    const existing = uniques.find(u => u.toLowerCase() === trimmed.toLowerCase());
                                    if (existing) {
                                      counts[existing]++;
                                    } else {
                                      uniques.push(trimmed);
                                      counts[trimmed] = 1;
                                    }
                                  });

                                  return uniques.map((prodName, pIdx) => {
                                    const matched = (products || []).find(
                                      cp => cp.name.trim().toLowerCase() === prodName.toLowerCase()
                                    );
                                    const count = counts[prodName] || 1;
                                    const hasImage = matched && matched.image && matched.image.trim();

                                    return (
                                      <div 
                                        key={pIdx} 
                                        className="flex items-center gap-2 bg-slate-50/70 border border-slate-150 p-1.5 rounded-xl text-left relative"
                                      >
                                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white border border-slate-200/60 flex items-center justify-center">
                                          {hasImage ? (
                                            <img
                                              src={matched.image}
                                              alt={prodName}
                                              referrerPolicy="no-referrer"
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-[#0D47FF]/5 text-[#0D47FF] flex items-center justify-center font-display text-[8px] font-black">
                                              {prodName.substring(0, 2).toUpperCase()}
                                            </div>
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-[9px] font-bold text-slate-800 leading-none truncate" title={prodName}>
                                            {prodName}
                                          </p>
                                          {matched?.subcategory && (
                                            <p className="text-[7.5px] text-slate-400 font-medium truncate mt-0.5 leading-none">
                                              {matched.subcategory}
                                            </p>
                                          )}
                                        </div>
                                        {count > 1 && (
                                          <div className="absolute top-1 right-1 bg-[#0D47FF] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full font-mono scale-90">
                                            x{count}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 bg-[#0D47FF] hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-display font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2.5"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {authMode === 'login' ? "S'identifier" : "Suivant & S'enregistrer"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

            </form>
          </motion.div>
        ) : (
          
          // ====================================================================
          // IN SESSION: DYNAMIC PAYMENT PROGRESS DISPLAYS
          // ====================================================================
          <motion.div
            key="dashboard-box"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header User Greetings card */}
            <div className="bg-white border p-4 rounded-2.5xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0D47FF]/10 flex items-center justify-center border border-[#0D47FF]/20">
                  <UserIcon className="w-4 h-4 text-[#0D47FF]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-[11px] text-slate-900 truncate max-w-[170px]">
                    {clientProfile ? clientProfile.nom : "Utilisateur enregistré"}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-mono tracking-wider">
                    {clientProfile ? clientProfile.telephone : "Compte actif"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOutAction}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-550/10 rounded-lg transition-colors cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* ERROR DISPLAY */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 font-medium flex gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* PRE-REQUISITE IN Firestore CHECK */}
            {profileLoading ? (
              <div className="p-12 text-center bg-white border rounded-3xl">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-[#0D47FF] animate-spin mx-auto mb-2.5 rounded-full"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chargement de votre solde...</p>
              </div>
            ) : !clientProfile ? (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl text-center space-y-3 shadow-sm">
                <HelpCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="font-display font-bold text-xs text-amber-900 block">Dossier de versement introuvable</h3>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Votre compte de versement n'est pas encore initialisé dans la base de données Firestore. Veuillez contacter le support de Kit 2026.
                </p>
              </div>
            ) : (
              <>
                {/* ------------------------------------------------------------- */}
                {/* 1. PROGRESS CARD WITH REALTIME GRADIENTS & ACCENTS */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-gradient-to-tr from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                  {/* Decorative background grid elements */}
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                    <CreditCard className="w-40 h-40" />
                  </div>

                  <div className="space-y-4">
                    {/* Header line */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black uppercase tracking-widest bg-blue-500/35 text-blue-200 px-2 py-0.5 rounded-full border border-blue-500/20">
                          Kit Souscrit
                        </span>
                        <h3 className="font-display font-black text-xs leading-tight tracking-wide text-amber-300">
                          {clientProfile.produit}
                        </h3>
                      </div>
                      
                      <div className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                        clientProfile.statut === 'termine' 
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/20 text-amber-200 border border-amber-500/10'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                        <span>{clientProfile.statut === 'termine' ? 'Cagnotte terminante' : 'Cagnotte progressive'}</span>
                      </div>
                    </div>

                    {/* Progress Percentage Display */}
                    <div className="pt-2 flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[10px] text-blue-200 uppercase tracking-widest block">Accumulé</span>
                        <p className="text-[20px] font-black font-mono tracking-wide">
                          {clientProfile.montantPaye.toLocaleString('fr-FR')} <span className="text-[11px] font-thin">FCFA</span>
                        </p>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="text-[9px] text-[#A6C0FF] uppercase block">Progression</span>
                        <span className="text-[18px] font-black text-amber-400 font-mono">
                          {clientProfile.pourcentage}%
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Modern Progress Bar */}
                    <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-[2.5px] border border-slate-700/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${clientProfile.pourcentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-amber-400"
                      />
                    </div>

                    {/* Footer values details */}
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-800/90 pt-3.5 text-xs text-slate-300 font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wide block mb-0.5">Reste à solder</span>
                        <span className="font-bold text-amber-200">
                          {clientProfile.resteAPayer.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wide block mb-0.5">Coût Total</span>
                        <span className="font-medium">
                          {clientProfile.prixTotal.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. TRANSACTION CONTRIBUTION CONTROLS */}
                {/* ------------------------------------------------------------- */}
                {clientProfile.statut !== 'termine' ? (
                  <div className="bg-white border rounded-3xl p-5 space-y-5 shadow-sm">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-1.5 text-[#0D47FF]">
                        <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                        <h4 className="font-display font-extrabold text-xs uppercase tracking-wide text-slate-800">
                          Faire Un Nouveau Versement
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-450">
                        Choisissez le montant à payer. L'argent est déduit instantanément pour approvisionner votre Kit.
                      </p>
                    </div>

                    {/* QUICK PRE-SET VALUES SELECT */}
                    <div className="grid grid-cols-4 gap-2">
                      {[1000, 2000, 5000, 10000].map((presetAmt) => (
                        <button
                          key={presetAmt}
                          type="button"
                          onClick={() => {
                            setPayAmount(presetAmt);
                            setCustomAmount('');
                          }}
                          className={`py-2 px-1 rounded-xl text-[10px] font-black font-mono transition-all cursor-pointer border ${
                            payAmount === presetAmt && !customAmount
                              ? 'bg-[#0D47FF] border-[#0D47FF] text-white shadow-sm'
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {presetAmt.toLocaleString('fr-FR')} FCFA
                        </button>
                      ))}
                    </div>

                    {/* CUSTOM INPUT VALUE */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold font-sans text-slate-400 uppercase tracking-wide">
                        Autre montant
                      </span>
                      <input
                        type="number"
                        placeholder="Ex: 15000"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setPayAmount(0);
                        }}
                        className="w-full bg-slate-50 border border-slate-100/80 rounded-xl py-3 pl-28 pr-12 text-right font-bold text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-350"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 font-mono">
                        FCFA
                      </span>
                    </div>

                    {/* PAYMENT METHOD SELECTOR */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                        Moyen de paiement Mobile Money
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'wave', label: 'Wave', color: 'bg-cyan-500/10 border-cyan-200 text-cyan-600', activeBg: 'bg-cyan-500 hover:bg-cyan-600' },
                          { id: 'orange', label: 'Orange Money', color: 'bg-orange-500/10 border-orange-200 text-orange-600', activeBg: 'bg-orange-500 hover:bg-orange-600' },
                          { id: 'mtn', label: 'MTN MoMo', color: 'bg-amber-500/10 border-amber-200 text-amber-600', activeBg: 'bg-amber-500 hover:bg-amber-600' },
                          { id: 'moov', label: 'Moov Money', color: 'bg-blue-500/10 border-blue-200 text-blue-600', activeBg: 'bg-blue-500 hover:bg-blue-600' },
                          { id: 'djamo', label: 'Djamo', color: 'bg-violet-500/10 border-violet-200 text-violet-600', activeBg: 'bg-violet-500 hover:bg-violet-600' }
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedMethod(m.id as any)}
                            className={`py-2 px-1 rounded-xl text-[9px] font-bold text-center border cursor-pointer transition-all ${
                              selectedMethod === m.id
                                ? `${m.activeBg} text-white border-transparent shadow-sm`
                                : `${m.color} bg-white hover:bg-slate-50`
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* INFORMATIVE CHECK SUCCESS MODAL MSG */}
                    {paymentSuccessMsg && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] rounded-xl font-medium flex gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{paymentSuccessMsg}</span>
                      </motion.div>
                    )}

                    {/* LAUNCH BUTTONS BLOCK */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => initiatePaydunyaCheckout(currentPayAmt)}
                        disabled={paymentLoading || currentPayAmt <= 100}
                        className="w-full py-3.5 bg-[#0D47FF] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-display font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        {paymentLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>🚀 Cotiser {currentPayAmt.toLocaleString('fr-FR')} FCFA</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Immediate Bypass simulator - crucial to run inside preview frame seamlessly */}
                      <button
                        type="button"
                        onClick={() => triggerMockVersement(currentPayAmt)}
                        disabled={paymentLoading || currentPayAmt <= 100}
                        className="w-full py-2 bg-slate-100 hover:bg-amber-100 border border-dotted border-amber-300 text-slate-600 hover:text-amber-800 rounded-xl font-mono text-[9px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Simulateur de réussite rapide pour environnement sandbox de démonstration"
                      >
                        <span>🧪 Tester versement instantané (Simulation)</span>
                      </button>
                    </div>

                    {/* COMBINED REASSURANCE SECTION WITH GUIDED WHATSAPP ASSISTANCE */}
                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-3.5">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span>Versement Assisté & Épargne Directe</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
                          Vous hésitez concernant le paiement automatique par carte ou mobile money ?
                        </p>
                        <p className="text-[10px] text-slate-500 leading-normal font-medium">
                          Pas de panique ! Vous pouvez également effectuer vos versements directement par <strong className="text-slate-800 font-black">Wave</strong> ou <strong className="text-slate-800 font-black">Orange Money</strong>. Discutez instantanément avec notre assistante pour créditer votre cagnotte de fête en toute simplicité.
                        </p>
                        
                        <a
                          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Bonjour Penta Gad, je préfère effectuer mon versement de ${currentPayAmt.toLocaleString('fr-FR')} FCFA par transfert direct (Wave / Orange Money). Pouvez-vous m'accompagner pour créditer mon carnet d'épargne (${clientProfile.telephone}) ?`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2.5 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 duration-200 cursor-pointer shadow-sm shadow-emerald-500/10 text-center"
                        >
                          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.022-.015-.022-.015-.131-.054-.109-.054-.645-.318-.744-.354-.099-.036-.172-.054-.243.054-.072.108-.277.348-.34.42-.064.072-.126.081-.234.027-.108-.054-.457-.168-.87-1.378-.321-.286-.538-.639-.6-.747-.064-.107-.007-.165.047-.219.049-.048.109-.126.163-.19.054-.063.072-.108.108-.18.036-.072.018-.135-.009-.19-.027-.054-.243-.585-.333-.8-.088-.211-.176-.182-.243-.182-.063-.001-.135-.001-.207-.001-.072 0-.189.027-.288.135-.099.108-.378.369-.378.9 0 .531.387 1.044.441 1.116.054.072.762 1.164 1.845 1.632.258.111.46.177.618.228.26.082.496.071.682.043.208-.031.645-.264.736-.518.09-.254.09-.472.063-.518-.027-.046-.099-.072-.207-.126zm-5.419 7.373-.004-.002-.004-.001a11.16 11.16 0 0 1-5.118-1.258l-.367-.218-3.79 1l1.017-3.69-.24-.381c-.512-.815-.783-1.76-.783-2.732 0-3.003 2.443-5.446 5.448-5.446 1.455 0 2.824.567 3.85 1.595a5.408 5.408 0 0 1 1.592 3.856c-.002 3.004-2.446 5.447-5.451 5.447zm6.75-14.122A8.91 8.91 0 0 0 12.016 4.79c-4.945 0-8.97 4.024-8.973 8.97 0 1.58.411 3.12 1.196 4.479l-1.27 4.63 4.742-1.242a8.913 8.913 0 0 0 4.3 1.11h.004c4.943 0 8.966-4.025 8.969-8.973a8.9 8.9 0 0 0-2.617-6.335z"/>
                          </svg>
                          <span>Assistance WhatsApp</span>
                        </a>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
                    <h3 className="font-display font-extrabold text-xs text-emerald-900 block uppercase">Kit Intégralement Payé !</h3>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Félicitations, vous avez cotisé 100% de la valeur de votre kit. Vos colis et produits de fête sont prêts pour livraison en Décembre.
                    </p>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* 3. HISTORIC TRANSACTION JOURNAL */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white border rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <h4 className="font-display font-extrabold text-xs uppercase tracking-wide">
                      Mon Journal de Versements
                    </h4>
                    <span className="ml-auto text-[9px] font-extrabold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">
                      {payments.length}
                    </span>
                  </div>

                  {payments.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 font-medium text-[10px] space-y-1">
                      <div className="text-lg">💸</div>
                      <p>Aucun paiement n’a encore été versé pour ce kit.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {payments.map((p) => (
                        <div 
                          key={p.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100/70 rounded-xl text-xs gap-3 font-mono"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-700 font-bold block leading-none">
                              {p.montant.toLocaleString('fr-FR')} FCFA
                            </span>
                            <div className="flex items-center gap-1.5 text-[8px] text-slate-400">
                              <span>{p.moyenPaiement}</span>
                              <span>•</span>
                              <span>
                                {new Date(p.datePaiement).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-[8px] font-black uppercase bg-emerald-100 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                              réussi
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </>
            )}

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
