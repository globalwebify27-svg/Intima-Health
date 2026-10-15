import { create } from 'zustand';

export type AppointmentBookingType = 'online' | 'walk-in';

export interface BookingModalPrefilledData {
  city?: string;
  clinic?: string;
  doctorId?: string;
  service?: string;
  appointmentType?: AppointmentBookingType;
}

interface BookingModalState {
  isOpen: boolean;
  prefilledData?: BookingModalPrefilledData;
  openBooking: (data?: BookingModalPrefilledData) => void;
  closeBooking: () => void;
}

export const useBookingModal = create<BookingModalState>((set) => ({
  isOpen: false,
  prefilledData: undefined,
  openBooking: (data) => set({ isOpen: true, prefilledData: data }),
  closeBooking: () => set({ isOpen: false, prefilledData: undefined }),
}));
