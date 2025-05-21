---
'description': 'Documentation for Tuple Map Functions'
'sidebar_label': 'Maps'
'sidebar_position': 120
'slug': '/sql-reference/functions/tuple-map-functions'
'title': 'Map Functions'
---



## map {#map}

从键值对创建类型为 [Map(key, value)](../data-types/map.md) 的值。

**语法**

```sql
map(key1, value1[, key2, value2, ...])
```

**参数**

- `key_n` — 映射条目的键。任何类型都可以作为 [Map](../data-types/map.md) 的键类型。
- `value_n` — 映射条目的值。任何类型都可以作为 [Map](../data-types/map.md) 的值类型。

**返回值**

- 一个包含 `key:value` 对的映射。 [Map(key, value)](../data-types/map.md)。

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

根据键的数组或映射及值的数组或映射创建一个映射。

该函数是语法 `CAST([...], 'Map(key_type, value_type)')` 的一种方便替代方案。 
例如，可以写成 `mapFromArrays(['aa', 'bb'], [4, 5])`，而不是写成：
- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`，或
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`。

**语法**

```sql
mapFromArrays(keys, values)
```

别名： `MAP_FROM_ARRAYS(keys, values)`

**参数**

- `keys` — 从中创建映射的键的数组或映射，支持 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。如果 `keys` 是数组，我们接受 `Array(Nullable(T))` 或 `Array(LowCardinality(Nullable(T)))` 作为类型，只要它不包含 NULL 值。
- `values` — 从中创建映射的值的数组或映射，支持 [Array](../data-types/array.md) 或 [Map](../data-types/map.md)。

**返回值**

- 一个由键数组和值数组/映射构造的映射。

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

`mapFromArrays` 也接受类型为 [Map](../data-types/map.md) 的参数。这些参数在执行期间会被转换为元组数组。

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
解析容忍噪声（例如日志文件）。
输入字符串中的键值对由一个键、一个键值分隔符和一个值组成。
键值对由一对分隔符分隔。
键和值可以用引号括起来。

**语法**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character]]])
```

别名：
- `str_to_map`
- `mapFromString`

**参数**

- `data` - 要提取键值对的字符串。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `key_value_delimiter` - 用于分隔键和值的单字符分隔符。默认是 `:`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `pair_delimiters` - 分隔对的字符集合。默认是 ` `, `,` 和 `;`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。
- `quoting_character` - 用作引用字符的单字符。默认是 `"`。[String](../data-types/string.md) 或 [FixedString](../data-types/fixedstring.md)。

**返回值**

- 键值对数组。类型：[Map(String, String)](../data-types/map.md) 

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

使用单引号 `'` 作为引号字符：

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv
```

结果：

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

没有转义序列支持的转义序列：

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

结果：

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

若要恢复用 `toString` 序列化的映射字符串键值对：

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

支持的转义序列：`\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` 和 `\0`。
非标准转义序列将保持原样返回（包括反斜杠），除非它们是以下之一：`\\`, `'`, `"`, `backtick`, `/`, `=` 或 ASCII 控制字符（c &lt;= 31）。

此函数将在预转义和后转义不适用的情况下满足使用情况。例如，考虑以下输入字符串：`a: "aaaa\"bbb"`。预期输出是：`a: aaaa\"bbbb`。
- 预转义：预转义将输出：`a: "aaaa"bbb"`，然后 `extractKeyValuePairs` 将输出：`a: aaaa`
- 后转义：`extractKeyValuePairs` 将输出 `a: aaaa\`，而后转义将保持原样。

键中的前导转义序列将被跳过，并且将被视为值的无效。

**示例**

转义序列支持转义序列支持开启时：

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

收集所有键并求和相应的值。

**语法**

```sql
mapAdd(arg1, arg2 [, ...])
```

**参数**

参数是 [maps](../data-types/map.md) 或两个 [arrays](/sql-reference/data-types/array) 的 [tuples](/sql-reference/data-types/tuple)，第一个数组的项表示键，第二个数组包含每个键的值。所有的键数组应具有相同类型，所有的值数组应包含可以提升到一种类型的项（[Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float)）。公共提升的类型被用作结果数组的类型。

**返回值**

- 根据参数返回一个 [map](../data-types/map.md) 或 [tuple](/sql-reference/data-types/tuple)，其中第一个数组包含排序后的键，第二个数组包含值。

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

参数是 [maps](../data-types/map.md) 或两个 [arrays](/sql-reference/data-types/array) 的 [tuples](/sql-reference/data-types/tuple)，第一个数组的项表示键，第二个数组包含每个键的值。所有的键数组应具有相同类型，所有的值数组应包含可以提升到一种类型的项（[Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) 或 [Float64](/sql-reference/data-types/float)）。公共提升的类型被用作结果数组的类型。

**返回值**

- 根据参数返回一个 [map](../data-types/map.md) 或 [tuple](/sql-reference/data-types/tuple)，其中第一个数组包含排序后的键，第二个数组包含值。

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

具有元组映射的查询：

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

使用整数键填充映射中的缺失键值对。
为支持超出最大值的键扩展，可以指定一个最大键。
更具体地，该函数返回一个映射，其中键由最小到最大键（或如果指定，则为 `max` 参数）形成，步长为 1，以及相应的值。
如果没有为某个键指定值，则使用默认值作为值。
如果键重复，则仅将第一个值（按出现顺序）与该键关联。

**语法**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

对于数组参数，`keys` 和 `values` 中的元素数量必须对于每行相同。

**参数**

参数是 [Maps](../data-types/map.md) 或两个 [Arrays](/sql-reference/data-types/array)，其中第一个和第二个数组包含每个键的键和值。

映射数组：

- `map` — 具有整数键的映射。[Map](../data-types/map.md)。

或

- `keys` — 键的数组。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `values` — 值的数组。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `max` — 最大键值。可选。[Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

- 根据参数，返回一个 [Map](../data-types/map.md) 或两个 [Arrays](/sql-reference/data-types/array) 的 [Tuple](/sql-reference/data-types/tuple)：已排序的键和相应键的值。

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

使用映射数组的查询：

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

返回给定映射的键。

通过启用设置 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 可以优化此函数。
启用设置后，该函数仅读取 [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列，而不是整个映射。
查询 `SELECT mapKeys(m) FROM table` 会被转换为 `SELECT m.keys FROM table`。

**语法**

```sql
mapKeys(map)
```

**参数**

- `map` — 映射。[Map](../data-types/map.md)。

**返回值**

- 包含来自 `map` 的所有键的数组。[Array](../data-types/array.md)。

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

返回给定映射是否包含给定键。

**语法**

```sql
mapContains(map, key)
```

别名：`mapContainsKey(map, key)`

**参数**

- `map` — 映射。[Map](../data-types/map.md)。
- `key` — 键。类型必须与 `map` 的键类型匹配。

**返回值**

- 如果 `map` 包含 `key`，则返回 `1`；否则返回 `0`。[UInt8](../data-types/int-uint.md)。

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
- `map` — 映射。[Map](../data-types/map.md)。
- `pattern` — 要匹配的字符串模式。

**返回值**

- 如果 `map` 包含与指定模式匹配的 `key`，则返回 `1`；否则返回 `0`。

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

给定一个具有字符串键和一个 LIKE 模式的映射，该函数返回一个映射，元素的键与模式匹配。

**语法**

```sql
mapExtractKeyLike(map, pattern)
```

**参数**

- `map` — 映射。[Map](../data-types/map.md)。
- `pattern` — 要匹配的字符串模式。

**返回值**

- 一个包含元素的映射，其键匹配指定模式。如果没有元素匹配该模式，则返回一个空映射。

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

返回给定映射的值。

通过启用设置 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 可以优化此函数。
启用设置后，该函数仅读取 [values](/sql-reference/data-types/map#reading-subcolumns-of-map) 子列，而不是整个映射。
查询 `SELECT mapValues(m) FROM table` 会被转换为 `SELECT m.values FROM table`。

**语法**

```sql
mapValues(map)
```

**参数**

- `map` — 映射。[Map](../data-types/map.md)。

**返回值**

- 包含来自 `map` 的所有值的数组。[Array](../data-types/array.md)。

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

返回给定映射是否包含给定值。

**语法**

```sql
mapContainsValue(map, value)
```

别名：`mapContainsValue(map, value)`

**参数**

- `map` — 映射。[Map](../data-types/map.md)。
- `value` — 值。类型必须与 `map` 的值类型匹配。

**返回值**

- 如果 `map` 包含 `value`，则返回 `1`；否则返回 `0`。[UInt8](../data-types/int-uint.md)。

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
- `map` — 映射。[Map](../data-types/map.md)。
- `pattern` — 要匹配的字符串模式。

**返回值**

- 如果 `map` 包含与指定模式匹配的 `value`，则返回 `1`；否则返回 `0`。

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

给定一个具有字符串值和一个 LIKE 模式的映射，该函数返回一个映射，元素的值与模式匹配。

**语法**

```sql
mapExtractValueLike(map, pattern)
```

**参数**

- `map` — 映射。[Map](../data-types/map.md)。
- `pattern` — 要匹配的字符串模式。

**返回值**

- 一个包含元素的映射，其值匹配指定模式。如果没有元素匹配该模式，则返回一个空映射。

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

对映射的每个元素应用一个函数。

**语法**

```sql
mapApply(func, map)
```

**参数**

- `func` — [Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返回值**

- 返回通过对每个元素应用 `func(map1[i], ..., mapN[i])` 从原始映射获得的映射。

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

通过对每个映射元素应用函数来过滤映射。

**语法**

```sql
mapFilter(func, map)
```

**参数**

- `func`  - [Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返回值**

- 返回一个仅包含 `map` 中满足 `func(map1[i], ..., mapN[i])` 返回非零值的元素的映射。

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

- 返回一个 `map1`，其对应键在 `map2` 中的值被更新。

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

根据键的相等性连接多个映射。
如果在多个输入映射中存在具有相同键的元素，则所有元素都会添加到结果映射中，但只有第一个可以通过操作符 `[]` 访问。

**语法**

```sql
mapConcat(maps)
```

**参数**

-   `maps` – 任意多个 [Maps](../data-types/map.md)。

**返回值**

- 返回一个经过连接的映射，作为参数传递的映射将被合并。

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

如果在 `map` 中至少存在一个键值对使得 `func(key, value)` 返回非零值，则返回 1。否则返回 0。

:::note
`mapExists` 是一个 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。
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

如果 `func(key, value)` 对 `map` 中的所有键值对返回非零值，则返回 1。否则返回 0。

:::note
请注意，`mapAll` 是一个 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。
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

按升序对映射的元素进行排序。
如果指定了 `func` 函数，则排序顺序由应用于映射的键和值的 `func` 函数的结果决定。

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

有关详细信息，请参阅 `arraySort` 函数的 [参考]( /sql-reference/functions/array-functions#sort)。

## mapPartialSort {#mappartialsort}

按升序对映射的元素进行排序，并允许附加的 `limit` 参数进行部分排序。
如果指定了 `func` 函数，则排序顺序由应用于映射的键和值的 `func` 函数的结果决定。

**语法**

```sql
mapPartialSort([func,] limit, map)
```
**参数**

- `func` – 可选的函数，用于应用于映射的键和值。[Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 范围 [1..limit] 内的元素会被排序。[(U)Int](../data-types/int-uint.md)。
- `map` – 要排序的映射。[Map](../data-types/map.md)。

**返回值**

- 部分排序的映射。[Map](../data-types/map.md)。

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

按降序对映射的元素进行排序。
如果指定了 `func` 函数，则排序顺序由应用于映射的键和值的 `func` 函数的结果决定。

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

有关详细信息，请参阅函数 [arrayReverseSort](/sql-reference/functions/array-functions#arrayreversesort)。

## mapPartialReverseSort {#mappartialreversesort}

按降序对映射的元素进行排序，并允许附加的 `limit` 参数进行部分排序。
如果指定了 `func` 函数，则排序顺序由应用于映射的键和值的 `func` 函数的结果决定。

**语法**

```sql
mapPartialReverseSort([func,] limit, map)
```
**参数**

- `func` – 可选的函数，用于应用于映射的键和值。[Lambda 函数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 范围 [1..limit] 内的元素会被排序。[(U)Int](../data-types/int-uint.md)。
- `map` – 要排序的映射。[Map](../data-types/map.md)。

**返回值**

- 部分排序的映射。[Map](../data-types/map.md)。

**示例**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```
