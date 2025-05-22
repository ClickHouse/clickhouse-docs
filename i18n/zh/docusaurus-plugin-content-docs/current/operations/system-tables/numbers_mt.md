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
