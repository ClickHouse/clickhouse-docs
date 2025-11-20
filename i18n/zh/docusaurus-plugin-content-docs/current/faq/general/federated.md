---
title: 'ClickHouse 支持联邦查询吗？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/federated
description: 'ClickHouse 提供对多种联邦与混合查询场景的支持'
doc_type: 'reference'
keywords: ['federated', 'hybrid', 'postgres', 'mysql', 'sqlite', 'odbc', 'jdbc']
---

# ClickHouse 是否支持联邦查询？

在各类分析型数据库中，ClickHouse 对联邦查询和混合查询执行提供了最全面的支持。

它支持查询外部数据库和数据源：

- PostgreSQL
- MySQL
- MongoDB
- Redis
- 任意 ODBC 数据源
- 任意 JDBC 数据源
- 任意 Arrow Flight 数据源
- 流式数据源，例如 Kafka 和 RabbitMQ
- 数据湖，例如 Iceberg、Delta Lake、Apache Hudi、Apache Paimon
- 位于共享存储上的外部文件，例如 AWS S3、GCS、Minio、Cloudflare R2、Azure Blob Storage、阿里云 OSS、腾讯云 COS，以及本地存储，支持多种数据格式

ClickHouse 可以在单个查询中联接多个不同的数据源。它还提供混合查询执行选项，将本地资源与把部分查询下推到远程机器相结合。

更有意思的是，ClickHouse 可以在不迁移数据的情况下加速对外部数据源的查询。例如，从 MySQL 发起的聚合查询如果在 ClickHouse 上执行，通常会更快完成，因为数据移动的开销会被更高效的查询引擎所抵消。