"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Clock, Plus, Trash2, Calendar, Edit3, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  slots: TimeSlot[];
}

// Convert any time string (HH:MM or HH:MM AM/PM) to minutes from midnight
const toMinutes = (timeStr?: string): number => {
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

// Convert ANY time to 12-hour format with AM/PM (e.g. "05:00 PM", "09:00 PM")
const formatSlotTime = (timeStr?: string): string => {
  if (!timeStr) return "";
  const mins = toMinutes(timeStr);
  if (mins === -1) return timeStr;
  const hours24 = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

// Check if a specific slot in a day has duplicate timing, overlaps, or format errors
const getSlotIssue = (slots: TimeSlot[], index: number): string | null => {
  const current = slots[index];
  if (!current.start?.trim() || !current.end?.trim()) return "Time required";

  const startMin = toMinutes(current.start.trim());
  const endMin = toMinutes(current.end.trim());

  if (startMin === -1 || endMin === -1) {
    return "Invalid time format";
  }

  if (startMin >= endMin) {
    return "Start time must be before End time";
  }

  for (let i = 0; i < slots.length; i++) {
    if (i === index) continue;
    const other = slots[i];
    if (!other.start?.trim() || !other.end?.trim()) continue;

    const oStartMin = toMinutes(other.start.trim());
    const oEndMin = toMinutes(other.end.trim());
    if (oStartMin === -1 || oEndMin === -1) continue;

    // Exact duplicate check
    if (oStartMin === startMin && oEndMin === endMin) {
      return `Duplicate timing (${formatSlotTime(current.start)} – ${formatSlotTime(current.end)})`;
    }

    // Overlap check
    if (Math.max(startMin, oStartMin) < Math.min(endMin, oEndMin)) {
      return `Overlaps with slot (${formatSlotTime(other.start)} – ${formatSlotTime(other.end)})`;
    }
  }

  return null;
};

// Deduplicate exact matching slots based on start/end minutes
const deduplicateSlots = (slots: TimeSlot[]): TimeSlot[] => {
  const seen = new Set<string>();
  const unique: TimeSlot[] = [];
  for (const s of slots) {
    if (!s || !s.start || !s.end) continue;
    const startMin = toMinutes(s.start);
    const endMin = toMinutes(s.end);
    if (startMin === -1 || endMin === -1 || startMin >= endMin) continue;
    const key = `${startMin}-${endMin}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ start: s.start.trim(), end: s.end.trim() });
    }
  }
  return unique.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
};

// Suggest a smart, non-overlapping next slot for a day
const suggestNextSlot = (existingSlots: TimeSlot[]): TimeSlot => {
  const validSlots = existingSlots
    .filter((s) => s.start && s.end)
    .map((s) => ({
      startMin: toMinutes(s.start),
      endMin: toMinutes(s.end),
      start: s.start.trim(),
      end: s.end.trim(),
    }))
    .filter((s) => s.startMin !== -1 && s.endMin !== -1 && s.startMin < s.endMin)
    .sort((a, b) => a.startMin - b.startMin);

  if (validSlots.length === 0) {
    return { start: "09:00", end: "13:00" };
  }

  const candidateBlocks: TimeSlot[] = [
    { start: "09:00", end: "13:00" },
    { start: "14:00", end: "17:00" },
    { start: "17:00", end: "21:00" },
    { start: "10:00", end: "14:00" },
    { start: "15:00", end: "19:00" },
    { start: "18:00", end: "21:00" },
  ];

  for (const cand of candidateBlocks) {
    const cStart = toMinutes(cand.start);
    const cEnd = toMinutes(cand.end);
    const hasConflict = validSlots.some(
      (s) => Math.max(cStart, s.startMin) < Math.min(cEnd, s.endMin)
    );
    if (!hasConflict) {
      return cand;
    }
  }

  const lastSlot = validSlots[validSlots.length - 1];
  if (lastSlot.endMin + 60 <= 22 * 60) {
    const nextStartH = Math.floor((lastSlot.endMin + 30) / 60);
    const nextEndH = Math.min(23, nextStartH + 3);
    return {
      start: `${String(nextStartH).padStart(2, "0")}:00`,
      end: `${String(nextEndH).padStart(2, "0")}:00`,
    };
  }

  const firstSlot = validSlots[0];
  if (firstSlot.startMin >= 2 * 60) {
    const prevEndH = Math.floor(firstSlot.startMin / 60);
    const prevStartH = Math.max(7, prevEndH - 3);
    if (prevStartH < prevEndH) {
      return {
        start: `${String(prevStartH).padStart(2, "0")}:00`,
        end: `${String(prevEndH).padStart(2, "0")}:00`,
      };
    }
  }

  return { start: "14:00", end: "17:00" };
};

export default function DoctorAvailabilityPage() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [tempAvailability, setTempAvailability] = useState<DayAvailability[]>([]);
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [tempSlotDuration, setTempSlotDuration] = useState<number>(30);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.doctorId) {
          setDoctorId(data.user.doctorId);
          return fetch(`/api/doctors/${data.user.doctorId}`);
        } else {
          throw new Error("Doctor profile not found.");
        }
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          // Deduplicate existing slots so any stored duplicate timings are cleaned up immediately
          const cleaned = (data.data.availability || []).map((av: DayAvailability) => ({
            day: av.day,
            slots: deduplicateSlots(av.slots || []).sort((a, b) => a.start.localeCompare(b.start)),
          }));
          setAvailability(cleaned);
          setSlotDuration(data.data.slotDuration || 30);
        }
      })
      .catch((err) => setError(err.message || "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const openEditModal = () => {
    // Clone and deduplicate current availability to temporary state for modal editing
    const cleaned = availability.map((av) => ({
      day: av.day,
      slots: deduplicateSlots(av.slots || []).sort((a, b) => a.start.localeCompare(b.start)),
    }));
    setTempAvailability(JSON.parse(JSON.stringify(cleaned)));
    setTempSlotDuration(slotDuration);
    setError("");
    setIsModalOpen(true);
  };

  const handleToggleDay = (day: string) => {
    setError("");
    const exists = tempAvailability.some((av) => av.day === day);
    if (exists) {
      setTempAvailability(tempAvailability.filter((av) => av.day !== day));
    } else {
      setTempAvailability([...tempAvailability, { day, slots: [{ start: "09:00", end: "17:00" }] }]);
    }
  };

  const handleSlotChange = (day: string, slotIndex: number, field: "start" | "end", value: string) => {
    setError("");
    setTempAvailability(
      tempAvailability.map((av) => {
        if (av.day === day) {
          const updatedSlots = av.slots.map((s, idx) => {
            if (idx === slotIndex) {
              return { ...s, [field]: value };
            }
            return s;
          });
          return { ...av, slots: updatedSlots };
        }
        return av;
      })
    );
  };

  const handleAddSlot = (day: string) => {
    setError("");
    setTempAvailability((prev) =>
      prev.map((av) => {
        if (av.day !== day) return av;

        // Check if existing slots already have unresolved duplicate or invalid timing
        const hasIssue = av.slots.some((_, i) => getSlotIssue(av.slots, i) !== null);
        if (hasIssue) {
          setError(`Please resolve the current duplicate or invalid slot in ${day} before adding another.`);
          return av;
        }

        const newSlot = suggestNextSlot(av.slots);

        // Disallow adding duplicate slot
        const isDuplicate = av.slots.some(
          (s) => s.start.trim() === newSlot.start.trim() && s.end.trim() === newSlot.end.trim()
        );
        if (isDuplicate) {
          setError(`Time slot ${newSlot.start} to ${newSlot.end} already exists for ${day}.`);
          return av;
        }

        return { ...av, slots: [...av.slots, newSlot] };
      })
    );
  };

  const handleRemoveSlot = (day: string, slotIndex: number) => {
    setError("");
    setTempAvailability(
      tempAvailability.map((av) => {
        if (av.day === day) {
          return { ...av, slots: av.slots.filter((_, idx) => idx !== slotIndex) };
        }
        return av;
      })
    );
  };

  // Check if any slot across all enabled days has an issue (duplicate, overlap, invalid format)
  const hasAnySlotIssue = tempAvailability.some((av) =>
    av.slots.some((_, idx) => getSlotIssue(av.slots, idx) !== null)
  );

  const handleSave = async () => {
    if (!doctorId) return;
    setError("");

    // Validate all slots
    for (const dayAvail of tempAvailability) {
      if (!dayAvail.slots || dayAvail.slots.length === 0) continue;
      for (let i = 0; i < dayAvail.slots.length; i++) {
        const issue = getSlotIssue(dayAvail.slots, i);
        if (issue) {
          setError(`${dayAvail.day}: Slot ${dayAvail.slots[i].start || "empty"} - ${dayAvail.slots[i].end || "empty"} has an error: ${issue}.`);
          return;
        }
      }
    }

    setSaving(true);
    setSuccess(false);

    try {
      // Clean, deduplicate and sort before saving
      const cleanedAvailability = tempAvailability
        .filter((av) => av.slots.length > 0)
        .map((av) => ({
          day: av.day,
          slots: deduplicateSlots(av.slots).sort((a, b) => a.start.localeCompare(b.start)),
        }));

      const res = await fetch(`/api/doctors/${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: cleanedAvailability, slotDuration: tempSlotDuration }),
      });

      const data = await res.json();
      if (data.success) {
        setAvailability(cleanedAvailability);
        setSlotDuration(tempSlotDuration);
        setSuccess(true);
        setIsModalOpen(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.message || "Failed to save schedule.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Loading practice settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Practice Availability
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Set up and manage your weekly consulting days and hourly time slots.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Consultation Interval: {slotDuration} Minutes</span>
          </div>
        </div>
        <Button 
          onClick={openEditModal} 
          className="rounded-xl px-5 h-11 font-bold gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
        >
          <Edit3 className="w-4 h-4" /> Edit Schedule
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 rounded-2xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <p className="font-semibold text-sm">Consultation schedule updated successfully!</p>
        </div>
      )}

      {/* Grid of Days Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOfWeek.map((day) => {
          const dayAvail = availability.find((av) => av.day === day);
          const isActive = !!dayAvail && dayAvail.slots.length > 0;

          return (
            <div 
              key={day} 
              className={`p-6 rounded-2xl border transition-all duration-300 ${
                isActive 
                  ? "bg-card border-primary/20 shadow-sm hover:shadow-md" 
                  : "bg-muted/30 border-border opacity-70"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                <span className="font-bold text-lg">{day}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isActive ? "Available" : "Off Duty"}
                </span>
              </div>

              {isActive ? (
                <div className="space-y-2.5">
                  {deduplicateSlots(dayAvail.slots).map((slot, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2.5 text-sm font-semibold text-foreground/80 bg-muted/40 p-2.5 rounded-xl border border-border/30"
                    >
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span>{formatSlotTime(slot.start)}</span>
                      <span className="text-muted-foreground/60 font-medium">to</span>
                      <span>{formatSlotTime(slot.end)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/50">
                  <Calendar className="w-8 h-8 stroke-[1.5] mb-2" />
                  <span className="text-xs font-semibold">No consulting slots configured</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modern Modal / Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!saving) setIsModalOpen(false); }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <h3 className="text-xl font-extrabold">Edit Practice Schedule</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Toggle consulting days and add your hourly slot intervals.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive text-sm font-semibold rounded-2xl border border-destructive/20 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Slot Duration Selector */}
                <div className="bg-muted/30 border border-border/60 rounded-2xl p-4 space-y-3">
                  <Label className="text-sm font-bold block">Patient Consultation Time (Slot Duration)</Label>
                  <p className="text-xs text-muted-foreground">Select how many minutes you want to allocate per patient. Booking slots will be generated based on this interval.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[15, 30, 45, 60].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setTempSlotDuration(dur)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                          tempSlotDuration === dur
                            ? "bg-primary border-primary text-white shadow-sm"
                            : "bg-background border-border hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        {dur} Minutes
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {daysOfWeek.map((day) => {
                    const dayAvail = tempAvailability.find((av) => av.day === day);
                    const isActive = !!dayAvail;

                    return (
                      <div 
                        key={day} 
                        className={`flex flex-col md:flex-row md:items-start justify-between p-4 rounded-2xl border transition-all ${
                          isActive 
                            ? "bg-card border-primary/20 shadow-sm" 
                            : "bg-muted/20 border-border/40 opacity-70"
                        } gap-4`}
                      >
                        {/* Day Toggle */}
                        <div className="flex items-center gap-3 h-9">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleToggleDay(day)}
                            className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                            id={`modal-check-${day}`}
                          />
                          <Label 
                            htmlFor={`modal-check-${day}`} 
                            className="text-base font-bold cursor-pointer select-none"
                          >
                            {day}
                          </Label>
                        </div>

                        {/* Slots Editor */}
                        {isActive && dayAvail && (
                          <div className="flex-1 md:max-w-md space-y-3">
                            {dayAvail.slots.map((slot, index) => {
                              const issue = getSlotIssue(dayAvail.slots, index);

                              return (
                                <div key={index} className="space-y-1">
                                  <div className={`flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl border transition-colors ${
                                    issue 
                                      ? "border-destructive/60 bg-destructive/5" 
                                      : "border-transparent"
                                  }`}>
                                    <Clock className={`w-4 h-4 shrink-0 ${issue ? "text-destructive" : "text-muted-foreground"}`} />
                                    <Input
                                      type="text"
                                      value={slot.start}
                                      onChange={(e) => handleSlotChange(day, index, "start", e.target.value)}
                                      className={`w-20 sm:w-24 h-9 rounded-lg text-center text-sm font-semibold transition-colors ${
                                        issue 
                                          ? "border-destructive bg-background text-destructive focus-visible:ring-destructive" 
                                          : "bg-muted/30 border-border/60"
                                      }`}
                                      placeholder="09:00"
                                    />
                                    <span className="text-muted-foreground text-xs font-semibold px-0.5">to</span>
                                    <Input
                                      type="text"
                                      value={slot.end}
                                      onChange={(e) => handleSlotChange(day, index, "end", e.target.value)}
                                      className={`w-20 sm:w-24 h-9 rounded-lg text-center text-sm font-semibold transition-colors ${
                                        issue 
                                          ? "border-destructive bg-background text-destructive focus-visible:ring-destructive" 
                                          : "bg-muted/30 border-border/60"
                                      }`}
                                      placeholder="17:00"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveSlot(day, index)}
                                      className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  {!issue && slot.start && slot.end && (
                                    <div className="flex items-center gap-1.5 pl-6 text-[11px] text-muted-foreground font-semibold">
                                      <span>Preview:</span>
                                      <span className="text-primary font-bold">{formatSlotTime(slot.start)} to {formatSlotTime(slot.end)}</span>
                                    </div>
                                  )}
                                  {issue && (
                                    <p className="text-[11px] text-destructive font-semibold flex items-center gap-1 pl-6">
                                      <AlertCircle className="w-3 h-3 shrink-0" />
                                      {issue}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddSlot(day)}
                              className="text-xs font-bold gap-1 text-primary hover:bg-primary/5 rounded-lg px-2.5"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Time Slot
                            </Button>
                          </div>
                        )}

                        {!isActive && (
                          <div className="text-xs text-muted-foreground/60 h-9 flex items-center font-semibold">
                            Unavailable / Off Duty
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t border-border bg-muted/10 gap-3">
                {hasAnySlotIssue ? (
                  <p className="text-xs text-destructive font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Duplicate or conflicting timings detected. Please fix or remove conflicting slots.
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Slots are validated for uniqueness and chronological order.
                  </span>
                )}
                <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)} 
                    disabled={saving}
                    className="rounded-xl h-11 px-5 font-bold flex-1 sm:flex-initial"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || hasAnySlotIssue} 
                    className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 flex-1 sm:flex-initial disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Availability"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
