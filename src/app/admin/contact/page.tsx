"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, CheckCircle, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ISubmission {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: "New" | "Read" | "Replied";
  createdAt: string;
}

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/contact");
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data);
      } else {
        setError(json.error || "Failed to load submissions");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmissions(submissions.map((s) => (s._id === id ? json.data : s)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground">Contact Submissions</h1>
          <p className="text-muted-foreground mt-1">Manage all public inquiries from the contact form.</p>
        </div>
        <Button onClick={fetchSubmissions} variant="outline" className="rounded-xl border-border/60 shadow-sm text-sm font-semibold h-10 px-4">
          Refresh List
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-xl border border-destructive/20 flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
          Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-card border border-border rounded-[2rem] p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No submissions</h3>
          <p className="text-muted-foreground">You haven't received any contact inquiries yet.</p>
        </div>
      ) : (
        <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-4">Sender</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Message Preview</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {submissions.map((sub) => (
                  <motion.tr
                    key={sub._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{sub.firstName} {sub.lastName}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {sub.email}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">{sub.subject}</td>
                    <td className="p-4">
                      <div className="max-w-[200px] truncate text-muted-foreground" title={sub.message}>
                        {sub.message}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === "New" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                        sub.status === "Replied" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                        "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sub.status === "New" && (
                          <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 rounded-lg" onClick={() => updateStatus(sub._id, "Read")}>
                            Mark Read
                          </Button>
                        )}
                        <Button size="sm" className="h-7 text-[10px] px-2 rounded-lg bg-primary hover:bg-primary/90 text-white" onClick={() => updateStatus(sub._id, "Replied")}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Replied
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
