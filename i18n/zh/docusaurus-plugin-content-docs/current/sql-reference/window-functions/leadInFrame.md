---
description: 'leadInFrame 窗口函数的文档'
sidebar_label: 'leadInFrame'
sidebar_position: 10
slug: /sql-reference/window-functions/leadInFrame
title: 'leadInFrame'
doc_type: 'reference'
---

# leadInFrame {#leadinframe}

返回在有序窗口框架中，相对于当前行向后偏移指定行数的那一行上计算得到的值。

:::warning
`leadInFrame` 的行为与标准 SQL 的 `lead` 窗口函数不同。
ClickHouse 窗口函数 `leadInFrame` 会严格遵循窗口框架设置。
若要获得与 `lead` 完全相同的行为，请使用 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。
:::

**语法**

```sql
leadInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_within_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更多详细信息，请参阅：[Window Functions - Syntax](./index.md/#syntax)。

**参数**

* `x` — 列名。
* `offset` — 要应用的偏移量。[(U)Int*](../data-types/int-uint.md)。（可选 — 默认值为 `1`）。
* `default` — 当计算得到的行超出窗口帧边界时返回的值。（可选 — 省略时为该列类型的默认值）。

**返回值**

* 在有序窗口帧中，位于当前行之后 `offset` 行的那一行上所计算得到的值。

**示例**

本示例使用诺贝尔奖得主的[历史数据](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)，并通过 `leadInFrame` 函数返回物理学类别中连续获奖者的列表。

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
   ┌─全名────────────┬─年份─┬─类别─┬─颁奖理由────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ Anne L Huillier  │ 2023 │ 物理学  │ 因其发展了产生阿秒光脉冲、用于研究物质中电子动力学的实验方法                                              │
2. │ Pierre Agostini  │ 2023 │ 物理学  │ 因其发展了产生阿秒光脉冲、用于研究物质中电子动力学的实验方法                                              │
3. │ Ferenc Krausz    │ 2023 │ 物理学  │ 因其发展了产生阿秒光脉冲、用于研究物质中电子动力学的实验方法                                              │
4. │ Alain Aspect     │ 2022 │ 物理学  │ 因其利用纠缠光子开展实验，证明了贝尔不等式的违反，并开创了量子信息科学领域                                 │
5. │ Anton Zeilinger  │ 2022 │ 物理学  │ 因其利用纠缠光子开展实验，证明了贝尔不等式的违反，并开创了量子信息科学领域                                 │
6. │ John Clauser     │ 2022 │ 物理学  │ 因其利用纠缠光子开展实验，证明了贝尔不等式的违反，并开创了量子信息科学领域                                 │
7. │ Giorgio Parisi   │ 2021 │ 物理学  │ 因其发现了从原子到行星尺度物理系统中，无序与涨落之间的相互作用机制                                          │
8. │ Klaus Hasselmann │ 2021 │ 物理学  │ 因其通过对地球气候进行物理建模，量化气候变率并可靠地预测全球变暖                                          │
9. │ Syukuro Manabe   │ 2021 │ 物理学  │ 因其通过对地球气候进行物理建模，量化气候变率并可靠地预测全球变暖                                          │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
