import React from "react";
import styles from "./Avatar.module.css";
import { cn } from "@/lib/utils";

const IMAGE_SIZE = 48;

export function Avatar({
  otherStyles,
  name,
}: {
  otherStyles: string;
  name: string;
}) {
  return (
    <div className={styles.avatar} data-tooltip={name}>
      <img
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(
          Math.random() * 30
        )}.png`}
        alt={name}
        height={IMAGE_SIZE}
        width={IMAGE_SIZE}
        className={cn(styles.avatar_picture, "h-9 w-9", otherStyles)}
      />
    </div>
  );
}
