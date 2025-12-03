---
description: '提供对存储在 Amazon S3、Azure、HDFS 或本地的 Apache Iceberg 表的只读的类表接口。'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---

# iceberg 表函数 {#iceberg-table-function}

为存储在 Amazon S3、Azure、HDFS 或本地的 Apache [Iceberg](https://iceberg.apache.org/) 表提供类似表的只读接口。

## 语法 {#syntax}

```sql
icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```


## 参数 {#arguments}

各参数的说明分别与表函数 `s3`、`azureBlobStorage`、`HDFS` 和 `file` 中对应参数的说明一致。
`format` 表示 Iceberg 表中数据文件的格式。

### 返回值 {#returned-value}

用于从指定的 Iceberg 表中读取数据、具有指定结构的表。

### 示例 {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse 目前支持通过 `icebergS3`、`icebergAzure`、`icebergHDFS` 和 `icebergLocal` 表函数以及 `IcebergS3`、`icebergAzure`、`IcebergHDFS` 和 `IcebergLocal` 表引擎读取 Iceberg 格式的 v1 和 v2 版本。
:::


## 定义命名集合 {#defining-a-named-collection}

下面是一个示例，演示如何配置命名集合来存储 URL 和凭证：

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


## 使用数据目录 {#iceberg-writes-catalogs}

Iceberg 表也可以与多种数据目录配合使用，例如 [REST Catalog](https://iceberg.apache.org/rest-catalog-spec/)、[AWS Glue Data Catalog](https://docs.aws.amazon.com/prescriptive-guidance/latest/serverless-etl-aws-glue/aws-glue-data-catalog.html) 和 [Unity Catalog](https://www.unitycatalog.io/)。

:::important
在使用目录时，大多数用户会希望使用 `DataLakeCatalog` 数据库引擎，它将 ClickHouse 连接到数据目录以发现你的表。你可以使用这个数据库引擎来代替手动使用 `IcebergS3` 表引擎创建每个表。
:::

要配合这些目录使用 Iceberg 表，请创建一个使用 `IcebergS3` 引擎的表，并提供必要的设置。

例如，将 REST Catalog 与 MinIO 存储一起使用：

```sql
CREATE TABLE `database_name.table_name`
ENGINE = IcebergS3(
  'http://minio:9000/warehouse-rest/table_name/',
  'minio_access_key',
  'minio_secret_key'
)
SETTINGS 
  storage_catalog_type="rest",
  storage_warehouse="demo",
  object_storage_endpoint="http://minio:9000/warehouse-rest",
  storage_region="us-east-1",
  storage_catalog_url="http://rest:8181/v1"
```

或者，将 AWS Glue Data Catalog 与 S3 配合使用：

```sql
CREATE TABLE `my_database.my_table`  
ENGINE = IcebergS3(
  's3://my-data-bucket/warehouse/my_database/my_table/',
  'aws_access_key',
  'aws_secret_key'
)
SETTINGS 
  storage_catalog_type = 'glue',
  storage_warehouse = 'my_database',
  object_storage_endpoint = 's3://my-data-bucket/',
  storage_region = 'us-east-1',
  storage_catalog_url = 'https://glue.us-east-1.amazonaws.com/iceberg/v1'
```


## 模式演进 {#schema-evolution}

目前，借助 ClickHouse，您可以读取模式随时间发生变化的 Iceberg 表。我们当前支持读取以下情况的表：列被添加或删除，且列的顺序发生变化。您也可以将一个原本要求必须有值的列更改为允许为 NULL 的列。此外，我们支持对简单类型进行允许的类型转换，具体包括：  

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) 其中 P' > P。

目前尚不支持修改嵌套结构，或更改数组和 Map 中元素的类型。

## 分区裁剪 {#partition-pruning}

ClickHouse 在对 Iceberg 表执行 SELECT 查询时支持分区裁剪，通过跳过无关的数据文件来优化查询性能。要启用分区裁剪，请将 `use_iceberg_partition_pruning` 设置为 `1`。有关 Iceberg 分区裁剪的更多信息，请参阅 https://iceberg.apache.org/spec/#partitioning。

## 时间旅行 {#time-travel}

ClickHouse 支持 Iceberg 表的时间旅行功能，允许你基于特定的时间戳或快照 ID 查询历史数据。

## 处理包含已删除行的表 {#deleted-rows}

目前，仅支持带有[位置删除（position deletes）](https://iceberg.apache.org/spec/#position-delete-files)的 Iceberg 表。

以下删除方式**不受支持**：

- [等值删除（equality deletes）](https://iceberg.apache.org/spec/#equality-delete-files)
- [删除向量（deletion vectors）](https://iceberg.apache.org/spec/#deletion-vectors)（在 v3 中引入）

### 基本用法 {#basic-usage}

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意：在同一个查询中无法同时指定 `iceberg_timestamp_ms` 和 `iceberg_snapshot_id` 参数。


### 重要注意事项 {#important-considerations}

* **快照（Snapshot）** 通常在以下情况下创建：
* 向表中写入新数据时
* 执行某种数据压缩（compaction）操作时

* **模式更改通常不会产生快照** —— 在对经历过模式演进（schema evolution）的表使用时间回溯（time travel）时，这会导致一些重要的行为差异。

### 示例场景 {#example-scenarios}

所有场景都使用 Spark 编写，因为 ClickHouse（CH）目前尚不支持向 Iceberg 表写入。

#### 场景 1：在没有新快照的情况下进行架构变更 {#scenario-1}

请考虑以下操作顺序：

```sql
 -- 创建一个包含两列的表
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- 向表中插入数据
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // 伪代码示例

-- 修改表以添加新列
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

-- 向表中插入数据
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

-- 在每个时间戳查询表
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


#### 场景 2：历史与当前模式的差异 {#scenario-2}

在当前时刻执行的时间回溯查询，其显示的模式可能与当前表不同：

```sql
-- 创建表
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- 向表中插入初始数据
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- 修改表以添加新列
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- 使用时间戳语法查询表的当前状态

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- 查询表的当前状态
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

这是因为 `ALTER TABLE` 不会创建新的快照，而 Spark 在处理当前表时，会从最新的元数据文件中读取 `schema_id` 的值，而不是从某个快照中读取。


#### 场景 3：历史与当前模式的差异 {#scenario-3}

第二个问题是，在进行时间回溯（time travel）时，你无法获取在尚未向表写入任何数据之前的表状态：

```sql
-- 创建表
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- 在特定时间戳查询表
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- 以错误结束:找不到早于 ts 的快照。
```

在 ClickHouse 中，其行为与 Spark 一致。你可以直接将 Spark 的 Select 查询类比为 ClickHouse 的 Select 查询，它们的工作方式是相同的。


## 元数据文件解析 {#metadata-file-resolution}

在 ClickHouse 中使用 `iceberg` 表函数时，系统需要定位描述 Iceberg 表结构的正确 metadata.json 文件。下面说明该解析过程是如何进行的：

### 候选文件搜索（按优先级顺序） {#candidate-search}

1. **直接指定路径**：
*如果你设置了 `iceberg_metadata_file_path`，系统会将其与 Iceberg 表目录路径拼接，并使用这个精确路径。

* 当提供此设置时，其他所有解析相关的设置都会被忽略。

2. **按表 UUID 匹配**：
*如果指定了 `iceberg_metadata_table_uuid`，系统将：
    *只检查 `metadata` 目录中的 `.metadata.json` 文件
    *仅保留其中 `table-uuid` 字段与所指定 UUID 匹配的文件（不区分大小写）

3. **默认搜索**：
*如果未提供上述任一设置，则 `metadata` 目录中的所有 `.metadata.json` 文件都将作为候选文件

### 选择最新的文件 {#most-recent-file}

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


## 元数据缓存 {#metadata-cache}

`Iceberg` 表引擎和表函数支持元数据缓存，用于存储 manifest 文件、manifest 列表以及元数据 JSON 的相关信息。该缓存保存在内存中。此功能由 `use_iceberg_metadata_files_cache` 设置项控制，默认启用。

## 别名 {#aliases}

`iceberg` 表函数现在是 `icebergS3` 的别名。

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型：`LowCardinality(String)`。
- `_file` — 文件名。类型：`LowCardinality(String)`。
- `_size` — 文件大小（以字节为单位）。类型：`Nullable(UInt64)`。如果文件大小未知，该值为 `NULL`。
- `_time` — 文件最后修改时间。类型：`Nullable(DateTime)`。如果时间未知，该值为 `NULL`。
- `_etag` — 文件的 ETag。类型：`LowCardinality(String)`。如果 ETag 未知，该值为 `NULL`。

## 向 Iceberg 表写入 {#writes-into-iceberg-table}

自 25.7 版本起，ClickHouse 支持修改用户拥有的 Iceberg 表。

目前这是一个实验性功能，因此需要先将其手动启用：

```sql
SET allow_experimental_insert_into_iceberg = 1;
```


### 创建表 {#create-iceberg-table}

要创建自己的空 Iceberg 表，请使用与读取相同的命令，但需要显式指定表结构（schema）。
写入支持 Iceberg 规范中定义的所有数据格式，例如 Parquet、Avro、ORC。

### 示例 {#example-iceberg-writes-create}

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


### INSERT {#writes-inserts}

创建新表后，可使用常规的 ClickHouse 语法插入数据。

### 示例 {#example-iceberg-writes-insert}

```sql
INSERT INTO iceberg_writes_example VALUES ('Pavel', 777), ('Ivanov', 993);

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

行 1:
──────
x: Pavel
y: 777

行 2:
──────
x: Ivanov
y: 993
```


### DELETE {#iceberg-writes-delete}

ClickHouse 也支持在 merge-on-read 格式下删除多余行。
此查询将创建一个包含 position delete 文件的新快照。

注意：如果您希望将来使用其他 Iceberg 引擎（例如 Spark）读取表，则需要禁用 `output_format_parquet_use_custom_encoder` 和 `output_format_parquet_parallel_encoding` 这两个设置。
这是因为 Spark 是通过 parquet 字段 ID 来读取这些文件的，而在启用这些设置时，ClickHouse 目前尚不支持写出字段 ID。
我们计划在未来修复这一行为。

### 示例 {#example-iceberg-writes-delete}

```sql
ALTER TABLE iceberg_writes_example DELETE WHERE x != 'Ivanov';

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

行 1:
──────
x: Ivanov
y: 993
```


### 模式演进 {#iceberg-writes-schema-evolution}

ClickHouse 允许对简单类型（非 tuple、非 array、非 map）列执行添加、删除或修改操作。

### 示例 {#example-iceberg-writes-evolution}

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

行 1:
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

行 1:
──────
x: Ivanov
y: 993
```


### 压缩 {#iceberg-writes-compaction}

ClickHouse 支持对 Iceberg 表进行压缩。目前，它可以在更新元数据的同时，将 position delete 文件合并到数据文件中。先前的快照 ID 和时间戳保持不变，因此仍然可以使用相同的值进行时间旅行（time travel）。

使用方法如下：

```sql
SET allow_experimental_iceberg_compaction = 1

OPTIMIZE TABLE iceberg_writes_example;

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

行 1:
──────
x: Ivanov
y: 993
```


## 另请参阅 {#see-also}

* [Iceberg 引擎](/engines/table-engines/integrations/iceberg.md)
* [Iceberg 集群表函数](/sql-reference/table-functions/icebergCluster.md)