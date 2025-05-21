---
description: '引数の最後の値の配列を作成します。'
sidebar_position: 142
slug: /sql-reference/aggregate-functions/reference/grouparraylast
title: 'groupArrayLast'
---


# groupArrayLast

構文: `groupArrayLast(max_size)(x)`

引数の最後の値の配列を作成します。  
例えば、 `groupArrayLast(1)(x)` は `[anyLast (x)]` と同等です。

場合によっては、実行順序に依存することができます。これは、サブクエリからの `SELECT` が `ORDER BY` を使用し、サブクエリの結果が十分に小さい場合に当てはまります。

**例**

クエリ:

```sql
select groupArrayLast(2)(number+1) numbers from numbers(10)
```

結果:

```text
┌─numbers─┐
│ [9,10]  │
└─────────┘
```

`groupArray` と比較した場合:

```sql
select groupArray(2)(number+1) numbers from numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
