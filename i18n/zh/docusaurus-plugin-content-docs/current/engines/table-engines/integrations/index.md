---
'description': '集成的 Table Engines 说明'
'sidebar_label': 'Integrations'
'sidebar_position': 40
'slug': '/engines/table-engines/integrations/'
'title': '集成的表引擎'
---


# 表引擎用于集成

ClickHouse 提供多种与外部系统集成的方式，包括表引擎。与所有其他表引擎一样，配置使用 `CREATE TABLE` 或 `ALTER TABLE` 查询完成。从用户的角度来看，配置好的集成看起来就像普通表一样，但对此的查询会被代理到外部系统。这种透明的查询是该方法相对于其他集成方式（如字典或表函数）的一个关键优势，这些方式在每次使用时都需要使用自定义查询方法。

<!-- 本页面的目录表是通过 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh 
从 YAML 前言字段：slug, description, title 自动生成的。

如果您发现错误，请编辑页面本身的 YML 前言。 -->
| 页面 | 描述 |
|-----|-----|
| [Kafka](/engines/table-engines/integrations/kafka) | Kafka 引擎与 Apache Kafka 一起工作，让您能够发布或订阅数据流，组织容错存储，并处理可用流。 |
| [Iceberg 表引擎](/engines/table-engines/integrations/iceberg) | 此引擎提供与 Amazon S3、Azure、HDFS 中现有 Apache Iceberg 表的只读集成。 |
| [RabbitMQ 引擎](/engines/table-engines/integrations/rabbitmq) | 此引擎允许将 ClickHouse 与 RabbitMQ 集成。 |
| [EmbeddedRocksDB 引擎](/engines/table-engines/integrations/embedded-rocksdb) | 此引擎允许将 ClickHouse 与 RocksDB 集成。 |
| [Hive](/engines/table-engines/integrations/hive) | Hive 引擎允许您对 HDFS Hive 表执行 `SELECT` 查询。 |
| [Hudi 表引擎](/engines/table-engines/integrations/hudi) | 此引擎提供对 Amazon S3 中现有 Apache Hudi 表的只读集成。 |
| [Redis](/engines/table-engines/integrations/redis) | 此引擎允许将 ClickHouse 与 Redis 集成。 |
| [MySQL 引擎允许您对存储在远程 MySQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。](/engines/table-engines/integrations/mysql) | MySQL 表引擎文档 |
| [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql) | 创建一个 ClickHouse 表并初始化 PostgreSQL 表的数据转储并启动复制过程。 |
| [S3 表引擎](/engines/table-engines/integrations/s3) | 此引擎提供与 Amazon S3 生态系统的集成。类似于 HDFS 引擎，但提供 S3 特定特性。 |
| [HDFS](/engines/table-engines/integrations/hdfs) | 此引擎通过允许通过 ClickHouse 管理 HDFS 上的数据提供与 Apache Hadoop 生态系统的集成。此引擎类似于文件和 URL 引擎，但提供 Hadoop 特定特性。 |
| [ExternalDistributed](/engines/table-engines/integrations/ExternalDistributed) | `ExternalDistributed` 引擎允许对存储在远程 MySQL 或 PostgreSQL 服务器上的数据执行 `SELECT` 查询。接受 MySQL 或 PostgreSQL 引擎作为参数，因此支持分片。 |
| [DeltaLake 表引擎](/engines/table-engines/integrations/deltalake) | 此引擎提供对 Amazon S3 中现有 Delta Lake 表的只读集成。 |
| [PostgreSQL 表引擎](/engines/table-engines/integrations/postgresql) | PostgreSQL 引擎允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [AzureBlobStorage 表引擎](/engines/table-engines/integrations/azureBlobStorage) | 此引擎提供与 Azure Blob 存储生态系统的集成。 |
| [ODBC](/engines/table-engines/integrations/odbc) | 允许 ClickHouse 通过 ODBC 连接外部数据库。 |
| [JDBC](/engines/table-engines/integrations/jdbc) | 允许 ClickHouse 通过 JDBC 连接外部数据库。 |
| [NATS 引擎](/engines/table-engines/integrations/nats) | 此引擎允许将 ClickHouse 与 NATS 集成，以发布或订阅消息主题，并在新消息可用时处理。 |
| [SQLite](/engines/table-engines/integrations/sqlite) | 该引擎允许将数据导入和导出到 SQLite，并支持直接从 ClickHouse 对 SQLite 表进行查询。 |
| [S3Queue 表引擎](/engines/table-engines/integrations/s3queue) | 此引擎提供与 Amazon S3 生态系统的集成，并允许流式导入。类似于 Kafka 和 RabbitMQ 引擎，但提供 S3 特定特性。 |
| [AzureQueue 表引擎](/engines/table-engines/integrations/azure-queue) | 此引擎提供与 Azure Blob 存储生态系统的集成，允许流式数据导入。 |
| [TimeSeries 引擎](/engines/table-engines/special/time_series) | 一种存储时间序列的表引擎，即与时间戳和标签（或标签）相关联的一组值。 |
| [MongoDB](/engines/table-engines/integrations/mongodb) | MongoDB 引擎是只读表引擎，允许从远程集合中读取数据。 |
