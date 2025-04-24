import * as React from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface ComparisonLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  submessage?: string;
  className?: string;
}

export function ComparisonLoadingOverlay({
  isVisible,
  message = "Preparing your plan",
  submessage = "Setting up your comparison and analyzing your databases...",
  className,
}: ComparisonLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
      className
    )}>
      <div className="bg-background rounded-lg p-8 shadow-lg max-w-md w-full">
        <LoadingSpinner 
          size="lg"
          message={message}
          submessage={submessage}
          progressValue={33}
        />
      </div>
    </div>
  );
} 