import { connectDB } from "@/db/connect";
import { HospitalModel, IHospital } from "./schema";
import { REHAB_CENTRES } from "@/constants/rehabCentres";

export class HospitalService {
  static async ensureDefaultSeeded(): Promise<void> {
    await connectDB();
    const count = await HospitalModel.countDocuments();
    if (count === 0) {
      console.log("Seeding default de-addiction hospitals...");
      for (let i = 0; i < REHAB_CENTRES.length; i++) {
        const item = REHAB_CENTRES[i];
        let defaultImage = item.image || "";
        if (!defaultImage) {
          if (item.slug === "ashakiran-rehabilitation-centre") {
            defaultImage = "/images/ashakiran_center.jpg";
          } else if (item.slug === "sanmitra-manas-hospital") {
            defaultImage = "/images/sanmitra_hospital.jpg";
          }
        }

        await HospitalModel.create({
          slug: item.slug,
          name: item.name,
          tagline: item.tagline,
          image: defaultImage,
          hidePdf: false,
          shortDescription: item.shortDescription,
          fullAbout: item.fullAbout,
          founderInfo: item.founderInfo || "",
          services: item.services || [],
          servicesDisclaimer: item.servicesDisclaimer || "",
          rtmsIntro: item.rtmsIntro || "",
          rtmsConditions: item.rtmsConditions || [],
          rtmsBenefits: item.rtmsBenefits || [],
          rtmsSummary: item.rtmsSummary || "",
          requiredDocuments: item.requiredDocuments || { title: "", list: [], note: "" },
          closingWellnessNote: item.closingWellnessNote || "",
          whyChooseUs: item.whyChooseUs || [],
          address: item.address,
          phones: item.phones,
          googleMapQuery: item.googleMapQuery,
          googleMapEmbed: item.googleMapEmbed,
          googleMapDirectionUrl: item.googleMapDirectionUrl,
          cashlessSchemeBadge: item.cashlessSchemeBadge,
          cashlessSchemeDetails: item.cashlessSchemeDetails,
          features: item.features || [],
          status: "Active",
          order: i,
        });
      }
      console.log("Default hospitals seeded successfully.");
    }
  }

  static async listAll(admin = false): Promise<IHospital[]> {
    await this.ensureDefaultSeeded();
    const query: Record<string, any> = {};
    if (!admin) {
      query.status = "Active";
    }
    const docs = await HospitalModel.find(query).sort({ order: 1, createdAt: 1 }).lean();
    return docs.map((doc: any) => ({
      ...doc,
      id: doc.slug,
      _id: doc._id.toString(),
    }));
  }

  static async getBySlug(slug: string): Promise<IHospital | null> {
    await this.ensureDefaultSeeded();
    const doc = await HospitalModel.findOne({ slug }).lean();
    if (!doc) return null;
    return {
      ...(doc as any),
      id: (doc as any).slug,
      _id: (doc as any)._id.toString(),
    };
  }

  static async create(data: Partial<IHospital>): Promise<IHospital> {
    await connectDB();
    const doc = await HospitalModel.create(data);
    return doc.toObject();
  }

  static async update(idOrSlug: string, data: Partial<IHospital>): Promise<IHospital | null> {
    await connectDB();
    let query: Record<string, any> = { slug: idOrSlug };
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] };
    }
    const updated = await HospitalModel.findOneAndUpdate(
      query,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();
    return updated as IHospital | null;
  }

  static async delete(idOrSlug: string): Promise<boolean> {
    await connectDB();
    let query: Record<string, any> = { slug: idOrSlug };
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query = { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] };
    }
    const res = await HospitalModel.findOneAndUpdate(
      query,
      { $set: { deletedAt: new Date(), status: "Inactive" } },
      { new: true }
    );
    return !!res;
  }
}
