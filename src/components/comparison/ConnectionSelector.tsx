import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Connection } from '@/types/connection';

interface ConnectionSelectorProps {
  connections: Connection[];
  selectedId: string;
  onChange: (id: string) => void;
  exclude?: string[];
}

export function ConnectionSelector({
  connections,
  selectedId,
  onChange,
  exclude = [],
}: ConnectionSelectorProps) {
  // Filter out excluded connections
  const availableConnections = connections.filter(
    (conn) => !exclude.includes(conn.id || '')
  );

  return (
    <Select value={selectedId} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a database connection" />
      </SelectTrigger>
      <SelectContent>
        {availableConnections.map((connection) => (
          <SelectItem key={connection.id} value={connection.id || ''}>
            {connection.name} ({connection.host}:{connection.port}/{connection.database})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}