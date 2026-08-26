# Волна 2 новых статей — «Правовая глубина / Salva Casa» (2026-08-23)

## Что вышло

10 новых гайдов (ids 11–20 из `topics-proposal.json`), все написаны вручную под due-diligence интент:

| Slug | GEO | Слов (гейт) | Цит. блоки |
|---|---|---|---|
| salva-casa-decree-property-buyers | 91 | 2100 | 3 |
| abusi-edilizi-buying-property-italy | 92 | 2031 | 3 |
| condominio-rules-foreign-owners | 95 | 2013 | 3 |
| energy-class-ape-italy-property | 92 | 2015 | 3 |
| superbonus-aftermath-property-buyers | 92 | 2031 | 3 |
| seismic-zones-italy-property | 93 | 2013 | 3 |
| geometra-role-italy-property | 92 | 2051 | 4 |
| preliminare-trascritto-italy | 92 | 2016 | 3 |
| italy-property-insurance-guide | 93 | 2018 | 3 |
| agibilita-certificate-italy | 93 | 2024 | 3 |

Каждая: answer-first лид 50–60 слов с цифрой, вопросные H2, таблица+список в секциях, FAQ 8 вопросов, 8+ внутренних ссылок, insider tips, сценарии покупателя, ноль длинных тире, уникальный hero (Commons → Cloudinary, лицензии в `scripts/reports/hero-migration-manifest.json`).

## Верифицированные факты волны

- **Salva Casa**: DL 69/2024, конв. Legge 105/2024 (в силе с 28.07.2024). Градуированные допуски для работ до 24.05.2024: 2% свыше 500 кв. м / 3% 300–500 / 4% 100–300 / 5% до 100 / 6% до 60 кв. м; для более поздних работ 2%. Art. 36-bis облегчил doppia conformità. Stato legittimo = последний всеобъемлющий титул. Мини-квартиры: 20 кв. м (одиночка) / 28 кв. м (двое).
- **EPBD IV** (EU 2024/1275): средний по фонду −16% к 2030 и −20/22% к 2035; транспозиция к 29.05.2026 (Италия опаздывает); поквартирных классовых мандатов нет.
- **Cat-nat страхование**: обязательна только для фирм (2025: 31.03 / 1.10 / 31.12 по размеру); жильё добровольно, застраховано 7,3% (ANIA).
- **Сейсмозоны**: Z1 708 комун (PGA свыше 0.25g), Z2 2 345, Z3 1 560, Z4 3 488; sismabonus только зоны 1–3.
- **Agibilità**: SCA c D.Lgs 222/2016, подача 15 дней после окончания работ.
- **Preliminare trascritto**: art. 2645-bis c.c., приоритет гаснет через 1 год после согласованной даты rogito и максимум 3 года после транскрипции.
- **Superbonus**: свыше €120 млрд кредитов; при продаже — плюсвиденда 26% в 10-летнем окне.

## Two-PR порядок

1. **Первым** мержится more-group-content-os PR: ветка `claude/italy-wave1-briefs` (+10 брифов волны 2, коммит `1df2946`).
2. Затем site PR #1 — указатель сабмодуля уже наведён на коммит брифов.

## Гейты на выходе

validate:content PASS · validate:batch PASS · batch-writing-gate PASS · qa-corpus-signals PASS · batch-fact-check 0 errors · content-preflight 0 errors · check-heroes 272/272 PASS · build 0 P0/P1 (272 страницы) · check-links clean · glue --dry 0 · длинных тире: 0.

Деплой/индексация — за Maxim + Cursor.
