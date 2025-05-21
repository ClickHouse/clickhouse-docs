---
'description': 'Table Functions'
'sidebar_label': '表函数'
'sidebar_position': 1
'slug': '/sql-reference/table-functions/'
'title': '表函数'
---




# 表函数

表函数是构造表的方法。

## 用法 {#usage}

表函数可以在 `SELECT` 查询的 [`FROM`](../../sql-reference/statements/select/from.md) 子句中使用。例如，您可以使用 `file` 表函数从本地机器上的文件中 `SELECT` 数据。

```bash
echo "1, 2, 3" > example.csv
```
```text
./clickhouse client
:) SELECT * FROM file('example.csv')
┌─c1─┬─c2─┬─c3─┐
│  1 │  2 │  3 │
└────┴────┴────┘
```

您还可以使用表函数创建仅在当前查询中可用的临时表。例如：

```sql title="查询"
SELECT * FROM generateSeries(1,5);
```
```response title="响应"
┌─generate_series─┐
│               1 │
│               2 │
│               3 │
│               4 │
│               5 │
└─────────────────┘
```

当查询完成时，表将被删除。

表函数可以使用以下语法创建表：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

例如：

```sql title="查询"
CREATE TABLE series AS generateSeries(1, 5);
SELECT * FROM series;
```

```response
┌─generate_series─┐
│               1 │
│               2 │
│               3 │
│               4 │
│               5 │
└─────────────────┘
```

最后，表函数也可以用来 `INSERT` 数据到表中。例如，我们可以再次使用 `file` 表函数将之前示例中创建的表的内容写入磁盘上的文件：

```sql
INSERT INTO FUNCTION file('numbers.csv', 'CSV') SELECT * FROM series;
```

```bash
cat numbers.csv
1
2
3
4
5
```

:::note
如果 [allow_ddl](/operations/settings/settings#allow_ddl) 设置被禁用，则无法使用表函数。
:::
| 页面 | 描述 |
|-----|-----|
| [fileCluster](/sql-reference/table-functions/fileCluster) | 启用在集群内多个节点同时处理与指定路径匹配的文件。发起者与工作节点建立连接，扩展文件路径中的通配符，并将文件读取任务委派给工作节点。每个工作节点查询发起者以获取下一个要处理的文件，重复此过程直到所有任务完成（所有文件均已读取）。 |
| [input](/sql-reference/table-functions/input) | 表函数，允许有效地将以给定结构发送到服务器的数据转换和插入到其他结构的表中。 |
| [iceberg](/sql-reference/table-functions/iceberg) | 提供对 Amazon S3、Azure、HDFS 或本地存储的 Apache Iceberg 表的只读表状接口。 |
| [executable](/engines/table-functions/executable) | `executable` 表函数基于用户定义函数（UDF）的输出创建表，该函数在脚本中定义，并将行输出到 **stdout**。 |
| [timeSeriesMetrics](/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetrics 返回用于表 `db_name.time_series_table` 的指标表，其表引擎为 TimeSeries 引擎。 |
| [loop](/sql-reference/table-functions/loop) | ClickHouse 中的 loop 表函数用于以无限循环返回查询结果。 |
| [url](/sql-reference/table-functions/url) | 从给定 `URL` 创建一个表，指定 `format` 和 `structure`。 |
| [hudi](/sql-reference/table-functions/hudi) | 提供对 Amazon S3 中 Apache Hudi 表的只读表状接口。 |
| [fuzzQuery](/sql-reference/table-functions/fuzzQuery) | 随机变更给定查询字符串。 |
| [clusterAllReplicas](/sql-reference/table-functions/cluster) | 允许访问不创建分布式表的集群中所有分片（在 `remote_servers` 部分配置）。 |
| [urlCluster](/sql-reference/table-functions/urlCluster) | 允许从指定集群中的许多节点并行处理 URL 中的文件。 |
| [redis](/sql-reference/table-functions/redis) | 此表函数允许将 ClickHouse 与 Redis 集成。 |
| [icebergCluster](/sql-reference/table-functions/icebergCluster) | iceberg 表函数的扩展，允许从指定集群中的许多节点并行处理 Apache Iceberg 的文件。 |
| [view](/sql-reference/table-functions/view) | 将子查询转换为表。该函数实现视图。 |
| [file](/sql-reference/table-functions/file) | 一个表引擎，提供从文件中选择和插入的表状接口，类似于 s3 表函数。当处理本地文件时使用 `file()`，处理对象存储中的存储桶时使用 `s3()`。 |
| [timeSeriesTags](/sql-reference/table-functions/timeSeriesTags) | timeSeriesTags 表函数返回用于表 `db_name.time_series_table` 的标签表，其表引擎为 TimeSeries 引擎。 |
| [mysql](/sql-reference/table-functions/mysql) | 允许对存储在远程 MySQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [mergeTreeProjection](/sql-reference/table-functions/mergeTreeProjection) | 表示 MergeTree 表中某个投影的内容。可以用于自省。 |
| [s3 Table Function](/sql-reference/table-functions/s3) | 提供选择/插入 Amazon S3 和 Google Cloud Storage 中的文件的表状接口。该表函数类似于 hdfs 函数，但提供特定于 S3 的功能。 |
| [dictionary](/sql-reference/table-functions/dictionary) | 作为 ClickHouse 表显示字典数据。工作方式与字典引擎相同。 |
| [hdfs](/sql-reference/table-functions/hdfs) | 从 HDFS 中的文件创建表。该表函数类似于 url 和 file 表函数。 |
| [fuzzJSON](/sql-reference/table-functions/fuzzJSON) | 随机变更 JSON 字符串。 |
| [hdfsCluster](/sql-reference/table-functions/hdfsCluster) | 允许从指定集群中的许多节点并行处理 HDFS 中的文件。 |
| [zeros](/sql-reference/table-functions/zeros) | 用于测试目的，是生成许多行的最快方法。类似于 `system.zeros` 和 `system.zeros_mt` 系统表。 |
| [values](/sql-reference/table-functions/values) | 创建一个临时存储，填充列的值。 |
| [generateRandom](/sql-reference/table-functions/generate) | 生成具有给定结构的随机数据。允许用该数据填充测试表。并非所有类型都受支持。 |
| [deltaLake](/sql-reference/table-functions/deltalake) | 提供对 Amazon S3 中 Delta Lake 表的只读表状接口。 |
| [gcs](/sql-reference/table-functions/gcs) | 提供 Google Cloud Storage 的数据选择和插入的表状接口。要求具有 `Storage Object User` IAM 角色。 |
| [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) | 表示 MergeTree 表的索引和标记文件的内容。可以用于自省。 |
| [postgresql](/sql-reference/table-functions/postgresql) | 允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [timeSeriesData](/sql-reference/table-functions/timeSeriesData) | timeSeriesData 返回用于表 `db_name.time_series_table` 的数据表，其表引擎为 TimeSeries。 |
| [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) | 提供选择/插入 Azure Blob Storage 中的文件的表状接口。类似于 s3 函数。 |
| [odbc](/sql-reference/table-functions/odbc) | 返回通过 ODBC 连接的表。 |
| [merge](/sql-reference/table-functions/merge) | 创建临时 Merge 表。结构将通过使用其列的联合和推导公共类型从底层表派生。 |
| [hudiCluster Table Function](/sql-reference/table-functions/hudiCluster) | hudi 表函数的扩展。允许在指定集群中的许多节点并行处理 Amazon S3 中的 Apache Hudi 表的文件。 |
| [generate_series (generateSeries)](/sql-reference/table-functions/generate_series) | 返回一个单一包含从开始到结束（包括）的整数的 `generate_series` 列的表。 |
| [azureBlobStorageCluster](/sql-reference/table-functions/azureBlobStorageCluster) | 允许从指定集群中的许多节点并行处理 Azure Blob 存储中的文件。 |
| [jdbc](/sql-reference/table-functions/jdbc) | 返回通过 JDBC 驱动程序连接的表。 |
| [format](/sql-reference/table-functions/format) | 根据指定的输入格式从参数中解析数据。如果未指定结构参数，则从数据中提取。 |
| [s3Cluster](/sql-reference/table-functions/s3Cluster) | s3 表函数的扩展，允许在指定集群中的许多节点并行处理 Amazon S3 和 Google Cloud Storage 中的文件。 |
| [TODO: Add title](/sql-reference/table-functions/generateSeries) | TODO: 添加描述 |
| [sqlite](/sql-reference/table-functions/sqlite) | 允许对存储在 SQLite 数据库中的数据执行查询。 |
| [deltaLakeCluster](/sql-reference/table-functions/deltalakeCluster) | 这是 deltaLake 表函数的扩展。 |
| [numbers](/sql-reference/table-functions/numbers) | 返回一个单一包含可指定整数的 `number` 列的表。 |
| [null](/sql-reference/table-functions/null) | 创建具有指定结构的临时表，使用 Null 表引擎。该函数用于方便地编写测试和演示。 |
| [remote, remoteSecure](/sql-reference/table-functions/remote) | 表函数 `remote` 允许动态访问远程服务器，即无需创建分布式表。表函数 `remoteSecure` 与 `remote` 相同，但通过安全连接进行。 |
| [mongodb](/sql-reference/table-functions/mongodb) | 允许对存储在远程 MongoDB 服务器上的数据执行 `SELECT` 查询。 |
