---
description: '提供对存储在 Amazon S3、Azure、HDFS 或本地的 Apache Iceberg 表的只读的类表接口。'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---

# iceberg 表函数 \{#iceberg-table-function\}

为存储在 Amazon S3、Azure、HDFS 或本地的 Apache [Iceberg](https://iceberg.apache.org/) 表提供类似表的只读接口。

## 语法 \{#syntax\}

```sql
icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method] [,extra_credentials])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```


## 参数 \{#arguments\}

参数说明分别与表函数 `s3`、`azureBlobStorage`、`HDFS` 和 `file` 的参数说明相同。
`format` 表示 Iceberg 表中数据文件的格式。

对于 `icebergS3`，可使用可选的 `extra_credentials` 参数传递 `role_arn`，以便在 ClickHouse Cloud 中进行基于角色的访问。有关配置步骤，请参见 [Secure S3](/cloud/data-sources/secure-s3)。

### 返回值 \{#returned-value\}

用于从指定的 Iceberg 表中读取数据、具有指定结构的表。

### 示例 \{#example\}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse 目前支持通过 `icebergS3`、`icebergAzure`、`icebergHDFS` 和 `icebergLocal` 表函数以及 `IcebergS3`、`icebergAzure`、`IcebergHDFS` 和 `IcebergLocal` 表引擎读取 Iceberg 格式的 v1 和 v2 版本。
:::

## 定义命名集合 \{#defining-a-named-collection\}

以下是一个命名集合的配置示例，用于存储 URL 和凭据：

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM icebergS3(iceberg_conf, filename = 'test_table')
DESCRIBE icebergS3(iceberg_conf, filename = 'test_table')
```


## 使用数据目录 \{#iceberg-writes-catalogs\}

Iceberg 表也可以与多种数据目录配合使用，例如 [REST Catalog](https://iceberg.apache.org/rest-catalog-spec/)、[AWS Glue Data Catalog](https://docs.aws.amazon.com/prescriptive-guidance/latest/serverless-etl-aws-glue/aws-glue-data-catalog.html) 和 [Unity Catalog](https://www.unitycatalog.io/)。

:::important
在使用目录时，大多数用户更适合使用 `DataLakeCatalog` 数据库引擎。该引擎将 ClickHouse 连接到你的目录，以发现其中的表。你可以使用这个数据库引擎，而无需使用 `IcebergS3` 表引擎手动逐个创建表。
:::

要配合目录使用 Iceberg 表，请先创建一个使用 `IcebergS3` 引擎的表，并提供必要的设置。

例如，将 REST Catalog 与 MinIO 存储一起使用时：

```sql
CREATE TABLE `database_name.table_name`
ENGINE = IcebergS3(
  'http://minio:9000/warehouse-rest/table_name/',
  'minio_access_key',
  'minio_secret_key'
)
```

或者，将 AWS Glue Data Catalog 与 S3 结合使用：

```sql
CREATE TABLE `my_database.my_table`  
ENGINE = IcebergS3(
  's3://my-data-bucket/warehouse/my_database/my_table/',
  'aws_access_key',
  'aws_secret_key'
)
```


## 模式演进 \{#schema-evolution\}

目前，借助 CH，你可以读取其模式随时间发生变化的 Iceberg 表。我们目前支持读取那些列被添加或删除、并且列顺序发生变化的表。你也可以将某个原本不允许为 NULL 的列更改为允许为 NULL 的列。此外，我们支持对简单类型进行类型转换，具体包括： 

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) 其中 P' > P。

目前尚不支持修改嵌套结构，或变更数组和 map 中元素的类型。

## 分区裁剪 \{#partition-pruning\}

ClickHouse 在对 Iceberg 表执行 SELECT 查询时支持分区裁剪，通过跳过无关的数据文件来优化查询性能。要启用分区裁剪，请将 `use_iceberg_partition_pruning` 设置为 `1`。有关 Iceberg 分区裁剪的更多信息，请参阅 https://iceberg.apache.org/spec/#partitioning。

## 时间旅行 \{#time-travel\}

ClickHouse 支持 Iceberg 表的时间旅行功能，允许你基于特定的时间戳或快照 ID 查询历史数据。

## 处理包含已删除行的表 \{#deleted-rows\}

目前，仅支持带有[位置删除（position deletes）](https://iceberg.apache.org/spec/#position-delete-files)的 Iceberg 表。

以下删除方式**不受支持**：

- [等值删除（equality deletes）](https://iceberg.apache.org/spec/#equality-delete-files)
- [删除向量（deletion vectors）](https://iceberg.apache.org/spec/#deletion-vectors)（在 v3 中引入）

### 基本用法 \{#basic-usage\}

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

注意：在同一个查询中无法同时指定 `iceberg_timestamp_ms` 和 `iceberg_snapshot_id` 参数。

### 重要注意事项 \{#important-considerations\}

* 通常在以下情况下会创建 **snapshot（快照）**：
* 有新数据写入到表中
* 执行了某种数据压缩（compaction）操作

* **模式变更通常不会创建 snapshot（快照）** —— 这在对经历过模式演进的表使用 time travel（时间回溯）时会产生一些重要的行为差异。

### 示例场景 \{#example-scenarios\}

所有场景都使用 Spark 编写，因为 ClickHouse（CH）目前尚不支持向 Iceberg 表写入。

#### 场景 1：在没有新快照的情况下进行架构变更 \{#scenario-1\}

请考虑以下操作顺序：

```sql
 -- Create a table with two columns
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

- - Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // A piece of pseudo code

- - Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

- - Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

- - Query the table at each timestamp
  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts1;

+------------+------------+
|order_number|product_code|
+------------+------------+
|           1|        Mars|
+------------+------------+
  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts2;

+------------+------------+
|order_number|product_code|
+------------+------------+
|           1|        Mars|
+------------+------------+

  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts3;

+------------+------------+-----+
|order_number|product_code|price|
+------------+------------+-----+
|           1|        Mars| NULL|
|           2|       Venus|100.0|
+------------+------------+-----+
```

在不同时间点的查询结果：

* 在 ts1 和 ts2：只显示原始的两列
* 在 ts3：显示全部三列，第一行的 price 为 NULL

#### 场景 2：历史 Schema 与当前 Schema 的差异 \{#scenario-2\}

在当前时刻执行的时间回溯查询，可能会显示与当前表不同的 Schema：

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Insert initial data into the table
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Query the table at a current moment but using timestamp syntax

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Query the table at a current moment
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

这是因为 `ALTER TABLE` 不会创建新的快照；但对于当前表，Spark 会从最新的元数据文件中读取 `schema_id`，而不是从某个快照中获取。


#### 场景 3：历史模式与当前模式的差异 \{#scenario-3\}

第二种情况是，在执行时间穿梭（time travel）时，你无法获取该表在写入任何数据之前的状态：

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Query the table at a specific timestamp
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Finises with error: Cannot find a snapshot older than ts.
```

在 ClickHouse 中，其行为与 Spark 一致。你可以把 Spark 的 Select 查询在概念上替换为 ClickHouse 的 Select 查询，二者的工作方式是完全相同的。


## 元数据文件解析 \{#metadata-file-resolution\}

在 ClickHouse 中使用 `iceberg` 表函数时，系统需要定位描述 Iceberg 表结构的正确 metadata.json 文件。以下是该解析过程的具体工作方式：

### 候选文件搜索（按优先级顺序） \{#candidate-search\}

1. **直接指定路径**：
*如果你设置了 `iceberg_metadata_file_path`，系统会将其与 Iceberg 表目录路径拼接，并使用这个精确路径。

* 当提供此设置时，其他所有解析相关的设置都会被忽略。

2. **按表 UUID 匹配**：
*如果指定了 `iceberg_metadata_table_uuid`，系统将：
    *只检查 `metadata` 目录中的 `.metadata.json` 文件
    *仅保留其中 `table-uuid` 字段与所指定 UUID 匹配的文件（不区分大小写）

3. **默认搜索**：
*如果未提供上述任一设置，则 `metadata` 目录中的所有 `.metadata.json` 文件都将作为候选文件

### 选择最新的文件 \{#most-recent-file\}

在使用上述规则识别候选文件后，系统会确定其中最新的一个：

* 如果启用了 `iceberg_recent_metadata_file_by_last_updated_ms_field`：
* 选择 `last-updated-ms` 值最大的文件
* 否则：
* 选择版本号最高的文件
* （版本号在文件名中以 `V` 的形式出现，文件名格式为 `V.metadata.json` 或 `V-uuid.metadata.json`）

**注意**：上述所有提到的设置都是表函数的设置（而非全局或查询级设置），必须按如下方式进行指定：

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**注意**：尽管 Iceberg Catalog 通常负责元数据解析工作，但 ClickHouse 中的 `iceberg` 表函数会直接将存储在 S3 中的文件解释为 Iceberg 表，因此理解这些解析规则尤为重要。

## 元数据缓存 \{#metadata-cache\}

`Iceberg` 表引擎和表函数支持元数据缓存，用于存储 manifest 文件、manifest 列表以及元数据 JSON 的信息。该缓存存储在内存中。此功能由 `use_iceberg_metadata_files_cache` 设置项控制，默认启用。

## 别名 \{#aliases\}

`iceberg` 表函数现在是 `icebergS3` 的别名。

## 虚拟列 \{#virtual-columns\}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果文件大小未知，该值为 `NULL`。
- `_time` — 文件最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，该值为 `NULL`。
- `_etag` — 文件的 ETag。类型：`LowCardinality(String)`。如果 ETag 未知，该值为 `NULL`。

## 向 Iceberg 表写入 \{#writes-into-iceberg-table\}

自 25.7 版本起，ClickHouse 支持修改用户拥有的 Iceberg 表。

目前这是一个实验性功能，因此需要先将其手动启用：

```sql
SET allow_insert_into_iceberg = 1;
```


### 创建表 \{#create-iceberg-table\}

要创建自己的空 Iceberg 表，请使用与读取相同的命令，但需要显式指定模式（schema）。
写入支持 Iceberg 规范中定义的所有数据格式，例如 Parquet、Avro、ORC。

### 示例 \{#example-iceberg-writes-create\}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

注意：要创建版本提示文件，请启用 `iceberg_use_version_hint` 设置。
如果要压缩 metadata.json 文件，请在 `iceberg_metadata_compression_method` 设置中指定编解码器名称。

### INSERT \{#writes-inserts\}

创建新表后，可以使用常规的 ClickHouse 语法来插入数据。

### 示例 \{#example-iceberg-writes-insert\}

```sql
INSERT INTO iceberg_writes_example VALUES ('Pavel', 777), ('Ivanov', 993);

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Pavel
y: 777

Row 2:
──────
x: Ivanov
y: 993
```

### DELETE \{#iceberg-writes-delete\}

在 merge-on-read 格式中删除多余行在 ClickHouse 中同样受支持。
此查询会创建一个包含 position delete 文件的新快照。

注意：如果希望将来使用其他 Iceberg 引擎（例如 Spark）读取这些表，则需要禁用 `output_format_parquet_use_custom_encoder` 和 `output_format_parquet_parallel_encoding` 这两个设置项。
这是因为 Spark 是通过 Parquet 字段 ID 来读取这些文件，而当这些开关启用时，ClickHouse 目前尚不支持写入字段 ID。
我们计划在未来修复此行为。

### 示例 \{#example-iceberg-writes-delete\}

```sql
ALTER TABLE iceberg_writes_example DELETE WHERE x != 'Ivanov';

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```

### 模式演进 \{#iceberg-writes-schema-evolution\}

ClickHouse 允许对具有简单类型（非 tuple、非 array、非 map）的列执行添加、删除、修改或重命名操作。

### 示例 \{#example-iceberg-writes-evolution\}

```sql
ALTER TABLE iceberg_writes_example MODIFY COLUMN y Nullable(Int64);
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

ALTER TABLE iceberg_writes_example ADD COLUMN z Nullable(Int32);
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64),                                 ↴│
   │↳    `z` Nullable(Int32)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
z: ᴺᵁᴸᴸ

ALTER TABLE iceberg_writes_example DROP COLUMN z;
SHOW CREATE TABLE iceberg_writes_example;
   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993

ALTER TABLE iceberg_writes_example RENAME COLUMN y TO value;
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `value` Nullable(Int64)                              ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
value: 993
```


### 合并整理（Compaction） \{#iceberg-writes-compaction\}

ClickHouse 支持对 Iceberg 表进行合并整理（compaction）。当前，它可以在更新元数据的同时，将 position delete 文件合并到数据文件中。先前的快照 ID 和时间戳保持不变，因此仍然可以使用相同的值进行时间旅行（time travel）。

使用方法如下：

```sql
SET allow_experimental_iceberg_compaction = 1

OPTIMIZE TABLE iceberg_writes_example;

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```


### 清理过期快照 \{#iceberg-expire-snapshots\}

Iceberg 表会在每次 INSERT、DELETE 或 UPDATE 操作后累积快照。随着时间推移，这可能会产生大量快照及其关联的数据 File。`expire_snapshots` 命令会移除旧快照，并清理不再被任何保留快照引用的数据 File。

**语法：**

```sql
ALTER TABLE iceberg_table EXECUTE expire_snapshots(
    ['timestamp']
    [, expire_before = 'timestamp']
    [, retention_period = '3d']
    [, retain_last = 100]
    [, snapshot_ids = [1, 2, 3, 4]]
    [, dry_run = 1]
);
```

默认情况下，要保留哪些快照由[保留策略](#iceberg-snapshot-retention-policy)决定 (表属性 `min-snapshots-to-keep`、`max-snapshot-age-ms` 以及针对各 ref 的覆盖设置) 。指定 `snapshot_ids` 时，将绕过保留策略，只会考虑列出的快照是否过期。

**参数：**

* `'timestamp'` (位置参数) 或 `expire_before = 'timestamp'` — 日期时间字符串 (例如 `'2024-06-01 00:00:00'`) ，按**服务器时区**解释。它可作为一道安全保险：`timestamp-ms` 等于或晚于该值的快照会受到保护，不会过期，即使按保留策略原本应过期也不例外。可与 `snapshot_ids` 结合使用；在这种情况下，列表中时间戳等于或晚于该值的快照不会过期。
* `retention_period = '<duration>'` — 仅对本次调用覆盖表级 `history.expire.max-snapshot-age-ms`。早于该时长的快照 (从当前时刻起计算) 会成为过期候选。该值为时长字符串，由一个或多个连续拼接的 `{number}{unit}` 对组成。支持的单位：`y` (365 天) 、`w` (7 天) 、`d` (24 小时) 、`h` (60 分钟) 、`m` (60 秒) 、`s` (1 秒) 、`ms` (1 毫秒) 。单位可组合使用，例如 `'3d'`、`'12h'`、`'1d12h30m'`、`'500ms'`。
* `retain_last = N` — 仅对本次调用覆盖表级 `history.expire.min-snapshots-to-keep`。无论快照有多旧，始终至少保留 `N` 个快照。
* `snapshot_ids = [id1, id2, ...]` — 仅使列出的快照 ID 过期 (当前快照、分支或标签引用的快照除外) 。此模式会完全绕过保留策略，且不能与 `retention_period` 或 `retain_last` 一起使用。
* `dry_run = 1` — 计算哪些内容会过期，并返回指标，但不写入新元数据，也不删除文件。

:::note
`retention_period` 和 `retain_last` 仅覆盖**表级**保留默认值。在 Iceberg 表属性中配置的各 ref (分支/标签) 保留覆盖设置 (例如 `refs.<branch>.min-snapshots-to-keep`) 永远不会被覆盖——它们始终按表元数据中的定义生效。
:::

**示例：**

```sql
SET allow_insert_into_iceberg = 1;

-- Create some snapshots by inserting data
INSERT INTO iceberg_table VALUES (1);
INSERT INTO iceberg_table VALUES (2);
INSERT INTO iceberg_table VALUES (3);

-- Expire using retention policy only
ALTER TABLE iceberg_table EXECUTE expire_snapshots();

-- Expire with a safety fuse: protect snapshots newer than the timestamp (positional syntax)
ALTER TABLE iceberg_table EXECUTE expire_snapshots('2025-01-01 00:00:00');

-- Same using the named argument form
ALTER TABLE iceberg_table EXECUTE expire_snapshots(expire_before = '2025-01-01 00:00:00');

-- Override retention parameters for one execution
ALTER TABLE iceberg_table EXECUTE expire_snapshots(retention_period = '3d', retain_last = 10);

-- Expire explicit snapshots
ALTER TABLE iceberg_table EXECUTE expire_snapshots(snapshot_ids = [101, 102, 103]);

-- Dry-run preview (no metadata updates, no file deletes)
ALTER TABLE iceberg_table EXECUTE expire_snapshots(retention_period = '1d', dry_run = 1);
```

**输出：**

该命令会返回一个包含两列 (`metric_name String`、`metric_value Int64`) 的表，其中每个指标对应一行。指标名称遵循 [Iceberg 规范](https://iceberg.apache.org/docs/latest/spark-procedures/#output)：


| metric&#95;name                       | 描述                           |
| ------------------------------------- | ---------------------------- |
| `deleted_data_files_count`            | 已删除的数据文件数量                   |
| `deleted_position_delete_files_count` | 已删除的位置删除文件数量                 |
| `deleted_equality_delete_files_count` | 已删除的等值删除文件数量                 |
| `deleted_manifest_files_count`        | 已删除的 manifest 文件数量           |
| `deleted_manifest_lists_count`        | 已删除的 manifest 列表文件数量         |
| `deleted_statistics_files_count`      | 已删除的统计信息文件数量 (当前始终为 0)       |
| `dry_run`                             | `1` 表示 dry-run 模式，`0` 表示正常执行 |

该命令执行以下步骤：

1. 评估保留策略 (见下文) ，以确定哪些快照必须保留
2. 如果提供了时间戳参数，还会额外保护该时间戳及之后的所有快照
3. 使既未被策略保留、也未被时间戳保险丝保护的快照过期
4. 计算哪些文件仅与已过期的快照相关联
5. 在正常模式下：生成不包含已过期快照的新元数据
6. 在正常模式下：物理删除不可达的 manifest 列表、manifest 文件和数据文件
7. 在 `dry_run = 1` 模式下：跳过步骤 5 和 6，并且仅返回计算得到的指标

#### 快照保留策略 \{#iceberg-snapshot-retention-policy\}

`expire_snapshots` 命令遵循 [Iceberg 快照保留策略](https://iceberg.apache.org/spec/#snapshot-retention-policy)。保留规则通过 Iceberg 表属性以及按引用的覆盖配置进行设置：

| 属性                                     | 范围 | 默认值                                                                 | 说明                              |
| -------------------------------------- | -- | ------------------------------------------------------------------- | ------------------------------- |
| `history.expire.min-snapshots-to-keep` | 表  | `iceberg_expire_default_min_snapshots_to_keep` (默认值 `1`)            | 每个分支祖先链中要保留的最少快照数               |
| `history.expire.max-snapshot-age-ms`   | 表  | `iceberg_expire_default_max_snapshot_age_ms` (默认值 `432000000`, 5 天) | 分支中快照可保留的最大时长 (毫秒)              |
| `history.expire.max-ref-age-ms`        | 表  | `iceberg_expire_default_max_ref_age_ms` (默认值 `∞`)                   | 快照引用 (分支或标签) 在被移除前可存在的最大时长 (毫秒) |

每个快照引用 (Iceberg 元数据中的 `refs`) 都可以通过以下按引用字段覆盖这些设置：`min-snapshots-to-keep`、`max-snapshot-age-ms` 和 `max-ref-age-ms`。

**保留规则评估：**

* **对于每个分支** (包括 `main`) ：从分支头开始遍历其祖先链。只要满足以下任一条件，就会保留该快照：
  * 该快照属于链中前 `min-snapshots-to-keep` 个快照之一
  * 该快照的年龄未超过 `max-snapshot-age-ms` (即 `now - timestamp-ms <= max-snapshot-age-ms`)
* **对于标签**：带标签的快照会被保留；如果标签已超过其 `max-ref-age-ms`，则会移除该标签引用
* **非 main 引用** 如果其年龄超过 `max-ref-age-ms`，则会被完全移除 (`main` 分支永远不会被移除)
* 指向不存在快照的 **悬空引用** 会在发出警告后被移除
* **当前快照始终会被保留**，无论保留设置如何

**所需权限：**

需要 `ALTER TABLE EXECUTE` 权限，它在 ClickHouse 访问控制层级中是 `ALTER TABLE` 的子权限。你可以单独授予该权限，也可以通过其父权限授予：

```sql
-- Grant only EXECUTE permission
GRANT ALTER TABLE EXECUTE ON my_iceberg_table TO my_user;

-- Or grant all ALTER TABLE permissions (includes ALTER TABLE EXECUTE)
GRANT ALTER TABLE ON my_iceberg_table TO my_user;
```

:::note

* 仅支持 Iceberg 格式版本 2 的表 (v1 快照不保证提供 `manifest-list`，而安全识别待清理文件需要它)
* 当前快照始终会被保留，即使其早于指定时间戳
* 要求启用 `allow_insert_into_iceberg` 设置
* 要求启用 `allow_experimental_expire_snapshots` 设置
* 当 ClickHouse 更新元数据时，catalog 自身的授权机制 (REST catalog auth、AWS Glue IAM 等) 仍会独立生效
  :::


## 另请参阅 \{#see-also\}

* [Iceberg 引擎](/engines/table-engines/integrations/iceberg.md)
* [Iceberg 集群表函数](/sql-reference/table-functions/icebergCluster.md)