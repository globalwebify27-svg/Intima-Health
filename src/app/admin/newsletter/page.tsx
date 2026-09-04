"use client";

import { useState, useEffect } from "react";
import { Mail, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INewsletterSubscriber } from "@/modules/newsletter/types";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<INewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      if (data.success && data.data) {
        setSubscribers(data.data);
      } else {
        alert(data.message || "Failed to fetch subscribers");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers(prev => prev.filter(s => s._id?.toString() !== id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to delete subscriber");
    }
  };

  const handleExport = () => {
    if (subscribers.length === 0) return;
    
    // Simple CSV export
    const headers = ["Email", "Status", "Subscribed At"];
    const rows = subscribers.map(s => [
      s.email,
      s.status,
      new Date(s.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Newsletter Subscribers</h1>
          <p className="text-muted-foreground text-sm">Manage the email list for your newsletter campaigns.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleExport} variant="outline" className="text-xs">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/20 flex gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border/60 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 font-semibold text-muted-foreground">Email</th>
              <th className="p-4 font-semibold text-muted-foreground">Status</th>
              <th className="p-4 font-semibold text-muted-foreground">Subscribed On</th>
              <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">No subscribers found.</td>
              </tr>
            ) : (
              filtered.map(subscriber => (
                <tr key={subscriber._id?.toString()} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="w-4 h-4" />
                    </div>
                    {subscriber.email}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      subscriber.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDelete(subscriber._id!.toString())}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
