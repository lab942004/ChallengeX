import { ReactNode, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './FormControls';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={['panel w-full max-w-lg p-6 animate-fade-in', className]
          .filter(Boolean)
          .join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="admin-title text-sm text-sand-light">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-sand-dim hover:text-brand-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation dialog used for all destructive admin actions. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="flex gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-800 bg-brand-950/60">
          <AlertTriangle className="h-5 w-5 text-brand-400" />
        </span>
        <p className="text-sm leading-relaxed text-sand-dim">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" loading={busy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
