---
'description': '提供对存储在Amazon S3、Azure、HDFS或本地的Apache Iceberg表的只读类似表的接口。'
'sidebar_label': 'iceberg'
'sidebar_position': 90
'slug': '/sql-reference/table-functions/iceberg'
'title': 'iceberg'
---




# iceberg 表函数 {#iceberg-table-function}

提供对存储在 Amazon S3、Azure、HDFS 或本地的 Apache [Iceberg](https://iceberg.apache.org/) 表的只读表状界面。

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

参数的描述与表函数 `s3`、`azureBlobStorage`、`HDFS` 和 `file` 中参数的描述相一致。
`format` 代表 Iceberg 表中数据文件的格式。

### 返回值 {#returned-value}

一个具有指定结构的表，用于读取指定 Iceberg 表中的数据。

### 示例 {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse 当前支持通过 `icebergS3`、`icebergAzure`、`icebergHDFS` 和 `icebergLocal` 表函数，以及 `IcebergS3`、`icebergAzure`、`IcebergHDFS` 和 `IcebergLocal` 表引擎读取 Iceberg 格式的 v1 和 v2。
:::

## 定义命名集合 {#defining-a-named-collection}

以下是配置命名集合以存储 URL 和凭证的示例：

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
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

## 架构演变 {#schema-evolution}
目前，通过 ClickHouse，您可以读取随时间变化的 iceberg 表的架构。我们当前支持读取已添加和删除列、列顺序已更改的表。您还可以将一个需要值的列更改为允许 NULL 的列。此外，我们支持简单类型的允许类型转换，即：
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) 其中 P' > P。

目前，不允许更改嵌套结构或数组和映射中元素的类型。

## 分区修剪 {#partition-pruning}

ClickHouse 支持在对 Iceberg 表执行 SELECT 查询时进行分区修剪，这帮助通过跳过不相关的数据文件来优化查询性能。要启用分区修剪，设置 `use_iceberg_partition_pruning = 1`。有关 iceberg 分区修剪的更多信息，请访问 https://iceberg.apache.org/spec/#partitioning

## 时间旅行 {#time-travel}

ClickHouse 支持 Iceberg 表的时间旅行，允许您使用特定的时间戳或快照 ID 查询历史数据。

### 基本用法 {#basic-usage}
 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

注意：在同一个查询中不能指定 `iceberg_timestamp_ms` 和 `iceberg_snapshot_id` 参数。

### 重要考虑事项 {#important-considerations}

- **快照** 通常在以下情况下创建：
    - 向表中写入新数据
    - 执行某种数据压缩

- **架构更改通常不会创建快照** - 这会导致在使用时间旅行时与经历过架构演变的表产生重要行为差异。

### 示例场景 {#example-scenarios}

所有场景均以 Spark 编写，因为 ClickHouse 目前不支持向 Iceberg 表写入数据。

#### 场景 1：没有新快照的架构更改 {#scenario-1}

考虑下面的操作序列：

 ```sql
 -- 创建一个具有两列的表
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

不同时间戳的查询结果：

- 在 ts1 和 ts2：仅显示原始的两列
- 在 ts3：出现所有三列，第一行的价格为 NULL

#### 场景 2：历史与当前架构差异 {#scenario-2}

当前时刻的时间旅行查询可能显示与当前表不同的架构：

```sql
-- 创建一个表
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

-- 在当前时刻查询表，但使用时间戳语法

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

这发生是因为 `ALTER TABLE` 不会创建新快照，但对于当前表，Spark 从最新的元数据文件中获取 `schema_id` 的值，而不是快照。

#### 场景 3：历史与当前架构差异 {#scenario-3}

第二种情况是，在进行时间旅行时，无法获取到写入数据之前的表的状态：

```sql
-- 创建一个表
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- 在特定时间戳查询表
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- 以错误结束：找不到早于 ts 的快照。
```

在 ClickHouse 中，该行为与 Spark 一致。您可以将 Spark 的 SELECT 查询替换为 ClickHouse 的 SELECT 查询，结果相同。

## 元数据文件解析 {#metadata-file-resolution}

使用 ClickHouse 中的 `iceberg` 表函数时，系统需要定位描述 Iceberg 表结构的正确 metadata.json 文件。解析过程如下：

### 候选搜索（按优先级顺序） {#candidate-search}

1. **直接路径规范**：
   * 如果设置了 `iceberg_metadata_file_path`，系统将使用此确切路径与 Iceberg 表目录路径进行组合。
   * 提供此设置时，所有其他解析设置将被忽略。

2. **表 UUID 匹配**：
   * 如果指定了 `iceberg_metadata_table_uuid`，系统将：
     * 仅查看 `metadata` 目录中的 `.metadata.json` 文件
     * 过滤包含与您指定的 UUID（不区分大小写）匹配的 `table-uuid` 字段的文件

3. **默认搜索**：
   * 如果未提供上述任何设置，则 `metadata` 目录中的所有 `.metadata.json` 文件均成为候选文件。

### 选择最新文件 {#most-recent-file}

在使用上述规则识别候选文件后，系统确定哪一个是最近的：

* 如果启用 `iceberg_recent_metadata_file_by_last_updated_ms_field`：
  * 选择具有最大 `last-updated-ms` 值的文件

* 否则：
  * 选择版本号最高的文件
  * （版本显示为 `V`，文件格式为 `V.metadata.json` 或 `V-uuid.metadata.json`）

**注意**：所有提到的设置均为表函数设置（不是全局或查询级设置），必须按如下所示指定：

```sql 
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**注意**：虽然 Iceberg Catalog 通常处理元数据解析，ClickHouse 中的 `iceberg` 表函数直接将存储在 S3 中的文件解释为 Iceberg 表，因此理解这些解析规则非常重要。

## 元数据缓存 {#metadata-cache}

`Iceberg` 表引擎和表函数支持元数据缓存，存储清单文件、清单列表和元数据 json 的信息。该缓存存储在内存中。此功能受设置 `use_iceberg_metadata_files_cache` 控制，默认启用。

## 别名 {#aliases}

表函数 `iceberg` 目前是 `icebergS3` 的别名。

## 参见 {#see-also}

- [Iceberg 引擎](/engines/table-engines/integrations/iceberg.md)
- [Iceberg 集群表函数](/sql-reference/table-functions/icebergCluster.md)
