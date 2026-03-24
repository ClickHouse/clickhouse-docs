---
title: 'Ускорение аналитики с помощью MergeTree'
sidebar_label: 'Ускорение запросов'
slug: /use-cases/data-lake/getting-started/accelerating-analytics
sidebar_position: 3
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/connecting-catalogs
pagination_next: use-cases/data_lake/guides/writing-data
description: 'Загружайте данные из открытых табличных форматов в таблицы ClickHouse MergeTree, чтобы значительно ускорить аналитические запросы.'
keywords: ['озера данных', 'lakehouse', 'MergeTree', 'ускорение', 'аналитика', 'инвертированный индекс', 'полнотекстовый индекс', 'INSERT INTO SELECT']
doc_type: 'guide'
---

В [предыдущем разделе](/use-cases/data-lake/getting-started/connecting-catalogs) вы подключили ClickHouse к каталогу данных и выполняли запросы к открытым табличным форматам напрямую. Хотя выполнять запросы к данным на месте удобно, открытые табличные форматы не оптимизированы для рабочих нагрузок с низкой задержкой и высокой степенью параллелизма, характерных для дашбордов и операционной отчетности. Для таких сценариев загрузка данных в движок ClickHouse [MergeTree](/engines/table-engines/mergetree-family/mergetree) обеспечивает значительно более высокую производительность.

MergeTree имеет несколько преимуществ по сравнению с прямым чтением открытых табличных форматов:

* **[Разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes)** — упорядочивает данные на диске по выбранному ключу, позволяя ClickHouse пропускать большие диапазоны нерелевантных строк при выполнении запросов.
* **Расширенные типы данных** — нативная поддержка таких типов, как [JSON](/best-practices/use-json-where-appropriate), [LowCardinality](/sql-reference/data-types/lowcardinality) и [Enum](/sql-reference/data-types/enum), обеспечивает более компактное хранение и более быструю обработку.
* **[Индексы пропуска](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-data_skipping-indexes)** и **[полнотекстовые индексы](/engines/table-engines/mergetree-family/textindexes)** — структуры вторичных индексов, которые позволяют ClickHouse пропускать гранулы, не соответствующие предикатам фильтрации в запросе; особенно эффективны для нагрузок, связанных с текстовым поиском.
* **Быстрые вставки с автоматической компакцией** — ClickHouse рассчитан на вставки с высокой пропускной способностью и автоматически объединяет части данных в фоновом режиме, аналогично компакции в открытых табличных форматах.
* **Оптимизировано для параллельного чтения** — столбцовая структура хранения MergeTree в сочетании с [несколькими уровнями кэширования](/operations/caches) поддерживает аналитические нагрузки в реальном времени с высокой степенью параллелизма — то, для чего открытые табличные форматы не предназначены.

В этом руководстве показано, как загружать данные из каталога в таблицу MergeTree с помощью `INSERT INTO SELECT`, чтобы ускорить аналитику.

## Подключение к каталогу \{#connect-catalog\}

Мы будем использовать то же подключение к Unity Catalog из [предыдущего руководства](/use-cases/data-lake/getting-started/connecting-catalogs), через конечную точку Iceberg REST:

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
```

### Просмотр списка таблиц \{#list-tables\}

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘
```

### Изучите схему \{#explore-schema\}

```sql
SHOW CREATE TABLE unity.`icebench.single_day_log`

CREATE TABLE unity.`icebench.single_day_log`
(
    `pull_request_number` Nullable(Int64),
    `commit_sha` Nullable(String),
    `check_start_time` Nullable(DateTime64(6, 'UTC')),
    `check_name` Nullable(String),
    `instance_type` Nullable(String),
    `instance_id` Nullable(String),
    `event_date` Nullable(Date32),
    `event_time` Nullable(DateTime64(6, 'UTC')),
    `event_time_microseconds` Nullable(DateTime64(6, 'UTC')),
    `thread_name` Nullable(String),
    `thread_id` Nullable(Decimal(20, 0)),
    `level` Nullable(String),
    `query_id` Nullable(String),
    `logger_name` Nullable(String),
    `message` Nullable(String),
    `revision` Nullable(Int64),
    `source_file` Nullable(String),
    `source_line` Nullable(Decimal(20, 0)),
    `message_format_string` Nullable(String)
)
ENGINE = Iceberg('s3://...')
```

Эта таблица содержит ~283 миллиона строк логов из прогонов тестов ClickHouse CI — реалистичный набор данных для анализа производительности.

```sql
SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

## Запрос к таблице озера данных \{#query-lakehouse\}

Выполним запрос, который отфильтровывает логи по имени потока и типу экземпляра, ищет ошибки в тексте сообщения и группирует результаты по логгеру:

```sql
SELECT
    logger_name,
    count() AS c
FROM icebench.`icebench.single_day_log`
WHERE (thread_name = 'TCPHandler')
    AND (instance_type = 'm6i.4xlarge')
    AND hasToken(message, 'error')
GROUP BY logger_name
ORDER BY c DESC
LIMIT 5

┌─logger_name──────────────┬────c─┐
│ executeQuery             │ 6907 │
│ TCPHandler               │ 4145 │
│ TCP-Session              │  790 │
│ PostgreSQLConnectionPool │  530 │
│ ContextAccess (default)  │  392 │
└──────────────────────────┴──────┘

5 rows in set. Elapsed: 8.921 sec. Processed 282.63 million rows, 5.42 GB (31.68 million rows/s., 607.26 MB/s.)
Peak memory usage: 4.35 GiB.
```

Запрос занимает почти **9 секунд**, потому что ClickHouse должен выполнить полное сканирование таблицы по всем файлам Parquet в Объектном хранилище. Производительность можно повысить с помощью партиционирования, но у столбцов вроде `logger_name` кардинальность может быть слишком высокой для эффективного партиционирования. У нас также нет индексов, таких как [текстовые индексы](/engines/table-engines/mergetree-family/mergetree#text), чтобы дополнительно отсекать данные. Именно здесь MergeTree проявляет себя лучше всего.

## Загрузка данных в MergeTree \{#load-data\}

### Создайте оптимизированную таблицу \{#create-table\}

Создадим таблицу MergeTree, уделив внимание оптимизации схемы. Обратите внимание на несколько ключевых отличий от схемы Iceberg:

* **Без обёрток `Nullable`** — удаление `Nullable` повышает эффективность хранения и производительность запросов.
* **`LowCardinality(String)`** для столбцов `level`, `instance_type`, `thread_name` и `check_name` — столбец кодируется как словарь, если в нём мало различных значений, что улучшает сжатие и ускоряет фильтрацию.
* **[Полнотекстовый индекс](/engines/table-engines/mergetree-family/textindexes)** для столбца `message` — ускоряет полнотекстовый поиск по токенам, например `hasToken(message, 'error')`.
* **Ключ `ORDER BY`** `(instance_type, thread_name, toStartOfMinute(event_time))` — размещает данные на диске в соответствии с типичными шаблонами фильтрации, чтобы [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) мог пропускать нерелевантные гранулы.

```sql
SET enable_full_text_index = 1;

CREATE TABLE single_day_log
(
    `pull_request_number` Int64,
    `commit_sha` String,
    `check_start_time` DateTime64(6, 'UTC'),
    `check_name` LowCardinality(String),
    `instance_type` LowCardinality(String),
    `instance_id` String,
    `event_date` Date32,
    `event_time` DateTime64(6, 'UTC'),
    `event_time_microseconds` DateTime64(6, 'UTC'),
    `thread_name` LowCardinality(String),
    `thread_id` Decimal(20, 0),
    `level` LowCardinality(String),
    `query_id` String,
    `logger_name` String,
    `message` String,
    `revision` Int64,
    `source_file` String,
    `source_line` Decimal(20, 0),
    `message_format_string` String,
    INDEX text_idx(message) TYPE text(tokenizer = splitByNonAlpha)
)
ENGINE = MergeTree
ORDER BY (instance_type, thread_name, toStartOfMinute(event_time))
```

### Вставка данных из каталога \{#insert-data\}

Используйте `INSERT INTO SELECT`, чтобы загрузить ~300 млн строк из таблицы озера данных в нашу таблицу ClickHouse:

```sql
INSERT INTO single_day_log SELECT * FROM icebench.`icebench.single_day_log`

282634391 rows in set. Elapsed: 237.680 sec. Processed 282.63 million rows, 5.42 GB (1.19 million rows/s., 22.79 MB/s.)
Peak memory usage: 18.62 GiB.
```

## Повторно выполните запрос \{#reexecute-query\}

Если теперь выполнить тот же запрос к таблице MergeTree, можно увидеть, что производительность значительно возрастёт:

```sql
SELECT
    logger_name,
    count() AS c
FROM single_day_log
WHERE (thread_name = 'TCPHandler')
    AND (instance_type = 'm6i.4xlarge')
    AND hasToken(message, 'error')
GROUP BY logger_name
ORDER BY c DESC
LIMIT 5

┌─logger_name──────────────┬────c─┐
│ executeQuery             │ 6907 │
│ TCPHandler               │ 4145 │
│ TCP-Session              │  790 │
│ PostgreSQLConnectionPool │  530 │
│ ContextAccess (default)  │  392 │
└──────────────────────────┴──────┘

5 rows in set. Elapsed: 0.220 sec. Processed 13.84 million rows, 2.85 GB (62.97 million rows/s., 12.94 GB/s.)
Peak memory usage: 1.12 GiB.
```

Теперь тот же запрос выполняется за **0,22 секунды** — это **ускорение примерно в 40 раз**. Такое улучшение обеспечивают две ключевые оптимизации:

* **Разреженный первичный индекс** - Ключ `ORDER BY (instance_type, thread_name, ...)` означает, что ClickHouse может сразу перейти к гранулам, соответствующим `instance_type = 'm6i.4xlarge'` и `thread_name = 'TCPHandler'`, сократив число обрабатываемых строк с 283 миллионов до всего 14 миллионов.
* **Полнотекстовый индекс** - Индекс `text_idx` для столбца `message` позволяет вычислять `hasToken(message, 'error')` по индексу, а не сканировать каждую строку сообщения, дополнительно уменьшая объём данных, которые ClickHouse нужно прочитать.

В результате получается запрос, который может без проблем использоваться в панели мониторинга реального времени — при масштабе и задержке, недостижимых для запросов к файлам Parquet в Объектном хранилище.
