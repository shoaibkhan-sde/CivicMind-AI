import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { trapFocus } from '../utils/accessibility.js';

/**
 * Premium Confirmation Modal for sensitive actions (deleting, resetting).
 */
export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel", type = "danger" }) {
  const modalRef = useRef(null);

  // Trap focus
  useEffect(() => {
    if (isOpen) {
      const cleanup = trapFocus(modalRef);
      return cleanup;
    }
  }, [isOpen]);

  // Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div 
        className="confirm-modal-card" 
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        <div className="confirm-modal-header">
          <div className={`confirm-icon-wrap ${type}`}>
            <AlertTriangle size={24} />
          </div>
          <button className="modal-close-btn" onClick={onCancel} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <div className="confirm-modal-body">
          <h2 id="confirm-modal-title">{title}</h2>
          <p id="confirm-modal-desc">{message}</p>
        </div>

        <div className="confirm-modal-footer">
          <button className="btn-modal-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn-modal-primary ${type}`} onClick={onConfirm} autoFocus>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

