---
'description': 'サンプルと既知の母集団の平均に対して、単一サンプルの Student t-テストを適用します。'
'sidebar_label': 'studentTTestOneSample'
'sidebar_position': 195
'slug': '/sql-reference/aggregate-functions/reference/studentttestonesample'
'title': 'studentTTestOneSample'
'doc_type': 'reference'
---


# studentTTestOneSample

一標本のスチューデントのt検定を適用して、サンプルの平均が既知の母集団の平均と異なるかどうかを判断します。

正規性が仮定されます。帰無仮説は、サンプル平均が母集団平均に等しいというものです。

**構文**

```sql
studentTTestOneSample([confidence_level])(sample_data, population_mean)
```

オプションの `confidence_level` は、信頼区間の計算を可能にします。

**引数**

- `sample_data` — サンプルデータ。整数、浮動小数点数、または小数。
- `population_mean` — テスト対象の既知の母集団平均。整数、浮動小数点数、または小数（通常は定数）。

**パラメータ**

- `confidence_level` — 信頼区間のための信頼レベル。 (0, 1) の範囲の浮動小数点数。

注:
- 少なくとも 2 つの観測値が必要です。そうでない場合、結果は `(nan, nan)` になります（リクエストされた場合、区間も `nan` になります）。
- 定数またはほぼ定数の入力も、ゼロ（または実質的にゼロ）標準誤差のために `nan` を返します。

**返される値**

[Tuple](../../../sql-reference/data-types/tuple.md) で、2 つまたは 4 つの要素があります（`confidence_level` が指定されている場合）:

- 計算された t-統計量。 Float64。
- 計算された p値（二尾）。 Float64。
- 計算された信頼区間の下限。 Float64。（オプション）
- 計算された信頼区間の上限。 Float64。（オプション）

信頼区間は、与えられた信頼レベルでのサンプル平均に適用されます。

**例**

入力テーブル:

```text
┌─value─┐
│  20.3 │
│  21.1 │
│  21.7 │
│  19.9 │
│  21.8 │
└───────┘
```

信頼区間なし:

```sql
SELECT studentTTestOneSample()(value, 20.0) FROM t;
-- or simply
SELECT studentTTestOneSample(value, 20.0) FROM t;
```

信頼区間あり（95%）:

```sql
SELECT studentTTestOneSample(0.95)(value, 20.0) FROM t;
```

**関連情報**

- [Student's t-test](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [studentTTest 関数](/sql-reference/aggregate-functions/reference/studentttest)
