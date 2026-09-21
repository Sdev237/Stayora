import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Calendar, Users, Star, AlertCircle, Loader2, ShieldAlert, UserCheck } from 'lucide-react';
import { Listing, Booking, BookedDateRange } from '../../types';
import { GET_LISTING_BOOKED_DATES } from '../../graphql/queries';
import { CREATE_BOOKING_MUTATION } from '../../graphql/mutations';
import { useAuth } from '../../context/AuthContext';
import { StripePaymentModal } from './StripePaymentModal';

interface BookingWidgetProps {
  listing: Listing;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  listing,
  onBookingSuccess,
}) => {
  const { user, isAuthenticated, isHost, openAuthModal } = useAuth();

  const isOwner = Boolean(
    isAuthenticated &&
    user &&
    listing.host &&
    (listing.host.id === user.id || listing.host.email?.toLowerCase() === user.email?.toLowerCase())
  );

  const isHostAccount = Boolean(
    isAuthenticated &&
    !isOwner &&
    (isHost || user?.role === 'Host')
  );

  // Tomorrow as default check-in, 4 days later as check-out
  const today = new Date();
  const defaultCheckIn = new Date(today);
  defaultCheckIn.setDate(defaultCheckIn.getDate() + 1);
  const defaultCheckOut = new Date(defaultCheckIn);
  defaultCheckOut.setDate(defaultCheckOut.getDate() + 4);

  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(formatDateForInput(defaultCheckIn));
  const [checkOut, setCheckOut] = useState<string>(formatDateForInput(defaultCheckOut));
  const [guests, setGuests] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stripe modal state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Query booked dates for this listing
  const { data: bookedData } = useQuery<{ listingBookedDates: BookedDateRange[] }>(
    GET_LISTING_BOOKED_DATES,
    {
      variables: { listingId: listing.id },
      fetchPolicy: 'cache-and-network',
    }
  );

  const bookedRanges = useMemo(() => {
    return bookedData?.listingBookedDates || [];
  }, [bookedData]);

  // Mutation to create pending booking
  const [createBooking, { loading: isSubmitting }] = useMutation(
    CREATE_BOOKING_MUTATION
  );

  // Dynamic calculations
  const { nights, stayTotal, serviceFee, total, isDateConflict, invalidDateReason } =
    useMemo(() => {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
        return {
          nights: 0,
          stayTotal: 0,
          serviceFee: 0,
          total: 0,
          isDateConflict: true,
          invalidDateReason: 'Veuillez saisir des dates valides.',
        };
      }

      if (inDate < now) {
        return {
          nights: 0,
          stayTotal: 0,
          serviceFee: 0,
          total: 0,
          isDateConflict: true,
          invalidDateReason: 'La date d\'arrivée doit être future.',
        };
      }

      const diffMs = outDate.getTime() - inDate.getTime();
      const numNights = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (numNights <= 0) {
        return {
          nights: 0,
          stayTotal: 0,
          serviceFee: 0,
          total: 0,
          isDateConflict: true,
          invalidDateReason: 'La date de départ doit être après l\'arrivée.',
        };
      }

      // Check conflict with existing confirmed bookings
      const conflict = bookedRanges.some((range) => {
        const bookedStart = new Date(range.checkIn);
        const bookedEnd = new Date(range.checkOut);
        return inDate < bookedEnd && outDate > bookedStart;
      });

      if (conflict) {
        return {
          nights: numNights,
          stayTotal: 0,
          serviceFee: 0,
          total: 0,
          isDateConflict: true,
          invalidDateReason: 'Ces dates sont déjà réservées. Choisissez un autre séjour.',
        };
      }

      const stay = numNights * listing.pricePerNight;
      const fee = Math.round(stay * 0.14 * 100) / 100; // 14% Airbnb service fee
      const grandTotal = Math.round((stay + listing.cleaningFee + fee) * 100) / 100;

      return {
        nights: numNights,
        stayTotal: stay,
        serviceFee: fee,
        total: grandTotal,
        isDateConflict: false,
        invalidDateReason: null,
      };
    }, [checkIn, checkOut, bookedRanges, listing.pricePerNight, listing.cleaningFee]);

  const handleBookingSubmit = async () => {
    setErrorMsg(null);

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (isOwner) {
      setErrorMsg("Vous êtes le propriétaire de ce logement. Vous ne pouvez pas réserver votre propre annonce.");
      return;
    }

    if (isHostAccount) {
      setErrorMsg("Les réservations sur Stayora doivent être effectuées avec un compte Voyageur.");
      return;
    }

    if (isDateConflict) {
      setErrorMsg(invalidDateReason || 'Dates non disponibles.');
      return;
    }

    try {
      const response = await createBooking({
        variables: {
          input: {
            listingId: listing.id,
            checkIn: new Date(checkIn).toISOString(),
            checkOut: new Date(checkOut).toISOString(),
            guestCount: guests,
          },
        },
      });

      const payload = response.data?.createBooking;
      if (payload && payload.booking) {
        setPendingBooking(payload.booking);
        setClientSecret(payload.clientSecret);
        setIsPaymentOpen(true);
      } else {
        setErrorMsg('Une erreur est survenue lors de la réservation.');
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || 'Impossible de créer la réservation.');
    }
  };

  const handlePaymentFinished = () => {
    setIsPaymentOpen(false);
    if (pendingBooking && onBookingSuccess) {
      onBookingSuccess({
        ...pendingBooking,
        status: 'Confirmed',
      });
    }
  };

  const minCheckIn = formatDateForInput(today);
  const minCheckOut = checkIn || minCheckIn;

  return (
    <div className="sticky top-4 rounded-2xl border border-neutral-200 p-6 shadow-xl space-y-5 bg-white">
      {/* Price Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-airbnb-dark">
            {listing.pricePerNight} $ CAD
          </span>
          <span className="text-airbnb-gray text-sm"> / nuit</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-current text-airbnb-dark" />
          <span>{listing.rating.toFixed(2)}</span>
          <span className="text-airbnb-gray">({listing.reviewCount})</span>
        </div>
      </div>

      {/* Date & Guest Selectors Box */}
      <div className="border border-neutral-300 rounded-xl overflow-hidden divide-y divide-neutral-300 text-xs">
        <div className="grid grid-cols-2 divide-x divide-neutral-300">
          <div className="p-2.5 bg-white hover:bg-neutral-50 transition">
            <label className="font-bold block text-[10px] uppercase text-airbnb-gray mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-airbnb-coral" />
              Arrivée
            </label>
            <input
              type="date"
              min={minCheckIn}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full font-medium text-airbnb-dark bg-transparent outline-none cursor-pointer"
            />
          </div>
          <div className="p-2.5 bg-white hover:bg-neutral-50 transition">
            <label className="font-bold block text-[10px] uppercase text-airbnb-gray mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-airbnb-coral" />
              Départ
            </label>
            <input
              type="date"
              min={minCheckOut}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full font-medium text-airbnb-dark bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="p-2.5 bg-white hover:bg-neutral-50 transition">
          <label className="font-bold block text-[10px] uppercase text-airbnb-gray mb-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-airbnb-coral" />
            Voyageurs
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value, 10))}
            className="w-full font-medium text-airbnb-dark bg-transparent outline-none cursor-pointer"
          >
            {Array.from({ length: listing.maxGuests || 1 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num > 1 ? 'voyageurs' : 'voyageur'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conflicted or Invalid Date Warning */}
      {isDateConflict && invalidDateReason && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>{invalidDateReason}</span>
        </div>
      )}

      {/* Owner notice */}
      {isOwner && (
        <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl text-xs text-neutral-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
            <ShieldAlert className="w-4 h-4 text-neutral-600 shrink-0" />
            Votre propre hébergement
          </div>
          <p>Vous êtes l'hôte de ce logement. Vous ne pouvez pas réserver votre propre annonce.</p>
        </div>
      )}

      {/* Host account notice */}
      {isHostAccount && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-950">
            <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
            Compte Hôte détecté
          </div>
          <p>Les réservations s'effectuent exclusivement avec un compte <strong>Voyageur</strong>.</p>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="text-xs font-bold text-cyan-600 underline hover:text-cyan-800 block cursor-pointer"
          >
            Se connecter avec un compte Voyageur (guest@airbnb.com)
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {errorMsg}
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleBookingSubmit}
        disabled={isSubmitting || isDateConflict || isOwner || isHostAccount}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-semibold text-sm hover:opacity-95 active:scale-98 transition shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Préparation du séjour...
          </>
        ) : isOwner ? (
          'Hébergement dont vous êtes l\'hôte'
        ) : isHostAccount ? (
          'Compte Voyageur requis'
        ) : (
          'Réserver ce logement'
        )}
      </button>

      <p className="text-center text-xs text-airbnb-gray">
        Paiement sécurisé Stripe sur Stayora en Dollars Canadiens ($ CAD)
      </p>

      {/* Dynamic Price Breakdown */}
      {!isDateConflict && nights > 0 && (
        <div className="space-y-2.5 text-xs text-neutral-600 pt-3 border-t border-neutral-200">
          <div className="flex justify-between">
            <span className="underline">
              {listing.pricePerNight} $ CAD x {nights} {nights > 1 ? 'nuits' : 'nuit'}
            </span>
            <span>{stayTotal.toFixed(2)} $ CAD</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Frais de ménage</span>
            <span>{listing.cleaningFee.toFixed(2)} $ CAD</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Frais de service Stayora (14%)</span>
            <span>{serviceFee.toFixed(2)} $ CAD</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-airbnb-dark pt-2 border-t border-neutral-200">
            <span>Total avant taxes</span>
            <span className="text-cyan-600">{total.toFixed(2)} $ CAD</span>
          </div>
        </div>
      )}

      {/* Stripe Checkout Modal */}
      <StripePaymentModal
        isOpen={isPaymentOpen}
        booking={pendingBooking}
        clientSecret={clientSecret}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={handlePaymentFinished}
      />
    </div>
  );
};
