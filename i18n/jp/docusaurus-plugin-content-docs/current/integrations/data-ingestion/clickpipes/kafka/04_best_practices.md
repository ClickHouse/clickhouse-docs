---
sidebar_label: 'ベストプラクティス'
description: 'Kafka ClickPipes を使用する際に推奨されるベストプラクティスの詳細'
slug: /integrations/clickpipes/kafka/best-practices
sidebar_position: 1
title: 'ベストプラクティス'
doc_type: 'guide'
keywords: ['Kafka ベストプラクティス', 'clickpipes', '圧縮', '認証', 'スケーリング']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# ベストプラクティス \{#best-practices\}

## メッセージ圧縮 \{#compression\}

Kafka トピックにはメッセージ圧縮の利用を強く推奨します。圧縮を行うことで、ほとんどパフォーマンスへの影響なしに、データ転送コストを大幅に削減できます。
Kafka におけるメッセージ圧縮についてさらに知るには、この[ガイド](https://www.confluent.io/blog/apache-kafka-message-compression/)から参照を始めることをおすすめします。

## 制限事項 \{#limitations\}

- [`DEFAULT`](/sql-reference/statements/create/table#default) はサポートされていません。
- 最小の (XS) レプリカサイズで実行している場合、個々のメッセージサイズはデフォルトで 8MB（非圧縮）、より大きなレプリカでは 16MB（非圧縮）に制限されます。この上限を超えるメッセージはエラーとなり、受け付けられません。さらに大きなメッセージが必要な場合は、サポートまでお問い合わせください。

## 配信セマンティクス \{#delivery-semantics\}

ClickPipes for Kafka では、`at-least-once` 配信セマンティクス（最も一般的に使用されるアプローチの 1 つ）を提供します。配信セマンティクスに関するフィードバックは、ぜひ[お問い合わせフォーム](https://clickhouse.com/company/contact?loc=clickpipes)からお寄せください。`exactly-once` セマンティクスが必要な場合は、公式の [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) シンクの利用を推奨します。

## 認証 \{#authentication\}

Apache Kafka プロトコルを使用するデータソースに対して、ClickPipes は TLS による暗号化を伴う [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) 認証に加え、`SASL/SCRAM-SHA-256` および `SASL/SCRAM-SHA-512` をサポートしています。ストリーミングソース（Redpanda、MSK など）によって、互換性に基づき、これらの認証方式すべて、またはいずれか一部のみが有効になります。認証要件がこれらと異なる場合は、[フィードバックをお寄せください](https://clickhouse.com/company/contact?loc=clickpipes)。

## Warpstream フェッチサイズ \{#warpstream-settings\}

ClickPipes は、任意の時点で単一の ClickPipes ノードで処理されるデータ量を制限するために、Kafka の `max.fetch_bytes` 設定に依存しています。一部の状況では
Warpstream がこの設定に従わず、その結果として予期しないパイプライン障害を引き起こす可能性があります。ClickPipes の障害を防ぐために、Warpstream エージェントを構成する際には、Warpstream 固有の設定である `kafkaMaxFetchPartitionBytesUncompressedOverride`
を 8MB（もしくはそれ以下）に設定することを強く推奨します。

### IAM \{#iam\}

:::info
MSK ClickPipe 用の IAM 認証はベータ機能です。
:::

ClickPipes は、次の AWS MSK 認証方式をサポートします。

* [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) 認証
* [IAM 認証情報またはロールベースのアクセス](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) による認証

IAM 認証を使用して MSK ブローカーに接続する場合、IAM ロールには必要な権限が付与されている必要があります。
以下は、MSK 向け Apache Kafka API に必要な IAM ポリシーの例です。

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


#### 信頼関係の構成 \{#configuring-a-trusted-relationship\}

IAM ロール ARN を使用して MSK に認証する場合、そのロールを引き受けられるように、ClickHouse Cloud インスタンスとの間に信頼関係を確立する必要があります。

:::note
ロールベースのアクセスは、AWS にデプロイされた ClickHouse Cloud インスタンスでのみ機能します。
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
相互 TLS (mTLS) ベースの認証に利用するクライアント証明書および鍵のアップロードにも対応しています。

## パフォーマンス \{#performance\}

### バッチ処理 \{#batching\}

ClickPipes はデータをバッチ単位で ClickHouse に挿入します。これは、データベース内にパーツが過剰に作成され、クラスターでパフォーマンス問題が発生することを防ぐためです。

バッチは、次のいずれかの条件を満たしたときに挿入されます。

- バッチサイズが最大値（100,000 行、またはポッドメモリ 1GB あたり 32MB）に達した場合
- バッチがオープンされた状態の継続時間が上限（5 秒）に達した場合

### レイテンシ \{#latency\}

レイテンシ（Kafka メッセージが生成されてから、そのメッセージが ClickHouse で利用可能になるまでの時間として定義）は、複数の要因（たとえば、ブローカーのレイテンシ、ネットワークのレイテンシ、メッセージのサイズやフォーマット）に左右されます。上のセクションで説明した[バッチ処理](#batching)もレイテンシに影響します。想定されるレイテンシを把握するため、ご利用のユースケースにおける典型的な負荷を用いてテストを実施することを常に推奨します。

ClickPipes はレイテンシに関していかなる保証も行いません。低レイテンシが必須となる特定の要件がある場合は、[こちらからお問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

### スケーリング \{#scaling\}

ClickPipes for Kafka は、水平方向および垂直方向にスケールできるように設計されています。デフォルトでは、コンシューマー 1 つで構成されるコンシューマーグループを作成します。これは ClickPipe 作成時、または任意のタイミングで **Settings** -> **Advanced Settings** -> **Scaling** から設定できます。

ClickPipes は、アベイラビリティゾーンに分散したアーキテクチャにより高可用性を提供します。
この高可用性を実現するには、少なくとも 2 つのコンシューマーへスケールさせる必要があります。

実行中のコンシューマー数に関係なく、フォールトトレランスは設計上確保されています。
コンシューマーまたはその基盤となるインフラストラクチャに障害が発生した場合でも、
ClickPipe はコンシューマーを自動的に再起動し、メッセージの処理を継続します。

### ベンチマーク \{#benchmarks\}

以下は ClickPipes for Kafka に関する非公式なベンチマーク結果であり、基準となるパフォーマンスの目安として利用できます。メッセージサイズ、データ型、データフォーマットなど、多くの要因がパフォーマンスに影響することに注意してください。実際の結果はさまざまな要因によって異なり、ここで示す数値は実際のパフォーマンスを保証するものではありません。

ベンチマークの詳細:

- ClickHouse 側の INSERT 処理がボトルネックにならないよう、十分なリソースを持つ本番用の ClickHouse Cloud サービスを使用しました。
- ClickHouse Cloud サービス、Kafka クラスター (Confluent Cloud)、および ClickPipe はすべて同じリージョン (`us-east-2`) で稼働していました。
- ClickPipe には、単一の L サイズのレプリカ (4 GiB の RAM と 1 vCPU) を設定しました。
- サンプルデータには、`UUID`、`String`、`Int` データ型が混在するネストされたデータを含めました。`Float`、`Decimal`、`DateTime` など、他のデータ型はパフォーマンスが低下する可能性があります。
- 圧縮データと非圧縮データの間で、パフォーマンスに有意な差は見られませんでした。

| レプリカサイズ | メッセージサイズ | データフォーマット | スループット |
|---------------|------------------|---------------------|--------------|
| Large (L)     | 1.6kb            | JSON                | 63mb/s       |
| Large (L)     | 1.6kb            | Avro                | 99mb/s       |