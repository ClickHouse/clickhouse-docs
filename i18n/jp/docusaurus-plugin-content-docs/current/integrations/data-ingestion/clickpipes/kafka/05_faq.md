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

### General \{#general\}

<details>

<summary>ClickPipes for Kafka はどのように動作しますか？</summary>

ClickPipes は、Kafka Consumer API を実行する専用アーキテクチャを使用して、指定されたトピックからデータを読み取り、そのデータを特定の ClickHouse Cloud サービス上の ClickHouse テーブルに挿入します。
</details>

<details>

<summary>ClickPipes と ClickHouse Kafka Table Engine の違いは何ですか？</summary>

Kafka Table エンジンは、ClickHouse サーバー自体が Kafka に接続し、イベントを取得してローカルに書き込む「プル型モデル」を実装する、ClickHouse のコア機能です。

ClickPipes は、ClickHouse サービスとは独立して動作する別個のクラウドサービスです。Kafka（またはその他のデータソース）に接続し、関連付けられた ClickHouse Cloud サービスにイベントをプッシュします。この疎結合アーキテクチャにより、優れた運用上の柔軟性、明確な関心の分離、スケーラブルなインジェスト、障害時のスムーズな管理、拡張性などが実現されます。
</details>

<details>

<summary>ClickPipes for Kafka を利用するための要件は何ですか？</summary>

ClickPipes for Kafka を使用するには、稼働中の Kafka ブローカーと、ClickPipes が有効化された ClickHouse Cloud サービスが必要です。また、ClickHouse Cloud からお使いの Kafka ブローカーにアクセスできることを確認する必要があります。これは、Kafka 側でリモート接続を許可し、Kafka の設定で [ClickHouse Cloud Egress IP アドレス](/manage/data-sources/cloud-endpoints-api) を許可リストに登録することで実現できます。あるいは、[AWS PrivateLink](/integrations/clickpipes/aws-privatelink) を使用して、ClickPipes for Kafka を Kafka ブローカーに接続することもできます。
</details>

<details>

<summary>ClickPipes for Kafka は AWS PrivateLink をサポートしていますか？</summary>

AWS PrivateLink はサポートされています。セットアップ方法の詳細については、[ドキュメント](/integrations/clickpipes/aws-privatelink) を参照してください。
</details>

<details>

<summary>ClickPipes for Kafka を使用して Kafka トピックにデータを書き込むことはできますか？</summary>

いいえ、ClickPipes for Kafka は Kafka トピックからデータを読み取るために設計されており、トピックへのデータ書き込みには対応していません。Kafka トピックにデータを書き込むには、専用の Kafka プロデューサーを使用する必要があります。
</details>

<details>

<summary>ClickPipes は複数のブローカーをサポートしますか？</summary>

はい、ブローカーが同じクォーラムの一部であれば、`,` で区切って一緒に設定できます。
</details>

<details>

<summary>ClickPipes のレプリカはスケールできますか？</summary>

はい、ストリーミング用の ClickPipes は水平・垂直の両方にスケール可能です。
水平スケーリングではレプリカを追加してスループットを向上させ、垂直スケーリングでは各レプリカに割り当てるリソース（CPU および RAM）を増やして、より負荷の高いワークロードに対応します。
これは ClickPipe の作成時、または任意のタイミングで **Settings** -> **Advanced Settings** -> **Scaling** から設定できます。
</details>

### Azure Event Hubs \{#azure-eventhubs\}

<details>

<summary>Azure Event Hubs の ClickPipe は Kafka サーフェスなしでも動作しますか？</summary>

いいえ。ClickPipes では、Kafka サーフェスが有効化された Event Hubs ネームスペースが必要です。これは **basic** より上位のティアでのみ利用可能です。詳細については、[Azure Event Hubs のドキュメント](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace) を参照してください。
</details>

<details>

<summary>Azure Schema Registry は ClickPipes と連携しますか？</summary>

いいえ。ClickPipes がサポートするのは、Confluent Schema Registry と API 互換なスキーマレジストリのみであり、Azure Schema Registry はこれに該当しません。このスキーマレジストリのサポートが必要な場合は、[弊社チームまでお問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。
</details>

<details>

<summary>Azure Event Hubs からデータを消費するために、ポリシーにはどのような権限が必要ですか？</summary>

トピックの一覧表示とイベントの消費を行うために、ClickPipes に付与する共有アクセス ポリシーには、最低でも「Listen」クレームが必要です。
</details>

<details>

<summary>Event Hubs からデータが返ってこないのはなぜですか？</summary>

ClickHouse インスタンスが Event Hubs のデプロイメントとは別のリージョンまたは大陸にある場合、ClickPipes のオンボード時にタイムアウトが発生したり、Event Hub からデータを消費する際のレイテンシーが高くなる可能性があります。パフォーマンスへの悪影響を避けるため、同じクラウドリージョン、もしくは互いに近いリージョンに ClickHouse Cloud と Azure Event Hubs をデプロイすることを推奨します。
</details>

<details>

<summary>Azure Event Hubs にはポート番号を含める必要がありますか？</summary>

はい。ClickPipes では Kafka サーフェスのポート番号を含める必要があり、その値は `:9093` である必要があります。
</details>

<details>

<summary>Azure Event Hubs では、ClickPipes の IP は依然として重要ですか？</summary>

はい。Event Hubs インスタンスへのトラフィックを制限するには、[ドキュメント記載の静的 NAT IP](../
/index.md#list-of-static-ips) を Event Hubs のネットワーク規則に追加してください。

</details>

<details>
<summary>接続文字列は Event Hub 向けですか、それとも Event Hub ネームスペース向けですか？</summary>

どちらも使用できます。複数の Event Hubs からデータを取得するために、**ネームスペースレベル** の共有アクセス ポリシーを使用することを強く推奨します。
</details>