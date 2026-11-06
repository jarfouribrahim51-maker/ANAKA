import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Phone,
  ShieldCheck,
  X,
  User,
  Bell,
} from 'lucide-react';

import { useStore } from '../context/StoreContext';


export const Navbar: React.FC = () => {
  const {
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    settings,
    activeView,
    setActiveView,
    currentUser,
    isAdminLoggedIn,
    setIsAuthModalOpen,
    setIsCustomerProfileOpen,
    userNotifications,
    unreadUserNotificationsCount,
    markNotificationAsRead,
  } = useStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);



  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top promotional announcement strip */}
      <div className="bg-stone-900 text-stone-100 px-4 py-2 text-xs md:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
            <p className="truncate">{settings.announcementText}</p>
          </div>
          <div className="hidden sm:flex items-center gap-6 shrink-0 text-stone-300 text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ضمان الجودة 100%
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              خدمة الزبناء: {settings.storePhone}
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-20">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('store')}
              className="text-right group focus:outline-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-xl shadow-sm group-hover:bg-amber-700 transition-colors">
                  أ
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 group-hover:text-amber-700 transition-colors">
                    دار الأواني المغربية – Dar El Awani
                  </h1>
                  <span className="block text-[11px] text-stone-500 font-medium tracking-wider">
                    متجر الأواني ومستلزمات المطبخ العصري بالمغرب
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Large, Clear Search Bar (Desktop & Tablet) */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن أي منتج: كوكوط، Air Fryer، كيسان، طناجر، مقالي، هاشوار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-stone-100 hover:bg-stone-50 focus:bg-white text-sm font-medium text-stone-900 rounded-2xl border border-stone-200 focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all placeholder:text-stone-400 shadow-xs"
              />
              <Search className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Zone: Unified Auth Button & Shopping Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Standard Login / Customer Account Button (Prominent & Clear) */}
            {!currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-black shadow-sm transition-all focus:ring-2 focus:ring-amber-500/30"
                title="تسجيل الدخول إلى حسابك"
              >
                <User className="w-4 h-4 text-white" />
                <span>تسجيل الدخول</span>
              </button>
            ) : currentUser.role === 'admin' ? (

              /* Admin is logged in: clean switch */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView(activeView === 'admin' ? 'store' : 'admin')}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activeView === 'admin' ? 'تصفح المتجر' : 'لوحة التحكم'}</span>
                </button>
                <button
                  onClick={() => setIsCustomerProfileOpen(true)}
                  className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                  title="بيانات الحساب"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Regular Customer is logged in */
              <button
                onClick={() => setIsCustomerProfileOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs sm:text-sm font-bold transition-all"
                title="حسابي"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-600 text-white text-[11px] font-black flex items-center justify-center">
                  {currentUser.name ? currentUser.name.charAt(0) : 'ح'}
                </div>
                <span className="max-w-[110px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>
            )}

            {/* Notification Bell Dropdown (Synchronized for Customer & Admin) */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 rounded-xl transition-all"
                title="الإشعارات"
                aria-label="عرض الإشعارات"
              >
                <Bell className="w-4 h-4" />
                {unreadUserNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadUserNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div
                  className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 z-50 text-right animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">الإشعارات والتنبيهات</span>
                      {unreadUserNotificationsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {unreadUserNotificationsCount} جديد
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-stone-400 hover:text-stone-700 text-xs p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {userNotifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-stone-400">
                      <Bell className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
                      <p>لا توجد إشعارات جديدة حالياً</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {userNotifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            notif.read
                              ? 'bg-white border-stone-100 text-stone-600'
                              : 'bg-amber-50/60 border-amber-200 text-stone-900 font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-stone-800 line-clamp-1">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                              {notif.createdAt}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                            {notif.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 active:scale-95"
              aria-label="عرض سلة التسوق"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-stone-900 text-amber-300 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-amber-600">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-[11px] text-amber-100 font-medium">السلة</span>
                <span className="text-xs font-bold tabular-nums">
                  {cartSubtotal} {settings.currency}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar: Large and Prominent */}
        <div className="pb-3.5 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن: كوكوط، Air Fryer، كيسان، طناجر، مقالي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-11 py-2.5 bg-stone-100 text-sm font-medium text-stone-900 rounded-xl border border-stone-200 focus:bg-white focus:border-amber-600 focus:outline-none placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
