"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30"
                >
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4 px-1 gap-2 flex-wrap">
        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <span>Page <strong className="text-foreground font-bold">{table.getState().pagination.pageIndex + 1}</strong> of <strong className="text-foreground font-bold">{Math.max(1, table.getPageCount())}</strong></span>
          <span className="text-muted-foreground/60">•</span>
          <span>{data.length} total entries</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-2 border-primary/60 bg-background text-primary font-bold text-xs h-9 px-4 shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:bg-muted/70 disabled:border-border/80 disabled:text-foreground/60 disabled:cursor-not-allowed"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4 mr-1 shrink-0" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-2 border-primary/60 bg-background text-primary font-bold text-xs h-9 px-4 shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:bg-muted/70 disabled:border-border/80 disabled:text-foreground/60 disabled:cursor-not-allowed"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  )
}
