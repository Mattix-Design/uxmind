import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Evidence-based UX Research";
  const type = searchParams.get("type") || "Research";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          background: "linear-gradient(135deg, #0F0515 0%, #2D0A31 40%, #1A0A22 70%, #3D1242 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: Logo + type badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Logo circle */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E8513D, #F06B50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 700,
                color: "white",
              }}
            >
              U
            </div>
            <span style={{ fontSize: "28px", fontWeight: 700, color: "#F5F0F7" }}>
              UXMind.ai
            </span>
          </div>
          {/* Type badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "9999px",
              border: "1px solid rgba(240, 107, 80, 0.3)",
              backgroundColor: "rgba(232, 81, 61, 0.15)",
              padding: "8px 20px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#F06B50",
            }}
          >
            {type}
          </div>
        </div>

        {/* Center: Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? "42px" : "52px",
              fontWeight: 700,
              color: "#F5F0F7",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom: Tagline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "18px", color: "#7A6B84" }}>
            Still designing for humans
          </span>
          <span style={{ fontSize: "16px", color: "#7A6B84" }}>
            uxmind.ai
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
