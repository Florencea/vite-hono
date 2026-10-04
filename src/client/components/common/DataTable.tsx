import { Table, type TableProps } from "antd";

export type DataTableProps<T extends object = object> = TableProps<T>;

const DEFAULT_SCROLL: { x: string } = { x: "max-content" };

/**
 * Standardized reusable DataTable wrapping Ant Design's Table.
 * Configured with responsive horizontal scrolling, rowKey defaults, and clean layout props.
 */
export function DataTable<T extends object = object>({
  rowKey = "id",
  pagination = false,
  scroll,
  size = "middle",
  ...props
}: DataTableProps<T>) {
  return (
    <Table<T>
      rowKey={rowKey}
      pagination={pagination}
      {...(scroll !== undefined ? { scroll } : { scroll: DEFAULT_SCROLL })}
      size={size}
      {...props}
    />
  );
}
