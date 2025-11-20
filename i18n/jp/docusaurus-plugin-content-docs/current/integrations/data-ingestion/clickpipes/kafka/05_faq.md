---
sidebar_label: 'FAQ'
description: 'Kafka 向け ClickPipes に関するよくある質問'
slug: /integrations/clickpipes/kafka/faq
sidebar_position: 1
title: 'Kafka ClickPipes FAQ'
doc_type: 'guide'
keywords: ['kafka faq', 'clickpipes', 'upstash', 'azure event hubs', 'private link']
---



## Kafka ClickPipes FAQ {#faq}

### 全般 {#general}

<details>

<summary>Kafka用ClickPipesはどのように動作しますか？</summary>

ClickPipesは、Kafka Consumer APIを実行する専用アーキテクチャを使用して、指定されたトピックからデータを読み取り、特定のClickHouse Cloudサービス上のClickHouseテーブルにデータを挿入します。

</details>

<details>

<summary>
  ClickPipesとClickHouse Kafka Table
  Engineの違いは何ですか？
</summary>

Kafka Table engineは、ClickHouseサーバー自体がKafkaに接続し、イベントを取得してローカルに書き込む「プルモデル」を実装するClickHouseのコア機能です。

ClickPipesは、ClickHouseサービスとは独立して実行される別個のクラウドサービスです。Kafka（または他のデータソース）に接続し、関連するClickHouse Cloudサービスにイベントをプッシュします。この疎結合アーキテクチャにより、優れた運用柔軟性、明確な関心の分離、スケーラブルなデータ取り込み、適切な障害管理、拡張性などが実現されます。

</details>

<details>

<summary>Kafka用ClickPipesを使用するための要件は何ですか？</summary>

Kafka用ClickPipesを使用するには、実行中のKafkaブローカーとClickPipesが有効化されたClickHouse Cloudサービスが必要です。また、ClickHouse CloudがKafkaブローカーにアクセスできることを確認する必要があります。これは、Kafka側でリモート接続を許可し、Kafkaセットアップで[ClickHouse Cloud Egress IPアドレス](/manage/data-sources/cloud-endpoints-api)をホワイトリストに登録することで実現できます。または、[AWS PrivateLink](/integrations/clickpipes/aws-privatelink)を使用して、Kafka用ClickPipesをKafkaブローカーに接続することもできます。

</details>

<details>

<summary>Kafka用ClickPipesはAWS PrivateLinkをサポートしていますか？</summary>

AWS PrivateLinkはサポートされています。セットアップ方法の詳細については、[ドキュメント](/integrations/clickpipes/aws-privatelink)を参照してください。

</details>

<details>

<summary>
  Kafka用ClickPipesを使用してKafkaトピックにデータを書き込むことはできますか？
</summary>

いいえ、Kafka用ClickPipesはKafkaトピックからデータを読み取るために設計されており、データを書き込むためのものではありません。Kafkaトピックにデータを書き込むには、専用のKafkaプロデューサーを使用する必要があります。

</details>

<details>

<summary>ClickPipesは複数のブローカーをサポートしていますか？</summary>

はい、ブローカーが同じクォーラムの一部である場合、`,`で区切って一緒に設定できます。

</details>

<details>

<summary>ClickPipesレプリカはスケーリングできますか？</summary>

はい、ストリーミング用ClickPipesは水平方向と垂直方向の両方でスケーリングできます。
水平スケーリングはスループットを向上させるためにレプリカを追加し、垂直スケーリングは各レプリカに割り当てられるリソース（CPUとRAM）を増やして、より負荷の高いワークロードを処理します。
これは、ClickPipe作成時、または**Settings** -> **Advanced Settings** -> **Scaling**で任意の時点で設定できます。

</details>

### Azure Event Hubs {#azure-eventhubs}

<details>

<summary>
  Azure Event Hubs ClickPipeはKafkaサーフェスなしで動作しますか？
</summary>

いいえ。ClickPipesでは、Event Hubs名前空間でKafkaサーフェスが有効化されている必要があります。これは**basic**より上位のティアでのみ利用可能です。詳細については、[Azure Event Hubsドキュメント](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace)を参照してください。

</details>

<details>

<summary>Azure Schema RegistryはClickPipesで動作しますか？</summary>

いいえ。ClickPipesは、Confluent Schema RegistryとAPI互換性のあるスキーマレジストリのみをサポートしており、Azure Schema Registryはこれに該当しません。このスキーマレジストリのサポートが必要な場合は、[当社チームにお問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。

</details>

<details>

<summary>
  Azure Event Hubsから消費するために、ポリシーにはどのような権限が必要ですか？
</summary>

トピックをリスト表示してイベントを消費するには、ClickPipesに付与される共有アクセスポリシーに、最低限「Listen」クレームが必要です。

</details>

<details>

<summary>Event Hubsがデータを返さないのはなぜですか？</summary>

ClickHouseインスタンスがEvent Hubsデプロイメントとは異なるリージョンまたは大陸にある場合、ClickPipesのオンボーディング時にタイムアウトが発生したり、Event Hubからのデータ消費時にレイテンシが高くなったりする可能性があります。パフォーマンスのオーバーヘッドを回避するために、ClickHouse CloudとAzure Event Hubsを同じクラウドリージョン、または互いに近いリージョンにデプロイすることをお勧めします。

</details>

<details>

<summary>Azure Event Hubsにポート番号を含める必要がありますか？</summary>


はい。ClickPipesではKafkaサーフェスのポート番号として`:9093`を含める必要があります。

</details>

<details>

<summary>Azure Event HubsでもClickPipesのIPアドレスは必要ですか？</summary>

はい。Event Hubsインスタンスへのトラフィックを制限するには、[ドキュメント化された静的NAT IPアドレス](../
/index.md#list-of-static-ips)を追加してください。

</details>

<details>
<summary>接続文字列はEvent Hub用ですか、それともEvent Hub名前空間用ですか？</summary>

どちらでも動作します。複数のEvent Hubからサンプルを取得する場合は、**名前空間レベル**の共有アクセスポリシーを使用することを強く推奨します。

</details>
