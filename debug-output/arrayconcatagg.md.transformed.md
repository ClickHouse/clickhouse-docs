---
description: 'Documentation for the array_concat_agg function'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/array_concat_agg
title: 'array_concat_agg'
---

# array_concat_agg 
- Alias of `groupArrayArray`. The function is case insensitive.

**Example**

```text
SELECT *
FROM t

```

Query:

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