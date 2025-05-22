
# kolmogorovSmirnovTest

对两个母体的样本应用Kolmogorov-Smirnov检验。

**语法**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

两个样本的值在 `sample_data` 列中。如果 `sample_index` 等于 0，那么该行的值属于第一个母体的样本。否则，它属于第二个母体的样本。样本必须来自连续的一维概率分布。

**参数**

- `sample_data` — 样本数据。 [整数](../../../sql-reference/data-types/int-uint.md)、 [浮点数](../../../sql-reference/data-types/float.md) 或 [十进制](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。 [整数](../../../sql-reference/data-types/int-uint.md)。

**参数**

- `alternative` — 备择假设。（可选，默认值： `'two-sided'`。） [字符串](../../../sql-reference/data-types/string.md)。
    让 F(x) 和 G(x) 分别为第一个和第二个分布的CDF。
    - `'two-sided'`
        原假设是样本来自相同的分布，例如 `F(x) = G(x)` 对于所有 x。
        备择假设是这两个分布不相同。
    - `'greater'`
        原假设是第一个样本中的值 *随机小于* 第二个样本中的值，
        例如，第一个分布的CDF位于第二个分布的上方，因此在左侧。
        这实际上意味着 `F(x) >= G(x)` 对于所有 x。而在这种情况下，备择假设是对于至少一个 x，`F(x) < G(x)`。
    - `'less'`
        原假设是第一个样本中的值 *随机大于* 第二个样本中的值，
        例如，第一个分布的CDF位于第二个分布的下方，因此在右侧。
        这实际上意味着 `F(x) <= G(x)` 对于所有 x。而在这种情况下，备择假设是对于至少一个 x，`F(x) > G(x)`。
- `computation_method` — 用于计算p值的方法。（可选，默认值： `'auto'`。） [字符串](../../../sql-reference/data-types/string.md)。
    - `'exact'` - 使用测试统计量的精确概率分布进行计算。计算密集且浪费，除非样本较小。
    - `'asymp'` （`'asymptotic'`）- 使用近似值进行计算。对于较大的样本量，精确和渐近的p值非常相似。
    - `'auto'`  - 当样本的最大数量少于10,000时使用 `'exact'` 方法。


**返回值**

[元组](../../../sql-reference/data-types/tuple.md)包含两个元素：

- 计算的统计量。 [Float64](../../../sql-reference/data-types/float.md)。
- 计算的p值。 [Float64](../../../sql-reference/data-types/float.md)。


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
P值大于0.05（置信水平为95%），因此未拒绝原假设。


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

注意：
P值小于0.05（置信水平为95%），因此拒绝原假设。


**另见**

- [Kolmogorov-Smirnov检验](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)
