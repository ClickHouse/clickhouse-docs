---
description: '此引擎提供与现有 Apache Iceberg 表的只读集成，支持位于 Amazon S3、Azure、HDFS 以及本地存储中的表。'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Iceberg 表引擎'
doc_type: 'reference'
---



# Iceberg 表引擎 {#iceberg-table-engine}

:::warning
我们建议使用 [Iceberg 表函数](/sql-reference/table-functions/iceberg.md) 来处理 ClickHouse 中的 Iceberg 数据。Iceberg 表函数目前提供了充足的功能,为 Iceberg 表提供了部分只读接口。

Iceberg 表引擎虽然可用,但可能存在一些限制。ClickHouse 最初并非设计用于支持 schema 可被外部修改的表,这可能会影响 Iceberg 表引擎的功能。因此,一些在常规表中正常工作的功能可能无法使用或无法正常运行,尤其是在使用旧版分析器时。

为了获得最佳兼容性,我们建议使用 Iceberg 表函数,同时我们会持续改进对 Iceberg 表引擎的支持。
:::

此引擎为存储在 Amazon S3、Azure、HDFS 以及本地的现有 Apache [Iceberg](https://iceberg.apache.org/) 表提供只读集成。


## 创建表 {#create-table}

注意:Iceberg 表必须已存在于存储中,该命令不支持通过 DDL 参数创建新表。

```sql
CREATE TABLE iceberg_table_s3
    ENGINE = IcebergS3(url,  [, NOSIGN | access_key_id, secret_access_key, [session_token]], format, [,compression])

CREATE TABLE iceberg_table_azure
    ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

CREATE TABLE iceberg_table_hdfs
    ENGINE = IcebergHDFS(path_to_table, [,format] [,compression_method])

CREATE TABLE iceberg_table_local
    ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
```


## 引擎参数 {#engine-arguments}

参数说明与 `S3`、`AzureBlobStorage`、`HDFS` 和 `File` 引擎中的参数说明一致。
`format` 表示 Iceberg 表中数据文件的格式。

引擎参数可以使用[命名集合](../../../operations/named-collections.md)指定

### 示例 {#example}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

使用命名集合:

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
            <secret_access_key>test</secret_access_key>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3(iceberg_conf, filename = 'test_table')

```


## 别名 {#aliases}

表引擎 `Iceberg` 目前是 `IcebergS3` 的别名。


## 模式演进 {#schema-evolution}

目前，借助 ClickHouse，您可以读取模式随时间发生变化的 Iceberg 表。我们目前支持读取已添加或删除列、以及列顺序已更改的表。您还可以将必需值的列更改为允许 NULL 值的列。此外,我们支持对简单类型进行允许的类型转换，具体包括:

- int -> long
- float -> double
- decimal(P, S) -> decimal(P', S),其中 P' > P。

目前,无法更改嵌套结构或数组和映射中元素的类型。

要使用动态模式推断读取创建后模式已更改的表,请在创建表时设置 allow_dynamic_metadata_for_data_lakes = true。


## 分区裁剪 {#partition-pruning}

ClickHouse 在对 Iceberg 表执行 SELECT 查询时支持分区裁剪,通过跳过无关的数据文件来优化查询性能。要启用分区裁剪,请设置 `use_iceberg_partition_pruning = 1`。有关 Iceberg 分区裁剪的更多信息,请访问 https://iceberg.apache.org/spec/#partitioning


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
  - 向表中写入新数据
  - 执行某种数据压缩操作

- **模式更改通常不会创建快照** - 这会导致在对经历过模式演变的表使用时间旅行功能时出现一些重要行为。

### 示例场景 {#example-scenarios}

所有场景都使用 Spark 编写,因为 ClickHouse 尚不支持写入 Iceberg 表。

#### 场景 1:模式更改但不创建新快照 {#scenario-1}

考虑以下操作序列:

```sql
-- 创建一个包含两列的表
 CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
 order_number int,
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

- 在 ts1 和 ts2:仅显示原始的两列
- 在 ts3:显示所有三列,第一行的价格为 NULL

#### 场景 2:历史模式与当前模式的差异 {#scenario-2}

在当前时刻的时间旅行查询可能显示与当前表不同的模式:

```sql
-- 创建表
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int,
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

出现这种情况是因为 `ALTER TABLE` 不会创建新快照,但对于当前表,Spark 从最新的元数据文件而非快照中获取 `schema_id` 的值。


#### 场景 3：历史模式与当前模式的差异 {#scenario-3}

第二种情况是，在执行时间旅行查询时，无法获取表在写入任何数据之前的状态：

```sql
-- 创建表
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int,
  product_code string
  )
  USING iceberg
  OPTIONS ('format-version'='2');

  ts = now();

-- 查询指定时间戳的表
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- 报错结束：无法找到早于 ts 的快照。
```

在 ClickHouse 中，其行为与 Spark 一致。您可以直接将 Spark 的 SELECT 查询替换为 ClickHouse 的 SELECT 查询，两者的工作方式相同。


## 元数据文件解析 {#metadata-file-resolution}

在 ClickHouse 中使用 `Iceberg` 表引擎时,系统需要定位描述 Iceberg 表结构的正确 metadata.json 文件。解析过程的工作原理如下:

### 候选文件搜索 {#candidate-search}

1. **直接指定路径**:

- 如果设置了 `iceberg_metadata_file_path`,系统会将其与 Iceberg 表目录路径组合,使用该精确路径。
- 提供此设置后,所有其他解析设置都将被忽略。

2. **表 UUID 匹配**:

- 如果指定了 `iceberg_metadata_table_uuid`,系统将:
  - 仅查找 `metadata` 目录中的 `.metadata.json` 文件
  - 筛选包含与指定 UUID 匹配的 `table-uuid` 字段的文件(不区分大小写)

3. **默认搜索**:

- 如果未提供上述任何设置,`metadata` 目录中的所有 `.metadata.json` 文件都将成为候选文件

### 选择最新文件 {#most-recent-file}

使用上述规则识别候选文件后,系统会确定哪个文件是最新的:

- 如果启用了 `iceberg_recent_metadata_file_by_last_updated_ms_field`:
  - 选择 `last-updated-ms` 值最大的文件

- 否则:
  - 选择版本号最高的文件
  - (版本号在文件名中显示为 `V`,格式为 `V.metadata.json` 或 `V-uuid.metadata.json`)

**注意**: 所有提到的设置都是引擎级设置,必须在创建表时指定,如下所示:

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**注意**: 虽然 Iceberg Catalog 通常负责处理元数据解析,但 ClickHouse 中的 `Iceberg` 表引擎会直接将存储在 S3 中的文件解释为 Iceberg 表,因此理解这些解析规则非常重要。


## 数据缓存 {#data-cache}

`Iceberg` 表引擎和表函数支持数据缓存,与 `S3`、`AzureBlobStorage`、`HDFS` 存储的缓存功能相同。详见[此处](../../../engines/table-engines/integrations/s3.md#data-cache)。


## 元数据缓存 {#metadata-cache}

`Iceberg` 表引擎和表函数支持元数据缓存,用于存储清单文件、清单列表和元数据 JSON 的信息。缓存存储在内存中。此功能通过设置 `use_iceberg_metadata_files_cache` 控制,默认启用。


## 另请参阅 {#see-also}

- [iceberg 表函数](/sql-reference/table-functions/iceberg.md)
