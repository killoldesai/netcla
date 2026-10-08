from pathlib import Path
root = Path(__file__).resolve().parent
p = root / 'build_revised_plan.py'
t = p.read_text(encoding='utf-8')
t = t.replace("database='Not supplied'", "database='US (user confirmed)'")
t = t.replace('database unverified', 'US database (user confirmed)').replace('database unknown', 'US database (user confirmed)')
p.write_text(t, encoding='utf-8')
p = root / 'revised-seo-plan/netofficials-revised-organic-growth-plan.md'
t = p.read_text(encoding='utf-8')
t = t.replace('The **SEMrush country database, selected report month and export filters were not supplied**. Keyword-level timestamps are not proof of database or export date. Every volume/KD figure in this plan is an observed export metric with unverified geography. Do not present these figures as India demand, global demand, or aggregate across countries.', 'The user confirmed the **US SEMrush database** for the supplied exports. The selected report month and export filters were not supplied. Keyword-level timestamps are not proof of export date. Every volume/KD figure in this plan is a US export metric. Do not present these figures as India or global demand, or aggregate them across countries.')
t = t.replace('Volum' + 'es are not added across synonyms', 'US volumes are not added across synonyms')
t = t.replace('keyword database confirmation', 'keyword report settings review')
t = t.replace('SEMrush database/report-month/filter confirmation for all files.', 'SEMrush report-month/filter confirmation for all files; US database confirmed by the user.')
t = t.replace('The US is a reasonable first global research candidate because of current impressions, but is not a confirmed highest-converting market. Obtain India and US exports separately, then compare buyer intent and service fit.', 'The US is the initial global keyword research market, supported by confirmed US competitor exports and current impressions, but is not a confirmed highest-converting market. Obtain India exports separately and supplement US keyword coverage, then compare buyer intent and service fit.')
p.write_text(t, encoding='utf-8')
