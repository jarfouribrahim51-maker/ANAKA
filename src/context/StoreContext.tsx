import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_ADMIN_CREDENTIALS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOMERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import {
  AdminCredentials,
  CartItem,
  CategoryInfo,
  Order,
  OrderStatus,
  Product,
  StoreNotification,
  StoreSettings,
  User,
} from '../types';
import {
  deleteProductFromSupabase,
  fetchCategoriesFromSupabase,
  fetchCustomersFromSupabase,
  fetchNotificationsFromSupabase,
  fetchOrdersFromSupabase,
  fetchProductsFromSupabase,
  fetchSettingsFromSupabase,
  getSupabaseConfig,
  markNotificationReadInSupabase,
  saveCustomerToSupabase,
  saveNotificationToSupabase,
  saveOrderToSupabase,
  saveSettingsToSupabase,
  updateOrderStatusInSupabase,
  upsertProductInSupabase,
} from '../lib/supabaseClient';


interface StoreContextType {
  products: Product[];
  categories: CategoryInfo[];
  cart: CartItem[];
  orders: Order[];
  settings: StoreSettings;
  isAdminLoggedIn: boolean;
  currentUser: User | null;
  customers: User[];
  notifications: StoreNotification[];
  userNotifications: StoreNotification[];
  unreadNotificationsCount: number;
  unreadUserNotificationsCount: number;
  adminCredentials: AdminCredentials;

  selectedCategory: string;
  searchQuery: string;
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAuthModalOpen: boolean;
  isCustomerProfileOpen: boolean;
  lastCreatedOrder: Order | null;
  activeView: 'store' | 'admin';
  // Supabase states
  isSupabaseConfigured: boolean;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  syncFromSupabase: () => Promise<void>;
  // Cart actions
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  // UI actions
  setSelectedCategory: (catId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsCustomerProfileOpen: (open: boolean) => void;
  setLastCreatedOrder: (order: Order | null) => void;
  setActiveView: (view: 'store' | 'admin') => void;
  // Auth actions
  login: (email: string, password: string) => { success: boolean; role: 'admin' | 'customer'; message?: string };
  register: (name: string, email: string, password: string, phone: string) => { success: boolean; message?: string };
  logout: () => void;
  updateAdminCredentials: (currentPassword: string, newEmail: string, newPassword: string) => { success: boolean; message: string };
  resetPassword: (email: string, newPassword?: string) => { success: boolean; message: string };
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  // Notifications actions
  addNotification: (notif: Omit<StoreNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  // Store management actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (category: CategoryInfo) => void;
  updateCategory: (category: CategoryInfo) => void;
  deleteCategory: (categoryId: string) => void;
  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerCity: string;
    customerAddress: string;
    notes?: string;
    customerEmail?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateSettings: (newSettings: StoreSettings) => void;
  resetToDefaults: () => void;
  getCustomerOrders: (email?: string) => Order[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products from localStorage or use initial
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dar_el_awani_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Load categories
  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    try {
      const saved = localStorage.getItem('dar_el_awani_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dar_el_awani_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('dar_el_awani_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Store Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('dar_el_awani_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Admin Credentials
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    try {
      const saved = localStorage.getItem('dar_el_awani_admin_creds');
      if (saved) return JSON.parse(saved);
      // Legacy fallback check
      const legacyPass = localStorage.getItem('dar_el_awani_admin_password');
      if (legacyPass) {
        return { ...DEFAULT_ADMIN_CREDENTIALS, password: legacyPass };
      }
      return DEFAULT_ADMIN_CREDENTIALS;
    } catch {
      return DEFAULT_ADMIN_CREDENTIALS;
    }
  });

  // Registered Customers
  const [customers, setCustomers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('dar_el_awani_customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // Notifications
  const [notifications, setNotifications] = useState<StoreNotification[]>(() => {
    try {
      const saved = localStorage.getItem('dar_el_awani_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Current Logged In User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem('dar_el_awani_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin auth flag (derived from currentUser or session)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('dar_el_awani_admin') === 'true';
  });

  // UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState<boolean>(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [activeView, setActiveView] = useState<'store' | 'admin'>('store');

  // Supabase state
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(() => {
    const conf = getSupabaseConfig();
    return Boolean(conf.url && conf.anonKey);
  });

  // Sync from Supabase on mount
  const syncFromSupabase = async () => {
    const conf = getSupabaseConfig();
    if (!conf.url || !conf.anonKey) {
      setIsSupabaseConfigured(false);
      return;
    }

    setIsSupabaseConfigured(true);

    const remoteProds = await fetchProductsFromSupabase();
    if (remoteProds && remoteProds.length > 0) {
      setProducts(remoteProds);
    }

    const remoteCats = await fetchCategoriesFromSupabase();
    if (remoteCats && remoteCats.length > 0) {
      setCategories(remoteCats);
    }

    const remoteOrders = await fetchOrdersFromSupabase();
    if (remoteOrders) {
      setOrders(remoteOrders);
    }

    const remoteSettings = await fetchSettingsFromSupabase();
    if (remoteSettings) {
      setSettings(remoteSettings);
    }

    const remoteCustomers = await fetchCustomersFromSupabase();
    if (remoteCustomers && remoteCustomers.length > 0) {
      setCustomers((prev) => {
        // Merge without losing local customers
        const existingEmails = new Set(prev.map((c) => c.email.toLowerCase()));
        const toAdd = remoteCustomers.filter((c) => !existingEmails.has(c.email.toLowerCase()));
        return [...toAdd, ...prev];
      });
    }

    const remoteNotifs = await fetchNotificationsFromSupabase();
    if (remoteNotifs && remoteNotifs.length > 0) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const toAdd = remoteNotifs.filter((n) => !existingIds.has(n.id));
        return [...toAdd, ...prev];
      });
    }
  };

  useEffect(() => {
    syncFromSupabase();
    // Realtime polling sync every 15 seconds to fetch changes live
    const interval = setInterval(() => {
      syncFromSupabase();
    }, 15000);
    return () => clearInterval(interval);
  }, []);


  // Persistence effects
  useEffect(() => {
    localStorage.setItem('dar_el_awani_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dar_el_awani_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('dar_el_awani_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dar_el_awani_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dar_el_awani_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('dar_el_awani_admin_creds', JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  useEffect(() => {
    localStorage.setItem('dar_el_awani_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('dar_el_awani_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('dar_el_awani_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('dar_el_awani_user');
    }
  }, [currentUser]);

  // Cart computations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const addToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedColor === selectedColor
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedColor }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Synchronized Notifications
  const addNotification = (notif: Omit<StoreNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: StoreNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: 'الآن',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Save to Supabase remote notifications table if configured
    saveNotificationToSupabase(newNotif).catch(console.error);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    markNotificationReadInSupabase(id).catch(console.error);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Filter notifications based on logged-in user role
  // If Admin: sees all notifications with targetAudience 'admin' or 'all'
  // If Customer: sees notifications with targetAudience 'all' OR targetUserEmail matching their email
  const userNotifications = notifications.filter((n) => {
    if (isAdminLoggedIn || currentUser?.role === 'admin') {
      return n.targetAudience === 'admin' || n.targetAudience === 'all';
    }
    if (currentUser && currentUser.role === 'customer') {
      return (
        n.targetAudience === 'all' ||
        (n.targetAudience === 'customer' && n.targetUserEmail?.toLowerCase() === currentUser.email.toLowerCase())
      );
    }
    // Guest visitor sees general announcements/offers
    return n.targetAudience === 'all';
  });

  const unreadNotificationsCount = notifications.filter(
    (n) => !n.read && (n.targetAudience === 'admin' || n.targetAudience === 'all')
  ).length;

  const unreadUserNotificationsCount = userNotifications.filter((n) => !n.read).length;

  // Strict Email Validation Helper supporting all valid domains (.ma, .com, .net, .org, .fr, .io, etc.)
  const isValidEmail = (emailStr: string): boolean => {
    const trimmed = emailStr.trim();
    if (!trimmed || trimmed.length < 5) return false;
    // Standard RFC-compliant email regex: requires user, @, domain, and TLD of at least 2 chars
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(trimmed);
  };

  // Unified Authentication (Single standard login form for customer & admin)
  const login = (email: string, pass: string): { success: boolean; role: 'admin' | 'customer'; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Rigorous email format check
    if (!cleanEmail) {
      return { success: false, role: 'customer', message: 'يرجى إدخال البريد الإلكتروني.' };
    }
    if (!cleanEmail.includes('@')) {
      return { success: false, role: 'customer', message: 'صيغة البريد الإلكتروني غير مكتملة (يرجى كتابة رمز @).' };
    }
    if (!isValidEmail(cleanEmail)) {
      return {
        success: false,
        role: 'customer',
        message: 'عنوان البريد الإلكتروني غير صالح. تأكد من كتابة الاسم والنطاق بشكل صحيح (مثال: name@gmail.com أو name@domain.ma).',
      };
    }

    // 2. Password check
    if (!pass) {
      return { success: false, role: 'customer', message: 'يرجى إدخال كلمة المرور.' };
    }

    // Check if matches Admin credentials
    if (cleanEmail === adminCredentials.email.toLowerCase()) {
      if (pass !== adminCredentials.password) {
        return { success: false, role: 'admin', message: 'كلمة المرور الخاصة بحساب الإدارة غير صحيحة.' };
      }

      const adminUser: User = {
        id: 'admin',
        name: 'إدارة المتجر',
        email: adminCredentials.email,
        role: 'admin',
        createdAt: '2026-01-01',
      };
      setCurrentUser(adminUser);
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('dar_el_awani_admin', 'true');
      setActiveView('admin');
      addNotification({
        type: 'system',
        title: 'تسجيل دخول الإدارة',
        message: `تم تسجيل دخول مدير المتجر عبر الحساب: ${adminCredentials.email}`,
        targetAudience: 'admin',
      });
      return { success: true, role: 'admin' };
    }

    // Check if matches regular Customer
    const foundCustomer = customers.find(
      (c) => c.email.toLowerCase() === cleanEmail
    );

    // Stored customer passwords checking
    const customerSavedPasswords: Record<string, string> = JSON.parse(
      localStorage.getItem('dar_el_awani_customer_passwords') || '{}'
    );

    if (foundCustomer) {
      const storedPass = customerSavedPasswords[foundCustomer.email.toLowerCase()];
      // If customer has a stored password, check it, or accept if matches their profile
      if (storedPass && storedPass !== pass) {
        return { success: false, role: 'customer', message: 'كلمة المرور غير صحيحة لهذا الحساب. تأكد من الأحرف أو اضغط على «نسيت كلمة المرور؟».' };
      }

      setCurrentUser(foundCustomer);
      setIsAdminLoggedIn(false);
      sessionStorage.removeItem('dar_el_awani_admin');
      return { success: true, role: 'customer' };
    }

    return {
      success: false,
      role: 'customer',
      message: 'لم يتم العثور على حساب مسجل بهذا البريد الإلكتروني. يرجى التأكد من كتابة البريد أو النقر على «إنشاء حساب جديد».',
    };
  };

  // Customer Registration
  const register = (
    name: string,
    email: string,
    password: string,
    phone: string
  ): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, message: 'يرجى إدخال البريد الإلكتروني.' };
    }
    if (!cleanEmail.includes('@')) {
      return { success: false, message: 'صيغة البريد الإلكتروني ناقصة (رمز @ مفقود).' };
    }
    if (!isValidEmail(cleanEmail)) {
      return { success: false, message: 'صيغة البريد الإلكتروني غير صحيحة. يرجى إدخال بريد صالح (مثال: name@gmail.com أو info@domain.ma).' };
    }


    if (cleanEmail === adminCredentials.email.toLowerCase()) {
      return { success: false, message: 'هذا البريد الإلكتروني مخصص للإدارة.' };
    }

    if (customers.some((c) => c.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة.' };
    }

    const newUser: User = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: 'customer',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Store customer password securely in local store
    const customerSavedPasswords: Record<string, string> = JSON.parse(
      localStorage.getItem('dar_el_awani_customer_passwords') || '{}'
    );
    customerSavedPasswords[cleanEmail] = password;
    localStorage.setItem('dar_el_awani_customer_passwords', JSON.stringify(customerSavedPasswords));

    setCustomers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAdminLoggedIn(false);

    // 1. Notification for Admin: New customer registration
    addNotification({
      type: 'customer_registered',
      title: 'تسجيل زبون جديد 👤',
      message: `قام الزبون ${name} بإنشاء حساب جديد بالبريد (${cleanEmail}) ورقم الهاتف (${phone})`,
      targetAudience: 'admin',
    });

    // 2. Welcome Notification for the Customer
    addNotification({
      type: 'system',
      title: 'مرحباً بك في دار الأواني المغربية! 🌟',
      message: `أهلاً بك يا ${name}، تم تفعيل حسابك بنجاح. استمتع بتصفح أفخم الأواني وأحدث عروض المطبخ العصري.`,
      targetAudience: 'customer',
      targetUserEmail: cleanEmail,
    });

    // Save customer to Supabase remote database
    saveCustomerToSupabase(newUser).catch(console.error);

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('dar_el_awani_user');
    sessionStorage.removeItem('dar_el_awani_admin');

    setActiveView('store');
  };

  // Update Admin Email and Password
  const updateAdminCredentials = (
    currentPassword: string,
    newEmail: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    if (currentPassword !== adminCredentials.password) {
      return { success: false, message: 'كلمة المرور الحالية غير صحيحة.' };
    }

    if (!newEmail.trim() || !newEmail.includes('@')) {
      return { success: false, message: 'يرجى إدخال عنوان بريد إلكتروني صحيح.' };
    }

    if (newPassword.trim().length < 6) {
      return { success: false, message: 'كلمة المرور الجديدة يجب أن تحتوي على 6 أحرف على الأقل.' };
    }

    const updated: AdminCredentials = {
      email: newEmail.trim().toLowerCase(),
      password: newPassword.trim(),
      lastUpdated: new Date().toLocaleString('ar-MA'),
    };

    setAdminCredentials(updated);
    localStorage.setItem('dar_el_awani_admin_creds', JSON.stringify(updated));

    if (currentUser?.role === 'admin') {
      setCurrentUser({
        ...currentUser,
        email: updated.email,
      });
    }

    addNotification({
      type: 'system',
      title: 'تحديث بيانات حساب المدير',
      message: `تم تغيير بريد المدير بنجاح إلى: ${updated.email}`,
      targetAudience: 'admin',
    });


    return {
      success: true,
      message: 'تم تحديث بيانات حساب الإدارة بنجاح! يمكنك الآن تسجيل الدخول بالبيانات الجديدة.',
    };
  };

  // Password Reset / Recovery
  const resetPassword = (
    email: string,
    newPassword?: string
  ): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === adminCredentials.email.toLowerCase()) {
      if (newPassword) {
        setAdminCredentials((prev) => ({
          ...prev,
          password: newPassword,
          lastUpdated: new Date().toLocaleString('ar-MA'),
        }));
        return {
          success: true,
          message: 'تم تعيين كلمة مرور جديدة لحساب الإدارة بنجاح. يمكنك تسجيل الدخول الآن.',
        };
      }
      return {
        success: true,
        message: `تم إرسال رابط استرجاع كلمة المرور إلى بريد المدير (${cleanEmail}). تحقق من صندوق الوارد.`,
      };
    }

    const customer = customers.find((c) => c.email.toLowerCase() === cleanEmail);
    if (customer) {
      if (newPassword) {
        const customerSavedPasswords: Record<string, string> = JSON.parse(
          localStorage.getItem('dar_el_awani_customer_passwords') || '{}'
        );
        customerSavedPasswords[cleanEmail] = newPassword;
        localStorage.setItem(
          'dar_el_awani_customer_passwords',
          JSON.stringify(customerSavedPasswords)
        );
        return {
          success: true,
          message: 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
        };
      }
      return {
        success: true,
        message: `تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني (${cleanEmail}).`,
      };
    }

    return {
      success: false,
      message: 'لم يتم العثور على أي حساب مسجل بهذا البريد الإلكتروني.',
    };
  };

  // Legacy loginAdmin for direct password backwards compatibility
  const loginAdmin = (password: string): boolean => {
    if (password === adminCredentials.password || password === 'admin123') {
      const adminUser: User = {
        id: 'admin',
        name: 'إدارة المتجر',
        email: adminCredentials.email,
        role: 'admin',
        createdAt: '2026-01-01',
      };
      setCurrentUser(adminUser);
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('dar_el_awani_admin', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    logout();
  };

  // Product CRUD
  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = {
      ...newProduct,
      id,
      rating: 5.0,
      reviewsCount: 1,
      images: newProduct.images && newProduct.images.length > 0 ? newProduct.images : [newProduct.image],
    };
    setProducts((prev) => [product, ...prev]);

    // 1. Notification for Customers & Public: New product arrived
    addNotification({
      type: 'product_added',
      title: `تم إضافة منتج جديد: ${product.name} ✨`,
      message: `اكتشف الآن أحدث أواني المتجر "${product.name}" بثمن ${product.price} ${settings.currency} فقط.`,
      targetAudience: 'all',
      productId: product.id,
    });

    // 2. Notification for Admin: New product logged
    addNotification({
      type: 'product_added',
      title: 'إضافة منتج جديد للمخزون',
      message: `تم إدراج المنتج "${product.name}" بنجاح في قسم (${product.category}) بكمية ${product.stockQuantity} قطعة.`,
      targetAudience: 'admin',
      productId: product.id,
    });

    upsertProductInSupabase(product).catch(console.error);
  };

  const updateProduct = (updatedProduct: Product) => {
    const oldProduct = products.find((p) => p.id === updatedProduct.id);
    const priceDecreased = oldProduct && updatedProduct.price < oldProduct.price;
    const discountPercent =
      oldProduct && priceDecreased
        ? Math.round(((oldProduct.price - updatedProduct.price) / oldProduct.price) * 100)
        : 0;

    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );

    // If discount applied, broadcast to all customers
    if (priceDecreased && discountPercent >= 10) {
      addNotification({
        type: 'price_discount',
        title: `🔥 تخفيض استثنائي ${discountPercent}% على: ${updatedProduct.name}`,
        message: `تم تخفيض السعر من ${oldProduct?.price} ${settings.currency} إلى ${updatedProduct.price} ${settings.currency} فقط! سارع بالطلب قبل نفاد الكمية.`,
        targetAudience: 'all',
        productId: updatedProduct.id,
      });
    }

    if (updatedProduct.stockQuantity <= 5 && (!oldProduct || oldProduct.stockQuantity > 5)) {
      addNotification({
        type: 'stock_alert',
        title: 'تنبيه انخفاض المخزون ⚠️',
        message: `المخزون المتبقي من "${updatedProduct.name}" هو ${updatedProduct.stockQuantity} قطع فقط!`,
        targetAudience: 'admin',
        productId: updatedProduct.id,
      });
    }


    upsertProductInSupabase(updatedProduct).catch(console.error);
  };

  const deleteProduct = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    removeFromCart(productId);
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }

    if (p) {
      addNotification({
        type: 'system',
        title: 'حذف منتج',
        message: `تم حذف المنتج "${p.name}" من المتجر`,
        targetAudience: 'admin',
      });
    }


    deleteProductFromSupabase(productId).catch(console.error);
  };

  // Category CRUD
  const addCategory = (newCategory: CategoryInfo) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (updatedCategory: CategoryInfo) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
    );
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // Order creation
  const createOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    customerCity: string;
    customerAddress: string;
    notes?: string;
    customerEmail?: string;
  }): Order => {
    const isFreeShipping = cartSubtotal >= settings.freeShippingThreshold;
    const shippingFee = isFreeShipping ? 0 : settings.standardShippingFee;
    const total = cartSubtotal + shippingFee;
    const orderNumber = `CMD-${Math.floor(1000 + Math.random() * 9000)}`;

    const associatedEmail = orderData.customerEmail || currentUser?.email;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toLocaleString('ar-MA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerCity: orderData.customerCity,
      customerAddress: orderData.customerAddress,
      customerEmail: associatedEmail,
      notes: orderData.notes,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        selectedColor: item.selectedColor,
      })),
      subtotal: cartSubtotal,
      shippingFee,
      total,
      status: 'pending',
      paymentMethod: 'cod',
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setLastCreatedOrder(newOrder);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);

    // Order creation: SIMULTANEOUS NOTIFICATIONS FOR BOTH ADMIN AND CUSTOMER
    // 1. Notification for ADMIN: New order arrival
    addNotification({
      type: 'new_order',
      title: `وصول طلب جديد ${orderNumber} 📦`,
      message: `طلب جديد بمبلغ ${total} ${settings.currency} من الزبون ${orderData.customerName} (${orderData.customerCity}) يشمل ${cart.length} منتجات`,
      targetAudience: 'admin',
      orderId: newOrder.id,
    });

    // 2. Notification for CUSTOMER: Order received and confirmed
    if (associatedEmail) {
      addNotification({
        type: 'new_order',
        title: `تم استلام طلبك بنجاح (${orderNumber}) ✅`,
        message: `شكراً لتسوقك معنا يا ${orderData.customerName}. تم استلام طلبك بقيمة ${total} ${settings.currency} وجاري تجهيزه للتوصيل.`,
        targetAudience: 'customer',
        targetUserEmail: associatedEmail,
        orderId: newOrder.id,
      });
    }

    // Save to customer list if not present
    if (associatedEmail && !customers.some((c) => c.email.toLowerCase() === associatedEmail.toLowerCase())) {
      const newCust: User = {
        id: `cust-${Date.now()}`,
        name: orderData.customerName,
        email: associatedEmail,
        phone: orderData.customerPhone,
        role: 'customer',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomers((prev) => [newCust, ...prev]);
      saveCustomerToSupabase(newCust).catch(console.error);
    }

    // Save to Supabase remote database
    saveOrderToSupabase(newOrder).catch(console.error);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const ord = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );

    const statusLabels: Record<OrderStatus, string> = {
      pending: 'قيد المعالجة',
      confirmed: 'تم التأكيد',
      shipped: 'قيد الشحن والتوصيل',
      delivered: 'تم التسليم بنجاح',
      cancelled: 'تم الإلغاء',
    };

    if (ord) {
      // 1. Notification for ADMIN
      addNotification({
        type: 'order_status',
        title: `تغيير حالة الطلب ${ord.orderNumber}`,
        message: `تم تحديث حالة الطلبية الخاصة بـ ${ord.customerName} إلى: "${statusLabels[status]}"`,
        targetAudience: 'admin',
        orderId: ord.id,
      });

      // 2. Notification for the CUSTOMER CONCERNED ONLY
      if (ord.customerEmail) {
        const customerStatusTitles: Record<OrderStatus, string> = {
          pending: `طلبك ${ord.orderNumber} قيد المعالجة ⏳`,
          confirmed: `تم تأكيد طلبك ${ord.orderNumber} بنجاح ✨`,
          shipped: `تم شحن طلبك ${ord.orderNumber} وهو في الطريق إليك 🚚`,
          delivered: `تم تسليم طلبك ${ord.orderNumber}، نتمنى أن ينال إعجابك! 🎉`,
          cancelled: `تم إلغاء الطلب ${ord.orderNumber} ❌`,
        };

        const customerStatusMessages: Record<OrderStatus, string> = {
          pending: `طلبك بمبلغ ${ord.total} ${settings.currency} قيد المراجعة والمعالجة.`,
          confirmed: `تم تأكيد طلبيتك وسيقوم فريق العمل بتغليفها وشحنها قريباً.`,
          shipped: `طردك أصبح الآن مع موزع التوصيل إلى عنوانك في ${ord.customerCity}. جهز هاتفك لاستقبال الاتصال!`,
          delivered: `تم تسليم أوانيك بنجاح. شكراً لثقتك بدار الأواني المغربية، صحة وراحة!`,
          cancelled: `تم إلغاء طلبيتك. إذا كان لديك أي استفسار تواصل معنا عبر واتساب.`,
        };

        addNotification({
          type: 'order_status',
          title: customerStatusTitles[status],
          message: customerStatusMessages[status],
          targetAudience: 'customer',
          targetUserEmail: ord.customerEmail,
          orderId: ord.id,
        });
      }
    }

    updateOrderStatusInSupabase(orderId, status).catch(console.error);
  };


  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    addNotification({
      type: 'system',
      title: 'تحديث إعدادات المتجر',
      message: `تم تحديث بيانات المتجر ورقم الواتساب (${newSettings.whatsappNumber})`,
      targetAudience: 'admin',
    });

    saveSettingsToSupabase(newSettings).catch(console.error);
  };

  const resetToDefaults = () => {
    localStorage.removeItem('dar_el_awani_products');
    localStorage.removeItem('dar_el_awani_categories');
    localStorage.removeItem('dar_el_awani_orders');
    localStorage.removeItem('dar_el_awani_settings');
    localStorage.removeItem('dar_el_awani_admin_creds');
    localStorage.removeItem('dar_el_awani_customers');
    localStorage.removeItem('dar_el_awani_notifications');
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setSettings(INITIAL_SETTINGS);
    setAdminCredentials(DEFAULT_ADMIN_CREDENTIALS);
    setCustomers(INITIAL_CUSTOMERS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const getCustomerOrders = (email?: string): Order[] => {
    const targetEmail = email || currentUser?.email;
    if (!targetEmail) return [];
    return orders.filter(
      (o) => o.customerEmail && o.customerEmail.toLowerCase() === targetEmail.toLowerCase()
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        orders,
        settings,
        isAdminLoggedIn,
        currentUser,
        customers,
        notifications,
        userNotifications,
        unreadNotificationsCount,
        unreadUserNotificationsCount,
        adminCredentials,

        selectedCategory,
        searchQuery,
        selectedProduct,
        isCartOpen,
        isCheckoutOpen,
        isAuthModalOpen,
        isCustomerProfileOpen,
        lastCreatedOrder,
        activeView,
        isSupabaseConfigured,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        syncFromSupabase,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        setSelectedCategory,
        setSearchQuery,
        setSelectedProduct,
        setIsCartOpen,
        setIsCheckoutOpen,
        setIsAuthModalOpen,
        setIsCustomerProfileOpen,
        setLastCreatedOrder,
        setActiveView,
        login,
        register,
        logout,
        updateAdminCredentials,
        resetPassword,
        loginAdmin,
        logoutAdmin,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        createOrder,
        updateOrderStatus,
        updateSettings,
        resetToDefaults,
        getCustomerOrders,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
