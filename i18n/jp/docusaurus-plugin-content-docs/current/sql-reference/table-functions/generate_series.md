---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: generate_series
title: "generate_series (generateSeries)"
description: "開始から終了までの整数を含む 'generate_series' カラム (UInt64) を持つテーブルを返します。"
---


# generate_series (generateSeries) テーブル関数

`generate_series(START, STOP)` (エイリアス: `generateSeries`) - 開始から終了までの整数を含む 'generate_series' カラム (UInt64) を持つテーブルを返します。

`generate_series(START, STOP, STEP)` - 開始から終了までの整数を含む 'generate_series' カラム (UInt64) を持つテーブルを返し、値の間隔は STEP で与えられます。

以下のクエリは、同じ内容を持ちながら異なるカラム名を持つテーブルを返します：

``` sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

次のクエリも同じ内容を持つテーブルを返しますが、異なるカラム名を持ち（ただし、2番目のオプションの方が効率的です）：

``` sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
