import { create } from 'zustand';

interface BookingModalState {
  isOpen: boolean;
  prefilledData?: {
    city?: string;
    clinic?: string;
    doctorId?: string;
    service?: string;
  };
  openBooking: (data?: BookingModalState['prefilledData']) => void;
  closeBooking: () => void;
}

export const useBookingModal = create<BookingModalState>((set) => ({
  isOpen: false,
  prefilledData: undefined,
  openBooking: (data) => set({ isOpen: true, prefilledData: data }),
  closeBooking: () => set({ isOpen: false, prefilledData: undefined }),
}));
