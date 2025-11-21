---
sidebar_label: 'ベストプラクティス'
description: 'Kafka ClickPipes を使用する際のベストプラクティスの詳細'
slug: /integrations/clickpipes/kafka/best-practices
sidebar_position: 1
title: 'ベストプラクティス'
doc_type: 'guide'
keywords: ['kafka best practices', 'clickpipes', 'compression', 'authentication', 'scaling']
---



# ベストプラクティス {#best-practices}


## メッセージ圧縮 {#compression}

Kafkaトピックには圧縮の使用を強く推奨します。圧縮により、パフォーマンスへの影響をほぼ与えることなく、データ転送コストを大幅に削減できます。
Kafkaにおけるメッセージ圧縮の詳細については、この[ガイド](https://www.confluent.io/blog/apache-kafka-message-compression/)を参照することをお勧めします。


## 制限事項 {#limitations}

- [`DEFAULT`](/sql-reference/statements/create/table#default) はサポートされていません。


## 配信セマンティクス {#delivery-semantics}

ClickPipes for Kafkaは`at-least-once`配信セマンティクス（最も一般的に使用されるアプローチの1つ）を提供します。配信セマンティクスに関するフィードバックは[お問い合わせフォーム](https://clickhouse.com/company/contact?loc=clickpipes)からお寄せください。exactly-onceセマンティクスが必要な場合は、公式の[`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse)シンクの使用を推奨します。


## 認証 {#authentication}

Apache Kafkaプロトコルデータソースに対して、ClickPipesはTLS暗号化を使用した[SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html)認証、および`SASL/SCRAM-SHA-256`と`SASL/SCRAM-SHA-512`をサポートしています。ストリーミングソース(Redpanda、MSKなど)に応じて、互換性に基づいてこれらの認証メカニズムのすべてまたは一部が有効になります。認証要件が異なる場合は、[フィードバックをお寄せください](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM {#iam}

:::info
MSK ClickPipeのIAM認証はベータ機能です。
:::

ClickPipesは以下のAWS MSK認証をサポートしています

- [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html)認証
- [IAM認証情報またはロールベースアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html)認証

IAM認証を使用してMSKブローカーに接続する場合、IAMロールには必要な権限が必要です。
以下は、MSK用Apache Kafka APIに必要なIAMポリシーの例です:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["kafka-cluster:Connect"],
      "Resource": [
        "arn:aws:kafka:us-west-2:12345678912:cluster/clickpipes-testing-brokers/b194d5ae-5013-4b5b-ad27-3ca9f56299c9-10"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["kafka-cluster:DescribeTopic", "kafka-cluster:ReadData"],
      "Resource": [
        "arn:aws:kafka:us-west-2:12345678912:topic/clickpipes-testing-brokers/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["kafka-cluster:AlterGroup", "kafka-cluster:DescribeGroup"],
      "Resource": [
        "arn:aws:kafka:us-east-1:12345678912:group/clickpipes-testing-brokers/*"
      ]
    }
  ]
}
```

#### 信頼関係の設定 {#configuring-a-trusted-relationship}

IAMロールARNを使用してMSKに認証する場合、ロールを引き受けられるようにClickHouse Cloudインスタンスとの間に信頼関係を追加する必要があります。

:::note
ロールベースアクセスは、AWSにデプロイされたClickHouse Cloudインスタンスでのみ機能します。
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

ClickPipes for Kafkaは、非公開サーバー証明書を使用するKafkaブローカー用のカスタム証明書のアップロードをサポートしています。
相互TLS(mTLS)ベースの認証のために、クライアント証明書と鍵のアップロードもサポートされています。


## パフォーマンス {#performance}

### バッチ処理 {#batching}

ClickPipesはデータをバッチ単位でClickHouseに挿入します。これは、データベース内に過剰なパートが作成されることを防ぎ、クラスタのパフォーマンス問題を回避するためです。

バッチは、以下のいずれかの条件が満たされた時点で挿入されます:

- バッチサイズが最大サイズに達した場合(100,000行、またはポッドメモリ1GBあたり32MB)
- バッチが最大時間開かれている場合(5秒)

### レイテンシ {#latency}

レイテンシ(Kafkaメッセージが生成されてからClickHouseで利用可能になるまでの時間として定義)は、複数の要因(ブローカーレイテンシ、ネットワークレイテンシ、メッセージサイズ/形式など)に依存します。上記のセクションで説明した[バッチ処理](#batching)もレイテンシに影響を与えます。予想されるレイテンシを判断するために、典型的な負荷で特定のユースケースをテストすることを常に推奨します。

ClickPipesはレイテンシに関する保証を提供していません。特定の低レイテンシ要件がある場合は、[お問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング {#scaling}

ClickPipes for Kafkaは、水平および垂直方向にスケールするように設計されています。デフォルトでは、1つのコンシューマーを持つコンシューマーグループを作成します。これは、ClickPipe作成時、または**Settings** -> **Advanced Settings** -> **Scaling**で任意の時点で設定できます。

ClickPipesは、アベイラビリティゾーン分散アーキテクチャによる高可用性を提供します。
これには、少なくとも2つのコンシューマーへのスケーリングが必要です。

実行中のコンシューマー数に関わらず、設計上フォールトトレランスが利用可能です。
コンシューマーまたはその基盤となるインフラストラクチャに障害が発生した場合、
ClickPipeは自動的にコンシューマーを再起動し、メッセージの処理を継続します。

### ベンチマーク {#benchmarks}

以下は、ClickPipes for Kafkaの非公式ベンチマークであり、ベースラインパフォーマンスの一般的な目安として使用できます。メッセージサイズ、データ型、データ形式など、多くの要因がパフォーマンスに影響を与える可能性があることを理解することが重要です。結果は環境により異なる場合があり、ここで示す内容は実際のパフォーマンスを保証するものではありません。

ベンチマークの詳細:

- ClickHouse側の挿入処理によってスループットがボトルネックにならないよう、十分なリソースを持つ本番環境のClickHouse Cloudサービスを使用しました。
- ClickHouse Cloudサービス、Kafkaクラスタ(Confluent Cloud)、およびClickPipeはすべて同じリージョン(`us-east-2`)で実行されていました。
- ClickPipeは、単一のLサイズレプリカ(4 GiBのRAMと1 vCPU)で構成されていました。
- サンプルデータには、`UUID`、`String`、`Int`データ型が混在したネストされたデータが含まれていました。`Float`、`Decimal`、`DateTime`などの他のデータ型は、パフォーマンスが低下する可能性があります。
- 圧縮データと非圧縮データを使用した場合のパフォーマンスに顕著な差はありませんでした。

| レプリカサイズ | メッセージサイズ | データ形式 | スループット |
| ------------ | ------------ | ----------- | ---------- |
| Large (L)    | 1.6kb        | JSON        | 63mb/s     |
| Large (L)    | 1.6kb        | Avro        | 99mb/s     |
