---
sidebar_label: 'ClickPipes for Kafka'
description: 'Seamlessly connect your Kafka data sources to ClickHouse Cloud.'
slug: '/integrations/clickpipes/kafka'
sidebar_position: 1
title: 'Integrating Kafka with ClickHouse Cloud'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';



# KafkaとClickHouse Cloud の統合
## 前提条件 {#prerequisite}
[ClickPipesの紹介](./index.md)に目を通しておいてください。

## 最初のKafka ClickPipeの作成 {#creating-your-first-kafka-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 左側のメニューから`データソース`ボタンを選択し、「ClickPipeをセットアップ」をクリックします。

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. データソースを選択します。

<Image img={cp_step1} alt="Select data source type" size="lg" border/>

4. ClickPipeに名前、説明（オプション）、認証情報、その他の接続詳細を提供してフォームを記入します。

<Image img={cp_step2} alt="Fill out connection details" size="lg" border/>

5. スキーマレジストリを設定します。有効なスキーマはAvroストリームには必須で、JSONにはオプションです。このスキーマは、選択されたトピック上で[AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)を解析したり、JSONメッセージを検証したりするために使用されます。
- 解析できないAvroメッセージや検証に失敗したJSONメッセージはエラーを生成します。
- スキーマレジストリの「ルート」パス。例えば、Confluent CloudのスキーマレジストリURLは`https://test-kk999.us-east-2.aws.confluent.cloud`のようなパスのないHTTPS URLです。ルートパスのみが指定されている場合、ステップ4で列名とタイプを決定するために使用されるスキーマは、サンプリングされたKafkaメッセージに埋め込まれたIDによって決定されます。
- 数値スキーマIDによるスキーマドキュメントへのパス`/schemas/ids/[ID]`。スキーマIDを使用した完全なURLは`https://registry.example.com/schemas/ids/1000`です。
- スキーマドキュメントへのサブジェクト名によるパス`/subjects/[subject_name]`。オプションで、特定のバージョンはURLに`/versions/[version]`を付加することで参照できます（そうでない場合、ClickPipesは最新バージョンを取得します）。スキーマサブジェクトを使用した完全なURLは`https://registry.example.com/subjects/events`または`https://registry/example.com/subjects/events/versions/4`です。

すべての場合において、ClickPipesはメッセージに埋め込まれたスキーマIDによって示された場合、レジストリから更新されたり異なるスキーマを自動的に取得します。埋め込まれたスキーマIDなしでメッセージが書き込まれた場合は、すべてのメッセージを解析するために特定のスキーマIDまたはサブジェクトを指定する必要があります。

6. トピックを選択すると、UIにそのトピックのサンプルドキュメントが表示されます。

<Image img={cp_step3} alt="Set data format and topic" size="lg" border/>

7. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、設定を変更してください。上部のサンプルテーブルで自分の変更をリアルタイムでプレビューできます。

<Image img={cp_step4a} alt="Set table, schema, and settings" size="lg" border/>

  提供されたコントロールを使用して高度な設定をカスタマイズすることもできます。

<Image img={cp_step4a3} alt="Set advanced controls" size="lg" border/>

8. または、既存のClickHouseテーブルにデータを取り込む決定をすることもできます。その場合、UIはソースからのフィールドを選択した宛先テーブル内のClickHouseフィールドにマッピングすることを許可します。

<Image img={cp_step4b} alt="Use an existing table" size="lg" border/>

9. 最後に、内部ClickPipesユーザーの権限を設定できます。

  **権限:** ClickPipesは、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーに対して、カスタムロールまたは事前定義されたロールの一つを選択できます：
    - `フルアクセス`: クラスターへのフルアクセスを持つ。Materialized ViewやDictionaryを宛先テーブルと共に使用する場合に便利です。
    - `宛先テーブルのみ`: 宛先テーブルにのみ`INSERT`権限を持つ。

<Image img={cp_step5} alt="Permissions" size="lg" border/>

10. 「セットアップを完了する」をクリックすると、システムがClickPipeを登録し、サマリーテーブルに表示されるようになります。

<Image img={cp_success} alt="Success notice" size="sm" border/>

<Image img={cp_remove} alt="Remove notice" size="lg" border/>

  サマリーテーブルは、ClickHouseのソースまたは宛先テーブルからサンプルデータを表示するためのコントロールを提供します。

<Image img={cp_destination} alt="View destination" size="lg" border/>

  また、ClickPipeを削除し、取り込みジョブの概要を表示するためのコントロールもあります。

<Image img={cp_overview} alt="View overview" size="lg" border/>

11. **おめでとうございます!** あなたは最初のClickPipeを成功裏にセットアップしました。これがストリーミングClickPipeである場合は、リモートデータソースからリアルタイムでデータを取り込み続けます。

## サポートされているデータソース {#supported-data-sources}

| 名前                   | ロゴ | タイプ | ステータス        | 説明                                                                                           |
|------------------------|------|--------|-------------------|------------------------------------------------------------------------------------------------|
| Apache Kafka           |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング | 安定          | ClickPipesを設定し、Apache KafkaからClickHouse Cloudにストリーミングデータを取り込むことができます。     |
| Confluent Cloud        |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>| ストリーミング | 安定          | ConfluentとClickHouse Cloudの組み合わせの力を、直接の統合で活用します。                      |
| Redpanda               |<Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>| ストリーミング | 安定          | ClickPipesを設定し、RedpandaからClickHouse Cloudにストリーミングデータを取り込むことができます。     |
| AWS MSK                |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング | 安定          | ClickPipesを設定し、AWS MSKからClickHouse Cloudにストリーミングデータを取り込むことができます。      |
| Azure Event Hubs       |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>| ストリーミング | 安定          | ClickPipesを設定し、Azure Event HubsからClickHouse Cloudにストリーミングデータを取り込むことができます。 |
| WarpStream             |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>| ストリーミング | 安定          | ClickPipesを設定し、WarpStreamからClickHouse Cloudにストリーミングデータを取り込むことができます。    |

More connectors are will get added to ClickPipes, you can find out more by [contacting us](https://clickhouse.com/company/contact?loc=clickpipes).

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は以下の通りです：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### サポートされているデータタイプ {#supported-data-types}

現在、ClickPipesでサポートされているClickHouseのデータタイプは以下の通りです：

- 基本的な数値型 - \[U\]Int8/16/32/64およびFloat32/64
- 大きい整数型 - \[U\]Int128/256
- 小数型
- ブール型
- 文字列
- 固定文字列
- 日付、Date32
- 日時、DateTime64（UTCタイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記のタイプ（Nullableを含む）を使用したキーと値のあるMap
- 上記のタイプ（Nullableを含む、1レベル深さのみ）を要素として使用したTupleおよびArray

### Avro {#avro}
#### サポートされているAvroデータタイプ {#supported-avro-data-types}

ClickPipesはすべてのAvroプリミティブおよび複合タイプ、`time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros`、および`duration`以外のすべてのAvroロジカルタイプをサポートします。Avroの`record`タイプはTupleに変換され、`array`タイプはArrayに、`map`はMap（文字列キーのみ）に変換されます。一般的に、[ここ](/interfaces/formats/Avro#data-types-matching)で示された変換があります。ClickPipesはAvro数値型の正確なタイプマッチングを推奨します。ClickPipesは型変換時のオーバーフローや精度損失をチェックしません。

#### Nullable型とAvroユニオン {#nullable-types-and-avro-unions}

AvroのNullableタイプは、`(T, null)`または`(null, T)`のユニオンスキーマを使用して定義され、ここでTは基本的なAvroタイプです。スキーマ推論中に、そのようなユニオンはClickHouseの「Nullable」カラムにマッピングされます。ClickHouseは `Nullable(Array)`、`Nullable(Map)`、または`Nullable(Tuple)`型をサポートしていないことに注意してください。これらの型のAvro nullユニオンは、非Nullableバージョンにマッピングされます（Avro Record型はClickHouseの名前付けされたTupleにマッピングされます）。これらの型のAvro「null」は次のように挿入されます：
- nullのAvro配列に対して空のArray
- nullのAvro Mapに対して空のMap
- nullのAvro Recordに対してすべてのデフォルト/ゼロ値を持つ名前付きTuple

ClickPipesは、他のAvroユニオンが含まれるスキーマを現在サポートしていません（これは、ClickHouseの新しいVariantおよびJSONデータタイプが成熟するにつれて変更される可能性があります）。Avroスキーマに「非null」ユニオンが含まれている場合、ClickPipesはAvroスキーマとClickhouseカラムタイプ間のマッピングを計算しようとする際にエラーを生成します。

#### Avroスキーマ管理 {#avro-schema-management}

ClickPipesは、各メッセージ/イベントに埋め込まれたスキーマIDを使用して、設定されたスキーマレジストリからAvroスキーマを動的に取得して適用します。スキーマの更新は自動的に検出され、処理されます。

現在、ClickPipesは[Confluent Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html)を使用するスキーマレジストリとのみ互換性があります。Confluent KafkaおよびCloudの他に、Redpanda、AWS MSK、およびUpstashのスキーマレジストリも含まれます。ClickPipesは現在、AWS GlueスキーマレジストリまたはAzureスキーマレジストリとは互換性がありません（近日中に対応予定）。

取得したAvroスキーマとClickHouse宛先テーブル間のマッピングには以下のルールが適用されます：
- AvroスキーマがClickHouse宛先マッピングに含まれていないフィールドを含む場合、そのフィールドは無視されます。
- AvroスキーマがClickHouse宛先マッピングで定義されたフィールドを欠いている場合、ClickHouseカラムは0や空文字列などの「ゼロ」値で埋められます。[DEFAULT](/sql-reference/statements/create/table#default)式は現在ClickPipesの挿入で評価されていないことに注意してください（これはClickHouseサーバーのデフォルト処理の更新を待っている一時的な制限です）。
- AvroスキーマのフィールドとClickHouseカラムが互換性がない場合、その行/メッセージの挿入は失敗し、失敗はClickPipesエラーテーブルに記録されます。数値型間のようにいくつかの暗黙的な変換がサポートされていますが、すべてではありません（例えば、Avroの`record`フィールドは`Int32`のClickHouseカラムに挿入することはできません）。

## Kafka仮想カラム {#kafka-virtual-columns}

Kafka互換のストリーミングデータソース用に以下の仮想カラムがサポートされています。新しい宛先テーブルを作成する際には、`カラムを追加`ボタンを使用して仮想カラムを追加できます。

| 名称             | 説明                                          | 推奨データタイプ      |
|------------------|------------------------------------------------|-----------------------|
| _key             | Kafkaメッセージキー                            | 文字列                |
| _timestamp       | Kafkaタイムスタンプ（ミリ秒精度）             | DateTime64(3)         |
| _partition       | Kafkaパーティション                            | Int32                 |
| _offset          | Kafkaオフセット                                 | Int64                 |
| _topic           | Kafkaトピック                                   | 文字列                |
| _header_keys     | レコードヘッダ内のキーの並列配列                | Array(文字列)         |
| _header_values   | レコードヘッダ内のヘッダの並列配列              | Array(文字列)         |
| _raw_message     | 完全なKafkaメッセージ                          | 文字列                |

_raw_messageカラムは、JSONデータに対してのみ推奨されます。JSON文字列のみが必要なユースケース（例：ClickHouseの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して下流のマテリアライズドビューを埋めるなど）では、すべての「非仮想」カラムを削除するとClickPipesのパフォーマンスが向上する可能性があります。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)はサポートされていません。

## 配信のセマンティクス {#delivery-semantics}
Kafka向けのClickPipesは`少なくとも一度`の配信セマンティクスを提供します（最も一般的に使用されるアプローチの一つとして）。配信セマンティクスについてのフィードバックがある場合は[お問い合わせフォーム](https://clickhouse.com/company/contact?loc=clickpipes)までお知らせください。正確に一度のセマンティクスが必要な場合は、公式の[`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse)シンクを使用することをお勧めします。

## 認証 {#authentication}
Apache Kafkaプロトコルデータソースに対して、ClickPipesはTLS暗号化を伴う[SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html)認証や`SASL/SCRAM-SHA-256`、`SASL/SCRAM-SHA-512`をサポートします。ストリーミングソース（Redpanda、MSKなど）に応じて、互換性に基づきこれらの認証メカニズムの全てまたは一部が有効になります。認証要件が異なる場合は、ぜひ[フィードバックをお寄せください](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipe用のIAM認証はベータ機能です。
:::

ClickPipesは、以下のAWS MSK認証をサポートしています。

  - [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html)認証
  - [IAM資格情報またはロールベースのアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)認証

MSKブローカーに接続するためにIAM認証を使用する場合、IAMロールは必要な権限を持っている必要があります。
以下は、MSKのApache Kafka APIに必要なIAMポリシーの例です。

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:Connect"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:cluster/clickpipes-testing-brokers/b194d5ae-5013-4b5b-ad27-3ca9f56299c9-10"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:ReadData"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:topic/clickpipes-testing-brokers/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            "Resource": [
                "arn:aws:kafka:us-east-1:12345678912:group/clickpipes-testing-brokers/*"
            ]
        }
    ]
}
```

#### 信頼関係の設定 {#configuring-a-trusted-relationship}

もしIAMロールARNでMSKに認証をする場合、ロールが引き受けられるようにClickHouse Cloudインスタンスとの間に信頼関係を追加する必要があります。

:::note
ロールベースのアクセスは、AWSにデプロイされたClickHouse Cloudインスタンスのみ機能します。
:::

```json
{
    "Version": "2012-10-17",
    "Statement": [
        ...
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::12345678912:role/CH-S3-your-clickhouse-cloud-role"
            },
            "Action": "sts:AssumeRole"
        },
    ]
}
```

### カスタム証明書 {#custom-certificates}
Kafka向けのClickPipesは、SASLおよびパブリックSSL/TLS証明書を持つKafkaブローカー用のカスタム証明書のアップロードをサポートしています。ClickPipeセットアップのSSL証明書セクションで証明書をアップロードできます。
:::note
Kafka用のSASLと共に単一のSSL証明書のアップロードをサポートしていますが、相互TLS（mTLS）によるSSLは現在サポートされていないことに注意してください。
:::

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipesはClickHouseにバッチでデータを挿入します。データベース内に過剰なパーツが作成されるのを避け、クラスターのパフォーマンス問題を引き起こす可能性があるためです。

バッチは、以下のいずれかの基準が満たされたときに挿入されます：
- バッチサイズが最大サイズ（100,000行または20MB）に達した場合
- バッチが最大の時間（5秒）オープンしていた場合

### レイテンシ {#latency}

レイテンシ（Kafkaメッセージが生成されてからメッセージがClickHouseで使用可能になるまでの時間）は、ブローカーレイテンシ、ネットワークレイテンシ、メッセージサイズ/フォーマットなどの多くの要因に依存します。上記の[バッチ処理](#batching)はレイテンシにも影響を与えます。特定の負荷でのユースケースをテストし、期待されるレイテンシを確認することを常に推奨します。

ClickPipesはレイテンシに関して何の保証も提供しません。特定の低レイテンシ要件がある場合は、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング {#scaling}

Kafka向けのClickPipesは水平スケーリングを設計されています。デフォルトでは、1つのコンシューマを持つコンシューマグループを作成します。
これは、ClickPipe詳細ビューのスケーリングコントロールで変更可能です。

ClickPipesは高可用性を提供し、アベイラビリティゾーン分散アーキテクチャを持っています。
少なくとも二つのコンシューマへスケーリングすることが必要です。

起動しているコンシューマの数に関わらず、故障耐性は設計上提供されています。
コンシューマまたはその基盤インフラストラクチャが失敗した場合、ClickPipeは自動的にコンシューマを再起動し、メッセージの処理を続行します。

## F.A.Q {#faq}

### 一般的な問い合わせ {#general}

- **Kafka向けのClickPipesはどのように機能しますか？**

  ClickPipesは、指定されたトピックからデータを読み取るためのKafkaコンシューマAPIを実行する専用のアーキテクチャを使用し、データを特定のClickHouse Cloudサービス内のClickHouseテーブルに挿入します。

- **ClickPipesとClickHouse Kafkaテーブルエンジンの違いは何ですか？**

  Kafkaテーブルエンジンは、ClickHouseサーバー自体がKafkaに接続し、イベントを引き出して書き込む「プルモデル」を実装するClickHouseのコア機能です。

  ClickPipesはClickHouseサービスとは独立して動作する別のクラウドサービスで、Kafka（または他のデータソース）に接続し、関連するClickHouse Cloudサービスにイベントをプッシュします。この分離されたアーキテクチャは、優れた運用柔軟性、明確な関心の分離、スケーラブルな取り込み、優雅な失敗管理、拡張性などを可能にします。

- **Kafka向けのClickPipesを使用するための要件は何ですか？**

  Kafka向けのClickPipesを使用するには、稼働中のKafkaブローカーとClickPipesが有効化されたClickHouse Cloudサービスが必要です。ClickHouse CloudがKafkaブローカーにアクセスできることも確認する必要があります。このためには、Kafka側でリモート接続を許可し、Kafka設定内で[ClickHouse CloudのエグレスIPアドレス](/manage/security/cloud-endpoints-api)をホワイトリストに追加します。

- **Kafka向けのClickPipesはAWS PrivateLinkをサポートしていますか？**

  AWS PrivateLinkはサポートされています。詳細については[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

- **ClickPipes for Kafkaを使用してKafkaトピックにデータを書き込むことはできますか？**

  いいえ、ClickPipes for KafkaはKafkaトピックからデータを読み取るように設計されており、それらに書き込むことはできません。Kafkaトピックにデータを書き込むには、専用のKafkaプロデューサを使用する必要があります。

- **ClickPipesは複数のブローカーをサポートしていますか？**

  はい、ブローカーが同じクォーラムの一部であれば、`，`で区切って一緒に設定できます。

### Upstash {#upstash}

- **ClickPipesはUpstashをサポートしていますか？**

  はい。Upstash Kafka製品は2024年9月11日に廃止期間に入り、6か月間継続します。既存の顧客は、ClickPipesを使用して既存のUpstash Kafkaブローカーを利用することができます。廃止通知前の既存のUpstash Kafka ClickPipesには影響がありません。廃止期間が終了すると、ClickPipeは機能しなくなります。

- **ClickPipesはUpstashスキーマレジストリをサポートしていますか？**

  いいえ。ClickPipesはUpstash Kafkaスキーマレジストリとは互換性がありません。

- **ClickPipesはUpstash QStashワークフローをサポートしていますか？**

  いいえ。QStashワークフローにKafka互換のインターフェースが導入されない限り、Kafka ClickPipesでは機能しません。

### Azure EventHubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipeはKafkaインターフェースなしで機能しますか？**

  いいえ。ClickPipesはAzure Event HubsにKafkaインターフェースが有効である必要があります。Kafkaプロトコルは、Standard、Premium、およびDedicated SKUの価格帯でのみサポートされています。

- **AzureスキーマレジストリはClickPipesと互換性がありますか？**

  いいえ。ClickPipesは現在、Event Hubsスキーマレジストリとは互換性がありません。

- **Azure Event Hubsからデータを消費するために私のポリシーにはどのような権限が必要ですか？**

  トピックをリストし、イベントを消費するには、ClickPipesに与えられる共有アクセスポリシーには、少なくとも「リッスン」クレームが必要です。

- **なぜ私のEvent Hubsがデータを返さないのですか？**

  ClickHouseインスタンスがEvent Hubsデプロイメントと異なるリージョンまたは大陸にある場合、ClickPipesのオンボーディング時にタイムアウトが発生し、Event Hubからデータを消費する際にレイテンシが高くなる可能性があります。ClickHouse CloudデプロイメントとAzure Event Hubsデプロイメントを近いクラウドリージョン内に配置することが、パフォーマンス低下を避けるためのベストプラクティスと見なされます。

- **Azure Event Hubsにポート番号を含める必要がありますか？**

  はい。ClickPipesは、Kafkaインターフェースのポート番号を含めることを期待しています。ポート番号は`:9093`です。

- **ClickPipes IPはまだAzure Event Hubsに関連していますか？**

  はい。Event Hubsインスタンスへのトラフィックを制限する場合は、[ドキュメント化された静的NAT IP](./index.md#list-of-static-ips)を追加してください。

- **接続文字列はEvent Hub用ですか、それともEvent Hubネームスペース用ですか？**

  どちらでも機能しますが、複数のEvent Hubsからサンプルを取得するためにネームスペースレベルで共有アクセスポリシーを使用することをお勧めします。
