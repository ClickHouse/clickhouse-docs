---
description: 'QUALIFY 句に関するドキュメント'
sidebar_label: 'QUALIFY'
slug: /sql-reference/statements/select/qualify
title: 'QUALIFY 句'
doc_type: 'reference'
---

# QUALIFY 句 \{#qualify-clause\}

ウィンドウ関数の結果をフィルタリングするために使用します。[WHERE](../../../sql-reference/statements/select/where.md) 句と似ていますが、`WHERE` はウィンドウ関数の評価より前に実行されるのに対し、`QUALIFY` はその後に実行される点が異なります。

`QUALIFY` 句では、`SELECT` 句内で定義したエイリアスを使用して、そのウィンドウ関数の結果を参照できます。あるいは、クエリ結果としては返さない追加のウィンドウ関数の結果に対してフィルタリングを行うこともできます。

## 制限事項 \{#limitations\}

評価するウィンドウ関数が存在しない場合は、`QUALIFY` は使用できません。代わりに `WHERE` を使用してください。

## 例 \{#examples\}

例：

```sql
SELECT number, COUNT() OVER (PARTITION BY number % 3) AS partition_count
FROM numbers(10)
QUALIFY partition_count = 4
ORDER BY number;
```

```text
┌─number─┬─partition_count─┐
│      0 │               4 │
│      3 │               4 │
│      6 │               4 │
│      9 │               4 │
└────────┴─────────────────┘
```
