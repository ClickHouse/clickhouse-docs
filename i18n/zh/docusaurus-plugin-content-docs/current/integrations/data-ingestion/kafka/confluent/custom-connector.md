---
sidebar_label: 'Confluent 平台上的 Kafka Connector Sink'
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/custom-connector
description: '在 Kafka Connect 和 ClickHouse 中使用 ClickHouse Connector Sink'
title: '将 Confluent Cloud 与 ClickHouse 集成'
keywords: ['Confluent ClickHouse 集成', 'ClickHouse Kafka 连接器', 'Kafka Connect ClickHouse sink', 'Confluent Platform ClickHouse', 'Confluent 自定义连接器']
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# 将 Confluent 平台与 ClickHouse 集成

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

我们假设您已熟悉:

- [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
- Confluent Platform 和[自定义连接器](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)。


## ClickHouse 官方 Kafka 连接器与 Confluent Platform 集成 {#the-official-kafka-connector-from-clickhouse-with-confluent-platform}

### 在 Confluent Platform 上安装 {#installing-on-confluent-platform}

本指南旨在帮助您快速上手在 Confluent Platform 上使用 ClickHouse Sink Connector。
更多详细信息,请参阅 [Confluent 官方文档](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)。

#### 创建主题 {#create-a-topic}

在 Confluent Platform 上创建主题非常简单,详细说明请参见[此处](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)。

#### 重要说明 {#important-notes}

- Kafka 主题名称必须与 ClickHouse 表名称相同。如需调整此行为,可以使用转换器(例如 [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html))。
- 更多分区并不总是意味着更高的性能 - 有关更多详细信息和性能优化建议,请参阅我们即将发布的指南。

#### 安装连接器 {#install-connector}

您可以从我们的[代码仓库](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)下载连接器 - 也欢迎在那里提交评论和问题!

导航至 "Connector Plugins" -> "Add plugin" 并使用以下设置:

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'。这将确保在配置过程中 ClickHouse 密码条目被屏蔽。
```

示例:

<Image
  img={AddCustomConnectorPlugin}
  size='md'
  alt='Confluent Platform 用户界面显示添加自定义 ClickHouse 连接器的设置'
  border
/>

#### 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

#### 配置连接器 {#configure-the-connector}

导航至 `Connectors` -> `Add Connector` 并使用以下设置(注意这些值仅为示例):

```json
{
  "database": "<DATABASE_NAME>",
  "errors.retry.timeout": "30",
  "exactlyOnce": "false",
  "schemas.enable": "false",
  "hostname": "<CLICKHOUSE_HOSTNAME>",
  "password": "<SAMPLE_PASSWORD>",
  "port": "8443",
  "ssl": "true",
  "topics": "<TOPIC_NAME>",
  "username": "<SAMPLE_USERNAME>",
  "key.converter": "org.apache.kafka.connect.storage.StringConverter",
  "value.converter": "org.apache.kafka.connect.json.JsonConverter",
  "value.converter.schemas.enable": "false"
}
```

#### 指定连接端点 {#specify-the-connection-endpoints}

您需要指定连接器可以访问的端点白名单。
添加网络出口端点时,必须使用完全限定域名(FQDN)。
示例: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
您必须指定 HTTP(S) 端口。连接器尚不支持 Native 协议。
:::

[阅读文档。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

您应该已经配置完成!

#### 已知限制 {#known-limitations}

- 自定义连接器必须使用公共互联网端点。不支持静态 IP 地址。
- 您可以覆盖某些自定义连接器属性。请参阅[官方文档中的完整列表。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
- 自定义连接器仅在[某些 AWS 区域](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)中可用
- 请参阅[官方文档中的自定义连接器限制列表](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
