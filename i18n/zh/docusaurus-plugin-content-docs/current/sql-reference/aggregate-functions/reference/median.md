---
slug: /sql-reference/aggregate-functions/reference/median
sidebar_position: 167
title: 'median'
description: 'The `median*` functions are the aliases for the corresponding `quantile*` functions. They calculate median of a numeric data sample.'
---


# median

`median*` 函数是对应 `quantile*` 函数的别名。它们计算数值数据样本的中位数。

函数：

- `median` — [quantile](/sql-reference/aggregate-functions/reference/quantile) 的别名。
- `medianDeterministic` — [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic) 的别名。
- `medianExact` — [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 的别名。
- `medianExactWeighted` — [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted) 的别名。
- `medianTiming` — [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) 的别名。
- `medianTimingWeighted` — [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted) 的别名。
- `medianTDigest` — [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest) 的别名。
- `medianTDigestWeighted` — [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted) 的别名。
- `medianBFloat16` — [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16) 的别名。
- `medianDD` — [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch) 的别名。

**示例**

输入表：

``` text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

查询：

``` sql
SELECT medianDeterministic(val, 1) FROM t;
```

结果：

``` text
┌─medianDeterministic(val, 1)─┐
│                         1.5 │
└─────────────────────────────┘
```
