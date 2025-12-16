---
slug: /whats-new/cloud-compatibility
sidebar_label: 'クラウド互換性'
title: 'クラウド互換性'
description: 'このガイドでは、ClickHouse Cloud の機能面および運用面で何が期待できるか、その概要を説明します。'
keywords: ['ClickHouse Cloud', 'compatibility']
doc_type: 'guide'
---

# ClickHouse Cloud 互換性ガイド {#clickhouse-cloud-compatibility-guide}

このガイドでは、ClickHouse Cloud における機能面および運用面での挙動について概要を説明します。ClickHouse Cloud はオープンソース版 ClickHouse ディストリビューションをベースとしていますが、アーキテクチャや実装にはいくつか異なる点があります。背景情報として、[どのようにして ClickHouse Cloud を構築したか](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) を説明しているこのブログ記事も、興味深く参考になるはずです。

## ClickHouse Cloud のアーキテクチャ {#clickhouse-cloud-architecture}
ClickHouse Cloud は、運用負荷を大幅に軽減し、大規模な ClickHouse の運用コストを削減します。デプロイメント規模を事前に見積もったり、高可用性のためのレプリケーションを構成したり、データを手動でシャーディングしたり、ワークロードの増加に応じてサーバーをスケールアップしたり、利用していないときにスケールダウンしたりする必要はありません — これらはすべて ClickHouse Cloud が代わりに行います。

これらの利点は、ClickHouse Cloud の基盤となるアーキテクチャ上の選択によってもたらされます:
- コンピュートとストレージは分離されており、それぞれを独立した側面として自動スケールできます。そのため、静的なインスタンス構成でストレージまたはコンピュートを過剰にプロビジョニングする必要がありません。
- オブジェクトストア上の階層型ストレージと多段階キャッシュにより、事実上無制限のスケーリングと優れた価格性能比を実現します。そのため、ストレージ容量を事前に見積もったり、高額なストレージコストを心配する必要がありません。
- 高可用性はデフォルトで有効化されており、レプリケーションは透過的に管理されます。そのため、アプリケーションの構築やデータ分析に専念できます。
- 変動する連続ワークロード向けの自動スケーリングはデフォルトで有効化されています。そのため、サービスの規模を事前に見積もったり、ワークロードの増加に応じてサーバーをスケールアップしたり、アクティビティが減少したときにサーバーを手動でスケールダウンしたりする必要はありません。
- 断続的なワークロード向けのシームレスなハイバネーション機能はデフォルトで有効化されています。一定期間アイドル状態が続くとコンピュートリソースを自動的に一時停止し、新しいクエリが到着したときに透過的に再起動します。そのため、アイドルリソースに対して料金を支払う必要がありません。
- 高度なスケーリングコントロールにより、追加のコスト管理のためにオートスケーリングの上限を設定したり、特定の性能要件を持つアプリケーション向けにコンピュートリソースを確保するためのオートスケーリングの下限を設定したりできます。

## 機能 {#capabilities}
ClickHouse Cloud は、オープンソース版 ClickHouse に含まれる機能のうち厳選されたものへのアクセスを提供します。以下では、現時点で ClickHouse Cloud では無効化されている一部の機能について説明します。

### DDL 構文 {#ddl-syntax}
ほとんどの場合、ClickHouse Cloud の DDL 構文はセルフマネージドインストールで利用可能なものと一致します。主な例外は次のとおりです。
- 現在サポートされていない `CREATE AS SELECT`。回避策として、`CREATE ... EMPTY ... AS SELECT` を使用し、そのテーブルに対して INSERT を行うことを推奨します（例については [このブログ](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1) を参照してください）。
- 一部の実験的な構文は無効化されている場合があります。例えば、`ALTER TABLE ... MODIFY QUERY` ステートメントなどです。
- セキュリティ上の理由から、一部のイントロスペクション機能は無効化されている場合があります。例えば、`addressToLine` SQL 関数などです。
- ClickHouse Cloud では `ON CLUSTER` パラメータを使用しないでください。これは不要です。ほとんどは no-op ですが、[macros](/operations/server-configuration-parameters/settings#macros) を使用しようとした場合にエラーになることがあります。マクロは多くの場合正しく動作せず、ClickHouse Cloud では不要です。

### データベースおよびテーブルエンジン {#database-and-table-engines}

ClickHouse Cloud は、デフォルトで高可用かつレプリケーションされたサービスを提供します。その結果、すべてのデータベースおよびテーブルエンジンは「Replicated」となります。"Replicated" を明示的に指定する必要はありません。例えば、ClickHouse Cloud では `ReplicatedMergeTree` と `MergeTree` は同一として扱われます。

**サポートされているテーブルエンジン**

- ReplicatedMergeTree（何も指定しなかった場合のデフォルト）
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
ClickHouse Cloud は HTTPS、ネイティブインターフェース、および [MySQL ワイヤプロトコル](/interfaces/mysql) をサポートします。Postgres など、さらなるインターフェースのサポートも近日提供予定です。

### ディクショナリ {#dictionaries}
ディクショナリは、ClickHouse におけるルックアップを高速化する一般的な手法です。ClickHouse Cloud は現在、PostgreSQL、MySQL、リモートおよびローカルの ClickHouse サーバー、Redis、MongoDB、および HTTP ソースからのディクショナリをサポートしています。

### フェデレーションクエリ {#federated-queries}
クラウド内でのクロスクラスター通信、および外部のセルフマネージド ClickHouse クラスターとの通信のために、フェデレーションされた ClickHouse クエリをサポートしています。ClickHouse Cloud は現在、次の統合エンジンを使用したフェデレーションクエリをサポートしています。
- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

SQLite、ODBC、JDBC、Redis、HDFS、Hive など一部の外部データベースおよびテーブルエンジンとのフェデレーションクエリは、まだサポートされていません。

### ユーザー定義関数 {#user-defined-functions}

ユーザー定義関数は、ClickHouse における比較的新しい機能です。ClickHouse Cloud は現在、SQL UDF のみをサポートしています。

### 実験的機能 {#experimental-features}

サービスデプロイメントの安定性を確保するため、ClickHouse Cloud サービスでは実験的機能は無効化されています。

### Kafka {#kafka}

[Kafka Table Engine](/integrations/data-ingestion/kafka/index.md) は ClickHouse Cloud では一般提供されていません。代わりに、関心の分離を実現するため、Kafka 接続コンポーネントを ClickHouse サービスから分離したアーキテクチャを採用することを推奨します。Kafka ストリームからデータをプルするには、[ClickPipes](https://clickhouse.com/cloud/clickpipes) の利用を推奨します。あるいは、[Kafka User Guide](/integrations/data-ingestion/kafka/index.md) に記載されているプッシュ型の代替案の利用を検討してください。

### Named collections {#named-collections}

[Named collections](/operations/named-collections) は、現在 ClickHouse Cloud ではサポートされていません。

## 運用上のデフォルトと考慮事項 {#operational-defaults-and-considerations}
以下は、ClickHouse Cloud サービスのデフォルト設定です。サービスの正しい動作を保証するため、一部の設定は固定されていますが、それ以外の設定は調整可能です。

### 運用上の制限 {#operational-limits}

#### `max_parts_in_total: 10,000` {#max_parts_in_total-10000}
MergeTree テーブルに対する `max_parts_in_total` 設定のデフォルト値は、100,000 から 10,000 に引き下げられました。この変更の理由は、クラウド環境において多数のデータパートが存在すると、サービスの起動時間が遅くなる傾向が観測されたためです。パート数が多い場合、通常はパーティションキーを過度に細かく設定していることを示しており、これは多くの場合意図せずに行われるもので、避けるべきです。このデフォルト値の変更により、このようなケースをより早期に検出できるようになります。

#### `max_concurrent_queries: 1,000` {#max_concurrent_queries-1000}
このサーバー単位の設定を、デフォルトの `100` から `1000` に増やし、より高い同時実行性を許可しています。  
これにより、提供されるティアのサービスでは、`レプリカ数 * 1,000` 個の同時クエリが実行可能になります。  
単一レプリカに制限された Basic ティアサービスでは `1000` 個の同時クエリが、Scale および Enterprise では、構成されたレプリカ数に応じて `1000+` 個の同時クエリが利用可能です。

#### `max_table_size_to_drop: 1,000,000,000,000` {#max_table_size_to_drop-1000000000000}
この設定を 50GB から増加させ、最大 1TB までのテーブルやパーティションの削除を許可しています。

### システム設定 {#system-settings}
ClickHouse Cloud は変動するワークロードに対応するようチューニングされており、そのため現時点ではほとんどのシステム設定は変更できません。多くのユーザーにとってシステム設定をチューニングする必要はないと想定していますが、高度なシステムチューニングについて質問がある場合は、ClickHouse Cloud Support までお問い合わせください。

### 高度なセキュリティ管理 {#advanced-security-administration}
ClickHouse サービスの作成時に、デフォルトのデータベースと、このデータベースに対して広範な権限を持つデフォルトユーザーが作成されます。この初期ユーザーは、追加のユーザーを作成し、それらのユーザーに対してこのデータベースへの権限を付与できます。これ以外に、Kerberos、LDAP、または SSL X.509 証明書認証を使用してデータベース内で以下のセキュリティ機能を有効化することは、現時点ではサポートされていません。

## ロードマップ {#roadmap}

現在、ClickHouse Cloud での実行可能な UDF のサポートを導入しており、その他多くの機能についてもニーズを評価しています。フィードバックや特定の機能のリクエストがある場合は、[こちらから送信してください](https://console.clickhouse.cloud/support)。
