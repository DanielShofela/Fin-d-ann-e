import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, X, Lock, 
  Settings, CheckCircle, RefreshCcw, Tag, ShoppingBag, Eye,
  Image as ImageIcon, HelpCircle, Layers, ClipboardList, Info, Star
} from 'lucide-react';
import { Category, Kit, SiteSettings, CatalogProduct } from '../types';

interface AdminPanelProps {
  categories: Category[];
  kits: Kit[];
  products?: CatalogProduct[];
  token: string | null;
  onLogin: (password: string) => Promise<boolean>;
  onRefreshData: () => void;
  // Category Callbacks
  onAddCategory: (category: Partial<Category>) => Promise<boolean>;
  onUpdateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  onReorderCategories: (sortedIds: string[]) => Promise<boolean>;
  // Kit Callbacks
  onAddKit: (kit: Partial<Kit>) => Promise<boolean>;
  onUpdateKit: (id: string, kit: Partial<Kit>) => Promise<boolean>;
  onDeleteKit: (id: string) => Promise<boolean>;
  onReorderKits: (sortedIds: string[]) => Promise<boolean>;
  // Product Callbacks
  onAddProduct: (prod: Partial<CatalogProduct>) => Promise<boolean>;
  onUpdateProduct: (id: string, prod: Partial<CatalogProduct>) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onSeedProducts?: () => Promise<boolean>;
  // Site Customization Configs
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
}

export default function AdminPanel({
  categories,
  kits,
  products = [],
  token,
  onLogin,
  onRefreshData,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onAddKit,
  onUpdateKit,
  onDeleteKit,
  onReorderKits,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onSeedProducts,
  settings,
  onUpdateSettings
}: AdminPanelProps) {
  
  // Login State
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'categories' | 'kits' | 'settings' | 'products'>('categories');

  // Selected Category filter for Kits list
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');

  // Editing Categories
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catEditingId, setCatEditingId] = useState<string | null>(null); // null means adding
  const [catForm, setCatForm] = useState({
    title: '',
    startingAmount: '500 FCFA / jour',
    image: '/src/assets/images/food_pack_bronze_1781612322822.jpg'
  });

  // Editing Kits
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [kitEditingId, setKitEditingId] = useState<string | null>(null); // null means adding
  const [kitForm, setKitForm] = useState({
    categoryId: '',
    name: '',
    dailyAmount: '1 000 FCFA / jour',
    totalValue: '90 000 FCFA',
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'],
    products: [] as string[],
    benefits: [] as string[],
    deliveryInfo: 'Livraison gratuite en Décembre.'
  });

  // Temp state for key lists
  const [productInput, setProductInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [kitProdSearch, setKitProdSearch] = useState('');

  // Editing Products in Catalog
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [prodEditingId, setProdEditingId] = useState<string | null>(null); // null means adding
  const [prodForm, setProdForm] = useState({
    category: 'Produits alimentaires',
    subcategory: '',
    name: '',
    image: ''
  });
  const [isSavingProd, setIsSavingProd] = useState(false);
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [isSavingKit, setIsSavingKit] = useState(false);

  // Product Search & Filter
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [selectedProdCatFilter, setSelectedProdCatFilter] = useState('Tous');

  // Settings customizable states
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Sync state if settings update
  useEffect(() => {
    if (settings) {
      const activeFeatured = (settings.featuredKitIds || []).filter(id => kits.some(k => k.id === id));
      setSettingsForm({
        ...settings,
        featuredKitIds: activeFeatured
      });
    }
  }, [settings, kits]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    
    // Clean up empty or obsolete kit IDs before saving
    const cleanedFeaturedIds = (settingsForm.featuredKitIds || [])
      .filter(id => id && id.trim() !== "" && kits.some(k => k.id === id));

    const updatedForm = {
      ...settingsForm,
      featuredKitIds: cleanedFeaturedIds
    };

    const success = await onUpdateSettings(updatedForm);
    setIsSavingSettings(false);
    if (success) {
      showStatus('Configuration du site enregistrée et mise en ligne !');
    } else {
      showStatus('Erreur lors de l\'enregistrement des configurations.', 'error');
    }
  };

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const [isUploading, setIsUploading] = useState(false);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
      img.src = base64Str;
    });
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      let rawBase64 = await base64Promise;
      // Compress image client-side to keep Firestore document size small.
      // Returning base64 directly ensures images persist permanently in Firestore
      // and display flawlessly across dev, preview, or shared environments!
      const compressedBase64 = await compressImage(rawBase64);
      setIsUploading(false);
      return compressedBase64;
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || "Erreur lors du traitement de l'image", 'error');
      setIsUploading(false);
      return null;
    }
  };

  // Preset Image Catalog to choose from tap
  const imagePresets = [
    { name: "Alimentation Bronze", url: "/src/assets/images/food_pack_bronze_1781612322822.jpg" },
    { name: "Électroménager Platinum", url: "/src/assets/images/appliances_pack_platinum_1781612340346.jpg" },
    { name: "Riz & Épicerie", url: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&q=80&w=600" },
    { name: "Supermarché frais", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600" },
    { name: "Ustensils Four de Cuisine", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600" },
    { name: "TV & Écrans", url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600" },
    { name: "Équipements Blendeur", url: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=600" }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    const success = await onLogin(password);
    setIsLoggingIn(false);
    
    if (!success) {
      setLoginError('Mot de passe incorrect. Réessayez.');
    }
  };

  // Reordering Methods
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const listCopy = [...categories];
    // swap objects
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIdx];
    listCopy[targetIdx] = temp;

    const ids = listCopy.map(c => c.id);
    const success = await onReorderCategories(ids);
    if (success) {
      showStatus('Ordre des catégories mis à jour.');
      onRefreshData();
    } else {
      showStatus('Échec de la réorganisation', 'error');
    }
  };

  const handleMoveKit = async (index: number, direction: 'up' | 'down') => {
    // We must swap within the currently visible kits in the list
    const visibleKits = selectedCatFilter === 'all' 
      ? [...kits] 
      : kits.filter(k => k.categoryId === selectedCatFilter);

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= visibleKits.length) return;

    // Swap ids in master sorted order
    const masterCopy = [...kits];
    const kitA = visibleKits[index];
    const kitB = visibleKits[targetIdx];

    const idxA = masterCopy.findIndex(k => k.id === kitA.id);
    const idxB = masterCopy.findIndex(k => k.id === kitB.id);

    // Swap indexes in master order
    const temp = masterCopy[idxA];
    masterCopy[idxA] = masterCopy[idxB];
    masterCopy[idxB] = temp;

    const ids = masterCopy.map(k => k.id);
    const success = await onReorderKits(ids);
    if (success) {
      showStatus('Ordre des kits mis à jour.');
      onRefreshData();
    } else {
      showStatus('Échec de la réorganisation des kits', 'error');
    }
  };

  const handleToggleStarKit = async (kitId: string) => {
    const currentFeatured = settings?.featuredKitIds || [];
    // Only keep IDs that actually exist in the current kits list!
    const activeFeatured = currentFeatured.filter(id => kits.some(k => k.id === id));
    
    if (activeFeatured.includes(kitId)) {
      // Remove Star
      const newFeatured = activeFeatured.filter(id => id !== kitId);
      const success = await onUpdateSettings({ featuredKitIds: newFeatured });
      if (success) {
        showStatus('Kit retiré de la page d\'accueil.');
      } else {
        showStatus('Échec du retrait.', 'error');
      }
    } else {
      // Add Star
      if (activeFeatured.length >= 3) {
        alert("Vous avez déjà sélectionné 3 kits vedettes. Veuillez d'abord retirer l'étoile de l'un des kits vedettes actuels.");
        return;
      }
      const newFeatured = [...activeFeatured, kitId];
      const success = await onUpdateSettings({ featuredKitIds: newFeatured });
      if (success) {
        showStatus("Kit marqué comme Vedette et ajouté à la page d'accueil !");
      } else {
        showStatus('Échec du marquage.', 'error');
      }
    }
  };

  // Category Form Dialog Action
  const handleOpenCatModal = (cat: Category | null = null) => {
    if (cat === null) {
      setCatEditingId(null);
      setCatForm({
        title: '',
        startingAmount: '500 FCFA / jour',
        image: '/src/assets/images/food_pack_bronze_1781612322822.jpg'
      });
    } else {
      setCatEditingId(cat.id);
      setCatForm({
        title: cat.title,
        startingAmount: cat.startingAmount,
        image: cat.image
      });
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.title.trim()) {
      showStatus('Le titre est obligatoire', 'error');
      return;
    }

    setIsSavingCat(true);
    try {
      if (catEditingId === null) {
        // Create new
        const success = await onAddCategory(catForm);
        if (success) {
          showStatus('Catégorie créée avec succès.');
          setIsCatModalOpen(false);
          onRefreshData();
        } else {
          showStatus('Erreur lors de la création de la catégorie.', 'error');
        }
      } else {
        // Modify
        const success = await onUpdateCategory(catEditingId, catForm);
        if (success) {
          showStatus('Catégorie modifiée avec succès.');
          setIsCatModalOpen(false);
          onRefreshData();
        } else {
          showStatus('Erreur lors de la modification.', 'error');
        }
      }
    } catch (err: any) {
      console.error(err);
      showStatus('Erreur de connexion lors de la sauvegarde.', 'error');
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCategoryClick = async (id: string, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer la catégorie "${name}" ? ATTENTION: Tous les kits associés à cette catégorie seront irrémédiablement supprimés.`)) {
      const success = await onDeleteCategory(id);
      if (success) {
        showStatus('Catégorie supprimée.');
        onRefreshData();
      } else {
        showStatus('Échec de la suppression.', 'error');
      }
    }
  };

  // Kit Form Dialog Action
  const handleOpenKitModal = (kit: Kit | null = null) => {
    if (kit === null) {
      setKitEditingId(null);
      setKitForm({
        categoryId: categories[0]?.id || '',
        name: '',
        dailyAmount: '1 000 FCFA / jour',
        totalValue: '90 000 FCFA',
        images: ['/src/assets/images/food_pack_bronze_1781612322822.jpg'],
        products: [],
        benefits: [],
        deliveryInfo: 'Livraison gratuite en Décembre.'
      });
      setProductInput('');
      setBenefitInput('');
      setImageInput('');
    } else {
      setKitEditingId(kit.id);
      setKitForm({
        categoryId: kit.categoryId,
        name: kit.name,
        dailyAmount: kit.dailyAmount,
        totalValue: kit.totalValue || '',
        images: [...(kit.images || [])],
        products: [...(kit.products || [])],
        benefits: [...(kit.benefits || [])],
        deliveryInfo: kit.deliveryInfo || 'Livraison gratuite.'
      });
      setProductInput('');
      setBenefitInput('');
      setImageInput('');
    }
    setIsKitModalOpen(true);
  };

  const handleAddProductItem = () => {
    if (productInput.trim()) {
      setKitForm({
        ...kitForm,
        products: [...kitForm.products, productInput.trim()]
      });
      setProductInput('');
    }
  };

  const handleRemoveProductItem = (idx: number) => {
    const list = [...kitForm.products];
    list.splice(idx, 1);
    setKitForm({ ...kitForm, products: list });
  };

  const handleAddBenefitItem = () => {
    if (benefitInput.trim()) {
      setKitForm({
        ...kitForm,
        benefits: [...kitForm.benefits, benefitInput.trim()]
      });
      setBenefitInput('');
    }
  };

  const handleRemoveBenefitItem = (idx: number) => {
    const list = [...kitForm.benefits];
    list.splice(idx, 1);
    setKitForm({ ...kitForm, benefits: list });
  };

  const handleAddImageURL = () => {
    if (imageInput.trim()) {
      setKitForm({
        ...kitForm,
        images: [...kitForm.images, imageInput.trim()]
      });
      setImageInput('');
    }
  };

  const handleRemoveImageURL = (idx: number) => {
    if (kitForm.images.length <= 1) {
      showStatus('Un kit doit avoir au moins une image', 'error');
      return;
    }
    const list = [...kitForm.images];
    list.splice(idx, 1);
    setKitForm({ ...kitForm, images: list });
  };

  const handleSaveKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitForm.categoryId || !kitForm.name || !kitForm.dailyAmount) {
      showStatus('Veuillez renseigner les champs requis (Catégorie, Nom, Montant)', 'error');
      return;
    }

    setIsSavingKit(true);
    try {
      if (kitEditingId === null) {
        // Create new
        const success = await onAddKit(kitForm);
        if (success) {
          showStatus('Nouveau kit créé avec succès !');
          setIsKitModalOpen(false);
          onRefreshData();
        } else {
          showStatus('Échec de la création du kit', 'error');
        }
      } else {
        // Edit
        const success = await onUpdateKit(kitEditingId, kitForm);
        if (success) {
          showStatus('Kit mis à jour avec succès.');
          setIsKitModalOpen(false);
          onRefreshData();
        } else {
          showStatus('Échec de la modification.', 'error');
        }
      }
    } catch (err: any) {
      console.error(err);
      showStatus('Erreur lors de l\'enregistrement du kit.', 'error');
    } finally {
      setIsSavingKit(false);
    }
  };

  const handleDeleteKitClick = async (id: string, name: string) => {
    if (window.confirm(`Sûr de vouloir supprimer le kit "${name}" ?`)) {
      const success = await onDeleteKit(id);
      if (success) {
        showStatus('Kit supprimé.');
        onRefreshData();
      } else {
        showStatus('Échec de la suppression.', 'error');
      }
    }
  };


  const openProdModal = (prod?: CatalogProduct) => {
    if (!prod) {
      setProdEditingId(null);
      setProdForm({
        category: 'Produits alimentaires',
        subcategory: '',
        name: '',
        image: ''
      });
    } else {
      setProdEditingId(prod.id);
      setProdForm({
        category: prod.category || 'Produits alimentaires',
        subcategory: prod.subcategory || '',
        name: prod.name || '',
        image: prod.image || ''
      });
    }
    setIsProdModalOpen(true);
  };

  const handleProdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.category.trim()) {
      showStatus('Veuillez remplir le nom et la catégorie du produit.', 'error');
      return;
    }
    setIsSavingProd(true);
    let success = false;
    if (prodEditingId === null) {
      success = await onAddProduct(prodForm);
      if (success) showStatus('Produit ajouté au catalogue !');
    } else {
      success = await onUpdateProduct(prodEditingId, prodForm);
      if (success) showStatus('Produit mis à jour dans le catalogue !');
    }
    setIsSavingProd(false);
    if (success) {
      setIsProdModalOpen(false);
      onRefreshData();
    } else {
      showStatus('Erreur lors de la sauvegarde du produit.', 'error');
    }
  };

  const handleDeleteProdClick = async (id: string, name: string) => {
    if (window.confirm(`Voulez-vous vraiment supprimer "${name}" du catalogue ?`)) {
      const success = await onDeleteProduct(id);
      if (success) {
        showStatus('Produit supprimé du catalogue.');
        onRefreshData();
      } else {
        showStatus('Erreur lors de la suppression.', 'error');
      }
    }
  };


  // If no auth token, render secure login page
  if (!token) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex flex-col justify-center px-4 py-12 relative">
        <div className="absolute inset-0 bg-radial-at-b from-blue-900/40 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-md w-full mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-8 z-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0D47FF] flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-display font-extrabold text-xl text-slate-900">
              Espace Administration
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Consoles dédiées de gestion du catalogue "Penta Gad Distribution" pour fêter la fin d'année.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Clé d'Accès Sécurisée
              </label>
              <input
                type="password"
                required
                placeholder="Introduire le code d'accès..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#0D47FF] focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none placeholder:text-slate-400 font-mono tracking-widest text-center"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-500 font-bold text-center bg-red-50 border border-red-100 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5">
                <span>⚠️ {loginError}</span>
              </p>
            )}

            <button
              id="admin_login_submit_btn"
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-display font-bold text-sm py-4 px-5 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer uppercase tracking-wider"
            >
              {isLoggingIn ? 'Authentification...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 mt-6 font-mono uppercase tracking-widest">
            Penta Gad Distribution • 2026 Admin
          </p>
        </div>
      </div>
    );
  }

  // Active items count helpers
  const kitsList = selectedCatFilter === 'all' 
    ? kits 
    : kits.filter(k => k.categoryId === selectedCatFilter);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      (p.name || '').toLowerCase().includes(prodSearchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(prodSearchQuery.toLowerCase()) ||
      (p.subcategory || '').toLowerCase().includes(prodSearchQuery.toLowerCase());
    
    if (selectedProdCatFilter === 'Tous') return matchesSearch;
    return matchesSearch && p.category === selectedProdCatFilter;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      
      {/* Header Info */}
      <div className="bg-slate-900 text-white py-12 px-6 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0D47FF]/20 to-transparent pointer-events-none" />
        <div className="max-w-md mx-auto relative z-10 flex items-center justify-between">
          <div>
            <span className="text-yellow-300 text-[10px] font-extrabold uppercase tracking-widest block mb-1">Penta Gad Distribution CMS</span>
            <h1 className="font-display font-black text-2xl tracking-tight leading-none text-white">Console Gérant</h1>
            <p className="text-white/70 text-xs mt-1">Gérez le catalogue interactif en temps réel</p>
          </div>
          <button
            onClick={onRefreshData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/18 text-white transition-all cursor-pointer"
            title="Rafraîchir les données"
          >
            <RefreshCcw className="w-4 h-4 animate-spin-reverse" />
          </button>
        </div>
      </div>

      {/* Floating Status Notification bar */}
      {statusMessage && (
        <div className="fixed top-20 left-4 right-4 max-w-sm mx-auto z-50 animate-bounce">
          <div className={`p-3.5 rounded-xl text-xs font-extrabold shadow-lg border flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100 shadow-emerald-100/40' 
              : 'bg-red-50 text-red-800 border-red-100 shadow-red-100/40'
          }`}>
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-md mx-auto px-4 mt-6">
        <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-2 gap-1.5">
          <button
            id="tab_categories_btn"
            onClick={() => setActiveTab('categories')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'categories' 
                ? 'bg-[#0D47FF] text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="truncate">Gérer Catégories ({categories.length})</span>
          </button>
          
          <button
            id="tab_kits_btn"
            onClick={() => setActiveTab('kits')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'kits' 
                ? 'bg-[#0D47FF] text-white shadow-md' 
                : 'text-slate-680 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="truncate">Gérer Kits ({kits.length})</span>
          </button>

          <button
            id="tab_products_btn"
            onClick={() => setActiveTab('products')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'products' 
                ? 'bg-[#0D47FF] text-white shadow-md' 
                : 'text-slate-680 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="truncate">Catalogue ({products.length})</span>
          </button>

          <button
            id="tab_settings_btn"
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-[#0D47FF] text-white shadow-md' 
                : 'text-slate-680 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="truncate">Personnaliser</span>
          </button>
        </div>
      </div>

      {/* TABS CONTAINER */}
      <div className="max-w-md mx-auto px-4 mt-6">
        
        {/* TAB 1: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Index d'agencement</span>
              
              <button
                id="add_cat_btn_quick"
                onClick={() => handleOpenCatModal()}
                className="bg-[#2F6BFF] hover:bg-blue-600 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-3.5">
              {categories.map((cat, idx) => (
                <div 
                  key={cat.id} 
                  className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm flex items-center justify-between gap-3 hover:border-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={cat.image} 
                      alt={cat.title} 
                      className="w-12 h-12 object-cover rounded-xl shrink-0 bg-slate-100 border border-slate-50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="font-display font-extrabold text-sm text-slate-800 leading-none">{cat.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-wider">{cat.startingAmount}</p>
                    </div>
                  </div>

                  {/* Toolbar Row */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Reordering indicators */}
                    <button
                      onClick={() => handleMoveCategory(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg disabled:opacity-20 transition-colors cursor-pointer"
                      title="Monter"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveCategory(idx, 'down')}
                      disabled={idx === categories.length - 1}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg disabled:opacity-20 transition-colors cursor-pointer"
                      title="Descendre"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <div className="h-5 w-[1px] bg-slate-100 mx-1" />

                    <button
                      onClick={() => handleOpenCatModal(cat)}
                      className="p-1.5 text-slate-500 hover:text-[#0D47FF] hover:bg-blue-50/50 rounded-lg transition-colors cursor-pointer"
                      title="Modifier la catégorie"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategoryClick(cat.id, cat.title)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer la catégorie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: KITS */}
        {activeTab === 'kits' && (
          <div className="space-y-4">
            
            {/* Category Filter selector for Kits management */}
            <div className="bg-slate-100 hover:bg-slate-200/60 p-3 rounded-2.5xl space-y-2">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Filtrer par catégorie de pack:
              </label>
              <select
                id="kit_filter_select"
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="all">Tous les packs ({kits.length})</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>Gamme {c.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Produits enregistrés ({kitsList.length})</span>
              
              <button
                id="add_kit_btn_quick"
                onClick={() => handleOpenKitModal()}
                className="bg-[#2F6BFF] hover:bg-blue-600 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Kit</span>
              </button>
            </div>

            {/* Kits List Grid */}
            <div className="space-y-3.5">
              {kitsList.map((kit, idx) => {
                const associatedCat = categories.find(c => c.id === kit.categoryId);
                return (
                  <div 
                    key={kit.id} 
                    className="bg-white rounded-2xl border border-slate-150 p-4 shadow-sm flex items-center justify-between gap-3 hover:border-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={kit.images && kit.images[0] ? kit.images[0] : 'https://picsum.photos/seed/kit/100/100'} 
                        alt={kit.name} 
                        className="w-12 h-12 object-cover rounded-xl shrink-0 bg-slate-100 border border-slate-50"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-800 tracking-wider px-2 py-0.5 rounded uppercase font-sans">
                          {associatedCat ? `Gamme ${associatedCat.title}` : 'Sans Catégorie'}
                        </span>
                        <h4 className="font-display font-extrabold text-sm text-slate-800 leading-tight mt-1.5 truncate">{kit.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">{kit.dailyAmount} (Total: {kit.totalValue || 'N/A'})</p>
                      </div>
                    </div>

                    {/* Toolbar Row */}
                    <div className="flex items-center gap-1 shrink-0">
                      {(() => {
                        const isStarred = (settings?.featuredKitIds || []).includes(kit.id);
                        return (
                          <button
                            type="button"
                            onClick={() => handleToggleStarKit(kit.id)}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              isStarred 
                                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100/50 border border-amber-200/50' 
                                : 'text-slate-350 hover:text-amber-500 hover:bg-slate-100/50'
                            }`}
                            title={isStarred ? "Vedette (Retirer de la page d'accueil)" : "Marquer comme Vedette (Afficher sur la page d'accueil)"}
                          >
                            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-current text-amber-500' : 'fill-none text-slate-400'}`} />
                          </button>
                        );
                      })()}

                      <div className="h-5 w-[1px] bg-slate-150 mx-1" />

                      {/* Reordering buttons within active segment scope */}
                      <button
                        onClick={() => handleMoveKit(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg disabled:opacity-20 transition-colors cursor-pointer"
                        title="Monter"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveKit(idx, 'down')}
                        disabled={idx === kitsList.length - 1}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg disabled:opacity-20 transition-colors cursor-pointer"
                        title="Descendre"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <div className="h-5 w-[1px] bg-slate-100 mx-1" />

                      <button
                        onClick={() => handleOpenKitModal(kit)}
                        className="p-1 text-slate-500 hover:text-[#0D47FF] hover:bg-blue-50/50 rounded-lg transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteKitClick(kit.id, kit.name)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {kitsList.length === 0 && (
                <p className="text-xs text-center p-6 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white">
                  Aucun kit enregistré sous cette catégorie pour le moment.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS CUSTOMIZATION */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="bg-white rounded-3xl p-5 border shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <Settings className="w-5 h-5 text-[#0D47FF]" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                  En-tête de Marque (Header)
                </h3>
              </div>
              
              <div className="space-y-3 text-xs font-semibold text-slate-500 uppercase">
                <div className="space-y-1.5">
                  <label className="block tracking-wider text-[10px]">Logo de la Marque (Facultatif) :</label>
                  <div className="flex items-center gap-3">
                    <label className="bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold px-4 py-2.5 rounded-xl text-[10px] cursor-pointer inline-flex items-center gap-1.5 normal-case">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Téléverser le Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const uploadedUrl = await uploadImageFile(file);
                            if (uploadedUrl) {
                              setSettingsForm({ ...settingsForm, logoUrl: uploadedUrl });
                              showStatus('Logo téléversé !');
                            }
                          }
                        }}
                      />
                    </label>
                    {settingsForm.logoUrl ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={settingsForm.logoUrl} 
                          alt="Logo Aperçu" 
                          className="w-10 h-10 object-cover rounded-xl border border-slate-200 bg-slate-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '' })}
                          className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 normal-case">Aucun logo (icône cadeau par défaut)</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Nom Principal de la Marque :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.headerBrand}
                    onChange={e => setSettingsForm({ ...settingsForm, headerBrand: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Sous-titre / Activité :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.headerSubtitle}
                    onChange={e => setSettingsForm({ ...settingsForm, headerSubtitle: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <ImageIcon className="w-5 h-5 text-[#0D47FF]" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                  Bannière Principale du haut (Hero Banner)
                </h3>
              </div>
              
              <div className="space-y-4 text-xs font-semibold text-slate-500 uppercase">
                <div className="space-y-1.5">
                  <label className="block tracking-wider text-[10px]">Image d'Arrière-plan :</label>
                  <div className="flex items-center gap-3">
                    <label className="bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold px-4 py-2.5 rounded-xl text-[10px] cursor-pointer inline-flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Téléverser une image</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const uploadedUrl = await uploadImageFile(file);
                            if (uploadedUrl) {
                              setSettingsForm({ ...settingsForm, heroImage: uploadedUrl });
                              showStatus('Image d\'arrière-plan téléversée !');
                            }
                          }
                        }}
                      />
                    </label>
                    {settingsForm.heroImage ? (
                      <img 
                        src={settingsForm.heroImage} 
                        alt="Aperçu" 
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">Aucun fichier</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Badge de Campagne :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.heroCampaignBadge}
                    onChange={e => setSettingsForm({ ...settingsForm, heroCampaignBadge: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Slogan / Headline Principale :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.heroHeadline}
                    onChange={e => setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Ligne de Sous-titre :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.heroSubtitle}
                    onChange={e => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Texte d'Action du Bouton (CTA) :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.heroCtaText}
                    onChange={e => setSettingsForm({ ...settingsForm, heroCtaText: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <ShoppingBag className="w-5 h-5 text-[#0D47FF]" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                  Boîte Promotionnelle (Mini showcase Hero)
                </h3>
              </div>
              
              <div className="space-y-4 text-xs font-semibold text-slate-500 uppercase">
                <div className="space-y-1.5">
                  <label className="block tracking-wider text-[10px]">Miniature d'Illustration :</label>
                  <div className="flex items-center gap-3">
                    <label className="bg-slate-100 hover:bg-slate-200 border text-slate-700 font-bold px-4 py-2.5 rounded-xl text-[10px] cursor-pointer inline-flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Téléverser une image</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const uploadedUrl = await uploadImageFile(file);
                            if (uploadedUrl) {
                              setSettingsForm({ ...settingsForm, heroPromoImage: uploadedUrl });
                              showStatus('Image promotionnelle chargée !');
                            }
                          }
                        }}
                      />
                    </label>
                    {settingsForm.heroPromoImage ? (
                      <img 
                        src={settingsForm.heroPromoImage} 
                        alt="Aperçu" 
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">Aucun fichier</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Nom de Marque / Label Or :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.heroPromoBrand}
                    onChange={e => setSettingsForm({ ...settingsForm, heroPromoBrand: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Titre Principal :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.heroPromoTitle}
                    onChange={e => setSettingsForm({ ...settingsForm, heroPromoTitle: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Description de l'offre :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.heroPromoDesc}
                    onChange={e => setSettingsForm({ ...settingsForm, heroPromoDesc: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <Info className="w-5 h-5 text-[#0D47FF]" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                  Bandeau d'Information d'Urgence & FAQ
                </h3>
              </div>
              
              <div className="space-y-3 text-xs font-semibold text-slate-500 uppercase">
                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Titre du bandeau :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.infoTitle}
                    onChange={e => setSettingsForm({ ...settingsForm, infoTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Paragraphe du bandeau :</label>
                  <textarea
                    rows={3}
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.infoDescription}
                    onChange={e => setSettingsForm({ ...settingsForm, infoDescription: e.target.value })}
                  />
                </div>

                <div className="border-t pt-3 mt-3 space-y-3">
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[10px]">Titre Section FAQ :</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                      value={settingsForm.faqTitle}
                      onChange={e => setSettingsForm({ ...settingsForm, faqTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[10px]">Question FAQ 1 :</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                      value={settingsForm.faqQ1}
                      onChange={e => setSettingsForm({ ...settingsForm, faqQ1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[10px]">Réponse FAQ 1 :</label>
                    <textarea
                      rows={2}
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                      value={settingsForm.faqA1}
                      onChange={e => setSettingsForm({ ...settingsForm, faqA1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 border-t pt-2">
                    <label className="block tracking-wider text-[10px]">Question FAQ 2 :</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                      value={settingsForm.faqQ2}
                      onChange={e => setSettingsForm({ ...settingsForm, faqQ2: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[10px]">Réponse FAQ 2 :</label>
                    <textarea
                      rows={2}
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                      value={settingsForm.faqA2}
                      onChange={e => setSettingsForm({ ...settingsForm, faqA2: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <Tag className="w-5 h-5 text-[#0D47FF]" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                  Branding et Coordonnées du Footer (Pied de Page)
                </h3>
              </div>
              
              <div className="space-y-3 text-xs font-semibold text-slate-500 uppercase">
                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Nom Principal de l'Entreprise :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.footerBrand}
                    onChange={e => setSettingsForm({ ...settingsForm, footerBrand: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Sous-titre de l'Entreprise :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.footerSubtitle}
                    onChange={e => setSettingsForm({ ...settingsForm, footerSubtitle: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Description Courte de Présentation :</label>
                  <textarea
                    rows={3}
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.footerDesc}
                    onChange={e => setSettingsForm({ ...settingsForm, footerDesc: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block tracking-wider text-[10px]">Adresse Géographique :</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800"
                    value={settingsForm.footerAddress}
                    onChange={e => setSettingsForm({ ...settingsForm, footerAddress: e.target.value })}
                  />
                </div>

                <div className="border-t pt-3 mt-3 space-y-3">
                  <span className="text-[10px] font-extrabold text-[#0D47FF] block">Téléphones pour Appels Commerciaux :</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="block tracking-wider text-[9px]">Ligne Orange :</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 p-2 text-slate-800 font-mono text-[11px]"
                        value={settingsForm.phoneOrange}
                        onChange={e => setSettingsForm({ ...settingsForm, phoneOrange: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block tracking-wider text-[9px]">Ligne Moov :</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 p-2 text-slate-800 font-mono text-[11px]"
                        value={settingsForm.phoneMoov}
                        onChange={e => setSettingsForm({ ...settingsForm, phoneMoov: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block tracking-wider text-[9px]">Ligne MTN :</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 p-2 text-slate-800 font-mono text-[11px]"
                        value={settingsForm.phoneMtn}
                        onChange={e => setSettingsForm({ ...settingsForm, phoneMtn: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1 border-t pt-2">
                    <label className="block tracking-wider text-[10px] text-emerald-600 font-bold">Ligne d'Assistance WhatsApp (Exemple: +2250703397921) :</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl normal-case text-slate-800 font-mono"
                      value={settingsForm.whatsappHotline}
                      onChange={e => setSettingsForm({ ...settingsForm, whatsappHotline: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <CheckCircle className="w-5 h-5 text-[#0D47FF]" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                  Moyens Mobiles Money (MoMo d'Épargne)
                </h3>
              </div>
              
              <div className="space-y-4 text-xs font-semibold text-slate-500 uppercase">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[9px] text-sky-500">Label WAVE :</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl normal-case text-slate-800"
                      value={settingsForm.momoWaveName}
                      onChange={e => setSettingsForm({ ...settingsForm, momoWaveName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[9px] text-sky-500 font-mono">N° de Compte :</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl normal-case text-slate-800 font-mono"
                      value={settingsForm.momoWaveNum}
                      onChange={e => setSettingsForm({ ...settingsForm, momoWaveNum: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[9px] text-orange-500">Label ORANGE :</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl normal-case text-slate-800"
                      value={settingsForm.momoOrangeName}
                      onChange={e => setSettingsForm({ ...settingsForm, momoOrangeName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[9px] text-orange-500 font-mono">N° de Compte :</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl normal-case text-slate-800 font-mono"
                      value={settingsForm.momoOrangeNum}
                      onChange={e => setSettingsForm({ ...settingsForm, momoOrangeNum: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b">
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[9px] text-yellow-600">Label MTN :</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl normal-case text-slate-800"
                      value={settingsForm.momoMtnName}
                      onChange={e => setSettingsForm({ ...settingsForm, momoMtnName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[9px] text-yellow-600 font-mono">N° de Compte :</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl normal-case text-slate-800 font-mono"
                      value={settingsForm.momoMtnNum}
                      onChange={e => setSettingsForm({ ...settingsForm, momoMtnNum: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[9px] text-sky-600">Label MOOV :</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl normal-case text-slate-800"
                      value={settingsForm.momoMoovName}
                      onChange={e => setSettingsForm({ ...settingsForm, momoMoovName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block tracking-wider text-[9px] text-sky-600 font-mono">N° de Compte :</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl normal-case text-slate-800 font-mono"
                      value={settingsForm.momoMoovNum}
                      onChange={e => setSettingsForm({ ...settingsForm, momoMoovNum: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SELECTION DES KITS VEDETTES (GAMME ELITE) */}
            <div className="bg-white rounded-3xl p-5 border shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <Tag className="w-5 h-5 text-amber-500" />
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                  Gamme Élite (Les 3 Packs Vedettes)
                </h3>
              </div>
               <p className="text-[11px] text-slate-500 normal-case leading-relaxed">
                Configurez les 3 kits de votre choix qui figureront à l'honneur dans la section <strong>"Packs Vedettes de Fin d'Année"</strong> sur la page d'accueil de l'application. Vous pouvez également cliquer directement sur l'icône <strong>Étoile (⭐)</strong> depuis la liste des kits dans l'onglet <strong>"Kits"</strong> pour les ajouter ou les retirer des vedettes de manière très intuitive et rapide !
              </p>
              
              <div className="space-y-3.5">
                {[0, 1, 2].map((index) => {
                  const currentValue = (settingsForm.featuredKitIds || [])[index] || '';
                  return (
                    <div key={index} className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Pack Vedette #{index + 1} :
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold normal-case text-slate-800 focus:outline-none"
                        value={currentValue}
                        onChange={(e) => {
                          const newList = [...(settingsForm.featuredKitIds || [])];
                          // Fill missing elements up to 3
                          while (newList.length < 3) {
                            newList.push('');
                          }
                          newList[index] = e.target.value;
                          setSettingsForm({ ...settingsForm, featuredKitIds: newList });
                        }}
                      >
                        <option value="">-- Sélectionnez un Kit --</option>
                        {kits.map((kit) => (
                          <option key={kit.id} value={kit.id}>
                            {kit.name} ({kit.dailyAmount} / jour)
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-4 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-2.5xl border border-slate-800/10 flex gap-3 text-xs z-10">
              <button
                type="submit"
                disabled={isSavingSettings || isUploading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold p-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow shadow-emerald-600/20 active:scale-95 duration-200 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? 'Enregistrement...' : 'Mettre En Ligne la Configuration'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: PRODUCTS CATALOGUE */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between px-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h2 className="font-display font-black text-xs text-slate-800 uppercase tracking-wide">
                  Catalogue Gérant
                </h2>
                <p className="text-[11px] text-slate-500 normal-case font-medium mt-0.5">
                  Gérez les produits servant à composer vos kits ({products.length} produits)
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {onSeedProducts && products.length === 0 && (
                  <button
                    onClick={async () => {
                      if (window.confirm("Voulez-vous importer la liste complète des produits et catégories par défaut de Penta Gad (Riz, Huiles, Conserves, Électroménager...) dans votre catalogue ?")) {
                        const success = await onSeedProducts();
                        if (success) {
                          showStatus("Catalogue de démonstration importé avec succès !");
                        } else {
                          showStatus("Erreur lors de l'importation.", "error");
                        }
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] uppercase tracking-wider py-2 px-3 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-amber-500/10"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    <span>Importer Défauts</span>
                  </button>
                )}
                <button
                  id="add_catalog_product_btn"
                  onClick={() => openProdModal()}
                  className="bg-[#0D47FF] hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <input
                type="text"
                placeholder="🔍 Rechercher un produit, catégorie, marque..."
                value={prodSearchQuery}
                onChange={(e) => setProdSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none placeholder:text-slate-400 font-medium normal-case"
              />
              
              {/* Category Quick Filter badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Tous', 'Produits alimentaires', 'Articles ménagers', 'Électroménager', 'Électronique'].map((catName) => (
                  <button
                    key={catName}
                    onClick={() => setSelectedProdCatFilter(catName)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedProdCatFilter === catName
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {catName === 'Tous' ? 'Tous' : catName}
                  </button>
                ))}
              </div>
            </div>

            {/* Products List Grid */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Aucun produit trouvé</p>
                    <p className="text-[10px] text-slate-400 normal-case mt-1">Créez votre premier produit ou adaptez votre recherche.</p>
                  </div>
                  {onSeedProducts && products.length === 0 && (
                    <button
                      onClick={async () => {
                        if (window.confirm("Voulez-vous importer tous les produits de démonstration par défaut de Penta Gad maintenant ?")) {
                          const success = await onSeedProducts();
                          if (success) {
                            showStatus("Catalogue importé avec succès !");
                          } else {
                            showStatus("Erreur lors de l'importation.", "error");
                          }
                        }
                      }}
                      className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer shadow-sm shadow-amber-500/10"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      <span>Importer la liste par défaut</span>
                    </button>
                  )}
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100 last:border-b-0 animate-fade-in">
                    <div className="flex items-center gap-3 min-w-0 pr-4 text-left">
                      {/* Product Image Thumbnail */}
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-slate-350" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-xs text-slate-800 leading-snug normal-case">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] uppercase tracking-wider font-semibold">
                          <span className="text-[#0D47FF] bg-blue-50 px-1.5 py-0.5 rounded">
                            {p.category}
                          </span>
                          {p.subcategory && (
                            <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {p.subcategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openProdModal(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-850 transition-all cursor-pointer"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProdClick(p.id, p.name)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL EDIT/ADD CATEGORY */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-display font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                {catEditingId === null ? 'Nouvelle Catégorie' : 'Modifier la Catégorie'}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-semibold uppercase text-slate-500">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block tracking-wider">Titre / Niveau de Pack *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Platine, Bronze, Elite..."
                  value={catForm.title}
                  onChange={(e) => setCatForm({ ...catForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 lowercase first-letter:uppercase focus:outline-none"
                />
              </div>

              {/* Starting amount */}
              <div className="space-y-1.5">
                <label className="block tracking-wider">Montant de Départ Estimé *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 500 FCFA / jour"
                  value={catForm.startingAmount}
                  onChange={(e) => setCatForm({ ...catForm, startingAmount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              {/* Image url selection and preset list */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block tracking-wider">Image de la catégorie *</label>
                  <span className="text-[10px] text-[#0D47FF] font-bold">Uploader ou URL</span>
                </div>

                {/* Direct device-file uploader */}
                <div className="flex gap-2.5 items-center">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#0D47FF] rounded-xl p-3 bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-all">
                    <span className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#0D47FF]" />
                      {isUploading ? 'Téléversement...' : 'Uploader une Image'}
                    </span>
                    <span className="text-[8px] text-slate-400 mt-1">PNG, JPG de votre appareil</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const uploadedUrl = await uploadImageFile(file);
                          if (uploadedUrl) {
                            setCatForm({ ...catForm, image: uploadedUrl });
                            showStatus('Image téléversée avec succès !');
                          }
                        }
                      }}
                    />
                  </label>
                  {catForm.image && (
                    <img 
                      src={catForm.image} 
                      alt="Aperçu" 
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                <div className="text-[10px] text-slate-400 uppercase tracking-wider text-center py-1">ou</div>

                <input
                  type="text"
                  required
                  placeholder="Introduisez une URL ou sélectionnez un modèle..."
                  value={catForm.image}
                  onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-mono font-medium text-slate-800 text-left focus:outline-none mb-1.5"
                />

                {/* Fast select templates */}
                <div className="space-y-1 bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block tracking-wider">Presets d'images de fin d'année :</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {imagePresets.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setCatForm({ ...catForm, image: preset.url })}
                        className={`text-[9px] font-bold px-2 py-1 rounded bg-white border border-slate-250 cursor-pointer ${
                          catForm.image === preset.url ? 'border-blue-600 text-blue-600 font-extrabold ring-1 ring-blue-50' : 'text-slate-600'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit triggers */}
              <button
                id="cat_save_submit_btn"
                type="submit"
                disabled={isSavingCat || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-display font-extrabold py-3.5 px-4 rounded-xl shadow-md cursor-pointer text-center uppercase tracking-wider mt-4 disabled:opacity-50"
              >
                {isSavingCat ? 'Enregistrement...' : 'Sauvegarder la Catégorie'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT/ADD KIT */}
      {isKitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b shrink-0">
              <h3 className="font-display font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                {kitEditingId === null ? 'Nouveau Pack Cadeau' : 'Modifier le Pack Cadeau'}
              </h3>
              <button onClick={() => setIsKitModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKit} className="space-y-4 text-xs font-semibold uppercase text-slate-500 overflow-y-auto no-scrollbar py-3 flex-1">
              
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="block tracking-wider">Catégorie d'appartenance *</label>
                <select
                  required
                  value={kitForm.categoryId}
                  onChange={(e) => setKitForm({ ...kitForm, categoryId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-bold focus:outline-none"
                >
                  <option value="" disabled>Choisir une catégorie...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>Gamme {c.title}</option>
                  ))}
                </select>
              </div>

              {/* Kit Name */}
              <div className="space-y-1.5">
                <label className="block tracking-wider">Nom complet du Kit *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pack Or Prestige Alimentaire..."
                  value={kitForm.name}
                  onChange={(e) => setKitForm({ ...kitForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              {/* Contribution Amount and total value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block tracking-wider">Contribution Jour *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1 500 FCFA"
                    value={kitForm.dailyAmount}
                    onChange={(e) => setKitForm({ ...kitForm, dailyAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block tracking-wider">Total Package Value</label>
                  <input
                    type="text"
                    placeholder="Ex: 135 000 FCFA"
                    value={kitForm.totalValue}
                    onChange={(e) => setKitForm({ ...kitForm, totalValue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Multiple Images URL and selection presets */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border">
                <label className="block tracking-wider text-slate-600">Galerie d'Images (Multimédia) *</label>
                
                {/* Active images */}
                <div className="flex flex-wrap gap-1.5 py-1.5">
                  {kitForm.images.map((img, iIdx) => (
                    <div key={iIdx} className="text-[10px] bg-white border border-slate-300 rounded px-2 py-1 flex items-center gap-1.5 text-slate-800 font-mono">
                      <span className="truncate max-w-[140px]">{img}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImageURL(iIdx)}
                        className="text-red-500 font-bold hover:scale-105"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Direct uploader for Kit images */}
                <div className="mb-2 mt-1">
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-[#0D47FF] rounded-lg p-2.5 bg-white hover:bg-slate-50 cursor-pointer transition-all">
                    <span className="text-[11px] text-slate-700 font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#0D47FF]" />
                      {isUploading ? 'Téléversement en cours...' : 'Uploader une image de votre appareil'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const uploadedUrl = await uploadImageFile(file);
                          if (uploadedUrl) {
                            setKitForm(prev => ({
                              ...prev,
                              images: [...prev.images, uploadedUrl]
                            }));
                            showStatus('Image téléversée et ajoutée avec succès !');
                          }
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="text-[9px] text-slate-400 uppercase tracking-widest text-center my-1.5">ou par adresse URL</div>

                {/* Input row */}
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Saisir un lien public ou preset..."
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-250 rounded-lg px-2 text-[11px] font-mono font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageURL}
                    className="bg-[#0D47FF] hover:bg-blue-700 text-white text-[10px] py-1 px-3.5 rounded-lg shrink-0 cursor-pointer font-bold"
                  >
                    Ajouter URL
                  </button>
                </div>

                {/* Quick select presets inside Kit creation */}
                <div className="space-y-1 pt-1 border-t border-slate-200/50 mt-1.5">
                  <span className="text-[9px] text-slate-400 block tracking-wider">Tap pour insérer :</span>
                  <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {imagePresets.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setImageInput(preset.url)}
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white border shrink-0 text-slate-600"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Products included section */}
              {/* Products included section */}
              <div className="space-y-3 bg-slate-50 p-3 rounded-2xl border">
                <div className="flex justify-between items-center">
                  <label className="block tracking-wider text-slate-600 font-bold">Produits dans le kit *</label>
                  <span className="text-[10px] text-blue-600 font-extrabold font-mono">{kitForm.products.length} sélectionné(s)</span>
                </div>
                
                {/* Active Items list */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white rounded-xl border border-slate-200">
                  {kitForm.products.length === 0 ? (
                    <span className="text-[10px] text-slate-400 font-medium self-center">Aucun produit inclus. Sélectionnez en dessous ou ajoutez-en manuellement.</span>
                  ) : (
                    kitForm.products.map((prodName, pIdx) => (
                      <span key={pIdx} className="inline-flex items-center gap-1 bg-blue-50 text-[#0D47FF] border border-blue-150 px-2 py-0.5 rounded-lg text-[10px] font-bold normal-case">
                        <span>{prodName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setKitForm({
                              ...kitForm,
                              products: kitForm.products.filter(p => p !== prodName)
                            });
                          }}
                          className="hover:text-red-500 font-extrabold text-[11px] ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* DB Selector Box with Search */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-extrabold tracking-wider text-slate-500 block">Choisir depuis le Catalogue Gérant</span>
                  
                  {/* Miniature search bar */}
                  <input
                    type="text"
                    placeholder="🔍 Filtrer le catalogue..."
                    value={kitProdSearch}
                    onChange={(e) => setKitProdSearch(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-[11px] focus:outline-none text-slate-800 normal-case"
                  />

                  {/* Scrollable grid of master catalog products */}
                  <div className="max-h-36 overflow-y-auto border rounded-lg bg-white divide-y divide-slate-100 text-[10.5px]">
                    {products.filter(p => 
                      !kitProdSearch || 
                      (p.name || '').toLowerCase().includes(kitProdSearch.toLowerCase()) ||
                      (p.category || '').toLowerCase().includes(kitProdSearch.toLowerCase()) ||
                      (p.subcategory || '').toLowerCase().includes(kitProdSearch.toLowerCase())
                    ).map((p) => {
                      const occurrences = kitForm.products.filter(item => item === p.name).length;
                      const hasInc = occurrences > 0;
                      return (
                        <div
                          key={p.id}
                          className={`w-full px-2.5 py-1.5 flex items-center justify-between transition-all border-b border-slate-100 last:border-0 ${
                            hasInc 
                              ? 'bg-blue-50/20 text-blue-900 font-bold' 
                              : 'text-slate-700'
                          }`}
                        >
                          <div className="truncate pr-2 normal-case text-left flex-1 min-w-0">
                            <span className="font-semibold block leading-tight text-[11px] text-slate-800">{p.name}</span>
                            <span className="block text-[8px] uppercase tracking-widest text-[#0D47FF] font-black mt-0.5">
                              {p.category} {p.subcategory ? `• ${p.subcategory}` : ''}
                            </span>
                          </div>
                          
                          {/* Counter selector logic */}
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {hasInc && (
                              <button
                                type="button"
                                onClick={() => {
                                  const idx = kitForm.products.indexOf(p.name);
                                  if (idx !== -1) {
                                    const updated = [...kitForm.products];
                                    updated.splice(idx, 1);
                                    setKitForm({ ...kitForm, products: updated });
                                  }
                                }}
                                className="w-5 h-5 bg-blue-100/80 hover:bg-blue-200 text-[#0D47FF] hover:text-blue-800 border border-blue-200/50 rounded-md flex items-center justify-center font-black text-xs cursor-pointer select-none"
                              >
                                -
                              </button>
                            )}
                            
                            {hasInc && (
                              <span className="text-[10px] font-mono font-black text-slate-800 w-4 text-center">
                                {occurrences}
                              </span>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => {
                                setKitForm({
                                  ...kitForm,
                                  products: [...kitForm.products, p.name]
                                });
                              }}
                              className="w-5 h-5 bg-[#0D47FF] hover:bg-blue-700 text-white rounded-md flex items-center justify-center font-black text-xs cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Fallback Item manually */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-extrabold tracking-wider text-slate-500 block">Ou ajouter manuellement un produit sur mesure</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Sac de Riz parfumé (25 Kg)..."
                      value={productInput}
                      onChange={(e) => setProductInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-250 rounded-lg px-2 py-1 text-[11px] focus:outline-none text-slate-800 normal-case"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (productInput.trim()) {
                            if (!kitForm.products.includes(productInput.trim())) {
                              setKitForm({
                                ...kitForm,
                                products: [...kitForm.products, productInput.trim()]
                              });
                            }
                            setProductInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (productInput.trim()) {
                          if (!kitForm.products.includes(productInput.trim())) {
                            setKitForm({
                              ...kitForm,
                              products: [...kitForm.products, productInput.trim()]
                            });
                          }
                          setProductInput('');
                        }
                      }}
                      className="bg-[#0D47FF] text-white text-[10px] px-3 rounded-lg shrink-0 cursor-pointer font-bold hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Benefits checklist */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border">
                <label className="block tracking-wider text-slate-600">Avantages & Atouts phares *</label>
                
                {/* Benefit item list */}
                <div className="space-y-1.5 py-1 text-slate-800 text-xs">
                  {kitForm.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] gap-2 p-1.5 rounded bg-white border">
                      <span className="truncate max-w-[240px] font-medium leading-none">{benefit}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefitItem(idx)}
                        className="text-red-500 font-bold hover:scale-105 shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add item */}
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Ex: Garantie certifiée d'un an inclus..."
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-250 rounded-lg px-2 text-xs focus:outline-none text-slate-800"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBenefitItem();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefitItem}
                    className="bg-blue-600 text-white text-[10px] py-1 px-3.5 rounded-lg shrink-0 cursor-pointer"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Delivery info description */}
              <div className="space-y-1.5">
                <label className="block tracking-wider">Détails de Livraison et Logistique *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Livraison gratuite à partir du 15 Décembre..."
                  value={kitForm.deliveryInfo}
                  onChange={(e) => setKitForm({ ...kitForm, deliveryInfo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              {/* Submit trigger */}
              <button
                id="kit_save_submit_btn"
                type="submit"
                disabled={isSavingKit || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-display font-extrabold py-3.5 px-4 rounded-xl shadow-md cursor-pointer text-center uppercase tracking-wider mt-5 disabled:opacity-50"
              >
                {isSavingKit ? 'Enregistrement...' : 'Sauvegarder le Kit public'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT/ADD CATALOG PRODUCT */}
      {isProdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                {prodEditingId === null ? 'Nouveau Produit' : 'Modifier le Produit'}
              </h3>
              <button onClick={() => setIsProdModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProdSubmit} className="space-y-4 text-xs font-semibold uppercase text-slate-500">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="block tracking-wider">Nom du Produit *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Riz La Rizière 4.5 kg..."
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 normal-case focus:outline-none"
                />
              </div>

              {/* Product Category select */}
              <div className="space-y-1.5">
                <label className="block tracking-wider">Catégorie Majeure *</label>
                <select
                  value={prodForm.category}
                  onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none uppercase"
                >
                  <option value="Produits alimentaires">Produits alimentaires</option>
                  <option value="Articles ménagers">Articles ménagers</option>
                  <option value="Électroménager">Électroménager</option>
                  <option value="Électronique">Électronique</option>
                </select>
              </div>

              {/* Product Subcategory */}
              <div className="space-y-1.5">
                <label className="block tracking-wider">Sous-Catégorie (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Riz, Huiles, Vaisselle, Froid..."
                  value={prodForm.subcategory}
                  onChange={(e) => setProdForm({ ...prodForm, subcategory: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 normal-case focus:outline-none"
                />
              </div>

              {/* Product Image Upload & URL */}
              <div className="space-y-1.5">
                <label className="block tracking-wider">Image de l'article</label>
                
                {/* File input directly styled as drag/drop upload card */}
                <div className="flex gap-2 items-start">
                  <label className="flex-1 border border-dashed border-slate-300 hover:border-[#0D47FF]/50 hover:bg-blue-50/20 rounded-xl p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1 transition-all bg-white">
                    <span className="text-[11px] font-bold text-slate-600">
                      {isUploading ? 'Téléversement...' : 'Cliquez pour uploader un fichier'}
                    </span>
                    <span className="text-[9px] text-slate-400">JPEG, PNG de l'appareil</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const uploadedUrl = await uploadImageFile(file);
                          if (uploadedUrl) {
                            setProdForm({ ...prodForm, image: uploadedUrl });
                            showStatus("Image importée avec succès !");
                          }
                        }
                      }}
                    />
                  </label>

                  {prodForm.image && (
                    <div className="relative h-16 w-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                      <img src={prodForm.image} alt="Aperçu produit" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setProdForm({ ...prodForm, image: '' })}
                        className="absolute inset-0 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                      >
                        Retirer
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <span className="text-[9px] text-slate-400 block tracking-wider uppercase mb-1">Ou saisir un lien d'image direct :</span>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={prodForm.image}
                    onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-medium text-slate-800 normal-case focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Trigger */}
              <button
                id="save_catalog_product_btn"
                type="submit"
                disabled={isSavingProd}
                className="w-full bg-[#0D47FF] hover:bg-blue-700 disabled:bg-slate-400 text-white font-display font-extrabold py-3.5 px-4 rounded-xl shadow-md cursor-pointer text-center uppercase tracking-wider mt-5"
              >
                {isSavingProd ? 'Sauvegarde...' : 'Sauvegarder dans le Catalogue'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
