---
'sidebar_label': '将 Dataflow 与 ClickHouse 集成'
'slug': '/integrations/google-dataflow/dataflow'
'sidebar_position': 1
'description': '用户可以使用 Google Dataflow 将数据引入 ClickHouse'
'title': '将 Google Dataflow 与 ClickHouse 集成'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Google Dataflow 与 ClickHouse 集成

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) 是一项完全托管的流式和批量数据处理服务。它支持使用 Java 或 Python 编写的管道，并建立在 Apache Beam SDK 之上。

有两种主要方式将 Google Dataflow 与 ClickHouse 结合使用，这两种方式都利用了 [`ClickHouseIO Apache Beam 连接器`](/integrations/apache-beam):

## 1. Java Runner {#1-java-runner}
[Java Runner](./java-runner) 允许用户使用 Apache Beam SDK 的 `ClickHouseIO` 集成来实现自定义 Dataflow 管道。这种方法提供了完全的灵活性和对管道逻辑的控制，使用户能够根据特定的要求量身定制 ETL 过程。
然而，此选项需要具备 Java 编程知识和 Apache Beam 框架的熟悉度。

### 主要特性 {#key-features}
- 高度的定制化。
- 适合复杂或高级用例。
- 需要编码和理解 Beam API。

## 2. 预定义模板 {#2-predefined-templates}
ClickHouse 提供了 [预定义模板](./templates)，专为特定用例设计，例如将数据从 BigQuery 导入到 ClickHouse。这些模板可以直接使用，简化了集成过程，是偏好无代码解决方案的用户的绝佳选择。

### 主要特性 {#key-features-1}
- 不需要 Beam 编码。
- 针对简单用例快速易用的设置。
- 也适合编程知识有限的用户。

这两种方法与 Google Cloud 和 ClickHouse 生态系统完全兼容，根据您的技术专长和项目要求提供灵活性。
