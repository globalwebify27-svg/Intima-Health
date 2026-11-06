"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Trash2, CheckCircle2, Save, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Slot {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  slots: Slot[];
}

// Parse ANY time string ("10:00", "10:50 AM", "03:50 PM", "15:50") to minutes from midnight (0 - 1439)
const parseTimeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return -1;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes("PM");
  const isAM = clean.includes("AM");

  const numericPart = clean.replace(/\s*(AM|PM)/i, "").trim();
  const parts = numericPart.split(":");
  if (parts.length < 2) return -1;

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return -1;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// Convert ANY time to 12-hour format with AM/PM (e.g. "10:00 AM", "03:50 PM")
const formatSlotTime = (timeStr?: string): string => {
  if (!timeStr) return "";
  const mins = parseTimeToMinutes(timeStr);
  if (mins === -1) return timeStr;
  const hours24 = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

// Deduplicate and normalize slots
const deduplicateAndNormalizeSlots = (slots: Slot[]): Slot[] => {
  const seen = new Set<string>();
  const unique: Slot[] = [];
  for (const s of slots) {
    if (!s || !s.start || !s.end) continue;
    const startM = parseTimeToMinutes(s.start);
    const endM = parseTimeToMinutes(s.end);
    if (startM === -1 || endM === -1 || startM >= endM) continue;
    const key = `${startM}-${endM}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({
        start: formatSlotTime(s.start),
        end: formatSlotTime(s.end),
      });
    }
  }
  return unique.sort((a, b) => parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start));
};

// Check for conflict or duplicate
const checkSlotConflict = (existingSlots: Slot[], startStr: string, endStr: string): string | null => {
  const nStart = parseTimeToMinutes(startStr);
  const nEnd = parseTimeToMinutes(endStr);

  if (nStart === -1 || nEnd === -1) {
    return "Valid start and end times are required.";
  }
  if (nStart >= nEnd) {
    return "Start time must be earlier than end time.";
  }
  if (nEnd - nStart < 15) {
    return "Slot duration must be at least 15 minutes.";
  }

  for (const slot of existingSlots) {
    const sStart = parseTimeToMinutes(slot.start);
    const sEnd = parseTimeToMinutes(slot.end);
    if (sStart === -1 || sEnd === -1) continue;

    // Exact duplicate check
    if (sStart === nStart && sEnd === nEnd) {
      return `Duplicate timing: this slot (${formatSlotTime(slot.start)} – ${formatSlotTime(slot.end)}) already exists.`;
    }

    // Overlap check
    if (Math.max(nStart, sStart) < Math.min(nEnd, sEnd)) {
      return `Overlapping conflict: clashes with existing slot ${formatSlotTime(slot.start)} – ${formatSlotTime(slot.end)}.`;
    }
  }

  return null;
};

// Suggest next non-overlapping 50-minute slot
const suggestNextSlot = (existingSlots: Slot[]): { start: string; end: string } => {
  const sorted = [...existingSlots]
    .map((s) => ({
      startM: parseTimeToMinutes(s.start),
      endM: parseTimeToMinutes(s.end),
    }))
    .filter((s) => s.startM !== -1 && s.endM !== -1 && s.startM < s.endM)
    .sort((a, b) => a.startM - b.startM);

  if (sorted.length === 0) {
    return { start: "10:00", end: "10:50" };
  }

  // Check if there is an empty gap between slots
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].endM;
    const nextStart = sorted[i + 1].startM;
    if (nextStart - currentEnd >= 50) {
      const sH = Math.floor(currentEnd / 60);
      const sM = currentEnd % 60;
      const eMins = currentEnd + 50;
      const eH = Math.floor(eMins / 60);
      const eM = eMins % 60;
      return {
        start: `${String(sH).padStart(2, "0")}:${String(sM).padStart(2, "0")}`,
        end: `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`,
      };
    }
  }

  // Else place 10 minutes after latest slot, up to 21:00
  const latestEnd = sorted[sorted.length - 1].endM;
  const candStartM = latestEnd + 10;
  const candEndM = candStartM + 50;
  if (candEndM <= 22 * 60) {
    const sH = Math.floor(candStartM / 60);
    const sM = candStartM % 60;
    const eH = Math.floor(candEndM / 60);
    const eM = candEndM % 60;
    return {
      start: `${String(sH).padStart(2, "0")}:${String(sM).padStart(2, "0")}`,
      end: `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`,
    };
  }

  return { start: "09:00", end: "09:50" };
};

export default function TherapistAvailabilityPage() {
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Quick slot adder state
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [newStart, setNewStart] = useState("10:00");
  const [newEnd, setNewEnd] = useState("10:50");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (!meJson.success || meJson.user.role !== "THERAPIST") {
          window.location.href = "/staff-login";
          return;
        }

        const tId = meJson.user.therapistId;
        if (tId) {
          setTherapistId(tId);
          const tRes = await fetch(`/api/therapists/${tId}`);
          const tJson = await tRes.json();
          if (tJson.success && tJson.data) {
            const existing = tJson.data.availability || [];
            // Ensure all 7 days exist in state, deduplicated and normalized
            const merged = DAYS_OF_WEEK.map((d) => {
              const found = existing.find((a: any) => a.day.toLowerCase() === d.toLowerCase());
              return {
                day: d,
                slots: deduplicateAndNormalizeSlots(found ? found.slots : []),
              };
            });
            setAvailability(merged);
          }
        }
      } catch (err) {
        console.error("Error loading availability:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const toggleDayEnabled = (day: string) => {
    setAvailability((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        if (item.slots.length > 0) {
          return { ...item, slots: [] };
        } else {
          // Add default conflict-free slots with full AM/PM format
          return {
            ...item,
            slots: [
              { start: "10:00 AM", end: "10:50 AM" },
              { start: "11:30 AM", end: "12:20 PM" },
              { start: "02:00 PM", end: "02:50 PM" },
              { start: "04:00 PM", end: "04:50 PM" },
            ],
          };
        }
      })
    );
  };

  const removeSlot = (day: string, index: number) => {
    setAvailability((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        return {
          ...item,
          slots: item.slots.filter((_, i) => i !== index),
        };
      })
    );
  };

  const openAddSlot = (day: string) => {
    const dayItem = availability.find((a) => a.day === day);
    const next = suggestNextSlot(dayItem?.slots || []);
    setNewStart(next.start);
    setNewEnd(next.end);
    setAddingDay(day);
  };

  const handleAddSlot = (day: string) => {
    const dayItem = availability.find((a) => a.day === day);
    const existingSlots = dayItem?.slots || [];
    const conflict = checkSlotConflict(existingSlots, newStart, newEnd);
    if (conflict) {
      alert(conflict);
      return;
    }

    const formattedSlot: Slot = {
      start: formatSlotTime(newStart),
      end: formatSlotTime(newEnd),
    };

    setAvailability((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        const updated = [...item.slots, formattedSlot];
        return {
          ...item,
          slots: deduplicateAndNormalizeSlots(updated),
        };
      })
    );
    setAddingDay(null);
  };

  const applyPresetWeekdays = () => {
    setAvailability((prev) =>
      prev.map((item) => {
        if (item.day === "Saturday" || item.day === "Sunday") {
          return { ...item, slots: [] };
        }
        return {
          day: item.day,
          slots: [
            { start: "09:00 AM", end: "09:50 AM" },
            { start: "10:30 AM", end: "11:20 AM" },
            { start: "12:00 PM", end: "12:50 PM" },
            { start: "02:30 PM", end: "03:20 PM" },
            { start: "04:00 PM", end: "04:50 PM" },
          ],
        };
      })
    );
  };

  const handleSave = async () => {
    if (!therapistId) return;

    // Check all days for any internal conflicts before saving
    for (const item of availability) {
      const slots = item.slots;
      for (let i = 0; i < slots.length; i++) {
        const otherSlots = slots.filter((_, idx) => idx !== i);
        const conflict = checkSlotConflict(otherSlots, slots[i].start, slots[i].end);
        if (conflict) {
          alert(`Conflict on ${item.day}: ${conflict} Please remove conflicting slots before saving.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Clean and normalize all slots before persisting
      const normalizedAvailability = availability.map((item) => ({
        day: item.day,
        slots: deduplicateAndNormalizeSlots(item.slots),
      }));

      const res = await fetch(`/api/therapists/${therapistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability: normalizedAvailability,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAvailability(normalizedAvailability);
        alert("Availability schedule updated successfully! All slots are saved with consistent AM/PM timing.");
      } else {
        alert(data.message || "Failed to update schedule.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving availability.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground text-sm">Loading availability...</div>;
  }

  // Check current conflict for the open inline adder
  const currentAddingDaySlots = addingDay ? (availability.find((a) => a.day === addingDay)?.slots || []) : [];
  const currentConflictError = addingDay ? checkSlotConflict(currentAddingDaySlots, newStart, newEnd) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Weekly Availability Schedule</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure the time windows when you are available for online video and clinic therapy sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={applyPresetWeekdays}
            className="rounded-xl text-xs font-semibold gap-1.5 h-9"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Apply Mon-Fri 9-5
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl text-xs font-bold gap-1.5 h-9 bg-primary hover:bg-primary/90 text-white shadow-sm"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-3">
        {availability.map((item) => {
          const isEnabled = item.slots.length > 0;
          return (
            <div
              key={item.day}
              className={`p-4 rounded-2xl border transition-all ${
                isEnabled
                  ? "bg-card border-border shadow-sm"
                  : "bg-muted/15 border-border/50 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDayEnabled(item.day)}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      isEnabled ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="font-bold text-sm text-foreground">{item.day}</span>
                  <Badge variant={isEnabled ? "outline" : "secondary"} className="text-[10px]">
                    {isEnabled ? `${item.slots.length} Slots Active` : "Off / Unavailable"}
                  </Badge>
                </div>

                {isEnabled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openAddSlot(item.day)}
                    className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl text-xs h-8 gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slot
                  </Button>
                )}
              </div>

              {/* Slot Tags */}
              {isEnabled && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {item.slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs font-semibold text-foreground group shadow-2xs hover:border-primary/40 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-mono font-bold tracking-tight">
                        {formatSlotTime(slot.start)} – {formatSlotTime(slot.end)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSlot(item.day, idx)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors ml-1 p-0.5 rounded-md"
                        title="Remove time slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Add Slot Box */}
              {addingDay === item.day && (
                <div className="mt-3 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col gap-2.5 text-xs animate-in fade-in">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-semibold">Start:</span>
                      <input
                        type="time"
                        value={newStart}
                        onChange={(e) => setNewStart(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-semibold">End:</span>
                      <input
                        type="time"
                        value={newEnd}
                        onChange={(e) => setNewEnd(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold hidden sm:inline bg-muted/50 px-2 py-1 rounded-lg">
                      Preview: <strong>{formatSlotTime(newStart)} – {formatSlotTime(newEnd)}</strong>
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddingDay(null)}
                        className="rounded-xl text-xs h-8 font-semibold"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={!!currentConflictError}
                        onClick={() => handleAddSlot(item.day)}
                        className="rounded-xl text-xs h-8 bg-primary hover:bg-primary/90 text-white font-bold disabled:opacity-50"
                      >
                        Save Slot
                      </Button>
                    </div>
                  </div>

                  {/* Real-time Conflict & Overlap Warning Message */}
                  {currentConflictError && (
                    <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{currentConflictError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
