---
slug: /sql-reference/table-functions/fuzzQuery
sidebar_position: 75
sidebar_label: fuzzQuery
---

# fuzzQuery

与えられたクエリ文字列をランダムな変化で変 perturb します。

``` sql
fuzzQuery(query[, max_query_length[, random_seed]])
```

**引数**

- `query` (文字列) - ファジングを行う元のクエリ。
- `max_query_length` (UInt64) - ファジングプロセス中のクエリの最大長。
- `random_seed` (UInt64) - 安定した結果を生成するためのランダムシード。

**返される値**

変 perturb されたクエリ文字列を含む単一カラムのテーブルオブジェクト。

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
