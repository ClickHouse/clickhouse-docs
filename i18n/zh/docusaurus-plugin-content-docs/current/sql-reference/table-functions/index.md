
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

查询完成后，该表将被删除。

表函数可以通过以下语法作为创建表的一种方式：

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

最后，表函数可以用于 `INSERT` 数据到表中。例如，我们可以再次使用 `file` 表函数将我们在前面的例子中创建的表的内容写入磁盘上的文件：

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
| [fileCluster](/sql-reference/table-functions/fileCluster) | 启用在集群中的多个节点上并行处理与指定路径匹配的文件。启动者与工作节点建立连接，扩展文件路径中的 glob，并将读取文件的任务委托给工作节点。每个工作节点向启动者查询下一个要处理的文件，重复直到所有任务完成（所有文件均已读取）。 |
| [input](/sql-reference/table-functions/input) | 表函数，允许有效地将以给定结构发送到服务器的数据转换并插入到具有另一种结构的表中。 |
| [iceberg](/sql-reference/table-functions/iceberg) | 提供对存储在 Amazon S3、Azure、HDFS 或本地的 Apache Iceberg 表的只读表状接口。 |
| [executable](/engines/table-functions/executable) | `executable` 表函数根据用户定义的函数（UDF）的输出创建一个表，该函数在输出行到 **stdout** 的脚本中定义。 |
| [timeSeriesMetrics](/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetrics 返回由表 `db_name.time_series_table` 使用的度量表，该表的表引擎为 TimeSeries 引擎。 |
| [loop](/sql-reference/table-functions/loop) | ClickHouse 中的 loop 表函数用于在无限循环中返回查询结果。 |
| [url](/sql-reference/table-functions/url) | 从给定 `format` 和 `structure` 的 `URL` 创建表。 |
| [hudi](/sql-reference/table-functions/hudi) | 提供对存储在 Amazon S3 的 Apache Hudi 表的只读表状接口。 |
| [fuzzQuery](/sql-reference/table-functions/fuzzQuery) | 对给定的查询字符串进行随机变体扰动。 |
| [clusterAllReplicas](/sql-reference/table-functions/cluster) | 允许访问集群的所有分片（在 `remote_servers` 部分配置）而不创建分布式表。 |
| [urlCluster](/sql-reference/table-functions/urlCluster) | 允许从指定集群中的多个节点并行处理来自 URL 的文件。 |
| [redis](/sql-reference/table-functions/redis) | 此表函数允许将 ClickHouse 与 Redis 集成。 |
| [icebergCluster](/sql-reference/table-functions/icebergCluster) | iceberg 表函数的扩展，允许从指定集群中的多个节点并行处理 Apache Iceberg 的文件。 |
| [view](/sql-reference/table-functions/view) | 将子查询转换为表。该函数实现视图。 |
| [file](/sql-reference/table-functions/file) | 一个表引擎，为从文件中 `SELECT` 和 `INSERT` 提供表状接口，类似于 s3 表函数。在处理本地文件时使用 `file()`，在处理对象存储中的桶（如 S3、GCS 或 MinIO）时使用 `s3()`。 |
| [timeSeriesTags](/sql-reference/table-functions/timeSeriesTags) | timeSeriesTags 表函数返回由表 `db_name.time_series_table` 使用的标签表，该表的表引擎为 TimeSeries 引擎。 |
| [mysql](/sql-reference/table-functions/mysql) | 允许对存储在远程 MySQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [mergeTreeProjection](/sql-reference/table-functions/mergeTreeProjection) | 表示 MergeTree 表中某些投影的内容。它可用于内部检查。 |
| [s3 Table Function](/sql-reference/table-functions/s3) | 提供对 Amazon S3 和 Google Cloud Storage 中文件的选择/插入的表状接口。此表函数类似于 hdfs 函数，但提供 S3 特定的功能。 |
| [dictionary](/sql-reference/table-functions/dictionary) | 将字典数据显示为 ClickHouse 表。与字典引擎的工作方式相同。 |
| [hdfs](/sql-reference/table-functions/hdfs) | 从 HDFS 中的文件创建表。此表函数类似于 url 和 file 表函数。 |
| [fuzzJSON](/sql-reference/table-functions/fuzzJSON) | 用随机变体扰动 JSON 字符串。 |
| [hdfsCluster](/sql-reference/table-functions/hdfsCluster) | 允许从指定集群中的多个节点并行处理来自 HDFS 的文件。 |
| [zeros](/sql-reference/table-functions/zeros) | 用于测试目的，是生成许多行的最快方法。类似于 `system.zeros` 和 `system.zeros_mt` 系统表。 |
| [values](/sql-reference/table-functions/values) | 创建一个临时存储，用于填充列的值。 |
| [generateRandom](/sql-reference/table-functions/generate) | 生成具有给定模式的随机数据。允许用这些数据填充测试表。不是所有类型都受支持。 |
| [deltaLake](/sql-reference/table-functions/deltalake) | 提供对存储在 Amazon S3 的 Delta Lake 表的只读表状接口。 |
| [gcs](/sql-reference/table-functions/gcs) | 提供对 Google Cloud Storage 中数据的 `SELECT` 和 `INSERT` 的表状接口。需要 `Storage Object User` IAM 角色。 |
| [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) | 表示 MergeTree 表的索引和标记文件的内容。可用于内部检查。 |
| [postgresql](/sql-reference/table-functions/postgresql) | 允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [timeSeriesData](/sql-reference/table-functions/timeSeriesData) | timeSeriesData 返回由表 `db_name.time_series_table` 使用的数据表，该表的表引擎为 TimeSeries。 |
| [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) | 提供对 Azure Blob Storage 中文件的选择/插入的表状接口。类似于 s3 函数。 |
| [odbc](/sql-reference/table-functions/odbc) | 返回通过 ODBC 连接的表。 |
| [merge](/sql-reference/table-functions/merge) | 创建一个临时 Merge 表。其结构将通过对其列的联合和导出公共类型从基础表中推导。 |
| [hudiCluster Table Function](/sql-reference/table-functions/hudiCluster) | hudi 表函数的扩展，允许在指定集群中的多个节点并行处理存储在 Amazon S3 的 Apache Hudi 表的文件。 |
| [generate_series (generateSeries)](/sql-reference/table-functions/generate_series) | 返回一个包含从开始到结束（包含）整数的单独 `generate_series` 列（UInt64）表。 |
| [azureBlobStorageCluster](/sql-reference/table-functions/azureBlobStorageCluster) | 允许从 Azure Blob 存储并行处理文件，在指定集群中的多个节点。 |
| [jdbc](/sql-reference/table-functions/jdbc) | 返回通过 JDBC 驱动程序连接的表。 |
| [format](/sql-reference/table-functions/format) | 根据指定的输入格式解析数据。 如果未指定结构参数，则从数据中提取。 |
| [s3Cluster](/sql-reference/table-functions/s3Cluster) | s3 表函数的扩展，允许在指定集群中使用多个节点从 Amazon S3 和 Google Cloud Storage 并行处理文件。 |
| [TODO: Add title](/sql-reference/table-functions/generateSeries) | TODO: 添加描述 |
| [sqlite](/sql-reference/table-functions/sqlite) | 允许对存储在 SQLite 数据库中的数据执行查询。 |
| [deltaLakeCluster](/sql-reference/table-functions/deltalakeCluster) | 这是 deltaLake 表函数的扩展。 |
| [numbers](/sql-reference/table-functions/numbers) | 返回具有单个 `number` 列的表，该列包含可指定的整数。 |
| [null](/sql-reference/table-functions/null) | 创建一个指定结构的临时表，使用 Null 表引擎。该函数用于方便测试编写和演示。 |
| [remote, remoteSecure](/sql-reference/table-functions/remote) | 表函数 `remote` 允许在无需创建分布式表的情况下实时访问远程服务器。表函数 `remoteSecure`与 `remote` 相同，但通过安全连接进行。 |
| [mongodb](/sql-reference/table-functions/mongodb) | 允许对存储在远程 MongoDB 服务器上的数据执行 `SELECT` 查询。 |
