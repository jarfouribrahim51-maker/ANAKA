import React from 'react';
import { Truck, ShieldCheck, Banknote, Sparkles, ArrowDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory } = useStore();

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-stone-900 text-white">
      {/* Background Image with warm Moroccan Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_moroccan_kitchen_1793710811978.jpg"
          alt="مطبخ مغربي أصيل مجهز بأرقى الأواني"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Measured gradient scrim for high legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-900/40 lg:bg-gradient-to-r lg:from-stone-950/95 lg:via-stone-950/80 lg:to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
        <div className="max-w-2xl text-right">
          {/* Subtle text badge */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-300 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>متجر الأواني ومستلزمات المطبخ رقم 1 بالمغرب</span>
            <span aria-hidden="true">·</span>
            <span>جودة وضمان حقيقي</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5">
            أواني الطهي ومستلزمات المائدة التي يستحقها بيتك المغربي
          </h2>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed mb-8 max-w-xl font-normal">
            كوكوط إينوكس أصلية، قلايات هوائية صحية Air Fryer، أطقم كؤوس شاي راقية،
            وأحدث أجهزة المطبخ الكهربائية مع التوصيل السريع لجميع مدن وقرى المغرب
            والدفع عند الاستلام.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
            <button
              onClick={scrollToProducts}
              className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>تسوق الآن</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSelectedCategory('cookware');
                scrollToProducts();
              }}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all"
            >
              طناجر الضغط والكوكوط
            </button>

            <button
              onClick={() => {
                setSelectedCategory('airfryer');
                scrollToProducts();
              }}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all"
            >
              الإير فراير
            </button>
          </div>

          {/* Trust Guarantees Strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-white/15">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-bold text-white">الدفع عند الاستلام</p>
                <p className="text-[11px] text-stone-300 hidden sm:block">خلص حتى تشوف السلعة</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-bold text-white">توصيل 24/48 ساعة</p>
                <p className="text-[11px] text-stone-300 hidden sm:block">لجميع مدن المغرب</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-bold text-white">ضمان الجودة 100%</p>
                <p className="text-[11px] text-stone-300 hidden sm:block">إرجاع واستبدال سلس</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
