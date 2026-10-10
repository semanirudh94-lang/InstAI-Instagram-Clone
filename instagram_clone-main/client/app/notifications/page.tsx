"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import Avatar from "@/components/insta/Avatar";
import MobileNav from "@/components/insta/MobileNav";
import Sidebar from "@/components/insta/Sidebar";
import axiosInstance from "@/lib/axios";
import { useLanguage } from "@/lib/LanguageProvider";

interface ActivityItem {
  _id: string;
  type: "like" | "comment" | "follow";
  user: { username: string; fullName?: string; profilePicture?: string };
  post?: { _id: string; media?: { url: string }[] };
  text?: string;
  createdAt: string;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export default function NotificationsPage() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const rtf = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
  const since = (iso: string) => {
    const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
    for (const [unit, size] of UNITS) {
      if (seconds >= size) return rtf.format(-Math.round(seconds / size), unit);
    }
    return rtf.format(0, "second");
  };

  useEffect(() => {
    axiosInstance
      .get("/api/notifications")
      .then((res) => setItems(res.data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const label = (item: ActivityItem) => {
    if (item.type === "follow") return t("notifications.follow");
    if (item.type === "comment")
      return t("notifications.comment", { text: item.text ?? "" });
    return t("notifications.like");
  };

  const icon = (type: ActivityItem["type"]) =>
    type === "follow" ? (
      <UserPlus size={14} className="text-[#0095f6]" />
    ) : type === "comment" ? (
      <MessageCircle size={14} className="text-[#0095f6]" />
    ) : (
      <Heart size={14} className="text-[#ed4956]" fill="currentColor" />
    );

  return (
    <div className="bg-ig-surface md:bg-ig-ig min-h-screen">
      <Sidebar />
      <div className="md:ml-[72px] xl:ml-[244px]">
        <div className="max-w-[640px] mx-auto px-4 py-8 pb-24 md:pb-8">
          <h1 className="text-xl font-semibold text-ig-text mb-6">
            {t("notifications.title")}
          </h1>

          {loading ? (
            <p className="text-sm text-ig-muted">{t("common.loading")}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-ig-muted">{t("notifications.empty")}</p>
          ) : (
            <div className="flex flex-col">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 py-3 border-b border-ig-border last:border-0"
                >
                  <div className="relative shrink-0">
                    <Link
                      href={`/profile/${item.user?.username ?? ""}`}
                      className="block w-11 h-11 rounded-full overflow-hidden"
                    >
                      <Avatar
                        src={item.user?.profilePicture}
                        name={item.user?.username}
                      />
                    </Link>
                    <span className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-ig-surface border border-ig-border flex items-center justify-center">
                      {icon(item.type)}
                    </span>
                  </div>

                  <p className="flex-1 min-w-0 text-sm text-ig-muted">
                    <Link
                      href={`/profile/${item.user?.username ?? ""}`}
                      className="font-semibold text-ig-text hover:opacity-70"
                    >
                      {item.user?.username}
                    </Link>{" "}
                    {label(item)}
                    <span className="text-ig-muted"> · {since(item.createdAt)}</span>
                  </p>

                  {item.post?.media?.[0]?.url && (
                    <div className="w-11 h-11 rounded overflow-hidden bg-ig-hover shrink-0">
                      <img
                        src={item.post.media[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
