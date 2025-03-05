---
sidebar_label: ClickPipes for Kafka
description: KafkaデータソースをClickHouse Cloudにシームレスに接続します。
slug: /integrations/clickpipes/kafka
sidebar_position: 1
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


# KafkaとClickHouse Cloudの統合
## 前提条件 {#prerequisite}
[ClickPipes入門](./index.md)に目を通している必要があります。

## 最初のKafka ClickPipeの作成 {#creating-your-first-kafka-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<img src={cp_service} alt="ClickPipes service" />

2. 左側のメニューで`Data Sources`ボタンを選択し、「ClickPipeのセットアップ」をクリックします。

<img src={cp_step0} alt="Select imports" />

3. データソースを選択します。

<img src={cp_step1} alt="Select data source type" />

4. ClickPipeに名前、説明（任意）、認証情報、およびその他の接続詳細を提供してフォームに記入します。

<img src={cp_step2} alt="Fill out connection details" />

5. スキーマレジストリの設定を行います。Avroストリームには有効なスキーマが必要で、JSONには任意です。このスキーマは、選択したトピックで[AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)を解析したり、JSONメッセージを検証したりするために使用されます。
- 解析できないAvroメッセージや検証に失敗したJSONメッセージはエラーを生成します。
- スキーマレジストリの「ルート」パスです。例えば、Confluent CloudのスキーマレジストリURLは、`https://test-kk999.us-east-2.aws.confluent.cloud`のように、パスがないHTTPS URLです。ルートパスのみを指定した場合、ステップ4で使用するカラム名と型を決定するために使用されるスキーマは、サンプリングされたKafkaメッセージに埋め込まれたidによって決定されます。
- 数値スキーマidによってスキーマ文書へのパス`/schemas/ids/[ID]`を指定します。スキーマidを使用する完全なURLは、`https://registry.example.com/schemas/ids/1000`です。
- 主題名によるスキーマ文書へのパス`/subjects/[subject_name]`を指定します。オプションで、特定のバージョンを参照するためにURLの末尾に`/versions/[version]`を追加できます（そうしない場合、ClickPipesは最新バージョンを取得します）。スキーマ主題を使用する完全なURLは、`https://registry.example.com/subjects/events`や`https://registry/example.com/subjects/events/versions/4`です。

いずれの場合でも、ClickPipesは、メッセージに埋め込まれたスキーマIDによって示された場合、レジストリから更新または異なるスキーマを自動的に取得します。メッセージに埋め込まれたスキーマIDがない場合、すべてのメッセージを解析するために特定のスキーマIDまたは主題を指定する必要があります。

6. トピックを選択すると、UIにトピックのサンプル文書が表示されます。

<img src={cp_step3} alt="Set data format and topic" />

7. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更します。サンプルテーブルの上部に、変更をリアルタイムでプレビューできます。

<img src={cp_step4a} alt="Set table, schema, and settings" />

  提供されているコントロールを使用して高度な設定をカスタマイズすることもできます。

<img src={cp_step4a3} alt="Set advanced controls" />

8. あるいは、既存のClickHouseテーブルにデータを取り込むことを決定できます。この場合、UIはソースからクリックハウスの選択した目的のテーブルのフィールドにマッピングすることを許可します。

<img src={cp_step4b} alt="Use an existing table" />

9. 最後に、内部ClickPipesユーザーの権限を設定できます。

  **権限:** ClickPipesは、目的のテーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーの役割をカスタム役割またはプレ定義の役割のいずれかから選択できます:
    - `Full access`: クラスターへのフルアクセス。目的のテーブルでMaterialized ViewまたはDictionaryを使用する場合に便利です。
    - `Only destination table`: 目的のテーブルに対してのみ`INSERT`権限を持っています。

<img src={cp_step5} alt="Permissions" />

10. 「設定の完了」をクリックすると、システムはClickPipeを登録し、サマリーテーブルに一覧表示されます。

<img src={cp_success} alt="Success notice" />

<img src={cp_remove} alt="Remove notice" />

  サマリーテーブルには、ClickHouseのソースまたは目的のテーブルからサンプルデータを表示するコントロールが提供されます。

<img src={cp_destination} alt="View destination" />

  また、ClickPipeを削除し、取り込みジョブの要約を表示するためのコントロールも提供されます。

<img src={cp_overview} alt="View overview" />

11. **おめでとうございます！** 最初のClickPipeの設定に成功しました。これがストリーミングClickPipeであれば、リモートデータソースからリアルタイムでデータを取り込み続けます。

## サポートされているデータソース {#supported-data-sources}

| 名前                  | ロゴ | タイプ      | ステータス | 説明                                                                                       |
|----------------------|------|------------|------------|-------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング | 安定        | ClickPipesを構成し、Apache KafkaからClickHouse Cloudにストリーミングデータを取り込み始めます。 |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>| ストリーミング | 安定        | ConfluentとClickHouse Cloudの統合による組み合わせの力を発揮します。                      |
| Redpanda             |<img src={redpanda_logo} class="image" alt="Redpanda logo" style={{width: '2.5rem', 'background-color': 'transparent'}}/>| ストリーミング | 安定        | ClickPipesを構成し、RedpandaからClickHouse Cloudにストリーミングデータを取り込み始めます。 |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング | 安定        | ClickPipesを構成し、AWS MSKからClickHouse Cloudにストリーミングデータを取り込み始めます。  |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>| ストリーミング | 安定        | ClickPipesを構成し、Azure Event HubsからClickHouse Cloudにストリーミングデータを取り込み始めます。 |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>| ストリーミング | 安定        | ClickPipesを構成し、WarpStreamからClickHouse Cloudにストリーミングデータを取り込み始めます。   |

さらなるコネクタがClickPipesに追加される予定です。詳細は[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

## サポートされているデータ形式 {#supported-data-formats}

サポートされている形式は以下の通りです：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### サポートされているデータ型 {#supported-data-types}

現在、ClickPipesでサポートされているClickHouseのデータ型は以下の通りです：

- 基本的な数値型 - \[U\]Int8/16/32/64およびFloat32/64
- 大きな整数型 - \[U\]Int128/256
- 小数型
- ブール型
- 文字列
- 固定文字列
- 日付、Date32
- DateTime, DateTime64 (UTCタイムゾーンのみ)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記の型（Nullableを含む）を持つキーと値を持つマップ
- 上記の型（Nullableを含む、1レベルの深さのみ）を持つ要素のタプルおよび配列

### Avro {#avro}
#### サポートされているAvroデータ型 {#supported-avro-data-types}

ClickPipesは、すべてのAvroプライミティブおよび複雑な型、および`time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros`、`duration`を除くすべてのAvro論理型をサポートしています。Avro `record`型はタプルに、`array`型は配列に、`map`はマップ（文字列キーのみ）に変換されます。一般的に、ここでリストされた変換は[こちら](../../../interfaces/formats.md#data-types-matching)から利用可能です。ClickPipesは、Avroの数値型の正確な型一致を推奨します。ClickPipesは型変換時のオーバーフローや精度損失のチェックを行わないためです。

#### Nullable型とAvroユニオン {#nullable-types-and-avro-unions}

AvroのNullable型は、`(T, null)`または`(null, T)`というユニオンスキーマを使用して定義されます。ここでTは基本的なAvro型です。スキーマ推論中に、そのようなユニオンはClickHouseの「Nullable」カラムにマッピングされます。ClickHouseは`Nullable(Array)`、`Nullable(Map)`、または`Nullable(Tuple)`型をサポートしていませんので注意が必要です。これらの型のAvro nullユニオンは、非Nullableバージョンにマッピングされます（Avro Record型はClickHouseの名前付きタプルにマッピングされます）。これらの型のAvro「null」は以下のように挿入されます：
- null Avro配列の空の配列
- null Avroマップの空のマップ
- null Avro Recordのデフォルト/ゼロ値のすべての値を持つ名前付きタプル

ClickPipesは、他のAvroユニオンを含むスキーマを現在サポートしていません（これは、ClickHouseのVariantおよびJSONデータ型の成熟により今後変更される可能性があります）。Avroスキーマが「非null」ユニオンを含む場合、ClickPipesはAvroスキーマとClickhouseカラム型のマッピングを計算しようとする際にエラーを生成します。

#### Avroスキーマ管理 {#avro-schema-management}

ClickPipesは、各メッセージ/イベントに埋め込まれたスキーマIDを使用して、設定されたスキーマレジストリからAvroスキーマを動的に取得して適用します。スキーマの更新は自動的に検出され、処理されます。

現時点でClickPipesは、[Confluent Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html)を使用するスキーマレジストリとのみ互換性があります。Confluent KafkaおよびCloudに加え、Redpanda、AWS MSK、Upstashのスキーマレジストリも含まれます。ClickPipesは、AWS GlueスキーマレジストリまたはAzureスキーマレジストリとは現時点で互換性がありません（近日中に対応予定）。

取得したAvroスキーマとClickHouseの目的のテーブルとの間のマッピングには以下のルールが適用されます：
- AvroスキーマにClickHouseの目的のマッピングに含まれていないフィールドが含まれている場合、そのフィールドは無視されます。
- AvroスキーマにClickHouseの目的のマッピングで定義されたフィールドがない場合、ClickHouseカラムには「ゼロ」値（例：0または空文字列）が入ります。なお、[DEFAULT](/sql-reference/statements/create/table#default)式は現在、ClickPipesの挿入に対して評価されません（これはClickHouseサーバーのデフォルト処理に対する一時的な制限です）。
- AvroスキーマフィールドとClickHouseカラムが互換性がない場合、その行/メッセージの挿入は失敗し、失敗はClickPipesのエラー表に記録されます。いくつかの暗黙的変換はサポートされていますが（数値型間の変換など）、すべての変換がサポートされているわけではありません（例えば、Avroの`record`フィールドを`Int32`のClickHouseカラムに挿入することはできません）。

## Kafka仮想コラム {#kafka-virtual-columns}

以下の仮想カラムは、Kafka互換のストリーミングデータソースに対してサポートされています。新しい目的のテーブルを作成する際には、`Add Column`ボタンを使用して仮想カラムを追加できます。

| 名前           | 説明                                         | 推奨データ型       |
|----------------|---------------------------------------------|--------------------|
| _key           | Kafkaメッセージキー                        | 文字列             |
| _timestamp     | Kafkaタイムスタンプ（ミリ秒精度）          | DateTime64(3)      |
| _partition     | Kafkaパーティション                        | Int32              |
| _offset        | Kafkaオフセット                             | Int64              |
| _topic         | Kafkaトピック                              | 文字列             |
| _header_keys   | レコードヘッダー内のキーの並列配列        | Array(文字列)      |
| _header_values | レコードヘッダー内のヘッダーの並列配列    | Array(文字列)      |
| _raw_message   | フルKafkaメッセージ                         | 文字列             |

_note_: _raw_messageカラムは、JSONデータに対してのみ推奨されます。JSON文字列のみが必要なユースケース（ClickHouseの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して下流のマテリアライズドビューを構築するなど）では、すべての「非仮想」カラムを削除することでClickPipesのパフォーマンスが向上する可能性があります。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)はサポートされていません。

## 配信セマンティクス {#delivery-semantics}
ClickPipes for Kafkaは、 `at-least-once`配信セマンティクスを提供します（最も一般的なアプローチの一つとして）。配信セマンティクスに関するフィードバックをお待ちしています。[お問い合わせフォーム](https://clickhouse.com/company/contact?loc=clickpipes)をご利用ください。正確に一度のセマンティクスが必要な場合は、公式の[`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse)シンクの使用をお勧めします。

## 認証 {#authentication}
Apache Kafkaプロトコルデータソースの場合、ClickPipesは[**SASL/PLAIN**](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html)認証とTLS暗号化、および`SASL/SCRAM-SHA-256`と`SASL/SCRAM-SHA-512`をサポートしています。ストリーミングソース（Redpanda、MSKなど）によっては、互換性に基づいてこれらの認証メカニズムのすべてまたは一部が有効になります。認証ニーズが異なる場合は、[フィードバックをお寄せください](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipeのIAM認証はベータ機能です。
:::

ClickPipesは以下のAWS MSK認証をサポートしています

  - [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html)認証
  - [IAM Credentialsまたはロールベースのアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)認証

IAMロールARNを使ってMSKブローカーに接続する場合、IAMロールには必要な権限が必要です。
以下は、MSKのApache Kafka APIに必要なIAMポリシーの例です：

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

#### 信頼関係の構成 {#configuring-a-trusted-relationship}

IAMロールARNを使用してMSKに認証する場合、ClickHouse Cloudインスタンスとの間に信頼関係を追加する必要があります。

:::note
ロールベースのアクセスは、AWSにデプロイされたClickHouse Cloudインスタンスでのみ機能します。
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
ClickPipes for Kafkaは、SASLおよび公開SSL/TLS証明書を持つKafkaブローカー向けのカスタム証明書のアップロードをサポートしています。ClickPipe設定のSSL証明書セクションに証明書をアップロードできます。
:::note
SASLとともに単一のSSL証明書のアップロードをサポートしていますが、相互TLS（mTLS）でのSSLは現時点でサポートされていないことに注意してください。
:::

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipesは、ClickHouseにデータをバッチで挿入します。これは、データベース内にあまりにも多くのパーツが作成されるのを避けるためであり、クラスタのパフォーマンスに問題を引き起こす可能性があります。

以下のいずれかの条件が満たされた場合にバッチが挿入されます：
- バッチサイズが最大サイズ（100,000行または20MB）に達した場合
- バッチが最大期間（5秒）オープンされていた場合

### レイテンシ {#latency}

レイテンシ（Kafkaメッセージが生成されてから、メッセージがClickHouseで利用可能になるまでの時間）は、いくつかの要因（例：ブローカーのレイテンシ、ネットワークレイテンシ、メッセージサイズ/形式）に依存します。上記の[バッチ処理](#batching)もレイテンシに影響します。予想されるレイテンシを決定するには、特定のユースケースを典型的な負荷でテストすることをお勧めします。

ClickPipesは、レイテンシに関していかなる保証も提供していません。特定の低レイテンシ要件がある場合は、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング {#scaling}

ClickPipes for Kafkaは、水平スケーリングを視野に入れて設計されています。デフォルトでは、1つのコンシューマーを持つコンシューマーグループが作成されます。
これは、ClickPipeの詳細ビュー内のスケーリングコントロールを使用して変更できます。

ClickPipesは、可用性ゾーンに分散されたアーキテクチャを持つ高可用性を提供します。
これは、少なくとも2つのコンシューマーにスケールアップする必要があります。

実行中のコンシューマーの数に関係なく、設計上の耐障害性が提供されます。
コンシューマーまたはその基盤となるインフラストラクチャが失敗した場合、ClickPipeは自動的にコンシューマーを再起動し、メッセージの処理を続行します。

## よくある質問 {#faq}

### 一般 {#general}

- **ClickPipes for Kafkaはどのように機能しますか？**

  ClickPipesは、専用のアーキテクチャを使用してKafka Consumer APIを実行して、指定されたトピックからデータを読み取り、そのデータを特定のClickHouse Cloudサービスのテーブルに挿入します。

- **ClickPipesとClickHouse Kafkaテーブルエンジンの違いは何ですか？**

  Kafkaテーブルエンジンは、ClickHouseサーバー自体がKafkaに接続し、イベントをプルしてローカルに書き込む「プルモデル」を実装しているClickHouseのコア機能です。

  ClickPipesは、ClickHouseサービスとは独立して実行される別のクラウドサービスで、Kafka（または他のデータソース）に接続し、関連するClickHouse Cloudサービスにイベントをプッシュします。このデカップリングされたアーキテクチャにより、優れた運用の柔軟性、役割の明確な分離、スケーラブルな取り込み、優雅な障害管理、拡張性などが可能になります。

- **ClickPipes for Kafkaを使用するための要件は何ですか？**

  ClickPipes for Kafkaを使用するには、稼働中のKafkaブローカーとClickPipesが有効なClickHouse Cloudサービスが必要です。また、ClickHouse CloudがKafkaブローカーにアクセスできるようにする必要があります。これには、Kafka側でリモート接続を許可し、Kafkaセットアップで[ClickHouse Cloudの出口IPアドレス](/manage/security/cloud-endpoints-api)をホワイトリスト登録することが含まれます。

- **ClickPipes for KafkaはAWS PrivateLinkをサポートしていますか？**

  AWS PrivateLinkに対応しています。詳細については[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

- **ClickPipes for Kafkaを使用してKafkaトピックにデータを書き込むことはできますか？**

  いいえ、ClickPipes for KafkaはKafkaトピックからデータを読み取るように設計されており、書き込むことはできません。Kafkaトピックにデータを書き込むには、専用のKafkaプロデューサーを使用する必要があります。

- **ClickPipesは複数のブローカーをサポートしていますか？**

  はい、ブローカーが同じクォーラムの一部である場合、`、`で区切って一緒に構成できます。

### Upstash {#upstash}

- **ClickPipesはUpstashをサポートしていますか？**

  はい。Upstash Kafka製品は2024年9月11日に廃止期間に入り、6か月間続きます。既存の顧客は、ClickPipesを使用して既存のUpstash Kafkaブローカーに引き続き接続できます。ClickPipesユーザーインターフェースで一般的なKafkaタイルを使用してください。既存のUpstash Kafka ClickPipesは廃止通知前に影響を受けません。廃止期間が終了すると、ClickPipeは機能しなくなります。

- **ClickPipesはUpstashスキーマレジストリをサポートしていますか？**

  いいえ。ClickPipesはUpstash Kafkaスキーマレジストリとは互換性がありません。

- **ClickPipesはUpstash QStashワークフローをサポートしていますか？**

  いいえ。QStashワークフローにKafka互換のインターフェースが導入されない限り、Kafka ClickPipesと連携することはできません。

### Azure Event Hubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipeはKafka面なしで機能しますか？**

  いいえ。ClickPipesはAzure Event HubsにKafka面が有効になっている必要があります。Kafkaプロトコルは、スタンダード、プレミアム、および専用SKUの価格設定レベルのみに適用されます。

- **AzureスキーマレジストリはClickPipesで機能しますか？**

  いいえ。ClickPipesは現時点でEvent Hubsスキーマレジストリと互換性がありません。

- **Azure Event Hubsからデータを消費するために、私のポリシーにはどのような権限が必要ですか？**

  トピックをリストしてイベントを消費するために、ClickPipesに与えられる共有アクセスポリシーは、少なくとも「Listen」権限が必要です。

- **なぜ私のEvent Hubsはデータを返さないのですか？**

  ClickHouseインスタンスがEvent Hubsのデプロイメントとは異なるリージョンまたは大陸にある場合、ClickPipesのオンボーディング時にタイムアウトが発生したり、Event Hubからデータを消費する際に高いレイテンシが発生することがあります。パフォーマンスの低下を避けるために、ClickHouse Cloud展開とAzure Event Hubs展開を近接リージョンに位置させることが推奨されます。

- **Azure Event Hubsのポート番号を含めるべきですか？**

  はい。ClickPipesは、Kafka面のポート番号を`：9093`として含めることを期待しています。

- **ClickPipesのIPはAzure Event Hubsにとってまだ重要ですか？**

  はい。Event Hubsインスタンスへのトラフィックを制限する場合は、[文書化された静的NAT IP](./index.md#list-of-static-ips)を追加してください。

- **Event Hubの接続文字列は、Event Hub用ですか、それともEvent Hubの名前空間用ですか？**

  両方が機能しますが、複数のEvent Hubsからサンプルを取得するためには、名前空間レベルでの共有アクセスポリシーを使用することをお勧めします。
