"use client";
import React, { useMemo } from "react";
import { useOthers, useSelf } from "../../../liveblocks.config";
import { Avatar } from "./Avatar";
import styles from "./index.module.css";
import { generateRandomName } from "../../../lib/utils";
const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;
  const momomizedUsers = useMemo(
    () => (
      <div className="flex items-center justify-center py-2 gap-1">
        {currentUser && (
          <Avatar name="You" otherStyles="border-[3px] border-primary-green" />
        )}
        <div className="flex pl-3">
          {users.slice(0, 3).map(({ connectionId }) => {
            return (
              <Avatar
                key={connectionId}
                otherStyles="-ml-3"
                name={generateRandomName()}
              />
            );
          })}

          {hasMoreUsers && (
            <div className={styles.more}>+{users.length - 3}</div>
          )}
        </div>
      </div>
    ),
    [users.length]
  );
  return momomizedUsers;
};

export default ActiveUsers;
