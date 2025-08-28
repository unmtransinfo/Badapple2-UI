type TextSize = "sm" | "md" | "lg";

const SIZES = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-large",
  };

const getTextSizeStyle = (size: TextSize) => {
    return SIZES[size];
}

export {getTextSizeStyle};
export type {TextSize};
