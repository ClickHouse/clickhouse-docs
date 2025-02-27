---
slug: /sql-reference/aggregate-functions/reference/grouparraysorted
sidebar_position: 146
---

 # groupArraySorted

 N個のアイテムを昇順で含む配列を返します。

 ``` sql
 groupArraySorted(N)(column)
 ```

 **引数**

 -   `N` – 戻り値の要素数。

 -   `column` – 値（整数、文字列、浮動小数点およびその他の一般的な型）。

 **例**

 最初の10個の数字を取得する：

 ``` sql
 SELECT groupArraySorted(10)(number) FROM numbers(100)
 ```

 ``` text
 ┌─groupArraySorted(10)(number)─┐
 │ [0,1,2,3,4,5,6,7,8,9]        │
 └──────────────────────────────┘
 ```


 列のすべての数字の文字列実装を取得する：

 ``` sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) as str FROM numbers(5));

 ```

 ``` text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
 ```
