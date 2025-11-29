---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: '用户可以使用 Google Dataflow Java Runner 将数据摄取到 ClickHouse'
title: 'Dataflow Java Runner'
doc_type: 'guide'
keywords: ['Dataflow Java Runner', 'Google Dataflow ClickHouse', 'Apache Beam Java ClickHouse', 'ClickHouseIO 连接器']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java 运行器 {#dataflow-java-runner}

<ClickHouseSupportedBadge/>

Dataflow Java 运行器使你能够在 Google Cloud 的 Dataflow 服务上执行自定义 Apache Beam 管道。此方式提供了最大的灵活性，非常适合高级 ETL 工作流。



## 工作原理 {#how-it-works}

1. **Pipeline 实现**
   要使用 Java Runner，您需要使用 `ClickHouseIO`（我们官方提供的 Apache Beam 连接器）来实现 Beam pipeline。有关代码示例以及如何使用 `ClickHouseIO` 的说明，请访问 [ClickHouse Apache Beam](/integrations/apache-beam)。

2. **部署**
   在实现并配置好 pipeline 之后，您可以使用 Google Cloud 的部署工具将其部署到 Dataflow。完整的部署说明请参阅 [Google Cloud Dataflow 文档 - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java)。

**注意**：此方案假定您熟悉 Beam 框架并具备编码经验。如果您更偏好无代码方案，可以考虑使用 [ClickHouse 预定义模板](./templates)。
