import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type DeleteScope = 'single' | 'future' | 'all';

interface TransactionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: DeleteScope) => Promise<void> | void;
  isRecurring: boolean;
  transactionTitle: string;
  isSubmitting?: boolean;
}

export const TransactionDeleteModal: React.FC<TransactionDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isRecurring,
  transactionTitle,
  isSubmitting = false,
}) => {
  if (!isRecurring) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            onClose();
          }
        }}
      >
        <DialogContent className="rounded-2xl p-6 sm:max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-base font-semibold">
              Excluir transacao
            </DialogTitle>
          <DialogDescription className="mt-1 text-sm">
            Excluir "{transactionTitle}"? Essa acao remove o lancamento do balanço apos a sincronizacao.
          </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-muted py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
            >
              {isSubmitting ? 'Excluindo...' : 'Cancelar'}
            </button>
            <button
              onClick={() => onConfirm('single')}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-destructive/10 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
            >
              Excluir
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="rounded-2xl p-6 sm:max-w-sm">
        <DialogHeader className="text-center">
          <DialogTitle className="text-base font-semibold">
            Excluir transacao
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm">
            "{transactionTitle}" faz parte de uma serie. Escolha com cuidado quais lancamentos saem do balanço.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <button
            onClick={() => onConfirm('single')}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <span className="block">Excluir apenas este</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              Remove somente o lancamento selecionado.
            </span>
          </button>
          <button
            onClick={() => onConfirm('future')}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <span className="block">Este e os proximos</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              Remove este lancamento e os futuros da serie.
            </span>
          </button>
          <button
            onClick={() => onConfirm('all')}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-destructive/5 px-4 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <span className="block">Excluir todos da serie</span>
            <span className="mt-0.5 block text-xs font-normal text-destructive/80">
              Remove todos os lancamentos relacionados.
            </span>
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
          >
            {isSubmitting ? 'Excluindo...' : 'Cancelar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

type UpdateScope = 'single' | 'future' | 'all';

interface TransactionUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: UpdateScope) => Promise<void> | void;
  transactionTitle: string;
  isSubmitting?: boolean;
}

export const TransactionUpdateModal: React.FC<TransactionUpdateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transactionTitle,
  isSubmitting = false,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="rounded-2xl p-6 sm:max-w-sm">
        <DialogHeader className="text-center">
          <DialogTitle className="text-base font-semibold">
            Atualizar transacao
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm">
            "{transactionTitle}" faz parte de uma serie. Escolha onde a alteracao deve refletir.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <button
            onClick={() => onConfirm('single')}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="block">Apenas este</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              Mantem os demais lancamentos da serie como estao.
            </span>
          </button>
          <button
            onClick={() => onConfirm('future')}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="block">Este e os proximos</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              Atualiza este lancamento e os futuros.
            </span>
          </button>
          <button
            onClick={() => onConfirm('all')}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary/10 px-4 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="block">Todos da serie</span>
            <span className="mt-0.5 block text-xs font-normal text-primary/80">
              Atualiza todos os lancamentos relacionados.
            </span>
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : 'Cancelar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
