
# system.projections

包含所有表中现有投影的信息。

列：

- `database` ([String](../../sql-reference/data-types/string.md)) — 数据库名称。
- `table` ([String](../../sql-reference/data-types/string.md)) — 表名称。
- `name` ([String](../../sql-reference/data-types/string.md)) — 投影名称。
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — 投影类型 ('Normal' = 0, 'Aggregate' = 1)。
- `sorting_key` ([Array(String)](../../sql-reference/data-types/array.md)) — 投影排序键。
- `query` ([String](../../sql-reference/data-types/string.md)) — 投影查询。

**示例**

```sql
SELECT * FROM system.projections LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:    default
table:       landing
name:        improved_sorting_key
type:        Normal
sorting_key: ['user_id','date']
query:       SELECT * ORDER BY user_id, date

Row 2:
──────
database:    default
table:       landing
name:        agg_no_key
type:        Aggregate
sorting_key: []
query:       SELECT count()
```
