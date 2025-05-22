import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';

# 将 Confluent Cloud 集成到 ClickHouse

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
我们假设您熟悉：
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Cloud 和 [自定义连接器](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)。

## ClickHouse 的官方 Kafka 连接器与 Confluent Cloud {#the-official-kafka-connector-from-clickhouse-with-confluent-cloud}

### 在 Confluent Cloud 上安装 {#installing-on-confluent-cloud}
这是一个快速指南，旨在帮助您快速了解在 Confluent Cloud 上使用 ClickHouse Sink 连接器的步骤。
有关更多详细信息，请参考 [官方 Confluent 文档](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)。

#### 创建主题 {#create-a-topic}
在 Confluent Cloud 上创建主题非常简单，详细说明请见 [这里](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html)。

#### 重要说明 {#important-notes}

* Kafka 主题名称必须与 ClickHouse 表名称相同。如果需要调整，可以使用变换器（例如 [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）。
* 更多的分区并不总是意味着更好的性能 - 请查看我们即将推出的指南以获得更多详细信息和性能提示。

#### 安装连接器 {#install-connector}
您可以从我们的 [仓库](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) 下载连接器 - 欢迎您在这里提交评论和问题！

导航到“连接器插件” -> “添加插件”，并使用以下设置：

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. This will ensure entries of the ClickHouse password are masked during configuration.
```
示例：
<Image img={AddCustomConnectorPlugin} size="md" alt="Confluent 平台 UI 显示添加自定义 ClickHouse 连接器的设置" border/>

#### 收集您的连接详细信息 {#gather-your-connection-details}
<ConnectionDetails />

#### 配置连接器 {#configure-the-connector}
导航到 `Connectors` -> `Add Connector` 并使用以下设置（注意：这些值仅为示例）：

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
您需要指定连接器可以访问的允许列表端点。
添加网络出口端点时，必须使用完全合格的域名 (FQDN)。
示例： `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
必须指定 HTTP(S) 端口。连接器尚不支持原生协议。
:::

[阅读文档。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

您应该没问题了！

#### 已知限制 {#known-limitations}
* 自定义连接器必须使用公共互联网端点。不支持静态 IP 地址。
* 您可以覆盖一些自定义连接器属性。请参见 [官方文档中的完整列表](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)。
* 自定义连接器仅在 [某些 AWS 区域](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions) 中可用。
* 请参阅 [官方文档中自定义连接器的限制列表](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)。
