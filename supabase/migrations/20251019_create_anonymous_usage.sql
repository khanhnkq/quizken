-- Track anonymous usage by IP + fingerprint per day
create table if not exists public.anonymous_usage (
  id bigserial primary key,
  ip text not null,
  fingerprint text not null,
  user_agent text,
  day_date date not null,
  count integer not null default 0,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Ensure one row per (ip,fingerprint,day)
create unique index if not exists ux_anonymous_usage_ip_fp_day
  on public.anonymous_usage (ip, fingerprint, day_date);

-- Speed up date queries
create index if not exists idx_anonymous_usage_day
  on public.anonymous_usage (day_date);

-- Enable RLS and deny by default (service role bypasses RLS)
alter table public.anonymous_usage enable row level security;

drop policy if exists "deny all" on public.anonymous_usage;
create policy "deny all" on public.anonymous_usage
  for all
  using (false)
  with check (false);

comment on table public.anonymous_usage is 'Anonymous per-day usage for rate limiting by IP + device fingerprint. Managed by Edge Function using service role.';