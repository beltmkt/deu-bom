import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventInfo {
  id: string;
  name: string;
  eventDate?: string;
}

interface EventDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (eventIds: string[]) => void;
  events: EventInfo[];
}

export const EventDeleteModal: React.FC<EventDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  events,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleEvent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map((e) => e.id)));
    }
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setSelectedIds(new Set()); } }}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Excluir Eventos</DialogTitle>
          <DialogDescription>
            Selecione os eventos que deseja excluir
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <button
            onClick={selectAll}
            className="text-sm text-primary font-medium"
          >
            {selectedIds.size === events.length ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => toggleEvent(event.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                selectedIds.has(event.id)
                  ? 'bg-destructive/10 border border-destructive/20'
                  : 'bg-muted border border-transparent'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedIds.has(event.id)
                    ? 'bg-destructive border-destructive'
                    : 'border-muted-foreground/30'
                }`}
              >
                {selectedIds.has(event.id) && <Check className="w-4 h-4 text-destructive-foreground" />}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{event.name}</p>
                {event.eventDate && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.eventDate), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Excluir ({selectedIds.size})
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
