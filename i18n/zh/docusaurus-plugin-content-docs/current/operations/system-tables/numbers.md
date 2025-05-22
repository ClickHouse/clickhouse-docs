
# system.numbers

这个表包含一个名为 `number` 的单列 UInt64，几乎包含从零开始的所有自然数。

您可以使用这个表进行测试，或者在需要进行穷举搜索时使用。

从这个表的读取并不会并行化。

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
