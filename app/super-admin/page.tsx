
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

    // master account
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
      .eq("email", user.email)
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
        count: "exact",
        head: true,
      });

    const {
      data: warranties,
    } = await supabase
      .from("warranties")
      .select("*");

   const {
  data: centersData,
  error: centersError,
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

console.log(
  "CENTERS:",
  centersData
);

console.log(
  "CENTERS ERROR:",
  centersError
);



setCenters(
  centersData || []
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
      <div
        style={{
          background:
            "#0f0f0f",
          minHeight:
            "100vh",
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
        {/* Header */}
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
              EGUARD MASTER PANEL
            </h1>

            <p
              style={{
                color:
                  "#888",
              }}
            >
              Super Admin Dashboard
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
              cursor:
                "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap:
              "16px",
            marginBottom:
              "30px",
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

        {/* Centers Management */}
        <div
          style={{
            background:
              "#1b1b1b",
            border:
              "1px solid #2c2c2c",
            borderRadius:
              "24px",
            padding:
              "24px",
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
                "24px",
            }}
          >
            <h2
              style={{
                color:
                  "#fff",
                margin: 0,
              }}
            >
              Centers Management
            </h2>

            <button
              style={{
                background:
                  "#24a444",
                color:
                  "#fff",
                border:
                  "none",
                borderRadius:
                  "12px",
                padding:
                  "12px 18px",
                cursor:
                  "pointer",
                fontWeight:
                  600,
              }}
            >
              + Add Center
            </button>
          </div>

          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Center",
                    "Phone",
                    "Governorate",
                    "City",
                    "Email",
                    "Status",
                    "Actions",
                  ].map(
                    (
                      item
                    ) => (
                      <th
                        key={
                          item
                        }
                        style={{
                          color:
                            "#888",
                          textAlign:
                            "left",
                          padding:
                            "14px",
                          borderBottom:
                            "1px solid #333",
                        }}
                      >
                        {item}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {centers.map(
                  (
                    center
                  ) => (
                    <tr
                      key={
                        center.id
                      }
                    >
                      <td
                        style={{
                          padding:
                            "16px",
                          color:
                            "#fff",
                        }}
                      >
                        {
                          center.center_name
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "16px",
                          color:
                            "#ddd",
                        }}
                      >
                        {center.phone ||
                          "-"}
                      </td>

                      <td
                        style={{
                          padding:
                            "16px",
                          color:
                            "#ddd",
                        }}
                      >
                        {center.governorate ||
                          "-"}
                      </td>

                      <td
                        style={{
                          padding:
                            "16px",
                          color:
                            "#ddd",
                        }}
                      >
                        {center.city ||
                          "-"}
                      </td>

                      <td
                        style={{
                          padding:
                            "16px",
                          color:
                            "#ddd",
                        }}
                      >
                        {
                          center.email
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "16px",
                        }}
                      >
                        <span
                          style={{
                            background:
                              center.status ===
                              "Suspended"
                                ? "#742a2a"
                                : "#24a444",
                            color:
                              "#fff",
                            padding:
                              "8px 12px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "12px",
                          }}
                        >
                          {center.status ||
                            "Active"}
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            "16px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "8px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          {[
                            "Edit",
                            "Reset Password",
                            "Disable",
                            "Delete",
                          ].map(
                            (
                              action
                            ) => (
                              <button
                                key={
                                  action
                                }
                                style={{
                                  background:
                                    "#222",
                                  border:
                                    "1px solid #333",
                                  color:
                                    "#fff",
                                  borderRadius:
                                    "10px",
                                  padding:
                                    "8px 12px",
                                  cursor:
                                    "pointer",
                                }}
                              >
                                {
                                  action
                                }
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

