import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitCompare as CompareIcon, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { Connection } from '@/types/connection';
import { ConnectionSelector } from '@/components/comparison/ConnectionSelector';
import { TargetConnectionSelector } from '@/components/comparison/TargetConnectionSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ComparisonPanelProps {
  connections: Connection[];
  onCompare: (sourceId: string, targetIds: string[]) => Promise<void>;
  isComparing: boolean;
}

export function ComparisonPanel({
  connections,
  onCompare,
  isComparing,
}: ComparisonPanelProps) {
  const [sourceId, setSourceId] = useState<string>('');
  const [targetIds, setTargetIds] = useState<string[]>([]);

  const handleCompare = useCallback(() => {
    if (sourceId && targetIds.length > 0) {
      onCompare(sourceId, targetIds);
    }
  }, [sourceId, targetIds, onCompare]);

  const handleSourceChange = (id: string) => {
    setSourceId(id);
    // Remove source from targets if it was selected there
    setTargetIds(prev => prev.filter(targetId => targetId !== id));
  };

  const handleTargetsChange = (ids: string[]) => {
    // Filter out the source connection if it's in the targets
    setTargetIds(ids.filter(id => id !== sourceId));
  };

  const insufficientConnections = connections.length < 2;
  const invalidSelection = !sourceId || targetIds.length === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Compare Databases</CardTitle>
        <Button
          onClick={handleCompare}
          disabled={insufficientConnections || invalidSelection || isComparing}
        >
          <CompareIcon className="h-4 w-4 mr-2" />
          {isComparing ? 'Comparing...' : 'Compare Structures'}
        </Button>
      </CardHeader>
      <CardContent>
        {insufficientConnections ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              You need at least 2 database connections to perform a comparison.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Source Database (Base)</h3>
                <ConnectionSelector
                  connections={connections}
                  selectedId={sourceId}
                  onChange={handleSourceChange}
                  exclude={targetIds}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Target Databases</h3>
                <TargetConnectionSelector
                  connections={connections}
                  selectedIds={targetIds}
                  onChange={handleTargetsChange}
                  exclude={sourceId ? [sourceId] : []}
                />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>
                The source database will be compared against all selected target databases.
                Differences in tables, columns, and indexes will be highlighted.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}