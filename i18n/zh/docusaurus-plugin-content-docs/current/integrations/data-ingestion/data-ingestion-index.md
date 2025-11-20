---
slug: /integrations/data-ingestion-overview
keywords: [ 'Airbyte', 'Apache Spark', 'Spark', 'Azure Synapse', 'Amazon Glue', 'Apache Beam', 'dbt', 'Fivetran', 'NiFi', 'dlt', 'Vector' ]
title: '数据摄取'
description: '数据摄取部分的概览页'
doc_type: 'landing-page'
---

# 数据摄取

ClickHouse 集成了多种数据集成与转换方案。
有关更多信息，请参阅以下页面：

| Data Ingestion Tool                                              | Description                                                                                                                                                                                                                           |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Airbyte](/integrations/airbyte)                                 | 一个开源的数据集成平台。它支持创建 ELT 数据管道，并内置了 140 多个开箱即用的连接器。                                                                                   |
| [Apache Spark](/integrations/apache-spark)                       | 一个多语言引擎，可在单机或集群上执行数据工程、数据科学和机器学习任务。                                                                                                        |
| [Apache Flink](https://github.com/ClickHouse/flink-connector-clickhouse)                       | 通过 Flink 的 DataStream API 将实时数据写入并处理到 ClickHouse 中，支持批量写入。                                                                                                        |
| [Amazon Glue](/integrations/glue)                                | 由 Amazon Web Services (AWS) 提供的全托管、无服务器数据集成服务，可简化为分析、机器学习和应用开发进行数据发现、准备和转换的过程。     |
| [Azure Synapse](/integrations/azure-synapse)                     | 由 Microsoft Azure 提供的全托管云端分析服务，将大数据与数据仓库相结合，利用 SQL、Apache Spark 和数据管道，在大规模场景下简化数据集成、转换和分析。 |
| [Azure Data Factory](/integrations/azure-data-factory)           | 一项云端数据集成服务，使你能够在大规模环境下创建、调度和编排数据工作流。 |
| [Apache Beam](/integrations/apache-beam)                         | 一个开源的统一编程模型，使开发者能够定义并执行批处理和流式（持续）数据处理管道。                                                                                 |
| [BladePipe](/integrations/bladepipe)                         | 一款端到端的实时数据集成工具，具备亚秒级延迟，可在各个平台之间实现无缝数据流转。                                                                                |
| [dbt](/integrations/dbt)                                         | 使分析工程师可以仅通过编写 select 语句，在其数据仓库中完成数据转换。                                                                                                                                |
| [dlt](/integrations/data-ingestion/etl-tools/dlt-and-clickhouse) | 一个开源库，你可以将其添加到 Python 脚本中，将来自各种（且通常比较混乱的）数据源的数据加载到结构良好且实时更新的数据集中。                                                                            |
| [Fivetran](/integrations/fivetran)                               | 一个自动化的数据传输平台，用于将数据从你的云数据平台中迁出、迁入以及在不同平台之间进行传输。                                                                                                                                    |
| [NiFi](/integrations/nifi)                                       | 一款开源的工作流管理软件，用于自动化软件系统之间的数据流转。                                                                                                                                  |
| [Vector](/integrations/vector)                                   | 一条高性能的可观测性数据管道，使组织能够掌控其可观测性数据。                                                                                                                        |