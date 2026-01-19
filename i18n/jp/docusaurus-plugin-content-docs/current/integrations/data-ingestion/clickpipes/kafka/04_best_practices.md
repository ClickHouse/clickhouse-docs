---
sidebar_label: 'ベストプラクティス'
description: 'Kafka ClickPipes を使用する際のベストプラクティスの詳細'
slug: /integrations/clickpipes/kafka/best-practices
sidebar_position: 1
title: 'ベストプラクティス'
doc_type: 'guide'
keywords: ['kafka ベストプラクティス', 'clickpipes', '圧縮', '認証', 'スケーリング']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# ベストプラクティス \{#best-practices\}

## メッセージ圧縮 \{#compression\}

Kafka のトピックにはメッセージの圧縮を強く推奨します。圧縮を行うことで、パフォーマンスへの影響をほとんど伴わずに、データ転送コストを大幅に削減できます。
Kafka におけるメッセージ圧縮の詳細については、こちらの[ガイド](https://www.confluent.io/blog/apache-kafka-message-compression/)から読み始めることをおすすめします。

## 制限事項 \{#limitations\}

- [`DEFAULT`](/sql-reference/statements/create/table#default) はサポートされていません。

## 配信セマンティクス \{#delivery-semantics\}

Kafka 向け ClickPipes は、（最も一般的なアプローチの 1 つである）`at-least-once` 配信セマンティクスを提供します。配信セマンティクスについてのフィードバックは、ぜひ[お問い合わせフォーム](https://clickhouse.com/company/contact?loc=clickpipes)からお寄せください。厳密な `exactly-once` セマンティクスが必要な場合は、公式の [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) シンクのご利用を推奨します。

## 認証 \{#authentication\}

Apache Kafka プロトコルのデータソースに対して、ClickPipes は TLS 暗号化付きの [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 認証に加え、`SASL/SCRAM-SHA-256` および `SASL/SCRAM-SHA-512` をサポートしています。ストリーミングソース（Redpanda、MSK など）ごとに互換性に応じて、これらの認証メカニズムのすべて、またはいくつかのみが利用可能です。認証に関する要件が異なる場合は、[フィードバックをお寄せください](https://clickhouse.com/company/contact?loc=clickpipes)。

### IAM \{#iam\}

:::info
MSK ClickPipe 用の IAM 認証はベータ機能です。
:::

ClickPipes は、以下の AWS MSK 認証をサポートしています。

* [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 認証
* [IAM 資格情報またはロールベースのアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) による認証

IAM 認証を使用して MSK ブローカーに接続する場合、IAM ロールには必要な権限が付与されている必要があります。
以下は、Apache Kafka API を MSK で利用する際に必要となる IAM ポリシーの例です。

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


#### 信頼関係の設定 \{#configuring-a-trusted-relationship\}

IAM ロール ARN を使用して MSK に対して認証を行う場合、そのロールを引き受けられるようにするために、ClickHouse Cloud インスタンスとの間に信頼関係を追加する必要があります。

:::note
ロールベースのアクセスは、AWS 上にデプロイされた ClickHouse Cloud インスタンスでのみ動作します。
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


### カスタム証明書 \{#custom-certificates\}

ClickPipes for Kafka は、パブリックではないサーバー証明書を使用する Kafka ブローカー向けに、カスタム証明書のアップロードをサポートします。
相互 TLS (mTLS) 認証のために、クライアント証明書およびキーのアップロードもサポートしています。

## パフォーマンス \{#performance\}

### バッチ処理 \{#batching\}
ClickPipes はデータをバッチで ClickHouse に挿入します。これは、データベース内に多数のパーツが作成されてクラスタのパフォーマンス問題につながることを防ぐためです。

バッチは、以下のいずれかの条件を満たしたタイミングで挿入されます：
- バッチサイズが最大サイズに達した場合（ポッドメモリ 1GB あたり 100,000 行または 32MB）
- バッチが開かれてからの経過時間が上限（5 秒）に達した場合

### レイテンシ \{#latency\}

レイテンシ（Kafka メッセージが生成されてから、そのメッセージが ClickHouse で利用可能になるまでの時間）は、複数の要因（ブローカーのレイテンシ、ネットワークレイテンシ、メッセージサイズ/フォーマットなど）に依存します。上記のセクションで説明した[バッチ処理](#batching)もレイテンシに影響します。期待されるレイテンシを把握するため、代表的な負荷条件でお使いのユースケースを必ずテストすることを推奨します。

ClickPipes はレイテンシに関していかなる保証も行いません。特定の低レイテンシ要件がある場合は、[お問い合わせ](https://clickhouse.com/company/contact?loc=clickpipes)ください。

### スケーリング \{#scaling\}

ClickPipes for Kafka は、水平方向および垂直方向にスケールできるよう設計されています。デフォルトでは、1 つのコンシューマーを持つコンシューマーグループを作成します。これは ClickPipe の作成時、あるいはその後いつでも **Settings** -> **Advanced Settings** -> **Scaling** で設定できます。

ClickPipes は、アベイラビリティゾーンに分散したアーキテクチャにより高可用性を提供します。
そのためには、少なくとも 2 つのコンシューマーまでスケールさせる必要があります。

稼働中のコンシューマー数に関係なく、フォールトトレランスは設計上備わっています。
コンシューマーまたはその基盤インフラストラクチャが障害を起こした場合でも、
ClickPipe はコンシューマーを自動的に再起動し、メッセージ処理を継続します。

### ベンチマーク \{#benchmarks\}

以下は、ClickPipes for Kafka のベースラインとなるパフォーマンスの一般的な目安として利用できる、いくつかの非公式なベンチマークです。パフォーマンスには、メッセージサイズ、データ型、データフォーマットなど多くの要因が影響することを理解しておくことが重要です。実際の結果は異なる場合があり、ここで示す値は実際のパフォーマンスを保証するものではありません。

ベンチマークの詳細：

- ClickHouse 側での挿入処理がスループットのボトルネックとならないよう、十分なリソースを持つ本番用の ClickHouse Cloud サービスを使用しました。
- ClickHouse Cloud サービス、Kafka クラスタ（Confluent Cloud）、および ClickPipe はすべて同じリージョン（`us-east-2`）で動作していました。
- ClickPipe は、単一の L サイズレプリカ（4 GiB の RAM と 1 vCPU）で構成されていました。
- サンプルデータには、`UUID`、`String`、`Int` データ型が混在したネストされたデータが含まれていました。`Float`、`Decimal`、`DateTime` などの他のデータ型は、より低いパフォーマンスとなる可能性があります。
- 圧縮データと非圧縮データの間で、パフォーマンスに顕著な差はありませんでした。

| Replica Size  | Message Size | Data Format | Throughput |
|---------------|--------------|-------------|------------|
| Large (L)     | 1.6kb        |   JSON      | 63mb/s     |
| Large (L)     | 1.6kb        |   Avro      | 99mb/s     |