"use client";
import { useCallback, useEffect, useState } from "react";
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "../../liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import CursorChat from "./cursor/CursorChat";
import {
  CursorMode,
  CursorState,
  Reaction,
  ReactionEvent,
} from "../../types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "../../hooks/useInterval";
import { Comments } from "./comments/Comments";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { shortcuts } from "../../constants";
type Props = {
  undo: () => void;
  redo: () => void;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
};
const Live = ({ canvasRef, undo, redo }: Props) => {
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const broadcast = useBroadcastEvent();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  useInterval(() => {
    setReactions((reactions) =>
      reactions.filter((r) => r.timestamp > Date.now() - 4000)
    );
  }, 1000);
  useInterval(() => {
    if (
      cursor &&
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed
    ) {
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { ...cursor },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);
  useEventListener((eD) => {
    const event = eD.event as ReactionEvent;
    setReactions((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? {
              ...state,
              isPressed: true,
            }
          : state
      );
    },
    [cursorState.mode]
  );
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.x;
      const y = event.clientY - rect.y;
      updateMyPresence({
        cursor: {
          x,
          y,
        },
      });
    }
  }, []);
  const handlePointerLeave = useCallback(() => {
    updateMyPresence({
      cursor: null,
      message: null,
    });
    setCursorState({ mode: CursorMode.Hidden });
  }, []);
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.x;
      const y = event.clientY - rect.y;
      updateMyPresence({
        cursor: {
          x,
          y,
        },
      });
    },
    [cursorState.mode]
  );
  // setCursorState((state: CursorState) =>
  //   cursorState.mode === CursorMode.Reaction
  //     ? {
  //         ...state,
  //         isPressed: true,
  //       }
  //     : state
  // );
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (cursorState.mode !== CursorMode.Hidden) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (key === "escape") {
        updateMyPresence({ message: "" });
        setCursorState({
          mode: CursorMode.Hidden,
        });
      } else if (key === "e") {
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);
  const SetReactions = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);
  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case "Chat":
        setCursorState({
          mode: CursorMode.Chat,
          message: "",
          previousMessage: null,
        });
        break;
      case "Reactions":
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
        break;
      case "Undo":
        undo();
        break;
      case "Redo":
        redo();
        break;

      default:
        break;
    }
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          id="canvas"
          className="h-full w-full flex flex-1 justify-center items-center"
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
        >
          <canvas ref={canvasRef} />
          {reactions.map((reaction) => (
            <FlyingReaction
              key={reaction.timestamp.toString()}
              x={reaction.point.x}
              y={reaction.point.y}
              {...reaction}
            />
          ))}
          {cursor && (
            <CursorChat
              cursor={cursor}
              setCursorState={setCursorState}
              updateMyPresence={updateMyPresence}
              cursorState={cursorState}
            />
          )}
          {cursorState.mode === CursorMode.ReactionSelector && (
            <ReactionSelector
              setReaction={(reaction) => {
                SetReactions(reaction);
              }}
            />
          )}
          <Comments />
          <LiveCursors />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="right-menu-content">
        {shortcuts.map((shortcut) => (
          <ContextMenuItem
            onClick={() => handleContextMenuClick(shortcut.name)}
            key={shortcut.key}
          >
            <p>{shortcut.name}</p>
            <p className="text-xs text-primary-grey-100">{shortcut.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;
