---
description: 'テスト目的で、多数の行を生成するための最速の方法として使用されます。
  `system.zeros` および `system.zeros_mt` システムテーブルに類似しています。'
sidebar_label: 'zeros'
sidebar_position: 145
slug: /sql-reference/table-functions/zeros
title: 'zeros'
doc_type: 'reference'
---

# zeros テーブル関数

* `zeros(N)` – 単一の「zero」列 (UInt8) を持つテーブルを返し、その列には整数 0 が `N` 行分含まれます
* `zeros_mt(N)` – `zeros` と同じですが、マルチスレッドで実行されます。

この関数は、多数の行を生成するための最速の方法として、テスト目的で使用されます。`system.zeros` および `system.zeros_mt` システムテーブルに類似しています。

次のクエリは同等の結果になります。

```sql
SELECT * FROM zeros(10);
SELECT * FROM system.zeros LIMIT 10;
SELECT * FROM zeros_mt(10);
SELECT * FROM system.zeros_mt LIMIT 10;
```

```response
┌─zero─┐
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
└──────┘
```
