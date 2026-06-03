
"use client";

import { useState } from "react";


type Props = {
  open: boolean;
  centerId: string | null;
  userId: string | null;
  centerName: string;
  onClose: () => void;
  onSuccess: () => void;
};



export default function DeleteCenterModal({
  open,
  centerId,
  userId,
  centerName,
  onClose,
  onSuccess,
}: Props) {




  const [loading, setLoading] =
    useState(false);

  if (
    !open ||
    !centerId ||
    !userId
  )
    return null;

  async function handleDelete() {
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/delete-center",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                centerId,
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

      alert(
        "Center deleted successfully"
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
        <h2
          style={{
            color:
              "#ff4d4f",
            marginBottom:
              "18px",
          }}
        >
          Delete Center
        </h2>

        <p
          style={{
            color:
              "#ddd",
            lineHeight:
              "1.7",
          }}
        >
          Are you sure you want
          to permanently delete:
          <br />
          <strong>
            {centerName}
          </strong>
          ?
          <br />
          <br />
          This action cannot
          be undone.
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
              "30px",
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
              handleDelete
            }
            style={{
              background:
                "#ff4d4f",
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
              ? "Deleting..."
              : "Delete Center"}
          </button>
        </div>
      </div>
    </div>
  );
}
