---
title: 'ClickHouse 是否支持联邦查询？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/federated
description: 'ClickHouse 支持多种联邦和混合查询'
doc_type: 'reference'
keywords: ['federated', 'hybrid', 'postgres', 'mysql', 'sqlite', 'odbc', 'jdbc']
---

# ClickHouse 是否支持联邦查询？

在分析型数据库中，ClickHouse 对联邦查询和混合查询执行提供了最全面的支持。

它支持查询外部数据库：

- PostgreSQL
- MySQL
- MongoDB
- Redis
- 任何 ODBC 数据源
- 任何 JDBC 数据源
- 任何 Arrow Flight 数据源
- 流式数据源，例如 Kafka 和 RabbitMQ
- 数据湖，例如 Iceberg、Delta Lake、Apache Hudi、Apache Paimon
- 位于共享存储上的外部文件，例如 AWS S3、GCS、Minio、Cloudflare R2、Azure Blob Storage、Alicloud OSS、Tencent COS，以及本地存储中的文件，并支持多种数据格式

ClickHouse 可以在单个查询中对多个不同的数据源进行关联（JOIN）。它还提供混合查询执行选项，将本地资源与将部分查询下推到远程机器相结合。

值得一提的是，ClickHouse 可以在不移动数据的情况下加速对外部数据源的查询。例如，同样的聚合查询如果在 ClickHouse 上对 MySQL 中的数据进行处理，通常会执行得更快，因为数据传输的开销会被更高效的查询引擎所抵消。