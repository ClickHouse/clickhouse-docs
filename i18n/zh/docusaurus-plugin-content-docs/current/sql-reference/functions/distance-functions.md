---
'description': 'Distance Functions 的文档'
'sidebar_label': '距离'
'sidebar_position': 55
'slug': '/sql-reference/functions/distance-functions'
'title': '距离函数'
---


# 距离函数

## L1Norm {#l1norm}

计算向量的绝对值之和。

**语法**

```sql
L1Norm(vector)
```

别名: `normL1`。

**参数**

- `vector` — [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。

**返回值**

- L1-范数或 [出租车几何](https://en.wikipedia.org/wiki/Taxicab_geometry) 距离。 [UInt](../data-types/int-uint.md)， [Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。

**示例**

查询：

```sql
SELECT L1Norm((1, 2));
```

结果：

```text
┌─L1Norm((1, 2))─┐
│              3 │
└────────────────┘
```

## L2Norm {#l2norm}

计算向量值的平方和的平方根。

**语法**

```sql
L2Norm(vector)
```

别名: `normL2`。

**参数**

- `vector` — [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。

**返回值**

- L2-范数或 [欧几里得距离](https://en.wikipedia.org/wiki/Euclidean_distance)。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT L2Norm((1, 2));
```

结果：

```text
┌───L2Norm((1, 2))─┐
│ 2.23606797749979 │
└──────────────────┘
```

## L2SquaredNorm {#l2squarednorm}

计算向量值的平方和的平方根（[L2Norm](#l2norm)）的平方。

**语法**

```sql
L2SquaredNorm(vector)
```

别名: `normL2Squared`。

**参数**

- `vector` — [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。

**返回值**

- L2-范数的平方。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT L2SquaredNorm((1, 2));
```

结果：

```text
┌─L2SquaredNorm((1, 2))─┐
│                     5 │
└───────────────────────┘
```

## LinfNorm {#linfnorm}

计算向量的绝对值的最大值。

**语法**

```sql
LinfNorm(vector)
```

别名: `normLinf`。

**参数**

- `vector` — [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。

**返回值**

- Linf-范数或最大绝对值。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT LinfNorm((1, -2));
```

结果：

```text
┌─LinfNorm((1, -2))─┐
│                 2 │
└───────────────────┘
```

## LpNorm {#lpnorm}

计算向量绝对值的 `p` 次方和的平方根，幂为 `p`。

**语法**

```sql
LpNorm(vector, p)
```

别名: `normLp`。

**参数**

- `vector` — [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。
- `p` — 幂。 可能值： 实数在 `[1; inf)` 中。 [UInt](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。

**返回值**

- [Lp-范数](https://en.wikipedia.org/wiki/Norm_(mathematics)#p-norm)。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT LpNorm((1, -2), 2);
```

结果：

```text
┌─LpNorm((1, -2), 2)─┐
│   2.23606797749979 │
└────────────────────┘
```

## L1Distance {#l1distance}

计算两个点之间的距离（向量的值是坐标）在 `L1` 空间中的距离（1-范数 ([出租车几何](https://en.wikipedia.org/wiki/Taxicab_geometry) 距离)）。

**语法**

```sql
L1Distance(vector1, vector2)
```

别名: `distanceL1`。

**参数**

- `vector1` — 第一个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。
- `vector2` — 第二个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。

**返回值**

- 1-范数距离。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT L1Distance((1, 2), (2, 3));
```

结果：

```text
┌─L1Distance((1, 2), (2, 3))─┐
│                          2 │
└────────────────────────────┘
```

## L2Distance {#l2distance}

计算两个点之间的距离（向量的值是坐标）在欧几里得空间中的距离（[欧几里得距离](https://en.wikipedia.org/wiki/Euclidean_distance)）。

**语法**

```sql
L2Distance(vector1, vector2)
```

别名: `distanceL2`。

**参数**

- `vector1` — 第一个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。
- `vector2` — 第二个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。

**返回值**

- 2-范数距离。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT L2Distance((1, 2), (2, 3));
```

结果：

```text
┌─L2Distance((1, 2), (2, 3))─┐
│         1.4142135623730951 │
└────────────────────────────┘
```

## L2SquaredDistance {#l2squareddistance}

计算两个向量对应元素之间差值的平方和。

**语法**

```sql
L2SquaredDistance(vector1, vector2)
```

别名: `distanceL2Squared`。

**参数**

- `vector1` — 第一个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。
- `vector2` — 第二个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。

**返回值**

- 两个向量对应元素之间差值的平方和。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT L2SquaredDistance([1, 2, 3], [0, 0, 0])
```

结果：

```response
┌─L2SquaredDistance([1, 2, 3], [0, 0, 0])─┐
│                                      14 │
└─────────────────────────────────────────┘
```

## LinfDistance {#linfdistance}

计算两个点之间的距离（向量的值是坐标）在 `L_{inf}` 空间中的距离（[最大范数](https://en.wikipedia.org/wiki/Norm_(mathematics)#Maximum_norm_(special_case_of:_infinity_norm,_uniform_norm,_or_supremum_norm) )）。

**语法**

```sql
LinfDistance(vector1, vector2)
```

别名: `distanceLinf`。

**参数**

- `vector1` — 第一个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。
- `vector1` — 第二个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。

**返回值**

- 无限范数距离。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT LinfDistance((1, 2), (2, 3));
```

结果：

```text
┌─LinfDistance((1, 2), (2, 3))─┐
│                            1 │
└──────────────────────────────┘
```

## LpDistance {#lpdistance}

计算两个点之间的距离（向量的值是坐标）在 `Lp` 空间中的距离（[p-范数距离](https://en.wikipedia.org/wiki/Norm_(mathematics)#p-norm)）。

**语法**

```sql
LpDistance(vector1, vector2, p)
```

别名: `distanceLp`。

**参数**

- `vector1` — 第一个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。
- `vector2` — 第二个向量。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。
- `p` — 幂。 可能值： 实数在 `[1; inf)` 中。 [UInt](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。

**返回值**

- p-范数距离。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT LpDistance((1, 2), (2, 3), 3);
```

结果：

```text
┌─LpDistance((1, 2), (2, 3), 3)─┐
│            1.2599210498948732 │
└───────────────────────────────┘
```

## L1Normalize {#l1normalize}

计算给定向量的单位向量（元组的值是坐标）在 `L1` 空间中（[出租车几何](https://en.wikipedia.org/wiki/Taxicab_geometry)）。

**语法**

```sql
L1Normalize(tuple)
```

别名: `normalizeL1`。

**参数**

- `tuple` — [元组](../data-types/tuple.md)。

**返回值**

- 单位向量。 [元组](../data-types/tuple.md) 的 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT L1Normalize((1, 2));
```

结果：

```text
┌─L1Normalize((1, 2))─────────────────────┐
│ (0.3333333333333333,0.6666666666666666) │
└─────────────────────────────────────────┘
```

## L2Normalize {#l2normalize}

计算给定向量的单位向量（元组的值是坐标）在欧几里得空间中（使用 [欧几里得距离](https://en.wikipedia.org/wiki/Euclidean_distance)）。

**语法**

```sql
L2Normalize(tuple)
```

别名: `normalizeL1`。

**参数**

- `tuple` — [元组](../data-types/tuple.md)。

**返回值**

- 单位向量。 [元组](../data-types/tuple.md) 的 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT L2Normalize((3, 4));
```

结果：

```text
┌─L2Normalize((3, 4))─┐
│ (0.6,0.8)           │
└─────────────────────┘
```

## LinfNormalize {#linfnormalize}

计算给定向量的单位向量（元组的值是坐标）在 `L_{inf}` 空间中（使用 [最大范数](https://en.wikipedia.org/wiki/Norm_(mathematics)#Maximum_norm_(special_case_of:_infinity_norm,_uniform_norm,_or_supremum_norm) )）。

**语法**

```sql
LinfNormalize(tuple)
```

别名: `normalizeLinf `。

**参数**

- `tuple` — [元组](../data-types/tuple.md)。

**返回值**

- 单位向量。 [元组](../data-types/tuple.md) 的 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT LinfNormalize((3, 4));
```

结果：

```text
┌─LinfNormalize((3, 4))─┐
│ (0.75,1)              │
└───────────────────────┘
```

## LpNormalize {#lpnormalize}

计算给定向量的单位向量（元组的值是坐标）在 `Lp` 空间中（使用 [p-范数](https://en.wikipedia.org/wiki/Norm_(mathematics)#p-norm)）。

**语法**

```sql
LpNormalize(tuple, p)
```

别名: `normalizeLp `。

**参数**

- `tuple` — [元组](../data-types/tuple.md)。
- `p` — 幂。 可能值： 任何数字在 [1;inf) 中。 [UInt](../data-types/int-uint.md) 或 [Float](../data-types/float.md)。

**返回值**

- 单位向量。 [元组](../data-types/tuple.md) 的 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT LpNormalize((3, 4),5);
```

结果：

```text
┌─LpNormalize((3, 4), 5)──────────────────┐
│ (0.7187302630182624,0.9583070173576831) │
└─────────────────────────────────────────┘
```

## cosineDistance {#cosinedistance}

计算两个向量之间的余弦距离（元组的值是坐标）。 返回值越小，向量越相似。

**语法**

```sql
cosineDistance(vector1, vector2)
```

**参数**

- `vector1` — 第一个元组。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。
- `vector2` — 第二个元组。 [元组](../data-types/tuple.md) 或 [数组](../data-types/array.md)。

**返回值**

- 两个向量间的角度的余弦减去1。 [Float](../data-types/float.md)。

**示例**

查询：

```sql
SELECT cosineDistance((1, 2), (2, 3));
```

结果：

```text
┌─cosineDistance((1, 2), (2, 3))─┐
│           0.007722123286332261 │
└────────────────────────────────┘
```
