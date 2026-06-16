import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure database folders exist
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial seed data with our beautiful generated images & catalog kits
const defaultData = {
  categories: [
    {
      id: "bronze",
      title: "Bronze",
      startingAmount: "500 FCFA / jour",
      image: "/src/assets/images/food_pack_bronze_1781612322822.jpg",
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
      image: "/src/assets/images/appliances_pack_platinum_1781612340346.jpg",
      order: 4
    }
  ],
  kits: [
    {
      id: "bronze_1",
      categoryId: "bronze",
      name: "Bronze Essentiel Alimentaire",
      dailyAmount: "500 FCFA",
      totalValue: "45 000 FCFA",
      images: [
        "/src/assets/images/food_pack_bronze_1781612322822.jpg",
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
        "/src/assets/images/food_pack_bronze_1781612322822.jpg"
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
        "/src/assets/images/appliances_pack_platinum_1781612340346.jpg",
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600"
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
        "/src/assets/images/appliances_pack_platinum_1781612340346.jpg"
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
  ]
};

// Helper to read database
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return defaultData;
  }
}

// Helper to write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}

// Middleware to parse JSON bodies with 50MB limit to support high-res image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images statically
app.use('/data/uploads', express.static(UPLOADS_DIR));

// Serve source assets statically to prevent broken references in compiled production builds
app.use('/src/assets', express.static(path.join(process.cwd(), 'src', 'assets')));

// Load initial database
readDB();

// Environment-based password or a default secure one
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpenta2026';

// Simple authentication token verify middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Identification requise.' });
  }

  if (token !== `Token-${ADMIN_PASSWORD}`) {
    return res.status(403).json({ error: 'Accès interdit. Session non valide.' });
  }

  next();
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ satus: 'ok' });
});

// Admin image upload
app.post('/api/upload', authenticateToken, (req, res) => {
  try {
    const { name, type, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ error: 'Le nom et les données de l\'image sont requis.' });
    }

    const base64Content = data.split(';base64,').pop();
    if (!base64Content) {
      return res.status(400).json({ error: 'Format de données invalide.' });
    }

    const ext = name.split('.').pop() || 'png';
    const timestampFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, timestampFilename);

    fs.writeFileSync(filePath, Buffer.from(base64Content, 'base64'));

    const fileUrl = `/data/uploads/${timestampFilename}`;
    res.json({ url: fileUrl });
  } catch (err: any) {
    console.error("Error writing uploaded file:", err);
    res.status(500).json({ error: `Échec du téléversement: ${err.message}` });
  }
});

// Admin login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ token: `Token-${ADMIN_PASSWORD}`, username: 'Administrateur' });
  } else {
    res.status(400).json({ error: 'Mot de passe incorrect.' });
  }
});

// GET Categories
app.get('/api/categories', (req, res) => {
  const db = readDB();
  const sortedCategories = [...db.categories].sort((a: any, b: any) => a.order - b.order);
  res.json(sortedCategories);
});

// POST Categories
app.post('/api/categories', authenticateToken, (req, res) => {
  const db = readDB();
  const { title, startingAmount, image } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Le titre est requis.' });
  }

  const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  
  // Verify duplication
  if (db.categories.some((c: any) => c.id === id)) {
    return res.status(400).json({ error: 'Une catégorie similaire existe déjà.' });
  }

  const nextOrder = db.categories.length > 0 ? Math.max(...db.categories.map((c: any) => c.order || 0)) + 1 : 1;

  const newCategory = {
    id,
    title,
    startingAmount: startingAmount || '500 FCFA / jour',
    image: image || 'https://picsum.photos/seed/default/600/400',
    order: nextOrder
  };

  db.categories.push(newCategory);
  writeDB(db);
  res.status(201).json(newCategory);
});

// PUT Categories
app.put('/api/categories/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { title, startingAmount, image, order } = req.body;
  
  const index = db.categories.findIndex((c: any) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Catégorie introuvable.' });
  }

  db.categories[index] = {
    ...db.categories[index],
    title: title || db.categories[index].title,
    startingAmount: startingAmount !== undefined ? startingAmount : db.categories[index].startingAmount,
    image: image !== undefined ? image : db.categories[index].image,
    order: order !== undefined ? Number(order) : db.categories[index].order
  };

  writeDB(db);
  res.json(db.categories[index]);
});

// DELETE Categories
app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const { id } = req.params;
  
  const index = db.categories.findIndex((c: any) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Catégorie introuvable.' });
  }

  // Also remove or re-assign kits belonging to this category?
  // Let's delete all kits in that category to keep db consistent
  db.kits = db.kits.filter((k: any) => k.categoryId !== id);
  db.categories.splice(index, 1);
  
  writeDB(db);
  res.json({ message: 'Catégorie et tous les kits associés ont été supprimés avec succès.' });
});

// GET Kits
app.get('/api/kits', (req, res) => {
  const db = readDB();
  const { categoryId } = req.query;
  
  let result = [...db.kits];
  if (categoryId) {
    result = result.filter((k: any) => k.categoryId === categoryId);
  }
  
  result.sort((a: any, b: any) => a.order - b.order);
  res.json(result);
});

// POST Kits
app.post('/api/kits', authenticateToken, (req, res) => {
  const db = readDB();
  const { categoryId, name, dailyAmount, totalValue, images, products, benefits, deliveryInfo } = req.body;

  if (!categoryId || !name || !dailyAmount) {
    return res.status(400).json({ error: 'Les champs Catégorie, Nom du kit et Montant journalier sont requis.' });
  }

  const id = `kit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const nextOrder = db.kits.length > 0 ? Math.max(...db.kits.map((k: any) => k.order || 0)) + 1 : 1;

  const newKit = {
    id,
    categoryId,
    name,
    dailyAmount,
    totalValue: totalValue || '',
    images: Array.isArray(images) && images.length > 0 ? images : ['https://picsum.photos/seed/kit/600/400'],
    products: Array.isArray(products) ? products.filter(Boolean) : [],
    benefits: Array.isArray(benefits) ? benefits.filter(Boolean) : [],
    deliveryInfo: deliveryInfo || 'Livraison gratuite en Décembre.',
    order: nextOrder
  };

  db.kits.push(newKit);
  writeDB(db);
  res.status(201).json(newKit);
});

// PUT Kits
app.put('/api/kits/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { categoryId, name, dailyAmount, totalValue, images, products, benefits, deliveryInfo, order } = req.body;

  const index = db.kits.findIndex((k: any) => k.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Kit introuvable.' });
  }

  db.kits[index] = {
    ...db.kits[index],
    categoryId: categoryId || db.kits[index].categoryId,
    name: name || db.kits[index].name,
    dailyAmount: dailyAmount || db.kits[index].dailyAmount,
    totalValue: totalValue !== undefined ? totalValue : db.kits[index].totalValue,
    images: Array.isArray(images) ? images : db.kits[index].images,
    products: Array.isArray(products) ? products.filter(Boolean) : db.kits[index].products,
    benefits: Array.isArray(benefits) ? benefits.filter(Boolean) : db.kits[index].benefits,
    deliveryInfo: deliveryInfo !== undefined ? deliveryInfo : db.kits[index].deliveryInfo,
    order: order !== undefined ? Number(order) : db.kits[index].order
  };

  writeDB(db);
  res.json(db.kits[index]);
});

// DELETE Kits
app.delete('/api/kits/:id', authenticateToken, (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const index = db.kits.findIndex((k: any) => k.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Kit introuvable.' });
  }

  db.kits.splice(index, 1);
  writeDB(db);
  res.json({ message: 'Kit supprimé avec succès.' });
});

// Reorder Categories
app.post('/api/reorder-categories', authenticateToken, (req, res) => {
  const db = readDB();
  const { sortedIds } = req.body; // Array of IDs in priority order
  
  if (!Array.isArray(sortedIds)) {
    return res.status(400).json({ error: 'sortedIds est requis et doit être un tableau.' });
  }

  db.categories.forEach((cat: any) => {
    const newIdx = sortedIds.indexOf(cat.id);
    if (newIdx !== -1) {
      cat.order = newIdx + 1;
    }
  });

  writeDB(db);
  res.json({ message: 'Catégories réordonnées avec succès.' });
});

// Reorder Kits
app.post('/api/reorder-kits', authenticateToken, (req, res) => {
  const db = readDB();
  const { sortedIds } = req.body; // Array of IDs in priority order

  if (!Array.isArray(sortedIds)) {
    return res.status(400).json({ error: 'sortedIds est requis et doit être un tableau.' });
  }

  db.kits.forEach((kit: any) => {
    const newIdx = sortedIds.indexOf(kit.id);
    if (newIdx !== -1) {
      kit.order = newIdx + 1;
    }
  });

  writeDB(db);
  res.json({ message: 'Kits réordonnés avec succès.' });
});

// Global error handling middleware to format any parsing/system errors (such as PayloadTooLargeError) as JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error("Express Error Intercepted:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Une erreur interne du serveur est survenue.";
    res.status(status).json({ error: message });
  } else {
    next();
  }
});


// Dev & Production serving middlewares
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Penta Gad distribution server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
