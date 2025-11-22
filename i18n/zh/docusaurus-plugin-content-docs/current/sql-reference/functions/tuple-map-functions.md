---
description: 'Tuple Map 函数文档'
sidebar_label: 'Map'
slug: /sql-reference/functions/tuple-map-functions
title: 'Map 函数'
doc_type: 'reference'
---



## map {#map}

从键值对创建 [Map(key, value)](../data-types/map.md) 类型的值。

**语法**

```sql
map(key1, value1[, key2, value2, ...])
```

**参数**

- `key_n` — 映射条目的键。[Map](../data-types/map.md) 键类型支持的任何类型。
- `value_n` — 映射条目的值。[Map](../data-types/map.md) 值类型支持的任何类型。

**返回值**

- 包含 `key:value` 键值对的映射。[Map(key, value)](../data-types/map.md)。

**示例**

查询:

```sql
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3);
```

结果:

```text
┌─map('key1', number, 'key2', multiply(number, 2))─┐
│ {'key1':0,'key2':0}                              │
│ {'key1':1,'key2':2}                              │
│ {'key1':2,'key2':4}                              │
└──────────────────────────────────────────────────┘
```


## mapFromArrays {#mapfromarrays}

从键数组或键映射以及值数组或值映射创建映射。

该函数是 `CAST([...], 'Map(key_type, value_type)')` 语法的便捷替代方案。
例如,您可以使用 `mapFromArrays(['aa', 'bb'], [4, 5])` 来代替以下写法:

- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`,或
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

**语法**

```sql
mapFromArrays(keys, values)
```

别名:`MAP_FROM_ARRAYS(keys, values)`

**参数**

- `keys` — 用于创建映射的键数组或键映射 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。如果 `keys` 是数组,只要不包含 NULL 值,可以接受 `Array(Nullable(T))` 或 `Array(LowCardinality(Nullable(T)))` 类型。
- `values` — 用于创建映射的值数组或值映射 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。

**返回值**

- 由键数组和值数组/映射构造的映射。

**示例**

查询:

```sql
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

结果:

```response
┌─mapFromArrays(['a', 'b', 'c'], [1, 2, 3])─┐
│ {'a':1,'b':2,'c':3}                       │
└───────────────────────────────────────────┘
```

`mapFromArrays` 也接受 [Map](../data-types/map.md) 类型的参数。这些参数在执行期间会被转换为元组数组。

```sql
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

结果:

```response
┌─mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))─┐
│ {1:('a',1),2:('b',2),3:('c',3)}                       │
└───────────────────────────────────────────────────────┘
```

```sql
SELECT mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])
```

结果:

```response
┌─mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])─┐
│ {('a',1):1,('b',2):2,('c',3):3}                       │
└───────────────────────────────────────────────────────┘
```


## extractKeyValuePairs {#extractkeyvaluepairs}

将键值对字符串转换为 [Map(String, String)](../data-types/map.md)。
解析过程对噪声具有容错性(例如日志文件)。
输入字符串中的键值对由键、键值分隔符和值组成。
键值对之间通过对分隔符进行分隔。
键和值可以使用引号括起。

**语法**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

别名:

- `str_to_map`
- `mapFromString`

**参数**

- `data` - 要从中提取键值对的字符串。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `key_value_delimiter` - 用于分隔键和值的单个字符。默认为 `:`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `pair_delimiters` - 用于分隔键值对的字符集合。默认为 ` `、`,` 和 `;`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `quoting_character` - 用作引号的单个字符。默认为 `"`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `unexpected_quoting_character_strategy` - 在 `read_key` 和 `read_value` 阶段处理出现在意外位置的引号字符的策略。可能的值:"invalid"、"accept" 和 "promote"。invalid 将丢弃键/值并转换回 `WAITING_KEY` 状态。accept 将其视为普通字符。promote 将转换到 `READ_QUOTED_{KEY/VALUE}` 状态并从下一个字符开始。

**返回值**

- 键值对映射。类型:[Map(String, String)](../data-types/map.md)

**示例**

查询

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') AS kv
```

结果:

```结果:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

使用单引号 `'` 作为引号字符:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

结果:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected_quoting_character_strategy 示例:

unexpected_quoting_character_strategy=invalid

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

unexpected_quoting_character_strategy=accept

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

unexpected_quoting_character_strategy=promote

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

在不支持转义序列时对转义序列的处理：

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

结果：

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

要还原经 `toString` 序列化的 map 字符串键值对：

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


## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

与 `extractKeyValuePairs` 相同，但支持转义。

支持的转义序列：`\x`、`\N`、`\a`、`\b`、`\e`、`\f`、`\n`、`\r`、`\t`、`\v` 和 `\0`。
非标准转义序列将按原样返回（包括反斜杠），除非它们是以下之一：
`\\`、`'`、`"`、`backtick`、`/`、`=` 或 ASCII 控制字符（c &lt;= 31）。

此函数适用于预转义和后转义都不适合的使用场景。例如，考虑以下输入字符串：`a: "aaaa\"bbb"`。预期输出为：`a: aaaa\"bbbb`。

- 预转义：预转义后将输出：`a: "aaaa"bbb"`，然后 `extractKeyValuePairs` 将输出：`a: aaaa`
- 后转义：`extractKeyValuePairs` 将输出 `a: aaaa\`，后转义将保持不变。

键中的前导转义序列将被跳过，而在值中将被视为无效。

**示例**

启用转义序列支持时的转义序列：

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

收集所有键并对相应值求和。

**语法**

```sql
mapAdd(arg1, arg2 [, ...])
```

**参数**

参数为 [map](../data-types/map.md) 或由两个 [array](/sql-reference/data-types/array) 组成的 [tuple](/sql-reference/data-types/tuple),其中第一个数组的元素表示键,第二个数组包含每个键对应的值。所有键数组应具有相同的类型,所有值数组应包含可提升为同一类型([Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float))的元素。使用通用提升类型作为结果数组的类型。

**返回值**

- 根据参数返回一个 [map](../data-types/map.md) 或 [tuple](/sql-reference/data-types/tuple),其中第一个数组包含排序后的键,第二个数组包含对应的值。

**示例**

使用 `Map` 类型的查询:

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

结果:

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

使用 tuple 的查询:

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) AS res, toTypeName(res) AS type;
```

结果:

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```


## mapSubtract {#mapsubtract}

收集所有键并对相应的值进行相减。

**语法**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**参数**

参数为 [map](../data-types/map.md) 或由两个 [array](/sql-reference/data-types/array) 组成的 [tuple](/sql-reference/data-types/tuple),其中第一个数组的元素表示键,第二个数组包含每个键对应的值。所有键数组应具有相同的类型,所有值数组应包含可提升为同一类型([Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float))的元素。通用提升类型将用作结果数组的类型。

**返回值**

- 根据参数返回一个 [map](../data-types/map.md) 或 [tuple](/sql-reference/data-types/tuple),其中第一个数组包含排序后的键,第二个数组包含对应的值。

**示例**

使用 `Map` 类型的查询:

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

结果:

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

使用元组映射的查询:

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

结果:

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```


## mapPopulateSeries {#mappopulateseries}

填充 Map 中缺失的整数键值对。
为了支持将键扩展到最大值之外,可以指定一个最大键。
更具体地说,该函数返回一个 Map,其中键形成从最小键到最大键(或指定的 `max` 参数)的序列,步长为 1,并包含相应的值。
如果未为某个键指定值,则使用默认值。
如果键重复,则只有第一个值(按出现顺序)与该键关联。

**语法**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

对于数组参数,每行中 `keys` 和 `values` 的元素数量必须相同。

**参数**

参数可以是 [Map](../data-types/map.md) 或两个 [Array](/sql-reference/data-types/array),其中第一个和第二个数组分别包含键和对应的值。

映射数组:

- `map` — 具有整数键的 Map。[Map](../data-types/map.md)。

或

- `keys` — 键数组。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `values` — 值数组。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `max` — 最大键值。可选。[Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

- 根据参数返回 [Map](../data-types/map.md) 或包含两个 [Array](/sql-reference/data-types/array) 的 [Tuple](/sql-reference/data-types/tuple):按排序顺序的键,以及对应的值。

**示例**

使用 `Map` 类型的查询:

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

结果:

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

使用映射数组的查询:

```sql
SELECT mapPopulateSeries([1,2,4], [11,22,44], 5) AS res, toTypeName(res) AS type;
```

结果:

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```


## mapKeys {#mapkeys}

返回给定 Map 的键。

通过启用设置 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 可以优化此函数。
启用该设置后,函数仅读取 [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列,而不是整个 Map。
查询 `SELECT mapKeys(m) FROM table` 会被转换为 `SELECT m.keys FROM table`。

**语法**

```sql
mapKeys(map)
```

**参数**

- `map` — Map 类型。[Map](../data-types/map.md)。

**返回值**

- 包含 `map` 中所有键的数组。[Array](../data-types/array.md)。

**示例**

查询:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapKeys(a) FROM tab;
```

结果:

```text
┌─mapKeys(a)────────────┐
│ ['name','age']        │
│ ['number','position'] │
└───────────────────────┘
```


## mapContains {#mapcontains}

返回给定的 map 中是否包含指定的键。

**语法**

```sql
mapContains(map, key)
```

别名：`mapContainsKey(map, key)`

**参数**

- `map` — Map 类型。[Map](../data-types/map.md)。
- `key` — 键。类型必须与 `map` 的键类型匹配。

**返回值**

- 如果 `map` 包含 `key` 则返回 `1`，否则返回 `0`。[UInt8](../data-types/int-uint.md)。

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

- `map` — Map 类型。[Map](../data-types/map.md)。
- `pattern` — 用于匹配的字符串模式。

**返回值**

- 如果 `map` 包含符合指定模式的 `key`,则返回 `1`,否则返回 `0`。

**示例**

查询:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

结果:

```text
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```


## mapExtractKeyLike {#mapextractkeylike}

给定一个具有字符串键的 map 和一个 LIKE 模式,该函数返回一个 map,其中包含键与该模式匹配的元素。

**语法**

```sql
mapExtractKeyLike(map, pattern)
```

**参数**

- `map` — Map 类型。[Map](../data-types/map.md)。
- `pattern` — 要匹配的字符串模式。

**返回值**

- 返回一个 map,包含键与指定模式匹配的元素。如果没有元素匹配该模式,则返回空 map。

**示例**

查询:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

结果:

```text
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```


## mapValues {#mapvalues}

返回给定 Map 的所有值。

通过启用设置 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 可以优化此函数。
启用该设置后,函数仅读取 [values](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列,而不是整个 Map。
查询 `SELECT mapValues(m) FROM table` 会被转换为 `SELECT m.values FROM table`。

**语法**

```sql
mapValues(map)
```

**参数**

- `map` — Map 类型。[Map](../data-types/map.md)。

**返回值**

- 包含 `map` 中所有值的数组。[Array](../data-types/array.md)。

**示例**

查询:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapValues(a) FROM tab;
```

结果:

```text
┌─mapValues(a)─────┐
│ ['eleven','11']  │
│ ['twelve','6.0'] │
└──────────────────┘
```


## mapContainsValue {#mapcontainsvalue}

返回给定的映射中是否包含指定的值。

**语法**

```sql
mapContainsValue(map, value)
```

别名:`mapContainsValue(map, value)`

**参数**

- `map` — 映射。[Map](../data-types/map.md)。
- `value` — 值。类型必须与 `map` 的值类型匹配。

**返回值**

- 如果 `map` 包含 `value` 则返回 `1`,否则返回 `0`。[UInt8](../data-types/int-uint.md)。

**示例**

查询:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContainsValue(a, '11') FROM tab;

```

结果:

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

- `map` — 映射类型。[Map](../data-types/map.md)。
- `pattern` — 用于匹配的字符串模式。

**返回值**

- 如果 `map` 包含符合指定模式的 `value`,则返回 `1`,否则返回 `0`。

**示例**

查询:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

结果:

```text
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```


## mapExtractValueLike {#mapextractvaluelike}

给定一个包含字符串值的 map 和一个 LIKE 模式,该函数返回一个 map,其中包含值与该模式匹配的元素。

**语法**

```sql
mapExtractValueLike(map, pattern)
```

**参数**

- `map` — Map 类型。[Map](../data-types/map.md)。
- `pattern` — 要匹配的字符串模式。

**返回值**

- 返回一个 map,包含值与指定模式匹配的元素。如果没有元素匹配该模式,则返回空 map。

**示例**

查询:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

结果:

```text
┌─mapExtractValueLike(a, 'a%')─┐
│ {'abc':'abc'}                │
│ {}                           │
└──────────────────────────────┘
```


## mapApply {#mapapply}

对 Map 中的每个元素应用函数。

**语法**

```sql
mapApply(func, map)
```

**参数**

- `func` — [Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返回值**

- 返回一个新的 Map,通过对原始 Map 的每个元素应用 `func(map1[i], ..., mapN[i])` 得到。

**示例**

查询:

```sql
SELECT mapApply((k, v) -> (k, v * 10), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

结果:

```text
┌─r─────────────────────┐
│ {'key1':0,'key2':0}   │
│ {'key1':10,'key2':20} │
│ {'key1':20,'key2':40} │
└───────────────────────┘
```


## mapFilter {#mapfilter}

通过对每个映射元素应用函数来过滤映射。

**语法**

```sql
mapFilter(func, map)
```

**参数**

- `func` - [Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返回值**

- 返回一个映射,仅包含 `map` 中使 `func(map1[i], ..., mapN[i])` 返回非 0 值的元素。

**示例**

查询:

```sql
SELECT mapFilter((k, v) -> ((v % 2) = 0), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

结果:

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

- `map1` [Map](../data-types/map.md).
- `map2` [Map](../data-types/map.md).

**返回值**

- 返回 map1,其中 map2 中对应键的值已更新到 map1 中。

**示例**

查询:

```sql
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10)) AS map;
```

结果:

```text
┌─map────────────────────────────┐
│ {'key3':0,'key1':10,'key2':10} │
└────────────────────────────────┘
```


## mapConcat {#mapconcat}

根据键的相等性连接多个 map。
如果多个输入 map 中存在相同键的元素,所有元素都会添加到结果 map 中,但只有第一个元素可以通过运算符 `[]` 访问

**语法**

```sql
mapConcat(maps)
```

**参数**

- `maps` – 任意数量的 [Map](../data-types/map.md)。

**返回值**

- 返回一个 map,其中包含作为参数传递的所有 map 连接后的内容。

**示例**

查询:

```sql
SELECT mapConcat(map('key1', 1, 'key3', 3), map('key2', 2)) AS map;
```

结果:

```text
┌─map──────────────────────────┐
│ {'key1':1,'key3':3,'key2':2} │
└──────────────────────────────┘
```

查询:

```sql
SELECT mapConcat(map('key1', 1, 'key2', 2), map('key1', 3)) AS map, map['key1'];
```

结果:

```text
┌─map──────────────────────────┬─elem─┐
│ {'key1':1,'key2':2,'key1':3} │    1 │
└──────────────────────────────┴──────┘
```


## mapExists(\[func,\], map) {#mapexistsfunc-map}

如果 `map` 中至少存在一个键值对使得 `func(key, value)` 返回非 0 值,则返回 1。否则返回 0。

:::note
`mapExists` 是一个[高阶函数](/sql-reference/functions/overview#higher-order-functions)。
可以将 lambda 函数作为第一个参数传递给它。
:::

**示例**

查询:

```sql
SELECT mapExists((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

结果:

```response
┌─res─┐
│   1 │
└─────┘
```


## mapAll(\[func,\] map) {#mapallfunc-map}

如果 `func(key, value)` 对 `map` 中的所有键值对返回非 0 值,则返回 1。否则返回 0。

:::note
注意:`mapAll` 是一个[高阶函数](/sql-reference/functions/overview#higher-order-functions)。
可以将 lambda 函数作为第一个参数传递给它。
:::

**示例**

查询:

```sql
SELECT mapAll((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

结果:

```response
┌─res─┐
│   0 │
└─────┘
```


## mapSort(\[func,\], map) {#mapsortfunc-map}

按升序对 map 的元素进行排序。
如果指定了 `func` 函数,则排序顺序由 `func` 函数应用于 map 的键和值后的结果决定。

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

更多详细信息请参阅 `arraySort` 函数的[参考文档](/sql-reference/functions/array-functions#arraySort)。


## mapPartialSort {#mappartialsort}

对映射中的元素按升序进行排序,通过额外的 `limit` 参数实现部分排序。
如果指定了 `func` 函数,则排序顺序由该函数应用于映射的键和值后的结果决定。

**语法**

```sql
mapPartialSort([func,] limit, map)
```

**参数**

- `func` – 可选函数,应用于映射的键和值。[Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 对范围 [1..limit] 内的元素进行排序。[(U)Int](../data-types/int-uint.md)。
- `map` – 要排序的映射。[Map](../data-types/map.md)。

**返回值**

- 部分排序后的映射。[Map](../data-types/map.md)。

**示例**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```


## mapReverseSort(\[func,\], map) {#mapreversesortfunc-map}

按降序对 map 的元素进行排序。
如果指定了 `func` 函数,则排序顺序由 `func` 函数应用于 map 的键和值后的结果决定。

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

按降序对映射的元素进行排序,通过额外的 `limit` 参数实现部分排序。
如果指定了 `func` 函数,则排序顺序由该函数应用于映射的键和值后的结果决定。

**语法**

```sql
mapPartialReverseSort([func,] limit, map)
```

**参数**

- `func` – 可选函数,应用于映射的键和值。[Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 对范围 [1..limit] 内的元素进行排序。[(U)Int](../data-types/int-uint.md)。
- `map` – 要排序的映射。[Map](../data-types/map.md)。

**返回值**

- 部分排序后的映射。[Map](../data-types/map.md)。

**示例**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
