---
'description': 'Bitmap 函数的文档'
'sidebar_label': '位图'
'sidebar_position': 25
'slug': '/sql-reference/functions/bitmap-functions'
'title': 'Bitmap Functions'
---




# 位图函数

位图可以通过两种方式构建。第一种方式是通过聚合函数 groupBitmap 结合 `-State` 构建，第二种方式是通过 Array 对象构建位图。

## bitmapBuild {#bitmapbuild}

从无符号整数数组构建位图。

**语法**

```sql
bitmapBuild(array)
```

**参数**

- `array` – 无符号整数数组。

**示例**

```sql
SELECT bitmapBuild([1, 2, 3, 4, 5]) AS res, toTypeName(res);
```

```text
┌─res─┬─toTypeName(bitmapBuild([1, 2, 3, 4, 5]))─────┐
│     │ AggregateFunction(groupBitmap, UInt8)        │
└─────┴──────────────────────────────────────────────┘
```

## bitmapToArray {#bitmaptoarray}

将位图转换为整数数组。

**语法**

```sql
bitmapToArray(bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapToArray(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

结果：

```text
┌─res─────────┐
│ [1,2,3,4,5] │
└─────────────┘
```

## bitmapSubsetInRange {#bitmapsubsetinrange}

返回位图中在值区间内的位的子集。

**语法**

```sql
bitmapSubsetInRange(bitmap, range_start, range_end)
```

**参数**

- `bitmap` – [位图对象](#bitmapbuild)。
- `range_start` – 区间起始值（包含）。 [UInt32](../data-types/int-uint.md)。
- `range_end` – 区间结束值（不包含）。 [UInt32](../data-types/int-uint.md)。

**示例**

```sql
SELECT bitmapToArray(bitmapSubsetInRange(bitmapBuild([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,100,200,500]), toUInt32(30), toUInt32(200))) AS res;
```

结果：

```text
┌─res───────────────┐
│ [30,31,32,33,100] │
└───────────────────┘
```

## bitmapSubsetLimit {#bitmapsubsetlimit}

返回位图中最小位值为 `range_start` 的子集，最多包含 `cardinality_limit` 元素。

**语法**

```sql
bitmapSubsetLimit(bitmap, range_start, cardinality_limit)
```

**参数**

- `bitmap` – [位图对象](#bitmapbuild)。
- `range_start` – 区间起始值（包含）。 [UInt32](../data-types/int-uint.md)。
- `cardinality_limit` – 子集的最大基数。 [UInt32](../data-types/int-uint.md)。

**示例**

```sql
SELECT bitmapToArray(bitmapSubsetLimit(bitmapBuild([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,100,200,500]), toUInt32(30), toUInt32(200))) AS res;
```

结果：

```text
┌─res───────────────────────┐
│ [30,31,32,33,100,200,500] │
└───────────────────────────┘
```

## subBitmap {#subbitmap}

返回位图的子集，从位置 `offset` 开始。返回位图的最大基数为 `cardinality_limit`。

**语法**

```sql
subBitmap(bitmap, offset, cardinality_limit)
```

**参数**

- `bitmap` – 位图。 [位图对象](#bitmapbuild)。
- `offset` – 子集的第一个元素位置。 [UInt32](../data-types/int-uint.md)。
- `cardinality_limit` – 子集中的最大元素数量。 [UInt32](../data-types/int-uint.md)。

**示例**

```sql
SELECT bitmapToArray(subBitmap(bitmapBuild([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,100,200,500]), toUInt32(10), toUInt32(10))) AS res;
```

结果：

```text
┌─res─────────────────────────────┐
│ [10,11,12,13,14,15,16,17,18,19] │
└─────────────────────────────────┘
```

## bitmapContains {#bitmapcontains}

检查位图是否包含某个元素。

```sql
bitmapContains(bitmap, needle)
```

**参数**

- `bitmap` – [位图对象](#bitmapbuild)。
- `needle` – 要搜索的位值。 [UInt32](../data-types/int-uint.md)。

**返回值**

- 0 — 如果 `bitmap` 不包含 `needle`。 [UInt8](../data-types/int-uint.md)。
- 1 — 如果 `bitmap` 包含 `needle`。 [UInt8](../data-types/int-uint.md)。

**示例**

```sql
SELECT bitmapContains(bitmapBuild([1,5,7,9]), toUInt32(9)) AS res;
```

结果：

```text
┌─res─┐
│  1  │
└─────┘
```

## bitmapHasAny {#bitmaphasany}

检查两个位图是否相交。

如果 `bitmap2` 仅包含一个元素，建议使用 [bitmapContains](#bitmapcontains) 代替，因为它的效率更高。

**语法**

```sql
bitmapHasAny(bitmap1, bitmap2)
```

**参数**

- `bitmap1` – 位图对象 1。
- `bitmap2` – 位图对象 2。

**返回值**

- `1`，如果 `bitmap1` 和 `bitmap2` 具有至少一个共享元素。
- `0`，否则。

**示例**

```sql
SELECT bitmapHasAny(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

结果：

```text
┌─res─┐
│  1  │
└─────┘
```

## bitmapHasAll {#bitmaphasall}

如果第一个位图包含第二个位图的所有元素，则返回 1，否则返回 0。
如果第二个位图为空，则返回 1。

另见 `hasAll(array, array)`。

**语法**

```sql
bitmapHasAll(bitmap1, bitmap2)
```

**参数**

- `bitmap1` – 位图对象 1。
- `bitmap2` – 位图对象 2。

**示例**

```sql
SELECT bitmapHasAll(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

结果：

```text
┌─res─┐
│  0  │
└─────┘
```

## bitmapCardinality {#bitmapcardinality}

返回位图的基数。

**语法**

```sql
bitmapCardinality(bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapCardinality(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

结果：

```text
┌─res─┐
│   5 │
└─────┘
```

## bitmapMin {#bitmapmin}

计算位图中设置的最小位，或者如果位图为空则返回 UINT32_MAX（如果类型 >= 8 位则返回 UINT64_MAX）。

**语法**

```sql
bitmapMin(bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapMin(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

结果：

```text
 ┌─res─┐
 │   1 │
 └─────┘
```

## bitmapMax {#bitmapmax}

计算位图中设置的最大位，或者如果位图为空则返回 0。

**语法**

```sql
bitmapMax(bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapMax(bitmapBuild([1, 2, 3, 4, 5])) AS res;
```

结果：

```text
 ┌─res─┐
 │   5 │
 └─────┘
```

## bitmapTransform {#bitmaptransform}

在位图中最多替换 N 个位。第 i 个被替换位的旧值和新值由 `from_array[i]` 和 `to_array[i]` 给出。

结果取决于 `from_array` 和 `to_array` 的数组顺序。

**语法**

```sql
bitmapTransform(bitmap, from_array, to_array)
```

**参数**

- `bitmap` – 位图对象。
- `from_array` – UInt32 数组。对于索引在范围 \[0, from_array.size()) 内的值，如果位图包含 from_array\[idx\]，则用 to_array\[idx\] 替换它。
- `to_array` – 与 `from_array` 大小相同的 UInt32 数组。

**示例**

```sql
SELECT bitmapToArray(bitmapTransform(bitmapBuild([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), cast([5,999,2] as Array(UInt32)), cast([2,888,20] as Array(UInt32)))) AS res;
```

结果：

```text
 ┌─res───────────────────┐
 │ [1,3,4,6,7,8,9,10,20] │
 └───────────────────────┘
```

## bitmapAnd {#bitmapand}

计算两个位图的逻辑与。

**语法**

```sql
bitmapAnd(bitmap,bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapToArray(bitmapAnd(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

结果：

```text
┌─res─┐
│ [3] │
└─────┘
```

## bitmapOr {#bitmapor}

计算两个位图的逻辑或。

**语法**

```sql
bitmapOr(bitmap,bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapToArray(bitmapOr(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

结果：

```text
┌─res─────────┐
│ [1,2,3,4,5] │
└─────────────┘
```

## bitmapXor {#bitmapxor}

计算两个位图的异或。

**语法**

```sql
bitmapXor(bitmap,bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapToArray(bitmapXor(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

结果：

```text
┌─res───────┐
│ [1,2,4,5] │
└───────────┘
```

## bitmapAndnot {#bitmapandnot}

计算两个位图的逻辑与并取反结果。

**语法**

```sql
bitmapAndnot(bitmap,bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapToArray(bitmapAndnot(bitmapBuild([1,2,3]),bitmapBuild([3,4,5]))) AS res;
```

结果：

```text
┌─res───┐
│ [1,2] │
└───────┘
```

## bitmapAndCardinality {#bitmapandcardinality}

返回两个位图逻辑与的基数。

**语法**

```sql
bitmapAndCardinality(bitmap,bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapAndCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

结果：

```text
┌─res─┐
│   1 │
└─────┘
```

## bitmapOrCardinality {#bitmaporcardinality}

返回两个位图逻辑或的基数。

```sql
bitmapOrCardinality(bitmap,bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapOrCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

结果：

```text
┌─res─┐
│   5 │
└─────┘
```

## bitmapXorCardinality {#bitmapxorcardinality}

返回两个位图异或的基数。

```sql
bitmapXorCardinality(bitmap,bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapXorCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

结果：

```text
┌─res─┐
│   4 │
└─────┘
```

## bitmapAndnotCardinality {#bitmapandnotcardinality}

返回两个位图的 AND-NOT 操作的基数。

```sql
bitmapAndnotCardinality(bitmap,bitmap)
```

**参数**

- `bitmap` – 位图对象。

**示例**

```sql
SELECT bitmapAndnotCardinality(bitmapBuild([1,2,3]),bitmapBuild([3,4,5])) AS res;
```

结果：

```text
┌─res─┐
│   2 │
└─────┘
```
