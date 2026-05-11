
-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'customer');
create type public.order_status as enum ('received', 'confirmed', 'packing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
create type public.payment_method as enum ('cod', 'upi', 'card');
create type public.delivery_slot as enum ('morning', 'afternoon', 'evening', 'night');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'customer',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ============ AUTO-CREATE PROFILE + DEFAULT ROLE ON SIGNUP ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.phone, new.raw_user_meta_data ->> 'phone', '')
  );
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- ============ ADDRESSES ============
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  line1 text not null,
  line2 text,
  city text not null default 'New Delhi',
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.addresses enable row level security;
create index addresses_user_idx on public.addresses(user_id);

-- ============ CATEGORIES ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  emoji text,
  bg text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;

-- ============ PRODUCTS ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  qty text not null,
  price numeric(10,2) not null check (price >= 0),
  mrp numeric(10,2) not null check (mrp >= 0),
  emoji text,
  bg text,
  description text,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create index products_category_idx on public.products(category_id);
create trigger products_touch before update on public.products
  for each row execute procedure public.touch_updated_at();

-- ============ ORDERS ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('SSBB' || to_char(now(),'YYMMDD') || lpad(floor(random()*100000)::text, 5, '0')),
  user_id uuid not null references auth.users(id) on delete cascade,
  status order_status not null default 'received',
  payment_method payment_method not null default 'cod',
  delivery_slot delivery_slot not null,
  delivery_date date not null default current_date,
  address_snapshot jsonb not null,
  subtotal numeric(10,2) not null,
  gst numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  coupon_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create index orders_user_idx on public.orders(user_id, created_at desc);
create trigger orders_touch before update on public.orders
  for each row execute procedure public.touch_updated_at();

-- ============ ORDER ITEMS ============
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  qty_label text not null,
  emoji text,
  bg text,
  unit_price numeric(10,2) not null,
  unit_mrp numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null
);
alter table public.order_items enable row level security;
create index order_items_order_idx on public.order_items(order_id);

-- ============ RLS POLICIES ============

-- profiles
create policy "Users view own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins manage profiles"
  on public.profiles for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- user_roles (read own + admin manage)
create policy "Users view own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Admins manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- addresses
create policy "Users manage own addresses"
  on public.addresses for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins view addresses"
  on public.addresses for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

-- categories - public read
create policy "Anyone can read categories"
  on public.categories for select to anon, authenticated using (true);
create policy "Admins manage categories"
  on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- products - public read
create policy "Anyone can read products"
  on public.products for select to anon, authenticated using (true);
create policy "Admins manage products"
  on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- orders
create policy "Users view own orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Users create own orders"
  on public.orders for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Admins update orders"
  on public.orders for update to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- order_items
create policy "Users view own order items"
  on public.order_items for select to authenticated
  using (
    exists (select 1 from public.orders o
            where o.id = order_id
              and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin')))
  );
create policy "Users create order items for own orders"
  on public.order_items for insert to authenticated
  with check (
    exists (select 1 from public.orders o
            where o.id = order_id and o.user_id = auth.uid())
  );
