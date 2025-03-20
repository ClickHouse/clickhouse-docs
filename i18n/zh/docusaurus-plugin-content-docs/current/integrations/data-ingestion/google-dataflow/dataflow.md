---
sidebar_label: '将 Dataflow 与 ClickHouse 集成'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: '用户可以使用 Google Dataflow 将数据导入 ClickHouse'
---


# 将 Google Dataflow 与 ClickHouse 集成

[Google Dataflow](https://cloud.google.com/dataflow) 是一个完全托管的流和批处理数据处理服务。它支持用 Java 或 Python 编写的管道，并基于 Apache Beam SDK 构建。

有两种主要方式可以将 Google Dataflow 与 ClickHouse 一起使用，两者都利用了 [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam):

## 1. Java Runner {#1-java-runner}
[Java Runner](./java-runner) 允许用户使用 Apache Beam SDK 的 `ClickHouseIO` 集成来实现自定义的 Dataflow 管道。该方法提供了对管道逻辑的完全灵活性和控制，使用户能够根据特定需求量身定制 ETL 过程。
然而，此选项需要 Java 编程知识和对 Apache Beam 框架的熟悉。

### 主要特点 {#key-features}
- 高度定制化。
- 适合复杂或高级用例。
- 需要编码和对 Beam API 的理解。

## 2. 预定义模板 {#2-predefined-templates}
ClickHouse 提供了专为特定用例设计的 [预定义模板](./templates)，例如将数据从 BigQuery 导入 ClickHouse。这些模板是现成可用的，简化了集成过程，使其成为偏爱无代码解决方案的用户的绝佳选择。

### 主要特点 {#key-features-1}
- 不需要 Beam 编码。
- 简单用例的快速和轻松设置。
- 也适合编程经验有限的用户。

这两种方法与 Google Cloud 和 ClickHouse 生态系统完全兼容，提供了根据您的技术专长和项目需求的灵活性。
