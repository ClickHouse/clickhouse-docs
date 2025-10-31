---
'description': '该引擎提供与现有 Apache Iceberg 表的只读集成，支持 Amazon S3、Azure、HDFS 和本地存储的表。'
'sidebar_label': 'Iceberg'
'sidebar_position': 90
'slug': '/engines/table-engines/integrations/iceberg'
'title': 'Iceberg 表引擎'
'doc_type': 'reference'
---


# Iceberg 表引擎 {#iceberg-table-engine}

:::warning 
我们建议使用 [Iceberg 表函数](/sql-reference/table-functions/iceberg.md) 来处理 ClickHouse 中的 Iceberg 数据。Iceberg 表函数目前提供了足够的功能，为 Iceberg 表提供了部分只读接口。

Iceberg 表引擎是可用的，但可能存在一些限制。ClickHouse 最初并不是为了支持具有外部变更模式的表而设计的，这可能会影响 Iceberg 表引擎的功能。因此，某些适用于常规表的功能可能不可用或无法正常工作，尤其是在使用旧分析器时。

为了获得最佳兼容性，我们建议在继续改进对 Iceberg 表引擎的支持时使用 Iceberg 表函数。
:::

该引擎提供了与现有 Apache [Iceberg](https://iceberg.apache.org/) 表的只读集成，这些表存储在 Amazon S3、Azure、HDFS 以及本地。

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

参数的描述与引擎 `S3`、`AzureBlobStorage`、`HDFS` 和 `File` 中参数的描述相符。
`format` 代表 Iceberg 表中数据文件的格式。

引擎参数可以使用 [命名集合](../../../operations/named-collections.md) 指定。

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

## 模式演变 {#schema-evolution}
目前，借助 CH，您可以读取随时间变化的 iceberg 表的结构。我们当前支持读取添加和移除列及其顺序发生变化的表。您还可以更改必需值的列为允许 NULL 的列。此外，我们支持简单类型的允许类型转换，即：
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S)，其中 P' > P。

目前，无法更改嵌套结构或数组和地图中的元素类型。

要读取在创建后模式已变化的表并启用动态模式推断，请在创建表时将 allow_dynamic_metadata_for_data_lakes 设置为 true。

## 分区修剪 {#partition-pruning}

ClickHouse 在 SELECT 查询时支持 Iceberg 表的分区修剪，这有助于通过跳过不相关的数据文件来优化查询性能。要启用分区修剪，请设置 `use_iceberg_partition_pruning = 1`。有关 iceberg 分区修剪的更多信息，请访问 https://iceberg.apache.org/spec/#partitioning

## 时间旅行 {#time-travel}

ClickHouse 支持 Iceberg 表的时间旅行，允许您使用特定的时间戳或快照 ID 查询历史数据。

## 处理有已删除行的表 {#deleted-rows}

目前，仅支持带有 [位置删除](https://iceberg.apache.org/spec/#position-delete-files) 的 Iceberg 表。

以下删除方法 **不支持**：
- [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
- [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors)（在 v3 中引入）

### 基本用法 {#basic-usage}
```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

注意：您不能在同一查询中同时指定 `iceberg_timestamp_ms` 和 `iceberg_snapshot_id` 参数。

### 重要考虑 {#important-considerations}

- **快照** 通常在以下情况下创建：
  - 向表中写入新数据
  - 执行某种数据压缩

- **模式更改通常不创建快照** - 这导致在使用经历过模式演变的表时进行时间旅行时的重要行为。

### 示例场景 {#example-scenarios}

所有场景都是用 Spark 编写的，因为 CH 还不支持写入 Iceberg 表。

#### 场景 1：没有新快照的模式更改 {#scenario-1}

考虑以下操作序列：

```sql
 -- Create a table with two columns
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // A piece of pseudo code

-- Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)

  ts2 = now()

-- Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

-- Query the table at each timestamp
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

在不同时间戳的查询结果：

- 在 ts1 和 ts2：只有原来的两列出现
- 在 ts3：出现三列，第一行的价格为 NULL

#### 场景 2：历史与当前模式差异 {#scenario-2}

当前时刻的时间旅行查询可能显示与当前表不同的模式：

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
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

这是因为 `ALTER TABLE` 不会创建新快照，但是对于当前表，Spark 从最新的元数据文件获取 `schema_id` 的值，而不是快照。

#### 场景 3：历史与当前模式差异 {#scenario-3}

第二个问题是，在进行时间旅行时，您无法获取在没有任何数据写入之前表的状态：

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Query the table at a specific timestamp
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Finises with error: Cannot find a snapshot older than ts.
```

在 Clickhouse 中，该行为与 Spark 一致。您可以在脑中将 Spark 的 Select 查询替换为 Clickhouse 的 Select 查询，这样也能正常工作。

## 元数据文件解析 {#metadata-file-resolution}
在 ClickHouse 中使用 `Iceberg` 表引擎时，系统需要定位描述 Iceberg 表结构的正确 metadata.json 文件。解析过程如下：

### 候选者搜索 {#candidate-search}

1. **直接路径指定**：
* 如果设置了 `iceberg_metadata_file_path`，系统将使用此确切路径，并与 Iceberg 表目录路径结合。
* 当提供此设置时，所有其他解析设置将被忽略。
2. **表 UUID 匹配**：
* 如果指定了 `iceberg_metadata_table_uuid`，系统将：
  * 仅查看 `metadata` 目录中的 `.metadata.json` 文件
  * 筛选包含与您指定的 UUID（不区分大小写）匹配的 `table-uuid` 字段的文件

3. **默认搜索**：
* 如果未提供以上任何设置，则 `metadata` 目录中的所有 `.metadata.json` 文件都成为候选者

### 选择最新文件 {#most-recent-file}

在使用以上规则识别候选文件后，系统确定哪个是最新的：

* 如果启用了 `iceberg_recent_metadata_file_by_last_updated_ms_field`：
  * 选择具有最大 `last-updated-ms` 值的文件

* 否则：
  * 选择版本号最高的文件
  * （版本以 `V` 显示在格式为 `V.metadata.json` 或 `V-uuid.metadata.json` 的文件名中）

**注意**：所有提到的设置都是引擎级设置，必须在表创建时指定，如下所示：

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**注意**：虽然 Iceberg Catalogs 通常处理元数据解析，但 ClickHouse 中的 `Iceberg` 表引擎直接将存储在 S3 中的文件解释为 Iceberg 表，因此理解这些解析规则非常重要。

## 数据缓存 {#data-cache}

`Iceberg` 表引擎和表函数支持与 `S3`、`AzureBlobStorage`、`HDFS` 存储相同的数据缓存。请参见 [这里](../../../engines/table-engines/integrations/s3.md#data-cache)。

## 元数据缓存 {#metadata-cache}

`Iceberg` 表引擎和表函数支持存储清单文件、清单列表和元数据 json 的元数据缓存。缓存存储在内存中。此功能由设置 `use_iceberg_metadata_files_cache` 控制，默认启用。

## 另请参见 {#see-also}

- [iceberg 表函数](/sql-reference/table-functions/iceberg.md)
