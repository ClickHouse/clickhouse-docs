---
sidebar_label: 'Estuary'
slug: /integrations/estuary
description: '通过 Estuary 集成将多种数据源流式传输到 ClickHouse'
title: '将 Estuary 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://estuary.dev'
keywords: ['estuary', '数据摄取', 'etl', '数据管道', '数据集成', 'clickpipes']
---

import PartnerBadge from '@theme/badges/PartnerBadge';

# 将 Estuary 连接到 ClickHouse {#connect-estuary-with-clickhouse}

<PartnerBadge/>

[Estuary](https://estuary.dev/) 是一款准实时数据平台，可在易于配置的 ETL 流水线中灵活组合实时和批处理数据。凭借企业级的安全性和多种部署选项，Estuary 能够从 SaaS、数据库和流式来源构建稳定可靠的数据流，并将其输送到包括 ClickHouse 在内的多种目标系统。

Estuary 通过 Kafka ClickPipe 与 ClickHouse 进行连接。使用此集成时，您无需维护自己的 Kafka 生态系统。

## 设置指南 {#setup-guide}

**先决条件**

* 一个 [Estuary 账户](https://dashboard.estuary.dev/register)
* 在 Estuary 中一个或多个从所需数据源拉取数据的 [**captures**](https://docs.estuary.dev/concepts/captures/)
* 具有 ClickPipe 权限的 ClickHouse Cloud 账户

<VerticalStepper headerLevel="h3">

### 创建 Estuary materialization {#1-create-an-estuary-materialization}

要将 Estuary 中源集合的数据同步到 ClickHouse，首先需要创建一个 **materialization**。

1. 在 Estuary 的控制台中，进入 [Destinations](https://dashboard.estuary.dev/materializations) 页面。

2. 点击 **+ New Materialization**。

3. 选择 **ClickHouse** connector。

4. 在 Materialization、Endpoint 和 Source Collections 部分填写详细信息：

   * **Materialization Details：** 为你的 materialization 提供一个唯一名称，并选择数据平面（cloud 提供商和区域）

   * **Endpoint Config：** 提供一个安全的 **Auth Token**

   * **Source Collections：** 关联一个已有的 **capture**，或选择要暴露给 ClickHouse 的数据集合

5. 点击 **Next**，然后点击 **Save and Publish**。

6. 在 materialization 详情页面，记下 ClickHouse materialization 的全名。其格式类似于 `your-tenant/your-unique-name/dekaf-clickhouse`。

Estuary 会开始将所选集合作为 Kafka 消息进行流式传输。ClickHouse 可以使用 Estuary 的 broker 详情和你提供的 auth token，通过 Kafka ClickPipe 访问这些数据。

### 输入 Kafka 连接信息 {#2-enter-kafka-connection-details}

在 ClickHouse 中创建一个新的 Kafka ClickPipe，并输入连接信息：

1. 在 ClickHouse Cloud 控制台中，选择 **Data sources**。

2. 创建一个新的 **ClickPipe**。

3. 选择 **Apache Kafka** 作为数据源。

4. 使用 Estuary 的 broker 和 registry 信息填写 Kafka 连接详情：

   * 为你的 ClickPipe 提供一个名称
   * broker 使用：`dekaf.estuary-data.com:9092`
   * 认证方式保持默认的 `SASL/PLAIN` 选项
   * user 字段填写你在 Estuary 中的完整 materialization 名称（例如 `your-tenant/your-unique-name/dekaf-clickhouse`）
   * password 字段填写你为该 materialization 提供的 auth token

5. 打开 schema registry 选项

   * schema URL 使用：`https://dekaf.estuary-data.com`
   * schema key 与 broker user 相同（你的 materialization 名称）
   * secret 与 broker password 相同（你的 auth token）

### 配置传入数据 {#3-configure-incoming-data}

1. 选择一个 Kafka **topic**（来自 Estuary 的某个数据集合）。

2. 选择一个 **offset**。

3. ClickHouse 会检测到 topic 中的消息。你可以继续到 **Parse information** 部分来配置表信息。

4. 选择创建新表，或将数据加载到匹配的现有表中。

5. 将源字段映射到表列，确认列名、类型以及是否为 Nullable。

6. 在最后的 **Details and settings** 部分，你可以为专用数据库用户选择权限。

配置完成后，创建你的 ClickPipe。

ClickHouse 会为你的新数据源进行预配，并开始从 Estuary 消费消息。你可以按需创建任意数量的 ClickPipes，以从所有目标数据集合中进行流式传输。

</VerticalStepper>

## 其他资源 {#additional-resources}

如需了解更多关于与 Estuary 集成的设置方法，请参阅 Estuary 的文档：

* 请参考 Estuary 的 [ClickHouse 物化文档](https://docs.estuary.dev/reference/Connectors/materialization-connectors/Dekaf/clickhouse/)。

* Estuary 使用 **Dekaf** 将数据以 Kafka 消息的形式公开。你可以在[这里](https://docs.estuary.dev/guides/dekaf_reading_collections_from_kafka/)进一步了解 Dekaf。

* 要查看可以通过 Estuary 流式写入 ClickHouse 的数据源列表，请参阅 [Estuary 的 capture 连接器](https://docs.estuary.dev/reference/Connectors/capture-connectors/)。