---
slug: /integrations/data-ingestion-overview
keywords: [ 'Airbyte', 'Apache Spark', 'Spark', 'Azure Synapse', 'Amazon Glue', 'Apache Beam', 'dbt', 'Fivetran', 'NiFi', 'dlt', 'Vector' ]
title: '数据导入'
description: '数据导入章节的入口页面'
doc_type: 'landing-page'
---

# 数据导入

ClickHouse 集成了多种用于数据集成和转换的解决方案。
如需了解更多信息，请参阅以下页面：

| Data Ingestion Tool                                              | Description                                                                                                                                                                                                                           |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Airbyte](/integrations/airbyte)                                 | 一个开源的数据集成平台。它支持创建 ELT 数据管道，并内置了超过 140 个开箱即用的连接器。                                                                                   |
| [Apache Spark](/integrations/apache-spark)                       | 一个多语言引擎，用于在单机或集群上执行数据工程、数据科学和机器学习工作负载。                                                                                                        |
| [Apache Flink](https://github.com/ClickHouse/flink-connector-clickhouse)                       | 通过 Flink 的 DataStream API 将数据实时导入 ClickHouse 并进行处理，支持批量写入。                                                                                                        |
| [Amazon Glue](/integrations/glue)                                | 由 Amazon Web Services (AWS) 提供的全托管、无服务器数据集成服务，简化了为分析、机器学习和应用开发执行数据发现、准备和转换的过程。     |
| [Azure Synapse](/integrations/azure-synapse)                     | 由 Microsoft Azure 提供的全托管云分析服务，将大数据与数据仓库相结合，借助 SQL、Apache Spark 和数据管道，在大规模场景下简化数据集成、转换和分析。 |
| [Azure Data Factory](/integrations/azure-data-factory)           | 一项基于云的数据集成服务，使你能够在大规模下创建、调度和编排数据工作流。 |
| [Apache Beam](/integrations/apache-beam)                         | 一个开源的统一编程模型，使开发者能够定义并执行批处理和流式（持续）数据处理管道。                                                                                 |
| [BladePipe](/integrations/bladepipe)                         | 一款端到端实时数据集成工具，提供亚秒级延迟，实现跨平台的无缝数据流动。                                                                                |
| [dbt](/integrations/dbt)                                         | 让分析工程师只需编写 `select` 语句即可在其数据仓库中完成数据转换。                                                                                                                                |
| [dlt](/integrations/data-ingestion/etl-tools/dlt-and-clickhouse) | 一个开源库，你可以将其添加到 Python 脚本中，从各种且通常较为混乱的数据源中加载数据到结构良好、实时更新的数据集。                                                                            |
| [Fivetran](/integrations/fivetran)                               | 一个自动化数据传输平台，用于在你的云数据平台之间、之上和之中移动数据。                                                                                                                                    |
| [NiFi](/integrations/nifi)                                       | 一款开源工作流管理软件，旨在实现软件系统之间数据流的自动化。                                                                                                                                  |
| [Vector](/integrations/vector)                                   | 一款高性能的可观测性数据管道，使组织能够掌控其可观测性数据。                                                                                                                        |