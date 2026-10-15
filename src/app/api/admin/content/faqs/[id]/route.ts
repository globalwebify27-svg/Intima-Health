import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { FaqModel, TreatmentModel } from "@/modules/cms/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;
  const payload = verifyJwt(token);
  return payload && payload.role === "SUPER_ADMIN";
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    const resolvedParams = await params;
    const body = await req.json();
    await connectDB();

    if (resolvedParams.id.startsWith("treatment_")) {
      const parts = resolvedParams.id.split("_");
      const treatmentId = parts[1];
      const faqIndex = parseInt(parts[2], 10);

      const treatment = await TreatmentModel.findById(treatmentId);
      if (!treatment) {
        return NextResponse.json({ success: false, message: "Treatment not found" }, { status: 404 });
      }

      if (!treatment.faqs || !treatment.faqs[faqIndex]) {
        return NextResponse.json({ success: false, message: "FAQ item not found" }, { status: 404 });
      }

      treatment.faqs[faqIndex].question = body.question;
      treatment.faqs[faqIndex].answer = body.answer;
      treatment.markModified("faqs");
      await treatment.save();

      return NextResponse.json({
        success: true,
        data: {
          _id: resolvedParams.id,
          treatmentId: treatment._id.toString(),
          treatmentSlug: treatment.slug,
          treatmentTitle: treatment.title,
          faqIndex,
          question: body.question,
          answer: body.answer,
          category: treatment.title,
          source: "treatment",
          topicType: treatment.type === "sexual-problem" ? "Sexual Problem" : "Treatment",
        },
      });
    }

    const updated = await FaqModel.findByIdAndUpdate(resolvedParams.id, body, { new: true });
    if (!updated) return NextResponse.json({ success: false, message: "FAQ not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    const resolvedParams = await params;
    await connectDB();

    if (resolvedParams.id.startsWith("treatment_")) {
      const parts = resolvedParams.id.split("_");
      const treatmentId = parts[1];
      const faqIndex = parseInt(parts[2], 10);

      const treatment = await TreatmentModel.findById(treatmentId);
      if (!treatment) {
        return NextResponse.json({ success: false, message: "Treatment not found" }, { status: 404 });
      }

      if (treatment.faqs && treatment.faqs.length > faqIndex) {
        treatment.faqs.splice(faqIndex, 1);
        treatment.markModified("faqs");
        await treatment.save();
      }

      return NextResponse.json({ success: true, message: "FAQ deleted successfully" });
    }

    const deleted = await FaqModel.findByIdAndUpdate(resolvedParams.id, { deletedAt: new Date() }, { new: true });
    if (!deleted) return NextResponse.json({ success: false, message: "FAQ not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
