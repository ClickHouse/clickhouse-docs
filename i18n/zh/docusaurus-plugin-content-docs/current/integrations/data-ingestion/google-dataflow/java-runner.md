---
'sidebar_label': 'Java Runner'
'slug': '/integrations/google-dataflow/java-runner'
'sidebar_position': 2
'description': '用户可以使用 Google Dataflow Java Runner 将数据导入 ClickHouse'
'title': 'Dataflow Java Runner'
'doc_type': 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java 运行器

<ClickHouseSupportedBadge/>

Dataflow Java 运行器允许您在 Google Cloud 的 Dataflow 服务上执行自定义的 Apache Beam 管道。这种方法提供了最大的灵活性，非常适合高级 ETL 工作流。

## 工作原理 {#how-it-works}

1. **管道实现**  
   要使用 Java 运行器，您需要使用 `ClickHouseIO` 实现您的 Beam 管道 - 我们的官方 Apache Beam 连接器。有关代码示例和如何使用 `ClickHouseIO` 的说明，请访问 [ClickHouse Apache Beam](/integrations/apache-beam)。

2. **部署**  
   一旦您的管道实现并配置完成，您可以使用 Google Cloud 的部署工具将其部署到 Dataflow。全面的部署说明可以在 [Google Cloud Dataflow 文档 - Java 管道](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java) 中找到。

**注意**：这种方法假定您对 Beam 框架有一定了解并具备编码专业知识。如果您更喜欢无代码解决方案，可以考虑使用 [ClickHouse 的预定义模板](./templates)。
