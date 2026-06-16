import { handleGetDoctorById, handleUpdateDoctor, handleDeleteDoctor } from "@/modules/doctors/routes";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await handleGetDoctorById(id);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await handleUpdateDoctor(id, request);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await handleDeleteDoctor(id);
}
