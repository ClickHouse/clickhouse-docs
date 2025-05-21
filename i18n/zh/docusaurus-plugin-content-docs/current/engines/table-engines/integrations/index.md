---
'description': 'Documentation for Table Engines for Integrations'
'sidebar_label': 'Integrations'
'sidebar_position': 40
'slug': '/engines/table-engines/integrations/'
'title': 'Table Engines for Integrations'
---




# 集成的表引擎

ClickHouse 提供多种与外部系统集成的方法，包括表引擎。像所有其他表引擎一样，配置通过 `CREATE TABLE` 或 `ALTER TABLE` 查询完成。然后从用户的角度来看，配置好的集成看起来像普通表，但对它的查询会被代理到外部系统。这种透明的查询是这种方法相较于其他集成方法（如字典或表函数）的一个主要优势，因为后者在每次使用时都需要使用自定义查询方法。

<!-- 该页面的目录表由 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh 自动生成
根据 YAML 前置字段：slug, description, title。

如果您发现错误，请编辑页面本身的 YML 前置内容。
-->
| 页面 | 描述 |
|-----|-----|
| [Kafka](/engines/table-engines/integrations/kafka) | Kafka 引擎与 Apache Kafka 一起工作，可以让您发布或订阅数据流、组织容错存储并处理可用流。 |
| [Iceberg 表引擎](/engines/table-engines/integrations/iceberg) | 此引擎提供与 Amazon S3、Azure、HDFS 和本地存储表中的现有 Apache Iceberg 表的只读集成。 |
| [RabbitMQ 引擎](/engines/table-engines/integrations/rabbitmq) | 此引擎允许将 ClickHouse 与 RabbitMQ 集成。 |
| [EmbeddedRocksDB 引擎](/engines/table-engines/integrations/embedded-rocksdb) | 此引擎允许将 ClickHouse 与 RocksDB 集成。 |
| [Hive](/engines/table-engines/integrations/hive) | Hive 引擎允许您对 HDFS Hive 表执行 `SELECT` 查询。 |
| [Hudi 表引擎](/engines/table-engines/integrations/hudi) | 此引擎提供与 Amazon S3 中现有 Apache Hudi 表的只读集成。 |
| [Redis](/engines/table-engines/integrations/redis) | 此引擎允许将 ClickHouse 与 Redis 集成。 |
| [MySQL 引擎允许您对存储在远程 MySQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。](/engines/table-engines/integrations/mysql) | MySQL 表引擎文档 |
| [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql) | 创建一个 ClickHouse 表，并将 PostgreSQL 表的初始数据转储，并启动复制过程。 |
| [S3 表引擎](/engines/table-engines/integrations/s3) | 此引擎提供与 Amazon S3 生态系统的集成。类似于 HDFS 引擎，但提供 S3 特定功能。 |
| [HDFS](/engines/table-engines/integrations/hdfs) | 此引擎通过允许在 ClickHouse 上管理 HDFS 数据，提供与 Apache Hadoop 生态系统的集成。此引擎类似于文件和 URL 引擎，但提供与 Hadoop 相关的特性。 |
| [ExternalDistributed](/engines/table-engines/integrations/ExternalDistributed) | `ExternalDistributed` 引擎允许对存储在远程 MySQL 或 PostgreSQL 服务器上的数据执行 `SELECT` 查询。接受 MySQL 或 PostgreSQL 引擎作为参数，因此可以进行分片。 |
| [DeltaLake 表引擎](/engines/table-engines/integrations/deltalake) | 此引擎提供与 Amazon S3 中现有 Delta Lake 表的只读集成。 |
| [PostgreSQL 表引擎](/engines/table-engines/integrations/postgresql) | PostgreSQL 引擎允许对存储在远程 PostgreSQL 服务器上的数据执行 `SELECT` 和 `INSERT` 查询。 |
| [AzureBlobStorage 表引擎](/engines/table-engines/integrations/azureBlobStorage) | 此引擎提供与 Azure Blob Storage 生态系统的集成。 |
| [ODBC](/engines/table-engines/integrations/odbc) | 允许 ClickHouse 通过 ODBC 连接到外部数据库。 |
| [JDBC](/engines/table-engines/integrations/jdbc) | 允许 ClickHouse 通过 JDBC 连接到外部数据库。 |
| [NATS 引擎](/engines/table-engines/integrations/nats) | 此引擎允许将 ClickHouse 与 NATS 集成，以发布或订阅消息主题，并在新消息可用时处理它们。 |
| [SQLite](/engines/table-engines/integrations/sqlite) | 该引擎允许将数据导入和导出到 SQLite，并支持直接从 ClickHouse 对 SQLite 表的查询。 |
| [S3Queue 表引擎](/engines/table-engines/integrations/s3queue) | 此引擎提供与 Amazon S3 生态系统的集成，并允许流式导入。类似于 Kafka 和 RabbitMQ 引擎，但提供 S3 特定功能。 |
| [AzureQueue 表引擎](/engines/table-engines/integrations/azure-queue) | 此引擎提供与 Azure Blob Storage 生态系统的集成，允许流式数据导入。 |
| [TimeSeries 引擎](/engines/table-engines/special/time_series) | 存储时间序列的表引擎，即与时间戳和标签（或标签）关联的一组值。 |
| [MongoDB](/engines/table-engines/integrations/mongodb) | MongoDB 引擎是只读表引擎，允许从远程集合中读取数据。 |
