---
description: '使用 ClickHouse 对 Apache Iceberg、Delta Lake、Apache Hudi 和 Apache Paimon 等开放表格式中的数据进行查询、加速和分析。'
pagination_prev: null
pagination_next: null
slug: /use-cases/data-lake
title: '数据湖仓'
keywords: ['data lake', 'lakehouse', 'iceberg', 'delta lake', 'hudi', 'paimon', 'glue', 'unity', 'rest', 'OneLake']
doc_type: 'landing-page'
---

ClickHouse 可与开放的 lakehouse 表格式集成，包括 [Apache Iceberg](/engines/table-engines/integrations/iceberg)、[Delta Lake](/engines/table-engines/integrations/deltalake)、[Apache Hudi](/engines/table-engines/integrations/hudi) 和 [Apache Paimon](/sql-reference/table-functions/paimon)。这使用户能够将 ClickHouse 连接到对象存储中已以这些格式存储的数据，将 ClickHouse 的分析能力与其现有的数据湖基础设施相结合。

## 为什么要将 ClickHouse 与开放表格式结合使用？ \{#why-clickhouse-uses-lake-formats\}

### 就地查询现有数据 \{#querying-data-in-place\}

ClickHouse 可以直接在对象存储中查询 open table formats，而无需复制数据。已经将 Iceberg、Delta Lake、Hudi 或 Paimon 作为标准表格式的组织，可以将 ClickHouse 指向现有表，并立即使用其 SQL 方言、分析函数以及高效的原生 Parquet 读取器。同时，像 [clickhouse-local](/operations/utilities/clickhouse-local) 和 [chDB](/chdb) 这样的工具，使得在远程存储中针对 70 多种文件格式进行探索式、临时性分析成为可能，允许用户在无需搭建任何基础设施的情况下，以交互方式探索湖仓（lakehouse）数据集。

用户可以通过两种方式实现这一点：要么使用[表函数和表引擎](/use-cases/data-lake/getting-started/querying-directly)进行直接读取，要么[连接到数据目录](/use-cases/data-lake/getting-started/connecting-catalogs)。

### 使用 ClickHouse 处理实时分析型工作负载 \{#real-time-with-clickhouse\}

对于需要高并发和低延迟响应的工作负载，用户可以将开放表格式的数据加载到 ClickHouse 的 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 引擎中。这样可以在源自数据湖的数据之上提供实时分析层，以支持仪表盘、运维报表，以及其他对延迟敏感并能够利用 MergeTree 列式存储和索引能力的工作负载。

参阅入门指南：[使用 MergeTree 加速分析](/use-cases/data-lake/getting-started/accelerating-analytics)。

## 功能 \{#capabilities\}

### 直接读取数据 \{#read-data-directly\}

ClickHouse 提供了[表函数](/sql-reference/table-functions)和[引擎](/engines/table-engines/integrations)，用于在对象存储上直接读取开放表格式。例如 [`iceberg()`](/sql-reference/table-functions/iceberg)、[`deltaLake()`](/sql-reference/table-functions/deltalake)、[`hudi()`](/sql-reference/table-functions/hudi) 和 [`paimon()`](/sql-reference/table-functions/paimon) 等函数，允许用户在无需任何预先配置的情况下，在 SQL 语句中对数据湖格式的表进行查询。这些函数针对大多数常见的对象存储服务（如 S3、Azure Blob Storage 和 GCS）都提供了对应版本。它们还拥有等价的表引擎，可用于在 ClickHouse 中创建引用底层数据湖格式对象存储的表，从而使查询更加便捷。

请参阅我们的入门指南，了解如何通过[直接查询](/use-cases/data-lake/getting-started/querying-directly)或[连接到数据目录](/use-cases/data-lake/getting-started/connecting-catalogs)的方式进行使用。

### 将 catalog 暴露为数据库 \{#expose-catalogs-as-databases\}

使用 [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 数据库引擎，用户可以将 ClickHouse 连接到外部 catalog，并将其暴露为一个数据库。注册在 catalog 中的表会在 ClickHouse 中显示为表，从而可以透明地使用 ClickHouse 完整的 SQL 语法和分析函数。也就是说，用户可以像操作原生 ClickHouse 表一样，对由 catalog 管理的表进行查询、关联和聚合，并受益于 ClickHouse 的查询优化、并行执行和读取能力。

当前支持的 catalog 包括：

| Catalog | 指南 |
|---------|-------|
| AWS Glue | [Glue Catalog 指南](/use-cases/data-lake/glue-catalog) |
| Databricks Unity Catalog | [Unity Catalog 指南](/use-cases/data-lake/unity-catalog) |
| Iceberg REST Catalog | [REST Catalog 指南](/use-cases/data-lake/rest-catalog) |
| Lakekeeper | [Lakekeeper Catalog 指南](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie | [Nessie Catalog 指南](/use-cases/data-lake/nessie-catalog) |
| Microsoft OneLake | [OneLake Catalog 指南](/use-cases/data-lake/onelake-catalog) |

请参阅[连接到 catalog](/use-cases/data-lake/getting-started/connecting-catalogs)的入门指南。

### 写回开放表格式 \{#write-back-to-lakehouse-formats\}

ClickHouse 支持将数据写回开放表格式，这在以下场景中非常重要：

- **从实时到长期存储** - 数据先进入 ClickHouse，作为实时分析层进行处理，用户需要将结果导出到 Iceberg 或其他格式中，以实现持久且具成本效益的长期存储。
- **反向 ETL** - 用户在 ClickHouse 中使用 materialized view 或定时查询执行数据转换，并希望将结果持久化为开放表格式，供数据生态系统中的其他工具使用。

请参阅 [写入数据湖](/use-cases/data-lake/getting-started/writing-data) 入门指南。

## 后续步骤 \{#next-steps\}

准备好试用了吗？[入门指南](/use-cases/data-lake/getting-started) 将逐步演示如何直接查询开放表格式、连接到 catalog、将数据加载到 MergeTree 以实现快速分析，以及将结果写回——这一切都在一个端到端的工作流中完成。