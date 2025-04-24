import { useState, useCallback, useEffect } from 'react';
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
  const [connectionsChanged, setConnectionsChanged] = useState(false);

  // Check if any selected connection no longer exists
  useEffect(() => {
    const connectionIds = connections.map(c => c.id);
    const sourceExists = sourceId ? connectionIds.includes(sourceId) : false;
    const allTargetsExist = targetIds.every(id => connectionIds.includes(id));
    
    // If any selected connection has been removed, reset the selections
    if ((sourceId && !sourceExists) || (targetIds.length > 0 && !allTargetsExist)) {
      setSourceId('');
      setTargetIds([]);
      setConnectionsChanged(true);
    } else {
      setConnectionsChanged(false);
    }
  }, [connections, sourceId, targetIds]);

  const handleCompare = useCallback(() => {
    if (sourceId && targetIds.length > 0) {
      onCompare(sourceId, targetIds);
    }
  }, [sourceId, targetIds, onCompare]);

  const handleSourceChange = (id: string) => {
    setSourceId(id);
    // Remove source from targets if it was selected there
    setTargetIds(prev => prev.filter(targetId => targetId !== id));
    setConnectionsChanged(true);
  };

  const handleTargetsChange = (ids: string[]) => {
    // Filter out the source connection if it's in the targets
    setTargetIds(ids.filter(id => id !== sourceId));
    setConnectionsChanged(true);
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
        ) : connectionsChanged && !isComparing ? (
          <Alert className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              Your selection has changed. Please click "Compare Structures" to update the results.
            </AlertDescription>
          </Alert>
        ) : null}
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Source Database (Base)</h3>
              <ConnectionSelector
                connections={connections}
                selectedId={sourceId}
                onChange={handleSourceChange}
                exclude={targetIds}
                disabled={isComparing}
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Target Databases</h3>
              <TargetConnectionSelector
                connections={connections}
                selectedIds={targetIds}
                onChange={handleTargetsChange}
                exclude={sourceId ? [sourceId] : []}
                disabled={isComparing}
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
      </CardContent>
    </Card>
  );
}