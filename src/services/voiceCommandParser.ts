import type { TransactionType } from '@/types/finance';

export type ParsedVoiceCommand =
  | {
      kind: 'transaction';
      action: 'add';
      type: TransactionType;
      title: string;
      amount: number;
    }
  | {
      kind: 'shopping';
      action: 'add';
      name: string;
      quantity: number;
      unit: string;
      estimatedPrice: number;
    };

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const parseAmount = (text: string) => {
  const match = text.match(/(?:r\$|reais|real|valor|por|de)\s*(\d+(?:[,.]\d{1,2})?)/i);
  if (!match) {
    const looseMatch = text.match(/\b(\d+(?:[,.]\d{1,2})?)\b/);
    return looseMatch ? Number(looseMatch[1].replace(',', '.')) : 0;
  }

  return Number(match[1].replace(',', '.'));
};

const cleanTitle = (text: string, amount: number) =>
  text
    .replace(/^(adicionar|add|inserir|lancar|registrar)\s+/i, '')
    .replace(/\b(despesa|receita|gasto|entrada|ganho)\b/gi, '')
    .replace(new RegExp(`\\b${String(amount).replace('.', '[,.]')}\\b`, 'i'), '')
    .replace(/\b(r\$|reais|real|valor|por|de|no|na|em|hoje|amanha|ontem)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const parseVoiceCommand = (transcript: string): ParsedVoiceCommand | null => {
  const normalized = normalize(transcript);

  const wantsShopping =
    normalized.includes('lista') ||
    normalized.includes('compra') ||
    normalized.includes('compras') ||
    normalized.includes('mercado');

  const wantsTransaction =
    normalized.includes('despesa') ||
    normalized.includes('gasto') ||
    normalized.includes('receita') ||
    normalized.includes('entrada') ||
    normalized.includes('ganho');

  if (wantsShopping && !wantsTransaction) {
    const estimatedPrice = parseAmount(transcript);
    const quantityMatch = normalized.match(/\b(\d+)\s*(unidades|unidade|un|kg|quilo|quilos|pacotes|pacote|litros|litro|l)\b/);
    const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
    const unit = quantityMatch?.[2]?.replace('quilos', 'kg').replace('quilo', 'kg') || 'un';
    const name = normalized
      .replace(/^(adicionar|add|inserir|colocar)\s+/i, '')
      .replace(/\b(na|no|a|lista|de|compras|compra|mercado|por|r\$|reais|real)\b/g, ' ')
      .replace(/\b\d+(?:[,.]\d{1,2})?\b/g, ' ')
      .replace(/\b(unidades|unidade|un|kg|quilo|quilos|pacotes|pacote|litros|litro|l)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!name) return null;

    return {
      kind: 'shopping',
      action: 'add',
      name,
      quantity,
      unit,
      estimatedPrice,
    };
  }

  if (wantsTransaction) {
    const type: TransactionType =
      normalized.includes('receita') ||
      normalized.includes('entrada') ||
      normalized.includes('ganho')
        ? 'income'
        : 'expense';
    const amount = parseAmount(transcript);
    const title = cleanTitle(transcript, amount);

    if (!amount || !title) return null;

    return {
      kind: 'transaction',
      action: 'add',
      type,
      title,
      amount,
    };
  }

  return null;
};
