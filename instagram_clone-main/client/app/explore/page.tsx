"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import MobileNav from "@/components/insta/MobileNav";
import PostModal from "@/components/insta/PostModal";
import Sidebar from "@/components/insta/Sidebar";
import axiosInstance from "@/lib/axios";
import { useLanguage } from "@/lib/LanguageProvider";

export default function ExplorePage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    axiosInstance
      .get("/api/posts")
      .then((res) => setPosts(res.data.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-ig-surface md:bg-ig-ig min-h-screen">
      <Sidebar />
      <div className="md:ml-[72px] xl:ml-[244px]">
        <div className="max-w-[940px] mx-auto px-1 md:px-4 py-4 md:py-8 pb-[60px] md:pb-8">
          <h1 className="hidden md:block text-xl font-semibold text-ig-text mb-6 px-3">
            {t("explore.title")}
          </h1>

          {loading ? (
            <p className="text-sm text-ig-muted py-10 text-center">
              {t("common.loading")}
            </p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-ig-muted py-10 text-center">
              {t("explore.empty")}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {posts.map((post) => {
                const media = post.media?.[0];
                const isVideo = media?.type === "video";
                return (
                  <button
                    key={post._id}
                    onClick={() => setSelected(post)}
                    className="relative aspect-square bg-ig-hover overflow-hidden group"
                  >
                    {isVideo ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-ig-border/40">
                        <Play size={22} className="text-ig-muted" />
                      </span>
                    ) : (
                      <img
                        src={media?.url}
                        alt={post.caption || ""}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                    )}
                    {isVideo && (
                      <Play
                        size={18}
                        fill="white"
                        className="absolute right-1.5 top-1.5 text-white drop-shadow"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <MobileNav />

      {selected && <PostModal post={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
