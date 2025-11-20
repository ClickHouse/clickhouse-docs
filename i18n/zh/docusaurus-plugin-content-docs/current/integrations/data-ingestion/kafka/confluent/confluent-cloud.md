---
sidebar_label: 'Confluent Cloud 上的 Kafka Connector Sink'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/sink-connector
description: '在 Confluent Cloud 中使用全托管 ClickHouse Connector Sink 的指南'
title: '将 Confluent Cloud 与 ClickHouse 集成'
keywords: ['Kafka', 'Confluent Cloud']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://clickhouse.com/cloud/clickpipes'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';


# 将 Confluent Cloud 与 ClickHouse 集成

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/SQAiPVbd3gg"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>



## 前置条件 {#prerequisites}

我们假设您已熟悉：

- [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
- Confluent Cloud


## ClickHouse 官方 Kafka 连接器与 Confluent Cloud {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

#### 创建主题 {#create-a-topic}

在 Confluent Cloud 上创建主题非常简单,详细说明请参见[此处](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)。

#### 重要说明 {#important-notes}

- Kafka 主题名称必须与 ClickHouse 表名称相同。如需调整此设置,可使用转换器(例如 [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html))。
- 更多分区并不总是意味着更高性能 - 有关更多详细信息和性能优化建议,请参阅我们即将发布的指南。

#### 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

#### 安装连接器 {#install-connector}

按照[官方文档](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html)在 Confluent Cloud 上安装完全托管的 ClickHouse Sink 连接器。

#### 配置连接器 {#configure-the-connector}

在配置 ClickHouse Sink 连接器时,您需要提供以下详细信息:

- ClickHouse 服务器的主机名
- ClickHouse 服务器的端口(默认为 8443)
- ClickHouse 服务器的用户名和密码
- ClickHouse 中将写入数据的数据库名称
- Kafka 中用于向 ClickHouse 写入数据的主题名称

Confluent Cloud UI 支持高级配置选项,可调整轮询间隔、批处理大小和其他参数以优化性能。

#### 已知限制 {#known-limitations}

- 请参阅[官方文档中的连接器限制列表](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)
