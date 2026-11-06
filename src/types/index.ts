export type ProductCategory =
  | 'plates'
  | 'glasses'
  | 'cookware'
  | 'pans_pots'
  | 'airfryer'
  | 'appliances'
  | 'ovens'
  | 'utensils'
  | 'spices'
  | 'tableware';

export interface CategoryInfo {
  id: ProductCategory | string;
  name: string;
  shortName: string;
  iconName: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory | string;
  price: number;
  originalPrice?: number;
  image: string; // Primary image
  images?: string[]; // Multiple additional images
  colors?: string[]; // Available color variants
  description: string;
  features: string[];
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewsCount: number;
  badge?: string; // e.g. "الأكثر طلباً", "جديد", "تخفيض خاص"
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  customerEmail?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cod'; // Cash on delivery
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string;
  storePhone: string;
  announcementText: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  currency: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
  lastUpdated?: string;
}

export interface StoreNotification {
  id: string;
  type:
    | 'new_order'
    | 'order_status'
    | 'product_added'
    | 'price_discount'
    | 'stock_alert'
    | 'customer_registered'
    | 'offer'
    | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  targetAudience: 'all' | 'admin' | 'customer'; // 'all' = everyone, 'admin' = managers, 'customer' = customer-specific
  targetUserEmail?: string; // If specific to one customer, their email (null/undefined if for admin or all)
  orderId?: string;
  productId?: string;
}

