import React from 'react';
import {
  Phone,
  MessageCircle,
  Truck,
  ShieldCheck,
  Banknote,
  MapPin,
  Clock,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const {
    settings,
    categories,
    setSelectedCategory,
    currentUser,
    setIsAuthModalOpen,
    setIsCustomerProfileOpen,
  } = useStore();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-14 pb-8 border-t border-stone-800 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Story */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg">
                أ
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{settings.storeName}</h3>
                <span className="text-xs text-amber-400 font-medium">
                  عالم أواني الطهي والمطبخ العصري
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              متجركم المغربي المفضل المتخصص في استيراد وتوزيع أجود أواني المطبخ الإينوكس، طناجر الضغط، الإيرفراير، طواقم الشاي والمائدة مع خدمة التوصيل السريع لجميع ربوع المملكة.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="flex items-center gap-1.5 text-xs text-stone-300">
                <Truck className="w-4 h-4 text-emerald-400" />
                توصيل 24/48 ساعة
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-300">
                <Banknote className="w-4 h-4 text-amber-400" />
                الدفع عند الاستلام
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 pb-2 border-b border-stone-800">
              أقسام الأواني
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(c.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Shipping & Delivery Reassurance */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 pb-2 border-b border-stone-800">
              التوصيل لجميع المدن
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  الدار البيضاء، الرباط، طنجة، مراكش، فاس، أكادير، مكناس، وجدة، وكافة أقاليم المملكة.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>التوصيل يتم بين 24 و 48 ساعة من تأكيد الطلب.</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>حق المعاينة والتأكد من السلعة قبل الدفع للموزع.</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 pb-2 border-b border-stone-800">
              تواصل معنا
            </h4>
            <div className="space-y-3 text-xs">
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 font-bold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب مباشر: {settings.whatsappNumber}</span>
              </a>

              <div className="flex items-center gap-2.5 text-stone-300">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>مصلحة الزبناء: {settings.storePhone}</span>
              </div>

              <div className="pt-2 text-[11px] text-stone-500">
                <span>ساعات العمل: يومياً من 09:00 إلى 21:00</span>
              </div>
            </div>
          </div>
        </div>


        {/* Bottom copyright */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} {settings.storeName}. صُمم خصيصاً للمطبخ المغربي.
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>توصيل سريع</span>
            <span>·</span>
            <span>ضمان أصالة المنتجات</span>
            <span>·</span>
            <span>دفع نقدي آمن عند الباب</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
