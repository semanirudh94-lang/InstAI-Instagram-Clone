"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import Avatar from "@/components/insta/Avatar";
import MobileNav from "@/components/insta/MobileNav";
import Sidebar from "@/components/insta/Sidebar";
import axiosInstance from "@/lib/axios";
import { useLanguage } from "@/lib/LanguageProvider";

export default function ReelsPage() {
  const { t } = useLanguage();
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/posts")
      .then((res) =>
        setReels(
          (res.data.posts ?? []).filter((p: any) =>
            p.media?.some((m: any) => m.type === "video"),
          ),
        ),
      )
      .catch(() => setReels([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-ig-surface md:bg-ig-ig min-h-screen flex items-center justify-center">
        <p className="text-sm text-ig-muted">{t("common.loading")}</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="bg-ig-surface md:bg-ig-ig min-h-screen">
        <Sidebar />
        <div className="md:ml-[72px] xl:ml-[244px]">
          <div className="max-w-[640px] mx-auto px-4 py-16 text-center">
            <h1 className="text-xl font-semibold text-ig-text mb-3">
              {t("reels.title")}
            </h1>
            <p className="text-sm text-ig-muted">{t("reels.empty")}</p>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <Sidebar />
      <div className="md:ml-[72px] xl:ml-[244px]">
        <div className="h-[calc(100dvh-50px)] md:h-screen snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
          {reels.map((reel) => (
            <section
              key={reel._id}
              className="h-full snap-start flex items-center justify-center relative"
            >
              <video
                src={reel.media.find((m: any) => m.type === "video")?.url}
                controls
                playsInline
                loop
                className="max-h-full max-w-full md:rounded-lg"
              />
              <div className="absolute left-4 bottom-6 md:bottom-10 flex items-center gap-3 max-w-[80%]">
                <Link
                  href={`/profile/${reel.user?.username ?? ""}`}
                  className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/40"
                >
                  <Avatar
                    src={reel.user?.profilePicture}
                    name={reel.user?.username}
                  />
                </Link>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {reel.user?.username}
                  </p>
                  <p className="text-xs text-white/80 line-clamp-2">
                    {reel.caption}
                  </p>
                </div>
              </div>
              <div className="absolute right-3 bottom-8 flex flex-col items-center gap-4 text-white">
                <span className="flex flex-col items-center text-xs gap-1">
                  <Heart size={22} />
                  {reel.likesCount ?? reel.likes?.length ?? 0}
                </span>
                <span className="flex flex-col items-center text-xs gap-1">
                  <MessageCircle size={22} />
                  {reel.commentsCount ?? reel.comments?.length ?? 0}
                </span>
              </div>
            </section>
          ))}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
