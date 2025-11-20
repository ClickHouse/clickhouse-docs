---
slug: /use-cases/AI/ai-powered-sql-generation
sidebar_label: 'Генерация SQL с помощью ИИ'
title: 'Генерация SQL с помощью ИИ'
pagination_prev: null
pagination_next: null
description: 'В этом руководстве объясняется, как использовать ИИ для генерации SQL-запросов в ClickHouse Client или clickhouse-local.'
keywords: ['AI', 'SQL generation']
show_related_blogs: true
doc_type: 'guide'
---

Начиная с ClickHouse 25.7, [ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) и [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local) включают [функциональность на базе ИИ](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation), которая преобразует описания на естественном языке в SQL-запросы. Эта возможность позволяет пользователям описывать свои требования к данным обычным текстом, после чего система переводит их в соответствующие SQL-операторы.

Эта функция особенно полезна для пользователей, которые могут быть не знакомы со сложным синтаксисом SQL или которым нужно быстро генерировать запросы для исследовательского анализа данных. Функция работает со стандартными таблицами ClickHouse и поддерживает распространённые шаблоны запросов, включая фильтрацию, агрегирование и соединения.

Для этого используются следующие встроенные инструменты/функции:

* `list_databases` — выводит список всех доступных баз данных в экземпляре ClickHouse
* `list_tables_in_database` — выводит список всех таблиц в указанной базе данных
* `get_schema_for_table` — получает оператор `CREATE TABLE` (схему) для указанной таблицы



## Предварительные требования {#prerequisites}

Необходимо добавить ключ Anthropic или OpenAI в качестве переменной окружения:

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

Также можно [указать файл конфигурации](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration).


## Подключение к песочнице ClickHouse SQL {#connecting-to-the-clickhouse-sql-playground}

Мы изучим эту функцию с помощью [песочницы ClickHouse SQL](https://sql.clickhouse.com/).

Подключиться к песочнице ClickHouse SQL можно следующей командой:

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
Предполагается, что ClickHouse уже установлен. Если нет, обратитесь к [руководству по установке](https://clickhouse.com/docs/install)
:::


## Задавайте вопросы ClickHouse на естественном языке {#asking-clickhouse-questions-in-natural-language}

Теперь можно начать задавать вопросы!

Функция преобразования текста в SQL — это инструмент для генерации одиночных запросов. Поскольку она не сохраняет историю диалога, включайте в вопрос как можно больше полезного контекста. Будьте конкретны в отношении:

Временных периодов или диапазонов дат
Типа анализа (средние значения, итоги, рейтинги и т. д.)
Критериев фильтрации

### Поиск дорогих рынков недвижимости {#finding-expensive-housing-markets}

Начнём с вопроса о ценах на жильё. SQL-песочница содержит набор данных о ценах на жильё в Великобритании, который ИИ автоматически обнаружит:

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

После нажатия Enter мы увидим процесс рассуждений ИИ при попытке ответить на наш вопрос.

```text
• Starting AI SQL generation with schema discovery...
─────────────────────────────────────────────────
🧠 thinking...[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01QpQd35ZD8HM9QSYFZuQ8Wh
🔧 Calling: list_databases [toolu_01...]
🧠 thinking✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🔧 Calling: list_databases [toolu_01...]
✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_016DxK8SMVKGrUPfFwi43AzE
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
🧠 thinking.✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🧠 thinking.[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_015giF12wm619beNGC5aTrmw
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
🧠 thinking..✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01HxT1HKbaTT3165Wx5bDtY9
─────────────────────────────────────────────────
• ✨ SQL query generated successfully!
:) SELECT     town,     district,     county,     round(avg(price), 2) as avg_price,     count() as total_sales FROM uk.uk_price_paid WHERE date >= '2021-01-01' AND date <= '2021-12-31' GROUP BY     town,     district,     county HAVING total_sales >= 10 ORDER BY avg_price DESC LIMIT 10
```

ИИ выполняет следующие шаги:

1. Обнаружение схемы — исследует доступные базы данных и таблицы
2. Анализ таблиц — изучает структуру соответствующих таблиц
3. Генерация запроса — создаёт SQL на основе вашего вопроса и обнаруженной схемы

Мы видим, что он нашёл таблицу `uk_price_paid` и сгенерировал запрос для выполнения.
При выполнении этого запроса мы увидим следующий результат:


```text
┌─town───────────┬─district───────────────┬─county──────────┬──avg_price─┬─total_sales─┐
│ ILKLEY         │ HARROGATE              │ NORTH YORKSHIRE │    4310200 │          10 │
│ LONDON         │ CITY OF LONDON         │ GREATER LONDON  │ 4008117.32 │         311 │
│ LONDON         │ CITY OF WESTMINSTER    │ GREATER LONDON  │ 2847409.81 │        3984 │
│ LONDON         │ KENSINGTON AND CHELSEA │ GREATER LONDON  │  2331433.1 │        2594 │
│ EAST MOLESEY   │ RICHMOND UPON THAMES   │ GREATER LONDON  │ 2244845.83 │          12 │
│ LEATHERHEAD    │ ELMBRIDGE              │ SURREY          │ 2051836.42 │         102 │
│ VIRGINIA WATER │ RUNNYMEDE              │ SURREY          │ 1914137.53 │         169 │
│ REIGATE        │ MOLE VALLEY            │ SURREY          │ 1715780.89 │          18 │
│ BROADWAY       │ TEWKESBURY             │ GLOUCESTERSHIRE │ 1633421.05 │          19 │
│ OXFORD         │ SOUTH OXFORDSHIRE      │ OXFORDSHIRE     │ 1628319.07 │         405 │
└────────────────┴────────────────────────┴─────────────────┴────────────┴─────────────┘
```

Если мы хотим задать уточняющие вопросы, нам нужно формулировать запрос с нуля.

### Поиск дорогой недвижимости в Большом Лондоне {#finding-expensive-properties-in-greater-london}

Поскольку функция не сохраняет историю диалога, каждый запрос должен быть самодостаточным. При задании уточняющих вопросов необходимо предоставлять полный контекст, а не ссылаться на предыдущие запросы.
Например, после просмотра предыдущих результатов может возникнуть желание сосредоточиться именно на недвижимости в Большом Лондоне. Вместо вопроса «Что насчёт Большого Лондона?» необходимо включить полный контекст:

```sql
?? Можете ли вы сказать мне, где самое дорогое место для покупки дома в Большом Лондоне за все годы?;
```

Обратите внимание, что ИИ проходит через тот же процесс анализа, хотя только что изучил эти данные:


```text
• Запуск генерации SQL с помощью ИИ и обнаружение схемы...
─────────────────────────────────────────────────
🧠 обработка[INFO] Генерация текста успешно завершена - модель: claude-3-5-sonnet-latest, response_id: msg_012m4ayaSHTYtX98gxrDy1rz
🔧 Вызов: list_databases [toolu_01...]
✓ list_databases завершён
  └─ Найдено баз данных: 37 - amazon - bluesky - country - covid - default - dns - en...
🔧 Вызов: list_databases [toolu_01...]
🧠 обработка.✓ list_databases завершён
  └─ Найдено баз данных: 37 - amazon - bluesky - country - covid - default - dns - en...
🧠 обработка.[INFO] Генерация текста успешно завершена - модель: claude-3-5-sonnet-latest, response_id: msg_01KU4SZRrJckutXUzfJ4NQtA
🔧 Вызов: list_tables_in_database [toolu_01...]
  └─ Аргументы: {"database":"uk"}
🧠 обработка..✓ list_tables_in_database завершён
  └─ Найдено таблиц в базе данных 'uk': 9 - uk_codes - uk_postcode_to_iso - uk_price_p...
🔧 Вызов: list_tables_in_database [toolu_01...]
  └─ Аргументы: {"database":"uk"}
✓ list_tables_in_database завершён
  └─ Найдено таблиц в базе данных 'uk': 9 - uk_codes - uk_postcode_to_iso - uk_price_p...
🧠 обработка[INFO] Генерация текста успешно завершена - модель: claude-3-5-sonnet-latest, response_id: msg_01X9CnxoBpbD2xj2UzuRy2is
🔧 Вызов: get_schema_for_table [toolu_01...]
  └─ Аргументы: {"database":"uk","table":"uk_price_paid"}
🧠 обработка.✓ get_schema_for_table завершён
  └─ Схема для uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🔧 Вызов: get_schema_for_table [toolu_01...]
  └─ Аргументы: {"database":"uk","table":"uk_price_paid"}
✓ get_schema_for_table завершён
  └─ Схема для uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🧠 обработка...[INFO] Генерация текста успешно завершена - модель: claude-3-5-sonnet-latest, response_id: msg_01QTMypS1XuhjgVpDir7N9wD
─────────────────────────────────────────────────
• ✨ SQL-запрос успешно сгенерирован!
:) SELECT     district,     toYear(date) AS year,     round(avg(price), 2) AS avg_price,     count() AS total_sales FROM uk.uk_price_paid WHERE county = 'GREATER LONDON' GROUP BY district, year HAVING total_sales >= 10 ORDER BY avg_price DESC LIMIT 10;
```

Это формирует более точный запрос, который отфильтровывает данные именно по Большому Лондону и разбивает результаты по годам.
Результат выполнения запроса показан ниже:

```text
┌─район───────────────┬─год──┬───средняя_цена─┬─всего_продаж─┐
│ CITY OF LONDON      │ 2019 │ 14504772.73    │          299 │
│ CITY OF LONDON      │ 2017 │  6351366.11    │          367 │
│ CITY OF LONDON      │ 2016 │  5596348.25    │          243 │
│ CITY OF LONDON      │ 2023 │  5576333.72    │          252 │
│ CITY OF LONDON      │ 2018 │  4905094.54    │          523 │
│ CITY OF LONDON      │ 2021 │  4008117.32    │          311 │
│ CITY OF LONDON      │ 2025 │  3954212.39    │           56 │
│ CITY OF LONDON      │ 2014 │  3914057.39    │          416 │
│ CITY OF LONDON      │ 2022 │  3700867.19    │          290 │
│ CITY OF WESTMINSTER │ 2018 │  3562457.76    │         3346 │
└─────────────────────┴──────┴────────────────┴──────────────┘
```

Сити‑оф‑Лондон стабильно оказывается самым дорогим районом! Вы заметите, что ИИ составил разумный запрос, хотя результаты упорядочены по средней цене, а не хронологически. Для анализа «год к году» мы могли бы уточнить ваш вопрос и попросить явно найти «самый дорогой район каждый год», чтобы получить результаты, сгруппированные по‑другому.
