import { Table, type TableProps } from "antd";

export type DataTableProps<T extends object = object> = TableProps<T>;

/**
 * Standardized reusable DataTable wrapping Ant Design's Table.
 * Configured with responsive horizontal scrolling, rowKey defaults, and clean layout props.
 */
export function DataTable<T extends object = object>({
  rowKey = "id",
  pagination = false,
  scroll = { x: "max-content" },
  size = "middle",
  ...props
}: DataTableProps<T>) {
  return (
    <Table<T>
      rowKey={rowKey}
      pagination={pagination}
      scroll={scroll}
      size={size}
      {...props}
    />
  );
}
