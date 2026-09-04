export interface TimeSlot {
  start: string; // e.g. "09:00"
  end: string;   // e.g. "17:00"
}

export interface DayAvailability {
  day: string; // e.g. "Monday", "Tuesday"
  slots: TimeSlot[];
}

export interface IDoctor {
  _id?: string;
  clinicId?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specialization: string;
  experience: number; // in years
  bio: string;
  rating?: number;
  reviewsCount?: number;
  salary: number;
  fees?: number;
  qualifications: string[];
  availability: DayAvailability[];
  slotDuration?: number; // duration of patient checking slot in minutes
  conditions?: string[];
  status: "Active" | "Inactive" | "Pending";
  showOnHomepage?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}
