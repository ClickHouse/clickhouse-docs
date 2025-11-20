---
title: 'ClickHouse 是否支持联邦查询？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/federated
description: 'ClickHouse 支持多种联邦与混合查询'
doc_type: 'reference'
keywords: ['federated', 'hybrid', 'postgres', 'mysql', 'sqlite', 'odbc', 'jdbc']
---

# ClickHouse 是否支持联邦查询?

ClickHouse 在分析型数据库中对联邦查询和混合查询执行提供了最全面的支持。

它支持查询以下外部数据库:

- PostgreSQL
- MySQL
- MongoDB
- Redis
- 任何 ODBC 数据源
- 任何 JDBC 数据源
- 任何 Arrow Flight 数据源
- 流式数据源,如 Kafka 和 RabbitMQ
- 数据湖,如 Iceberg、Delta Lake、Apache Hudi、Apache Paimon
- 位于共享存储上的外部文件,如 AWS S3、GCS、Minio、Cloudflare R2、Azure Blob Storage、阿里云 OSS、腾讯云 COS 以及本地存储,并支持多种数据格式

ClickHouse 可以在单个查询中联接多个不同的数据源。它还提供混合查询执行选项,结合本地资源的同时将部分查询卸载到远程机器。

值得注意的是,ClickHouse 可以在不移动数据的情况下加速外部数据源的查询。例如,对 MySQL 执行的聚合查询如果在 ClickHouse 上运行会处理得更快,因为数据移动的开销被更快的查询引擎所抵消。