---
sidebar_label: 'FAQ'
description: 'Kafka 向け ClickPipes に関するよくある質問'
slug: /integrations/clickpipes/kafka/faq
sidebar_position: 1
title: 'Kafka 向け ClickPipes に関する FAQ'
doc_type: 'guide'
keywords: ['kafka faq', 'clickpipes', 'upstash', 'azure event hubs', 'private link']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

## Kafka ClickPipes に関するよくある質問 \{#faq\}

### 一般 \{#general\}

<details>

<summary>Kafka 用 ClickPipes はどのように動作しますか？</summary>

ClickPipes は、Kafka Consumer API を実行する専用アーキテクチャを使用し、指定されたトピックからデータを読み取って、特定の ClickHouse Cloud サービス上の ClickHouse テーブルに挿入します。

</details>

<details>

<summary>
  ClickPipes と ClickHouse Kafka テーブルエンジンの違いは何ですか？
</summary>

Kafka テーブルエンジンは ClickHouse の中核機能であり、ClickHouse サーバー自身が Kafka に接続してイベントを取得し、そのデータをローカルに書き込む「プル型」モデルを実装しています。

ClickPipes は ClickHouse サービスとは独立して動作する別個のクラウドサービスです。Kafka（またはその他のデータソース）に接続し、関連付けられた ClickHouse Cloud サービスにイベントをプッシュします。この疎結合なアーキテクチャにより、優れた運用上の柔軟性、関心の明確な分離、スケーラブルなインジェスト、きめ細かな障害時のハンドリング、拡張性などが実現されます。

</details>

<details>

<summary>Kafka 用 ClickPipes を利用するための要件は何ですか？</summary>

Kafka 用 ClickPipes を使用するには、稼働中の Kafka ブローカーと、ClickPipes が有効化された ClickHouse Cloud サービスが必要です。また、ClickHouse Cloud から Kafka ブローカーへアクセスできるようにする必要があります。これは、Kafka 側でリモート接続を許可し、Kafka の設定で [ClickHouse Cloud の送信（Egress）IP アドレス](/manage/data-sources/cloud-endpoints-api) をホワイトリストに登録することで実現できます。代替手段として、[AWS PrivateLink](/integrations/clickpipes/aws-privatelink) を使用して、Kafka 用 ClickPipes を Kafka ブローカーに接続することも可能です。

</details>

<details>

<summary>Kafka 用 ClickPipes は AWS PrivateLink をサポートしていますか？</summary>

AWS PrivateLink はサポートされています。設定方法の詳細については、[ドキュメント](/integrations/clickpipes/aws-privatelink) を参照してください。

</details>

<details>

<summary>
  Kafka 用 ClickPipes を使用して Kafka トピックにデータを書き込むことはできますか？
</summary>

いいえ。Kafka 用 ClickPipes は Kafka トピックからデータを読み取るために設計されており、トピックへの書き込みには対応していません。Kafka トピックにデータを書き込むには、専用の Kafka プロデューサーを使用する必要があります。

</details>

<details>

<summary>ClickPipes は複数のブローカーをサポートしていますか？</summary>

はい、ブローカーが同じクォーラムに属している場合は、`,` 区切りでまとめて設定できます。

</details>

<details>

<summary>ClickPipes のレプリカはスケール可能ですか？</summary>

はい、ストリーミング向けの ClickPipes は水平方向および垂直方向の両方にスケールできます。
水平スケーリングではレプリカ数を増やしてスループットを向上させ、垂直スケーリングでは各レプリカに割り当てるリソース（CPU と RAM）を増やして、より負荷の高いワークロードに対応します。
これは ClickPipe 作成時、またはその後いつでも **Settings** -> **Advanced Settings** -> **Scaling** から設定できます。

</details>

### Azure Event Hubs \{#azure-eventhubs\}

<details>

<summary>
  Azure Event Hubs 向け ClickPipe は、Kafka サーフェスなしでも動作しますか？
</summary>

いいえ。ClickPipes を利用するには、Event Hubs のネームスペースで Kafka サーフェスを有効化する必要があります。これは **basic** より上位のティアでのみ利用可能です。詳細は [Azure Event Hubs のドキュメント](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace) を参照してください。
</details>

<details>

<summary>Azure Schema Registry は ClickPipes と連携しますか？</summary>

いいえ。ClickPipes がサポートするのは、Confluent Schema Registry と API 互換性のあるスキーマレジストリのみであり、Azure Schema Registry はこれに該当しません。このスキーマレジストリのサポートが必要な場合は、[弊社担当までお問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。
</details>

<details>

<summary>
  Azure Event Hubs からイベントを取得するために、ポリシーにはどのような権限が必要ですか？
</summary>

トピックを一覧表示しイベントを取得するには、ClickPipes に付与する共有アクセス ポリシーに、最低限「Listen」クレームが必要です。
</details>

<details>

<summary>Event Hubs からデータが返ってこないのはなぜですか？</summary>

ClickHouse インスタンスが Event Hubs のデプロイメントとは異なるリージョンや大陸にある場合、ClickPipes のオンボーディング時にタイムアウトが発生したり、Event Hub からデータを取得する際に高いレイテンシーが発生したりする可能性があります。パフォーマンス上のオーバーヘッドを回避するため、ClickHouse Cloud と Azure Event Hubs は同じクラウドリージョン、または地理的に近接したリージョンにデプロイすることを推奨します。
</details>

<details>

<summary>Azure Event Hubs にはポート番号を含める必要がありますか？</summary>

はい。ClickPipes は Kafka サーフェス用のポート番号が指定されていることを想定しており、その値は `:9093` である必要があります。
</details>

<details>

<summary>Azure Event Hubs でも ClickPipes の IP は重要ですか？</summary>

はい。Event Hubs インスタンスへのトラフィックを制限するには、[ドキュメントに記載されている固定 NAT IP](../
/index.md#list-of-static-ips) を追加してください。
</details>

<details>
<summary>接続文字列は Event Hub 用ですか、それとも Event Hub ネームスペース用ですか？</summary>

どちらも機能します。複数の Event Hubs からサンプルを取得するため、**ネームスペース レベル** の共有アクセス ポリシーを使用することを強く推奨します。
</details>