---
sidebar_label: 'Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: '用户可以使用 Google Dataflow Java Runner 将数据导入 ClickHouse'
---


# Dataflow Java Runner

Dataflow Java Runner 允许您在 Google Cloud 的 Dataflow 服务上执行自定义的 Apache Beam 流水线。这种方法提供最大的灵活性，非常适合高级 ETL 工作流。

## 工作原理 {#how-it-works}

1. **流水线实现**  
   要使用 Java Runner，您需要使用 `ClickHouseIO` 实现您的 Beam 流水线 - 我们官方的 Apache Beam 连接器。如需代码示例和有关如何使用 `ClickHouseIO` 的说明，请访问 [ClickHouse Apache Beam](/integrations/apache-beam)。

2. **部署**  
   一旦您的流水线实现并配置完毕，您可以使用 Google Cloud 的部署工具将其部署到 Dataflow。全面的部署说明已在 [Google Cloud Dataflow 文档 - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java) 中提供。

**注意**: 这种方法假设您对 Beam 框架和编码有一定的熟悉程度。如果您更喜欢无代码解决方案，请考虑使用 [ClickHouse 的预定义模板](./templates)。
