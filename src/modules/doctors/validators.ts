import { z } from "zod";

const TimeSlotSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time format (HH:MM)"),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time format (HH:MM)"),
});

const DayAvailabilitySchema = z.object({
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  slots: z.array(TimeSlotSchema),
});

export const CreateDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  avatar: z.string().optional(),
  specialization: z.string().min(2, "Specialization is required"),
  experience: z.number().nonnegative("Experience cannot be negative"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  fees: z.number().positive("Fees must be a positive number"),
  qualifications: z.array(z.string()).min(1, "At least one qualification is required"),
  availability: z.array(DayAvailabilitySchema).optional().default([]),
  slotDuration: z.number().int().positive().optional().default(30),
  status: z.enum(["Active", "Inactive", "Pending"]).optional().default("Pending"),
});

export const UpdateDoctorSchema = CreateDoctorSchema.partial();

export const UpdateAvailabilitySchema = z.object({
  availability: z.array(DayAvailabilitySchema),
});
