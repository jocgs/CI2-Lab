import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5b21b6 0%, #16a34a 100%)",
          borderRadius: 96,
          fontSize: 240,
          fontWeight: 800,
          color: "white",
          letterSpacing: -10,
        }}
      >
        T
      </div>
    ),
    size,
  );
}

