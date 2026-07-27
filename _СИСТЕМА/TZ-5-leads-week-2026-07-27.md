# ТЗ: italian-estate.com → 5 лидов в неделю

**Дата:** 27 July 2026  
**Исполнитель:** дорогая модель (production owner)  
**Заказчик:** Maksim  
**Репозиторий:** `italian-estate-website/` (GitHub `max-diver999/italian-estate-website`, branch `main`)

---

## 0. Жёсткие ограничения (не обсуждать)

1. **Kommo / AmoCRM / любая CRM:** не подключать, не упоминать в планах, не требовать для «готовности». До отдельной команды Maksim = **запрет**.
2. **Единственный канал лидов для владельца:** **Telegram** + **email на ящик Maksim** (дубль каждой заявки). Лид не считается обработанным, если не пришёл **и туда, и туда** (или явно задокументирован fallback, см. P0-A).
3. **Индексация:** только explicit URL после публикации контента, ключ `italian-estate-indexing`, без Yandex для EN-сайта.
4. **Git:** только `scripts/git-commit-production.sh`, author `Maksim Shchegolev`.
5. **Типографика MORE Group:** 0 символов `—` и `–` в новых/правленных текстах.

---

## 1. Цель и KPI (8 недель, измеримо)

| KPI | Сейчас (28d / Jul 2026) | Цель |
|-----|-------------------------|------|
| GSC клики / неделя | ~6 (24/28d) | **40+** |
| GSC CTR на money-URL ипотеки | 0% при ~1 066 imp | **≥1%** |
| GA4 `generate_lead` | 0 | **≥5/нед** (совпадает с реальными заявками) |
| Лиды в TG + email владельца | не проверено (email владельца **выключен** в коде) | **100% заявок** |
| Kommo | не используется | **не трогать** |

**Определение «лид»:** успешный POST `/api/lead/` с валидным телефоном → сообщение в TG + письмо на `LEAD_NOTIFY_EMAIL` + (опционально) автоответ клиенту, если указал email.

---

## 2. Фактическая база (на 27 Jul 2026, site-report v3.1)

- **GSC 28d:** 24 clicks, 4 112 imp, CTR 0.58%, avg pos 8.1  
- **Главная утечка CTR:** `/guides/non-resident-mortgage-italy/` — **1 066 imp, pos ~4.5, 0 clicks**  
- **Другие:** reciprocity 396 imp / 1 clk; heritage 209 / 2 clk; holiday-let (дубль **www** в GSC) 166 imp  
- **GA4:** 235 sessions, 63 organic, 6 «AI Assistant», 0 `generate_lead`  
- **Bing:** 8 clk / 672 imp (низкий приоритет)  
- **GEO audit:** avg **67/100 grade C**, 169 commercial files below min  
- **Уже в prod:** InlineCta (11 guides), sticky mobile CTA, `generate_lead` on form submit, CTR title batch 10 Jul (ипотека CTR **не вырос**)  
- **Lead API:** `src/pages/api/lead.ts` — **Telegram OK**, **owner email отключён** (комментарий «no Kommo email ingest»), auto-reply клиенту через Resend если email указан  

---

## 3. P0 — воронка лидов (сначала, 1–2 дня)

### P0-A. Email владельца + Telegram (обязательно)

**Проблема:** после `sendTelegram()` owner inbox **не** вызывается (`lead.ts` ~L82).

**Сделать:**

1. Скопировать/адаптировать `08_Идеи/_templates/lead-notify-email.ts` → `src/lib/lead-notify-email.ts` (или inline в `lead.ts`).
2. После успешного Telegram вызывать `sendLeadNotifyEmail()` с тем же телом заявки (HTML/plain).
3. Env в Vercel (document in README or site internal doc only, **не** commit secrets):
   - `RESEND_API_KEY` (already used)
   - `LEAD_NOTIFY_EMAIL` = inbox Maksim (default в шаблоне заменить на согласованный с Maksim, **не** Kommo)
   - `LEAD_NOTIFY_FROM` = `Italian Estate Leads <info@italian-estate.com>` или аналог
4. Поведение при ошибке:
   - TG fail → **500** клиенту (как сейчас)
   - Email fail → **log + не блокировать** успех формы, если TG OK; но добавить в TG строку «⚠️ email notify failed» для visibility
5. **Acceptance:**
   - `curl`/healthcheck POST с `source=healthcheck` → TG + email Maksim
   - Ручной submit с prod `/get-shortlist/` mobile + desktop → TG + email + GA4 `generate_lead` + redirect `/thanks/?lead=1`
   - Обновить комментарии в коде: убрать упоминание Kommo

### P0-B. Smoke и мониторинг лидов без CRM

1. Убедиться `post-deploy-smoke.mjs` проверяет `/api/lead/` 200.
2. В **site-report** (следующее обновление): метрика «Leads (TG+email)» вместо Kommo; weekly manual count из TG (опционально поле в отчёте «confirmed leads this week: N»).
3. **Не** добавлять CRM webhooks.

### P0-C. Canonical www / non-www

**Проблема:** GSC показывает `https://www.italian-estate.com/guides/italy-holiday-let-licensing/` отдельно от apex.

**Сделать:**

1. Проверить Vercel redirects: apex canonical, www → 301 apex (или единый host в astro config).
2. Убедиться canonical tags на всех шаблонах указывают `https://italian-estate.com/...`
3. **Acceptance:** один URL в GSC для holiday-let после переобхода (долгий лаг OK, redirect must be 301).

---

## 4. P0 — SEO CTR (2–3 недели, параллельно после P0-A)

### P0-D. Ипотека — второй SERP-спринт (hero URL)

**Файл:** `src/content/guides/non-resident-mortgage-italy.mdx`

**Сделать (минимальный diff, максимум SERP):**

1. `title` / `description` / `updatedDate: 2026-07-27` — ориентир на SERP reverse-engineering: LTV %, срок одобрения, €, «non-resident», 2026; **без** clickbait.
2. Проверить H1 vs title (не конфликтовать).
3. FAQ frontmatter + `FaqBlock` — 3–5 вопросов **дословно** из GSC queries (`loan to value`, `foreign buyer`, `2026`).
4. JSON-LD FAQPage уже через layout — validate schema in build.
5. **Above-the-fold CTA** (новый компонент или узкий блок в MDX): 1 строка + link `#lead-form` / `/get-shortlist/` **в первых 2 экранах** на mobile.
6. `validate:content --changed` + `npm run build`.
7. После push: indexing explicit URL only (`scripts/submit-google-explicit.mjs`, IndexNow bing).

**Acceptance:** title/desc ≤ policy; 0 em-dash; build pass; CTR мониторить в GSC 14d (не блокер релиза).

### P0-E. Reciprocity + holiday-let (следом)

Те же шаги для:

- `italy-reciprocity-property-foreigners.mdx`
- `italy-holiday-let-licensing.mdx` (+ fix www if needed)

**Acceptance:** validate + build + index explicit URLs.

---

## 5. P1 — конверсия (неделя 3–4)

### P1-A. Money pages CTA density

На top-5 GSC pages by impressions (из MCP GSC `dimensions=page`, 28d):

- Mid-article `InlineCta` где ещё нет
- Sticky bar уже global on articles — verify `articleSlug` routing on mortgage/reciprocity

### P1-B. `/get-shortlist/` landing

- Hero: регионы + «ответ за 1 рабочий день» + trust (не брокер, не портал)
- Форма выше fold на mobile
- A/B не нужен — одна сильная версия

### P1-C. Форма

- Email для клиента **optional** (уже)
- Phone required (уже)
- Success copy: «Мы напишем в WhatsApp или email в течение 1 рабочего дня»

---

## 6. P1 — SEO visa cluster (неделя 4–6)

**Не CTR-first** (pos ~70).

- `italy-investor-visa-property.mdx`: internal links с 10+ guides, блок сравнения visa types, updatedDate
- Коммерческие лендинги `/invest-*`, `/italy-property-consultation/`: ссылки на pillar
- Monitor GSC weekly pos for query cluster «investor visa italy»

---

## 7. P2 — GEO citability (фоном, top-20 GSC URLs)

**Не** чинить все 169 файлов.

1. `npm run geo:audit` → список worst among **URLs with GSC impressions >50**
2. Batch fix: answer-first H2, 2× citability blocks 130–170w + stat, `validate:content --changed`
3. Target: **≥80 score** on top 10 money guides (not whole corpus)

---

## 8. P2 — техдолг (низкий приоритет до первых лидов)

- Wikimedia → Cloudinary (remaining area images)
- About page wrong copy (UAE/Spain/Mexico mentions) → Italy only
- Contact meta «Spain property» → Italy
- News cadence 3/week

---

## 9. Проверки перед каждым production push

| Шаг | Команда |
|-----|---------|
| Content changed | `npm run validate:content -- --changed` exit 0 |
| Pre-push | `npm run qa:full:quick` или pre-push hook |
| Before «готово» | `npm run qa:full` exit 0 |
| Build | `npm run build` |
| Commit | `bash ../scripts/git-commit-production.sh -m "..."` |
| Push | `git push origin main` |
| Index new/changed URLs | explicit list only, post-deploy |

---

## 10. Порядок работ (строго)

```
1. P0-A lead email + TG test (prod)
2. P0-C canonical www
3. P0-D mortgage SERP + above-fold CTA → deploy → index
4. P0-E reciprocity + holiday-let → deploy → index
5. P1-A/B conversion pass
6. P1-C visa internal linking
7. P2 GEO top-20
8. Update site-report v3.2 (remove Kommo, add TG+email lead KPI, weekly table)
```

---

## 11. Отчёт Maksim (после каждого блока)

```
Что сделал: …
На сайт выложил: да / нет
Полная проверка всего сайта: да / нет / не нужна
Тест лид: TG да/нет · email да/нет · GA4 generate_lead да/нет
Kommo: не использовал (по инструкции)
```

---

## 12. Ключевые файлы

| Назначение | Путь |
|------------|------|
| Lead API | `src/pages/api/lead.ts` |
| Email notify template | `08_Идеи/_templates/lead-notify-email.ts` |
| Form + GA4 | `src/components/LeadForm.astro` |
| Sticky CTA | `src/components/StickyMobileLeadBar.astro`, `scripts/lib/italian-estate-cta-router.mjs` |
| Site report | `src/pages/site-report/index.astro` |
| Mortgage MDX | `src/content/guides/non-resident-mortgage-italy.mdx` |
| Indexing | `scripts/submit-google-explicit.mjs`, `scripts/indexnow-submit.mjs` |

---

## 13. Математика цели (для sanity-check)

- **5 лидов/нед** при CR формы **3%** → нужно **~167 целевых визитов/нед** на money pages или **~50+ кликов Google/нед** при CR **10%** на узкой shortlist page.
- Сейчас **~6 clk/нед** → без роста CTR ипотеки цель недостижима. **Приоритет #1 после живой воронки:** ипотека CTR.

---

*Конец ТЗ. Передать в новый чат с дорогой моделью одной фразой: «Выполни TZ `_СИСТЕМА/TZ-5-leads-week-2026-07-27.md` для italian-estate.com, блок P0 целиком, Kommo не трогать.»*
