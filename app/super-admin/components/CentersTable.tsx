
"use client";

type Center = {
  id: string;
  center_name: string;
  phone?: string;
  governorate?: string;
  city?: string;
  email?: string;
  status?: string;
};


type Props = {
  centers: Center[];
  onAddCenter: () => void;
  onEditCenter: (
    center: Center
  ) => void;
};



export default function CentersTable({
  centers,
  onAddCenter,
  onEditCenter,
}: Props)

 {
  return (
    <div
      style={{
        background:
          "#1b1b1b",
        border:
          "1px solid #2c2c2c",
        borderRadius:
          "24px",
        padding:
          "24px",
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
            "24px",
        }}
      >
        <h2
          style={{
            color:
              "#fff",
            margin: 0,
          }}
        >
          Centers Management
        </h2>

        <button
          onClick={
            onAddCenter
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
            fontWeight:
              600,
          }}
        >
          + Add Center
        </button>
      </div>

      <div
        style={{
          overflowX:
            "auto",
        }}
      >
        <table
          style={{
            width:
              "100%",
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr>
              {[
                "Center",
                "Phone",
                "Governorate",
                "City",
                "Email",
                "Status",
                "Actions",
              ].map(
                (
                  item
                ) => (
                  <th
                    key={
                      item
                    }
                    style={{
                      color:
                        "#888",
                      textAlign:
                        "left",
                      padding:
                        "14px",
                      borderBottom:
                        "1px solid #333",
                    }}
                  >
                    {item}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {centers.map(
              (
                center
              ) => (
                <tr
                  key={
                    center.id
                  }
                >
                  <td
                    style={{
                      padding:
                        "16px",
                      color:
                        "#fff",
                    }}
                  >
                    {
                      center.center_name
                    }
                  </td>

                  <td
                    style={{
                      padding:
                        "16px",
                      color:
                        "#ddd",
                    }}
                  >
                    {center.phone ||
                      "-"}
                  </td>

                  <td
                    style={{
                      padding:
                        "16px",
                      color:
                        "#ddd",
                    }}
                  >
                    {center.governorate ||
                      "-"}
                  </td>

                  <td
                    style={{
                      padding:
                        "16px",
                      color:
                        "#ddd",
                    }}
                  >
                    {center.city ||
                      "-"}
                  </td>

                  <td
                    style={{
                      padding:
                        "16px",
                      color:
                        "#ddd",
                    }}
                  >
                    {center.email ||
                      "-"}
                  </td>

                  <td
                    style={{
                      padding:
                        "16px",
                    }}
                  >
                    <span
                      style={{
                        background:
                          center.status ===
                          "Suspended"
                            ? "#742a2a"
                            : "#24a444",
                        color:
                          "#fff",
                        padding:
                          "8px 12px",
                        borderRadius:
                          "999px",
                        fontSize:
                          "12px",
                      }}
                    >
                      {center.status ||
                        "Active"}
                    </span>
                  </td>

                  <td
                    style={{
                      padding:
                        "16px",
                    }}
                  >
                    
<button
  onClick={() =>
    onEditCenter(
      center
    )
  }
  style={{
    background:
      "#222",
    border:
      "1px solid #333",
    color:
      "#fff",
    borderRadius:
      "10px",
    padding:
      "8px 12px",
    cursor:
      "pointer",
  }}
>
  Edit
</button>


                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
