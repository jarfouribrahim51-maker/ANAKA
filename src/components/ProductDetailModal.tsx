import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Minus,
  Star,
  Banknote,
  Palette,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, settings } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'features' | 'shipping'>('features');

  // Reset active image & color when product changes
  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      setQuantity(1);
      if (selectedProduct.colors && selectedProduct.colors.length > 0) {
        setSelectedColor(selectedProduct.colors[0]);
      } else {
        setSelectedColor('');
      }
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const allImages =
    selectedProduct.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : [selectedProduct.image];

  const currentDisplayImage = allImages[activeImageIndex] || selectedProduct.image;

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, selectedColor);
    setSelectedProduct(null);
  };

  const handleDirectWhatsApp = () => {
    const colorText = selectedColor ? `\n*اللون المختار:* ${selectedColor}` : '';
    const text = `السلام عليكم متجر ${settings.storeName}، بغيت نأكد طلب هذا المنتج:\n\n*المنتج:* ${selectedProduct.name}${colorText}\n*الكمية:* ${quantity}\n*الثمن الإجمالي:* ${selectedProduct.price * quantity} ${settings.currency}\n\nعافاك بغيت معلومات التوصيل والدفع عند الاستلام.`;
    window.open(
      `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 left-4 z-20 p-2 bg-white/90 hover:bg-stone-100 rounded-full text-stone-600 transition-colors shadow-sm"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Column with Gallery Thumbnails */}
          <div className="relative bg-stone-100 min-h-[340px] md:min-h-[480px] flex flex-col justify-between p-4 overflow-hidden">
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-stone-200 flex items-center justify-center">
              <img
                src={currentDisplayImage}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
              />

              {selectedProduct.badge && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-3 py-1 text-xs font-bold text-white bg-amber-600 rounded-lg shadow-sm">
                    {selectedProduct.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Multiple Images Gallery Thumbnails (Without deleting old ones) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-amber-600 shadow-sm scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${selectedProduct.name} - صورة ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Reviews and Stock */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="tabular-nums">{selectedProduct.rating}</span>
                  <span className="text-stone-400">
                    ({selectedProduct.reviewsCount} تقييم زبون حقيقي)
                  </span>
                </div>
                <span
                  className={`font-semibold ${
                    selectedProduct.inStock ? 'text-emerald-600' : 'text-stone-400'
                  }`}
                >
                  {selectedProduct.inStock
                    ? `متوفر بالمخزون (${selectedProduct.stockQuantity} قطعة)`
                    : 'نفذت الكمية'}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug mb-3">
                {selectedProduct.name}
              </h2>

              {/* Pricing Box */}
              <div className="flex items-baseline gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-700 tabular-nums">
                    {selectedProduct.price}
                  </span>
                  <span className="text-sm font-bold text-amber-800">
                    {settings.currency}
                  </span>
                </div>
                {selectedProduct.originalPrice &&
                  selectedProduct.originalPrice > selectedProduct.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-400 line-through tabular-nums">
                        {selectedProduct.originalPrice} {settings.currency}
                      </span>
                      <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        توفير {selectedProduct.originalPrice - selectedProduct.price} DH
                      </span>
                    </div>
                  )}
              </div>

              {/* Color Variants Selection */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="mb-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-600" />
                    <span>اللون المتاح: {selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedColor === color
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white text-stone-700 border border-stone-200 hover:border-amber-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-stone-200 mb-4 gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('features')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === 'features'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  المميزات والمواصفات
                </button>
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === 'desc'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  الوصف الكامل
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === 'shipping'
                      ? 'border-amber-600 text-amber-700'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  التوصيل والضمان
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[110px] mb-6 text-sm text-stone-700 leading-relaxed">
                {activeTab === 'features' && (
                  <ul className="space-y-2">
                    {selectedProduct.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm">{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'desc' && (
                  <p className="text-xs sm:text-sm leading-relaxed text-stone-600">
                    {selectedProduct.description}
                  </p>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-2.5 text-xs text-stone-600">
                    <p className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>التوصيل لجميع المدن المغربية خلال 24 إلى 48 ساعة فقط.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>الدفع نقداً عند الاستلام بعد معاينة وفحص المنتج.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>ضمان حقيقي وإمكانية الاستبدال أو الإرجاع في حالة أي عيب مصنعي.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & CTAs */}
            <div className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-stone-700">الكمية المطلوبة:</span>
                <div className="flex items-center gap-2 border border-stone-300 rounded-xl p-1 bg-stone-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 hover:bg-white rounded-lg text-stone-600"
                    aria-label="إنقاص الكمية"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 hover:bg-white rounded-lg text-stone-600"
                    aria-label="زيادة الكمية"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedProduct.inStock}
                  className="py-3 px-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة إلى السلة ({selectedProduct.price * quantity} DH)</span>
                </button>

                <button
                  onClick={handleDirectWhatsApp}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>شراء فوري عبر واتساب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
