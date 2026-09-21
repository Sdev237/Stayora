import React, { useState } from 'react';
import { X, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Guest' | 'Host'>('Guest');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'Airbnb123!');
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion démo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-base text-airbnb-dark">
            {authModalMode === 'login' ? 'Connexion à Stayora' : 'Créer un compte'}
          </h3>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick Demo Logins */}
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80">
            <p className="text-xs font-bold text-airbnb-gray uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Comptes Démo Instantanés (1 Clic)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('guest@airbnb.com')}
                disabled={loading}
                className="px-3 py-2 bg-white rounded-xl border border-neutral-200 hover:border-neutral-400 text-xs font-semibold text-airbnb-dark flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                Voyageur
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('host@airbnb.com')}
                disabled={loading}
                className="px-3 py-2 bg-white rounded-xl border border-neutral-200 hover:border-neutral-400 text-xs font-semibold text-airbnb-dark flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                Hôte (Sophie)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-neutral-200 flex-1" />
            <span className="text-xs text-neutral-400 font-medium">ou via vos identifiants</span>
            <div className="h-px bg-neutral-200 flex-1" />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-airbnb-dark mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-airbnb-dark transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-airbnb-dark mb-1">
                    Type de profil
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('Guest')}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                        role === 'Guest'
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-bold'
                          : 'border-neutral-200 hover:border-neutral-400 text-neutral-600'
                      }`}
                    >
                      Voyageur
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('Host')}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                        role === 'Host'
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-bold'
                          : 'border-neutral-200 hover:border-neutral-400 text-neutral-600'
                      }`}
                    >
                      Hôte (Louer un bien)
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-airbnb-dark mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-airbnb-dark transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-airbnb-dark mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-airbnb-dark transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-semibold text-sm active:scale-98 transition shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'Chargement...'
                : authModalMode === 'login'
                ? 'Se connecter'
                : "S'inscrire"}
            </button>
          </form>

          {/* Switch tab */}
          <div className="pt-2 text-center text-xs text-airbnb-gray">
            {authModalMode === 'login' ? (
              <p>
                Vous n'avez pas de compte ?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="font-semibold text-airbnb-dark underline hover:text-black"
                >
                  Inscrivez-vous
                </button>
              </p>
            ) : (
              <p>
                Vous avez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="font-semibold text-airbnb-dark underline hover:text-black"
                >
                  Connectez-vous
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
