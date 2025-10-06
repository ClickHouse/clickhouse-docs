---
'sidebar_label': 'Confluent Platform の Kafka コネクタシンク'
'sidebar_position': 3
'slug': '/integrations/kafka/cloud/confluent/custom-connector'
'description': 'ClickHouse と Kafka Connect を使用した ClickHouse コネクタシンク'
'title': 'Confluent Cloud と ClickHouse の統合'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import AddCustomConnectorPlugin from '@site/static/images/integrations/data-ingestion/kafka/confluent/AddCustomConnectorPlugin.png';


# Integrating Confluent platform with ClickHouse

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

## Prerequisites {#prerequisites}
私たちは、あなたが以下のことに慣れていると仮定しています:
* [ClickHouse Connector Sink](../kafka-clickhouse-connect-sink.md)
* Confluent Platform および [Custom Connectors](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/overview.html)。

## The official Kafka connector from ClickHouse with Confluent Platform {#the-official-kafka-connector-from-clickhouse-with-confluent-platform}

### Installing on Confluent platform {#installing-on-confluent-platform}
これは、Confluent Platform で ClickHouse Sink Connector を使用するための簡単なガイドです。
詳細については、[公式 Confluent ドキュメント](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#uploading-and-launching-the-connector)を参照してください。

#### Create a Topic {#create-a-topic}
Confluent Platform にトピックを作成するのは非常に簡単で、詳細な手順は [こちら](https://docs.confluent.io/cloud/current/client-apps/topics/manage.html) にあります。

#### Important notes {#important-notes}

* Kafka トピック名は ClickHouse テーブル名と同じでなければなりません。これを調整する方法は、トランスフォーマーを使用することです（例えば [`ExtractTopic`](https://docs.confluent.io/platform/current/connect/transforms/extracttopic.html)）。
* パーティションが多いことは常にパフォーマンスが向上することを意味するわけではありません - 詳細およびパフォーマンスのヒントについては、今後のガイドをご覧ください。

#### Install connector {#install-connector}
コネクタは私たちの [リポジトリ](https://github.com/ClickHouse/clickhouse-kafka-connect/releases) からダウンロードできます - コメントや問題をこちらに提出することも自由にどうぞ！

「Connector Plugins」 -> 「Add plugin」に移動し、以下の設定を使用します:

```text
'Connector Class' - 'com.clickhouse.kafka.connect.ClickHouseSinkConnector'
'Connector type' - Sink
'Sensitive properties' - 'password'. This will ensure entries of the ClickHouse password are masked during configuration.
```
例:
<Image img={AddCustomConnectorPlugin} size="md" alt="Confluent Platform UI showing settings for adding a custom ClickHouse connector" border/>

#### Gather your connection details {#gather-your-connection-details}
<ConnectionDetails />

#### Configure the connector {#configure-the-connector}
`Connectors` -> `Add Connector` に移動し、以下の設定を使用します（値は例です）:

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

#### Specify the connection endpoints {#specify-the-connection-endpoints}
コネクタがアクセスできるエンドポイントの許可リストを指定する必要があります。
ネットワーキングの出口エンドポイントを追加する際は、完全修飾ドメイン名 (FQDN) を使用しなければなりません。
例: `u57swl97we.eu-west-1.aws.clickhouse.com:8443`

:::note
HTTP(S) ポートを指定する必要があります。コネクタはまだネイティブプロトコルをサポートしていません。
:::

[Read the documentation.](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-qs.html#cc-byoc-endpoints)

これで準備は整いました！

#### Known limitations {#known-limitations}
* カスタムコネクタは公共インターネットエンドポイントを使用しなければなりません。静的 IP アドレスはサポートされていません。
* いくつかのカスタムコネクタのプロパティをオーバーライドできます。公式ドキュメントの [すべてのリストを参照してください。](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-manage.html#override-configuration-properties)
* カスタムコネクタは [一部の AWS リージョン](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#supported-aws-regions) でのみ利用可能です。
* [公式ドキュメントにおけるカスタムコネクタの制限のリストを確認してください](https://docs.confluent.io/cloud/current/connectors/bring-your-connector/custom-connector-fands.html#limitations)
