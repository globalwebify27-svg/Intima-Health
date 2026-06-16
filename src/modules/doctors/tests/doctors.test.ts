import { CreateDoctorSchema, UpdateDoctorSchema } from "../validators";
import assert from "assert";

console.log("Starting Doctors Module Tests...");

try {
  // Test case 1: Validate correct Doctor schema creation
  const validDoctor = {
    name: "Dr. Gregory House",
    email: "house@intima.health",
    phone: "9876543210",
    specialization: "Diagnostic Medicine",
    experience: 20,
    bio: "Diagnoses the most complex clinical conditions.",
    fees: 5000,
    qualifications: ["MD - Nephrology", "MD - Infectious Disease"],
  };

  const parsed = CreateDoctorSchema.parse(validDoctor);
  assert.strictEqual(parsed.name, "Dr. Gregory House");
  console.log("✓ Test case 1 passed: Valid doctor schema parsed successfully.");

  // Test case 2: Fail invalid Doctor emails
  const invalidDoctor = {
    name: "Dr. Fail",
    email: "not-an-email",
    phone: "123",
    specialization: "N/A",
    experience: -5,
    bio: "Short",
    fees: -100,
    qualifications: [],
  };

  const result = CreateDoctorSchema.safeParse(invalidDoctor);
  assert.strictEqual(result.success, false);
  console.log("✓ Test case 2 passed: Invalid fields failed validation as expected.");

  console.log("All Doctors Module tests passed successfully!");
} catch (err) {
  console.error("Test execution failed:", err);
  process.exit(1);
}
