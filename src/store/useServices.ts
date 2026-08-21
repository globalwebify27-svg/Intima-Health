import { create } from 'zustand';

interface ServicesState {
  services: any[];
  loading: boolean;
  fetched: boolean;
  fetchServices: () => Promise<void>;
}

export const useServices = create<ServicesState>((set, get) => ({
  services: [],
  loading: false,
  fetched: false,
  fetchServices: async () => {
    if (get().fetched || get().loading) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success) {
        set({ services: data.data, fetched: true });
      }
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  }
}));
