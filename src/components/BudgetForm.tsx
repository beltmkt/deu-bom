import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useFinanceStore, useCategories } from '@/stores/financeStore';
import { CurrencyInput } from './CurrencyInput';
import * as Icons from 'lucide-react';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ isOpen, onClose }) => {
  const categories = useCategories();
  const { setBudget } = useFinanceStore();

  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState(0);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = () => {
    if (!categoryId || !limit) return;
    setBudget(categoryId, limit);
    onClose();
    setCategoryId('');
    setLimit(0);
  };

  const CategoryIcon = selectedCategory?.icon
    ? (Icons as any)[selectedCategory.icon] || Icons.Circle
    : Icons.Circle;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-semibold">Novo Orçamento</h2>
            <button
              onClick={onClose}
              className="touch-btn w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 pb-32">
            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Categoria
              </label>
              <button
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="w-full px-4 py-4 rounded-xl bg-input border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {selectedCategory ? (
                    <>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: selectedCategory.color + '20' }}
                      >
                        <CategoryIcon
                          className="w-5 h-5"
                          style={{ color: selectedCategory.color }}
                        />
                      </div>
                      <span>{selectedCategory.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Selecionar categoria</span>
                  )}
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    showCategoryPicker ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showCategoryPicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-4 gap-2 mt-3 p-3 bg-muted rounded-xl max-h-48 overflow-y-auto">
                      {expenseCategories.map((cat) => {
                        const Icon = (Icons as any)[cat.icon] || Icons.Circle;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setCategoryId(cat.id);
                              setShowCategoryPicker(false);
                            }}
                            className={`
                              flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                              ${categoryId === cat.id ? 'bg-card shadow-md' : 'hover:bg-card/50'}
                            `}
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: cat.color + '20' }}
                            >
                              <Icon className="w-5 h-5" style={{ color: cat.color }} />
                            </div>
                            <span className="text-xs text-center truncate w-full">
                              {cat.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Limit */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Limite Mensal
              </label>
              <CurrencyInput value={limit} onChange={setLimit} />
            </div>
          </div>

          {/* Sticky footer */}
          <div className="modal-footer-sticky">
            <button
              onClick={handleSubmit}
              disabled={!categoryId || !limit}
              className="w-full py-4 rounded-xl font-semibold text-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar Orçamento
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
