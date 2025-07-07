---
'description': 'QUALIFY 句のドキュメント'
'sidebar_label': 'QUALIFY'
'slug': '/sql-reference/statements/select/qualify'
'title': 'QUALIFY Clause'
---




# QUALIFY句

ウィンドウ関数の結果をフィルタリングすることを可能にします。これは[WHERE](../../../sql-reference/statements/select/where.md)句に似ていますが、違いは `WHERE` がウィンドウ関数の評価前に実行されるのに対し、`QUALIFY` は評価後に実行される点です。

`QUALIFY`句では、`SELECT`句からのウィンドウ関数の結果をエイリアスを用いて参照することが可能です。あるいは、`QUALIFY`句は、クエリ結果に返されない追加のウィンドウ関数の結果をフィルタリングすることもできます。

## 制限 {#limitations}

ウィンドウ関数を評価するものがない場合、`QUALIFY`は使用できません。その場合は代わりに`WHERE`を使用してください。

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
