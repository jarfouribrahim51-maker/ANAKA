import React from 'react';
import {
  CheckCircle2,
  PackageCheck,
  MessageCircle,
  Truck,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrderSuccessModal: React.FC = () => {
  const { lastCreatedOrder, setLastCreatedOrder, settings } = useStore();

  if (!lastCreatedOrder) return null;

  const handleWhatsAppFollowup = () => {
    const text = `السلام عليكم متجر ${settings.storeName}، بغيت نتبع الطلب ديالي رقم *${lastCreatedOrder.orderNumber}* اللي درتو دابا. شكراً!`;
    window.open(
      `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 text-right animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-black text-stone-900 text-center mb-1">
          تم تسجيل طلبك بنجاح! 🎉
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 text-center mb-6">
          شكراً لثقتك في متجر {settings.storeName}. سنتصل بك قريباً لتأكيد موعد التسليم.
        </p>

        {/* Order Details Card */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 mb-6 space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500">رقم الطلب:</span>
            <span className="font-mono font-bold text-amber-700 text-sm">
              {lastCreatedOrder.orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500">اسم المستلم:</span>
            <span className="font-bold text-stone-900">
              {lastCreatedOrder.customerName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500">المدينة والعنوان:</span>
            <span className="font-medium text-stone-800 text-left truncate max-w-[220px]">
              {lastCreatedOrder.customerCity} - {lastCreatedOrder.customerAddress}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500">عدد المنتجات:</span>
            <span className="font-bold text-stone-900">
              {lastCreatedOrder.items.length} قطع
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-stone-200 text-sm font-black">
            <span className="text-stone-900">المجموع الواجب دفعه عند الاستلام:</span>
            <span className="text-amber-700 tabular-nums">
              {lastCreatedOrder.total} {settings.currency}
            </span>
          </div>
        </div>

        {/* Steps forward */}
        <div className="space-y-2.5 mb-6 text-xs text-stone-600 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/50">
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-600 shrink-0" />
            <span>سيتصل بك موظف خدمة الزبناء هاتفياً لتأكيد العنوان وموعد التوصيل.</span>
          </p>
          <p className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>التوصيل يتم خلال 24 إلى 48 ساعة بواسطة شركة التوصيل السريع.</span>
          </p>
          <p className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>يمكنك فتح الطرد ومعاينة الأواني قبل دفع المبلغ للموزع.</span>
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleWhatsAppFollowup}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>متابعة الطلب عبر واتساب الآن</span>
          </button>

          <button
            onClick={() => setLastCreatedOrder(null)}
            className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>العودة ومواصلة التسوق</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
