import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/errors';
import { toast } from 'sonner';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  initialName?: string;
  initialEmail?: string;
  isOwnProfile?: boolean;
  onSaved?: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialName = '',
  initialEmail = '',
  isOwnProfile = true,
  onSaved,
}) => {
  const [displayName, setDisplayName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(initialName);
    setEmail(initialEmail);
  }, [initialName, initialEmail, isOpen]);

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          email: email.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast.success('Perfil atualizado com sucesso!');
      onSaved?.();
      onClose();
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast.error(getErrorMessage(error, 'Erro ao atualizar perfil'));
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="bg-card border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {isOwnProfile ? 'Editar Meu Perfil' : 'Editar Membro'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  disabled={isOwnProfile}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
              </div>
              {isOwnProfile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Para alterar o email, use a opção de recuperação de senha
                </p>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !displayName.trim()}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
