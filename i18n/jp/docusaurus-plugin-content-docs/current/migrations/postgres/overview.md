---
slug: '/migrations/postgresql/overview'
title: 'PostgreSQLからClickHouseへの移行'
description: 'PostgreSQLからClickHouseへの移行に関するガイド'
keywords:
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
---



## Why use ClickHouse over Postgres? {#why-use-clickhouse-over-postgres}

TLDR: ClickHouseは、OLAPデータベースとして特に `GROUP BY` クエリのために高速分析を設計されているため、Postgresよりも優れています。一方、Postgresはトランザクションワークロード向けに設計されたOLTPデータベースです。

OLTP（オンライントランザクション処理）データベースは、トランザクション情報を管理するように設計されています。これらのデータベースの主な目的は、エンジニアがデータベースに一連の更新を提出し、それが完全に成功するか完全に失敗するかを確実にすることです。ACID特性を持つこれらのトランザクション保証は、OLTPデータベースの主な焦点であり、Postgresの大きな強みです。これらの要件を考慮すると、OLTPデータベースは通常、大規模なデータセットに対する分析クエリでパフォーマンスの制限に直面します。

OLAP（オンライン分析処理）データベースは、分析ワークロードを管理するために設計されています。これらのデータベースの主な目的は、エンジニアが広大なデータセットに対して効率的にクエリを実行し、集約できるようにすることです。ClickHouseのようなリアルタイムOLAPシステムは、データがリアルタイムで取り込まれる際にこの分析を可能にします。

ClickHouseとPostgreSQLの詳細な比較については、[こちら](https://migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)をご覧ください。

ClickHouseとPostgresの分析クエリにおけるパフォーマンスの違いを確認するには、[PostgreSQLクエリをClickHouseに書き換える](/migrations/postgresql/rewriting-queries)をご覧ください。

## Migration strategies {#migration-strategies}

PostgreSQLからClickHouseへの移行では、適切な戦略はユースケース、インフラストラクチャ、およびデータ要件に依存します。一般的に、リアルタイムのChange Data Capture (CDC) はほとんどの現代のユースケースに最適なアプローチですが、マニュアルバルクロードに続いて定期的な更新を行うことは、単純なシナリオや一度限りの移行に適しています。

以下のセクションでは、移行の2つの主な戦略について説明します：**リアルタイムCDC**と**マニュアルバルクロード + 定期的な更新**。

### Real-Time replication (CDC) {#real-time-replication-cdc}

Change Data Capture (CDC)は、2つのデータベース間でテーブルを同期させるプロセスです。これは、PostgreSQLからClickHouseへの移行にとって最も効率的なアプローチですが、近リアルタイムでPostgreSQLからClickHouseへの挿入、更新、削除を処理するため、より複雑です。リアルタイム分析が重要なユースケースに最適です。

リアルタイムChange Data Capture (CDC)は、ClickHouse Cloudを使用している場合は[ClickPipes](/integrations/clickpipes/postgres/deduplication)を使用して実装できます。また、オンプレミスでClickHouseを実行している場合は[PeerDB](https://github.com/PeerDB-io/peerdb)を使用できます。これらのソリューションは、PostgreSQLからの挿入、更新、削除をキャプチャしてClickHouseに複製することで、リアルタイムのデータ同期の複雑さを処理します。このアプローチにより、ClickHouse内のデータが常に新鮮で正確に保たれ、手動での介入が不要になります。

### Manual bulk load + periodic updates {#manual-bulk-load-periodic-updates}

場合によっては、手動バルクローディングに続いて定期的に更新する、より簡単なアプローチが十分な場合もあります。この戦略は、一度限りの移行やリアルタイムレプリケーションが不要な状況に最適です。PostgreSQLからClickHouseにデータをバルクでロードすることを含み、直接SQL `INSERT` コマンドを使用するか、CSVファイルをエクスポートしてインポートします。初回の移行後、定期的にPostgreSQLからの変更を同期してClickHouse内のデータを更新できます。

バルクロードプロセスは簡単で柔軟ですが、リアルタイム更新がないという欠点があります。初期データがClickHouseにあると、更新は直ちには反映されないため、PostgreSQLからの変更を同期するために定期的な更新スケジュールを設定する必要があります。このアプローチは、時間に敏感でないユースケースには適していますが、PostgreSQLでデータが変更されたときと、ClickHouseにその変更が現れるときとの間に遅延が生じます。

### Which strategy to choose? {#which-strategy-to-choose}

ClickHouseに新鮮で最新のデータを必要とするほとんどのアプリケーションにとって、ClickPipesを通じたリアルタイムCDCが推奨されるアプローチです。これは、最小限のセットアップとメンテナンスで継続的なデータ同期を提供します。一方、定期的な更新を伴う手動バルクローディングは、単純な一度限りの移行やリアルタイム更新が重要でないワークロードには実行可能なオプションです。

---

**[PostgreSQL移行ガイドをここから開始します](/migrations/postgresql/dataset)。**
