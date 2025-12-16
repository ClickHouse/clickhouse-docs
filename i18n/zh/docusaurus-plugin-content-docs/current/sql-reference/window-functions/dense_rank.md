---
description: 'dense_rank 窗口函数的文档'
sidebar_label: 'dense_rank'
sidebar_position: 7
slug: /sql-reference/window-functions/dense_rank
title: 'dense_rank'
doc_type: 'reference'
---

# dense&#95;rank {#dense&#95;rank}

在其分区内为当前行进行连续排名（无空缺）。换句话说，如果遇到的新行的值等于之前某一行的值，那么它将获得紧接其后的下一个名次，且名次序列中不会出现空缺。

[rank](./rank.md) 函数提供相同的行为，但在排名中会产生空缺。

**语法**

别名：`denseRank`（区分大小写）

```sql
dense_rank ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更多详细信息，请参阅：[Window Functions - Syntax](./index.md/#syntax)。

**返回值**

* 分区内当前行的序号值，且排名连续无间断。[UInt64](../data-types/int-uint.md)。

**示例**

以下示例基于教学视频 [Ranking window functions in ClickHouse](https://youtu.be/Yku9mmBYm_4?si=XIMu1jpYucCQEoXA) 中提供的示例。

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
       dense_rank() OVER (ORDER BY salary DESC) AS dense_rank
FROM salaries;
```

结果：

```response
   ┌─player──────────┬─salary─┬─dense_rank─┐
1. │ Gary Chen       │ 195000 │          1 │
2. │ Robert George   │ 195000 │          1 │
3. │ Charles Juarez  │ 190000 │          2 │
4. │ Michael Stanley │ 150000 │          3 │
5. │ Douglas Benson  │ 150000 │          3 │
6. │ Scott Harrison  │ 150000 │          3 │
7. │ James Henderson │ 140000 │          4 │
   └─────────────────┴────────┴────────────┘
```
