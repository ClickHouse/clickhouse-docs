---
title: 'ClickHouse はリアルタイム更新をサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse は軽量なリアルタイム更新をサポートしています'
doc_type: 'reference'
keywords: ['updates', 'real-time']
---

# ClickHouse はリアルタイム更新をサポートしていますか？

ClickHouse は `UPDATE` 文をサポートしており、`INSERT` と同等の速度でリアルタイム更新を実行できます。

これは、[patch parts データ構造](https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates#stage-3-patch-parts--updates-the-clickhouse-way) により、`SELECT` のパフォーマンスに大きな影響を与えることなく、変更を高速に適用できるためです。

さらに、MVCC（multi-version concurrency control、マルチバージョン並行実行制御）とスナップショット分離により、更新は ACID 特性を満たします。

:::info
軽量な更新は、ClickHouse バージョン 25.7 で初めて導入されました。
:::