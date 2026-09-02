import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Hospital, Video, ShieldAlert, HeartHandshake, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Appointment {
  _id: string;
  doctorId: {
    name: string;
    specialization: string;
    clinicId?: string;
    fees?: number;
  };
  date: string;
  time: string;
  type: string;
  status: string;
  paymentStatus?: string;
  serviceName?: string;
}

interface UpcomingAppointmentsSliderProps {
  upcomingApts: Appointment[];
  openBooking: () => void;
  handlePayAppointment: (id: string) => void;
}

const getServiceConfig = (serviceName?: string, type?: string) => {
  const name = (serviceName || "").toLowerCase();
  
  const fallbackLabel = serviceName || (type === "Video" ? "Online Session" : "In-Clinic Session");

  if (name.includes("video") || name.includes("online")) {
    return { icon: Video, label: fallbackLabel };
  }
  if (name.includes("therapy") || name.includes("counseling")) {
    return { icon: HeartHandshake, label: fallbackLabel };
  }
  if (name.includes("consultation")) {
    return { icon: Stethoscope, label: fallbackLabel };
  }
  
  if (type === "Video") {
    return { icon: Video, label: fallbackLabel };
  }
  
  return { icon: Hospital, label: fallbackLabel };
};

const formatTime = (time24: string) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export function UpcomingAppointmentsSlider({ 
  upcomingApts, 
  openBooking, 
  handlePayAppointment 
}: UpcomingAppointmentsSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== currentSlide) {
        setCurrentSlide(newIndex);
      }
    }
  };

  return (
    <div className="col-span-full lg:col-span-1 overflow-hidden flex flex-col relative">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {upcomingApts.map((upcomingApt) => {
          const { icon: ServiceIcon, label: serviceLabel } = getServiceConfig(upcomingApt.serviceName, upcomingApt.type);
          
          return (
            <motion.div
              key={upcomingApt._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-primary/5 rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[260px] lg:min-h-[220px] h-full w-[300px] sm:w-full shrink-0 snap-center"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ServiceIcon className="w-24 h-24" />
              </div>
              <div>
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="flex items-center gap-2 text-primary">
                    <ServiceIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {serviceLabel}
                    </span>
                  </div>
                  {upcomingApt.paymentStatus === "Paid" && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider z-10">
                      Paid
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{upcomingApt.doctorId?.name || "Clinician Practitioner"}</h3>
                <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">{upcomingApt.doctorId?.specialization || "Wellness Expert"}</p>
                <p className="text-sm text-muted-foreground font-medium">{upcomingApt.date} at {formatTime(upcomingApt.time)}</p>

                {upcomingApt.paymentStatus !== "Paid" && (
                  <p className="text-xs text-amber-600 font-bold mt-2 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Please pay the consultation fee to confirm your booking.
                  </p>
                )}
              </div>
              {upcomingApt.paymentStatus === "Paid" ? (
                (() => {
                  const isVideo = upcomingApt.type !== "Walk-in";
                  let canJoin = false;
                  
                  if (isVideo && upcomingApt.date && upcomingApt.time) {
                    const now = new Date();
                    const [hours, minutes] = upcomingApt.time.split(':').map(Number);
                    const aptDate = new Date(`${upcomingApt.date}T00:00:00`);
                    aptDate.setHours(hours, minutes, 0, 0);
                    const diffMinutes = (aptDate.getTime() - now.getTime()) / (1000 * 60);
                    // Joinable if within 15 minutes before, or already started
                    canJoin = diffMinutes <= 15;
                  }

                  if (isVideo && !canJoin) {
                    return (
                      <Button 
                        disabled
                        variant="secondary"
                        className="w-full rounded-xl h-11 font-bold mt-6 shadow-none opacity-80 cursor-not-allowed"
                      >
                        Available 15m before
                      </Button>
                    );
                  }

                  return (
                    <Button 
                      onClick={() => window.location.href = isVideo ? "/patient/consultations" : "/patient/appointments"} 
                      className="w-full rounded-xl h-11 font-bold mt-6 shadow-md shadow-primary/10 hover:shadow-primary/20"
                    >
                      {isVideo ? "Join Consultation Room" : "View Appointment Details"}
                    </Button>
                  );
                })()
              ) : (
                <Button 
                  onClick={() => handlePayAppointment(upcomingApt._id)} 
                  className="w-full rounded-xl h-11 font-bold mt-6 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/10"
                >
                  Pay Consultation Fee (₹{upcomingApt.type === "Walk-in" ? "1,499" : "999"})
                </Button>
              )}
            </motion.div>
          );
        })}
        
        <motion.div
          key="book-new"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-primary/5 rounded-3xl border border-primary/20 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[260px] lg:min-h-[220px] h-full w-[300px] sm:w-full shrink-0 snap-center"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Hospital className="w-24 h-24" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-muted-foreground"></span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {upcomingApts.length > 0 ? "Need another visit?" : "Upcoming Session"}
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2">
              {upcomingApts.length > 0 ? "Book New Appointment" : "No Scheduled Sessions"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {upcomingApts.length > 0 
                ? "Schedule a new consultation or therapy session." 
                : "Book a consultation with one of our clinic locations."}
            </p>
          </div>
          <Button 
            onClick={() => openBooking()} 
            className="w-full rounded-xl h-11 font-bold mt-6"
          >
            Book New Appointment
          </Button>
        </motion.div>
      </div>
      {upcomingApts.length > 0 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10">
          {[...upcomingApts, 'book'].map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? "w-4 bg-primary" : "w-1.5 bg-primary/20"}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
