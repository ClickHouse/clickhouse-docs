---
'description': 'Documentation for NumericIndexedVector 和其函数'
'sidebar_label': 'NumericIndexedVector'
'slug': '/sql-reference/functions/numeric-indexed-vector-functions'
'title': 'NumericIndexedVector 函数'
'doc_type': 'reference'
---


# NumericIndexedVector

NumericIndexedVector 是一种抽象数据结构，封装了一个向量并实现了向量聚合和逐点操作。它的存储方法是 Bit-Sliced Index。有关理论基础和使用场景，请参考论文 [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411)。

## BSI {#bit-sliced-index}

在 BSI（Bit-Sliced Index）存储方法中，数据以 [Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268) 的形式存储，然后使用 [Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap) 进行压缩。聚合操作和逐点操作直接在压缩数据上进行，这可以显著提高存储和查询的效率。

一个向量包含索引及其对应的值。以下是在 BSI 存储模式下该数据结构的一些特性和限制：

- 索引类型可以是 `UInt8`、`UInt16` 或 `UInt32`。**注意：** 考虑到 Roaring Bitmap 的 64 位实现性能，BSI 格式不支持 `UInt64`/`Int64`。
- 值类型可以是 `Int8`、`Int16`、`Int32`、`Int64`、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Float32` 或 `Float64`。**注意：** 值类型不会自动扩展。例如，如果您使用 `UInt8` 作为值类型，任何超过 `UInt8` 容量的和将导致溢出，而不是提升到更高的类型；同样，整数运算将产生整数结果（例如，除法不会自动转换为浮点结果）。因此，提前规划和设计值类型非常重要。在实际场景中，通常使用浮点类型（`Float32`/`Float64`）。
- 只有同一索引类型和值类型的两个向量可以进行操作。
- 底层存储使用 Bit-Sliced Index，位图存储索引。Roaring Bitmap 用作位图的具体实现。最佳实践是尽可能将索引集中在几个 Roaring Bitmap 容器中，以最大化压缩和查询性能。
- Bit-Sliced Index 机制将值转换为二进制。对于浮点类型，转换使用定点表示，这可能导致精度损失。通过自定义用于小数部分的位数可以调整精度，默认是 24 位，这对于大多数场景来说是足够的。您可以在构建 NumericIndexedVector 时使用聚合函数 groupNumericIndexedVector 与 `-State` 自定义整数位和小数位的位数。
- 索引有三种情况：非零值、零值和不存在。在 NumericIndexedVector 中，仅存储非零值和零值。此外，在两个 NumericIndexedVectors 之间的逐点操作中，不存在的索引值将视为 0。在除法场景中，当除数为零时，结果为零。

## Create a numericIndexedVector object {#create-numeric-indexed-vector-object}

创建此结构有两种方法：一种是使用带有 `-State` 的聚合函数 `groupNumericIndexedVector`。您可以添加后缀 `-if` 以接受额外的条件。聚合函数将仅处理触发条件的行。另一种是使用 `numericIndexedVectorBuild` 从映射构建它。`groupNumericIndexedVectorState` 函数通过参数允许自定义整数位和小数位的数量，而 `numericIndexedVectorBuild` 则不支持。

## groupNumericIndexedVector {#group-numeric-indexed-vector}

从两个数据列构建一个 NumericIndexedVector，并返回所有值的总和，类型为 `Float64`。如果添加后缀 `State`，则返回一个 NumericIndexedVector 对象。

**语法**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**参数**

- `type`: 字符串，可选。指定存储格式。目前仅支持 `'BSI'`。
- `integer_bit_num`: `UInt32`，可选。在 `'BSI'` 存储格式下有效，此参数指示用于整数部分的位数。当索引类型为整数类型时，默认值对应于用于存储索引的位数。例如，如果索引类型是 UInt16，则默认 `integer_bit_num` 为 16。对于 Float32 和 Float64 索引类型，`integer_bit_num` 的默认值为 40，从而可以表示的数据的整数部分在范围 `[-2^39, 2^39 - 1]` 内。合法范围是 `[0, 64]`。
- `fraction_bit_num`: `UInt32`，可选。在 `'BSI'` 存储格式下有效，此参数指示用于小数部分的位数。当值类型为整数时，默认值为 0；当值类型为 Float32 或 Float64 类型时，默认值为 24。有效范围是 `[0, 24]`。
- 还有一个约束，即 integer_bit_num + fraction_bit_num 的有效范围为 [0, 64]。
- `col1`: 索引列。支持的类型：`UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`。
- `col2`: 值列。支持的类型：`Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`。

**返回值**

一个 `Float64` 值，表示所有值的总和。

**示例**

测试数据：

```text
UserID  PlayTime
1       10
2       20
3       30
```

查询 & 结果：

```sql
SELECT groupNumericIndexedVector(UserID, PlayTime) AS num FROM t;
┌─num─┐
│  60 │
└─────┘

SELECT groupNumericIndexedVectorState(UserID, PlayTime) as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)─────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8)  │ 60                                    │
└─────┴─────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf('BSI', 32, 0)(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)──────────────────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction('BSI', 32, 0)(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────┘
```

## numericIndexedVectorBuild {#numeric-indexed-vector-build}

从映射创建一个 NumericIndexedVector。映射的键代表向量的索引，映射的值代表向量的值。

语法

```sql
numericIndexedVectorBuild(map)
```

参数

- `map` – 一个从索引到值的映射。

示例

```sql
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

结果

```text
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```

## numericIndexedVectorToMap

将 NumericIndexedVector 转换为映射。

语法

```sql
numericIndexedVectorToMap(numericIndexedVector)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。

示例

```sql
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

结果

```text
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```

## numericIndexedVectorCardinality

返回 NumericIndexedVector 的基数（唯一索引的数量）。

语法

```sql
numericIndexedVectorCardinality(numericIndexedVector)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。

示例

```sql
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

结果

```text
┌─res─┐
│  3  │
└─────┘
```

## numericIndexedVectorAllValueSum

返回 NumericIndexedVector 中所有值的总和。

语法

```sql
numericIndexedVectorAllValueSum(numericIndexedVector)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。

示例

```sql
SELECT numericIndexedVectorAllValueSum(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

结果

```text
┌─res─┐
│  60 │
└─────┘
```

## numericIndexedVectorGetValue

检索对应于指定索引的值。

语法

```sql
numericIndexedVectorGetValue(numericIndexedVector, index)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `index` – 要检索其值的索引。

示例

```sql
SELECT numericIndexedVectorGetValue(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])), 3) AS res;
```

结果

```text
┌─res─┐
│  30 │
└─────┘
```

## numericIndexedVectorShortDebugString

以 json 格式返回 NumericIndexedVector 的内部信息。此函数主要用于调试目的。

语法

```sql
numericIndexedVectorShortDebugString(numericIndexedVector)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。

示例

```sql
SELECT numericIndexedVectorShortDebugString(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res\G;
```

结果

```text
Row 1:
──────
res: {"vector_type":"BSI","index_type":"char8_t","value_type":"char8_t","integer_bit_num":8,"fraction_bit_num":0,"zero_indexes_info":{"cardinality":"0"},"non_zero_indexes_info":{"total_cardinality":"3","all_value_sum":60,"number_of_bitmaps":"8","bitmap_info":{"cardinality":{"0":"0","1":"2","2":"2","3":"2","4":"2","5":"0","6":"0","7":"0"}}}}
```

- `vector_type`: 向量的存储类型，目前仅支持 `BSI`。
- `index_type`: 索引的类型。
- `value_type`: 值的类型。

在 BSI 向量类型下，以下信息是有效的。

- `integer_bit_num`: 用于整数部分的位数。
- `fraction_bit_num`: 用于小数部分的位数。
- `zero_indexes info`: 值等于 0 的索引的信息
    - `cardinality`: 值等于 0 的索引数量。
- `non_zero_indexes info`: 值不等于 0 的索引的信息
    - `total_cardinality`: 值不等于 0 的索引数量。
    - `all value sum`: 所有值的总和。
    - `number_of_bitmaps`: 此索引值不等于 0 时使用的位图数量。
    - `bitmap_info`: 每个位图的信息
        - `cardinality`: 每个位图中的索引数量。

## numericIndexedVectorPointwiseAdd

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点加法。该函数返回一个新的 NumericIndexedVector。

语法

```sql
numericIndexedVectorPointwiseAdd(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, 2)) AS res2;
```

结果

```text
┌─res1──────────────────┬─res2─────────────┐
│ {1:10,2:30,3:50,4:30} │ {1:12,2:22,3:32} │
└───────────────────────┴──────────────────┘
```

## numericIndexedVectorPointwiseSubtract

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点减法。该函数返回一个新的 NumericIndexedVector。

语法

```sql
numericIndexedVectorPointwiseSubtract(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, 2)) AS res2;
```

结果

```text
┌─res1───────────────────┬─res2────────────┐
│ {1:10,2:10,3:10,4:-30} │ {1:8,2:18,3:28} │
└────────────────────────┴─────────────────┘
```

## numericIndexedVectorPointwiseMultiply

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点乘法。该函数返回一个新的 NumericIndexedVector。

语法

```sql
numericIndexedVectorPointwiseMultiply(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, 2)) AS res2;
```

结果

```text
┌─res1──────────┬─res2─────────────┐
│ {2:200,3:600} │ {1:20,2:40,3:60} │
└───────────────┴──────────────────┘
```

## numericIndexedVectorPointwiseDivide

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点除法。该函数返回一个新的 NumericIndexedVector。当除数为零时，结果为零。

语法

```sql
numericIndexedVectorPointwiseDivide(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, 2)) AS res2;
```

结果

```text
┌─res1────────┬─res2────────────┐
│ {2:2,3:1.5} │ {1:5,2:10,3:15} │
└─────────────┴─────────────────┘
```

## numericIndexedVectorPointwiseEqual

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点比较。结果是一个 NumericIndexedVector，其中包含值相等的索引，所有对应值设置为 1。

语法

```sql
numericIndexedVectorPointwiseEqual(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, 20)) AS res2;
```

结果

```text
┌─res1──┬─res2──┐
│ {2:1} │ {2:1} │
└───────┴───────┘
```

## numericIndexedVectorPointwiseNotEqual

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点比较。结果是一个 NumericIndexedVector，其中包含值不相等的索引，所有对应值设置为 1。

语法

```sql
numericIndexedVectorPointwiseNotEqual(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, 20)) AS res2;
```

结果

```text
┌─res1──────────┬─res2──────┐
│ {1:1,3:1,4:1} │ {1:1,3:1} │
└───────────────┴───────────┘
```

## numericIndexedVectorPointwiseLess

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点比较。结果是一个 NumericIndexedVector，其中包含第一个向量的值小于第二个向量的值的索引，所有对应值设置为 1。

语法

```sql
numericIndexedVectorPointwiseLess(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, 20)) AS res2;
```

结果

```text
┌─res1──────┬─res2──┐
│ {3:1,4:1} │ {1:1} │
└───────────┴───────┘
```

## numericIndexedVectorPointwiseLessEqual

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点比较。结果是一个 NumericIndexedVector，其中包含第一个向量的值小于或等于第二个向量的值的索引，所有对应值设置为 1。

语法

```sql
numericIndexedVectorPointwiseLessEqual(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, 20)) AS res2;
```

结果

```text
┌─res1──────────┬─res2──────┐
│ {2:1,3:1,4:1} │ {1:1,2:1} │
└───────────────┴───────────┘
```

## numericIndexedVectorPointwiseGreater

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点比较。结果是一个 NumericIndexedVector，其中包含第一个向量的值大于第二个向量的值的索引，所有对应值设置为 1。

语法

```sql
numericIndexedVectorPointwiseGreater(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, 20)) AS res2;
```

结果

```text
┌─res1──────┬─res2──┐
│ {1:1,3:1} │ {3:1} │
└───────────┴───────┘
```

## numericIndexedVectorPointwiseGreaterEqual

在 NumericIndexedVector 和另一个 NumericIndexedVector 或数字常量之间执行逐点比较。结果是一个 NumericIndexedVector，其中包含第一个向量的值大于或等于第二个向量的值的索引，所有对应值设置为 1。

语法

```sql
numericIndexedVectorPointwiseGreaterEqual(numericIndexedVector, numericIndexedVector | numeric)
```

参数

- `numericIndexedVector` – 一个 NumericIndexedVector 对象。
- `numeric` - 一个数字常量。

示例

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, 20)) AS res2;
```

结果

```text
┌─res1──────────┬─res2──────┐
│ {1:1,2:1,3:1} │ {2:1,3:1} │
└───────────────┴───────────┘
```

<!-- 
the tags below are used to generate the documentation from system tables, and should not be removed.
For more details see https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
