---
description: 'Tuple Map 函数文档'
sidebar_label: 'Map'
slug: /sql-reference/functions/tuple-map-functions
title: 'Map 函数'
doc_type: 'reference'
---



## map

根据键值对创建一个 [Map(key, value)](../data-types/map.md) 类型的值。

**语法**

```sql
map(key1, value1[, key2, value2, ...])
```

**参数**

* `key_n` — 映射项的键。可以是任意受支持的 [Map](../data-types/map.md) 键类型。
* `value_n` — 映射项的值。可以是任意受支持的 [Map](../data-types/map.md) 值类型。

**返回值**

* 一个包含 `key:value` 键值对的 Map。[Map(key, value)](../data-types/map.md)。

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


## mapFromArrays

从键数组或 Map 和值数组或 Map 创建一个 Map。

该函数是语法 `CAST([...], 'Map(key_type, value_type)')` 的一种便捷替代方式。
例如，可以不写：

* `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`，或
* `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

而写成 `mapFromArrays(['aa', 'bb'], [4, 5])`。

**语法**

```sql
mapFromArrays(keys, values)
```

别名: `MAP_FROM_ARRAYS(keys, values)`

**参数**

* `keys` — 用于构建 map 的键的数组或 map，类型为 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。如果 `keys` 是数组，可接受其类型为 `Array(Nullable(T))` 或 `Array(LowCardinality(Nullable(T)))`，前提是其中不包含 NULL 值。
* `values`  — 用于构建 map 的值的数组或 map，类型为 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。

**返回值**

* 一个 map，其键和值由键数组和值数组/map 构造而成。

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

`mapFromArrays` 也接受类型为 [Map](../data-types/map.md) 的参数。这些参数在执行时会被转换为元组数组。

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


## extractKeyValuePairs

将由键值对组成的字符串转换为 [Map(String, String)](../data-types/map.md)。
解析过程能够容忍噪声（例如日志文件中的多余内容）。
输入字符串中的键值对由一个键、紧随其后的键值分隔符以及一个值组成。
键值对之间由键值对分隔符进行分隔。
键和值可以使用引号包裹。

**语法**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

别名：

* `str_to_map`
* `mapFromString`

**参数**

* `data` - 要从中提取键值对的字符串。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
* `key_value_delimiter` - 分隔键和值的单个字符。默认为 `:`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
* `pair_delimiters` - 分隔各个键值对的字符集合。默认是 ` `、`,` 和 `;`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
* `quoting_character` - 用作引用符号的单个字符。默认为 `"`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
* `unexpected_quoting_character_strategy` - 在 `read_key` 和 `read_value` 阶段处理出现在非预期位置的引用符号的策略。可选值：`invalid`、`accept` 和 `promote`。`invalid` 会丢弃键/值并切换回 `WAITING_KEY` 状态。`accept` 会将其视为普通字符。`promote` 会切换到 `READ_QUOTED_{KEY/VALUE}` 状态并从下一个字符开始。

**返回值**

* 一个键值对的 `Map`。类型：[Map(String, String)](../data-types/map.md)

**示例**

查询

```sql
SELECT extractKeyValuePairs('姓名:neymar, 年龄:31 球队:psg,国籍:brazil') AS kv
```

结果：

```Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

使用单引号 `'` 作为引号字符：

```sql
SELECT extractKeyValuePairs('姓名:\'neymar\';\'年龄\':31;球队:psg;国籍:brazil,最后键:最后值', ':', ';,', '\'') AS kv
```

结果：

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy 示例：

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

在不支持转义序列的场景下使用转义序列：

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

结果：

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

要还原经 `toString` 序列化的字符串 map 键值对：

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) AS map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

结果：

```response
行 1:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```


## extractKeyValuePairsWithEscaping

与 `extractKeyValuePairs` 相同，但支持转义。

支持的转义序列包括：`\x`、`\N`、`\a`、`\b`、`\e`、`\f`、`\n`、`\r`、`\t`、`\v` 和 `\0`。
非标准转义序列会原样返回（包括反斜杠），除非它们是以下之一：
`\\`、`'`、`"`、反引号 `backtick`、`/`、`=` 或 ASCII 控制字符（c &lt;= 31）。

此函数适用于预转义和后转义都不合适的用例。例如，考虑如下输入字符串：`a: "aaaa\"bbb"`。期望的输出是：`a: aaaa\"bbbb`。

* 预转义：对其进行预转义处理后将输出：`a: "aaaa"bbb"`，然后 `extractKeyValuePairs` 会输出：`a: aaaa`
* 后转义：`extractKeyValuePairs` 会输出 `a: aaaa\`，而后转义会保持其原样。

键中的前导转义序列会被跳过，而在值中则视为无效。

**示例**

在启用转义序列支持时的转义序列行为：

```sql
SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv
```

结果：

```response
┌─kv────────────────┐
│ {'age':'a\n\n\0'} │
└───────────────────┘
```


## mapAdd

收集所有键并对其对应的值求和。

**语法**

```sql
mapAdd(arg1, arg2 [, ...])
```

**参数**

参数是由两个[数组](/sql-reference/data-types/array)组成的[map](../data-types/map.md)或[tuple](/sql-reference/data-types/tuple)，第一个数组中的元素表示键，第二个数组包含每个键对应的值。所有键数组的类型必须相同，所有值数组中的元素必须能够统一提升为同一种类型（[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float)）。该统一提升后的公共类型将作为结果数组的类型。

**返回值**

* 根据传入的参数返回一个[map](../data-types/map.md)或[tuple](/sql-reference/data-types/tuple)，其中第一个数组包含排好序的键，第二个数组包含对应的值。

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

使用元组查询：

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) AS res, toTypeName(res) AS type;
```

结果：

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```


## mapSubtract

收集所有键，并对相应的值执行减法运算。

**语法**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**参数**

参数是两个[数组](/sql-reference/data-types/array)组成的[map](../data-types/map.md)或[tuple](/sql-reference/data-types/tuple)，第一个数组中的元素表示键，第二个数组包含每个键对应的值。所有键数组应具有相同的类型，所有值数组中的元素应可以提升为同一种类型（[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float)）。这一公共提升类型会被用作结果数组元素的类型。

**返回值**

* 根据参数，返回一个[map](../data-types/map.md)或[tuple](/sql-reference/data-types/tuple)，其中第一个数组包含排序后的键，第二个数组包含对应的值。

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

使用元组映射进行查询：

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

结果：

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```


## mapPopulateSeries

为具有整数键的 map 填充缺失的键值对。
为了支持将键扩展到超过当前最大值的情况，可以指定一个最大键。
更具体地说，该函数返回一个 map，其中键从最小键到最大键（或指定的 `max` 参数）形成一个步长为 1 的序列，并具有相应的值。
如果某个键未指定值，则使用默认值作为其对应的值。
如果键重复出现，则仅将第一个值（按出现顺序）与该键关联。

**语法**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

对于数组参数，每一行中 `keys` 和 `values` 的元素数量必须相同。

**参数**

参数可以是 [Map](../data-types/map.md)，也可以是两个 [Array](/sql-reference/data-types/array)，其中第一个数组包含键，第二个数组包含每个键对应的值。

映射数组：

* `map` — 具有整数键的 Map。[Map](../data-types/map.md)。

或

* `keys` — 键的数组。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
* `values` — 值的数组。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
* `max` — 最大键值，可选。[Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

* 根据参数，返回一个 [Map](../data-types/map.md)，或者一个由两个 [Array](/sql-reference/data-types/array) 组成的 [Tuple](/sql-reference/data-types/tuple)：按排序顺序排列的键，以及与这些键相对应的值。

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

对映射数组进行查询：

```sql
SELECT mapPopulateSeries([1,2,4], [11,22,44], 5) AS res, toTypeName(res) AS type;
```

结果：

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```


## mapKeys

返回给定 `Map` 的所有键。

通过启用设置 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 可以优化该函数。
启用该设置后，函数只读取 [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列，而不是整个 `Map` 列。
查询 `SELECT mapKeys(m) FROM table` 会被重写为 `SELECT m.keys FROM table`。

**语法**

```sql
mapKeys(map)
```

**参数**

* `map` — Map 类型。参见 [Map](../data-types/map.md)。

**返回值**

* 包含 `map` 中所有键的数组。参见 [Array](../data-types/array.md)。

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


## mapContains

判断给定的 `map` 是否包含指定的键。

**语法**

```sql
mapContains(map, key)
```

Alias: `mapContainsKey(map, key)`

**参数**

* `map` — Map 类型。参见 [Map](../data-types/map.md)。
* `key` — 键。类型必须与 `map` 的键类型一致。

**返回值**

* 若 `map` 包含 `key`，则返回 `1`，否则返回 `0`。返回类型为 [UInt8](../data-types/int-uint.md)。

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


## mapContainsKeyLike

**语法**

```sql
mapContainsKeyLike(map, pattern)
```

**参数**

* `map` — Map 类型。[Map](../data-types/map.md)。
* `pattern` - 要匹配的字符串模式。

**返回值**

* 如果 `map` 中存在符合指定模式的键 `key`，则返回 `1`，否则返回 `0`。

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


## mapExtractKeyLike

给定一个具有字符串键的 `map` 和一个 `LIKE` 模式，此函数返回一个 `map`，其中仅包含键名匹配该模式的元素。

**语法**

```sql
mapExtractKeyLike(map, pattern)
```

**参数**

* `map` — Map 类型。参见 [Map](../data-types/map.md)。
* `pattern`  - 要匹配的字符串模式。

**返回值**

* 一个 map，包含键名匹配指定模式的元素。如果没有元素匹配该模式，则返回空 map。

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


## mapValues

返回给定 Map 的所有值。

可以通过启用设置 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 来优化该函数。
启用该设置后，函数只会读取 [values](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列，而不是整个 Map。
查询 `SELECT mapValues(m) FROM table` 会被转换为 `SELECT m.values FROM table`。

**语法**

```sql
mapValues(map)
```

**参数**

* `map` — Map 类型。参见 [Map](../data-types/map.md)。

**返回值**

* 包含 `map` 中所有值的 Array。参见 [Array](../data-types/array.md)。

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


## mapContainsValue

返回给定键是否存在于给定的 `map` 中。

**语法**

```sql
mapContainsValue(map, value)
```

别名：`mapContainsValue(map, value)`

**参数**

* `map` — 映射。参见 [Map](../data-types/map.md)。
* `value` — 值。类型必须与 `map` 的值类型一致。

**返回值**

* 当 `map` 包含 `value` 时返回 `1`，否则返回 `0`。参见 [UInt8](../data-types/int-uint.md)。

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


## mapContainsValueLike

**语法**

```sql
mapContainsValueLike(map, pattern)
```

**参数**

* `map` — Map 类型。参见 [Map](../data-types/map.md)。
* `pattern`  - 字符串匹配模式。

**返回值**

* 如果 `map` 中存在符合指定模式的值，则返回 `1`，否则返回 `0`。

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


## mapExtractValueLike

给定一个值为字符串的 `map` 和一个 `LIKE` 模式，此函数返回一个 `map`，其中仅包含值与该模式匹配的元素。

**语法**

```sql
mapExtractValueLike(map, pattern)
```

**参数**

* `map` — Map 类型。[Map](../data-types/map.md)。
* `pattern`  - 要匹配的字符串模式。

**返回值**

* 一个包含其值与指定模式匹配的元素的 Map。如果没有元素匹配该模式，则返回空 Map。

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


## mapApply

将函数应用于映射中的每个元素。

**语法**

```sql
mapApply(func, map)
```

**参数**

* `func` — [Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
* `map` — [Map](../data-types/map.md)。

**返回值**

* 返回一个 Map，该 Map 是对原始 Map 的每个元素应用 `func(map1[i], ..., mapN[i])` 所得到的结果。

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


## mapFilter

通过对映射中的每个元素应用函数来对映射进行过滤。

**语法**

```sql
mapFilter(func, map)
```

**参数**

* `func` - [Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
* `map` — [Map 类型](../data-types/map.md)。

**返回值**

* 返回一个 map，其中仅包含那些在调用 `func(map1[i], ..., mapN[i])` 时返回非 0 值的 `map` 中的元素。

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


## mapUpdate

**语法**

```sql
mapUpdate(map1, map2)
```

**参数**

* `map1` [Map](../data-types/map.md)。
* `map2` [Map](../data-types/map.md)。

**返回值**

* 返回 `map1`，其值被更新为 `map2` 中对应键的值。

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


## mapConcat

根据键是否相等连接多个 `Map`。
如果多个输入 `Map` 中存在具有相同键的元素，则所有这些元素都会被添加到结果 `Map` 中，但通过运算符 `[]` 只能访问到第一个元素。

**语法**

```sql
mapConcat(maps)
```

**参数**

* `maps` – 任意数量的 [Map](../data-types/map.md)。

**返回值**

* 返回一个将所有作为参数传入的 map 拼接在一起后的 map。

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


## mapExists([func,], map)

如果在 `map` 中至少存在一对键值对，使得 `func(key, value)` 的返回值不为 0，则返回 1，否则返回 0。

:::note
`mapExists` 是一个[高阶函数](/sql-reference/functions/overview#higher-order-functions)。
你可以将 lambda 函数作为其第一个参数传入。
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


## mapAll([func,] map)

如果对 `map` 中的所有键值对，`func(key, value)` 的返回值都不为 0，则返回 1，否则返回 0。

:::note
注意，`mapAll` 是一个[高阶函数](/sql-reference/functions/overview#higher-order-functions)。
你可以将一个 lambda 函数作为其第一个参数传入。
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


## mapSort([func,], map)

按升序对 map 中的元素进行排序。
如果指定了 `func` 函数，则排序顺序由将 `func` 函数应用到 map 的键和值上所得的结果决定。

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

有关更多详细信息，请参阅 `arraySort` 函数的[参考文档](/sql-reference/functions/array-functions#arraySort)。


## mapPartialSort

对 map 中的元素进行升序排序，并提供额外的 `limit` 参数以支持部分排序。
如果指定了函数 `func`，则排序顺序由将 `func` 应用于 map 的键和值所得到的结果来决定。

**语法**

```sql
mapPartialSort([func，] limit，map)
```

**参数**

* `func` – 可选函数，作用于 map 的键和值。[Lambda function](/sql-reference/functions/overview#higher-order-functions)。
* `limit` – 范围为 [1..limit] 的元素会被排序。[(U)Int](../data-types/int-uint.md)。
* `map` – 要排序的 map。[Map](../data-types/map.md)。

**返回值**

* 部分排序的 map。[Map](../data-types/map.md)。

**示例**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```


## mapReverseSort([func,], map)

对 `map` 的元素进行降序排序。
如果指定了 `func` 函数，则排序顺序由 `func` 应用于 `map` 的键和值后得到的结果决定。

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

有关更多详细信息，请参阅函数 [arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort)。


## mapPartialReverseSort

按降序对 `map` 的元素进行排序，并允许通过额外的 `limit` 参数进行部分排序。
如果指定了 `func` 函数，则排序顺序由将 `func` 函数应用到 `map` 的键和值后得到的结果决定。

**语法**

```sql
mapPartialReverseSort([func,] limit, map)
```

**参数**

* `func` – 可选函数，应用于 map 的键和值。[Lambda function](/sql-reference/functions/overview#higher-order-functions)。
* `limit` – 索引范围为 [1..limit] 的元素会被排序。[(U)Int](../data-types/int-uint.md)。
* `map` – 要排序的 map。[Map](../data-types/map.md)。

**返回值**

* 部分排序的 map。[Map](../data-types/map.md)。

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
  下面标签中的内容会在文档框架构建期间
  被基于 system.functions 生成的文档替换。请不要修改或删除这些标签。
  参见：https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
