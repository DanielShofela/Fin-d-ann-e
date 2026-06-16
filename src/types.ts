export interface Category {
  id: string;
  title: string;          // e.g. "Bronze"
  startingAmount: string; // e.g. "500 FCFA / jour"
  image: string;          // image URL or path
  order: number;
}

export interface Kit {
  id: string;
  categoryId: string;
  name: string;
  dailyAmount: string;    // e.g. "1.200 FCFA / jour"
  totalValue: string;     // e.g. "120.000 FCFA"
  images: string[];       // multiple images
  products: string[];     // list of products
  benefits: string[];     // list of benefits
  deliveryInfo: string;   // delivery details, e.g. "Livraison gratuite en Décembre dans toute la ville"
  order: number;
}

export interface AdminSession {
  token: string;
  username: string;
}

export interface SiteSettings {
  logoUrl?: string;
  headerBrand: string;
  headerSubtitle: string;
  
  heroImage: string;
  heroCampaignBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroPromoBrand: string;
  heroPromoTitle: string;
  heroPromoDesc: string;
  heroPromoImage: string;
  heroCtaText: string;

  infoTitle: string;
  infoDescription: string;

  faqTitle: string;
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;

  footerBrand: string;
  footerSubtitle: string;
  footerDesc: string;
  footerAddress: string;
  
  phoneOrange: string;
  phoneMoov: string;
  phoneMtn: string;
  whatsappHotline: string;
  
  momoWaveName: string;
  momoWaveNum: string;
  momoOrangeName: string;
  momoOrangeNum: string;
  momoMtnName: string;
  momoMtnNum: string;
  momoMoovName: string;
  momoMoovNum: string;
  featuredKitIds?: string[];
}

export interface CatalogProduct {
  id: string;
  category: string;
  subcategory?: string;
  name: string;
  image?: string;
}

