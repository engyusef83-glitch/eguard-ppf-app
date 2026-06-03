
"use client";

import { useState } from "react";


type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};





export default function AddCenterModal({
  open,
  onClose,
  onSuccess,
}: Props) {




  const [loading, setLoading] =
    useState(false);

  const [generatedCredentials, setGeneratedCredentials] =
    useState<{
      email: string;
      password: string;
    } | null>(null);

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

      setGeneratedCredentials(
        {
          email:
            result.email,
          password:
            result.password,
        }
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


function handleClose() {
  setGeneratedCredentials(
    null
  );

  onClose();

  onSuccess();
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
        {!generatedCredentials ? (
          <>
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
                  "phone",
                  "Phone",
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

<select
  value={
    form.governorate
  }
  onChange={(e) =>
    setForm({
      ...form,
      governorate:
        e.target.value,
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
    width:
      "100%",
    marginTop:
      "16px",
  }}
>
  <option value="">
    Select Governorate
  </option>

  {[
    "Baghdad",
    "Basra",
    "Erbil",
    "Sulaymaniyah",
    "Duhok",
    "Halabja",
    "Nineveh",
    "Kirkuk",
    "Anbar",
    "Salah al-Din",
    "Diyala",
    "Babil",
    "Karbala",
    "Najaf",
    "Wasit",
    "Maysan",
    "Dhi Qar",
    "Muthanna",
    "Qadisiyyah",
  ].map(
    (
      governorate
    ) => (
      <option
        key={
          governorate
        }
        value={
          governorate
        }
      >
        {
          governorate
        }
      </option>
    )
  )}
</select>



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
                }}
              >
                {loading
                  ? "Saving..."
                  : "Save Center"}
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
              Center Created Successfully
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
                Email:
                <br />
                {
                  generatedCredentials.email
                }
              </p>

              <p
                style={{
                  color:
                    "#fff",
                  marginTop:
                    "20px",
                }}
              >
                Password:
                <br />
                {
                  generatedCredentials.password
                }

<button
  onClick={() => {
    navigator.clipboard.writeText(
      generatedCredentials.password
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
      "14px",
    cursor:
      "pointer",
  }}
>
  Copy Password
</button>


              </p>
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
                  handleClose
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
