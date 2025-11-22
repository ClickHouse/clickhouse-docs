---
description: '为存储在 Amazon S3、Azure、HDFS 或本地的 Apache Iceberg 表提供只读表接口。'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---



# iceberg 表函数 {#iceberg-table-function}

提供对 Amazon S3、Azure、HDFS 或本地存储的 Apache [Iceberg](https://iceberg.apache.org/) 表的只读表接口。


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


## Arguments {#arguments}

参数说明与表函数 `s3`、`azureBlobStorage`、`HDFS` 和 `file` 中的参数说明相对应。
`format` 表示 Iceberg 表中数据文件的格式。

### Returned value {#returned-value}

返回一个具有指定结构的表,用于读取指定 Iceberg 表中的数据。

### Example {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse 目前支持通过 `icebergS3`、`icebergAzure`、`icebergHDFS` 和 `icebergLocal` 表函数以及 `IcebergS3`、`icebergAzure`、`IcebergHDFS` 和 `IcebergLocal` 表引擎读取 Iceberg 格式的 v1 和 v2 版本。
:::


## 定义命名集合 {#defining-a-named-collection}

以下是配置命名集合以存储 URL 和凭据的示例：

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


## 模式演进 {#schema-evolution}

目前,借助 ClickHouse,您可以读取模式随时间变化的 Iceberg 表。我们当前支持读取已添加或删除列、以及列顺序已变更的表。您还可以将必填列更改为允许 NULL 值的列。此外,我们支持简单类型之间的允许类型转换,具体包括:

- int -> long
- float -> double
- decimal(P, S) -> decimal(P', S),其中 P' > P。

目前,暂不支持更改嵌套结构或数组和 Map 中元素的类型。


## 分区裁剪 {#partition-pruning}

ClickHouse 在对 Iceberg 表执行 SELECT 查询时支持分区裁剪,通过跳过无关的数据文件来帮助优化查询性能。要启用分区裁剪,请设置 `use_iceberg_partition_pruning = 1`。有关 Iceberg 分区裁剪的更多信息,请访问 https://iceberg.apache.org/spec/#partitioning


## 时间旅行 {#time-travel}

ClickHouse 支持 Iceberg 表的时间旅行功能,允许您通过指定时间戳或快照 ID 来查询历史数据。


## 处理包含已删除行的表 {#deleted-rows}

目前仅支持具有[位置删除](https://iceberg.apache.org/spec/#position-delete-files)的 Iceberg 表。

以下删除方法**不受支持**:

- [等值删除](https://iceberg.apache.org/spec/#equality-delete-files)
- [删除向量](https://iceberg.apache.org/spec/#deletion-vectors)(在 v3 中引入)

### 基本用法 {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意:不能在同一查询中同时指定 `iceberg_timestamp_ms` 和 `iceberg_snapshot_id` 参数。

### 重要注意事项 {#important-considerations}

- **快照**通常在以下情况下创建:
- 向表中写入新数据时
- 执行某种数据压缩操作时

- **模式更改通常不会创建快照** - 这会导致在对经历过模式演变的表使用时间旅行功能时出现一些重要行为。

### 示例场景 {#example-scenarios}

所有场景都使用 Spark 编写,因为 ClickHouse 尚不支持写入 Iceberg 表。

#### 场景 1:模式更改但不创建新快照 {#scenario-1}

考虑以下操作序列:

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

 ts1 = now() // 一段伪代码

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

不同时间戳的查询结果:

- 在 ts1 和 ts2 时:仅显示原始的两列
- 在 ts3 时:显示所有三列,第一行的价格为 NULL

#### 场景 2:历史模式与当前模式的差异 {#scenario-2}

在当前时刻的时间旅行查询可能显示与当前表不同的模式:

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

-- 使用时间戳语法在当前时刻查询表

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- 在当前时刻查询表
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

这是因为 `ALTER TABLE` 不会创建新快照,但对于当前表,Spark 从最新的元数据文件而非快照中获取 `schema_id` 的值。


#### 场景 3：历史模式与当前模式的差异 {#scenario-3}

第二个限制是，在执行时间旅行查询时，无法获取表在写入任何数据之前的状态：

```sql
-- 创建表
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint,
  product_code string
  )
  USING iceberg
  OPTIONS ('format-version'='2');

  ts = now();

-- 查询指定时间戳的表
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- 报错：无法找到早于 ts 的快照。
```

在 ClickHouse 中，该行为与 Spark 保持一致。您可以将 Spark 的 SELECT 查询替换为 ClickHouse 的 SELECT 查询，两者的工作方式相同。


## 元数据文件解析 {#metadata-file-resolution}

在 ClickHouse 中使用 `iceberg` 表函数时,系统需要定位描述 Iceberg 表结构的正确 metadata.json 文件。以下是解析过程的工作原理:

### 候选文件搜索(按优先级顺序) {#candidate-search}

1. **直接指定路径**:
   *如果设置了 `iceberg_metadata_file_path`,系统将把它与 Iceberg 表目录路径组合,使用该精确路径。

- 提供此设置后,所有其他解析设置将被忽略。

2. **表 UUID 匹配**:
   *如果指定了 `iceberg_metadata_table_uuid`,系统将:
   *仅查找 `metadata` 目录中的 `.metadata.json` 文件
   *筛选包含与指定 UUID 匹配的 `table-uuid` 字段的文件(不区分大小写)

3. **默认搜索**:
   *如果未提供上述任何设置,`metadata` 目录中的所有 `.metadata.json` 文件都将成为候选文件

### 选择最新文件 {#most-recent-file}

使用上述规则识别候选文件后,系统将确定最新的文件:

- 如果启用了 `iceberg_recent_metadata_file_by_last_updated_ms_field`:
- 选择 `last-updated-ms` 值最大的文件

- 否则:
- 选择版本号最高的文件
- (版本号在文件名中显示为 `V`,格式为 `V.metadata.json` 或 `V-uuid.metadata.json`)

**注意**:所有提到的设置都是表函数设置(而非全局或查询级别设置),必须按以下方式指定:

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table',
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**注意**:虽然 Iceberg Catalog 通常负责处理元数据解析,但 ClickHouse 中的 `iceberg` 表函数会直接将存储在 S3 中的文件解释为 Iceberg 表,因此理解这些解析规则非常重要。


## 元数据缓存 {#metadata-cache}

`Iceberg` 表引擎和表函数支持元数据缓存,用于存储清单文件、清单列表和元数据 JSON 的信息。缓存存储在内存中。此功能通过设置 `use_iceberg_metadata_files_cache` 控制,默认启用。


## 别名 {#aliases}

表函数 `iceberg` 现在是 `icebergS3` 的别名。


## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。类型:`LowCardinality(String)`。
- `_file` — 文件名称。类型:`LowCardinality(String)`。
- `_size` — 文件大小(以字节为单位)。类型:`Nullable(UInt64)`。如果文件大小未知,则值为 `NULL`。
- `_time` — 文件最后修改时间。类型:`Nullable(DateTime)`。如果时间未知,则值为 `NULL`。
- `_etag` — 文件的 ETag。类型:`LowCardinality(String)`。如果 ETag 未知,则值为 `NULL`。


## 写入 Iceberg 表 {#writes-into-iceberg-table}

从 25.7 版本开始,ClickHouse 支持修改用户的 Iceberg 表。

目前这是一个实验性功能,因此您需要先启用它:

```sql
SET allow_experimental_insert_into_iceberg = 1;
```

### 创建表 {#create-iceberg-table}

要创建您自己的空 Iceberg 表,请使用与读取相同的命令,但需要显式指定模式。
写入操作支持 Iceberg 规范中的所有数据格式,例如 Parquet、Avro、ORC。

### 示例 {#example-iceberg-writes-create}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

注意:要创建版本提示文件,请启用 `iceberg_use_version_hint` 设置。
如果您想压缩 metadata.json 文件,请在 `iceberg_metadata_compression_method` 设置中指定编解码器名称。

### INSERT {#writes-inserts}

创建新表后,您可以使用常规的 ClickHouse 语法插入数据。

### 示例 {#example-iceberg-writes-insert}

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

### DELETE {#iceberg-writes-delete}

ClickHouse 还支持在读时合并(merge-on-read)格式中删除多余的行。
此查询将创建一个包含位置删除文件的新快照。

注意:如果您希望将来使用其他 Iceberg 引擎(例如 Spark)读取您的表,则需要禁用 `output_format_parquet_use_custom_encoder` 和 `output_format_parquet_parallel_encoding` 设置。
这是因为 Spark 通过 Parquet field-id 读取这些文件,而 ClickHouse 在启用这些标志时目前不支持写入 field-id。
我们计划在未来修复此行为。

### 示例 {#example-iceberg-writes-delete}

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

### 模式演化 {#iceberg-writes-schema-evolution}

ClickHouse 允许您添加、删除或修改简单类型的列(非元组、非数组、非映射)。

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

Row 1:
──────
x: Ivanov
y: 993
z: ᴺᵁᴸᴸ

```


ALTER TABLE iceberg&#95;writes&#95;example DROP COLUMN z;
SHOW CREATE TABLE iceberg&#95;writes&#95;example;
┌─statement─────────────────────────────────────────────────┐

1. │ CREATE TABLE default.iceberg&#95;writes&#95;example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal(&#39;/home/scanhex12/iceberg&#95;example/&#39;) │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg&#95;writes&#95;example
FORMAT VERTICAL;

第 1 行:
──────
x: Ivanov
y: 993

````

### 压缩 {#iceberg-writes-compaction}

ClickHouse 支持对 Iceberg 表进行压缩。目前,它可以在更新元数据的同时将位置删除文件合并到数据文件中。先前的快照 ID 和时间戳保持不变,因此时间旅行功能仍可使用相同的值。

使用方法:

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
````


## 使用目录的表 {#iceberg-writes-catalogs}

上述所有写入功能同样适用于 REST 和 Glue 目录。
要使用这些功能,请使用 `IcebergS3` 引擎创建表并提供必要的设置:

```sql
CREATE TABLE `database_name.table_name`  ENGINE = IcebergS3('http://minio:9000/warehouse-rest/table_name/', 'minio_access_key', 'minio_secret_key')
SETTINGS storage_catalog_type="rest", storage_warehouse="demo", object_storage_endpoint="http://minio:9000/warehouse-rest", storage_region="us-east-1", storage_catalog_url="http://rest:8181/v1",
```


## 另请参阅 {#see-also}

- [Iceberg 引擎](/engines/table-engines/integrations/iceberg.md)
- [icebergCluster 表函数](/sql-reference/table-functions/icebergCluster.md)
