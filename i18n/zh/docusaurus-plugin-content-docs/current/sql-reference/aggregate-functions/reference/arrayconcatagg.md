---
'description': 'array_concat_agg函数的文档'
'sidebar_position': 111
'slug': '/sql-reference/aggregate-functions/reference/array_concat_agg'
'title': 'array_concat_agg'
---


# array_concat_agg 
- `groupArrayArray` 的别名。该函数对大小写不敏感。

**示例**

```text
SELECT *
FROM t

```

查询：

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
