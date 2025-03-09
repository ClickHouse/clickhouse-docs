---
slug: /sql-reference/window-functions/leadInFrame
sidebar_label: leadInFrame
sidebar_position: 10
---


# leadInFrame

返回在有序帧内偏移当前行之后的行所评估的值。

:::warning
`leadInFrame` 的行为与标准 SQL 的 `lead` 窗口函数不同。
Clickhouse 的窗口函数 `leadInFrame` 遵循窗口帧的限制。
要获得与 `lead` 相同的行为，请使用 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。
:::

**语法**

```sql
leadInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

有关窗口函数语法的更多详细信息，请参见：[窗口函数 - 语法](./index.md/#syntax)。

**参数**
- `x` — 列名。
- `offset` — 要应用的偏移量。[(U)Int*](../data-types/int-uint.md)。 （可选 - 默认为 `1`）。
- `default` — 如果计算的行超出窗口帧的边界，则返回的值。 （可选 - 省略时默认为列类型的默认值）。

**返回值**

- 在有序帧内偏移当前行之后的行所评估的值。

**示例**

此示例查看诺贝尔奖获奖者的 [历史数据](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)，并使用 `leadInFrame` 函数返回物理类的连续获奖者列表。

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
1. │ Anne L Huillier  │ 2023 │ physics  │ 为了开发产生阿秒光脉冲的实验方法，以研究物质中的电子动态                                                  │
2. │ Pierre Agostini  │ 2023 │ physics  │ 为了开发产生阿秒光脉冲的实验方法，以研究物质中的电子动态                                                  │
3. │ Ferenc Krausz    │ 2023 │ physics  │ 为了开发产生阿秒光脉冲的实验方法，以研究物质中的电子动态                                                  │
4. │ Alain Aspect     │ 2022 │ physics  │ 为了通过纠缠光子进行的实验，确定贝尔不等式的违反，并开创量子信息科学                                         │
5. │ Anton Zeilinger  │ 2022 │ physics  │ 为了通过纠缠光子进行的实验，确定贝尔不等式的违反，并开创量子信息科学                                         │
6. │ John Clauser     │ 2022 │ physics  │ 为了通过纠缠光子进行的实验，确定贝尔不等式的违反，并开创量子信息科学                                         │
7. │ Giorgio Parisi   │ 2021 │ physics  │ 为了发现从原子到行星尺度物理系统中无序与波动的相互作用                                                    │
8. │ Klaus Hasselmann │ 2021 │ physics  │ 为了对地球气候进行物理建模，以量化变化并可靠预测全球变暖                                               │
9. │ Syukuro Manabe   │ 2021 │ physics  │ 为了对地球气候进行物理建模，以量化变化并可靠预测全球变暖                                               │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
