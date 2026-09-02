export interface ISlot {
  start: string; // e.g., "09:00"
  end: string;   // e.g., "09:30"
  available: boolean;
}

export interface IBookAppointmentInput {
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (start time)
  type: "Video" | "Walk-in";
  notes?: string;
}

export interface IRescheduleInput {
  date: string;
  time: string;
}
