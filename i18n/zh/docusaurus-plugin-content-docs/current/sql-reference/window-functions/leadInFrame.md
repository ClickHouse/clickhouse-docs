---
'description': 'Documentation for the leadInFrame window function'
'sidebar_label': 'leadInFrame'
'sidebar_position': 10
'slug': '/sql-reference/window-functions/leadInFrame'
'title': 'leadInFrame'
---




# leadInFrame

在有序框架内，返回当前行之后偏移行数的行的计算值。

:::warning
`leadInFrame` 的行为与标准 SQL 的 `lead` 窗口函数有所不同。
ClickHouse 的窗口函数 `leadInFrame` 遵循窗口框架。
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

有关窗口函数语法的详细信息，请参见：[窗口函数 - 语法](./index.md/#syntax)。

**参数**
- `x` — 列名。
- `offset` — 要应用的偏移量。[(U)Int*](../data-types/int-uint.md)。 （可选 - 默认值为 `1`）。
- `default` — 如果计算的行超出窗口框架的边界时要返回的值。 （可选 - 省略时默认使用列类型的默认值）。

**返回值**

- 在有序框架内，当前行之后偏移行数的行的计算值。

**示例**

此示例查看诺贝尔奖获奖者的[历史数据](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)，并使用 `leadInFrame` 函数返回物理学类别中连续获奖者的列表。

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
1. │ Anne L Huillier  │ 2023 │ physics  │ for experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter                     │
2. │ Pierre Agostini  │ 2023 │ physics  │ for experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter                     │
3. │ Ferenc Krausz    │ 2023 │ physics  │ for experimental methods that generate attosecond pulses of light for the study of electron dynamics in matter                     │
4. │ Alain Aspect     │ 2022 │ physics  │ for experiments with entangled photons establishing the violation of Bell inequalities and  pioneering quantum information science │
5. │ Anton Zeilinger  │ 2022 │ physics  │ for experiments with entangled photons establishing the violation of Bell inequalities and  pioneering quantum information science │
6. │ John Clauser     │ 2022 │ physics  │ for experiments with entangled photons establishing the violation of Bell inequalities and  pioneering quantum information science │
7. │ Giorgio Parisi   │ 2021 │ physics  │ for the discovery of the interplay of disorder and fluctuations in physical systems from atomic to planetary scales                │
8. │ Klaus Hasselmann │ 2021 │ physics  │ for the physical modelling of Earths climate quantifying variability and reliably predicting global warming                        │
9. │ Syukuro Manabe   │ 2021 │ physics  │ for the physical modelling of Earths climate quantifying variability and reliably predicting global warming                        │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
