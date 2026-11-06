import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CategoryInfo, Order, Product, StoreSettings } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEY = 'dar_el_awani_supabase_config';

export const getSupabaseConfig = (): SupabaseConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse Supabase config from storage', e);
  }

  // Fallback to Vite env variables if set
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && lastUsedUrl === config.url && lastUsedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    lastUsedUrl = config.url;
    lastUsedKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

// Test if connection works and tables exist
export const testSupabaseConnection = async (
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; counts?: { products: number; categories: number } }> => {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'يرجى إدخال رابط المشروع والمفتاح العام (Anon Key).' };
    }

    const testClient = createClient(url.trim(), anonKey.trim());
    const { data: catData, error: catError } = await testClient
      .from('categories')
      .select('id', { count: 'exact' });

    if (catError) {
      return {
        success: false,
        message: `خطأ في الاتصال: ${catError.message} (تأكد من تنفيذ كود SQL داخل سوبابيز أولاً).`,
      };
    }

    const { data: prodData } = await testClient
      .from('products')
      .select('id', { count: 'exact' });

    return {
      success: true,
      message: 'تم الاتصال بقاعدة بيانات سوبابيز بنجاح! الجداول جاهزة ومتصلة.',
      counts: {
        categories: catData?.length || 0,
        products: prodData?.length || 0,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `فشل الاتصال: ${err?.message || 'تأكد من صحة الرابط والمفتاح'}.`,
    };
  }
};

// Remote database operations
export const fetchProductsFromSupabase = async (): Promise<Product[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Error fetching products from Supabase:', error);
      return null;
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category_id,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      image: p.image,
      description: p.description || '',
      features: Array.isArray(p.features) ? p.features : [],
      inStock: Boolean(p.in_stock),
      stockQuantity: Number(p.stock_quantity ?? 10),
      rating: Number(p.rating ?? 5.0),
      reviewsCount: Number(p.reviews_count ?? 1),
      badge: p.badge || undefined,
      isFeatured: Boolean(p.is_featured),
    }));
  } catch (e) {
    console.error('Supabase fetch products error:', e);
    return null;
  }
};

export const fetchCategoriesFromSupabase = async (): Promise<CategoryInfo[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('categories').select('*');
    if (error || !data) return null;

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      shortName: c.short_name || c.name,
      iconName: c.icon_name || 'Layers',
      description: c.description || '',
    }));
  } catch (e) {
    console.error('Supabase fetch categories error:', e);
    return null;
  }
};

export const fetchOrdersFromSupabase = async (): Promise<Order[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data: ordersData, error: ordersError } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError || !ordersData) return null;

    const { data: itemsData } = await client.from('order_items').select('*');

    return ordersData.map((o: any) => {
      const items = (itemsData || [])
        .filter((it: any) => it.order_id === o.id)
        .map((it: any) => ({
          productId: it.product_id || '',
          name: it.product_name,
          price: Number(it.price),
          quantity: Number(it.quantity),
          image: it.image || '',
        }));

      return {
        id: o.id,
        orderNumber: o.order_number,
        createdAt: new Date(o.created_at).toLocaleString('ar-MA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerCity: o.customer_city,
        customerAddress: o.customer_address,
        notes: o.notes || undefined,
        items,
        subtotal: Number(o.subtotal),
        shippingFee: Number(o.shipping_fee),
        total: Number(o.total),
        status: o.status as any,
        paymentMethod: 'cod',
      };
    });
  } catch (e) {
    console.error('Supabase fetch orders error:', e);
    return null;
  }
};

export const fetchSettingsFromSupabase = async (): Promise<StoreSettings | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) return null;

    return {
      storeName: data.store_name,
      whatsappNumber: data.whatsapp_number,
      storePhone: data.store_phone,
      announcementText: data.announcement_text,
      freeShippingThreshold: Number(data.free_shipping_threshold),
      standardShippingFee: Number(data.standard_shipping_fee),
      currency: data.currency || 'DH',
    };
  } catch (e) {
    return null;
  }
};

export const saveOrderToSupabase = async (order: Order): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error: ordError } = await client.from('orders').insert({
      id: order.id,
      order_number: order.orderNumber,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_city: order.customerCity,
      customer_address: order.customerAddress,
      notes: order.notes || null,
      subtotal: order.subtotal,
      shipping_fee: order.shippingFee,
      total: order.total,
      status: order.status,
      payment_method: order.paymentMethod,
    });

    if (ordError) {
      console.error('Error inserting order in Supabase:', ordError);
      return false;
    }

    if (order.items && order.items.length > 0) {
      const itemsPayload = order.items.map((it) => ({
        order_id: order.id,
        product_id: it.productId,
        product_name: it.name,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      }));

      await client.from('order_items').insert(itemsPayload);
    }

    return true;
  } catch (e) {
    console.error('Failed to save order to Supabase:', e);
    return false;
  }
};

export const upsertProductInSupabase = async (product: Product): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('products').upsert({
      id: product.id,
      name: product.name,
      category_id: product.category,
      price: product.price,
      original_price: product.originalPrice || null,
      image: product.image,
      description: product.description,
      features: product.features,
      in_stock: product.inStock,
      stock_quantity: product.stockQuantity,
      rating: product.rating,
      reviews_count: product.reviewsCount,
      badge: product.badge || null,
      is_featured: product.isFeatured || false,
    });
    return !error;
  } catch {
    return false;
  }
};

export const deleteProductFromSupabase = async (productId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('products').delete().eq('id', productId);
    return !error;
  } catch {
    return false;
  }
};

export const updateOrderStatusInSupabase = async (orderId: string, status: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('orders').update({ status }).eq('id', orderId);
    return !error;
  } catch {
    return false;
  }
};

export const saveSettingsToSupabase = async (settings: StoreSettings): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('store_settings').upsert({
      id: 'default',
      store_name: settings.storeName,
      whatsapp_number: settings.whatsappNumber,
      store_phone: settings.storePhone,
      announcement_text: settings.announcementText,
      free_shipping_threshold: settings.freeShippingThreshold,
      standard_shipping_fee: settings.standardShippingFee,
      currency: settings.currency,
    });
    return !error;
  } catch {
    return false;
  }
};

// ==========================================
// Customers & Notifications Supabase Sync
// ==========================================

export const fetchCustomersFromSupabase = async (): Promise<any[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('customers').select('*');
    if (error || !data) return null;

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      role: 'customer',
      createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '2026-01-01',
    }));
  } catch {
    return null;
  }
};

export const saveCustomerToSupabase = async (customer: {
  id: string;
  name: string;
  email: string;
  phone?: string;
}): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('customers').upsert({
      id: customer.id,
      name: customer.name,
      email: customer.email.toLowerCase(),
      phone: customer.phone || null,
      role: 'customer',
    });
    return !error;
  } catch {
    return false;
  }
};

export const fetchNotificationsFromSupabase = async (): Promise<any[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      targetAudience: n.target_audience || 'all',
      targetUserEmail: n.target_user_email || undefined,
      orderId: n.order_id || undefined,
      productId: n.product_id || undefined,
      read: Boolean(n.read),
      createdAt: new Date(n.created_at).toLocaleTimeString('ar-MA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  } catch {
    return null;
  }
};

export const saveNotificationToSupabase = async (notif: {
  id: string;
  type: string;
  title: string;
  message: string;
  targetAudience: string;
  targetUserEmail?: string;
  orderId?: string;
  productId?: string;
  read?: boolean;
}): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('notifications').insert({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      target_audience: notif.targetAudience,
      target_user_email: notif.targetUserEmail || null,
      order_id: notif.orderId || null,
      product_id: notif.productId || null,
      read: Boolean(notif.read),
    });
    return !error;
  } catch {
    return false;
  }
};

export const markNotificationReadInSupabase = async (id: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('notifications').update({ read: true }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
};

