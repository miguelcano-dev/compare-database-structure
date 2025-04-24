export interface Connection {
  id?: string;
  name: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  status?: 'pending' | 'connected' | 'error';
  error?: string;
}