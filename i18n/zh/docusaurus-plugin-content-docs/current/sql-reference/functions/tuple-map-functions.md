---
description: 'Tuple Map 函数文档'
sidebar_label: 'Map'
slug: /sql-reference/functions/tuple-map-functions
title: 'Map 函数'
doc_type: '参考'
---

## map {#map}

从键值对构造一个类型为 [Map(key, value)](../data-types/map.md) 的值。

**语法**

```sql
map(key1, value1[, key2, value2, ...])
```

**参数**

* `key_n` — map 条目的键。任意 Map 支持的键类型。([Map](../data-types/map.md))
* `value_n` — map 条目的值。任意 Map 支持的值类型。([Map](../data-types/map.md))

**返回值**

* 一个包含 `key:value` 键值对的 map。[Map(key, value)](../data-types/map.md)。

**示例**

查询：

```sql
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3);
```

结果：

```text
┌─map('key1', number, 'key2', multiply(number, 2))─┐
│ {'key1':0,'key2':0}                              │
│ {'key1':1,'key2':2}                              │
│ {'key1':2,'key2':4}                              │
└──────────────────────────────────────────────────┘
```

## mapFromArrays {#mapfromarrays}

从键的数组或 map 与值的数组或 map 构造一个 map。

该函数是语法 `CAST([...], 'Map(key_type, value_type)')` 的便捷替代方案。
例如，与其编写

* `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`，或
* `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

可以写作 `mapFromArrays(['aa', 'bb'], [4, 5])`。

**语法**

```sql
mapFromArrays(keys, values)
```

别名：`MAP_FROM_ARRAYS(keys, values)`

**参数**

* `keys` — 用于创建 map 的键的数组或 map，类型为 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。如果 `keys` 是数组，我们接受其类型为 `Array(Nullable(T))` 或 `Array(LowCardinality(Nullable(T)))`，只要其中不包含 NULL 值即可。
* `values`  - 用于创建 map 的值的数组或 map，类型为 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。

**返回值**

* 一个 map，其中的键和值由键数组和值数组或 map 构造而成。

**示例**

查询：

```sql
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

结果：

```response
┌─mapFromArrays(['a', 'b', 'c'], [1, 2, 3])─┐
│ {'a':1,'b':2,'c':3}                       │
└───────────────────────────────────────────┘
```

`mapFromArrays` 也接受类型为 [Map](../data-types/map.md) 的参数。在执行期间，这些参数会被转换为元组数组。

```sql
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

结果：

```response
┌─mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))─┐
│ {1:('a',1),2:('b',2),3:('c',3)}                       │
└───────────────────────────────────────────────────────┘
```

```sql
SELECT mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])
```

结果：

```response
┌─mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])─┐
│ {('a',1):1,('b',2):2,('c',3):3}                       │
└───────────────────────────────────────────────────────┘
```

## extractKeyValuePairs {#extractkeyvaluepairs}

将一个由键值对组成的字符串转换为 [Map(String, String)](../data-types/map.md)。
解析过程对噪声具有一定的容错能力（例如日志文件）。
输入字符串中的键值对由一个键、紧随其后的键值分隔符以及一个值组成。
各个键值对之间由键值对分隔符分隔。
键和值都可以带引号。

**语法**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

别名：

* `str_to_map`
* `mapFromString`

**参数**

* `data` - 要从中提取键值对的字符串。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
* `key_value_delimiter` - 用于分隔键和值的单个字符。默认值为 `:`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
* `pair_delimiters` - 用于分隔各个键值对的字符集合。默认值为 ` `、`,` 和 `;`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
* `quoting_character` - 用作引用字符的单个字符。默认值为 `"`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
* `unexpected_quoting_character_strategy` - 在 `read_key` 和 `read_value` 阶段处理在意外位置出现的引用字符的策略。可选值：&quot;invalid&quot;、&quot;accept&quot; 和 &quot;promote&quot;。invalid 将丢弃键/值并回到 `WAITING_KEY` 状态；accept 将把它当作普通字符处理；promote 将切换到 `READ_QUOTED_{KEY/VALUE}` 状态，并从下一个字符开始。

**返回值**

* 键值对的 Map。类型：[Map(String, String)](../data-types/map.md)

**示例**

查询

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') AS kv
```

结果：

```Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

使用单引号 `'` 作为引号：

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

结果：

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy 示例:

unexpected&#95;quoting&#95;character&#95;strategy=invalid

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'INVALID') AS kv;
```

```text
┌─kv────────────────┐
│ {'abc':'5'}  │
└───────────────────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'INVALID') AS kv;
```

```text
┌─kv──┐
│ {}  │
└─────┘
```

unexpected&#95;quoting&#95;character&#95;strategy=accept

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'ACCEPT') AS kv;
```

```text
┌─kv────────────────┐
│ {'name"abc':'5'}  │
└───────────────────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'ACCEPT') AS kv;
```

```text
┌─kv─────────────────┐
│ {'name"abc"':'5'}  │
└────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy=promote

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'PROMOTE') AS kv;
```

```text
┌─kv──┐
│ {}  │
└─────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'PROMOTE') AS kv;
```

```text
┌─kv───────────┐
│ {'abc':'5'}  │
└──────────────┘
```

在不支持转义序列的环境中的转义序列：

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

结果：

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

要还原使用 `toString` 序列化的、以字符串为键的 map 键值对：

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) AS map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

结果：

```response
第 1 行:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

与 `extractKeyValuePairs` 相同，但支持转义。

支持的转义序列：`\x`、`\N`、`\a`、`\b`、`\e`、`\f`、`\n`、`\r`、`\t`、`\v` 和 `\0`。
非标准转义序列会原样返回（包括反斜杠），除非它们是下列之一：
`\\`、`'`、`"`、`backtick`、`/`、`=` 或 ASCII 控制字符（c &lt;= 31）。

当预转义和后转义都不适用时，可以使用此函数。例如，考虑如下输入字符串：`a: "aaaa\"bbb"`。期望输出为：`a: aaaa\"bbbb`。

* 预转义：预转义之后的输出为：`a: "aaaa"bbb"`，然后 `extractKeyValuePairs` 会输出：`a: aaaa`
* 后转义：`extractKeyValuePairs` 会输出 `a: aaaa\`，而后转义会保持其不变。

在 key 中，前导转义序列会被忽略；在 value 中，它们将被视为无效。

**示例**

启用转义序列支持时的转义序列示例：

```sql
SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv
```

结果：

```response
┌─kv────────────────┐
│ {'age':'a\n\n\0'} │
└───────────────────┘
```

## mapAdd {#mapadd}

收集所有键并对其对应的值求和。

**语法**

```sql
mapAdd(arg1, arg2 [, ...])
```

**参数**

参数是由两个[数组](/sql-reference/data-types/array)组成的[map](../data-types/map.md)或[tuple](/sql-reference/data-types/tuple)，其中第一个数组中的元素表示键，第二个数组中包含每个键对应的值。所有键数组的类型必须相同，且所有值数组应包含可以统一提升为同一类型（[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float)）的元素。该统一提升后的类型将作为结果数组的元素类型。

**返回值**

* 根据参数返回一个[map](../data-types/map.md)或[tuple](/sql-reference/data-types/tuple)，其中第一个数组包含排序后的键，第二个数组包含对应的值。

**示例**

使用 `Map` 类型的查询：

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

结果：

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

使用元组的查询：

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) AS res, toTypeName(res) AS type;
```

结果：

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```

## mapSubtract {#mapsubtract}

收集所有键并将对应的值相减。

**语法**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**参数**

参数为由两个[数组](/sql-reference/data-types/array)组成的[map](../data-types/map.md)或[tuple](/sql-reference/data-types/tuple)，第一个数组中的元素表示键，第二个数组中包含每个键对应的值。所有键数组必须具有相同的类型，所有值数组中的元素必须都能提升为同一种类型（[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float)）。该统一提升后的类型将作为结果数组的类型。

**返回值**

* 根据参数返回一个[map](../data-types/map.md)或[tuple](/sql-reference/data-types/tuple)，其中第一个数组包含排序后的键，第二个数组包含对应的值。

**示例**

使用 `Map` 类型的查询：

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

结果：

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

包含元组映射的查询：

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

结果：

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

使用整数键为 `map` 中缺失的键值对填充数据。
为了支持将键扩展到当前最大值之外的范围，可以指定一个最大键。
更具体地说，该函数返回一个 `map`，其中键从最小键到最大键（或指定的 `max` 参数）构成步长为 1 的序列，并带有相应的值。
如果某个键没有指定值，则使用默认值作为对应的值。
如果键有重复，只会将第一个值（按照出现顺序）与该键关联。

**Syntax**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

对于数组参数，`keys` 和 `values` 中的元素数量在每一行中必须相同。

**参数**

参数可以是 [Map](../data-types/map.md) 或两个 [Array](/sql-reference/data-types/array)，其中第一个数组为键，第二个数组为对应的值。

映射数组：

* `map` — 具有整数键的 Map。[Map](../data-types/map.md)。

或者

* `keys` — 键的数组。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
* `values` — 值的数组。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
* `max` — 最大键值。可选。[Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

* 根据传入的参数，返回一个 [Map](../data-types/map.md) 或一个由两个 [Array](/sql-reference/data-types/array) 组成的 [Tuple](/sql-reference/data-types/tuple)：按排序顺序排列的键，以及与这些键对应的值。

**示例**

使用 `Map` 类型的查询：

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

结果：

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

对映射数组的查询：

```sql
SELECT mapPopulateSeries([1,2,4], [11,22,44], 5) AS res, toTypeName(res) AS type;
```

结果：

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```

## mapKeys {#mapkeys}

返回给定 map 的所有键。

通过启用 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 这一设置，可以对该函数进行优化。
启用该设置后，函数只会读取 [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列，而不是整个 map。
查询 `SELECT mapKeys(m) FROM table` 会被重写为 `SELECT m.keys FROM table`。

**语法**

```sql
mapKeys(map)
```

**参数**

* `map` — Map 类型。[Map](../data-types/map.md)。

**返回值**

* 包含 `map` 中所有键的数组。[Array](../data-types/array.md)。

**示例**

查询：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapKeys(a) FROM tab;
```

结果：

```text
┌─mapKeys(a)────────────┐
│ ['name','age']        │
│ ['number','position'] │
└───────────────────────┘
```

## mapContains {#mapcontains}

返回一个布尔值，用于表示给定的 `map` 中是否包含指定的键。

**语法**

```sql
mapContains(map, key)
```

Alias: `mapContainsKey(map, key)`

**参数**

* `map` — Map 映射类型。参见 [Map](../data-types/map.md)。
* `key` — 键。类型必须与 `map` 的键类型匹配。

**返回值**

* 如果 `map` 中包含 `key`，则返回 `1`，否则返回 `0`。参见 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContains(a, 'name') FROM tab;

```

结果：

```text
┌─mapContains(a, 'name')─┐
│                      1 │
│                      0 │
└────────────────────────┘
```

## mapContainsKeyLike {#mapcontainskeylike}

**语法**

```sql
mapContainsKeyLike(map, pattern)
```

**参数**

* `map` — Map 类型。[Map](../data-types/map.md)。
* `pattern`  - 要匹配的字符串模式。

**返回值**

* 如果 `map` 中包含符合指定模式的键，则返回 `1`，否则返回 `0`。

**示例**

查询：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

结果：

```text
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```

## mapExtractKeyLike {#mapextractkeylike}

给定一个具有字符串键的 `map` 以及一个 LIKE 模式，此函数返回一个仅包含其键匹配该模式元素的 `map`。

**语法**

```sql
mapExtractKeyLike(map, pattern)
```

**参数**

* `map` — Map。[Map](../data-types/map.md)。
* `pattern`  - 要匹配的字符串模式。

**返回值**

* 一个 Map，包含键与指定模式匹配的元素。如果没有元素匹配该模式，则返回空 Map。

**示例**

查询：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

结果：

```text
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```

## mapValues {#mapvalues}

返回给定 map 的所有值。

通过启用 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置，可以对该函数进行优化。
启用该设置后，函数只会读取 [values](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列，而不是整个 map。
查询 `SELECT mapValues(m) FROM table` 会被转换为 `SELECT m.values FROM table`。

**语法**

```sql
mapValues(map)
```

**参数**

* `map` — Map 类型。[Map](../data-types/map.md)。

**返回值**

* 包含 `map` 中所有值的数组。[Array](../data-types/array.md)。

**示例**

查询：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapValues(a) FROM tab;
```

结果：

```text
┌─mapValues(a)─────┐
│ ['eleven','11']  │
│ ['twelve','6.0'] │
└──────────────────┘
```

## mapContainsValue {#mapcontainsvalue}

返回给定的 `key` 是否存在于给定的 `map` 中。

**语法**

```sql
mapContainsValue(map, value)
```

别名：`mapContainsValue(map, value)`

**参数**

* `map` — Map。[Map](../data-types/map.md)。
* `value` — 值。类型必须与 `map` 的值类型相匹配。

**返回值**

* 若 `map` 包含 `value`，则为 `1`，否则为 `0`。[UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContainsValue(a, '11') FROM tab;

```

结果：

```text
┌─mapContainsValue(a, '11')─┐
│                         1 │
│                         0 │
└───────────────────────────┘
```

## mapContainsValueLike {#mapcontainsvaluelike}

**语法**

```sql
mapContainsValueLike(map, pattern)
```

**参数**

* `map` — Map。[Map](../data-types/map.md)。
* `pattern`  - 用于匹配的字符串模式。

**返回值**

* 如果 `map` 中包含符合指定模式的 `value`，则返回 `1`，否则返回 `0`。

**示例**

查询：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

结果：

```text
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```

## mapExtractValueLike {#mapextractvaluelike}

给定一个值为字符串的 map 和一个 LIKE 模式，该函数返回一个仅包含其值匹配该模式的元素的 map。

**语法**

```sql
mapExtractValueLike(map, pattern)
```

**参数**

* `map` — Map 类型。[Map](../data-types/map.md)。
* `pattern`  - 要匹配的字符串模式。

**返回值**

* 一个包含其值匹配指定模式的元素的 Map。如果没有元素匹配该模式，则返回空 Map。

**示例**

查询：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

结果：

```text
┌─mapExtractValueLike(a, 'a%')─┐
│ {'abc':'abc'}                │
│ {}                           │
└──────────────────────────────┘
```

## mapApply {#mapapply}

将一个函数应用于 `map` 的每个元素。

**语法**

```sql
mapApply(func, map)
```

**参数**

* `func` — [Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
* `map` — [Map](../data-types/map.md)。

**返回值**

* 返回一个 `map`，通过对原始 `map` 中每个元素应用 `func(map1[i], ..., mapN[i])` 得到。

**示例**

查询：

```sql
SELECT mapApply((k, v) -> (k, v * 10), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

结果：

```text
┌─r─────────────────────┐
│ {'key1':0,'key2':0}   │
│ {'key1':10,'key2':20} │
│ {'key1':20,'key2':40} │
└───────────────────────┘
```

## mapFilter {#mapfilter}

通过对 map 中的每个元素应用函数来过滤 map。

**语法**

```sql
mapFilter(func, map)
```

**参数**

* `func`  - [Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
* `map` — [Map](../data-types/map.md)。

**返回值**

* 返回一个 map，其中仅包含 `map` 中那些使 `func(map1[i], ..., mapN[i])` 返回非 0 值的元素。

**示例**

查询：

```sql
SELECT mapFilter((k, v) -> ((v % 2) = 0), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

结果：

```text
┌─r───────────────────┐
│ {'key1':0,'key2':0} │
│ {'key2':2}          │
│ {'key1':2,'key2':4} │
└─────────────────────┘
```

## mapUpdate {#mapupdate}

**语法**

```sql
mapUpdate(map1, map2)
```

**参数**

* `map1` [Map](../data-types/map.md)。
* `map2` [Map](../data-types/map.md)。

**返回值**

* 返回 `map1`，其值根据 `map2` 中对应键的值进行了更新。

**示例**

查询：

```sql
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10)) AS map;
```

结果：

```text
┌─map────────────────────────────┐
│ {'key3':0,'key1':10,'key2':10} │
└────────────────────────────────┘
```

## mapConcat {#mapconcat}

根据键是否相同来合并多个 `map`。
如果在多个输入 `map` 中存在具有相同键的元素，则所有元素都会被添加到结果 `map` 中，但通过操作符 `[]` 只能访问第一个元素。

**Syntax**

```sql
mapConcat(maps)
```

**参数**

* `maps` – 任意数量的 [Maps](../data-types/map.md)。

**返回值**

* 返回一个 map，它是对作为参数传入的多个 map 进行连接得到的结果。

**示例**

查询：

```sql
SELECT mapConcat(map('key1', 1, 'key3', 3), map('key2', 2)) AS map;
```

结果：

```text
┌─map──────────────────────────┐
│ {'key1':1,'key3':3,'key2':2} │
└──────────────────────────────┘
```

查询：

```sql
SELECT mapConcat(map('key1', 1, 'key2', 2), map('key1', 3)) AS map, map['key1'];
```

结果：

```text
┌─map──────────────────────────┬─elem─┐
│ {'key1':1,'key2':2,'key1':3} │    1 │
└──────────────────────────────┴──────┘
```

## mapExists([func,], map) {#mapexistsfunc-map}

如果在 `map` 中存在至少一组键值对，使得 `func(key, value)` 的返回值不为 0，则返回 1，否则返回 0。

:::note
`mapExists` 是一个[高阶函数](/sql-reference/functions/overview#higher-order-functions)。
可以将一个 lambda 函数作为第一个参数传入。
:::

**示例**

查询：

```sql
SELECT mapExists((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

结果：

```response
┌─res─┐
│   1 │
└─────┘
```

## mapAll([func,] map) {#mapallfunc-map}

如果对 `map` 中所有键值对调用 `func(key, value)` 的结果都不为 0，则返回 1，否则返回 0。

:::note
请注意，`mapAll` 是一个[高阶函数](/sql-reference/functions/overview#higher-order-functions)。
可以将一个 lambda 函数作为第一个参数传递给它。
:::

**示例**

查询：

```sql
SELECT mapAll((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

结果：

```response
┌─res─┐
│   0 │
└─────┘
```

## mapSort([func,], map) {#mapsortfunc-map}

将 map 中的元素按升序排序。
如果指定了 `func` 函数，则排序顺序由 `func` 应用于 map 的键和值后得到的结果来决定。

**示例**

```sql
SELECT mapSort(map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key1':3,'key2':2,'key3':1} │
└──────────────────────────────┘
```

```sql
SELECT mapSort((k, v) -> v, map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key3':1,'key2':2,'key1':3} │
└──────────────────────────────┘
```

更多详情请参阅 [`arraySort` 函数的参考文档](/sql-reference/functions/array-functions#arraySort)。

## mapPartialSort {#mappartialsort}

按升序对 map 的元素进行排序，并通过额外的 `limit` 参数实现部分排序。
如果指定了 `func` 函数，则排序顺序由将 `func` 函数应用于 map 的键和值所得结果来决定。

**语法**

```sql
mapPartialSort([func,] limit, map)
```

**参数**

* `func` – 可选函数，应用于 map 的键和值。[Lambda function](/sql-reference/functions/overview#higher-order-functions)。
* `limit` – 区间 [1..limit] 内的元素会被排序。[(U)Int](../data-types/int-uint.md)。
* `map` – 要排序的 map。[Map](../data-types/map.md)。

**返回值**

* 部分排序后的 map。[Map](../data-types/map.md)。

**示例**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```

## mapReverseSort([func,], map) {#mapreversesortfunc-map}

按降序对 map 中的元素进行排序。
如果指定了 `func` 函数，则根据将 `func` 函数应用到 map 的键和值后得到的结果来确定排序顺序。

**示例**

```sql
SELECT mapReverseSort(map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key3':1,'key2':2,'key1':3} │
└──────────────────────────────┘
```

```sql
SELECT mapReverseSort((k, v) -> v, map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key1':3,'key2':2,'key3':1} │
└──────────────────────────────┘
```

更多详细信息请参阅 [arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort) 函数。

## mapPartialReverseSort {#mappartialreversesort}

对 map 中的元素按降序排序，并带有额外的 `limit` 参数，用于执行部分排序。
如果指定了 `func` 函数，排序顺序根据将 `func` 函数应用到 map 的键和值所得的结果来确定。

**语法**

```sql
mapPartialReverseSort([func,] limit, map)
```

**参数**

* `func` – 可选，用于作用于 map 的键和值的函数。[Lambda function](/sql-reference/functions/overview#higher-order-functions)。
* `limit` – 范围为 [1..limit] 的元素会被排序。[(U)Int](../data-types/int-uint.md)。
* `map` – 要排序的 Map。[Map](../data-types/map.md)。

**返回值**

* 部分排序的 Map。[Map](../data-types/map.md)。

**示例**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

{/* 
  以下标签内的内容会在文档框架构建期间被替换为
  由 system.functions 生成的文档。请不要修改或删除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

## extractKeyValuePairs {#extractKeyValuePairs}

引入版本：v

从任意字符串中提取键值对。该字符串不需要完全符合键值对格式。

它可以包含噪声（例如日志文件）。需要通过函数参数指定要解析的键值对格式。

一个键值对由键、紧随其后的 `key_value_delimiter` 以及一个值组成。也支持带引号的键和值。键值对之间必须由键值对分隔符分隔。

**语法**

```sql
            extractKeyValuePairs(data, [key_value_delimiter], [pair_delimiter], [quoting_character])
```

**参数**

* `data` - 要从中提取键值对的字符串。[String](../../sql-reference/data-types/string.md) 或 [FixedString](../../sql-reference/data-types/fixedstring.md)。
  * `key_value_delimiter` - 用作键与值之间分隔符的字符。默认值为 `:`。[String](../../sql-reference/data-types/string.md) 或 [FixedString](../../sql-reference/data-types/fixedstring.md)。
  * `pair_delimiters` - 用作各键值对之间分隔符的字符集合。默认值为 `\space`、`,` 和 `;`。[String](../../sql-reference/data-types/string.md) 或 [FixedString](../../sql-reference/data-types/fixedstring.md)。
  * `quoting_character` - 用作引用符号的字符。默认值为 `&quot;。[String](../../sql-reference/data-types/string.md) 或 [FixedString](../../sql-reference/data-types/fixedstring.md)。
  * `unexpected_quoting_character_strategy` - 在 `read_key` 和 `read_value` 阶段处理出现在非预期位置的引用符号的策略。可选值：`invalid`、`accept` 和 `promote`。`invalid` 会丢弃键/值并切换回 `WAITING_KEY` 状态；`accept` 会将其视为普通字符；`promote` 会切换到 `READ_QUOTED_{KEY/VALUE}` 状态并从下一个字符开始。默认值为 `INVALID`。

**返回值**

* 以 Map(String, String) 形式返回提取出的键值对。

**示例**

查询：

**简单示例**

```sql
            arthur :) select extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv

            SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv

            查询 id: f9e0ca6f-3178-4ee2-aa2c-a5517abb9cee

            ┌─kv──────────────────────────────────────────────────────────────────────┐
            │ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
            └─────────────────────────────────────────────────────────────────────────┘
```

**将单引号用作引号字符**

```sql
            arthur :) select extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv

            SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv

            Query id: 0e22bf6b-9844-414a-99dc-32bf647abd5e

            ┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
            │ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
            └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy 示例:

unexpected&#95;quoting&#95;character&#95;strategy=invalid

```sql
            SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'INVALID') as kv;
```

```text
            ┌─kv────────────────┐
            │ {'abc':'5'}  │
            └───────────────────┘
```

```sql
            SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'INVALID') as kv;
```

```text
            ┌─kv──┐
            │ {}  │
            └─────┘
```

unexpected&#95;quoting&#95;character&#95;strategy=accept

```sql
            SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'ACCEPT') as kv;
```

```text
            ┌─kv────────────────┐
            │ {'name"abc':'5'}  │
            └───────────────────┘
```

```sql
            SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'ACCEPT') as kv;
```

```text
            ┌─kv─────────────────┐
            │ {'name"abc"':'5'}  │
            └────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy=promote

```sql
            SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'PROMOTE') as kv;
```

```text
            ┌─kv──┐
            │ {}  │
            └─────┘
```

```sql
            SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'PROMOTE') as kv;
```

```text
            ┌─kv───────────┐
            │ {'abc':'5'}  │
            └──────────────┘
```

**不支持转义序列时的转义序列**

```sql
            arthur :) select extractKeyValuePairs('age:a\\x0A\\n\\0') as kv

            SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv

            Query id: e9fd26ee-b41f-4a11-b17f-25af6fd5d356

            ┌─kv────────────────────┐
            │ {'age':'a\\x0A\\n\\0'} │
            └───────────────────────┘
```

**语法**

```sql
```

**别名**: `str_to_map`, `mapFromString`

**参数**

* 无。

**返回值**

**示例**

## extractKeyValuePairsWithEscaping {#extractKeyValuePairsWithEscaping}

引入版本: v

与 `extractKeyValuePairs` 相同,但支持转义。

支持的转义序列:`\x`、`\N`、`\a`、`\b`、`\e`、`\f`、`\n`、`\r`、`\t`、`\v` 和 `\0`。
非标准转义序列将按原样返回(包括反斜杠),除非它们是以下字符之一:
`\\`、`'`、`"`、`backtick`、`/`、`=` 或 ASCII 控制字符(`c <= 31`)。

此函数适用于预转义和后转义都不适用的场景。例如,考虑以下输入字符串:`a: "aaaa\"bbb"`。预期输出为:`a: aaaa\"bbbb`。

* 预转义:预转义后将输出:`a: "aaaa"bbb"`,然后 `extractKeyValuePairs` 将输出:`a: aaaa`
  * 后转义:`extractKeyValuePairs` 将输出 `a: aaaa\`,后转义将保持不变。

键中的前导转义序列将被跳过,值中的前导转义序列将被视为无效。

**启用转义序列支持的转义序列**

```sql
            arthur :) select extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') as kv

            SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv

            Query id: 44c114f0-5658-4c75-ab87-4574de3a1645

            ┌─kv───────────────┐
            │ {'age':'a\n\n\0'} │
            └──────────────────┘
```

**语法**

```sql
```

**参数**

* 无

**返回值**

**示例**

## map {#map}

引入版本：v21.1

从键值对创建一个类型为 `Map(key, value)` 的值。

**语法**

```sql
map(key1, value1[, key2, value2, ...])
```

**参数**

* `key_n` — Map 条目的键。[`Any`](/sql-reference/data-types)
* `value_n` — Map 条目的值。[`Any`](/sql-reference/data-types)

**返回值**

返回一个包含键值对的 Map。[`Map(Any, Any)`](/sql-reference/data-types/map)

**示例**

**用法示例**

```sql title=Query
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3)
```

```response title=Response
{'key1':0,'key2':0}
{'key1':1,'key2':2}
{'key1':2,'key2':4}
```

## mapAdd {#mapAdd}

在 v20.7 中引入

收集所有键并对相应的值求和。

**语法**

```sql
mapAdd(arg1[, arg2, ...])
```

**参数**

* `arg1[, arg2, ...]` — `Map` 类型或由两个数组组成的元组，其中第一个数组中的元素表示键，第二个数组包含每个键对应的值。[`Map(K, V)`](/sql-reference/data-types/map) 或 [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**返回值**

返回一个 `Map` 或元组，其中第一个数组包含已排序的键，第二个数组包含对应的值。[`Map(K, V)`](/sql-reference/data-types/map) 或 [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**示例**

**使用 Map 类型**

```sql title=Query
SELECT mapAdd(map(1, 1), map(1, 1))
```

```response title=Response
{1:2}
```

**使用元组**

```sql title=Query
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1]))
```

```response title=Response
([1, 2], [2, 2])
```

## mapAll {#mapAll}

引入版本：v23.4

判断某个条件是否对 map 中的所有键值对都成立。
`mapAll` 是一个高阶函数。
你可以将一个 lambda 函数作为第一个参数传递给它。

**语法**

```sql
mapAll([func,] map)
```

**参数**

* `func` — Lambda 函数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — 要检查的映射（Map）。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

如果所有键值对都满足条件，则返回 `1`，否则返回 `0`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT mapAll((k, v) -> v = 1, map('k1', 1, 'k2', 2))
```

```response title=Response
0
```

## mapApply {#mapApply}

引入于：v22.3 版本

将一个函数应用于 map 中的每个元素。

**语法**

```sql
mapApply(func, map)
```

**参数**

* `func` — Lambda 函数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — 要应用函数的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

返回一个新的 Map，通过对原始 Map 的每个元素应用 `func` 得到。[`Map(K, V)`](/sql-reference/data-types/map)

**示例**

**用法示例**

```sql title=Query
SELECT mapApply((k, v) -> (k, v * 2), map('k1', 1, 'k2', 2))
```

```response title=Response
{'k1':2,'k2':4}
```

## mapConcat {#mapConcat}

首次引入版本：v23.4

根据键是否相等来连接多个 map。
如果多个输入 map 中存在相同键的元素，所有这些元素都会被添加到结果 map 中，但通过 `[]` 运算符只能访问到第一个元素。

**语法**

```sql
mapConcat(maps)
```

**参数**

* `maps` — 任意数量的 `Map`。[`Map`](/sql-reference/data-types/map)

**返回值**

返回一个 `Map`，其中包含作为参数传入的所有 `Map` 的合并结果。[`Map`](/sql-reference/data-types/map)

**示例**

**用法示例**

```sql title=Query
SELECT mapConcat(map('k1', 'v1'), map('k2', 'v2'))
```

```response title=Response
{'k1':'v1','k2':'v2'}
```

## mapContainsKey {#mapContainsKey}

引入版本：v21.2

判断 `map` 中是否包含某个键。

**语法**

```sql
mapContains(map, key)
```

**别名**：`mapContains`

**参数**

* `map` — 要搜索的 Map。[`Map(K, V)`](/sql-reference/data-types/map)
* `key` — 要搜索的键。类型必须与该 Map 的键类型匹配。[`Any`](/sql-reference/data-types)

**返回值**

如果 Map 中包含该键，则返回 1，否则返回 0。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT mapContainsKey(map('k1', 'v1', 'k2', 'v2'), 'k1')
```

```response title=Response
1
```

## mapContainsKeyLike {#mapContainsKeyLike}

引入版本：v23.4

检查 `map` 中是否存在与指定模式通过 `LIKE` 匹配的键。

**语法**

```sql
mapContainsKeyLike(map, pattern)
```

**参数**

* `map` — 要搜索的映射。[`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — 用于匹配键的模式。[`const String`](/sql-reference/data-types/string)

**返回值**

如果 `map` 中包含与 `pattern` 匹配的键，则返回 `1`，否则返回 `0`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```

## mapContainsValue {#mapContainsValue}

引入版本：v25.6

用于判断某个值是否存在于 map 中。

**语法**

```sql
mapContainsValue(map, value)
```

**参数**

* `map` — 要在其中查找的 Map。[`Map(K, V)`](/sql-reference/data-types/map)
* `value` — 要查找的值。其类型必须与 map 的值类型匹配。[`Any`](/sql-reference/data-types)

**返回值**

如果 map 中包含该值则返回 `1`，否则返回 `0`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT mapContainsValue(map('k1', 'v1', 'k2', 'v2'), 'v1')
```

```response title=Response
1
```

## mapContainsValueLike {#mapContainsValueLike}

自 v25.5 引入

检查 map 中是否存在符合指定 `LIKE` 模式的值。

**语法**

```sql
mapContainsValueLike(map, pattern)
```

**参数**

* `map` — 要搜索的 Map。[`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — 用于匹配 `map` 中值的模式。[`const String`](/sql-reference/data-types/string)

**返回值**

如果 `map` 中包含与 `pattern` 匹配的值，则返回 `1`，否则返回 `0`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```

## mapExists {#mapExists}

引入版本：v23.4

用于判断在一个 map 中是否存在至少一对键值对满足指定条件。
`mapExists` 是一个高阶函数。
你可以将一个 lambda 函数作为第一个参数传递给它。

**语法**

```sql
mapExists([func,] map)
```

**参数**

* `func` — 可选。Lambda 函数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — 要检查的 Map 类型值。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

如果至少有一个键值对满足条件，则返回 `1`，否则返回 `0`。[`UInt8`](/sql-reference/data-types/int-uint)

**示例**

**用法示例**

```sql title=Query
SELECT mapExists((k, v) -> v = 1, map('k1', 1, 'k2', 2))
```

```response title=Response
1
```

## mapExtractKeyLike {#mapExtractKeyLike}

引入版本：v23.4

给定一个键为字符串的 map 和一个 `LIKE` 模式，此函数返回一个仅包含键与该模式匹配元素的 map。

**语法**

```sql
mapExtractKeyLike(map, pattern)
```

**参数**

* `map` — 要从中提取数据的 Map。[`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — 用于匹配键的模式字符串。[`const String`](/sql-reference/data-types/string)

**返回值**

返回一个 map，其中包含键与指定模式匹配的元素。如果没有元素匹配该模式，则返回一个空 map。[`Map(K, V)`](/sql-reference/data-types/map)

**示例**

**用法示例**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```

## mapExtractValueLike {#mapExtractValueLike}

引入版本：v25.5

给定一个值为字符串的 map 和一个 `LIKE` 模式，此函数返回一个 map，其中只包含值与该模式匹配的元素。

**语法**

```sql
mapExtractValueLike(map, pattern)
```

**参数**

* `map` — 要从中提取元素的 Map。[`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — 用于匹配值的模式。[`const String`](/sql-reference/data-types/string)

**返回值**

返回一个 Map，其中仅包含值与指定模式匹配的元素。如果没有元素匹配该模式，则返回空 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**示例**

**用法示例**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapExtractValueLike(a, 'a%')─┐
│ {'abc':'abc'}                │
│ {}                           │
└──────────────────────────────┘
```

## mapFilter {#mapFilter}

在 v22.3 中引入

通过对每个 map 元素应用函数来过滤该 map。

**语法**

```sql
mapFilter(func, map)
```

**参数**

* `func` — Lambda 函数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — 要筛选的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

返回一个 map，仅包含那些使 `func` 返回非 `0` 值的元素。[`Map(K, V)`](/sql-reference/data-types/map)

**示例**

**使用示例**

```sql title=Query
SELECT mapFilter((k, v) -> v > 1, map('k1', 1, 'k2', 2))
```

```response title=Response
{'k2':2}
```

## mapFromArrays {#mapFromArrays}

引入版本：v23.3

从键的数组或 Map 与值的数组或 Map 创建一个 Map。
该函数是语法 `CAST([...], 'Map(key_type, value_type)')` 的一种更便捷的替代写法。

**语法**

```sql
mapFromArrays(keys, values)
```

**别名**：`MAP_FROM_ARRAYS`

**参数**

* `keys` — 用于创建映射的键的数组或 `Map` 类型。[`Array`](/sql-reference/data-types/array) 或 [`Map`](/sql-reference/data-types/map)
* `values` — 用于创建映射的值的数组或 `Map` 类型。[`Array`](/sql-reference/data-types/array) 或 [`Map`](/sql-reference/data-types/map)

**返回值**

返回一个 `Map`，其键和值由键数组和值数组/`Map` 构造而成。[`Map`](/sql-reference/data-types/map)

**示例**

**基本用法**

```sql title=Query
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

```response title=Response
{'a':1,'b':2,'c':3}
```

**使用 map 作为输入**

```sql title=Query
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

```response title=Response
{1:('a', 1), 2:('b', 2), 3:('c', 3)}
```

## mapKeys {#mapKeys}

引入版本：v21.2

返回给定 map 的键。
通过启用设置 [`optimize_functions_to_subcolumns`](/operations/settings/settings#optimize_functions_to_subcolumns)，可以对该函数进行优化。
启用该设置后，函数只会读取 `keys` 子列，而不是整个 map。
查询 `SELECT mapKeys(m) FROM table` 会被转换为 `SELECT m.keys FROM table`。

**语法**

```sql
mapKeys(map)
```

**参数**

* `map` — 要从中提取键的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

返回一个包含该 map 所有键的数组。[`Array(T)`](/sql-reference/data-types/array)

**示例**

**用法示例**

```sql title=Query
SELECT mapKeys(map('k1', 'v1', 'k2', 'v2'))
```

```response title=Response
['k1','k2']
```

## mapPartialReverseSort {#mapPartialReverseSort}

自 v23.4 引入

对 map 的元素按降序排序，并带有一个额外的 limit 参数，用于进行部分排序。
如果指定了 func 函数，则根据将 func 函数应用于 map 的键和值所得到的结果来确定排序顺序。

**语法**

```sql
mapPartialReverseSort([func,] limit, map)
```

**参数**

* `func` — 可选。Lambda 函数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `limit` — 对范围 `[1..limit]` 内的元素进行排序。[`(U)Int*`](/sql-reference/data-types/int-uint)
* `map` — 要排序的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

返回一个按降序部分排序后的 map。[`Map(K, V)`](/sql-reference/data-types/map)

**示例**

**用法示例**

```sql title=Query
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k1':3,'k3':2,'k2':1}
```

## mapPartialSort {#mapPartialSort}

自 v23.4 版本引入

对 map 的元素按升序排序，并接受一个额外的 limit 参数，用于执行部分排序。
如果指定了函数 func，则排序顺序由函数 func 作用于 map 的键和值后得到的结果来决定。

**语法**

```sql
mapPartialSort([func,] limit, map)
```

**参数**

* `func` — 可选。Lambda 函数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `limit` — 范围 `[1..limit]` 内的元素将被排序。[`(U)Int*`](/sql-reference/data-types/int-uint)
* `map` — 要排序的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

返回一个部分有序的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**示例**

**用法示例**

```sql title=Query
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k2':1,'k3':2,'k1':3}
```

## mapPopulateSeries {#mapPopulateSeries}

引入版本：v20.10

在具有整数键的 map 中填充缺失的键值对。
为了支持将键扩展到当前最大值之外，可以指定一个最大键。
更具体地说，该函数返回一个 map，其键从最小键到最大键（或指定的 max 参数）构成步长为 1 的序列，并具有对应的值。
如果某个键未指定值，则使用默认值作为该键的值。
如果键出现重复，则只将第一个值（按出现顺序）与该键关联。

**语法**

```sql
mapPopulateSeries(map[, max]) | mapPopulateSeries(keys, values[, max])
```

**参数**

* `map` — 具有整数键的 Map。[`Map((U)Int*, V)`](/sql-reference/data-types/map)
* `keys` — 键数组。[`Array(T)`](/sql-reference/data-types/array)
* `values` — 值数组。[`Array(T)`](/sql-reference/data-types/array)
* `max` — 可选。键的最大值。[`Int8`](/sql-reference/data-types/int-uint) 或 [`Int16`](/sql-reference/data-types/int-uint) 或 [`Int32`](/sql-reference/data-types/int-uint) 或 [`Int64`](/sql-reference/data-types/int-uint) 或 [`Int128`](/sql-reference/data-types/int-uint) 或 [`Int256`](/sql-reference/data-types/int-uint)

**返回值**

返回一个 Map，或由两个数组组成的元组：第一个数组包含按排序后顺序排列的键，第二个数组包含对应键的值。[`Map(K, V)`](/sql-reference/data-types/map) 或 [`Tuple(Array(UInt*), Array(Any))`](/sql-reference/data-types/tuple)

**示例**

**使用 Map 类型**

```sql title=Query
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6)
```

```response title=Response
{1:10, 2:0, 3:0, 4:0, 5:20, 6:0}
```

**使用映射数组**

```sql title=Query
SELECT mapPopulateSeries([1, 2, 4], [11, 22, 44], 5)
```

```response title=Response
([1, 2, 3, 4, 5], [11, 22, 0, 44, 0])
```

## mapReverseSort {#mapReverseSort}

引入版本：v23.4

对 map 中的元素进行降序排序。
如果指定了函数 func，则排序顺序由函数 func 作用于 map 的键和值所产生的结果来决定。

**语法**

```sql
mapReverseSort([func,] map)
```

**参数**

* `func` — 可选。Lambda 函数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — 要排序的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

返回按降序排序后的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**示例**

**用法示例**

```sql title=Query
SELECT mapReverseSort((k, v) -> v, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k1':3,'k3':2,'k2':1}
```

## mapSort {#mapSort}

引入于：v23.4

按升序对 map 的元素进行排序。
如果指定了函数 func，则排序顺序由将 func 函数应用于 map 的键和值后得到的结果决定。

**语法**

```sql
mapSort([func,] map)
```

**参数**

* `func` — 可选。Lambda 函数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — 要排序的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

返回按升序排序的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**示例**

**用法示例**

```sql title=Query
SELECT mapSort((k, v) -> v, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k2':1,'k3':2,'k1':3}
```

## mapSubtract {#mapSubtract}

自 v20.7 版本引入。

收集所有键并对相应的值进行相减运算。

**语法**

```sql
mapSubtract(arg1[, arg2, ...])
```

**参数**

* `arg1[, arg2, ...]` — 类型为 `Map` 或由两个数组组成的 `Tuple`，其中第一个数组的元素表示键，第二个数组包含每个键对应的值。[`Map(K, V)`](/sql-reference/data-types/map) 或 [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**返回值**

返回一个 `Map` 或 `Tuple`，其中第一个数组包含排序后的键，第二个数组包含对应的值。[`Map(K, V)`](/sql-reference/data-types/map) 或 [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**示例**

**使用 Map 类型**

```sql title=Query
SELECT mapSubtract(map(1, 1), map(1, 1))
```

```response title=Response
{1:0}
```

**使用 tuple map 时**

```sql title=Query
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1]))
```

```response title=Response
([1, 2], [-1, 0])
```

## mapUpdate {#mapUpdate}

引入版本：v22.3

对于两个 `map`，返回在第一个 `map` 的基础上，用第二个 `map` 中对应键的值更新后的结果。

**语法**

```sql
mapUpdate(map1, map2)
```

**参数**

* `map1` — 要更新的映射。[`Map(K, V)`](/sql-reference/data-types/map)
* `map2` — 用于更新的映射。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

返回按 `map2` 中对应键的值更新后的 `map1`。[`Map(K, V)`](/sql-reference/data-types/map)

**示例**

**基本用法**

```sql title=Query
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10))
```

```response title=Response
{'key3':0,'key1':10,'key2':10}
```

## mapValues {#mapValues}

首次引入于：v21.2

返回给定 map 中所有的值。
通过启用 [`optimize_functions_to_subcolumns`](/operations/settings/settings#optimize_functions_to_subcolumns) 这个设置，可以对该函数进行优化。
启用该设置后，函数只会读取 `values` 子列，而不是整个 map。
查询 `SELECT mapValues(m) FROM table` 会被重写为 `SELECT m.values FROM table`。

**语法**

```sql
mapValues(map)
```

**参数**

* `map` — 要从中提取值的 Map。[`Map(K, V)`](/sql-reference/data-types/map)

**返回值**

返回一个数组，包含该 Map 中的所有值。[`Array(T)`](/sql-reference/data-types/array)

**示例**

**使用示例**

```sql title=Query
SELECT mapValues(map('k1', 'v1', 'k2', 'v2'))
```

```response title=Response
['v1','v2']
```

{/*AUTOGENERATED_END*/ }
