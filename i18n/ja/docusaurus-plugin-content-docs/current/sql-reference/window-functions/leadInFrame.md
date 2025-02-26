---
slug: /sql-reference/window-functions/leadInFrame
sidebar_label: leadInFrame
sidebar_position: 10
---

# leadInFrame

順序付けられたフレーム内の現在の行からオフセット行後に評価された値を返します。

:::warning
`leadInFrame`の動作は、標準SQLの`lead`ウィンドウ関数とは異なります。
Clickhouseのウィンドウ関数`leadInFrame`は、ウィンドウフレームを尊重します。
`lead`と同じ動作が必要な場合は、`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`を使用してください。
:::

**構文**

```sql
leadInFrame(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]
        [ROWS or RANGE expression_to_bound_rows_withing_the_group]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数の構文の詳細については、次を参照してください: [ウィンドウ関数 - 構文](./index.md/#syntax)。

**パラメータ**
- `x` — カラム名。
- `offset` — 適用するオフセット。[(U)Int*](../data-types/int-uint.md)。 (オプション - デフォルトは`1`)。
- `default` — 計算された行がウィンドウフレームの境界を超えた場合に返される値。 (オプション - 省略時のデフォルトはカラム型の値)。

**返される値**

- 順序付けられたフレーム内の現在の行からオフセット行後に評価された値。

**例**

この例では、ノーベル賞受賞者に関する[歴史的データ](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)を見て、`leadInFrame`関数を使用して物理学カテゴリでの連続受賞者のリストを返します。

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
1. │ Anne L Huillier  │ 2023 │ physics  │ 物質内の電子ダイナミクスの研究のためにアト秒パルスの光を生成する実験的方法について                       │
2. │ Pierre Agostini  │ 2023 │ physics  │ 物質内の電子ダイナミクスの研究のためにアト秒パルスの光を生成する実験的方法について                       │
3. │ Ferenc Krausz    │ 2023 │ physics  │ 物質内の電子ダイナミクスの研究のためにアト秒パルスの光を生成する実験的方法について                       │
4. │ Alain Aspect     │ 2022 │ physics  │ ベルの不等式の違反を確立し、量子情報科学の先駆けとなるエンタングル光子を用いた実験のため              │
5. │ Anton Zeilinger  │ 2022 │ physics  │ ベルの不等式の違反を確立し、量子情報科学の先駆けとなるエンタングル光子を用いた実験のため              │
6. │ John Clauser     │ 2022 │ physics  │ ベルの不等式の違反を確立し、量子情報科学の先駆けとなるエンタングル光子を用いた実験のため              │
7. │ Giorgio Parisi   │ 2021 │ physics  │ 原子から惑星スケールまでの物理システムにおける無秩序と変動の相互作用の発見のため                    │
8. │ Klaus Hasselmann │ 2021 │ physics  │ 地球の気候の物理モデル化を行い、変動性を定量化し、地球温暖化を確実に予測するため                    │
9. │ Syukuro Manabe   │ 2021 │ physics  │ 地球の気候の物理モデル化を行い、変動性を定量化し、地球温暖化を確実に予測するため                    │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
