---
sidebar_label: 'KafkaのためのClickPipes'
description: 'あなたのKafkaデータソースをClickHouse Cloudにシームレスに接続します。'
slug: /integrations/clickpipes/kafka
sidebar_position: 1
title: 'ClickHouse CloudとのKafkaの統合'
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


# ClickHouse CloudとのKafkaの統合
## 前提条件 {#prerequisite}
[ClickPipesの紹介](./index.md)に慣れていること。

## 最初のKafka ClickPipeの作成 {#creating-your-first-kafka-clickpipe}

1. あなたのClickHouse Cloudサービス用のSQLコンソールにアクセスします。

<Image img={cp_service} alt="ClickPipesサービス" size="md" border/>

2. 左側のメニューで`データソース`ボタンを選択し、「ClickPipeを設定」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

3. データソースを選択します。

<Image img={cp_step1} alt="データソースの種類の選択" size="lg" border/>

4. 名前、説明（オプション）、資格情報、その他の接続詳細を提供してフォームを埋めます。

<Image img={cp_step2} alt="接続詳細を埋める" size="lg" border/>

5. スキーマレジストリを設定します。Avroストリームには有効なスキーマが必要で、JSONにはオプションです。このスキーマは、選択されたトピックでの[AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)メッセージの解析またはJSONメッセージの検証に使用されます。
   - 解析できないAvroメッセージや検証に失敗したJSONメッセージは、エラーを生成します。
   - スキーマレジストリの「ルート」パス。例えば、Confluent CloudスキーマレジストリのURLは、`https://test-kk999.us-east-2.aws.confluent.cloud`のように、パスのないHTTPS URLです。ルートパスのみが指定されている場合、ステップ4でカラム名と型を決定するために使用されるスキーマは、サンプルのKafkaメッセージに埋め込まれたIDによって決まります。
   - 数値スキーマIDによってスキーマ文書に至るパス`/schemas/ids/[ID]`。スキーマIDを使用した完全なURLは、`https://registry.example.com/schemas/ids/1000`になります。
   - トピック名によってスキーマ文書に至るパス`/subjects/[subject_name]`。オプションとして、特定のバージョンを参照するために、URLに`/versions/[version]`を追加することもできます（そうしない場合、ClickPipesは最新バージョンを取得します）。スキーマサブジェクトを使用した完全なURLは、`https://registry.example.com/subjects/events`または`https://registry/example.com/subjects/events/versions/4`になります。

   すべての場合において、ClickPipesはメッセージに埋め込まれたスキーマIDに基づいて、レジストリから更新されたスキーマや異なるスキーマを自動的に取得します。メッセージが埋め込まれたスキーマIDなく書き込まれた場合、すべてのメッセージを解析するには、特定のスキーマIDまたはトピックを指定する必要があります。

6. トピックを選択すると、UIがトピックのサンプル文書を表示します。

<Image img={cp_step3} alt="データ形式とトピックの設定" size="lg" border/>

7. 次のステップでは、新しいClickHouseテーブルにデータを取り込むか、既存のテーブルを再利用するかを選択できます。画面内の指示に従ってテーブル名、スキーマ、設定を変更します。サンプルテーブルの上部に自分の変更をリアルタイムでプレビューできます。

<Image img={cp_step4a} alt="テーブル、スキーマ、および設定の設定" size="lg" border/>

   高度な設定をカスタマイズするために、提供されたコントロールを使うこともできます。

<Image img={cp_step4a3} alt="高度なコントロールを設定" size="lg" border/>

8. あるいは、既存のClickHouseテーブルにデータを取り込むことを決めることもできます。この場合、UIはソースのフィールドを選択した宛先テーブルのClickHouseフィールドにマッピングすることを許可します。

<Image img={cp_step4b} alt="既存のテーブルを使用" size="lg" border/>

9. 最後に、内部ClickPipesユーザーの権限を設定できます。

   **権限：** ClickPipesは宛先テーブルにデータを書くための専用ユーザーを作成します。この内部ユーザーの役割をカスタム役割または定義済みの役割の一つから選択できます：
   - `フルアクセス`：クラスターの完全なアクセス権を持ちます。宛先テーブルと一緒にMaterialized ViewまたはDictionaryを使用する場合に便利です。
   - `宛先テーブルのみに制限`：宛先テーブルのみの`INSERT`権限を持ちます。

<Image img={cp_step5} alt="権限" size="lg" border/>

10. 「設定を完了する」をクリックすると、システムがClickPipeを登録し、サマリーテーブルに表示されるようになります。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="削除通知" size="lg" border/>

   サマリーテーブルは、ClickHouse内のソースまたは宛先テーブルからサンプルデータを表示するためのコントロールを提供します。

<Image img={cp_destination} alt="宛先の表示" size="lg" border/>

   また、ClickPipeを削除するためのコントロールや、取り込みジョブの概要を表示するためのコントロールも提供します。

<Image img={cp_overview} alt="概要の表示" size="lg" border/>

11. **おめでとうございます！** 最初のClickPipeを正常に設定しました。これがストリーミングClickPipeであれば、リモートデータソースからリアルタイムでデータを取り込み続けます。

## サポートされるデータソース {#supported-data-sources}

| 名前                | ロゴ | タイプ   | ステータス          | 説明                                                                                       |
|----------------------|------|----------|----------------------|--------------------------------------------------------------------------------------------|
| Apache Kafka         | <Kafkasvg class="image" alt="Apache Kafkaロゴ" style={{width: '3rem', 'height': '3rem'}}/> | ストリーミング | 安定        | ClickPipesを設定し、Apache KafkaからClickHouse Cloudにストリーミングデータを取り込むことを開始します。 |
| Confluent Cloud      | <Confluentsvg class="image" alt="Confluent Cloudロゴ" style={{width: '3rem'}}/> | ストリーミング | 安定        | ConfluentとClickHouse Cloudの統合を通じて、その結合パワーを解放します。               |
| Redpanda             | <Image img={redpanda_logo} size="logo" alt="Redpandaロゴ"/> | ストリーミング | 安定        | ClickPipesを設定し、RedpandaからClickHouse Cloudにストリーミングデータを取り込むことを開始します。 |
| AWS MSK              | <Msksvg class="image" alt="AWS MSKロゴ" style={{width: '3rem', 'height': '3rem'}}/> | ストリーミング | 安定        | ClickPipesを設定し、AWS MSKからClickHouse Cloudにストリーミングデータを取り込むことを開始します。 |
| Azure Event Hubs     | <Azureeventhubssvg class="image" alt="Azure Event Hubsロゴ" style={{width: '3rem'}}/> | ストリーミング | 安定        | ClickPipesを設定し、Azure Event HubsからClickHouse Cloudにストリーミングデータを取り込むことを開始します。 |
| WarpStream           | <Warpstreamsvg class="image" alt="WarpStreamロゴ" style={{width: '3rem'}}/> | ストリーミング | 安定        | ClickPipesを設定し、WarpStreamからClickHouse Cloudにストリーミングデータを取り込むことを開始します。 |

さらに多くのコネクタがClickPipesに追加される予定です。詳細は[ご連絡ください](https://clickhouse.com/company/contact?loc=clickpipes)。

## サポートされるデータ形式 {#supported-data-formats}

サポートされる形式は以下です：
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### サポートされるデータ型 {#supported-data-types}

以下のClickHouseデータ型は、現在ClickPipesでサポートされています：

- 基本数値型 - \[U\]Int8/16/32/64 および Float32/64
- 大きな整数型 - \[U\]Int128/256
- Decimalタイプ
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64（UTCタイムゾーンのみ）
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- すべてのClickHouse LowCardinality型
- 上記の任意の型（Nullableを含む）を使用するキーと値を持つMap
- 上記の任意の型（Nullableを含む、1レベルの深さのみ）を使用する要素を持つTupleおよびArray

### Avro {#avro}
#### サポートされるAvroデータ型 {#supported-avro-data-types}

ClickPipesは、すべてのAvro原始型と複合型、および`time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros`, `duration`を除くすべてのAvro論理型をサポートします。Avroの`record`型はTupleに、`array`型はArrayに、`map`はMap（文字列キーのみ）に変換されます。一般的に、[ここ]( /interfaces/formats/Avro#data-types-matching)に記載されている変換が利用可能です。ClickPipesは、型変換時のオーバーフローや精度の喪失をチェックしないため、Avro数値型の正確な型一致を使用することをお勧めします。

#### Nullable型とAvroユニオン {#nullable-types-and-avro-unions}

AvroのNullable型は、`(T, null)`または`(null, T)`のユニオンスキーマを使用して定義され、Tは基本Avro型です。スキーマ推論中、そのようなユニオンはClickHouseの「Nullable」カラムにマッピングされます。ClickHouseは、`Nullable(Array)`, `Nullable(Map)`、および`Nullable(Tuple)`型をサポートしていません。これらの型のAvro nullユニオンは、非Nullableバージョンにマッピングされます（Avro Record型はClickHouseの命名Tupleにマッピングされます）。これらの型のAvroの「null」は次のように挿入されます：
- null Avro配列の場合、空のArray
- null Avro Mapの場合、空のMap
- null Avro Recordの場合、すべてのデフォルト/ゼロ値を持つ命名Tuple

ClickPipesは、他のAvroユニオンを含むスキーマを現在サポートしていません（これは、ClickHouseのVariantとJSONデータ型の成熟に伴って変更される可能性があります）。Avroスキーマが「非null」ユニオンを含む場合、ClickPipesはAvroスキーマとClickhouseカラム型とのマッピングを計算しようとするとエラーを生成します。

#### Avroスキーマ管理 {#avro-schema-management}

ClickPipesは、構成されたスキーマレジストリから、各メッセージ/イベントに埋め込まれたスキーマIDを使用してAvroスキーマを動的に取得し、適用します。スキーマの更新は自動的に検出され、処理されます。

現在、ClickPipesは[Confluent Schema Registry API](https://docs.confluent.io/platform/current/schema-registry/develop/api.html)を使用するスキーマレジストリとのみ互換性があります。Confluent KafkaおよびCloudに加えて、Redpanda、AWS MSK、Upstashスキーマレジストリも含まれます。現在、ClickPipesはAWS Glue SchemaレジストリやAzureスキーマレジストリとは互換性がありません（近日中に対応予定）。

取得したAvroスキーマとClickHouse宛先テーブル間のマッピングには以下のルールが適用されます：
- AvroスキーマがClickHouse宛先マッピングに含まれていないフィールドを含む場合、そのフィールドは無視されます。
- AvroスキーマにClickHouse宛先マッピングで定義されたフィールドが欠けている場合、ClickHouseカラムは「ゼロ」値（0または空の文字列）で埋められます。[DEFAULT](/sql-reference/statements/create/table#default)式は、現在ClickPipesのINSERTには評価されません（これはClickHouseサーバのデフォルト処理のアップデートを待っている一時的な制限です）。
- AvroスキーマフィールドとClickHouseカラムが互換性がない場合、その行/messageのINSERTは失敗し、失敗はClickPipesエラー表に記録されます。間接的な変換は複数サポートされています（数値型間の変換など）が、すべてではありません（例、Avroの`record`フィールドは`Int32`のClickHouseカラムには挿入できません）。

## Kafka仮想カラム {#kafka-virtual-columns}

次の仮想カラムは、Kafka互換ストリーミングデータソースに対してサポートされています。新しい宛先テーブルを作成するとき、`Add Column`ボタンを使用して仮想カラムを追加できます。

| 名前           | 説明                                           | 推奨データ型        |
|----------------|------------------------------------------------|----------------------|
| _key           | Kafkaメッセージキー                           | String               |
| _timestamp     | Kafkaタイムスタンプ（ミリ秒精度）            | DateTime64(3)        |
| _partition     | Kafkaパーティション                            | Int32                |
| _offset        | Kafkaオフセット                                | Int64                |
| _topic         | Kafkaトピック                                  | String               |
| _header_keys   | レコードヘッダー内のキーの並列配列           | Array(String)        |
| _header_values | レコードヘッダー内のヘッダーの並列配列       | Array(String)        |
| _raw_message   | 完全なKafkaメッセージ                          | String               |

_note_：_raw_message カラムはJSONデータにのみ推奨されます。ClickHouseの[`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions)関数を使用して、下流のマテリアライズドビューを埋める必要がある場合は、ClickPipesの性能を向上させるために、すべての「非仮想」カラムを削除することが有益です。

## 制限事項 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)はサポートされていません。

## 配信セマンティクス {#delivery-semantics}
KafkaのためのClickPipesは`at-least-once`配信セマンティクスを提供します（最も一般的に使用されるアプローチの一つとして）。配信セマンティクスについてのフィードバックをお待ちしています。[連絡フォーム](https://clickhouse.com/company/contact?loc=clickpipes)。厳密に一度のセマンティクスが必要な場合は、公式の[`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse)シンクの使用を推奨します。

## 認証 {#authentication}
Apache Kafkaプロトコルデータソース用に、ClickPipesは[SSL/TLS暗号化を伴うSASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html)認証、および`SASL/SCRAM-SHA-256`と`SASL/SCRAM-SHA-512`をサポートします。ストリーミングソース（Redpanda、MSKなど）によって、互換性に応じて、これらの認証メカニズムのすべてまたはサブセットが有効になります。あなたの認証ニーズが異なる場合は、ぜひ[フィードバック](https://clickhouse.com/company/contact?loc=clickpipes)をお寄せください。

### IAM {#iam}

:::info
MSK ClickPipeのIAM認証はベータ機能です。
:::

ClickPipesは、次のAWS MSK認証をサポートしています。

  - [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html)認証
  - [IAMクレデンシャルまたはロールベースのアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)認証

MSKブローカーに接続するためのIAM認証を使用する場合、IAMロールには必要な権限が必要です。以下は、MSK用のApache Kafka APIの必須IAMポリシーの例です：

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

IAMロールARNでMSKに認証を行う場合、ロールを引き受けることができるように、ClickHouse Cloudインスタンスとの間に信頼関係を追加する必要があります。

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
ClickPipes for Kafkaは、SASLおよび公的SSL/TLS証明書を持つKafkaブローカーのカスタム証明書のアップロードをサポートします。ClickPipe設定のSSL証明書セクションで証明書をアップロードできます。
:::note
SASL用の単一のSSL証明書のアップロードはサポートされていますが、相互TLS（mTLS）を使用するSSLは現在サポートされていないことに注意してください。
:::

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipesは、ClickHouseにデータをバッチで挿入します。これは、データベース内に多くのパーツを作成するのを避けるためで、クラスターのパフォーマンス問題を引き起こす可能性があります。

バッチは、次のいずれかの基準が満たされたときに挿入されます：
- バッチサイズが最大サイズ（100,000行または20MB）に達した
- バッチが開かれてから最大時間（5秒）が経過した

### レイテンシ {#latency}

レイテンシ（Kafkaメッセージが生成されてからClickHouseでメッセージが利用可能になるまでの時間）は、ブローカーのレイテンシ、ネットワークのレイテンシ、メッセージのサイズ/形式など、さまざまな要因に依存します。上記の[バッチ処理](#batching)は、レイテンシにも影響します。特定の負荷で期待されるレイテンシを確認するために、いつも一般的な負荷でテストすることをお勧めします。

ClickPipesはレイテンシに関して保証を提供していません。特定の低レイテンシ要件がある場合は、ぜひ[ご連絡ください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング {#scaling}

KafkaのためのClickPipesは、水平スケーリングするように設計されています。デフォルトでは、一つのコンシューマを持つコンシューマグループを作成します。この設定はClickPipeの詳細ビューでスケーリングコントロールを使って変更できます。

ClickPipesは高可用性を提供しており、可用性ゾーンが分散したアーキテクチャを持っています。このためには、少なくとも2つのコンシューマにスケールアップする必要があります。

実行中のコンシューマの数に関わらず、障害耐性は設計上提供されます。コンシューマやその基盤となるインフラが失敗した場合、ClickPipeはコンシューマを自動的に再起動し、メッセージの処理を続けます。

## F.A.Q {#faq}

### 一般 {#general}

- **ClickPipes for Kafkaはどのように機能しますか？**

  ClickPipesは、Kafka Consumer APIを実行する専用アーキテクチャを使用して、指定されたトピックからデータを読み取り、そのデータを特定のClickHouse CloudサービスのClickHouseテーブルに挿入します。

- **ClickPipesとClickHouse Kafkaテーブルエンジンの違いは何ですか？**

  Kafkaテーブルエンジンは、ClickHouseサーバがKafkaに接続し、イベントをプルしてからローカルに書き込む「プルモデル」を実装するClickHouseのコア機能です。

  ClickPipesは、ClickHouseサービスとは独立して実行される別のクラウドサービスで、Kafka（または他のデータソース）に接続し、関連するClickHouse Cloudサービスにイベントをプッシュします。この分離されたアーキテクチャは、優れた運用の柔軟性、明確な関心の分離、スケーラブルな取り込み、優れた障害管理、拡張性などを可能にします。

- **KafkaのためのClickPipesを使用するための要件は何ですか？**

  KafkaのためのClickPipesを使用するには、稼働中のKafkaブローカーとClickPipesが有効なClickHouse Cloudサービスが必要です。ClickHouse CloudがKafkaブローカーにアクセスできることを確認してください。これは、Kafka側でリモート接続を許可し、[ClickHouse CloudのEgress IPアドレス](/manage/security/cloud-endpoints-api)をKafka設定でホワイトリストに追加することで達成できます。

- **ClickPipes for KafkaはAWS PrivateLinkをサポートしていますか？**

  はい、AWS PrivateLinkがサポートされています。詳細については[ご連絡ください](https://clickhouse.com/company/contact?loc=clickpipes)。

- **ClickPipes for Kafkaを使用してKafkaトピックにデータを書き込むことはできますか？**

  いいえ、ClickPipes for KafkaはKafkaトピックからデータを読み取るために設計されており、そこに書き込むことはできません。Kafkaトピックにデータを書き込むには、専用のKafkaプロデューサを使用する必要があります。

- **ClickPipesは複数のブローカーをサポートしますか？**

  はい、ブローカーが同じクォーラムの一部であれば、`、`で区切って一緒に構成できます。

### Upstash {#upstash}

- **ClickPipesはUpstashをサポートしていますか？**

  はい。Upstash Kafka製品は、2024年9月11日に廃止期間に入り、6か月の間継続します。既存の顧客は、ClickPipesユーザーインターフェースの一般的なKafkaタイルを使用して、既存のUpstash Kafkaブローカーとの共存を続けることができます。既存のUpstash Kafka ClickPipesは、廃止通知の前は影響を受けません。廃止期間が終了すると、ClickPipeは機能を停止します。

- **ClickPipesはUpstashスキーマレジストリに対応していますか？**

  いいえ。ClickPipesはUpstash Kafkaスキーマレジストリには互換性がありません。

- **ClickPipesはUpstash QStashワークフローに対応していますか？**

  いいえ。QStashワークフローにKafka互換のインターフェースが導入されない限り、Kafka ClickPipesでは機能しません。

### Azure EventHubs {#azure-eventhubs}

- **Azure Event Hubs ClickPipeはKafkaサーフェイスなしで動作しますか？**

  いいえ。ClickPipesはAzure Event HubsにKafkaサーフェスを有効にする必要があります。Kafkaプロトコルは、標準、プレミアム、および専用SKUの価格テアのみでサポートされています。

- **AzureスキーマレジストリはClickPipesで機能しますか？**

  いいえ。ClickPipesはAzure Event Hubsスキーマレジストリには現在対応していません。

- **Azure Event Hubsから消費するために私のポリシーはどのような権限を必要としますか？**

  トピックをリストし、イベントを消費するために、ClickPipesに付与される共有アクセスポリシーは、最低でも「Listen」クレームが必要です。

- **私のEvent Hubsがデータを返さないのはなぜですか？**

  あなたのClickHouseインスタンスがEvent Hubsのデプロイメントと異なる地域や大陸にある場合、ClickPipesのオンボーディング中にタイムアウトが発生する可能性があり、Event Hubからデータを消費する際のレイテンシが高くなることがあります。ClickHouse CloudのデプロイメントとAzure Event Hubsのデプロイメントを、互いに近いクラウド地域に配置することがベストプラクティスとされている理由です。

- **Azure Event Hubsのポート番号を含めるべきですか？**

  はい。ClickPipesは、Kafkaサーフェスのポート番号を`:9093`で含めることを期待しています。

- **ClickPipes IPはまだAzure Event Hubsに関連していますか？**

  はい。Event Hubsインスタンスへのトラフィックを制限する場合は、[文書化された静的NAT IP](./index.md#list-of-static-ips)を追加してください。

- **接続文字列はEvent Hub用ですか、それともEvent Hubnamespace用ですか？**

  両方とも機能しますが、複数のEvent Hubsからサンプルを取得するには、namespaceレベルでの共有アクセスポリシーを使用することをお勧めします。
