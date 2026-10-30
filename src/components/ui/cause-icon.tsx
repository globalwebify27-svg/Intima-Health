import React from "react";
import {
  BrainCircuit,
  Activity,
  HeartPulse,
  Clock,
  ShieldAlert,
  ClipboardList,
  FlaskConical,
  Users,
  ShieldCheck,
  HelpCircle,
  HeartHandshake,
  Stethoscope,
  Pill,
  Zap,
  Sparkles,
  Brain,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  BrainCircuit,
  Activity,
  HeartPulse,
  Clock,
  ShieldAlert,
  ClipboardList,
  FlaskConical,
  Users,
  ShieldCheck,
  HelpCircle,
  HeartHandshake,
  Stethoscope,
  Pill,
  Zap,
  Sparkles,
  Brain,
};

export function CauseIcon({
  name,
  className = "w-6 h-6",
}: {
  name?: string;
  className?: string;
}) {
  const IconComponent = (name && ICON_MAP[name]) || HelpCircle;
  return <IconComponent className={className} />;
}

