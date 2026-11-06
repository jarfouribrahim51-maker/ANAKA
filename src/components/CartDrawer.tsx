import React from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    settings,
    setIsCheckoutOpen,
  } = useStore();

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingPercent = Math.min(
    100,
    Math.round((cartSubtotal / freeShippingThreshold) * 100)
  );

  const estimatedShipping =
    cartSubtotal >= freeShippingThreshold || cartSubtotal === 0
      ? 0
      : settings.standardShippingFee;
  const estimatedTotal = cartSubtotal + estimatedShipping;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/50 backdrop-blur-xs flex justify-start">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-right animate-in slide-in-from-right duration-300 border-l border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-stone-900">سلة المشتريات</h2>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              {cart.length} منتجات
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="إغلاق السلة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        {cart.length > 0 && (
          <div className="bg-amber-50/70 p-3 sm:px-5 border-b border-amber-200/50">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1.5">
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-amber-600" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    مبروك! استفدت من التوصيل المجاني
                  </span>
                ) : (
                  <span>
                    أضف <strong className="text-amber-800">{remainingForFreeShipping} {settings.currency}</strong> واستفد من التوصيل بالمجان!
                  </span>
                )}
              </span>
              <span className="tabular-nums font-bold text-amber-800">
                {freeShippingPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  remainingForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-amber-600'
                }`}
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-300">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-bold text-stone-700 mb-1">
                سلة التسوق فارغة حالياً
              </p>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                تصفح أقسام الأواني وأضف أفضل العروض لكوكوط، إير فراير، طواقم الشاي والمائدة.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-200 overflow-hidden shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate mb-1">
                    {item.product.name}
                  </h4>
                  <div className="text-xs font-bold text-amber-700 tabular-nums mb-2">
                    {item.product.price} {settings.currency}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-stone-100 rounded text-stone-600"
                        aria-label="إنقاص الكمية"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-stone-100 rounded text-stone-600"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="حذف المنتج من السلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout button */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3">
            {/* Calculation rows */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>مجموع المنتجات:</span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {cartSubtotal} {settings.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>مصاريف التوصيل:</span>
                <span className="font-bold tabular-nums">
                  {estimatedShipping === 0 ? (
                    <span className="text-emerald-600 font-black">مجاناً 🚚</span>
                  ) : (
                    `${estimatedShipping} ${settings.currency}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-100">
                <span>المجموع النهائي:</span>
                <span className="text-amber-700 tabular-nums text-base">
                  {estimatedTotal} {settings.currency}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>متابعة الطلب والدفع عند الاستلام</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-stone-400 text-center">
              الدفع نقداً عند استلام طلبيتك وفحصها بالكامل
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
