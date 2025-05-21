---
'description': 'System table containing a single UInt64 column named `number` that
  contains almost all the natural numbers starting from zero.'
'keywords':
- 'system table'
- 'numbers'
'slug': '/operations/system-tables/numbers'
'title': 'system.numbers'
---




# system.numbers

该表包含一个名为 `number` 的 UInt64 列，其中几乎包含从零开始的所有自然数。

您可以使用此表进行测试，或者在需要进行暴力搜索时使用。

从此表读取的数据未进行并行化处理。

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

您还可以通过谓词来限制输出。

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
