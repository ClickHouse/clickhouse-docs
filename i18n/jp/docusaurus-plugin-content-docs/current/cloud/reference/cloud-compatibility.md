---
'slug': '/whats-new/cloud-compatibility'
'sidebar_label': 'クラウド互換性'
'title': 'クラウド互換性'
'description': 'このガイドでは、ClickHouseクラウドで機能的および運用上何が期待されるかについて概説します。'
---




# ClickHouse Cloud — 互換性ガイド

このガイドは、ClickHouse Cloudの機能的および運用上の期待についての概要を提供します。ClickHouse CloudはオープンソースのClickHouseディストリビューションに基づいていますが、アーキテクチャや実装にいくつかの違いがある場合があります。バックグラウンドとして、[ClickHouse Cloudの構築方法](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year)についてのこのブログを読むのは興味深く関連性があるかもしれません。

## ClickHouse Cloud アーキテクチャ {#clickhouse-cloud-architecture}
ClickHouse Cloudは、運用コストを大幅に削減し、スケールでClickHouseを実行する際のコストを軽減します。デプロイメントのサイズを事前に決定したり、高可用性のためにレプリケーションを設定したり、手動でデータをシャーディングしたり、ワークロードが増えたときにサーバーをスケールアップしたり、使用していないときにダウンさせたりする必要はありません—これらはすべて私たちが処理します。

これらの利点は、ClickHouse Cloudのアーキテクチャに基づく選択の結果です：
- コンピュートとストレージは分離されており、したがって別の次元に沿って自動的にスケールできるため、静的インスタンス構成でストレージまたはコンピュートを過剰にプロビジョニングする必要がありません。
- オブジェクトストレージの上にある階層型ストレージとマルチレベルキャッシングは、事実上無限のスケーリングを提供し、良好な価格/パフォーマンス比を提供するため、ストレージパーティションのサイズを事前に決定する必要がなく、高額なストレージコストについて心配する必要がありません。
- 高可用性はデフォルトでオンであり、レプリケーションは透過的に管理されるため、アプリケーションの構築やデータの分析に集中できます。
- 変動する継続的なワークロードのための自動スケーリングはデフォルトでオンであり、サービスのサイズを事前に決定したり、ワークロードが増えたときにサーバーをスケールアップしたり、活動が少ないときに手動でサーバーをスケールダウンしたりする必要がありません。
- 断続的なワークロードのためのシームレスなハイバーネーションはデフォルトでオンです。非活動期間の後、コンピュートリソースを自動的に一時停止し、新しいクエリが到着したときに透過的に再開するため、アイドル状態のリソースに対して支払う必要がありません。
- 高度なスケーリングコントロールは、追加のコスト管理のための自動スケーリング最大値を設定したり、専門的なパフォーマンス要件を持つアプリケーションのためにコンピュートリソースを予約する自動スケーリング最小値を設定する機能を提供します。

## 機能 {#capabilities}
ClickHouse Cloudは、オープンソースのClickHouseディストリビューションの中で厳選された機能セットへのアクセスを提供します。以下の表は、現在ClickHouse Cloudで無効になっているいくつかの機能を示しています。

### DDL構文 {#ddl-syntax}
ほとんどの場合、ClickHouse CloudのDDL構文はセルフマネージドインストールで利用可能なものと一致します。いくつかの注目すべき例外：
  - 現在サポートされていない`CREATE AS SELECT`のサポート。回避策として、`CREATE ... EMPTY ... AS SELECT`を使用し、そのテーブルに挿入することをお勧めします（例については[このブログ](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)を参照してください）。
  - 一部の実験的構文は無効にされている場合があります。たとえば、`ALTER TABLE ... MODIFY QUERY`ステートメント。
  - セキュリティ上の理由から、一部のイントロスペクション機能が無効にされている場合があります。たとえば、`addressToLine` SQL関数。
  - ClickHouse Cloudでは`ON CLUSTER`パラメータを使用しないでください-これは必要ありません。これらはほとんどが効果のない関数ですが、[マクロ](/operations/server-configuration-parameters/settings#macros)を使用しようとするとエラーが発生する可能性があります。マクロは通常、ClickHouse Cloudでは機能せず、必要ありません。

### データベースおよびテーブルエンジン {#database-and-table-engines}

ClickHouse Cloudはデフォルトで高可用性のあるレプリケートされたサービスを提供します。その結果、すべてのデータベースおよびテーブルエンジンは「Replicated」です。「Replicated」を指定する必要はありません—たとえば、`ReplicatedMergeTree`と`MergeTree`はClickHouse Cloudで使用されるときに同じです。

**サポートされているテーブルエンジン**

  - ReplicatedMergeTree（デフォルト、指定がない場合）
  - ReplicatedSummingMergeTree
  - ReplicatedAggregatingMergeTree
  - ReplicatedReplacingMergeTree
  - ReplicatedCollapsingMergeTree
  - ReplicatedVersionedCollapsingMergeTree
  - MergeTree（ReplicatedMergeTreeに変換される）
  - SummingMergeTree（ReplicatedSummingMergeTreeに変換される）
  - AggregatingMergeTree（ReplicatedAggregatingMergeTreeに変換される）
  - ReplacingMergeTree（ReplicatedReplacingMergeTreeに変換される）
  - CollapsingMergeTree（ReplicatedCollapsingMergeTreeに変換される）
  - VersionedCollapsingMergeTree（ReplicatedVersionedCollapsingMergeTreeに変換される）
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
ClickHouse CloudはHTTPS、ネイティブインターフェース、および[MySQLワイヤプロトコル](/interfaces/mysql)をサポートしています。Postgresなどの他のインターフェースのサポートはまもなく登場します。

### 辞書 {#dictionaries}
辞書は、ClickHouseでのルックアップを高速化するための一般的な方法です。ClickHouse Cloudは現在、PostgreSQL、MySQL、リモートおよびローカルのClickHouseサーバー、Redis、MongoDB、HTTPソースからの辞書をサポートしています。

### フェデレーションクエリ {#federated-queries}
私たちは、クラウド内でのクロスクラスター通信や、外部セルフマネージドClickHouseクラスターとの通信のために、フェデレーションClickHouseクエリをサポートしています。ClickHouse Cloudは現在、次の統合エンジンを使用したフェデレーションクエリをサポートしています：
  - Deltalake
  - Hudi
  - MySQL
  - MongoDB
  - NATS
  - RabbitMQ
  - PostgreSQL
  - S3

SQLite、ODBC、JDBC、Redis、HDFS、Hiveなどの一部外部データベースおよびテーブルエンジンとのフェデレーションクエリはまだサポートされていません。

### ユーザー定義関数 {#user-defined-functions}

ユーザー定義関数は、ClickHouseの最近の機能です。ClickHouse Cloudは現在SQL UDFのみをサポートしています。

### 実験的機能 {#experimental-features}

実験的機能は、サービスの展開の安定性を確保するためにClickHouse Cloudサービスでは無効になっています。

### Kafka {#kafka}

[Kafkaテーブルエンジン](/integrations/data-ingestion/kafka/index.md)はClickHouse Cloudで一般的に利用できません。代わりに、Kafka接続コンポーネントをClickHouseサービスから切り離すアーキテクチャを利用して、関心の分離を実現することをお勧めします。Kafkaストリームからデータを抽出するためには[ClickPipes](https://clickhouse.com/cloud/clickpipes)をお勧めします。あるいは、[Kafkaユーザーガイド](/integrations/data-ingestion/kafka/index.md)に記載されているプッシュベースの代替案を検討してください。

### 名前付きコレクション {#named-collections}

[名前付きコレクション](/operations/named-collections)は現在ClickHouse Cloudではサポートされていません。

## 運用デフォルトと考慮事項 {#operational-defaults-and-considerations}
以下はClickHouse Cloudサービスのデフォルト設定です。場合によっては、これらの設定はサービスの正しい動作を確保するために固定されており、他の場合には調整可能です。

### 運用制限 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTreeテーブルの`max_parts_in_total`設定のデフォルト値が100,000から10,000に引き下げられました。この変更の理由は、大量のデータパートがクラウド内のサービスの起動時間を遅くする可能性があることを観察したためです。大量のパーツは通常、意図せずに選択されたあまりにも細かいパーティションキーの選択を示しており、これを避けるべきです。デフォルトの変更により、これらのケースをより早く検出できるようになります。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
デフォルトの`100`からこのサーバーごとの設定を`1000`に増加させ、より多くの同時実行を許可します。これにより、提供されるティアサービスの`number of replicas * 1,000`の同時クエリが実現します。単一のレプリカに制限される基本ティアサービスでは`1000`の同時クエリを、`1000+`はスケールおよびエンタープライズに対して、構成されたレプリカの数に応じて許可されます。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
テーブル/パーティションを最大1TBまで削除できるように、設定を50GBから増加しました。

### システム設定 {#system-settings}
ClickHouse Cloudは変動するワークロードに合わせて調整されており、そのためほとんどのシステム設定は現在調整可能ではありません。ほとんどのユーザーがシステム設定を調整する必要がないと予想していますが、システムチューニングに関する質問がある場合は、ClickHouse Cloudサポートにお問い合わせください。

### 高度なセキュリティ管理 {#advanced-security-administration}
ClickHouseサービスを作成する一環として、デフォルトのデータベースと、このデータベースに広範な権限を持つデフォルトユーザーを作成します。この初期ユーザーは追加のユーザーを作成し、そのユーザーにこのデータベースへの権限を割り当てることができます。これを超えて、Kerberos、LDAP、またはSSL X.509証明書認証を使用してデータベース内の以下のセキュリティ機能を有効にする機能は、現在サポートされていません。

## ロードマップ {#roadmap}

私たちは、クラウド内での実行可能なUDFのサポートを導入し、多くの他の機能の需要を評価しています。フィードバックがあり、特定の機能をリクエストしたい場合は、[こちらから提出してください](https://console.clickhouse.cloud/support)。
