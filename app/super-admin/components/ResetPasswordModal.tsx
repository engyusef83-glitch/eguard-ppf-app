
"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  userId: string | null;
  centerName: string;
  onClose: () => void;
};

export default function ResetPasswordModal({
  open,
  userId,
  centerName,
  onClose,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [newPassword, setNewPassword] =
    useState("");

  if (!open || !userId)
    return null;

  async function handleReset() {
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/reset-center-password",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                userId,
              }),
          }
        );

      const result =
        await response.json();

      setLoading(false);

      if (
        !result.success
      ) {
        alert(
          result.error
        );
        return;
      }

      setNewPassword(
        result.password
      );
    } catch (
      error: any
    ) {
      setLoading(false);

      alert(
        error.message
      );
    }
  }

  return (
    <div
      style={{
        position:
          "fixed",
        inset: 0,
        background:
          "rgba(0,0,0,0.75)",
        display:
          "flex",
        justifyContent:
          "center",
        alignItems:
          "center",
        zIndex:
          9999,
      }}
    >
      <div
        style={{
          width:
            "500px",
          maxWidth:
            "95%",
          background:
            "#171717",
          border:
            "1px solid #2c2c2c",
          borderRadius:
            "24px",
          padding:
            "32px",
        }}
      >
        {!newPassword ? (
          <>
            <h2
              style={{
                color:
                  "#fff",
              }}
            >
              Reset Password
            </h2>

            <p
              style={{
                color:
                  "#999",
                marginTop:
                  "12px",
              }}
            >
              Generate new password for:
              <br />
              <strong>
                {
                  centerName
                }
              </strong>
            </p>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap:
                  "12px",
                marginTop:
                  "24px",
              }}
            >
              <button
                onClick={
                  onClose
                }
                style={{
                  background:
                    "#333",
                  color:
                    "#fff",
                  border:
                    "none",
                  borderRadius:
                    "12px",
                  padding:
                    "12px 18px",
                }}
              >
                Cancel
              </button>

              <button
                disabled={
                  loading
                }
                onClick={
                  handleReset
                }
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
                }}
              >
                {loading
                  ? "Generating..."
                  : "Generate Password"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2
              style={{
                color:
                  "#24a444",
              }}
            >
              New Password Generated
            </h2>

            <div
              style={{
                background:
                  "#222",
                padding:
                  "20px",
                borderRadius:
                  "18px",
                marginTop:
                  "20px",
              }}
            >
              <p
                style={{
                  color:
                    "#fff",
                }}
              >
                Password:
              </p>

              <h3
                style={{
                  color:
                    "#fff",
                }}
              >
                {
                  newPassword
                }
              </h3>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    newPassword
                  );

                  alert(
                    "Password copied"
                  );
                }}
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
                    "10px 16px",
                  marginTop:
                    "16px",
                }}
              >
                Copy Password
              </button>
            </div>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                marginTop:
                  "24px",
              }}
            >
              <button
                onClick={
                  onClose
                }
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
                }}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

