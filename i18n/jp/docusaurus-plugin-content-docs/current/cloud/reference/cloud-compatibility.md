---
slug: /whats-new/cloud-compatibility
sidebar_label: 'クラウド互換性'
title: 'クラウド互換性'
description: 'このガイドでは、ClickHouse Cloudでの機能的および運用的な期待事項の概要を提供します。'
---


# ClickHouse Cloud — 互換性ガイド

このガイドでは、ClickHouse Cloudでの機能的および運用的な期待事項の概要を提供します。ClickHouse CloudはオープンソースのClickHouseディストリビューションに基づいていますが、アーキテクチャや実装においていくつかの違いがある場合があります。私たちがClickHouse Cloudをどのように構築したかについてのブログを読むと、背景に関する興味深く、関連性のある情報が得られます。[こちらを参照](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year)。

## ClickHouse Cloud アーキテクチャ {#clickhouse-cloud-architecture}
ClickHouse Cloudは、運用のオーバーヘッドを大幅に簡素化し、ClickHouseをスケールで運用するコストを削減します。デプロイメントのサイズを事前に決定したり、高可用性のためにレプリケーションを設定したり、データを手動でシャード化したり、ワークロードが増えたときにサーバーをスケールアップしたり、使用していないときはスケールダウンする必要はありません — 当社がこれを代行します。

これらの利点は、ClickHouse Cloudの基盤となるアーキテクチャの選択から得られています：
- コンピュートとストレージが分離されているため、別々の次元に沿って自動的にスケールされ、静的インスタンス構成でストレージやコンピュートを過剰にプロビジョンする必要がありません。
- オブジェクトストアの上に階層ストレージとマルチレベルキャッシュを提供し、ほぼ無制限のスケーリングと良好な価格/パフォーマンス比を実現するため、ストレージパーティションのサイズを事前に決定し、高いストレージコストを心配する必要がありません。
- 高可用性はデフォルトでオンになっており、レプリケーションは透明に管理されていますので、アプリケーションの構築やデータの分析に集中できます。
- 可変の継続的なワークロードに対する自動スケーリングがデフォルトでオンになっており、サービスのサイズを事前に決定したり、ワークロードが増えたときにサーバーをスケールアップしたり、活動が少なくなったときに手動でサーバーをスケールダウンする必要がありません。
- 不定期なワークロードに対するシームレスな休止がデフォルトでオンになっており、非アクティブな状態が続いた後にコンピュートリソースを自動的に一時停止し、新たなクエリが到着すると透明に再開するため、アイドルリソースに対して支払う必要がありません。
- 高度なスケーリングコントロールにより、追加コストを管理するための自動スケーリングの最大値を設定したり、特殊なパフォーマンス要件を持つアプリケーションのためにコンピュートリソースを予約する自動スケーリングの最小値を設定することができます。

## 機能 {#capabilities}
ClickHouse Cloudは、オープンソースのClickHouseディストリビューションでキュレーションされた機能セットへのアクセスを提供します。以下の表は、現在ClickHouse Cloudで無効化されている機能の一部を説明しています。

### DDL構文 {#ddl-syntax}
ほとんどの場合、ClickHouse CloudのDDL構文はセルフマネージドインストールにおいて利用可能なものと一致します。ただし、以下のような注目すべき例外があります：
  - `CREATE AS SELECT`のサポートは現在利用できません。回避策として、`CREATE ... EMPTY ... AS SELECT`を使用してから、そのテーブルに挿入することをお勧めします（例については[このブログ](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)をご覧ください）。
  - 一部の実験的な構文は無効化されている場合があります。たとえば、`ALTER TABLE ... MODIFY QUERY`文などです。
  - セキュリティのために、一部のイントロスペクション機能が無効にされている場合があります。例として、`addressToLine` SQL関数があります。
  - ClickHouse Cloudでは`ON CLUSTER`パラメータを使用しないでください - これらは必要ありません。これらは通常NOP関数ですが、[マクロ](/operations/server-configuration-parameters/settings#macros)を使用しようとするとエラーを引き起こす可能性があります。マクロはClickHouse Cloudでほとんど機能せず、必要ありません。

### データベースおよびテーブルエンジン {#database-and-table-engines}

ClickHouse Cloudでは、デフォルトで高可用、レプリケーションされたサービスを提供します。そのため、すべてのデータベースおよびテーブルエンジンは「レプリケートされた」ものになります。「レプリケートされた」を指定する必要はありません—例えば、`ReplicatedMergeTree`と`MergeTree`はClickHouse Cloudで使用されるときに同一です。

**サポートされているテーブルエンジン**

  - ReplicatedMergeTree (デフォルト、指定がない場合)
  - ReplicatedSummingMergeTree
  - ReplicatedAggregatingMergeTree
  - ReplicatedReplacingMergeTree
  - ReplicatedCollapsingMergeTree
  - ReplicatedVersionedCollapsingMergeTree
  - MergeTree (ReplicatedMergeTreeに変換)
  - SummingMergeTree (ReplicatedSummingMergeTreeに変換)
  - AggregatingMergeTree (ReplicatedAggregatingMergeTreeに変換)
  - ReplacingMergeTree (ReplicatedReplacingMergeTreeに変換)
  - CollapsingMergeTree (ReplicatedCollapsingMergeTreeに変換)
  - VersionedCollapsingMergeTree (ReplicatedVersionedCollapsingMergeTreeに変換)
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
ClickHouse CloudはHTTPS、ネイティブインターフェース、及び[MySQLワイヤプロトコル](/interfaces/mysql)をサポートしています。Postgresなどの他のインターフェースのサポートも近日中に追加される予定です。

### 辞書 {#dictionaries}
辞書はClickHouseにおけるルックアップの速度を向上させる人気の方法です。ClickHouse Cloudは現在、PostgreSQL、MySQL、リモートおよびローカルのClickHouseサーバー、Redis、MongoDBおよびHTTPソースからの辞書をサポートしています。

### フェデレーテッドクエリ {#federated-queries}
クラウド内でのクロスクラスタ通信、及び外部セルフマネージドClickHouseクラスターとの通信のために、フェデレーテッドClickHouseクエリをサポートしています。ClickHouse Cloudでは、次の統合エンジンを使用するフェデレーテッドクエリを現在サポートしています：
  - Deltalake
  - Hudi
  - MySQL
  - MongoDB
  - NATS
  - RabbitMQ
  - PostgreSQL
  - S3

SQLite、ODBC、JDBC、Redis、HDFS、Hiveなどの外部データベースおよびテーブルエンジンとのフェデレーテッドクエリはまだサポートされていません。

### ユーザー定義関数 {#user-defined-functions}

ユーザー定義関数はClickHouseの新しい機能です。ClickHouse Cloudでは現在、SQL UDFのみがサポートされています。

### 実験的機能 {#experimental-features}

実験的機能は、サービスのデプロイメントの安定性を確保するためにClickHouse Cloudサービスでは無効化されています。

### Kafka {#kafka}

[Kafkaテーブルエンジン](/integrations/data-ingestion/kafka/index.md)はClickHouse Cloudでは一般には利用できません。代わりに、Kafka接続コンポーネントをClickHouseサービスから切り離すアーキテクチャを利用することをお勧めします。Kafkaストリームからデータを引き出すには、[ClickPipes](https://clickhouse.com/cloud/clickpipes)の利用をお勧めします。あるいは、[Kafkaユーザーガイド](/integrations/data-ingestion/kafka/index.md)に記載されているプッシュ型の代替案を検討してください。

### 名称付きコレクション {#named-collections}

[名称付きコレクション](/operations/named-collections)は現在ClickHouse Cloudではサポートされていません。

## 運用デフォルトと考慮事項 {#operational-defaults-and-considerations}
以下はClickHouse Cloudサービスのデフォルト設定です。場合によっては、これらの設定はサービスの正しい動作を保証するために固定されており、他の場合では調整可能です。

### 運用制限 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTreeテーブルの`max_parts_in_total`設定のデフォルト値は100,000から10,000に引き下げられました。この変更の理由は、大量のデータパーツがクラウド内でのサービスの起動時間を遅くする可能性があることが観察されたためです。大量のパーツは通常、過度に粒度の細かいパーティションキーの選択を示唆し、これは通常意図せず行われ、回避すべきです。このデフォルトの変更により、これらのケースを早期に検知できるようになります。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
このサーバーあたりの設定をデフォルトの`100`から`1000`に増加させ、より多くの同時実行を可能にしました。
これにより、提供されたティアサービスの`レプリカの数 * 1,000`の同時クエリが可能になります。
Basicティアサービスでは1つのレプリカに限定し`1000`の同時クエリが可能となり、ScaleおよびEnterpriseでは`1000+`となります。
レプリカの数に応じます。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
この設定を50GBから増加させ、最大1TBのテーブル/パーティションを削除できるようにしました。

### システム設定 {#system-settings}
ClickHouse Cloudは可変ワークロードに最適化されているため、ほとんどのシステム設定は現在のところ構成できません。ほとんどのユーザーにとってシステム設定を調整する必要はないと予想していますが、詳細なシステムチューニングに関する質問がある場合は、ClickHouse Cloudサポートにお問い合わせください。

### 高度なセキュリティ管理 {#advanced-security-administration}
ClickHouseサービスを作成する際に、デフォルトのデータベースとこのデータベースに対して広範な権限を持つデフォルトユーザーが作成されます。この初期ユーザーは追加のユーザーを作成し、その権限をこのデータベースに割り当てることができます。それ以外の場合、Kerberos、LDAP、またはSSL X.509証明書認証を使用してデータベース内で以下のセキュリティ機能を有効にする機能は現在サポートされていません。

## ロードマップ {#roadmap}

クラウドにおける実行可能なUDFのサポートを導入中で、他の多くの機能の需要を評価しています。フィードバックがあり、特定の機能のリクエストをしたい場合は、[こちらからご提出ください](https://console.clickhouse.cloud/support)。
