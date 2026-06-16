import { handleReschedule, handleCancel } from "@/modules/appointments/routes";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await handleReschedule(id, request);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await handleCancel(id);
}
