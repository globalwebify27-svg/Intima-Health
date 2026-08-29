import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ProductModel } from "@/modules/store/schema";

const hardcodedProducts = [
  {
    name: "Daily Tadalafil (Cialis)",
    slug: "daily-tadalafil",
    price: 3499,
    image: "/images/product_kit_1.png",
    type: "medication",
    category: "Sexual Health",
    description: "A daily 5mg pill for spontaneous intimacy. No planning required.",
    isPrescription: true,
  },
  {
    name: "Endurance Spray",
    slug: "endurance-spray",
    price: 1999,
    image: "/images/product_kit_2.png",
    type: "medication",
    category: "Sexual Health",
    description: "Clinically proven lidocaine spray to help you last longer in bed.",
    isPrescription: false,
  },
  {
    name: "Comprehensive Hormone Panel",
    slug: "hormone-panel",
    price: 4999,
    image: "/images/product_kit_3.png",
    type: "diagnostic",
    category: "Diagnostics",
    description: "At-home blood test measuring Free T, Total T, Estradiol, and SHBG.",
    isPrescription: false,
  },
  {
    name: "Complete STI Screen",
    slug: "sti-screen",
    price: 2999,
    image: "/images/product_kit_1.png",
    type: "diagnostic",
    category: "Diagnostics",
    description: "Private, at-home testing for Chlamydia, Gonorrhea, Syphilis, and HIV.",
    isPrescription: false,
  },
  {
    name: "Vitality Complex",
    slug: "vitality-complex",
    price: 1499,
    image: "/images/product_kit_2.png",
    type: "supplement",
    category: "Wellness",
    description: "A blend of Ashwagandha, Maca, and Zinc to naturally support drive and energy.",
    isPrescription: false,
  },
  {
    name: "Finasteride 1mg",
    slug: "finasteride",
    price: 2499,
    image: "/images/product_kit_3.png",
    type: "medication",
    category: "Hair Health",
    description: "The gold standard oral medication for stopping male pattern baldness.",
    isPrescription: true,
  }
];

export async function GET() {
  try {
    await connectDB();

    const count = await ProductModel.countDocuments();
    if (count === 0) {
      for (const prod of hardcodedProducts) {
        await new ProductModel(prod).save();
      }
    }

    return NextResponse.json({ success: true, message: "Pharmacy store seeded successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
