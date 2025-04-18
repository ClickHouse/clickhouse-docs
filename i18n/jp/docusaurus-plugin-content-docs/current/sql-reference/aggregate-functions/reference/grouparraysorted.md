---
slug: /sql-reference/aggregate-functions/reference/grouparraysorted
sidebar_position: 146
title: "groupArraySorted"
description: "昇順で最初の N 件のアイテムを含む配列を返します。"
---


# groupArraySorted

昇順で最初の N 件のアイテムを含む配列を返します。

``` sql
groupArraySorted(N)(column)
```

**引数**

- `N` – 戻り値の要素数。

- `column` – 値（Integer、String、Float およびその他の一般的な型）。

**例**

最初の 10 の数値を取得します：

``` sql
SELECT groupArraySorted(10)(number) FROM numbers(100)
```

``` text
┌─groupArraySorted(10)(number)─┐
│ [0,1,2,3,4,5,6,7,8,9]        │
└──────────────────────────────┘
```

カラム内のすべての数値の String 実装を取得します：

``` sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) as str FROM numbers(5));
```

``` text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
```
