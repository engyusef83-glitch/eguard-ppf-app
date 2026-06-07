"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export default function RollInventoryPage() {

  const [mode, setMode] =
    useState("disabled");

const [stats, setStats] =
  useState({
    totalRolls: 0,
    importedFiles: 0,
    unmatched: 0,
  });

const [selectedFile, setSelectedFile] =
  useState<File | null>(null);



const [sheetSummary, setSheetSummary] =
  useState<
    {
      name: string;
      count: number;
    }[]
  >([]);

const [parsedRolls, setParsedRolls] =
  useState<any[]>([]);

const [importHistory, setImportHistory] =
  useState<any[]>([]);

const [
  inventoryReport,
  setInventoryReport,
] = useState<any[]>([]);

const [searchRoll, setSearchRoll] =
  useState("");

const [statusFilter, setStatusFilter] =
  useState("all");

  useEffect(() => {
  loadStats();
  loadSettings();
  loadImportHistory();
loadInventoryReport();
}, []);

  async function loadSettings() {
  const { data, error } =
    await supabase
      .from("system_settings")
      .select("*")
      .limit(1)
      .single();

  console.log("DATA =", data);
  console.log("ERROR =", error);

  if (data) {
    setMode(
      data.roll_verification_mode
    );
  }
}

async function loadStats() {
  const { count } =
    await supabase
      .from("roll_inventory")
      .select("*", {
        count: "exact",
        head: true,
      });

const importHistoryCount =
  await supabase
    .from("roll_import_history")
    .select("*", {
      count: "exact",
      head: true,
    });

const unmatchedCount =
  await supabase
    .from("warranties")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(
      "inventory_status",
      "unmatched"
    );

  setStats({
  totalRolls:
    count || 0,

  importedFiles:
    importHistoryCount.count || 0,

  unmatched:
  unmatchedCount.count || 0,
});
}

async function updateMode(
  value: string
) {
  console.log(
    "NEW MODE:",
    value
  );

  setMode(value);

  const { error } =
    await supabase
      .from("system_settings")
      .update({
        roll_verification_mode:
          value,
      })
      .eq("id", 1);

  console.log(
    "UPDATE ERROR:",
    error
  );
}



async function previewExcel() {
  if (!selectedFile) return;

  const buffer =
    await selectedFile.arrayBuffer();

  const workbook =
    XLSX.read(buffer, {
      type: "array",
    });

  const summary = [];
const allRolls: any[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet =
      workbook.Sheets[sheetName];

    const rows =
      XLSX.utils.sheet_to_json(
        sheet,
        {
          header: 1,
          blankrows: false,
        }
      );

    const validRows =
      rows.filter(
        (row: any) =>
          row &&
          row.length > 1 &&
          row[1]
      );

for (let i = 1; i < validRows.length; i++) {
  const row = validRows[i] as any[];

  allRolls.push({
    product_name: String(row[0] || ""),

    roll_number: String(
      row[1] || ""
    ),

    sheet_name: sheetName,
  });
}

    summary.push({
      name: sheetName,
      count: Math.max(
        validRows.length - 1,
        0
      ),
    });
  }

  console.log("SUMMARY =", summary);

setParsedRolls(allRolls);

console.log(
  "PARSED ROLLS =",
  allRolls
);

setSheetSummary(summary);
}

async function confirmImport() {
  if (parsedRolls.length === 0) {
    alert("No rolls to import");
    return;
  }

  const rowsToInsert =
    parsedRolls.map(
      (roll) => ({
        roll_number:
          roll.roll_number,

        product_name:
          roll.product_name,

        source_file:
          selectedFile?.name || "",

        sheet_name:
          roll.sheet_name,
      })
    );

  const beforeResult =
    await supabase
      .from("roll_inventory")
      .select("*", {
        count: "exact",
        head: true,
      });

  const beforeCount =
    beforeResult.count || 0;

  const { error } =
    await supabase
      .from("roll_inventory")
      .upsert(
        rowsToInsert,
        {
          onConflict:
            "roll_number",
          ignoreDuplicates: true,
        }
      );

  if (error) {
    console.error(error);

    alert(
      "Import Failed"
    );

    return;
  }

  const afterResult =
    await supabase
      .from("roll_inventory")
      .select("*", {
        count: "exact",
        head: true,
      });

  const afterCount =
    afterResult.count || 0;

  const importedRows =
    afterCount - beforeCount;

  const duplicatesSkipped =
    rowsToInsert.length -
    importedRows;

  await supabase
    .from("roll_import_history")
    .insert({
      file_name:
        selectedFile?.name || "",

      uploaded_by:
        "super_admin",

      total_rows:
        rowsToInsert.length,

      imported_rows:
        importedRows,

      duplicates_skipped:
        duplicatesSkipped,

      auto_fixed_matches: 0,
    });

  alert(
    `Import Completed

Total Rows: ${rowsToInsert.length}

Imported: ${importedRows}

Duplicates: ${duplicatesSkipped}`
  );

  loadStats();
loadImportHistory();
}

async function loadImportHistory() {
  const { data, error } =
    await supabase
      .from("roll_import_history")
      .select("*")
      .order("uploaded_at", {
        ascending: false,
      })
      .limit(20);

  if (!error && data) {
    setImportHistory(data);
  }
}

async function loadInventoryReport() {
  const { data } =
    await supabase
      .from("warranties")
      .select(
        `
        customer_name,
        roll_number,
        product_name,
        inventory_status
      `
      )
      .order("id", {
        ascending: false,
      })
      .limit(20);

  setInventoryReport(
    data || []
  );
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#fff",
            marginBottom: "10px",
          }}
        >
          Roll Inventory
        </h1>

        <p
          style={{
            color: "#999",
            marginBottom: "30px",
          }}
        >
          Manage imported roll numbers,
          verification modes and inventory reports.
        </p>

<div
  style={{
    background: "#1b1b1b",
    border: "1px solid #333",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "30px",
  }}
>
  <h2
    style={{
      color: "#fff",
      marginBottom: "16px",
    }}
  >
    Verification Mode
  </h2>

  <select
  value={mode}
  onChange={(e) =>
  updateMode(
    e.target.value
  )
}
  style={{
    background: "#222",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "10px",
    padding: "12px",
    minWidth: "220px",
  }}
>
    <option value="disabled">
      Disabled
    </option>

    <option value="warning">
      Warning Only
    </option>

    <option value="strict">
      Strict
    </option>
  </select>

  <p
    style={{
      color: "#999",
      marginTop: "12px",
    }}
  >
    Controls how roll numbers are
    verified against imported inventory.
  </p>
</div>
<div
  style={{
    marginTop: "20px",
    display: "flex",
    gap: "20px",
  }}
>
  <div
    style={{
      background: "#1b1b1b",
      border: "1px solid #333",
      borderRadius: "16px",
      padding: "20px",
      minWidth: "220px",
    }}
  >
    <h3
      style={{
        color: "#999",
        marginBottom: "10px",
      }}
    >
      Total Rolls
    </h3>

    <h1
      style={{
        color: "#fff",
      }}
    >
      {stats.totalRolls}
    </h1>
  </div>

<div
  style={{
    background: "#1b1b1b",
    border: "1px solid #333",
    borderRadius: "16px",
    padding: "20px",
    minWidth: "220px",
  }}
>
  <h3
    style={{
      color: "#999",
      marginBottom: "10px",
    }}
  >
    Imported Files
  </h3>

  <h1
    style={{
      color: "#fff",
    }}
  >
    {stats.importedFiles}
  </h1>
</div>

<div
  style={{
    background: "#1b1b1b",
    border: "1px solid #333",
    borderRadius: "16px",
    padding: "20px",
    minWidth: "220px",
  }}
>
  <h3
    style={{
      color: "#999",
      marginBottom: "10px",
    }}
  >
    Unmatched Warranties
  </h3>

  <h1
    style={{
      color: "#fff",
    }}
  >
    {stats.unmatched}
  </h1>
</div>
</div>

<div
  style={{
    background: "#1b1b1b",
    border: "1px solid #333",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "24px",
  }}
>
  <h2
    style={{
      color: "#fff",
      marginBottom: "16px",
    }}
  >
    Upload Inventory File
  </h2>

  <input
  type="file"
  accept=".xlsx,.xls"
  onChange={(e) => {
    const file =
      e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
    }
  }}
/>

{selectedFile && (
  <p
    style={{
      color: "#999",
      marginTop: "12px",
    }}
  >
    Selected File:
    {" "}
    {selectedFile.name}
  </p>
)}

{selectedFile && (
  <button
  onClick={previewExcel}
  style={{
    background: "#24a444",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    marginTop: "12px",
    display: "block",
  }}
>
  Import File
</button>
)}

</div>

{sheetSummary.length > 0 && (
  <div
    style={{
      background: "#1b1b1b",
      border: "1px solid #333",
      borderRadius: "16px",
      padding: "20px",
      marginTop: "20px",
      color: "#fff",
    }}
  >
    <h3
      style={{
        marginBottom: "16px",
      }}
    >
      Import Preview
    </h3>

    {sheetSummary.map(
      (item) => (
        <div
          key={item.name}
          style={{
            marginBottom: "8px",
          }}
        >
          ✓ {item.name}
          {" - "}
          {item.count}
          {" Rolls"}
        </div>
      )
    )}

    <hr
      style={{
        margin: "16px 0",
      }}
    />

    <strong>
      Total Rolls:
      {" "}
      {sheetSummary.reduce(
        (sum, item) =>
          sum + item.count,
        0
      )}
    </strong>

    <div
      style={{
        marginTop: "20px",
      }}

    ><button
  onClick={confirmImport}
  style={{
    background: "#24a444",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Confirm Import
</button>

{importHistory.length > 0 && (
  <div
    style={{
      marginTop: "30px",
      padding: "20px",
      border: "1px solid #333",
      borderRadius: "12px",
      background: "#111",
    }}
  >
    <h3
      style={{
        marginBottom: "20px",
      }}
    >
      Import History
    </h3>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <thead>
  <tr>
    <th style={{ textAlign: "left", padding: "12px" }}>
      File
    </th>

    <th style={{ textAlign: "center", padding: "12px" }}>
      Total
    </th>

    <th style={{ textAlign: "center", padding: "12px" }}>
      Imported
    </th>

    <th style={{ textAlign: "center", padding: "12px" }}>
      Duplicates
    </th>

    <th
  style={{
    textAlign: "left",
    padding: "12px",
    color: "#fff",
    borderBottom:
      "1px solid #333",
  }}
>
      Date
    </th>
  </tr>
</thead>

      <tbody>
        {importHistory.map(
          (item) => (
            <tr key={item.id}>
  <td style={{ padding: "12px" }}>
    {item.file_name}
  </td>

  <td
    style={{
      textAlign: "center",
      padding: "12px",
    }}
  >
    {item.total_rows}
  </td>

  <td
    style={{
      textAlign: "center",
      padding: "12px",
      color: "#24a444",
      fontWeight: 600,
    }}
  >
    {item.imported_rows}
  </td>

  <td
    style={{
      textAlign: "center",
      padding: "12px",
      color: "#ff9800",
      fontWeight: 600,
    }}
  >
    {item.duplicates_skipped}
  </td>

  <td style={{ padding: "12px" }}>
    {new Date(
      item.uploaded_at
    ).toLocaleString()}
  </td>
</tr>
          )
        )}
      </tbody>
    </table>
  </div>
)}
    </div>
  </div>
)}

{inventoryReport.length > 0 && (
  <div
    style={{
      marginTop: "30px",
      padding: "20px",
      border: "1px solid #333",
      borderRadius: "12px",
      background: "#111",
    }}
  >
    <h3
      style={{
        marginBottom: "20px",
        color: "#fff",
      }}
    >
      Inventory Verification Report
    </h3>

<div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  }}
>
  <input
    type="text"
    placeholder="Search Roll Number"
    value={searchRoll}
    onChange={(e) =>
      setSearchRoll(e.target.value)
    }
    style={{
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #333",
      background: "#1b1b1b",
      color: "#fff",
    }}
  />

  <select
    value={statusFilter}
    onChange={(e) =>
      setStatusFilter(e.target.value)
    }
    style={{
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #333",
      background: "#1b1b1b",
      color: "#fff",
    }}
  >
    <option value="all">
      All
    </option>

    <option value="matched">
      Matched
    </option>

    <option value="unmatched">
      Unmatched
    </option>
  </select>
</div>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              textAlign: "left",
              padding: "12px",
            }}
          >
            Customer
          </th>

          <th
            style={{
              textAlign: "left",
              padding: "12px",
            }}
          >
            Roll Number
          </th>

          <th
            style={{
              textAlign: "left",
              padding: "12px",
            }}
          >
            Product
          </th>

          <th
            style={{
              textAlign: "center",
              padding: "12px",
            }}
          >
            Status
          </th>
        </tr>
      </thead>

      <tbody>
  {inventoryReport
    .filter((item) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : item.inventory_status ===
            statusFilter;

      const matchesRoll =
        searchRoll === ""
          ? true
          : item.roll_number
              ?.toString()
              .toLowerCase()
              .includes(
                searchRoll.toLowerCase()
              );

      return (
        matchesStatus &&
        matchesRoll
      );
    })
    .map(
      (item, index) => (
            <tr key={index}>
              <td
  style={{
    padding: "12px",
    color: "#fff",
  }}
>
                {item.customer_name}
              </td>

              <td
  style={{
    padding: "12px",
    color: "#fff",
  }}
>
                {item.roll_number}
              </td>

              <td
  style={{
    padding: "12px",
    color: "#fff",
  }}
>
                {item.product_name}
              </td>

              <td
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color:
                    item.inventory_status ===
                    "matched"
                      ? "#24a444"
                      : "#ff4444",
                  fontWeight: "bold",
                }}
              >
                {item.inventory_status ===
                "matched"
                  ? "✅ Matched"
                  : "❌ Unmatched"}
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
)}
      </div>
    </div>
  );
}