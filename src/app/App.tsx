"use client";
import LeftSidebar from "@/components/LeftSidebar";
import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import RightSidebar from "@/components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import {
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvaseMouseMove,
  handlePathCreated,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "../../lib/canvas";
import { ActiveElement } from "../../types/type";
import {
  useMutation,
  useRedo,
  useStorage,
  useUndo,
} from "../../liveblocks.config";
import { defaultNavElement } from "../../constants";
import { handleDelete, handleKeyDown } from "../../lib/key-events";
import { handleImageUpload } from "../../lib/shapes";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);
  const undo = useUndo();
  const redo = useRedo();
  const canvasObjects = useStorage((state) => state.canvasObjects);
  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;
    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });
  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
  }, []);
  const deleteAllShape = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");
    if (!canvasObjects || canvasObjects.size === 0) return true;
    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }
    return canvasObjects.size === 0;
  }, []);
  const [elementAttributes, setElementAttributes] = useState({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fontWeight: "",
    fill: "#eee",
    stroke: "#aabbcc",
  });
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const handleActiveElement = (ele: ActiveElement) => {
    setActiveElement(ele);
    switch (ele?.value) {
      case "reset":
        deleteAllShape();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;
      case "delete":
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;
      case "image":
        imageInputRef.current?.click();
        isDrawing.current = false;
        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        break;
      default:
        break;
    }
    selectedShapeRef.current = ele?.value as string;
  };
  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });
    canvas.on("mouse:down", (opts) => {
      handleCanvasMouseDown({
        options: opts,
        isDrawing,
        canvas,
        shapeRef,
        selectedShapeRef,
      });
    });
    canvas.on("mouse:move", (opts) => {
      handleCanvaseMouseMove({
        options: opts,
        canvas,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        isDrawing,
      });
    });
    canvas.on("mouse:up", (opts) => {
      handleCanvasMouseUp({
        canvas,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        isDrawing,
        setActiveElement,
        activeObjectRef,
      });
    });
    canvas.on("selection:created", (options) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });
    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({
        options,
        syncShapeInStorage,
      });
    });
    canvas.on("object:scaling", (options) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });
    canvas.on("path:created", (options) => {
      handlePathCreated({
        options,
        syncShapeInStorage,
      });
    });
    window.addEventListener("resize", () => {
      handleResize({ canvas });
    });
    window.addEventListener("keydown", (e: any) => {
      handleKeyDown({
        e,
        syncShapeInStorage,
        deleteShapeFromStorage,
        canvas,
        undo,
        redo,
      });
    });
    return () => {
      canvas.dispose();
    };
  }, []);
  useEffect(() => {
    renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
    return () => {};
  }, [canvasObjects]);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar
        handleImageUpload={(e) => {
          e.stopPropagation();
          handleImageUpload({
            file: e.target.files![0],
            canvas: fabricRef,
            shapeRef,
            syncShapeInStorage,
          });
        }}
        imageInputRef={imageInputRef}
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar allShapes={Array.from(canvasObjects)} />
        <Live redo={redo} undo={undo} canvasRef={canvasRef} />
        <RightSidebar
          activeObjectRef={activeObjectRef}
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}
