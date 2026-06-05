"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import CentersTable from "./components/CentersTable";
import AddCenterModal from "./components/AddCenterModal";
import EditCenterModal from "./components/EditCenterModal";
import ResetPasswordModal from "./components/ResetPasswordModal";
import DeleteCenterModal from "./components/DeleteCenterModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ProductsTable from "./components/ProductsTable";
import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import DeleteProductModal from "./components/DeleteProductModal";









const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SuperAdminPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [showAddCenter, setShowAddCenter] =
    useState(false);

const [showEditCenter, setShowEditCenter] =
  useState(false);

const [selectedCenter, setSelectedCenter] =
  useState<any>(null);

  const [centers, setCenters] =
    useState<any[]>([]);

  const [stats, setStats] =
    useState({
      centers: 0,
      warranties: 0,
      active: 0,
      expired: 0,
    });

const [
  showResetPassword,
  setShowResetPassword,
] = useState(false);

const [
  selectedResetCenter,
  setSelectedResetCenter,
] = useState<any>(
  null
);


const [
  showDeleteCenter,
  setShowDeleteCenter,
] = useState(false);

const [
  selectedDeleteCenter,
  setSelectedDeleteCenter,
] = useState<any>(
  null
);

const [products, setProducts] =
  useState<any[]>([]);

const [
  showAddProduct,
  setShowAddProduct,
] = useState(false);

const [
  showEditProduct,
  setShowEditProduct,
] = useState(false);

const [
  selectedProduct,
  setSelectedProduct,
] = useState<any>(
  null
);

const [
  showDeleteProduct,
  setShowDeleteProduct,
] = useState(false);



const [search, setSearch] =
  useState("");

const [
  statusFilter,
  setStatusFilter,
] = useState("All");

const [
  governorateFilter,
  setGovernorateFilter,
] = useState("All");




  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (
      user.email ===
      "eguard.iraq@gmail.com"
    ) {
      await loadData();
      setLoading(false);
      return;
    }

    const {
      data: profile,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq(
        "email",
        user.email
      )
      .single();

    if (
      !profile ||
      profile.role !==
        "super_admin"
    ) {
      router.push("/admin");
      return;
    }

    await loadData();
    setLoading(false);
  }

  async function loadData() {
    const {
      count: centerCount,
    } = await supabase
      .from("centers")
      .select("*", {
        count:
          "exact",
        head:
          true,
      });

    const {
      data: warranties,
    } = await supabase
      .from("warranties")
      .select("*");

    const {
      data:
        centersData,
    } = await supabase
      .from("centers")
      .select("*")
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

    setCenters(
      centersData ||
        []
    );

const {
  data: productsData,
} = await supabase
  .from("products")
  .select("*")
  .order("name");

setProducts(
  productsData ||
    []
);


    const active =
      warranties?.filter(
        (w) =>
          w.status ===
          "Active"
      ).length || 0;

    const expired =
      warranties?.filter(
        (w) =>
          w.status !==
          "Active"
      ).length || 0;

    setStats({
      centers:
        centerCount ||
        0,
      warranties:
        warranties?.length ||
        0,
      active,
      expired,
    });
  }

const filteredCenters =
  centers.filter(
    (center) => {
      const matchSearch =
        center.center_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchStatus =
        statusFilter ===
          "All" ||
        center.status ===
          statusFilter;

      const matchGovernorate =
        governorateFilter ===
          "All" ||
        center.governorate ===
          governorateFilter;

      return (
        matchSearch &&
        matchStatus &&
        matchGovernorate
      );
    }
  );



function exportCenters() {
  const excelData =
    filteredCenters.map(
      (center) => ({
        "Center Name":
          center.center_name ||
          "",

        Email:
          center.email ||
          "",

        Phone:
          center.phone ||
          "",

        Governorate:
          center.governorate ||
          "",

        City:
          center.city ||
          "",

        Status:
          center.status ||
          "",

        "Created At":
          center.created_at
            ? new Date(
                center.created_at
              ).toLocaleString()
            : "",
      })
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      excelData
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Centers"
  );

  const excelBuffer =
    XLSX.write(
      workbook,
      {
        bookType:
          "xlsx",
        type:
          "array",
      }
    );

  const file =
    new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

  saveAs(
    file,
    "centers.xlsx"
  );
}


async function exportWarranties() {
  const {
    data: warranties,
  } = await supabase
    .from(
      "warranties"
    )
    .select("*");

  const excelData =
    (
      warranties || []
    ).map(
      (item) => ({
        Timestamp:
          item.created_at
            ? new Date(
                item.created_at
              ).toLocaleString()
            : "",

        "Vehicle Chassis Number (VIN)":
          item.vin ||
          "",

        

"Installation Date":
  item.start_date ||
  "",

"Roll ID":
  item.roll_number ||
  "",

"Roll Type":
  item.product_name ||
  "",

"Warranty Period":
  item.duration_years
    ? `${item.duration_years} Years`
    : "",





        Governorate:
          item.governorate ||
          "",

        Country:
          item.country ||
          "Iraq",
      })
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      excelData
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Warranties"
  );

  const excelBuffer =
    XLSX.write(
      workbook,
      {
        bookType:
          "xlsx",
        type:
          "array",
      }
    );

  const file =
    new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

  saveAs(
    file,
    "eguard_warranties.xlsx"
  );
}



  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",
          background:
            "#0f0f0f",
          display:
            "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          color:
            "#fff",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        background:
          "#0f0f0f",
        minHeight:
          "100vh",
        padding:
          "24px",
      }}
    >
      <div
        style={{
          maxWidth:
            "1400px",
          margin:
            "0 auto",
        }}
      >
        <Header
          onLogout={
            logout
          }
        />

        <StatsCards
          stats={stats}
        />


<div
  style={{
    display:
      "flex",
    justifyContent:
      "flex-end",
    marginBottom:
      "20px",
  }}
>
  <button
    onClick={
      exportCenters
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
        "14px 18px",
      cursor:
        "pointer",
      fontWeight:
        "bold",
    }}
  >
    Export Centers
  </button>


<button
  onClick={
    exportWarranties
  }
  style={{
    background:
      "#1e88e5",
    color:
      "#fff",
    border:
      "none",
    borderRadius:
      "12px",
    padding:
      "14px 18px",
    cursor:
      "pointer",
    fontWeight:
      "bold",
    marginLeft:
      "12px",
  }}
>
  Export Warranties
</button>

<button
  onClick={() =>
    window.location.href =
      "/super-admin/roll-inventory"
  }
  style={{
    background:
      "#ff9800",
    color:
      "#fff",
    border:
      "none",
    borderRadius:
      "12px",
    padding:
      "14px 18px",
    cursor:
      "pointer",
    fontWeight:
      "bold",
    marginLeft:
      "12px",
  }}
>
  Roll Inventory
</button>


</div>




<div
  style={{
    display:
      "flex",
    gap:
      "16px",
    marginBottom:
      "24px",
    flexWrap:
      "wrap",
  }}
>
  <input
    placeholder="Search center..."
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
    style={{
      flex:
        "1",
      minWidth:
        "260px",
      background:
        "#1b1b1b",
      border:
        "1px solid #333",
      borderRadius:
        "12px",
      padding:
        "14px",
      color:
        "#fff",
    }}
  />

  <select
    value={
      statusFilter
    }
    onChange={(e) =>
      setStatusFilter(
        e.target.value
      )
    }
    style={{
      background:
        "#1b1b1b",
      border:
        "1px solid #333",
      borderRadius:
        "12px",
      padding:
        "14px",
      color:
        "#fff",
      minWidth:
        "180px",
    }}
  >
    <option>
      All
    </option>

    <option>
      Active
    </option>

    <option>
      Suspended
    </option>
  </select>

  <select
    value={
      governorateFilter
    }
    onChange={(e) =>
      setGovernorateFilter(
        e.target.value
      )
    }
    style={{
      background:
        "#1b1b1b",
      border:
        "1px solid #333",
      borderRadius:
        "12px",
      padding:
        "14px",
      color:
        "#fff",
      minWidth:
        "220px",
    }}
  >
    <option>
      All
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
        >
          {
            governorate
          }
        </option>
      )
    )}
  </select>
</div>


       

<CentersTable
  
centers={
  filteredCenters
}


  onAddCenter={() =>
    setShowAddCenter(
      true
    )
  }
  onEditCenter={(
    center
  ) => {
    setSelectedCenter(
      center
    );

    setShowEditCenter(
      true
    );
  }}
  onResetPassword={(
    center
  ) => {
    setSelectedResetCenter(
      center
    );

    setShowResetPassword(
      true

 );
  }}

onDeleteCenter={(
  center
) => {
  setSelectedDeleteCenter(
    center
  );

  setShowDeleteCenter(
    true
 

    );
  }}
/>

<div
  style={{
    marginTop:
      "40px",
  }}
>
  <div
    style={{
      display:
        "flex",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom:
        "20px",
    }}
  >
    <h2
      style={{
        color:
          "#fff",
      }}
    >
      Products
    </h2>

    <button
      onClick={() =>
        setShowAddProduct(
          true
        )
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
      }}
    >
      Add Product
    </button>
  </div>

  <ProductsTable
    products={
      products
    }
    onEditProduct={(
      product
    ) => {
      setSelectedProduct(
        product
      );

      setShowEditProduct(
        true
      );
    }}
    onDeleteProduct={(
      product
    ) => {
      setSelectedProduct(
        product
      );

      setShowDeleteProduct(
        true
      );
    }}
  />
</div>






      
<AddCenterModal
  open={
    showAddCenter
  }
  onClose={() =>
    setShowAddCenter(
      false
    )
  }
  onSuccess={
    loadData
  }
/>





<EditCenterModal
  open={
    showEditCenter
  }
  center={
    selectedCenter
  }
  onClose={() =>
    setShowEditCenter(
      false
    )
  }
  onSuccess={
    loadData
  }
/>



<ResetPasswordModal
  open={
    showResetPassword
  }
  userId={
    selectedResetCenter?.user_id
  }
  centerName={
    selectedResetCenter?.center_name ||
    ""
  }
  onClose={() => {
    setShowResetPassword(
      false
    );

    setSelectedResetCenter(
      null
    );
  }}
/>


<DeleteCenterModal
  open={
    showDeleteCenter
  }
  centerId={
    selectedDeleteCenter?.id
  }
  userId={
    selectedDeleteCenter?.user_id
  }
  centerName={
    selectedDeleteCenter?.center_name ||
    ""
  }
  onClose={() => {
    setShowDeleteCenter(
      false
    );

    setSelectedDeleteCenter(
      null
    );
  }}
  onSuccess={
    loadData
  }
/>


<AddProductModal
  open={
    showAddProduct
  }
  onClose={() =>
    setShowAddProduct(
      false
    )
  }
  onSuccess={
    loadData
  }
/>

<EditProductModal
  open={
    showEditProduct
  }
  product={
    selectedProduct
  }
  onClose={() =>
    setShowEditProduct(
      false
    )
  }
  onSuccess={
    loadData
  }
/>

<DeleteProductModal
  open={
    showDeleteProduct
  }
  product={
    selectedProduct
  }
  onClose={() =>
    setShowDeleteProduct(
      false
    )
  }
  onSuccess={
    loadData
  }
/>






      </div>
    </div>
  );
}

