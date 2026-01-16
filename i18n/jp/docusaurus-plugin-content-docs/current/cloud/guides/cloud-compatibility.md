---
slug: /whats-new/cloud-compatibility
sidebar_label: 'クラウド互換性'
title: 'クラウド互換性'
description: 'このガイドでは、ClickHouse Cloud の機能面および運用面で何が期待できるか、その概要を説明します。'
keywords: ['ClickHouse Cloud', 'compatibility']
doc_type: 'guide'
---

# ClickHouse Cloud 互換性ガイド \{#clickhouse-cloud-compatibility-guide\}

このガイドでは、ClickHouse Cloud における機能面および運用面での挙動の概要を示します。ClickHouse Cloud はオープンソース版 ClickHouse ディストリビューションをベースとしていますが、アーキテクチャや実装にはいくつか異なる点があります。背景情報として、[どのようにして ClickHouse Cloud を構築したか](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) を説明しているこのブログ記事も、読んでおくと興味深く参考になるはずです。

## ClickHouse Cloud のアーキテクチャ \\{#clickhouse-cloud-architecture\\}
ClickHouse Cloud は、運用負荷を大幅に軽減し、大規模な ClickHouse の運用コストを削減します。デプロイメント規模を事前に見積もったり、高可用性のためのレプリケーションを構成したり、データを手動でシャーディングしたり、ワークロードの増加に応じてサーバーをスケールアップしたり、利用していないときにスケールダウンしたりする必要はありません — これらはすべて ClickHouse Cloud が代わりに行います。

これらの利点は、ClickHouse Cloud の基盤となるアーキテクチャ上の選択によってもたらされます:
- コンピュートとストレージは分離されており、それぞれを独立した側面として自動スケールできます。そのため、静的なインスタンス構成でストレージまたはコンピュートを過剰にプロビジョニングする必要がありません。
- オブジェクトストア上の階層型ストレージと多段階キャッシュにより、事実上無制限のスケーリングと優れた価格性能比を実現します。そのため、ストレージ容量を事前に見積もったり、高額なストレージコストを心配する必要がありません。
- 高可用性はデフォルトで有効化されており、レプリケーションは透過的に管理されます。そのため、アプリケーションの構築やデータ分析に専念できます。
- 変動する連続ワークロード向けの自動スケーリングはデフォルトで有効化されています。そのため、サービスの規模を事前に見積もったり、ワークロードの増加に応じてサーバーをスケールアップしたり、アクティビティが減少したときにサーバーを手動でスケールダウンしたりする必要はありません。
- 断続的なワークロード向けのシームレスなハイバネーション機能はデフォルトで有効化されています。一定期間アイドル状態が続くとコンピュートリソースを自動的に一時停止し、新しいクエリが到着したときに透過的に再起動します。そのため、アイドルリソースに対して料金を支払う必要がありません。
- 高度なスケーリングコントロールにより、追加のコスト管理のためにオートスケーリングの上限を設定したり、特定の性能要件を持つアプリケーション向けにコンピュートリソースを確保するためのオートスケーリングの下限を設定したりできます。

## 機能 \\{#capabilities\\}

ClickHouse Cloud は、オープンソース版 ClickHouse に含まれる機能のうち厳選されたものへのアクセスを提供します。以下では、現時点で ClickHouse Cloud では無効化されている一部の機能について説明します。

### データベースおよびテーブルエンジン \\{#database-and-table-engines\\}

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
- Kafka

### インターフェース \\{#interfaces\\}

ClickHouse Cloud は HTTPS、ネイティブインターフェース、および [MySQL ワイヤプロトコル](/interfaces/mysql) をサポートします。Postgres など、さらなるインターフェースのサポートも近日提供予定です。

### ディクショナリ \\{#dictionaries\\}

ディクショナリは、ClickHouse におけるルックアップ処理を高速化する一般的な手段です。ClickHouse Cloud は現在、PostgreSQL、MySQL、リモートおよびローカルの ClickHouse サーバー、Redis、MongoDB、および HTTP ソースからのディクショナリをサポートしています。

### フェデレーションクエリ \\{#federated-queries\\}
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

### ユーザー定義関数 \\{#user-defined-functions\\}

ClickHouse Cloud におけるユーザー定義関数は現在、[プライベートプレビュー](https://clickhouse.com/docs/sql-reference/functions/udf)段階にあります。

#### Settings の動作 \\{#udf-settings-behavior\\}

:::warning Important
ClickHouse Cloud の UDF は **ユーザーレベルの Settings を継承しません**。デフォルトのシステム Settings で実行されます。
:::

これは次のことを意味します。

- セッションレベルの Settings（`SET` ステートメントで設定されたもの）は UDF の実行コンテキストに伝播されません
- ユーザープロファイルの Settings は UDF に継承されません
- クエリレベルの Settings は UDF の実行内では適用されません

### 実験的機能 \\{#experimental-features\\}

サービスデプロイメントの安定性を確保するため、ClickHouse Cloud サービスでは実験的機能は無効化されています。

### Named collections \\{#named-collections\\}

[Named collections](/operations/named-collections) は、現在 ClickHouse Cloud ではサポートされていません。

## 運用上のデフォルトと考慮事項 \\{#operational-defaults-and-considerations\\}

以下は、ClickHouse Cloud サービスのデフォルト設定です。サービスの正しい動作を保証するため、一部の設定は固定されていますが、それ以外の設定は調整可能です。

### 運用上の制限 \\{#operational-limits\\}

#### `max_parts_in_total: 10,000` \\{#max_parts_in_total-10000\\}

MergeTree テーブルに対する `max_parts_in_total` 設定のデフォルト値は、100,000 から 10,000 に引き下げられました。この変更の理由は、クラウド環境において多数のデータパーツが存在すると、サービスの起動時間が遅くなる傾向が観測されたためです。パーツ数が多い場合、通常はパーティションキーを過度に細かく設定していることを示しており、これは多くの場合意図せずに行われるもので、避けるべきです。このデフォルト値の変更により、このようなケースをより早期に検出できるようになります。

#### `max_concurrent_queries: 1,000` \\{#max_concurrent_queries-1000\\}

このサーバー単位の設定を、デフォルトの `100` から `1000` に増やし、より高い同時実行性を許可しています。  
これにより、提供されるティアのサービスでは、`レプリカ数 * 1,000` 個の同時クエリが実行可能になります。  
単一レプリカに制限された Basic ティアサービスでは `1000` 個の同時クエリが、Scale および Enterprise では、構成されたレプリカ数に応じて `1000+` 個の同時クエリが利用可能です。

#### `max_table_size_to_drop: 1,000,000,000,000` \\{#max_table_size_to_drop-1000000000000\\}

この設定を 50GB から引き上げ、最大 1TB までのテーブルやパーティションの削除を許可しています。

### システム設定 \\{#system-settings\\}

ClickHouse Cloud は変動するワークロードに対応するようチューニングされており、そのため現時点ではほとんどのシステム設定は変更できません。多くのユーザーにとってシステム設定を調整する必要はないと考えていますが、高度なシステムチューニングについてご質問がある場合は、ClickHouse Cloud Support までお問い合わせください。

### 高度なセキュリティ管理 \\{#advanced-security-administration\\}

ClickHouse サービスの作成時に、デフォルトのデータベースと、このデータベースに対して広範な権限を持つデフォルトユーザーが作成されます。この初期ユーザーは、追加のユーザーを作成し、それらのユーザーに対してこのデータベースへの権限を付与できます。これに加えて、Kerberos、LDAP、または SSL X.509 証明書認証を使用してデータベース内で以下のセキュリティ機能を有効化することは、現時点ではサポートされていません。

## ロードマップ \\{#roadmap\\}

ClickHouse Cloud におけるさまざまな追加機能のニーズを評価しています。フィードバックや特定の機能のリクエストがある場合は、[こちらから送信してください](https://console.clickhouse.cloud/support)。