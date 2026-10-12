import { useEffect } from 'react';
import { CheckCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from '../ui/Icons';

export function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon size={16} className="toast-icon success" />;
      case 'warning':
        return <AlertTriangleIcon size={16} className="toast-icon warning" />;
      case 'danger':
        return <AlertTriangleIcon size={16} className="toast-icon danger" />;
      default:
        return <InfoIcon size={16} className="toast-icon info" />;
    }
  };

  return (
    <div className={`admin-toast admin-toast-${type}`} role="status">
      <div className="toast-icon-box">{getIcon()}</div>
      <div className="toast-message-box">
        <span className="toast-text">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="toast-close-btn"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  );
}

export default Toast;
