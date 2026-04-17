import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Users,
  ShoppingCart,
  Calculator,
  Trash2,
  ChevronDown,
  Check,
  X,
  Baby,
  User,
  Percent,
  ChefHat,
  Pizza,
  PartyPopper,
  Clock,
  Edit,
  Calendar,
  Mail,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { BottomNav } from '@/components/BottomNav';
import { CurrencyInput } from '@/components/CurrencyInput';
import { PageIntro } from '@/components/PageIntro';
import { formatCurrency } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { openGoogleCalendar } from '@/utils/googleCalendar';
import { EventDeleteModal } from '@/components/EventDeleteModal';

interface Event {
  id: string;
  name: string;
  description?: string;
  eventDate?: string;
  adultsCount: number;
  childrenCount: number;
  childrenPercentage: number;
  totalBudget: number;
  createdAt: string;
}

interface EventItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

interface Participant {
  id: string;
  name: string;
  email?: string;
  isChild: boolean;
  paid: boolean;
  amountDue: number;
}

type EventType = 'bbq' | 'pizza' | 'party';
type Duration = '4h' | '6h' | '8h+';

interface CalculatedItem {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  category: string;
}

const EVENT_TYPES = [
  { id: 'bbq' as EventType, label: 'Churrasco/BBQ', icon: ChefHat },
  { id: 'pizza' as EventType, label: 'Pizza Party', icon: Pizza },
  { id: 'party' as EventType, label: 'Festa Geral', icon: PartyPopper },
];

const DURATIONS = [
  { id: '4h' as Duration, label: '4 horas' },
  { id: '6h' as Duration, label: '6 horas' },
  { id: '8h+' as Duration, label: '8+ horas' },
];

const DURATION_MULTIPLIER: Record<Duration, number> = {
  '4h': 0.8,
  '6h': 1.0,
  '8h+': 1.3,
};

const BASE_CONSUMPTION = {
  bbq: {
    items: [
      { name: 'Carne', baseQtyAdult: 0.4, baseQtyChild: 0.2, unit: 'kg', defaultPrice: 50, category: 'carnes' },
      { name: 'Frango', baseQtyAdult: 0.15, baseQtyChild: 0.1, unit: 'kg', defaultPrice: 18, category: 'carnes' },
      { name: 'Linguiça', baseQtyAdult: 0.1, baseQtyChild: 0.05, unit: 'kg', defaultPrice: 25, category: 'carnes' },
      { name: 'Cerveja', baseQtyAdult: 1.5, baseQtyChild: 0, unit: 'L', defaultPrice: 8, category: 'bebidas' },
      { name: 'Refrigerante', baseQtyAdult: 0.3, baseQtyChild: 0.5, unit: 'L', defaultPrice: 6, category: 'bebidas' },
      { name: 'Água', baseQtyAdult: 0.5, baseQtyChild: 0.5, unit: 'L', defaultPrice: 3, category: 'bebidas' },
      { name: 'Pão de alho', baseQtyAdult: 2, baseQtyChild: 1, unit: 'un', defaultPrice: 2, category: 'acompanhamentos' },
      { name: 'Carvão', baseQtyAdult: 0.15, baseQtyChild: 0.1, unit: 'kg', defaultPrice: 15, category: 'outros' },
    ],
  },
  pizza: {
    items: [
      { name: 'Pizza Grande', baseQtyAdult: 0.33, baseQtyChild: 0.2, unit: 'un', defaultPrice: 55, category: 'outros' },
      { name: 'Refrigerante', baseQtyAdult: 0.5, baseQtyChild: 0.5, unit: 'L', defaultPrice: 6, category: 'bebidas' },
      { name: 'Suco', baseQtyAdult: 0.2, baseQtyChild: 0.4, unit: 'L', defaultPrice: 8, category: 'bebidas' },
      { name: 'Água', baseQtyAdult: 0.3, baseQtyChild: 0.3, unit: 'L', defaultPrice: 3, category: 'bebidas' },
    ],
  },
  party: {
    items: [
      { name: 'Salgados', baseQtyAdult: 12, baseQtyChild: 8, unit: 'un', defaultPrice: 0.8, category: 'outros' },
      { name: 'Docinhos', baseQtyAdult: 5, baseQtyChild: 8, unit: 'un', defaultPrice: 1.2, category: 'outros' },
      { name: 'Bolo', baseQtyAdult: 1, baseQtyChild: 1, unit: 'fatia', defaultPrice: 8, category: 'outros' },
      { name: 'Cerveja', baseQtyAdult: 1.2, baseQtyChild: 0, unit: 'L', defaultPrice: 8, category: 'bebidas' },
      { name: 'Refrigerante', baseQtyAdult: 0.4, baseQtyChild: 0.6, unit: 'L', defaultPrice: 6, category: 'bebidas' },
      { name: 'Água', baseQtyAdult: 0.4, baseQtyChild: 0.4, unit: 'L', defaultPrice: 3, category: 'bebidas' },
      { name: 'Suco', baseQtyAdult: 0.2, baseQtyChild: 0.4, unit: 'L', defaultPrice: 8, category: 'bebidas' },
    ],
  },
};

const Leisure: React.FC = () => {
  const { user } = useAuth();
  const { currentWorkspace, canEdit, loading: workspaceLoading } = useWorkspace();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [items, setItems] = useState<EventItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  
  // View mode: 'calculator' | 'events'
  const [viewMode, setViewMode] = useState<'calculator' | 'events'>('calculator');
  
  // Form states
  const [showItemForm, setShowItemForm] = useState(false);
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  
  const [childrenPercentage, setChildrenPercentage] = useState(50);
  
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemCategory, setItemCategory] = useState('outros');
  
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantIsChild, setParticipantIsChild] = useState(false);
  const [showEventDeleteModal, setShowEventDeleteModal] = useState(false);

  // Calculator states
  const [eventType, setEventType] = useState<EventType>('bbq');
  const [duration, setDuration] = useState<Duration>('4h');
  const [adultsCount, setAdultsCount] = useState(10);
  const [childrenCount, setChildrenCount] = useState(5);
  const [calculatedItems, setCalculatedItems] = useState<CalculatedItem[]>([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [eventTime, setEventTime] = useState('12:00');
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [showCalculatorResult, setShowCalculatorResult] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [savedEventData, setSavedEventData] = useState<{ name: string; date: string; time: string; amount: number } | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('un');
  const [newItemPrice, setNewItemPrice] = useState(0);

  useEffect(() => {
    if (!workspaceLoading && currentWorkspace) {
      loadEvents();
    }
  }, [currentWorkspace, workspaceLoading]);

  useEffect(() => {
    if (selectedEvent?.id) {
      loadEventDetails(selectedEvent.id);
    }
  }, [selectedEvent?.id]);

  const loadEvents = async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEvents: Event[] = (data || []).map(e => ({
        id: e.id,
        name: e.name,
        description: e.description || undefined,
        eventDate: e.event_date || undefined,
        adultsCount: e.adults_count,
        childrenCount: e.children_count,
        childrenPercentage: Number(e.children_percentage),
        totalBudget: Number(e.total_budget),
        createdAt: e.created_at,
      }));

      setEvents(formattedEvents);
      
      if (formattedEvents.length > 0 && !selectedEvent) {
        setSelectedEvent(formattedEvents[0]);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventDetails = async (eventId: string) => {
    try {
      const { data: itemsData } = await supabase
        .from('event_items')
        .select('*')
        .eq('event_id', eventId);

      const formattedItems: EventItem[] = (itemsData || []).map(i => ({
        id: i.id,
        name: i.name,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        category: i.category || 'outros',
      }));

      setItems(formattedItems);

      const { data: participantsData } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId);

      const formattedParticipants: Participant[] = (participantsData || []).map(p => ({
        id: p.id,
        name: p.name,
        email: (p as any).email || undefined,
        isChild: p.is_child,
        paid: p.paid,
        amountDue: Number(p.amount_due),
      }));

      setParticipants(formattedParticipants);
    } catch (error) {
      console.error('Failed to load event details:', error);
    }
  };

  // Calculator functions
  const calculateItems = () => {
    const multiplier = DURATION_MULTIPLIER[duration];
    const baseItems = BASE_CONSUMPTION[eventType].items;
    
    const items: CalculatedItem[] = baseItems.map((item) => {
      const adultQty = item.baseQtyAdult * adultsCount * multiplier;
      const childQty = item.baseQtyChild * childrenCount * multiplier;
      const totalQty = Math.ceil((adultQty + childQty) * 10) / 10;
      
      return {
        name: item.name,
        quantity: totalQty,
        unit: item.unit,
        pricePerUnit: item.defaultPrice,
        total: totalQty * item.defaultPrice,
        category: item.category,
      };
    });
    
    setCalculatedItems(items);
    setShowCalculatorResult(true);
  };

  const updateItemQuantity = (index: number, newQty: number) => {
    setCalculatedItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: newQty, total: newQty * item.pricePerUnit }
          : item
      )
    );
  };

  const updateItemPrice = (index: number, newPrice: number) => {
    setCalculatedItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, pricePerUnit: newPrice, total: item.quantity * newPrice }
          : item
      )
    );
  };

  const addCustomItem = () => {
    if (!newItemName || newItemPrice <= 0) return;
    
    const newItem: CalculatedItem = {
      name: newItemName,
      quantity: newItemQuantity,
      unit: newItemUnit,
      pricePerUnit: newItemPrice,
      total: newItemQuantity * newItemPrice,
      category: 'outros',
    };
    
    setCalculatedItems((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemUnit('un');
    setNewItemPrice(0);
    setShowAddItemForm(false);
  };

  const removeCalculatedItem = (index: number) => {
    setCalculatedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculatedTotal = useMemo(() => {
    return calculatedItems.reduce((sum, item) => sum + item.total, 0);
  }, [calculatedItems]);

  const saveCalculationAsEvent = async () => {
    if (!user || !currentWorkspace) return;
    
    const eventLabel = EVENT_TYPES.find((e) => e.id === eventType)?.label || 'Evento';
    const finalName = eventName || `${eventLabel} - ${adultsCount + childrenCount} pessoas`;

    try {
      // Create event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          workspace_id: currentWorkspace.id,
          created_by: user.id,
          name: finalName,
          event_date: eventDate || null,
          children_percentage: childrenPercentage,
          adults_count: adultsCount,
          children_count: childrenCount,
          total_budget: calculatedTotal,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Add all calculated items to the event
      if (eventData && calculatedItems.length > 0) {
        const itemsToInsert = calculatedItems.map(item => ({
          event_id: eventData.id,
          name: `${item.name} (${item.unit})`,
          quantity: item.quantity,
          unit_price: item.pricePerUnit,
          category: item.category,
        }));

        await supabase.from('event_items').insert(itemsToInsert);
      }

      // Find or create an events/leisure category for the transaction
      let categoryId: string | null = null;
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .or('name.ilike.%festômetro%,name.ilike.%lazer%,name.ilike.%festa%')
        .limit(1);

      if (existingCategories && existingCategories.length > 0) {
        categoryId = existingCategories[0].id;
      } else {
        // Create a new events category
        const { data: newCategory } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            workspace_id: currentWorkspace.id,
            name: 'Eventos',
            type: 'expense',
            color: '#f59e0b',
            icon: 'PartyPopper',
          })
          .select()
          .single();
        
        if (newCategory) {
          categoryId = newCategory.id;
        }
      }

      // Create the transaction as expense
      const transactionDescription = `${eventLabel}: ${adultsCount} adultos, ${childrenCount} crianças`;
      await supabase.from('transactions').insert({
        user_id: user.id,
        workspace_id: currentWorkspace.id,
        title: finalName,
        amount: calculatedTotal,
        type: 'expense',
        date: eventDate || format(new Date(), 'yyyy-MM-dd'),
        category_id: categoryId,
        notes: transactionDescription,
        status: 'pending',
      });

      // Add to Google Calendar if requested (using the toggle state, not the parameter)
      if (addToCalendar && eventDate) {
        openGoogleCalendar({
          title: finalName,
          date: eventDate,
          time: eventTime,
          amount: calculatedTotal,
          type: 'expense',
          notes: transactionDescription,
        });
      }

      toast.success('Evento registrado com sucesso!');
      
      // Reset calculator
      resetCalculator();
      setShowSaveConfirmation(false);
      setSavedEventData(null);
      
      // Reload events and switch to events view
      await loadEvents();
      setViewMode('events');
      
      if (eventData) {
        setSelectedEvent({
          id: eventData.id,
          name: eventData.name,
          description: eventData.description || undefined,
          eventDate: eventData.event_date || undefined,
          adultsCount: eventData.adults_count,
          childrenCount: eventData.children_count,
          childrenPercentage: Number(eventData.children_percentage),
          totalBudget: Number(eventData.total_budget),
          createdAt: eventData.created_at,
        });
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Erro ao salvar evento');
    }
  };

  const handleSaveClick = () => {
    const eventLabel = EVENT_TYPES.find((e) => e.id === eventType)?.label || 'Evento';
    const finalName = eventName || `${eventLabel} - ${adultsCount + childrenCount} pessoas`;
    setSavedEventData({
      name: finalName,
      date: eventDate || format(new Date(), 'yyyy-MM-dd'),
      time: eventTime,
      amount: calculatedTotal,
    });
    setShowSaveConfirmation(true);
  };

  const resetCalculator = () => {
    setShowCalculatorResult(false);
    setCalculatedItems([]);
    setEventName('');
    setEventDate(format(new Date(), 'yyyy-MM-dd'));
    setEventTime('12:00');
    setAddToCalendar(false);
    setAdultsCount(10);
    setChildrenCount(5);
    setEventType('bbq');
    setDuration('4h');
    setChildrenPercentage(50);
    setEditingIndex(null);
    setShowAddItemForm(false);
    setNewItemName('');
    setNewItemQuantity(1);
    setNewItemUnit('un');
    setNewItemPrice(0);
  };

  const cancelCalculation = () => {
    resetCalculator();
    setViewMode('events');
  };

  const addItem = async () => {
    if (!selectedEvent || !itemName || itemPrice <= 0) return;

    try {
      const { error } = await supabase
        .from('event_items')
        .insert({
          event_id: selectedEvent.id,
          name: itemName,
          quantity: itemQuantity,
          unit_price: itemPrice,
          category: itemCategory,
        });

      if (error) throw error;

      toast.success('Item adicionado!');
      setShowItemForm(false);
      setItemName('');
      setItemQuantity(1);
      setItemPrice(0);
      await loadEventDetails(selectedEvent.id);
      await updateEventTotals();
    } catch (error) {
      console.error('Failed to add item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await supabase
        .from('event_items')
        .delete()
        .eq('id', itemId);

      toast.success('Item removido!');
      if (selectedEvent) {
        await loadEventDetails(selectedEvent.id);
        await updateEventTotals();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const addParticipant = async () => {
    if (!selectedEvent || !participantName) return;

    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: selectedEvent.id,
          name: participantName,
          is_child: participantIsChild,
          email: participantEmail || null,
        } as any);

      if (error) throw error;

      toast.success('Participante adicionado!');
      setShowParticipantForm(false);
      setParticipantName('');
      setParticipantEmail('');
      setParticipantIsChild(false);
      await loadEventDetails(selectedEvent.id);
      await updateEventTotals();
    } catch (error) {
      console.error('Failed to add participant:', error);
      toast.error('Erro ao adicionar participante');
    }
  };

  const removeParticipant = async (participantId: string) => {
    try {
      await supabase
        .from('event_participants')
        .delete()
        .eq('id', participantId);

      toast.success('Participante removido!');
      if (selectedEvent) {
        await loadEventDetails(selectedEvent.id);
        await updateEventTotals();
      }
    } catch (error) {
      console.error('Failed to remove participant:', error);
    }
  };

  const toggleParticipantPaid = async (participant: Participant) => {
    try {
      await supabase
        .from('event_participants')
        .update({ paid: !participant.paid })
        .eq('id', participant.id);

      if (selectedEvent) {
        await loadEventDetails(selectedEvent.id);
      }
    } catch (error) {
      console.error('Failed to toggle payment:', error);
    }
  };

  const updateEventTotals = async () => {
    if (!selectedEvent) return;

    const totalBudget = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const adultsCount = participants.filter(p => !p.isChild).length;
    const childrenCount = participants.filter(p => p.isChild).length;

    await supabase
      .from('events')
      .update({
        total_budget: totalBudget,
        adults_count: adultsCount,
        children_count: childrenCount,
      })
      .eq('id', selectedEvent.id);

    await recalculateAmounts();
    await loadEvents();
  };

  const recalculateAmounts = async () => {
    if (!selectedEvent || participants.length === 0) return;

    const totalBudget = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const adults = participants.filter(p => !p.isChild);
    const children = participants.filter(p => p.isChild);
    
    const childMultiplier = selectedEvent.childrenPercentage / 100;
    const totalUnits = adults.length + (children.length * childMultiplier);
    
    if (totalUnits === 0) return;
    
    const adultShare = totalBudget / totalUnits;
    const childShare = adultShare * childMultiplier;

    for (const p of participants) {
      const amount = p.isChild ? childShare : adultShare;
      await supabase
        .from('event_participants')
        .update({ amount_due: amount })
        .eq('id', p.id);
    }

    const { data: participantsData } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', selectedEvent.id);

    const formattedParticipants: Participant[] = (participantsData || []).map(p => ({
      id: p.id,
      name: p.name,
      email: (p as any).email || undefined,
      isChild: p.is_child,
      paid: p.paid,
      amountDue: Number(p.amount_due),
    }));

    setParticipants(formattedParticipants);
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      toast.success('Evento excluído!');
      setSelectedEvent(null);
      await loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  const handleBulkDeleteEvents = async (eventIds: string[]) => {
    try {
      for (const id of eventIds) {
        await supabase.from('events').delete().eq('id', id);
      }
      toast.success(`${eventIds.length} evento(s) excluído(s)!`);
      setShowEventDeleteModal(false);
      if (eventIds.includes(selectedEvent?.id || '')) {
        setSelectedEvent(null);
      }
      await loadEvents();
    } catch (error) {
      console.error('Failed to bulk delete events:', error);
      toast.error('Erro ao excluir eventos');
    }
  };

  const updateChildrenPercentageForEvent = async (percentage: number) => {
    if (!selectedEvent) return;

    setChildrenPercentage(percentage);

    await supabase
      .from('events')
      .update({ children_percentage: percentage })
      .eq('id', selectedEvent.id);

    setSelectedEvent({ ...selectedEvent, childrenPercentage: percentage });
    await recalculateAmounts();
  };

  const totalBudget = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalPaid = participants.filter(p => p.paid).reduce((sum, p) => sum + p.amountDue, 0);
  const totalPending = participants.filter(p => !p.paid).reduce((sum, p) => sum + p.amountDue, 0);

  const itemCategories = [
    { value: 'carnes', label: 'Carnes' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'acompanhamentos', label: 'Acompanhamentos' },
    { value: 'descartaveis', label: 'Descartáveis' },
    { value: 'outros', label: 'Outros' },
  ];

  if (workspaceLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <PageIntro
        eyebrow="Festometro"
        title="Planejamento e rateio de eventos"
        description="Uma área prática para estimar consumo, organizar participantes e acompanhar custos do começo ao fim."
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h1 className="text-2xl font-bold">Festometro</h1>
            <p className="text-sm text-muted-foreground">Calcule, salve e acompanhe cada evento</p>
          </div>
        </div>
        
        {/* View Mode Tabs */}
        <div className="flex gap-2 mt-4 rounded-xl bg-muted p-1">
          <button
            onClick={() => setViewMode('calculator')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === 'calculator'
                ? 'bg-card shadow-md text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Calculadora
          </button>
          <button
            onClick={() => setViewMode('events')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              viewMode === 'events'
                ? 'bg-card shadow-md text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            <PartyPopper className="w-4 h-4" />
            Eventos ({events.length})
          </button>
        </div>
      </PageIntro>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {viewMode === 'calculator' ? (
          // Calculator View
          !showCalculatorResult ? (
            <div className="space-y-6">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome do Evento (opcional)
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Ex: Churrasco de Fim de Ano"
                  className="w-full px-4 py-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Data do Evento
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-card border border-border text-foreground"
                />
              </div>

              {/* Event Time */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Horário do Evento
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-card border border-border text-foreground"
                />
              </div>

              {/* Add to Google Calendar Toggle */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Adicionar ao Google Agenda?</p>
                      <p className="text-sm text-muted-foreground">
                        Salvar evento na sua agenda
                      </p>
                    </div>
                  </div>
                  <div 
                    className={`relative w-12 h-7 rounded-full transition-colors ${addToCalendar ? 'bg-primary' : 'bg-muted'}`}
                    onClick={() => setAddToCalendar(!addToCalendar)}
                  >
                    <div 
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${addToCalendar ? 'translate-x-6' : 'translate-x-1'}`} 
                    />
                  </div>
                </label>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  Tipo de Evento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setEventType(type.id)}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-xl transition-all border
                        ${eventType === type.id
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                        }
                      `}
                    >
                      <type.icon className="w-6 h-6" />
                      <span className="text-xs text-center font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Duração
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur.id}
                      onClick={() => setDuration(dur.id)}
                      className={`
                        py-3 px-4 rounded-xl transition-all border text-sm font-medium
                        ${duration === dur.id
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                        }
                      `}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* People Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Adultos
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdultsCount(Math.max(0, adultsCount - 1))}
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={adultsCount}
                      onChange={(e) => setAdultsCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 text-center text-2xl font-bold bg-transparent"
                    />
                    <button
                      onClick={() => setAdultsCount(adultsCount + 1)}
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <Baby className="w-4 h-4 inline mr-2" />
                    Crianças
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 text-center text-2xl font-bold bg-transparent"
                    />
                    <button
                      onClick={() => setChildrenCount(childrenCount + 1)}
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Children Percentage */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Percentual Crianças</p>
                    <p className="text-sm text-muted-foreground">
                      Crianças pagam {childrenPercentage}% do valor de adulto
                    </p>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={childrenPercentage}
                  onChange={(e) => setChildrenPercentage(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Total People Summary */}
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total de pessoas</span>
                  <span className="text-xl font-bold">{adultsCount + childrenCount}</span>
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateItems}
                disabled={adultsCount + childrenCount === 0}
                className="w-full py-4 rounded-xl font-semibold bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calcular Estimativa
              </button>
            </div>
          ) : (
            // Calculator Results
            <div className="space-y-4">
              {/* Back button */}
              <button
                onClick={() => setShowCalculatorResult(false)}
                className="text-sm text-primary flex items-center gap-1"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
                Voltar e recalcular
              </button>

              {/* Summary */}
              <div className="bg-muted rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">
                    {adultsCount} adultos + {childrenCount} crianças
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {EVENT_TYPES.find((e) => e.id === eventType)?.label} • {DURATIONS.find((d) => d.id === duration)?.label}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Itens Estimados</h3>
                  <button
                    onClick={() => setShowAddItemForm(true)}
                    className="flex items-center gap-1 text-sm text-primary font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Item
                  </button>
                </div>

                {/* Add Item Form */}
                <AnimatePresence>
                  {showAddItemForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-muted rounded-xl p-4 space-y-3"
                    >
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Nome do item"
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Qtd</label>
                          <input
                            type="number"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(parseFloat(e.target.value) || 0)}
                            step="0.1"
                            className="w-full mt-1 px-2 py-2 rounded-lg bg-card border border-border text-foreground text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Unidade</label>
                          <select
                            value={newItemUnit}
                            onChange={(e) => setNewItemUnit(e.target.value)}
                            className="w-full mt-1 px-2 py-2 rounded-lg bg-card border border-border text-foreground text-sm"
                          >
                            <option value="un">un</option>
                            <option value="kg">kg</option>
                            <option value="L">L</option>
                            <option value="pacote">pacote</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Preço/un</label>
                          <input
                            type="number"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                            step="0.01"
                            className="w-full mt-1 px-2 py-2 rounded-lg bg-card border border-border text-foreground text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddItemForm(false)}
                          className="flex-1 py-2 rounded-lg bg-card border border-border text-muted-foreground text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={addCustomItem}
                          disabled={!newItemName || newItemPrice <= 0}
                          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                        >
                          Adicionar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {calculatedItems.map((item, index) => (
                  <motion.div
                    key={`${item.name}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                          className="p-2 rounded-lg hover:bg-muted"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => removeCalculatedItem(index)}
                          className="p-2 rounded-lg hover:bg-muted"
                        >
                          <Trash2 className="w-4 h-4 text-expense" />
                        </button>
                      </div>
                    </div>
                    
                    {editingIndex === index ? (
                      <div className="space-y-3 pt-2 border-t border-border">
                        <div>
                          <label className="text-xs text-muted-foreground">Quantidade ({item.unit})</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseFloat(e.target.value) || 0)}
                            step="0.1"
                            className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Preço por {item.unit}</label>
                          <CurrencyInput
                            value={item.pricePerUnit}
                            onChange={(value) => updateItemPrice(index, value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity.toFixed(1)} {item.unit} × {formatCurrency(item.pricePerUnit)}
                        </span>
                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">Total Estimado</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(calculatedTotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Custo por pessoa: {formatCurrency(calculatedTotal / (adultsCount + childrenCount || 1))}
                </p>
              </div>

              {/* Decision Section */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h3 className="text-center font-semibold text-lg">Deseja criar esse evento?</h3>

                {!canEdit && (
                  <p className="text-center text-sm text-muted-foreground">
                    Você está como <span className="font-medium">visualizador</span> e não pode salvar eventos neste espaço.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      resetCalculator();
                    }}
                    className="py-4 rounded-xl font-semibold bg-muted text-muted-foreground border border-border flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Não
                  </button>
                  <button
                    onClick={() => {
                      if (!canEdit) {
                        toast.error('Sem permissão para salvar neste espaço');
                        return;
                      }
                      handleSaveClick();
                    }}
                    disabled={!canEdit}
                    className="py-4 rounded-xl font-semibold bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    Sim
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          // Events View
          <>
            {/* Create Event Button */}
            <button
              onClick={() => setViewMode('calculator')}
              className="w-full py-4 rounded-xl font-semibold bg-primary text-primary-foreground flex items-center justify-center gap-2 mb-4"
            >
              <Plus className="w-5 h-5" />
              Criar Novo Evento
            </button>

            {/* Event Selector */}
            {events.length > 0 && (
              <div className="relative">
                <select
                  value={selectedEvent?.id || ''}
                  onChange={(e) => {
                    const event = events.find(ev => ev.id === e.target.value);
                    setSelectedEvent(event || null);
                  }}
                  className="w-full px-4 py-4 rounded-xl bg-card border border-border text-foreground appearance-none pr-10"
                >
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} {event.eventDate && `- ${format(new Date(event.eventDate), 'dd/MM/yyyy', { locale: ptBR })}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            )}

            {events.length === 0 && (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-lg font-semibold mb-2">Nenhum evento ainda</h2>
                <p className="text-muted-foreground">
                  Clique no botão acima para criar seu primeiro evento
                </p>
              </div>
            )}

            {selectedEvent && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Gasto</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Por Adulto</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(
                        participants.filter(p => !p.isChild).length > 0
                          ? participants.filter(p => !p.isChild)[0]?.amountDue || 0
                          : 0
                      )}
                    </p>
                  </div>
                  <div className="bg-income/10 border border-income/20 rounded-2xl p-4">
                    <p className="text-sm text-income mb-1">Pago</p>
                    <p className="text-2xl font-bold text-income">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="bg-expense/10 border border-expense/20 rounded-2xl p-4">
                    <p className="text-sm text-expense mb-1">Pendente</p>
                    <p className="text-2xl font-bold text-expense">{formatCurrency(totalPending)}</p>
                  </div>
                </div>

                {/* Children Percentage */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Percentual Crianças</p>
                      <p className="text-sm text-muted-foreground">
                        Crianças pagam {selectedEvent.childrenPercentage}% do valor de adulto
                      </p>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={selectedEvent.childrenPercentage}
                    onChange={(e) => updateChildrenPercentageForEvent(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Participants Section */}
                <section className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Participantes ({participants.length})</h3>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => setShowParticipantForm(true)}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-primary" />
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border">
                    {participants.map(participant => (
                      <div key={participant.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            participant.isChild ? 'bg-warning/10' : 'bg-primary/10'
                          }`}>
                            {participant.isChild ? (
                              <Baby className="w-5 h-5 text-warning" />
                            ) : (
                              <User className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {participant.isChild ? 'Criança' : 'Adulto'}
                              {participant.email && ` • ${participant.email}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(participant.amountDue)}</p>
                            <p className={`text-xs ${participant.paid ? 'text-income' : 'text-expense'}`}>
                              {participant.paid ? 'Pago' : 'Pendente'}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleParticipantPaid(participant)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              participant.paid ? 'bg-income/10' : 'bg-muted'
                            }`}
                          >
                            <Check className={`w-4 h-4 ${participant.paid ? 'text-income' : 'text-muted-foreground'}`} />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => removeParticipant(participant.id)}
                              className="w-8 h-8 rounded-full bg-expense/10 flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4 text-expense" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {participants.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        Adicione participantes para calcular a divisão
                      </div>
                    )}
                  </div>
                </section>

                {/* Items Section */}
                <section className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Itens ({items.length})</h3>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => setShowItemForm(true)}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-primary" />
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</p>
                          {canEdit && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-8 h-8 rounded-full bg-expense/10 flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4 text-expense" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        Adicione itens para calcular o total
                      </div>
                    )}
                  </div>
                </section>

                {/* Delete Event */}
                {canEdit && (
                  <div className="space-y-3">
                    <button
                      onClick={() => deleteEvent(selectedEvent.id)}
                      className="w-full py-4 rounded-xl bg-expense/10 text-expense font-medium border border-expense/20"
                    >
                      Excluir Evento Atual
                    </button>
                    {events.length > 1 && (
                      <button
                        onClick={() => setShowEventDeleteModal(true)}
                        className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-medium border border-border"
                      >
                        Gerenciar / Excluir Múltiplos
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Item Form Modal */}
      <AnimatePresence>
        {showItemForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowItemForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Adicionar Item</h2>
                <button
                  onClick={() => setShowItemForm(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nome do Item
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Ex: Picanha"
                    className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number(e.target.value))}
                      className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Categoria
                    </label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground"
                    >
                      {itemCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Preço Unitário
                  </label>
                  <CurrencyInput value={itemPrice} onChange={setItemPrice} />
                </div>

                <button
                  onClick={addItem}
                  disabled={!itemName || itemPrice <= 0}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                >
                  Adicionar Item
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participant Form Modal */}
      <AnimatePresence>
        {showParticipantForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowParticipantForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Adicionar Participante</h2>
                <button
                  onClick={() => setShowParticipantForm(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Nome do participante"
                    className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email (opcional - para convite de agenda)
                  </label>
                  <input
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                  <button
                    onClick={() => setParticipantIsChild(false)}
                    className={`py-3 rounded-lg font-medium transition-all ${
                      !participantIsChild
                        ? 'bg-card shadow-md text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Adulto
                  </button>
                  <button
                    onClick={() => setParticipantIsChild(true)}
                    className={`py-3 rounded-lg font-medium transition-all ${
                      participantIsChild
                        ? 'bg-card shadow-md text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Criança
                  </button>
                </div>

                <button
                  onClick={addParticipant}
                  disabled={!participantName}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                >
                  Adicionar Participante
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {showSaveConfirmation && savedEventData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl w-full max-w-sm p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PartyPopper className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Salvar Evento?</h3>
                <p className="text-muted-foreground text-sm">
                  {savedEventData.name}
                </p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {formatCurrency(savedEventData.amount)}
                </p>
                {savedEventData.date && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(savedEventData.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    {savedEventData.time && ` às ${savedEventData.time}`}
                  </p>
                )}
                {addToCalendar && (
                  <p className="text-xs text-primary mt-2 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Será adicionado ao Google Agenda
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => saveCalculationAsEvent()}
                  className="w-full py-4 rounded-xl font-semibold bg-primary text-primary-foreground flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Salvar Evento
                </button>
                <button
                  onClick={() => setShowSaveConfirmation(false)}
                  className="w-full py-4 rounded-xl font-semibold bg-muted text-muted-foreground border border-border flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EventDeleteModal
        isOpen={showEventDeleteModal}
        onClose={() => setShowEventDeleteModal(false)}
        onConfirm={handleBulkDeleteEvents}
        events={events.map(e => ({ id: e.id, name: e.name, eventDate: e.eventDate }))}
      />

      <BottomNav />
    </AppShell>
  );
};

export default Leisure;
