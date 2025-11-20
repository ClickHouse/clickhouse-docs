---
sidebar_label: '将 Dataflow 与 ClickHouse 集成'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: '用户可以使用 Google Dataflow 将数据导入 ClickHouse'
title: '将 Google Dataflow 与 ClickHouse 集成'
doc_type: 'guide'
keywords: ['Google Dataflow ClickHouse', 'Dataflow ClickHouse integration', 'Apache Beam ClickHouse', 'ClickHouseIO connector', 'Google Cloud ClickHouse integration']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Google Dataflow 集成到 ClickHouse

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) 是一项完全托管的流式和批处理数据处理服务。它支持使用 Java 或 Python 编写的 pipeline，并构建在 Apache Beam SDK 之上。

将 Google Dataflow 与 ClickHouse 结合使用主要有两种方式，这两种方式都依赖于 [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam)：
- [Java runner](#1-java-runner)
- [预定义模板](#2-predefined-templates)



## Java 运行器 {#1-java-runner}

[Java 运行器](./java-runner)允许用户通过 Apache Beam SDK 的 `ClickHouseIO` 集成来实现自定义 Dataflow 管道。这种方式提供了对管道逻辑的完全灵活性和控制能力,使用户能够根据具体需求定制 ETL 流程。
但是,此选项需要具备 Java 编程知识并熟悉 Apache Beam 框架。

### 主要特性 {#key-features}

- 高度可定制。
- 适用于复杂或高级使用场景。
- 需要编码能力和对 Beam API 的理解。


## 预定义模板 {#2-predefined-templates}

ClickHouse 提供了针对特定用例设计的[预定义模板](./templates),例如将数据从 BigQuery 导入到 ClickHouse。这些模板可直接使用,简化了集成流程,是偏好无代码解决方案用户的理想选择。

### 主要特性 {#key-features-1}

- 无需编写 Beam 代码。
- 针对简单用例可快速便捷地完成设置。
- 同样适用于编程经验较少的用户。

这两种方法都完全兼容 Google Cloud 和 ClickHouse 生态系统,可根据您的技术专长和项目需求灵活选择。
