---
slug: /sql-reference/statements/select/qualify
sidebar_label: QUALIFY
---


# QUALIFY 句

ウィンドウ関数の結果をフィルタリングすることができます。これは [WHERE](../../../sql-reference/statements/select/where.md) 句に似ていますが、違いは `WHERE` がウィンドウ関数の評価の前に実行されるのに対し、`QUALIFY` は評価の後に実行される点です。

`QUALIFY` 句では、`SELECT` 句からウィンドウ関数の結果をエイリアスを使って参照することが可能です。あるいは、`QUALIFY` 句は、クエリ結果に返されない追加のウィンドウ関数の結果でフィルタリングすることもできます。

## 制限事項 {#limitations}

ウィンドウ関数を評価する必要がない場合、`QUALIFY` は使用できません。その場合は `WHERE` を使用してください。

## 例 {#examples}

例:

``` sql
SELECT number, COUNT() OVER (PARTITION BY number % 3) AS partition_count
FROM numbers(10)
QUALIFY partition_count = 4
ORDER BY number;
```

``` text
┌─number─┬─partition_count─┐
│      0 │               4 │
│      3 │               4 │
│      6 │               4 │
│      9 │               4 │
└────────┴─────────────────┘
```
