---
slug: /whats-new/cloud-compatibility
sidebar_label: 'Cloud 互換性'
title: 'Cloud 互換性'
description: 'このガイドでは、ClickHouse Cloud における機能面および運用面で何が期待できるかの概要を説明します。'
keywords: ['ClickHouse Cloud', '互換性']
doc_type: 'guide'
---

# ClickHouse Cloud 互換性ガイド \{#clickhouse-cloud-compatibility-guide\}

このガイドでは、ClickHouse Cloud における機能面および運用面で何が期待できるか、その概要を説明します。ClickHouse Cloud はオープンソース版の ClickHouse ディストリビューションをベースとしていますが、アーキテクチャや実装にいくつかの相違がある場合があります。背景資料として、[ClickHouse Cloud をどのように構築したか](https://clickhouse.com/blog/building-clickhouse-cloud-from-scratch-in-a-year) を解説したこのブログも、興味深く有用な読み物となるでしょう。

## ClickHouse Cloud のアーキテクチャ \{#clickhouse-cloud-architecture\}

ClickHouse Cloud は運用の負荷を大幅に軽減し、大規模な ClickHouse 運用コストを削減します。あらかじめデプロイメントのサイズを見積もったり、高可用性のためにレプリケーションを設定したり、データを手動で分片したり、ワークロード増加時にサーバーをスケールアップしたり、利用していないときにスケールダウンしたりする必要はありません — これらはすべて ClickHouse Cloud が自動で行います。

これらのメリットは、ClickHouse Cloud を支えるアーキテクチャ上の設計選択によって実現されています。

- コンピュートとストレージが分離されており、それぞれ独立して自動的にスケーリングできるため、静的なインスタンス構成でストレージまたはコンピュートを過剰にプロビジョニングする必要がありません。
- オブジェクトストア上の階層型ストレージと多段階キャッシュにより、事実上無制限のスケーリングと優れた価格性能比を提供するため、ストレージのパーティションを事前に見積もったり、高いストレージコストを心配したりする必要がありません。
- 高可用性はデフォルトで有効化されており、レプリケーションは透過的に管理されるため、アプリケーションの構築やデータ分析に集中できます。
- 変動する連続的なワークロード向けの自動スケーリングはデフォルトで有効化されており、サービスのサイズを事前に見積もったり、ワークロード増加時にサーバーをスケールアップしたり、アクティビティが少ないときにサーバーを手動でスケールダウンしたりする必要がありません。
- 間欠的なワークロード向けのシームレスなハイバネーションはデフォルトで有効化されています。一定期間アクティビティがない場合はコンピュートリソースを自動的に一時停止し、新しいクエリが到着したときに透過的に再起動するため、アイドル状態のリソースに対して支払う必要がありません。
- 高度なスケーリング制御により、追加コストを抑制するための自動スケーリングの上限や、特定のパフォーマンス要件を持つアプリケーション向けにコンピュートリソースを確保する自動スケーリングの下限を設定できます。

## 機能 \{#capabilities\}

ClickHouse Cloud では、オープンソース版 ClickHouse に含まれる機能のうち、厳選された機能群のみを利用できます。以下の表では、現時点で ClickHouse Cloud では利用できない一部の機能について説明します。

### データベースおよびテーブルエンジン \{#database-and-table-engines\}

ClickHouse Cloud は、デフォルトで高可用なレプリケーション構成のサービスを提供します。その結果、すべてのデータベースおよびテーブルのエンジンは「Replicated」となります。たとえば、ClickHouse Cloud では `ReplicatedMergeTree` と `MergeTree` は同等として扱われるため、「Replicated」を明示的に指定する必要はありません。

**サポートされているテーブルエンジン**

- ReplicatedMergeTree（デフォルト。明示的に指定されていない場合）
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

### インターフェイス \{#interfaces\}

ClickHouse Cloud は HTTPS、ネイティブインターフェイス、[MySQL ワイヤプロトコル](/interfaces/mysql) をサポートしています。Postgres などの追加インターフェイスのサポートも近日中に予定されています。

### Dictionaries \{#dictionaries\}

Dictionaries は、ClickHouse におけるルックアップ（参照）処理を高速化する一般的な手法です。ClickHouse Cloud では現在、PostgreSQL、MySQL、リモートおよびローカルの ClickHouse サーバー、Redis、MongoDB、HTTP ソースを辞書のデータソースとしてサポートしています。

### フェデレーションクエリ \{#federated-queries\}

Cloud 内でのクラスタ間通信および外部のセルフマネージド ClickHouse クラスタとの通信のために、フェデレーションされた ClickHouse クエリをサポートしています。ClickHouse Cloud は現在、次のインテグレーションエンジンを使用したフェデレーションクエリをサポートしています：

- Deltalake
- Hudi
- MySQL
- MongoDB
- NATS
- RabbitMQ
- PostgreSQL
- S3

SQLite、ODBC、JDBC、Redis、HDFS、Hive など、一部の外部データベースおよびテーブルエンジンを用いたフェデレーションクエリは、まだサポートされていません。

### ユーザー定義関数 \{#user-defined-functions\}

ClickHouse Cloud におけるユーザー定義関数は、現在 [プライベートプレビュー](https://clickhouse.com/docs/sql-reference/functions/udf) 中です。

#### 設定の動作 \{#udf-settings-behavior\}

:::warning 重要
ClickHouse Cloud の UDF は、**ユーザーレベルの設定を継承しません**。デフォルトのシステム設定で実行されます。
:::

これは次のことを意味します:

- セッションレベルの設定（`SET` ステートメントで設定される）は UDF の実行コンテキストには伝播されない
- ユーザープロファイルの設定は UDF に継承されない
- クエリレベルの設定は UDF 実行中には適用されない

### 実験的機能 \{#experimental-features\}

サービスデプロイの安定性を確保するため、ClickHouse Cloud サービスでは実験的機能は無効になっています。

### 名前付きコレクション \{#named-collections\}

[名前付きコレクション](/operations/named-collections) は現時点では ClickHouse Cloud でサポートされていません。

## 運用時のデフォルト設定と考慮事項 \{#operational-defaults-and-considerations\}

以下は、ClickHouse Cloud サービスでのデフォルト設定です。サービスを正しく動作させるために固定されているものもあれば、調整可能なものもあります。

### 運用上の制限 \{#operational-limits\}

#### `max_parts_in_total: 10,000` \{#max_parts_in_total-10000\}

MergeTree テーブルにおける `max_parts_in_total` SETTING のデフォルト値は、100,000 から 10,000 に引き下げられました。変更の理由は、Cloud 上のサービス起動時に、多数のデータのパーツが存在すると起動時間が遅くなりやすいことが確認されたためです。多くのパーツが存在することは、通常、パーティションキーを細かくしすぎていることを示しており、これは多くの場合意図せずに行われるものであり、避けるべきです。デフォルト値の変更により、これらのケースをより早期に検出できるようになります。

#### `max_concurrent_queries: 1,000` \{#max_concurrent_queries-1000\}

より高い同時実行性を許可するため、このサーバーごとの setting をデフォルトの `100` から `1000` に引き上げています。 
これにより、提供される各ティアのサービスでは、`レプリカ数 * 1,000` の同時クエリ数となります。 
Basic ティアのサービスではレプリカが 1 つに制限されるため同時クエリ数は `1000`、Scale および Enterprise では、 
設定されているレプリカ数に応じて `1000+` の同時クエリが可能です。

#### `max_table_size_to_drop: 1,000,000,000,000` \{#max_table_size_to_drop-1000000000000\}

最大 1TB までのテーブル／パーティションを削除できるようにするため、この設定値を 50GB から引き上げています。

### システム設定 \{#system-settings\}

ClickHouse Cloud は変動するワークロード向けに最適化されており、そのため現時点ではほとんどのシステム設定をユーザー側で変更することはできません。ほとんどのユーザーでシステム設定のチューニングが必要になることは想定していませんが、高度なシステムチューニングについてご質問がある場合は、ClickHouse Cloud サポートまでお問い合わせください。

### 高度なセキュリティ管理 \{#advanced-security-administration\}

ClickHouse サービスの作成時には、既定のデータベースと、そのデータベースに対して広範な権限を持つ既定のユーザーが作成されます。この初期ユーザーは、追加のユーザーを作成し、それらのユーザーにこのデータベースに対する権限を割り当てることができます。ただし、Kerberos、LDAP、または SSL X.509 証明書認証を使用してデータベース内でセキュリティ機能を有効化することは、現時点ではサポートされていません。

## ロードマップ \{#roadmap\}

現在、ClickHouse Cloud におけるその他の多くの機能についても需要を評価しています。フィードバックや特定の機能についてのご要望がある場合は、[こちらからお送りください](https://console.clickhouse.cloud/support)。