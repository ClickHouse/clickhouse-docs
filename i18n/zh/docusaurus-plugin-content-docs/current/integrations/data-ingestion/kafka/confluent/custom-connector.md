---
sidebar_label: '在 Confluent Platform 上使用 Kafka Sink 连接器'
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/custom-connector
description: '将 ClickHouse Sink 连接器与 Kafka Connect 和 ClickHouse 配合使用'
title: '将 Confluent Cloud 与 ClickHouse 集成'
keywords: ['Confluent ClickHouse 集成', 'ClickHouse Kafka 连接器', 'Kafka Connect ClickHouse sink', 'Confluent Platform ClickHouse', 'Confluent 自定义连接器']
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# 将 Confluent 平台与 ClickHouse 集成 {#integrating-confluent-platform-with-clickhouse}

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
假定您已经熟悉：
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Platform 和[自定义连接器（Custom Connectors）](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)。



## ClickHouse 官方 Kafka 连接器（适用于 Confluent Platform） {#the-official-kafka-connector-from-clickhouse-with-confluent-platform}

### 在 Confluent Platform 上安装 {#installing-on-confluent-platform}

本指南是一个快速入门，帮助你在 Confluent Platform 上开始使用 ClickHouse Sink 连接器。\
更多详情请参考 [Confluent 官方文档](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)。

#### 创建 Topic {#create-a-topic}

在 Confluent Platform 上创建一个主题（topic）相当简单，详细步骤请参阅[此文档](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)。

#### 重要说明 {#important-notes}

* Kafka topic 名称必须与 ClickHouse 表名相同。可以通过使用转换器（transformer）来调整这一点（例如 [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）。
* 增加分区数量并不总能提升性能——请关注我们即将发布的指南以获取更多细节和性能优化建议。

#### 安装连接器 {#install-connector}

你可以从我们的[仓库](https://github.com/ClickHouse/clickhouse-kafka-connect/releases)下载连接器——也欢迎在此提交评论和问题！

在控制台中依次进入 &quot;Connector Plugins&quot; -&gt; &quot;Add plugin&quot;，并使用以下设置：

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'。这将确保在配置期间对 ClickHouse 密码条目进行掩码处理。
```

Example:

<Image img={AddCustomConnectorPlugin} size="md" alt="Confluent Platform UI，显示用于添加自定义 ClickHouse 连接器的设置" border />

#### 收集连接信息 {#gather-your-connection-details}

<ConnectionDetails />

#### 配置连接器 {#configure-the-connector}

导航至 `Connectors` -&gt; `Add Connector`，并使用以下设置（注意：以下值仅为示例）：

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

你需要配置一个允许连接器访问的端点列表。
在添加网络出站（egress）端点时，必须使用完全限定域名（FQDN）。
示例：`u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
你必须指定 HTTP(S) 端口。该 Connector 目前尚不支持 Native 协议。
:::

[阅读文档。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

现在一切已就绪！

#### 已知限制 {#known-limitations}

* Custom Connectors 必须使用公共互联网端点。不支持静态 IP 地址。
* 你可以覆盖部分 Custom Connector 属性。请参阅[官方文档中的完整列表。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* Custom Connectors 仅在[部分 AWS 区域](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions)可用。
* 请参阅官方文档中[关于 Custom Connectors 的限制列表](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)。
