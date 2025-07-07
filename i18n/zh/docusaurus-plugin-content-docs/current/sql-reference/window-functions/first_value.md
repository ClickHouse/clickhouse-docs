---
'description': 'first_value 窗口函数的文档'
'sidebar_label': 'first_value'
'sidebar_position': 3
'slug': '/sql-reference/window-functions/first_value'
'title': 'first_value'
---


# first_value

返回在其有序范围内评估的第一个值。默认情况下，NULL 参数会被跳过，但可以使用 `RESPECT NULLS` 修饰符来覆盖此行为。

**语法**

```sql
first_value (column_name) [[RESPECT NULLS] | [IGNORE NULLS]]
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([PARTITION BY grouping_column] [ORDER BY sorting_column])
```

别名: `any`。

:::note
在 `first_value(column_name)` 后使用可选修饰符 `RESPECT NULLS` 将确保 `NULL` 参数不会被跳过。
有关更多信息，请参见 [NULL 处理](../aggregate-functions/index.md/#null-processing)。

别名: `firstValueRespectNulls`
:::

有关窗口函数语法的更多详细信息，请参见: [窗口函数 - 语法](./index.md/#syntax)。

**返回值**

- 在其有序范围内评估的第一个值。

**示例**

在这个示例中，`first_value` 函数用于从虚构的英超足球运动员薪资数据集中找到工资最高的足球运动员。

查询:

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

INSERT INTO salaries FORMAT VALUES
    ('Port Elizabeth Barbarians', 'Gary Chen', 196000, 'F'),
    ('New Coreystad Archdukes', 'Charles Juarez', 190000, 'F'),
    ('Port Elizabeth Barbarians', 'Michael Stanley', 100000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 180000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary, 
       first_value(player) OVER (ORDER BY salary DESC) AS highest_paid_player
FROM salaries;
```

结果:

```response
   ┌─player──────────┬─salary─┬─highest_paid_player─┐
1. │ Gary Chen       │ 196000 │ Gary Chen           │
2. │ Robert George   │ 195000 │ Gary Chen           │
3. │ Charles Juarez  │ 190000 │ Gary Chen           │
4. │ Scott Harrison  │ 180000 │ Gary Chen           │
5. │ Douglas Benson  │ 150000 │ Gary Chen           │
6. │ James Henderson │ 140000 │ Gary Chen           │
7. │ Michael Stanley │ 100000 │ Gary Chen           │
   └─────────────────┴────────┴─────────────────────┘
```
