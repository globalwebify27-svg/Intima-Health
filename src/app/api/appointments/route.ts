import { handleGetAppointments, handleBookAppointment } from "@/modules/appointments/routes";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return await handleGetAppointments(request);
}

export async function POST(request: Request) {
  return await handleBookAppointment(request);
}
