---
description: 'cume_dist 窗口函数文档'
sidebar_label: 'cume_dist'
sidebar_position: 11
slug: /sql-reference/window-functions/cume_dist
title: 'cume_dist'
doc_type: 'reference'
---

# cume&#95;dist

计算某个值在一组值中的累积分布，即值小于或等于当前行值的行所占的百分比。可用于确定某个值在分区中的相对位置。

**语法**

```sql
cume_dist ()
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING]] | [window_name])
FROM table_name
WINDOW window_name as ([PARTITION BY grouping_column] [ORDER BY sorting_column] RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
```

默认且必需的窗口框架定义为 `RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。

有关窗口函数语法的更多详情，请参阅：[Window Functions - Syntax](./index.md/#syntax)。

**返回值**

* 当前行的相对排名。返回类型为 Float64，取值范围为 [0, 1]。[Float64](../data-types/float.md)。

**示例**

以下示例计算某个团队内部薪资的累积分布：

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
       cume_dist() OVER (ORDER BY salary DESC) AS cume_dist
FROM salaries;
```

结果：

```response
   ┌─player──────────┬─salary─┬───────────cume_dist─┐
1. │ Robert George   │ 195000 │  0.2857142857142857 │
2. │ Gary Chen       │ 195000 │  0.2857142857142857 │
3. │ Charles Juarez  │ 190000 │ 0.42857142857142855 │
4. │ Douglas Benson  │ 150000 │  0.8571428571428571 │
5. │ Michael Stanley │ 150000 │  0.8571428571428571 │
6. │ Scott Harrison  │ 150000 │  0.8571428571428571 │
7. │ James Henderson │ 140000 │                   1 │
   └─────────────────┴────────┴─────────────────────┘
```

**实现细节**

`cume_dist()` 函数使用以下公式计算相对位置：

```text
cume_dist = (小于等于当前行值的行数) / (分区内的总行数)
```

具有相同值的行（同级）会被分配相同的累积分布值，该值对应于该同级组中的最高排名。
