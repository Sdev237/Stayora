import React, { useState } from 'react';
import { Listing } from '../types';
import { ListingCard } from '../components/Listings/ListingCard';
import { ListingMap } from '../components/Map/ListingMap';
import { Map, List, SlidersHorizontal, SearchX } from 'lucide-react';
import { FilterModal, FilterValues } from '../components/SearchBar/FilterModal';

interface ListingExplorerProps {
  listings: Listing[];
  loading: boolean;
  selectedCategory: string;
  searchQuery: string;
  onSelectListing: (listing: Listing) => void;
  onResetFilters: () => void;
  filters: FilterValues;
  onApplyFilters: (filters: FilterValues) => void;
}

export const ListingExplorer: React.FC<ListingExplorerProps> = ({
  listings,
  loading,
  onSelectListing,
  onResetFilters,
  filters,
  onApplyFilters,
}) => {
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const activeFilterCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.bedrooms ? 1 : 0) +
    (filters.beds ? 1 : 0) +
    (filters.bathrooms ? 1 : 0) +
    filters.propertyTypes.length;

  if (loading) {
    return (
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <div className="aspect-square w-full rounded-2xl bg-neutral-200" />
              <div className="h-4 bg-neutral-200 rounded w-2/3" />
              <div className="h-3 bg-neutral-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-4">
      {/* Subheader Toolbar: Results count & Filters button */}
      <div className="flex items-center justify-between pb-4">
        <span className="text-sm font-semibold text-airbnb-dark">
          {listings.length} {listings.length > 1 ? 'logements trouvés' : 'logement trouvé'}
        </span>

        <button
          onClick={() => setIsFilterModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
            activeFilterCount > 0
              ? 'border-airbnb-dark bg-neutral-50 ring-1 ring-airbnb-dark'
              : 'border-neutral-300 hover:border-neutral-900 bg-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtres</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-airbnb-coral text-white text-[11px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="max-w-md mx-auto py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-airbnb-dark mb-2">Aucun logement trouvé</h3>
          <p className="text-sm text-airbnb-gray mb-6">
            Essayez de réinitialiser vos critères ou d'élargir la fourchette de prix.
          </p>
          <button
            onClick={onResetFilters}
            className="px-6 py-2.5 rounded-xl bg-airbnb-dark text-white text-sm font-semibold hover:bg-black transition cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        /* Split View Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Listings Grid */}
          <div
            className={`lg:col-span-7 xl:col-span-8 ${
              showMapOnMobile ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-x-5 gap-y-8">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className={`transition duration-200 rounded-2xl ${
                    hoveredListingId === listing.id ? 'ring-2 ring-airbnb-dark scale-[1.02]' : ''
                  }`}
                >
                  <ListingCard listing={listing} onSelect={onSelectListing} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Sticky Map Container */}
          <div
            className={`lg:col-span-5 xl:col-span-4 sticky top-28 h-[calc(100vh-140px)] ${
              showMapOnMobile ? 'block h-[calc(100vh-140px)]' : 'hidden lg:block'
            }`}
          >
            <ListingMap
              listings={listings}
              selectedListingId={hoveredListingId}
              onSelectListing={onSelectListing}
              onHoverListing={setHoveredListingId}
            />
          </div>
        </div>
      )}

      {/* Floating View Toggle Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setShowMapOnMobile(!showMapOnMobile)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-airbnb-dark text-white text-xs sm:text-sm font-semibold shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          {showMapOnMobile ? (
            <>
              <List className="w-4 h-4" />
              <span>Afficher la liste</span>
            </>
          ) : (
            <>
              <Map className="w-4 h-4" />
              <span>Afficher la carte</span>
            </>
          )}
        </button>
      </div>

      {/* Granular Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={onApplyFilters}
      />
    </div>
  );
};
