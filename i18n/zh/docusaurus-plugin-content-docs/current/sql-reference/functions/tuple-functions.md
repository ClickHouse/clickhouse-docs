---
'description': 'Tuple函数文档'
'sidebar_label': '元组'
'sidebar_position': 180
'slug': '/sql-reference/functions/tuple-functions'
'title': 'Tuple Functions'
---



## tuple {#tuple}

一个允许将多个列进行分组的函数。对于类型为 T1, T2, ... 的列 C1, C2, ...，如果它们的名称是唯一的并且能够被视为未引用的标识符，则返回一个包含这些列的命名元组 Tuple(C1 T1, C2 T2, ...)；否则，返回元组 Tuple(T1, T2, ...)。执行该函数没有成本。元组通常用作 IN 操作符的参数的中间值，或者用于创建 lambda 函数的正式参数列表。元组不能写入表中。

该函数实现了操作符 `(x, y, ...)`。

**语法**

```sql
tuple(x, y, ...)
```

## tupleElement {#tupleelement}

一个允许从元组中获取列的函数。

如果第二个参数是数字 `index`，则它是从 1 开始的列索引。如果第二个参数是字符串 `name`，则表示元素的名称。此外，我们可以提供第三个可选参数，当索引超出范围或名称不存在时，默认值将返回而不是抛出异常。第二个和第三个参数（如果提供）必须是常量。执行该函数没有成本。

该函数实现了操作符 `x.index` 和 `x.name`。

**语法**

```sql
tupleElement(tuple, index, [, default_value])
tupleElement(tuple, name, [, default_value])
```

## untuple {#untuple}

在调用位置执行 [tuple](/sql-reference/data-types/tuple) 元素的语法替换。

结果列的名称是实现特定的并且可能会改变。请不要在 `untuple` 之后假设特定的列名称。

**语法**

```sql
untuple(x)
```

您可以使用 `EXCEPT` 表达式来跳过查询结果中的列。

**参数**

- `x` — 一个 `tuple` 函数、列或元素的元组。[Tuple](../data-types/tuple.md).

**返回值**

- 无。

**示例**

输入表：

```text
┌─key─┬─v1─┬─v2─┬─v3─┬─v4─┬─v5─┬─v6────────┐
│   1 │ 10 │ 20 │ 40 │ 30 │ 15 │ (33,'ab') │
│   2 │ 25 │ 65 │ 70 │ 40 │  6 │ (44,'cd') │
│   3 │ 57 │ 30 │ 20 │ 10 │  5 │ (55,'ef') │
│   4 │ 55 │ 12 │  7 │ 80 │ 90 │ (66,'gh') │
│   5 │ 30 │ 50 │ 70 │ 25 │ 55 │ (77,'kl') │
└─────┴────┴────┴────┴────┴────┴───────────┘
```

使用 `Tuple` 类型列作为 `untuple` 函数参数的示例：

查询：

```sql
SELECT untuple(v6) FROM kv;
```

结果：

```text
┌─_ut_1─┬─_ut_2─┐
│    33 │ ab    │
│    44 │ cd    │
│    55 │ ef    │
│    66 │ gh    │
│    77 │ kl    │
└───────┴───────┘
```

使用 `EXCEPT` 表达式的示例：

查询：

```sql
SELECT untuple((* EXCEPT (v2, v3),)) FROM kv;
```

结果：

```text
┌─key─┬─v1─┬─v4─┬─v5─┬─v6────────┐
│   1 │ 10 │ 30 │ 15 │ (33,'ab') │
│   2 │ 25 │ 40 │  6 │ (44,'cd') │
│   3 │ 57 │ 10 │  5 │ (55,'ef') │
│   4 │ 55 │ 80 │ 90 │ (66,'gh') │
│   5 │ 30 │ 25 │ 55 │ (77,'kl') │
└─────┴────┴────┴────┴───────────┘
```

**另见**

- [Tuple](../data-types/tuple.md)

## tupleHammingDistance {#tuplehammingdistance}

返回两个大小相同的元组之间的 [Hamming 距离](https://en.wikipedia.org/wiki/Hamming_distance)。

**语法**

```sql
tupleHammingDistance(tuple1, tuple2)
```

**参数**

- `tuple1` — 第一个元组。[Tuple](../data-types/tuple.md).
- `tuple2` — 第二个元组。[Tuple](../data-types/tuple.md).

元组的元素应具有相同的类型。

**返回值**

- Hamming 距离。

:::note
结果类型的计算与 [算术函数](../../sql-reference/functions/arithmetic-functions.md) 的计算方式相同，基于输入元组中的元素数量。
:::

```sql
SELECT
    toTypeName(tupleHammingDistance(tuple(0), tuple(0))) AS t1,
    toTypeName(tupleHammingDistance((0, 0), (0, 0))) AS t2,
    toTypeName(tupleHammingDistance((0, 0, 0), (0, 0, 0))) AS t3,
    toTypeName(tupleHammingDistance((0, 0, 0, 0), (0, 0, 0, 0))) AS t4,
    toTypeName(tupleHammingDistance((0, 0, 0, 0, 0), (0, 0, 0, 0, 0))) AS t5
```

```text
┌─t1────┬─t2─────┬─t3─────┬─t4─────┬─t5─────┐
│ UInt8 │ UInt16 │ UInt32 │ UInt64 │ UInt64 │
└───────┴────────┴────────┴────────┴────────┘
```

**示例**

查询：

```sql
SELECT tupleHammingDistance((1, 2, 3), (3, 2, 1)) AS HammingDistance;
```

结果：

```text
┌─HammingDistance─┐
│               2 │
└─────────────────┘
```

可与 [MinHash](../../sql-reference/functions/hash-functions.md#ngramminhash) 函数一起使用，以检测半重复字符串：

```sql
SELECT tupleHammingDistance(wordShingleMinHash(string), wordShingleMinHashCaseInsensitive(string)) AS HammingDistance
FROM (SELECT 'ClickHouse is a column-oriented database management system for online analytical processing of queries.' AS string);
```

结果：

```text
┌─HammingDistance─┐
│               2 │
└─────────────────┘
```

## tupleToNameValuePairs {#tupletonamevaluepairs}

将命名元组转换为 (name, value) 对数组。对于 `Tuple(a T, b T, ..., c T)` 返回 `Array(Tuple(String, T), ...)`，其中 `Strings` 代表元组的命名字段，而 `T` 是与这些名称关联的值。元组中的所有值应属于同一类型。

**语法**

```sql
tupleToNameValuePairs(tuple)
```

**参数**

- `tuple` — 命名元组。[Tuple](../data-types/tuple.md)，值类型可以是任何类型。

**返回值**

- 一个包含 (name, value) 对的数组。[Array](../data-types/array.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md), ...))。

**示例**

查询：

```sql
CREATE TABLE tupletest (col Tuple(user_ID UInt64, session_ID UInt64)) ENGINE = Memory;

INSERT INTO tupletest VALUES (tuple( 100, 2502)), (tuple(1,100));

SELECT tupleToNameValuePairs(col) FROM tupletest;
```

结果：

```text
┌─tupleToNameValuePairs(col)────────────┐
│ [('user_ID',100),('session_ID',2502)] │
│ [('user_ID',1),('session_ID',100)]    │
└───────────────────────────────────────┘
```

使用该函数可以将列转换为行：

```sql
CREATE TABLE tupletest (col Tuple(CPU Float64, Memory Float64, Disk Float64)) ENGINE = Memory;

INSERT INTO tupletest VALUES(tuple(3.3, 5.5, 6.6));

SELECT arrayJoin(tupleToNameValuePairs(col)) FROM tupletest;
```

结果：

```text
┌─arrayJoin(tupleToNameValuePairs(col))─┐
│ ('CPU',3.3)                           │
│ ('Memory',5.5)                        │
│ ('Disk',6.6)                          │
└───────────────────────────────────────┘
```

如果您将一个简单元组传递给该函数，ClickHouse 将使用值的索引作为它们的名称：

```sql
SELECT tupleToNameValuePairs(tuple(3, 2, 1));
```

结果：

```text
┌─tupleToNameValuePairs(tuple(3, 2, 1))─┐
│ [('1',3),('2',2),('3',1)]             │
└───────────────────────────────────────┘
```

## tupleNames {#tuplenames}

将元组转换为列名称数组。对于形式为 `Tuple(a T, b T, ...)` 的元组，它返回一个字符串数组，表示元组的命名列。如果元组元素没有显式名称，则将使用其索引作为列名称。

**语法**

```sql
tupleNames(tuple)
```

**参数**

- `tuple` — 命名元组。[Tuple](../../sql-reference/data-types/tuple.md) ，值类型可以是任何类型。

**返回值**

- 一个包含字符串的数组。

类型：[Array](../../sql-reference/data-types/array.md)([Tuple](../../sql-reference/data-types/tuple.md)([String](../../sql-reference/data-types/string.md), ...))。

**示例**

查询：

```sql
CREATE TABLE tupletest (col Tuple(user_ID UInt64, session_ID UInt64)) ENGINE = Memory;

INSERT INTO tupletest VALUES (tuple(1, 2));

SELECT tupleNames(col) FROM tupletest;
```

结果：

```text
┌─tupleNames(col)──────────┐
│ ['user_ID','session_ID'] │
└──────────────────────────┘
```

如果您将一个简单元组传递给该函数，ClickHouse 将使用列的索引作为它们的名称：

```sql
SELECT tupleNames(tuple(3, 2, 1));
```

结果：

```text
┌─tupleNames((3, 2, 1))─┐
│ ['1','2','3']         │
└───────────────────────┘
```

## tuplePlus {#tupleplus}

计算两个大小相同的元组的对应值的和。

**语法**

```sql
tuplePlus(tuple1, tuple2)
```

别名： `vectorSum`。

**参数**

- `tuple1` — 第一个元组。[Tuple](../data-types/tuple.md).
- `tuple2` — 第二个元组。[Tuple](../data-types/tuple.md).

**返回值**

- 和的元组。[Tuple](../data-types/tuple.md).

**示例**

查询：

```sql
SELECT tuplePlus((1, 2), (2, 3));
```

结果：

```text
┌─tuplePlus((1, 2), (2, 3))─┐
│ (3,5)                     │
└───────────────────────────┘
```

## tupleMinus {#tupleminus}

计算两个大小相同的元组的对应值的差。

**语法**

```sql
tupleMinus(tuple1, tuple2)
```

别名： `vectorDifference`。

**参数**

- `tuple1` — 第一个元组。[Tuple](../data-types/tuple.md).
- `tuple2` — 第二个元组。[Tuple](../data-types/tuple.md).

**返回值**

- 结果的元组。[Tuple](../data-types/tuple.md).

**示例**

查询：

```sql
SELECT tupleMinus((1, 2), (2, 3));
```

结果：

```text
┌─tupleMinus((1, 2), (2, 3))─┐
│ (-1,-1)                    │
└────────────────────────────┘
```

## tupleMultiply {#tuplemultiply}

计算两个大小相同的元组的对应值的乘积。

**语法**

```sql
tupleMultiply(tuple1, tuple2)
```

**参数**

- `tuple1` — 第一个元组。[Tuple](../data-types/tuple.md).
- `tuple2` — 第二个元组。[Tuple](../data-types/tuple.md).

**返回值**

- 乘积的元组。[Tuple](../data-types/tuple.md).

**示例**

查询：

```sql
SELECT tupleMultiply((1, 2), (2, 3));
```

结果：

```text
┌─tupleMultiply((1, 2), (2, 3))─┐
│ (2,6)                         │
└───────────────────────────────┘
```

## tupleDivide {#tupledivide}

计算两个大小相同的元组的对应值的除法。请注意，除以零将返回 `inf`。

**语法**

```sql
tupleDivide(tuple1, tuple2)
```

**参数**

- `tuple1` — 第一个元组。[Tuple](../data-types/tuple.md).
- `tuple2` — 第二个元组。[Tuple](../data-types/tuple.md).

**返回值**

- 结果的元组。[Tuple](../data-types/tuple.md).

**示例**

查询：

```sql
SELECT tupleDivide((1, 2), (2, 3));
```

结果：

```text
┌─tupleDivide((1, 2), (2, 3))─┐
│ (0.5,0.6666666666666666)    │
└─────────────────────────────┘
```

## tupleNegate {#tuplenegate}

计算元组值的否定。

**语法**

```sql
tupleNegate(tuple)
```

**参数**

- `tuple` — [Tuple](../data-types/tuple.md).

**返回值**

- 否定结果的元组。[Tuple](../data-types/tuple.md).

**示例**

查询：

```sql
SELECT tupleNegate((1,  2));
```

结果：

```text
┌─tupleNegate((1, 2))─┐
│ (-1,-2)             │
└─────────────────────┘
```

## tupleMultiplyByNumber {#tuplemultiplybynumber}

返回一个元组，其中所有值都乘以一个数字。

**语法**

```sql
tupleMultiplyByNumber(tuple, number)
```

**参数**

- `tuple` — [Tuple](../data-types/tuple.md).
- `number` — 乘数。[Int/UInt](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。

**返回值**

- 乘积值的元组。[Tuple](../data-types/tuple.md).

**示例**

查询：

```sql
SELECT tupleMultiplyByNumber((1, 2), -2.1);
```

结果：

```text
┌─tupleMultiplyByNumber((1, 2), -2.1)─┐
│ (-2.1,-4.2)                         │
└─────────────────────────────────────┘
```

## tupleDivideByNumber {#tupledividebynumber}

返回一个元组，其中所有值都除以一个数字。请注意，除以零将返回 `inf`。

**语法**

```sql
tupleDivideByNumber(tuple, number)
```

**参数**

- `tuple` — [Tuple](../data-types/tuple.md).
- `number` — 除数。[Int/UInt](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Decimal](../data-types/decimal.md)。

**返回值**

- 除以值的元组。[Tuple](../data-types/tuple.md).

**示例**

查询：

```sql
SELECT tupleDivideByNumber((1, 2), 0.5);
```

结果：

```text
┌─tupleDivideByNumber((1, 2), 0.5)─┐
│ (2,4)                            │
└──────────────────────────────────┘
```

## tupleConcat {#tupleconcat}

合并作为参数传递的元组。

```sql
tupleConcat(tuples)
```

**参数**

- `tuples` – 任意数量的 [Tuple](../data-types/tuple.md) 类型的参数。

**示例**

```sql
SELECT tupleConcat((1, 2), (3, 4), (true, false)) AS res
```

```text
┌─res──────────────────┐
│ (1,2,3,4,true,false) │
└──────────────────────┘
```

## tupleIntDiv {#tupleintdiv}

对一个元组的分子和一个元组的分母进行整数除法，并返回一个商的元组。

**语法**

```sql
tupleIntDiv(tuple_num, tuple_div)
```

**参数**

- `tuple_num`: 分子值的元组。[Tuple](../data-types/tuple) 的数值类型。
- `tuple_div`: 除数值的元组。[Tuple](../data-types/tuple) 的数值类型。

**返回值**

- `tuple_num` 和 `tuple_div` 的商的元组。[Tuple](../data-types/tuple) 的整数值。

**实现细节**

- 如果 `tuple_num` 或 `tuple_div` 中包含非整数值，那么结果是通过将每个非整数分子或除数四舍五入到最接近的整数来计算的。
- 将为除以 0 抛出错误。

**示例**

查询：

```sql
SELECT tupleIntDiv((15, 10, 5), (5, 5, 5));
```

结果：

```text
┌─tupleIntDiv((15, 10, 5), (5, 5, 5))─┐
│ (3,2,1)                             │
└─────────────────────────────────────┘
```

查询：

```sql
SELECT tupleIntDiv((15, 10, 5), (5.5, 5.5, 5.5));
```

结果：

```text
┌─tupleIntDiv((15, 10, 5), (5.5, 5.5, 5.5))─┐
│ (2,1,0)                                   │
└───────────────────────────────────────────┘
```

## tupleIntDivOrZero {#tupleintdivorzero}

像 [tupleIntDiv](#tupleintdiv) 一样，它对一个元组的分子和一个元组的分母进行整数除法，并返回一个商的元组。它在 0 除数的情况下不抛出错误，而是将商返回为 0。

**语法**

```sql
tupleIntDivOrZero(tuple_num, tuple_div)
```

- `tuple_num`: 分子值的元组。[Tuple](../data-types/tuple) 的数值类型。
- `tuple_div`: 除数值的元组。[Tuple](../data-types/tuple) 的数值类型。

**返回值**

- `tuple_num` 和 `tuple_div` 的商的元组。[Tuple](../data-types/tuple) 的整数值。
- 对于除数为 0 的商返回 0。

**实现细节**

- 如果 `tuple_num` 或 `tuple_div` 中包含非整数值，那么结果是通过将每个非整数分子或除数四舍五入到最接近的整数来计算的，类似于 [tupleIntDiv](#tupleintdiv)。

**示例**

查询：

```sql
SELECT tupleIntDivOrZero((5, 10, 15), (0, 0, 0));
```

结果：

```text
┌─tupleIntDivOrZero((5, 10, 15), (0, 0, 0))─┐
│ (0,0,0)                                   │
└───────────────────────────────────────────┘
```

## tupleIntDivByNumber {#tupleintdivbynumber}

对一个元组的分子进行整数除法，使用给定的分母，并返回一个商的元组。

**语法**

```sql
tupleIntDivByNumber(tuple_num, div)
```

**参数**

- `tuple_num`: 分子值的元组。[Tuple](../data-types/tuple) 的数值类型。
- `div`: 除数值。[Numeric](../data-types/int-uint.md) 类型。

**返回值**

- `tuple_num` 和 `div` 的商的元组。[Tuple](../data-types/tuple) 的整数值。

**实现细节**

- 如果 `tuple_num` 或 `div` 中包含非整数值，那么结果是通过将每个非整数分子或除数四舍五入到最接近的整数来计算的。
- 将为除以 0 抛出错误。

**示例**

查询：

```sql
SELECT tupleIntDivByNumber((15, 10, 5), 5);
```

结果：

```text
┌─tupleIntDivByNumber((15, 10, 5), 5)─┐
│ (3,2,1)                             │
└─────────────────────────────────────┘
```

查询：

```sql
SELECT tupleIntDivByNumber((15.2, 10.7, 5.5), 5.8);
```

结果：

```text
┌─tupleIntDivByNumber((15.2, 10.7, 5.5), 5.8)─┐
│ (2,1,0)                                     │
└─────────────────────────────────────────────┘
```

## tupleIntDivOrZeroByNumber {#tupleintdivorzerobynumber}

像 [tupleIntDivByNumber](#tupleintdivbynumber) 一样，对一个元组的分子进行整数除法，使用给定的分母，并返回一个商的元组。它在 0 除数的情况下不抛出错误，而是将商返回为 0。

**语法**

```sql
tupleIntDivOrZeroByNumber(tuple_num, div)
```

**参数**

- `tuple_num`: 分子值的元组。[Tuple](../data-types/tuple) 的数值类型。
- `div`: 除数值。[Numeric](../data-types/int-uint.md) 类型。

**返回值**

- `tuple_num` 和 `div` 的商的元组。[Tuple](../data-types/tuple) 的整数值。
- 对于除数为 0 的商返回 0。

**实现细节**

- 如果 `tuple_num` 或 `div` 中包含非整数值，那么结果是通过将每个非整数分子或除数四舍五入到最接近的整数来计算的，就像在 [tupleIntDivByNumber](#tupleintdivbynumber) 中一样。

**示例**

查询：

```sql
SELECT tupleIntDivOrZeroByNumber((15, 10, 5), 5);
```

结果：

```text
┌─tupleIntDivOrZeroByNumber((15, 10, 5), 5)─┐
│ (3,2,1)                                   │
└───────────────────────────────────────────┘
```

查询：

```sql
SELECT tupleIntDivOrZeroByNumber((15, 10, 5), 0)
```

结果：

```text
┌─tupleIntDivOrZeroByNumber((15, 10, 5), 0)─┐
│ (0,0,0)                                   │
└───────────────────────────────────────────┘
```

## tupleModulo {#tuplemodulo}

返回两个元组的除法操作的余数（模数）元组。

**语法**

```sql
tupleModulo(tuple_num, tuple_mod)
```

**参数**

- `tuple_num`: 分子值的元组。[Tuple](../data-types/tuple) 的数值类型。
- `tuple_div`: 模值的元组。[Tuple](../data-types/tuple) 的数值类型。

**返回值**

- `tuple_num` 和 `tuple_div` 的余数的元组。[Tuple](../data-types/tuple) 的非零整数值。
- 对于除以零将抛出错误。

**示例**

查询：

```sql
SELECT tupleModulo((15, 10, 5), (5, 3, 2));
```

结果：

```text
┌─tupleModulo((15, 10, 5), (5, 3, 2))─┐
│ (0,1,1)                             │
└─────────────────────────────────────┘
```

## tupleModuloByNumber {#tuplemodulobynumber}

返回一个元组的除法操作的余数（模数）和一个给定除数的元组。

**语法**

```sql
tupleModuloByNumber(tuple_num, div)
```

**参数**

- `tuple_num`: 分子值的元组。[Tuple](../data-types/tuple) 的数值类型。
- `div`: 除数值。[Numeric](../data-types/int-uint.md) 类型。

**返回值**

- `tuple_num` 和 `div` 的余数的元组。[Tuple](../data-types/tuple) 的非零整数值。
- 对于除以零将抛出错误。

**示例**

查询：

```sql
SELECT tupleModuloByNumber((15, 10, 5), 2);
```

结果：

```text
┌─tupleModuloByNumber((15, 10, 5), 2)─┐
│ (1,0,1)                             │
└─────────────────────────────────────┘
```

## flattenTuple {#flattentuple}

从嵌套命名的 `input` 元组返回扁平化的 `output` 元组。 `output` 元组的元素为原始 `input` 元组中的路径。例如： `Tuple(a Int, Tuple(b Int, c Int)) -> Tuple(a Int, b Int, c Int)`。 `flattenTuple` 可用于选择类型为 `Object` 的所有路径作为单独的列。

**语法**

```sql
flattenTuple(input)
```

**参数**

- `input`: 要扁平化的嵌套命名元组。[Tuple](../data-types/tuple).

**返回值**

- `output` 元组，其元素是来自原始 `input` 的路径。[Tuple](../data-types/tuple).

**示例**

查询：

```sql
CREATE TABLE t_flatten_tuple(t Tuple(t1 Nested(a UInt32, s String), b UInt32, t2 Tuple(k String, v UInt32))) ENGINE = Memory;
INSERT INTO t_flatten_tuple VALUES (([(1, 'a'), (2, 'b')], 3, ('c', 4)));
SELECT flattenTuple(t) FROM t_flatten_tuple;
```

结果：

```text
┌─flattenTuple(t)───────────┐
│ ([1,2],['a','b'],3,'c',4) │
└───────────────────────────┘
```

## 距离函数 {#distance-functions}

所有支持的函数在 [距离函数文档](../../sql-reference/functions/distance-functions.md) 中描述。
