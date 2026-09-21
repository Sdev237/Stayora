import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Closed / Capsule State */}
      <div
        onClick={() => setIsExpanded(true)}
        className="flex items-center border border-airbnb-border rounded-full py-2 px-4 shadow-sm hover:shadow-md transition cursor-pointer text-sm font-medium divide-x divide-neutral-200"
      >
        <button className="px-3 text-airbnb-dark font-semibold truncate hover:opacity-80">
          {searchQuery ? searchQuery : "N'importe où"}
        </button>
        <button className="px-3 text-airbnb-dark font-semibold hidden sm:block hover:opacity-80">
          Une semaine
        </button>
        <div className="flex items-center pl-3 gap-3">
          <span className="text-airbnb-gray font-normal hidden md:inline">
            Ajouter des voyageurs
          </span>
          <div className="w-8 h-8 rounded-full bg-airbnb-coral text-white flex items-center justify-center shrink-0 shadow-sm">
            <Search className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Expanded Fast Search Dropdown */}
      {isExpanded && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
            onClick={() => setIsExpanded(false)}
          />
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[90vw] max-w-lg bg-white rounded-3xl p-5 shadow-airbnb-modal z-50 border border-neutral-100 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-airbnb-dark">Rechercher une destination</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center bg-neutral-100 rounded-full px-4 py-3 gap-3 border border-transparent focus-within:border-airbnb-dark focus-within:bg-white transition">
              <Search className="w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Ex: Santorin, Paris, Bali, New York..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-airbnb-dark focus:outline-hidden"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded-full hover:bg-neutral-200 text-neutral-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Popular quick picks */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-airbnb-gray mb-2">
                Destinations populaires
              </p>
              <div className="flex flex-wrap gap-2">
                {['Santorin', 'Chamonix', 'New York', 'Bali', 'Paris', 'Formentera', 'Tromsø'].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      onSearchChange(city);
                      setIsExpanded(false);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      searchQuery.toLowerCase() === city.toLowerCase()
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-bold'
                        : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
