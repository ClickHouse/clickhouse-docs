---
description: '多数の行を生成するための最速の方法として、テスト目的で使用されます。
  `system.zeros` および `system.zeros_mt` システムテーブルに類似しています。'
sidebar_label: 'zeros'
sidebar_position: 145
slug: /sql-reference/table-functions/zeros
title: 'zeros'
doc_type: 'reference'
---

# zeros テーブル関数

* `zeros(N)` – 整数 0 を `N` 回含む、単一の「zero」列 (UInt8 型) を持つテーブルを返します
* `zeros_mt(N)` – `zeros` と同じですが、マルチスレッドで実行されます。

この関数は、多数の行を生成する最速の方法としてテスト用途で使用されます。`system.zeros` および `system.zeros_mt` システムテーブルと同様です。

次のクエリは同じ結果になります。

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
