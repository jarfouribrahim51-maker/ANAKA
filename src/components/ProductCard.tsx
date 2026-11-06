import React, { useState } from 'react';
import { ShoppingBag, Star, Eye, MessageCircle, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct, settings } = useStore();
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `السلام عليكم متجر ${settings.storeName}، بغيت نطلب هذا المنتج:\n\n*${product.name}*\nالثمن: ${product.price} ${settings.currency}\nالرابط: ${window.location.origin}\n\nعافاك عطيوني معلومات التوصيل والدفع عند الاستلام.`;
    window.open(
      `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Product Image Area */}
      <div className="relative aspect-4/3 bg-stone-100 overflow-hidden flex items-center justify-center">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-stone-100 to-amber-50 text-stone-400">
            <ShoppingBag className="w-10 h-10 mb-2 text-stone-300" />
            <span className="text-xs text-stone-500 font-medium text-center">
              {product.name}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 rounded-lg shadow-sm">
              {product.badge}
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
              وفر {product.originalPrice - product.price} DH
            </span>
          )}
        </div>

        {/* Quick View Floating Hint */}
        <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 bg-white/90 text-stone-900 text-xs font-semibold rounded-lg shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5" />
            معاينة التفاصيل
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between text-right">
        <div>
          {/* Rating & Stock metadata */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="tabular-nums">{product.rating}</span>
              <span className="text-stone-400 font-normal">
                ({product.reviewsCount})
              </span>
            </div>
            <span
              className={`text-[11px] font-medium ${
                product.inStock ? 'text-emerald-600' : 'text-stone-400'
              }`}
            >
              {product.inStock ? 'متوفر بالمخزون' : 'نفذت الكمية'}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-black text-amber-600 tabular-nums">
                {product.price}
              </span>
              <span className="text-xs font-bold text-amber-700">
                {settings.currency}
              </span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                {product.originalPrice} {settings.currency}
              </span>
            )}
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : product.inStock
                  ? 'bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-xs'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تمت الإضافة!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>أضف للسلة</span>
                </>
              )}
            </button>

            <button
              onClick={handleWhatsAppOrder}
              className="py-2 px-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
              title="اطلب مباشرة عبر واتساب"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>طلب بالواتساب</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
