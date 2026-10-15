import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { FaqModel, TreatmentModel } from "@/modules/cms/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;
  const payload = verifyJwt(token);
  return payload && payload.role === "SUPER_ADMIN";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    await connectDB();

    // 1. General FAQs from FaqModel
    const generalFaqs = await FaqModel.find().sort({ createdAt: -1 }).lean();
    const formattedGeneral = generalFaqs.map((f: any) => ({
      _id: f._id.toString(),
      question: f.question,
      answer: f.answer,
      category: f.category || "General",
      source: "general",
      topicType: "General",
      topicTitle: "General Hospital FAQ",
    }));

    // 2. Topic FAQs from TreatmentModel (using projection so it's lightning fast and never exceeds sort memory)
    const treatments = await TreatmentModel.find(
      {},
      "_id slug title type faqs"
    ).lean();

    // Sort alphabetically in JavaScript
    treatments.sort((a: any, b: any) => (a.title || "").localeCompare(b.title || ""));

    const formattedTopics: any[] = [];
    const topicsList: any[] = [];

    for (const t of treatments) {
      topicsList.push({
        id: t._id.toString(),
        slug: t.slug,
        title: t.title,
        type: t.type === "sexual-problem" ? "Sexual Problem" : "Treatment",
        faqCount: Array.isArray(t.faqs) ? t.faqs.length : 0,
      });

      if (t.faqs && Array.isArray(t.faqs)) {
        t.faqs.forEach((faq: any, idx: number) => {
          formattedTopics.push({
            _id: `treatment_${t._id}_${idx}`,
            treatmentId: t._id.toString(),
            treatmentSlug: t.slug,
            treatmentTitle: t.title,
            faqIndex: idx,
            question: faq.question,
            answer: faq.answer,
            category: t.title,
            source: "treatment",
            topicType: t.type === "sexual-problem" ? "Sexual Problem" : "Treatment",
            topicTitle: t.title,
          });
        });
      }
    }

    // Combined list: General FAQs first, followed by all Topic FAQs
    const allFaqs = [...formattedGeneral, ...formattedTopics];

    return NextResponse.json({
      success: true,
      data: allFaqs,
      topics: topicsList,
      meta: {
        total: allFaqs.length,
        generalCount: formattedGeneral.length,
        topicCount: formattedTopics.length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/content/faqs error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    const body = await req.json();
    await connectDB();

    // If adding a topic FAQ for a treatment/sexual problem
    if (body.treatmentId) {
      const treatment = await TreatmentModel.findById(body.treatmentId);
      if (!treatment) {
        return NextResponse.json({ success: false, message: "Treatment not found" }, { status: 404 });
      }

      treatment.faqs = treatment.faqs || [];
      treatment.faqs.push({ question: body.question, answer: body.answer });
      treatment.markModified("faqs");
      await treatment.save();

      const newIndex = treatment.faqs.length - 1;
      return NextResponse.json({
        success: true,
        data: {
          _id: `treatment_${treatment._id}_${newIndex}`,
          treatmentId: treatment._id.toString(),
          treatmentSlug: treatment.slug,
          treatmentTitle: treatment.title,
          faqIndex: newIndex,
          question: body.question,
          answer: body.answer,
          category: treatment.title,
          source: "treatment",
          topicType: treatment.type === "sexual-problem" ? "Sexual Problem" : "Treatment",
          topicTitle: treatment.title,
        },
      });
    }

    // Otherwise add a general FAQ to FaqModel
    const newFaq = new FaqModel({
      question: body.question,
      answer: body.answer,
      category: body.category || "General",
    });
    await newFaq.save();
    return NextResponse.json({ success: true, data: newFaq });
  } catch (error: any) {
    console.error("POST /api/admin/content/faqs error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
