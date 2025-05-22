---
'description': 'Calculates Cramer''s V, but uses a bias correction.'
'sidebar_position': 128
'slug': '/sql-reference/aggregate-functions/reference/cramersvbiascorrected'
'title': 'cramersVBiasCorrected'
---




# cramersVBiasCorrected

Cramer's Vは、テーブル内の2つのカラム間の関連性を測定する指標です。[`cramersV`関数](./cramersv.md)の結果は0（変数間に関連性が無いことに対応）から1までの範囲で、各値が完全に他の値によって決定される場合のみ1に達することができます。この関数は大きくバイアスされる可能性があるため、このCramer's Vのバージョンは[バイアス補正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)を使用しています。

**構文**

```sql
cramersVBiasCorrected(column1, column2)
```

**パラメータ**

- `column1`: 比較される最初のカラム。
- `column2`: 比較される2番目のカラム。

**返される値**

- カラムの値間に関連性が無いことに対応する0から（完全な関連性）1の範囲の値。

タイプ: 常に [Float64](../../../sql-reference/data-types/float.md)。

**例**

下記の比較されている2つのカラムは、お互いに小さい関連性があります。`cramersVBiasCorrected`の結果が`cramersV`の結果よりも小さいことに注意してください。

クエリ:

```sql
SELECT
    cramersV(a, b),
    cramersVBiasCorrected(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

結果:

```response
┌──────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.41171788506213564 │         0.33369281784141364 │
└─────────────────────┴─────────────────────────────┘
```
