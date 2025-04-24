import { useState } from 'react';
import { Connection } from '@/types/connection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database as DatabaseIcon, Trash as TrashIcon, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Edit as EditIcon, RefreshCw as RefreshCwIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ConnectionForm } from './ConnectionForm';
import { testConnection } from '@/services/api';
import { toast } from 'sonner';

interface ConnectionsListProps {
  connections: Connection[];
  onRemove: (id: string) => void;
}

export function ConnectionsList({ connections, onRemove }: ConnectionsListProps) {
  const [testingConnections, setTestingConnections] = useState<Record<string, boolean>>({});
  const [editingConnection, setEditingConnection] = useState<string | null>(null);
  
  // Prueba la conexión y actualiza el estado temporalmente en el UI
  const handleTestConnection = async (connection: Connection) => {
    try {
      // Verificar si la contraseña está vacía
      if (!connection.password) {
        toast.error('Password is missing. Please edit the connection to add it.');
        return;
      }
      
      // Marcar la conexión como en proceso de prueba
      setTestingConnections(prev => ({ ...prev, [connection.id || '']: true }));
      
      // Probar la conexión
      const result = await testConnection({
        name: connection.name,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        user: connection.user,
        password: connection.password,
      });
      
      if (result.success) {
        toast.success('Connection successful!');
        // Actualizamos el estado en el UI temporalmente
        connection.status = 'connected';
      } else {
        toast.error(`Connection failed: ${result.error}`);
        // Actualizamos el estado en el UI temporalmente
        connection.status = 'error';
        connection.error = result.error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Connection test failed: ${errorMessage}`);
      // Actualizamos el estado en el UI temporalmente
      connection.status = 'error';
      connection.error = errorMessage;
    } finally {
      // Desmarcar la conexión como en proceso de prueba
      setTestingConnections(prev => ({ ...prev, [connection.id || '']: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {connections.map((connection) => (
        <div
          key={connection.id}
          className="bg-card flex flex-col rounded-md border border-border p-4 transition-all hover:shadow-md"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <DatabaseIcon className="h-5 w-5 text-primary flex-shrink-0" />
              <h3 className="font-medium truncate">{connection.name}</h3>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-shrink-0">
                      {connection.status === 'connected' ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
                          <CheckCircleIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          Connected
                        </Badge>
                      ) : connection.status === 'error' ? (
                        <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 whitespace-nowrap">
                          <XCircleIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                          Error
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          Status unknown
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {connection.status === 'connected' 
                      ? 'Connection successful' 
                      : connection.status === 'error'
                      ? `Connection error: ${connection.error || 'Unknown error'}`
                      : 'Connection status pending or not tested'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              {/* Botón de test */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="bg-muted hover:bg-muted/80 p-2"
                      onClick={() => handleTestConnection(connection)}
                      disabled={testingConnections[connection.id || '']}
                    >
                      <RefreshCwIcon className={`h-4 w-4 ${testingConnections[connection.id || ''] ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Test Connection
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Botón de editar */}
              <Sheet open={editingConnection === connection.id} onOpenChange={(open) => setEditingConnection(open ? connection.id || null : null)}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SheetTrigger asChild>
                        <Button variant="ghost" className="bg-muted hover:bg-muted/80 p-2">
                          <EditIcon className="h-4 w-4 text-primary" />
                        </Button>
                      </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      Edit Connection
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Connection</SheetTitle>
                    <SheetDescription>
                      Update the database connection details.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <ConnectionForm 
                      onSubmit={(updatedConn) => {
                        // Solo actualizamos en la interfaz sin cambios persistentes
                        connection.name = updatedConn.name;
                        connection.host = updatedConn.host;
                        connection.port = updatedConn.port;
                        connection.database = updatedConn.database;
                        connection.user = updatedConn.user;
                        connection.password = updatedConn.password;
                        setEditingConnection(null);
                        toast.success('Connection updated');
                      }}
                      initialData={connection}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Botón de eliminar */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="bg-muted hover:bg-muted/80 p-2">
                    <TrashIcon className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Connection</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove the connection to {connection.name}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemove(connection.id || '')}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="truncate">
                    {connection.host}:{connection.port}/{connection.database}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Host: {connection.host}</p>
                  <p>Port: {connection.port}</p>
                  <p>Database: {connection.database}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline">{connection.user}</Badge>
            {!connection.password && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 whitespace-nowrap">
                <XCircleIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                Password needed
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}