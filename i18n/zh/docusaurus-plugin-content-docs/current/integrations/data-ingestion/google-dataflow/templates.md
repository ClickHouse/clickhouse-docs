---
sidebar_label: '模板'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: '用户可以通过 Google Dataflow 模板将数据摄取到 ClickHouse'
title: 'Google Dataflow 模板'
doc_type: 'guide'
keywords: ['Google Dataflow', 'GCP', '数据管道', '模板', '批处理']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Google Dataflow 模板 {#google-dataflow-templates}

<ClickHouseSupportedBadge/>

Google Dataflow 模板提供了一种便捷方式，使您无需编写自定义代码即可运行预构建、开箱即用的数据管道。这些模板旨在简化常见的数据处理任务，基于 [Apache Beam](https://beam.apache.org/) 构建，并通过 `ClickHouseIO` 等连接器与 ClickHouse 数据库实现无缝集成。通过在 Google Dataflow 上运行这些模板，您可以以最小的投入实现高度可扩展的分布式数据处理。

## 为什么使用 Dataflow 模板？ {#why-use-dataflow-templates}

- **易用性**：模板通过提供针对特定用例预配置的管道，免去了编写自定义代码的工作。
- **可扩展性**：Dataflow 确保您的管道能够高效扩展，通过分布式处理来应对海量数据。
- **成本效益**：只需为实际消耗的资源付费，并且可以优化管道的执行成本。

## 如何运行 Dataflow 模板 {#how-to-run-dataflow-templates}

截至目前，可以通过 Google Cloud 控制台、CLI 或 Dataflow REST API 使用 ClickHouse 官方模板。
有关详细的分步操作说明，请参阅 [Google Dataflow Run Pipeline From a Template Guide](https://cloud.google.com/dataflow/docs/templates/provided-templates)。

## ClickHouse 模板列表 {#list-of-clickhouse-templates}
* [BigQuery 到 ClickHouse](./templates/bigquery-to-clickhouse)
* [GCS 到 ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3)（即将推出！）
* [Pub Sub 到 ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4)（即将推出！）
