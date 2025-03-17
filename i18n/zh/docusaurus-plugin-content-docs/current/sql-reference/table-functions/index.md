---
slug: '/sql-reference/table-functions/'
sidebar_label: '表函数'
sidebar_position: 1
---


# 表函数

表函数是构建表的方法。

您可以在以下位置使用表函数：

- [`SELECT` 查询的 FROM](../../sql-reference/statements/select/from.md) 子句。

   用于创建仅在当前查询中可用的临时表。查询完成时，该表将被删除。

- [`CREATE TABLE AS table_function()`](../../sql-reference/statements/create/table.md) 查询。

   这是创建表的方法之一。

- [`INSERT INTO TABLE FUNCTION`](/sql-reference/statements/insert-into#inserting-using-a-table-function) 查询。

:::note
如果禁用 [allow_ddl](/operations/settings/settings#allow_ddl) 设置，则无法使用表函数。
:::
| 页面 | 描述 |
|-----|-----|
| [fileCluster](/sql-reference/table-functions/fileCluster) | 启用在集群中的多个节点上同时处理与指定路径匹配的文件。发起者建立与工作节点的连接，在文件路径中展开通配符，并将文件读取任务委托给工作节点。每个工作节点向发起者查询下一个要处理的文件，重复此过程直到所有任务完成（所有文件都被读取）。 |
| [input](/sql-reference/table-functions/input) | 表函数，允许有效地将以特定结构发送到服务器的数据插入到另一种结构的表中。 |
| [iceberg](/sql-reference/table-functions/iceberg) | 提供对存储在 Amazon S3、Azure、HDFS 或本地的 Apache Iceberg 表的只读表状接口。 |
| [executable](/engines/table-functions/executable) | `executable` 表函数根据您在脚本中定义的用户定义函数（UDF）的输出创建一个表，该 UDF 向 **stdout** 输出行。 |
| [timeSeriesMetrics](/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetrics 返回由表 `db_name.time_series_table` 使用的度量表，其表引擎为 TimeSeries 引擎。 |
| [loop](/sql-reference/table-functions/loop) | ClickHouse 中的 loop 表函数用于在无限循环中返回查询结果。 |
| [url](/sql-reference/table-functions/url) | 从给定 `format` 和 `structure` 的 `URL` 创建表。 |
| [hudi](/sql-reference/table-functions/hudi) | 提供对存储在 Amazon S3 的 Apache Hudi 表的只读表状接口。 |
| [fuzzQuery](/sql-reference/table-functions/fuzzQuery) | 对给定的查询字符串进行随机扰动。 |
| [clusterAllReplicas](/sql-reference/table-functions/cluster) | 允许在不创建分布式表的情况下访问集群的所有分片（在 `remote_servers` 部分配置）。 |
| [urlCluster](/sql-reference/table-functions/urlCluster) | 允许从指定集群中的多个节点并行处理来自 URL 的文件。 |
| [redis](/sql-reference/table-functions/redis) | 此表函数允许将 ClickHouse 与 Redis 集成。 |
| [icebergCluster](/sql-reference/table-functions/icebergCluster) | iceberg 表函数的扩展，允许从指定集群中的多个节点并行处理来自 Apache Iceberg 的文件。 |
| [view](/sql-reference/table-functions/view) | 将子查询转化为表。该函数实现视图。 |
| [file](/sql-reference/table-functions/file) | 一个表引擎，提供与文件的 SELECT 和 INSERT 类似于 s3 表函数的表状接口。处理本地文件时使用 `file()`，处理对象存储（如 S3、GCS 或 MinIO）中的存储桶时使用 `s3()`。 |
| [timeSeriesTags](/sql-reference/table-functions/timeSeriesTags) | timeSeriesTags 表函数返回由表 `db_name.time_series_table` 使用的标签表，其表引擎为 TimeSeries 引擎。 |
| [mysql](/sql-reference/table-functions/mysql) | 允许对存储在远程 MySQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [](/sql-reference/table-functions/s3) | 提供对 Amazon S3 和 Google Cloud Storage 中选择/插入文件的表状接口。此表函数类似于 hdfs 函数，但提供 S3 特有功能。 |
| [dictionary](/sql-reference/table-functions/dictionary) | 将字典数据显示为 ClickHouse 表。工作方式与字典引擎相同。 |
| [hdfs](/sql-reference/table-functions/hdfs) | 从 HDFS 中的文件创建表。此表函数类似于 url 和 file 表函数。 |
| [fuzzJSON](/sql-reference/table-functions/fuzzJSON) | 对 JSON 字符串进行随机扰动。 |
| [hdfsCluster](/sql-reference/table-functions/hdfsCluster) | 允许从指定集群中的多个节点并行处理来自 HDFS 的文件。 |
| [zeros](/sql-reference/table-functions/zeros) | 用于测试目的，是生成许多行的最快方法。类似于 `system.zeros` 和 `system.zeros_mt` 系统表。 |
| [values](/sql-reference/table-functions/values) | 创建一个临时存储器，填充列的值。 |
| [generateRandom](/sql-reference/table-functions/generate) | 生成具有给定模式的随机数据。允许用该数据填充测试表。并非所有类型均受支持。 |
| [deltaLake](/sql-reference/table-functions/deltalake) | 提供对存储在 Amazon S3 的 Delta Lake 表的只读表状接口。 |
| [gcs](/sql-reference/table-functions/gcs) | 提供对 Google Cloud Storage 中数据的 `SELECT` 和 `INSERT` 操作的表状接口。需要 `Storage Object User` IAM 角色。 |
| [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) | 表示 MergeTree 表的索引和标记文件的内容。可用于自省。 |
| [postgresql](/sql-reference/table-functions/postgresql) | 允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [timeSeriesData](/sql-reference/table-functions/timeSeriesData) | timeSeriesData 返回由表 `db_name.time_series_table` 使用的数据表，其表引擎为 TimeSeries。 |
| [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) | 提供对存储在 Azure Blob Storage 中的文件进行选择/插入的表状接口。类似于 s3 函数。 |
| [odbc](/sql-reference/table-functions/odbc) | 返回通过 ODBC 连接的表。 |
| [merge](/sql-reference/table-functions/merge) | 创建一个临时 Merge 表。表结构来自第一个符合正则表达式的表。 |
| [hudiCluster 表函数](/sql-reference/table-functions/hudiCluster) | hudi 表函数的扩展。允许从指定集群中的多个节点并行处理来自 Apache Hudi 表的文件。 |
| [generate_series (generateSeries)](/sql-reference/table-functions/generate_series) | 返回一个只有 'generate_series' 列（UInt64）的表，该列包含从开始到结束（包含）的整数。 |
| [azureBlobStorageCluster](/sql-reference/table-functions/azureBlobStorageCluster) | 允许从 Azure Blob 存储中的文件并行处理，涉及指定集群中的多个节点。 |
| [jdbc](/sql-reference/table-functions/jdbc) | 返回通过 JDBC 驱动连接的表。 |
| [format](/sql-reference/table-functions/format) | 根据指定的输入格式解析数据。 如果未指定结构参数，则从数据中提取。 |
| [s3Cluster](/sql-reference/table-functions/s3Cluster) | s3 表函数的扩展，允许从指定集群中的多个节点并行处理来自 Amazon S3 和 Google Cloud Storage 的文件。 |
| [sqlite](/sql-reference/table-functions/sqlite) | 允许对存储在 SQLite 数据库中的数据执行查询。 |
| [deltaLakeCluster](/sql-reference/table-functions/deltalakeCluster) | 这是 deltaLake 表函数的扩展。 |
| [numbers](/sql-reference/table-functions/numbers) | 返回一个只有 'number' 列的表，该列包含可指定的整数。 |
| [null](/sql-reference/table-functions/null) | 创建一个指定结构的临时表，其表引擎为 Null。此函数用于方便测试编写和演示。 |
| [remote, remoteSecure](/sql-reference/table-functions/remote) | 表函数 `remote` 允许即时访问远程服务器，即在不创建分布式表的情况下。表函数 `remoteSecure` 与 `remote` 相同，但通过安全连接。 |
| [mongodb](/sql-reference/table-functions/mongodb) | 允许对存储在远程 MongoDB 服务器上的数据执行 `SELECT` 查询。 |
