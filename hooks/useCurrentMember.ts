"use client";

import { useEffect, useState } from "react";

export type CurrentMember = {
  id: string;
  fullName: string;
  phone: string;
  role: string;
};

export function useCurrentMember() {
  const [member, setMember] = useState<CurrentMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("teamSyncMember");

    if (stored) {
      setMember(JSON.parse(stored));
    }

    setLoading(false);
  }, []);

  return {
    member,
    loading,
  };
}