alter table if exists public.coupons
add column if not exists minimum_order_amount numeric not null default 0,
add column if not exists expires_at date,
add column if not exists first_order_only boolean not null default false;
