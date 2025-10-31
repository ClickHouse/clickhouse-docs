---
'description': 'last_value 窗口函数的文档'
'sidebar_label': 'last_value'
'sidebar_position': 4
'slug': '/sql-reference/window-functions/last_value'
'title': 'last_value'
'doc_type': 'reference'
---


# last_value

返回在其排序框架内计算的最后一个值。默认情况下，NULL 参数会被跳过，但可以使用 `RESPECT NULLS` 修饰符来覆盖此行为。

**语法**

```sql
last_value (column_name) [[RESPECT NULLS] | [IGNORE NULLS]]
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

别名： `anyLast`。

:::note
在 `first_value(column_name)` 后使用可选修饰符 `RESPECT NULLS` 将确保 `NULL` 参数不被跳过。 
有关更多信息，请参见 [NULL处理](../aggregate-functions/index.md/#null-processing)。

别名： `lastValueRespectNulls`
:::

有关窗口函数语法的更多详细信息，请参见：[窗口函数 - 语法](./index.md/#syntax)。

**返回值**

- 在其排序框架内计算的最后一个值。

**示例**

在此示例中，使用 `last_value` 函数从英超联赛足球运动员的虚构薪资数据集中找到薪水最低的足球运动员。

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
       last_value(player) OVER (ORDER BY salary DESC RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest_paid_player
FROM salaries;
```

结果：

```response
   ┌─player──────────┬─salary─┬─lowest_paid_player─┐
1. │ Gary Chen       │ 196000 │ Michael Stanley    │
2. │ Robert George   │ 195000 │ Michael Stanley    │
3. │ Charles Juarez  │ 190000 │ Michael Stanley    │
4. │ Scott Harrison  │ 180000 │ Michael Stanley    │
5. │ Douglas Benson  │ 150000 │ Michael Stanley    │
6. │ James Henderson │ 140000 │ Michael Stanley    │
7. │ Michael Stanley │ 100000 │ Michael Stanley    │
   └─────────────────┴────────┴────────────────────┘
```
