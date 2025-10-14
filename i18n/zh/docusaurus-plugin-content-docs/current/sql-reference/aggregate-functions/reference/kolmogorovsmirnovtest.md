---
'description': '对两个总体的样本应用 Kolmogorov-Smirnov 的检验。'
'sidebar_label': 'kolmogorovSmirnovTest'
'sidebar_position': 156
'slug': '/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest'
'title': 'kolmogorovSmirnovTest'
'doc_type': 'reference'
---


# kolmogorovSmirnovTest

应用Kolmogorov-Smirnov检验于两个总体的样本。

**语法**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

两个样本的值在`sample_data`列中。如果`sample_index`等于0，则该行中的值属于第一个总体的样本。否则，它属于第二个总体的样本。样本必须属于连续的、一维的概率分布。

**参数**

- `sample_data` — 样本数据。[整数](../../../sql-reference/data-types/int-uint.md)、[浮点数](../../../sql-reference/data-types/float.md)或[十进制数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。[整数](../../../sql-reference/data-types/int-uint.md)。

**参数**

- `alternative` — 备择假设。（可选，默认：`'two-sided'`。）[字符串](../../../sql-reference/data-types/string.md)。
    设F(x)和G(x)分别为第一个和第二个分布的CDF。
  - `'two-sided'`
        虚无假设是样本来自同一分布，例如对于所有x，`F(x) = G(x)`。
        备择假设是分布不相同。
  - `'greater'`
        虚无假设是第一个样本中的值*随机小于*第二个样本中的值，
        例如第一个分布的CDF在第二个分布的CDF上方，即在其左侧。
        这实际上意味着对于所有x，`F(x) >= G(x)`。并且在这种情况下，备择假设是至少存在一个x使得`F(x) < G(x)`。
  - `'less'`.
        虚无假设是第一个样本中的值*随机大于*第二个样本中的值，
        例如第一个分布的CDF在第二个分布的CDF下方，即在其右侧。
        这实际上意味着对于所有x，`F(x) <= G(x)`。并且在这种情况下，备择假设是至少存在一个x使得`F(x) > G(x)`。
- `computation_method` — 用于计算p值的方法。（可选，默认：`'auto'`。）[字符串](../../../sql-reference/data-types/string.md)。
  - `'exact'` - 使用精确的概率分布计算检验统计量。除了小样本外，此方法计算量大且浪费。
  - `'asymp'` (`'asymptotic'`) - 使用近似值进行计算。对于大样本，精确和渐近的p值非常相似。
  - `'auto'`  - 当最大样本数量少于10'000时使用`'exact'`方法。

**返回值**

[元组](../../../sql-reference/data-types/tuple.md)，包含两个元素：

- 计算出的统计量。[Float64](../../../sql-reference/data-types/float.md)。
- 计算出的p值。[Float64](../../../sql-reference/data-types/float.md)。

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

备注：
p值大于0.05（置信水平为95%），因此未拒绝虚无假设。

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

备注：
p值小于0.05（置信水平为95%），因此拒绝虚无假设。

**另见**

- [Kolmogorov-Smirnov的检验](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)
