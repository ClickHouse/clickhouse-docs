---
'description': '系统表类似于 `system.numbers` 但读取是并行的，数字可以以任何顺序返回。'
'keywords':
- 'system table'
- 'numbers_mt'
'slug': '/operations/system-tables/numbers_mt'
'title': 'system.numbers_mt'
---

与 [`system.numbers`](../../operations/system-tables/numbers.md) 相同，但读取是并行化的。数字可以以任何顺序返回。

用于测试。

**示例**

```sql
SELECT * FROM system.numbers_mt LIMIT 10;
```

```response
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘

10 rows in set. Elapsed: 0.001 sec.
```
