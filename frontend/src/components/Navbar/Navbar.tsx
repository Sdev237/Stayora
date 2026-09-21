import React from 'react';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateListing?: () => void;
  onOpenTrips?: () => void;
  onOpenHostReservations?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateListing,
  onOpenTrips,
  onOpenHostReservations,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200/80 transition-all duration-200">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 h-20 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => onSearchChange('')}>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-cyan-500/25 transition hover:scale-105">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="font-extrabold text-2xl text-cyan-600 hidden sm:inline tracking-tight">
            stayora
          </span>
        </div>

        {/* Center: Search Bar Capsule */}
        <div className="flex-1 max-w-md mx-2">
          <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
        </div>

        {/* Right: Host Switch & Profile */}
        <div className="shrink-0">
          <UserMenu
            onOpenCreateListing={onOpenCreateListing}
            onOpenTrips={onOpenTrips}
            onOpenHostReservations={onOpenHostReservations}
          />
        </div>
      </div>
    </header>
  );
};

