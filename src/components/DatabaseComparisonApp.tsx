import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ConnectionsPanel } from '@/components/connections/ConnectionsPanel';
import { ComparisonPanel } from '@/components/comparison/ComparisonPanel';
import { ResultsPanel } from '@/components/results/ResultsPanel';
import { Connection } from '@/types/connection';
import { ComparisonResult } from '@/types/comparison';
import { Database as DatabaseIcon, Github as GithubIcon } from 'lucide-react';
import { compareConnections } from '@/services/api';
import { toast } from 'sonner';
import { ComparisonLoadingOverlay } from '@/components/comparison/ComparisonLoadingOverlay';

// Key para almacenar las conexiones en localStorage
const STORAGE_KEY = 'db-comparator-connections';
const RESULTS_KEY = 'db-comparator-results';
const PASSWORD_KEY = 'db-comparator-passwords';

export default function DatabaseComparisonApp() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Cargar conexiones guardadas al iniciar
  useEffect(() => {
    try {
      // Cargar conexiones
      const savedConnectionsStr = localStorage.getItem(STORAGE_KEY);
      if (savedConnectionsStr) {
        const parsedConnections = JSON.parse(savedConnectionsStr) as Connection[];
        
        // Cargar contraseñas desde sessionStorage si existen
        const savedPasswordsStr = sessionStorage.getItem(PASSWORD_KEY);
        const savedPasswords = savedPasswordsStr ? JSON.parse(savedPasswordsStr) : {};
        
        // Restaurar contraseñas si están disponibles
        const connectionsWithPasswords = parsedConnections.map(conn => ({
          ...conn,
          password: savedPasswords[conn.id || ''] || ''
        }));
        
        setConnections(connectionsWithPasswords);
      }

      // También cargar resultados de comparación si existen
      const savedResultsStr = sessionStorage.getItem(RESULTS_KEY);
      if (savedResultsStr) {
        try {
          const parsedResults = JSON.parse(savedResultsStr) as ComparisonResult;
          setResults(parsedResults);
        } catch (e) {
          console.error('Error parsing saved results:', e);
          // Si hay error en el parseo, eliminar los resultados guardados
          sessionStorage.removeItem(RESULTS_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Guardar conexiones cuando cambien
  useEffect(() => {
    if (connections.length > 0) {
      try {
        // Guardar conexiones en localStorage sin contraseñas
        const connectionsToSave = connections.map(conn => ({
          ...conn,
          password: '' // No almacenar contraseñas en localStorage
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(connectionsToSave));
        
        // Guardar contraseñas en sessionStorage
        const passwords: Record<string, string> = {};
        connections.forEach(conn => {
          if (conn.id && conn.password) {
            passwords[conn.id] = conn.password;
          }
        });
        sessionStorage.setItem(PASSWORD_KEY, JSON.stringify(passwords));
      } catch (error) {
        console.error('Error saving connections:', error);
      }
    }
  }, [connections]);

  const addConnection = (connection: Connection) => {
    // Clear results when connections are modified
    clearResults();
    setConnections((prev) => [...prev, { ...connection, id: crypto.randomUUID() }]);
  };

  const removeConnection = (id: string) => {
    // Clear results when connections are modified
    clearResults();
    setConnections((prev) => {
      const updated = prev.filter(conn => conn.id !== id);
      // Si no quedan conexiones, borrar del localStorage
      if (updated.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(PASSWORD_KEY);
      } else {
        // Eliminar la contraseña específica del sessionStorage
        try {
          const savedPasswordsStr = sessionStorage.getItem(PASSWORD_KEY);
          if (savedPasswordsStr) {
            const savedPasswords = JSON.parse(savedPasswordsStr);
            if (savedPasswords[id]) {
              delete savedPasswords[id];
              sessionStorage.setItem(PASSWORD_KEY, JSON.stringify(savedPasswords));
            }
          }
        } catch (error) {
          console.error('Error removing password from session storage:', error);
        }
      }
      return updated;
    });
  };

  const clearResults = () => {
    setResults(null);
    sessionStorage.removeItem(RESULTS_KEY);
  };

  const runComparison = async (sourceId: string, targetIds: string[]) => {
    try {
      // Clear previous results when starting a new comparison
      clearResults();
      setIsComparing(true);
      
      const source = connections.find(c => c.id === sourceId);
      const targets = connections.filter(c => c.id && targetIds.includes(c.id));
      
      if (!source || targets.length === 0) {
        throw new Error("Please select source and target connections");
      }
      
      // Realizar la comparación real - poner un pequeño retraso para asegurar
      // que se vea el proceso de comparación incluso si hay datos mock
      setTimeout(async () => {
        try {
          const result = await compareConnections(source, targets);
          setResults(result);
          
          // Guardar los resultados en sessionStorage para persistir durante la sesión
          sessionStorage.setItem(RESULTS_KEY, JSON.stringify(result));
          
          toast.success("Comparison completed");
        } catch (error) {
          console.error("Error comparing databases:", error);
          toast.error(error instanceof Error ? error.message : "Failed to compare databases");
          setResults(null);
        } finally {
          setIsComparing(false);
        }
      }, 1500); // Retraso para simular el proceso de comparación
      
    } catch (error) {
      console.error("Error comparing databases:", error);
      toast.error(error instanceof Error ? error.message : "Failed to compare databases");
      setResults(null);
      setIsComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Loading overlay */}
      <ComparisonLoadingOverlay 
        isVisible={isComparing} 
        message="Preparing your plan"
        submessage="Setting up your comparison and analyzing your databases..."
      />
      
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DatabaseIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">DB Structure Comparator</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-md hover:bg-muted transition-colors"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 flex-1 flex flex-col gap-8">
        <ConnectionsPanel 
          connections={connections} 
          onAddConnection={addConnection} 
          onRemoveConnection={removeConnection} 
        />
        
        <ComparisonPanel 
          connections={connections} 
          onCompare={runComparison} 
          isComparing={isComparing}
        />
        
        {results && (
          <ResultsPanel results={results} />
        )}
      </main>
      
      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>Database Structure Comparator - Read-only, secure comparison tool</p>
        </div>
      </footer>
    </div>
  );
}