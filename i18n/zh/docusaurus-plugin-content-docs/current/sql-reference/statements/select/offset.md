`OFFSET` 和 `FETCH` 允许您按部分检索数据。它们指定您希望通过单个查询获取的行块。

```sql
OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]
```

`offset_row_count` 或 `fetch_row_count` 的值可以是一个数字或常量文字。您可以省略 `fetch_row_count`；默认情况下，它等于 1。

`OFFSET` 指定在开始从查询结果集中返回行之前要跳过的行数。

`FETCH` 指定查询结果中可以包含的最大行数。

`ONLY` 选项用于返回紧随 `OFFSET` 所省略行后的行。在这种情况下，`FETCH` 是 [LIMIT](../../../sql-reference/statements/select/limit.md) 子句的替代项。例如，以下查询

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

与查询

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

是相同的。

`WITH TIES` 选项用于返回在结果集中根据 `ORDER BY` 子句与最后一行并列的任何额外行。例如，如果 `fetch_row_count` 设置为 5，但有两个额外的行与第五行的 `ORDER BY` 列的值匹配，则结果集将包含七行。

:::note    
根据标准，如果同时存在 `OFFSET` 和 `FETCH` 子句，则 `OFFSET` 子句必须在 `FETCH` 子句之前。
:::

:::note    
真实的偏移量也可能依赖于 [offset](../../../operations/settings/settings.md#offset) 设置。
:::

## 示例 {#examples}

输入表：

```text
┌─a─┬─b─┐
│ 1 │ 1 │
│ 2 │ 1 │
│ 3 │ 4 │
│ 1 │ 3 │
│ 5 │ 4 │
│ 0 │ 6 │
│ 5 │ 7 │
└───┴───┘
```

使用 `ONLY` 选项：

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

结果：

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

使用 `WITH TIES` 选项：

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

结果：

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
