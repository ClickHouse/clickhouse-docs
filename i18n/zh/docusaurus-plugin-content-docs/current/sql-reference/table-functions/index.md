---
'description': 'Table Functions 的文档'
'sidebar_label': '表函数'
'sidebar_position': 1
'slug': '/sql-reference/table-functions/'
'title': '表函数'
---


# 表函数

表函数是构建表的方法。

## 用法 {#usage}

表函数可以在 `SELECT` 查询的 [`FROM`](../../sql-reference/statements/select/from.md) 子句中使用。例如，您可以使用 `file` 表函数从本地机器的文件中 `SELECT` 数据。

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

您还可以使用表函数创建一个仅在当前查询中可用的临时表。例如：

```sql title="Query"
SELECT * FROM generateSeries(1,5);
```
```response title="Response"
┌─generate_series─┐
│               1 │
│               2 │
│               3 │
│               4 │
│               5 │
└─────────────────┘
```

当查询完成时，表会被删除。

表函数可以作为创建表的一种方式，使用以下语法：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

例如：

```sql title="Query"
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

最后，表函数可以用来 `INSERT` 数据到表中。例如，我们可以使用 `file` 表函数将我们在上一个示例中创建的表的内容写入磁盘上的文件：

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
如果禁用了 [allow_ddl](/operations/settings/settings#allow_ddl) 设置，则无法使用表函数。
:::
| 页面 | 描述 |
|-----|-----|
| [fileCluster](/sql-reference/table-functions/fileCluster) | 启用在集群内多个节点上同时处理与指定路径匹配的文件。发起者建立与工作节点的连接，扩展文件路径中的通配符并将文件读取任务委派给工作节点。每个工作节点查询发起者以处理下一个文件，重复此过程直到所有任务完成（所有文件已被读取）。 |
| [input](/sql-reference/table-functions/input) | 表函数，可有效地将发送到服务器的数据转换并插入到具有不同结构的表中。 |
| [iceberg](/sql-reference/table-functions/iceberg) | 为存储在 Amazon S3、Azure、HDFS 或本地的 Apache Iceberg 表提供只读的表似接口。 |
| [executable](/engines/table-functions/executable) | `executable` 表函数根据用户定义的函数（UDF）的输出创建表，该函数在输出行到 **stdout** 的脚本中定义。 |
| [timeSeriesMetrics](/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetrics 返回用于表 `db_name.time_series_table` 的度量表，该表的引擎为 TimeSeries 引擎。 |
| [loop](/sql-reference/table-functions/loop) | ClickHouse 中的 loop 表函数用于在无限循环中返回查询结果。 |
| [url](/sql-reference/table-functions/url) | 从给定的 `URL` 创建一个具有指定 `format` 和 `structure` 的表。 |
| [hudi](/sql-reference/table-functions/hudi) | 为存储在 Amazon S3 的 Apache Hudi 表提供只读的表似接口。 |
| [fuzzQuery](/sql-reference/table-functions/fuzzQuery) | 通过随机变体扰动给定的查询字符串。 |
| [clusterAllReplicas](/sql-reference/table-functions/cluster) | 允许访问集群中所有分片（在 `remote_servers` 部分配置）而无需创建分布式表。 |
| [urlCluster](/sql-reference/table-functions/urlCluster) | 允许从指定集群中的多个节点并行处理来自 URL 的文件。 |
| [redis](/sql-reference/table-functions/redis) | 该表函数允许将 ClickHouse 与 Redis 集成。 |
| [icebergCluster](/sql-reference/table-functions/icebergCluster) | iceberg 表函数的扩展，允许从指定集群中的多个节点并行处理来自 Apache Iceberg 的文件。 |
| [view](/sql-reference/table-functions/view) | 将子查询转换为一个表。该函数实现了视图。 |
| [file](/sql-reference/table-functions/file) | 一种表引擎，提供一个类似表的接口，从文件中 SELECT 和 INSERT，类似于 s3 表函数。使用 `file()` 处理本地文件，使用 `s3()` 处理对象存储（如 S3、GCS 或 MinIO）中的桶。 |
| [timeSeriesTags](/sql-reference/table-functions/timeSeriesTags) | timeSeriesTags 表函数返回由表 `db_name.time_series_table` 使用的标签表，该表的引擎为 TimeSeries 引擎。 |
| [mysql](/sql-reference/table-functions/mysql) | 允许对存储在远程 MySQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [mergeTreeProjection](/sql-reference/table-functions/mergeTreeProjection) | 表示 MergeTree 表中的某个投影的内容。可用于自省。 |
| [s3 Table Function](/sql-reference/table-functions/s3) | 提供一个类似表的接口，以在 Amazon S3 和 Google Cloud Storage 中选择/插入文件。该表函数类似于 hdfs 函数，但提供 S3 特性。 |
| [dictionary](/sql-reference/table-functions/dictionary) | 将字典数据显示为 ClickHouse 表。工作方式与字典引擎相同。 |
| [hdfs](/sql-reference/table-functions/hdfs) | 从 HDFS 中的文件创建表。该表函数类似于 url 和 file 表函数。 |
| [fuzzJSON](/sql-reference/table-functions/fuzzJSON) | 通过随机变体扰动 JSON 字符串。 |
| [hdfsCluster](/sql-reference/table-functions/hdfsCluster) | 允许从 HDFS 中并行处理来自指定集群的多个节点的文件。 |
| [zeros](/sql-reference/table-functions/zeros) | 用于测试目的，作为生成多行的最快方法。类似于 `system.zeros` 和 `system.zeros_mt` 系统表。 |
| [values](/sql-reference/table-functions/values) | 创建一个临时存储，用于填充列的值。 |
| [generateRandom](/sql-reference/table-functions/generate) | 生成具有给定模式的随机数据。允许使用该数据填充测试表。并非所有类型都受支持。 |
| [deltaLake](/sql-reference/table-functions/deltalake) | 为存储在 Amazon S3 中的 Delta Lake 表提供只读的表似接口。 |
| [gcs](/sql-reference/table-functions/gcs) | 提供一个类似表的接口，以从 Google Cloud Storage 中 `SELECT` 和 `INSERT` 数据。需要 `Storage Object User` IAM 角色。 |
| [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) | 表示 MergeTree 表的索引和标记文件的内容。可用于自省。 |
| [postgresql](/sql-reference/table-functions/postgresql) | 允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [timeSeriesData](/sql-reference/table-functions/timeSeriesData) | timeSeriesData 返回用于表 `db_name.time_series_table` 的数据表，该表的引擎为 TimeSeries。 |
| [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) | 为在 Azure Blob 存储中选择/插入文件提供类似表的接口。类似于 s3 函数。 |
| [odbc](/sql-reference/table-functions/odbc) | 返回通过 ODBC 连接的表。 |
| [merge](/sql-reference/table-functions/merge) | 创建一个临时 Merge 表。该结构将通过使用其列的联合及推导公共类型从底层表派生。 |
| [hudiCluster Table Function](/sql-reference/table-functions/hudiCluster) | hudi 表函数的扩展。允许在指定集群的多个节点中并行处理存储在 Amazon S3 的 Apache Hudi 表中的文件。 |
| [generate_series (generateSeries)](/sql-reference/table-functions/generate_series) | 返回一个包含从开始到结束（包括）整型的单列 `generate_series` 表（UInt64）。 |
| [azureBlobStorageCluster](/sql-reference/table-functions/azureBlobStorageCluster) | 允许在指定集群的多个节点中并行处理来自 Azure Blob 存储的文件。 |
| [jdbc](/sql-reference/table-functions/jdbc) | 返回通过 JDBC 驱动程序连接的表。 |
| [format](/sql-reference/table-functions/format) | 根据指定的输入格式解析来自参数的数据。如果未指定结构参数，则从数据中提取。 |
| [s3Cluster](/sql-reference/table-functions/s3Cluster) | s3 表函数的扩展，允许在指定集群的多个节点中并行处理来自 Amazon S3 和 Google Cloud Storage 的文件。 |
| [TODO: Add title](/sql-reference/table-functions/generateSeries) | TODO: 添加描述 |
| [sqlite](/sql-reference/table-functions/sqlite) | 允许对存储在 SQLite 数据库中的数据执行查询。 |
| [deltaLakeCluster](/sql-reference/table-functions/deltalakeCluster) | 这是 deltaLake 表函数的扩展。 |
| [numbers](/sql-reference/table-functions/numbers) | 返回一个包含可指定整数的单列 `number` 表。 |
| [null](/sql-reference/table-functions/null) | 创建一个具有指定结构的临时表，使用 Null 表引擎。该函数用于方便测试编写和演示。 |
| [remote, remoteSecure](/sql-reference/table-functions/remote) | 表函数 `remote` 允许动态访问远程服务器，即无需创建分布式表。表函数 `remoteSecure` 与 `remote` 类似，但通过安全连接进行。 |
| [mongodb](/sql-reference/table-functions/mongodb) | 允许对存储在远程 MongoDB 服务器上的数据执行 `SELECT` 查询。 |
