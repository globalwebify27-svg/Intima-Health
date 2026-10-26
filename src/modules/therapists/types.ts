export interface ITherapistTimeSlot {
  start: string;
  end: string;
}

export interface ITherapistDayAvailability {
  day: string;
  slots: ITherapistTimeSlot[];
}

export interface ITherapist {
  _id?: string;
  clinicId?: any;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specialization: string;
  registrationNumber: string;
  qualifications?: string[];
  experience?: number;
  bio?: string;
  rating?: number;
  reviewsCount?: number;
  fees?: number;
  slotDuration?: number;
  availability?: ITherapistDayAvailability[];
  status: "Active" | "Inactive" | "Pending";
  showOnHomepage?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
