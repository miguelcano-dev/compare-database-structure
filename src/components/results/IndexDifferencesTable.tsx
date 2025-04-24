import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { IndexDifference } from '@/types/comparison';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Search as SearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface IndexDifferencesTableProps {
  differences: IndexDifference[];
}

export function IndexDifferencesTable({ differences }: IndexDifferencesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<IndexDifference>[]>(
    () => [
      {
        accessorKey: 'table',
        header: 'Table',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('table')}</div>
        ),
      },
      {
        accessorKey: 'indexName',
        header: 'Index Name',
        cell: ({ row }) => row.getValue('indexName'),
      },
      {
        accessorKey: 'targetDb',
        header: 'Target Database',
        cell: ({ row }) => (
          <Badge variant="outline">{row.getValue('targetDb')}</Badge>
        ),
      },
      {
        accessorKey: 'issue',
        header: 'Issue',
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate" title={row.getValue('issue')}>
            {row.getValue('issue')}
          </div>
        ),
      },
      {
        id: 'sourceColumns',
        header: 'Source Columns',
        cell: ({ row }) => (
          <div>
            {row.original.source.columns?.map((column) => (
              <Badge key={column} variant="outline" className="mr-1 mb-1">
                {column}
              </Badge>
            )) || 'N/A'}
          </div>
        ),
      },
      {
        id: 'targetColumns',
        header: 'Target Columns',
        cell: ({ row }) => (
          <div>
            {row.original.target.columns?.map((column) => (
              <Badge key={column} variant="outline" className="mr-1 mb-1">
                {column}
              </Badge>
            )) || 'N/A'}
          </div>
        ),
      },
      {
        id: 'sourceType',
        header: 'Source Type',
        cell: ({ row }) => row.original.source.type || 'N/A',
      },
      {
        id: 'targetType',
        header: 'Target Type',
        cell: ({ row }) => row.original.target.type || 'N/A',
      },
    ],
    []
  );

  const table = useReactTable({
    data: differences,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    enableSorting: true,
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter indexes..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No index differences found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{' '}
          <strong>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </strong>{' '}
          of <strong>{table.getFilteredRowModel().rows.length}</strong> results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}