---
'sidebar_label': '将 Dataflow 与 ClickHouse 集成'
'slug': '/integrations/google-dataflow/dataflow'
'sidebar_position': 1
'description': '用户可以使用 Google Dataflow 将数据导入 ClickHouse'
'title': '将 Google Dataflow 与 ClickHouse 集成'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# 将 Google Dataflow 与 ClickHouse 集成

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) 是一个完全托管的流和批处理数据处理服务。它支持用 Java 或 Python 编写的管道，并基于 Apache Beam SDK 构建。

使用 Google Dataflow 与 ClickHouse 主要有两种方式，这两种方式都利用了 [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam):

## 1. Java Runner {#1-java-runner}
[Java Runner](./java-runner) 允许用户使用 Apache Beam SDK 的 `ClickHouseIO` 集成实现自定义 Dataflow 管道。这种方法提供了对管道逻辑的完全灵活性和控制，用户可以根据特定需求量身定制 ETL 过程。然而，这个选项需要具备 Java 编程知识和 Apache Beam 框架的熟悉度。

### 主要特点 {#key-features}
- 高度的定制化。
- 适合复杂或高级的使用案例。
- 需要编码和理解 Beam API。

## 2. 预定义模板 {#2-predefined-templates}
ClickHouse 提供了为特定用例设计的 [预定义模板](./templates)，例如从 BigQuery 导入数据到 ClickHouse。这些模板是现成可用的，简化了集成过程，非常适合那些更喜欢无代码解决方案的用户。

### 主要特点 {#key-features-1}
- 不需要 Beam 编码。
- 对于简单用例，快速易用的设置。
- 同样适合编程知识较少的用户。

这两种方法与 Google Cloud 和 ClickHouse 生态系统完全兼容，根据您的技术专长和项目需求提供灵活性。
