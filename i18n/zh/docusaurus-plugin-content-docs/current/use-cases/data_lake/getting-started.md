---
title: 'Lakehouse 表格式入门'
sidebar_label: '入门'
slug: /use-cases/data-lake/getting-started
sidebar_position: 1
pagination_prev: null
pagination_next: use-cases/data_lake/guides/querying-directly
description: '通过实践了解如何使用 ClickHouse 在开放表格式中查询、加速并回写数据。'
keywords: ['数据湖', 'lakehouse', '入门', 'iceberg', 'delta lake', 'hudi', 'paimon']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import iceberg_query_direct from '@site/static/images/datalake/iceberg-query-direct.png';
import iceberg_query_engine from '@site/static/images/datalake/iceberg-query-engine.png';
import iceberg_query from '@site/static/images/datalake/iceberg-query.png';
import clickhouse_query from '@site/static/images/datalake/clickhouse-query.png';

# 数据湖入门 \{#data-lake-getting-started\}

:::note[简述]
通过动手实践，学习如何查询数据湖表、使用 MergeTree 为其加速，并将结果写回 Iceberg。所有步骤均使用公共数据集，并同时适用于 Cloud 和 OSS。
:::

本指南中的截图来自 [ClickHouse Cloud](https://console.clickhouse.cloud) SQL 控制台。所有查询均适用于 Cloud 和自管理部署。

<VerticalStepper headerLevel="h2">
  ## 直接查询 Iceberg 数据 \{#query-directly\}

  最快的上手方式是使用 [`icebergS3()`](/sql-reference/table-functions/iceberg) 表函数——将其指向 S3 中的 Iceberg 表即可立即执行查询，无需任何配置。

  查看 Schema：

  ```sql
  DESCRIBE icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  ```

  运行查询：

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={iceberg_query_direct} alt="Iceberg 查询" />

  ClickHouse 直接从 S3 读取 Iceberg 元数据并自动推断 schema。同样的方法也适用于 [`deltaLake()`](/sql-reference/table-functions/deltalake)、[`hudi()`](/sql-reference/table-functions/hudi) 和 [`paimon()`](/sql-reference/table-functions/paimon)。

  **了解更多：** [直接查询开放表格式](/use-cases/data-lake/getting-started/querying-directly) 涵盖全部四种格式、用于分布式读取的集群变体以及存储后端选项 (S3、Azure、HDFS、本地) 。

  ## 创建持久化表引擎 \{#table-engine\}

  如需重复访问，请使用 Iceberg 表引擎创建一张表，这样每次无需传入路径。数据仍保留在 S3 中，不会产生任何数据冗余：

  ```sql
  CREATE TABLE hits_iceberg
      ENGINE = IcebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  ```

  现在像查询普通 ClickHouse 表一样对其进行查询：

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_iceberg
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={iceberg_query_engine} alt="Iceberg 查询" />

  该表引擎支持数据缓存、元数据缓存、模式演进和时间旅行。有关表引擎功能的详细信息，请参阅[直接查询](/use-cases/data-lake/getting-started/querying-directly)指南；有关完整的功能对比，请参阅[支持矩阵](/use-cases/data-lake/support-matrix)。

  ## 连接到目录 \{#connect-catalog\}

  大多数组织通过数据目录管理 Iceberg 表，以集中管理表元数据并实现数据发现。ClickHouse 支持使用 [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 数据库引擎连接到您的目录，将所有目录表作为 ClickHouse 数据库对外暴露。这是扩展性更强的方案——每当新的 Iceberg 表被创建时，无需任何额外操作即可在 ClickHouse 中直接访问。

  以下是连接到 [AWS Glue](/use-cases/data-lake/glue-catalog) 的示例：

  ```sql
  CREATE DATABASE my_lake
  ENGINE = DataLakeCatalog
  SETTINGS
      catalog_type = 'glue',
      region = '<your-region>',
      aws_access_key_id = '<your-access-key>',
      aws_secret_access_key = '<your-secret-key>'
  ```

  每种目录类型都需要各自的连接设置——请参阅 [Catalogs 指南](/use-cases/data-lake/reference)，获取支持的目录及其配置选项的完整列表。

  浏览表并进行查询：

  ```sql
  SHOW TABLES FROM my_lake;
  ```

  ```sql
  SELECT count(*) FROM my_lake.`<database>.<table>`
  ```

  :::note
  `<database>.<table>` 两侧需要加反引号，因为 ClickHouse 原生不支持多个命名空间。
  :::

  **了解更多：** [连接到数据目录](/use-cases/data-lake/getting-started/connecting-catalogs) 介绍了包含 Delta 和 Iceberg 示例的完整 Unity Catalog 配置流程。

  ## 执行查询 \{#issue-query\}

  无论您使用上述哪种方法——表函数、表引擎还是目录——相同的 ClickHouse SQL 语法均适用：

  ```sql
  -- Table function
  SELECT url, count() AS cnt
  FROM icebergS3('https://datasets-documentation.s3.amazonaws.com/lake_formats/iceberg/')
  GROUP BY url ORDER BY cnt DESC LIMIT 5

  -- Table engine
  SELECT url, count() AS cnt
  FROM hits_iceberg
  GROUP BY url ORDER BY cnt DESC LIMIT 5

  -- Catalog
  SELECT url, count() AS cnt
  FROM my_lake.`<database>.<table>`
  GROUP BY url ORDER BY cnt DESC LIMIT 5
  ```

  查询语法完全相同——仅 `FROM` 子句有所变化。无论数据源如何，所有 ClickHouse SQL 函数、JOIN 操作和聚合运算均以相同方式运行。

  ## 将子集加载到 ClickHouse \{#load-data\}

  直接查询 Iceberg 固然方便，但性能受限于网络吞吐量和文件布局。对于分析型工作负载，建议将数据加载到原生 MergeTree 表中。

  首先，对 Iceberg 表运行过滤查询以获取基准数据：

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_iceberg
  WHERE counterid = 38
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  此查询会扫描 S3 中的完整数据集，因为 Iceberg 无法识别 `counterid` 过滤条件——预计需要数秒钟。

  <Image img={iceberg_query} alt="Iceberg 查询" />

  现在创建一个 MergeTree 表并加载数据：

  ```sql
  CREATE TABLE hits_clickhouse
  (
      url String,
      eventtime DateTime,
      counterid UInt32
  )
  ENGINE = MergeTree()
  ORDER BY (counterid, eventtime);
  ```

  ```sql
  INSERT INTO hits_clickhouse
  SELECT url, eventtime, counterid
  FROM hits_iceberg
  ```

  对 MergeTree 表重新运行相同的查询：

  ```sql
  SELECT
      url,
      count() AS cnt
  FROM hits_clickhouse
  WHERE counterid = 38
  GROUP BY url
  ORDER BY cnt DESC
  LIMIT 5
  ```

  <Image img={clickhouse_query} alt="ClickHouse 查询" />

  由于 `counterid` 是 `ORDER BY` 键中的第一列，ClickHouse 的稀疏主索引可直接跳转至相关粒度——仅读取 `counterid = 38` 对应的行，而无需扫描全部 1 亿行。这将带来显著的性能提升。

  [加速分析](/use-cases/data-lake/getting-started/accelerating-analytics)指南通过 `LowCardinality` 类型、全文索引和优化排序键进一步深入探讨，在包含 2.83 亿行的数据集上实现了 **约 40 倍的性能提升**。

  **了解更多：** [使用 MergeTree 加速分析](/use-cases/data-lake/getting-started/accelerating-analytics) 涵盖了 Schema 优化、全文索引以及完整的优化前后性能对比。

  ## 写回 Iceberg \{#write-back\}

  ClickHouse 还可以将数据写回 Iceberg 表，从而支持反向 ETL 工作流——将聚合结果或数据子集发布，以供其他工具 (Spark、Trino、DuckDB 等) 消费。

  创建用于输出的 Iceberg 表：

  ```sql
  CREATE TABLE output_iceberg
  (
      url String,
      cnt UInt64
  )
  ENGINE = IcebergS3('https://your-bucket.s3.amazonaws.com/output/', 'access_key', 'secret_key')
  ```

  写入聚合结果：

  ```sql
  SET allow_experimental_insert_into_iceberg = 1;

  INSERT INTO output_iceberg
  SELECT
      url,
      count() AS cnt
  FROM hits_clickhouse
  GROUP BY url
  ORDER BY cnt DESC
  ```

  生成的 Iceberg 表可被任何兼容 Iceberg 的引擎读取。

  **了解更多：** [将数据写入开放表格式](/use-cases/data-lake/getting-started/writing-data) 介绍了如何使用 UK Price Paid 数据集写入原始数据和聚合结果，包括将 ClickHouse 类型映射到 Iceberg 时的 schema 设计注意事项。
</VerticalStepper>

## 后续步骤 \{#next-steps\}

现在您已经了解了完整的工作流程，可以进一步深入了解各个方面：

* [直接查询](/use-cases/data-lake/getting-started/querying-directly) — 四种格式、集群变体、表引擎和缓存
* [连接到目录](/use-cases/data-lake/getting-started/connecting-catalogs) — 使用 Delta 和 Iceberg 的完整 Unity Catalog 操作指南
* [加速分析](/use-cases/data-lake/getting-started/accelerating-analytics) — Schema 优化、索引、约 40 倍提速演示
* [写入数据湖](/use-cases/data-lake/getting-started/writing-data) — 原始写入、聚合写入、类型映射
* [支持矩阵](/use-cases/data-lake/support-matrix) — 不同格式和存储后端的功能对比