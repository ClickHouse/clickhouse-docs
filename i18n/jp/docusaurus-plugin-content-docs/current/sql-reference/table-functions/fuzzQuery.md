---
slug: /sql-reference/table-functions/fuzzQuery
sidebar_position: 75
sidebar_label: fuzzQuery
title: "fuzzQuery"
description: "指定されたクエリ文字列をランダムな変動で変化させます。"
---


# fuzzQuery テーブル関数

指定されたクエリ文字列をランダムな変動で変化させます。

``` sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

**引数**

- `query` (String) - フォズィングを行う元のクエリ。
- `max_query_length` (UInt64) - フォズィングプロセス中にクエリが達することができる最大長。
- `random_seed` (UInt64) - 安定した結果を生成するためのランダムシード。

**返される値**

フォズィングされたクエリ文字列を含む単一のカラムを持つテーブルオブジェクト。

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
