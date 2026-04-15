CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: workspace_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.workspace_role AS ENUM (
    'owner',
    'editor',
    'viewer'
);


--
-- Name: can_edit_workspace(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_edit_workspace(ws_id uuid, uid uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = uid AND role IN ('owner', 'editor') AND accepted_at IS NOT NULL
  ) OR EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = ws_id AND owner_id = uid
  )
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user_workspace(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_workspace() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Create a default workspace for the new user
  INSERT INTO public.workspaces (name, owner_id)
  VALUES ('Meu Espaço', NEW.id)
  RETURNING id INTO new_workspace_id;
  
  -- Add owner as member
  INSERT INTO public.workspace_members (workspace_id, user_id, role, accepted_at)
  VALUES (new_workspace_id, NEW.id, 'owner', now());
  
  -- Update profile with current workspace
  UPDATE public.profiles SET current_workspace_id = new_workspace_id WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;


--
-- Name: is_workspace_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_workspace_member(ws_id uuid, uid uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = uid AND accepted_at IS NOT NULL
  ) OR EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = ws_id AND owner_id = uid
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    category_id uuid NOT NULL,
    limit_amount numeric NOT NULL,
    period text DEFAULT 'monthly'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    workspace_id uuid,
    CONSTRAINT budgets_period_check CHECK ((period = ANY (ARRAY['monthly'::text, 'weekly'::text])))
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    icon text DEFAULT 'Circle'::text NOT NULL,
    color text DEFAULT '#6366f1'::text NOT NULL,
    type text NOT NULL,
    budget_limit numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    workspace_id uuid,
    CONSTRAINT categories_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text])))
);


--
-- Name: event_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    name text NOT NULL,
    quantity numeric DEFAULT 1 NOT NULL,
    unit_price numeric DEFAULT 0 NOT NULL,
    category text DEFAULT 'outros'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: event_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    name text NOT NULL,
    is_child boolean DEFAULT false NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    amount_due numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    created_by uuid NOT NULL,
    name text NOT NULL,
    description text,
    event_date date,
    adults_count integer DEFAULT 0 NOT NULL,
    children_count integer DEFAULT 0 NOT NULL,
    children_percentage numeric DEFAULT 50 NOT NULL,
    total_budget numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    display_name text,
    cycle_start_day integer DEFAULT 1 NOT NULL,
    currency text DEFAULT 'BRL'::text NOT NULL,
    locale text DEFAULT 'pt-BR'::text NOT NULL,
    notifications_enabled boolean DEFAULT true NOT NULL,
    google_calendar_api_key text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    current_workspace_id uuid
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    amount numeric NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    category_id uuid,
    date date NOT NULL,
    notes text,
    recurrence_type text DEFAULT 'none'::text NOT NULL,
    installment_number integer,
    total_installments integer,
    parent_transaction_id uuid,
    recurrence_interval text,
    recurrence_end_date date,
    notify boolean DEFAULT false NOT NULL,
    calendar_event_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    group_id uuid,
    workspace_id uuid,
    CONSTRAINT transactions_recurrence_interval_check CHECK ((recurrence_interval = ANY (ARRAY['weekly'::text, 'monthly'::text, 'yearly'::text]))),
    CONSTRAINT transactions_recurrence_type_check CHECK ((recurrence_type = ANY (ARRAY['none'::text, 'installment'::text, 'subscription'::text]))),
    CONSTRAINT transactions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text]))),
    CONSTRAINT transactions_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text])))
);


--
-- Name: workspace_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    email text NOT NULL,
    role public.workspace_role DEFAULT 'viewer'::public.workspace_role NOT NULL,
    invited_by uuid NOT NULL,
    token uuid DEFAULT gen_random_uuid() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workspace_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspace_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.workspace_role DEFAULT 'viewer'::public.workspace_role NOT NULL,
    invited_by uuid,
    invited_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone
);


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text DEFAULT 'Meu Espaço'::text NOT NULL,
    owner_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_user_id_category_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_category_id_key UNIQUE (user_id, category_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: event_items event_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_items
    ADD CONSTRAINT event_items_pkey PRIMARY KEY (id);


--
-- Name: event_participants event_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: workspace_invitations workspace_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT workspace_invitations_pkey PRIMARY KEY (id);


--
-- Name: workspace_invitations workspace_invitations_workspace_id_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT workspace_invitations_workspace_id_email_key UNIQUE (workspace_id, email);


--
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (id);


--
-- Name: workspace_members workspace_members_workspace_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_user_id_key UNIQUE (workspace_id, user_id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: idx_budgets_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_budgets_workspace ON public.budgets USING btree (workspace_id);


--
-- Name: idx_categories_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_workspace ON public.categories USING btree (workspace_id);


--
-- Name: idx_event_items_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_items_event ON public.event_items USING btree (event_id);


--
-- Name: idx_event_participants_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_participants_event ON public.event_participants USING btree (event_id);


--
-- Name: idx_events_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_workspace ON public.events USING btree (workspace_id);


--
-- Name: idx_transactions_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_group_id ON public.transactions USING btree (group_id);


--
-- Name: idx_transactions_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_workspace ON public.transactions USING btree (workspace_id);


--
-- Name: idx_workspace_members_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspace_members_user ON public.workspace_members USING btree (user_id);


--
-- Name: idx_workspace_members_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workspace_members_workspace ON public.workspace_members USING btree (workspace_id);


--
-- Name: profiles on_profile_created_create_workspace; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_created_create_workspace AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_workspace();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: transactions update_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: budgets budgets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: budgets budgets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: budgets budgets_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id);


--
-- Name: categories categories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: categories categories_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id);


--
-- Name: event_items event_items_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_items
    ADD CONSTRAINT event_items_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_participants event_participants_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_participants
    ADD CONSTRAINT event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: events events_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_current_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_current_workspace_id_fkey FOREIGN KEY (current_workspace_id) REFERENCES public.workspaces(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_parent_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_parent_transaction_id_fkey FOREIGN KEY (parent_transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id);


--
-- Name: workspace_invitations workspace_invitations_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_invitations
    ADD CONSTRAINT workspace_invitations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspace_members workspace_members_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: workspace_invitations Editors can create invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Editors can create invitations" ON public.workspace_invitations FOR INSERT WITH CHECK (public.can_edit_workspace(workspace_id, auth.uid()));


--
-- Name: workspace_invitations Editors can delete invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Editors can delete invitations" ON public.workspace_invitations FOR DELETE USING (public.can_edit_workspace(workspace_id, auth.uid()));


--
-- Name: event_items Editors can manage event items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Editors can manage event items" ON public.event_items USING ((EXISTS ( SELECT 1
   FROM public.events
  WHERE ((events.id = event_items.event_id) AND public.can_edit_workspace(events.workspace_id, auth.uid())))));


--
-- Name: event_participants Editors can manage participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Editors can manage participants" ON public.event_participants USING ((EXISTS ( SELECT 1
   FROM public.events
  WHERE ((events.id = event_participants.event_id) AND public.can_edit_workspace(events.workspace_id, auth.uid())))));


--
-- Name: workspace_invitations Editors can view invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Editors can view invitations" ON public.workspace_invitations FOR SELECT USING ((public.can_edit_workspace(workspace_id, auth.uid()) OR (email = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text)));


--
-- Name: event_items Members can view event items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view event items" ON public.event_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.events
  WHERE ((events.id = event_items.event_id) AND public.is_workspace_member(events.workspace_id, auth.uid())))));


--
-- Name: event_participants Members can view participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view participants" ON public.event_participants FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.events
  WHERE ((events.id = event_participants.event_id) AND public.is_workspace_member(events.workspace_id, auth.uid())))));


--
-- Name: workspaces Members can view their workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view their workspaces" ON public.workspaces FOR SELECT USING (public.is_workspace_member(id, auth.uid()));


--
-- Name: workspace_members Members can view workspace members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view workspace members" ON public.workspace_members FOR SELECT USING (public.is_workspace_member(workspace_id, auth.uid()));


--
-- Name: workspaces Owners can manage their workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can manage their workspaces" ON public.workspaces USING ((owner_id = auth.uid()));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: events Workspace editors can create events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can create events" ON public.events FOR INSERT WITH CHECK (public.can_edit_workspace(workspace_id, auth.uid()));


--
-- Name: budgets Workspace editors can delete budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can delete budgets" ON public.budgets FOR DELETE USING (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.can_edit_workspace(workspace_id, auth.uid()))));


--
-- Name: categories Workspace editors can delete categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can delete categories" ON public.categories FOR DELETE USING (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.can_edit_workspace(workspace_id, auth.uid()))));


--
-- Name: events Workspace editors can delete events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can delete events" ON public.events FOR DELETE USING (public.can_edit_workspace(workspace_id, auth.uid()));


--
-- Name: transactions Workspace editors can delete transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can delete transactions" ON public.transactions FOR DELETE USING (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.can_edit_workspace(workspace_id, auth.uid()))));


--
-- Name: budgets Workspace editors can insert budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can insert budgets" ON public.budgets FOR INSERT WITH CHECK (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.can_edit_workspace(workspace_id, auth.uid()))));


--
-- Name: categories Workspace editors can insert categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can insert categories" ON public.categories FOR INSERT WITH CHECK (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.can_edit_workspace(workspace_id, auth.uid()))));


--
-- Name: transactions Workspace editors can insert transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can insert transactions" ON public.transactions FOR INSERT WITH CHECK (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.can_edit_workspace(workspace_id, auth.uid()))));


--
-- Name: budgets Workspace editors can update budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can update budgets" ON public.budgets FOR UPDATE USING (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.can_edit_workspace(workspace_id, auth.uid()))));


--
-- Name: categories Workspace editors can update categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can update categories" ON public.categories FOR UPDATE USING (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.can_edit_workspace(workspace_id, auth.uid()))));


--
-- Name: events Workspace editors can update events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can update events" ON public.events FOR UPDATE USING (public.can_edit_workspace(workspace_id, auth.uid()));


--
-- Name: transactions Workspace editors can update transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace editors can update transactions" ON public.transactions FOR UPDATE USING (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.can_edit_workspace(workspace_id, auth.uid()))));


--
-- Name: budgets Workspace members can view budgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can view budgets" ON public.budgets FOR SELECT USING (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.is_workspace_member(workspace_id, auth.uid()))));


--
-- Name: categories Workspace members can view categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can view categories" ON public.categories FOR SELECT USING (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.is_workspace_member(workspace_id, auth.uid()))));


--
-- Name: events Workspace members can view events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can view events" ON public.events FOR SELECT USING (public.is_workspace_member(workspace_id, auth.uid()));


--
-- Name: transactions Workspace members can view transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace members can view transactions" ON public.transactions FOR SELECT USING (((user_id = auth.uid()) OR ((workspace_id IS NOT NULL) AND public.is_workspace_member(workspace_id, auth.uid()))));


--
-- Name: workspace_members Workspace owners can manage members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Workspace owners can manage members" ON public.workspace_members USING ((EXISTS ( SELECT 1
   FROM public.workspaces
  WHERE ((workspaces.id = workspace_members.workspace_id) AND (workspaces.owner_id = auth.uid())))));


--
-- Name: budgets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: event_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_items ENABLE ROW LEVEL SECURITY;

--
-- Name: event_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: workspace_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

--
-- Name: workspaces; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;