export interface ColumnDifference {
  table: string;
  column: string;
  source: {
    type?: string;
    nullable?: boolean;
    default?: string | null;
    extra?: string;
  };
  target: {
    type?: string;
    nullable?: boolean;
    default?: string | null;
    extra?: string;
  };
  issue: string;
  targetDb: string;
}

export interface TableDifference {
  table: string;
  sourceOnly: boolean;
  targetOnly: boolean;
  targetDb: string;
}

export interface IndexDifference {
  table: string;
  indexName: string;
  source: {
    columns?: string[];
    type?: string;
  };
  target: {
    columns?: string[];
    type?: string;
  };
  issue: string;
  targetDb: string;
}

export interface ComparisonResult {
  columnDiffs: ColumnDifference[];
  tableDiffs: TableDifference[];
  indexDiffs: IndexDifference[];
  summary: {
    totalTables: number;
    tablesWithDiffs: number;
    tablesOnlyInSource: number;
    tablesOnlyInTargets: number;
    columnsWithDiffs: number;
    indexesWithDiffs: number;
  };
}