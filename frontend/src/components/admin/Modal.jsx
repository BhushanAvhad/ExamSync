import { useEffect, useRef } from 'react';
import { XIcon } from '../ui/Icons';

/**
 * Accessible Glass Modal Component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 560,
  ariaLabel = 'Dialog',
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="admin-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title || ariaLabel}
    >
      <div
        className="admin-modal-card"
        style={{ maxWidth: `${maxWidth}px` }}
        ref={modalRef}
      >
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">{title}</h3>
            {subtitle && <p className="admin-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="admin-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="admin-modal-body">{children}</div>

        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
