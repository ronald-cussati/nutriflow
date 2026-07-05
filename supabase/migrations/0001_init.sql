-- NutriFlow AI — schema inicial
-- Rode este arquivo inteiro no SQL Editor do Supabase (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ══════════════════════════════════════════
-- TABELAS
-- ══════════════════════════════════════════

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('medico','nutricionista','enfermeiro','cozinheiro','admin','paciente')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  age int not null,
  room text not null,
  gender text,
  conditions text[] not null default '{}',
  restrictions text[] not null default '{}',
  notes text,
  status text not null default 'Internado' check (status in ('Internado','Alta')),
  admission_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  status text not null default 'Rascunho' check (status in ('Rascunho','Aprovado')),
  meals jsonb not null default '{}',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_meals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  date date not null default current_date,
  type text not null check (type in ('Café da Manhã','Lanche da Manhã','Almoço','Lanche da Tarde','Jantar','Ceia')),
  status text not null default 'Pendente' check (status in ('Pendente','Em Preparo','Pronta','Entregue')),
  items text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stock (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity numeric not null,
  unit text not null,
  expiry_date date,
  month text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  meal_type text not null,
  date date not null default current_date,
  rating int not null check (rating between 1 and 5),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'info',
  message text not null,
  patient_id uuid references public.patients(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ══════════════════════════════════════════
-- HELPER: papel do usuário logado
-- ══════════════════════════════════════════

create function public.current_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ══════════════════════════════════════════
-- RLS
-- ══════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.meal_plans enable row level security;
alter table public.daily_meals enable row level security;
alter table public.stock enable row level security;
alter table public.feedbacks enable row level security;
alter table public.alerts enable row level security;

-- profiles
create policy "profiles_select_self_or_staff" on public.profiles for select
  using (auth.uid() = id or public.current_role() in ('admin','medico'));
create policy "profiles_update_self_or_admin" on public.profiles for update
  using (auth.uid() = id or public.current_role() = 'admin');
create policy "profiles_delete_admin" on public.profiles for delete
  using (public.current_role() = 'admin');

-- patients
create policy "patients_select_staff_or_own" on public.patients for select
  using (public.current_role() in ('medico','nutricionista','enfermeiro','cozinheiro','admin')
         or (public.current_role() = 'paciente' and user_id = auth.uid()));
create policy "patients_insert_medico_admin" on public.patients for insert
  with check (public.current_role() in ('medico','admin'));
create policy "patients_update_medico_admin" on public.patients for update
  using (public.current_role() in ('medico','admin'));
create policy "patients_delete_admin" on public.patients for delete
  using (public.current_role() = 'admin');

-- meal_plans
create policy "meal_plans_select_staff_or_own" on public.meal_plans for select
  using (public.current_role() in ('medico','nutricionista','enfermeiro','cozinheiro','admin')
         or (public.current_role() = 'paciente' and patient_id in (select id from public.patients where user_id = auth.uid())));
create policy "meal_plans_insert_nutri_admin" on public.meal_plans for insert
  with check (public.current_role() in ('nutricionista','admin'));
create policy "meal_plans_update_nutri_admin" on public.meal_plans for update
  using (public.current_role() in ('nutricionista','admin'));

-- daily_meals
create policy "daily_meals_select_staff_or_own" on public.daily_meals for select
  using (public.current_role() in ('medico','nutricionista','enfermeiro','cozinheiro','admin')
         or (public.current_role() = 'paciente' and patient_id in (select id from public.patients where user_id = auth.uid())));
create policy "daily_meals_insert_nutri_admin" on public.daily_meals for insert
  with check (public.current_role() in ('nutricionista','admin'));
create policy "daily_meals_update_cozinha_admin" on public.daily_meals for update
  using (public.current_role() in ('cozinheiro','admin'));

-- stock
create policy "stock_select_staff" on public.stock for select
  using (public.current_role() in ('medico','nutricionista','enfermeiro','cozinheiro','admin'));
create policy "stock_write_cozinha_admin" on public.stock for insert
  with check (public.current_role() in ('cozinheiro','admin'));
create policy "stock_update_cozinha_admin" on public.stock for update
  using (public.current_role() in ('cozinheiro','admin'));
create policy "stock_delete_cozinha_admin" on public.stock for delete
  using (public.current_role() in ('cozinheiro','admin'));

-- feedbacks
create policy "feedbacks_select_staff_or_own" on public.feedbacks for select
  using (public.current_role() in ('medico','nutricionista','enfermeiro','cozinheiro','admin')
         or (public.current_role() = 'paciente' and patient_id in (select id from public.patients where user_id = auth.uid())));
create policy "feedbacks_insert_enfermeiro_admin" on public.feedbacks for insert
  with check (public.current_role() in ('enfermeiro','admin')
              or (public.current_role() = 'paciente' and patient_id in (select id from public.patients where user_id = auth.uid())));

-- alerts
create policy "alerts_select_staff" on public.alerts for select
  using (public.current_role() in ('medico','nutricionista','enfermeiro','cozinheiro','admin'));
create policy "alerts_insert_staff" on public.alerts for insert
  with check (public.current_role() in ('medico','nutricionista','enfermeiro','cozinheiro','admin'));
create policy "alerts_update_staff" on public.alerts for update
  using (public.current_role() in ('medico','nutricionista','enfermeiro','cozinheiro','admin'));
