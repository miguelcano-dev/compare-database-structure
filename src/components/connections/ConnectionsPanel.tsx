import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionForm } from '@/components/connections/ConnectionForm';
import { ConnectionsList } from '@/components/connections/ConnectionsList';
import { Connection } from '@/types/connection';
import { Button } from '@/components/ui/button';
import { Plus as PlusIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ConnectionsPanelProps {
  connections: Connection[];
  onAddConnection: (connection: Connection) => void;
  onRemoveConnection: (id: string) => void;
}

export function ConnectionsPanel({
  connections,
  onAddConnection,
  onRemoveConnection,
}: ConnectionsPanelProps) {
  const [open, setOpen] = useState(false);

  const handleAddConnection = (connection: Connection) => {
    onAddConnection(connection);
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Database Connections</CardTitle>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Database Connection</SheetTitle>
              <SheetDescription>
                Add a new MariaDB connection for comparison. Connections are temporary and not saved after closing the app.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <ConnectionForm onSubmit={handleAddConnection} />
            </div>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No connections added yet.</p>
            <p className="text-sm mt-2">
              Click "Add Connection" to add a database for comparison.
            </p>
          </div>
        ) : (
          <ConnectionsList
            connections={connections}
            onRemove={onRemoveConnection}
          />
        )}
      </CardContent>
    </Card>
  );
}