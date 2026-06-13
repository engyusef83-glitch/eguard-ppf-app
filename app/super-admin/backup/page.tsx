"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BackupPage() {

const [backupFile, setBackupFile] =
  useState<any>(null);

const [backupInfo, setBackupInfo] =
  useState<any>(null);

const [restoreText, setRestoreText] =
  useState("");

async function downloadBackup() {


  const backup: any = {
    backup_date: new Date().toISOString(),
    system: "EGUARD Warranty System",
    version: "2.0",
  };


    const tables = [
      "centers",
      "products",
      "warranties",
      "roll_inventory",
      "roll_import_history",
      "roll_release_log",
      "profiles",
      "system_settings",
    ];

    for (const table of tables) {

      const { data } =
        await supabase
          .from(table)
          .select("*");

      backup[table] = data;
    }

    const blob = new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        ),
      ],
      {
        type:
          "application/json",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href = url;

    a.download =
      `eguard-backup-${
        new Date()
          .toISOString()
          .split("T")[0]
      }.json`;

    a.click();

    URL.revokeObjectURL(
      url
    );
  }

function handleBackupFile(
  event: any
) {
  const file =
    event.target.files?.[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = (e) => {

    const json =
      JSON.parse(
        e.target?.result as string
      );

    setBackupFile(json);

    setBackupInfo({
      backup_date:
        json.backup_date,

      system:
        json.system,

      version:
        json.version,

      products:
        json.products?.length || 0,

      warranties:
        json.warranties?.length || 0,

      roll_inventory:
        json.roll_inventory
          ?.length || 0,
    });
  };

  reader.readAsText(file);
}

async function restoreBackup() {

  if (!backupFile) {
    alert(
      "Please select a backup file first."
    );
    return;
  }

  const confirmed =
    window.confirm(
      "This will replace ALL current data. Continue?"
    );

  if (!confirmed) return;

  try {

const response =
  await fetch(
    "/api/restore-backup",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body:
        JSON.stringify(
          backupFile
        ),
    }
  );

const text =
  await response.text();

alert(text);

  } catch (error) {

    console.error(error);

    alert(
      "Restore failed."
    );
  }
}

return (
  <div
    style={{
      padding: "40px",
    }}
  >
    <h1>
      Backup & Restore
    </h1>

    <button
      onClick={downloadBackup}
    >
      📥 Download Full Backup
    </button>

    <div
      style={{
        marginTop: "30px",
      }}
    >
      <input
        type="file"
        accept=".json"
        onChange={handleBackupFile}
      />
{
  backupInfo && (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        border: "1px solid #333",
        borderRadius: "10px",
      }}
    >
      <h3>
        Backup Summary
      </h3>

      <p>
        <strong>System:</strong>{" "}
        {backupInfo.system}
      </p>

      <p>
        <strong>Version:</strong>{" "}
        {backupInfo.version}
      </p>

      <p>
        <strong>Backup Date:</strong>{" "}
        {backupInfo.backup_date}
      </p>

      <p>
        <strong>Products:</strong>{" "}
        {backupInfo.products}
      </p>

      <p>
        <strong>Warranties:</strong>{" "}
        {backupInfo.warranties}
      </p>

      <p>
        <strong>Inventory Rolls:</strong>{" "}
        {backupInfo.roll_inventory}
      </p>

    </div>
  )
}

<div
  style={{
    marginTop: "30px",
    padding: "20px",
    border: "1px solid red",
    borderRadius: "10px",
  }}
>
  <h3>
    ⚠ Restore Warning
  </h3>

  <p>
    This action will replace
    all current data.
  </p>

  <p>
    Type:
    <strong>
      {" "}RESTORE
    </strong>
  </p>

  <input
    value={restoreText}
    onChange={(e) =>
      setRestoreText(
        e.target.value
      )
    }
    placeholder="Type RESTORE"
    style={{
      padding: "10px",
      width: "250px",
    }}
  />

<button
onClick={restoreBackup}
  disabled={
    restoreText.trim().toUpperCase()
    !== "RESTORE"
  }

  style={{
    marginTop: "15px",
    padding: "12px 20px",
    background:
      restoreText
        .trim()
        .toUpperCase() ===
      "RESTORE"
        ? "#24a444"
        : "#666",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor:
      restoreText
        .trim()
        .toUpperCase() ===
      "RESTORE"
        ? "pointer"
        : "not-allowed",
  }}
>
  🔄 Restore Backup
</button>

</div>

    </div>

  </div>
);
}