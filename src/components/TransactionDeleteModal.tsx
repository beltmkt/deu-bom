import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type DeleteScope = 'single' | 'future' | 'all';

interface TransactionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: DeleteScope) => void;
  isRecurring: boolean;
  transactionTitle: string;
}

export const TransactionDeleteModal: React.FC<TransactionDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isRecurring,
  transactionTitle,
}) => {
  if (!isRecurring) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-base font-semibold">Excluir transação</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Excluir "{transactionTitle}"?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium transition-colors hover:bg-muted/80"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm('single')}
              className="flex-1 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium transition-colors hover:bg-destructive/20"
            >
              Excluir
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-base font-semibold">Excluir transação</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            "{transactionTitle}" faz parte de uma série.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          <button
            onClick={() => onConfirm('single')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-left transition-colors bg-muted/50 hover:bg-muted text-foreground"
          >
            Excluir apenas este
          </button>
          <button
            onClick={() => onConfirm('future')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-left transition-colors bg-muted/50 hover:bg-muted text-foreground"
          >
            Este e os próximos
          </button>
          <button
            onClick={() => onConfirm('all')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-left transition-colors bg-destructive/5 hover:bg-destructive/10 text-destructive"
          >
            Excluir todos da série
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm text-muted-foreground font-medium hover:bg-muted/50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Reuse for update scope
type UpdateScope = 'single' | 'future' | 'all';

interface TransactionUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: UpdateScope) => void;
  transactionTitle: string;
}

export const TransactionUpdateModal: React.FC<TransactionUpdateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transactionTitle,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-base font-semibold">Atualizar transação</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            "{transactionTitle}" faz parte de uma série. Aplicar alteração em:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          <button
            onClick={() => onConfirm('single')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-left transition-colors bg-muted/50 hover:bg-muted text-foreground"
          >
            Apenas este
          </button>
          <button
            onClick={() => onConfirm('future')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-left transition-colors bg-muted/50 hover:bg-muted text-foreground"
          >
            Este e os próximos
          </button>
          <button
            onClick={() => onConfirm('all')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-left transition-colors bg-primary/10 hover:bg-primary/20 text-primary"
          >
            Todos da série
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm text-muted-foreground font-medium hover:bg-muted/50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
