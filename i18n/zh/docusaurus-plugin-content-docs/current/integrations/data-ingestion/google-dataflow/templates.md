---
'sidebar_label': '模板'
'slug': '/integrations/google-dataflow/templates'
'sidebar_position': 3
'description': '用户可以使用 Google Dataflow 模板将数据摄取到 ClickHouse 中'
'title': 'Google Dataflow 模板'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Google Dataflow 模板

<ClickHouseSupportedBadge/>

Google Dataflow 模板提供了一种便捷的方式，可以执行预构建、即用型的数据管道，而无需编写自定义代码。这些模板旨在简化常见的数据处理任务，并使用 [Apache Beam](https://beam.apache.org/) 构建，利用 `ClickHouseIO` 等连接器与 ClickHouse 数据库无缝集成。通过在 Google Dataflow 上运行这些模板，您可以以最小的努力实现高度可扩展的分布式数据处理。

## 为什么使用 Dataflow 模板？ {#why-use-dataflow-templates}

- **使用方便**：模板通过提供针对特定用例的预配置管道，消除了编码的需要。
- **可扩展性**：Dataflow 确保您的管道能够高效扩展，可以处理大量数据，支持分布式处理。
- **成本效率**：仅为您消耗的资源付费，并可以优化管道执行成本。

## 如何运行 Dataflow 模板 {#how-to-run-dataflow-templates}

截至目前，ClickHouse 官方模板可以通过 Google Cloud CLI 或 Dataflow REST API 获得。
有关详细的逐步说明，请参考 [Google Dataflow 从模板运行管道指南](https://cloud.google.com/dataflow/docs/templates/provided-templates)。

## ClickHouse 模板列表 {#list-of-clickhouse-templates}
* [从 BigQuery 到 ClickHouse](./templates/bigquery-to-clickhouse)
* [从 GCS 到 ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (敬请期待！)
* [从 Pub Sub 到 ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (敬请期待！)
