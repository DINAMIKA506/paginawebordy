-- Ordy 2.0 para el proyecto Supabase que ya utiliza Impronte Vitale.
-- Todas las tablas llevan prefijo ordy_ para mantener separados ambos productos.
-- Ejecutar completo en Supabase > SQL Editor antes de activar la nueva portada.

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.ordy_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email citext not null unique,
  phone text not null default '',
  company text not null default '',
  stage text not null default 'chat' check (stage in ('chat','solicitud','en_proceso','entregado','activo','pausado')),
  tags jsonb not null default '[]'::jsonb check (jsonb_typeof(tags) = 'array'),
  notes text not null default '',
  payment_status text not null default 'sin_definir' check (payment_status in ('sin_definir','pendiente','al_dia','atrasado')),
  payment_amount numeric(14,2),
  payment_due date,
  active boolean not null default false,
  requested_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ordy_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  contact_id uuid references public.ordy_contacts(id) on delete set null,
  email citext not null unique,
  username citext not null unique check (username ~ '^[a-zA-Z0-9._-]{4,50}$'),
  display_name text not null check (char_length(display_name) between 2 and 120),
  role text not null default 'user' check (role in ('user','admin')),
  must_change_password boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ordy_conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.ordy_contacts(id) on delete cascade,
  public_token_hash text not null unique check (char_length(public_token_hash) = 64),
  status text not null default 'abierto' check (status in ('abierto','cerrado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_visitor_at timestamptz,
  last_admin_at timestamptz
);

create table if not exists public.ordy_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ordy_conversations(id) on delete cascade,
  sender text not null check (sender in ('visitante','admin')),
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.ordy_space_requests (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.ordy_contacts(id) on delete cascade,
  conversation_id uuid references public.ordy_conversations(id) on delete set null,
  order_text text not null,
  current_tools text not null default '',
  urgency text not null default 'Media' check (urgency in ('Baja','Media','Alta')),
  wish text not null default '',
  comments text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.ordy_user_oceans (
  user_id uuid primary key references public.ordy_profiles(id) on delete cascade,
  data_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.ordy_rate_limits (
  key_hash text primary key,
  request_count integer not null default 0,
  reset_at timestamptz not null
);

create index if not exists ordy_contacts_stage_updated_idx on public.ordy_contacts(stage, updated_at desc);
create index if not exists ordy_conversations_contact_updated_idx on public.ordy_conversations(contact_id, updated_at desc);
create index if not exists ordy_messages_conversation_created_idx on public.ordy_messages(conversation_id, created_at);
create index if not exists ordy_requests_contact_created_idx on public.ordy_space_requests(contact_id, created_at desc);

create or replace function public.ordy_consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.ordy_rate_limits(key_hash, request_count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key_hash) do update
  set request_count = case
        when public.ordy_rate_limits.reset_at <= now() then 1
        else public.ordy_rate_limits.request_count + 1
      end,
      reset_at = case
        when public.ordy_rate_limits.reset_at <= now() then now() + make_interval(secs => p_window_seconds)
        else public.ordy_rate_limits.reset_at
      end
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

alter table public.ordy_contacts enable row level security;
alter table public.ordy_profiles enable row level security;
alter table public.ordy_conversations enable row level security;
alter table public.ordy_messages enable row level security;
alter table public.ordy_space_requests enable row level security;
alter table public.ordy_user_oceans enable row level security;
alter table public.ordy_rate_limits enable row level security;

revoke all on table public.ordy_contacts from anon, authenticated;
revoke all on table public.ordy_profiles from anon, authenticated;
revoke all on table public.ordy_conversations from anon, authenticated;
revoke all on table public.ordy_messages from anon, authenticated;
revoke all on table public.ordy_space_requests from anon, authenticated;
revoke all on table public.ordy_user_oceans from anon, authenticated;
revoke all on table public.ordy_rate_limits from anon, authenticated;
revoke all on function public.ordy_consume_rate_limit(text, integer, integer) from public, anon, authenticated;

grant all on table public.ordy_contacts to service_role;
grant all on table public.ordy_profiles to service_role;
grant all on table public.ordy_conversations to service_role;
grant all on table public.ordy_messages to service_role;
grant all on table public.ordy_space_requests to service_role;
grant all on table public.ordy_user_oceans to service_role;
grant all on table public.ordy_rate_limits to service_role;
grant execute on function public.ordy_consume_rate_limit(text, integer, integer) to service_role;

comment on table public.ordy_contacts is 'Personas que conversan o solicitan un océano en Ordy.';
comment on table public.ordy_profiles is 'Perfil de acceso Ordy vinculado a Supabase Auth.';
comment on table public.ordy_user_oceans is 'Contenido privado del océano de cada cuenta Ordy.';
