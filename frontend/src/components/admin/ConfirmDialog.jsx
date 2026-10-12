import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { AlertTriangleIcon, InfoIcon } from '../ui/Icons';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
}) {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangleIcon size={22} className="confirm-icon danger" />;
      case 'warning':
        return <AlertTriangleIcon size={22} className="confirm-icon warning" />;
      default:
        return <InfoIcon size={22} className="confirm-icon primary" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={460}
      footer={
        <div className="confirm-dialog-actions">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="confirm-dialog-content">
        <div className="confirm-dialog-icon-wrapper">{getIcon()}</div>
        <div className="confirm-dialog-text">
          <p className="confirm-dialog-message">{message}</p>
          <p className="confirm-dialog-hint">This action affects local preview session data only.</p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
