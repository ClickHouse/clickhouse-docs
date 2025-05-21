---
'sidebar_label': '使用 Google Dataflow 与 ClickHouse 集成'
'slug': '/integrations/google-dataflow/dataflow'
'sidebar_position': 1
'description': '用户可以使用 Google Dataflow 将数据导入到 ClickHouse'
'title': 'Integrating Google Dataflow with ClickHouse'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Google Dataflow 与 ClickHouse 集成

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) 是一个完全托管的流数据和批处理数据处理服务。它支持用 Java 或 Python 编写的管道，并建立在 Apache Beam SDK 之上。

有两种主要方法可以将 Google Dataflow 与 ClickHouse 一起使用，这两种方法均利用了 [`ClickHouseIO Apache Beam 连接器`](/integrations/apache-beam):

## 1. Java 运行器 {#1-java-runner}
[Java 运行器](./java-runner) 允许用户使用 Apache Beam SDK 的 `ClickHouseIO` 集成来实现自定义 Dataflow 管道。此方法提供了对管道逻辑的完全灵活性和控制，允许用户根据特定需求调整 ETL 过程。
然而，该选项需要 Java 编程知识和对 Apache Beam 框架的熟悉。

### 主要特点 {#key-features}
- 高度可定制性。
- 适合复杂或高级用例。
- 需要编程和理解 Beam API。

## 2. 预定义模板 {#2-predefined-templates}
ClickHouse 提供了专为特定用例设计的 [预定义模板](./templates)，例如将数据从 BigQuery 导入 ClickHouse。这些模板是即用型的，并简化了集成过程，使其成为喜欢无代码解决方案的用户的理想选择。

### 主要特点 {#key-features-1}
- 无需 Beam 编码。
- 适合简单用例的快速和简单设置。
- 也适合编程经验较少的用户。

这两种方法与 Google Cloud 和 ClickHouse 生态系统完全兼容，提供灵活性，具体取决于您的技术专长和项目要求。
