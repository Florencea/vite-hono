import { Drawer, type DrawerProps } from "antd";

export type DataDrawerProps = DrawerProps;

const DEFAULT_MASK: { closable: boolean } = { closable: false };

/**
 * Standardized reusable DataDrawer wrapping Ant Design's Drawer.
 * Standardizes Ant Design 6 destroyOnHidden lifecycle and drawer defaults.
 */
export function DataDrawer({ destroyOnHidden = true, mask, ...props }: DataDrawerProps) {
  return (
    <Drawer
      destroyOnHidden={destroyOnHidden}
      {...(mask !== undefined ? { mask } : { mask: DEFAULT_MASK })}
      {...props}
    />
  );
}
