---
description: '最後の引数の値の配列を作成します。'
sidebar_position: 142
slug: /sql-reference/aggregate-functions/reference/grouparraylast
title: 'groupArrayLast'
doc_type: 'reference'
---

# groupArrayLast

構文: `groupArrayLast(max_size)(x)`

末尾の引数値から成る配列を作成します。
例えば、`groupArrayLast(1)(x)` は `[anyLast (x)]` と同等です。

場合によっては、実行順序に依然として依存できます。これは、サブクエリの結果が十分に小さい場合に、そのサブクエリ内で `ORDER BY` を使用している `SELECT` の結果に対して適用されます。

**例**

クエリ：

```sql
SELECT groupArrayLast(2)(number+1) numbers FROM numbers(10)
```

結果：

```text
┌─numbers─┐
│ [9,10]  │
└─────────┘
```

`groupArray` と比べると：

```sql
SELECT groupArray(2)(number+1) numbers FROM numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
