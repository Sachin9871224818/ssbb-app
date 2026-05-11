
-- Lock down search_path on touch_updated_at and revoke EXECUTE on internal helpers
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

-- Seed categories
insert into public.categories (slug, name, emoji, bg, sort_order) values
  ('vegetables','Fresh Vegetables','🥬','#E8F5D6',1),
  ('fruits','Fresh Fruits','🍎','#FFE0DA',2),
  ('dairy','Dairy & Eggs','🥛','#F2EAFE',3),
  ('snacks','Snacks & Drinks','🍿','#FFF1C9',4),
  ('essentials','Daily Essentials','🍚','#FFE7BD',5),
  ('wholesale','Wholesale Bazaar','📦','#FFD9A8',6),
  ('household','Household','🧴','#DCEEFF',7),
  ('beauty','Beauty & Care','💄','#FFD9EC',8),
  ('dryfruits','Dry Fruits','🥜','#F1E1C6',9)
on conflict (slug) do nothing;

-- Seed products
with cat as (select id, slug from public.categories)
insert into public.products (category_id, name, qty, price, mrp, emoji, bg)
select c.id, x.name, x.qty, x.price, x.mrp, x.emoji, x.bg from (values
  ('vegetables','Tomato (Local)','1 kg',28,40,'🍅','#FFE0DA'),
  ('vegetables','Onion','1 kg',32,45,'🧅','#FBE3C7'),
  ('vegetables','Potato','1 kg',25,35,'🥔','#F1E1C6'),
  ('vegetables','Green Capsicum','500 g',45,60,'🫑','#E8F5D6'),
  ('fruits','Banana Robusta','6 pcs',38,50,'🍌','#FFF1C9'),
  ('fruits','Royal Apple','1 kg',149,220,'🍎','#FFE0DA'),
  ('fruits','Pomegranate','500 g',89,120,'🍇','#FFD9EC'),
  ('dairy','Amul Taaza Milk','1 L',66,70,'🥛','#F2EAFE'),
  ('dairy','Farm Eggs','6 pcs',55,72,'🥚','#FFF1C9'),
  ('dairy','Amul Butter','100 g',58,62,'🧈','#FFE7BD'),
  ('snacks','Lays Magic Masala','52 g',18,20,'🍿','#FFF1C9'),
  ('snacks','Coca Cola','750 ml',40,45,'🥤','#FFD9DC'),
  ('snacks','Parle-G Biscuit','Pack of 4',40,50,'🍪','#FFE7BD'),
  ('essentials','Aashirvaad Atta','5 kg',245,310,'🌾','#FFE7BD'),
  ('essentials','India Gate Basmati','1 kg',119,160,'🍚','#FFF1C9'),
  ('essentials','Fortune Sunflower Oil','1 L',145,175,'🛢️','#FFE7BD'),
  ('wholesale','Wholesale Toor Dal','10 kg',1290,1600,'🫘','#FFD9A8'),
  ('wholesale','Wholesale Sugar','25 kg',1090,1300,'🍬','#FFD9A8'),
  ('household','Surf Excel Easy Wash','1 kg',132,165,'🧺','#DCEEFF'),
  ('household','Vim Dishwash Bar','300 g',28,35,'🧼','#DCEEFF'),
  ('beauty','Dove Shampoo','180 ml',175,220,'🧴','#FFD9EC'),
  ('beauty','Colgate MaxFresh','150 g',92,110,'🪥','#DCEEFF'),
  ('dryfruits','Premium Almonds','500 g',449,599,'🥜','#F1E1C6'),
  ('dryfruits','Cashew W320','250 g',299,410,'🌰','#F1E1C6')
) as x(cat_slug,name,qty,price,mrp,emoji,bg)
join cat c on c.slug = x.cat_slug;
