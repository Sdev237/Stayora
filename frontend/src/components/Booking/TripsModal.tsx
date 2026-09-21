import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { X, Calendar, MapPin, CheckCircle, Clock, Plane, Loader2, CreditCard } from 'lucide-react';
import { GET_MY_BOOKINGS } from '../../graphql/queries';
import { Booking } from '../../types';

interface TripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectListing?: (listingId: string) => void;
}

export const TripsModal: React.FC<TripsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<{ myBookings: Booking[] }>(
    GET_MY_BOOKINGS,
    {
      skip: !isOpen,
      fetchPolicy: 'network-only',
    }
  );

  const handleConfirmPayment = async (booking: Booking) => {
    setConfirmingId(booking.id);
    try {
      await fetch('http://localhost:5193/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: booking.stripePaymentIntentId || `pi_sim_${Date.now()}`,
              amount: Math.round(booking.totalPrice * 100),
              currency: 'cad',
              metadata: {
                bookingId: booking.id,
              },
            },
          },
        }),
      });
      await refetch();
    } catch {
      //
    } finally {
      setConfirmingId(null);
    }
  };

  if (!isOpen) return null;

  const bookings = data?.myBookings || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-airbnb-coral" />
            <h2 className="text-xl font-bold text-airbnb-dark">Mes Voyages & Réservations</h2>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-airbnb-gray gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-airbnb-coral" />
              <p className="text-sm">Chargement de vos voyages...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto text-cyan-600">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-airbnb-dark">
                Aucun voyage réservé pour le moment
              </h3>
              <p className="text-sm text-airbnb-gray max-w-sm mx-auto">
                Il est temps de dépoussiérer vos valises et de planifier votre prochaine escapade en dollars canadiens !
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-500/20 transition cursor-pointer"
              >
                Explorer les logements
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-airbnb-gray">
                <span>{bookings.length} réservation{bookings.length > 1 ? 's' : ''} enregistrée{bookings.length > 1 ? 's' : ''}</span>
                <button
                  onClick={() => refetch()}
                  className="text-airbnb-coral font-medium hover:underline"
                >
                  Actualiser
                </button>
              </div>

              {bookings.map((booking) => {
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

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition bg-white"
                  >
                    <div className="sm:w-44 h-32 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
                      <img
                        src={coverImage}
                        alt={booking.listing?.title || 'Logement'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-airbnb-dark text-base line-clamp-1">
                            {booking.listing?.title || 'Séjour Stayora'}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1 ${
                              booking.status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {booking.status === 'Confirmed' ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Confirmée
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-700" />
                                En attente de confirmation par l'hôte
                              </>
                            )}
                          </span>
                        </div>

                        {booking.listing && (
                          <div className="flex items-center gap-1 text-xs text-airbnb-gray mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              {booking.listing.city}, {booking.listing.country}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-neutral-600 mt-2">
                          <Calendar className="w-3.5 h-3.5 text-airbnb-coral" />
                          <span>
                            Du {inDate} au {outDate} • {booking.guestCount} voyageur
                            {booking.guestCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 mt-3">
                        <span className="text-xs text-airbnb-gray">
                          Réf: <code className="font-mono">{booking.id.slice(0, 8)}...</code>
                        </span>

                        <div className="flex items-center gap-4 ml-auto">
                          {booking.status !== 'Confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(booking)}
                              disabled={confirmingId === booking.id}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 active:scale-95 text-white text-xs font-semibold shadow-xs shadow-cyan-500/20 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                            >
                              {confirmingId === booking.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Validation Stripe...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-3.5 h-3.5" />
                                  Payer & Confirmer ({booking.totalPrice.toFixed(2)} $ CAD)
                                </>
                              )}
                            </button>
                          )}

                          <div className="text-right">
                            <span className="text-xs text-airbnb-gray block">
                              {booking.status === 'Confirmed' ? 'Total réglé' : 'Montant dû'}
                            </span>
                            <span className="font-bold text-sm text-airbnb-dark">
                              {booking.totalPrice.toFixed(2)} $ CAD
                            </span>
                          </div>
                        </div>
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
