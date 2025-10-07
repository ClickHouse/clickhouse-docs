---
'description': 'nth_value窗口函数的文档'
'sidebar_label': 'nth_value'
'sidebar_position': 5
'slug': '/sql-reference/window-functions/nth_value'
'title': 'nth_value'
'doc_type': 'reference'
---


# nth_value

返回在其有序框架中相对于第 n 行（偏移量）评估的第一个非 NULL 值。

**语法**

```sql
nth_value (x, offset)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更多细节，请参见：[窗口函数 - 语法](./index.md/#syntax)。

**参数**

- `x` — 列名。
- `offset` — 用于评估当前行的第 n 行。

**返回值**

- 在其有序框架中相对于第 n 行（偏移量）评估的第一个非 NULL 值。

**示例**

在此示例中，`nth-value` 函数用于从虚构的英超联赛足球运动员工资数据集中查找第三高的工资。

查询：

```sql
DROP TABLE IF EXISTS salaries;
CREATE TABLE salaries
(
    `team` String,
    `player` String,
    `salary` UInt32,
    `position` String
)
Engine = Memory;

INSERT INTO salaries FORMAT Values
    ('Port Elizabeth Barbarians', 'Gary Chen', 195000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 100000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 180000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary, nth_value(player,3) OVER(ORDER BY salary DESC) AS third_highest_salary FROM salaries;
```

结果：

```response
   ┌─player──────────┬─salary─┬─third_highest_salary─┐
1. │ Gary Chen       │ 195000 │                      │
2. │ Robert George   │ 195000 │                      │
3. │ Charles Juarez  │ 190000 │ Charles Juarez       │
4. │ Scott Harrison  │ 180000 │ Charles Juarez       │
5. │ Douglas Benson  │ 150000 │ Charles Juarez       │
6. │ James Henderson │ 140000 │ Charles Juarez       │
7. │ Michael Stanley │ 100000 │ Charles Juarez       │
   └─────────────────┴────────┴──────────────────────┘
```
