---
'sidebar_label': '模板'
'slug': '/integrations/google-dataflow/templates'
'sidebar_position': 3
'description': '用户可以使用 Google Dataflow 模板将数据摄取到 ClickHouse 中'
'title': 'Google Dataflow 模板'
'doc_type': 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow 模板

<ClickHouseSupportedBadge/>

Google Dataflow 模板提供了一种便利的方法来执行预构建的、现成的数据管道，无需编写自定义代码。这些模板旨在简化常见的数据处理任务，并使用 [Apache Beam](https://beam.apache.org/) 构建，利用 `ClickHouseIO` 等连接器与 ClickHouse 数据库实现无缝集成。通过在 Google Dataflow 上运行这些模板，您可以以最小的精力实现高度可扩展的分布式数据处理。

## 为什么使用 Dataflow 模板？ {#why-use-dataflow-templates}

- **易用性**：模板通过提供针对特定用例预配置的管道，消除了编码的需要。
- **可扩展性**：Dataflow 确保您的管道有效地扩展，能够处理大量数据的分布式处理。
- **成本效率**：只需为实际使用的资源付费，并能够优化管道执行成本。

## 如何运行 Dataflow 模板 {#how-to-run-dataflow-templates}

截至今日，ClickHouse 官方模板可通过 Google Cloud 控制台、CLI 或 Dataflow REST API 获得。
有关详细的逐步说明，请参阅 [Google Dataflow 从模板运行管道指南](https://cloud.google.com/dataflow/docs/templates/provided-templates)。

## ClickHouse 模板列表 {#list-of-clickhouse-templates}
* [BigQuery 到 ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS 到 ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3)（即将推出！）
* [Pub Sub 到 ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4)（即将推出！）
