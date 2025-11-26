---
description: '既知の母平均に対して、標本に 1 標本 Student の t 検定を適用します。'
sidebar_label: 'studentTTestOneSample'
sidebar_position: 195
slug: /sql-reference/aggregate-functions/reference/studentttestonesample
title: 'studentTTestOneSample'
doc_type: 'reference'
---

# studentTTestOneSample

既知の母平均と比較して標本の平均値が異なるかどうかを判定するために、1標本の Student の t 検定を適用します。

標本が正規分布に従うと仮定します。帰無仮説は、標本平均が母平均に等しいというものです。

**構文**

```sql
studentTTestOneSample([confidence_level])(sample_data, population_mean)
```

オプションの `confidence_level` により、信頼区間の計算が有効になります。

**引数**

* `sample_data` — サンプルデータ。Integer、Float または Decimal。
* `population_mean` — 検定対象となる既知の母平均。Integer、Float または Decimal（通常は定数）。

**パラメータ**

* `confidence_level` — 信頼区間に用いる信頼水準。(0, 1) の Float。

注意:

* 観測値が少なくとも 2 つ必要です。それ未満の場合、結果は `(nan, nan)` となり（要求された区間も `nan` となります）。
* 入力が定数またはほぼ定数の場合、標準誤差が 0（もしくは実質的に 0）であるため、`nan` が返されます。

**返される値**

[Tuple](../../../sql-reference/data-types/tuple.md) 型で、2 要素または 4 要素（`confidence_level` が指定された場合）です:

* 計算された t 統計量。Float64。
* 計算された p 値（両側検定）。Float64。
* 計算された信頼区間の下限。Float64。（オプション）
* 計算された信頼区間の上限。Float64。（オプション）

信頼区間は、指定された信頼水準における標本平均に対するものです。

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

信頼区間なし：

```sql
SELECT studentTTestOneSample()(value, 20.0) FROM t;
-- or simply
SELECT studentTTestOneSample(value, 20.0) FROM t;
```

95% 信頼区間：

```sql
SELECT studentTTestOneSample(0.95)(value, 20.0) FROM t;
```

**関連項目**

* [スチューデントのt検定](https://en.wikipedia.org/wiki/Student%27s_t-test)
* [studentTTest 関数](/sql-reference/aggregate-functions/reference/studentttest)
