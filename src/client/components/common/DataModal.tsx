import { Modal, type ModalProps } from "antd";

export type DataModalProps = ModalProps;

/**
 * Standardized reusable DataModal wrapping Ant Design's Modal.
 * Standardizes Ant Design 6 destroyOnHidden lifecycle and dialog defaults.
 */
export function DataModal({
  destroyOnHidden = true,
  mask = { closable: false },
  ...props
}: DataModalProps) {
  return <Modal destroyOnHidden={destroyOnHidden} mask={mask} {...props} />;
}
