---
description: '数据湖文档'
sidebar_label: '数据湖'
sidebar_position: 2
slug: /sql-reference/datalakes
title: '数据湖'
doc_type: 'reference'
---

在本节中，我们将概览 ClickHouse 对数据湖的支持。
ClickHouse 支持多种主流的表格式和数据目录，包括 Iceberg、Delta Lake、Hudi、AWS Glue、REST Catalog、Unity Catalog 和 Microsoft OneLake。

# 开放表格式 \\{#open-table-formats\\}

## Iceberg \\{#iceberg\\}

请参阅 [iceberg](https://clickhouse.com/docs/sql-reference/table-functions/iceberg)，它支持从 Amazon S3 和 S3 兼容服务、HDFS、Azure 以及本地文件系统读取数据。[icebergCluster](https://clickhouse.com/docs/sql-reference/table-functions/icebergCluster) 是 `iceberg` 函数的分布式版本。

## Delta Lake \\{#delta-lake\\}

请参阅 [deltaLake](https://clickhouse.com/docs/sql-reference/table-functions/deltalake)，该函数支持从 Amazon S3、兼容 S3 的服务、Azure 以及本地文件系统读取数据。[deltaLakeCluster](https://clickhouse.com/docs/sql-reference/table-functions/deltalakeCluster) 是 `deltaLake` 函数的分布式变体。

## Hudi \\{#hudi\\}

请参阅 [hudi](https://clickhouse.com/docs/sql-reference/table-functions/hudi)，它支持从 Amazon S3 和 S3 兼容服务中读取数据。[hudiCluster](https://clickhouse.com/docs/sql-reference/table-functions/hudiCluster) 是 `hudi` 函数的分布式版本。

# 数据目录 \\{#data-catalogs\\}

## AWS Glue \\{#aws-glue\\}

可以将 AWS Glue Data Catalog 与 Iceberg 表配合使用。你可以将其与 `iceberg` 表引擎，或与 [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) 数据库引擎一起使用。

## Iceberg REST Catalog \\{#iceberg-rest-catalog\\}

Iceberg REST Catalog 可与 Iceberg 表配合使用。可以将其与 `iceberg` 表引擎或 [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) 数据库引擎搭配使用。

## Unity Catalog \\{#unity-catalog\\}

Unity Catalog 可用于 Delta Lake 和 Iceberg 表。可以将其与 `iceberg` 或 `deltaLake` 表引擎配合使用，或与 [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) 数据库引擎配合使用。

## Microsoft OneLake \\{#microsoft-onelake\\}

Microsoft OneLake 可同时与 Delta Lake 和 Iceberg 表配合使用。可以将其与 [DataLakeCatalog](https://clickhouse.com/docs/engines/database-engines/datalakecatalog) 数据库引擎搭配使用。