---
'description': 'Tuple Map Functions 的文档'
'sidebar_label': '映射'
'sidebar_position': 120
'slug': '/sql-reference/functions/tuple-map-functions'
'title': '映射函数'
---

## map {#map}

从键值对创建一个类型为 [Map(key, value)](../data-types/map.md) 的值。

**语法**

```sql
map(key1, value1[, key2, value2, ...])
```

**参数**

- `key_n` — 地图条目的键。任何类型都支持作为 [Map](../data-types/map.md) 的键类型。
- `value_n` — 地图条目的值。任何类型都支持作为 [Map](../data-types/map.md) 的值类型。

**返回值**

- 一个包含 `key:value` 对的地图。 [Map(key, value)](../data-types/map.md)。

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

从键的数组或地图及值的数组或地图创建一个映射。

该函数是语法 `CAST([...], 'Map(key_type, value_type)')` 的一个方便替代方案。
例如，您可以写成 `mapFromArrays(['aa', 'bb'], [4, 5])`，而不是写成 
- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`，或者
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

**语法**

```sql
mapFromArrays(keys, values)
```

别名： `MAP_FROM_ARRAYS(keys, values)`

**参数**

- `keys` — 用于创建地图的键的数组或地图 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。如果 `keys` 是一个数组，我们接受 `Array(Nullable(T))` 或 `Array(LowCardinality(Nullable(T)))` 作为其类型，只要它不包含 NULL 值。
- `values`  - 用于创建地图的值的数组或地图 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。

**返回值**

- 一个由键数组和值数组/地图构造的地图。

**示例**

查询：

```sql
select mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

结果：

```response
┌─mapFromArrays(['a', 'b', 'c'], [1, 2, 3])─┐
│ {'a':1,'b':2,'c':3}                       │
└───────────────────────────────────────────┘
```

`mapFromArrays` 还接受类型为 [Map](../data-types/map.md) 的参数。这些参数在执行期间会被转换为元组数组。

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

将键值对字符串转换为 [Map(String, String)](../data-types/map.md)。
解析对噪声（例如日志文件）具有容忍性。
输入字符串中的键值对由一个键、一个键值分隔符和一个值组成。
键值对由一个对分隔符分隔。
键和值可以被引用。

**语法**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character]]])
```

别名：
- `str_to_map`
- `mapFromString`

**参数**

- `data` - 要提取键值对的字符串。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `key_value_delimiter` - 单字符分隔键和值。默认为 `:`。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `pair_delimiters` - 分隔对的字符集合。默认为 ` `、`,` 和 `;`。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `quoting_character` - 用作引用字符的单字符。默认为 `"`。 [String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 一组键值对。类型： [Map(String, String)](../data-types/map.md) 

**示例**

查询

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv
```

结果：

```Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

使用单引号 `'` 作为引用字符：

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv
```

结果：

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

不支持转义序列的转义序列：

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

结果：

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

要恢复使用 `toString` 序列化的地图字符串键值对：

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) as map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

结果：

```response
Row 1:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

与 `extractKeyValuePairs` 相同，但支持转义。

支持的转义序列： `\x`、 `\N`、 `\a`、 `\b`、 `\e`、 `\f`、 `\n`、 `\r`、 `\t`、 `\v` 和 `\0`。
非标准转义序列将原样返回（包括反斜杠），除非它们是以下之一：
`\\`、 `'`、 `"`、 `backtick`、 `/`、 `=` 或 ASCII 控制字符（c &lt;= 31）。

该函数将满足预转义和后转义不合适的用例。例如，考虑以下输入字符串： `a: "aaaa\"bbb"`。预期输出为： `a: aaaa\"bbbb`。
- 预转义：预转义结果将为： `a: "aaaa"bbb`，然后 `extractKeyValuePairs` 将输出： `a: aaaa`
- 后转义： `extractKeyValuePairs` 将输出 `a: aaaa\`，后转义将保持不变。

键中的前导转义序列将被跳过，并将被视为无效值。

**示例**

启用转义序列支持的转义序列：

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

收集所有键并对相应的值求和。

**语法**

```sql
mapAdd(arg1, arg2 [, ...])
```

**参数**

参数为 [maps](../data-types/map.md) 或两个 [arrays](/sql-reference/data-types/array) 的元组，其中第一个数组中的项目表示键，第二个数组包含每个键的值。所有键数组应具有相同的类型，所有值数组应包含可以提升到同一种类型的项目 ([Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float))。共同提升的类型用作结果数组的类型。

**返回值**

- 根据参数返回一个 [map](../data-types/map.md) 或 [tuple](/sql-reference/data-types/tuple)，其中第一个数组包含排序后的键，第二个数组包含值。

**示例**

查询使用 `Map` 类型：

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
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) as res, toTypeName(res) as type;
```

结果：

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```

## mapSubtract {#mapsubtract}

收集所有键并减去相应的值。

**语法**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**参数**

参数为 [maps](../data-types/map.md) 或两个 [arrays](/sql-reference/data-types/array) 的元组，其中第一个数组中的项目表示键，第二个数组包含每个键的值。所有键数组应具有相同的类型，所有值数组应包含可以提升到同一种类型的项目 ([Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float))。共同提升的类型用作结果数组的类型。

**返回值**

- 根据参数返回一个 [map](../data-types/map.md) 或 [tuple](/sql-reference/data-types/tuple)，其中第一个数组包含排序后的键，第二个数组包含值。

**示例**

查询使用 `Map` 类型：

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

结果：

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

查询使用元组地图：

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) as res, toTypeName(res) as type;
```

结果：

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

用整数键填充地图中缺少的键值对。
为了支持扩展键超出最大值，可以指定一个最大键。
具体来说，该函数返回一个地图，其中键形成从最小键到最大键（或指定的 `max` 参数）的系列，步长为 1，并有对应值。
如果没有为键指定值，则使用默认值作为值。
在键重复的情况下，仅与键关联出现的第一个值（按出现顺序）。

**语法**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

对于数组参数，`keys` 和 `values` 中的元素数量必须对于每一行相同。

**参数**

参数为 [Maps](../data-types/map.md) 或两个 [Arrays](/sql-reference/data-types/array)，其中第一个和第二个数组包含每个键的键和值。

映射数组：

- `map` — 具有整数键的地图。 [Map](../data-types/map.md)。

或

- `keys` — 键数组。 [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `values` — 值数组。 [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `max` — 最大键值。可选。 [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

- 根据参数返回一个 [Map](../data-types/map.md) 或两个 [Arrays](/sql-reference/data-types/array) 的元组：按排序顺序的键，以及对应键的值。

**示例**

查询使用 `Map` 类型：

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

结果：

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

使用映射数组查询：

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

返回给定地图的键。

该函数可以通过启用设置 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 来优化。
启用设置后，该函数仅读取 [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列，而不是整个地图。
查询 `SELECT mapKeys(m) FROM table` 被转换为 `SELECT m.keys FROM table`。

**语法**

```sql
mapKeys(map)
```

**参数**

- `map` — 地图。 [Map](../data-types/map.md)。

**返回值**

- 包含所有键的数组 `map`。 [Array](../data-types/array.md)。

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

返回给定键是否包含在给定地图中。

**语法**

```sql
mapContains(map, key)
```

别名： `mapContainsKey(map, key)`

**参数**

- `map` — 地图。 [Map](../data-types/map.md)。
- `key` — 键。类型必须与 `map` 的键类型匹配。

**返回值**

- 如果 `map` 包含 `key`，则返回 `1`，否则返回 `0`。 [UInt8](../data-types/int-uint.md)。

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
- `map` — 地图。 [Map](../data-types/map.md)。
- `pattern`  - 字符串模式以匹配。

**返回值**

- 如果 `map` 包含 `key` 以指定的模式，返回 `1`，否则返回 `0`。

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

给定一个字符串键的地图和一个 LIKE 模式，该函数返回一个映射，其中元素的键与模式匹配。

**语法**

```sql
mapExtractKeyLike(map, pattern)
```

**参数**

- `map` — 地图。 [Map](../data-types/map.md)。
- `pattern`  - 字符串模式以匹配。

**返回值**

- 一个包含键匹配指定模式的元素的地图。如果没有元素匹配该模式，则返回一个空地图。

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

返回给定地图的值。

该函数可以通过启用设置 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 来优化。
启用设置后，该函数仅读取 [values](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列，而不是整个地图。
查询 `SELECT mapValues(m) FROM table` 被转换为 `SELECT m.values FROM table`。

**语法**

```sql
mapValues(map)
```

**参数**

- `map` — 地图。 [Map](../data-types/map.md)。

**返回值**

- 包含所有 `map` 的值的数组。 [Array](../data-types/array.md)。

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

返回给定值是否包含在给定地图中。

**语法**

```sql
mapContainsValue(map, value)
```

别名： `mapContainsValue(map, value)`

**参数**

- `map` — 地图。 [Map](../data-types/map.md)。
- `value` — 值。类型必须与 `map` 的值类型匹配。

**返回值**

- 如果 `map` 包含 `value`，则返回 `1`，否则返回 `0`。 [UInt8](../data-types/int-uint.md)。

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
- `map` — 地图。 [Map](../data-types/map.md)。
- `pattern`  - 字符串模式以匹配。

**返回值**

- 如果 `map` 包含 `value` 以指定的模式，返回 `1`，否则返回 `0`。

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

给定一个字符串值的地图和一个 LIKE 模式，该函数返回一个映射，其中元素的值与模式匹配。

**语法**

```sql
mapExtractValueLike(map, pattern)
```

**参数**

- `map` — 地图。 [Map](../data-types/map.md)。
- `pattern`  - 字符串模式以匹配。

**返回值**

- 一个包含值匹配指定模式的元素的地图。如果没有元素匹配该模式，则返回一个空地图。

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

对地图的每个元素应用一个函数。

**语法**

```sql
mapApply(func, map)
```

**参数**

- `func` — [Lambda function](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返回值**

- 返回一个通过对每个元素应用 `func(map1[i], ..., mapN[i])` 从原始地图获得的地图。

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

通过对每个地图元素应用一个函数来过滤地图。

**语法**

```sql
mapFilter(func, map)
```

**参数**

- `func`  - [Lambda function](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返回值**

- 返回一个只包含 `map` 中的元素的地图，对于这些元素 `func(map1[i], ..., mapN[i])` 返回的值不为 0。

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

- `map1` [Map](../data-types/map.md)。
- `map2` [Map](../data-types/map.md)。

**返回值**

- 返回一个 `map1`，其值更新为 `map2` 中相应键的值。

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

基于键的相等性连接多个映射。
如果在多个输入地图中存在具有相同键的元素，则将所有元素添加到结果地图中，但仅能通过运算符 `[]` 访问第一个元素。

**语法**

```sql
mapConcat(maps)
```

**参数**

-   `maps` – 任意多个 [Maps](../data-types/map.md)。

**返回值**

- 返回一个连接所传入的地图的结果地图。

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

## mapExists(\[func,\], map) {#mapexistsfunc-map}

如果 `map` 中至少存在一个键值对使得 `func(key, value)` 返回的值不为 0，则返回 1。否则，返回 0。

:::note
`mapExists` 是一个 [higher-order function](/sql-reference/functions/overview#higher-order-functions)。
您可以将一个 lambda 函数作为第一个参数传递给它。
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

## mapAll(\[func,\] map) {#mapallfunc-map}

如果 `func(key, value)` 对 `map` 中的所有键值对返回的值不为 0，则返回 1。否则，返回 0。

:::note
请注意，`mapAll` 是一个 [higher-order function](/sql-reference/functions/overview#higher-order-functions)。
您可以将一个 lambda 函数作为第一个参数传递给它。
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

## mapSort(\[func,\], map) {#mapsortfunc-map}

按升序对地图元素进行排序。
如果指定了 `func` 函数，则排序顺序由应用于地图的键和值的 `func` 函数的结果决定。

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

有关更多详细信息，请参见函数 [arraySort](/sql-reference/functions/array-functions#sort) 的参考。

## mapPartialSort {#mappartialsort}

按升序对地图元素进行排序，并附加 `limit` 参数，允许进行部分排序。
如果指定了 `func` 函数，则排序顺序由应用于地图的键和值的 `func` 函数的结果决定。

**语法**

```sql
mapPartialSort([func,] limit, map)
```
**参数**

- `func` – 可选，要应用于地图的键和值的函数。 [Lambda function](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 排序范围内的元素为 [1..limit]。 [(U)Int](../data-types/int-uint.md)。
- `map` – 要排序的地图。 [Map](../data-types/map.md)。

**返回值**

- 部分排序的地图。 [Map](../data-types/map.md)。

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

按降序对地图元素进行排序。
如果指定了 `func` 函数，则排序顺序由应用于地图的键和值的 `func` 函数的结果决定。

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

有关更多详细信息，请参见函数 [arrayReverseSort](/sql-reference/functions/array-functions#arrayreversesort)。

## mapPartialReverseSort {#mappartialreversesort}

按降序对地图元素进行排序，并附加 `limit` 参数，允许进行部分排序。
如果指定了 `func` 函数，则排序顺序由应用于地图的键和值的 `func` 函数的结果决定。

**语法**

```sql
mapPartialReverseSort([func,] limit, map)
```
**参数**

- `func` – 可选，要应用于地图的键和值的函数。 [Lambda function](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 排序范围内的元素为 [1..limit]。 [(U)Int](../data-types/int-uint.md)。
- `map` – 要排序的地图。 [Map](../data-types/map.md)。

**返回值**

- 部分排序的地图。 [Map](../data-types/map.md)。

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
