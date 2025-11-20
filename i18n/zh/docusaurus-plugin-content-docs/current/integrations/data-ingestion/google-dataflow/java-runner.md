---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: '用户可以使用 Google Dataflow Java Runner 将数据写入 ClickHouse'
title: 'Dataflow Java Runner'
doc_type: 'guide'
keywords: ['Dataflow Java Runner', 'Google Dataflow ClickHouse', 'Apache Beam Java ClickHouse', 'ClickHouseIO connector']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java runner

<ClickHouseSupportedBadge/>

`Dataflow Java Runner` 允许你在 Google Cloud 的 Dataflow 服务上运行自定义的 Apache Beam 管道。此方式具有极高的灵活性，非常适合构建高级 `ETL` 工作流。



## 工作原理 {#how-it-works}

1. **Pipeline 实现**
   要使用 Java Runner,您需要使用 `ClickHouseIO`(我们官方的 Apache Beam 连接器)实现您的 Beam pipeline。有关 `ClickHouseIO` 的代码示例和使用说明,请访问 [ClickHouse Apache Beam](/integrations/apache-beam)。

2. **部署**
   完成 pipeline 的实现和配置后,您可以使用 Google Cloud 的部署工具将其部署到 Dataflow。详细的部署说明请参阅 [Google Cloud Dataflow 文档 - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java)。

**注意**:此方法需要您熟悉 Beam 框架并具备编码能力。如果您希望使用无代码解决方案,请考虑使用 [ClickHouse 的预定义模板](./templates)。
