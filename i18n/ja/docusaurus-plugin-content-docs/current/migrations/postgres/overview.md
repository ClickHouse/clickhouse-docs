---
slug: /migrations/postgresql/overview
title: PostgreSQLからClickHouseへの移行
description: PostgreSQLからClickHouseへの移行ガイド
keywords: [postgres, postgresql, migrate, migration]
---

## なぜPostgresよりもClickHouseを使用するのか？ {#why-use-clickhouse-over-postgres}

TLDR: ClickHouseは迅速な分析のために設計されており、特に`GROUP BY`クエリに優れたOLAPデータベースであるのに対し、Postgresはトランザクション処理のために設計されたOLTPデータベースです。

OLTP（オンライン・トランザクション処理）データベースは、トランザクション情報を管理するように設計されています。これらのデータベースの主な目的は、エンジニアがデータベースに一連の更新を送信し、そのすべてが確実に成功するか失敗するかを保証することです。このようなトランザクションの保証はACIDプロパティを伴い、OLTPデータベースの主要な焦点であり、Postgresの大きな強みです。これらの要件を考えると、OLTPデータベースは通常、大規模データセットに対する分析クエリを使用する際にパフォーマンスの制限に直面します。

OLAP（オンライン・分析処理）データベースは、分析ワークロードを管理するニーズを満たすように設計されています。これらのデータベースの主な目的は、エンジニアが膨大なデータセットに対して効率的にクエリを実行し、集計できるようにすることです。ClickHouseのようなリアルタイムOLAPシステムは、データがリアルタイムで取り込まれる際にこの分析を実行できるようにします。

より詳細な比較については、[このブログ記事](https://clickhouse.com/blog/adding-real-time-analytics-to-a-supabase-application)をご覧ください。

ClickHouseとPostgresの分析クエリにおけるパフォーマンスの違いの可能性を確認するには、[ClickHouseにおけるPostgreSQLクエリの書き換え](/migrations/postgresql/rewriting-queries)を参照してください。

---

**[ここからPostgreSQL移行ガイドを始める](/migrations/postgresql/dataset)。**
