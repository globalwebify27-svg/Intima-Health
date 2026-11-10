"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Clock, Video } from "lucide-react";
import Link from "next/link";
import { formatNotificationDisplay } from "@/lib/notification-formatter";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  read?: boolean;
  metadata?: {
    appointmentId?: string;
    milestone?: string;
    type?: "Video" | "Walk-in";
    videoLink?: string;
    date?: string;
    time?: string;
  };
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastNotifIdRef = useRef<string | null>(null);

  // Request browser push notification permission if supported
  const requestPushPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
        setUnreadCount(json.unreadCount || 0);

        // Native Browser Push Notification for the latest unread alert
        if (
          json.data.length > 0 &&
          !json.data[0].read &&
          lastNotifIdRef.current &&
          lastNotifIdRef.current !== json.data[0]._id
        ) {
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              const formattedPush = formatNotificationDisplay(json.data[0].title, json.data[0].message);
              new window.Notification(formattedPush.title, {
                body: formattedPush.message,
                icon: "/logo.png",
              });
            } catch (e) {
              console.warn("Browser notification trigger failed:", e);
            }
          }
        }

        if (json.data.length > 0) {
          lastNotifIdRef.current = json.data[0]._id;
        }
      }
    } catch (err) {
      // Silently catch network drops
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          requestPushPermission();
        }}
        className="relative p-2 rounded-full hover:bg-muted/60 transition-colors text-foreground focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-foreground/80 hover:text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rose-600 rounded-full shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[400px] bg-card border border-border rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto divide-y divide-border/50 max-h-[420px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                No new appointment notifications yet.
              </div>
            ) : (
              notifications.map((n) => {
                const isVideo = n.metadata?.type === "Video";
                const formatted = formatNotificationDisplay(n.title, n.message);
                return (
                  <div
                    key={n._id}
                    onClick={() => markOneAsRead(n._id)}
                    className={`p-4 transition-colors flex items-start gap-3 cursor-pointer ${
                      n.read ? "bg-card hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/10"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isVideo
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                      }`}
                    >
                      {isVideo ? <Video className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className={`text-[13px] leading-snug break-words ${n.read ? "font-medium text-foreground" : "font-semibold text-foreground"}`}>
                          {formatted.title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">
                        {formatted.message}
                      </p>

                      {/* Video join link if available */}
                      {n.metadata?.videoLink && (
                        <div className="pt-1.5">
                          <Link
                            href={n.metadata.videoLink}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/10 px-2.5 py-1 rounded-lg"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Video Consultation
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-3 border-t border-border bg-muted/10 text-center text-[11px] text-muted-foreground">
            Automated alerts sent via Email, WhatsApp & Push
          </div>
        </div>
      )}
    </div>
  );
}

