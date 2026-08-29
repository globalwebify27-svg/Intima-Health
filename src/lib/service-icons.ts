import { 
  Activity, 
  Video, 
  HeartHandshake, 
  Stethoscope, 
  Hospital, 
  Sparkles, 
  Pill, 
  Users,
  Building2,
  User,
  Star,
  MapPin,
  ShieldCheck,
  CreditCard,
  FlaskConical
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Single source of truth for service icon mapping.
 * Keys MUST match the <option value="..."> in the admin services form dropdown.
 */
export const ServiceIconMap: Record<string, LucideIcon> = {
  Activity,
  Video,
  HeartHandshake,
  Stethoscope,
  Hospital,
  Sparkles,
  Pill,
  Users,
  Building2,
  User,
  Star,
  MapPin,
  ShieldCheck,
  CreditCard,
  FlaskConical,
};

/** All selectable icons for the admin dropdown */
export const SERVICE_ICON_OPTIONS = [
  { value: "Activity",       label: "Activity (Default)" },
  { value: "Video",          label: "Video (Virtual Sessions)" },
  { value: "HeartHandshake", label: "Heart & Handshake (Therapy)" },
  { value: "Stethoscope",    label: "Stethoscope (Consultations)" },
  { value: "Hospital",       label: "Hospital (In-Clinic)" },
  { value: "Sparkles",       label: "Sparkles (Specialty)" },
  { value: "Pill",           label: "Pill (Prescription)" },
  { value: "Users",          label: "Users (Group Therapy)" },
  { value: "Building2",      label: "Building (Clinic)" },
  { value: "FlaskConical",   label: "Flask (Lab / Tests)" },
  { value: "Star",           label: "Star (Premium)" },
  { value: "ShieldCheck",    label: "Shield (Insurance)" },
] as const;

export const getServiceIcon = (iconName: string | undefined | null): LucideIcon => {
  if (!iconName) return Activity;
  return ServiceIconMap[iconName] || Activity;
};
