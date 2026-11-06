import React from 'react';
import {
  Flame,
  Zap,
  Wine,
  Disc,
  Soup,
  Cpu,
  SquareDot,
  Grid,
  Utensils,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Flame':
      return <Flame className="w-4 h-4 shrink-0" />;
    case 'Zap':
      return <Zap className="w-4 h-4 shrink-0" />;
    case 'Wine':
      return <Wine className="w-4 h-4 shrink-0" />;
    case 'Disc':
      return <Disc className="w-4 h-4 shrink-0" />;
    case 'Soup':
      return <Soup className="w-4 h-4 shrink-0" />;
    case 'Cpu':
      return <Cpu className="w-4 h-4 shrink-0" />;
    case 'SquareDot':
      return <SquareDot className="w-4 h-4 shrink-0" />;
    case 'Grid':
      return <Grid className="w-4 h-4 shrink-0" />;
    case 'Utensils':
      return <Utensils className="w-4 h-4 shrink-0" />;
    case 'Sparkles':
      return <Sparkles className="w-4 h-4 shrink-0" />;
    default:
      return <Layers className="w-4 h-4 shrink-0" />;
  }
};

export const CategoryBar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, products } = useStore();

  const getProductCount = (catId: string) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <div className="bg-white border-b border-stone-200 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
          {/* All products button */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>جميع الأقسام</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-amber-700 text-white'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {getProductCount('all')}
            </span>
          </button>

          {/* 10 Required Categories */}
          {categories.map((cat) => {
            const count = getProductCount(cat.id);
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-amber-700 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
