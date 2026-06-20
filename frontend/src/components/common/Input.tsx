import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, icon, iconPosition = "left", className, disabled, ...props },
    ref
  ) => {
    const baseStyles =
      "w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";

    const stateStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:focus:ring-red-500/20"
      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-700 dark:focus:border-primary-400 dark:focus:ring-primary-400/20";

    const disabledStyles =
      "cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-800";

    const paddingStyles = icon
      ? iconPosition === "left"
        ? "pl-10"
        : "pr-10"
      : "";

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              baseStyles,
              stateStyles,
              disabled && disabledStyles,
              paddingStyles,
              className
            )}
            disabled={disabled}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;   