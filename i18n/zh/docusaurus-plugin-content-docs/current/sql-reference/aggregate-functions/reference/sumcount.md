---
'description': '计算数字的总和，同时计算行数。该函数由ClickHouse查询优化器使用：如果一个查询中有多个`sum`、`count`或`avg`函数，它们可以被替换为单个`sumCount`函数以重用计算结果。该函数很少需要显式使用。'
'sidebar_position': 196
'slug': '/sql-reference/aggregate-functions/reference/sumcount'
'title': 'sumCount'
---



计算数字的总和并同时计数行数。该函数由 ClickHouse 查询优化器使用：如果查询中有多个 `sum`、`count` 或 `avg` 函数，可以用单个 `sumCount` 函数替代，以重用计算。该函数很少需要显式使用。

**语法**

```sql
sumCount(x)
```

**参数**

- `x` — 输入值，必须是 [Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。

**返回值**

- 元组 `(sum, count)`，其中 `sum` 是数字的总和，`count` 是非 NULL 值的行数。

类型：[Tuple](../../../sql-reference/data-types/tuple.md)。

**示例**

查询：

```sql
CREATE TABLE s_table (x Int8) Engine = Log;
INSERT INTO s_table SELECT number FROM numbers(0, 20);
INSERT INTO s_table VALUES (NULL);
SELECT sumCount(x) from s_table;
```

结果：

```text
┌─sumCount(x)─┐
│ (190,20)    │
└─────────────┘
```

**另请参阅**

- [optimize_syntax_fuse_functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions) 设置。
