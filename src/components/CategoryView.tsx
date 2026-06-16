import { Sparkles, ArrowLeft, ShoppingBag, Eye, CheckCircle2 } from 'lucide-react';
import { Category, Kit } from '../types';
import { motion } from 'motion/react';

interface CategoryViewProps {
  category: Category;
  kits: Kit[];
  onSelectKit: (kitId: string) => void;
  onBack: () => void;
}

export default function CategoryView({ category, kits, onSelectKit, onBack }: CategoryViewProps) {
  
  // Theme styling based on category
  const getSubtheme = () => {
    switch (category.id.toLowerCase()) {
      case 'bronze':
        return {
          bannerBg: 'from-amber-700 to-amber-900',
          textColor: 'text-amber-800',
          accentBorder: 'border-amber-200',
          accentBg: 'bg-amber-50',
          pillColor: 'bg-amber-100 text-amber-800 border-amber-200',
          line: 'bg-amber-500'
        };
      case 'argent':
        return {
          bannerBg: 'from-slate-600 to-slate-800',
          textColor: 'text-slate-800',
          accentBorder: 'border-slate-200',
          accentBg: 'bg-slate-50',
          pillColor: 'bg-slate-100 text-slate-800 border-slate-200',
          line: 'bg-slate-400'
        };
      case 'or':
        return {
          bannerBg: 'from-yellow-600 to-amber-800',
          textColor: 'text-yellow-800',
          accentBorder: 'border-yellow-200',
          accentBg: 'bg-yellow-50/50',
          pillColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          line: 'bg-yellow-500'
        };
      case 'platine':
        return {
          bannerBg: 'from-blue-800 to-indigo-950',
          textColor: 'text-indigo-800',
          accentBorder: 'border-indigo-200',
          accentBg: 'bg-indigo-50/30',
          pillColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          line: 'bg-indigo-500'
        };
      default:
        return {
          bannerBg: 'from-[#0D47FF] to-[#2F6BFF]',
          textColor: 'text-[#0D47FF]',
          accentBorder: 'border-blue-100',
          accentBg: 'bg-[#0D47FF]/5',
          pillColor: 'bg-[#0D47FF]/10 text-[#0D47FF] border-[#0D47FF]/15',
          line: 'bg-[#0D47FF]'
        };
    }
  };

  const theme = getSubtheme();

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-16">
      
      {/* Category Banner */}
      <div className={`relative w-full bg-gradient-to-r ${theme.bannerBg} text-white overflow-hidden py-10 px-6`}>
        {/* Decorative backdrop graphics */}
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25" style={{ backgroundImage: `url(${category.image})` }} />
        
        <div className="relative max-w-md mx-auto z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/95 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tous les packs</span>
          </button>
          
          <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none mb-1 text-white">
            Gamme {category.title}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Profitez de contributions ajustées dès <span className="text-yellow-300 font-extrabold">{category.startingAmount}</span>
          </p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-md mx-auto px-4 mt-6">
        
        {kits.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-sm text-slate-700">Aucun kit disponible</h3>
            <p className="text-xs text-slate-400 mt-1">Revenez bientôt ou contactez-nous si vous souhaitez un kit sur-mesure !</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-[#0D47FF] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nos suggestions ({kits.length})
              </span>
              <span className="text-[11px] font-medium text-slate-400">Cliquez sur un pack pour configurer</span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {kits.map((kit, index) => (
                <motion.div
                  id={`kit_card_${kit.id}`}
                  key={kit.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  onClick={() => onSelectKit(kit.id)}
                  className="bg-white rounded-2.5xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100/80 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                >
                  {/* Kit Thumbnail Block */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={kit.images && kit.images[0] ? kit.images[0] : 'https://picsum.photos/seed/penta/600/400'}
                      alt={kit.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient blur at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Badge price overlay */}
                    <div className="absolute bottom-3 left-3 flex flex-col">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FFF] text-yellow-300 leading-none">
                        Remboursement Journalier
                      </span>
                      <span className="text-lg font-black font-mono text-white mt-1 leading-none drop-shadow-sm">
                        {kit.dailyAmount} <span className="text-xs font-normal">/ jour</span>
                      </span>
                    </div>

                    {/* Total Value Badge if specified */}
                    {kit.totalValue && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-slate-800 shadow-sm border border-slate-100">
                        Valeur : {kit.totalValue}
                      </div>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-black text-[16px] leading-tight text-slate-900 group-hover:text-blue-600 duration-200">
                        {kit.name}
                      </h3>
                      
                      {/* Products preview (max 3 items) */}
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                          Composition du Kit :
                        </span>
                        <div className="grid grid-cols-1 gap-1">
                          {(() => {
                            const counts: { [name: string]: number } = {};
                            const uniques: string[] = [];
                            (kit.products || []).forEach(p => {
                              const t = p.trim();
                              if (!t) return;
                              const existing = uniques.find(u => u.toLowerCase() === t.toLowerCase());
                              if (existing) {
                                counts[existing]++;
                              } else {
                                uniques.push(t);
                                counts[t] = 1;
                              }
                            });
                            
                            const sliced = uniques.slice(0, 3);
                            return (
                              <>
                                {sliced.map((prod, pIdx) => (
                                  <div key={pIdx} className="flex items-center gap-1.5 text-xs text-slate-600 justify-between pr-4">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${theme.textColor}`} />
                                      <span className="truncate">{prod}</span>
                                    </div>
                                    {counts[prod] > 1 && (
                                      <span className="text-[9px] font-bold text-blue-600 font-mono shrink-0 bg-blue-50 px-1 rounded">
                                        ×{counts[prod]}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {uniques.length > 3 && (
                                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50/50 py-0.5 px-2 rounded-md inline-block mt-0.5 self-start">
                                    + {uniques.length - 3} autres produits inclus
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Button voir le kit CTA */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-semibold text-emerald-600">
                          {kit.deliveryInfo || "Livraison gratuite"}
                        </span>
                      </div>
                      
                      <button
                        id={`voir_kit_${kit.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectKit(kit.id);
                        }}
                        className="bg-[#0D47FF] hover:bg-blue-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Voir le Kit</span>
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
