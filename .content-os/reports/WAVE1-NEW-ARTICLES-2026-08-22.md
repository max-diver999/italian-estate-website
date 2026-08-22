# Волна 1 новых статей — «Деньги и сделка» (2026-08-22)

## Что вышло

10 новых гайдов (ids 1–10 из `topics-proposal.json`), все написаны вручную под транзакционный интент:

| Slug | GEO | Слов (гейт) | Цит. блоки |
|---|---|---|---|
| buying-property-italy-through-company | 92 | 2318 | 3 |
| italy-property-auctions-foreigners | 93 | 2121 | 3 |
| nuda-proprieta-bare-ownership-italy | 94 | 2075 | 3 |
| rent-to-buy-italy-affitto-con-riscatto | 94 | 2047 | 3 |
| transferring-money-to-italy-property | 94 | 2086 | 3 |
| selling-property-italy-foreigner | 94 | 2039 | 3 |
| 90-180-day-rule-italy-property-owners | 93 | 2019 | 3 |
| italy-property-offer-negotiation | 93 | 2029 | 3 |
| italy-new-build-warranty-defects | 92 | 2013 | 3 |
| italy-property-viewing-trip-checklist | 93 | 2064 | 3 |

Каждая: answer-first лид 50–60 слов с цифрой, вопросные H2, таблица+список в секциях, FAQ 8 вопросов, 8+ внутренних ссылок, insider tips, уникальный hero (Commons → Cloudinary, лицензии CC/PD в `scripts/reports/hero-migration-manifest.json`).

## Верифицированные факты волны

Interesse legale 2026 = 1,60% (DM 10.12.2025), но узуфрукт считается по полу 2,5% — таблицы 2026 без изменений; плюсвиденда superbonus: 26% при продаже в 10-летнем окне, вычет затрат 0%/50%; EES работает на 100% внешних границ с 10.04.2026; ETIAS сдвинут на 2027; IRES 24% (premiale 20% не продлён структурно); аукционы: cauzione 10% от оферты, сальдо ≤120 дней, prezzo-valore по C. Cost. 6/2014; rent-to-buy: art. 23 DL 133/2014, транскрипция до 10 лет; D.Lgs 122/2005 + нотариальная проверка decennale c 16.03.2019.

## Попутные починки корпуса

- Регрессия «two%» → «2%» в 8 файлах (следствие прошлого digit-to-word прохода).
- Устаревший flat tax €100k/€25k на prima-casa странице → €300k/€50k c 2026.
- 7 legacy-страниц: внутренние ссылки доведены до ≥8, 6 описаний >160 символов обрезаны.
- Ретро-SERP-брифы для 7 legacy-страниц (страницы старше режима брифов).

## Two-PR порядок

1. **Первым** мержится more-group-content-os PR: ветка `claude/italy-wave1-briefs` (17 брифов).
2. Затем site PR — указатель сабмодуля уже наведён на коммит брифов.

## Гейты на выходе

validate:content 262/262 · batch-writing-gate --all PASS · qa-corpus-signals PASS · check-heroes 262/262 PASS · batch-fact-check 0 errors · content-preflight 0 errors · build 0 P0/P1 · check-links clean · glue --dry 0.

Деплой/индексация — за Maxim + Cursor.
