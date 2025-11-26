---
description: '`median*` 関数は、対応する `quantile*` 関数のエイリアスです。数値データサンプルの中央値を計算します。'
sidebar_position: 167
slug: /sql-reference/aggregate-functions/reference/median
title: 'median'
doc_type: 'reference'
---

# median

`median*` 関数は、対応する `quantile*` 関数のエイリアスです。数値データのサンプルに対する中央値を計算します。

関数:

* `median` — [quantile](/sql-reference/aggregate-functions/reference/quantile) のエイリアス。
* `medianDeterministic` — [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic) のエイリアス。
* `medianExact` — [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) のエイリアス。
* `medianExactWeighted` — [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted) のエイリアス。
* `medianTiming` — [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) のエイリアス。
* `medianTimingWeighted` — [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted) のエイリアス。
* `medianTDigest` — [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest) のエイリアス。
* `medianTDigestWeighted` — [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted) のエイリアス。
* `medianBFloat16` — [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16) のエイリアス。
* `medianDD` — [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch) のエイリアス。

**例**

入力テーブル:

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

クエリ:

```sql
SELECT medianDeterministic(val, 1) FROM t;
```

結果：

```text
┌─medianDeterministic(val, 1)─┐
│                         1.5 │
└─────────────────────────────┘
```
