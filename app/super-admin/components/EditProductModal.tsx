
"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  supabase,
} from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  warranty_years: number;
};

type Props = {
  open: boolean;
  product:
    | Product
    | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditProductModal({
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

  const [form, setForm] =
    useState({
      name: "",
      warranty_years:
        "",
    });

  useEffect(() => {
    if (product) {
      setForm({
        name:
          product.name,
        warranty_years:
          String(
            product.warranty_years
          ),
      });
    }
  }, [product]);

  if (!open)
    return null;

  async function handleSave() {
    try {
      setLoading(true);

      const {
        error,
      } =
        await supabase
          .from(
            "products"
          )
          .update({
            name:
              form.name,
            warranty_years:
              Number(
                form.warranty_years
              ),
          })
          .eq(
            "id",
            product?.id
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
              "#fff",
            marginBottom:
              "20px",
          }}
        >
          Edit Product
        </h2>

        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap:
              "16px",
          }}
        >
          <input
            placeholder="Product Name"
            value={
              form.name
            }
            onChange={(
              e
            ) =>
              setForm({
                ...form,
                name:
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

          <input
            type="number"
            placeholder="Warranty Years"
            value={
              form.warranty_years
            }
            onChange={(
              e
            ) =>
              setForm({
                ...form,
                warranty_years:
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
              handleSave
            }
            style={{
              background:
                "#24a444",
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
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

