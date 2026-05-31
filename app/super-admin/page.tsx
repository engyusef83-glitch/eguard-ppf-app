"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SuperAdminPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

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

  const {
    data: profile,
    error,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", user.email)
    .single();

  console.log(
    "USER:",
    user.email
  );

  console.log(
    "PROFILE:",
    profile
  );

  console.log(
    "ERROR:",
    error
  );

  // temporary bypass
  if (
    user.email ===
    "eguard.iraq@gmail.com"
  ) {
    await loadStats();
    setLoading(false);
    return;
  }

  if (
    !profile ||
    profile.role !==
      "super_admin"
  ) {
    router.push("/admin");
    return;
  }

  await loadStats();
  setLoading(false);
}

  async function loadStats() {
    const {
      count: centerCount,
    } = await supabase
      .from("centers")
      .select("*", {
        count: "exact",
        head: true,
      });

    const {
      data: warranties,
    } = await supabase
      .from("warranties")
      .select("*");

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
        centerCount || 0,
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
      <h1>
        Loading...
      </h1>
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
            "1200px",
          margin:
            "0 auto",
        }}
      >
        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "30px",
          }}
        >
          <div>
            <h1
              style={{
                color:
                  "#fff",
                marginBottom:
                  "8px",
              }}
            >
              EGUARD MASTER
              PANEL
            </h1>

            <p
              style={{
                color:
                  "#888",
              }}
            >
              Super Admin
              Dashboard
            </p>
          </div>

          <button
            onClick={
              logout
            }
            style={{
              background:
                "#222",
              color:
                "#fff",
              border:
                "1px solid #333",
              borderRadius:
                "12px",
              padding:
                "12px 18px",
            }}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap:
              "16px",
          }}
        >
          {[
            {
              title:
                "Total Centers",
              value:
                stats.centers,
            },
            {
              title:
                "Total Warranties",
              value:
                stats.warranties,
            },
            {
              title:
                "Active Warranties",
              value:
                stats.active,
            },
            {
              title:
                "Expired Warranties",
              value:
                stats.expired,
            },
          ].map(
            (
              card
            ) => (
              <div
                key={
                  card.title
                }
                style={{
                  background:
                    "#1b1b1b",
                  border:
                    "1px solid #2c2c2c",
                  borderRadius:
                    "20px",
                  padding:
                    "24px",
                }}
              >
                <p
                  style={{
                    color:
                      "#888",
                  }}
                >
                  {
                    card.title
                  }
                </p>

                <h2
                  style={{
                    color:
                      "#fff",
                    fontSize:
                      "36px",
                  }}
                >
                  {
                    card.value
                  }
                </h2>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}