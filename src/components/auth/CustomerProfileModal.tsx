import {
  X,
  User,
  ShoppingBag,
  LogOut,
  SlidersHorizontal,
  Mail,
  Phone,
  Calendar,
  Package,
  MessageCircle,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CustomerProfileModal: React.FC = () => {
  const {
    isCustomerProfileOpen,
    setIsCustomerProfileOpen,
    currentUser,
    logout,
    getCustomerOrders,
    setActiveView,
    settings,
    userNotifications,
    markNotificationAsRead,
  } = useStore();


  if (!isCustomerProfileOpen || !currentUser) return null;

  const orders = getCustomerOrders(currentUser.email);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-right">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsCustomerProfileOpen(false)}
          className="absolute top-4 left-4 p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-stone-100">
          <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            {currentUser.name ? currentUser.name.charAt(0) : 'ح'}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              {currentUser.name}
            </h3>
            <p className="text-xs text-stone-500 font-mono" dir="ltr">
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* Details Cards */}
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">رقم الهاتف</span>
                <span className="font-semibold text-stone-800" dir="ltr">
                  {currentUser.phone || 'غير محدد'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">تاريخ الانضمام</span>
                <span className="font-semibold text-stone-800">
                  {currentUser.createdAt || '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin shortcut if logged in as admin */}
          {currentUser.role === 'admin' && (
            <div className="p-4 bg-stone-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-400">صلاحيات الإدارة مفعلة</p>
                <p className="text-[11px] text-stone-300">
                  يمكنك إدارة المنتجات والطلبات والأسعار من لوحة التحكم
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCustomerProfileOpen(false);
                  setActiveView('admin');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                فتح لوحة الإدارة
              </button>
            </div>
          )}

          {/* Customer Orders History */}
          <div>
            <h4 className="font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span>طلبياتي السابقة ({orders.length})</span>
            </h4>

            {orders.length === 0 ? (
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p>لا توجد لديك أي طلبيات مسجلة بعد.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-amber-700">
                        {ord.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {ord.status === 'delivered' ? 'تم التسليم' : 'قيد المعالجة'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-500 text-[11px]">
                      <span>{ord.createdAt}</span>
                      <span className="font-bold text-stone-800 tabular-nums">
                        {ord.total} {settings.currency} ({ord.items.length} منتجات)
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-stone-200 flex justify-end">
                      <a
                        href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                          `السلام عليكم، بغيت نسول على وضعية طلبيتي رقم ${ord.orderNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>تتبع الطلبية عبر واتساب</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Notifications Section */}
          <div className="pt-3 border-t border-stone-100">
            <h4 className="font-bold text-sm text-stone-900 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>إشعاراتي وتحديثات طلبياتي ({userNotifications.length})</span>
              </span>
            </h4>

            {userNotifications.length === 0 ? (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs text-stone-400">
                لا توجد إشعارات جديدة لحسابك.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {userNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      notif.read
                        ? 'bg-stone-50/70 border-stone-200 text-stone-600'
                        : 'bg-amber-50 border-amber-300 text-stone-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-amber-900">{notif.title}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{notif.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => {
              logout();
              setIsCustomerProfileOpen(false);
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>

          <button
            onClick={() => setIsCustomerProfileOpen(false)}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
