"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { useCurrentMember } from "@/hooks/useCurrentMember";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { member, loading } = useCurrentMember();

  useEffect(() => {
    if (!loading && !member) {
      router.replace("/login");
    }
  }, [loading, member, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070b] text-white">
        טוען...
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <Sidebar />

      <div className="pb-24 lg:mr-72 lg:pb-0">
        {children}
      </div>

      <MobileNavigation />
    </div>
  );
}