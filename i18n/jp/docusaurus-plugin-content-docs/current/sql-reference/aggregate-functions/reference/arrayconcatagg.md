---
description: 'array_concat_agg 関数のドキュメント'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/array_concat_agg
title: 'array_concat_agg'
---


# array_concat_agg 
- `groupArrayArray` のエイリアス。関数は大文字小文字を区別しません。

**例**

```text
SELECT *
FROM t

```

クエリ:

```sql
┌           ┐
│[1,2,3]    │
│[4,5]      │
│[6]        │
└           ┘

```
┌ ─a───────────── ┌
│ [1,2,3,4,5,6]   │
└ ─────────────── └
