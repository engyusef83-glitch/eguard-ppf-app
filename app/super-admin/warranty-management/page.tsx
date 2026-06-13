"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WarrantyManagementPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [warranties, setWarranties] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

const [
  centerFilter,
  setCenterFilter,
] = useState("All Centers");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
const { data, error } =
  await supabase
    .from("warranties")
    .select("*");

console.log(
  "WARRANTIES:",
  data
);

console.log(
  "ERROR:",
  error
);

    setWarranties(data || []);
    setLoading(false);
  }

  function getWarrantyStatus(
    item: any
  ) {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    if (
      item.status ===
      "Cancelled"
    ) {
      return "Cancelled";
    }

    const daysRemaining =
      Math.ceil(
        (
          new Date(
            item.end_date
          ).getTime() -
          new Date(today).getTime()
        ) /
          (1000 *
            60 *
            60 *
            24)
      );

    if (
      daysRemaining < 0
    ) {
      return "Expired";
    }

    if (
      daysRemaining <=
      30
    ) {
      return "Expiring Soon";
    }

    return "Active";
  }

  function getStatusColor(
    status: string
  ) {
    if (
      status ===
      "Cancelled"
    ) {
      return "#ff4444";
    }

    if (
      status ===
      "Expired"
    ) {
      return "#ffd54f";
    }

    if (
      status ===
      "Expiring Soon"
    ) {
      return "#ff9800";
    }

    return "#24a444";
  }


const centers =
  Array.from(
    new Set(
      warranties
        .map(
          (w) =>
            w.center_name
        )
        .filter(Boolean)
    )
  ).sort();

  const filteredWarranties =
    warranties.filter(
      (item) => {

        const status =
          getWarrantyStatus(
            item
          );

        const q =
          search.toLowerCase();

        const matchesSearch =
          item.customer_name
            ?.toLowerCase()
            .includes(q) ||
          item.roll_number
            ?.toLowerCase()
            .includes(q) ||
          item.vin
            ?.toLowerCase()
            .includes(q) ||
          item.center_name
            ?.toLowerCase()
            .includes(q);

        const matchesStatus =
          statusFilter ===
          "All"
            ? true
            : status ===
              statusFilter;

const matchesCenter =
  centerFilter ===
  "All Centers"
    ? true
    : item.center_name ===
      centerFilter;

return (
  matchesSearch &&
  matchesStatus &&
  matchesCenter
);

      }
    );



const totalCount =
  filteredWarranties.length;

const activeCount =
  filteredWarranties.filter(
    (w) =>
      getWarrantyStatus(w) ===
      "Active"
  ).length;

const expiringSoonCount =
  filteredWarranties.filter(
    (w) =>
      getWarrantyStatus(w) ===
      "Expiring Soon"
  ).length;

const expiredCount =
  filteredWarranties.filter(
    (w) =>
      getWarrantyStatus(w) ===
      "Expired"
  ).length;


const cancelledCount =
  filteredWarranties.filter(
    (w) =>
      getWarrantyStatus(w) ===
      "Cancelled"
  ).length;

function exportToExcel() {
  const exportData =
    filteredWarranties.map(
      (item) => {

        const status =
          getWarrantyStatus(item);

        let daysLeft = 0;

        if (item.end_date) {
          daysLeft =
            Math.ceil(
              (
                new Date(item.end_date).getTime() -
                Date.now()
              ) /
              (
                1000 *
                60 *
                60 *
                24
              )
            );
        }

async function releaseRoll(
  item: any
) {

  const confirmed =
    confirm(
      `Release Roll ${item.roll_number}?`
    );

  if (!confirmed) {
    return;
  }

  // تحديث المخزون

  await supabase
    .from("roll_inventory")
    .update({
      roll_status:
        "Released",
    })
    .eq(
      "roll_number",
      item.roll_number
    );

  // تحديث الضمان

  await supabase
    .from("warranties")
    .update({
      roll_status:
        "Released",
    })
    .eq(
      "id",
      item.id
    );

  alert(
    "Roll Released Successfully"
  );

const {
  data: { user },
} = await supabase.auth.getUser();

await supabase
  .from(
    "roll_release_log"
  )
  .insert([
    {
      roll_number:
        item.roll_number,

      warranty_id:
        item.id,

      released_by:
        user?.email,

      reason:
        "Warranty Cancelled",
    },
  ]);

  loadData();
}

        return {
          Customer:
            item.customer_name,

          Center:
            item.center_name ||
            "Unknown Center",

          Product:
            item.product_name,

          Roll:
            item.roll_number,

          VIN:
            item.vin,

          StartDate:
            item.start_date,

          EndDate:
            item.end_date,

          DaysLeft:
            status ===
            "Cancelled"
              ? "--"
              : daysLeft,

          Status:
            status,
        };
      }
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      exportData
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Warranties"
  );

  XLSX.writeFile(
    workbook,
    `Warranty-Management-${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`
  );
}

async function releaseRoll(
  item: any
) {

  const confirmed =
    confirm(
      `Release Roll ${item.roll_number}?`
    );

  if (!confirmed) {
    return;
  }

  await supabase
    .from("roll_inventory")
    .update({
      roll_status:
        "Released",
    })
    .eq(
      "roll_number",
      item.roll_number
    );

  await supabase
    .from("warranties")
    .update({
      roll_status:
        "Released",
    })
    .eq(
      "id",
      item.id
    );

  alert(
    "Roll Released Successfully"
  );

  loadData();
}
  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",
          background:
            "#0f0f0f",
          color:
            "#fff",
          display:
            "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
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
            "1600px",
          margin:
            "0 auto",
        }}
      >
        <h1
          style={{
            color:
              "#fff",
            marginBottom:
              "20px",
          }}
        >
          Warranty Management
        </h1>

        <div
          style={{
            display:
              "flex",
            gap:
              "12px",
            marginBottom:
              "20px",
            flexWrap:
              "wrap",
          }}
        >
          <input
            placeholder="Search Customer / VIN / Roll / Center"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              flex:
                "1",
              minWidth:
                "300px",
              padding:
                "14px",
              borderRadius:
                "12px",
              border:
                "1px solid #333",
              background:
                "#1b1b1b",
              color:
                "#fff",
            }}
          />

          <select
            value={
              statusFilter
            }
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={{
              padding:
                "14px",
              borderRadius:
                "12px",
              background:
                "#1b1b1b",
              color:
                "#fff",
              border:
                "1px solid #333",
            }}
          >
            <option>
              All
            </option>

            <option>
              Active
            </option>

            <option>
              Expiring Soon
            </option>

            <option>
              Expired
            </option>

            <option>
              Cancelled
            </option>
          </select>
<select
  value={centerFilter}
  onChange={(e) =>
    setCenterFilter(
      e.target.value
    )
  }
  style={{
    padding: "14px",
    borderRadius: "12px",
    background: "#1b1b1b",
    color: "#fff",
    border: "1px solid #333",
    minWidth: "220px",
  }}
>
  <option>
    All Centers
  </option>

  {centers.map(
    (center) => (
      <option
        key={center}
      >
        {center}
      </option>
    )
  )}
</select>

        </div>

<div
  style={{
    display: "flex",
    justifyContent:
      "flex-end",
    marginBottom: "16px",
  }}
>
  <button
onClick={exportToExcel}
    style={{
      background:
        "#24a444",
      color: "#fff",
      border: "none",
      borderRadius:
        "10px",
      padding:
        "12px 18px",
      cursor:
        "pointer",
      fontWeight:
        "bold",
    }}
  >
    📊 Export Excel
  </button>
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "12px",
    marginBottom: "20px",
  }}
>

  <div style={cardStyle}>
    <div>Total</div>
    <h2>{totalCount}</h2>
  </div>

  <div style={cardStyle}>
    <div>Active</div>
    <h2 style={{color:"#24a444"}}>
      {activeCount}
    </h2>
  </div>

  <div style={cardStyle}>
    <div>Expiring Soon</div>
    <h2 style={{color:"#ff9800"}}>
      {expiringSoonCount}
    </h2>
  </div>

  <div style={cardStyle}>
    <div>Expired</div>
    <h2 style={{color:"#ffd54f"}}>
      {expiredCount}
    </h2>
  </div>

  <div style={cardStyle}>
    <div>Cancelled</div>
    <h2 style={{color:"#ff4444"}}>
      {cancelledCount}
    </h2>
  </div>

</div>

        <div
          style={{
            overflowX:
              "auto",
            background:
              "#1b1b1b",
            borderRadius:
              "16px",
            border:
              "1px solid #333",
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
                <th style={thStyle}>
                  Customer
                </th>

                <th style={thStyle}>
                  Center
                </th>

                <th style={thStyle}>
                  Product
                </th>

                <th style={thStyle}>
                  Roll
                </th>

                <th style={thStyle}>
                  VIN
                </th>

                <th style={thStyle}>
                  Start
                </th>

<th style={thStyle}>
  End
</th>

<th style={thStyle}>
  Days Left
</th>

<th style={thStyle}>
  Status
</th>

<th style={thStyle}>
  Actions
</th>
              </tr>
            </thead>

            <tbody>
              {filteredWarranties.map(
                (item) => {

                  const status =
                    getWarrantyStatus(
                      item
                    );

let daysLeft = 0;

if (item.end_date) {

  daysLeft =
    Math.ceil(
      (
        new Date(
          item.end_date
        ).getTime() -
        Date.now()
      ) /
      (
        1000 *
        60 *
        60 *
        24
      )
    );

}

                  return (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td style={tdStyle}>
                        {
                          item.customer_name
                        }
                      </td>

                      <td style={tdStyle}>
                        {
                          item.center_name
                        }
                      </td>

                      <td style={tdStyle}>
                        {
                          item.product_name
                        }
                      </td>

                      <td style={tdStyle}>
                        {
                          item.roll_number
                        }
                      </td>

                      <td style={tdStyle}>
                        {item.vin}
                      </td>

<td style={tdStyle}>
  {item.start_date}
</td>

<td style={tdStyle}>
  {item.end_date}
</td>

<td
  style={{
    ...tdStyle,
    color:
      daysLeft < 0
        ? "#ff4444"
        : daysLeft <= 30
        ? "#ff9800"
        : "#24a444",
    fontWeight: "bold",
  }}
>
  {status === "Cancelled"
    ? "--"
    : daysLeft}
</td>

<td
  style={{
    ...tdStyle,
    color:
      getStatusColor(
        status
      ),
    fontWeight: "bold",
  }}
>
  {status}
</td>

<td style={tdStyle}>
{status ===
"Cancelled" &&
item.roll_status !==
"Released" ? (
    <button
  onClick={() =>
    releaseRoll(item)
  }
  style={{
        background:
          "#2196f3",
        color: "#fff",
        border: "none",
        borderRadius:
          "8px",
        padding:
          "8px 12px",
        cursor:
          "pointer",
      }}
    >
      🔓 Release Roll
    </button>
) : item.roll_status ===
  "Released" ? (

  <span
    style={{
      color:
        "#2196f3",
      fontWeight:
        "bold",
    }}
  >
    Released ✓
  </span>

) : (
  "-"
)}
</td>
</tr>

                 
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  color: "#fff",
  textAlign:
    "left" as const,
  padding: "14px",
  borderBottom:
    "1px solid #333",
};

const tdStyle = {
  color: "#ddd",
  padding: "14px",
  borderBottom:
    "1px solid #2a2a2a",
};

const cardStyle = {
  background: "#1b1b1b",
  border: "1px solid #333",
  borderRadius: "12px",
  padding: "16px",
  color: "#fff",
};