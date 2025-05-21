---
slug: /migrations/postgresql/overview
title: 'PostgreSQLからClickHouseへの移行'
description: 'PostgreSQLからClickHouseへの移行ガイド'
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
---

## なぜPostgresよりClickHouseを使用するのか？ {#why-use-clickhouse-over-postgres}

TLDR: ClickHouseはOLAPデータベースとして、高速な分析、特に `GROUP BY` クエリのために設計されているためです。一方、Postgresはトランザクション処理用に設計されたOLTPデータベースです。

OLTP（オンライン・トランザクション処理）データベースは、トランザクション情報を管理するために設計されています。これらのデータベースの主な目的は、エンジニアがデータベースに一連の更新を送信し、それが全体として成功するか失敗するかを確実にすることです。ACIDプロパティを持つこのタイプのトランザクショナルな保証は、OLTPデータベースの主な焦点であり、Postgresの大きな強みです。これらの要件を考慮すると、OLTPデータベースは大規模なデータセットに対する分析クエリでパフォーマンスの制限にぶつかることがよくあります。

OLAP（オンライン・分析処理）データベースは、そのニーズに応えるために設計されています — 分析ワークロードを管理するためです。これらのデータベースの主な目的は、エンジニアが大規模なデータセットに対して効率的にクエリを実行し、集約できることを保証することです。ClickHouseのようなリアルタイムOLAPシステムは、データがリアルタイムで取り込まれる際にこの分析が行われることを可能にします。

ClickHouseとPostgreSQLのより詳細な比較については、[こちら](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)をご覧ください。

分析クエリにおけるClickHouseとPostgresのパフォーマンス差については、[PostgreSQLクエリのClickHouseでの書き換え](/migrations/postgresql/rewriting-queries)をご覧ください。

## 移行戦略 {#migration-strategies}

PostgreSQLからClickHouseへの移行時、適切な戦略は使用ケース、インフラストラクチャ、データ要件によって異なります。一般的に、リアルタイムの変更データキャプチャ（CDC）が最も多くの現代の使用ケースに適したアプローチですが、手動の一括ロードと定期的な更新を組み合わせる方法は、よりシンプルなシナリオや一度限りの移行に適しています。

以下のセクションでは、移行のための2つの主要な戦略、つまり **リアルタイムCDC** と **手動一括ロード + 定期更新** について説明します。

### リアルタイムレプリケーション（CDC） {#real-time-replication-cdc}

変更データキャプチャ（CDC）は、2つのデータベース間でテーブルが同期されるプロセスです。これは、PostgreSQLからClickHouseへの移行において最も効率的なアプローチですが、PostgreSQLからClickHouseへの挿入、更新、削除をほぼリアルタイムで処理するため、より複雑です。リアルタイムの分析が重要なケースに最適です。

リアルタイム変更データキャプチャ（CDC）は、ClickHouse Cloudを使用している場合は[ClickPipes](/integrations/clickpipes/postgres/deduplication)を使用して、オンプレミスでClickHouseを実行している場合は[PeerDB](https://github.com/PeerDB-io/peerdb)を使用して実装できます。これらのソリューションは、PostgreSQLからの挿入、更新、および削除をキャプチャし、それをClickHouseにレプリケートすることによって、リアルタイムデータ同期の複雑さを処理します。このアプローチにより、ClickHouseのデータは常に新鮮で正確であり、手動の介入が不要です。

### 手動一括ロード + 定期的更新 {#manual-bulk-load-periodic-updates}

場合によっては、手動一括ロードを行い、その後定期的な更新を行うよりシンプルなアプローチが十分な場合があります。この戦略は、一度限りの移行や、リアルタイムのレプリケーションが必要ない状況に最適です。PostgreSQLからClickHouseにデータを一括でロードすることが含まれ、直接SQLの `INSERT` コマンドを通じて、またはCSVファイルをエクスポートおよびインポートすることで行われます。最初の移行の後、PostgreSQLからの変更を定期的に同期することでClickHouseのデータを更新することができます。

一括ロードプロセスはシンプルで柔軟ですが、リアルタイムの更新がないという欠点があります。最初のデータがClickHouseにある場合、更新は即座に反映されないため、PostgreSQLから変更を同期するために定期的な更新を計画する必要があります。このアプローチは、時間に敏感でない使用ケースには適していますが、PostgreSQLでデータが変更されてからClickHouseにそれらの変更が見えるまでに遅延が生じます。

### どの戦略を選ぶべきか？ {#which-strategy-to-choose}

ClickHouseで新鮮で最新のデータが必要なほとんどのアプリケーションには、ClickPipesを通じたリアルタイムCDCが推奨されるアプローチです。最小限の設定とメンテナンスで継続的なデータ同期を提供します。一方で、手動一括ロードと定期更新は、シンプルな一度限りの移行や、リアルタイムの更新が重要でないワークロードに適した実行可能なオプションです。

---

**[ここからPostgreSQL移行ガイドを開始します](/migrations/postgresql/dataset)。**
