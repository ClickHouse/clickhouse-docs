---
title: '使用 MergeTree 加速分析'
sidebar_label: '加速查询'
slug: /use-cases/data-lake/getting-started/accelerating-analytics
sidebar_position: 3
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/connecting-catalogs
pagination_next: use-cases/data_lake/guides/writing-data
description: '将开放表格式中的数据加载到 ClickHouse MergeTree 表中，以显著加快分析查询。'
keywords: ['数据湖', 'lakehouse', 'MergeTree', '加速', '分析', '倒排索引', '全文索引', 'INSERT INTO SELECT']
doc_type: 'guide'
---

在[上一节](/use-cases/data-lake/getting-started/connecting-catalogs)中，您已将 ClickHouse 连接到数据目录，并直接查询了开放表格式。虽然原位查询数据很方便，但开放表格式并未针对支撑仪表板和运营报表的低延迟、高并发工作负载进行优化。对于这些用例，将数据加载到 ClickHouse 的 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 引擎中可以显著提升性能。

与直接读取开放表格式相比，MergeTree 具有以下优势：

* **[稀疏主索引](/guides/best-practices/sparse-primary-indexes)** - 按所选键对磁盘上的数据进行排序，使 ClickHouse 能够在查询期间跳过大范围的不相关行。
* **增强的数据类型** - 原生支持 [JSON](/best-practices/use-json-where-appropriate)、[LowCardinality](/sql-reference/data-types/lowcardinality) 和 [Enum](/sql-reference/data-types/enum) 等类型，从而实现更紧凑的存储和更快的处理。
* **[数据跳过索引](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-data_skipping-indexes)** 和 **[全文索引](/engines/table-engines/mergetree-family/textindexes)** - 二级索引结构，使 ClickHouse 能够跳过与查询过滤谓词不匹配的数据粒度，尤其适合文本搜索工作负载。
* **支持自动压实的快速插入** - ClickHouse 专为高吞吐量插入而设计，并会在后台自动合并数据分区片段，这类似于开放表格式中的压实。
* **针对并发读取进行了优化** - MergeTree 的列式存储布局结合[多层缓存](/operations/caches)，可支持高并发的实时分析工作负载——而这并不是开放表格式的设计目标。

本指南介绍如何使用 `INSERT INTO SELECT` 将目录中的数据加载到 MergeTree 表中，以实现更快的分析。

## 连接到目录 \{#connect-catalog\}

我们将沿用[上一篇指南](/use-cases/data-lake/getting-started/connecting-catalogs)中的同一个 Unity Catalog 连接，并通过 Iceberg REST 端点进行连接：

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
```


### 查看表列表 \{#list-tables\}

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘
```


### 查看模式 \{#explore-schema\}

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

该表包含约 2.83 亿行来自 ClickHouse CI 测试运行的日志，是用于探索分析性能的真实数据集。

```sql
SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```


## 对数据湖表执行查询 \{#query-lakehouse\}

让我们运行一个查询：按线程名称和实例类型筛选日志，在消息文本中搜索错误，并按 logger 对结果进行分组：

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

该查询耗时接近 **9 秒**，因为 ClickHouse 必须对对象存储中的所有 Parquet 文件执行全表扫描。虽然可以通过分区提升性能，但像 `logger_name` 这样的列基数可能过高，难以实现有效分区。我们也没有诸如 [文本索引](/engines/table-engines/mergetree-family/mergetree#text) 之类的索引来进一步缩小扫描范围。这正是 MergeTree 的优势所在。


## 将数据导入 MergeTree \{#load-data\}

### 创建优化后的表 \{#create-table\}

我们创建一个 MergeTree 表，并对表结构做一些优化。请注意，它与 Iceberg 表结构相比有几个关键差异：

* **不使用 `Nullable` 封装** - 去掉 `Nullable` 可提高存储效率和查询性能。
* **在 `level`、`instance_type`、`thread_name` 和 `check_name` 列上使用 `LowCardinality(String)`** - 对不同值较少的列进行字典编码，以获得更好的压缩率和更快的过滤速度。
* **在 `message` 列上创建 [全文索引](/engines/table-engines/mergetree-family/textindexes)** - 可加速基于 token 的文本搜索，例如 `hasToken(message, 'error')`。
* **`ORDER BY` 键** 为 `(instance_type, thread_name, toStartOfMinute(event_time))` - 使磁盘上的数据布局与常见过滤模式对齐，从而让[稀疏主索引](/guides/best-practices/sparse-primary-indexes)能够跳过无关的数据粒度。

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


### 从目录中插入数据 \{#insert-data\}

使用 `INSERT INTO SELECT` 将数据湖表中的约 3 亿行数据导入到我们的 ClickHouse 表中：

```sql
INSERT INTO single_day_log SELECT * FROM icebench.`icebench.single_day_log`

282634391 rows in set. Elapsed: 237.680 sec. Processed 282.63 million rows, 5.42 GB (1.19 million rows/s., 22.79 MB/s.)
Peak memory usage: 18.62 GiB.
```

## 重新执行查询 \{#reexecute-query\}

如果我们现在对 MergeTree 表执行相同的查询，就会看到性能大幅提升：

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

现在，相同的查询只需 **0.22 秒** 即可完成——**提速约 40 倍**。这一改进主要来自两个关键优化：

* **稀疏主索引** - `ORDER BY (instance_type, thread_name, ...)` 键意味着 ClickHouse 可以直接跳到与 `instance_type = 'm6i.4xlarge'` 和 `thread_name = 'TCPHandler'` 匹配的粒度块，将需要处理的行数从 2.83 亿减少到仅 1400 万。
* **全文索引** - `message` 列上的 `text_idx` 索引使 `hasToken(message, 'error')` 可以通过索引完成，而不必扫描每条消息字符串，从而进一步减少 ClickHouse 需要读取的数据量。

最终，这样的查询可以轻松支撑实时仪表板——其规模和延迟表现是查询对象存储中的 Parquet 文件无法比拟的。
