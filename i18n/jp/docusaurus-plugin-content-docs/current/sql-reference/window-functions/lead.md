---
'description': 'lead ウィンドウ関数に関する Documentation'
'sidebar_label': 'lead'
'sidebar_position': 10
'slug': '/sql-reference/window-functions/lead'
'title': 'lead'
'doc_type': 'reference'
---


# lead

現在の行のオフセット行で評価された値を ordered frame 内で返します。この関数は [`leadInFrame`](./leadInFrame.md) に似ていますが、常に `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` フレームを使用します。

**構文**

```sql
lead(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文の詳細については、[ウィンドウ関数 - 構文](./index.md/#syntax)を参照してください。

**パラメータ**

- `x` — カラム名。
- `offset` — 適用するオフセット。[(U)Int*](../data-types/int-uint.md)。 （オプショナル - デフォルトは `1`）。
- `default` — 計算された行がウィンドウフレームの境界を超えた場合に返される値。 （オプショナル - 省略した場合はカラム型のデフォルト値）。

**返される値**

- ordered frame 内で現在の行のオフセット行で評価された値。

**例**

この例では、ノーベル賞受賞者の[歴史的データ](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)を参照し、`lead` 関数を使用して物理学カテゴリーの連続受賞者のリストを返します。

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
