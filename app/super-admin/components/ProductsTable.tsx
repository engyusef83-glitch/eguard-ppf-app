
"use client";

type Product = {
  id: string;
  name: string;
  warranty_years: number;
};

type Props = {
  products: Product[];
  onEditProduct: (
    product: Product
  ) => void;
  onDeleteProduct: (
    product: Product
  ) => void;
};

export default function ProductsTable({
  products,
  onEditProduct,
  onDeleteProduct,
}: Props) {
  return (
    <div
      style={{
        background:
          "#111",
        borderRadius:
          "20px",
        padding:
          "24px",
        marginTop:
          "24px",
        overflowX:
          "auto",
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
        Products
      </h2>

      <table
        style={{
          width:
            "100%",
          borderCollapse:
            "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom:
                "1px solid #333",
            }}
          >
            <th
              style={{
                color:
                  "#888",
                textAlign:
                  "left",
                padding:
                  "14px",
              }}
            >
              Product
            </th>

            <th
              style={{
                color:
                  "#888",
                textAlign:
                  "left",
                padding:
                  "14px",
              }}
            >
              Warranty Years
            </th>

            <th
              style={{
                color:
                  "#888",
                textAlign:
                  "left",
                padding:
                  "14px",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map(
            (
              product
            ) => (
              <tr
                key={
                  product.id
                }
                style={{
                  borderBottom:
                    "1px solid #222",
                }}
              >
                <td
                  style={{
                    color:
                      "#fff",
                    padding:
                      "16px",
                  }}
                >
                  {
                    product.name
                  }
                </td>

                <td
                  style={{
                    color:
                      "#fff",
                    padding:
                      "16px",
                  }}
                >
                  {
                    product.warranty_years
                  }{" "}
                  Years
                </td>

                <td
                  style={{
                    padding:
                      "16px",
                  }}
                >
                  <button
                    onClick={() =>
                      onEditProduct(
                        product
                      )
                    }
                    style={{
                      background:
                        "#1e88e5",
                      border:
                        "none",
                      color:
                        "#fff",
                      padding:
                        "10px 14px",
                      borderRadius:
                        "10px",
                      marginRight:
                        "10px",
                      cursor:
                        "pointer",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      onDeleteProduct(
                        product
                      )
                    }
                    style={{
                      background:
                        "#c62828",
                      border:
                        "none",
                      color:
                        "#fff",
                      padding:
                        "10px 14px",
                      borderRadius:
                        "10px",
                      cursor:
                        "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

