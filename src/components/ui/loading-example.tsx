import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ComparisonLoadingOverlay } from "@/components/comparison/ComparisonLoadingOverlay";

export function LoadingExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  
  const handleStartLoading = () => {
    setIsLoading(true);
    // Automatically stop after 3 seconds
    setTimeout(() => setIsLoading(false), 3000);
  };
  
  const handleShowOverlay = () => {
    setShowOverlay(true);
    // Automatically hide after 3 seconds
    setTimeout(() => setShowOverlay(false), 3000);
  };
  
  return (
    <>
      {/* Full-page overlay example */}
      <ComparisonLoadingOverlay 
        isVisible={showOverlay}
        message="Preparing your plan"
        submessage="Setting up your comparison and analyzing your databases..."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* In-component spinner example */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Spinner Example</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            {isLoading ? (
              <LoadingSpinner 
                message="Processing data"
                submessage="Please wait while we analyze your request..."
                progressValue={66}
              />
            ) : (
              <p className="text-center text-muted-foreground">
                Click the button below to see the loading spinner in action
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleStartLoading} disabled={isLoading}>
              {isLoading ? "Loading..." : "Start Loading"}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Overlay example card */}
        <Card>
          <CardHeader>
            <CardTitle>Full Page Overlay Example</CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Click the button below to see the full-page loading overlay in action
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleShowOverlay} disabled={showOverlay} variant="secondary">
              {showOverlay ? "Loading..." : "Show Overlay"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
} 