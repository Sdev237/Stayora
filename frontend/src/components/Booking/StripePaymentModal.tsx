import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, CreditCard, Loader2, Lock } from 'lucide-react';
import { Booking } from '../../types';

interface StripePaymentModalProps {
  isOpen: boolean;
  booking: Booking | null;
  clientSecret: string | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  booking,
  clientSecret,
  onClose,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState('Voyageur Stayora');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Trigger Stripe Webhook endpoint to transition booking status to "Confirmed"
      const response = await fetch('http://localhost:5193/api/webhooks/stripe', {
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

      if (!response.ok) {
        throw new Error('Erreur lors de la validation du paiement avec le serveur.');
      }

      setIsProcessing(false);
      setIsCompleted(true);

      // Redirect after showing confirmation
      setTimeout(() => {
        setIsCompleted(false);
        onPaymentSuccess();
      }, 1500);
    } catch (err: unknown) {
      const e = err as Error;
      setIsProcessing(false);
      setErrorMessage(e.message || 'Échec de la confirmation du paiement.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-airbnb-dark">
                Paiement sécurisé Stripe
              </h3>
              <p className="text-[11px] text-airbnb-gray">
                Montant total en Dollars Canadiens ($ CAD)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {isCompleted ? (
            <div className="text-center py-8 space-y-4 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-airbnb-dark">
                Paiement Confirmé !
              </h4>
              <p className="text-sm text-airbnb-gray max-w-xs mx-auto">
                Votre séjour a été réglé avec succès pour un montant de{' '}
                <span className="font-bold text-airbnb-dark">
                  {booking.totalPrice.toFixed(2)} $ CAD
                </span>
                .
              </p>
              <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600 font-mono">
                Réservation #{booking.id.slice(0, 8)} • Statut : Confirmée
              </div>
              <p className="text-xs text-neutral-400">
                Redirection automatique vers vos voyages...
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmPayment} className="space-y-5">
              {/* Order Summary Card */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-airbnb-gray font-medium">
                    {booking.guestCount} voyageur{booking.guestCount > 1 ? 's' : ''} • Dates sélectionnées
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    En attente de règlement
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1 border-t border-neutral-200">
                  <span className="font-bold text-sm text-airbnb-dark">Montant à régler</span>
                  <span className="text-xl font-black text-airbnb-coral">
                    {booking.totalPrice.toFixed(2)} $ CAD
                  </span>
                </div>
              </div>

              {/* Stripe Test Mode Banner */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Stripe Test Simulator & Chiffrement SSL 256-bit
                </div>
                <p className="text-[11px] text-emerald-700">
                  Une carte de test standard (4242) est pré-remplie ci-dessous pour valider instantanément votre réservation.
                </p>
              </div>

              {/* Card Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-airbnb-dark mb-1">
                    Titulaire de la carte
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium outline-none focus:border-black transition"
                    placeholder="Nom complet"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-airbnb-dark mb-1">
                    Numéro de carte
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono outline-none focus:border-black transition"
                      placeholder="4242 4242 4242 4242"
                    />
                    <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-airbnb-dark mb-1">
                      Expiration (MM/AA)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono outline-none focus:border-black transition"
                      placeholder="12/28"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-airbnb-dark mb-1">
                      Code CVC
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-neutral-300 text-sm font-mono outline-none focus:border-black transition"
                        placeholder="123"
                      />
                      <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3" />
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              {clientSecret && (
                <p className="text-[10px] text-neutral-400 font-mono truncate">
                  Intent ref: {clientSecret.slice(0, 24)}...
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 py-3 border border-neutral-300 rounded-xl font-medium text-sm text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-md shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Validation Stripe...
                    </>
                  ) : (
                    `Payer ${booking.totalPrice.toFixed(2)} $ CAD`
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
