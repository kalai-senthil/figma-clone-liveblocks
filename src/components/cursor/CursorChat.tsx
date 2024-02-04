import React from "react";
import { CursorChatProps, CursorMode } from "../../../types/type";
import CursorSVG from "../../../public/assets/CursorSVG";

const CursorChat = ({
  cursor,
  setCursorState,
  cursorState,
  updateMyPresence,
}: CursorChatProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: e.target.value });
    setCursorState({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: e.target.value,
    });
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCursorState({
        mode: CursorMode.Chat,
        previousMessage: cursorState.message,
        message: "",
      });
    } else if (e.key === "Escape") {
      setCursorState({ mode: CursorMode.Hidden });
    }
  };
  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translate(${cursor.x}px) translateY(${cursor.y}px)`,
      }}
    >
      {cursorState.mode === CursorMode.Chat && (
        <>
          <CursorSVG color="#000" />
          <div
            onKeyUp={(e) => e.stopPropagation()}
            className="absolute left-2 top-5 bg-blue-500 px-4 py-4 leading-relaxed text-white text-sm rounded-full"
          >
            {cursorState.previousMessage && (
              <>
                <div>{cursorState.previousMessage}</div>
              </>
            )}
            <input
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={"Type a message..."}
              value={cursorState.message}
              maxLength={50}
              type="text"
              className="z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none"
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CursorChat;
