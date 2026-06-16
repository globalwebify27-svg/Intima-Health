export class DoctorPermissions {
  static canViewDoctorProfile(userRole: string): boolean {
    const allowed = ["SUPER_ADMIN", "CLINIC_ADMIN", "DOCTOR", "PATIENT", "SUPPORT_AGENT", "CLINIC_MANAGER"];
    return allowed.includes(userRole);
  }

  static canManageDoctorProfile(userRole: string, userId: string, targetDoctorId: string): boolean {
    if (userRole === "SUPER_ADMIN" || userRole === "CLINIC_ADMIN") {
      return true;
    }
    // A doctor can only manage their own profile
    if (userRole === "DOCTOR" && userId === targetDoctorId) {
      return true;
    }
    return false;
  }
}
