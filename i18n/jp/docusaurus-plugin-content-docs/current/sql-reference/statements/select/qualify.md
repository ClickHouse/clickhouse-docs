---
description: 'QUALIFY 句に関するドキュメント'
sidebar_label: 'QUALIFY'
slug: /sql-reference/statements/select/qualify
title: 'QUALIFY 句'
doc_type: 'reference'
---



# QUALIFY 句

ウィンドウ関数の結果に対してフィルタ処理を行うための句です。[WHERE](../../../sql-reference/statements/select/where.md) 句と似ていますが、`WHERE` はウィンドウ関数の評価前に実行されるのに対し、`QUALIFY` はその後に実行される点が異なります。

`QUALIFY` 句では、`SELECT` 句で定義したエイリアスを用いて、そのウィンドウ関数の結果を参照できます。また、クエリの結果セットには含めない追加のウィンドウ関数を定義し、その結果に基づいてフィルタリングを行うこともできます。



## 制限事項 {#limitations}

評価対象のウィンドウ関数が存在しない場合、`QUALIFY`は使用できません。代わりに`WHERE`を使用してください。


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
