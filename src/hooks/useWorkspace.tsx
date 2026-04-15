import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

interface WorkspaceMember {
  id: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  email?: string;
  displayName?: string;
}

interface WorkspaceInvitation {
  id: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  expiresAt: string;
  createdAt: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  loading: boolean;
  userRole: 'owner' | 'editor' | 'viewer' | null;
  canEdit: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  inviteUser: (email: string, role: 'editor' | 'viewer') => Promise<void>;
  removeInvitation: (invitationId: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: 'editor' | 'viewer') => Promise<void>;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null);
  
  // Use ref to track if we've already loaded to prevent infinite loops
  const hasLoadedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  const loadWorkspaceDetails = useCallback(async (workspaceId: string, workspacesList: Workspace[], userId: string) => {
    try {
      console.log('[Workspace] Loading details for workspace:', workspaceId, 'user:', userId);
      
      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (membersError) {
        console.error('[Workspace] Error loading members:', membersError);
      }
      console.log('[Workspace] Members data:', membersData);

      // Load profiles for members
      const memberIds = membersData?.map(m => m.user_id) || [];
      let profiles: { id: string; email: string | null; display_name: string | null }[] = [];
      
      if (memberIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .in('id', memberIds);
        profiles = profilesData || [];
      }

      const formattedMembers: WorkspaceMember[] = (membersData || []).map(m => {
        const profile = profiles.find(p => p.id === m.user_id);
        return {
          id: m.id,
          userId: m.user_id,
          role: m.role as 'owner' | 'editor' | 'viewer',
          email: profile?.email || undefined,
          displayName: profile?.display_name || undefined,
        };
      });

      console.log('[Workspace] Formatted members:', formattedMembers);
      setMembers(formattedMembers);

      // Determine user's role - first check if user is workspace owner
      const workspace = workspacesList.find(w => w.id === workspaceId);
      console.log('[Workspace] Found workspace:', workspace);
      
      if (workspace?.ownerId === userId) {
        console.log('[Workspace] User is owner of workspace');
        setUserRole('owner');
      } else {
        const userMember = formattedMembers.find(m => m.userId === userId);
        console.log('[Workspace] User member record:', userMember);
        setUserRole(userMember?.role || null);
      }

      // Load invitations
      const { data: invitationsData, error: invError } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (invError) {
        console.error('[Workspace] Error loading invitations:', invError);
      }

      const formattedInvitations: WorkspaceInvitation[] = (invitationsData || []).map(i => ({
        id: i.id,
        email: i.email,
        role: i.role as 'owner' | 'editor' | 'viewer',
        expiresAt: i.expires_at,
        createdAt: i.created_at,
      }));

      setInvitations(formattedInvitations);
      setLoading(false);
    } catch (error) {
      console.error('[Workspace] Failed to load workspace details:', error);
      setLoading(false);
    }
  }, []);

  const loadWorkspaces = useCallback(async (userId: string) => {
    try {
      console.log('[Workspace] Loading workspaces for user:', userId);
      
      // Get user's profile with current workspace
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_workspace_id')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error('[Workspace] Error loading profile:', profileError);
      }
      console.log('[Workspace] Profile loaded:', profile);

      // Get workspaces where user is owner
      const { data: ownedWorkspaces, error: ownedError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', userId);
      
      if (ownedError) {
        console.error('[Workspace] Error loading owned workspaces:', ownedError);
      }
      console.log('[Workspace] Owned workspaces:', ownedWorkspaces);

      // Get workspaces where user is member
      const { data: memberWorkspaces, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
        .not('accepted_at', 'is', null);
      
      if (memberError) {
        console.error('[Workspace] Error loading member workspaces:', memberError);
      }
      console.log('[Workspace] Member workspaces:', memberWorkspaces);

      const memberWorkspaceIds = memberWorkspaces?.map(m => m.workspace_id) || [];
      
      let allWorkspaces = ownedWorkspaces || [];
      
      if (memberWorkspaceIds.length > 0) {
        const { data: sharedWorkspaces } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', memberWorkspaceIds)
          .neq('owner_id', userId);
        
        if (sharedWorkspaces) {
          allWorkspaces = [...allWorkspaces, ...sharedWorkspaces];
        }
      }

      const formattedWorkspaces: Workspace[] = allWorkspaces.map(w => ({
        id: w.id,
        name: w.name,
        ownerId: w.owner_id,
        createdAt: w.created_at,
      }));

      console.log('[Workspace] All workspaces:', formattedWorkspaces);
      setWorkspaces(formattedWorkspaces);

      // Set current workspace
      let currentWsId = profile?.current_workspace_id;
      if (!currentWsId && formattedWorkspaces.length > 0) {
        currentWsId = formattedWorkspaces[0].id;
        await supabase
          .from('profiles')
          .update({ current_workspace_id: currentWsId })
          .eq('id', userId);
      }

      const current = formattedWorkspaces.find(w => w.id === currentWsId) || formattedWorkspaces[0];
      console.log('[Workspace] Current workspace:', current);
      setCurrentWorkspace(current || null);

      if (current) {
        await loadWorkspaceDetails(current.id, formattedWorkspaces, userId);
      } else {
        console.log('[Workspace] No current workspace found');
        setLoading(false);
      }
    } catch (error) {
      console.error('[Workspace] Failed to load workspaces:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [loadWorkspaceDetails]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If no user, set loading to false and return
    if (!user) {
      setLoading(false);
      hasLoadedRef.current = false;
      currentUserIdRef.current = null;
      return;
    }

    // Only load if user changed or we haven't loaded yet
    if (hasLoadedRef.current && currentUserIdRef.current === user.id) {
      return;
    }

    hasLoadedRef.current = true;
    currentUserIdRef.current = user.id;
    loadWorkspaces(user.id);
  }, [user, authLoading, loadWorkspaces]);

  const switchWorkspace = useCallback(async (workspaceId: string) => {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ current_workspace_id: workspaceId })
      .eq('id', user.id);

    const workspace = workspaces.find(w => w.id === workspaceId);
    setCurrentWorkspace(workspace || null);

    if (workspace) {
      await loadWorkspaceDetails(workspaceId, workspaces, user.id);
    }
  }, [user, workspaces, loadWorkspaceDetails]);

  const createWorkspace = useCallback(async (name: string) => {
    if (!user) return;

    const { data: newWorkspace, error } = await supabase
      .from('workspaces')
      .insert({ name, owner_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Failed to create workspace:', error);
      return;
    }

    // Add owner as member
    await supabase
      .from('workspace_members')
      .insert({
        workspace_id: newWorkspace.id,
        user_id: user.id,
        role: 'owner',
        accepted_at: new Date().toISOString(),
      });

    hasLoadedRef.current = false;
    await loadWorkspaces(user.id);
  }, [user, loadWorkspaces]);

  const inviteUser = useCallback(async (email: string, role: 'editor' | 'viewer') => {
    if (!user || !currentWorkspace) return;

    // Get current user's display name for the email
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle();

    const inviterName = profile?.display_name || user.email?.split('@')[0] || 'Alguém';

    // Check if invitation already exists and delete it first (allows resending)
    const { data: existingInvitation } = await supabase
      .from('workspace_invitations')
      .select('id')
      .eq('workspace_id', currentWorkspace.id)
      .eq('email', email)
      .maybeSingle();

    if (existingInvitation) {
      await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', existingInvitation.id);
    }

    // Insert new invitation
    const { data: invitation, error } = await supabase
      .from('workspace_invitations')
      .insert({
        workspace_id: currentWorkspace.id,
        email,
        role,
        invited_by: user.id,
      })
      .select('token')
      .single();

    if (error) {
      throw error;
    }

    // Send invite email via edge function
    try {
      const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          workspaceName: currentWorkspace.name,
          inviterName,
          token: invitation.token,
          role,
        },
      });

      if (emailError) {
        console.error('Failed to send invite email:', emailError);
        // Don't throw - invitation was created, just email failed
      }
    } catch (emailErr) {
      console.error('Email sending error:', emailErr);
    }

    await loadWorkspaceDetails(currentWorkspace.id, workspaces, user.id);
  }, [user, currentWorkspace, workspaces, loadWorkspaceDetails]);

  const removeInvitation = useCallback(async (invitationId: string) => {
    if (!user || !currentWorkspace) return;
    
    await supabase
      .from('workspace_invitations')
      .delete()
      .eq('id', invitationId);

    await loadWorkspaceDetails(currentWorkspace.id, workspaces, user.id);
  }, [user, currentWorkspace, workspaces, loadWorkspaceDetails]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!user || !currentWorkspace) return;
    
    await supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId);

    await loadWorkspaceDetails(currentWorkspace.id, workspaces, user.id);
  }, [user, currentWorkspace, workspaces, loadWorkspaceDetails]);

  const updateMemberRole = useCallback(async (memberId: string, role: 'editor' | 'viewer') => {
    if (!user || !currentWorkspace) return;
    
    await supabase
      .from('workspace_members')
      .update({ role })
      .eq('id', memberId);

    await loadWorkspaceDetails(currentWorkspace.id, workspaces, user.id);
  }, [user, currentWorkspace, workspaces, loadWorkspaceDetails]);

  const refreshWorkspace = useCallback(async () => {
    if (!user) return;
    hasLoadedRef.current = false;
    await loadWorkspaces(user.id);
  }, [user, loadWorkspaces]);

  const canEdit = userRole === 'owner' || userRole === 'editor';

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        members,
        invitations,
        loading,
        userRole,
        canEdit,
        switchWorkspace,
        createWorkspace,
        inviteUser,
        removeInvitation,
        removeMember,
        updateMemberRole,
        refreshWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
