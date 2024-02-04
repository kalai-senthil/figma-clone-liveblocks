import React, { useRef } from "react";
import Dimensions from "./settings/Dimensions";
import Text from "./settings/Text";
import Color from "./settings/Color";
import Export from "./settings/Export";
import { RightSidebarProps } from "../../types/type";
import { modifyShape } from "../../lib/shapes";

const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  fabricRef,
  activeObjectRef,
  isEditingRef,
  syncShapeInStorage,
}: RightSidebarProps) => {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);
  const handleInputChange = (pro: string, value: string) => {
    if (!isEditingRef.current) {
      isEditingRef.current = true;
      setElementAttributes((prev) => ({
        ...prev,
        [pro]: value,
      }));
    }
    modifyShape({
      canvas: fabricRef.current as fabric.Canvas,
      activeObjectRef,
      syncShapeInStorage,
      property: pro,
      value,
    });
  };
  return (
    <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-w-[227px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20">
      <h3 className="px-5 pt-4 text-xs uppercase">Design</h3>
      <span className="text-sm pb-4 px-5 border-b border-primary-grey-200 mt-4 text-primary-grey-300">
        Make your desired chnages
      </span>
      <Dimensions
        isEditingRef={isEditingRef}
        width={elementAttributes.width}
        height={elementAttributes.height}
        handleInputChange={handleInputChange}
      />
      <Text {...elementAttributes} handleInputChange={handleInputChange} />
      <Color
        inputRef={colorInputRef}
        attribute={elementAttributes.fill}
        placeholder="Color"
        attributeType="fill"
        handleInputChange={handleInputChange}
      />
      <Color
        placeholder="Stroke"
        inputRef={strokeInputRef}
        attribute={elementAttributes.stroke}
        attributeType="stroke"
        handleInputChange={handleInputChange}
      />
      <Export />
    </section>
  );
};

export default RightSidebar;
