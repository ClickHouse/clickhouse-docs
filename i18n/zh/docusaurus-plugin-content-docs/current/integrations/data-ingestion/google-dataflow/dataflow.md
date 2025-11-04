---
'sidebar_label': '将 Dataflow 与 ClickHouse 集成'
'slug': '/integrations/google-dataflow/dataflow'
'sidebar_position': 1
'description': '用户可以使用 Google Dataflow 将数据导入 ClickHouse'
'title': '将 Google Dataflow 与 ClickHouse 集成'
'doc_type': 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Google Dataflow 与 ClickHouse 集成

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) 是一项完全托管的流和批量数据处理服务。它支持用 Java 或 Python 编写的管道，并基于 Apache Beam SDK 构建。

使用 Google Dataflow 与 ClickHouse 主要有两种方式，两者都利用了 [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam):

## 1. Java 运行器 {#1-java-runner}
[Java 运行器](./java-runner) 允许用户使用 Apache Beam SDK 的 `ClickHouseIO` 集成来实现自定义 Dataflow 管道。这种方法提供了对管道逻辑的完全灵活性和控制，使用户能够根据特定需求定制 ETL 过程。
然而，该选项需要具备 Java 编程知识和对 Apache Beam 框架的熟悉。

### 关键特性 {#key-features}
- 高度自定义。
- 适合复杂或高级用例。
- 需要编码和理解 Beam API。

## 2. 预定义模板 {#2-predefined-templates}
ClickHouse 提供了针对特定用例设计的 [预定义模板](./templates)，如从 BigQuery 导入数据到 ClickHouse。这些模板是现成可用的，并简化了集成过程，使其成为希望不进行编码的用户的绝佳选择。

### 关键特性 {#key-features-1}
- 无需 Beam 编码。
- 适合简单用例的快速、简单设置。
- 适合编程经验较少的用户。

这两种方法与 Google Cloud 和 ClickHouse 生态系统完全兼容，根据您的技术专长和项目要求提供灵活性。
