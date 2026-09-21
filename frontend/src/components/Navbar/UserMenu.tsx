import React, { useState, useRef, useEffect } from 'react';
import { Menu, User as UserIcon, Globe, Sparkles, LogOut, PlusCircle, BellRing } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserMenuProps {
  onOpenCreateListing?: () => void;
  onOpenTrips?: () => void;
  onOpenHostReservations?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  onOpenCreateListing,
  onOpenTrips,
  onOpenHostReservations,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isHost, logout, openAuthModal, switchToHost } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center gap-1 sm:gap-3" ref={menuRef}>
      {/* Host reservations manager button */}
      {isAuthenticated && isHost && onOpenHostReservations && (
        <button
          onClick={onOpenHostReservations}
          className="hidden md:flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-3 py-1.5 rounded-full transition cursor-pointer"
        >
          <BellRing className="w-4 h-4 text-cyan-600" />
          <span>Demandes reçues</span>
        </button>
      )}

      {/* Host CTA button */}
      <button
        onClick={() => {
          if (!isAuthenticated) {
            openAuthModal('login');
          } else if (!isHost) {
            switchToHost();
          } else if (onOpenCreateListing) {
            onOpenCreateListing();
          }
        }}
        className="hidden md:flex items-center gap-1.5 text-xs lg:text-sm font-semibold text-airbnb-dark px-3.5 py-2 rounded-full hover:bg-neutral-100 transition cursor-pointer"
      >
        {isHost ? (
          <>
            <PlusCircle className="w-4 h-4 text-cyan-600" />
            <span>Créer une annonce</span>
          </>
        ) : (
          <span>Mettre mon logement sur Stayora</span>
        )}
      </button>

      {/* Mes voyages quick button */}
      {isAuthenticated && onOpenTrips && (
        <button
          onClick={onOpenTrips}
          className="hidden sm:block text-xs lg:text-sm font-medium text-airbnb-dark px-3 py-2 rounded-full hover:bg-neutral-100 transition cursor-pointer"
        >
          Mes voyages
        </button>
      )}

      {/* Language / Globe Icon */}
      <button
        className="p-2.5 rounded-full hover:bg-neutral-100 text-airbnb-dark transition cursor-pointer hidden sm:block"
        aria-label="Sélectionner la langue"
      >
        <Globe className="w-4 h-4" />
      </button>

      {/* Profile / Menu Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 border border-airbnb-border rounded-full py-1.5 px-3 hover:shadow-md transition cursor-pointer bg-white"
        aria-label="Menu principal"
      >
        <Menu className="w-4 h-4 text-airbnb-dark" />
        <div className="w-7 h-7 rounded-full bg-neutral-600 text-white flex items-center justify-center overflow-hidden shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-white rounded-2xl shadow-airbnb-modal border border-neutral-100 py-2 z-50 animate-fade-in text-sm text-airbnb-dark">
          {isAuthenticated && user ? (
            <>
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-xs text-airbnb-gray truncate">{user.email}</p>
                <span className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isHost ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {isHost ? '★ Superhôte' : 'Voyageur'}
                </span>
              </div>

              {onOpenTrips && (
                <button
                  onClick={() => {
                    onOpenTrips();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 flex items-center gap-2 font-medium"
                >
                  <span className="text-airbnb-coral">✈</span>
                  Mes voyages & réservations
                </button>
              )}

              {!isHost && (
                <button
                  onClick={() => {
                    switchToHost();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 flex items-center gap-2 font-medium text-airbnb-coral"
                >
                  <Sparkles className="w-4 h-4" />
                  Passer en mode Hôte
                </button>
              )}

              {isHost && onOpenCreateListing && (
                <button
                  onClick={() => {
                    onOpenCreateListing();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 flex items-center gap-2 font-medium"
                >
                  <PlusCircle className="w-4 h-4 text-airbnb-coral" />
                  Publier un nouveau logement
                </button>
              )}

              {isHost && onOpenHostReservations && (
                <button
                  onClick={() => {
                    onOpenHostReservations();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 flex items-center gap-2 font-medium text-airbnb-dark"
                >
                  <BellRing className="w-4 h-4 text-airbnb-coral" />
                  Demandes de réservation reçues
                </button>
              )}

              <div className="border-t border-neutral-100 my-1"></div>

              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 flex items-center gap-2 text-rose-600 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  openAuthModal('register');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 font-semibold"
              >
                Inscription
              </button>
              <button
                onClick={() => {
                  openAuthModal('login');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 text-neutral-600"
              >
                Connexion
              </button>
              <div className="border-t border-neutral-100 my-1"></div>
              <button
                onClick={() => {
                  openAuthModal('login');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 text-neutral-600 text-xs"
              >
                Mettre mon logement sur Stayora
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 text-neutral-600 text-xs"
              >
                Centre d'aide
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
