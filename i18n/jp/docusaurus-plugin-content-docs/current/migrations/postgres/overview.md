---
slug: /migrations/postgresql/overview
title: PostgreSQLからClickHouseへの移行
description: PostgreSQLからClickHouseへの移行ガイド
keywords: [postgres, postgresql, migrate, migration]
---

## ClickHouseをPostgresより使用する理由は？ {#why-use-clickhouse-over-postgres}

TLDR: ClickHouseはOLAPデータベースとして、特に`GROUP BY`クエリ用に迅速な分析を行うために設計されているのに対し、Postgresはトランザクションワークロード用に設計されたOLTPデータベースだからです。

OLTP、すなわちオンライントランザクション処理データベースは、トランザクション情報を管理するために設計されています。これらのデータベース、Postgresがその典型的な例ですが、エンジニアがデータベースに更新のブロックを送信し、それが完全に成功するか失敗するかを確実にすることが主な目的です。ACID特性を持つこうしたトランザクションの保証がOLTPデータベースの主な焦点であり、Postgresの大きな強みでもあります。これらの要件に鑑みると、OLTPデータベースは大規模なデータセットに対する分析クエリで使用すると、通常はパフォーマンスの制限に直面します。

OLAP、すなわちオンライン分析処理データベースは、分析のワークロードを管理するために設計されています。これらのデータベースの主な目的は、エンジニアが膨大なデータセットに対して効率的にクエリし、集計できるようにすることです。ClickHouseのようなリアルタイムOLAPシステムは、データがリアルタイムで取り込まれる際にこの分析が行われることを許可します。

より詳細な比較については、[こちらのブログ記事](https://clickhouse.com/blog/adding-real-time-analytics-to-a-supabase-application)をご覧ください。

ClickHouseとPostgresの分析クエリにおけるパフォーマンスの違いを確認するには、[ClickHouseにおけるPostgreSQLクエリの書き換え](/migrations/postgresql/rewriting-queries)をご覧ください。

---

**[PostgreSQL移行ガイドをここから始める](/migrations/postgresql/dataset).**
