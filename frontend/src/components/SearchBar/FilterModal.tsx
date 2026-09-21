import React, { useState } from 'react';
import { X, Plus, Minus, SlidersHorizontal } from 'lucide-react';

export interface FilterValues {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  propertyTypes: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

const PROPERTY_TYPE_OPTIONS = [
  'Logement entier',
  'Chambre privée',
  'Villa de luxe',
  'Chalet alpin',
  'Maison de plage',
  'Penthouse',
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [minPrice, setMinPrice] = useState<number>(filters.minPrice ?? 50);
  const [maxPrice, setMaxPrice] = useState<number>(filters.maxPrice ?? 1000);
  const [bedrooms, setBedrooms] = useState<number>(filters.bedrooms ?? 0);
  const [beds, setBeds] = useState<number>(filters.beds ?? 0);
  const [bathrooms, setBathrooms] = useState<number>(filters.bathrooms ?? 0);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(filters.propertyTypes ?? []);

  if (!isOpen) return null;

  const togglePropertyType = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter((t) => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const handleClear = () => {
    setMinPrice(50);
    setMaxPrice(1000);
    setBedrooms(0);
    setBeds(0);
    setBathrooms(0);
    setPropertyTypes([]);
  };

  const handleApply = () => {
    onApplyFilters({
      minPrice: minPrice > 50 ? minPrice : undefined,
      maxPrice: maxPrice < 1000 ? maxPrice : undefined,
      bedrooms: bedrooms > 0 ? bedrooms : undefined,
      beds: beds > 0 ? beds : undefined,
      bathrooms: bathrooms > 0 ? bathrooms : undefined,
      propertyTypes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-base text-airbnb-dark flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filtres avancés
          </h3>
          <div className="w-8" />
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm text-airbnb-dark">
          {/* 1. Price Range */}
          <div className="space-y-4 pb-6 border-b border-neutral-100">
            <h4 className="font-bold text-base">Fourchette de prix ($ CAD par nuit)</h4>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 p-3 rounded-2xl border border-neutral-200">
                <span className="block text-[10px] uppercase font-bold text-airbnb-gray">Prix minimum</span>
                <div className="flex items-center gap-1 font-bold text-base mt-1">
                  <input
                    type="number"
                    min={0}
                    max={maxPrice - 10}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-hidden"
                  />
                  <span className="text-xs text-airbnb-gray shrink-0">$ CAD</span>
                </div>
              </div>
              <span className="text-neutral-400 font-bold">-</span>
              <div className="flex-1 p-3 rounded-2xl border border-neutral-200">
                <span className="block text-[10px] uppercase font-bold text-airbnb-gray">Prix maximum</span>
                <div className="flex items-center gap-1 font-bold text-base mt-1">
                  <input
                    type="number"
                    min={minPrice + 10}
                    max={5000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-hidden"
                  />
                  <span className="text-xs text-airbnb-gray shrink-0">$ CAD</span>
                </div>
              </div>
            </div>
            <input
              type="range"
              min={50}
              max={1500}
              step={25}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-airbnb-coral cursor-pointer"
            />
          </div>

          {/* 2. Rooms & Beds */}
          <div className="space-y-4 pb-6 border-b border-neutral-100">
            <h4 className="font-bold text-base">Chambres et lits</h4>
            {[
              { label: 'Chambres', value: bedrooms, set: setBedrooms },
              { label: 'Lits', value: beds, set: setBeds },
              { label: 'Salles de bain', value: bathrooms, set: setBathrooms },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <span className="font-medium text-airbnb-dark">{item.label}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={item.value <= 0}
                    onClick={() => item.set(Math.max(0, item.value - 1))}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-20 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">
                    {item.value === 0 ? 'Tout' : `${item.value}+`}
                  </span>
                  <button
                    type="button"
                    onClick={() => item.set(item.value + 1)}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Property Types */}
          <div className="space-y-3">
            <h4 className="font-bold text-base">Type d'hébergement</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {PROPERTY_TYPE_OPTIONS.map((type) => {
                const isSelected = propertyTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => togglePropertyType(type)}
                    className={`p-3 rounded-2xl border text-xs font-semibold text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500 font-bold'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-white">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-bold text-airbnb-dark underline hover:opacity-80 transition cursor-pointer"
          >
            Tout effacer
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-airbnb-dark text-white text-xs font-bold hover:bg-black transition cursor-pointer"
          >
            Afficher les résultats
          </button>
        </div>
      </div>
    </div>
  );
};
