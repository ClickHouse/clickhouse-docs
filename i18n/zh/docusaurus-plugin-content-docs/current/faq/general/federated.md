---
title: 'ClickHouse 是否支持联邦查询？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/federated
description: 'ClickHouse 广泛支持联邦和混合查询'
doc_type: 'reference'
keywords: ['federated', 'hybrid', 'postgres', 'mysql', 'sqlite', 'odbc', 'jdbc']
---

# ClickHouse 是否支持联邦查询？ \\{#does-clickhouse-support-federated-queries\\}

在分析型数据库中，ClickHouse 对联邦查询和混合查询执行的支持最为全面。

它支持查询外部数据库：

* PostgreSQL
* MySQL
* MongoDB
* Redis
* 任何 ODBC 数据源
* 任何 JDBC 数据源
* 任何 Arrow Flight 数据源
* 流式数据源，例如 Kafka 和 RabbitMQ
* 数据湖，例如 Iceberg、Delta Lake、Apache Hudi、Apache Paimon
* 位于共享存储上的外部文件，例如 AWS S3、GCS、Minio、Cloudflare R2、Azure Blob Storage、Alicloud OSS、Tencent COS，以及本地存储，支持多种数据格式

ClickHouse 可以在单个查询中对多个不同的数据源进行 join。它还提供混合查询执行选项，既利用本地资源，又将部分查询卸载到远程机器上。

值得一提的是，ClickHouse 能在不移动数据的情况下加速对外部数据源的查询。例如，对 MySQL 的聚合查询如果在 ClickHouse 中执行，会运行得更快，因为数据移动的开销会被更快的查询引擎所抵消。