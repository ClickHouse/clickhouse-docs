---
slug: /migrations/postgresql/overview
title: 'PostgreSQL と ClickHouse の比較'
description: 'PostgreSQL から ClickHouse への移行ガイド'
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
sidebar_label: '概要'
doc_type: 'guide'
---



# ClickHouse と PostgreSQL の比較



## PostgreSQLではなくClickHouseを使用する理由 {#why-use-clickhouse-over-postgres}

要約: ClickHouseは高速分析、特に`GROUP BY`クエリ向けに設計されたOLAPデータベースであるのに対し、PostgreSQLはトランザクション処理向けに設計されたOLTPデータベースであるためです。

OLTP(オンライントランザクション処理)データベースは、トランザクション情報を管理するために設計されています。PostgreSQLがその典型例であるこれらのデータベースの主な目的は、エンジニアが一連の更新をデータベースに送信した際、その全体が成功するか失敗するかを確実に保証することです。ACID特性を持つこのようなトランザクション保証は、OLTPデータベースの主要な焦点であり、PostgreSQLの大きな強みです。これらの要件を考慮すると、OLTPデータベースは大規模データセットに対する分析クエリに使用される場合、通常パフォーマンスの限界に直面します。

OLAP(オンライン分析処理)データベースは、これらのニーズ、つまり分析ワークロードを管理するために設計されています。これらのデータベースの主な目的は、エンジニアが膨大なデータセットに対して効率的にクエリと集計を実行できるようにすることです。ClickHouseのようなリアルタイムOLAPシステムでは、データがリアルタイムで取り込まれる際にこの分析を実行できます。

ClickHouseとPostgreSQLのより詳細な比較については、[こちら](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)を参照してください。

分析クエリにおけるClickHouseとPostgreSQLの潜在的なパフォーマンス差を確認するには、[ClickHouseでのPostgreSQLクエリの書き換え](/migrations/postgresql/rewriting-queries)を参照してください。


## 移行戦略 {#migration-strategies}

PostgreSQLからClickHouseへ移行する際、適切な戦略はユースケース、インフラストラクチャ、およびデータ要件によって異なります。一般的に、リアルタイムのChange Data Capture(CDC)は最新のユースケースの大半に最適なアプローチですが、手動による一括ロードとその後の定期的な更新は、よりシンプルなシナリオや一度限りの移行に適しています。

以下のセクションでは、移行のための2つの主要な戦略について説明します:**リアルタイムCDC**と**手動一括ロード + 定期更新**です。

### リアルタイムレプリケーション(CDC) {#real-time-replication-cdc}

Change Data Capture(CDC)は、2つのデータベース間でテーブルを同期状態に保つプロセスです。PostgreSQLからの移行において最も効率的なアプローチですが、PostgreSQLからClickHouseへの挿入、更新、削除をほぼリアルタイムで処理するため、より複雑です。リアルタイム分析が重要なユースケースに最適です。

リアルタイムのChange Data Capture(CDC)は、ClickHouse Cloudを使用している場合は[ClickPipes](/integrations/clickpipes/postgres/deduplication)を使用して、オンプレミスでClickHouseを実行している場合は[PeerDB](https://github.com/PeerDB-io/peerdb)を使用して実装できます。これらのソリューションは、PostgreSQLからの挿入、更新、削除をキャプチャしてClickHouseで複製することにより、初期ロードを含むリアルタイムデータ同期の複雑さを処理します。このアプローチにより、手動介入を必要とせずに、ClickHouse内のデータが常に最新かつ正確であることが保証されます。

### 手動一括ロード + 定期更新 {#manual-bulk-load-periodic-updates}

場合によっては、手動による一括ロードとその後の定期更新のような、より直接的なアプローチで十分な場合があります。この戦略は、一度限りの移行やリアルタイムレプリケーションが不要な状況に最適です。これには、直接的なSQL `INSERT`コマンドを使用するか、CSVファイルをエクスポートおよびインポートすることにより、PostgreSQLからClickHouseへデータを一括でロードすることが含まれます。初期移行後、定期的な間隔でPostgreSQLからの変更を同期することにより、ClickHouse内のデータを定期的に更新できます。

一括ロードプロセスはシンプルで柔軟性がありますが、リアルタイム更新がないという欠点があります。初期データがClickHouseに格納されると、更新は即座に反映されないため、PostgreSQLからの変更を同期するために定期的な更新をスケジュールする必要があります。このアプローチは、時間的制約の少ないユースケースには適していますが、PostgreSQLでデータが変更されてからClickHouseにその変更が表示されるまでの間に遅延が生じます。

### どの戦略を選択すべきか? {#which-strategy-to-choose}

ClickHouseで最新のデータを必要とするほとんどのアプリケーションにとって、ClickPipesを介したリアルタイムCDCが推奨されるアプローチです。最小限のセットアップとメンテナンスで継続的なデータ同期を提供します。一方、定期更新を伴う手動一括ロードは、よりシンプルな一度限りの移行や、リアルタイム更新が重要でないワークロードにとって実行可能な選択肢です。

---

**[PostgreSQL移行ガイドはこちらから開始してください](/migrations/postgresql/dataset)。**
