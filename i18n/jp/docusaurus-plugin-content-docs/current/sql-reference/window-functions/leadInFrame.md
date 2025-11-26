---
description: 'leadInFrame ウィンドウ関数のリファレンス'
sidebar_label: 'leadInFrame'
sidebar_position: 10
slug: /sql-reference/window-functions/leadInFrame
title: 'leadInFrame'
doc_type: 'reference'
---

# leadInFrame

順序付けされたフレーム内で、現在の行から指定したオフセット行数だけ後方の行で評価された値を返します。

:::warning
`leadInFrame` の動作は、標準 SQL のウィンドウ関数 `lead` とは異なります。
ClickHouse のウィンドウ関数 `leadInFrame` は、ウィンドウフレームを考慮して動作します。
`lead` と同一の動作を得るには、`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` を使用してください。
:::

**構文**

```sql
leadInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文の詳細については、[Window Functions - Syntax](./index.md/#syntax) を参照してください。

**パラメーター**

* `x` — カラム名。
* `offset` — 適用するオフセット。[(U)Int*](../data-types/int-uint.md)。（オプション - 省略時は `1`）
* `default` — 計算対象の行がウィンドウフレームの境界を超えた場合に返す値。（オプション - 省略時はカラム型のデフォルト値）

**返される値**

* 順序付けられたフレーム内で、現在の行から `offset` 行後の行で評価された値。

**例**

この例では、ノーベル賞受賞者の[過去のデータ](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)を対象に、物理学部門における連続した受賞者の一覧を返すために `leadInFrame` 関数を使用しています。

クエリ:

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

結果:

```response
   ┌─fullName─────────┬─year─┬─category─┬─motivation─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ Anne L Huillier  │ 2023 │ physics  │ 物質中の電子動力学研究のためのアト秒光パルス生成実験手法に対して                     │
2. │ Pierre Agostini  │ 2023 │ physics  │ 物質中の電子動力学研究のためのアト秒光パルス生成実験手法に対して                     │
3. │ Ferenc Krausz    │ 2023 │ physics  │ 物質中の電子動力学研究のためのアト秒光パルス生成実験手法に対して                     │
4. │ Alain Aspect     │ 2022 │ physics  │ ベルの不等式の破れを実証し量子情報科学を開拓した、もつれ光子を用いた実験に対して │
5. │ Anton Zeilinger  │ 2022 │ physics  │ ベルの不等式の破れを実証し量子情報科学を開拓した、もつれ光子を用いた実験に対して │
6. │ John Clauser     │ 2022 │ physics  │ ベルの不等式の破れを実証し量子情報科学を開拓した、もつれ光子を用いた実験に対して │
7. │ Giorgio Parisi   │ 2021 │ physics  │ 原子スケールから惑星スケールに至る物理系における無秩序とゆらぎの相互作用の発見に対して                │
8. │ Klaus Hasselmann │ 2021 │ physics  │ 地球気候の物理モデリング、変動性の定量化、および地球温暖化の信頼性の高い予測に対して                        │
9. │ Syukuro Manabe   │ 2021 │ physics  │ 地球気候の物理モデリング、変動性の定量化、および地球温暖化の信頼性の高い予測に対して                        │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
