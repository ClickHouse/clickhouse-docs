---
slug: /whats-new/cloud-compatibility
sidebar_label: クラウド互換性
title: クラウド互換性
---


# ClickHouse Cloud — 互換性ガイド

このガイドでは、ClickHouse Cloudで期待される機能的および運用的な概要を提供します。ClickHouse CloudはオープンソースのClickHouseディストリビューションに基づいていますが、アーキテクチャや実装には若干の違いがあるかもしれません。バックグラウンドとして、[ClickHouse Cloudをゼロから構築した方法](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year)に関するブログも興味深く、関連性があります。

## ClickHouse Cloudアーキテクチャ {#clickhouse-cloud-architecture}
ClickHouse Cloudは、運用上の負担を大幅に軽減し、ClickHouseを大規模に運用するコストを削減します。デプロイメントを事前にサイズ設定する必要や、高可用性のためにレプリケーションを設定する必要、データを手動でシャーディングする必要、ワークロードが増加した際にサーバーをスケールアップする必要、または使用していないときにスケールダウンする必要はありません — 私たちがこれを管理します。

これらの利点は、ClickHouse Cloudの背後にあるアーキテクチャの選択の結果です：
- コンピュートとストレージが分離されているため、別々の次元に沿って自動的にスケールさせることができ、静的インスタンス構成でストレージやコンピュートを過剰にプロビジョニングする必要がありません。
- オブジェクトストア上の階層化ストレージとマルチレベルキャッシングにより、事実上無限のスケーリングと良い価格/性能比が提供されるため、ストレージパーティションのサイズ設定を事前に行い、高ストレージコストを心配する必要はありません。
- 高可用性はデフォルトでオンになっており、レプリケーションは透明に管理されるため、アプリケーションの構築やデータの分析に集中できます。
- 変動する連続的ワークロードのための自動スケーリングはデフォルトでオンになっており、サービスの事前サイズ設定や、ワークロードが増えた際のサーバースケールアップ、アクティビティが少ない際の手動でのサーバースケールダウンは必要ありません。
- 断続的ワークロードのシームレスなハイバーネーションはデフォルトでオンになっています。非アクティブ期間の後にコンピュートリソースを自動的に一時停止し、新しいクエリが到着したときに透明に再起動するため、アイドルリソースに対して支払う必要はありません。
- 高度なスケーリング制御により、コスト管理のためのオートスケーリングの最大値を設定したり、特定のパフォーマンス要件を持つアプリケーション用にコンピュートリソースを予約するためのオートスケーリングの最小値を設定することができます。

## 機能 {#capabilities}
ClickHouse Cloudは、オープンソースのClickHouseディストリビューションのキュレーションされた機能セットへのアクセスを提供します。以下のテーブルは、現在ClickHouse Cloudで無効になっているいくつかの機能を説明します。

### DDL構文 {#ddl-syntax}
ほとんどの場合、ClickHouse CloudのDDL構文はセルフマネージドインストールで利用可能なものと一致するはずです。いくつかの注目すべき例外があります：
- `CREATE AS SELECT`のサポートは現在利用できません。回避策として、`CREATE ... EMPTY ... AS SELECT`を使用し、そのテーブルに挿入することをお勧めします（例については[このブログ](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)を参照してください）。
- 一部の実験的な構文は無効にされる場合があります。たとえば、`ALTER TABLE … MODIFY QUERY`ステートメント。
- セキュリティ上の理由から、一部のイントロスペクション機能が無効になっている場合があります。例：`addressToLine` SQL関数。
- ClickHouse Cloudでは`ON CLUSTER`パラメータを使用しないでください - これは必要ありません。これらは主に効果のない関数ですが、[マクロ](/operations/server-configuration-parameters/settings#macros)を使用しようとするとエラーを引き起こす可能性があります。ClickHouse Cloudではマクロは機能しないことが多く、必要ありません。

### データベースおよびテーブルエンジン {#database-and-table-engines}

ClickHouse Cloudはデフォルトで高可用性のあるレプリケートされたサービスを提供します。そのため、すべてのデータベースおよびテーブルエンジンは「レプリケート」されています。「レプリケート」を指定する必要はありません — たとえば、`ReplicatedMergeTree`と`MergeTree`はClickHouse Cloud内で同じです。

**サポートされているテーブルエンジン**

- ReplicatedMergeTree（デフォルト、指定しない場合）
- ReplicatedSummingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- MergeTree（ReplicatedMergeTreeに変換されます）
- SummingMergeTree（ReplicatedSummingMergeTreeに変換されます）
- AggregatingMergeTree（ReplicatedAggregatingMergeTreeに変換されます）
- ReplacingMergeTree（ReplicatedReplacingMergeTreeに変換されます）
- CollapsingMergeTree（ReplicatedCollapsingMergeTreeに変換されます）
- VersionedCollapsingMergeTree（ReplicatedVersionedCollapsingMergeTreeに変換されます）
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
ClickHouse CloudはHTTPS、ネイティブインターフェース、および[MySQLワイヤプロトコル](/interfaces/mysql)をサポートしています。Postgresのような他のインターフェースのサポートは近日中に追加される予定です。

### 辞書 {#dictionaries}
辞書はClickHouseでの検索を高速化するための一般的な方法です。ClickHouse Cloudは現在、PostgreSQL、MySQL、リモートおよびローカルのClickHouseサーバー、Redis、MongoDBおよびHTTPソースからの辞書をサポートしています。

### フェデレーテッドクエリ {#federated-queries}
私たちは、クラウド内でのクロスクラスタ通信や、外部のセルフマネージドClickHouseクラスターとの通信のためにフェデレートされたClickHouseクエリをサポートしています。ClickHouse Cloudは現在、以下の統合エンジンを使用したフェデレートクエリをサポートしています：
- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

SQLite、ODBC、JDBC、Redis、HDFS、およびHiveのような一部の外部データベースおよびテーブルエンジンとのフェデレートクエリはまだサポートされていません。

### ユーザー定義関数 {#user-defined-functions}

ユーザー定義関数はClickHouseの最近の機能です。ClickHouse Cloudは現在、SQL UDFのみをサポートしています。

### 実験的機能 {#experimental-features}

実験的機能は、サービスのデプロイメントの安定性を確保するためにClickHouse Cloudサービスでは無効にされています。

### Kafka {#kafka}

[Kafkaテーブルエンジン](/integrations/data-ingestion/kafka/index.md)はClickHouse Cloudでは一般的に利用可能ではありません。代わりに、Kafka接続コンポーネントをClickHouseサービスから切り離すアーキテクチャに依存することをお勧めします。Kafkaストリームからデータを引き出すには、[ClickPipes](https://clickhouse.com/cloud/clickpipes)をお勧めします。または、[Kafkaユーザーガイド](/integrations/data-ingestion/kafka/index.md)にリストされているプッシュベースの代替案を検討してください。

### 名前付きコレクション {#named-collections}

[名前付きコレクション](/operations/named-collections)は現在ClickHouse Cloudではサポートされていません。

## 運用デフォルトと考慮事項 {#operational-defaults-and-considerations}
以下は、ClickHouse Cloudサービスのデフォルト設定です。場合によっては、これらの設定はサービスの正しい運用を確保するために固定されており、他の場合には調整可能です。

### 運用制限 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTreeテーブルの`max_parts_in_total`設定のデフォルト値が100,000から10,000に引き下げられました。この変更の理由は、多くのデータパーツがクラウド内のサービスの起動時間を遅くする可能性があることを観察したからです。パーツの数が多い場合は、通常、誤って選択された細かすぎるパーティションキーを示すが、これは避けるべきです。デフォルトの変更により、これらのケースを早期に検出できるようになります。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
このサーバーごとの設定をデフォルトの`100`から`1000`に増加させ、より多くの同時処理を許可します。これにより、提供されるティアサービスでは`レプリカの数 * 1,000`の同時クエリが可能になります。`1000`の同時クエリは単一のレプリカに制限され、`1000+`はスケールおよびエンタープライズティアで、構成されたレプリカの数に応じて変動します。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
この設定を50GBから増加させ、最大1TBのテーブル/パーティションの削除を可能にしました。

### システム設定 {#system-settings}
ClickHouse Cloudは変動するワークロードに最適化されており、そのためほとんどのシステム設定は現時点では設定可能ではありません。ほとんどのユーザーにとってシステム設定を調整する必要がないと考えていますが、高度なシステム調整に関して質問がある場合は、ClickHouse Cloudサポートにご連絡ください。

### 高度なセキュリティ管理 {#advanced-security-administration}
ClickHouseサービスを作成する過程で、デフォルトのデータベースを作成し、このデータベースに広範な権限を持つデフォルトユーザーを作成します。この初期ユーザーは追加のユーザーを作成し、その権限をこのデータベースに割り当てることができます。これを超えて、Kerberos、LDAP、またはSSL X.509証明書認証を使用してデータベース内で以下のセキュリティ機能を有効にする機能は現在サポートされていません。

## ロードマップ {#roadmap}

クラウドでの実行可能なUDFのサポートを導入し、多くの他の機能の需要を評価しています。フィードバックがあり、特定の機能をリクエストしたい場合は、ぜひ[こちらから送信してください](https://console.clickhouse.cloud/support)。
