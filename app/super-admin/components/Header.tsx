"use client";

type Props = {
  onLogout: () => void;
};

export default function Header({
  onLogout,
}: Props) {
  return (
    <div
      style={{
        display:
          "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
        marginBottom:
          "30px",
      }}
    >
      <div>
        <h1
  style={{
    color: "#fff",
    margin: 0,
    fontSize: "32px",
    fontWeight: "bold",
  }}
>
  EGUARD Warranty System
</h1>

<p
  style={{
    color: "#888",
    marginTop: "8px",
  }}
>
  Super Admin Control Center
</p>
      </div>

      <button
        onClick={
          onLogout
        }
        style={{
          background:
            "#222",
          color:
            "#fff",
          border:
            "1px solid #333",
          borderRadius:
            "12px",
          padding:
            "12px 18px",
          cursor:
            "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

