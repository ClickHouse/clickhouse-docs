---
slug: /sql-reference/window-functions/rank
sidebar_label: 'rank'
sidebar_position: 6
---


# rank

在其分区内为当前行进行排名，允许存在间隙。换句话说，如果它遇到的任何行的值与之前行的值相等，则该行将获得与之前行相同的排名。
下一行的排名等于之前行的排名加上与之前排名相同的次数所对应的间隙。

[dense_rank](./dense_rank.md) 函数提供相同的行为，但在排名中不允许存在间隙。

**语法**

```sql
rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更多详细信息，请参见：[窗口函数 - 语法](./index.md/#syntax)。

**返回值**

- 当前行在其分区内的排名数字，包括间隙。[UInt64](../data-types/int-uint.md)。

**示例**

以下示例基于视频讲解中的示例 [在 ClickHouse 中的排名窗口函数](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA)。

查询：

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
       rank() OVER (ORDER BY salary DESC) AS rank
FROM salaries;
```

结果：

```response
   ┌─player──────────┬─salary─┬─rank─┐
1. │ Gary Chen       │ 195000 │    1 │
2. │ Robert George   │ 195000 │    1 │
3. │ Charles Juarez  │ 190000 │    3 │
4. │ Douglas Benson  │ 150000 │    4 │
5. │ Michael Stanley │ 150000 │    4 │
6. │ Scott Harrison  │ 150000 │    4 │
7. │ James Henderson │ 140000 │    7 │
   └─────────────────┴────────┴──────┘
```
