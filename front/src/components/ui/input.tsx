import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "primary" | "secondary";
}

const Input: React.FC<InputProps> = ({ variant = "default", ...props }) => {
  let className = "input";
  if (variant === "primary") className += " input-primary";
  if (variant === "secondary") className += " input-secondary";

  return <input className={className} {...props} />;
};

export { Input };
export default Input;
