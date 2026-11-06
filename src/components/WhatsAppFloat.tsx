import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WhatsAppFloat: React.FC = () => {
  const { settings } = useStore();
  const [showTooltip, setShowTooltip] = useState(true);

  const defaultMessage = `السلام عليكم ورحمة الله، بغيت نستفسر على بعض الأواني ومستلزمات المطبخ فمتجر ${settings.storeName}.`;

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-stone-800 text-xs py-2 px-3.5 rounded-2xl shadow-xl border border-stone-200 animate-in fade-in slide-in-from-left duration-300">
          <span>مرحبا بك! تواصل معنا مباشرة على واتساب 💬</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-stone-400 hover:text-stone-600 p-0.5"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
          defaultMessage
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full shadow-2xl transition-all duration-300 hover:shadow-emerald-500/30"
        aria-label="تواصل معنا عبر واتساب"
        title="تواصل معنا عبر واتساب"
      >
        {/* Radar ping ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-30 group-hover:animate-ping pointer-events-none" />

        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
};
