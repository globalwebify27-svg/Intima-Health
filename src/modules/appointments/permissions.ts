export class AppointmentPermissions {
  static canViewBooking(userRole: string, userId: string, booking: any): boolean {
    if (["SUPER_ADMIN", "CLINIC_ADMIN", "SUPPORT_AGENT", "CLINIC_MANAGER"].includes(userRole)) {
      return true;
    }
    // Patients and Doctors can only see bookings they are directly related to
    if (userRole === "DOCTOR" && String(booking.doctorId) === userId) {
      return true;
    }
    if (userRole === "PATIENT" && String(booking.patientId) === userId) {
      return true;
    }
    return false;
  }

  static canModifyBooking(userRole: string, userId: string, booking: any): boolean {
    if (["SUPER_ADMIN", "CLINIC_ADMIN", "CLINIC_MANAGER"].includes(userRole)) {
      return true;
    }
    // Patient can cancel/reschedule their own bookings if they do it in advance
    if (userRole === "PATIENT" && String(booking.patientId) === userId) {
      return true;
    }
    return false;
  }
}
