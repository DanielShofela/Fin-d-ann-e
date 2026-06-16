import { ChevronRight, ArrowRightLeft, Sparkles } from 'lucide-react';
import { Category, Kit } from '../types';
import { motion } from 'motion/react';

interface CategoryCarouselProps {
  categories: Category[];
  kits: Kit[];
  onSelectCategory: (id: string) => void;
}

export default function CategoryCarousel({ categories, kits, onSelectCategory }: CategoryCarouselProps) {
  
  // Helper to count kits per category
  const getKitCount = (catId: string) => {
    return kits.filter((k) => k.categoryId === catId).length;
  };

  // Theme badges & outlines for Bronze, Argent, Or, Platine
  const getCategoryStyles = (id: string) => {
    switch (id.toLowerCase()) {
      case 'bronze':
        return {
          textColor: 'text-amber-700',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          gradient: 'from-amber-50 to-amber-100/50',
          accent: 'border-amber-400'
        };
      case 'argent':
        return {
          textColor: 'text-slate-600',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          gradient: 'from-slate-50 to-slate-100/50',
          accent: 'border-slate-300'
        };
      case 'or':
        return {
          textColor: 'text-yellow-700',
          badgeBg: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          gradient: 'from-yellow-50 to-amber-50/50',
          accent: 'border-yellow-400'
        };
      case 'platine':
        return {
          textColor: 'text-indigo-800',
          badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          gradient: 'from-indigo-50/50 via-slate-50 to-slate-100/50',
          accent: 'border-indigo-400'
        };
      default:
        return {
          textColor: 'text-blue-700',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
          gradient: 'from-blue-50 to-blue-100/50',
          accent: 'border-blue-400'
        };
    }
  };

  return (
    <div className="w-full bg-slate-50 border-y border-slate-100 py-8 px-4 overflow-hidden">
      <div className="max-w-md mx-auto">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex flex-col">
            <h2 className="font-display font-extrabold text-[15px] uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Nos Catégories de Packs</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Glissez pour explorer les offres</p>
          </div>
          
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#0D47FF] bg-[#0D47FF]/10 py-1 px-2.5 rounded-full border border-[#0D47FF]/15">
            <ArrowRightLeft className="w-3.5 h-3.5 animate-pulse" />
            <span>Défiler</span>
          </div>
        </div>

        {/* Swipe Indicators Container & Horizontal Swipe Carousel */}
        <div className="w-full">
          <div 
            id="category_swipe_carousel"
            className="flex gap-4.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing px-2"
          >
            {categories.map((category) => {
              const styles = getCategoryStyles(category.id);
              const kitCount = getKitCount(category.id);

              return (
                <div
                  id={`cat_card_${category.id}`}
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className="flex-none w-[230px] snap-start bg-white rounded-2xl border border-slate-100 hover:border-[#0D47FF]/35 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Category Image Box */}
                  <div className="relative h-32 bg-slate-100 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    {/* Floating top info */}
                    <span className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border font-mono tracking-wider ${styles.badgeBg}`}>
                      {kitCount} {kitCount > 1 ? 'Kits' : 'Kit'}
                    </span>
                  </div>

                  {/* Details block */}
                  <div className={`p-4 bg-gradient-to-b ${styles.gradient} relative`}>
                    
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className={`font-display text-lg font-extrabold tracking-tight ${styles.textColor}`}>
                        Gamme {category.title}
                      </h3>
                      <ChevronRight className={`w-4 h-4 shrink-0 opacity-80 ${styles.textColor}`} />
                    </div>

                    <div className="mt-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Contribution à partir de
                      </span>
                      <span className="text-sm font-extrabold text-slate-800">
                        {category.startingAmount}
                      </span>
                    </div>

                    {/* Bottom visual accent line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.id === 'bronze' ? 'from-amber-600 to-amber-400' : category.id === 'argent' ? 'from-slate-400 to-slate-200' : category.id === 'or' ? 'from-yellow-500 to-amber-300' : 'from-indigo-600 to-indigo-400'}`} />

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slide Help text for first loaders */}
        <div className="mt-1 text-center font-mono text-[9px] text-slate-400 uppercase tracking-widest animate-pulse">
          ◀ Glissez vers la gauche ou la droite ▶
        </div>

      </div>
    </div>
  );
}
