---
description: '与えられたクエリ文字列をランダムな変化で扰乱します。'
sidebar_label: 'fuzzQuery'
sidebar_position: 75
slug: /sql-reference/table-functions/fuzzQuery
title: 'fuzzQuery'
---


# fuzzQuery テーブル関数

与えられたクエリ文字列をランダムな変化で扰乱します。

```sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

**引数**

- `query` (String) - 擾乱を行う元のクエリ。
- `max_query_length` (UInt64) - 擾乱プロセス中にクエリが取ることができる最大の長さ。
- `random_seed` (UInt64) - 安定した結果を生成するためのランダムシード。

**返される値**

擾乱されたクエリ文字列を含む単一のカラムを持つテーブルオブジェクト。

## 使用例 {#usage-example}

```sql
SELECT * FROM fuzzQuery('SELECT materialize(\'a\' AS key) GROUP BY key') LIMIT 2;
```

```response
   ┌─query──────────────────────────────────────────────────────────┐
1. │ SELECT 'a' AS key GROUP BY key                                 │
2. │ EXPLAIN PIPELINE compact = true SELECT 'a' AS key GROUP BY key │
   └────────────────────────────────────────────────────────────────┘
```
