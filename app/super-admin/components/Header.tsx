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
            color:
              "#fff",
            marginBottom:
              "8px",
          }}
        >
          EGUARD MASTER PANEL
        </h1>

        <p
          style={{
            color:
              "#888",
          }}
        >
          Super Admin Dashboard
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

