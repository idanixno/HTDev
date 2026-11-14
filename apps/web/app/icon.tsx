import { ImageResponse } from "next/og";
import {
  DXCODE_MARK_BACKGROUND,
  DXCODE_MARK_COLORS,
  DXCODE_MARK_PATHS,
} from "../components/dxcode-mark-paths";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** DXCode interlocking mark favicon. */
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
          background: DXCODE_MARK_BACKGROUND,
          borderRadius: 16,
        }}
      >
        <svg width="52" height="52" viewBox="0 0 64 64">
          {DXCODE_MARK_PATHS.map((d, index) => (
            <path key={d} d={d} fill={DXCODE_MARK_COLORS[index]} />
          ))}
        </svg>
      </div>
    ),
    { ...size },
  );
}
