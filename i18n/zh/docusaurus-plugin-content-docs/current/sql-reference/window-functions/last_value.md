---
description: 'last_value 窗口函数文档'
sidebar_label: 'last_value'
sidebar_position: 4
slug: /sql-reference/window-functions/last_value
title: 'last_value'
doc_type: 'reference'
---

# last&#95;value

返回在其有序窗口帧内计算的最后一个值。默认情况下会跳过 NULL 参数，不过可以使用 `RESPECT NULLS` 修饰符来更改这一行为。

**语法**

```sql
last_value (列名) [[RESPECT NULLS] | [IGNORE NULLS]]
  OVER ([[PARTITION BY 分组列] [ORDER BY 排序列] 
        [ROWS 或 RANGE 限定组内行范围的表达式]] | [窗口名称])
FROM 表名
WINDOW 窗口名称 as ([[PARTITION BY 分组列] [ORDER BY 排序列])
```

别名：`anyLast`。

:::note
在 `first_value(column_name)` 之后使用可选修饰符 `RESPECT NULLS` 将确保不会跳过 `NULL` 参数。
有关详细信息，请参阅 [NULL 处理](../aggregate-functions/index.md/#null-processing)。

别名：`lastValueRespectNulls`
:::

有关窗口函数语法的更多详细信息，请参阅 [窗口函数 - 语法](./index.md/#syntax)。

**返回值**

* 在其有序窗口范围内计算得到的最后一个值。

**示例**

在此示例中，`last_value` 函数用于从一个虚构的英超联赛足球运动员工资数据集中找出工资最低的球员。

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
   ┌─球员────────────┬─薪资───┬─最低薪资球员───────┐
1. │ Gary Chen       │ 196000 │ Michael Stanley    │
2. │ Robert George   │ 195000 │ Michael Stanley    │
3. │ Charles Juarez  │ 190000 │ Michael Stanley    │
4. │ Scott Harrison  │ 180000 │ Michael Stanley    │
5. │ Douglas Benson  │ 150000 │ Michael Stanley    │
6. │ James Henderson │ 140000 │ Michael Stanley    │
7. │ Michael Stanley │ 100000 │ Michael Stanley    │
   └─────────────────┴────────┴────────────────────┘
```
