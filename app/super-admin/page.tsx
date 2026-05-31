"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import CentersTable from "./components/CentersTable";
import AddCenterModal from "./components/AddCenterModal";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SuperAdminPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [showAddCenter, setShowAddCenter] =
    useState(false);

  const [centers, setCenters] =
    useState<any[]>([]);

  const [stats, setStats] =
    useState({
      centers: 0,
      warranties: 0,
      active: 0,
      expired: 0,
    });

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (
      user.email ===
      "eguard.iraq@gmail.com"
    ) {
      await loadData();
      setLoading(false);
      return;
    }

    const {
      data: profile,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq(
        "email",
        user.email
      )
      .single();

    if (
      !profile ||
      profile.role !==
        "super_admin"
    ) {
      router.push("/admin");
      return;
    }

    await loadData();
    setLoading(false);
  }

  async function loadData() {
    const {
      count: centerCount,
    } = await supabase
      .from("centers")
      .select("*", {
        count:
          "exact",
        head:
          true,
      });

    const {
      data: warranties,
    } = await supabase
      .from("warranties")
      .select("*");

    const {
      data:
        centersData,
    } = await supabase
      .from("centers")
      .select("*")
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

    setCenters(
      centersData ||
        []
    );

    const active =
      warranties?.filter(
        (w) =>
          w.status ===
          "Active"
      ).length || 0;

    const expired =
      warranties?.filter(
        (w) =>
          w.status !==
          "Active"
      ).length || 0;

    setStats({
      centers:
        centerCount ||
        0,
      warranties:
        warranties?.length ||
        0,
      active,
      expired,
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",
          background:
            "#0f0f0f",
          display:
            "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          color:
            "#fff",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        background:
          "#0f0f0f",
        minHeight:
          "100vh",
        padding:
          "24px",
      }}
    >
      <div
        style={{
          maxWidth:
            "1400px",
          margin:
            "0 auto",
        }}
      >
        <Header
          onLogout={
            logout
          }
        />

        <StatsCards
          stats={stats}
        />

        <CentersTable
          centers={
            centers
          }
          onAddCenter={() =>
            setShowAddCenter(
              true
            )
          }
        />

        <AddCenterModal
          open={
            showAddCenter
          }
          onClose={() =>
            setShowAddCenter(
              false
            )
          }
        />
      </div>
    </div>
  );
}

