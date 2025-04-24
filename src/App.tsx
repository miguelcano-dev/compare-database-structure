import { Toaster } from '@/components/ui/sonner';
import DatabaseComparisonApp from '@/components/DatabaseComparisonApp';
import { ThemeProvider } from '@/components/ThemeProvider';

// Asegurarse de que se importen los iconos correctamente
import * as LucideIcons from 'lucide-react';

function App() {
  // Renderizar un icono de prueba para verificar que funcione
  console.log('Lucide Icons disponibles:', Object.keys(LucideIcons));
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <DatabaseComparisonApp />
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;