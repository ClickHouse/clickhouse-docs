---
title: 'ClickHouse はリアルタイム更新をサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse は軽量なリアルタイム更新機能をサポートしています'
doc_type: 'reference'
keywords: ['更新', 'リアルタイム']
---

# ClickHouse はリアルタイム更新をサポートしていますか？ \\{#does-clickhouse-support-real-time-updates\\}

ClickHouse は `UPDATE` 文をサポートしており、`INSERT` と同等の速度でリアルタイムに更新を実行できます。

これは、[patch parts データ構造](https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates#stage-3-patch-parts--updates-the-clickhouse-way) によって、`SELECT` パフォーマンスに大きな影響を与えることなく、変更を高速に適用できるためです。

さらに、MVCC（multi-version concurrency control、マルチバージョン並行制御）およびスナップショット分離により、更新は ACID 特性を満たします。

:::info
軽量更新は、ClickHouse バージョン 25.7 で初めて導入されました。
:::