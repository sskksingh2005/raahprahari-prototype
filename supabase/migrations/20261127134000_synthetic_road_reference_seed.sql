-- Synthetic corridor and segment reference data from src/data/fixtures.ts (BE1-11).
-- Fixture polylines are approximate and are intentionally not inserted as centerlines.

create table if not exists public.road_corridors (
  id text primary key,
  code text not null unique,
  name text not null,
  stops text[] not null,
  is_synthetic boolean not null default true,
  created_at timestamptz not null default pg_catalog.now()
);

alter table public.road_segments
  add column if not exists is_synthetic boolean;

alter table public.road_corridors enable row level security;
revoke all on table public.road_corridors from public, anon, authenticated;
grant select on table public.road_corridors to service_role;

comment on table public.road_corridors is
  'Corridor reference values seeded from synthetic application fixtures; no route geometry is stored here.';
comment on column public.road_segments.is_synthetic is
  'True for explicitly synthetic fixture rows; null means existing data was not classified by this seed.';

insert into public.road_corridors (id, code, name, stops, is_synthetic)
values
  ('nh7', 'NH-7', 'Rishikesh – Badrinath', array['rishikesh', 'devprayag', 'srinagar', 'rudraprayag', 'karnaprayag', 'chamoli', 'joshimath', 'badrinath'], true),
  ('nh107', 'NH-107', 'Rudraprayag – Gaurikund', array['rudraprayag', 'agastyamuni', 'guptkashi', 'sonprayag', 'gaurikund'], true),
  ('nh34', 'NH-34', 'Rishikesh – Gangotri', array['rishikesh', 'chamba', 'uttarkashi', 'harsil', 'gangotri'], true),
  ('msr', 'SH-MSR', 'Dehradun – Mussoorie', array['dehradun', 'mussoorie'], true),
  ('ddn', 'NH-7D', 'Dehradun – Rishikesh', array['dehradun', 'doiwala', 'rishikesh'], true),
  ('hrd', 'NH-7H', 'Haridwar – Rishikesh', array['haridwar', 'rishikesh'], true),
  ('ntl', 'NH-109', 'Haldwani – Nainital', array['haldwani', 'kathgodam', 'bhowali', 'nainital'], true),
  ('alm', 'NH-109A', 'Bhowali – Almora', array['bhowali', 'khairna', 'almora'], true),
  ('bgs', 'SH-BGS', 'Almora – Bageshwar', array['almora', 'takula', 'bageshwar'], true),
  ('pth', 'SH-PTH', 'Almora – Pithoragarh', array['almora', 'seraghat', 'gangolihat', 'pithoragarh'], true),
  ('nh9', 'NH-9', 'Tanakpur – Pithoragarh', array['tanakpur', 'champawat', 'lohaghat', 'pithoragarh'], true),
  ('pau', 'NH-534', 'Kotdwar – Pauri', array['kotdwar', 'satpuli', 'pauri'], true),
  ('psn', 'SH-PSN', 'Pauri – Srinagar', array['pauri', 'srinagar'], true),
  ('rud', 'NH-109R', 'Rudrapur – Haldwani', array['rudrapur', 'haldwani'], true)
on conflict do nothing;

insert into public.road_segments (
  id,
  corridor_id,
  code,
  from_place_id,
  to_place_id,
  km_start,
  km_end,
  distance_km,
  typical_minutes,
  is_synthetic
)
values
  ('nh7-01', 'nh7', 'NH-7 · 01', 'rishikesh', 'devprayag', 0, 74, 74, 150, true),
  ('nh7-02', 'nh7', 'NH-7 · 02', 'devprayag', 'srinagar', 74, 109, 35, 60, true),
  ('nh7-03', 'nh7', 'NH-7 · 03', 'srinagar', 'rudraprayag', 109, 142, 33, 60, true),
  ('nh7-04', 'nh7', 'NH-7 · 04', 'rudraprayag', 'karnaprayag', 142, 173, 31, 55, true),
  ('nh7-05', 'nh7', 'NH-7 · 05', 'karnaprayag', 'chamoli', 173, 212, 39, 70, true),
  ('nh7-06', 'nh7', 'NH-7 · 06', 'chamoli', 'joshimath', 212, 259, 47, 90, true),
  ('nh7-07', 'nh7', 'NH-7 · 07', 'joshimath', 'badrinath', 259, 303, 44, 90, true),
  ('nh107-01', 'nh107', 'NH-107 · 01', 'rudraprayag', 'agastyamuni', 0, 18, 18, 35, true),
  ('nh107-02', 'nh107', 'NH-107 · 02', 'agastyamuni', 'guptkashi', 18, 44, 26, 50, true),
  ('nh107-03', 'nh107', 'NH-107 · 03', 'guptkashi', 'sonprayag', 44, 75, 31, 60, true),
  ('nh107-04', 'nh107', 'NH-107 · 04', 'sonprayag', 'gaurikund', 75, 80, 5, 15, true),
  ('nh34-01', 'nh34', 'NH-34 · 01', 'rishikesh', 'chamba', 0, 60, 60, 120, true),
  ('nh34-02', 'nh34', 'NH-34 · 02', 'chamba', 'uttarkashi', 60, 148, 88, 180, true),
  ('nh34-03', 'nh34', 'NH-34 · 03', 'uttarkashi', 'harsil', 148, 221, 73, 150, true),
  ('nh34-04', 'nh34', 'NH-34 · 04', 'harsil', 'gangotri', 221, 246, 25, 45, true),
  ('msr-01', 'msr', 'SH-MSR · 01', 'dehradun', 'mussoorie', 0, 34, 34, 75, true),
  ('ddn-01', 'ddn', 'NH-7D · 01', 'dehradun', 'doiwala', 0, 20, 20, 35, true),
  ('ddn-02', 'ddn', 'NH-7D · 02', 'doiwala', 'rishikesh', 20, 45, 25, 40, true),
  ('hrd-01', 'hrd', 'NH-7H · 01', 'haridwar', 'rishikesh', 0, 24, 24, 45, true),
  ('ntl-01', 'ntl', 'NH-109 · 01', 'haldwani', 'kathgodam', 0, 7, 7, 15, true),
  ('ntl-02', 'ntl', 'NH-109 · 02', 'kathgodam', 'bhowali', 7, 37, 30, 60, true),
  ('ntl-03', 'ntl', 'NH-109 · 03', 'bhowali', 'nainital', 37, 48, 11, 25, true),
  ('alm-01', 'alm', 'NH-109A · 01', 'bhowali', 'khairna', 0, 22, 22, 40, true),
  ('alm-02', 'alm', 'NH-109A · 02', 'khairna', 'almora', 22, 64, 42, 80, true),
  ('bgs-01', 'bgs', 'SH-BGS · 01', 'almora', 'takula', 0, 30, 30, 60, true),
  ('bgs-02', 'bgs', 'SH-BGS · 02', 'takula', 'bageshwar', 30, 72, 42, 80, true),
  ('pth-01', 'pth', 'SH-PTH · 01', 'almora', 'seraghat', 0, 45, 45, 90, true),
  ('pth-02', 'pth', 'SH-PTH · 02', 'seraghat', 'gangolihat', 45, 75, 30, 60, true),
  ('pth-03', 'pth', 'SH-PTH · 03', 'gangolihat', 'pithoragarh', 75, 125, 50, 100, true),
  ('nh9-01', 'nh9', 'NH-9 · 01', 'tanakpur', 'champawat', 0, 75, 75, 150, true),
  ('nh9-02', 'nh9', 'NH-9 · 02', 'champawat', 'lohaghat', 75, 89, 14, 25, true),
  ('nh9-03', 'nh9', 'NH-9 · 03', 'lohaghat', 'pithoragarh', 89, 151, 62, 120, true),
  ('pau-01', 'pau', 'NH-534 · 01', 'kotdwar', 'satpuli', 0, 55, 55, 100, true),
  ('pau-02', 'pau', 'NH-534 · 02', 'satpuli', 'pauri', 55, 105, 50, 95, true),
  ('psn-01', 'psn', 'SH-PSN · 01', 'pauri', 'srinagar', 0, 30, 30, 60, true),
  ('rud-01', 'rud', 'NH-109R · 01', 'rudrapur', 'haldwani', 0, 40, 40, 60, true)
on conflict do nothing;

grant select (is_synthetic) on public.road_segments to anon, authenticated;
