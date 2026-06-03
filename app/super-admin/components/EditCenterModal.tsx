
"use client";

import {
  useEffect,
  useState,
} from "react";

type Center = {
  id: string;
  center_name?: string;
  phone?: string;
  governorate?: string;
  city?: string;
  address?: string;
  email?: string;
  status?: string;
};


type Props = {
  open: boolean;
  center: Center | null;
  onClose: () => void;
  onSuccess: () => void;
};




export default function EditCenterModal({
  open,
  center,
  onClose,
  onSuccess,
}: Props){


  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      center_name: "",
      email: "",
      phone: "",
      governorate: "",
      city: "",
      address: "",
      status: "Active",
    });

  useEffect(() => {
    if (center) {
      setForm({
        center_name:
          center.center_name ||
          "",
        email:
          center.email ||
          "",
        phone:
          center.phone ||
          "",
        governorate:
          center.governorate ||
          "",
        city:
          center.city || "",
        address:
          center.address ||
          "",
        status:
          center.status ||
          "Active",
      });
    }
  }, [center]);

  if (
    !open ||
    !center
  )
    return null;

  async function handleSave() {
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/update-center",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
  id: center?.id,
  ...form,
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

      alert(
        "Center updated successfully"
      );

      onClose();

     
onSuccess();


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
          Edit Center
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
              opacity:
                loading
                  ? 0.7
                  : 1,
            }}
          >
            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

