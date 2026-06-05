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

  useEffect(() => {
  loadSettings();
  loadStats();
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

  setStats({
    totalRolls:
      count || 0,

    importedFiles: 0,

    unmatched: 0,
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

    summary.push({
      name: sheetName,
      count: Math.max(
        validRows.length - 1,
        0
      ),
    });
  }

  console.log("SUMMARY =", summary);

  setSheetSummary(summary);
}

async function confirmImport() {
  if (!selectedFile) return;

  const totalRows = sheetSummary.reduce(
    (sum, item) => sum + item.count,
    0
  );

  alert(
    `File Ready

Sheets: ${sheetSummary.length}

Total Rolls: ${totalRows}`
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
    </div>
  </div>
)}
      </div>
    </div>
  );
}