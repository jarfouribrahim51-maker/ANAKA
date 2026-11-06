import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Banknote,
  Phone,
  User,
  MapPin,
  FileText,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MOROCCAN_CITIES } from '../data/initialData';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    settings,
    createOrder,
    currentUser,
  } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerCity, setCustomerCity] = useState(MOROCCAN_CITIES[0]);
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isCheckoutOpen) return null;

  const isFreeShipping = cartSubtotal >= settings.freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : settings.standardShippingFee;
  const grandTotal = cartSubtotal + shippingFee;

  const validateForm = () => {
    if (!customerName.trim()) {
      setFormError('يرجى إدخال الاسم الكامل');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setFormError('يرجى إدخال رقم هاتف صحيح للتواصل والتوصيل');
      return false;
    }
    if (!customerAddress.trim()) {
      setFormError('يرجى إدخال العنوان الدقيق (الحي، الشارع، أو الإقامة)');
      return false;
    }
    setFormError('');
    return true;
  };

  // 1. Direct WhatsApp Confirmation
  const handleConfirmViaWhatsApp = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Create order locally in admin orders list
    const order = createOrder({
      customerName,
      customerPhone,
      customerCity,
      customerAddress,
      notes,
      customerEmail: customerEmail.trim() || undefined,
    });

    // Format WhatsApp Message in clean Darija/Arabic
    const itemsListText = order.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}*\n   الكمية: ${it.quantity} | الثمن: ${
            it.price * it.quantity
          } ${settings.currency}`
      )
      .join('\n');

    const message = `السلام عليكم ورحمة الله،
أريد تأكيد طلبي من متجر *${settings.storeName}*:

📦 *رقم الطلب:* ${order.orderNumber}
---------------------------
🛒 *تفاصيل السلة:*
${itemsListText}

💰 *مجموع المشتريات:* ${order.subtotal} ${settings.currency}
🚚 *مصاريف التوصيل:* ${
      order.shippingFee === 0 ? 'مجاناً (0 DH)' : `${order.shippingFee} ${settings.currency}`
    }
💵 *المجموع الإجمالي الواجب دفعه:* *${order.total} ${settings.currency}*
---------------------------
👤 *معلومات الزبون والتوصيل:*
- *الاسم الكامل:* ${customerName}
- *رقم الهاتف:* ${customerPhone}
- *المدينة:* ${customerCity}
- *العنوان:* ${customerAddress}
${notes ? `- *ملاحظات الإرسال:* ${notes}\n` : ''}
طريقة الدفع: الدفع نقداً عند الاستلام (COD)
شكراً لكم، في انتظار مكالمتكم لتأكيد موعد التسليم.`;

    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${
      settings.whatsappNumber
    }?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsSubmitting(false);
  };

  // 2. Standard Web COD Confirmation
  const handleConfirmOnWebsite = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    createOrder({
      customerName,
      customerPhone,
      customerCity,
      customerAddress,
      notes,
      customerEmail: customerEmail.trim() || undefined,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">تأكيد الطلب والتوصيل السريع</h3>
              <p className="text-xs text-stone-300">
                الدفع نقداً عند الاستلام بعد معاينة طلبيتك
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-full text-stone-300 transition-colors"
            aria-label="إغلاق نافذة الطلب"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {formError}
            </div>
          )}

          {/* Customer info fields */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              <span>معلومات المستلم</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الاسم الكامل *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد العلوي"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  رقم الهاتف (للاتصال والتوصيل) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="06 XX XX XX XX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-right focus:bg-white focus:border-amber-600 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  المدينة *
                </label>
                <select
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 focus:outline-none cursor-pointer"
                >
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  عنوان التوصيل بالتفصيل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="الحي، اسم الشارع، رقم المنزل أو الإقامة"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:border-amber-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ملاحظات إضافية للموزع (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: يرجى التوصيل في المساء أو الاتصال قبل القدوم"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Order Summary box */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
            <h4 className="text-xs font-bold text-stone-800 flex items-center justify-between">
              <span>ملخص الطلبية ({cart.length} منتجات)</span>
              <span className="text-amber-700 font-bold tabular-nums">
                {cartSubtotal} {settings.currency}
              </span>
            </h4>

            <div className="max-h-28 overflow-y-auto space-y-1.5 text-xs text-stone-600 pr-1">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between"
                >
                  <span className="truncate max-w-[280px]">
                    {item.product.name} (x{item.quantity})
                  </span>
                  <span className="tabular-nums font-semibold">
                    {item.product.price * item.quantity} {settings.currency}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>مصاريف التوصيل لـ {customerCity.split(' ')[0]}:</span>
                <span className="font-bold tabular-nums">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">مجاناً (0 DH)</span>
                  ) : (
                    `${shippingFee} ${settings.currency}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 pt-1">
                <span>المجموع النهائي:</span>
                <span className="text-amber-700 tabular-nums">
                  {grandTotal} {settings.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Reassurance badge */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
            <Banknote className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="font-bold">الدفع عند الاستلام (Paiement à la livraison)</p>
              <p className="text-[11px] text-amber-800">
                لن تدفع أي درهم حتى تصلك السلعة إلى باب منزلك وتتأكد من جودتها ومطابقتها.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            {/* Primary: Confirm via WhatsApp */}
            <button
              onClick={handleConfirmViaWhatsApp}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>تأكيد الطلب وإرسال التفاصيل عبر واتساب 💬</span>
            </button>

            {/* Secondary: Confirm on Site */}
            <button
              onClick={handleConfirmOnWebsite}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>تأكيد الطلب مباشرة في الموقع (بدون واتساب)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
