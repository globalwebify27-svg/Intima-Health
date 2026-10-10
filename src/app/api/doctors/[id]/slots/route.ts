import { handleGetSlots } from "@/modules/appointments/routes";

export const dynamic = 'force-dynamic';


interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await handleGetSlots(id, request);
}
