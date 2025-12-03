---
slug: /migrations/postgresql/overview
title: 'PostgreSQL と ClickHouse の比較'
description: 'PostgreSQL から ClickHouse への移行ガイド'
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
sidebar_label: '概要'
doc_type: 'guide'
---



# ClickHouse と PostgreSQL の比較 {#comparing-clickhouse-and-postgresql}



## なぜ Postgres より ClickHouse を使うのか？ {#why-use-clickhouse-over-postgres}

TLDR: ClickHouse は OLAP データベースとして、特に `GROUP BY` クエリなどの高速な分析処理向けに設計されている一方、Postgres はトランザクション処理向けに設計された OLTP データベースであるためです。

OLTP（online transactional processing）データベースは、トランザクションデータを管理するように設計されています。Postgres はその典型例であり、これらのデータベースの主な目的は、エンジニアが一連の更新処理をデータベースに送信した際、その処理全体が必ず成功するか、あるいは全体として失敗することを保証することです。ACID 特性を備えたこの種のトランザクション保証は、OLTP データベースの主な目的であり、Postgres の大きな強みでもあります。こうした要件を踏まえると、OLTP データベースは、大規模なデータセットに対する分析クエリに用いられた場合、しばしばパフォーマンス上の限界に突き当たります。

OLAP（online analytical processing）データベースは、そうしたニーズ、すなわち分析ワークロードを処理するために設計されています。これらのデータベースの主な目的は、エンジニアが巨大なデータセットに対して効率的にクエリを実行し、集計できるようにすることです。ClickHouse のようなリアルタイム OLAP システムでは、データがリアルタイムに取り込まれるのと同時に分析を実行できます。

ClickHouse と PostgreSQL のより詳しい比較については[こちら](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)を参照してください。

ClickHouse と Postgres の分析クエリにおける潜在的なパフォーマンス差を確認するには、[Rewriting PostgreSQL Queries in ClickHouse](/migrations/postgresql/rewriting-queries) を参照してください。



## 移行戦略 {#migration-strategies}

PostgreSQL から ClickHouse へ移行する際、最適な戦略はユースケース、インフラストラクチャ、データ要件によって異なります。一般的に、リアルタイムの Change Data Capture（CDC（変更データキャプチャ））は、ほとんどのモダンなユースケースに対して最良のアプローチであり、一方で、手動によるバルクロードとそれに続く定期的な更新は、よりシンプルなシナリオや一度限りの移行に適しています。

以下のセクションでは、移行のための 2 つの主要な戦略である **リアルタイム CDC** と **手動バルクロード + 定期的な更新** について説明します。

### リアルタイムレプリケーション（CDC） {#real-time-replication-cdc}

Change Data Capture（CDC（変更データキャプチャ））は、2 つのデータベース間でテーブルを同期状態に保つプロセスです。これは、PostgreSQL からの多くの移行に対して最も効率的なアプローチですが、PostgreSQL から ClickHouse への挿入・更新・削除をニアリアルタイムで処理するため、より複雑でもあります。リアルタイム分析が重要なユースケースに最適です。

リアルタイムの Change Data Capture（CDC）は、ClickHouse Cloud を使用している場合は [ClickPipes](/integrations/clickpipes/postgres/deduplication)、オンプレミスで ClickHouse を稼働させている場合は [PeerDB](https://github.com/PeerDB-io/peerdb) を利用することで ClickHouse に実装できます。これらのソリューションは、PostgreSQL からの挿入・更新・削除をキャプチャして ClickHouse にレプリケートすることで、初回ロードを含むリアルタイムデータ同期の複雑さを吸収します。このアプローチにより、手動の介入を必要とせずに、ClickHouse 内のデータが常に最新かつ正確な状態であることが保証されます。

### 手動バルクロード + 定期的な更新 {#manual-bulk-load-periodic-updates}

場合によっては、手動によるバルクロードとそれに続く定期的な更新といった、より単純なアプローチで十分なこともあります。この戦略は、一度限りの移行や、リアルタイムレプリケーションが不要な状況に最適です。これは、PostgreSQL から ClickHouse へデータを一括ロードするもので、直接 SQL の `INSERT` コマンドを使用するか、CSV ファイルをエクスポート／インポートする方法があります。初回の移行後は、PostgreSQL からの変更を一定間隔で同期することで、ClickHouse 内のデータを定期的に更新できます。

バルクロードプロセスはシンプルかつ柔軟ですが、リアルタイム更新がないというデメリットがあります。一度初期データが ClickHouse にロードされると、その後の更新は即座には反映されないため、PostgreSQL からの変更を同期するための定期的な更新スケジュールを設定する必要があります。このアプローチは、時間的な厳密性がそれほど高くないユースケースには有効ですが、PostgreSQL でデータが変更されてから、その変更が ClickHouse に反映されるまでに遅延が生じます。

### どの戦略を選ぶべきか？ {#which-strategy-to-choose}

ClickHouse 内で常に新鮮で最新のデータを必要とするほとんどのアプリケーションに対しては、ClickPipes によるリアルタイム CDC が推奨されるアプローチです。最小限のセットアップと運用で継続的なデータ同期を提供します。一方、手動バルクロードと定期的な更新は、よりシンプルな一度限りの移行や、リアルタイム更新が必須ではないワークロードに対する有効な選択肢です。

---

**[PostgreSQL 移行ガイドをここから開始します](/migrations/postgresql/dataset)。**
