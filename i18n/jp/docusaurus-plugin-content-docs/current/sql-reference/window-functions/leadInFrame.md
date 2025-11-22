---
description: 'leadInFrame ウィンドウ関数のリファレンス'
sidebar_label: 'leadInFrame'
sidebar_position: 10
slug: /sql-reference/window-functions/leadInFrame
title: 'leadInFrame'
doc_type: 'reference'
---

# leadInFrame

順序付けされたフレーム内で、現在の行から offset 行後にある行で評価される値を返します。

:::warning
`leadInFrame` の動作は、標準 SQL のウィンドウ関数 `lead` とは異なります。
ClickHouse のウィンドウ関数 `leadInFrame` はウィンドウフレームを考慮して計算を行います。
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

ウィンドウ関数の構文について詳しくは、[Window Functions - Syntax](./index.md/#syntax) を参照してください。

**パラメータ**

* `x` — 列名。
* `offset` — 適用するオフセット。[(U)Int*](../data-types/int-uint.md)。（任意。省略時のデフォルトは `1`）
* `default` — 計算対象の行がウィンドウフレームの境界を超えた場合に返す値。（任意。省略時は列の型のデフォルト値）

**戻り値**

* 順序付けされたフレーム内で、現在の行から `offset` 行後の行で評価された値。

**例**

この例では、ノーベル賞受賞者の[過去データ](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)を対象に、`leadInFrame` 関数を使用して物理学部門における連続する受賞者の一覧を返します。

クエリ：

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

結果：

```response
   ┌─fullName─────────┬─year─┬─category─┬─motivation─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
1. │ Anne L Huillier  │ 2023 │ 物理学  │ 物質中の電子動力学研究のためのアト秒光パルス生成実験手法に対して                     │
2. │ Pierre Agostini  │ 2023 │ 物理学  │ 物質中の電子動力学研究のためのアト秒光パルス生成実験手法に対して                     │
3. │ Ferenc Krausz    │ 2023 │ 物理学  │ 物質中の電子動力学研究のためのアト秒光パルス生成実験手法に対して                     │
4. │ Alain Aspect     │ 2022 │ 物理学  │ ベルの不等式の破れを実証する量子もつれ光子実験および量子情報科学の先駆的研究に対して │
5. │ Anton Zeilinger  │ 2022 │ 物理学  │ ベルの不等式の破れを実証する量子もつれ光子実験および量子情報科学の先駆的研究に対して │
6. │ John Clauser     │ 2022 │ 物理学  │ ベルの不等式の破れを実証する量子もつれ光子実験および量子情報科学の先駆的研究に対して │
7. │ Giorgio Parisi   │ 2021 │ 物理学  │ 原子スケールから惑星スケールに至る物理系における無秩序とゆらぎの相互作用の発見に対して                │
8. │ Klaus Hasselmann │ 2021 │ 物理学  │ 地球気候の物理モデリング、変動の定量化、および地球温暖化の信頼性の高い予測に対して                        │
9. │ Syukuro Manabe   │ 2021 │ 物理学  │ 地球気候の物理モデリング、変動の定量化、および地球温暖化の信頼性の高い予測に対して                        │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
