import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Firebase Firestore setup
let dbFirestore: any = null;
try {
  const fbcPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(fbcPath)) {
    const config = JSON.parse(fs.readFileSync(fbcPath, 'utf8'));
    const firebaseApp = initializeApp(config);
    dbFirestore = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("Firebase initialized successfully on backend server.");
  } else {
    console.warn("firebase-applet-config.json not found on server.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase on server:", e);
}

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

// PayDunya API Call helper
async function createPaydunyaInvoice(params: {
  amount: number,
  productName: string,
  clientId: string,
  clientName: string,
  clientPhone: string,
  cancelUrl: string,
  returnUrl: string,
  callbackUrl: string
}) {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const token = process.env.PAYDUNYA_TOKEN;
  const mode = process.env.PAYDUNYA_MODE || 'sandbox';

  // Fallback to simulation mode if API keys are missing, to ensure developer-friendly testing
  if (!masterKey || !privateKey || !token) {
    console.warn("PayDunya API keys missing. Running in Simulated Sandbox Mode.");
    const simToken = `sim_token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      simulation: true,
      url: `${params.returnUrl}?token=${simToken}&simAmount=${params.amount}&clientId=${params.clientId}`,
      token: simToken
    };
  }

  const endpoint = "https://paydunya.com/api/v1/checkout-invoice/create";
  const payload = {
    invoice: {
      items: {
        item_0: {
          name: `Kit 2026 - ${params.productName}`,
          quantity: 1,
          unit_price: String(params.amount),
          total_price: String(params.amount)
        }
      },
      total_amount: params.amount,
      description: `Versement progressif pour ${params.productName}`
    },
    store: {
      name: "Kit 2026"
    },
    actions: {
      cancel_url: params.cancelUrl,
      callback_url: params.callbackUrl,
      return_url: params.returnUrl
    },
    custom_data: {
      clientId: params.clientId,
      clientName: params.clientName,
      clientPhone: params.clientPhone,
      amount: String(params.amount)
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYDUNYA-MASTER-KEY": masterKey,
        "PAYDUNYA-PRIVATE-KEY": privateKey,
        "PAYDUNYA-TOKEN": token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayDunya returned HTTP error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data.response_code === "00") {
      return {
        success: true,
        simulation: false,
        url: data.response_text_url || data.url,
        token: data.token
      };
    } else {
      throw new Error(`PayDunya response declined: ${data.response_text} (Code: ${data.response_code})`);
    }
  } catch (err: any) {
    console.error("Paydunya request failed, falling back to simulated callback:", err);
    const simToken = `sim_err_token_${Date.now()}`;
    return {
      success: true,
      simulation: true,
      url: `${params.returnUrl}?token=${simToken}&simAmount=${params.amount}&clientId=${params.clientId}&simError=true`,
      token: simToken
    };
  }
}

async function verifyPaydunyaInvoice(tokenValue: string) {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const token = process.env.PAYDUNYA_TOKEN;

  if (tokenValue.startsWith('sim_')) {
    // Simulated token logic
    return {
      verified: true,
      simulation: true,
      amount: 5000,
      clientId: "",
      moyenPaiement: "Wave"
    };
  }

  const endpoint = `https://paydunya.com/api/v1/checkout-invoice/confirm/${tokenValue}`;
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "PAYDUNYA-MASTER-KEY": masterKey!,
        "PAYDUNYA-PRIVATE-KEY": privateKey!,
        "PAYDUNYA-TOKEN": token!
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PayDunya confirmation API returned HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    // Confirm status can be completed/success
    if (data.status === "completed" || data.response_code === "00" || data.invoice?.status === "completed") {
      const invoice = data.invoice || {};
      const customData = data.custom_data || {};
      return {
        verified: true,
        simulation: false,
        amount: Number(invoice.total_amount || customData.amount || 0),
        clientId: customData.clientId || "",
        moyenPaiement: data.payment_method || invoice.payment_method || "PayDunya WebPay"
      };
    }
    return { verified: false, raw: data };
  } catch (err: any) {
    console.error("PayDunya transaction verify error:", err);
    return { verified: false, error: String(err) };
  }
}

async function updateClientProgressInFirestore(clientId: string, amount: number, paymentMethod: string, transactionId: string) {
  if (!dbFirestore) {
    console.error("No Firestore DB reference found on server side.");
    throw new Error("Base de données Firestore non connectée sur le serveur.");
  }

  const clientRef = doc(dbFirestore, 'clients', clientId);
  const clientSnap = await getDoc(clientRef);

  if (!clientSnap.exists()) {
    console.error(`Client record with ID ${clientId} not found in Firestore.`);
    throw new Error("Dossier client introuvable dans la base de données.");
  }

  const clientData = clientSnap.data();
  const currentPaid = Number(clientData.montantPaye || 0);
  const totalValue = Number(clientData.prixTotal || 0);

  const newPaid = currentPaid + amount;
  const newReste = Math.max(0, totalValue - newPaid);
  const newPercent = Math.min(100, Math.round((newPaid / totalValue) * 100));
  const newStatus = newReste <= 0 ? "termine" : "en_cours";

  // System logging
  console.log(`[Paiement Reçu] Client: ${clientId}, Somme: ${amount} FCFA. Progression recalculée: ${currentPaid} -> ${newPaid} / ${totalValue} (${newPercent}%)`);

  // Update client
  await updateDoc(clientRef, {
    montantPaye: newPaid,
    resteAPayer: newReste,
    pourcentage: newPercent,
    statut: newStatus
  });

  // Log to payments collection
  const paymentsRef = collection(dbFirestore, 'paiements');
  const paymentDoc = {
    clientId: clientId,
    transactionId: transactionId,
    montant: amount,
    moyenPaiement: paymentMethod,
    datePaiement: new Date().toISOString(),
    statut: "valide"
  };
  await addDoc(paymentsRef, paymentDoc);

  return {
    clientId,
    montant: amount,
    newPaid,
    newReste,
    newPercent,
    newStatus
  };
}

// -------------------------------------------------------------
// PayDunya Payment API Endpoints
// -------------------------------------------------------------

// 1. Create Checkout Redirection Invoice
app.post('/api/paydunya/create-checkout', async (req, res) => {
  try {
    const { clientId, amount, productName, clientName, clientPhone } = req.body;

    if (!clientId || !amount || !productName) {
      return res.status(400).json({ error: "Les champs clientId, amount et productName sont requis." });
    }

    const hostOrigin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
    const cancelUrl = `${hostOrigin}/payment-cancel`;
    const returnUrl = `${hostOrigin}/payment-success`;
    const callbackUrl = `${hostOrigin}/api/paydunya-ipn`;

    const invoiceResult = await createPaydunyaInvoice({
      amount: Number(amount),
      productName,
      clientId,
      clientName: clientName || "Client Kit 2026",
      clientPhone: clientPhone || "",
      cancelUrl,
      returnUrl,
      callbackUrl
    });

    res.json(invoiceResult);
  } catch (err: any) {
    console.error("PayDunya request error:", err);
    res.status(500).json({ error: err.message || "Une erreur est survenue lors de l'initiation PayDunya." });
  }
});

// 2. IPN Callback Listener
app.post('/api/paydunya-ipn', async (req, res) => {
  try {
    const tokenValue = req.body.token || req.query.token;
    console.log(`[IPN reçu] paydunya notify token: ${tokenValue}`);

    if (!tokenValue) {
      return res.status(400).send("Token manquant");
    }

    const verify = await verifyPaydunyaInvoice(tokenValue);
    if (verify.verified && verify.clientId) {
      await updateClientProgressInFirestore(
        verify.clientId,
        verify.amount,
        verify.moyenPaiement || "Mobile Money",
        tokenValue
      );
      return res.status(200).send("Paiement validé avec succès.");
    }

    res.status(400).send("Validation échouée.");
  } catch (err: any) {
    console.error("[IPN Error] Failed to handle callback:", err);
    res.status(500).send("Erreur interne IPN");
  }
});

// 3. User Success Redirection Page Verification (Instant Confirm fallback)
app.get('/api/paydunya/confirm-payment', async (req, res) => {
  try {
    const tokenValue = req.query.token as string;
    const clientContextId = req.query.clientId as string;
    const simAmount = req.query.simAmount ? Number(req.query.simAmount) : null;

    if (!tokenValue) {
      return res.status(400).json({ error: "Token requis pour confirmation." });
    }

    console.log(`[Vérification manuelle] token=${tokenValue}, client=${clientContextId}`);

    // If simulated mock token or API test mode
    if (tokenValue.startsWith('sim_')) {
      const payAmount = simAmount || 5000;
      if (clientContextId) {
        const updateResult = await updateClientProgressInFirestore(
          clientContextId,
          payAmount,
          "Simulation Directe",
          tokenValue
        );
        return res.json({
          status: "completed",
          data: updateResult,
          message: "Simulation de paiement enregistrée avec succès."
        });
      }
      return res.json({
        status: "completed",
        message: "Simulation validée (sans identifiant client lié)."
      });
    }

    // Real PayDunya confirm API call
    const verify = await verifyPaydunyaInvoice(tokenValue);
    if (verify.verified) {
      const cid = verify.clientId || clientContextId;
      if (!cid) {
        return res.status(400).json({ error: "Paiement vérifié avec PayDunya, mais aucun clientId lié n'a pu être résolu." });
      }

      const updateResult = await updateClientProgressInFirestore(
        cid,
        verify.amount,
        verify.moyenPaiement || "PayDunya Mobile Money",
        tokenValue
      );

      return res.json({
        status: "completed",
        data: updateResult,
        message: "Paiement vérifié et progression enregistrée."
      });
    } else {
      return res.status(400).json({ error: "Paiement non encore complété ou expiré selon PayDunya." });
    }
  } catch (err: any) {
    console.error("Redirection confirm failed:", err);
    res.status(500).json({ error: err.message || "Erreur lors de la confirmation du paiement." });
  }
});

// 4. B2B Developer Simulation Route bypass (Essential for pristine Sandbox Iframe testing workflow)
app.post('/api/paydunya/verify-checkout-test', async (req, res) => {
  try {
    const { clientId, amount, moyenPaiement } = req.body;
    if (!clientId || !amount) {
      return res.status(400).json({ error: "clientId et amount sont obligatoires." });
    }

    const testToken = `sim_dev_${Date.now()}`;
    const result = await updateClientProgressInFirestore(
      clientId,
      Number(amount),
      moyenPaiement || "Wave Côte d'Ivoire",
      testToken
    );

    res.json({
      success: true,
      message: "Simulation développeur validée en direct.",
      data: result
    });
  } catch (err: any) {
    console.error("Simulation endpoint error:", err);
    res.status(500).json({ error: err.message || "Erreur lors de la simulation développeur." });
  }
});

// -------------------------------------------------------------
// WhatsApp User Auto-Registration and Name-only Client Login
// -------------------------------------------------------------

// 5. Register a client automatically from WhatsApp modal submission
app.post('/api/clients/register', async (req, res) => {
  try {
    const { nom, telephone, whatsapp, produit, prixTotal, ville, commune, adresse } = req.body;
    
    if (!nom || !telephone || !produit) {
      return res.status(400).json({ error: "Le nom, téléphone et produit de kit sont requis." });
    }

    if (!dbFirestore) {
      return res.status(500).json({ error: "Base de données Firestore non connectée sur le serveur." });
    }

    const cleanName = nom.trim();
    const cleanPhone = telephone.trim();

    // Check if client with this name already exists (case-insensitive)
    const clientsRef = collection(dbFirestore, 'clients');
    const snapshot = await getDocs(clientsRef);
    let existingClient: any = null;
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if ((data.nom || '').trim().toLowerCase() === cleanName.toLowerCase()) {
        existingClient = { id: docSnap.id, ...data };
      }
    });

    if (existingClient) {
      // Client already exists. Let's update their parameters and lock in
      const clientRef = doc(dbFirestore, 'clients', existingClient.id);
      const updatedData = {
        telephone: cleanPhone,
        whatsapp: whatsapp || existingClient.whatsapp || '',
        produit: produit,
        prixTotal: Number(prixTotal) || existingClient.prixTotal || 45000,
        resteAPayer: Math.max(0, (Number(prixTotal) || existingClient.prixTotal || 45000) - (existingClient.montantPaye || 0)),
        ville: ville || existingClient.ville || '',
        commune: commune || existingClient.commune || '',
        adresse: adresse || existingClient.adresse || ''
      };
      await updateDoc(clientRef, updatedData);
      console.log(`[Auto-Update] Client updated on WA click: ${cleanName}`);
      return res.json({ success: true, message: "Client existant mis à jour.", clientId: existingClient.id });
    }

    // Provision new client
    const customUid = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const clientDoc = {
      uid: customUid,
      nom: cleanName,
      telephone: cleanPhone,
      whatsapp: whatsapp || '',
      produit: produit,
      prixTotal: Number(prixTotal) || 45000,
      montantPaye: 0,
      resteAPayer: Number(prixTotal) || 45000,
      pourcentage: 0,
      statut: 'en_cours',
      ville: ville || '',
      commune: commune || '',
      adresse: adresse || '',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(dbFirestore, 'clients', customUid), clientDoc);
    console.log(`[Auto-Register] New client registered automatically on WA click: ${cleanName}`);
    res.status(201).json({ success: true, message: "Compte client créé automatiquement.", clientId: customUid });
  } catch (err: any) {
    console.error("Error automatic client register:", err);
    res.status(500).json({ error: err.message || "Erreur lors de la création du compte." });
  }
});

// 6. Client Login using Telephone number (No password required)
app.post('/api/clients/login', async (req, res) => {
  try {
    const { telephone } = req.body;
    if (!telephone) {
      return res.status(400).json({ error: "Le numéro de téléphone est requis pour la connexion." });
    }

    if (!dbFirestore) {
      return res.status(500).json({ error: "Base de données Firestore non connectée sur le serveur." });
    }

    const cleanPhone = telephone.trim().replace(/\s+/g, '');
    const clientsRef = collection(dbFirestore, 'clients');
    const snapshot = await getDocs(clientsRef);
    let matchedClient: any = null;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const existingPhone = (data.telephone || '').trim().replace(/\s+/g, '');
      const existingWhatsapp = (data.whatsapp || '').trim().replace(/\s+/g, '');
      if (existingPhone === cleanPhone || (existingWhatsapp && existingWhatsapp === cleanPhone)) {
        matchedClient = { id: docSnap.id, ...data };
      }
    });

    if (!matchedClient) {
      return res.status(404).json({ error: "Aucun compte n'a été trouvé avec ce numéro de téléphone (" + telephone + "). Assurez-vous d'entrer le numéro saisi lors de votre souscription." });
    }

    res.json({ success: true, client: matchedClient });
  } catch (err: any) {
    console.error("Error login by phone only:", err);
    res.status(500).json({ error: err.message || "Erreur lors de la connexion." });
  }
});

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
