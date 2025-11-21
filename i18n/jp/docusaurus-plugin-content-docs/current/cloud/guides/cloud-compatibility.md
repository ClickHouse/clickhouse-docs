---
slug: /whats-new/cloud-compatibility
sidebar_label: 'クラウド互換性'
title: 'クラウド互換性'
description: 'このガイドでは、ClickHouse Cloud における機能面および運用面で何が期待できるか、その概要を説明します。'
keywords: ['ClickHouse Cloud', 'compatibility']
doc_type: 'guide'
---



# ClickHouse Cloud 互換性ガイド

このガイドでは、ClickHouse Cloud において機能面および運用面で何が期待できるかの概要を示します。ClickHouse Cloud はオープンソース版の ClickHouse ディストリビューションを基盤としていますが、アーキテクチャや実装にいくつかの違いがある場合があります。背景情報として、[どのように ClickHouse Cloud を構築したか](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) を解説したこのブログも、興味深く有用な資料となるでしょう。



## ClickHouse Cloudアーキテクチャ {#clickhouse-cloud-architecture}

ClickHouse Cloudは運用上のオーバーヘッドを大幅に簡素化し、ClickHouseを大規模に運用するコストを削減します。デプロイメントのサイズを事前に決定したり、高可用性のためにレプリケーションを設定したり、データを手動でシャーディングしたり、ワークロードの増加に応じてサーバーをスケールアップしたり、使用していない時にスケールダウンしたりする必要はありません。これらはすべて当社が対応します。

これらの利点は、ClickHouse Cloudの基盤となるアーキテクチャ上の選択によってもたらされます。

- コンピュートとストレージが分離されているため、それぞれ独立してスケーリングできます。これにより、静的なインスタンス構成においてストレージまたはコンピュートを過剰にプロビジョニングする必要がありません。
- オブジェクトストア上の階層型ストレージと多層キャッシングにより、事実上無制限のスケーリングと優れた価格対性能比を実現します。これにより、ストレージパーティションのサイズを事前に決定したり、高額なストレージコストを心配したりする必要がありません。
- 高可用性がデフォルトで有効になっており、レプリケーションは透過的に管理されるため、アプリケーションの構築やデータ分析に集中できます。
- 変動する継続的なワークロードに対する自動スケーリングがデフォルトで有効になっているため、サービスのサイズを事前に決定したり、ワークロードの増加に応じてサーバーをスケールアップしたり、アクティビティが少ない時に手動でサーバーをスケールダウンしたりする必要がありません。
- 断続的なワークロードに対するシームレスな休止状態がデフォルトで有効になっています。非アクティブな期間の後、コンピュートリソースを自動的に一時停止し、新しいクエリが到着すると透過的に再起動するため、アイドル状態のリソースに対して料金を支払う必要がありません。
- 高度なスケーリング制御により、追加のコスト管理のための自動スケーリングの上限設定や、特殊なパフォーマンス要件を持つアプリケーション向けにコンピュートリソースを確保するための自動スケーリングの下限設定が可能です。


## 機能 {#capabilities}

ClickHouse Cloudは、ClickHouseのオープンソース版で提供される厳選された機能セットへのアクセスを提供します。以下の表は、現時点でClickHouse Cloudで無効化されている一部の機能について説明しています。

### DDL構文 {#ddl-syntax}

ClickHouse CloudのDDL構文は、ほとんどの場合、セルフマネージド環境で利用可能なものと一致します。いくつかの注目すべき例外があります:

- `CREATE AS SELECT`のサポートは、現在利用できません。回避策として、`CREATE ... EMPTY ... AS SELECT`を使用してからそのテーブルにデータを挿入することを推奨します(例については[このブログ](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)を参照してください)。
- 一部の実験的な構文は無効化されている場合があります。例えば、`ALTER TABLE ... MODIFY QUERY`ステートメントなどです。
- セキュリティ上の理由から、一部のイントロスペクション機能が無効化されている場合があります。例えば、`addressToLine` SQL関数などです。
- ClickHouse Cloudでは`ON CLUSTER`パラメータを使用しないでください。これらは不要です。これらはほとんどの場合何も実行しない関数ですが、[マクロ](/operations/server-configuration-parameters/settings#macros)を使用しようとするとエラーが発生する可能性があります。マクロはClickHouse Cloudでは正常に動作しないことが多く、また不要です。

### データベースおよびテーブルエンジン {#database-and-table-engines}

ClickHouse Cloudは、デフォルトで高可用性のレプリケートされたサービスを提供します。その結果、すべてのデータベースおよびテーブルエンジンは「Replicated」となります。「Replicated」を指定する必要はありません。例えば、ClickHouse Cloudで使用する場合、`ReplicatedMergeTree`と`MergeTree`は同一です。

**サポートされているテーブルエンジン**

- ReplicatedMergeTree(指定がない場合のデフォルト)
- ReplicatedSummingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- MergeTree(ReplicatedMergeTreeに変換されます)
- SummingMergeTree(ReplicatedSummingMergeTreeに変換されます)
- AggregatingMergeTree(ReplicatedAggregatingMergeTreeに変換されます)
- ReplacingMergeTree(ReplicatedReplacingMergeTreeに変換されます)
- CollapsingMergeTree(ReplicatedCollapsingMergeTreeに変換されます)
- VersionedCollapsingMergeTree(ReplicatedVersionedCollapsingMergeTreeに変換されます)
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

ClickHouse Cloudは、HTTPS、ネイティブインターフェース、および[MySQLワイヤープロトコル](/interfaces/mysql)をサポートしています。Postgresなどのより多くのインターフェースのサポートは近日中に提供予定です。

### ディクショナリ {#dictionaries}

ディクショナリは、ClickHouseでルックアップを高速化するための一般的な方法です。ClickHouse Cloudは現在、PostgreSQL、MySQL、リモートおよびローカルのClickHouseサーバー、Redis、MongoDB、HTTPソースからのディクショナリをサポートしています。

### フェデレーテッドクエリ {#federated-queries}

クラウド内のクラスター間通信、および外部のセルフマネージドClickHouseクラスターとの通信のために、フェデレーテッドClickHouseクエリをサポートしています。ClickHouse Cloudは現在、以下の統合エンジンを使用したフェデレーテッドクエリをサポートしています:

- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

SQLite、ODBC、JDBC、Redis、HDFS、Hiveなどの一部の外部データベースおよびテーブルエンジンを使用したフェデレーテッドクエリは、まだサポートされていません。

### ユーザー定義関数 {#user-defined-functions}

ユーザー定義関数は、ClickHouseの比較的新しい機能です。ClickHouse Cloudは現在、SQL UDFのみをサポートしています。

### 実験的機能 {#experimental-features}

実験的機能は、サービスデプロイメントの安定性を確保するため、ClickHouse Cloudサービスでは無効化されています。

### Kafka {#kafka}

[Kafkaテーブルエンジン](/integrations/data-ingestion/kafka/index.md)は、ClickHouse Cloudでは一般提供されていません。代わりに、関心の分離を実現するために、Kafka接続コンポーネントをClickHouseサービスから分離するアーキテクチャに依存することを推奨します。Kafkaストリームからデータを取得するには、[ClickPipes](https://clickhouse.com/cloud/clickpipes)を推奨します。または、[Kafkaユーザーガイド](/integrations/data-ingestion/kafka/index.md)に記載されているプッシュベースの代替手段を検討してください。

### 名前付きコレクション {#named-collections}

[名前付きコレクション](/operations/named-collections)は、現在ClickHouse Cloudではサポートされていません。


## 運用上のデフォルト設定と考慮事項 {#operational-defaults-and-considerations}

以下は、ClickHouse Cloudサービスのデフォルト設定です。これらの設定は、サービスの正常な動作を保証するために固定されている場合もあれば、調整可能な場合もあります。

### 運用上の制限 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}

MergeTreeテーブルの`max_parts_in_total`設定のデフォルト値は、100,000から10,000に引き下げられました。この変更の理由は、データパーツの数が多いとクラウド上のサービスの起動時間が遅くなる可能性があることが確認されたためです。パーツ数が多い場合は、通常、パーティションキーが細かすぎることを示しており、これは一般的に誤って設定されるため避けるべきです。デフォルト値の変更により、このようなケースをより早期に検出できるようになります。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}

このサーバーごとの設定をデフォルトの`100`から`1000`に増やし、より高い同時実行性を実現しました。
これにより、提供される各ティアサービスでは`レプリカ数 * 1,000`の同時クエリが可能になります。
Basicティアサービスでは単一レプリカに制限され`1000`の同時クエリ、ScaleおよびEnterpriseでは構成されたレプリカ数に応じて`1000+`の同時クエリが可能です。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}

この設定を50GBから増やし、最大1TBまでのテーブル/パーティションの削除を可能にしました。

### システム設定 {#system-settings}

ClickHouse Cloudは可変ワークロードに最適化されているため、現時点ではほとんどのシステム設定は構成できません。ほとんどのユーザーにとってシステム設定の調整が必要になることは想定していませんが、高度なシステムチューニングに関する質問がある場合は、ClickHouse Cloudサポートにお問い合わせください。

### 高度なセキュリティ管理 {#advanced-security-administration}

ClickHouseサービスの作成の一環として、デフォルトデータベースと、このデータベースに対する広範な権限を持つデフォルトユーザーを作成します。この初期ユーザーは、追加のユーザーを作成し、このデータベースへの権限を割り当てることができます。これを超えて、Kerberos、LDAP、またはSSL X.509証明書認証を使用してデータベース内でセキュリティ機能を有効にする機能は、現時点ではサポートされていません。


## ロードマップ {#roadmap}

ClickHouse Cloudにおける実行可能なUDFのサポートを導入中であり、その他多くの機能に対する需要を評価しています。フィードバックや特定の機能のリクエストがある場合は、[こちらから送信してください](https://console.clickhouse.cloud/support)。
