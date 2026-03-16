---
title: 'Запись данных в открытые форматы таблиц'
sidebar_label: 'Запись в озера данных'
slug: /use-cases/data-lake/getting-started/writing-data
sidebar_position: 4
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/accelerating-analytics
pagination_next: null
description: 'Записывайте данные из ClickHouse обратно в таблицы Iceberg в Объектном хранилище для долгосрочного хранения и дальнейшего использования.'
keywords: ['озера данных', 'lakehouse', 'запись', 'iceberg', 'обратный ETL', 'INSERT INTO', 'IcebergS3']
doc_type: 'guide'
---

В предыдущих руководствах вы выполняли запросы к открытым форматам таблиц без перемещения данных и загружали данные в MergeTree для быстрой аналитики. Во многих архитектурах данные также должны передаваться в обратном направлении — из ClickHouse обратно в открытые форматы таблиц. Обычно это требуется в двух сценариях:

* **Выгрузка в долгосрочное хранилище** — Данные поступают в ClickHouse как слой Real-time аналитики, обеспечивающий работу дашбордов и операционной отчетности. Когда данные выходят за пределы окна использования в реальном времени, их можно записать в Iceberg в Объектном хранилище для надежного и экономичного долговременного хранения в интероперабельном формате.
* **Обратный ETL** — Преобразования, агрегации и обогащение, выполняемые в ClickHouse, создают производные наборы данных, которые должны использоваться downstream-инструментами и другими командами. Запись этих результатов в таблицы Iceberg делает их доступными для всей экосистемы данных.

В обоих случаях `INSERT INTO SELECT` позволяет перемещать данные из таблиц ClickHouse в таблицы Iceberg, хранящиеся в Объектном хранилище.

:::note
Запись в открытые форматы таблиц в настоящее время поддерживается **только для таблиц Iceberg**. Частичная поддержка таблиц Delta Lake находится в разработке. Таблицы не должны управляться каталогом.
:::

## Подготовьте исходный набор данных \{#prepare-source\}

В этом руководстве мы будем использовать набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid) — общедоступный реестр всех сделок с жилой недвижимостью в Англии и Уэльсе.

### Создайте и заполните таблицу MergeTree \{#create-source-table\}

```sql
CREATE DATABASE uk;

CREATE TABLE uk.uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Заполните таблицу непосредственно из общедоступного CSV-источника:

```sql
INSERT INTO uk.uk_price_paid
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;

30906560 rows in set. Elapsed: 59.852 sec. Processed 30.91 million rows, 5.41 GB (516.39 thousand rows/s., 90.40 MB/s.)
Peak memory usage: 485.15 MiB.
```

## Запишите данные в таблицу Iceberg \{#write-iceberg\}

### Создайте таблицу Iceberg \{#create-iceberg-table\}

Чтобы записывать данные в Iceberg, создайте таблицу с помощью [табличного движка `IcebergS3`](/engines/table-engines/integrations/iceberg).

Обратите внимание, что схему необходимо упростить по сравнению с исходной таблицей MergeTree. ClickHouse поддерживает более богатую систему типов, чем Iceberg и лежащие в его основе файлы Parquet: такие типы, как `Enum`, `LowCardinality` и `UInt8`, в Iceberg не поддерживаются и должны быть преобразованы в совместимые типы.

```sql
CREATE TABLE uk.uk_iceberg
(
    price UInt32,
    date Date,
    postcode1 String,
    postcode2 String,
    type UInt32,
    is_new UInt32,
    duration UInt32,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String
)
ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg_uk_price_paid/', '<aws_access_key>', '<aws_secret_key>', '<session_token>')
```

### Вставка подмножества данных \{#insert-subset\}

Используйте `INSERT INTO SELECT`, чтобы записать данные из таблицы MergeTree в таблицу Iceberg. В этом примере мы записываем только лондонские транзакции:

```sql
SET allow_experimental_insert_into_iceberg = 1;

INSERT INTO uk.uk_iceberg SELECT *
FROM uk.uk_price_paid
WHERE town = 'LONDON'

2346741 rows in set. Elapsed: 1.419 sec. Processed 30.91 million rows, 153.43 MB (21.78 million rows/s., 108.15 MB/s.)
Peak memory usage: 371.60 MiB.
```

### Выполните запрос к таблице Iceberg \{#query-iceberg\}

Теперь данные хранятся в формате Iceberg в Объектном хранилище, и к ним можно обращаться с запросами из ClickHouse — или из любого другого инструмента, который поддерживает чтение Iceberg:

```sql
SELECT
    locality,
    count()
FROM uk.uk_iceberg
WHERE locality != ''
GROUP BY locality
ORDER BY count() DESC
LIMIT 10

┌─locality────┬─count()─┐
│ LONDON      │  896796 │
│ WALTHAMSTOW │    8610 │
│ LEYTON      │    3525 │
│ CHINGFORD   │    3133 │
│ HORNSEY     │    2794 │
│ STREATHAM   │    2760 │
│ WOOD GREEN  │    2443 │
│ ACTON       │    2155 │
│ LEYTONSTONE │    2102 │
│ EAST HAM    │    2085 │
└─────────────┴─────────┘

10 rows in set. Elapsed: 0.329 sec. Processed 457.86 thousand rows, 2.62 MB (1.39 million rows/s., 7.95 MB/s.)
Peak memory usage: 12.19 MiB.
```

## Запись агрегированных результатов \{#write-aggregates\}

Таблицы Iceberg не ограничиваются хранением исходных строк. Они также могут содержать результаты агрегаций и преобразований — результаты ETL-процессов, выполняемых внутри ClickHouse. Это полезно, когда нужно публиковать предварительно вычисленные сводки в lakehouse для последующего использования.

### Создайте таблицу Iceberg для агрегированных данных \{#create-aggregate-table\}

```sql
CREATE TABLE uk.uk_avg_town
(
    price Float64,
    town String
)
ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg_uk_avg_town/', '<aws_access_key>', '<aws_secret_key>', '<session_token>')
```

### Вставка агрегированных данных \{#insert-aggregates\}

Вычислите средние цены на недвижимость по городам и запишите результаты непосредственно в Iceberg:

```sql
INSERT INTO uk.uk_avg_town SELECT
    avg(price) AS price,
    town
FROM uk.uk_price_paid
GROUP BY town

1173 rows in set. Elapsed: 0.480 sec. Processed 30.91 million rows, 185.44 MB (64.34 million rows/s., 386.05 MB/s.)
Peak memory usage: 4.18 MiB.
```

### Выполните запрос к агрегированной таблице \{#query-aggregates\}

Другие инструменты — и другие экземпляры ClickHouse — теперь могут читать этот заранее вычисленный набор данных:

```sql
SELECT
    town,
    price
FROM uk.uk_avg_town
ORDER BY price DESC
LIMIT 10

┌─town───────────────┬──────────────price─┐
│ GATWICK            │ 28232811.583333332 │
│ THORNHILL          │             985000 │
│ VIRGINIA WATER     │  984633.2938574939 │
│ CHALFONT ST GILES  │  863347.7280187573 │
│ COBHAM             │    775251.47313278 │
│ PURFLEET-ON-THAMES │           772651.8 │
│ BEACONSFIELD       │  746052.9327405858 │
│ ESHER              │  686708.4969745865 │
│ KESTON             │  654541.1774842045 │
│ GERRARDS CROSS     │  639109.4084023251 │
└────────────────────┴────────────────────┘

10 rows in set. Elapsed: 0.210 sec.
```
