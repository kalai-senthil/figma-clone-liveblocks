import React from "react";
import CursorSVG from "../../../public/assets/CursorSVG";
import CursorChat from "./CursorChat";
import { cn } from "@/lib/utils";
type Props = {
  color: string;
  x: number;
  y: number;
  message: string | null;
};
const Cursor = ({ color, x, y, message }: Props) => {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0"
      style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
    >
      <CursorSVG color={color} />
      {message && (
        <div
          className={cn("absolute left-2 top-5 rounded-3xl px-4 py-2")}
          style={{ backgroundColor: color }}
        >
          <p className="whitespace-nowrap text-sm text-white leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default Cursor;
