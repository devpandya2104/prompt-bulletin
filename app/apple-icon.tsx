import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111114",
          borderRadius: 40,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 5L17.9 11.4L24.5 13.5L17.9 15.6L16 22L14.1 15.6L7.5 13.5L14.1 11.4Z" fill="#e8813a"/>
          <path d="M25 8L25.75 10.1L27.75 10.85L25.75 11.6L25 13.7L24.25 11.6L22.25 10.85L24.25 10.1Z" fill="#e8813a" opacity="0.52"/>
          <path d="M7 18.5L7.6 20.4L9.5 21L7.6 21.6L7 23.5L6.4 21.6L4.5 21L6.4 20.4Z" fill="#e8813a" opacity="0.52"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
