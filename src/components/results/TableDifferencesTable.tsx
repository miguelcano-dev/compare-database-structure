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
import { TableDifference } from '@/types/comparison';
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

interface TableDifferencesTableProps {
  differences: TableDifference[];
}

export function TableDifferencesTable({ differences }: TableDifferencesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<TableDifference>[]>(
    () => [
      {
        accessorKey: 'table',
        header: 'Table',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('table')}</div>
        ),
      },
      {
        accessorKey: 'targetDb',
        header: 'Target Database',
        cell: ({ row }) => (
          <Badge variant="outline">{row.getValue('targetDb')}</Badge>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const { sourceOnly, targetOnly } = row.original;
          
          if (sourceOnly) {
            return (
              <Badge variant="destructive">Missing in Target</Badge>
            );
          }
          
          if (targetOnly) {
            return (
              <Badge variant="secondary">Only in Target</Badge>
            );
          }
          
          return (
            <Badge variant="outline">Different Structure</Badge>
          );
        },
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
          placeholder="Filter tables..."
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
                  No table differences found.
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