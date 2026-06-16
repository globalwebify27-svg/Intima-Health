import { handleGetSlots } from "@/modules/appointments/routes";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await handleGetSlots(id, request);
}
