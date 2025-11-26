---
description: '对来自两个总体的样本进行 Kolmogorov-Smirnov 检验。'
sidebar_label: 'kolmogorovSmirnovTest'
sidebar_position: 156
slug: /sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest
title: 'kolmogorovSmirnovTest'
doc_type: 'reference'
---

# kolmogorovSmirnovTest

将 Kolmogorov-Smirnov 检验应用于来自两个总体的样本。

**语法**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

两个样本的值都在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行中的值属于第一总体的样本，否则属于第二总体的样本。\
样本必须来自连续的一维概率分布。

**参数**

* `sample_data` — 样本数据。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — 样本索引。[Integer](../../../sql-reference/data-types/int-uint.md)。

**设置项**

* `alternative` — 备择假设。（可选，默认：`'two-sided'`。）[String](../../../sql-reference/data-types/string.md)。\
  设 F(x) 和 G(x) 分别为第一和第二分布的累积分布函数（CDF）。
  * `'two-sided'`\
    原假设为样本来自同一分布，例如对所有 x 都有 `F(x) = G(x)`。\
    备择假设为两个分布并不相同。
  * `'greater'`\
    原假设为第一样本中的值在随机意义上 *小于* 第二样本中的值，\
    即第一个分布的 CDF 位于第二个分布之上，因此也在其左侧。\
    这实际上意味着对所有 x 都有 `F(x) >= G(x)`。在这种情况下，备择假设为至少存在一个 x 使得 `F(x) < G(x)`。
  * `'less'`。\
    原假设为第一样本中的值在随机意义上 *大于* 第二样本中的值，\
    即第一个分布的 CDF 位于第二个分布之下，因此也在其右侧。\
    这实际上意味着对所有 x 都有 `F(x) <= G(x)`。在这种情况下，备择假设为至少存在一个 x 使得 `F(x) > G(x)`。
* `computation_method` — 用于计算 p-value 的方法。（可选，默认：`'auto'`。）[String](../../../sql-reference/data-types/string.md)。
  * `'exact'` - 使用检验统计量的精确概率分布进行计算。除小样本外，计算开销较大且不划算。
  * `'asymp'` (`'asymptotic'`) - 使用近似方法进行计算。对于大样本，精确与渐近 p-value 非常接近。
  * `'auto'`  - 当样本数量的最大值小于 10&#39;000 时使用 `'exact'` 方法。

**返回值**

包含两个元素的 [Tuple](../../../sql-reference/data-types/tuple.md)：

* 计算得到的统计量。[Float64](../../../sql-reference/data-types/float.md)。
* 计算得到的 p-value。[Float64](../../../sql-reference/data-types/float.md)。

**示例**

查询：

```sql
SELECT kolmogorovSmirnovTest('less', 'exact')(value, num)
FROM
(
    SELECT
        randNormal(0, 10) AS value,
        0 AS num
    FROM numbers(10000)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(10000)
)
```

结果：

```text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

注意：
P 值大于 0.05（对应 95% 的置信水平），因此原假设不被拒绝。

查询：

```sql
SELECT kolmogorovSmirnovTest('two-sided', 'exact')(value, num)
FROM
(
    SELECT
        randStudentT(10) AS value,
        0 AS num
    FROM numbers(100)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(100)
)
```

结果：

```text
┌─kolmogorovSmirnovTest('two-sided', 'exact')(value, num)─┐
│ (0.4100000000000002,6.61735760482795e-8)                │
└─────────────────────────────────────────────────────────┘
```


注：
P 值小于 0.05（对应 95% 的置信水平），因此应当拒绝原假设。

**另请参阅**

- [Kolmogorov-Smirnov 检验](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)