---
slug: /integrations/data-ingestion-overview
keywords: [ 'Airbyte', 'Apache Spark', 'Spark', 'Azure Synapse', 'Amazon Glue', 'Apache Beam', 'dbt', 'Fivetran', 'NiFi', 'dlt', 'Vector' ]
title: '数据摄取'
description: '数据摄取章节的概览页面'
doc_type: 'landing-page'
---

# 数据摄取

ClickHouse 集成了多种用于数据集成和转换的解决方案。
有关更多信息，请参阅以下页面：

| 数据摄取工具                                              | 描述                                                                                                                                                                                                                           |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Airbyte](/integrations/airbyte)                                 | 一个开源的数据集成平台。它支持构建 ELT 数据管道，并内置了超过 140 个开箱即用的连接器。                                                                                   |
| [Apache Spark](/integrations/apache-spark)                       | 一个多语言引擎，可在单机或集群上执行数据工程、数据科学和机器学习任务。                                                                                                        |
| [Apache Flink](https://github.com/ClickHouse/flink-connector-clickhouse)                       | 通过 Flink 的 DataStream API 将实时数据写入并处理到 ClickHouse，支持批量写入。                                                                                                        |
| [Amazon Glue](/integrations/glue)                                | 由 Amazon Web Services (AWS) 提供的全托管、无服务器数据集成服务，简化了为分析、机器学习和应用程序开发而进行的数据发现、准备和转换过程。     |
| [Azure Synapse](/integrations/azure-synapse)                     | 由 Microsoft Azure 提供的全托管、云端分析服务，将大数据与数据仓库相结合，借助 SQL、Apache Spark 和数据管道，在大规模场景下简化数据集成、转换和分析。 |
| [Azure Data Factory](/integrations/azure-data-factory)           | 一项基于云的数据集成服务，可帮助你在大规模场景下创建、调度和编排数据工作流。 |
| [Apache Beam](/integrations/apache-beam)                         | 一个开源的统一编程模型，使开发者能够定义并执行批处理和流式（连续）数据处理管道。                                                                                 |
| [BladePipe](/integrations/bladepipe)                         | 一款端到端的实时数据集成工具，具备亚秒级延迟，促进跨平台的无缝数据流动。                                                                                |
| [dbt](/integrations/dbt)                                         | 使分析工程师能够仅通过编写 `SELECT` 语句来对数据仓库中的数据进行转换。                                                                                                                                |
| [dlt](/integrations/data-ingestion/etl-tools/dlt-and-clickhouse) | 一个开源库，你可以将其添加到 Python 脚本中，将来自各种、往往杂乱的数据源的数据加载到结构良好的实时数据集中。                                                                            |
| [Fivetran](/integrations/fivetran)                               | 一个自动化数据移动平台，可将数据从云数据平台中导出、导入及在不同云数据平台之间传输。                                                                                                                                    |
| [NiFi](/integrations/nifi)                                       | 一款开源的工作流管理软件，旨在实现软件系统之间的数据流自动化。                                                                                                                                  |
| [Vector](/integrations/vector)                                   | 一款高性能的可观测性数据管道解决方案，使组织能够掌控其可观测性数据。                                                                                                                        |