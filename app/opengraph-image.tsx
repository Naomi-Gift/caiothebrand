import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Caio Pizza — chef-driven Nigerian–Italian fusion pizza";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link-preview image for WhatsApp, Instagram, X, etc. */
export default async function OpengraphImage() {
  const [logo, pizza] = await Promise.all([
    readFile(join(process.cwd(), "public/images/logo-lockup-reversed.png")),
    readFile(join(process.cwd(), "public/images/hero-pizza.jpg")),
  ]);
  const logoUri = `data:image/png;base64,${logo.toString("base64")}`;
  const pizzaUri = `data:image/jpeg;base64,${pizza.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
          background: "linear-gradient(135deg, #1a0e08 0%, #3a2418 100%)",
          color: "#f8f3e9",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
          <img src={logoUri} width={260} height={192} alt="" style={{ objectFit: "contain" }} />
          <div style={{ marginTop: 36, fontSize: 60, fontWeight: 700, lineHeight: 1.05 }}>
            Made to delight your taste buds.
          </div>
          <div style={{ marginTop: 22, fontSize: 28, color: "#d4c4a8" }}>
            Nigerian–Italian fusion pizza · Order online
          </div>
        </div>
        <img
          src={pizzaUri}
          width={420}
          height={420}
          alt=""
          style={{ borderRadius: 9999, objectFit: "cover", border: "8px solid rgba(235,226,207,0.2)" }}
        />
      </div>
    ),
    { ...size }
  );
}
