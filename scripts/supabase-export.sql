-- Re-export the register from the "AI Reg Index" Supabase project
-- (project ref: ypdgkpcorvvpgzofjtxh).
--
-- Run query 1, transform the rows into src/data/entries.json (see the shape
-- of the existing file: camelCase keys, `ref` instead of `framework_ref`,
-- effectiveDate/verifiedAt as plain YYYY-MM-DD).
-- Run query 2 for any entry that gains a full dossier, into src/data/dossiers.json
-- keyed by section number.
-- Then `npm run build` and commit the regenerated JSON.

-- 1. Entries + primary source + framework mappings
select
  e.section_number      as section,
  e.jurisdiction,
  e.instrument_name     as name,
  e.citation,
  e.standing,
  to_char(e.effective_date, 'YYYY-MM-DD')      as "effectiveDate",
  to_char(e.verified_at,    'YYYY-MM-DD')      as "verifiedAt",
  e.gloss,
  e.tags,
  e.source_kind         as "sourceKind",
  s.url                 as "sourceUrl",
  s.label               as "sourceLabel",
  coalesce(
    (select jsonb_agg(
       jsonb_build_object('framework', ef.framework, 'ref', ef.framework_ref)
       order by ef.framework)
     from entry_frameworks ef where ef.entry_id = e.id),
    '[]'::jsonb) as frameworks
from entries e
left join sources s on s.id = e.source_id
order by e.section_number;

-- 2. Dossiers (rich per-entry content)
select
  e.section_number as section,
  d.who_it_binds, d.executive_brief, d.paradigm_shift_title, d.paradigm_shift_body,
  d.scorecard, d.timeline, d.checklist, d.penalties, d.pitfalls
from entry_dossiers d
join entries e on e.id = d.entry_id
order by e.section_number;
