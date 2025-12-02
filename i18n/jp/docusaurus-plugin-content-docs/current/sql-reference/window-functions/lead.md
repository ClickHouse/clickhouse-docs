---
description: 'lead ウィンドウ関数に関するドキュメント'
sidebar_label: 'lead'
sidebar_position: 10
slug: /sql-reference/window-functions/lead
title: 'lead'
doc_type: 'reference'
---

# lead {#lead}

並べ替えられたフレーム内で、現在の行から `offset` 行後の行で評価された値を返します。
この関数は [`leadInFrame`](./leadInFrame.md) と類似していますが、常に `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` というフレームを使用します。

**構文**

```sql
lead(x[, offset[, default]])
  OVER ([[PARTITION BY grouping_column] [ORDER BY sorting_column]] | [window_name])
FROM table_name
WINDOW window_name as ([[PARTITION BY grouping_column] [ORDER BY sorting_column])
```

ウィンドウ関数構文の詳細については、[Window Functions - Syntax](./index.md/#syntax) を参照してください。

**パラメーター**

* `x` — 列名。
* `offset` — 適用するオフセット。[(U)Int*](../data-types/int-uint.md)。（省略可。省略時は `1`）
* `default` — 計算対象の行がウィンドウフレームの範囲外となった場合に返す値。（省略可。省略時は列の型のデフォルト値）

**戻り値**

* 順序付けされたフレーム内で、現在の行から `offset` 行後の行で評価された値。

**例**

この例では、ノーベル賞受賞者の[過去データ](https://www.kaggle.com/datasets/sazidthe1/nobel-prize-data)を使用し、物理学部門における連続した受賞者の一覧を返すために `lead` 関数を利用します。

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
1. │ Anne L Huillier  │ 2023 │ 物理学  │ 物質中の電子動力学研究のためのアト秒光パルス生成実験手法に対して                     │
2. │ Pierre Agostini  │ 2023 │ 物理学  │ 物質中の電子動力学研究のためのアト秒光パルス生成実験手法に対して                     │
3. │ Ferenc Krausz    │ 2023 │ 物理学  │ 物質中の電子動力学研究のためのアト秒光パルス生成実験手法に対して                     │
4. │ Alain Aspect     │ 2022 │ 物理学  │ ベルの不等式の破れを実証し量子情報科学を開拓した、もつれ合った光子による実験に対して │
5. │ Anton Zeilinger  │ 2022 │ 物理学  │ ベルの不等式の破れを実証し量子情報科学を開拓した、もつれ合った光子による実験に対して │
6. │ John Clauser     │ 2022 │ 物理学  │ ベルの不等式の破れを実証し量子情報科学を開拓した、もつれ合った光子による実験に対して │
7. │ Giorgio Parisi   │ 2021 │ 物理学  │ 原子スケールから惑星スケールに至る物理系における無秩序とゆらぎの相互作用の発見に対して                │
8. │ Klaus Hasselmann │ 2021 │ 物理学  │ 地球気候の物理モデリング、変動の定量化、および地球温暖化の信頼性の高い予測に対して                        │
9. │ Syukuro Manabe   │ 2021 │ 物理学  │ 地球気候の物理モデリング、変動の定量化、および地球温暖化の信頼性の高い予測に対して                        │
   └──────────────────┴──────┴──────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
