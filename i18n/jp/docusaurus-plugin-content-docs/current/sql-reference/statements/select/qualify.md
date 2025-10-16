---
'description': 'QUALIFY 句のドキュメント'
'sidebar_label': 'QUALIFY'
'slug': '/sql-reference/statements/select/qualify'
'title': 'QUALIFY 句'
'doc_type': 'reference'
---


# QUALIFY 句

ウィンドウ関数の結果をフィルタリングすることを可能にします。これは [WHERE](../../../sql-reference/statements/select/where.md) 句に似ていますが、違いは `WHERE` がウィンドウ関数の評価の前に実行されるのに対し、`QUALIFY` はその後に実行される点です。

`QUALIFY` 句では、エイリアスを使って `SELECT` 句のウィンドウ関数の結果を参照することができます。あるいは、`QUALIFY` 句はクエリ結果に返されない追加のウィンドウ関数の結果をフィルタリングすることもできます。

## 制限事項 {#limitations}

ウィンドウ関数が評価されない場合、`QUALIFY` は使用できません。その場合は `WHERE` を使用してください。

## 例 {#examples}

例:

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
