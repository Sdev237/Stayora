import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  X,
  Calendar,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Check,
  Ban,
  Loader2,
  BellRing,
} from 'lucide-react';
import { GET_HOST_RESERVATIONS } from '../../graphql/queries';
import {
  CONFIRM_BOOKING_MUTATION,
  REJECT_BOOKING_MUTATION,
} from '../../graphql/mutations';
import { Booking } from '../../types';

interface HostReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed?: (bookingId: string) => void;
}

export const HostReservationsModal: React.FC<HostReservationsModalProps> = ({
  isOpen,
  onClose,
  onBookingConfirmed,
}) => {
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<{ hostReservations: Booking[] }>(
    GET_HOST_RESERVATIONS,
    {
      skip: !isOpen,
      fetchPolicy: 'network-only',
    }
  );

  const [confirmBooking] = useMutation(CONFIRM_BOOKING_MUTATION);
  const [rejectBooking] = useMutation(REJECT_BOOKING_MUTATION);

  if (!isOpen) return null;

  const reservations = data?.hostReservations || [];

  const handleConfirm = async (booking: Booking) => {
    setActiveActionId(booking.id);
    setSuccessNotice(null);
    try {
      await confirmBooking({
        variables: { bookingId: booking.id },
      });
      setSuccessNotice(`La réservation pour "${booking.listing?.title}" a été confirmée avec succès !`);
      await refetch();
      if (onBookingConfirmed) {
        onBookingConfirmed(booking.id);
      }
    } catch {
      //
    } finally {
      setActiveActionId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setActiveActionId(bookingId);
    setSuccessNotice(null);
    try {
      await rejectBooking({
        variables: { bookingId },
      });
      setSuccessNotice('La demande de réservation a été refusée.');
      await refetch();
    } catch {
      //
    } finally {
      setActiveActionId(null);
    }
  };

  const pendingCount = reservations.filter((r) => r.status === 'Pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-airbnb-dark">
                  Demandes de réservation reçues
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 animate-pulse">
                    {pendingCount} en attente
                  </span>
                )}
              </div>
              <p className="text-xs text-airbnb-gray">
                Validez les séjours réservés par vos voyageurs pour confirmer leur réservation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          {successNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-airbnb-gray gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-airbnb-coral" />
              <p className="text-sm">Chargement des réservations reçues...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-airbnb-dark">
                Aucune demande reçue pour l'instant
              </h3>
              <p className="text-sm text-airbnb-gray max-w-sm mx-auto">
                Les nouvelles réservations passées par les voyageurs sur vos annonces apparaîtront ici pour validation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-airbnb-gray">
                <span>{reservations.length} demande{reservations.length > 1 ? 's' : ''} au total</span>
                <button
                  onClick={() => refetch()}
                  className="text-airbnb-coral font-medium hover:underline"
                >
                  Actualiser la liste
                </button>
              </div>

              {reservations.map((booking) => {
                const coverImage =
                  booking.listing?.images?.find((img) => img.isCover)?.url ||
                  booking.listing?.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';

                const inDate = new Date(booking.checkIn).toLocaleDateString('fr-CA', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const outDate = new Date(booking.checkOut).toLocaleDateString('fr-CA', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                const isPending = booking.status === 'Pending';
                const isConfirmed = booking.status === 'Confirmed';
                const isProcessing = activeActionId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className={`flex flex-col md:flex-row gap-4 p-5 rounded-2xl border transition bg-white ${
                      isPending
                        ? 'border-amber-300 shadow-md ring-2 ring-amber-100'
                        : 'border-neutral-200'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="md:w-48 h-36 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
                      <img
                        src={coverImage}
                        alt={booking.listing?.title || 'Logement'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-airbnb-dark text-base">
                              {booking.listing?.title || 'Logement'}
                            </h4>
                            {booking.listing && (
                              <div className="flex items-center gap-1 text-xs text-airbnb-gray mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>
                                  {booking.listing.city}, {booking.listing.country}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 ${
                              isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isPending
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isConfirmed ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Confirmée
                              </>
                            ) : isPending ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-700" />
                                En attente de votre confirmation
                              </>
                            ) : (
                              'Refusée'
                            )}
                          </span>
                        </div>

                        {/* Traveler info & stay dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-100 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200 shrink-0">
                              {booking.user?.avatarUrl ? (
                                <img
                                  src={booking.user.avatarUrl}
                                  alt={booking.user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-neutral-500" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-airbnb-dark block">
                                {booking.user?.name || 'Voyageur'}
                              </span>
                              <span className="text-airbnb-gray text-[11px]">
                                {booking.user?.email}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-neutral-700 sm:justify-end">
                            <Calendar className="w-4 h-4 text-airbnb-coral shrink-0" />
                            <span>
                              {inDate} au {outDate} ({booking.guestCount} voy.)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                        <div className="text-sm">
                          <span className="text-xs text-airbnb-gray mr-2">Total perçu :</span>
                          <span className="font-bold text-airbnb-dark text-base">
                            {booking.totalPrice.toFixed(2)} $ CAD
                          </span>
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-2 ml-auto">
                            <button
                              type="button"
                              onClick={() => handleReject(booking.id)}
                              disabled={isProcessing}
                              className="px-3.5 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Refuser
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirm(booking)}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Confirmation...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 stroke-[3]" />
                                  Confirmer la réservation
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
