---
description: '此引擎提供与现有 Apache Iceberg 表的只读集成，这些表存储在 Amazon S3、Azure、HDFS 或本地。'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Iceberg 表引擎'
doc_type: 'reference'
---



# Iceberg 表引擎 {#iceberg-table-engine}

:::warning 
我们建议在 ClickHouse 中处理 Iceberg 数据时使用 [Iceberg 表函数](/sql-reference/table-functions/iceberg.md)。Iceberg 表函数目前提供了足够的功能，并为 Iceberg 表提供部分只读接口。

Iceberg 表引擎是可用的，但可能存在一些限制。ClickHouse 最初并非为支持其模式会在外部发生变化的表而设计，这可能会影响 Iceberg 表引擎的功能。因此，一些对常规表可用的特性在这里可能不可用，或者可能无法正确工作，尤其是在使用旧版分析器时。

为了获得最佳兼容性，在我们持续改进对 Iceberg 表引擎的支持期间，建议优先使用 Iceberg 表函数。
:::

该引擎提供与现有 Apache [Iceberg](https://iceberg.apache.org/) 表的只读集成，支持位于 Amazon S3、Azure、HDFS 以及本地存储的表。



## 创建表 {#create-table}

请注意，Iceberg 表必须已经存在于存储中，此命令不接受用于创建新表的 DDL 参数。

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

参数说明与引擎 `S3`、`AzureBlobStorage`、`HDFS` 和 `File` 中参数的说明相同。\
`format` 表示 Iceberg 表中数据文件的格式。

可以使用 [Named Collections](../../../operations/named-collections.md) 来指定引擎参数。

### 示例 {#example}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

使用命名集合：

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

表引擎 `Iceberg` 现在是 `IcebergS3` 的别名。



## 模式演进 {#schema-evolution}
目前，借助 ClickHouse (CH)，可以读取随着时间推移发生模式变更的 Iceberg 表。当前支持读取曾经增加或删除列、以及列顺序发生变化的表。也可以将原本要求非空的列修改为允许为 NULL 的列。此外，还支持对简单类型进行允许的类型转换，即：  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S)，其中 P' > P。 

目前尚不支持更改嵌套结构，或数组和 map 中元素的类型。

要读取一个在创建之后模式发生变更、并使用动态模式推断的表，请在创建该表时将 allow_dynamic_metadata_for_data_lakes 设置为 true。



## 分区裁剪 {#partition-pruning}

ClickHouse 在对 Iceberg 表执行 SELECT 查询时支持分区裁剪，通过跳过无关的数据文件来优化查询性能。要启用分区裁剪，请设置 `use_iceberg_partition_pruning = 1`。有关 Iceberg 分区裁剪的更多信息，请参阅 https://iceberg.apache.org/spec/#partitioning 上的文档。



## 时间旅行 {#time-travel}

ClickHouse 支持 Iceberg 表的时间旅行功能，允许您在指定的时间戳或快照 ID 下查询历史数据。



## 处理包含已删除行的表 {#deleted-rows}

目前，仅支持带有 [position deletes](https://iceberg.apache.org/spec/#position-delete-files) 的 Iceberg 表。

以下删除方式**不受支持**：

* [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)（等值删除）
* [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors)（在 v3 中引入的删除向量）

### 基本用法 {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意：你不能在同一个查询中同时指定 `iceberg_timestamp_ms` 和 `iceberg_snapshot_id` 参数。

### 重要注意事项 {#important-considerations}

* **快照** 通常在以下情况下创建：
  * 向表写入新数据时
  * 执行某种数据压缩（compaction）操作时

* **模式变更通常不会创建快照** —— 这会在对经过模式演进的表使用 time travel（时间穿梭查询）时产生一些需要注意的重要行为。

### 示例场景 {#example-scenarios}

所有场景都使用 Spark 编写，因为 ClickHouse（CH）目前尚不支持向 Iceberg 表写入数据。

#### 场景 1：仅发生模式变更但没有新的快照 {#scenario-1}

考虑以下一系列操作：

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

-- 修改表，添加一个新列
 ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)

 ts2 = now()

-- 向表中插入数据
 INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

  ts3 = now()

-- 在各个时间点查询该表
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

* 在 ts1 和 ts2：只显示原来的两列
* 在 ts3：显示全部三列，且第一行的 price 为 NULL

#### 场景 2：历史表结构与当前表结构的差异 {#scenario-2}

在当前时刻执行的时间旅行查询，可能会显示与当前表不同的表结构：

```sql
-- 创建一个表
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- 向表中插入初始数据
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- 修改表，添加一个新列
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- 使用时间戳语法在当前时间点查询该表

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- 在当前时间点查询该表
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

这是因为 `ALTER TABLE` 不会创建新的快照；对于当前表，Spark 会从最新的元数据文件中读取 `schema_id` 的值，而不是从快照中读取。


#### 场景 3：历史与当前表结构差异 {#scenario-3}

第二点是在进行时间旅行时，你无法获取表在尚未写入任何数据之前的状态：

```sql
-- 创建表
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- 在指定时间戳查询该表
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- 将报错：找不到早于 ts 的快照。
```

在 ClickHouse 中，其行为与 Spark 保持一致。你可以在概念上将 Spark 的 Select 查询替换为 ClickHouse 的 Select 查询，它们的工作方式是相同的。


## 元数据文件解析 {#metadata-file-resolution}

在 ClickHouse 中使用 `Iceberg` 表引擎时，系统需要定位描述 Iceberg 表结构的正确 metadata.json 文件。下面是该解析过程的具体流程：

### 候选文件搜索 {#candidate-search}

1. **直接路径指定**：

* 如果设置了 `iceberg_metadata_file_path`，系统会将该路径与 Iceberg 表目录路径组合使用，得到精确的文件路径。
* 当提供该设置时，所有其他解析相关设置都会被忽略。

2. **表 UUID 匹配**：

* 如果指定了 `iceberg_metadata_table_uuid`，系统将：
  * 只检查 `metadata` 目录中的 `.metadata.json` 文件
  * 过滤出其中 `table-uuid` 字段与所指定 UUID 匹配的文件（不区分大小写）

3. **默认搜索**：

* 如果上述设置都未提供，则 `metadata` 目录中的所有 `.metadata.json` 文件都将作为候选。

### 选择最新的文件 {#most-recent-file}

根据上述规则确定候选文件后，系统会判断其中哪个是最新的文件：

* 如果启用了 `iceberg_recent_metadata_file_by_last_updated_ms_field`：
  * 会选择 `last-updated-ms` 值最大的文件

* 否则：
  * 会选择版本号最高的文件
  * （版本号在文件名中以 `V` 的形式出现，文件名格式如 `V.metadata.json` 或 `V-uuid.metadata.json`）

**注意**：上述所有设置都是引擎级别设置，必须在创建表时进行指定，如下所示：

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**注意**：虽然 Iceberg Catalog 通常负责元数据解析，但 ClickHouse 中的 `Iceberg` 表引擎会直接将存储在 S3 中的文件解析为 Iceberg 表，这也是为什么理解这些解析规则很重要。


## 数据缓存 {#data-cache}

`Iceberg` 表引擎和表函数支持与 `S3`、`AzureBlobStorage`、`HDFS` 存储类似的数据缓存功能。请参阅[此处](../../../engines/table-engines/integrations/s3.md#data-cache)。



## 元数据缓存 {#metadata-cache}

`Iceberg` 表引擎和表函数支持元数据缓存，用于存储清单文件、清单列表以及元数据 JSON 的信息。该缓存存储在内存中。此功能通过设置 `use_iceberg_metadata_files_cache` 进行控制，默认启用。



## 另请参阅 {#see-also}

- [iceberg 表函数](/sql-reference/table-functions/iceberg.md)
