---
slug: /whats-new/cloud-compatibility
sidebar_label: クラウド互換性
title: クラウド互換性
---

# ClickHouse Cloud — 互換性ガイド

このガイドでは、ClickHouse Cloudで期待できる機能的および運用的な概要を提供します。ClickHouse CloudはオープンソースのClickHouseディストリビューションに基づいていますが、アーキテクチャや実装にいくつかの違いがあるかもしれません。この背景について興味深いと思われるのは、[ClickHouse Cloudをゼロから構築した方法](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year)に関するブログです。

## ClickHouse Cloudアーキテクチャ {#clickhouse-cloud-architecture}
ClickHouse Cloudは運用オーバーヘッドを大幅に簡素化し、ClickHouseを大規模に実行するためのコストを削減します。展開を事前に設定したり、高可用性のためにレプリケーションを設定したり、手動でデータをシャードしたり、ワークロードが増加したときにサーバーをスケールアップしたり、使用していないときにスケールダウンしたりする必要はありません——これらはすべて私たちが処理します。

これらの利点は、ClickHouse Cloudの基となるアーキテクチャの選択によるものです：
- コンピュートとストレージが分離されているため、別々の次元で自動的にスケーリングできるため、静的インスタンス構成でストレージやコンピュートのどちらも過剰にプロビジョニングする必要がありません。
- オブジェクトストア上の階層化ストレージとマルチレベルキャッシングは、実質的に無限のスケーリングと良好な価格/性能比を提供するため、ストレージパーティションを事前に設定したり、高コストを心配したりする必要はありません。
- 高可用性はデフォルトで有効で、レプリケーションは透過的に管理されるため、アプリケーションの構築やデータの分析に集中できます。
- 変動する継続的なワークロードに対する自動スケーリングはデフォルトで有効であるため、サービスを事前に設定したり、ワークロードが増加したときにサーバーをスケールアップしたり、アクティビティが少ないときに手動でスケールダウンしたりする必要はありません。
- 不定期なワークロードに対するシームレスな休止もデフォルトで有効です。私たちは、活動がない状態が続いた後にコンピュートリソースを自動的に一時停止し、新しいクエリが到着するとそれを透過的に再開しますので、不必要なリソースに対して料金を支払う必要がありません。
- 高度なスケーリング制御は、追加のコスト管理のための自動スケーリングの最大値を設定したり、特殊なパフォーマンス要件を持つアプリケーションのためにコンピュートリソースを予約したりするための自動スケーリングの最小値を設定する機能を提供します。

## 機能 {#capabilities}
ClickHouse Cloudは、オープンソースのClickHouseディストリビューションにおけるキュレーションされた機能セットへのアクセスを提供します。以下の表では、現在ClickHouse Cloudで無効になっているいくつかの機能を説明します。

### DDL構文 {#ddl-syntax}
ほとんどの場合、ClickHouse CloudのDDL構文はセルフマネージドインストールにあるものと一致するはずです。いくつかの顕著な例外：
  - 現在利用できない`CREATE AS SELECT`のサポート。代わりに、`CREATE ... EMPTY ... AS SELECT`を使用して、そのテーブルに挿入することをお勧めします（例については[こちらのブログ](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)をご覧ください）。
  - 一部の実験的構文は無効にされている可能性があります。たとえば、`ALTER TABLE … MODIFY QUERY`文。
  - セキュリティ上の理由から、一部のイントロスペクション機能は無効にされている可能性があります。たとえば、`addressToLine` SQL関数。
  - ClickHouse Cloudでは`ON CLUSTER`パラメータを使用しないでください——これらは不要です。これらは主にno-op関数ですが、[マクロ](/operations/server-configuration-parameters/settings#macros)を使用しようとするとエラーを引き起こすことがあります。マクロはClickHouse Cloudでは通常機能せず、必要ありません。

### データベースおよびテーブルエンジン {#database-and-table-engines}

ClickHouse Cloudは、デフォルトで高可用性のレプリケートサービスを提供します。そのため、すべてのデータベースおよびテーブルエンジンは「レプリケート」です。「レプリケート」を指定する必要はありません——たとえば、`ReplicatedMergeTree`と`MergeTree`はClickHouse Cloudで使用されるときに同じです。

**サポートされているテーブルエンジン**

  - ReplicatedMergeTree（デフォルト、指定されていない場合）
  - ReplicatedSummingMergeTree
  - ReplicatedAggregatingMergeTree
  - ReplicatedReplacingMergeTree
  - ReplicatedCollapsingMergeTree
  - ReplicatedVersionedCollapsingMergeTree
  - MergeTree（ReplicatedMergeTreeに変換）
  - SummingMergeTree（ReplicatedSummingMergeTreeに変換）
  - AggregatingMergeTree（ReplicatedAggregatingMergeTreeに変換）
  - ReplacingMergeTree（ReplicatedReplacingMergeTreeに変換）
  - CollapsingMergeTree（ReplicatedCollapsingMergeTreeに変換）
  - VersionedCollapsingMergeTree（ReplicatedVersionedCollapsingMergeTreeに変換）
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
ClickHouse CloudはHTTPS、ネイティブインターフェース、及び[MySQLワイヤプロトコル](/interfaces/mysql)をサポートしています。Postgresなどの他のインターフェースのサポートも近日中に予定されています。

### 辞書 {#dictionaries}
辞書はClickHouseにおけるルックアップを高速化するための一般的な方法です。ClickHouse Cloudは現在、PostgreSQL、MySQL、リモートおよびローカルのClickHouseサーバー、Redis、MongoDB、HTTPソースからの辞書をサポートしています。

### フェデレーテッドクエリ {#federated-queries}
私たちは、クラウド内のクロスクラスタ通信および外部セルフマネージドClickHouseクラスターとの通信のためのフェデレーテッドClickHouseクエリをサポートしています。ClickHouse Cloudは、以下の統合エンジンを使用するフェデレーテッドクエリを現在サポートしています：
  - Deltalake
  - Hudi
  - MySQL
  - MongoDB
  - NATS
  - RabbitMQ
  - PostgreSQL
  - S3

SQLite、ODBC、JDBC、Redis、HDFS、Hiveなど、一部の外部データベースおよびテーブルエンジンとのフェデレーテッドクエリはまだサポートされていません。

### ユーザー定義関数 {#user-defined-functions}

ユーザー定義関数はClickHouseの最近の機能です。ClickHouse Cloudは現在、SQL UDFのみをサポートしています。

### 実験的機能 {#experimental-features}

実験的機能は、サービスの安定性を確保するためにClickHouse Cloudサービスでは無効になっています。

### Kafka {#kafka}

[Kafkaテーブルエンジン](/integrations/data-ingestion/kafka/index.md)はClickHouse Cloudで一般提供されていません。代わりに、Kafka接続コンポーネントをClickHouseサービスからデカップリングするアーキテクチャを採用し、関心の分離を実現することをお勧めします。私たちは、Kafkaストリームからデータを取得するために[ClickPipes](https://clickhouse.com/cloud/clickpipes)を推奨します。あるいは、[Kafkaユーザーガイド](/integrations/data-ingestion/kafka/index.md)に記載されているプッシュベースの代替案を検討してください。

### 名前付きコレクション {#named-collections}

[名前付きコレクション](/operations/named-collections)は現在ClickHouse Cloudではサポートされていません。

## 運用デフォルトおよび考慮事項 {#operational-defaults-and-considerations}
以下はClickHouse Cloudサービスのデフォルト設定です。場合によっては、これらの設定はサービスの正しい動作を保証するために固定されており、他の場合は調整可能です。

### 運用制限 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTreeテーブルの`max_parts_in_total`設定のデフォルト値は100,000から10,000に引き下げられました。この変更の理由は、データの部品数が多いと、クラウド内でのサービスの起動時間が遅くなる可能性があるためです。部品数が多いことは通常、あまりにも細かいパーティションキーの選択を示しており、これは通常誤って行われ、避けるべきです。デフォルトの変更は、これらのケースを早期に検出することを可能にします。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
このサーバーごとの設定をデフォルトの`100`から`1000`に増加させ、より多くの同時実行を許可します。
これにより、提供されるティアサービスに対して`複製の数 * 1,000`の同時クエリが可能になります。
`1000`の同時クエリはベーシックティアサービスで単一のレプリカに制限され、`1000+`はスケールおよびエンタープライズで、構成されたレプリカの数に応じて異なります。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
この設定を50GBから1TBまでのテーブル/パーティションを削除できるように増加させました。

### システム設定 {#system-settings}
ClickHouse Cloudは変動するワークロードに最適化されており、そのためほとんどのシステム設定は現在調整可能ではありません。ほとんどのユーザーにとってシステム設定を調整する必要がないと考えていますが、高度なシステムチューニングに関する質問がある場合は、ClickHouse Cloudサポートにお問い合わせください。

### 高度なセキュリティ管理 {#advanced-security-administration}
ClickHouseサービスを作成する際に、デフォルトのデータベースとこのデータベースへの広範な権限を持つデフォルトユーザーを作成します。この初期ユーザーは、追加のユーザーを作成し、これらのユーザーにこのデータベースに対する権限を割り当てることができます。これを超えて、Kerberos、LDAP、またはSSL X.509証明書認証を使用してこのデータベース内で以下のセキュリティ機能を有効にする能力は、現時点ではサポートされていません。

## ロードマップ {#roadmap}

私たちは、クラウドにおける実行可能なUDFのサポートを導入し、他の多くの機能に対する需要を評価しています。フィードバックがあり、特定の機能を要求したい場合は、[こちらで送信してください](https://console.clickhouse.cloud/support).
