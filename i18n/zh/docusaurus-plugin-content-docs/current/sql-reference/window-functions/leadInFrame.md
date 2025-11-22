---
description: 'leadInFrame 窗口函数文档'
sidebar_label: 'leadInFrame'
sidebar_position: 10
slug: /sql-reference/window-functions/leadInFrame
title: 'leadInFrame'
doc_type: 'reference'
---

# leadInFrame

返回在有序窗口帧中，相对于当前行向后偏移若干行的那一行上计算得到的值。

:::warning
`leadInFrame` 的行为与标准 SQL 窗口函数 `lead` 不同。
ClickHouse 窗口函数 `leadInFrame` 会严格遵循窗口帧的定义。
若要获得与 `lead` 相同的行为，请使用 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。
:::

**语法**

```sql
leadInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更多详细信息，请参阅：[Window Functions - Syntax](./index.md/#syntax)。

**参数**

* `x` — 列名。
* `offset` — 要应用的偏移量。[(U)Int*](../data-types/int-uint.md)。（可选，默认值为 `1`）。
* `default` — 当计算的行超出窗口框架边界时要返回的值。（可选，省略时为列类型的默认值）。

**返回值**

* 在有序窗口框架内，位于当前行之后 offset 行的那一行上所计算得到的值。

**示例**

此示例使用诺贝尔奖获奖者的[历史数据](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)，并使用 `leadInFrame` 函数返回物理学类别中连续获奖者的列表。

查询：

```sql
CREATE OR REPLACE VIEW nobel_prize_laureates
AS SELECT *
FROM file('nobel_laureates_data.csv');
```

```sql
SELECT
    fullName,
    leadInFrame(year, 1, year) OVER (PARTITION BY category ORDER BY year ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS year,
    category,
    motivation
FROM nobel_prize_laureates
WHERE category = 'physics'
ORDER BY year DESC
LIMIT 9
```

结果：

```response
   ┌─fullName─────────┬─year─┬─category─┬─motivation─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ Anne L Huillier  │ 2023 │ 物理学  │ 因开发了产生阿秒光脉冲的实验方法,用于研究物质中的电子动力学                     │
2. │ Pierre Agostini  │ 2023 │ 物理学  │ 因开发了产生阿秒光脉冲的实验方法,用于研究物质中的电子动力学                     │
3. │ Ferenc Krausz    │ 2023 │ 物理学  │ 因开发了产生阿秒光脉冲的实验方法,用于研究物质中的电子动力学                     │
4. │ Alain Aspect     │ 2022 │ 物理学  │ 因利用纠缠光子进行实验,证实了贝尔不等式的破缺,并开创了量子信息科学 │
5. │ Anton Zeilinger  │ 2022 │ 物理学  │ 因利用纠缠光子进行实验,证实了贝尔不等式的破缺,并开创了量子信息科学 │
6. │ John Clauser     │ 2022 │ 物理学  │ 因利用纠缠光子进行实验,证实了贝尔不等式的破缺,并开创了量子信息科学 │
7. │ Giorgio Parisi   │ 2021 │ 物理学  │ 因发现了从原子到行星尺度物理系统中无序与涨落的相互作用                │
8. │ Klaus Hasselmann │ 2021 │ 物理学  │ 因建立地球气候物理模型,量化其变化并可靠预测全球变暖                        │
9. │ Syukuro Manabe   │ 2021 │ 物理学  │ 因建立地球气候物理模型,量化其变化并可靠预测全球变暖                        │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
