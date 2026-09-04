"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: "Please enter an email address", type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setEmail("");
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: "An error occurred. Please try again.", type: 'error' });
    } finally {
      setLoading(false);
      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative group w-full mb-2">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address" 
          required
          disabled={loading}
          className="w-full bg-white border border-border/60 rounded-full px-8 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4A154B]/50 transition-all font-medium shadow-sm disabled:opacity-70"
        />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#4A154B] hover:bg-[#3d113e] disabled:bg-[#4A154B]/70 text-white rounded-full flex items-center justify-center transition-all group-hover:scale-105 shadow-md"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </form>
      
      {message && (
        <div className={`text-sm px-4 ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

