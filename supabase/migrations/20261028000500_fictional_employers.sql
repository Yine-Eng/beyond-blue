-- Fictional alumni must not appear to work for real organisations. Every seeded employer gets
-- an invented name (real universities stay as grad_school), plus a bio typo fix.

create temporary table employer_renames (old_name text primary key, new_name text not null);
insert into employer_renames (old_name, new_name) values
  ('Peachtree Digital', 'Halcyra Digital'),
  ('Southline Logistics', 'Trevamo Logistics'),
  ('Bluegrass Health Network', 'Wrenfield Health Analytics'),
  ('Ridgeway Coffee Co.', 'Quillberry Coffee Co.'),
  ('Mountain State Software', 'Brackenhill Software'),
  ('Kanawha Valley Medical Center', 'Dunmarrow Medical Center'),
  ('Mercer County Sheriff''s Office', 'Tessaly County Sheriff''s Office'),
  ('Mercer County Schools', 'Tessaly County Schools'),
  ('Allegheny Engineering Group', 'Ironvane Engineering Group'),
  ('Blue Ridge Financial Partners', 'Marrowind Financial Partners'),
  ('Appalachian Family Services', 'Hollowmere Family Services'),
  ('Shenandoah Systems', 'Vantrell Systems'),
  ('Summit Health Partners', 'Ambervale Health Partners'),
  ('Turner Mobile Detailing', 'Two-Bucket Mobile Detailing'),
  ('Riverbend Manufacturing', 'Stellmark Manufacturing'),
  ('Tri-State Medical Group', 'Northvane Medical Group'),
  ('Southern Highlands Foundation', 'Laurelwick Foundation'),
  ('Volt Grid Solutions', 'Gridwren Power Solutions'),
  ('Lumen Labs', 'Pixelfern Labs'),
  ('Mountain State SBDC', 'Founders'' Lantern Business Center'),
  ('Bluefield State University', 'Tessaly Community College'),
  ('Ledger & Line CPAs', 'Tallymark & Quill CPAs'),
  ('Emory Vaccine Center', 'Larkhaven Research Institute'),
  ('New River Counseling', 'Stillbrook Counseling'),
  ('Appalachian Craft Goods', 'Hearthknot Craft Goods'),
  ('Piedmont Care Hospital', 'Dovecrest Hospital'),
  ('Teach for Appalachia', 'Lanternway Teaching Fellows');

update public.mentor_profiles m
set employer = r.new_name
from employer_renames r
where m.is_seeded_fictional and m.employer = r.old_name;

-- Match reasons were stored as text at request time ("Works at Peachtree Digital · …").
update public.connections c
set match_reason = replace(c.match_reason, 'Works at ' || r.old_name, 'Works at ' || r.new_name)
from employer_renames r
where c.match_reason like '%Works at ' || r.old_name || '%';

update public.mentor_profiles
set role_title = 'Teaching Fellow'
where is_seeded_fictional and display_name = 'Owen Parker';

update public.mentor_profiles
set bio = 'Working in college admissions close to home and always happy to talk next steps, grad options or just thinking out loud.'
where is_seeded_fictional and display_name = 'Jasmine Wright';

update public.mentor_profiles
set bio = replace(bio, 'visas questions', 'visa questions')
where is_seeded_fictional and display_name = 'Priya Raman';

drop table employer_renames;
