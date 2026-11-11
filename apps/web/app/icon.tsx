import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** DXCode portal mark favicon — hexagonal chevron. */
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
          background: "#0b1222",
          borderRadius: 16,
        }}
      >
        <svg width="44" height="44" viewBox="0 0 64 64">
          <path
            d="M32 12.5 46.5 20.8v16.4L32 45.5 17.5 37.2V20.8Z"
            fill="#7a8aa3"
          />
          <path
            d="M32 16.2 43.2 22.6v12.8L32 41.8 20.8 35.4V22.6Z"
            fill="#121a2c"
          />
          <path
            d="M28.2 24.8 35.6 32 28.2 39.2"
            fill="none"
            stroke="#29d8ff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
