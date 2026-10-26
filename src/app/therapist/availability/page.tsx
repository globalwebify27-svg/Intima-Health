"use client";

import { useEffect, useState } from "react";
import { Clock, Plus, Trash2, CheckCircle2, Save, Sparkles, RefreshCw } from "lucide-react";
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

export default function TherapistAvailabilityPage() {
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Quick slot adder state
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [newStart, setNewStart] = useState("10:00");
  const [newEnd, setNewEnd] = useState("11:00");

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
            // Ensure all 7 days exist in state
            const merged = DAYS_OF_WEEK.map((d) => {
              const found = existing.find((a: any) => a.day.toLowerCase() === d.toLowerCase());
              return {
                day: d,
                slots: found ? found.slots : [],
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
          // Add default slots
          return {
            ...item,
            slots: [
              { start: "10:00", end: "11:00" },
              { start: "11:30", end: "12:30" },
              { start: "14:00", end: "15:00" },
              { start: "16:00", end: "17:00" },
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

  const handleAddSlot = (day: string) => {
    if (!newStart || !newEnd) return;
    setAvailability((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        return {
          ...item,
          slots: [...item.slots, { start: newStart, end: newEnd }].sort((a, b) =>
            a.start.localeCompare(b.start)
          ),
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
            { start: "09:00", end: "10:00" },
            { start: "10:30", end: "11:30" },
            { start: "12:00", end: "13:00" },
            { start: "14:30", end: "15:30" },
            { start: "16:00", end: "17:00" },
          ],
        };
      })
    );
  };

  const handleSave = async () => {
    if (!therapistId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/therapists/${therapistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Availability schedule updated successfully! Patients will see real-time available slots.");
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
                    onClick={() => setAddingDay(item.day)}
                    className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl text-xs h-8 gap-1"
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs font-semibold text-foreground group"
                    >
                      <Clock className="w-3 h-3 text-primary" />
                      <span>{slot.start} – {slot.end}</span>
                      <button
                        type="button"
                        onClick={() => removeSlot(item.day, idx)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Add Slot Box */}
              {addingDay === item.day && (
                <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Start:</span>
                    <input
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-border bg-background text-xs font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">End:</span>
                    <input
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-border bg-background text-xs font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddingDay(null)}
                      className="rounded-lg text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddSlot(item.day)}
                      className="rounded-lg text-xs h-7 bg-primary hover:bg-primary/90 text-white font-bold"
                    >
                      Save Slot
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
