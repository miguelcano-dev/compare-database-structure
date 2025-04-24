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
import { ColumnDifference } from '@/types/comparison';
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

interface ColumnDifferencesTableProps {
  differences: ColumnDifference[];
}

export function ColumnDifferencesTable({ differences }: ColumnDifferencesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<ColumnDifference>[]>(
    () => [
      {
        accessorKey: 'table',
        header: 'Table',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('table')}</div>
        ),
      },
      {
        accessorKey: 'column',
        header: 'Column',
        cell: ({ row }) => row.getValue('column'),
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
        id: 'sourceType',
        header: 'Source Type',
        cell: ({ row }) => (
          <code className="px-1 py-0.5 bg-primary/10 rounded text-xs">
            {row.original.source.type || 'N/A'}
          </code>
        ),
      },
      {
        id: 'targetType',
        header: 'Target Type',
        cell: ({ row }) => (
          <code className="px-1 py-0.5 bg-primary/10 rounded text-xs">
            {row.original.target.type || 'N/A'}
          </code>
        ),
      },
      {
        id: 'sourceNullable',
        header: 'Source Nullable',
        cell: ({ row }) => (
          row.original.source.nullable !== undefined ? String(row.original.source.nullable) : 'N/A'
        ),
      },
      {
        id: 'targetNullable',
        header: 'Target Nullable',
        cell: ({ row }) => (
          row.original.target.nullable !== undefined ? String(row.original.target.nullable) : 'N/A'
        ),
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
          placeholder="Filter columns..."
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
                  No column differences found.
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