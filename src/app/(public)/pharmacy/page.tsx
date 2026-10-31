import { redirect } from "next/navigation";

export default function PharmacyPage() {
  redirect("/patient/prescriptions");
}
