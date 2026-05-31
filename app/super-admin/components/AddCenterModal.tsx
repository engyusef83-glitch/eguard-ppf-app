
"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddCenterModal({
  open,
  onClose,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      center_name: "",
      email: "",
      password: "",
      phone: "",
      governorate: "",
      city: "",
      address: "",
      status: "Active",
    });

  if (!open) return null;

  async function handleSave() {
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/create-center",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                form
              ),
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

      alert(
        "Center created successfully"
      );

      onClose();

      window.location.reload();
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
            "700px",
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
        <h2
          style={{
            color:
              "#fff",
            marginBottom:
              "24px",
          }}
        >
          Add Center
        </h2>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap:
              "16px",
          }}
        >
          {[
            [
              "center_name",
              "Center Name",
            ],
            [
              "email",
              "Email",
            ],
            [
              "password",
              "Password",
            ],
            [
              "phone",
              "Phone",
            ],
            [
              "governorate",
              "Governorate",
            ],
            [
              "city",
              "City",
            ],
            [
              "address",
              "Address",
            ],
          ].map(
            (
              [
                key,
                label,
              ]
            ) => (
              <input
                key={
                  key
                }
                placeholder={
                  label
                }
                value={
                  (
                    form as any
                  )[key]
                }
                onChange={(
                  e
                ) =>
                  setForm({
                    ...form,
                    [key]:
                      e.target
                        .value,
                  })
                }
                style={{
                  background:
                    "#222",
                  border:
                    "1px solid #333",
                  borderRadius:
                    "12px",
                  padding:
                    "16px",
                  color:
                    "#fff",
                }}
              />
            )
          )}

          <select
            value={
              form.status
            }
            onChange={(
              e
            ) =>
              setForm({
                ...form,
                status:
                  e.target
                    .value,
              })
            }
            style={{
              background:
                "#222",
              border:
                "1px solid #333",
              borderRadius:
                "12px",
              padding:
                "16px",
              color:
                "#fff",
            }}
          >
            <option>
              Active
            </option>

            <option>
              Suspended
            </option>
          </select>
        </div>

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
              cursor:
                "pointer",
            }}
          >
            Cancel
          </button>

          <button
            disabled={
              loading
            }
            onClick={
              handleSave
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
              cursor:
                "pointer",
              opacity:
                loading
                  ? 0.7
                  : 1,
            }}
          >
            {loading
              ? "Saving..."
              : "Save Center"}
          </button>
        </div>
      </div>
    </div>
  );
}

