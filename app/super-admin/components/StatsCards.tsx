
"use client";

type Props = {
  stats: {
    centers: number;
    warranties: number;
    active: number;
    expired: number;
  };
};

export default function StatsCards({
  stats,
}: Props) {
  return (
    <div
      style={{
        display:
          "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap:
          "16px",
        marginBottom:
          "30px",
      }}
    >
      {[
        {
          title:
            "Total Centers",
          value:
            stats.centers,
        },
        {
          title:
            "Total Warranties",
          value:
            stats.warranties,
        },
        {
          title:
            "Active Warranties",
          value:
            stats.active,
        },
        {
          title:
            "Expired Warranties",
          value:
            stats.expired,
        },
      ].map(
        (
          card
        ) => (
          <div
            key={
              card.title
            }
            style={{
              background:
                "#1b1b1b",
              border:
                "1px solid #2c2c2c",
              borderRadius:
                "20px",
              padding:
                "24px",
            }}
          >
            <p
              style={{
                color:
                  "#888",
              }}
            >
              {
                card.title
              }
            </p>

            <h2
              style={{
                color:
                  "#fff",
                fontSize:
                  "36px",
              }}
            >
              {
                card.value
              }
            </h2>
          </div>
        )
      )}
    </div>
  );
}

