import React, { useState } from 'react';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Listing } from '../../types';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [{ id: '1', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', isCover: true, displayOrder: 0 }];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group flex flex-col gap-2 cursor-pointer transition"
    >
      {/* Image Container & Carousel */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-200">
        <img
          src={images[currentImageIndex]?.url}
          alt={listing.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-500"
          loading="lazy"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={toggleLike}
          className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 active:scale-95 transition z-10"
          aria-label="Ajouter aux favoris"
        >
          <Heart
            className={`w-6 h-6 drop-shadow-md transition ${
              isLiked ? 'fill-airbnb-coral text-airbnb-coral' : 'fill-black/30 text-white stroke-[2]'
            }`}
          />
        </button>

        {/* Guest Favorite Badge */}
        {listing.rating >= 4.93 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-sm text-[11px] font-bold text-airbnb-dark z-10">
            Coup de cœur voyageurs
          </div>
        )}

        {/* Carousel Controls (visible when multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 z-10"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4 text-airbnb-dark" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 z-10"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4 text-airbnb-dark" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`block rounded-full transition-all duration-300 ${
                    idx === currentImageIndex
                      ? 'w-2 h-2 bg-white scale-110 shadow-xs'
                      : 'w-1.5 h-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Listing Details */}
      <div className="flex flex-col text-sm pt-1">
        <div className="flex items-center justify-between gap-1">
          <h3 className="font-semibold text-airbnb-dark truncate">
            {listing.city}, {listing.country}
          </h3>
          <div className="flex items-center gap-1 shrink-0 font-medium text-airbnb-dark">
            <Star className="w-3.5 h-3.5 fill-current text-airbnb-dark" />
            <span>{listing.rating.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-airbnb-gray text-xs truncate">
          {listing.propertyType} • {listing.category}
        </p>
        <p className="text-airbnb-gray text-xs">
          {listing.bedrooms} ch. • {listing.maxGuests} voyageurs
        </p>

        <div className="mt-1.5 flex items-baseline gap-1">
          <span className="font-bold text-airbnb-dark text-base">
            {listing.pricePerNight} $ CAD
          </span>
          <span className="text-airbnb-dark text-xs font-normal">
            par nuit
          </span>
        </div>
      </div>
    </div>
  );
};
