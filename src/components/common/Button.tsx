import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { getTextSizeStyle, TextSize } from "../../constants/Constants";

type ButtonVariant = "primary" | "success" | "danger" | "secondary" | "arrow";
type IconPosition = "left" | "right";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: TextSize;
  children: React.ReactNode;
  className?: string;
  icon?: IconDefinition;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  icon,
  iconPosition = "left",
  fullWidth = false,
  ...props
}) => {
  const baseStyles =
    "font-normal rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:hover:bg-blue-500",
    success:
      "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 disabled:hover:bg-green-500",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:hover:bg-red-500",
    secondary:
      "bg-gray-50 text-black hover:bg-gray-400 focus:ring-gray-500 disabled:hover:bg-gray-300",
    arrow: "text-primary hover:text-white transition-colors",
  };

  const sizeStyle = getTextSizeStyle(size);

  const iconSpacing = iconPosition === "left" ? "mr-2" : "ml-2";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizeStyle} ${widthClass} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <FontAwesomeIcon icon={icon} className={iconSpacing} />
      )}
      {children}
      {icon && iconPosition === "right" && (
        <FontAwesomeIcon icon={icon} className={iconSpacing} />
      )}
    </button>
  );
};
export default Button;
