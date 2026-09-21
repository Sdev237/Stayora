import React, { useRef } from 'react';
import { 
  Waves, 
  Home, 
  Palmtree, 
  Castle, 
  Building2, 
  Tent, 
  Sailboat, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Compass
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  icon: React.ElementType;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'Tout', icon: Compass },
  { id: 'Amazing pools', name: 'Piscines remarquables', icon: Waves },
  { id: 'Cabins', name: 'Cabanes & Chalets', icon: Home },
  { id: 'Beachfront', name: 'Bord de mer', icon: Palmtree },
  { id: 'Mansions', name: 'Demeures d\'exception', icon: Castle },
  { id: 'Iconic cities', name: 'Villes emblématiques', icon: Building2 },
  { id: 'Tropical', name: 'Tropical & Forêt', icon: Sparkles },
  { id: 'Lakefront', name: 'Au bord du lac', icon: Sailboat },
  { id: 'Camping', name: 'Campings insolites', icon: Tent },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative border-b border-neutral-200/60 bg-white py-4">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 flex items-center gap-3">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex w-8 h-8 rounded-full border border-neutral-300 bg-white items-center justify-center hover:shadow-md hover:scale-105 transition shrink-0 z-10 cursor-pointer"
          aria-label="Défiler vers la gauche"
        >
          <ChevronLeft className="w-4 h-4 text-airbnb-dark" />
        </button>

        {/* Categories container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center gap-2 pb-2 transition cursor-pointer shrink-0 border-b-2 group ${
                  isSelected
                    ? 'border-cyan-600 text-cyan-600 font-bold'
                    : 'border-transparent text-airbnb-gray hover:text-airbnb-dark hover:border-neutral-300'
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition group-hover:scale-110 ${
                    isSelected ? 'text-cyan-600' : 'text-airbnb-gray group-hover:text-airbnb-dark'
                  }`}
                />
                <span className="text-xs tracking-tight whitespace-nowrap">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex w-8 h-8 rounded-full border border-neutral-300 bg-white items-center justify-center hover:shadow-md hover:scale-105 transition shrink-0 z-10 cursor-pointer"
          aria-label="Défiler vers la droite"
        >
          <ChevronRight className="w-4 h-4 text-airbnb-dark" />
        </button>
      </div>
    </div>
  );
};
