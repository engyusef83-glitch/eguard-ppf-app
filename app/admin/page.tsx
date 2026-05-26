"use client";

import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const governorates = [
  "Baghdad",
  "Basra",
  "Nineveh",
  "Erbil",
  "Najaf",
  "Karbala",
  "Babil",
  "Diyala",
  "Dhi Qar",
  "Al Anbar",
  "Maysan",
  "Muthanna",
  "Wasit",
  "Salah al-Din",
  "Kirkuk",
  "Sulaymaniyah",
  "Dohuk",
  "Qadisiyyah",
  "Halabja",
];

const products = [
  { name: "PPF Bronze", years: 3 },
  { name: "PPF Gold", years: 5 },
  { name: "PPF Platinum", years: 7 },
];

type Warranty = {
  id: number;
  customer_name: string;
  vin: string;
  roll_number: string;
  country: string;
  governorate: string;
  city: string;
  center_name: string;
  product_name: string;
  duration_years: number;
  start_date: string;
  end_date: string;
  status: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] =
    useState("");

  const [vin, setVin] =
    useState("");

  const [rollNumber, setRollNumber] =
    useState("");

  const [governorate, setGovernorate] =
    useState("Baghdad");

  const [city, setCity] =
    useState("");

  const [centerName, setCenterName] =
    useState("");

  const [selectedProduct, setSelectedProduct] =
    useState(products[0].name);

  const [warranties, setWarranties] =
    useState<Warranty[]>([]);

  const [showVinScanner, setShowVinScanner] =
    useState(false);

  const [showRollScanner, setShowRollScanner] =
    useState(false);
  const [language, setLanguage] =
    useState<"en" | "ar">("en");

  const t =
    language === "ar"
      ? {
          dashboard:
            "لوحة التحكم",
          logout:
            "تسجيل الخروج",
          customer:
            "اسم الزبون",
          vin: "رقم VIN",
          roll:
            "رقم الرولة",
          scanVin:
            "فحص VIN",
          scanRoll:
            "فحص الرولة",
          country:
            "الدولة: العراق",
          city:
            "المدينة",
          add:
            "إضافة الضمان",
          scanner:
            "وجّه الكاميرا نحو الباركود أو QR",
          close:
            "إغلاق السكانر",
          center:
            "المركز:",
        }
      : {
          dashboard:
            "Admin Dashboard",
          logout:
            "Logout",
          customer:
            "Customer Name",
          vin: "VIN",
          roll:
            "Roll Number",
          scanVin:
            "Scan VIN",
          scanRoll:
            "Scan Roll",
          country:
            "Country: Iraq",
          city: "City",
          add:
            "Add Warranty",
          scanner:
            "Point camera to barcode or QR code",
          close:
            "Close Scanner",
          center:
            "Center:",
        };


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

    await loadCenter(
      session.user.id
    );

    setLoading(false);
  }

  async function loadCenter(userId: string) {
    const { data } = await supabase
      .from("centers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setCenterName(
        data.center_name
      );

      await loadWarranties(
        data.center_name
      );
    }
  }

  async function loadWarranties(
    currentCenterName?: string
  ) {
    const center =
      currentCenterName ||
      centerName;

    const { data } =
      await supabase
        .from("warranties")
        .select("*")
        .eq(
          "center_name",
          center
        )
        .order("id", {
          ascending: false,
        });

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
      startDate.getFullYear() +
        product.years
    );

    const start =
      startDate
        .toISOString()
        .split("T")[0];

    const end =
      endDate
        .toISOString()
        .split("T")[0];

    const { error } =
      await supabase
        .from("warranties")
        .insert([
          {
            customer_name:
              customerName,

            vin: vin,

            roll_number:
              rollNumber,

            country:
              "Iraq",

            governorate:
              governorate,

            city: city,

            center_name:
              centerName,

            product_name:
              product.name,

            duration_years:
              product.years,

            start_date:
              start,

            end_date:
              end,

            status:
              "Active",
          },
        ]);

    if (error) {
      alert(error.message);
      return;
    }

    setCustomerName("");
    setVin("");
    setRollNumber("");
    setCity("");

    await loadWarranties();
  }

  async function deleteWarranty(
    id: number
  ) {
    await supabase
      .from("warranties")
      .delete()
      .eq("id", id);

    loadWarranties();
  }


  async function startVinScanner() {
    if (showVinScanner) return;
    setShowVinScanner(true);

    requestAnimationFrame(async () => {
      try {
        const cameras =
          await Html5Qrcode.getCameras();

        if (!cameras.length) {
          alert("No camera found");
          return;
        }

        const scanner =
          new Html5Qrcode(
            "vin-reader"
          );

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250,
          },
          async (decodedText) => {
            setVin(decodedText);

            await scanner.stop();

            setShowVinScanner(
              false
            );
          },
          () => {}
        );
      } catch (error) {
        console.error(error);
        alert(
          "Camera failed to start"
        );
      }
    });
  }

  async function startRollScanner() {
    if (showRollScanner) return;
    setShowRollScanner(true);

    requestAnimationFrame(async () => {
      try {
        const cameras =
          await Html5Qrcode.getCameras();

        if (!cameras.length) {
          alert("No camera found");
          return;
        }

        const scanner =
          new Html5Qrcode(
            "roll-reader"
          );

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250,
          },
          async (decodedText) => {
            setRollNumber(
              decodedText
            );

            await scanner.stop();

            setShowRollScanner(
              false
            );
          },
          () => {}
        );
      } catch (error) {
        console.error(error);
        alert(
          "Camera failed to start"
        );
      }
    });
  }

  if (loading) {
    return (
      <h1 style={{ color: "#fff" }}>
        Loading...
      </h1>
    );
  }

  return (
    <div
      style={{
        background: "#0f0f0f",
        minHeight: "100vh",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#181818",
          borderRadius: "20px",
          padding: "20px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
        <button
          style={{ padding:"8px 12px" }}
          onClick={() => setLanguage("en")}
        >
          English
        </button>
        <button
          style={{ padding:"8px 12px" }}
          onClick={() => setLanguage("ar")}
        >
          العربية
        </button>
      </div>

      <h1 style={{ color: "#fff" }}>
          {t.dashboard}
        </h1>

        <button
          style={{ background:"#222", color:"#fff", borderRadius:"10px", padding:"10px" }}
          onClick={handleLogout}
        >
          {t.logout}
        </button>
      </div>

      <h3 style={{ color: "#fff" }}>
        {t.center}
        {" "}
        {centerName}
      </h3>

      <input
        type="text"
        placeholder={t.customer}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #333",
          fontSize: "16px",
          color: "#fff",
          background: "#222",
          marginBottom: "16px",
        }}
        value={customerName}
        onChange={(e) =>
          setCustomerName(
            e.target.value
          )
        }
      />

      {showVinScanner && (
        <div
          style={{
            border: "2px solid #333",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            background: "#202020",
          }}
        >
          <p style={{ color: "#fff" }}>
            {t.scanner}
          </p>

          <div id="vin-reader"></div>

          <br />

          <button
            onClick={() =>
              setShowVinScanner(false)
            }
          >
            {t.close}
          </button>
        </div>
      )}

      <br />
      <br />

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder={t.vin}
          value={vin}
          onChange={(e) =>
            setVin(
              e.target.value
            )
          }
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #333",
            fontSize: "16px",
          color: "#fff",
          background: "#222",
          }}
        />

        <button
          style={{ background:"#333", color:"#fff", borderRadius:"10px", padding:"12px" }}
          onClick={() =>
            startVinScanner()
          }
        >
          {t.scanVin}
        </button>
      </div>

      <br />
      <br />

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder={t.roll}
          value={rollNumber}
          onChange={(e) =>
            setRollNumber(
              e.target.value
            )
          }
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #333",
            fontSize: "16px",
          color: "#fff",
          background: "#222",
          }}
        />

        <button
          style={{ background:"#333", color:"#fff", borderRadius:"10px", padding:"12px" }}
          onClick={() =>
            startRollScanner()
          }
        >
          {t.scanRoll}
        </button>
      </div>

      <br />
      <br />

      {showRollScanner && (
        <div
          style={{
            border: "2px solid #333",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            background: "#202020",
          }}
        >
          <p style={{ color: "#fff" }}>
            {t.scanner}
          </p>

          <div id="roll-reader"></div>

          <br />

          <button
            onClick={() =>
              setShowRollScanner(false)
            }
          >
            {t.close}
          </button>
        </div>
      )}

      <p style={{ color: "#fff" }}>
        {t.country}
      </p>

      <select
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #333",
          fontSize: "16px",
          color: "#fff",
          background: "#222",
        }}
        value={governorate}
        onChange={(e) =>
          setGovernorate(
            e.target.value
          )
        }
      >
        {governorates.map(
          (gov) => (
            <option
              key={gov}
              value={gov}
            >
              {gov}
            </option>
          )
        )}
      </select>

      <br />
      <br />

      <input
        type="text"
        placeholder={t.city}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #333",
          fontSize: "16px",
          color: "#fff",
          background: "#222",
        }}
        value={city}
        onChange={(e) =>
          setCity(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <select
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #333",
          fontSize: "16px",
          color: "#fff",
          background: "#222",
        }}
        value={
          selectedProduct
        }
        onChange={(e) =>
          setSelectedProduct(
            e.target.value
          )
        }
      >
        {products.map(
          (product) => (
            <option
              key={
                product.name
              }
              value={
                product.name
              }
            >
              {product.name}
              {" - "}
              {
                product.years
              }{" "}
              Years
            </option>
          )
        )}
      </select>

      <br />
      <br />

      <button
        onClick={addWarranty}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          fontSize: "18px",
          fontWeight: "bold",
          background: "#fff",
        }}
      >
        {t.add}
      </button>

      <hr />

      {warranties.map(
        (item) => (
          <div
            key={item.id}
          >
            <h3 style={{ color: "#fff" }}>
              {
                item.customer_name
              }
            </h3>

            <p style={{ color: "#fff" }}>
              VIN:
              {" "}
              {item.vin}
            </p>

            <p style={{ color: "#fff" }}>
              Roll:
              {" "}
              {
                item.roll_number
              }
            </p>

            <p style={{ color: "#fff" }}>
              {t.center}
              {" "}
              {
                item.center_name
              }
            </p>

            <p style={{ color: "#fff" }}>
              Governorate:
              {" "}
              {
                item.governorate
              }
            </p>

            <p style={{ color: "#fff" }}>
              City:
              {" "}
              {item.city}
            </p>

            <p style={{ color: "#fff" }}>
              Product:
              {" "}
              {
                item.product_name
              }
            </p>

            <p style={{ color: "#fff" }}>
              Warranty:
              {" "}
              {
                item.duration_years
              }{" "}
              Years
            </p>

            <button
              onClick={() =>
                deleteWarranty(
                  item.id
                )
              }
            >
              Delete
            </button>

            <hr />
          </div>
        )
      )}
          </div>
    </div>
  );
}