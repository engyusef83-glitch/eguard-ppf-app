"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from "next/image";




const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

 async function handleLogin() {
  setLoading(true);
  setMessage("");

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });


  if (error) {
    setLoading(false);
    setMessage(error.message);
    return;
  }

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    setLoading(false);
    setMessage(
      "User not found"
    );
    return;
  }

 const {
  data: profile,
  error: profileError,
} = await supabase
  .from("profiles")
  .select("*")
  .eq("email", user.email)
  .single();

console.log(
  "PROFILE:",
  profile
);

  setLoading(false);

const {
  data: center,
} = await supabase
  .from("centers")
  .select("status")
  .eq(
    "user_id",
    user.id
  )
  .single();

if (
  center?.status ===
  "Suspended"
) {
  await supabase.auth.signOut();

  setLoading(false);

  setMessage(
    "Your account has been suspended. Please contact EGUARD administration."
  );

  return;
}


  console.log(
  "LOGIN PROFILE:",
  profile
);

if (
  user.email ===
  "eguard.iraq@gmail.com"
) {
  router.push(
    "/super-admin"
  );
  return;
}

if (
  profile?.role ===
  "super_admin"
) {
  router.push(
    "/super-admin"
  );
  return;
}

router.push("/admin");
}
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f0f0f",
      }}
    >
      <div
        style={{
background: "#181818",
padding: "50px",
borderRadius: "24px",
border: "1px solid #2b2b2b",
boxShadow:
  "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
       <div
  style={{
    textAlign: "center",
    marginBottom: "20px",
  }}
>
 

  <h1
  style={{
    color: "#fff",
    fontSize: "32px",
    fontWeight: "700",
    marginTop: "20px",
    marginBottom: "10px",
  }}
>
  EGUARD Warranty System
</h1>

  <p
style={{
  color: "#888",
  fontSize: "15px",
  lineHeight: "24px",
}}
  >
    Professional Warranty & Inventory Management Platform
  </p>
</div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            background: "#101010",
border: "1px solid #333",
borderRadius: "12px",
color: "#fff",
fontSize: "16px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "20px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "#24a444",
borderRadius: "12px",
fontWeight: "bold",
fontSize: "16px",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Login"}
        </button>

<div
  style={{
    textAlign: "center",
    marginTop: "25px",
    color: "#666",
    fontSize: "13px",
  }}
>
  © 2026 EGUARD. All rights reserved.
</div>

        {message && (
          <p style={{ color: "red", marginTop: "15px" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}