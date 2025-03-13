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
[ClickPipesの紹介](./index.md)に目を通してください。

## 最初のKafka ClickPipeを作成する {#creating-your-first-kafka-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<img src={cp_service} alt="ClickPipes service" />


2. 左側のメニューから`Data Sources`ボタンを選択し、「ClickPipeを設定」をクリックします。

<img src={cp_step0} alt="Select imports" />

3. データソースを選択します。

<img src={cp_step1} alt="Select data source type" />

4. ClickPipeに名前、説明（オプション）、認証情報、その他の接続詳細を提供してフォームに入力します。

<img src={cp_step2} alt="Fill out connection details" />

5. スキーマレジストリを構成します。Avroストリームには有効なスキーマが必要で、JSONにはオプションとなります。このスキーマは、選択したトピックの[AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)の解析またはJSONメッセージの検証に使用されます。
- 解析できないAvroメッセージや、検証に失敗したJSONメッセージはエラーを生成します。
- スキーマレジストリの「ルート」パス。たとえば、Confluent CloudスキーマレジストリのURLは、パスがないHTTPS URLのようになります。`https://test-kk999.us-east-2.aws.confluent.cloud` ルートパスのみが指定された場合、ステップ4でのカラム名と型を決定するために使用されるスキーマは、サンプルKafkaメッセージに埋め込まれたIDによって決まります。
- 数値スキーマIDによるスキーマ文書へのパス`/schemas/ids/[ID]`。スキーマIDを使用した完全なURLは`https://registry.example.com/schemas/ids/1000`
- サブジェクト名によるスキーマ文書へのパス`/subjects/[subject_name]`。オプションで、特定のバージョンは、URLに`/versions/[version]`を追加することで参照できます（そうでない場合、ClickPipesは最新バージョンを取得します）。サブジェクトスキーマを使用した完全なURLは`https://registry.example.com/subjects/events`または`https://registry/example.com/subjects/events/versions/4`

すべての場合において、ClickPipesはメッセージに埋め込まれたスキーマIDによって示される場合、スキーマレジストリから更新または異なるスキーマを自動的に取得します。メッセージが埋め込まれたスキーマIDなしで書き込まれた場合は、すべてのメッセージを解析するために特定のスキーマIDまたはサブジェクトを指定する必要があります。

6. トピックを選択すると、UIにトピックからのサンプル文書が表示されます。

<img src={cp_step3} alt="Set data format and topic" />

7. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面の指示に従って、テーブル名、スキーマ、および設定を変更します。サンプルテーブルのリアルタイムプレビューが上部に表示されます。

<img src={cp_step4a} alt="Set table, schema, and settings" />

  提供されたコントロールを使用して、高度な設定をカスタマイズすることもできます。

<img src={cp_step4a3} alt="Set advanced controls" />

8. もしくは、既存のClickHouseテーブルにデータを取り込むこともできます。この場合、UIはソースからClickHouseフィールドにフィールドをマップできるようにします。

<img src={cp_step4b} alt="Use an existing table" />

9. 最後に、内部ClickPipesユーザーの権限を設定できます。

  **権限:** ClickPipesは、宛先テーブルにデータを書き込むための専用ユーザーを作成します。この内部ユーザーの役割をカスタムロールまたは事前定義されたロールの一つを使用して選択できます。
    - `フルアクセス`: クラスタへのフルアクセス。これは、宛先テーブルでMaterialized ViewまたはDictionaryを使用する場合に有効です。
    - `宛先テーブルのみ`: 宛先テーブルに対する`INSERT`権限のみ。

<img src={cp_step5} alt="Permissions" />

10. 「設定完了」をクリックすると、システムがClickPipeを登録し、要約テーブルに表示されます。

<img src={cp_success} alt="Success notice" />

<img src={cp_remove} alt="Remove notice" />

  要約テーブルは、ClickHouse内のソースまたは宛先テーブルからサンプルデータを表示するコントロールを提供します。

<img src={cp_destination} alt="View destination" />

  また、ClickPipeを削除し、取り込みジョブの要約を表示するコントロールも提供されます。

<img src={cp_overview} alt="View overview" />

11. **おめでとうございます！** あなたは最初のClickPipeを正常に設定しました。これがストリーミングClickPipeであれば、リアルタイムでリモートデータソースからデータを継続的に取り込む状態になります。

## サポートされているデータソース {#supported-data-sources}

| 名称                 | ロゴ| タイプ| ステータス          | 説明                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング| 安定          | ClickPipesを設定し、Apache KafkaからClickHouse Cloudにストリーミングデータを取り込み始めます。     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>| ストリーミング| 安定          | ConfluentとClickHouse Cloudの統合による強力な能力を解放します。          |
| Redpanda             |<img src={redpanda_logo} class="image" alt="Redpanda logo" style={{width: '2.5rem', 'background-color': 'transparent'}}/>| ストリーミング| 安定          | ClickPipesを設定し、RedpandaからClickHouse Cloudにストリーミングデータを取り込み始めます。         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>| ストリーミング| 安定          | ClickPipesを設定し、AWS MSKからClickHouse Cloudにストリーミングデータを取り込み始めます。          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>| ストリーミング| 安定          | ClickPipesを設定し、Azure Event HubsからClickHouse Cloudにストリーミングデータを取り込み始めます。 |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>| ストリーミング| 安定          | ClickPipesを設定し、WarpStreamからClickHouse Cloudにストリーミングデータを取り込み始めます。       |

より多くのコネクタがClickPipesに追加される予定です。詳細については、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

## サポートされているデータフォーマット {#supported-data-formats}

サポートされているフォーマットは：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### サポートされているデータタイプ {#supported-data-types}

以下のClickHouseデータタイプが現在ClickPipesでサポートされています：

- 基本数値型 - \[U\]Int8/16/32/64およびFloat32/64
- 大きな整数型 - \[U\]Int128/256
- 小数型
- ブール型
- 文字列型
- 固定文字列型
- 日付型、Date32
- 日時型、DateTime64（UTCタイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記のいずれかの型（Nullableを含む）を使用するマップ
- 上記のいずれかの型（Nullableを含む、一レベル深さのみ）を使用するタプルと配列

### Avro {#avro}
#### サポートされているAvroデータタイプ {#supported-avro-data-types}

ClickPipesは、すべてのAvroプライマリおよび複合型、及び`time-millis`、`time-micros`、`local-timestamp-millis`、`local_timestamp-micros`、`duration`を除くすべてのAvro論理型をサポートします。Avro `record`型はタプルに変換され、`array`型は配列に変換され、`map`はマップ（文字列キーのみ）に変換されます。一般的に、[ここに](https://interfaces/formats/Avro#data-types-matching)リストされた変換が利用可能です。ClickPipesは、型変換時にオーバーフローや精度損失をチェックしないため、Avro数値型の厳密な型マッチングを使用することをお勧めします。

#### Nullable型とAvroのユニオン {#nullable-types-and-avro-unions}

Avroのnullable型は、`(T, null)`または`(null, T)`のユニオンスキーマを使用して定義され、TはベースのAvro型です。スキーマ推論中に、そのようなユニオンはClickHouseの「Nullable」カラムにマップされます。ClickHouseは、`Nullable(Array)`、`Nullable(Map)`、または`Nullable(Tuple)`タイプをサポートしていません。これらの型に対するAvroのnullユニオンは、非nullableバージョンにマップされます（Avro Record型はClickHouseの名前付きタプルにマップされます）。これらの型に対するAvroの「null」は次のように挿入されます：
- nullのAvro配列に対して空の配列
- nullのAvroマップに対して空のマップ
- nullのAvroレコードに対してすべてのデフォルトまたはゼロ値を持つ名前付きタプル

ClickPipesは、現在他のAvroユニオンを含むスキーマをサポートしていません（これは、ClickHouseのVariantおよびJSONデータ型の成熟に伴って将来的に変更される可能性があります）。Avroスキーマに「非null」ユニオンが含まれている場合、ClickPipesはAvroスキーマとClickhouseカラム型の間のマッピングを計算しようとするとエラーが発生します。

#### Avroスキーマ管理 {#avro-schema-management}

ClickPipesは、各メッセージ/イベントに埋め込まれたスキーマIDを使用して、設定されたスキーマレジストリからAvroスキーマを動的に取得し、適用します。スキーマの更新は自動的に検出され、処理されます。

現在、ClickPipesは[Confluent Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html)を使用するスキーマレジストリとのみ互換性があります。これには、Confluent KafkaおよびCloudに加えて、Redpanda、AWS MSK、およびUpstashスキーマレジストリが含まれます。ClickPipesは現在、AWS GlueスキーマレジストリまたはAzureスキーマレジストリとは互換性がありません（近日対応予定）。

取得したAvroスキーマとClickHouseの宛先テーブル間のマッピングには、次のルールが適用されます：
- AvroスキーマにClickHouse宛先マッピングに含まれていないフィールドが含まれている場合、そのフィールドは無視されます。
- AvroスキーマにClickHouse宛先マッピングで定義されたフィールドが不足している場合、ClickHouseカラムは「ゼロ」値（0や空文字列など）で埋められます。[DEFAULT](/sql-reference/statements/create/table#default)式は、現在ClickPipesの挿入に対して評価されません（これはClickHouseサーバーのデフォルト処理に関する一時的な制限です）。
- AvroスキーマフィールドとClickHouseカラムが互換性がない場合、その行/メッセージの挿入は失敗し、失敗はClickPipesのエラーテーブルに記録されます。いくつかの暗黙の型変換（数値型間の変換など）はサポートされていますが、すべてではありません（例えば、Avro `record`フィールドを`Int32` ClickHouseカラムに挿入することはできません）。

## Kafka仮想カラム {#kafka-virtual-columns}

次の仮想カラムは、Kafka互換のストリーミングデータソースに対してサポートされています。新しい宛先テーブルを作成する際に、`Add Column`ボタンを使用して仮想カラムを追加できます。

| 名称           | 説明                                     | 推奨データ型           |
|----------------|-------------------------------------------------|-----------------------|
| _key           | Kafkaメッセージキー                               | 文字列                |
| _timestamp     | Kafkaタイムスタンプ（ミリ秒精度）                 | DateTime64(3)         |
| _partition     | Kafkaパーティション                                 | Int32                 |
| _offset        | Kafkaオフセット                                    | Int64                 |
| _topic         | Kafkaトピック                                     | 文字列                |
| _header_keys   | レコードヘッダー内のキーの並列配列               | Array(文字列)         |
| _header_values | レコードヘッダー内のヘッダーの並列配列           | Array(文字列)         |
| _raw_message   | 完全なKafkaメッセージ                              | 文字列                |

_raw_messageカラムは、JSONデータに対してのみ推奨されています。JSON文字列のみが必要なユースケース（ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して下流のMaterialized Viewを人口する際など）では、すべての「非仮想」カラムを削除するとClickPipesのパフォーマンスが向上する可能性があります。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)はサポートされていません。

## 配信セマンティクス {#delivery-semantics}
ClickPipes for Kafkaは、`at-least-once`配信セマンティクスを提供します（最も一般的に使用されるアプローチの一つとして）。配信セマンティクスに関するフィードバックをお待ちしています。 [お問い合わせフォーム](https://clickhouse.com/company/contact?loc=clickpipes)。正確に1回のセマンティクスが必要な場合は、公式の[`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse)シンクの使用をお勧めします。

## 認証 {#authentication}
Apache Kafkaプロトコルデータソースに対して、ClickPipesは、TLS暗号化を伴う[SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html)認証、ならびに`SASL/SCRAM-SHA-256`と`SASL/SCRAM-SHA-512`をサポートしています。ストリーミングソース（Redpanda、MSKなど）に応じて、これらの認証メカニズムのすべてまたはサブセットが互換性に基づいて有効になります。認証要件が異なる場合は、[フィードバックをお寄せください](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipe用のIAM認証はベータ機能です。
:::

ClickPipesは次のAWS MSK認証をサポートします。

  - [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html)認証
  - [IAM資格情報またはロールベースアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)認証

IAMロールARNを使用してMSKブローカーへの接続を認証する場合、IAMロールには必要な権限が必要です。以下は、MSKのApache Kafka APIに必要なIAMポリシーの例です。

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

IAMロールARNを使用してMSKに認証する場合、ClickHouse Cloudインスタンスとロールの間に信頼関係を追加する必要があります。

:::note
ロールベースアクセスはAWSにデプロイされたClickHouse Cloudインスタンスでのみ機能します。
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
ClickPipes for Kafkaは、SASLおよび公的SSL/TLS証明書を使用するKafkaブローカー用のカスタム証明書のアップロードをサポートします。ClickPipeの設定のSSL証明書セクションで証明書をアップロードできます。
:::note
Kラシュ、SASLとともに単一のSSL証明書のアップロードをサポートしていますが、相互TLS（mTLS）は現在サポートされていないことに注意してください。
:::

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipesは、ClickHouseにデータをバッチで挿入します。これは、データベース内にあまりにも多くのパーツを作成し、クラスタ内のパフォーマンスの問題を引き起こさないようにするためです。

次のいずれかの基準が満たされると、バッチが挿入されます：
- バッチサイズが最大サイズ（100,000行または20MB）に達したとき
- バッチがオープン状態で最大時間（5秒）保たれたとき

### レイテンシ {#latency}

レイテンシ（Kafkaメッセージが生成されてからメッセージがClickHouseで利用可能になるまでの時間）は、Brokerレイテンシ、ネットワークレイテンシ、メッセージサイズ/フォーマットなど、いくつかの要因に依存します。上記の[バッチ処理](#batching)もレイテンシに影響します。特定の負荷で期待されるレイテンシを決定するには、特定のユースケースでテストすることを常にお勧めします。

ClickPipesはレイテンシに関して一切の保証を提供しません。具体的な低レイテンシ要件がある場合は、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング {#scaling}

ClickPipes for Kafkaは水平方向にスケールするように設計されています。デフォルトでは、1つのコンシューマーを持つコンシューマグループを作成します。これはClickPipeの詳細ビューにあるスケーリングコントロールで変更できます。

ClickPipesは、高可用性を実現する可用性ゾーン分散アーキテクチャを提供します。このためには、少なくとも2つのコンシューマーにスケーリングする必要があります。

実行中のコンシューマーの数にかかわらず、障害耐性は設計上提供されます。コンシューマーまたはその基盤となるインフラストラクチャが失敗した場合、ClickPipeは自動的にコンシューマーを再起動し、メッセージの処理を続けます。

## F.A.Q {#faq}

### 一般 {#general}

- **ClickPipes for Kafkaはどのように機能しますか？**

  ClickPipesは、指定されたトピックからデータを読み取るためにKafka Consumer APIを実行する専用アーキテクチャを使用し、その後データを特定のClickHouse CloudサービスのClickHouseテーブルに挿入します。

- **ClickPipesとClickHouse Kafkaテーブルエンジンの違いは何ですか？**

  Kafkaテーブルエンジンは、ClickHouse自体がKafkaに接続し、イベントをプルしてローカルに書き込む「プルモデル」を実装するClickHouseのコア機能です。

  ClickPipesは、ClickHouseサービスから独立して実行される別のクラウドサービスで、Kafka（または他のデータソース）に接続してイベントを関連するClickHouse Cloudサービスにプッシュします。この分離されたアーキテクチャにより、オペレーション上の柔軟性、明確な関心の分離、スケーラブルな取り込み、優雅な障害管理、拡張性などが実現されます。

- **ClickPipes for Kafkaを使用するための要件は何ですか？**

  ClickPipes for Kafkaを使用するには、実行中のKafkaブローカーとClickPipesが有効化されたClickHouse Cloudサービスが必要です。また、ClickHouse CloudがKafkaブローカーにアクセスできるようにする必要があります。これは、Kafka側でリモート接続を許可し、Kafka設定で[ClickHouse Cloud Egress IPアドレス](/manage/security/cloud-endpoints-api)をホワイトリストに登録することで実現できます。

- **ClickPipes for KafkaはAWS PrivateLinkをサポートしていますか？**

  AWS PrivateLinkはサポートされています。詳細については[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

- **ClickPipes for Kafkaを使用してKafkaトピックにデータを書き込むことはできますか？**

  いいえ、ClickPipes for KafkaはKafkaトピックからデータを読むために設計されており、それにデータを書き込むためではありません。Kafkaトピックにデータを書き込むには、専用のKafkaプロデューサーを使用する必要があります。

- **ClickPipesは複数のブローカーをサポートしていますか？**

  はい、ブローカーが同じ過半数の一部である場合、それらを一緒に設定することができ、`,`で区切ることができます。

### Upstash {#upstash}

- **ClickPipesはUpstashをサポートしていますか？**

  はい。Upstash Kafka製品は、2024年9月11日に非推奨期間に入り、6か月間続きます。既存の顧客は、ClickPipesを使用して現行のUpstash Kafkaブローカーを引き続き使用できます。ClickPipesユーザーインターフェイスでの一般的なKafkaタイルを使用します。非推奨の通知前までは、既存のUpstash Kafka ClickPipesには影響はありません。非推奨期間が終了すると、ClickPipeは機能しなくなります。

- **ClickPipesはUpstashスキーマレジストリをサポートしていますか？**

  いいえ。ClickPipesはUpstash Kafkaスキーマレジストリとは互換性がありません。

- **ClickPipesはUpstash QStash Workflowをサポートしていますか？**

  いいえ。QStash WorkflowにKafka互換のインターフェースが導入されない限り、Kafka ClickPipesでは機能しません。

### Azure EventHubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipeはKafkaインターフェースなしで動作しますか？**

  いいえ。ClickPipesは、Azure Event HubsがKafkaインターフェースを有効にする必要があります。Kafkaプロトコルは、Standard、Premium、Dedicated SKUのみの価格帯でサポートされています。

- **AzureスキーマレジストリはClickPipesで動作しますか？**

  いいえ。ClickPipesは現在、Event Hubsスキーマレジストリとは互換性がありません。

- **Azure Event Hubsからデータを消費するために、私のポリシーはどのような権限が必要ですか？**

  トピックをリストし、イベントを消費するには、ClickPipesに与えられた共有アクセスポリシーが少なくとも「Listen」クレームを必要とします。

- **私のEvent Hubsがデータを返さないのはなぜですか？**

  あなたのClickHouseインスタンスがEvent Hubsのデプロイメントとは異なる地域または大陸にある場合、ClickPipesのオンボーディング時にタイムアウトが発生する可能性があり、Event Hubからデータを消費する際に高いレイテンシが発生する場合があります。パフォーマンスの悪影響を避けるために、ClickHouse CloudデプロイメントとAzure Event Hubsデプロイメントを近くのクラウドリージョンに配置することが最善のプラクティスとされています。

- **Azure Event Hubsのポート番号を含めるべきですか？**

  はい。ClickPipesは、Kafkaインターフェース用のポート番号を`:9093`として含めることを期待しています。

- **ClickPipesのIPはAzure Event Hubsでも関連性がありますか？**

  はい。Event Hubsインスタンスへのトラフィックを制限する場合は、[文書化された静的NAT IP](./index.md#list-of-static-ips)を追加してください。

- **接続文字列はEvent Hub用ですか、それともEvent Hub名前空間用ですか？**

  両方とも機能しますが、複数のEvent Hubsからサンプルを取得するためには、名前空間レベルでの共有アクセスポリシーを使用することをお勧めします。
