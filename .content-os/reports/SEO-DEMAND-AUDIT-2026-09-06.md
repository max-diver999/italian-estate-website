# italian-estate.com — исследование спроса и план вывода в топ

Дата: 6 сентября 2026. Режим: аналитика, правок в код и MDX не вносилось.
Метод: SEO Standup, источник спроса Semrush вместо Wordstat.
Прогон полный: 10 баз Semrush, 112 срезов выдачи, GSC, Bing, GA4, инвентаризация 272 MDX.

---

## 0. Три факта до всех цифр

**Сайту в Google 11 недель.** Первый показ в Search Console 17 июня 2026, до этого ноль.
Это не «просел», это песочница. Читать всё ниже через эту рамку.

**Bing даёт вдвое больше кликов, чем Google.** 143 против 73. 55 % запросов Bing это промпты
Copilot, а не запросы. Канал AEO уже работает, канал Google ещё нет.

**Сайт построен на паттерне, которого не существует.** `italy property investment` = 20 показов
в месяц на всю Италию. `{регион} property investment` = ноль по всем 18 регионам.
`homes for sale in italy` = 6 600. Восемь лендингов `/invest-{гео}-property/` и 18 гидов
`{регион} property investment guide` стоят на нуле. Та же ошибка, что нашлась на испанском сайте.

---

## 1. Ёмкость рынка

### 1.1 Что измерено

| Блок | Объём | Статус |
|---|---|---|
| Ядро по США | 237 фраз, перепись | снято |
| Ядро по Британии | 147 фраз, перепись плюс добор микро-гео | снято |
| Ядро по Канаде, Австралии, Германии | 281 фраза каждая, перепись | снято |
| Ирландия, Швейцария, ОАЭ, Сингапур, Гонконг | выборка 100 фраз (87 % объёма ядра) | снято |
| Discovery: `phrase_fullsearch` | 9 головных терминов, US и UK | снято |
| Конкуренты: `resource_organic` | 5 доменов плюс мы, US и UK | снято |
| `phrase_questions` | — | **сознательно не брал**, стоит 40 за строку против 20 у fullsearch, а вопросные запросы уже есть в Bing |

### 1.2 Ёмкость по странам покупателя

| Страна | Показов / мес | Доля | Как измерено |
|---|---:|---:|---|
| **США** | **203 490** | 60,2 % | перепись плюс discovery |
| **Британия** | **77 390** | 22,9 % | перепись плюс discovery |
| Канада | 15 700 | 4,6 % | перепись по ядру до discovery |
| Австралия | 11 940 | 3,5 % | перепись по ядру до discovery |
| Германия | 10 620 | 3,1 % | перепись по ядру до discovery |
| Ирландия | 10 510 | 3,1 % | выборка 100 фраз |
| Швейцария | 4 320 | 1,3 % | выборка 100 фраз |
| ОАЭ | 2 130 | 0,6 % | выборка 100 фраз |
| Сингапур | 1 100 | 0,3 % | выборка 100 фраз |
| Гонконг | 810 | 0,2 % | выборка 100 фраз |
| **Итого измерено** | **338 010** | 100 % | |

**Честная оговорка.** США и Британия измерены с discovery, остальные восемь — по ядру до него.
Discovery увеличил измеренную ёмкость США в 2,2 раза. Если тот же коэффициент верен для остальных,
реальная ёмкость Канады ближе к 35 000, Австралии к 26 000, Германии к 23 000, Ирландии к 23 000.
**В таблице стоят измеренные цифры, а не пересчитанные. Порядок стран от этого не меняется.**

**Что оказалось неожиданным.** Ирландия при населении 5 млн даёт 10 510, больше Швейцарии,
ОАЭ, Сингапура и Гонконга вместе. Германия при 10 620 это не рынок недвижимости, а рынок
бюрократии: `permesso di soggiorno` 2 900 и четыре портала-бренда съедают 6 700 из 10 620.
Сингапур и Гонконг мертвы: 1 910 на двоих. Их из плана вычёркиваю.

### 1.3 Ёмкость по кластерам, США плюс Британия (280 880 показов, 653 фразы)

| Кластер | Всего | Доля | США | Британия | Фраз |
|---|---:|---:|---:|---:|---:|
| коммерческий листинг | 153 260 | 54,6 % | 99 600 | 53 660 | 408 |
| **тип объекта** | **33 470** | 11,9 % | 31 360 | 2 110 | 61 |
| brand и города-доноры | 29 090 | 10,4 % | 19 260 | 9 830 | 18 |
| **визы и ВНЖ** | **24 060** | 8,6 % | 22 240 | 1 820 | 46 |
| **жизнь и переезд** | **17 370** | 6,2 % | 16 290 | 1 080 | 46 |
| **дешёвая недвижимость** | **10 700** | 3,8 % | 5 920 | 4 780 | 35 |
| дома за 1 евро | 6 590 | 2,3 % | 3 510 | 3 080 | 17 |
| процесс и юристы | 3 450 | 1,2 % | 2 530 | 920 | 13 |
| **новости рынка** | **2 400** | 0,9 % | 2 400 | 0 | 4 |
| налоги | 390 | 0,1 % | 320 | 70 | 2 |
| доходность | 80 | 0,03 % | 40 | 40 | 2 |
| **investment-фрейм** | **20** | **0,01 %** | 20 | 0 | 1 |

Жирным выделены кластеры, которых **не было в моём первом ядре вообще** и которые нашёл discovery.

### 1.4 Что дал discovery

`phrase_fullsearch` по девяти головным терминам добавил **261 новую фразу и 140 800 показов**
сверх того, что я засеял руками. Ядро выросло в 2,5 раза. Крупнейшие находки:

| Находка | Показов / мес | Почему я её не засеял |
|---|---:|---|
| `house for sale in italian` | 3 600 US + 3 600 UK | опечатка вместо «italy», живёт как самостоятельный запрос |
| `italian house sales` | 3 600 UK | инверсия, которую я не перебирал |
| `houses in italy` | 2 400 US + 880 UK | без «for sale», навигационный вход |
| `tuscan homes` / `tuscan villa` / `italian countryside` | 5 400 + 3 600 + 3 600 | прилагательное вместо топонима |
| `cheap houses in italy to buy` | 1 300 US + 720 UK | целый ценовой кластер на 10 700 |
| `houses to buy in puglia italy` | 1 000 US | «to buy» вместо «for sale» |
| `properties to buy in tuscany italy` | 880 US + 1 600 UK | то же |
| `italy real estate news today` | 880 | кластер новостей, 2 400 суммарно |
| `italy property tax news` | 720 | то же |
| `houses for sale in northern / southern italy` | 960 | ось «север и юг», которой нет в моих гео |
| `can americans buy property in italy` | 320 | национальность как модификатор |
| `legal assistance buying property italy` | 210 | юридический сервис как запрос |

**Вывод по методу: перебор паттернов на сетке гео находит примерно 40 % рынка.
Остальные 60 % находит только discovery по головным терминам.**

### 1.5 Отсев

Из 678 фраз с объёмом отброшено 25, суммарно 16 310 показов. Не формальность:

| Отсеяно | Показов | Почему |
|---|---:|---|
| `italian villa` 9 900, `villa italia` 5 400, `villa italian kitchen` 4 400 | ~20 000 | сети ресторанов и пекарен в США: Villa Italia Bakery Schenectady, Finelli's Altoona PA, Joe's Italian Villa, Italian Villa Allen TX |
| `italian farmhouse` 1 900 | 1 900 | ресторан в Плимуте, Нью-Гэмпшир |
| `opera houses in italy` 2 400, `coffee houses in italy` 480 | 3 600 | туризм |
| `villa hire italy` 1 300, `villa rental tuscany italy` 1 300, `rent villas italy` 880 | 4 000 | аренда, не покупка |
| `immobiliare` 3 600 | 3 600 | итальянское слово, не бренд конкурента |
| `houses for sale in italy tx` 260 | 260 | город Италия в Техасе |
| `house in italian language` 390, `how to say house in italian` 210 | 600 | учат язык |

Правило якоря сработало: `villas for sale in italy` 1 000 остаётся, `italian villa` 9 900 уходит,
потому что второе без «for sale» ловит рестораны. Проверял по выдаче, не по интуиции.

**Отдельно: что дало ноль, а не отсев.** Все 65 названий проектов каталога, 13 из 15 застройщиков,
все 21 пара «X vs Y property», все 18 `{регион} property investment`, `rental yield italy`.

---

## 2. Наша доля

| Метрика, 90 дней | Google | Bing |
|---|---:|---:|
| Показы | 9 747 | 1 794 |
| Клики | **73** | **143** |
| CTR | 0,75 % | 8,0 % |
| Уникальных запросов | 200 | 717 |
| Страниц с кликами | 39 из 253 | — |
| GA4 сессий | 965 (Direct 575, Organic 333, AI Assistant 27) | |
| GA4 keyEvents | **0 за весь период** | |
| Позиций в top-10 выдачи | **0 из 112 снятых срезов** | |
| Ключей в Semrush US | **11, все с трафиком 0**, позиции 28–93 | |

3 249 показов Google в месяц против 338 010 показов измеренного рынка. **Видимость 0,96 %.**

### Наши 11 ключей по версии Semrush, целиком

```
italy real estate news today       поз. 60   720/мес   /news/
property tax in italy              поз. 85   320/мес   /guides/
houses for sale in ravello italy   поз. 34    70/мес   /projects/amalfi-ravello-villa/
deed of sale italy                 поз. 93    70/мес   /guides/selling-property-italy-foreigner/
ravello italy real estate          поз. 28    50/мес   /projects/amalfi-ravello-villa/
italian property taxes             поз. 92    50/мес   /guides/
4+4 contract italy                 поз. 76    50/мес   /guides/
ravello real estate                поз. 39    50/мес   /projects/amalfi-ravello-villa/
cadastral value italy              поз. 84    40/мес   /guides/
ravello italy homes for sale       поз. 40    40/мес   /projects/amalfi-ravello-villa/
how much is rent in italy usd      поз. 70    40/мес   /guides/
```

Четыре из одиннадцати держит одна карточка проекта в Равелло, и держит она их не по имени проекта,
а по гео. Ещё пять держит листинг `/guides/`. Собственных статей в списке нет вообще.

### 2.1 Вердикт по кластерам

| Кластер | Рынок US+UK | Наши показы, 90 дн | Ср. позиция | Вердикт |
|---|---:|---:|---:|---|
| коммерческий листинг | 153 260 | 263 | 52,5 | **не ловим, 0,06 %** |
| тип объекта | 33 470 | 0 | — | **страниц нет** |
| визы и ВНЖ | 24 060 | 332 | 71,4 | показы без кликов |
| жизнь и переезд | 17 370 | 0 | — | **страниц нет** |
| дешёвая недвижимость | 10 700 | 0 | — | **страниц нет** |
| дома за 1 евро | 6 590 | 90 | 12,3 | недобираем |
| новости рынка | 2 400 | 0 | 60 | одна страница, позиция 60 |
| налоги | 390 (занижено) | 364 | 82,3 | листинг ест статьи |
| процесс и юристы | 3 450 | 74 | 36,1 | работает слабо |
| доходность | 80 | 12 | 42,9 | рынка нет |
| сравнения | 0 | 1 | 9,0 | рынка нет |

### 2.2 Три диагноза

**a) Листинг `/guides/` перехватывает налоговый кластер.**
Ранжируется по 55 запросам на средней позиции 78, собирает 434 показа и ноль кликов.
Обходит собственные статьи: `cadastral value italy` 101 показ, `stamp duty italy` 93,
`property tax in italy for foreigners` 88. При этом статья про IMU стоит на 38, про registration tax
на 20,5, про кадастровую стоимость на 5. Индексируемый перечень заголовков делает листинг
«релевантнее» любой отдельной статьи.

**b) Каннибализация, 9 подтверждённых пар из GSC:**

| Запрос | Страницы |
|---|---|
| selling property in italy taxes | italy-capital-gains-tax-property (30) + selling-property-italy-foreigner (2) |
| holiday lets in italy | /guides/ (11) + italy-holiday-let-licensing (19) |
| condominium fees italy | /guides/ (2) + italy-property-management-costs (11) |
| selling houses in italy to foreigners | /guides/ (7) + selling-property-italy-foreigner (5) |
| italian residency by investment | italy-investor-visa-property (10) + italy-residency-by-investment-guide (1) |
| eu residency by investment italy | те же две |
| rental yield italy | /compare/ (1) + /guides/ (4) |
| italian real estate taxes | /guides/ (1) + italy-capital-gains-tax-property (1) |
| italy residency property | /guides/ (1) + italy-investor-visa-property (1) |

Плюс структурная: 25 гео-токенов держат 3+ страницы. По Милану 17 страниц, по Риму 9,
по Флоренции 9, по Комо 8. Три системы географии конкурируют за один интент.

**c) Подозрение на накрутку, доказательств нет.**
Нидерланды, десктоп: 2 424 показа, средняя позиция 4,5, 1 клик. По запросам атрибутируется 9 показов,
остальные 99,6 % анонимны. Всплеск 27 июня по 12 июля до 180 показов в день, потом спад до 10.
Сигнатура рангтрекера, но одного запроса-донора нет. **Гипотеза, а не факт. Решение за вами.**

---

## 3. Что делают конкуренты

Снято `resource_organic` по gate-away.com (US и UK), immobiliareitaliano.com, italianhousesforsale.com,
abruzzoruralproperty.com, 1eurohouses.com и по нам. Архитектура победителей вскрыта полностью.

### 3.1 gate-away.com — лидер во всех шести странах

| URL | Что держит |
|---|---|
| `/` | позиция 1 по ~40 головным: homes for sale in italy 6 600, houses for sale in italy 4 400, italy real estate 2 400, property for sale in italy 1 900 |
| `/properties/{регион}` | tuscany, sicily, puglia, sardinia, calabria, lake-como |
| `/properties/{регион}/{провинция}/{город}` | lazio/rome/rome, veneto/venice/venice, sicily/caltanissetta/mussomeli |
| **`/properties?max_price=50000`** | **позиция 1 по ~20 запросам «cheap»**: cheap houses in italy to buy 1 300, italy homes for sale cheap 720, cheap homes in italy 720 |
| `/farmhouses` | farms for sale in italy 390, homes for sale in italian countryside 390 |
| `/lands` | land for sale italy 590 |

### 3.2 immobiliareitaliano.com — самая чистая модель

| URL | Позиция | Что держит |
|---|---:|---|
| `/cheap-property/` | 2 | homes for sale in italy 6 600, houses for sale in italy 4 400 |
| `/type/villa/` | 1 | italian villas for sale 1 600, villas for sale in italy 880 |
| `/type/castle/` | 1 | castles for sale in italy 1 000 |
| `/type/farm/` | 1 | farmland italy 1 000 |
| `/type/apartment/` | 1 | italian apartment 480, apartments in italy 1 000 |
| `/type/land/` | 1 | land for sale in italy 390 |
| `/feature/vineyard/` | 1 | vineyard for sale italy 390, winery for sale italy 320 |
| `/location/tuscany/` | 1–2 | property for sale in tuscany italy 880, tuscany real estate 1 000 |
| `/tuscany-farmhouses-for-sale/` | 1 | farmhouse tuscany italy 1 300 |
| `/tuscany-villas-for-sale/` | 6 | tuscan villa 3 600 |

### 3.3 1eurohouses.com — одна страница на 15 000 показов

`/1-euro-houses-map/` держит позиции 1–4 по **всему** кластеру домов за 1 евро.
Плюс `/regions/{регион}-en/` ранжируются по «homes for sale in sardinia italy» 1 000
и «buy a house in abruzzo italy» 720. Плюс страницы городов-доноров: `pratola-peligna`, `presicce-acquarica`.

### 3.4 abruzzoruralproperty.com — самый неудобный факт

Крошечное агентство по одному региону. Держит **позицию 2 по «villa for sale italy» (1 000)**,
позицию 4 по «property for sale italy» (1 600), позицию 6 по «property for sale in italy» (1 900),
позицию 9 по «houses for sale in italy» (2 400). Вся архитектура: `/` (хаб Абруццо),
`/find-a-property/for-sale` (листинг), `/italian-villas` (тип объекта), `/about-molise` (гид по региону,
позиция 3 по «molise» 1 000). Четыре страницы.

**Это ровно то, что нам под силу, и это доказывает, что 65 карточек хватает, если построить над ними правильные страницы.**

### 3.5 Формула title из выдачи

Проверено на 112 срезах: `{Тип} for Sale in {Гео}, Italy` плюс счётчик или «from €{X}».
Живые примеры победителей: «Houses for sale in Italy: +45,000 properties and villas | Gate-away»,
«Property for sale in Italy : 9,686 houses and apartments», «274 Houses for Sale in Abruzzo — Properstar»,
«Homes for sale in Italy – 6018 results».

**Никто в топе не пишет «investment». Никто в топе не пишет «guide». Формат гида в коммерческой
выдаче не встретился ни разу за 112 срезов.**

### 3.6 AI Overview

Показан в 94 % срезов США, 81 % Британии, 80 % Австралии и Германии, 90 % Канады, 100 % ОАЭ.
Синяя ссылка на этом рынке уже вторая позиция после блока ИИ. 143 клика из Bing при 55 %
промптовых запросов подтверждают это с другой стороны.

---

## 4. Иерархия: было и стало

### Было, 298 URL

```
/
├── /guides/          110  ← листинг перехватывает налоги, поз. 78
├── /projects/         65  ← спрос на имена проектов: 0
├── /areas/            48  ← спрос ≥200 только у 10 из 48
├── /compare/          30  ← 1 показ за 90 дней на всю коллекцию
├── /developers/       15  ← 0 у 13 из 15
├── /invest-{гео}-property/  8  ← паттерн стоит 0
├── /news/              4  ← поз. 60 при спросе 2 400
├── /tier-*/            3  ← не связаны ни с чем
└── служебные           9
```

### Стало, ~255 URL

```
/
├── /property-for-sale/                     ХАБ СТРАНЫ         41 370
│   ├── /cheap/                             ценовой фасет      10 700
│   ├── /one-euro-houses/                   карта городов       6 590
│   ├── /type/{...}/            7 страниц   тип объекта        33 470
│   │     villas farmhouses castles land apartments
│   │     vineyards trulli-masserie
│   ├── /{регион}/             11 витрин    регионы            30 200
│   ├── /{город|микро}/        18 витрин    города и микро     22 400
│   └── /{регион}-{тип}/        6 комбо     гео × тип           8 900
│         tuscany-villas tuscany-farmhouses puglia-trulli
│         sicily-cheap sardinia-villas abruzzo-cheap
│
├── /living/                   10 страниц   жизнь и переезд    17 370
├── /visa/                      6 страниц   визы и ВНЖ         24 060
├── /market-news/                           новости рынка       2 400
├── /guides/    процесс и налоги, листинг депубликован
│   └── /taxes/  новый хаб
├── /projects/  65 карточек как инвентарь ПОД витринами
├── /developers/ 2  ·  /compare/ 3  ·  служебные 9
```

---

## 5. Постраничный план

### Точный счёт

| Действие | Страниц | Спрос, показов / мес |
|---|---:|---:|
| **Создать** | **48** | **129 690** |
| Переделать | 72 | 4 500 |
| Склеить | 102 исходных URL → 29 целевых | 30 200 |
| Закрыть | 39 | 0 |
| Оставить как есть | 20 | 6 000 |

Корпус: было 298 URL, станет ~255. Покрытый спрос: было 0,96 %, станет ~38 % измеренного рынка.

### Волна 1. Хребет и ценовой фасет (месяц 1) — 12 страниц, 92 460 показов

| Действие | URL | Из чего | Спрос |
|---|---|---|---:|
| создать | `/property-for-sale/` | нет | 41 370 |
| **создать** | **`/property-for-sale/cheap/`** | нет. Топовая страница у трёх конкурентов из четырёх | **10 700** |
| переделать | `/property-for-sale/one-euro-houses/` | из `guides/italy-1-euro-homes-program`, добавить карту городов | 6 590 |
| склеить | `/property-for-sale/tuscany/` | invest-tuscany + 2 guides + 3 areas | 10 410 |
| склеить | `/property-for-sale/sicily/` | invest-sicily + 1 guide + 2 areas | 4 720 |
| склеить | `/property-for-sale/sardinia/` | invest-sardinia + 1 guide + areas/costa-smeralda | 4 550 |
| создать | `/property-for-sale/abruzzo/` | из guides/abruzzo + 2 areas | 3 310 |
| склеить | `/property-for-sale/puglia/` | invest-puglia + 1 guide + 6 areas | 3 090 |
| создать | `/property-for-sale/umbria/` | из guides/umbria + 3 areas | 2 010 |
| создать | `/property-for-sale/calabria/` | из guides/calabria + areas/scalea | 1 340 |
| склеить | `/property-for-sale/liguria/` | invest-liguria + 1 guide + 4 areas | 940 |
| создать | `/property-for-sale/molise/` + `/piedmont/` + `/le-marche/` | из 3 guides + 6 areas | 1 250 |

### Волна 2. Тип объекта (месяц 1–2) — 13 страниц, 42 370 показов

Кластер на 33 470 показов, у нас ноль страниц, у immobiliareitaliano девять и все в топ-1.

| Действие | URL | Спрос |
|---|---|---:|
| создать | `/property-for-sale/type/villas/` | 12 880 |
| создать | `/property-for-sale/type/farmhouses/` | 8 970 |
| создать | `/property-for-sale/type/apartments/` | 1 870 |
| создать | `/property-for-sale/type/castles/` | 1 740 |
| создать | `/property-for-sale/type/land/` | 2 370 |
| создать | `/property-for-sale/type/vineyards/` | 710 |
| создать | `/property-for-sale/type/trulli-masserie/` | 710 |
| создать | `/property-for-sale/tuscany-villas/` | 3 600 |
| создать | `/property-for-sale/tuscany-farmhouses/` | 1 690 |
| создать | `/property-for-sale/puglia-trulli/` | 710 |
| создать | `/property-for-sale/sicily-cheap/` | 1 040 |
| создать | `/property-for-sale/abruzzo-cheap/` | 1 190 |
| создать | `/property-for-sale/northern-southern-italy/` | 960 |

### Волна 3. Города и микро-гео (месяц 2) — 18 страниц, 22 400 показов

rome 3 410 · florence 3 110 · venice 2 180 · lake-como 2 040 · milan 1 470 · naples 980 ·
lucca 980 · sorrento 970 · positano 790 · amalfi-coast 770 · bologna 680 · palermo 540 ·
turin 490 · capri 460 · lake-garda 370 · verona 360 · ravello 230 · orvieto 200

Из них 10 склеиваются из существующих `/areas/` и `/guides/`, 8 создаются с нуля.

### Волна 4. Жизнь, переезд и визы (месяц 3) — 16 страниц, 41 430 показов

Два кластера на 41 430 показов. Кластера «жизнь» нет вообще, кластер «визы» есть,
но все страницы написаны через призму недвижимости и из-за этого не ранжируются.

| Действие | URL | Спрос |
|---|---|---:|
| создать | `/living/cost-of-living-italy/` | 4 590 |
| создать | `/living/moving-to-italy-from-usa/` | 3 300 |
| создать | `/living/how-to-move-to-italy/` | 1 700 |
| создать | `/living/best-places-to-live-italy/` | 1 320 |
| создать | `/living/italy-citizenship-by-descent/` | 1 040 |
| переделать | `/living/retire-in-italy/` из `guides/italy-retirement-property-guide` | 1 780 |
| создать | `/living/moving-to-italy-from-uk/` | 620 |
| создать | `/living/cost-of-living-rome-milan-florence/` | 810 |
| создать | `/living/international-schools-italy/` | 210 |
| создать | `/living/healthcare-italy-foreigners/` | 150 |
| создать | `/visa/` хаб | 1 600 |
| оставить | `/visa/italy-investor-visa/` из `guides/italy-investor-visa-property/` | 3 340 |
| переделать | `/visa/italy-elective-residence-visa/` (убрать «property») | 2 830 |
| переделать | `/visa/italy-digital-nomad-visa/` (убрать «property») | 2 090 |
| создать | `/visa/permesso-di-soggiorno/` | 1 600 |
| создать | `/visa/italy-work-visa/` | 2 000 |

### Волна 5. Починка того, что уже ловит (месяц 1, параллельно) — 9 действий

| Действие | Что | Зачем |
|---|---|---|
| переделать | `/guides/` индекс | Убрать перечень заголовков из индексируемого текста. Держит 55 запросов на позиции 78 |
| создать | `/taxes/` хаб | Забирает у `/guides/` 364 показа и раздаёт по статьям |
| **переделать** | **`/news/` → `/market-news/`** | Спрос 2 400, мы уже на позиции 60. Единственная страница, где мы видны Semrush |
| склеить | `italy-residency-by-investment-guide` + `italy-investor-visa-requirements-2026` → в investor-visa | Каннибализация из GSC |
| склеить | `selling-property-italy-foreigner` → `italy-capital-gains-tax-property` | Каннибализация |
| склеить | `condominio-rules-foreign-owners` → `italy-property-management-costs` | Каннибализация |
| переделать | `/tier-entry/` `/tier-mid/` `/tier-luxury/` | Перевести в фасеты витрины и связать с `/property-for-sale/cheap/` |
| переделать | 65 карточек `/projects/` | Сменить title с имени проекта на `{тип} for sale in {гео}, Italy`, снять с роли самостоятельной цели |
| проверить | Нидерланды в GSC | Найти владельца рангтрекера или подтвердить накрутку |

### Что закрыть

| Что | Сколько | Почему |
|---|---:|---|
| `/compare/*` кроме 4 | 26 | Ноль спроса по всем «X vs Y property». 1 показ за 90 дней на коллекцию |
| `/developers/*` кроме coima и lendlease | 13 | Названия дали ноль. coima 890 и lendlease 5 300 брендового спроса остаются |
| `/areas/*` без коммерческого спроса | 32 | Становятся секциями региональных витрин, не отдельными URL |

---

## 6. Список новых страниц в порядке написания

Первые 20. Полный список из 48 в `plan.json`.
Формула title подтверждена на 112 срезах выдачи.

| # | URL | Title | Спрос | Тип |
|---:|---|---|---:|---|
| 1 | `/property-for-sale/` | Property for Sale in Italy: {N} Homes and Villas | 41 370 | витрина-хаб |
| 2 | `/property-for-sale/type/villas/` | Villas for Sale in Italy: {N} Properties from €{X} | 12 880 | витрина типа |
| 3 | `/property-for-sale/cheap/` | Cheap Houses in Italy to Buy: {N} Homes under €50,000 | 10 700 | ценовой фасет |
| 4 | `/property-for-sale/tuscany/` | Property for Sale in Tuscany, Italy: {N} Houses and Villas | 10 410 | витрина региона |
| 5 | `/property-for-sale/type/farmhouses/` | Italian Farmhouses and Country Houses for Sale: {N} Properties | 8 970 | витрина типа |
| 6 | `/property-for-sale/one-euro-houses/` | 1 Euro Houses in Italy 2026: Live Map of {N} Towns and the Real Cost | 6 590 | витрина, карта |
| 7 | `/property-for-sale/sicily/` | Property for Sale in Sicily, Italy: {N} Houses from €{X} | 4 720 | витрина региона |
| 8 | `/living/cost-of-living-italy/` | Cost of Living in Italy in 2026: Real Monthly Budgets by City | 4 590 | справочник |
| 9 | `/property-for-sale/sardinia/` | Property for Sale in Sardinia, Italy: {N} Houses and Villas | 4 550 | витрина региона |
| 10 | `/property-for-sale/tuscany-villas/` | Tuscan Villas for Sale: {N} Properties in Chianti, Val d'Orcia, Lucca | 3 600 | гео × тип |
| 11 | `/property-for-sale/rome/` | Property for Sale in Rome, Italy: {N} Apartments and Houses | 3 410 | витрина города |
| 12 | `/visa/italy-investor-visa/` | Italy Investor Visa 2026: €250k, €500k and €2m Routes Compared | 3 340 | справочник |
| 13 | `/property-for-sale/abruzzo/` | Property for Sale in Abruzzo, Italy: {N} Houses from €{X} | 3 310 | витрина региона |
| 14 | `/living/moving-to-italy-from-usa/` | Moving to Italy from the USA in 2026: Visas, Costs, Timeline | 3 300 | справочник |
| 15 | `/property-for-sale/florence/` | Property for Sale in Florence, Italy: {N} Apartments and Villas | 3 110 | витрина города |
| 16 | `/property-for-sale/puglia/` | Property for Sale in Puglia, Italy: {N} Trulli, Masserie and Villas | 3 090 | витрина региона |
| 17 | `/visa/italy-elective-residence-visa/` | Italy Elective Residence Visa: Income Threshold and Refusal Reasons | 2 830 | справочник |
| 18 | `/market-news/` | Italian Property Market News: Prices, Rules, Taxes | 2 400 | лента |
| 19 | `/property-for-sale/type/land/` | Land for Sale in Italy: {N} Plots with Building Permission | 2 370 | витрина типа |
| 20 | `/property-for-sale/venice/` | Property for Sale in Venice, Italy: {N} Apartments and Palazzi | 2 180 | витрина города |

Первые десять закрывают 108 000 показов из 338 000 измеренного рынка.

---

## 7. ТЗ из выдачи для верхних 10 страниц

### Общее для всех коммерческих витрин

Что есть у победителей и чего нет у нас:

1. **Счётчик объектов в title.** «+45,000 properties», «9,686 houses and apartments», «274 Houses for Sale in Abruzzo», «6018 results». У нас 65 карточек, и это надо показать честно, но показать.
2. **Цена «от» в евро** в мете и первом экране.
3. **Фасеты** регион, тип, бюджет, состояние. `/tier-*/` есть, но ни с чем не связаны.
4. **Карта.** У gate-away, idealista, 1eurohouses.
5. **Тип страницы — листинг.** Формат гида в коммерческом топе не встретился ни разу.

Чего нет у них и есть у нас: реальные затраты сделки, налоги, реципрокность, риски abusi edilizi,
роль geometra, salva casa. Это блок под листингом, а не отдельная страница.

### 1. `/property-for-sale/` — «homes for sale in italy» 6 600, «houses for sale in italy» 4 400

Топ-10 US: gate-away.com (#1), immobiliareitaliano.com/cheap-property/ (#2), housesofitaly.com,
idealista.it, italyluxurypropertyforsale.com, realestate.com.au.
Топ-10 UK: rightmove.co.uk, gate-away.com, aplaceinthesun.com, zoopla.co.uk, italianhousesforsale.com.

Важное: **вторую позицию в США держит не главная конкурента, а его страница `/cheap-property/`.**
Ценовой вход побеждает общий вход. Учесть в перелинковке.

### 2. `/property-for-sale/type/villas/` — 12 880

Топ-1 держит `immobiliareitaliano.com/type/villa/`. Позицию 2 по «villa for sale italy» (1 000)
держит `abruzzoruralproperty.com/italian-villas` — сайт с одним регионом.
Формула title: «Italian Villas for Sale», «Villas for Sale in Italy».
**Обязательно фильтровать омонимы:** «italian villa» 9 900 это рестораны в США, туда не идти.

### 3. `/property-for-sale/cheap/` — 10 700

Топ: `gate-away.com/properties?max_price=50000` (#1 по ~20 запросам),
`immobiliareitaliano.com/cheap-property/` (#2 по головным), `1eurohouses.com`.
Порог, который они используют: **€50 000**. Формула: «Cheap Property in Italy for sale Affordable Homes».
Живой подзапрос, который никто не закрыл отдельно: «cheap houses for sale in italy by the sea» 590 US + 320 UK.

### 4. `/property-for-sale/tuscany/` — 10 410

Топ: idealista.it, gate-away.com/properties/tuscany, casatuscany.com, toscanahouses.com,
immobiliareitaliano.com/location/tuscany/.
В топе отдельно живут две ниши: **renovation property** и **cheap property in Tuscany**.
Это подстраницы, а не отдельные сайты. Формула: «Property for Sale in Tuscany, Italy».

### 5. `/property-for-sale/type/farmhouses/` — 8 970

`immobiliareitaliano.com/type/farmhouse/` #1 по «italian farmhouses» 590,
`/tuscany-farmhouses-for-sale/` #1 по «farmhouse tuscany italy» 1 300,
`gate-away.com/farmhouses` #1 по «farms for sale in italy» 390.
**Фильтр:** «italian farmhouse» 1 900 это ресторан в Нью-Гэмпшире.

### 6. `/property-for-sale/one-euro-houses/` — 6 590

Топ полностью держит `1eurohouses.com/1-euro-houses-map/`, позиции 1–4 по всему кластеру.
Плюс idealista.it «Map of 1-euro houses in Italy 2026», Guardian, Outside, Reddit.
Что у победителя: **живая карта городов** и страницы конкретных городов-доноров
(pratola-peligna, presicce-acquarica). Чего нет ни у кого: честный расчёт полной стоимости
с обязательствами по срокам ремонта и залогом. Это наш угол.

### 7–9. `/property-for-sale/{sicily|sardinia|abruzzo}/`

Формула подтверждена на всех трёх: «Properties For Sale in {Гео}, Italy»,
«Property for sale, {Гео}, Italy: houses and flats», «274 Houses for Sale in Abruzzo — Properstar».
По Абруццо в топе всех шести стран стоит abruzzoruralproperty.com, узкий локальный игрок.
Что у них есть: разбивка по провинциям внутри региона, ценовая вилка, фильтры
«с бассейном», «с видом на море», «под ремонт».

### 10. `/living/cost-of-living-italy/` — 4 590

Топ: numbeo.com, internationalliving.com, westernunion.com, reddit.com, internations.org.
**Ни одного портала недвижимости.** Это выдача, куда контентный сайт заходит.
Что у них: помесячный бюджет в цифрах, сравнение с США в той же таблице, разбивка по городам.
Чего нет ни у кого: связка «стоимость жизни ↔ порог дохода для elective residence visa ↔
реальные счета владельца недвижимости». Наш угол.

### Справочные выдачи, где портала в топ-10 нет вообще

| Запрос | Спрос | Кто в топе |
|---|---:|---|
| визы и ВНЖ, весь кластер | 24 060 | henleyglobal, getgoldenvisa, esteri.it, юрфирмы |
| жизнь и переезд, весь кластер | 17 370 | wise, reddit, taxesforexpats, numbeo, gov.uk |
| дома за 1 евро | 6 590 | 1eurohouses, Guardian, Outside |
| новости рынка | 2 400 | idealista новости, Reuters |
| процесс и юристы | 3 450 | reddit, wise, theitalianlawyer, giambronelaw |
| налоги | занижено | reddit, wise, expertsforexpats, юрфирмы |

**Суммарно 53 870 показов в месяц справочного спроса без портала в топ-10.
Это единственный кластер, где сайт без инвентаря выигрывает у сайта с инвентарём.**

---

## 8. Честный блок

**1. Инвестиционный фрейм на этом рынке не существует.**
`italy property investment` = 20 показов, 0,01 % рынка. `{регион} property investment` = ноль
по всем 18. `invest in {регион} property` = ноль. `rental yield italy` = ноль в обеих базах.
Восемь лендингов, 18 гидов и вся идея «инвестиций в итальянскую недвижимость» построены на нуле.
Люди не инвестируют в Италию, люди покупают дом в Италии.

**2. Сравнения не ищут.** Все 21 пара «X vs Y property» = ноль в US и UK.
30 страниц `/compare/` собрали 1 показ за 90 дней. Живое одно: «italy vs malta golden visa» 44 показа,
и это визовый интент.

**3. Названия проектов и застройщиков не ищут.** 65 из 65 карточек — ноль. 13 из 15 застройщиков — ноль.

**4. Мы не портал и коммерческий топ-3 на голове не займём.**
Британская выдача на 48,8 % состоит из порталов. У gate-away 45 000 объектов, у idealista сотни тысяч.
У нас 65 карточек. **Витрины уровня «Италия» и «Тоскана» на первую страницу не выйдут, и обещать
этого я не буду.** Но abruzzoruralproperty с четырьмя страницами стоит на позиции 2 по
«villa for sale italy» и на 6 по «property for sale in italy». Значит, дело не в размере каталога,
а в наличии правильных страниц. Наши цели — тип объекта, ценовой фасет, город и микро-гео,
где KD от 8 до 25.

**5. Реалистичная цель.**
Измеренный рынок 338 010 показов. Коммерческая голова с KD 40–50 это 61 050, туда не идём.
Достижимо: 33 470 тип объекта + 22 400 город и микро-гео + 17 370 жизнь + 24 060 визы +
10 700 дешёвая + 6 590 один евро + 2 400 новости + 8 900 гео × тип = **125 890 показов в месяц**
при позициях 5–15. При CTR 3–5 % это **3 800–6 300 кликов в месяц** против сегодняшних 24.
Срок 6–9 месяцев с момента выкладки, потому что сайту 11 недель.

**6. GA4 показывает ноль keyEvents за 90 дней.** 965 сессий и ни одного целевого действия.
Прежде чем гнать трафик, проверить, настроены ли события. Если настроены и правда ноль,
проблема не в SEO. Отдельно: Direct 575 сессий при 73 кликах из Google.

**7. Мой первый заход нашёл 40 % рынка.** Сетка «паттерн × гео» дала 130 090 показов,
discovery по девяти головным терминам добавил ещё 140 800. Это методологический вывод,
который стоит перенести на остальные сайты холдинга: **перебор комбинаций не заменяет
`phrase_fullsearch` по головам.**

**8. Чего я не измерил.**
Канада, Австралия, Германия, Ирландия, Швейцария, ОАЭ, Сингапур и Гонконг измерены по ядру
до discovery. Их реальная ёмкость примерно вдвое выше указанной. Порядок стран это не меняет,
но абсолютные цифры по ним занижены, и в решениях их надо считать нижней границей.
Микро-гео по Британии сняты только в трёх паттернах из одиннадцати.

**9. Подозрение на накрутку из Нидерландов не доказано.** Приведено как гипотеза с сигнатурой.
Не закладывать в решения, пока не выяснится, чей рангтрекер стоит на домене.

**10. Сингапур и Гонконг из плана вычёркиваю.** 1 910 показов на двоих. Вместо них в списке
стран покупателя должны стоять Ирландия (10 510) и Швейцария (4 320).

---

## 9. Артефакты и расходы

| Файл | Что внутри |
|---|---|
| `semrush_us.csv`, `semrush_uk.csv`, `uk_gap.csv` | ядро по США и Британии с объёмом, CPC, KD |
| `countries.csv` | 8 остальных стран покупателя |
| `discovery.csv` | 261 фраза, найденная `phrase_fullsearch` |
| `core_final.json` | 653 фразы после отсева, у каждой кластер |
| `serp.json` | 112 срезов выдачи, 6 стран, top-10 с title |
| `gsc.json` | 205 пар запрос-страница из Search Console |
| `plan.json` | постраничный план, машинночитаемый |
| `serp.py`, `analyze.py`, `plan.py` | сбор выдачи, классификатор, генератор плана |
| Topvisor **32838631** | «italian-estate.com EN core 2026-09», 389 фраз, 12 групп, проект выключен |

**Расходы:** XMLRiver 2,83 руб из 138,03. Semrush примерно **35 000 единиц из согласованных 50 000**.
Экономия вышла из двух решений: отказ от `phrase_questions` в пользу `phrase_fullsearch`
(вдвое дешевле за строку при том же охвате) и фильтр по объёму в отчётах, который не даёт
платить за строки с нулём.

**Topvisor:** проект выключен, съём позиций не тарифицируется. Перед первым съёмом добавить
поисковики и регионы: google.com US, google.co.uk UK, google.ca CA, google.com.au AU, google.ie IE.
