---
description: 'lead 窗口函数文档'
sidebar_label: 'lead'
sidebar_position: 10
slug: /sql-reference/window-functions/lead
title: 'lead'
doc_type: 'reference'
---

# lead

返回在排序后的窗口中，相对于当前行向后 offset 行的那一行上计算得到的值。
此函数与 [`leadInFrame`](./leadInFrame.md) 类似，但始终使用 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` 这一窗口范围。

**语法**

```sql
lead(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更多细节，请参见：[Window Functions - Syntax](./index.md/#syntax)。

**参数**

* `x` — 列名。
* `offset` — 要应用的偏移量。[(U)Int*](../data-types/int-uint.md)。（可选，默认值为 `1`）
* `default` — 当计算得到的行超出窗口范围边界时要返回的值。（可选，省略时为该列类型的默认值）

**返回值**

* 在有序窗口范围内，相对于当前行向后偏移指定行数的那一行上计算得到的值。

**示例**

此示例基于诺贝尔奖得主的[历史数据](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)，使用 `lead` 函数返回物理学类别中连续获奖者的列表。

```sql title="Query"
CREATE OR REPLACE VIEW nobel_prize_laureates
AS SELECT *
FROM file('nobel_laureates_data.csv');
```

```sql title="Query"
SELECT
    fullName,
    lead(year, 1, year) OVER (PARTITION BY category ORDER BY year ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS year,
    category,
    motivation
FROM nobel_prize_laureates
WHERE category = 'physics'
ORDER BY year DESC
LIMIT 9
```

```response title="Query"
   ┌─fullName─────────┬─year─┬─category─┬─motivation─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ Anne L Huillier  │ 2023 │ physics  │ 因开发产生阿秒光脉冲的实验方法用于研究物质中的电子动力学                     │
2. │ Pierre Agostini  │ 2023 │ physics  │ 因开发产生阿秒光脉冲的实验方法用于研究物质中的电子动力学                     │
3. │ Ferenc Krausz    │ 2023 │ physics  │ 因开发产生阿秒光脉冲的实验方法用于研究物质中的电子动力学                     │
4. │ Alain Aspect     │ 2022 │ physics  │ 因利用纠缠光子进行实验,证实了贝尔不等式的违反并开创了量子信息科学 │
5. │ Anton Zeilinger  │ 2022 │ physics  │ 因利用纠缠光子进行实验,证实了贝尔不等式的违反并开创了量子信息科学 │
6. │ John Clauser     │ 2022 │ physics  │ 因利用纠缠光子进行实验,证实了贝尔不等式的违反并开创了量子信息科学 │
7. │ Giorgio Parisi   │ 2021 │ physics  │ 因发现从原子到行星尺度物理系统中无序与涨落的相互作用                │
8. │ Klaus Hasselmann │ 2021 │ physics  │ 因对地球气候进行物理建模,量化其变异性并可靠预测全球变暖                        │
9. │ Syukuro Manabe   │ 2021 │ physics  │ 因对地球气候进行物理建模,量化其变异性并可靠预测全球变暖                        │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
