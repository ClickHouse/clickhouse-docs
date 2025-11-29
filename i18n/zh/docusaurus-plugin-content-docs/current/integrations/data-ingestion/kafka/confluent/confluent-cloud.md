---
sidebar_label: 'Confluent Cloud 上的 Kafka Sink Connector'
sidebar_position: 2
slug: /integrations/kafka/cloud/confluent/sink-connector
description: '在 Confluent Cloud 上使用全托管 ClickHouse Sink Connector 的指南'
title: '将 Confluent Cloud 与 ClickHouse 集成'
keywords: ['Kafka', 'Confluent Cloud']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
  - website: 'https://clickhouse.com/cloud/clickpipes'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';


# 将 Confluent Cloud 与 ClickHouse 集成 {#integrating-confluent-cloud-with-clickhouse}

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



## 前提条件 {#prerequisites}
我们假设您已经熟悉以下内容：
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud



## ClickHouse 与 Confluent Cloud 的官方 Kafka 连接器 {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

#### 创建 Topic {#create-a-topic}
在 Confluent Cloud 上创建 topic 相当简单，详细步骤请参见[此文档](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)。

#### 重要说明 {#important-notes}

* Kafka topic 名称必须与 ClickHouse 表名相同。可以通过使用 transformer（例如 [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）来调整这一行为。
* 分区数量更多并不总是意味着性能更好——更多细节和性能调优建议请参阅我们即将发布的指南。

#### 收集连接信息 {#gather-your-connection-details}
<ConnectionDetails />

#### 安装 Connector {#install-connector}
按照[官方文档](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html)在 Confluent Cloud 上安装完全托管的 ClickHouse Sink Connector。

#### 配置 Connector {#configure-the-connector}
在配置 ClickHouse Sink Connector 时，需要提供以下信息：
- ClickHouse 服务器的 hostname
- ClickHouse 服务器的端口（默认是 8443）
- ClickHouse 服务器的用户名和密码
- 用于写入数据的 ClickHouse 数据库名称
- 在 Kafka 中用于向 ClickHouse 写入数据的 topic 名称

Confluent Cloud 的 UI 支持高级配置选项，可调整轮询间隔、批大小和其他参数以优化性能。

#### 已知限制 {#known-limitations}
* 请参阅[官方文档中的 Connector 限制列表](https://docs.confluent.io/cloud/current/connectors/cc-clickhouse-sink-connector/cc-clickhouse-sink.html#limitations)
