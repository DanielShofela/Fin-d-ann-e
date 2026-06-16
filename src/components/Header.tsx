import { Sparkles, ArrowLeft, ShieldAlert, LogOut, Gift } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, arg?: any) => void;
  onBack: (() => void) | null;
  isAdmin: boolean;
  onLogout: () => void;
  settings?: SiteSettings;
}

export default function Header({ currentView, onNavigate, onBack, isAdmin, onLogout, settings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm px-4 py-3.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Safe Back Button or Logo */}
        <div className="flex items-center gap-2">
          {onBack ? (
            <button
              id="header_back_btn"
              onClick={onBack}
              className="p-1.5 -ml-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-[#0D47FF]" />
            </button>
          ) : (
            <div 
              onClick={() => onNavigate('homepage')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8.5 h-8.5 rounded-xl border border-slate-100 flex items-center justify-center bg-white shadow-sm overflow-hidden shrink-0 group-hover:scale-105 duration-300">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#0D47FF] to-[#2F6BFF] flex items-center justify-center text-white">
                    <Gift className="w-4.5 h-4.5" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-[15px] leading-none tracking-tight text-slate-900 group-hover:text-[#0D47FF] duration-250 uppercase">
                  {settings?.headerBrand || "PENTA GAD"}
                </span>
                <span className="text-[9px] font-bold text-[#0D47FF] uppercase tracking-widest leading-none mt-0.5">
                  {settings?.headerSubtitle || "Distribution"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Section Label */}
        {currentView === 'admin' && (
          <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-md">
            Admin CMS
          </span>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                id="header_admin_dash_btn"
                onClick={() => onNavigate('admin')}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  currentView === 'admin' 
                    ? 'bg-[#0D47FF] text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Console</span>
              </button>
              <button
                id="header_logout_btn"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
