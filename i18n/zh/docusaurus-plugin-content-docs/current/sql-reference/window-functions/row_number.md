---
description: 'row_number 窗口函数文档'
sidebar_label: 'row_number'
sidebar_position: 2
slug: /sql-reference/window-functions/row_number
title: 'row_number'
doc_type: 'reference'
---

# row&#95;number {#row&#95;number}

对其所在分区内的当前行进行编号，从 1 开始。

**语法**

```sql
row_number (column_name)
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column] 
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更详细说明，请参阅：[Window Functions - Syntax](./index.md/#syntax)。

**返回值**

* 分区内当前行的编号。[UInt64](../data-types/int-uint.md)。

**示例**

以下示例基于视频教程 [Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA) 中提供的示例。

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
    ('Port Elizabeth Barbarians', 'Robert George', 195000, 'M');
```

```sql
SELECT player, salary, 
       row_number() OVER (ORDER BY salary DESC) AS row_number
FROM salaries;
```

结果：

```response
   ┌─球员────────────┬─薪资───┬─行号───────┐
1. │ Gary Chen       │ 195000 │          1 │
2. │ Robert George   │ 195000 │          2 │
3. │ Charles Juarez  │ 190000 │          3 │
4. │ Scott Harrison  │ 150000 │          4 │
5. │ Michael Stanley │ 150000 │          5 │
   └─────────────────┴────────┴────────────┘
```
