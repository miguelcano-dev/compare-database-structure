import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Connection } from '@/types/connection';
import { Eye as EyeIcon, EyeOff as EyeOffIcon, Database as DatabaseIcon, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { testConnection } from '@/services/api';

const connectionSchema = z.object({
  name: z.string().min(1, 'Connection name is required'),
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().min(1).max(65535),
  database: z.string().min(1, 'Database name is required'),
  user: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

interface ConnectionFormProps {
  onSubmit: (data: Connection) => void;
  initialData?: Partial<Connection>;
}

export function ConnectionForm({ onSubmit, initialData }: ConnectionFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'connected' | 'error'>();
  const [connectionError, setConnectionError] = useState<string>();

  const form = useForm<z.infer<typeof connectionSchema>>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: initialData?.name || '',
      host: initialData?.host || 'localhost',
      port: initialData?.port || 3306,
      database: initialData?.database || '',
      user: initialData?.user || 'root',
      password: initialData?.password || '',
    },
  });

  async function handleTestConnection() {
    try {
      const formData = form.getValues();
      setIsTestingConnection(true);
      setConnectionStatus('pending');
      setConnectionError(undefined);

      const result = await testConnection(formData);
      
      if (result.success) {
        setConnectionStatus('connected');
        toast.success('Connection successful!');
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error);
        toast.error(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setConnectionError(errorMessage);
      toast.error(`Connection test failed: ${errorMessage}`);
    } finally {
      setIsTestingConnection(false);
    }
  }

  function handleSubmit(data: z.infer<typeof connectionSchema>) {
    onSubmit({
      ...data,
      status: connectionStatus,
      error: connectionError
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection Name</FormLabel>
              <FormControl>
                <Input placeholder="Production DB" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for this connection
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host</FormLabel>
                <FormControl>
                  <Input placeholder="localhost" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="database"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database</FormLabel>
              <FormControl>
                <Input placeholder="mydatabase" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="root" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={handleTestConnection}
            disabled={isTestingConnection}
          >
            {isTestingConnection ? (
              <>Testing...</>
            ) : connectionStatus === 'connected' ? (
              <><CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" /> Connection OK</>
            ) : connectionStatus === 'error' ? (
              <><XCircleIcon className="h-4 w-4 mr-2 text-red-500" /> Connection Failed</>
            ) : (
              <><DatabaseIcon className="h-4 w-4 mr-2" /> Test Connection</>
            )}
          </Button>
          <Button type="submit" className="flex-1">
            Add Connection
          </Button>
        </div>
      </form>
    </Form>
  );
}