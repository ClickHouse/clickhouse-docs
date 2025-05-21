---
description: 'テスト目的で使用される、最も迅速に多くの行を生成する方法。
  `system.zeros` および `system.zeros_mt` システムテーブルに似ています。'
sidebar_label: 'zeros'
sidebar_position: 145
slug: /sql-reference/table-functions/zeros
title: 'zeros'
---


# zeros テーブル関数

* `zeros(N)` – 単一の 'zero' カラム (UInt8) を持ち、整数 0 を `N` 回含むテーブルを返します
* `zeros_mt(N)` – `zeros` と同じですが、複数のスレッドを使用します。

この関数は、テスト目的で使用される、最も迅速に多くの行を生成する方法です。`system.zeros` および `system.zeros_mt` システムテーブルに似ています。

以下のクエリは同等です：

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
