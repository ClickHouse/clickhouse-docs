---
description: '将 ClickHouse 连接到数据湖目录（包括 AWS Glue、Unity、REST、Lakekeeper、Nessie 和 OneLake）的参考指南。'
pagination_prev: null
pagination_next: null
sidebar_position: 2
slug: /use-cases/data-lake/reference
title: '目录使用指南'
keywords: ['data lake', 'lakehouse', 'catalog', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'landing-page'
---

ClickHouse 通过 [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 数据库引擎与一系列数据湖目录集成。以下指南介绍如何将 ClickHouse 连接到每个受支持的目录，包括配置、身份验证以及查询示例。

| Catalog | Description |
|---------|-------------|
| [AWS Glue](/use-cases/data-lake/glue-catalog) | 查询存储在 S3 且在 AWS Glue Data Catalog 中注册的 Iceberg 表。 |
| [Databricks Unity Catalog](/use-cases/data-lake/unity-catalog) | 连接到 Databricks Unity Catalog 以使用 Delta Lake 和 Iceberg 表。 |
| [Iceberg REST Catalog](/use-cases/data-lake/rest-catalog) | 使用任何实现 Iceberg REST 规范的目录，例如 Tabular。 |
| [Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) | 连接到 Lakekeeper Catalog 以使用 Iceberg 表。 |
| [Project Nessie](/use-cases/data-lake/nessie-catalog) | 使用具有类似 Git 的数据版本控制功能的 Nessie Catalog 查询 Iceberg 表。 |
| [Microsoft OneLake](/use-cases/data-lake/onelake-catalog) | 查询 Microsoft Fabric OneLake 中的 Iceberg 表。 |