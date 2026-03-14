import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Marcelo B. Diani - Full Stack Developer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #050508 0%, #0a0a0f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "60px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: "80px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              textAlign: "center",
            }}
          >
            Marcelo B. Diani
          </h1>
          <p
            style={{
              fontSize: "36px",
              color: "#e4e4e7",
              margin: 0,
              textAlign: "center",
            }}
          >
            Full Stack Developer & Software Engineer
          </p>
          <div
            style={{
              display: "flex",
              gap: "30px",
              marginTop: "20px",
              fontSize: "24px",
              color: "#a1a1aa",
            }}
          >
            <span>React</span>
            <span>•</span>
            <span>Node.js</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>AWS</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
