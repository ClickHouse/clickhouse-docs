---
title: '将数据写入开放表格式'
sidebar_label: '写入数据湖'
slug: /use-cases/data-lake/getting-started/writing-data
sidebar_position: 4
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/accelerating-analytics
pagination_next: null
description: '将数据从 ClickHouse 回写到对象存储中的 Iceberg 表，以实现长期存储和供下游使用。'
keywords: ['数据湖', '湖仓', '写入', 'iceberg', '反向 ETL', 'INSERT INTO', 'IcebergS3']
doc_type: 'guide'
---

在前面的指南中，你已经直接查询了开放表格式中的数据，并将数据加载到 MergeTree 中以加速分析。在许多架构中，数据也需要反向流动——从 ClickHouse 回写到湖仓格式。通常有以下两种常见场景：

* **卸载到长期存储** - 数据进入 ClickHouse 后，作为实时分析层为仪表板和运营报表提供支持。一旦数据超出实时分析窗口，就可以将其写入对象存储中的 Iceberg，以可互操作的格式实现持久且经济高效的长期保留。
* **反向 ETL** - 在 ClickHouse 内执行的转换、聚合和增强处理会生成下游工具和其他团队需要使用的派生数据集。将这些结果写入 Iceberg 表后，它们就可以在更广泛的数据生态系统中使用。

在这两种情况下，都可以使用 `INSERT INTO SELECT` 将数据从 ClickHouse 表写入存储在对象存储中的 Iceberg 表。

:::note
目前，写入开放表格式仅支持 **Iceberg 表**。对 Delta Lake 表的部分支持正在开发中。这些表不得由 catalog 管理。
:::

## 准备源数据集 \{#prepare-source\}

本指南将使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid) 数据集——这是记录英格兰和威尔士所有住宅房产交易的公开数据集。

### 创建并填充 MergeTree 表 \{#create-source-table\}

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

直接从公开的 CSV 数据源向表中导入数据：

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

## 将数据写入 Iceberg 表 \{#write-iceberg\}

### 创建 Iceberg 表 \{#create-iceberg-table\}

要将数据写入 Iceberg，请使用 [`IcebergS3` 表引擎](/engines/table-engines/integrations/iceberg) 创建表。

请注意，与 MergeTree 源表相比，表结构必须更简化。ClickHouse 支持比 Iceberg 及其底层 Parquet 文件更丰富的类型系统——例如 `Enum`、`LowCardinality` 和 `UInt8` 等类型在 Iceberg 中不受支持，必须映射为兼容的类型。

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

### 插入部分数据 \{#insert-subset\}

使用 `INSERT INTO SELECT` 将数据从 MergeTree 表写入 Iceberg 表。在此示例中，我们仅写入伦敦的交易数据：

```sql
SET allow_experimental_insert_into_iceberg = 1;

INSERT INTO uk.uk_iceberg SELECT *
FROM uk.uk_price_paid
WHERE town = 'LONDON'

2346741 rows in set. Elapsed: 1.419 sec. Processed 30.91 million rows, 153.43 MB (21.78 million rows/s., 108.15 MB/s.)
Peak memory usage: 371.60 MiB.
```

### 查询 Iceberg 表 \{#query-iceberg\}

现在，数据已以 Iceberg 格式存储在对象存储中，并且可以通过 ClickHouse 或任何其他支持读取 Iceberg 的工具进行查询：

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

## 写入聚合结果 \{#write-aggregates\}

Iceberg 表并不局限于存储原始行数据。它们还可以保存聚合和转换的输出，也就是在 ClickHouse 内部执行的 ETL 过程所产生的结果。这对于将预先计算好的汇总结果发布到 lakehouse 供下游使用非常有帮助。

### 为聚合结果创建 Iceberg 表 \{#create-aggregate-table\}

```sql
CREATE TABLE uk.uk_avg_town
(
    price Float64,
    town String
)
ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg_uk_avg_town/', '<aws_access_key>', '<aws_secret_key>', '<session_token>')
```

### 插入聚合后的数据 \{#insert-aggregates\}

按城镇计算房产平均价格，并将结果直接写入 Iceberg：

```sql
INSERT INTO uk.uk_avg_town SELECT
    avg(price) AS price,
    town
FROM uk.uk_price_paid
GROUP BY town

1173 rows in set. Elapsed: 0.480 sec. Processed 30.91 million rows, 185.44 MB (64.34 million rows/s., 386.05 MB/s.)
Peak memory usage: 4.18 MiB.
```

### 查询聚合表 \{#query-aggregates\}

现在，其他工具和其他 ClickHouse 实例也可以读取这个预计算的数据集：

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
