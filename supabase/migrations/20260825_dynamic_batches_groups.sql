-- Dynamic class and group model for PSGMX.
-- Safe migration: adds new tables/columns while preserving existing users/progress.

create extension if not exists pgcrypto;

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  display_name text not null,
  is_active boolean not null default true,
  display_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists batch_groups (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references batches(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  display_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, name)
);

alter table users
  add column if not exists batch_id uuid references batches(id) on delete set null,
  add column if not exists group_id uuid references batch_groups(id) on delete set null,
  add column if not exists batch_code text,
  add column if not exists batch_display_name text,
  add column if not exists group_name text;

create index if not exists idx_users_batch_id on users(batch_id);
create index if not exists idx_users_group_id on users(group_id);
create index if not exists idx_users_batch_code on users(batch_code);
create index if not exists idx_users_group_name on users(group_name);

-- Backfill default classes based on roll number prefix when possible.
insert into batches (code, display_name, display_order)
select distinct
  upper(substring(u.roll_num from '^(\d{2})mx') || 'MX') as code,
  upper(substring(u.roll_num from '^(\d{2})mx') || 'MX') as display_name,
  row_number() over (order by upper(substring(u.roll_num from '^(\d{2})mx') || 'MX')) as display_order
from users u
where u.roll_num ~* '^\d{2}mx\d+'
on conflict (code) do nothing;

-- Backfill groups per batch from existing users.class value.
insert into batch_groups (batch_id, name, display_order)
select b.id, u.class as name,
  row_number() over (partition by b.id order by u.class)
from users u
join batches b on b.code = upper(substring(u.roll_num from '^(\d{2})mx') || 'MX')
where coalesce(u.class, '') <> ''
group by b.id, u.class
on conflict (batch_id, name) do nothing;

-- Backfill user mapping columns.
update users u
set
  batch_id = b.id,
  batch_code = b.code,
  batch_display_name = b.display_name,
  group_name = coalesce(nullif(u.group_name, ''), nullif(u.class, '')),
  group_id = g.id
from batches b
left join batch_groups g on g.batch_id = b.id and g.name = coalesce(nullif(u.group_name, ''), nullif(u.class, ''))
where b.code = upper(substring(u.roll_num from '^(\d{2})mx') || 'MX');
