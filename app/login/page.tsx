"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

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
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          width: "400px",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Admin Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            border: "1px solid #ccc",
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
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Login"}
        </button>

        {message && (
          <p style={{ color: "red", marginTop: "15px" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}