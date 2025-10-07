---
'slug': '/use-cases/AI/ai-powered-sql-generation'
'sidebar_label': 'AI-поддерживаемая генерация SQL'
'title': 'AI-поддерживаемая генерация SQL'
'pagination_prev': null
'pagination_next': null
'description': 'Этот гид объясняет, как использовать AI для генерации SQL запросов
  в ClickHouse Client или clickhouse-local.'
'keywords':
- 'AI'
- 'SQL generation'
'show_related_blogs': true
'doc_type': 'guide'
---
Начиная с ClickHouse 25.7, [ClickHouse Client](https://clickhouse.com/docs/interfaces/cli) и [clickhouse-local](https://clickhouse.com/docs/operations/utilities/clickhouse-local) включают в себя [функциональность на основе ИИ](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation), которая преобразует описания на естественном языке в SQL-запросы. Эта функция позволяет пользователям описывать свои требования к данным простым текстом, который система затем переводит в соответствующие SQL-операторы.

Эта возможность особенно полезна для пользователей, которые могут не быть знакомы со сложным SQL-синтаксисом или нуждаются в быстром генерировании запросов для исследовательского анализа данных. Функция работает со стандартными таблицами ClickHouse и поддерживает общие шаблоны запросов, включая фильтрацию, агрегацию и объединения.

Она делает это с помощью следующих встроенных инструментов/функций:

* `list_databases` - Перечислить все доступные базы данных в экземпляре ClickHouse
* `list_tables_in_database` - Перечислить все таблицы в конкретной базе данных
* `get_schema_for_table` - Получить оператор `CREATE TABLE` (схема) для конкретной таблицы

## Предварительные требования {#prerequisites}

Необходимо добавить ключ Anthropic или OpenAI в качестве переменной окружения:

```bash
export ANTHROPIC_API_KEY=your_api_key
export OPENAI_API_KEY=your_api_key
```

Кроме того, вы можете [предоставить файл конфигурации](https://clickhouse.com/docs/interfaces/cli#ai-sql-generation-configuration).

## Подключение к SQL-площадке ClickHouse {#connecting-to-the-clickhouse-sql-playground}

Мы собираемся изучить эту функцию, используя [SQL-площадку ClickHouse](https://sql.clickhouse.com/).

Мы можем подключиться к SQL-площадке ClickHouse с помощью следующей команды:

```bash
clickhouse client -mn \
--host sql-clickhouse.clickhouse.com \
--secure \
--user demo --password ''
```

:::note
Мы предполагаем, что у вас установлен ClickHouse, но если это не так, обратитесь к [руководству по установке](https://clickhouse.com/docs/install)
:::

## Задаем ClickHouse вопросы на естественном языке {#asking-clickhouse-questions-in-natural-language}

Теперь пришло время задать несколько вопросов!

Функция преобразования текста в SQL по сути является инструментом генерации запросов в один проход. Поскольку она не сохраняет историю беседы, включайте как можно больше полезного контекста в ваш вопрос. Будьте конкретны по поводу:

Периодов времени или диапазонов дат
Типа анализа, который вы хотите (средние значения, итоги, рейтинги и т.д.)
Любых критериев фильтрации

### Поиск дорогих рынков жилья {#finding-expensive-housing-markets}

Начнем с вопроса о ценах на жилье. SQL-площадка содержит набор данных о ценах на жилье в Великобритании, который ИИ автоматически обнаружит:

```sql
?? Can you tell me the most expensive place to buy a house in 2021?;
```

После нажатия клавиши Enter мы увидим процесс размышлений ИИ, когда он пытается ответить на наш вопрос.

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

ИИ проходит следующие этапы:

1. Обнаружение схемы - Исследует доступные базы данных и таблицы
2. Анализ таблицы - Изучает структуру соответствующих таблиц
3. Генерация запроса - Создает SQL на основе вашего вопроса и обнаруженной схемы

Мы видим, что он действительно нашел таблицу `uk_price_paid` и сгенерировал запрос для нас.
Если мы запустим этот запрос, мы увидим следующий вывод:

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

Если мы хотим задать дополнительные вопросы, нам нужно будет задать вопрос заново.

### Поиск дорогих объектов недвижимости в Большом Лондоне {#finding-expensive-properties-in-greater-london}

Поскольку функция не сохраняет историю беседы, каждый запрос должен быть самодостаточным. При задавании последующих вопросов необходимо предоставлять полный контекст, а не ссылаться на предыдущие запросы.
Например, после того, как мы увидели предыдущие результаты, мы можем захотеть сосредоточиться конкретно на объектах недвижимости в Большом Лондоне. Вместо того чтобы спрашивать "А что насчет Большого Лондона?", нам нужно включить полный контекст:

```sql
?? Can you tell me the most expensive place to buy a house in Greater London across the years?;
```

Обратите внимание, что ИИ проходит тот же процесс обнаружения, даже несмотря на то, что он только что изучал эти данные:

```text
• Starting AI SQL generation with schema discovery...
─────────────────────────────────────────────────
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_012m4ayaSHTYtX98gxrDy1rz
🔧 Calling: list_databases [toolu_01...]
✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🔧 Calling: list_databases [toolu_01...]
🧠 thinking.✓ list_databases completed
  └─ Found 37 databases: - amazon - bluesky - country - covid - default - dns - en...
🧠 thinking.[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01KU4SZRrJckutXUzfJ4NQtA
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
🧠 thinking..✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🔧 Calling: list_tables_in_database [toolu_01...]
  └─ Args: {"database":"uk"}
✓ list_tables_in_database completed
  └─ Found 9 tables in database 'uk': - uk_codes - uk_postcode_to_iso - uk_price_p...
🧠 thinking[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01X9CnxoBpbD2xj2UzuRy2is
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
🧠 thinking.✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🔧 Calling: get_schema_for_table [toolu_01...]
  └─ Args: {"database":"uk","table":"uk_price_paid"}
✓ get_schema_for_table completed
  └─ Schema for uk.uk_price_paid: CREATE TABLE uk.uk_price_paid (     `price` UInt...
🧠 thinking...[INFO] Text generation successful - model: claude-3-5-sonnet-latest, response_id: msg_01QTMypS1XuhjgVpDir7N9wD
─────────────────────────────────────────────────
• ✨ SQL query generated successfully!
:) SELECT     district,     toYear(date) AS year,     round(avg(price), 2) AS avg_price,     count() AS total_sales FROM uk.uk_price_paid WHERE county = 'GREATER LONDON' GROUP BY district, year HAVING total_sales >= 10 ORDER BY avg_price DESC LIMIT 10;
```

Это генерирует более целевой запрос, который фильтрует результаты специально для Большого Лондона и разбивает результаты по годам.
Вывод запроса показан ниже:

```text
┌─district────────────┬─year─┬───avg_price─┬─total_sales─┐
│ CITY OF LONDON      │ 2019 │ 14504772.73 │         299 │
│ CITY OF LONDON      │ 2017 │  6351366.11 │         367 │
│ CITY OF LONDON      │ 2016 │  5596348.25 │         243 │
│ CITY OF LONDON      │ 2023 │  5576333.72 │         252 │
│ CITY OF LONDON      │ 2018 │  4905094.54 │         523 │
│ CITY OF LONDON      │ 2021 │  4008117.32 │         311 │
│ CITY OF LONDON      │ 2025 │  3954212.39 │          56 │
│ CITY OF LONDON      │ 2014 │  3914057.39 │         416 │
│ CITY OF LONDON      │ 2022 │  3700867.19 │         290 │
│ CITY OF WESTMINSTER │ 2018 │  3562457.76 │        3346 │
└─────────────────────┴──────┴─────────────┴─────────────┘
```

Сити Лондона постоянно появляется как самый дорогой район! Вы заметите, что ИИ создал разумный запрос, хотя результаты упорядочены по средней цене, а не по хронологии. Для анализа по годам мы можем уточнить наш вопрос, чтобы попросить "самый дорогой район каждый год", чтобы получить результаты, сгруппированные иначе.