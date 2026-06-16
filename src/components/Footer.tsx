import { Sparkles, Phone, MessageCircle, MapPin, Truck, ShieldCheck, Heart } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  whatsappNumber?: string;
  settings?: SiteSettings;
  onGoAdmin?: () => void;
}

export default function Footer({ whatsappNumber = "+2250102030405", settings, onGoAdmin }: FooterProps) {
  const activeWhatsApp = settings?.whatsappHotline || whatsappNumber;
  return (
    <footer className="w-full bg-slate-900 text-slate-300 py-12 px-6 border-t border-slate-800">
      <div className="max-w-md mx-auto space-y-8">
        
        {/* Corporate details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xs">
              {settings?.footerBrand ? settings.footerBrand.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-sm tracking-tight text-white leading-none uppercase">
                {settings?.footerBrand || "PENTA GAD DISTRIBUTION"}
              </span>
              <span className="text-[8px] font-bold tracking-widest text-blue-400 uppercase leading-none mt-0.5">
                {settings?.footerSubtitle || "Packs d'adhésion de fin d'année"}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {settings?.footerDesc || "Penta Gad Distribution est votre partenaire officiel de confiance pour l'équipement de la maison et le ravitaillement de vos fêtes. Un crédit d'épargne journalier souple et adapté à vos revenus."}
          </p>
        </div>

        {/* Speed Dial / Contact blocks */}
        <div className="space-y-4 pt-2">
          <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            Centre de Relation Client & Commandes
          </h4>
          
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Notre numéro d'appel (Cliquez pour appeler) :</span>
            <div className="flex flex-col gap-2">
              <a href={`tel:${(settings?.phoneMoov || "01 00 82 57 81").replace(/[^0-9]/g, '')}`} className="flex items-center gap-2.5 text-xs text-slate-200 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-mono text-xs hover:underline">{settings?.phoneMoov || "01 00 82 57 81"}</span>
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs pt-2">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Notre Adresse :</span>
              <span className="text-slate-200 text-xs leading-relaxed">
                {settings?.footerAddress || "Yopougon sapeur-pompier, non loin de la cité SGBCI, Abidjan"}
              </span>
            </div>
          </div>

          {/* Mobile Money Payment Channels Details */}
          {((settings?.momoWaveNum && settings.momoWaveNum.trim() !== "") ||
            (settings?.momoOrangeNum && settings.momoOrangeNum.trim() !== "") ||
            (settings?.momoMtnNum && settings.momoMtnNum.trim() !== "") ||
            (settings?.momoMoovNum && settings.momoMoovNum.trim() !== "")) && (
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 mt-4 space-y-3">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Moyens d'Épargne & de Paiement Acceptés
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] leading-tight">
                {settings?.momoWaveNum && settings.momoWaveNum.trim() !== "" && (
                  <div className="p-2 rounded bg-slate-800/20 border border-slate-800 flex flex-col">
                    <span className="text-[8px] text-sky-400 font-extrabold tracking-wider uppercase">{settings.momoWaveName || "🌊 WAVE IP"}</span>
                    <span className="font-mono text-slate-200 mt-1">{settings.momoWaveNum}</span>
                  </div>
                )}
                {settings?.momoOrangeNum && settings.momoOrangeNum.trim() !== "" && (
                  <div className="p-2 rounded bg-slate-800/20 border border-slate-800 flex flex-col">
                    <span className="text-[8px] text-orange-400 font-extrabold tracking-wider uppercase">{settings.momoOrangeName || "🍊 ORANGE MONEY"}</span>
                    <span className="font-mono text-slate-200 mt-1">{settings.momoOrangeNum}</span>
                  </div>
                )}
                {settings?.momoMtnNum && settings.momoMtnNum.trim() !== "" && (
                  <div className="p-2 rounded bg-slate-800/20 border border-slate-800 flex flex-col">
                    <span className="text-[8px] text-yellow-500 font-extrabold tracking-wider uppercase">{settings.momoMtnName || "🟡 MTN MOMO"}</span>
                    <span className="font-mono text-slate-200 mt-1">{settings.momoMtnNum}</span>
                  </div>
                )}
                {settings?.momoMoovNum && settings.momoMoovNum.trim() !== "" && (
                  <div className="p-2 rounded bg-slate-800/20 border border-slate-800 flex flex-col">
                    <span className="text-[8px] text-sky-500 font-extrabold tracking-wider uppercase">{settings.momoMoovName || "🔵 MOOV MONEY"}</span>
                    <span className="font-mono text-slate-200 mt-1">{settings.momoMoovNum}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Chat Bubble trigger */}
          <a
            href={`https://wa.me/${activeWhatsApp.replace(/[^0-9+]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-600/25 transition-all text-center cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Discuter sur WhatsApp : {activeWhatsApp}</span>
          </a>
        </div>

        {/* Footnote Copyright & developer credit bounds */}
        <div className="pt-8 border-t border-slate-800/60 text-center space-y-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
            &copy; 2026 {settings?.footerBrand || "Penta Gad Distribution"}. Tous droits réservés.
          </p>
          <div 
            onClick={onGoAdmin}
            className="flex items-center justify-center gap-1 text-[9px] text-slate-700 hover:text-slate-500 active:text-blue-400 uppercase tracking-wide cursor-pointer select-none transition-colors mx-auto"
            title="Penta Gad"
          >
            <span>Conçu avec</span>
            <Heart className="w-2.5 h-2.5 text-blue-500 fill-blue-500" />
            <span>pour les familles ivoiriennes</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
