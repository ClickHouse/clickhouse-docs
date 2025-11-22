---
description: '既知の母平均に対して 1 標本のスチューデントの t 検定を適用します。'
sidebar_label: 'studentTTestOneSample'
sidebar_position: 195
slug: /sql-reference/aggregate-functions/reference/studentttestonesample
title: 'studentTTestOneSample'
doc_type: 'reference'
---

# studentTTestOneSample

既知の母平均と比較して標本平均が異なるかどうかを判定するために、1 標本 Student の t 検定を適用します。

正規性を仮定します。帰無仮説は、標本平均が母平均に等しいことです。

**構文**

```sql
studentTTestOneSample([confidence_level])(sample_data, population_mean)
```

オプションの `confidence_level` により、信頼区間を計算できます。

**引数**

* `sample_data` — 標本データ。Integer、Float または Decimal。
* `population_mean` — 検定対象となる既知の母平均。Integer、Float または Decimal（通常は定数）。

**パラメータ**

* `confidence_level` — 信頼区間の信頼水準。(0, 1) 内の Float。

注意:

* 観測値が少なくとも 2 つ必要です。満たさない場合、結果は `(nan, nan)` となり（要求された区間も `nan` になります）。
* 入力が定数またはほぼ定数の場合、標準誤差が 0（または事実上 0）となるため、`nan` が返されます。

**戻り値**

[Tuple](../../../sql-reference/data-types/tuple.md)。要素は 2 つ、または `confidence_level` が指定されている場合は 4 つ:

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

信頼区間なし:

```sql
SELECT studentTTestOneSample()(value, 20.0) FROM t;
-- または単純に
SELECT studentTTestOneSample(value, 20.0) FROM t;
```

95%信頼区間：

```sql
SELECT studentTTestOneSample(0.95)(value, 20.0) FROM t;
```

**関連項目**

* [スチューデントのt検定](https://en.wikipedia.org/wiki/Student%27s_t-test)
* [studentTTest 関数](/sql-reference/aggregate-functions/reference/studentttest)
