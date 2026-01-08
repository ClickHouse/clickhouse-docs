---
slug: /integrations/data-ingestion-overview
keywords: [ 'Airbyte', 'Apache Spark', 'Spark', 'Azure Synapse', 'Amazon Glue', 'Apache Beam', 'dbt', 'Fivetran', 'NiFi', 'dlt', 'Vector' ]
title: '数据摄取'
description: '数据摄取部分的概览页'
doc_type: 'landing-page'
---

# 数据摄取 {#data-ingestion}

ClickHouse 集成了多种用于数据集成和转换的解决方案。
如需更多信息，请参阅以下页面：

| 数据摄取工具                                                     | 描述                                                                                                                                                                                                                                  |
|------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Airbyte](/integrations/airbyte)                                 | 一个开源的数据集成平台。支持创建 ELT 数据管道，并内置 140 多个开箱即用的连接器。                                                                                                                |
| [Apache Spark](/integrations/apache-spark)                       | 一个多语言引擎，可在单机或集群上执行数据工程、数据科学和机器学习任务。                                                                                                                         |
| [Databricks](/integrations/data-ingestion/apache-spark/databricks) | 一体化分析平台，基于 Apache Spark 构建，为数据工程、数据科学和机器学习工作负载提供协作环境，并支持与 ClickHouse 集成。 |
| [Apache Flink](https://github.com/ClickHouse/flink-connector-clickhouse)                       | 通过 Flink 的 DataStream API 实现向 ClickHouse 的实时数据摄取和处理，并支持批量写入。                                                                                                           |
| [Amazon Glue](/integrations/glue)                                | 由 Amazon Web Services (AWS) 提供的全托管、无服务器数据集成服务，可简化为分析、机器学习和应用程序开发进行数据发现、准备和转换的过程。                                                          |
| [Azure Synapse](/integrations/azure-synapse)                     | 由 Microsoft Azure 提供的全托管云端分析服务，将大数据与数据仓库相结合，通过 SQL、Apache Spark 和数据管道，简化大规模的数据集成、转换和分析。                                                   |
| [Azure Data Factory](/integrations/azure-data-factory)           | 一项基于云的数据集成服务，使您能够在大规模环境中创建、调度和编排数据工作流。 |
| [Apache Beam](/integrations/apache-beam)                         | 一个开源的统一编程模型，使开发者可以定义并执行批处理和流式（持续）数据处理管道。                                                                                                               |
| [BladePipe](/integrations/bladepipe)                         | 一款端到端实时数据集成工具，具备亚秒级延迟，可在各个平台之间实现无缝数据流转。                                                                                                                  |
| [dbt](/integrations/dbt)                                         | 使分析工程师能够仅通过编写 select 语句来对数据仓库中的数据进行转换。                                                                                                                            |
| [dlt](/integrations/data-ingestion/etl-tools/dlt-and-clickhouse) | 一个开源库，您可以将其添加到 Python 脚本中，将来自各种、且往往较为杂乱的数据源的数据加载为结构良好、实时更新的数据集。                                                                           |
| [Fivetran](/integrations/fivetran)                               | 一个自动化数据移动平台，用于在云数据平台之间以及进出云数据平台移动数据。                                                                                                                        |
| [NiFi](/integrations/nifi)                                       | 一款开源工作流管理软件，用于自动化软件系统之间的数据流。                                                                                                                                       |
| [Vector](/integrations/vector)                                   | 一条高性能的可观测性数据管道，使组织能够掌控其可观测性数据。                                                                                                                                    |