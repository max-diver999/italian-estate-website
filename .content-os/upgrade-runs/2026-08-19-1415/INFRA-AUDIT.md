# Smoke / infra (блок 8)

Exit: **OK** | Сайт: https://italian-estate.com

## Production healthcheck (`npm run healthcheck`)

| Проверка | Статус |
|----------|--------|
| sitemap-index.xml | 200 |
| /, /guides/, /compare/, /get-shortlist/, /contact/ | 200 |
| Sample guide + compare | 200 |
| POST /api/lead/ | 200, email notify ok |
| POST /api/wa-intent/ | 200 |
| robots.txt | 200, Sitemap в файле |

Sitemap в сборке: **277 URL** в sitemap-0.xml.

Правок кода не было — только проверка живого сайта.
