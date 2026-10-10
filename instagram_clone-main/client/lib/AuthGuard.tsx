"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";

const publicRoutes = ["/login", "/signup"];

export default function AuthGuard({ children }: any) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.ready);

  useEffect(() => {
    if (!ready) return;

    // Not logged in and trying to access a protected page
    if (!user && !publicRoutes.includes(pathname)) {
      router.replace("/login");
    }

    // Logged in and trying to access login/signup
    if (user && publicRoutes.includes(pathname)) {
      router.replace("/");
    }
  }, [user, ready, pathname, router]);

  return children;
}
