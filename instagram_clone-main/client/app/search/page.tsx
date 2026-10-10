"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import Avatar from "@/components/insta/Avatar";
import MobileNav from "@/components/insta/MobileNav";
import Sidebar from "@/components/insta/Sidebar";
import axiosInstance from "@/lib/axios";
import { searchUsers, type TaggableUser } from "@/lib/auth.service";
import { useLanguage } from "@/lib/LanguageProvider";

export default function SearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TaggableUser[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    axiosInstance
      .get("/api/follow/following")
      .then((res) =>
        setFollowing(new Set((res.data.users ?? []).map((u: any) => u._id))),
      )
      .catch(() => {});
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchUsers(query.trim()));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 350);
  }, [query]);

  const toggleFollow = async (user: TaggableUser) => {
    const isFollowing = following.has(user._id);
    setFollowing((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(user._id);
      else next.add(user._id);
      return next;
    });
    try {
      if (isFollowing) {
        await axiosInstance.delete(`/api/follow/${user._id}`);
      } else {
        await axiosInstance.post(`/api/follow/${user._id}`);
      }
    } catch {
      setFollowing((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.add(user._id);
        else next.delete(user._id);
        return next;
      });
    }
  };

  return (
    <div className="bg-ig-surface md:bg-ig-ig min-h-screen">
      <Sidebar />
      <div className="md:ml-[72px] xl:ml-[244px]">
        <div className="max-w-[640px] mx-auto px-4 py-8 pb-24 md:pb-8">
          <h1 className="text-xl font-semibold text-ig-text mb-6">
            {t("search.title")}
          </h1>

          <div className="flex items-center gap-2 bg-ig-hover border border-ig-border rounded-lg px-3 py-2.5">
            <SearchIcon size={16} className="text-ig-muted shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="flex-1 bg-transparent outline-none text-sm text-ig-text placeholder:text-ig-muted"
            />
          </div>

          <p className="text-xs text-ig-muted mt-3">
            {query.trim().length < 2 ? t("search.hint") : ""}
          </p>

          {loading && (
            <p className="text-sm text-ig-muted mt-6">{t("common.loading")}</p>
          )}

          {!loading && searched && results.length === 0 && (
            <p className="text-sm text-ig-muted mt-6">{t("search.noResults")}</p>
          )}

          <div className="flex flex-col gap-1 mt-4">
            {results.map((user) => {
              const isFollowing = following.has(user._id);
              return (
                <div
                  key={user._id}
                  className="flex items-center gap-3 px-1 py-2 rounded-lg hover:bg-ig-hover transition-colors"
                >
                  <Link
                    href={`/profile/${user.username}`}
                    className="w-11 h-11 rounded-full overflow-hidden shrink-0"
                  >
                    <Avatar src={user.profilePicture} name={user.username} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${user.username}`}
                      className="block text-sm font-semibold text-ig-text truncate"
                    >
                      {user.username}
                    </Link>
                    <p className="text-xs text-ig-muted truncate">
                      {user.fullName}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFollow(user)}
                    className={`text-xs font-semibold px-4 py-1.5 rounded-lg border transition-colors shrink-0 ${
                      isFollowing
                        ? "border-ig-border text-ig-text hover:bg-ig-hover"
                        : "border-[#0095f6] bg-[#0095f6] text-white hover:opacity-90"
                    }`}
                  >
                    {isFollowing ? t("profile.following") : t("profile.follow")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
