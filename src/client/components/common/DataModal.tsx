import { Modal, type ModalProps } from "antd";

export type DataModalProps = ModalProps;

const DEFAULT_MASK: { closable: boolean } = { closable: false };

/**
 * Standardized reusable DataModal wrapping Ant Design's Modal.
 * Standardizes Ant Design 6 destroyOnHidden lifecycle and dialog defaults.
 */
export function DataModal({ destroyOnHidden = true, mask, ...props }: DataModalProps) {
  return (
    <Modal
      destroyOnHidden={destroyOnHidden}
      {...(mask !== undefined ? { mask } : { mask: DEFAULT_MASK })}
      {...props}
    />
  );
}
