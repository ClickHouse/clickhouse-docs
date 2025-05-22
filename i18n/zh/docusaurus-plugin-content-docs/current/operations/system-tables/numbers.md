---
'description': '系统表包含一个名为 `number` 的 UInt64 列，该列包含从零开始几乎所有的自然数。'
'keywords':
- 'system table'
- 'numbers'
'slug': '/operations/system-tables/numbers'
'title': 'system.numbers'
---


# system.numbers

此表包含一个名为 `number` 的 UInt64 列，该列包含从零开始几乎所有的自然数。

您可以将此表用于测试，或者如果您需要进行暴力搜索时使用。

从此表的读取没有并行化。

**示例**

```sql
SELECT * FROM system.numbers LIMIT 10;
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

您还可以通过谓词限制输出。

```sql
SELECT * FROM system.numbers < 10;
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
