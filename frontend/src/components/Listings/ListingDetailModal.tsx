import React from 'react';
import { X, Star, MapPin, ShieldCheck, Award } from 'lucide-react';
import { Listing, Booking } from '../../types';
import { BookingWidget } from '../Booking/BookingWidget';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onBookingSuccess?: (booking: Booking) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onBookingSuccess,
}) => {
  if (!listing) return null;

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [{ id: '1', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', isCover: true, displayOrder: 0 }];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-airbnb-dark">{listing.propertyType}</span>
            <span className="text-neutral-400">•</span>
            <span className="text-sm text-airbnb-gray">{listing.category}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Title & Stats */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-airbnb-dark tracking-tight">
              {listing.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-medium text-airbnb-dark">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-airbnb-dark" />
                <span>{listing.rating.toFixed(2)}</span>
                <span className="text-airbnb-gray">({listing.reviewCount} avis)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-airbnb-gray">
                <MapPin className="w-4 h-4 text-airbnb-dark" />
                <span>{listing.address}, {listing.city}, {listing.country}</span>
              </div>
            </div>
          </div>

          {/* Image Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden">
            <div className="md:col-span-2 aspect-video md:aspect-auto h-72 md:h-96">
              <img
                src={images[0]?.url}
                alt={listing.title}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="flex md:flex-col gap-3 h-32 md:h-96">
              {images.slice(1, 3).map((img, idx) => (
                <div key={idx} className="flex-1 h-full rounded-xl overflow-hidden">
                  <img
                    src={img.url}
                    alt={`${listing.title} ${idx + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details & Booking Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            {/* Left: Description, Capacity, Host */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                <div>
                  <h3 className="text-lg font-semibold text-airbnb-dark">
                    Logement entier hébergé par {listing.host?.name || 'Hôte vérifié'}
                  </h3>
                  <p className="text-sm text-airbnb-gray mt-1">
                    {listing.maxGuests} voyageurs • {listing.bedrooms} chambres • {listing.beds} lits • {listing.bathrooms} salles de bain
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-neutral-200">
                  <img
                    src={listing.host?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={listing.host?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-4 pb-6 border-b border-neutral-200 text-sm">
                <div className="flex items-start gap-4">
                  <Award className="w-5 h-5 text-airbnb-coral shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-airbnb-dark">Hôte d'expérience</h4>
                    <p className="text-airbnb-gray text-xs">
                      Cet hôte a reçu d'excellentes évaluations de la part des voyageurs récents.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-airbnb-coral shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-airbnb-dark">Protection StayoraCover incluse</h4>
                    <p className="text-airbnb-gray text-xs">
                      Chaque réservation comprend une protection gratuite contre les annulations de l'hôte.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-base mb-2">À propos de ce logement</h4>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Right: Booking Summary & Stripe Payment Widget */}
            <div className="lg:col-span-1">
              <BookingWidget
                listing={listing}
                onBookingSuccess={onBookingSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
