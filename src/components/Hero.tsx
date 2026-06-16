import { Sparkles, ArrowRight, Gift, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { SiteSettings } from '../types';

interface HeroProps {
  onDiscover: () => void;
  settings?: SiteSettings;
}

export default function Hero({ onDiscover, settings }: HeroProps) {
  // Use the premium generated hero banner or customized one
  const heroImage = settings?.heroImage || "/src/assets/images/hero_banner_festive_1781612306255.jpg";

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#0D47FF]/90 to-[#2F6BFF] text-white">
      {/* Absolute Sparkling Vector Background Overlay */}
      <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35 filter brightness-95" 
           style={{ backgroundImage: `url(${heroImage})` }} 
      />
      
      {/* Golden holiday particle lighting overlay */}
      <div className="absolute inset-0 bg-radial-at-t from-amber-500/15 via-transparent to-transparent pointer-events-none" />

      {/* Decorative Top Holiday Wave */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-md z-10" />

      <div className="relative max-w-md mx-auto px-6 pt-12 pb-14 text-center z-10 flex flex-col items-center">
        
        {/* Dynamic Launch Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-yellow-300 text-[10px] font-extrabold uppercase tracking-widest border border-yellow-400/30 mb-5"
        >
          <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
          <span>{settings?.heroCampaignBadge || "Campagne Préparation 2026"}</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-extrabold text-[28px] leading-[1.2] tracking-tight text-white drop-shadow-sm mb-4"
        >
          {settings?.heroHeadline || "Préparez votre fin d'année dès aujourd'hui"}
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-white/90 text-sm font-medium tracking-wide border-t border-b border-white/10 py-2.5 px-4 mb-8 uppercase"
        >
          {settings?.heroSubtitle || "Kits Alimentaires • Électroménagers • Maison"}
        </motion.p>

        {/* Visual Showcase Card - Sneak preview inside Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 mb-8 text-left flex items-center gap-4.5 shadow-xl shadow-blue-900/40"
        >
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-white/20">
            <img 
              src={settings?.heroPromoImage || "/src/assets/images/food_pack_bronze_1781612322822.jpg"} 
              alt="Packs Penta"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-extrabold text-yellow-300 uppercase tracking-wide">{settings?.heroPromoBrand || "Penta Gad Distribution"}</h4>
            <p className="text-[13px] font-semibold text-white mt-1 truncate">{settings?.heroPromoTitle || "Un foyer équipé & gâté pour Noël"}</p>
            <p className="text-[11px] text-white/70">{settings?.heroPromoDesc || "Financement souple par contributions journalières"}</p>
          </div>
        </motion.div>

        {/* Primary CTA Buttons */}
        <motion.button
          id="hero_discover_btn"
          onClick={onDiscover}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-blue-950 font-display font-extrabold text-sm py-4 px-6 rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-200/40 uppercase tracking-wider"
        >
          <span>{settings?.heroCtaText || "Découvrir les Packs"}</span>
          <ArrowRight className="w-4 h-4 text-blue-950" />
        </motion.button>

        <ChevronDown className="w-5 h-5 mt-4 text-white/55 animate-bounce" />

      </div>
    </div>
  );
}
