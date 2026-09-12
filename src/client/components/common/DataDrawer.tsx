import { Drawer, type DrawerProps } from "antd";

export type DataDrawerProps = DrawerProps;

/**
 * Standardized reusable DataDrawer wrapping Ant Design's Drawer.
 * Standardizes Ant Design 6 destroyOnHidden lifecycle and drawer defaults.
 */
export function DataDrawer({
  destroyOnHidden = true,
  mask = { closable: false },
  ...props
}: DataDrawerProps) {
  return <Drawer destroyOnHidden={destroyOnHidden} mask={mask} {...props} />;
}
