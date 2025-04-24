import { Connection } from '@/types/connection';
import { ComparisonResult } from '@/types/comparison';

// Backend API URL - in a real application, this would be an environment variable
const API_URL = 'http://localhost:3000';

/**
 * Encrypt sensitive data before sending to the server
 * This is a simple base64 encoding for demonstration purposes
 * In a real application, use a proper encryption library
 */
function encryptSensitiveData<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data } as T & { password?: string };
  
  if (typeof result.password === 'string') {
    // Simple Base64 encoding - not secure for production
    result.password = btoa(result.password);
  }
  
  return result as T;
}

/**
 * Test database connection
 */
export async function testConnection(
  connection: Omit<Connection, 'id' | 'status' | 'error'>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Encrypt sensitive data
    const encryptedConnection = encryptSensitiveData(connection);
    
    const response = await fetch(`${API_URL}/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedConnection),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to test connection',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    // Si el servidor no está ejecutándose, devolver un error claro
    if ((error as Error).message.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'No se pudo conectar al servidor de base de datos. Verifique que el servidor esté en ejecución y que los datos de conexión sean correctos.'
      };
    }
    
    return {
      success: false,
      error: (error as Error).message || 'Unknown error',
    };
  }
}

/**
 * Compare database structures between a source connection and multiple target connections
 */
export async function compareConnections(
  source: Connection,
  targets: Connection[]
): Promise<ComparisonResult> {
  // Intentar cargar resultados de sessionStorage si existen
  try {
    const savedResultsStr = sessionStorage.getItem('db-comparator-results');
    if (savedResultsStr) {
      console.log('Using cached comparison results');
      return JSON.parse(savedResultsStr) as ComparisonResult;
    }
  } catch (error) {
    console.warn('Could not load cached results:', error);
  }

  try {
    // Encrypt sensitive data
    const encryptedSource = encryptSensitiveData({
      host: source.host,
      port: source.port,
      database: source.database,
      user: source.user,
      password: source.password,
    });
    
    const encryptedTargets = targets.map(target => encryptSensitiveData({
      name: target.name,
      host: target.host,
      port: target.port,
      database: target.database,
      user: target.user,
      password: target.password,
    }));

    // Verificar si el servidor está en funcionamiento antes de enviar datos
    try {
      await fetch(`${API_URL}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(2000) // Timeout de 2 segundos
      });
      // Si llegamos aquí, el servidor está en funcionamiento
    } catch {
      throw new Error('No se pudo establecer conexión con el servidor de comparación. Verifique que el servidor esté en ejecución.');
    }

    const response = await fetch(`${API_URL}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: encryptedSource,
        targets: encryptedTargets,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to compare databases');
    }

    const result = await response.json();
    
    // Guardar resultado en sessionStorage
    try {
      sessionStorage.setItem('db-comparator-results', JSON.stringify(result));
    } catch {
      console.warn('Could not save comparison results to session storage');
    }
    
    return result;
  } catch (error) {
    // Si el servidor no está ejecutándose, mostrar error claramente
    if ((error as Error).message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar al servidor de comparación. Verifique que el servidor esté en ejecución y que los datos de conexión sean correctos.');
    }
    throw error;
  }
}