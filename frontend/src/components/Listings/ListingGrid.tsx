import React from 'react';
import { Listing } from '../../types';
import { ListingCard } from './ListingCard';
import { SearchX } from 'lucide-react';

interface ListingGridProps {
  listings: Listing[];
  loading: boolean;
  onSelectListing: (listing: Listing) => void;
  onResetFilters: () => void;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  loading,
  onSelectListing,
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-3 animate-pulse">
              <div className="aspect-square w-full rounded-2xl bg-neutral-200" />
              <div className="flex justify-between items-center">
                <div className="h-4 bg-neutral-200 rounded w-2/3" />
                <div className="h-4 bg-neutral-200 rounded w-10" />
              </div>
              <div className="h-3 bg-neutral-200 rounded w-1/2" />
              <div className="h-4 bg-neutral-200 rounded w-1/3 mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-airbnb-dark mb-2">
          Aucun logement trouvé
        </h3>
        <p className="text-sm text-airbnb-gray mb-6">
          Essayez de modifier ou de réinitialiser vos critères de recherche pour découvrir d'autres hébergements.
        </p>
        <button
          onClick={onResetFilters}
          className="px-6 py-2.5 rounded-xl bg-airbnb-dark text-white text-sm font-semibold hover:bg-black transition cursor-pointer"
        >
          Afficher tous les logements
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onSelect={onSelectListing}
          />
        ))}
      </div>
    </main>
  );
};
