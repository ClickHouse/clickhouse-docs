---
title: 'ClickHouse はリアルタイム更新をサポートしていますか?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse は軽量なリアルタイム更新をサポートします'
doc_type: 'reference'
keywords: ['updates', 'real-time']
---

# ClickHouse はリアルタイム更新をサポートしていますか？

ClickHouse は `UPDATE` ステートメントをサポートしており、`INSERT` と同等の速度でリアルタイム更新を実行できます。

これは、[patch parts データ構造](https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates#stage-3-patch-parts--updates-the-clickhouse-way) によって実現されています。これにより、`SELECT` のパフォーマンスに大きな影響を与えることなく、高速に変更を適用できます。

さらに、MVCC (multi-version concurrency control) とスナップショット分離により、更新は ACID 特性を満たします。

:::info
Lightweight updates は、ClickHouse バージョン 25.7 で初めて導入されました。
:::