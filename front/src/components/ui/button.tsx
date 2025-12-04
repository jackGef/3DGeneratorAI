import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({ variant = "default", children, ...props }) => {
  let className = "btn";
  if (variant === "primary") className += " btn-primary";
  if (variant === "secondary") className += " btn-secondary";

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export { Button };
export default Button;
