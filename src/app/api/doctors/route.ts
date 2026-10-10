import { handleGetDoctors, handleCreateDoctor } from "@/modules/doctors/routes";

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  return await handleGetDoctors(request);
}

export async function POST(request: Request) {
  return await handleCreateDoctor(request);
}
