import { create } from 'zustand';

export interface User {
  id: string;
  walletAddress: string;
  plan: 'free' | 'pro' | 'elite';
}

interface AppState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('lr_token') : null,
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem('lr_token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('lr_token');
    set({ token: null, user: null });
  },
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
