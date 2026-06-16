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
          setAvailability(data.data.availability || []);
          setSlotDuration(data.data.slotDuration || 30);
        }
      })
      .catch((err) => setError(err.message || "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const openEditModal = () => {
    // Clone current availability to temporary state for modal editing
    setTempAvailability(JSON.parse(JSON.stringify(availability)));
    setTempSlotDuration(slotDuration);
    setIsModalOpen(true);
  };

  const handleToggleDay = (day: string) => {
    const exists = tempAvailability.some((av) => av.day === day);
    if (exists) {
      setTempAvailability(tempAvailability.filter((av) => av.day !== day));
    } else {
      setTempAvailability([...tempAvailability, { day, slots: [{ start: "09:00", end: "17:00" }] }]);
    }
  };

  const handleSlotChange = (day: string, slotIndex: number, field: "start" | "end", value: string) => {
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
    setTempAvailability(
      tempAvailability.map((av) => {
        if (av.day === day) {
          return { ...av, slots: [...av.slots, { start: "09:00", end: "17:00" }] };
        }
        return av;
      })
    );
  };

  const handleRemoveSlot = (day: string, slotIndex: number) => {
    setTempAvailability(
      tempAvailability.map((av) => {
        if (av.day === day) {
          return { ...av, slots: av.slots.filter((_, idx) => idx !== slotIndex) };
        }
        return av;
      })
    );
  };

  const handleSave = async () => {
    if (!doctorId) return;
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      // Basic validation check for time formats
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      for (const dayAvail of tempAvailability) {
        for (const slot of dayAvail.slots) {
          if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
            throw new Error(`Invalid time format in ${dayAvail.day}. Use HH:MM format.`);
          }
        }
      }

      const res = await fetch(`/api/doctors/${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: tempAvailability, slotDuration: tempSlotDuration }),
      });

      const data = await res.json();
      if (data.success) {
        setAvailability(tempAvailability);
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
                  {dayAvail.slots.map((slot, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2.5 text-sm font-semibold text-foreground/80 bg-muted/40 p-2.5 rounded-xl border border-border/30"
                    >
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{slot.start}</span>
                      <span className="text-muted-foreground/60 font-medium">to</span>
                      <span>{slot.end}</span>
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
                            {dayAvail.slots.map((slot, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <Input
                                  type="text"
                                  value={slot.start}
                                  onChange={(e) => handleSlotChange(day, index, "start", e.target.value)}
                                  className="w-24 h-9 bg-muted/30 border-border/60 rounded-lg text-center text-sm font-semibold"
                                  placeholder="09:00"
                                />
                                <span className="text-muted-foreground text-xs font-semibold px-1">to</span>
                                <Input
                                  type="text"
                                  value={slot.end}
                                  onChange={(e) => handleSlotChange(day, index, "end", e.target.value)}
                                  className="w-24 h-9 bg-muted/30 border-border/60 rounded-lg text-center text-sm font-semibold"
                                  placeholder="17:00"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveSlot(day, index)}
                                  className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
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
              <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/10 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={saving}
                  className="rounded-xl h-11 px-5 font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20"
                >
                  {saving ? "Saving Changes..." : "Save Availability"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
