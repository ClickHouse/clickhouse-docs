---
'sidebar_label': 'FAQ'
'description': 'Kafka の ClickPipes に関するよくある質問'
'slug': '/integrations/clickpipes/kafka/faq'
'sidebar_position': 1
'title': 'Kafka ClickPipes FAQ'
'doc_type': 'guide'
---

## Kafka ClickPipes FAQ {#faq}

### General {#general}

<details>

<summary>ClickPipes for Kafkaはどのように機能しますか？</summary>

ClickPipesは、特定のトピックからデータを読み取るためにKafka Consumer APIを使用して専用のアーキテクチャを実行し、そのデータを特定のClickHouse CloudサービスのClickHouseテーブルに挿入します。
</details>

<details>

<summary>ClickPipesとClickHouse Kafka Table Engineの違いは何ですか？</summary>

Kafka Tableエンジンは、ClickHouseサーバー自体がKafkaに接続し、イベントをプルしてローカルに書き込む「プルモデル」を実装するClickHouseのコア機能です。

ClickPipesは、ClickHouseサービスとは独立して動作する別のクラウドサービスです。Kafka（または他のデータソース）に接続し、関連するClickHouse Cloudサービスにイベントをプッシュします。この分離されたアーキテクチャにより、優れた運用の柔軟性、明確な責任の分離、スケーラブルな取り込み、優れた障害管理、拡張性などが実現します。
</details>

<details>

<summary>ClickPipes for Kafkaを使用するための要件は何ですか？</summary>

ClickPipes for Kafkaを使用するには、稼働中のKafkaブローカーとClickPipesが有効になっているClickHouse Cloudサービスが必要です。また、ClickHouse CloudがKafkaブローカーにアクセスできるようにする必要があります。これは、Kafka側でリモート接続を許可し、Kafka設定で[ClickHouse Cloud出口IPアドレス](/manage/security/cloud-endpoints-api)をホワイトリストに登録することで実現できます。あるいは、[AWS PrivateLink](/integrations/clickpipes/aws-privatelink)を使用して、ClickPipes for KafkaをKafkaブローカーに接続できます。
</details>

<details>

<summary>ClickPipes for KafkaはAWS PrivateLinkをサポートしていますか？</summary>

AWS PrivateLinkはサポートされています。設定方法の詳細については、[ドキュメント](/integrations/clickpipes/aws-privatelink)を参照してください。
</details>

<details>

<summary>ClickPipes for Kafkaを使用してKafkaトピックにデータを書き込むことはできますか？</summary>

いいえ、ClickPipes for KafkaはKafkaトピックからデータを読み取るために設計されており、トピックにデータを書き込むためではありません。Kafkaトピックにデータを書き込むには、専用のKafkaプロデューサーを使用する必要があります。
</details>

<details>

<summary>ClickPipesは複数のブローカーをサポートしていますか？</summary>

はい、同じクオーラムの一部であれば、カンマで区切って一緒に構成できます。
</details>

<details>

<summary>ClickPipesのレプリカをスケールできますか？</summary>

はい、ClickPipes for streamingは水平方向と垂直方向の両方にスケールできます。水平方向のスケーリングはスループットを増加させるためにより多くのレプリカを追加し、垂直方向のスケーリングは各レプリカに割り当てるリソース（CPUとRAM）を増加させて、より集中的なワークロードを処理します。これはClickPipe作成時に、または**設定** -> **高度な設定** -> **スケーリング**でいつでも構成できます。
</details>

### Azure Event Hubs {#azure-eventhubs}

<details>

<summary>Azure Event Hubs ClickPipeはKafkaサーフェスなしで機能しますか？</summary>

いいえ。ClickPipesはEvent HubsネームスペースにKafkaサーフェスが有効であることを要求します。これは**基本**を超えるティアでのみ利用可能です。詳細については、[Azure Event Hubsのドキュメント](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-quickstart-kafka-enabled-event-hubs?tabs=passwordless#create-an-azure-event-hubs-namespace)を参照してください。
</details>

<details>

<summary>Azure Schema RegistryはClickPipesと連携しますか？</summary>

いいえ。ClickPipesは、Confluent Schema RegistryとAPI互換性のあるスキーマレジストリのみをサポートしており、Azure Schema Registryはこれに該当しません。このスキーマレジストリのサポートが必要な場合は、[私たちのチームにお問い合わせください](https://clickhouse.com/company/contact?loc=clickpipes)。
</details>

<details>

<summary>Azure Event Hubsから消費するために、私のポリシーにはどんな権限が必要ですか？</summary>

トピックをリストし、イベントを消費するためには、ClickPipesに与えられる共有アクセスポリシーは、少なくとも「Listen」クレームが必要です。
</details>

<details>

<summary>なぜ私のEvent Hubsがデータを返さないのですか？</summary>

ClickHouseインスタンスがEvent Hubsのデプロイメントと異なるリージョンまたは大陸にある場合、ClickPipesのオンボーディング時にタイムアウトが発生し、Event Hubからデータを消費する際に高いレイテンシが発生する可能性があります。性能オーバーヘッドを避けるために、ClickHouse CloudとAzure Event Hubsを同じクラウドリージョン、または近接するリージョンにデプロイすることをお勧めします。
</details>

<details>

<summary>Azure Event Hubsのポート番号を含めるべきですか？</summary>

はい。ClickPipesはKafkaサーフェスのポート番号を含むことを期待しており、それは`:9093`です。
</details>

<details>

<summary>ClickPipesのIPアドレスは、Azure Event Hubsに対して依然として関連性がありますか？</summary>

はい。Event Hubsインスタンスへのトラフィックを制限するために、[文書化された静的NAT IPs](../index.md#list-of-static-ips)を追加してください。
</details>

<details>
<summary>接続文字列はEvent Hubのものですか、それともEvent Hubネームスペースのものですか？</summary>

両方とも機能します。複数のEvent Hubsからサンプルを取得するために、**ネームスペースレベル**で共有アクセスポリシーを使用することを強く推奨します。
</details>
