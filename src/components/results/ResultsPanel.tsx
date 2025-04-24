import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ComparisonResult } from '@/types/comparison';
import { ResultsSummary } from '@/components/results/ResultsSummary';
import { ColumnDifferencesTable } from '@/components/results/ColumnDifferencesTable';
import { TableDifferencesTable } from '@/components/results/TableDifferencesTable';
import { IndexDifferencesTable } from '@/components/results/IndexDifferencesTable';
import { Download as DownloadIcon } from 'lucide-react';
import { SyntaxHighlighter } from '@/components/results/SyntaxHighlighter';
import { toast } from 'sonner';

interface ResultsPanelProps {
  results: ComparisonResult;
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState('summary');

  const handleExport = () => {
    try {
      // Crear un objeto Blob con los resultados
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      
      // Crear una URL para el blob
      const url = URL.createObjectURL(blob);
      
      // Crear un elemento de enlace para descargar el archivo
      const a = document.createElement('a');
      a.href = url;
      a.download = `db-comparison-results-${new Date().toISOString().split('T')[0]}.json`;
      
      // Agregar el enlace al documento y hacer clic en él
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Results exported successfully');
    } catch (error) {
      console.error('Error exporting results:', error);
      toast.error('Failed to export results');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Comparison Results</CardTitle>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
          <DownloadIcon className="h-4 w-4" />
          Export Results
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="columns">Columns</TabsTrigger>
            <TabsTrigger value="indexes">Indexes</TabsTrigger>
            <TabsTrigger value="sql">SQL Diff</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <ResultsSummary summary={results.summary} />
          </TabsContent>
          
          <TabsContent value="tables">
            <TableDifferencesTable differences={results.tableDiffs} />
          </TabsContent>
          
          <TabsContent value="columns">
            <ColumnDifferencesTable differences={results.columnDiffs} />
          </TabsContent>
          
          <TabsContent value="indexes">
            <IndexDifferencesTable differences={results.indexDiffs} />
          </TabsContent>
          
          <TabsContent value="sql">
            <SyntaxHighlighter results={results} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}