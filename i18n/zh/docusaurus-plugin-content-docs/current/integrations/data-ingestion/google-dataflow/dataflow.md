---
sidebar_label: '将 Dataflow 与 ClickHouse 集成'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: '您可以使用 Google Dataflow 将数据摄取到 ClickHouse 中'
title: '将 Google Dataflow 与 ClickHouse 集成'
doc_type: 'guide'
keywords: ['Google Dataflow ClickHouse', 'Dataflow ClickHouse integration', 'Apache Beam ClickHouse', 'ClickHouseIO connector', 'Google Cloud ClickHouse integration']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Google Dataflow 与 ClickHouse 集成 \{#integrating-google-dataflow-with-clickhouse\}

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow) 是一项完全托管的流式和批处理数据处理服务。它支持使用 Java 或 Python 编写的数据管道（pipeline），并基于 Apache Beam SDK 构建。

将 Google Dataflow 与 ClickHouse 结合使用主要有两种方式，这两种方式都使用 [`ClickHouseIO Apache Beam 连接器`](/integrations/apache-beam)：
- [Java 运行器](#1-java-runner)
- [预定义模板](#2-predefined-templates)

## Java runner \{#1-java-runner\}

[Java runner](./java-runner) 允许用户使用集成了 `ClickHouseIO` 的 Apache Beam SDK 来实现自定义 Dataflow 管道。该方法为 pipeline 逻辑提供了高度的灵活性和控制力，使用户能够根据特定需求定制 ETL 流程。
不过，该选项需要具备 Java 编程知识，并且熟悉 Apache Beam 框架。

### 主要特性 \{#key-features\}

- 高度可定制。
- 适用于复杂或高级用例。
- 需要编写代码并理解 Beam API。

## 预定义模板 \{#2-predefined-templates\}

ClickHouse 提供了针对特定使用场景设计的[预定义模板](./templates)，例如将数据从 BigQuery 导入到 ClickHouse。这些模板开箱即用，可简化集成过程，如果您偏好无代码解决方案，这是一个绝佳选择。

### 关键特性 \{#key-features-1\}

- 无需编写 Beam 代码。
- 为简单用例提供快速、便捷的设置。
- 同样适合编程经验有限的用户。

这两种方法都与 Google Cloud 和 ClickHouse 生态系统完全兼容，可根据您的技术专长和项目需求提供灵活性。