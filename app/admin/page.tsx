"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Warranty = {
  id: number;
  customer_name: string;
  vin: string;
  product_name: string;
  warranty_years: number;
  start_date: string;
  end_date: string;
  status: string;
};

const products = [
  { name: "PPF Bronze", years: 3 },
  { name: "PPF Gold", years: 5 },
  { name: "PPF Platinum", years: 7 },
];

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [vin, setVin] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(
    products[0].name
  );

  const [warranties, setWarranties] = useState<Warranty[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(false);
    loadWarranties();
  }

  async function loadWarranties() {
    const { data } = await supabase
      .from("warranties")
      .select("*")
      .order("id", { ascending: false });

    setWarranties(data || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function addWarranty() {
    const product = products.find(
      (p) => p.name === selectedProduct
    );

    if (!product) return;

    const startDate = new Date();
    const endDate = new Date();

    endDate.setFullYear(
      startDate.getFullYear() + product.years
    );

    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    await supabase.from("warranties").insert([
      {
        customer_name: customerName,
        vin,
        product_name: product.name,
        warranty_years: product.years,
        start_date: start,
        end_date: end,
        status: "Active",
      },
    ]);

    setCustomerName("");
    setVin("");

    loadWarranties();
  }

  async function deleteWarranty(id: number) {
    await supabase
      .from("warranties")
      .delete()
      .eq("id", id);

    loadWarranties();
  }

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "60px",
            marginBottom: "30px",
          }}
        >
          Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "14px 20px",
            cursor: "pointer",
            height: "50px",
          }}
        >
          Logout
        </button>
      </div>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) =>
          setCustomerName(e.target.value)
        }
        style={{
          width: "100%",
          padding: "25px",
          fontSize: "22px",
          marginBottom: "20px",
        }}
      />

      <input
        type="text"
        placeholder="VIN"
        value={vin}
        onChange={(e) => setVin(e.target.value)}
        style={{
          width: "100%",
          padding: "25px",
          fontSize: "22px",
          marginBottom: "20px",
        }}
      />

      <select
        value={selectedProduct}
        onChange={(e) =>
          setSelectedProduct(e.target.value)
        }
        style={{
          width: "100%",
          padding: "25px",
          fontSize: "22px",
          marginBottom: "20px",
        }}
      >
        {products.map((product) => (
          <option
            key={product.name}
            value={product.name}
          >
            {product.name} ({product.years} Years)
          </option>
        ))}
      </select>

      <button
        onClick={addWarranty}
        style={{
          background: "black",
          color: "white",
          border: "none",
          padding: "20px 40px",
          fontSize: "24px",
          cursor: "pointer",
          marginBottom: "50px",
        }}
      >
        Add Warranty
      </button>

      {warranties.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "30px",
          }}
        >
          <h2>{item.customer_name}</h2>

          <p>VIN: {item.vin}</p>

          <p>
            Product: {item.product_name}
          </p>

          <p>
            Warranty: {item.warranty_years} Years
          </p>

          <p>
            Start Date: {item.start_date}
          </p>

          <p>
            End Date: {item.end_date}
          </p>

          <p>Status: {item.status}</p>

          <button
            onClick={() =>
              deleteWarranty(item.id)
            }
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "12px 20px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}