import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Kit } from '../types';

interface RequestFormModalProps {
  kit: Kit;
  onClose: () => void;
  whatsappNumber?: string; // customizable WhatsApp number, defaults to +2250102030405 if not provided
}

export default function RequestFormModal({ kit, onClose, whatsappNumber = "+2250102030405" }: RequestFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    city: 'Abidjan',
    commune: '',
    address: '',
    comment: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nom et prénom requis';
    if (!formData.phone.trim()) newErrors.phone = 'Numéro de téléphone requis';
    if (!formData.whatsapp.trim()) newErrors.whatsapp = 'Numéro WhatsApp requis';
    if (!formData.city.trim()) newErrors.city = 'Ville requise';
    if (!formData.commune.trim()) newErrors.commune = 'Commune / Quartier requis';
    if (!formData.address.trim()) newErrors.address = 'Adresse physique requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Format WhatsApp Message as requested exactly in the prompt
    // Bonjour Penta Gad Distribution,
    //
    // Je souhaite souscrire au :
    // Kit : [Nom du Kit]
    // 
    // Nom : [Nom]
    // Téléphone : [Téléphone]
    // Ville : [Ville]
    // Commune : [Commune]
    // Adresse : [Adresse]
    //
    // Merci de me contacter pour la suite.
    
    // Group duplicate products inside the kit
    const productCounts: { [name: string]: number } = {};
    const uniqueProducts: string[] = [];
    (kit.products || []).forEach(prod => {
      if (!prod) return;
      const trimmed = prod.trim();
      if (!trimmed) return;
      const existing = uniqueProducts.find(o => o.toLowerCase() === trimmed.toLowerCase());
      if (existing) {
        productCounts[existing]++;
      } else {
        uniqueProducts.push(trimmed);
        productCounts[trimmed] = 1;
      }
    });

    const compositionText = uniqueProducts.map(prod => {
      const count = productCounts[prod];
      return count > 1 ? `- ${prod} (x${count})` : `- ${prod}`;
    }).join('\n');

    let kitImgUrl = kit.images && kit.images[0] ? kit.images[0] : '';
    if (kitImgUrl && !kitImgUrl.startsWith('http') && !kitImgUrl.startsWith('data:')) {
      kitImgUrl = `${window.location.origin}${kitImgUrl}`;
    }

    let message = `Bonjour Penta Gad Distribution,

Je souhaite souscrire au kit de fin d'année suivant :

*Kit :* ${kit.name}
*Tarif :* ${kit.dailyAmount} / jour

*Composition du Kit :*
${compositionText || "- (Aucun produit spécifié)"}

---
*Informations de livraison :*
*Nom :* ${formData.name}
*Téléphone :* ${formData.phone}
*WhatsApp :* ${formData.whatsapp}
*Ville :* ${formData.city}
*Commune / Quartier :* ${formData.commune}
*Adresse :* ${formData.address}`;

    if (formData.comment.trim()) {
      message += `\n*Note :* ${formData.comment}`;
    }

    if (kitImgUrl && kitImgUrl.startsWith('http')) {
      message += `\n\n*Aperçu du Kit :* ${kitImgUrl}`;
    }

    message += `\n\nMerci de me contacter pour finaliser ma souscription.`;
    
    // Automatically register client profile in Firestore in the background
    const registerClientAutomatically = async () => {
      try {
        const rawTotal = kit.totalValue;
        const cleanTotal = parseInt(rawTotal.replace(/[^0-9]/g, ''), 10) || 45000;

        const response = await fetch('/api/clients/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nom: formData.name.trim(),
            telephone: formData.phone.trim(),
            whatsapp: formData.whatsapp.trim(),
            produit: kit.name,
            prixTotal: cleanTotal,
            ville: formData.city,
            commune: formData.commune,
            adresse: formData.address
          })
        });

        if (response.ok) {
          const resData = await response.json();
          console.log("Auto-registration successful:", resData);
          // Set in localstorage so they are logged in automatically!
          localStorage.setItem('saved_client_profile_name', formData.name.trim());
        }
      } catch (err) {
        console.error("Failed to auto-register client profile:", err);
      }
    };

    // Execute background registration immediately
    registerClientAutomatically();

    // Encode text for HTTP URL
    const encodedMessage = encodeURIComponent(message);
    
    // Clean target telephone number
    const cleanPhone = whatsappNumber.replace(/[^0-9+]/g, '');
    
    // Construct WhatsApp Click-to-Chat url
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    // Redirect to WhatsApp Click to Chat API (opens in dynamic tab/redirect)
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="request_form_container"
        className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
      >
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-tr from-[#0D47FF] to-[#2F6BFF] text-white p-5 relative">
          <button
            id="close_form_btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/85 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FFF] text-yellow-300">
            Étape Finale • Souscription express
          </span>
          <h3 className="font-display font-black text-lg mt-0.5 leading-tight">
            Soumettre votre Demande
          </h3>
          
          {/* Linked Kit Badge */}
          <div className="mt-3.5 bg-white/12 backdrop-blur-sm border border-white/12 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/70 uppercase leading-none font-medium">Kit Sélectionné</p>
              <p className="text-xs font-bold truncate mt-0.5">{kit.name}</p>
              <p className="text-xs font-black font-mono text-yellow-300 mt-0.5">{kit.dailyAmount} <span className="font-normal text-[10px] text-white/80">/ jour</span></p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          {/* Header Info Banner */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2.5">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-800 leading-[1.45]">
              Cette demande sera envoyée <strong>directement par WhatsApp</strong>. Aucun paiement en ligne n'est demandé. Un conseiller Penta Gad Distribution vous recontactera.
            </p>
          </div>

          {/* Nom et prénom */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
              Nom et prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Kouassi Koffi Jean-Marc"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full bg-slate-50 border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 ${
                errors.name ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-600'
              }`}
            />
            {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Grid fields for Phones */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Téléphone */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: 0702030405"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 ${
                  errors.phone ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              {errors.phone && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: 0501020304"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 ${
                  errors.whatsapp ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              {errors.whatsapp && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.whatsapp}</p>}
            </div>
          </div>

          {/* Grid fields for Ville & Commune */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Ville */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Ville <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Abidjan"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 ${
                  errors.city ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              {errors.city && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.city}</p>}
            </div>

            {/* Commune / Quartier */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
                Commune/Quartier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Yopougon Maroc"
                value={formData.commune}
                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 ${
                  errors.commune ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              {errors.commune && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.commune}</p>}
            </div>
          </div>

          {/* Adresse physique */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
              Adresse complète <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Sapeur-pompier, non loin de la cité SGBCI"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full bg-slate-50 border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 ${
                errors.address ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-blue-600'
              }`}
            />
            {errors.address && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* Commentaire facultatif */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5">
              Remarque / Heure souhaitée d'appel <span className="text-slate-400 text-[10px] font-normal">(Facultatif)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Appelez de préférence l'après-midi..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 placeholder:text-slate-400"
            />
          </div>

          {/* Submit Trigger CTA Button */}
          <button
            id="submit_request_form"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0D47FF] hover:bg-[#2F6BFF] text-white font-display font-extrabold text-sm py-4 px-5 rounded-xl transition-all shadow-md shadow-[#0D47FF]/15 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span>{isSubmitting ? 'Redirection en cours...' : 'Envoyer via WhatsApp'}</span>
            <Send className="w-4 h-4 text-white" />
          </button>

          <p className="text-[10px] text-center text-slate-400 italic">
            En validant, l'application ouvrira WhatsApp pour pré-remplir votre message d'adhésion.
          </p>

        </form>

      </div>
    </div>
  );
}
