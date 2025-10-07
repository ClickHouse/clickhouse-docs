---
'slug': '/migrations/postgresql/overview'
'title': 'PostgreSQLとClickHouseの比較'
'description': 'PostgreSQLからClickHouseへの移行ガイド'
'keywords':
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
'sidebar_label': '概要'
'doc_type': 'guide'
---


# ClickHouseとPostgreSQLの比較

## なぜPostgresよりもClickHouseを使用するのか？ {#why-use-clickhouse-over-postgres}

TLDR: ClickHouseは高速な分析、特に `GROUP BY` クエリのために設計されているOLAPデータベースであり、Postgresはトランザクションワークロードのために設計されたOLTPデータベースだからです。

OLTP（オンライン・トランザクション処理）データベースは、トランザクション情報を管理するために設計されています。これらのデータベースの主な目的は、エンジニアがデータベースに対して一連の更新を送信し、それが完全に成功するか失敗するかを確信できるようにすることです。ACIDプロパティを持つこのようなトランザクション保証はOLTPデータベースの主な焦点であり、Postgresの大きな強みです。これらの要件を考慮すると、OLTPデータベースは通常、大規模なデータセットに対する分析クエリの際に性能制限に直面します。

OLAP（オンライン・分析処理）データベースは、そのニーズを満たすために設計されており、分析ワークロードを管理します。これらのデータベースの主な目的は、エンジニアが膨大なデータセットを効率的にクエリし、集約できることを保証することです。ClickHouseのようなリアルタイムOLAPシステムは、データがリアルタイムで取り込まれる際にこの分析を可能にします。

ClickHouseとPostgreSQLの詳細な比較については、[こちら](https://example.com/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)をご覧ください。

ClickHouseとPostgresの分析クエリにおける潜在的なパフォーマンスの違いを確認するには、[PostgreSQLクエリをClickHouseに書き換える](https://example.com/migrations/postgresql/rewriting-queries)を参照してください。

## 移行戦略 {#migration-strategies}

PostgreSQLからClickHouseに移行する際、適切な戦略は使用ケース、インフラストラクチャ、データ要件に依存します。一般に、リアルタイムのChange Data Capture（CDC）がほとんどの現代の使用ケースにとって最適なアプローチですが、手動バルクローディングの後に定期的な更新が適している場合もあります。

以下のセクションでは、移行のための2つの主要な戦略、**リアルタイムCDC** と **手動バルクロード + 定期更新** について説明します。

### リアルタイムレプリケーション（CDC） {#real-time-replication-cdc}

Change Data Capture（CDC）は、2つのデータベース間でテーブルを同期させるプロセスです。これは、PostgreSQLからClickHouseへの移行のための最も効率的なアプローチですが、PostgreSQLからClickHouseに対する挿入、更新、削除をほぼリアルタイムで処理するため、より複雑です。リアルタイム分析が重要な使用ケースに最適です。

リアルタイムChange Data Capture（CDC）は、ClickHouse Cloudを使用している場合は[ClickPipes](https://example.com/integrations/clickpipes/postgres/deduplication)を使用して実装できます。また、オンプレミスでClickHouseを運用している場合は[PeerDB](https://github.com/PeerDB-io/peerdb)を利用できます。これらのソリューションは、初期ロードを含むリアルタイムデータ同期の複雑さを処理し、PostgreSQLからの挿入、更新、削除をキャプチャし、それをClickHouseにレプリケートします。このアプローチにより、ClickHouseのデータは常に新鮮で正確であり、手動の介入を必要としません。

### 手動バルクロード + 定期更新 {#manual-bulk-load-periodic-updates}

ある場合には、手動バルクローディングの後に定期的な更新を行う、より単純なアプローチが十分であることもあります。この戦略は、一度限りの移行やリアルタイムレプリケーションが必要ない状況に最適です。これは、PostgreSQLからClickHouseにデータを一括でロードすることを含みます。直接SQLの `INSERT` コマンドを使用するか、CSVファイルをエクスポートしてインポートする方法があります。初期移行の後、定期的にPostgreSQLからの変更を同期することで、ClickHouseのデータを更新できます。

バルクロードプロセスはシンプルで柔軟ですが、リアルタイム更新がないというデメリットがあります。初期データがClickHouseに入った後は、更新が即座には反映されないため、PostgreSQLから変更を同期するための定期的な更新をスケジュールする必要があります。このアプローチは、時間に敏感でない使用ケースにはうまく機能しますが、PostgreSQLでデータが変更されてからClickHouseにその変更が表示されるまでに遅延を引き起こします。

### どの戦略を選択すべきか？ {#which-strategy-to-choose}

ClickHouseに新鮮で最新のデータが必要なほとんどのアプリケーションにおいては、ClickPipesを通じたリアルタイムCDCが推奨されるアプローチです。これは、最小限のセットアップとメンテナンスで継続的なデータ同期を提供します。一方、手動バルクローディングと定期更新は、より単純な一回限りの移行やリアルタイム更新が重要でないワークロードにとって有効な選択肢です。

---

**[ここからPostgreSQL移行ガイドを開始します](/migrations/postgresql/dataset)。**
