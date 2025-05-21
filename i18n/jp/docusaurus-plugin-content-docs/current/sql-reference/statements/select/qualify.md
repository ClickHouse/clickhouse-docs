---
description: 'QUALIFY句に関するドキュメント'
sidebar_label: 'QUALIFY'
slug: /sql-reference/statements/select/qualify
title: 'QUALIFY句'
---


# QUALIFY句

ウィンドウ関数の結果をフィルタリングすることを可能にします。これは[WHERE](../../../sql-reference/statements/select/where.md)句に似ていますが、違いは `WHERE` がウィンドウ関数の評価前に実行されるのに対し、`QUALIFY` はその後に実行される点です。

`QUALIFY` 句では、`SELECT` 句からウィンドウ関数の結果に対してエイリアスを使って参照することが可能です。あるいは、`QUALIFY` 句はクエリ結果に返されない追加のウィンドウ関数の結果に基づいてフィルタリングすることもできます。

## 制限事項 {#limitations}

ウィンドウ関数を評価するものが存在しない場合、`QUALIFY` は使用できません。その場合は `WHERE` を使用してください。

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
