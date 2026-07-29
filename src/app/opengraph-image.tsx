import { ImageResponse } from "next/og";

export const alt = "NOW Esport";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#050505,#4f1231)", color: "white", fontSize: 104, fontWeight: 900, letterSpacing: "-5px" }}>
      NOW ESPORT
    </div>,
    size,
  );
}
