import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  Check,
  DatabaseIcon,
  TableIcon,
  TableProperties,
  Database,
} from 'lucide-react';

interface ResultsSummaryProps {
  summary: {
    totalTables: number;
    tablesWithDiffs: number;
    tablesOnlyInSource: number;
    tablesOnlyInTargets: number;
    columnsWithDiffs: number;
    indexesWithDiffs: number;
  };
}

export function ResultsSummary({ summary }: ResultsSummaryProps) {
  const hasDifferences = summary.tablesWithDiffs > 0 || 
    summary.tablesOnlyInSource > 0 ||
    summary.tablesOnlyInTargets > 0 ||
    summary.columnsWithDiffs > 0 ||
    summary.indexesWithDiffs > 0;

  // Calculate percentage of tables with differences
  const tablesWithDiffsPercentage = summary.totalTables > 0
    ? Math.round((summary.tablesWithDiffs / summary.totalTables) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center p-6">
        {hasDifferences ? (
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-destructive/20 rounded-full mb-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Differences Detected</h2>
            <p className="text-muted-foreground mt-1">
              There are structural differences between the compared databases.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-green-500/20 rounded-full mb-3">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold">Databases Match</h2>
            <p className="text-muted-foreground mt-1">
              No structural differences were found between the compared databases.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <DatabaseIcon className="h-4 w-4 mr-2" />
              Tables
            </CardTitle>
            <CardDescription>Table structure comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.tablesWithDiffs}/{summary.totalTables}
            </div>
            <p className="text-muted-foreground text-sm">
              {tablesWithDiffsPercentage}% of tables have differences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <TableIcon className="h-4 w-4 mr-2" />
              Missing Tables
            </CardTitle>
            <CardDescription>Tables found in only one database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm text-muted-foreground">Source only</div>
                <div className="text-xl font-bold">{summary.tablesOnlyInSource}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Target only</div>
                <div className="text-xl font-bold">{summary.tablesOnlyInTargets}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <TableProperties className="h-4 w-4 mr-2" />
              Structural Differences
            </CardTitle>
            <CardDescription>Columns and indexes with differences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm text-muted-foreground">Columns</div>
                <div className="text-xl font-bold">{summary.columnsWithDiffs}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Indexes</div>
                <div className="text-xl font-bold">{summary.indexesWithDiffs}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}