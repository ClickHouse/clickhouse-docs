---
'slug': '/whats-new/cloud-compatibility'
'sidebar_label': 'クラウドの互換性'
'title': 'クラウドの互換性'
'description': 'このガイドは、ClickHouse Cloudで期待される機能的及び運用的なことの概要を提供します。'
'doc_type': 'guide'
---


# ClickHouse Cloud 互換性ガイド

このガイドでは、ClickHouse Cloud の機能的および運用的な期待について説明します。ClickHouse Cloud はオープンソースの ClickHouse ディストリビューションに基づいていますが、アーキテクチャや実装にいくつかの違いがある場合があります。この背景については、[ClickHouse Cloud の構築方法に関するこのブログ](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year)を読むことをお勧めします。

## ClickHouse Cloud アーキテクチャ {#clickhouse-cloud-architecture}
ClickHouse Cloud は運用のオーバーヘッドを大幅に簡素化し、スケールで ClickHouse を運用するためのコストを削減します。デプロイメントのサイズを事前に決定する必要はなく、高可用性のためにレプリケーションを設定する必要もなく、データを手動でシャードする必要もなく、ワークロードが増加したときにサーバーをスケーリングアップしたり、使用していないときにスケーリングダウンする必要もありません。これらはすべて当社が対応します。

これらの利点は、ClickHouse Cloud の基盤となるアーキテクチャの選択に起因しています。
- コンピュートとストレージを分離し、別々の次元で自動的にスケーリングできるため、静的なインスタンス構成でストレージやコンピュートを過剰にプロビジョニングする必要がありません。
- オブジェクトストアの上に構築された階層型ストレージとマルチレベルのキャッシングにより、事実上制限のないスケーリングと良好な価格/性能比が提供されるため、ストレージパーティションのサイズを事前に決定し、高いストレージコストを心配する必要がありません。
- 高可用性はデフォルトで有効になっており、レプリケーションは透過的に管理されるため、アプリケーションの構築やデータの分析に集中できます。
- 変動する継続的なワークロードの自動スケーリングはデフォルトで有効になっているため、サービスのサイズを事前に決定したり、ワークロードが増加したときにサーバーをスケーリングアップしたり、アクティビティが少ないときに手動でサーバーをスケーリングダウンする必要がありません。
- 不定期なワークロードに対してはデフォルトでシームレスなハイバーネーションが有効になっています。活動が停止した後、コンピュートリソースを自動的に一時停止し、新しいクエリが到着したときに再び透過的に開始しますので、アイドルリソースに対して料金を支払う必要がありません。
- 高度なスケーリング制御により、追加のコスト管理のための自動スケーリング最大値や、特定のパフォーマンス要件を持つアプリケーションのための自動スケーリング最小値を設定できます。

## 機能 {#capabilities}
ClickHouse Cloud では、オープンソースの ClickHouse ディストリビューションにおけるキュレーションされた機能セットにアクセスできます。以下のテーブルでは、現在 ClickHouse Cloud で無効になっているいくつかの機能を記述しています。

### DDL 構文 {#ddl-syntax}
ほとんどの場合、ClickHouse Cloud の DDL 構文はセルフマネージドのインストールで利用可能なものと一致するはずです。いくつかの顕著な例外があります：
- `CREATE AS SELECT` のサポートは、現在利用できません。回避策として、`CREATE ... EMPTY ... AS SELECT` を使用し、その後そのテーブルにデータを挿入することをお勧めします（例については[こちらのブログ](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)を参照してください）。
- 一部の実験的な構文は無効になっている場合があります。たとえば、`ALTER TABLE ... MODIFY QUERY` ステートメント。
- セキュリティ上の理由から、一部のイントロスペクション機能が無効になっている場合があります。たとえば、`addressToLine` SQL 関数。
- ClickHouse Cloud では `ON CLUSTER` パラメータを使用しないでください - これらは不要です。これらは主に無効な関数ですが、[マクロ](/operations/server-configuration-parameters/settings#macros)を使用しようとするとエラーが発生する可能性があります。マクロは ClickHouse Cloud では動作しないことが多く、不要です。

### データベースおよびテーブルエンジン {#database-and-table-engines}

ClickHouse Cloud では、デフォルトで高可用性のあるレプリケートされたサービスが提供されます。その結果、すべてのデータベースおよびテーブルエンジンは「レプリケート」となります。「レプリケート」を指定する必要はありません - たとえば、`ReplicatedMergeTree` と `MergeTree` は ClickHouse Cloud では同一です。

**サポートされているテーブルエンジン**

- ReplicatedMergeTree（指定がない場合のデフォルト）
- ReplicatedSummingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- MergeTree（ReplicatedMergeTree に変換される）
- SummingMergeTree（ReplicatedSummingMergeTree に変換される）
- AggregatingMergeTree（ReplicatedAggregatingMergeTree に変換される）
- ReplacingMergeTree（ReplicatedReplacingMergeTree に変換される）
- CollapsingMergeTree（ReplicatedCollapsingMergeTree に変換される）
- VersionedCollapsingMergeTree（ReplicatedVersionedCollapsingMergeTree に変換される）
- URL
- View
- MaterializedView
- GenerateRandom
- Null
- Buffer
- Memory
- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

### インターフェース {#interfaces}
ClickHouse Cloud は HTTPS、ネイティブインターフェース、および [MySQL ワイヤプロトコル](/interfaces/mysql) をサポートします。Postgres などの他のインターフェースのサポートも間もなく登場します。

### 辞書 {#dictionaries}
辞書は、ClickHouse でのルックアップを加速するための一般的な方法です。現在、ClickHouse Cloud は PostgreSQL、MySQL、リモートおよびローカルの ClickHouse サーバー、Redis、MongoDB、および HTTP ソースからの辞書をサポートしています。

### フェデレーテッドクエリ {#federated-queries}
クラウド内でのクロスクラスター通信や、外部のセルフマネージド ClickHouse クラスターとの通信のために、フェデレーテッド ClickHouse クエリをサポートしています。現在、ClickHouse Cloud は以下の統合エンジンを使用したフェデレーテッドクエリをサポートしています：
- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

SQLite、ODBC、JDBC、Redis、HDFS、および Hive などの一部の外部データベースおよびテーブルエンジンとのフェデレーテッドクエリはまだサポートされていません。

### ユーザー定義関数 {#user-defined-functions}

ユーザー定義関数は ClickHouse の最近の機能です。現在、ClickHouse Cloud は SQL UDF のみをサポートしています。

### 実験的機能 {#experimental-features}

実験的機能は ClickHouse Cloud サービスで無効にされており、サービスデプロイメントの安定性を確保しています。

### Kafka {#kafka}

[Kafka テーブルエンジン](/integrations/data-ingestion/kafka/index.md) は ClickHouse Cloud では一般に利用可能ではありません。代わりに、Kafka 接続コンポーネントを ClickHouse サービスから切り離すアーキテクチャに依存することをお勧めします。データを Kafka ストリームから取得するために [ClickPipes](https://clickhouse.com/cloud/clickpipes) をお勧めします。あるいは、[Kafka ユーザーガイド](/integrations/data-ingestion/kafka/index.md) に記載されているプッシュベースの代替案を検討してください。

### 名前付きコレクション {#named-collections}

[名前付きコレクション](/operations/named-collections) は現在 ClickHouse Cloud ではサポートされていません。

## 運用デフォルトと考慮事項 {#operational-defaults-and-considerations}
以下は ClickHouse Cloud サービスのデフォルト設定です。場合によっては、これらの設定はサービスの正しい動作を確保するために固定されており、他の場合には調整可能です。

### 運用制限 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTree テーブルの `max_parts_in_total` 設定のデフォルト値は 100,000 から 10,000 に引き下げられました。この変更の理由は、大量のデータパーツがクラウド内のサービスの起動時間を遅くする可能性があることが観察されたためです。大量のパーツは、通常は誤って選択されるあまりにも細かいパーティションキーを示すことが多く、回避すべきです。デフォルトの変更により、これらのケースを早期に検出できるようになります。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
このサーバーごとの設定を、デフォルトの `100` から `1000` に引き上げて、より多くの同時処理を可能にしました。この設定により、オファーされたティアサービスに対しては `レプリカの数 * 1,000` の同時クエリが可能になります。Basic ティアサービスの場合は単一のレプリカに制限され `1000` の同時クエリが、Scale と Enterprise の場合は構成されたレプリカの数に応じて `1000+` の同時クエリが許可されます。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
テーブル/パーティションを最大 1TB までドロップできるようにするために、この設定を 50GB から引き上げました。

### システム設定 {#system-settings}
ClickHouse Cloud は可変ワークロードに合わせてチューニングされており、そのためほとんどのシステム設定は現時点では設定可能ではありません。ほとんどのユーザーにとってシステム設定をチューニングする必要はないと考えていますが、高度なシステムチューニングについて質問がある場合は、ClickHouse Cloud サポートにお問い合わせください。

### 高度なセキュリティ管理 {#advanced-security-administration}
ClickHouse サービスの作成の一環として、デフォルトのデータベースと、このデータベースへの広範な権限を持つデフォルトのユーザーを作成します。この初期ユーザーは、追加のユーザーを作成し、そのユーザーにこのデータベースの権限を割り当てることができます。この他に、Kerberos、LDAP、または SSL X.509 証明書認証を使用してデータベース内で次のセキュリティ機能を有効にする機能は現時点でサポートされていません。

## ロードマップ {#roadmap}

クラウドで実行可能な UDF のサポートを導入し、多くの他の機能の需要を評価しています。フィードバックがあり、特定の機能にリクエストしたい場合は、[こちらから提出してください](https://console.clickhouse.cloud/support)。
