import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_LISTINGS } from './graphql/queries';
import { Listing } from './types';
import { Navbar } from './components/Navbar/Navbar';
import { CategoryFilter } from './components/Categories/CategoryFilter';
import { ListingExplorer } from './pages/ListingExplorer';
import { ListingDetailModal } from './components/Listings/ListingDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { TripsModal } from './components/Booking/TripsModal';
import { HostReservationsModal } from './components/Host/HostReservationsModal';
import { AuthModal } from './components/Auth/AuthModal';
import { Toast } from './components/UI/Toast';
import { FilterValues } from './components/SearchBar/FilterModal';
import { Globe } from 'lucide-react';

export const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isTripsOpen, setIsTripsOpen] = useState(false);
  const [isHostReservationsOpen, setIsHostReservationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterValues>({
    propertyTypes: [],
  });

  const { data, loading, error, refetch } = useQuery<{ searchListings: Listing[] }>(
    SEARCH_LISTINGS,
    {
      variables: {
        location: searchQuery.trim() || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        bedrooms: filters.bedrooms,
        beds: filters.beds,
        bathrooms: filters.bathrooms,
        propertyTypes: filters.propertyTypes.length > 0 ? filters.propertyTypes : undefined,
      },
      pollInterval: 30000,
    }
  );

  const listings = data?.searchListings || [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
        onOpenTrips={() => setIsTripsOpen(true)}
        onOpenHostReservations={() => setIsHostReservationsOpen(true)}
      />

      {/* 2. Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Error alert banner if GraphQL server is unreachable */}
      {error && (
        <div className="max-w-4xl mx-auto mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center justify-between">
          <span>Impossible de charger les annonces du backend GraphQL : {error.message}</span>
          <button
            onClick={() => refetch()}
            className="font-bold underline ml-4 hover:text-rose-950"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 3. Split-view Listings & Sticky Map */}
      <div className="flex-1">
        <ListingExplorer
          listings={listings}
          loading={loading}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onSelectListing={setSelectedListing}
          onResetFilters={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setFilters({ propertyTypes: [] });
          }}
          filters={filters}
          onApplyFilters={setFilters}
        />
      </div>

      {/* 4. Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50/80 py-8 mt-12 text-xs text-airbnb-gray">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <span>© 2026 Stayora, Inc. Plateforme de séjours et vacances en direct</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Confidentialité</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Conditions</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Plan du site</span>
          </div>
          <div className="flex items-center gap-6 font-semibold text-airbnb-dark">
            <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
              <Globe className="w-4 h-4" />
              <span>Français (FR)</span>
            </div>
            <div className="cursor-pointer hover:underline">
              <span>$ CAD</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Modals & Notifications */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onBookingSuccess={(booking) => {
          setSelectedListing(null);
          setIsTripsOpen(true);
          setToastMessage(
            `Demande de réservation envoyée (${booking.totalPrice.toFixed(2)} $ CAD) ! En attente de confirmation par l'hôte.`
          );
        }}
      />

      <TripsModal
        isOpen={isTripsOpen}
        onClose={() => setIsTripsOpen(false)}
      />

      <HostReservationsModal
        isOpen={isHostReservationsOpen}
        onClose={() => setIsHostReservationsOpen(false)}
        onBookingConfirmed={() => setToastMessage('Réservation confirmée avec succès ! Le voyageur en a été informé.')}
      />

      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onSuccess={(msg) => setToastMessage(msg)}
      />

      <AuthModal />

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
