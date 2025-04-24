import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error";
  size?: "default" | "sm" | "lg";
  message?: string;
  submessage?: string;
  showProgress?: boolean;
  progressValue?: number;
}

export function LoadingSpinner({
  variant = "default",
  size = "default",
  message = "Loading...",
  submessage,
  showProgress = true,
  progressValue = 33,
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 text-center",
        className
      )}
      {...props}
    >
      <div className="relative">
        {/* Circular track */}
        <div
          className={cn(
            "rounded-full border-4 border-primary/20",
            size === "sm" ? "h-12 w-12" : size === "lg" ? "h-24 w-24" : "h-16 w-16"
          )}
        />
        
        {/* Spinning progress indicator */}
        <div
          className={cn(
            "absolute top-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin",
            size === "sm" ? "h-12 w-12" : size === "lg" ? "h-24 w-24" : "h-16 w-16"
          )}
        />
        
        {/* Center icon/indicator */}
        <div className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
        )}>
          <div className={cn(
            "flex items-center justify-center",
            size === "sm" ? "h-6 w-6" : size === "lg" ? "h-12 w-12" : "h-8 w-8",
            variant === "default" ? "bg-primary" : 
            variant === "success" ? "bg-green-500" : 
            variant === "error" ? "bg-destructive" : "bg-primary",
            "rounded-full text-primary-foreground"
          )}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={cn(
                size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4"
              )} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="10" y="2" width="4" height="10"/>
              <rect x="2" y="14" width="4" height="8"/>
              <rect x="18" y="16" width="4" height="6"/>
            </svg>
          </div>
        </div>
      </div>
      
      {message && (
        <h3 className={cn(
          "font-medium",
          size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl"
        )}>
          {message}
        </h3>
      )}
      
      {submessage && (
        <p className={cn(
          "text-muted-foreground",
          size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
        )}>
          {submessage}
        </p>
      )}
      
      {showProgress && (
        <div className="w-full max-w-xs">
          <Progress value={progressValue} className="h-2" />
        </div>
      )}
    </div>
  );
} 