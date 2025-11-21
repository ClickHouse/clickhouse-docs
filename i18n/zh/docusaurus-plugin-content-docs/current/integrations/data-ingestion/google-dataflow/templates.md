---
sidebar_label: '模板'
slug: /integrations/google-dataflow/templates
sidebar_position: 3
description: '用户可以使用 Google Dataflow 模板将数据导入 ClickHouse'
title: 'Google Dataflow 模板'
doc_type: 'guide'
keywords: ['google dataflow', 'gcp', '数据管道', '模板', '批处理']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow 模板

<ClickHouseSupportedBadge/>

Google Dataflow 模板提供了一种便捷方式，使您无需编写自定义代码即可运行预构建、开箱即用的数据管道。这些模板旨在简化常见的数据处理任务，基于 [Apache Beam](https://beam.apache.org/) 构建，并通过 `ClickHouseIO` 等连接器与 ClickHouse 数据库无缝集成。通过在 Google Dataflow 上运行这些模板，您可以以极少的工作量实现高度可扩展的分布式数据处理。



## 为什么使用 Dataflow 模板? {#why-use-dataflow-templates}

- **易于使用**: 模板提供针对特定用例预配置的数据管道,无需编写代码。
- **可扩展性**: Dataflow 通过分布式处理确保您的管道高效扩展,能够处理大规模数据。
- **成本效益**: 按实际消耗的资源付费,并可优化管道执行成本。


## 如何运行 Dataflow 模板 {#how-to-run-dataflow-templates}

目前,ClickHouse 官方模板可通过 Google Cloud Console、CLI 或 Dataflow REST API 获取。
有关详细的分步说明,请参阅 [Google Dataflow 从模板运行管道指南](https://cloud.google.com/dataflow/docs/templates/provided-templates)。


## ClickHouse 模板列表 {#list-of-clickhouse-templates}

- [BigQuery 到 ClickHouse](./templates/bigquery-to-clickhouse)
- [GCS 到 ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/3) (即将推出！)
- [Pub Sub 到 ClickHouse](https://github.com/ClickHouse/DataflowTemplates/issues/4) (即将推出！)
