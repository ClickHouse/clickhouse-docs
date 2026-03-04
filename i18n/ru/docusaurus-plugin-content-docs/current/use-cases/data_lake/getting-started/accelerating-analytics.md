---
title: 'Ускорение аналитики с помощью MergeTree'
sidebar_label: 'Ускорение запросов'
slug: /use-cases/data-lake/getting-started/accelerating-analytics
sidebar_position: 3
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/getting-started/connecting-catalogs
pagination_next: use-cases/data_lake/getting-started/writing-data
description: 'Загружайте данные из открытых табличных форматов в таблицы ClickHouse MergeTree для кардинального ускорения аналитических запросов.'
keywords: ['озера данных', 'lakehouse', 'MergeTree', 'ускорение', 'аналитика', 'обратный индекс', 'полнотекстовый индекс', 'INSERT INTO SELECT']
doc_type: 'guide'
---

В [предыдущем разделе](/use-cases/data-lake/getting-started/connecting-catalogs) вы подключили ClickHouse к каталогу данных и выполняли запросы к открытым табличным форматам напрямую. Хотя выполнять запросы к данным по месту их хранения удобно, lakehouse-форматы не оптимизированы для низких задержек и высокой параллельности, которые требуются дашбордам и операционной отчётности. Для таких сценариев загрузка данных в движок [MergeTree](/engines/table-engines/mergetree-family/mergetree) ClickHouse обеспечивает существенно более высокую производительность.

MergeTree предоставляет несколько преимуществ по сравнению с прямым чтением открытых табличных форматов:

- **[Разреженный первичный индекс](/optimize/sparse-primary-indexes)** — упорядочивает данные на диске по выбранному ключу, позволяя ClickHouse пропускать большие диапазоны нерелевантных строк во время выполнения запросов.
- **Расширенные типы данных** — нативная поддержка типов, таких как [JSON](/sql-reference/data-types/json), [LowCardinality](/sql-reference/data-types/lowcardinality) и [Enum](/sql-reference/data-types/enum), что обеспечивает более компактное хранение и более быструю обработку.
- **[Пропускающие индексы](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-data_skipping-indexes)** и **[полнотекстовые индексы](/engines/table-engines/mergetree-family/invertedindexes)** — вторичные структуры индексов, которые позволяют ClickHouse пропускать гранулы, не соответствующие фильтрам запроса, что особенно эффективно для нагрузок полнотекстового поиска.
- **Быстрые вставки с автоматической компакцией** — ClickHouse спроектирован для высокопроизводительных вставок и автоматически объединяет части данных в фоновом режиме, аналогично операции compaction в открытых табличных форматах.
- **Оптимизация для одновременных чтений** — столбцовая организация хранения MergeTree в сочетании с [несколькими уровнями кеширования](/operations/caches) поддерживает аналитические рабочие нагрузки в реальном времени с высокой степенью параллельности — то, для чего открытые табличные форматы не предназначены.

В этом руководстве показано, как загружать данные из каталога в таблицу MergeTree с помощью `INSERT INTO SELECT` для более быстрой аналитики.

## Подключение к каталогу \{#connect-catalog\}

Мы будем использовать то же подключение к Unity Catalog из [предыдущего руководства](/use-cases/data-lake/getting-started/connecting-catalogs), подключаясь через REST-эндпоинт Iceberg:

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
```


### Список таблиц \{#list-tables\}

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘
```


### Изучите схему таблицы \{#explore-schema\}

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

Эта таблица содержит около 283 миллионов строк логов из прогонов CI-тестов ClickHouse — реалистичный набор данных для оценки аналитической производительности.

```sql
SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```


## Выполнение запроса по таблице lakehouse \{#query-lakehouse\}

Выполним запрос, который отфильтрует логи по имени потока и типу инстанса, найдёт в тексте сообщения ошибки и сгруппирует результаты по логгеру:

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

Запрос выполняется почти **9 секунд**, потому что ClickHouse должен выполнить полное сканирование всей таблицы по всем файлам Parquet в Объектном хранилище. Производительность можно улучшить с помощью партиционирования, но такие столбцы, как `logger_name`, могут иметь слишком высокую кардинальность, чтобы их можно было эффективно использовать для партиционирования. У нас также нет индексов, таких как [Text indices](/engines/table-engines/mergetree-family/mergetree#text), чтобы дополнительно отфильтровывать данные. В этом и заключается преимущество MergeTree.


## Загрузка данных в MergeTree \{#load-data\}

### Создайте оптимизированную таблицу \{#create-table\}

Мы создаём таблицу MergeTree с некоторыми оптимизациями схемы. Обратите внимание на несколько ключевых отличий от схемы Iceberg:

* **Без обёрток `Nullable`** — удаление `Nullable` повышает эффективность хранения и производительность выполнения запросов.
* **`LowCardinality(String)`** на столбцах `level`, `instance_type`, `thread_name` и `check_name` — выполняет словарное кодирование столбца с небольшим числом различных значений для лучшего сжатия и более быстрой фильтрации.
* **[Полнотекстовый индекс](/engines/table-engines/mergetree-family/invertedindexes)** на столбце `message` — ускоряет текстовый поиск по токенам, например `hasToken(message, 'error')`.
* **Ключ `ORDER BY`** вида `(instance_type, thread_name, toStartOfMinute(event_time))` — выравнивает данные на диске с распространёнными шаблонами фильтрации, чтобы [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) мог пропускать нерелевантные гранулы.

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

Используйте `INSERT INTO SELECT`, чтобы загрузить ~300 млн строк из таблицы lakehouse в нашу таблицу ClickHouse:

```sql
INSERT INTO single_day_log SELECT * FROM icebench.`icebench.single_day_log`

282634391 rows in set. Elapsed: 237.680 sec. Processed 282.63 million rows, 5.42 GB (1.19 million rows/s., 22.79 MB/s.)
Peak memory usage: 18.62 GiB.
```


## Повторное выполнение запроса \{#reexecute-query\}

Если теперь повторно выполнить тот же запрос по таблице MergeTree, мы увидим, что производительность значительно улучшится:

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

Тот же запрос теперь выполняется за **0,22 секунды** — это **примерно 40-кратное ускорение**. Два ключевых улучшения обеспечивают этот прирост производительности:

* **Разреженный первичный индекс** — ключ `ORDER BY (instance_type, thread_name, ...)` позволяет ClickHouse сразу переходить к гранулам, соответствующим `instance_type = 'm6i.4xlarge'` и `thread_name = 'TCPHandler'`, сокращая число обрабатываемых строк с 283 миллионов до всего лишь 14 миллионов.
* **Полнотекстовый индекс** — индекс `text_idx` по столбцу `message` позволяет функции `hasToken(message, 'error')` выполняться по индексу, а не путём сканирования каждой строковой записи сообщения, ещё больше снижая объём данных, который нужно прочитать ClickHouse.

В результате запрос без проблем может обеспечивать работу дашборда в реальном времени — на масштабах и с задержками, недостижимыми при выполнении запросов к файлам Parquet в объектном хранилище.
