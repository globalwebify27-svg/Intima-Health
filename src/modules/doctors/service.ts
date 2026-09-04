import { DoctorRepository } from "./repository";
import { IDoctor } from "./types";
import { CreateDoctorSchema, UpdateDoctorSchema, UpdateAvailabilitySchema } from "./validators";
import { UserModel, hashPassword } from "@/modules/auth/schema";

export class DoctorService {
  static async registerDoctor(data: any, createdBy?: string): Promise<IDoctor> {
    const validatedData = CreateDoctorSchema.parse(data);
    
    // Check if email already exists
    const existing = await DoctorRepository.findByEmail(validatedData.email);
    if (existing) {
      throw new Error("A doctor with this email is already registered.");
    }

    const doctor = await DoctorRepository.create({
      ...validatedData,
      status: "Active", // Immediately active — credentials are issued at creation time
      createdBy,
    });

    // Create corresponding user credential account
    await UserModel.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash: hashPassword("password123"),
      role: "DOCTOR",
      status: "Active",
    });

    return doctor;
  }

  static async getDoctorById(id: string): Promise<IDoctor> {
    const doctor = await DoctorRepository.findById(id);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }
    return doctor;
  }

  static async updateProfile(id: string, data: any, updatedBy?: string): Promise<IDoctor> {
    const validatedData = UpdateDoctorSchema.parse(data);
    
    const doctor = await DoctorRepository.update(id, {
      ...validatedData,
      updatedBy,
    });

    if (!doctor) {
      throw new Error("Doctor profile not found or could not be updated.");
    }

    return doctor;
  }

  static async updateAvailability(id: string, availabilityData: any, updatedBy?: string): Promise<IDoctor> {
    const { availability } = UpdateAvailabilitySchema.parse({ availability: availabilityData });

    const doctor = await DoctorRepository.update(id, {
      availability,
      updatedBy,
    });

    if (!doctor) {
      throw new Error("Doctor profile not found.");
    }

    return doctor;
  }

  static async removeDoctor(id: string, deletedBy?: string): Promise<IDoctor> {
    const doctor = await DoctorRepository.softDelete(id, deletedBy);
    if (!doctor) {
      throw new Error("Doctor profile not found.");
    }
    return doctor;
  }

  static async getDoctorsList(filters: {
    specialization?: string;
    status?: string;
    clinicId?: string;
    state?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    let result = await DoctorRepository.list(filters);
    
    // Auto-seed if database is empty to facilitate smooth Atlas/local testing
    if (result.total === 0 && !filters.specialization && !filters.status) {
      const seedDoctors = [
        {
          name: "Dr. Sarah Jenkins",
          email: "sarah.jenkins@intima.health",
          phone: "9876543210",
          specialization: "Sexual Medicine",
          experience: 12,
          bio: "Specialist in sexual medicine and couple therapy with over 12 years of clinical experience.",
          fees: 1500,
          qualifications: ["MD - Internal Medicine", "Fellowship in Sexual Medicine"],
          availability: [
            { day: "Monday", slots: [{ start: "09:00", end: "13:00" }, { start: "14:00", end: "17:00" }] },
            { day: "Wednesday", slots: [{ start: "09:00", end: "13:00" }] }
          ],
          status: "Active" as const,
        },
        {
          name: "Dr. Michael Chen",
          email: "michael.chen@intima.health",
          phone: "9876543211",
          specialization: "Urology",
          experience: 15,
          bio: "Senior consultant urologist specializing in male reproductive health and micro-surgery.",
          fees: 1800,
          qualifications: ["MS - General Surgery", "MCh - Urology"],
          availability: [
            { day: "Tuesday", slots: [{ start: "10:00", end: "14:00" }] },
            { day: "Thursday", slots: [{ start: "10:00", end: "16:00" }] }
          ],
          status: "Active" as const,
        }
      ];

      for (const doc of seedDoctors) {
        await DoctorRepository.create(doc);
        
        // Ensure user account is also provisioned
        await UserModel.create({
          name: doc.name,
          email: doc.email,
          passwordHash: hashPassword("password123"),
          role: "DOCTOR",
          status: "Active",
        });
      }

      result = await DoctorRepository.list(filters);
    }

    return result;
  }
}
