import React, { useMemo, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SupabaseModal } from './components/admin/SupabaseModal';
import { AuthModal } from './components/auth/AuthModal';
import { CustomerProfileModal } from './components/auth/CustomerProfileModal';
import { Footer } from './components/Footer';
import {
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  ShieldCheck,
  Truck,
  RotateCcw,
  Banknote,
  ChefHat,
} from 'lucide-react';

const StoreContent: React.FC = () => {
  const {
    activeView,
    products,
    selectedCategory,
    categories,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    isSupabaseModalOpen,
    setIsSupabaseModalOpen,
    syncFromSupabase,
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Filtered & Sorted Products
  const visibleProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Search query filter: Comprehensive search across name, description, features, colors and categories
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const cat = categories.find((c) => c.id === p.category);
        const catName = cat ? `${cat.name} ${cat.shortName}`.toLowerCase() : '';
        const inFeatures = p.features && p.features.some((f) => f.toLowerCase().includes(q));
        const inColors = p.colors && p.colors.some((c) => c.toLowerCase().includes(q));
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          catName.includes(q) ||
          Boolean(inFeatures) ||
          Boolean(inColors)
        );
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const currentCategoryInfo = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {activeView === 'admin' ? (
        <main className="flex-1">
          <AdminDashboard />
        </main>
      ) : (
        <main className="flex-1">
          <HeroBanner />
          <CategoryBar />

          {/* Products Grid Section */}
          <section id="products-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Section Header & Sort Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedCategory === 'all'
                      ? 'جميع الأواني ومستلزمات المطبخ'
                      : currentCategoryInfo?.name || 'قسم المنتجات'}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
                  {selectedCategory === 'all'
                    ? 'أفضل العروض والمنتجات الأكثر طلباً'
                    : currentCategoryInfo?.name}
                </h3>
                {currentCategoryInfo?.description && selectedCategory !== 'all' && (
                  <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
                    {currentCategoryInfo.description}
                  </p>
                )}
              </div>

              {/* Sorting & Result Count */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500 font-medium whitespace-nowrap">
                  عرض <strong className="text-stone-900 font-bold">{visibleProducts.length}</strong> منتج
                </span>

                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="featured">الأكثر طلباً ومميزاً</option>
                    <option value="price-asc">الثمن: من الأقل للأعلى</option>
                    <option value="price-desc">الثمن: من الأعلى للأقل</option>
                    <option value="rating">الأعلى تقييماً</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search feedback chip if searching */}
            {searchQuery && (
              <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span>
                  نتائج البحث عن: <strong className="text-amber-900">"{searchQuery}"</strong> ({visibleProducts.length} نتيجة)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="font-bold text-amber-800 hover:text-amber-950 underline"
                >
                  مسح البحث
                </button>
              </div>
            )}

            {/* Product Grid */}
            {visibleProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-stone-900 mb-1">
                  لم نجد أي منتج يطابق اختيارك
                </h4>
                <p className="text-xs text-stone-500 mb-6">
                  جرب البحث بكلمة أخرى مثل "كوكوط"، "إير فراير"، أو اختر قسماً آخر من شريط الأقسام أعلاه.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  عرض جميع الأواني
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>

          {/* Quality & Trust Pillars */}
          <section className="bg-white py-16 border-y border-stone-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                  ثقة وأصالة
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 mb-3">
                  علاش الآلاف من العائلات المغربية كيختارو دار الأواني؟
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                  كنوفرو ليك أحسن ما كاين فالسوق مع التزام كامل بالجودة والتوصيل لجميع المدن المغربية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-right">
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-base">الدفع عند الاستلام</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    ما كتخلص حتى كتوصلك الطلبية لدارك، وتفتح الطرد وتفحص الأواني ديالك كاملين.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-base">توصيل سريع 24/48 ساعة</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    كنشحنوا لجميع مدن المغرب وقراها، مع تتبع مستمر لطلبيتك حتى توصلك.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-base">إينوكس وجودة أصلية</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    أواني مصنوعة من الفولاذ الصحي 18/10 المقاوم للصدأ وطبقات جرانيت ألمانية غير لاصقة.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-stone-900 text-base">إرجاع واستبدال مضمون</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    في حالة وجود أي عيب مصنعي، كنوفرو ليك استبدال فوري أو استرجاع المبلغ بكل أريحية.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      <Footer />

      {/* Global Interactive Modals & Floating Buttons */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <AuthModal />
      <CustomerProfileModal />
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectedSuccess={syncFromSupabase}
      />
      <WhatsAppFloat />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
