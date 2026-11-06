import React, { useState } from 'react';
import {
  ShoppingBag,
  Package,
  Users,
  Image as ImageIcon,
  Tag,
  Bell,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Phone,
  MessageCircle,
  Eye,
  Check,
  AlertTriangle,
  RotateCcw,
  Save,
  X,
  Search,
  Database,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Palette,
  CheckCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OrderStatus, Product } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminLoggedIn,
    login,
    logout,
    products,
    categories,
    orders,
    customers,
    notifications,
    unreadNotificationsCount,
    adminCredentials,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateSettings,
    updateAdminCredentials,
    resetPassword,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    resetToDefaults,
    setActiveView,
    isSupabaseConfigured,
    setIsSupabaseModalOpen,
  } = useStore();

  // Active Admin Card Tab (7 distinct organized sections)
  const [activeTab, setActiveTab] = useState<
    'products' | 'orders' | 'customers' | 'gallery' | 'pricing' | 'notifications' | 'settings'
  >('orders');

  // Fallback direct login form if reached directly
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Delete confirmation modal state to prevent accidental deletes
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    image: string;
    imagesList: string[];
    newImageUrlInput: string;
    colorsText: string;
    description: string;
    featuresText: string;
    stockQuantity: number;
    inStock: boolean;
    badge: string;
  }>({
    name: '',
    category: categories[0]?.id || 'cookware',
    price: 300,
    originalPrice: 400,
    image: '',
    imagesList: [],
    newImageUrlInput: '',
    colorsText: '',
    description: '',
    featuresText: '',
    stockQuantity: 20,
    inStock: true,
    badge: '',
  });


  // Admin Account Security Form
  const [currentPass, setCurrentPass] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [securityStatus, setSecurityStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Filters & searches
  const [adminOrderFilter, setAdminOrderFilter] = useState<string>('all');
  const [adminProductSearch, setAdminProductSearch] = useState<string>('');
  const [adminCustomerSearch, setAdminCustomerSearch] = useState<string>('');

  // 1. If not logged in as Admin, show Secure Admin Gateway
  if (!isAdminLoggedIn) {
    const handleAdminLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const res = login(adminEmailInput, adminPassInput);
      if (!res.success || res.role !== 'admin') {
        setLoginError('بيانات الدخول غير صحيحة، أو أن الحساب ليس لديه صلاحيات الإدارة.');
      } else {
        setLoginError('');
      }
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 text-right">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl max-w-md w-full p-6 sm:p-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-4 font-black text-xl shadow-sm">
            أ
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 text-center mb-1">
            تسجيل دخول الإدارة
          </h2>
          <p className="text-xs text-stone-500 text-center mb-6">
            أدخل بريد المدير الإلكتروني وكلمة المرور للمتابعة
          </p>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                البريد الإلكتروني (Gmail)
              </label>
              <input
                type="email"
                required
                dir="ltr"
                placeholder={adminCredentials.email}
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none text-left"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                dir="ltr"
                placeholder="••••••••"
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-600 focus:outline-none text-left"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              تسجيل الدخول
            </button>

            <button
              type="button"
              onClick={() => setActiveView('store')}
              className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-semibold text-center"
            >
              الرجوع لتصفح المتجر
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin calculations
  const totalSales = orders.reduce((sum, ord) => sum + ord.total, 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  // Open modal to add new product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories[0]?.id || 'cookware',
      price: 290,
      originalPrice: 390,
      image: '/src/assets/images/product_cocotte_cooker_1793710812745.jpg',
      imagesList: ['/src/assets/images/product_cocotte_cooker_1793710812745.jpg'],
      newImageUrlInput: '',
      colorsText: 'إينوكس فضي\nأسود غير لامع\nنحاسي ملكي',
      description: 'وصف ومميزات المنتج بالتفصيل...',
      featuresText: 'مصنوع من خامات عالية الجودة\nسهل التنظيف والاستعمال\nضمان الجودة والمتانة',
      stockQuantity: 20,
      inStock: true,
      badge: 'جديد',
    });
    setIsProductModalOpen(true);
  };

  // Open modal to edit existing product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const initialImgs = prod.images && prod.images.length > 0 ? prod.images : [prod.image];
    const colors = prod.colors ? prod.colors.join('\n') : '';
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      image: prod.image,
      imagesList: initialImgs,
      newImageUrlInput: '',
      colorsText: colors,
      description: prod.description,
      featuresText: prod.features.join('\n'),
      stockQuantity: prod.stockQuantity,
      inStock: prod.inStock,
      badge: prod.badge || '',
    });
    setIsProductModalOpen(true);
  };

  // Add a new image to the product's image list
  const handleAddImageToProduct = () => {
    const url = productForm.newImageUrlInput.trim();
    if (!url) return;
    if (productForm.imagesList.includes(url)) return;
    setProductForm((prev) => ({
      ...prev,
      imagesList: [...prev.imagesList, url],
      newImageUrlInput: '',
      // If primary image was empty, set it
      image: prev.image || url,
    }));
  };

  // Delete a specific image from product without deleting the others
  const handleDeleteImageFromProduct = (indexToRemove: number) => {
    if (productForm.imagesList.length <= 1) {
      alert('يجب أن يحتوي المنتج على صورة واحدة على الأقل.');
      return;
    }
    const filtered = productForm.imagesList.filter((_, idx) => idx !== indexToRemove);
    setProductForm((prev) => ({
      ...prev,
      imagesList: filtered,
      // If the deleted image was primary, pick the first available
      image: filtered[0] || '',
    }));
  };

  // Save product (Add or Edit with multiple images support)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const features = productForm.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const colors = productForm.colorsText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    const finalImages = productForm.imagesList.filter(Boolean);
    const primaryImg = productForm.image.trim() || finalImages[0] || '/src/assets/images/product_cocotte_cooker_1793710812745.jpg';

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        image: primaryImg,
        images: finalImages,
        colors: colors.length > 0 ? colors : undefined,
        description: productForm.description,
        features: features.length > 0 ? features : editingProduct.features,
        stockQuantity: Number(productForm.stockQuantity),
        inStock: Number(productForm.stockQuantity) > 0 ? productForm.inStock : false,
        badge: productForm.badge,
      });
    } else {
      addProduct({
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        image: primaryImg,
        images: finalImages,
        colors: colors.length > 0 ? colors : undefined,
        description: productForm.description,
        features,
        stockQuantity: Number(productForm.stockQuantity),
        inStock: productForm.inStock,
        rating: 5.0,
        reviewsCount: 1,
        badge: productForm.badge,
      });
    }

    setIsProductModalOpen(false);
  };

  // Save Store Settings
  const handleSaveSettings = (e: React.FormEvent) => {

    e.preventDefault();
    updateSettings({
      ...settingsForm,
      freeShippingThreshold: Number(settingsForm.freeShippingThreshold),
      standardShippingFee: Number(settingsForm.standardShippingFee),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Update Admin Credentials (Gmail & Password)
  const handleUpdateAdminSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityStatus(null);

    if (newAdminPass && newAdminPass !== confirmAdminPass) {
      setSecurityStatus({
        success: false,
        message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين.',
      });
      return;
    }

    const emailToUse = newAdminEmail.trim() || adminCredentials.email;
    const passToUse = newAdminPass.trim() || adminCredentials.password;

    const res = updateAdminCredentials(currentPass, emailToUse, passToUse);
    setSecurityStatus(res);

    if (res.success) {
      setCurrentPass('');
      setNewAdminPass('');
      setConfirmAdminPass('');
      setNewAdminEmail('');
    }
  };

  // Filtered orders & products
  const filteredOrders =
    adminOrderFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === adminOrderFilter);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(adminProductSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(adminCustomerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(adminCustomerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(adminCustomerSearch))
  );

  // Extract all gallery photos across all products
  const allGalleryImages = Array.from(
    new Set(
      products.flatMap((p) => [p.image, ...(p.images || [])]).filter(Boolean)
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right">
      {/* Top Admin Bar */}
      <div className="bg-stone-900 text-white rounded-3xl p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center font-bold text-xl">
            أ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">{settings.storeName}</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                لوحة الإدارة
              </span>
            </div>
            <p className="text-xs text-stone-400">
              حساب المدير: <span className="font-mono text-amber-300" dir="ltr">{adminCredentials.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('store')}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>عرض المتجر</span>
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* 7 Big Card Navigation Tabs as requested by user */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {/* 1. المنتجات */}
        <button
          onClick={() => setActiveTab('products')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            activeTab === 'products'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-bold tabular-nums">
              {products.length}
            </span>
          </div>
          <div>
            <h4 className="font-black text-sm">1. المنتجات</h4>
            <span className={`text-[11px] ${activeTab === 'products' ? 'text-amber-100' : 'text-stone-400'}`}>
              إضافة وتعديل الأواني
            </span>
          </div>
        </button>

        {/* 2. الطلبات */}
        <button
          onClick={() => setActiveTab('orders')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between relative ${
            activeTab === 'orders'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5" />
            <span className="text-xs font-bold tabular-nums">
              {orders.length}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-sm">2. الطلبات</h4>
              {pendingOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span className={`text-[11px] ${activeTab === 'orders' ? 'text-amber-100' : 'text-stone-400'}`}>
              {pendingOrdersCount} قيد المعالجة
            </span>
          </div>
        </button>

        {/* 3. الزبائن */}
        <button
          onClick={() => setActiveTab('customers')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            activeTab === 'customers'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold tabular-nums">
              {customers.length}
            </span>
          </div>
          <div>
            <h4 className="font-black text-sm">3. الزبائن</h4>
            <span className={`text-[11px] ${activeTab === 'customers' ? 'text-amber-100' : 'text-stone-400'}`}>
              سجل المشترين
            </span>
          </div>
        </button>

        {/* 4. الصور */}
        <button
          onClick={() => setActiveTab('gallery')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            activeTab === 'gallery'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs font-bold tabular-nums">
              {allGalleryImages.length}
            </span>
          </div>
          <div>
            <h4 className="font-black text-sm">4. الصور</h4>
            <span className={`text-[11px] ${activeTab === 'gallery' ? 'text-amber-100' : 'text-stone-400'}`}>
              مكتبة صور الأواني
            </span>
          </div>
        </button>

        {/* 5. الأسعار */}
        <button
          onClick={() => setActiveTab('pricing')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            activeTab === 'pricing'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Tag className="w-5 h-5" />
            <span className="text-xs font-bold tabular-nums">
              DH
            </span>
          </div>
          <div>
            <h4 className="font-black text-sm">5. الأسعار</h4>
            <span className={`text-[11px] ${activeTab === 'pricing' ? 'text-amber-100' : 'text-stone-400'}`}>
              التخفيضات والعروض
            </span>
          </div>
        </button>

        {/* 6. الإشعارات */}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between relative ${
            activeTab === 'notifications'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {unreadNotificationsCount}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-black text-sm">6. الإشعارات</h4>
            <span className={`text-[11px] ${activeTab === 'notifications' ? 'text-amber-100' : 'text-stone-400'}`}>
              تنبيهات المتجر
            </span>
          </div>
        </button>

        {/* 7. إعدادات المتجر */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
            activeTab === 'settings'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-stone-800 border-stone-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Settings className="w-5 h-5" />
            <span className="text-xs font-bold font-mono">
              Admin
            </span>
          </div>
          <div>
            <h4 className="font-black text-sm">7. إعدادات المتجر</h4>
            <span className={`text-[11px] ${activeTab === 'settings' ? 'text-amber-100' : 'text-stone-400'}`}>
              الواتساب والحساب
            </span>
          </div>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. TAB: PRODUCTS MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ابحث في المنتجات..."
                value={adminProductSearch}
                onChange={(e) => setAdminProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد (مع صور متعددة)</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                  <tr>
                    <th className="p-4">المنتج</th>
                    <th className="p-4">القسم</th>
                    <th className="p-4">الصور</th>
                    <th className="p-4">الألوان</th>
                    <th className="p-4">الثمن</th>
                    <th className="p-4">المخزون</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-stone-900 text-sm line-clamp-1 max-w-xs">
                              {p.name}
                            </p>
                            {p.badge && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                                {p.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-medium text-stone-600">
                        {categories.find((c) => c.id === p.category)?.name || p.category}
                      </td>

                      <td className="p-4 text-stone-600">
                        <span className="font-bold tabular-nums">
                          {(p.images?.length || 1)} صور
                        </span>
                      </td>

                      <td className="p-4 text-stone-600">
                        {p.colors && p.colors.length > 0 ? (
                          <span className="text-[11px] font-semibold text-stone-700">
                            {p.colors.slice(0, 2).join('، ')}
                            {p.colors.length > 2 && ` (+${p.colors.length - 2})`}
                          </span>
                        ) : (
                          <span className="text-stone-400">افتراضي</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-black text-amber-700 tabular-nums text-sm">
                          {p.price} DH
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="block text-[11px] text-stone-400 line-through tabular-nums">
                            {p.originalPrice} DH
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-bold tabular-nums ${
                            p.stockQuantity <= 5
                              ? 'text-rose-600 font-black'
                              : 'text-stone-700'
                          }`}
                        >
                          {p.stockQuantity} قطعة
                        </span>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() =>
                            updateProduct({ ...p, inStock: !p.inStock })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            p.inStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-500 border border-stone-200'
                          }`}
                        >
                          {p.inStock ? 'متوفر' : 'غير متوفر'}
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="تعديل المنتج"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف هذا المنتج فقط"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. TAB: ORDERS */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200">
            <div>
              <h3 className="text-lg font-bold text-stone-900">طلبات الزبناء</h3>
              <p className="text-xs text-stone-500">
                متابعة وتحديث حالة الشحن ومراسلة الزبائن عبر واتساب
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'pending', label: 'قيد المعالجة' },
                { id: 'confirmed', label: 'تم التأكيد' },
                { id: 'shipped', label: 'قيد التوصيل' },
                { id: 'delivered', label: 'تم التسليم' },
                { id: 'cancelled', label: 'ملغي' },
              ].map((flt) => (
                <button
                  key={flt.id}
                  onClick={() => setAdminOrderFilter(flt.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    adminOrderFilter === flt.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-amber-700 text-base">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-stone-400">·</span>
                    <span className="text-xs text-stone-500">{order.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-stone-600">الحالة:</label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value as OrderStatus)
                      }
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-stone-50 focus:outline-none cursor-pointer"
                    >
                      <option value="pending">⏳ قيد المعالجة (En attente)</option>
                      <option value="confirmed">✅ تم التأكيد (Confirmée)</option>
                      <option value="shipped">🚚 قيد التوصيل (Expédiée)</option>
                      <option value="delivered">🎉 تم التسليم (Livrée)</option>
                      <option value="cancelled">❌ ملغي (Annulée)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-4 rounded-xl space-y-1.5 text-xs">
                    <p className="font-bold text-stone-800 text-sm mb-1">
                      بيانات الزبون:
                    </p>
                    <p className="text-stone-700"><strong>الاسم:</strong> {order.customerName}</p>
                    <p className="text-stone-700"><strong>الهاتف:</strong> <span dir="ltr" className="font-mono">{order.customerPhone}</span></p>
                    {order.customerEmail && (
                      <p className="text-stone-700"><strong>البريد:</strong> <span dir="ltr" className="font-mono">{order.customerEmail}</span></p>
                    )}
                    <p className="text-stone-700"><strong>المدينة:</strong> {order.customerCity}</p>
                    <p className="text-stone-700"><strong>العنوان:</strong> {order.customerAddress}</p>
                    {order.notes && (
                      <p className="text-amber-800 bg-amber-50 p-2 rounded-lg mt-2">
                        <strong>ملاحظات:</strong> {order.notes}
                      </p>
                    )}

                    <div className="pt-2">
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `السلام عليكم أخي/أختي ${order.customerName}، معكم متجر دار الأواني بخصوص طلبيتكم رقم ${order.orderNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>مراسلة الزبون على واتساب</span>
                      </a>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-xl flex flex-col justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-800 text-sm mb-2">
                        المنتجات المطلوبة ({order.items.length}):
                      </p>
                      <div className="space-y-2">
                        {order.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={it.image}
                                alt={it.name}
                                className="w-8 h-8 rounded-md object-cover"
                              />
                              <span className="truncate max-w-[180px] font-medium text-stone-800">
                                {it.name} {it.selectedColor ? `(${it.selectedColor})` : ''}
                              </span>
                            </div>
                            <span className="font-bold tabular-nums text-stone-700 shrink-0">
                              {it.quantity} x {it.price} = {it.quantity * it.price} DH
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-200 mt-3 flex items-center justify-between text-sm font-black">
                      <span>المجموع الكلي:</span>
                      <span className="text-amber-700 tabular-nums">
                        {order.total} {settings.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB: CUSTOMERS */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200">
            <div>
              <h3 className="text-lg font-bold text-stone-900">سجل الزبائن المسجلين</h3>
              <p className="text-xs text-stone-500">
                قاعدة بيانات المشترين للتواصل ومتابعة الولاء
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                value={adminCustomerSearch}
                onChange={(e) => setAdminCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                  <tr>
                    <th className="p-4">الزبون</th>
                    <th className="p-4">البريد الإلكتروني</th>
                    <th className="p-4">رقم الهاتف</th>
                    <th className="p-4">تاريخ الانضمام</th>
                    <th className="p-4">عدد الطلبيات</th>
                    <th className="p-4 text-center">تواصل سريع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCustomers.map((cust) => {
                    const custOrders = orders.filter(
                      (o) => o.customerEmail?.toLowerCase() === cust.email.toLowerCase()
                    );
                    const custTotalSpent = custOrders.reduce((sum, o) => sum + o.total, 0);

                    return (
                      <tr key={cust.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center">
                              {cust.name.charAt(0)}
                            </div>
                            <span className="font-bold text-stone-900">{cust.name}</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-stone-600" dir="ltr">
                          {cust.email}
                        </td>

                        <td className="p-4 font-mono text-stone-600" dir="ltr">
                          {cust.phone || 'غير مسجل'}
                        </td>

                        <td className="p-4 text-stone-500">
                          {cust.createdAt}
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-amber-700 tabular-nums">
                            {custOrders.length} طلبات
                          </span>
                          {custTotalSpent > 0 && (
                            <span className="block text-[11px] text-stone-400">
                              ({custTotalSpent} DH)
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {cust.phone && (
                              <a
                                href={`https://wa.me/${cust.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="محادثة واتساب"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                            <a
                              href={`mailto:${cust.email}`}
                              className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                              title="إرسال بريد إلكتروني"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB: IMAGES / GALLERY */}
      {/* ============================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">مكتبة صور الأواني والمنتجات</h3>
              <p className="text-xs text-stone-500">
                جميع الصور المستخدمة في المنتجات مع إمكانية معاينتها ونسخ روابطها واستخدامها
              </p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              إضافة صور لمنتج جديد
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allGalleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                <div className="aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={`صورة أواني ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 bg-white flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400 font-mono truncate max-w-[140px]" dir="ltr">
                    {imgUrl.split('/').pop()}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(imgUrl);
                      alert('تم نسخ رابط الصورة بنجاح!');
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:underline"
                  >
                    نسخ الرابط
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB: PRICING & DISCOUNTS */}
      {/* ============================================================== */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-stone-900">إدارة الأسعار والتخفيضات</h3>
              <p className="text-xs text-stone-500">
                مراجعة وتعديل أسعار بيع الأواني، نسب التخفيض، والشارات الترويجية
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
              العملة: درهم مغربي (DH)
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                  <tr>
                    <th className="p-4">المنتج</th>
                    <th className="p-4">سعر البيع الحالي</th>
                    <th className="p-4">السعر الأصلي</th>
                    <th className="p-4">نسبة التخفيض</th>
                    <th className="p-4">الشارة (Badge)</th>
                    <th className="p-4 text-center">تعديل سريع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => {
                    const discount =
                      p.originalPrice && p.originalPrice > p.price
                        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                        : 0;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-stone-900 text-sm">{p.name}</span>
                        </td>
                        <td className="p-4 font-black text-amber-700 text-sm tabular-nums">
                          {p.price} DH
                        </td>
                        <td className="p-4 text-stone-400 tabular-nums">
                          {p.originalPrice ? `${p.originalPrice} DH` : '—'}
                        </td>
                        <td className="p-4">
                          {discount > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                              -{discount}%
                            </span>
                          ) : (
                            <span className="text-stone-400">سعر عادي</span>
                          )}
                        </td>
                        <td className="p-4">
                          {p.badge ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                              {p.badge}
                            </span>
                          ) : (
                            <span className="text-stone-400">بدون شارة</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-amber-600 hover:text-white rounded-lg font-bold transition-colors"
                          >
                            تعديل السعر
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TAB: NOTIFICATIONS */}
      {/* ============================================================== */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900">إشعارات وتنبيهات المتجر</h3>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                    {unreadNotificationsCount} جديد
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                تسجيل فوري لجميع الطلبيات الجديدة، تحديثات الشحن، وتنبيهات المخزون
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsAsRead}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>تعليم الكل كمقروء</span>
              </button>

              <button
                onClick={clearNotifications}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح الإشعارات</span>
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-400">
              <Bell className="w-12 h-12 mx-auto mb-2 text-stone-300" />
              <p className="font-bold text-sm text-stone-700">لا توجد إشعارات حالياً</p>
              <p className="text-xs text-stone-400">ستظهر هنا أي طلبية أو حركة جديدة في المتجر</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    notif.read
                      ? 'bg-white border-stone-200 text-stone-700'
                      : 'bg-amber-50/70 border-amber-200 text-stone-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'new_order'
                          ? 'bg-emerald-100 text-emerald-700'
                          : notif.type === 'stock_alert'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {notif.type === 'new_order' ? (
                        <Package className="w-5 h-5" />
                      ) : notif.type === 'stock_alert' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">{notif.title}</h4>
                      <p className="text-xs text-stone-600 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        {notif.createdAt}
                      </span>
                    </div>
                  </div>

                  {!notif.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. TAB: SETTINGS & ADMIN ACCOUNT SECURITY */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          {/* Section A: Admin Account Security (Change Gmail & Password) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs max-w-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  أمان وحساب المدير (تغيير Gmail وكلمة المرور)
                </h3>
                <p className="text-xs text-stone-500">
                  يمكنك تحديث البريد الإلكتروني للمدير وكلمة المرور بكل أمان
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
              <span>البريد الإلكتروني الحالي للمدير: </span>
              <strong className="font-mono text-amber-700" dir="ltr">
                {adminCredentials.email}
              </strong>
            </div>

            <form onSubmit={handleUpdateAdminSecurity} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  1. كلمة المرور الحالية لتأكيد الهوية *
                </label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  placeholder="أدخل كلمة المرور الحالية..."
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none text-left"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  2. البريد الإلكتروني الجديد (Gmail)
                </label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="new-admin@gmail.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none text-left"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    3. كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    dir="ltr"
                    placeholder="••••••••"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    4. تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    type="password"
                    dir="ltr"
                    placeholder="••••••••"
                    value={confirmAdminPass}
                    onChange={(e) => setConfirmAdminPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none text-left"
                  />
                </div>
              </div>

              {securityStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    securityStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {securityStatus.message}
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                تحديث بيانات حساب المدير
              </button>
            </form>
          </div>

          {/* Section B: General Store Settings */}
          <form
            onSubmit={handleSaveSettings}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 max-w-2xl text-xs"
          >
            <h3 className="text-base font-bold text-stone-900 mb-2">
              إعدادات المتجر وبيانات الاتصال
            </h3>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                اسم المتجر
              </label>
              <input
                type="text"
                value={settingsForm.storeName}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, storeName: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  رقم واتساب لاستقبال الطلبات
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      whatsappNumber: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none text-left font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  رقم الهاتف لخدمة الزبناء
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={settingsForm.storePhone}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      storePhone: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none text-left font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  مصاريف التوصيل القياسية (DH)
                </label>
                <input
                  type="number"
                  value={settingsForm.standardShippingFee}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      standardShippingFee: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  الحد الأدنى للتوصيل المجاني (DH)
                </label>
                <input
                  type="number"
                  value={settingsForm.freeShippingThreshold}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      freeShippingThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                نص شريط الإعلانات أعلى الموقع
              </label>
              <textarea
                rows={2}
                value={settingsForm.announcementText}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    announcementText: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>

              {settingsSaved && (
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  تم الحفظ بنجاح!
                </span>
              )}
            </div>
          </form>

          {/* Section C: Supabase Integration (Inside Admin Only) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs max-w-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    قاعدة بيانات سوبابيز السحابية (Supabase)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    كود SQL ومفاتيح الربط لحفظ المنتجات والطلبات سحابياً
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                {isSupabaseConfigured ? '🟢 متصل بسوبابيز' : '⚪ يعمل محلياً'}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              يمكنك نسخ كود SQL لإنشاء الجداول في سوبابيز، أو إدخال رابط المشروع ومفتاح API للمزامنة التلقائية.
            </p>

            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>إدارة كود SQL ومفاتيح Supabase</span>
            </button>
          </div>

          {/* Section D: Reset Store Data */}
          <div className="bg-rose-50/60 border border-rose-200 p-5 rounded-2xl max-w-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-900">إعادة ضبط البيانات الأصلية</h4>
              <p className="text-[11px] text-rose-700">
                استعادة المنتجات والطلبات الأصلية للمتجر
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من استعادة البيانات الأولية للمتجر؟')) {
                  resetToDefaults();
                }
              }}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة البيانات الأصلية</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PRODUCT ADD/EDIT MODAL WITH MULTIPLE IMAGES & COLORS */}
      {/* ============================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-right">
          <div
            className="relative bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <h3 className="text-base font-bold text-stone-900">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    القسم *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    شارة ترويجية (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="الأكثر مبيعاً، جديد، عرض خاص"
                    value={productForm.badge}
                    onChange={(e) =>
                      setProductForm({ ...productForm, badge: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    الثمن للبيع (DH) *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    الثمن قبل التخفيض (DH)
                  </label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        originalPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    الكمية بالمخزون *
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQuantity}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stockQuantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Multiple Images Management (Add new & Delete specific without deleting others) */}
              <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 text-xs">
                    معرض صور المنتج ({productForm.imagesList.length} صور)
                  </label>
                  <span className="text-[11px] text-stone-500">
                    يمكنك حذف أي صورة بمفردها بنقرة واحدة
                  </span>
                </div>

                {/* Visual list of images with individual delete button */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-40 overflow-y-auto p-1">
                  {productForm.imagesList.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-xl overflow-hidden border ${
                        productForm.image === imgUrl
                          ? 'border-amber-600 ring-2 ring-amber-500/20'
                          : 'border-stone-200'
                      } bg-white shadow-xs aspect-square`}
                    >
                      <img
                        src={imgUrl}
                        alt={`صورة ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {productForm.image === imgUrl && (
                        <span className="absolute bottom-1 right-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          الرئيسية
                        </span>
                      )}
                      <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        <button
                          type="button"
                          onClick={() => setProductForm((prev) => ({ ...prev, image: imgUrl }))}
                          className="p-1 bg-amber-600 text-white rounded text-[10px] font-bold"
                          title="تعيين كصورة رئيسية"
                        >
                          رئيسية
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImageFromProduct(idx)}
                          className="p-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                          title="حذف هذه الصورة فقط"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new image input */}
                <div className="pt-2 border-t border-stone-200 flex items-center gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="رابط صورة جديدة (https://...)"
                    value={productForm.newImageUrlInput}
                    onChange={(e) =>
                      setProductForm({ ...productForm, newImageUrlInput: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageToProduct}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة صورة</span>
                  </button>
                </div>
              </div>


              {/* Available Colors */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  الألوان المتاحة للمنتج (لون في كل سطر)
                </label>
                <textarea
                  rows={2}
                  placeholder="إينوكس فضي&#10;أسود غير لامع&#10;نحاسي ملكي"
                  value={productForm.colorsText}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      colorsText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  وصف المنتج
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  المميزات والمواصفات (ميزة في كل سطر)
                </label>
                <textarea
                  rows={3}
                  value={productForm.featuresText}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      featuresText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-xs"
                >
                  حفظ المنتج
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-semibold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SAFE DELETE CONFIRMATION MODAL (Deletes selected product only) */}
      {/* ============================================================== */}

      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 text-right animate-in fade-in duration-150">
          <div
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-stone-900 text-center mb-1">
              تأكيد حذف المنتج المحدد
            </h3>
            <p className="text-xs text-stone-500 text-center mb-4 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا المنتج فقط من المتجر؟ لا يمكن التراجع عن هذه العملية بعد التأكيد.
            </p>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3 mb-6">
              <img
                src={productToDelete.image}
                alt={productToDelete.name}
                className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-stone-900 truncate">
                  {productToDelete.name}
                </p>
                <p className="text-[11px] text-amber-700 font-bold tabular-nums">
                  {productToDelete.price} DH (المخزون: {productToDelete.stockQuantity} قطعة)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                نعم، احذف هذا المنتج
              </button>
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
              >
                إلغاء والتراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

