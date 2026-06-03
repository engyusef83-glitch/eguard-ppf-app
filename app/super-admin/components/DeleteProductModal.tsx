
"use client";

import {
  useState,
} from "react";
import {
  supabase,
} from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  product:
    | Product
    | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DeleteProductModal({
  open,
  product,
  onClose,
  onSuccess,
}: Props) {
  const [
    loading,
    setLoading,
  ] =
    useState(false);

  if (
    !open ||
    !product
  )
    return null;

  async function handleDelete() {
    try {
      setLoading(true);

      const {
        error,
      } =
        await supabase
          .from(
            "products"
          )
          .delete()
          .eq(
            "id",
            product.id
          );

      if (error)
        throw error;

      onClose();
      onSuccess();
    } catch (
      error: any
    ) {
      alert(
        error.message
      );
    } finally {
      setLoading(false);
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
          background:
            "#111",
          padding:
            "30px",
          borderRadius:
            "20px",
          width:
            "450px",
        }}
      >
        <h2
          style={{
            color:
              "#ff4d4f",
            marginBottom:
              "20px",
          }}
        >
          Delete Product
        </h2>

        <p
          style={{
            color:
              "#fff",
            lineHeight:
              "1.8",
          }}
        >
          Are you sure you
          want to delete:
          <br />
          <strong>
            {
              product.name
            }
          </strong>
          ?
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
              border:
                "none",
              color:
                "#fff",
              padding:
                "12px 18px",
              borderRadius:
                "10px",
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
              handleDelete
            }
            style={{
              background:
                "#c62828",
              border:
                "none",
              color:
                "#fff",
              padding:
                "12px 18px",
              borderRadius:
                "10px",
              cursor:
                "pointer",
            }}
          >
            {loading
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

