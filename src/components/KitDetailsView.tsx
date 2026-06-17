import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, ShieldCheck, Truck, Calendar, DollarSign, ChevronRight, ChevronLeft, HelpCircle, ShoppingBag } from 'lucide-react';
import { Kit, Category, CatalogProduct } from '../types';
import { motion } from 'motion/react';

interface KitDetailsViewProps {
  kit: Kit;
  category: Category;
  products?: CatalogProduct[];
  onBack: () => void;
  onChooseKit: () => void;
}

interface GalleryItem {
  type: 'kit' | 'product';
  url: string;
  title: string;
  quantity?: number;
}

export default function KitDetailsView({ kit, category, products = [], onBack, onChooseKit }: KitDetailsViewProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Fallback for missing images
  const kitImages = kit.images && kit.images.length > 0 ? kit.images : ['https://picsum.photos/seed/kit/600/400'];

  // Group duplicate products inside the kit
  const productCounts: { [name: string]: number } = {};
  const uniqueProducts: string[] = [];
  (kit.products || []).forEach(prod => {
    if (!prod) return;
    const trimmed = prod.trim();
    if (!trimmed) return;
    const existing = uniqueProducts.find(o => o.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      productCounts[existing]++;
    } else {
      uniqueProducts.push(trimmed);
      productCounts[trimmed] = 1;
    }
  });

  // Collect all gallery items: general kit images + images of products in the kit
  const galleryItems: GalleryItem[] = [];

  // 1. Add Kit's own images
  kitImages.forEach((img, index) => {
    galleryItems.push({
      type: 'kit',
      url: img,
      title: `${kit.name} - Aperçu ${index + 1}`
    });
  });

  // 2. Add images of products in the kit (avoiding duplicates)
  uniqueProducts.forEach(prodName => {
    const matched = (products || []).find(p => p.name.trim().toLowerCase() === prodName.trim().toLowerCase());
    const count = productCounts[prodName] || 1;
    const imageUrl = matched?.image;
    if (imageUrl && imageUrl.trim()) {
      galleryItems.push({
        type: 'product',
        url: imageUrl,
        title: prodName,
        quantity: count
      });
    }
  });

  // Safeguard active index out of bounds on kit change
  const safeActiveIdx = activeImageIdx >= galleryItems.length ? 0 : activeImageIdx;
  const activeItem = galleryItems[safeActiveIdx] || galleryItems[0];

  const nextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % galleryItems.length);
  };

  const prevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  // Light-weight native touch swipe event coordinates
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.targetTouches[0].clientX;
    touchEndX = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      nextImage(); // Swiped Left -> show next
    } else if (touchStartX - touchEndX < -50) {
      prevImage(); // Swiped Right -> show prev
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-24">
      
      {/* Dynamic Header details */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1 rounded-full text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-[#0D47FF] uppercase tracking-widest">Gamme {category.title}</p>
          <h2 className="text-sm font-black text-slate-900 truncate">{kit.name}</h2>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 mt-4">
        
        {/* Gallery Visual Card */}
        <div className="bg-white rounded-2.5xl p-2.5 shadow-sm border border-slate-100">
          
          {/* Large Main Image with Touch Swipe and Overlays */}
          <div 
            className="relative h-64 rounded-2xl overflow-hidden bg-slate-150 group select-none cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={activeItem?.url}
              alt={activeItem?.title}
              className="w-full h-full object-cover transition-all duration-300 transform"
              referrerPolicy="no-referrer"
            />
            
            {/* Dark gradient blur at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Top Info Badge Overlay depending on item type */}
            {activeItem?.type === 'product' ? (
              <span className="absolute top-3 right-3 bg-[#0D47FF] text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg tracking-wider border border-blue-500/20 shadow-md flex items-center gap-1.5 backdrop-blur-md">
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>{activeItem.quantity && activeItem.quantity > 1 ? `${activeItem.title} (x${activeItem.quantity})` : activeItem.title}</span>
              </span>
            ) : (
              <span className="absolute top-3 right-3 bg-slate-950/75 text-white text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg tracking-wider border border-white/10 shadow-md backdrop-blur-md">
                Aperçu Général du Kit
              </span>
            )}

            {/* Slider Navigation Arrows (visible on hover/touches) */}
            {galleryItems.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-opacity"
                  title="Image précédente"
                  type="button"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-opacity"
                  title="Image suivante"
                  type="button"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {/* Pagination Bullet Indicators inside Large Image bottom */}
            {galleryItems.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {galleryItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActiveImageIdx(i); }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      safeActiveIdx === i ? 'bg-white w-4' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Text details for Product on bottom overlay */}
            {activeItem?.type === 'product' && (
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest font-mono">Contenu inclus dans le kit</p>
                <p className="text-xs font-extrabold mt-0.5 truncate drop-shadow-sm">{activeItem.title}</p>
                {activeItem.quantity && activeItem.quantity > 1 && (
                  <span className="inline-block mt-1 bg-amber-500 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Quantité incluse : {activeItem.quantity}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Integrated Thumbnails list including both general kit and product images */}
          {galleryItems.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1.5 scrollbar-thin">
              {galleryItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                    safeActiveIdx === idx ? 'ring-2 ring-[#0D47FF] border-transparent scale-95 shadow-sm' : 'border-slate-200 opacity-65 hover:opacity-100'
                  }`}
                >
                  <img src={item.url} alt={`Miniature ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  
                  {/* Subtle indicators for products thumbnails */}
                  {item.type === 'product' && (
                    <span className="absolute bottom-0.5 right-0.5 bg-[#0D47FF] text-white text-[8px] font-mono font-black px-1 rounded shadow-sm border border-blue-400/20 leading-none py-0.5">
                      x{item.quantity || 1}
                    </span>
                  )}
                  {item.type === 'product' && (
                    <span className="absolute top-0.5 left-0.5 bg-amber-500 text-white p-0.5 rounded-full shadow-sm">
                      <ShoppingBag className="w-2 h-2 text-slate-950" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Quick Stats Block inside gallery card */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-blue-50/40 hover:bg-blue-50/70 p-2.5 rounded-xl border border-blue-100/30 transition-all">
              <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Acompte</span>
              <span className="font-extrabold text-[#0D47FF] font-mono text-xs">{kit.dailyAmount} / jour</span>
            </div>
            <div className="bg-emerald-50/40 hover:bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100/30 transition-all">
              <span className="text-slate-400 font-bold block text-[9px] uppercase tracking-wider">Valeur Totale</span>
              <span className="font-extrabold text-emerald-600 font-mono text-xs">{kit.totalValue || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Included Products List */}
        <div className="mt-5 bg-white rounded-2.5xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <div className="w-1.5 h-4.5 bg-[#0D47FF] rounded-full" />
            <h3 className="font-display font-extrabold text-[#111] text-sm uppercase tracking-wide">
              Produits Inclus dans le Pack
            </h3>
          </div>

          {uniqueProducts.length > 0 ? (
            <div className="space-y-3">
              {uniqueProducts.map((prod, idx) => {
                const matched = (products || []).find(p => p.name.trim().toLowerCase() === prod.trim().toLowerCase());
                const count = productCounts[prod] || 1;
                return (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50/50 hover:bg-blue-50/20 p-2.5 rounded-xl border border-slate-100/50 transition-colors">
                    {/* Image thumbnail or number bubble */}
                    {matched && matched.image ? (
                      <div className="w-10 h-10 rounded-lg border overflow-hidden bg-white shrink-0 flex items-center justify-center">
                        <img src={matched.image} alt={prod} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg border bg-blue-50/50 text-[#0D47FF] flex items-center justify-center text-[10px] font-black shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    
                    <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-slate-800 font-semibold leading-tight block">{prod}</span>
                        {matched?.subcategory && (
                          <span className="text-[9px] text-slate-400 font-mono font-medium tracking-wide block mt-0.5 uppercase">
                            {matched.category} • {matched.subcategory}
                          </span>
                        )}
                      </div>
                      {count > 1 && (
                        <span className="bg-blue-50 text-[#0D47FF] border border-blue-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono shrink-0">
                          × {count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Aucun produit listé dans ce pack.</p>
          )}
        </div>

        {/* Delivery / Terms details Block */}
        <div className="mt-5 bg-slate-100/80 border border-slate-200/55 rounded-2.5xl p-5 space-y-3.5">
          
          <div className="flex gap-3">
            <Truck className="w-4.5 h-4.5 text-[#0D47FF] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase text-slate-800 tracking-wider">
                Informations de Livraison
              </span>
              <p className="text-xs text-slate-600 mt-1 leading-[1.4]">
                {kit.deliveryInfo || "Livraison gratuite programmée en Décembre."}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/55 pt-3 flex gap-3">
            <Calendar className="w-4.5 h-4.5 text-[#0D47FF] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase text-slate-800 tracking-wider">
                Souscription Simple & Sans Stress
              </span>
              <p className="text-xs text-slate-600 mt-0.5 leading-[1.4]">
                Validez le pack aujourd'hui. Un agent vous contacte pour officialiser et bloquer vos produits avant rupture de stock d'année.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Bottom Action CTA "Choisir ce Kit" */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100/90 py-3.5 px-4 shadow-lg z-35">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          
          <div className="flex flex-col justify-center min-w-0 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Acompte Journalier</span>
            <span className="text-md font-black text-[#0D47FF] font-mono mt-1.5 leading-none">{kit.dailyAmount}</span>
          </div>

          <button
            id="choose_kit_cta"
            onClick={onChooseKit}
            className="flex-1 bg-gradient-to-r from-blue-650 via-blue-600 to-[#0D47FF] hover:from-blue-700 hover:to-[#0935cc] text-white font-display font-extrabold text-sm py-4.5 px-5 rounded-xl shadow-lg shadow-blue-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span>Choisir ce Kit</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>

        </div>
      </div>

    </div>
  );
}
