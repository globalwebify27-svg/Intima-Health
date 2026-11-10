export interface ParsedMedicineItem {
  drug: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface ParsedTherapyItem {
  name: string;
  price?: number;
  recommendedMode?: string;
  doctorNotes?: string;
}

export function parsePrescribedMedicines(raw?: string | unknown[] | null): {
  items: ParsedMedicineItem[];
  plainText: string | null;
} {
  if (!raw) return { items: [], plainText: null };

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "[]") return { items: [], plainText: null };
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return { items: [], plainText: trimmed };
    }
  }

  if (!Array.isArray(parsed)) {
    return { items: [], plainText: typeof raw === "string" ? raw.trim() : null };
  }

  const items: ParsedMedicineItem[] = parsed
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
    .map((entry) => ({
      drug: String(entry.drug || entry.name || "Medication").trim(),
      dosage: entry.dosage ? String(entry.dosage).trim() : undefined,
      frequency: entry.frequency ? String(entry.frequency).trim() : undefined,
      duration: entry.duration ? String(entry.duration).trim() : undefined,
      instructions: entry.instructions ? String(entry.instructions).trim() : undefined,
    }))
    .filter((item) => item.drug.length > 0);

  return { items, plainText: null };
}

export function parsePrescribedTherapies(raw?: string | unknown[] | null): {
  items: ParsedTherapyItem[];
  plainText: string | null;
} {
  if (!raw) return { items: [], plainText: null };

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "[]") return { items: [], plainText: null };
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return { items: [], plainText: trimmed };
    }
  }

  if (!Array.isArray(parsed)) {
    return { items: [], plainText: typeof raw === "string" ? raw.trim() : null };
  }

  const items: ParsedTherapyItem[] = parsed
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
    .map((entry) => ({
      name: String(entry.name || entry.therapy || "Therapy Session").trim(),
      price: typeof entry.price === "number" ? entry.price : Number(entry.price) || undefined,
      recommendedMode: entry.recommendedMode ? String(entry.recommendedMode).trim() : undefined,
      doctorNotes: entry.doctorNotes ? String(entry.doctorNotes).trim() : undefined,
    }))
    .filter((item) => item.name.length > 0);

  return { items, plainText: null };
}

export function formatPrescriptionText(raw?: string | unknown[] | null): string {
  const { items, plainText } = parsePrescribedMedicines(raw);
  if (items.length === 0) return plainText || "";
  return items
    .map((m) => {
      const details = [
        m.dosage ? `Dosage: ${m.dosage}` : "",
        m.frequency ? `Freq: ${m.frequency}` : "",
        m.duration ? `Duration: ${m.duration}` : "",
      ].filter(Boolean);
      return details.length > 0 ? `${m.drug} (${details.join(", ")})` : m.drug;
    })
    .join(" • ");
}

