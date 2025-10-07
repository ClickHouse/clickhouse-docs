---
'sidebar_label': '最高のプラクティス'
'description': 'Kafka ClickPipesを扱う際に従うべき最良のプラクティスの詳細'
'slug': '/integrations/clickpipes/kafka/best-practices'
'sidebar_position': 1
'title': '最高のプラクティス'
'doc_type': 'guide'
---


# ベストプラクティス {#best-practices}

## メッセージ圧縮 {#compression}

Kafkaのトピックに対して圧縮を使用することを強くお勧めします。圧縮によりデータ転送コストを大幅に削減でき、ほとんどパフォーマンスに影響を与えません。Kafkaにおけるメッセージ圧縮について詳しく知りたい場合は、この [ガイド](https://www.confluent.io/blog/apache-kafka-message-compression/) から始めることをお勧めします。

## 制限事項 {#limitations}

- [`DEFAULT`](/sql-reference/statements/create/table#default) はサポートされていません。

## 配信セマンティクス {#delivery-semantics}
ClickPipes for Kafkaは、`at-least-once` 配信セマンティクスを提供します（最も一般的に使用されるアプローチの一つです）。配信セマンティクスについてのフィードバックをお待ちしています [フィードバックフォーム](https://clickhouse.com/company/contact?loc=clickpipes)。正確な1回のセマンティクスが必要な場合は、公式の [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) シンクの使用をお勧めします。

## 認証 {#authentication}
Apache Kafkaプロトコルのデータソースに対して、ClickPipesはTLS暗号化を用いた[SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html)認証、および`SASL/SCRAM-SHA-256`と`SASL/SCRAM-SHA-512`をサポートしています。ストリーミングソース（Redpanda、MSKなど）が互換性に基づいてこれらの認証メカニズムのすべてまたは一部を有効にします。認証ニーズが異なる場合は、ぜひ [フィードバックをください](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipeのIAM認証はベータ機能です。
:::

ClickPipesは次のAWS MSK認証をサポートしています

- [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 認証
- [IAMクレデンシャルまたはロールベースのアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) 認証

IAMロールが必要な権限を持っている必要があります。以下は、MSK用のApache Kafka APIに必要なIAMポリシーの例です。

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

IAMロールARNでMSKに認証する場合、ClickHouse Cloudインスタンスとの間に信頼関係を追加する必要があります。これによりロールを引き受けることができます。

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
ClickPipes for Kafkaは、公開されていないサーバー証明書を使用するKafkaブローカー用のカスタム証明書のアップロードをサポートしています。相互TLS (mTLS) に基づく認証のためにクライアント証明書とキーのアップロードもサポートされています。

## パフォーマンス {#performance}

### バッチ処理 {#batching}
ClickPipesは、データをバッチ単位でClickHouseに挿入します。これは、データベース内で過度に多くのパーツを作成するのを避け、クラスターのパフォーマンスの問題を引き起こす可能性を減らすためです。

バッチは、以下の基準のいずれかを満たしたときに挿入されます。
- バッチサイズが最大サイズに達した場合（100,000行または1GBのポッドメモリあたり32MB）
- バッチが最大時間（5秒）開いていた場合

### レイテンシ {#latency}

レイテンシ（Kafkaメッセージが生成されてからClickHouseで利用可能になるまでの時間として定義される）は、いくつかの要因（ブローカーのレイテンシ、ネットワークのレイテンシ、メッセージのサイズ/フォーマットなど）に依存します。上記の [バッチ処理](#batching) に関してもレイテンシに影響を与える可能性があります。特定のユースケースを通常の負荷でテストして、期待されるレイテンシを確認することを常にお勧めします。

ClickPipesはレイテンシに関していかなる保証も提供しません。特定の低レイテンシ要件がある場合は、ぜひ [お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング {#scaling}

ClickPipes for Kafkaは、水平および垂直にスケールするように設計されています。デフォルトでは、1つのコンシューマを持つコンシューマグループを作成します。これはClickPipeの作成中、または **設定** -> **高度な設定** -> **スケーリング** のいずれかの時点で構成できます。

ClickPipesは、高可用性のために可用性ゾーンに分散したアーキテクチャを提供します。これには、最低2つのコンシューマへのスケーリングが必要です。

稼働中のコンシューマの数に関わらず、フォールトトレランスがデザインとして利用可能です。コンシューマまたはその基盤となるインフラストラクチャが失敗すると、ClickPipeは自動的にコンシューマを再起動し、メッセージの処理を続行します。

### ベンチマーク {#benchmarks}

以下は、ClickPipes for Kafkaの非公式なベンチマークです。これを使用して基本的なパフォーマンスのアイデアを得ることができます。メッセージのサイズ、データ型、データフォーマットなど、多くの要因がパフォーマンスに影響を与える可能性があることを知っておくことが重要です。結果は異なる場合があり、ここで示すものは実際のパフォーマンスを保証するものではありません。

ベンチマークの詳細：

- 生産環境のClickHouse Cloudサービスを使用し、挿入処理がClickHouse側でボトルネックにならないように十分なリソースを確保しました。
- ClickHouse Cloudサービス、Kafkaクラスタ（Confluent Cloud）、およびClickPipeはすべて同じリージョン（`us-east-2`）で実行されていました。
- ClickPipeは、1つのLサイズのレプリカ（4 GiBのRAMと1 vCPU）で構成されていました。
- サンプルデータには、`UUID`、`String`、および`Int`データ型の混合が含まれていました。他のデータ型（`Float`、`Decimal`、および`DateTime`など）は、パフォーマンスが低下する可能性があります。
- 圧縮データと非圧縮データのパフォーマンスには顕著な違いは見られませんでした。

| レプリカサイズ | メッセージサイズ | データフォーマット | スループット   |
|----------------|------------------|--------------------|----------------|
| Large (L)      | 1.6kb            | JSON               | 63mb/s         |
| Large (L)      | 1.6kb            | Avro               | 99mb/s         |
