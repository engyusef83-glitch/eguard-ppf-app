"use client";


import { Html5Qrcode } from "html5-qrcode";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import {
  useEffect,
  useState,
  useRef
} from "react";

import {
  BrowserMultiFormatReader
} from "@zxing/browser";

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
  useState("");

  const [warranties, setWarranties] =
    useState<Warranty[]>([]);

  const [showVinScanner, setShowVinScanner] =
    useState(false);

  const [showRollScanner, setShowRollScanner] =
    useState(false);

const [showZXingTest, setShowZXingTest] =
  useState(false);

  const [scanLock, setScanLock] =
    useState(false);

const scannerRef =
  useRef<Html5Qrcode | null>(
    null
  );

const zxingRef =
  useRef<BrowserMultiFormatReader | null>(
    null
  );

  const [language, setLanguage] =
    useState<"en" | "ar">("en");
  const [searchTerm, setSearchTerm] =
    useState("");
const [products, setProducts] =
  useState<any[]>([]);



const [
  statusFilter,
  setStatusFilter
] = useState("all");


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
const {
  data: productsData,
} = await supabase
  .from("products")
  .select("*")
  .order("name");

setProducts(
  productsData || []
);

if (
  productsData?.length
) {
 setSelectedProduct("");
}
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
        product.warranty_years
    );

    const start =
      startDate
        .toISOString()
        .split("T")[0];

    const end =
      endDate
        .toISOString()
        .split("T")[0];

const { data: inventoryRoll } =
  await supabase
    .from("roll_inventory")
    .select("id")
    .eq(
      "roll_number",
      rollNumber
    )
    .maybeSingle();

const inventoryMatch =
  !!inventoryRoll;

const { data: settings } =
  await supabase
    .from("system_settings")
    .select(
      "roll_verification_mode"
    )
    .eq("id", 1)
    .single();

const verificationMode =
  settings?.roll_verification_mode ||
  "disabled";

if (
  verificationMode === "strict" &&
  !inventoryMatch
) {
  alert(
    "❌ Roll Number not found in Inventory.\n\nWarranty creation blocked by Strict Mode."
  );

  return;
}

if (
  verificationMode === "warning" &&
  !inventoryMatch
) {
  const proceed =
    confirm(
      "⚠️ Roll Number not found in Inventory.\n\nDo you want to continue creating the warranty?"
    );

  if (!proceed) {
    return;
  }
}

const { data: existingRoll } =
  await supabase
    .from("roll_inventory")
    .select(
      "roll_status"
    )
    .eq(
      "roll_number",
      rollNumber
    )
    .maybeSingle();

if (
  existingRoll?.roll_status ===
  "Used"
) {

  alert(
    "❌ This roll is already used."
  );

  return;
}

const { data: existingWarranty } =
  await supabase
    .from("warranties")
    .select(
      "id, roll_status"
    )
    .eq(
      "roll_number",
      rollNumber
    );

const blockedWarranty =
  existingWarranty?.find(
    (w) =>
      w.roll_status !==
      "Released"
  );

if (blockedWarranty) {

  alert(
    "❌ This roll number has already been used."
  );

  return;
}

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
  product.warranty_years,

            start_date:
              start,

            end_date:
              end,
inventory_match:
  inventoryMatch,

inventory_status:
  inventoryMatch
    ? "matched"
    : "unmatched",

inventory_checked_at:
  new Date()
    .toISOString(),

status:
  "Active",
roll_status:
  "Used",

          },
        ]);

if (!error) {

  await supabase
    .from("roll_inventory")
    .update({
      roll_status: "Used",
    })
    .eq(
      "roll_number",
      rollNumber
    );

}

    if (error) {
      alert(error.message);
      return;
    }

await supabase
  .from("admin_notifications")
  .insert([
    {
      title:
        "New Warranty Created",

      message:
        `Customer: ${customerName}
Center: ${centerName}
Product: ${product.name}
Roll: ${rollNumber}`,

      type:
        "warranty",
    },
  ]);

alert(
`✅ Warranty Added Successfully

Customer: ${customerName}
Roll Number: ${rollNumber}
Product: ${selectedProduct}`
);
    setCustomerName("");
    setVin("");
    setRollNumber("");
    setCity("");
setSelectedProduct("");

    await loadWarranties();
  }

async function cancelWarranty(
  id: number
) {

  const confirmed =
    confirm(
      "Are you sure you want to cancel this warranty?"
    );

  if (!confirmed) return;

  const warranty =
    warranties.find(
      (w) => w.id === id
    );

  const { error } =
    await supabase
      .from("warranties")
      .update({
        status:
          "Cancelled",
      })
      .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await supabase
    .from(
      "admin_notifications"
    )
    .insert([
      {
        title:
          "⚠️ Warranty Cancelled",

        message:
          `Customer: ${warranty?.customer_name}

Roll: ${warranty?.roll_number}

Center: ${warranty?.center_name}`,

        type:
          "warranty_cancelled",
      },
    ]);

  await loadWarranties();
}

const today =
  new Date()
    .toISOString()
    .split("T")[0];

const filteredWarranties =
  warranties.filter((item) => {

    const matchesSearch =
      item.customer_name
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        ) ||
      item.vin
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        ) ||
      item.roll_number
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        );

    const displayStatus =
      item.status === "Cancelled"
        ? "Cancelled"
        : item.end_date < today
        ? "Expired"
        : "Active";

    const matchesStatus =
      statusFilter === "all"
        ? true
        : displayStatus
            .toLowerCase() ===
          statusFilter;

    return (
      matchesSearch &&
      matchesStatus
    );
  });

function exportToExcel() {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

const exportData =
  filteredWarranties.map(
    (w) => {

      const displayStatus =
        w.status === "Cancelled"
          ? "Cancelled"
          : w.end_date < today
          ? "Expired"
          : "Active";

      return {
        Customer:
          w.customer_name,

        VIN:
          w.vin,

        Roll:
          w.roll_number,

        Product:
          w.product_name,

        WarrantyYears:
          w.duration_years,

        StartDate:
          w.start_date,

        EndDate:
          w.end_date,

        Status:
          displayStatus,

        Governorate:
          w.governorate,

        City:
          w.city,

        Center:
          w.center_name,
      };
    });

  const worksheet =
    XLSX.utils.json_to_sheet(
      exportData
    );

  const workbook =
    XLSX.utils.book_new();

const summaryData = [
  {
    Center: centerName,

    ExportDate: today,

    Total:
      warranties.length,

    Active:
      warranties.filter(
        (w) =>
          w.status !==
            "Cancelled" &&
          w.end_date >=
            today
      ).length,

    Expired:
      warranties.filter(
        (w) =>
          w.status !==
            "Cancelled" &&
          w.end_date <
            today
      ).length,

    Cancelled:
      warranties.filter(
        (w) =>
          w.status ===
          "Cancelled"
      ).length,
  },
];

const summarySheet =
  XLSX.utils.json_to_sheet(
    summaryData
  );

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Warranties"
  );

XLSX.utils.book_append_sheet(
  workbook,
  summarySheet,
  "Summary"
);

  XLSX.writeFile(
    workbook,
    `Warranties-${today}.xlsx`
  );
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

scannerRef.current =
  scanner;

const backCamera =
  cameras.find(
    (c) =>
      c.label
        .toLowerCase()
        .includes("back")
  ) ||
  cameras.find(
    (c) =>
      c.label
        .toLowerCase()
        .includes("rear")
  ) ||
  cameras.find(
    (c) =>
      c.label
        .toLowerCase()
        .includes("wide")
  ) ||
  cameras[cameras.length - 1];

console.log(
  "Selected Camera:",
  backCamera.label
);

await scanner.start(
  {
    facingMode: "environment"
  },
  {
    fps: 25,

    qrbox: {
      width: 300,
      height: 300,
    },

    aspectRatio: 1.777,


  },

async (decodedText) => {

  if (scanLock) return;

  setScanLock(true);

  const cleaned =
  decodedText
    .trim()
    .replace(/\s+/g, "");

setVin(cleaned);

  if (navigator.vibrate) {
    navigator.vibrate(100);
  }

  await scanner.stop();

scannerRef.current =
  null;
  

  setShowVinScanner(false);

  setTimeout(() => {
    setScanLock(false);
  }, 1000);

},
  () => {}
);



      } catch (error) {
  console.error("VIN ERROR:", error);

  alert(
    error instanceof Error
      ? error.message
      : JSON.stringify(error)
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

scannerRef.current =
  scanner;

const backCamera =
  cameras.find(
    (c) =>
      c.label
        .toLowerCase()
        .includes("back")
  ) ||
  cameras.find(
    (c) =>
      c.label
        .toLowerCase()
        .includes("rear")
  ) ||
  cameras.find(
    (c) =>
      c.label
        .toLowerCase()
        .includes("wide")
  ) ||
  cameras[cameras.length - 1];

console.log(
  "Selected Camera:",
  backCamera.label
);

await scanner.start(
  {
    facingMode: "environment"
  },

  {
    fps: 25,

    qrbox: {
      width: 300,
      height: 300,
    },

    aspectRatio: 1.777,


  },


async (decodedText) => {

  if (scanLock) return;

  setScanLock(true);

  const cleaned =
    decodedText
      .trim()
      .replace(/\s+/g, "");

  setRollNumber(cleaned);

  if (navigator.vibrate) {
    navigator.vibrate(100);
  }

  await scanner.stop();

scannerRef.current =
  null;


  

  setShowRollScanner(false);

  setTimeout(() => {
    setScanLock(false);
  }, 1000);

},
  () => {}
);
      } catch (error) {
  console.error("ROLL ERROR:", error);

  alert(
    error instanceof Error
      ? error.message
      : JSON.stringify(error)
  );
}
    });
  }


async function closeScanner() {
  try {
    if (scannerRef.current) {
      await scannerRef.current.stop();
await scannerRef.current.clear();
      scannerRef.current = null;
    }
  } catch (error) {
    console.log("Scanner already stopped");
  }

  setShowVinScanner(false);
  setShowRollScanner(false);
}

async function startZXingTest() {

  alert("ZXing started");

  try {

    setShowZXingTest(true);

    const reader =
      new BrowserMultiFormatReader();

    zxingRef.current =
      reader;

    setTimeout(async () => {

      try {

        await reader.decodeFromVideoDevice(
          undefined,
          "zxing-video",
          (result, error) => {

  console.log(
    "ZXING CALLBACK",
    result,
    error
  );

  if (result) {

              const text =
                result.getText();

              alert(
                "ZXing Read:\n\n" + text
              );

              setVin(text);

             
              zxingRef.current =
                null;

              setShowZXingTest(false);
            }

          }
        );

      } catch (err) {

        console.error(
          "ZXing Camera Error:",
          err
        );

        alert(
          "ZXing Camera Error"
        );
      }

    }, 1000);

  } catch (error) {

    console.error(error);

    alert("ZXing Failed");
  }
}

  function printWarranty(item: Warranty) {
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
    <html>
    <head>
      <title>${item.customer_name} - Warranty</title>
      <style>
        body{
          background:#f5f5f5;
          font-family:Arial,sans-serif;
          padding:40px;
          color:#1a1a1a;
        }


        .certificate{
          background:#fff;
          max-width:900px;
          margin:auto;
          border-radius:22px;
          padding:50px;
          box-shadow:0 10px 35px rgba(0,0,0,.08);
          border:1px solid #ececec;
        }
        .top{
display:flex;
justify-content:space-between;
align-items:flex-start;
border-bottom:1px solid #e8e8e8;
padding-bottom:24px;
margin-bottom:35px;
position:relative;
}

.top::after{
content:"";
position:absolute;
bottom:-1px;
left:0;
width:180px;
height:3px;
background:#24A444;
border-radius:999px;
}

        
        .brand{
          font-size:34px;
          font-weight:700;
          letter-spacing:1px;
        }
        .sub{
          color:#666;
          margin-top:6px;
        }
        .badge{
          border:1px solid #ddd;
          border-radius:999px;
          padding:10px 16px;
          font-size:13px;
          color:#444;
        }
        .section-title{
          font-size:13px;
          letter-spacing:1.5px;
          color:#888;
          text-transform:uppercase;
          margin:28px 0 12px;
        }
        .grid{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:18px;
        }
        .card{
          background:#fafafa;
          border:1px solid #eee;
          border-radius:16px;
          padding:18px;
        }
        .label{
          font-size:12px;
          color:#888;
          margin-bottom:6px;
        }
        .value{
          font-size:17px;
          font-weight:600;
          color:#111;
          word-break:break-word;
        }
        .footer{
          margin-top:45px;
          border-top:1px solid #eee;
          padding-top:20px;
          color:#666;
          text-align:center;
          font-size:14px;
        }
@media print {
  *{
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .top::after{
    background:#24A444 !important;
  }
}
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="top">
          <div>
            <div class="brand">EGUARD</div>
            <div class="sub">
              Premium Warranty Certificate
            </div>
          </div>

          <div class="badge">
            Authorized Warranty
          </div>
        </div>

        <div class="section-title">
          Customer Information
        </div>

        <div class="grid">
          <div class="card">
            <div class="label">Customer Name</div>
            <div class="value">${item.customer_name}</div>
          </div>

          <div class="card">
            <div class="label">Center</div>
            <div class="value">${item.center_name}</div>
          </div>
        </div>

        <div class="section-title">
          Vehicle Information
        </div>

        <div class="grid">
          <div class="card">
            <div class="label">VIN</div>
            <div class="value">${item.vin}</div>
          </div>

          <div class="card">
            <div class="label">Roll Number</div>
            <div class="value">${item.roll_number}</div>
          </div>
        </div>

        <div class="section-title">
          Protection Details
        </div>

        <div class="grid">
          <div class="card">
            <div class="label">Product</div>
            <div class="value">${item.product_name}</div>
          </div>

          <div class="card">
            <div class="label">Warranty</div>
            <div class="value">${item.duration_years} Years</div>
          </div>

          <div class="card">
            <div class="label">Start Date</div>
            <div class="value">${item.start_date}</div>
          </div>

          <div class="card">
            <div class="label">End Date</div>
            <div class="value">${item.end_date}</div>
          </div>

          <div class="card">
            <div class="label">Status</div>
            <div class="value">${item.status}</div>
          </div>

          <div class="card">
            <div class="label">Location</div>
            <div class="value">${item.governorate} / ${item.city}</div>
          </div>
        </div>

        <div class="footer">
          Authorized Warranty Certificate
        </div>
      </div>
    </body>
    </html>
    `);

    win.document.close();

win.onload = () => {
  win.focus();
  win.print();
};
  }
async function shareWarranty(item: Warranty) {
  try {
    const doc = new jsPDF();

const green = [36, 164, 68];

doc.setFillColor(245, 245, 245);
doc.rect(0, 0, 210, 297, "F");

doc.setFillColor(255, 255, 255);
doc.roundedRect(
  12,
  12,
  186,
  265,
  8,
  8,
  "F"
);

doc.setDrawColor(230, 230, 230);
doc.roundedRect(
  12,
  12,
  186,
  265,
  8,
  8
);

// Header
doc.setFont(
  "helvetica",
  "bold"
);

doc.setFontSize(28);
doc.text("EGUARD", 20, 30);

doc.setFont(
  "helvetica",
  "normal"
);

doc.setFontSize(12);
doc.setTextColor(90);

doc.text(
  "Premium Warranty Certificate",
  20,
  38
);

// green line
doc.setDrawColor(
  green[0],
  green[1],
  green[2]
);

doc.setLineWidth(1.2);

doc.line(20, 45, 80, 45);

// badge
doc.setDrawColor(220);
doc.roundedRect(
  145,
  22,
  40,
  10,
  4,
  4
);

doc.setFontSize(9);
doc.setTextColor(70);

doc.text(
  "Authorized Warranty",
  151,
  28
);

let y = 62;

const section = (
  title: string
) => {
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setTextColor(130);
  doc.setFontSize(10);

  doc.text(
    title.toUpperCase(),
    20,
    y
  );

  y += 8;
};

const card = (
  label: string,
  value: string,
  x: number,
  yPos: number
) => {
  doc.setFillColor(
    250,
    250,
    250
  );

  doc.setDrawColor(
    235,
    235,
    235
  );

  doc.roundedRect(
    x,
    yPos,
    78,
    22,
    4,
    4,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setTextColor(140);
  doc.setFontSize(9);

  doc.text(
    label,
    x + 4,
    yPos + 7
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setTextColor(20);
  doc.setFontSize(11);

  doc.text(
    value || "-",
    x + 4,
    yPos + 15
  );
};

// CUSTOMER
section(
  "Customer Information"
);

card(
  "Customer Name",
  item.customer_name,
  20,
  y
);

card(
  "Center",
  item.center_name,
  110,
  y
);

y += 34;

// VEHICLE
section(
  "Vehicle Information"
);

card(
  "VIN",
  item.vin,
  20,
  y
);

card(
  "Roll Number",
  item.roll_number,
  110,
  y
);

y += 34;

// PROTECTION
section(
  "Protection Details"
);

card(
  "Product",
  item.product_name,
  20,
  y
);

card(
  "Warranty",
  `${item.duration_years} Years`,
  110,
  y
);

y += 28;

card(
  "Start Date",
  item.start_date,
  20,
  y
);

card(
  "End Date",
  item.end_date,
  110,
  y
);

y += 28;

card(
  "Status",
  item.status,
  20,
  y
);

card(
  "Location",
  `${item.governorate} / ${item.city}`,
  110,
  y
);

// footer
doc.setDrawColor(230);
doc.line(
  20,
  255,
  185,
  255
);

doc.setFont(
  "helvetica",
  "normal"
);

doc.setTextColor(110);
doc.setFontSize(10);

doc.text(
  "Official EGUARD Paint Protection Warranty",
  20,
  265
);

doc.text(
  "Authorized Service Certificate",
  20,
  272
);

const pdfBlob = doc.output("blob");

    const file = new File(
      [pdfBlob],
      `${item.customer_name} - Warranty.pdf`,
      {
        type:
          "application/pdf",
      }
    );

    if (
      navigator.canShare &&
      navigator.canShare({
        files: [file],
      })
    ) {
      await navigator.share({
        title:
          "Warranty Certificate",
        text:
          `${item.customer_name} Warranty`,
        files: [file],
      });
    } else {
      doc.save(
        `${item.customer_name} - Warranty.pdf`
      );
    }
  } catch (error) {
    console.error(error);
    alert(
      "Failed to share PDF"
    );
  }
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
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "30px",
        }}
      >
        <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
        <button
          style={{
            padding: "8px 12px",
            color: "#fff",
            background: "#333",
            border: "1px solid #555",
            borderRadius: "10px",
          }}
          onClick={() => setLanguage("en")}
        >
          English
        </button>
        <button
          style={{
            padding: "8px 12px",
            color: "#fff",
            background: "#333",
            border: "1px solid #555",
            borderRadius: "10px",
          }}
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


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
  "repeat(auto-fit, minmax(220px, 1fr))",

gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "#202020",
            border: "1px solid #333",
            borderRadius: "14px",
            padding: "16px",
          }}
        >
          <p style={{ color:"#aaa" }}>
            Total Warranties
          </p>
          <h2 style={{ color:"#fff" }}>
            {warranties.length}
          </h2>
        </div>

        <div
          style={{
            background: "#202020",
            border: "1px solid #333",
            borderRadius: "14px",
            padding: "16px",
          }}
        >
          <p style={{ color:"#aaa" }}>
            Active
          </p>
          <h2 style={{ color:"#fff" }}>
            {
warranties.filter((w) => {
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  return (
    w.status !== "Cancelled" &&
    w.end_date >= today
  );
}).length
            }
          </h2>
        </div>

<div
  style={{
    background:"#202020",
    border:"1px solid #333",
    borderRadius:"14px",
    padding:"16px",
  }}
>
  <p style={{color:"#aaa"}}>
    Expired
  </p>

  <h2
    style={{
      color:"#ff9800"
    }}
  >
    {
      warranties.filter((w) => {
        const today =
          new Date()
            .toISOString()
            .split("T")[0];

        return (
          w.status !== "Cancelled" &&
          w.end_date < today
        );
      }).length
    }
  </h2>
</div>

<div
  style={{
    background:"#202020",
    border:"1px solid #333",
    borderRadius:"14px",
    padding:"16px",
  }}
>
  <p style={{color:"#aaa"}}>
    Cancelled
  </p>

  <h2
    style={{
      color:"#ff4444"
    }}
  >
    {
      warranties.filter(
        (w) =>
          w.status ===
          "Cancelled"
      ).length
    }
  </h2>
</div>

        <div
          style={{
            background: "#202020",
            border: "1px solid #333",
            borderRadius: "14px",
            padding: "16px",
          }}
        >
          <p style={{ color:"#aaa" }}>
            Center
          </p>
          <h2 style={{ color:"#fff" }}>
            {centerName}
          </h2>
        </div>
      </div>

      <h3 style={{ color: "#fff" }}>
        {t.center}
        {" "}
        {centerName}
      </h3>

      <div style={{
        background:"#202020",
        border:"1px solid #333",
        borderRadius:"16px",
        padding:"18px",
        marginBottom:"18px"
      }}>
      <h3 style={{ color:"#fff", marginBottom:"10px" }}>
        Customer Information
      </h3>

      <label style={{ color:"#aaa", display:"block", marginBottom:"8px" }}>
        Customer Name
      </label>

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

        </div>

{showZXingTest && (

  <div>
    <h3>ZXing Test</h3>

<video
  id="zxing-video"
  autoPlay
  playsInline
  muted
  style={{
    width: "100%",
    maxWidth: "500px",
    height: "350px",
    background: "#000",
    borderRadius: "12px"
  }}
/>

<button
  onClick={() => {
    zxingRef.current = null;
    setShowZXingTest(false);
  }}
>
  Close
</button>
  </div>

)}

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


<p
  style={{
    color: "#24A444",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "10px",
  }}
>
  Hold camera 15-25 cm from barcode
</p>

<div
  style={{
    border: "2px dashed #24A444",
    borderRadius: "12px",
    height: "80px",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#24A444",
    fontWeight: "bold",
  }}
>
  Place Barcode Here
</div>

<div
  id="vin-reader"
  style={{
    width: "100%",
    maxWidth: "650px",
    margin: "0 auto",
  }}
></div>

          <br />

          <button
            onClick={closeScanner}
          >
            {t.close}
          </button>
        </div>
      )}

      <br />
      <br />

      
     <div
  style={{
    background:"#202020",
    border:"1px solid #333",
    borderRadius:"16px",
    padding:"18px",
    marginBottom:"18px"
  }}
>
  <h3
    style={{
      color:"#fff",
      marginBottom:"18px"
    }}
  >
    Vehicle Information
  </h3>

  {/* VIN */}
  <label
    style={{
      color:"#aaa",
      display:"block",
      marginBottom:"8px"
    }}
  >
    VIN
  </label>

  <div
    style={{
      display:"flex",
      gap:"10px",
      alignItems:"center",
      marginBottom:"20px"
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
        flex:1,
        padding:"14px",
        borderRadius:"12px",
        border:"1px solid #333",
        fontSize:"16px",
        color:"#fff",
        background:"#222",
      }}
    />

    <button
      style={{
        background:"#333",
        color:"#fff",
        borderRadius:"10px",
        padding:"12px",
      }}
      onClick={() =>
        startVinScanner()
      }
    >
      {t.scanVin}
    </button>

<button
  style={{
    background:"#24A444",
    color:"#fff",
    borderRadius:"10px",
    padding:"12px",
  }}
  onClick={() =>
    startZXingTest()
  }
>
  Test ZXing
</button>

  </div>



  {/* Roll */}
  <label
    style={{
      color:"#aaa",
      display:"block",
      marginBottom:"8px"
    }}
  >
    Roll Number
  </label>

  <div
    style={{
      display:"flex",
      gap:"10px",
      alignItems:"center"
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
        flex:1,
        padding:"14px",
        borderRadius:"12px",
        border:"1px solid #333",
        fontSize:"16px",
        color:"#fff",
        background:"#222",
      }}
    />

    <button
      style={{
        background:"#333",
        color:"#fff",
        borderRadius:"10px",
        padding:"12px",
      }}

      onClick={() =>
  startRollScanner()
}
    >
      {t.scanRoll}
    </button>
  </div>
</div>
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

<p
  style={{
    color: "#24A444",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "10px",
  }}
>
  Hold camera 15-25 cm from barcode
</p>

<div
  style={{
    border: "2px dashed #24A444",
    borderRadius: "12px",
    height: "80px",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#24A444",
    fontWeight: "bold",
  }}
>
  Place Barcode Here
</div>

<div
  id="roll-reader"
  style={{
    width: "100%",
    maxWidth: "650px",
    margin: "0 auto",
  }}
></div>

          <br />

          <button
            onClick={closeScanner}
          >
            {t.close}
          </button>
        </div>
      )}

      
     
     
<div
  style={{
    background:"#202020",
    border:"1px solid #333",
    borderRadius:"16px",
    padding:"18px",
    marginBottom:"18px"
  }}
>
  <h3 style={{ color:"#fff" }}>
    Location
  </h3>

  <p style={{ color:"#fff" }}>
    {t.country}
  </p>

  <label
    style={{
      color:"#aaa",
      display:"block",
      marginBottom:"8px"
    }}
  >
    Governorate
  </label>

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

  <label
    style={{
      color:"#aaa",
      display:"block",
      marginBottom:"8px"
    }}
  >
    City
  </label>

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
</div>

<div
  style={{
    background:"#202020",
    border:"1px solid #333",
    borderRadius:"16px",
    padding:"18px",
    marginBottom:"18px"
  }}
>
  <h3 style={{ color:"#fff" }}>
    Product
  </h3>

  <label
    style={{
      color:"#aaa",
      display:"block",
      marginBottom:"8px"
    }}
  >
    Product Type
  </label>

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
    value={selectedProduct}
    onChange={(e) =>
      setSelectedProduct(
        e.target.value
      )
    }
  >
<option value="">
  Select Product
</option>
    {products.map(
      (product) => (
    <option
  key={product.id}
  value={product.name}
>
  {product.name}
  {" - "}
  {product.warranty_years} Years
</option>
      )
    )}
  </select>
</div>


        <button
  onClick={addWarranty}
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    background: "#24A444",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "20px",
  }}
>
  {t.add}
</button>

      <hr />

<select
  value={statusFilter}
  onChange={(e) =>
    setStatusFilter(
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #333",
    fontSize: "16px",
    color: "#fff",
    background: "#222",
    marginBottom: "12px",
  }}
>
  <option value="all">
    All Warranties
  </option>

  <option value="active">
    Active
  </option>

  <option value="expired">
    Expired
  </option>

  <option value="cancelled">
    Cancelled
  </option>
</select>

<button
  onClick={exportToExcel}
  style={{
    width:"100%",
    padding:"14px",
    borderRadius:"12px",
    border:"none",
    background:"#1e88e5",
    color:"#fff",
    fontSize:"16px",
    marginBottom:"12px",
    cursor:"pointer",
  }}
>
  📊 Export Excel
</button>

      <input
        type="text"
        placeholder="Search VIN / Customer / Roll"
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "1px solid #333",
          fontSize: "16px",
          color: "#fff",
          background: "#222",
          marginBottom: "20px",
        }}
      />

      {warranties
       .filter((item) => {

  const q =
    searchTerm.toLowerCase();

  const matchesSearch =
    item.customer_name
      ?.toLowerCase()
      .includes(q) ||
    item.vin
      ?.toLowerCase()
      .includes(q) ||
    item.roll_number
      ?.toLowerCase()
      .includes(q);

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const displayStatus =
    item.status ===
    "Cancelled"
      ? "Cancelled"
      : item.end_date <
        today
      ? "Expired"
      : "Active";

  const matchesStatus =
    statusFilter === "all"
      ? true
      : displayStatus
          .toLowerCase() ===
        statusFilter;

  return (
    matchesSearch &&
    matchesStatus
  );
})

    .map((item) => {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const displayStatus =
    item.status === "Cancelled"
      ? "Cancelled"
      : item.end_date < today
      ? "Expired"
      : "Active";




  return (

          <div
            key={item.id}
            style={{
              background: "#1c1c1c",
              border: "1px solid #2f2f2f",
              borderRadius: "14px",
              padding: "14px",
              marginBottom: "14px",
            }}
          >
            <h3
              style={{
                color: "#fff",
                marginBottom: "12px",
                fontSize: "18px",
              }}
            >
              {item.customer_name}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "10px",
              }}
            >
              <div>
                <p style={{color:"#888",fontSize:"12px"}}>VIN</p>
                <p
  style={{
    color:"#fff",
    wordBreak:"break-all",
    overflowWrap:"break-word"
  }}
>
  {item.vin}
</p>
              </div>

              <div>
                <p style={{color:"#888",fontSize:"12px"}}>Roll</p>
                <p
  style={{
    color:"#fff",
    wordBreak:"break-all",
    overflowWrap:"break-word"
  }}
>
  {item.roll_number}
</p>
              </div>

              <div>
                <p style={{color:"#888",fontSize:"12px"}}>Product</p>
                <p style={{color:"#fff"}}>
                  {item.product_name}
                </p>
              </div>

              <div>
                <p style={{color:"#888",fontSize:"12px"}}>
                  Warranty
                </p>
                <p style={{color:"#fff"}}>
                  {item.duration_years} Years
                </p>
              </div>

              <div>
                <p style={{color:"#888",fontSize:"12px"}}>
                  Start Date
                </p>
                <p style={{color:"#fff"}}>
                  {item.start_date}
                </p>
              </div>

              <div>
                <p style={{color:"#888",fontSize:"12px"}}>
                  End Date
                </p>
                <p style={{color:"#fff"}}>
                  {item.end_date}
                </p>
              </div>

              <div>
                <p style={{color:"#888",fontSize:"12px"}}>
                  Status
                </p>
                <p
  style={{
color:
  displayStatus === "Active"
    ? "#24a444"
    : displayStatus === "Expired"
    ? "#ff9800"
    : "#ff4444",
    fontWeight: "bold",
  }}
>
  {displayStatus}
</p>

              </div>

              <div>
                <p style={{color:"#888",fontSize:"12px"}}>
                  Location
                </p>
                <p style={{color:"#fff"}}>
                  {item.governorate} / {item.city}
                </p>
              </div>
            </div>

            <div
              style={{
                display:"flex",
                justifyContent:"flex-end",
                marginTop:"12px",
              }}
            >
              <button
                style={{
                  background:"#2d5a27",
                  color:"#fff",
                  border:"none",
                  borderRadius:"8px",
                  padding:"8px 14px",
                  fontSize:"14px",
                  marginRight:"8px"
                }}
                onClick={() =>
                  printWarranty(item)
                }
              >
                Print
              </button>
<button
  style={{
    background:"#1f4f86",
    color:"#fff",
    border:"none",
    borderRadius:"8px",
    padding:"8px 14px",
    fontSize:"14px",
    marginRight:"8px"
  }}
  onClick={() =>
    shareWarranty(item)
  }
>
  Share
</button>

  {item.status !==
  "Cancelled" && (
  <button
    style={{
      background:"#7a1f1f",
      color:"#fff",
      border:"none",
      borderRadius:"8px",
      padding:"8px 14px",
      fontSize:"14px",
    }}
    onClick={() =>
      cancelWarranty(item.id)
    }
  >
    Cancel
  </button>

)}

             
            </div>
          </div>
        );
      })}

      </div>
    </div>
  );
}