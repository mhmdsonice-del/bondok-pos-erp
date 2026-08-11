import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "touch";
}

const variantClasses = { primary: "bg-gradient-to-b from-flame-400 to-flame-600 text-char-950 font-bold", secondary: "bg-char-800 text-sesame-50 border border-char-800", ghost: "bg-transparent text-sesame-50 hover:bg-char-900", danger: "bg-chili-500 text-sesame-50" };
const sizeClasses = { sm: "px-3 py-1.5 text-sm rounded-lg", md: "px-4 py-2.5 text-base rounded-lg", lg: "px-6 py-3.5 text-lg rounded-xl", touch: "px-6 py-5 text-lg rounded-card min-h-[64px]" };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "primary", size = "md", className, ...props }, ref) => <button ref={ref} className={clsx("font-body font-semibold transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none", variantClasses[variant], sizeClasses[size], className)} {...props} />);
Button.displayName = "Button";
