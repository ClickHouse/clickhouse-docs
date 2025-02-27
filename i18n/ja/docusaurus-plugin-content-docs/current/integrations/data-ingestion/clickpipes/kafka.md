---
sidebar_label: ClickPipes for Kafka
description: Kafka データソースを ClickHouse Cloud にシームレスに接続します。
slug: /integrations/clickpipes/kafka
sidebar_position: 1
---

import KafkaSVG from "../../images/logos/kafka.svg";
import ConfluentSVG from "../../images/logos/confluent.svg";
import MskSVG from "../../images/logos/msk.svg";
import AzureEventHubsSVG from "../../images/logos/azure_event_hubs.svg";
import WarpStreamSVG from "../../images/logos/warpstream.svg";

# KafkaとClickHouse Cloudの統合
## 前提条件 {#prerequisite}
[ClickPipesの概要](./index.md)に目を通しておく必要があります。

## 最初のKafka ClickPipeの作成 {#creating-your-first-kafka-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

  ![ClickPipesサービス](./images/cp_service.png)

2. 左側のメニューで`Data Sources`ボタンを選択し、「Set up a ClickPipe」をクリックします。

  ![インポートの選択](./images/cp_step0.png)

3. データソースを選択します。

  ![データソースの種類を選択](./images/cp_step1.png)

4. ClickPipeに名前、説明（オプション）、認証情報、その他の接続詳細を提供してフォームに記入します。

  ![接続詳細を記入](./images/cp_step2.png)

5. スキーマレジストリを設定します。Avroストリームには有効なスキーマが必要で、JSONにはオプションです。このスキーマは、選択したトピックで[AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)を解析したり、JSONメッセージを検証したりするために使用されます。
- 解析できないAvroメッセージや検証に失敗したJSONメッセージはエラーを生成します。
- スキーマレジストリの「ルート」パスです。例えば、Confluent CloudスキーマレジストリのURLはパスのないHTTPS URLで、`https://test-kk999.us-east-2.aws.confluent.cloud`のようになります。ルートパスのみが指定されている場合、ステップ4でカラム名とタイプを決定するために使用されるスキーマは、サンプルのKafkaメッセージに埋め込まれたIDによって決定されます。
- 数値スキーマIDによるスキーマ文書のパス`/schemas/ids/[ID]`。スキーマIDを使用した完全なURLは`https://registry.example.com/schemas/ids/1000`となります。
- 主題名によるスキーマ文書のパス`/subjects/[subject_name]`。オプションとして、URLの末尾に`/versions/[version]`を追加して特定のバージョンを参照できます（さもなければClickPipesは最新バージョンを取得します）。スキーマ主題を使用した完全なURLは`https://registry.example.com/subjects/events`または`https://registry/example.com/subjects/events/versions/4`です。

すべての場合において、ClickPipesはメッセージに埋め込まれたスキーマIDによって示される場合、自動的にレジストリから更新されたまたは異なるスキーマを取得します。メッセージに埋め込まれたスキーマIDがない場合は、すべてのメッセージを解析するために特定のスキーマIDまたは主題を指定する必要があります。

6. トピックを選択すると、UIにトピックからのサンプルドキュメントが表示されます。

  ![データ形式とトピックを設定](./images/cp_step3.png)

7. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用したいかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更します。上部のサンプルテーブルで変更のリアルタイムプレビューを確認できます。

  ![テーブル、スキーマ、設定を設定](./images/cp_step4a.png)

  提供されたコントロールを使用して詳細設定をカスタマイズすることもできます。

  ![詳細コントロールを設定](./images/cp_step4a3.png)

8. また、既存のClickHouseテーブルにデータを取り込むことを決定することもできます。その場合、UIはソースのフィールドを選択した宛先テーブルのClickHouseフィールドにマッピングすることを許可します。

  ![既存のテーブルを使用](./images/cp_step4b.png)

9. 最後に、内部ClickPipesユーザーの権限を設定できます。

  **権限:** ClickPipesはデータを宛先テーブルに書き込むための専用ユーザーを作成します。この内部ユーザーに対する役割をカスタム役割または事前定義された役割のいずれかを選択できます：
    - `フルアクセス`: クラスターへのフルアクセスを持ちます。これは、宛先テーブルでMaterialized ViewやDictionaryを使用する場合に便利です。
    - `宛先テーブルのみ`: 宛先テーブルへの`INSERT`権限のみを持ちます。

  ![権限](./images/cp_step5.png)

10. 「Complete Setup」をクリックすると、システムはClickPipeを登録し、要約テーブルに表示されるようになります。

  ![成功通知](./images/cp_success.png)

  ![削除通知](./images/cp_remove.png)

  要約テーブルには、ClickHouseのソースまたは宛先テーブルからサンプルデータを表示するためのコントロールが提供されます。

  ![宛先を表示](./images/cp_destination.png)

  さらに、ClickPipeを削除し、取り込みジョブの概要を表示するためのコントロールもあります。

  ![概要を表示](./images/cp_overview.png)

11. **おめでとうございます！** 最初のClickPipeを正常にセットアップしました。これがストリーミングClickPipeであれば、リモートデータソースからリアルタイムでデータを取り込み続けます。

## サポートされるデータソース {#supported-data-sources}

|名前|ロゴ|タイプ|ステータス|説明|
|----|----|----|------|-----------|
|Apache Kafka|<KafkaSVG style={{width: '3rem', 'height': '3rem'}} />|ストリーミング|安定|ClickPipesを設定し、Apache KafkaからClickHouse Cloudへのストリーミングデータ取り込みを開始します。|
|Confluent Cloud|<ConfluentSVG style={{width: '3rem'}} />|ストリーミング|安定|ConfluentとClickHouse Cloudの直接統合を通じて、両者の強力な機能を解放します。|
|Redpanda|<img src={require('../../images/logos/logo_redpanda.png').default} class="image" alt="Redpandaロゴ" style={{width: '2.5rem', 'background-color': 'transparent'}}/>|ストリーミング|安定|ClickPipesを設定し、RedpandaからClickHouse Cloudへのストリーミングデータ取り込みを開始します。|
|AWS MSK|<MskSVG style={{width: '3rem', 'height': '3rem'}} />|ストリーミング|安定|ClickPipesを設定し、AWS MSKからClickHouse Cloudへのストリーミングデータ取り込みを開始します。|
|Azure Event Hubs|<AzureEventHubsSVG style={{width: '3rem'}} />|ストリーミング|安定|ClickPipesを設定し、Azure Event HubsからClickHouse Cloudへのストリーミングデータ取り込みを開始します。|
|WarpStream|<WarpStreamSVG style={{width: '3rem'}} />|ストリーミング|安定|ClickPipesを設定し、WarpStreamからClickHouse Cloudへのストリーミングデータ取り込みを開始します。|

ClickPipesに追加されるコネクタについては、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## サポートされるデータ形式 {#supported-data-formats}

サポートされている形式は次のとおりです：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### サポートされるデータ型 {#supported-data-types}

現在ClickPipesでサポートされているClickHouseデータ型は以下の通りです：

- 基本の数値型 - \[U\]Int8/16/32/64 および Float32/64
- 大きな整数型 - \[U\]Int128/256
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
- 上記のいずれかの型（Nullableを含む）を使用したキーと値を持つMap型
- 上記のいずれかの型（Nullableを含む、1階層の深さのみ）を使用した要素を持つTupleおよびArray

### Avro {#avro}
#### サポートされるAvroデータ型 {#supported-avro-data-types}

ClickPipesは、すべてのAvro原始型および複合型、`time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros`、および`duration`を除くすべてのAvro論理型をサポートしています。Avroの`record`型はTupleに、`array`型はArrayに、`map`はMap（文字列キーのみ）に変換されます。一般に、[ここ](../../../interfaces/formats.md#data-types-matching)に記載されている変換が利用可能です。ClickPipesは、オーバーフローや精度損失をチェックしないため、Avro数値型の正確な型マッチングの使用を推奨します。

#### Nullable型とAvro Union {#nullable-types-and-avro-unions}

AvroのNullable型は、`(T, null)`または`(null, T)`というUnionスキーマを使用して定義され、ここでTは基本Avro型です。スキーマ推論中、このようなUnionはClickHouseの「Nullable」カラムにマッピングされます。ClickHouseは
`Nullable(Array)`、`Nullable(Map)`、または`Nullable(Tuple)`型をサポートしないことに注意してください。これらの型に対するAvro null Unionは、nullableバージョンにマッピングされます（Avro Record型はClickHouseの名前付きTupleにマッピングされます）。これらの型に対するAvroの「null」は、次のように挿入されます：
- Null Avro配列に対する空の配列
- Null Avro Mapに対する空のMap
- Null Avro Recordに対するデフォルト/ゼロ値のすべてを持つ名前付きTuple

ClickPipesは、現在他のAvro Unionを含むスキーマをサポートしていません（この点は、ClickHouseのVariantおよびJSONデータ型の成熟に伴い将来的に変更される可能性があります）。Avroスキーマに「非null」Unionが含まれている場合、ClickPipesはAvroスキーマとClickHouseカラム型とのマッピングを計算しようとするとエラーが生成されます。

#### Avroスキーマ管理 {#avro-schema-management}

ClickPipesは、設定されたスキーマレジストリから各メッセージ/イベントに埋め込まれたスキーマIDを使用して、Avroスキーマを動的に取得して適用します。スキーマの更新は自動的に検出および処理されます。

現在、ClickPipesは[Confluent Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html)を使用するスキーマレジストリとのみ互換性があります。Confluent KafkaおよびCloudに加えて、これにはRedpanda、AWS MSK、およびUpstashスキーマレジストリが含まれます。ClickPipesは現在、AWS Glue SchemaレジストリやAzure Schema Registryとは互換性がありません（近日中に対応予定）。

次のルールが、取得されたAvroスキーマとClickHouse宛先テーブルとのマッピングに適用されます：
- AvroスキーマにClickHouseの宛先マッピングに含まれていないフィールドがある場合、そのフィールドは無視されます。
- AvroスキーマにClickHouseの宛先マッピングで定義されたフィールドが欠落している場合、ClickHouseカラムは「ゼロ」値（例えば0または空文字列）で埋められます。[DEFAULT](/sql-reference/statements/create/table#default)式は、現在ClickPipesの挿入に対して評価されません（これはClickHouseサーバーのデフォルト処理の更新を待つ一時的な制限です）。
- AvroスキーマフィールドとClickHouseカラムが互換性がない場合、その行/メッセージの挿入は失敗し、その失敗はClickPipesエラーテーブルに記録されます。いくつかの暗黙的な変換は（数値型間など）サポートされていますが、すべてではありません（例えば、Avroの`record`フィールドは`Int32`のClickHouseカラムに挿入することはできません）。

## Kafkaの仮想カラム {#kafka-virtual-columns}

Kafka互換のストリーミングデータソース用に以下の仮想カラムがサポートされています。新しい宛先テーブルを作成する際、`Add Column`ボタンを使用して仮想カラムを追加できます。

| 名前           | 説明                                         | 推奨データ型           |
|----------------|----------------------------------------------|-----------------------|
| _key           | Kafkaメッセージキー                          | String                |
| _timestamp     | Kafkaタイムスタンプ（ミリ秒精度）          | DateTime64(3)         |
| _partition     | Kafkaパーティション                          | Int32                 |
| _offset        | Kafkaオフセット                               | Int64                 |
| _topic         | Kafkaトピック                                | String                |
| _header_keys   | レコードヘッダー内のキーの並列配列          | Array(String)         |
| _header_values | レコードヘッダー内のヘッダーの並列配列      | Array(String)         |
| _raw_message   | 完全なKafkaメッセージ                        | String                |

_raw_message カラムはJSONデータのみに推奨されます。クリックハウスの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して下流のマテリアライズドビュを人口する場合など、JSON文字列のみが必要なユースケースでは、「非仮想」カラムをすべて削除するとClickPipesのパフォーマンスが改善される可能性があります。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)はサポートされていません。

## 配信セマンティクス {#delivery-semantics}
ClickPipes for Kafkaは、`at-least-once`配信セマンティクスを提供します（最も一般的に使用されるアプローチの1つです）。配信セマンティクスに関するフィードバックは[お問い合わせフォーム](https://clickhouse.com/company/contact?loc=clickpipes)にお寄せください。厳密に1回だけのセマンティクスが必要な場合は、公式の[`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse)シンクの使用を推奨します。

## 認証 {#authentication}
Apache Kafkaプロトコルデータソースに対して、ClickPipesはTLS暗号化を伴う[SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html)認証、および`SASL/SCRAM-SHA-256`および`SASL/SCRAM-SHA-512`をサポートしています。ストリーミングソース（Redpanda、MSKなど）によって、互換性に基づいてこれらの認証メカニズムのすべてまたは一部が有効化されます。認証の要件が異なる場合は、[フィードバックをお寄せください](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipeのIAM認証はベータ機能です。
:::

ClickPipesは以下のAWS MSK認証をサポートしています：

  - [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html)認証
  - [IAM資格情報またはロールベースのアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)認証

MSKブローカーに接続するためにIAM認証を使用する場合、IAMロールには必要な権限が必要です。
以下は、MSK用のApache Kafka APIに必要なIAMポリシーの例です：

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

IAMロールARNでMSKに認証している場合、役割を引き受けることができるようにClickHouse Cloudインスタンスとの間に信頼関係を追加する必要があります。

:::note
役割ベースのアクセスはAWSにデプロイされたClickHouse Cloudインスタンスでのみ機能します。
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
ClickPipes for Kafkaは、SASLおよび公開SSL/TLS証明書を持つKafkaブローカーのためのカスタム証明書のアップロードをサポートしています。ClickPipe設定のSSL証明書セクションで証明書をアップロードできます。
:::note
SASLと共に単一のSSL証明書をアップロードすることはサポートしていますが、SSLと相互TLS（mTLS）は現在サポートされていないことに注意してください。
:::

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipesはClickHouseにバッチでデータを挿入します。これは、データベース内でパーツが過剰に作成されるのを避けるためであり、クラスターでパフォーマンスの問題を引き起こす可能性があります。

バッチは、以下のいずれかの条件が満たされたときに挿入されます：
- バッチサイズが最大サイズ（100,000行または20MB）に達した
- バッチが最大時間（5秒）開いている状態である

### レイテンシ {#latency}

レイテンシ（Kafkaメッセージが生成されてからClickHouseでメッセージが利用可能になるまでの時間）は、さまざまな要因（ブローカーのレイテンシ、ネットワークのレイテンシ、メッセージのサイズ/形式）に依存します。上記の[バッチ処理](#batching)はレイテンシにも影響を与えます。特定のユースケースを典型的な負荷でテストして、期待されるレイテンシを判断することを常にお勧めします。

ClickPipesはレイテンシに関していかなる保証も提供しません。特定の低レイテンシ要件がある場合は、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング {#scaling}

ClickPipes for Kafkaは、水平スケーリングを目的に設計されています。デフォルトでは、1つのコンシューマを持つコンシューマグループを作成します。これは、ClickPipeの詳細ビューにあるスケーリングコントロールを使用して変更できます。

ClickPipesは高可用性を提供し、可用性ゾーンで分散したアーキテクチャを持ちます。これには、少なくとも2つのコンシューマにスケーリングする必要があります。

実行中のコンシューマの数に関わらず、設計上のフォールトトレランスが利用可能です。コンシューマまたはその基盤となるインフラストラクチャが失敗した場合、ClickPipeは自動的にコンシューマを再起動し、メッセージの処理を続行します。

## F.A.Q {#faq}

### 一般 {#general}

- **ClickPipes for Kafkaはどのように機能しますか？**

  ClickPipesは、Kafka Consumer APIを実行する専用アーキテクチャを使用して、指定されたトピックからデータを読み取り、データを特定のClickHouse CloudサービスのClickHouseテーブルに挿入します。

- **ClickPipesとClickHouse Kafkaテーブルエンジンの違いは何ですか？**

  Kafkaテーブルエンジンは、ClickHouseサーバーがKafkaに接続し、イベントを取得してローカルに書き込む「プルモデル」を実装したClickHouseのコア機能です。

  ClickPipesは、ClickHouseサービスから独立して動作する別のクラウドサービスであり、Kafka（または他のデータソース）に接続し、関連のあるClickHouse Cloudサービスにイベントを押し出します。このデカップルされたアーキテクチャは、優れた運用の柔軟性、明確な責任の分離、スケーラブルな取り込み、優れた障害管理、拡張性などを可能にします。

- **ClickPipes for Kafkaの使用条件は何ですか？**

  ClickPipes for Kafkaを使用するには、実行中のKafkaブローカーとClickPipesが有効になったClickHouse Cloudサービスが必要です。また、ClickHouse CloudがKafkaブローカーにアクセスできるようにする必要があります。これは、Kafka側でリモート接続を許可し、Kafka設定内で[ClickHouse CloudエグレスIPアドレス](/manage/security/cloud-endpoints-api)をホワイトリストに追加することで実現できます。

- **ClickPipes for KafkaはAWS PrivateLinkをサポートしていますか？**

  AWS PrivateLinkはサポートされています。詳細情報については[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

- **ClickPipes for Kafkaを使用してKafkaトピックにデータを書き込むことはできますか？**

  いいえ。ClickPipes for Kafkaは、Kafkaトピックからデータを読み込むために設計されており、トピックにデータを書き込むためのものではありません。Kafkaトピックにデータを書き込むには、専用のKafkaプロデューサを使用する必要があります。

- **ClickPipesは複数のブローカーをサポートしていますか？**

  はい。同じクォーラムに属するブローカーは、`、`で区切って一緒に構成できます。

### Upstash {#upstash}

- **ClickPipesはUpstashをサポートしていますか？**

  はい。Upstash Kafka製品は、2024年9月11日から6ヶ月間の廃止期間に入りました。既存の顧客は、ClickPipesを使用して現在のUpstash Kafkaブローカーに接続し、ClickPipesユーザーインターフェースで一般的なKafkaタイルを使用することができます。廃止通知が出される前は、既存のUpstash Kafka ClickPipesは影響を受けません。廃止期間が終了すると、ClickPipeは機能しなくなります。

- **ClickPipesはUpstashスキーマレジストリをサポートしていますか？**

  いいえ。ClickPipesはUpstash Kafkaスキーマレジストリ互換ではありません。

- **ClickPipesはUpstash QStashワークフローをサポートしていますか？**

  いいえ。QStashワークフローでKafka互換のインターフェースが導入されない限り、Kafka ClickPipesで機能しません。

### Azure EventHubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipeはKafkaインターフェースなしで機能しますか？**

  いいえ。ClickPipesはAzure Event HubsのKafkaインターフェースが有効であることを必要とします。Kafkaプロトコルは、Standard、Premium、およびDedicated SKUください。

- **AzureスキーマレジストリはClickPipesで機能しますか？**

  いいえ。ClickPipesは現在Event Hubsスキーマレジストリ互換ではありません。

- **Azure Event Hubsから消費するために私のポリシーに必要な権限は何ですか？**

  トピックをリストしてイベントを消費するために、ClickPipesに与えられた共有アクセスポリシーには、少なくとも「Listen」クレームが必要です。

- **私のEvent Hubsがデータを返していないのはなぜですか？**

 ClickHouseインスタンスがEvent Hubsのデプロイメントとは異なるリージョンまたは大陸にある場合、ClickPipesのオンボーディング中にタイムアウトが発生することやEvent Hubからデータを消費する際に高レイテンシが発生することがあります。パフォーマンスに悪影響を避けるために、ClickHouse CloudのデプロイメントとAzure Event Hubsのデプロイメントを近いクラウドリージョンに配置することはベストプラクティスと見なされます。

- **Azure Event Hubsにポート番号を含めるべきですか？**

  はい。ClickPipesは、Kafkaインターフェースのポート番号を含めることを期待しており、ポート番号は`:9093`である必要があります。

- **ClickPipes IPはAzure Event Hubsに関連していますか？**

  はい。Event Hubsインスタンスへのトラフィックを制限する場合は、[文書化された静的NAT IP](./index.md#list-of-static-ips)を追加してください。

- **接続文字列はEvent Hubのものですか、それともEvent Hub名称空間のものですか？**

  両方とも機能しますが、複数のEvent Hubsからサンプルを取得するためには、名称空間レベルでの共有アクセスポリシーの使用をお勧めします。
