import { BookAppointmentSchema, RescheduleAppointmentSchema } from "../validators";
import assert from "assert";

console.log("Starting Appointments Module Tests...");

try {
  // Test case 1: Validate correct booking request format
  const validBooking = {
    patientId: "patient_12345",
    doctorId: "doctor_67890",
    date: "2026-06-15",
    time: "10:30",
    type: "Video",
    notes: "Follow-up consultation.",
  };

  const parsed = BookAppointmentSchema.parse(validBooking);
  assert.strictEqual(parsed.time, "10:30");
  assert.strictEqual(parsed.date, "2026-06-15");
  console.log("✓ Test case 1 passed: Valid booking schema parsed successfully.");

  // Test case 2: Fail invalid Date format
  const invalidBooking = {
    patientId: "patient_123",
    doctorId: "doctor_123",
    date: "15-06-2026", // Invalid format (should be YYYY-MM-DD)
    time: "10:30",
    type: "Video",
  };

  const result = BookAppointmentSchema.safeParse(invalidBooking);
  assert.strictEqual(result.success, false);
  console.log("✓ Test case 2 passed: Invalid date formats rejected successfully.");

  // Test case 3: Validate reschedule formatting
  const reschedule = {
    date: "2026-06-16",
    time: "14:00",
  };
  const parsedResched = RescheduleAppointmentSchema.parse(reschedule);
  assert.strictEqual(parsedResched.time, "14:00");
  console.log("✓ Test case 3 passed: Reschedule schema validated successfully.");

  console.log("All Appointments Module tests passed successfully!");
} catch (err) {
  console.error("Test execution failed:", err);
  process.exit(1);
}
