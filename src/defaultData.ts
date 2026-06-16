import { Category, Kit, SiteSettings, CatalogProduct } from './types';

export const fallbackCategories: Category[] = [
  {
    id: "bronze",
    title: "Bronze",
    startingAmount: "500 FCFA / jour",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    order: 1
  },
  {
    id: "argent",
    title: "Argent",
    startingAmount: "1 000 FCFA / jour",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    order: 2
  },
  {
    id: "or",
    title: "Or",
    startingAmount: "2 000 FCFA / jour",
    image: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&q=80&w=600",
    order: 3
  },
  {
    id: "platine",
    title: "Platine",
    startingAmount: "5 000 FCFA / jour",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600",
    order: 4
  }
];

export const fallbackKits: Kit[] = [
  {
    id: "bronze_1",
    categoryId: "bronze",
    name: "Bronze Essentiel Alimentaire",
    dailyAmount: "500 FCFA",
    totalValue: "45 000 FCFA",
    images: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600"
    ],
    products: [
      "Sac de Riz Premium (10 Kg)",
      "Bouteille d'Huile raffinée (3 Litres)",
      "Paquets de Spaghetti Supérieur (5 pièces)",
      "Boîtes de Double Concentré de Tomate (3 petites)",
      "Paquet de Sucre en morceaux (1 Kg)",
      "Sachet de Lait en poudre (500g)"
    ],
    benefits: [
      "Idéal pour les budgets serrés afin de sécuriser l'essentiel des fêtes",
      "Ingrédients de grandes marques garantissant un goût exceptionnel",
      "Le pack familial le plus populaire"
    ],
    deliveryInfo: "Livraison gratuite à partir du 15 Décembre directement à votre domicile ou point relais.",
    order: 1
  },
  {
    id: "bronze_2",
    categoryId: "bronze",
    name: "Bronze Cuisine Duo",
    dailyAmount: "750 FCFA",
    totalValue: "67 500 FCFA",
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
    ],
    products: [
      "Sac de Riz de luxe (15 Kg)",
      "Bidon d'Huile végétale pure (5 Litres)",
      "Spaghetti Royal qualité Or (10 paquets)",
      "Carton de Bouillons d'Assaisonnement",
      "Bouilloire Électrique en Inox (1.8L) incluse"
    ],
    benefits: [
      "Rapport quantité-prix imbattable",
      "Équipement électrique de cuisine durable offert dans le pack",
      "Facilite les préparations de Noël et du Nouvel An"
    ],
    deliveryInfo: "Livraison offerte en commune sous 48h.",
    order: 2
  },
  {
    id: "argent_1",
    categoryId: "argent",
    name: "Argent Gourmand de Fête",
    dailyAmount: "1 000 FCFA",
    totalValue: "90 000 FCFA",
    images: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600"
    ],
    products: [
      "Sac de Riz Parfumé Jasmin (25 Kg)",
      "Bidon d'Huile de Tournesol (5 Litres)",
      "Carton de Spaghetti Premium (20 paquets)",
      "Boîte de Thé Lipton (100 sachets)",
      "Sélection de jus de fruits premium (6 briques)",
      "Boîtes de Lait Concentré sucré (5 boîtes)"
    ],
    benefits: [
      "Grand sac de riz pour nourrir toute la famille élargie",
      "Boissons et gourmandises festives haut de gamme",
      "Approvisionnement complet pour les festivités de fin d'année"
    ],
    deliveryInfo: "Livraison express offerte en Décembre à domicile.",
    order: 1
  },
  {
    id: "argent_2",
    categoryId: "argent",
    name: "Argent Mixte Robot Cuisine",
    dailyAmount: "1 500 FCFA",
    totalValue: "135 000 FCFA",
    images: [
      "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
    ],
    products: [
      "Robot Mixeur Blendeur & Broyeur 2-en-1 puissant",
      "Sac de Riz Parfumé (15 Kg)",
      "Bidon d'Huile fine (5 Litres)",
      "Service de Table chic de fin d'année (18 pièces)",
      "Cuiseur à Riz Électrique moderne"
    ],
    benefits: [
      "Cuisinez rapidement et renouvelez vos équipements",
      "Garantie constructeur de 12 mois incluse sur le blendeur",
      "Table de réveillon élégante grâce au service de vaisselle inclus"
    ],
    deliveryInfo: "Livraison sécurisée avec emballage renforcé anti-chocs.",
    order: 2
  },
  {
    id: "or_1",
    categoryId: "or",
    name: "Or Prestige Royal",
    dailyAmount: "2 000 FCFA",
    totalValue: "180 000 FCFA",
    images: [
      "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600"
    ],
    products: [
      "Grand Sac de Riz Parfumé Royal (50 Kg)",
      "Grand Bidon d'Huile de table raffinée (10 Litres)",
      "Un carton entier de Spaghetti (40 paquets)",
      "Carton de Sardines à l'huile (50 boîtes)",
      "Carton de Concentré de Tomate (24 boîtes)",
      "Blendeur multifonction grande marque offert"
    ],
    benefits: [
      "Tranquillité totale : ravitaillement alimentaire pour plus de 3 mois!",
      "Qualité d'ingrédients sélectionnée pour les grands repas de fêtes",
      "Réduction massive en achetant en lot complet"
    ],
    deliveryInfo: "Livraison par camionnette d'installation, déchargée directement à votre cuisine.",
    order: 1
  },
  {
    id: "or_2",
    categoryId: "or",
    name: "Or Cuistot Moderne",
    dailyAmount: "2 500 FCFA",
    totalValue: "225 000 FCFA",
    images: [
      "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600"
    ],
    products: [
      "Four Électrique Grande Capacité (45 Litres) avec double tournebroche",
      "Plaque chauffante à Induction tactile",
      "Batterie de cuisine haut de gamme en Granite (5 marmites de luxe + couvercles)",
      "Sac de Riz parfumé (20 Kg)",
      "Bidon d'Huile fine (5 Litres)"
    ],
    benefits: [
      "Transformez votre cuisine en un véritable atelier de chef",
      "Réussissez vos dindes, gâteaux et rôtis de fin d'année à coup sûr",
      "Granite anti-adhésif ultra résistant et sain"
    ],
    deliveryInfo: "Livraison avec appel de confirmation et prise de rendez-vous.",
    order: 2
  },
  {
    id: "platine_1",
    categoryId: "platine",
    name: "Platine Grand Écran & Festin",
    dailyAmount: "5 000 FCFA",
    totalValue: "450 000 FCFA",
    images: [
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600"
    ],
    products: [
      "Téléviseur Smart-TV LED 43 Pouces Full HD connectée",
      "Réchaud à Gaz Premium 4 Foyers avec Four intégré",
      "Micro-ondes Digital 25 Litres moderne",
      "Sac de Riz double parfum (50 Kg)",
      "Grand Bidon d'Huile premium (10 Litres)",
      "Assortiment de 12 bouteilles de boissons gazéifiées festives"
    ],
    benefits: [
      "Restaurez tout votre salon et votre cuisine pour la nouvelle année",
      "Divertissement familial assuré avec la Smart TV (Netflix, YouTube, etc.)",
      "Four de cuisson intégré de haute sécurité alimentaire"
    ],
    deliveryInfo: "Livraison ultra-prioritaire programmée gratuite de bout en bout.",
    order: 1
  },
  {
    id: "platine_2",
    categoryId: "platine",
    name: "Platine Confort Absolu",
    dailyAmount: "10 000 FCFA",
    totalValue: "900 000 FCFA",
    images: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600"
    ],
    products: [
      "Réfrigérateur Double Porte Froid Ventilé No-Frost (320 Litres)",
      "Salon d'angle de luxe moderne rembourré (velours d'importation)",
      "Pack Bronze Essentiel Alimentaire offert gratuitement"
    ],
    benefits: [
      "Améliorez radicalement votre confort quotidien sur le long terme",
      "Conservez vos stocks de nourriture géants en toute sérénité",
      "Financement journalier extrêmement flexible et adapté à vos revenus"
    ],
    deliveryInfo: "Livraison à domicile incluant le montage complet du canapé par des professionnels.",
    order: 2
  }
];

export const fallbackSettings: SiteSettings = {
  logoUrl: "",
  headerBrand: "PENTA GAD",
  headerSubtitle: "Distribution",
  
  heroImage: "/src/assets/images/hero_banner_festive_1781612306255.jpg",
  heroCampaignBadge: "Campagne Préparation 2026",
  heroHeadline: "Préparez votre fin d'année dès aujourd'hui",
  heroSubtitle: "Kits Alimentaires • Électroménagers • Maison",
  heroPromoBrand: "Penta Gad Distribution",
  heroPromoTitle: "Un foyer équipé & gâté pour Noël",
  heroPromoDesc: "Financement souple par contributions journalières",
  heroPromoImage: "/src/assets/images/food_pack_bronze_1781612322822.jpg",
  heroCtaText: "Découvrir les Packs",

  infoTitle: "Pourquoi s'inscrire dès aujourd'hui ?",
  infoDescription: "Toutes les grandes enseignes connaissent des ruptures de riz et d'électroménager en décembre. En souscrivant aujourd'hui avec Penta Gad, votre kit est bloqué, emballé et stocké en priorité pour vous.",

  faqTitle: "FAQ & Fonctionnement",
  faqQ1: "Comment se fait le paiement ?",
  faqA1: "Un agent commercial Penta Gad fixe avec vous une collecte périodique (journalière, hebdomadaire ou mensuelle) à votre convenance.",
  faqQ2: "Quand a lieu la livraison ?",
  faqA2: "La distribution festive commence dès la mi-décembre pour vous permettre d'anticiper sereinement vos fêtes.",

  footerBrand: "PENTA GAD DISTRIBUTION",
  footerSubtitle: "Packs d'adhésion de fin d'année",
  footerDesc: "Penta Gad Distribution est votre partenaire officiel de confiance pour l'équipement de la maison et le ravitaillement de vos fêtes. Un crédit d'épargne journalier souple et adapté à vos revenus.",
  footerAddress: "Yopougon sapeur-pompier, non loin de la cité SGBCI, Abidjan",
  
  phoneOrange: "07 03 39 79 21",
  phoneMoov: "01 00 82 57 81",
  phoneMtn: "05 85 45 98 81",
  whatsappHotline: "+2250703397921",
  
  momoWaveName: "🌊 WAVE IP",
  momoWaveNum: "01 00 82 57 81",
  momoOrangeName: "🍊 ORANGE MONEY",
  momoOrangeNum: "07 03 39 79 21",
  momoMtnName: "🟡 MTN MOMO",
  momoMtnNum: "05 85 45 98 81",
  momoMoovName: "🔵 MOOV MONEY",
  momoMoovNum: "01 00 82 57 81"
};

export const fallbackProducts: CatalogProduct[] = [
  // 1. Produits alimentaires
  // - Riz
  { id: "p1", category: "Produits alimentaires", subcategory: "Riz", name: "Riz La Rizière 1 kg" },
  { id: "p2", category: "Produits alimentaires", subcategory: "Riz", name: "Riz La Rizière 4,5 kg" },
  { id: "p3", category: "Produits alimentaires", subcategory: "Riz", name: "Riz La Rizière 22,5 kg" },
  // - Huiles
  { id: "p4", category: "Produits alimentaires", subcategory: "Huiles", name: "Huile Aya 0,9 L" },
  { id: "p5", category: "Produits alimentaires", subcategory: "Huiles", name: "Huile Aya 3 L" },
  { id: "p6", category: "Produits alimentaires", subcategory: "Huiles", name: "Huile Aya 5 L" },
  // - Conserves
  { id: "p7", category: "Produits alimentaires", subcategory: "Conserves", name: "Tomate Alyssa 370 g" },
  { id: "p8", category: "Produits alimentaires", subcategory: "Conserves", name: "Tomate Alyssa 2 kg" },
  { id: "p9", category: "Produits alimentaires", subcategory: "Conserves", name: "Sardines Safi" },
  { id: "p10", category: "Produits alimentaires", subcategory: "Conserves", name: "Petit pois" },
  // - Produits laitiers
  { id: "p11", category: "Produits alimentaires", subcategory: "Produits laitiers", name: "Lait concentré sucré" },
  { id: "p12", category: "Produits alimentaires", subcategory: "Produits laitiers", name: "Lait en poudre en boîte" },
  { id: "p13", category: "Produits alimentaires", subcategory: "Produits laitiers", name: "Lait en poudre chapelet" },
  // - Féculents
  { id: "p14", category: "Produits alimentaires", subcategory: "Féculents", name: "Spaghetti" },
  // - Assaisonnements
  { id: "p15", category: "Produits alimentaires", subcategory: "Assaisonnements", name: "Cube Maggi (plaquette)" },
  // - Boissons
  { id: "p16", category: "Produits alimentaires", subcategory: "Boissons", name: "Jus Presséa" },
  { id: "p17", category: "Produits alimentaires", subcategory: "Boissons", name: "Sucrerie 1 L" },
  { id: "p18", category: "Produits alimentaires", subcategory: "Boissons", name: "Sucrerie 1,5 L" },
  { id: "p19", category: "Produits alimentaires", subcategory: "Boissons", name: "Pack de sucrerie 1 L" },
  { id: "p20", category: "Produits alimentaires", subcategory: "Boissons", name: "Pack Coca-Cola 6 × 1 L" },
  // - Produits frais
  { id: "p21", category: "Produits alimentaires", subcategory: "Produits frais", name: "Poulets" },
  { id: "p22", category: "Produits alimentaires", subcategory: "Produits frais", name: "Plaquette d'œufs" },
  { id: "p23", category: "Produits alimentaires", subcategory: "Produits frais", name: "1/2 plaquette d'œufs" },

  // 2. Articles ménagers
  // - Vaisselle
  { id: "p24", category: "Articles ménagers", subcategory: "Vaisselle", name: "Assiette de table" },
  { id: "p25", category: "Articles ménagers", subcategory: "Vaisselle", name: "Kit de 6 assiettes cassables" },
  { id: "p26", category: "Articles ménagers", subcategory: "Vaisselle", name: "Complet soupière 5 pièces" },
  { id: "p27", category: "Articles ménagers", subcategory: "Vaisselle", name: "Complet soupière 6 pièces" },
  { id: "p28", category: "Articles ménagers", subcategory: "Vaisselle", name: "Verre normal" },
  { id: "p29", category: "Articles ménagers", subcategory: "Vaisselle", name: "Verre en coupe" },
  // - Textile
  { id: "p30", category: "Articles ménagers", subcategory: "Textile", name: "Complet de pagne" },

  // 3. Électroménager
  // - Cuisine
  { id: "p31", category: "Électroménager", subcategory: "Cuisine", name: "Mixeur Foutou 3 L" },
  { id: "p32", category: "Électroménager", subcategory: "Cuisine", name: "Mixeur Foutou 6 L" },
  { id: "p33", category: "Électroménager", subcategory: "Cuisine", name: "Mixeur Foutou 12 L" },
  { id: "p34", category: "Électroménager", subcategory: "Cuisine", name: "Mixeur 2 en 1" },
  { id: "p35", category: "Électroménager", subcategory: "Cuisine", name: "Bouilloire électrique" },
  { id: "p36", category: "Électroménager", subcategory: "Cuisine", name: "Air Fryer 6,5 L" },
  { id: "p37", category: "Électroménager", subcategory: "Cuisine", name: "Air Fryer 9 L" },
  { id: "p38", category: "Électroménager", subcategory: "Cuisine", name: "Air Fryer 10 L" },
  { id: "p39", category: "Électroménager", subcategory: "Cuisine", name: "Mini cuisinière" },
  { id: "p40", category: "Électroménager", subcategory: "Cuisine", name: "Gazinière 4 feux" },
  // - Gaz
  { id: "p41", category: "Électroménager", subcategory: "Gaz", name: "Gaz B6" },
  { id: "p42", category: "Électroménager", subcategory: "Gaz", name: "Gaz B12" },
  // - Froid
  { id: "p43", category: "Électroménager", subcategory: "Froid", name: "Réfrigérateur" },
  // - Lavage
  { id: "p44", category: "Électroménager", subcategory: "Lavage", name: "Machine à laver 7 kg" },
  // - Confort
  { id: "p45", category: "Électroménager", subcategory: "Confort", name: "Ventilateur 15K" },
  { id: "p46", category: "Électroménager", subcategory: "Confort", name: "Ventilateur 20K" },
  { id: "p47", category: "Électroménager", subcategory: "Confort", name: "Chauffe-eau électrique" },
  // - Literie
  { id: "p48", category: "Électroménager", subcategory: "Literie", name: "Matelas orthopédique" },

  // 4. Électronique
  { id: "p49", category: "Électronique", subcategory: "Général", name: "TV 24 pouces" },
  { id: "p50", category: "Électronique", subcategory: "Général", name: "TV 32 pouces simple" },
  { id: "p51", category: "Électronique", subcategory: "Général", name: "Tablette enfant" },
  { id: "p52", category: "Électronique", subcategory: "Général", name: "Tablette adulte" }
];


