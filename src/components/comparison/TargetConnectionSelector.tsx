import { Connection } from '@/types/connection';
import { Check as CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TargetConnectionSelectorProps {
  connections: Connection[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  exclude?: string[];
}

export function TargetConnectionSelector({
  connections,
  selectedIds,
  onChange,
  exclude = [],
}: TargetConnectionSelectorProps) {
  // Filter out excluded connections
  const availableConnections = connections.filter(
    (conn) => !exclude.includes(conn.id || '')
  );

  const toggleConnection = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {availableConnections.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm">
          No connections available
        </div>
      ) : (
        <ScrollArea className="h-[200px]">
          <div className="p-1">
            {availableConnections.map((connection) => (
              <div
                key={connection.id}
                className={cn(
                  "flex items-center justify-between p-2 cursor-pointer rounded-sm transition-colors mb-1",
                  selectedIds.includes(connection.id || '')
                    ? "bg-primary/10 hover:bg-primary/20"
                    : "hover:bg-muted"
                )}
                onClick={() => toggleConnection(connection.id || '')}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{connection.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {connection.host}:{connection.port}/{connection.database}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{connection.user}</Badge>
                  {selectedIds.includes(connection.id || '') && (
                    <CheckIcon className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}