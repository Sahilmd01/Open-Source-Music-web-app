import { create } from "zustand";

export interface UserSession {
  id?: string;
  name: string;
  username?: string;
  email: string;
  role?: "user" | "admin" | string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  isVerified?: boolean;
}

interface UiState {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: UserSession | null;
  loginModalOpen: boolean;
  signupModalOpen: boolean;
  forgotPasswordModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openSignupModal: () => void;
  closeSignupModal: () => void;
  openForgotPasswordModal: () => void;
  closeForgotPasswordModal: () => void;
  login: (userData: UserSession) => void;
  logout: () => Promise<void>;
  checkAuthSession: () => Promise<void>;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  isAuthenticated: false,
  isAuthLoading: true,
  user: null,
  loginModalOpen: false,
  signupModalOpen: false,
  forgotPasswordModalOpen: false,
  openLoginModal: () => set({ loginModalOpen: true, signupModalOpen: false, forgotPasswordModalOpen: false }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  openSignupModal: () => set({ signupModalOpen: true, loginModalOpen: false, forgotPasswordModalOpen: false }),
  closeSignupModal: () => set({ signupModalOpen: false }),
  openForgotPasswordModal: () => set({ forgotPasswordModalOpen: true, loginModalOpen: false, signupModalOpen: false }),
  closeForgotPasswordModal: () => set({ forgotPasswordModalOpen: false }),
  login: (userData) =>
    set({
      isAuthenticated: true,
      user: userData,
      loginModalOpen: false,
      signupModalOpen: false,
      forgotPasswordModalOpen: false,
    }),
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    set({ isAuthenticated: false, user: null });
    // Stop playback when logging out
    try {
      const { usePlayerStore } = await import('@/stores/player-store');
      usePlayerStore.getState().seek(0);
      usePlayerStore.setState({ isPlaying: false });
    } catch {}
  },
  checkAuthSession: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          set({ isAuthenticated: true, user: data.user, isAuthLoading: false });
          return;
        }
      }
    } catch (e) {
      console.error('Session verify failed:', e);
    }
    set({ isAuthenticated: false, user: null, isAuthLoading: false });
  },
}));
