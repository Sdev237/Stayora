import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { User, AuthPayload } from '../types';
import { LOGIN_MUTATION, REGISTER_MUTATION, SWITCH_TO_HOST_MUTATION } from '../graphql/mutations';
import { GET_ME } from '../graphql/queries';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHost: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'Guest' | 'Host') => Promise<void>;
  logout: () => void;
  switchToHost: () => Promise<void>;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('airbnb_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('airbnb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [loginMutation] = useMutation<{ login: AuthPayload }>(LOGIN_MUTATION);
  const [registerMutation] = useMutation<{ register: AuthPayload }>(REGISTER_MUTATION);
  const [switchHostMutation] = useMutation<{ switchToHostRole: AuthPayload }>(SWITCH_TO_HOST_MUTATION);
  const [fetchMe] = useLazyQuery<{ me: User }>(GET_ME, { fetchPolicy: 'network-only' });

  useEffect(() => {
    if (token && !user) {
      fetchMe()
        .then(res => {
          if (res.data?.me) {
            setUser(res.data.me);
            localStorage.setItem('airbnb_user', JSON.stringify(res.data.me));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const saveAuthSession = (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('airbnb_token', authToken);
    localStorage.setItem('airbnb_user', JSON.stringify(authUser));
  };

  const login = async (email: string, password: string) => {
    const res = await loginMutation({
      variables: { input: { email, password } },
    });
    if (res.data?.login) {
      saveAuthSession(res.data.login.token, res.data.login.user);
      setAuthModalOpen(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'Guest' | 'Host' = 'Guest') => {
    const res = await registerMutation({
      variables: { input: { name, email, password, role } },
    });
    if (res.data?.register) {
      saveAuthSession(res.data.register.token, res.data.register.user);
      setAuthModalOpen(false);
    }
  };

  const switchToHost = async () => {
    if (!token) return;
    const res = await switchHostMutation();
    if (res.data?.switchToHostRole) {
      saveAuthSession(res.data.switchToHostRole.token, res.data.switchToHostRole.user);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('airbnb_token');
    localStorage.removeItem('airbnb_user');
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isHost: user?.role === 'Host',
        login,
        register,
        logout,
        switchToHost,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
