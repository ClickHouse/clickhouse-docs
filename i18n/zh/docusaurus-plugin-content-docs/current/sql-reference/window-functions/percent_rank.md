---
'description': 'percent_rank 窗口函数的文档'
'sidebar_label': 'percent_rank'
'sidebar_position': 8
'slug': '/sql-reference/window-functions/percent_rank'
'title': 'percent_rank'
'doc_type': 'reference'
---


# percent_rank

返回窗口分区内行的相对排名（即百分位数）。

**语法**

别名: `percentRank`（区分大小写）

```sql
percent_rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING]] | [window_name])
FROM table_name
WINDOW window_name as ([PARTITION BY grouping_column] [ORDER BY sorting_column] RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
```

默认和必要的窗口框架定义为 `RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。

有关窗口函数语法的更多详细信息，请参见: [Window Functions - Syntax](./index.md/#syntax)。

**示例**

查询:

```sql
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
    ('Port Elizabeth Barbarians', 'Michael Stanley', 150000, 'D'),
    ('New Coreystad Archdukes', 'Scott Harrison', 150000, 'D'),
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M'),
    ('South Hampton Seagulls', 'Douglas Benson', 150000, 'M'),
    ('South Hampton Seagulls', 'James Henderson', 140000, 'M');
```

```sql
SELECT player, salary,
       percent_rank() OVER (ORDER BY salary DESC) AS percent_rank
FROM salaries;
```

结果:

```response

   ┌─player──────────┬─salary─┬───────percent_rank─┐
1. │ Gary Chen       │ 195000 │                  0 │
2. │ Robert George   │ 195000 │                  0 │
3. │ Charles Juarez  │ 190000 │ 0.3333333333333333 │
4. │ Michael Stanley │ 150000 │                0.5 │
5. │ Scott Harrison  │ 150000 │                0.5 │
6. │ Douglas Benson  │ 150000 │                0.5 │
7. │ James Henderson │ 140000 │                  1 │
   └─────────────────┴────────┴────────────────────┘

```
