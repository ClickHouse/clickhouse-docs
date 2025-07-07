---
'description': 'ClickHouse 中 Dynamic 数据类型的文档，该类型可以在单个列中存储不同类型的值'
'sidebar_label': '动态'
'sidebar_position': 62
'slug': '/sql-reference/data-types/dynamic'
'title': '动态'
---


# Dynamic

这种类型允许在内部存储任何类型的值，而无需事先知道它们的所有类型。

要声明一个 `Dynamic` 类型的列，请使用以下语法：

```sql
<column_name> Dynamic(max_types=N)
```

其中 `N` 是一个可选参数，范围在 `0` 到 `254` 之间，指示在一个 `Dynamic` 类型的列内，能够作为独立子列存储的不同数据类型数量，该列跨单个存储在单独数据块中的数据（例如，跨 MergeTree 表的单个数据部分）。如果超过此限制，所有具有新类型的值将一起存储在一个特殊的共享数据结构中，以二进制形式存储。`max_types` 的默认值为 `32`。

## Creating Dynamic {#creating-dynamic}

在表列定义中使用 `Dynamic` 类型：

```sql
CREATE TABLE test (d Dynamic) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ          │ None           │
│ 42            │ Int64          │
│ Hello, World! │ String         │
│ [1,2,3]       │ Array(Int64)   │
└───────────────┴────────────────┘
```

使用 CAST 从普通列：

```sql
SELECT 'Hello, World!'::Dynamic as d, dynamicType(d);
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ Hello, World! │ String         │
└───────────────┴────────────────┘
```

使用 CAST 从 `Variant` 列：

```sql
SET enable_variant_type = 1, use_variant_as_common_type = 1;
SELECT multiIf((number % 3) = 0, number, (number % 3) = 1, range(number + 1), NULL)::Dynamic AS d, dynamicType(d) FROM numbers(3)
```

```text
┌─d─────┬─dynamicType(d)─┐
│ 0     │ UInt64         │
│ [0,1] │ Array(UInt64)  │
│ ᴺᵁᴸᴸ  │ None           │
└───────┴────────────────┘
```


## Reading Dynamic nested types as subcolumns {#reading-dynamic-nested-types-as-subcolumns}

`Dynamic` 类型支持使用类型名称作为子列，从 `Dynamic` 列中读取单个嵌套类型。
因此，如果您有列 `d Dynamic`，您可以使用语法 `d.T` 来读取任何有效类型 `T` 的子列，
该子列将具有类型 `Nullable(T)`，如果 `T` 可以在 `Nullable` 内部；否则为 `T`。该子列的大小
将与原始 `Dynamic` 列相同，并且在原始 `Dynamic` 列没有类型 `T` 的所有行中将包含 `NULL` 值（或者如果 `T` 不能在 `Nullable` 内部，则包含空值）。

`Dynamic` 子列也可以使用函数 `dynamicElement(dynamic_column, type_name)` 进行读取。

示例：

```sql
CREATE TABLE test (d Dynamic) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT d, dynamicType(d), d.String, d.Int64, d.`Array(Int64)`, d.Date, d.`Array(String)` FROM test;
```

```text
┌─d─────────────┬─dynamicType(d)─┬─d.String──────┬─d.Int64─┬─d.Array(Int64)─┬─d.Date─┬─d.Array(String)─┐
│ ᴺᵁᴸᴸ          │ None           │ ᴺᵁᴸᴸ          │    ᴺᵁᴸᴸ │ []             │   ᴺᵁᴸᴸ │ []              │
│ 42            │ Int64          │ ᴺᵁᴸᴸ          │      42 │ []             │   ᴺᵁᴸᴸ │ []              │
│ Hello, World! │ String         │ Hello, World! │    ᴺᵁᴸᴸ │ []             │   ᴺᵁᴸᴸ │ []              │
│ [1,2,3]       │ Array(Int64)   │ ᴺᵁᴸᴸ          │    ᴺᵁᴸᴸ │ [1,2,3]        │   ᴺᵁᴸᴸ │ []              │
└───────────────┴────────────────┴───────────────┴─────────┴────────────────┴────────┴─────────────────┘
```

```sql
SELECT toTypeName(d.String), toTypeName(d.Int64), toTypeName(d.`Array(Int64)`), toTypeName(d.Date), toTypeName(d.`Array(String)`)  FROM test LIMIT 1;
```

```text
┌─toTypeName(d.String)─┬─toTypeName(d.Int64)─┬─toTypeName(d.Array(Int64))─┬─toTypeName(d.Date)─┬─toTypeName(d.Array(String))─┐
│ Nullable(String)     │ Nullable(Int64)     │ Array(Int64)               │ Nullable(Date)     │ Array(String)               │
└──────────────────────┴─────────────────────┴────────────────────────────┴────────────────────┴─────────────────────────────┘
```

```sql
SELECT d, dynamicType(d), dynamicElement(d, 'String'), dynamicElement(d, 'Int64'), dynamicElement(d, 'Array(Int64)'), dynamicElement(d, 'Date'), dynamicElement(d, 'Array(String)') FROM test;```
```

```text
┌─d─────────────┬─dynamicType(d)─┬─dynamicElement(d, 'String')─┬─dynamicElement(d, 'Int64')─┬─dynamicElement(d, 'Array(Int64)')─┬─dynamicElement(d, 'Date')─┬─dynamicElement(d, 'Array(String)')─┐
│ ᴺᵁᴸᴸ          │ None           │ ᴺᵁᴸᴸ                        │                       ᴺᵁᴸᴸ │ []                                │                      ᴺᵁᴸᴸ │ []                                 │
│ 42            │ Int64          │ ᴺᵁᴸᴸ                        │                         42 │ []                                │                      ᴺᵁᴸᴸ │ []                                 │
│ Hello, World! │ String         │ Hello, World!               │                       ᴺᵁᴸᴸ │ []                                │                      ᴺᵁᴸᴸ │ []                                 │
│ [1,2,3]       │ Array(Int64)   │ ᴺᵁᴸᴸ                        │                       ᴺᵁᴸᴸ │ [1,2,3]                           │                      ᴺᵁᴸᴸ │ []                                 │
└───────────────┴────────────────┴─────────────────────────────┴────────────────────────────┴───────────────────────────────────┴───────────────────────────┴────────────────────────────────────┘
```

要知道每行存储的变体，可以使用函数 `dynamicType(dynamic_column)`。它返回每行的值类型名称的 `String`（如果行是 `NULL`，则返回 `'None'`）。

示例：

```sql
CREATE TABLE test (d Dynamic) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT dynamicType(d) from test;
```

```text
┌─dynamicType(d)─┐
│ None           │
│ Int64          │
│ String         │
│ Array(Int64)   │
└────────────────┘
```

## Conversion between Dynamic column and other columns {#conversion-between-dynamic-column-and-other-columns}

可以对 `Dynamic` 列进行四种可能的转换。

### Converting an ordinary column to a Dynamic column {#converting-an-ordinary-column-to-a-dynamic-column}

```sql
SELECT 'Hello, World!'::Dynamic as d, dynamicType(d);
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ Hello, World! │ String         │
└───────────────┴────────────────┘
```

### Converting a String column to a Dynamic column through parsing {#converting-a-string-column-to-a-dynamic-column-through-parsing}

要从 `String` 列解析 `Dynamic` 类型值，您可以启用设置 `cast_string_to_dynamic_use_inference`：

```sql
SET cast_string_to_dynamic_use_inference = 1;
SELECT CAST(materialize(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01')), 'Map(String, Dynamic)') as map_of_dynamic, mapApply((k, v) -> (k, dynamicType(v)), map_of_dynamic) as map_of_dynamic_types;
```

```text
┌─map_of_dynamic──────────────────────────────┬─map_of_dynamic_types─────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'Int64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### Converting a Dynamic column to an ordinary column {#converting-a-dynamic-column-to-an-ordinary-column}

可以将 `Dynamic` 列转换为普通列。在这种情况下，所有嵌套类型将被转换为目标类型：

```sql
CREATE TABLE test (d Dynamic) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('42.42'), (true), ('e10');
SELECT d::Nullable(Float64) FROM test;
```

```text
┌─CAST(d, 'Nullable(Float64)')─┐
│                         ᴺᵁᴸᴸ │
│                           42 │
│                        42.42 │
│                            1 │
│                            0 │
└──────────────────────────────┘
```

### Converting a Variant column to Dynamic column {#converting-a-variant-column-to-dynamic-column}

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('String'), ([1, 2, 3]);
SELECT v::Dynamic as d, dynamicType(d) from test; 
```

```text
┌─d───────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ    │ None           │
│ 42      │ UInt64         │
│ String  │ String         │
│ [1,2,3] │ Array(UInt64)  │
└─────────┴────────────────┘
```

### Converting a Dynamic(max_types=N) column to another Dynamic(max_types=K) {#converting-a-dynamicmax_typesn-column-to-another-dynamicmax_typesk}

如果 `K >= N`，那么在转换过程中数据不会改变：

```sql
CREATE TABLE test (d Dynamic(max_types=3)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), (43), ('42.42'), (true);
SELECT d::Dynamic(max_types=5) as d2, dynamicType(d2) FROM test;
```

```text
┌─d─────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ  │ None           │
│ 42    │ Int64          │
│ 43    │ Int64          │
│ 42.42 │ String         │
│ true  │ Bool           │
└───────┴────────────────┘
```

如果 `K < N`，则具有最稀有类型的值将被插入到单个特殊子列中，但仍然可以访问：
```text
CREATE TABLE test (d Dynamic(max_types=4)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), (43), ('42.42'), (true), ([1, 2, 3]);
SELECT d, dynamicType(d), d::Dynamic(max_types=2) as d2, dynamicType(d2), isDynamicElementInSharedData(d2) FROM test;
```

```text
┌─d───────┬─dynamicType(d)─┬─d2──────┬─dynamicType(d2)─┬─isDynamicElementInSharedData(d2)─┐
│ ᴺᵁᴸᴸ    │ None           │ ᴺᵁᴸᴸ    │ None            │ false                            │
│ 42      │ Int64          │ 42      │ Int64           │ false                            │
│ 43      │ Int64          │ 43      │ Int64           │ false                            │
│ 42.42   │ String         │ 42.42   │ String          │ false                            │
│ true    │ Bool           │ true    │ Bool            │ true                             │
│ [1,2,3] │ Array(Int64)   │ [1,2,3] │ Array(Int64)    │ true                             │
└─────────┴────────────────┴─────────┴─────────────────┴──────────────────────────────────┘
```

函数 `isDynamicElementInSharedData` 对存储在 `Dynamic` 内部特殊共享数据结构中的行返回 `true`，如我们所见，结果列仅包含未存储在共享数据结构中的 2 种类型。

如果 `K=0`，所有类型将被插入到单个特殊子列中：

```text
CREATE TABLE test (d Dynamic(max_types=4)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), (43), ('42.42'), (true), ([1, 2, 3]);
SELECT d, dynamicType(d), d::Dynamic(max_types=0) as d2, dynamicType(d2), isDynamicElementInSharedData(d2) FROM test;
```

```text
┌─d───────┬─dynamicType(d)─┬─d2──────┬─dynamicType(d2)─┬─isDynamicElementInSharedData(d2)─┐
│ ᴺᵁᴸᴸ    │ None           │ ᴺᵁᴸᴸ    │ None            │ false                            │
│ 42      │ Int64          │ 42      │ Int64           │ true                             │
│ 43      │ Int64          │ 43      │ Int64           │ true                             │
│ 42.42   │ String         │ 42.42   │ String          │ true                             │
│ true    │ Bool           │ true    │ Bool            │ true                             │
│ [1,2,3] │ Array(Int64)   │ [1,2,3] │ Array(Int64)    │ true                             │
└─────────┴────────────────┴─────────┴─────────────────┴──────────────────────────────────┘
```

## Reading Dynamic type from the data {#reading-dynamic-type-from-the-data}

所有文本格式（TSV, CSV, CustomSeparated, Values, JSONEachRow 等）支持读取 `Dynamic` 类型。在数据解析过程中，ClickHouse 尝试推断每个值的类型并在插入到 `Dynamic` 列时使用它。

示例：

```sql
SELECT
    d,
    dynamicType(d),
    dynamicElement(d, 'String') AS str,
    dynamicElement(d, 'Int64') AS num,
    dynamicElement(d, 'Float64') AS float,
    dynamicElement(d, 'Date') AS date,
    dynamicElement(d, 'Array(Int64)') AS arr
FROM format(JSONEachRow, 'd Dynamic', $$
{"d" : "Hello, World!"},
{"d" : 42},
{"d" : 42.42},
{"d" : "2020-01-01"},
{"d" : [1, 2, 3]}
$$)
```

```text
┌─d─────────────┬─dynamicType(d)─┬─str───────────┬──num─┬─float─┬───────date─┬─arr─────┐
│ Hello, World! │ String         │ Hello, World! │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │       ᴺᵁᴸᴸ │ []      │
│ 42            │ Int64          │ ᴺᵁᴸᴸ          │   42 │  ᴺᵁᴸᴸ │       ᴺᵁᴸᴸ │ []      │
│ 42.42         │ Float64        │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │ 42.42 │       ᴺᵁᴸᴸ │ []      │
│ 2020-01-01    │ Date           │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │ 2020-01-01 │ []      │
│ [1,2,3]       │ Array(Int64)   │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │       ᴺᵁᴸᴸ │ [1,2,3] │
└───────────────┴────────────────┴───────────────┴──────┴───────┴────────────┴─────────┘
```

## Using Dynamic type in functions {#using-dynamic-type-in-functions}

大多数函数支持类型为 `Dynamic` 的参数。在这种情况下，该函数将分别在存储在 `Dynamic` 列内部的每种内部数据类型上执行。
当函数的结果类型依赖于参数类型时，使用 `Dynamic` 参数执行的结果将是 `Dynamic`。当函数的结果类型不依赖于参数类型时，结果将是 `Nullable(T)`，其中 `T` 是该函数的常规结果类型。

示例：

```sql
CREATE TABLE test (d Dynamic) ENGINE=Memory;
INSERT INTO test VALUES (NULL), (1::Int8), (2::Int16), (3::Int32), (4::Int64);
```

```sql
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ │ None           │
│ 1    │ Int8           │
│ 2    │ Int16          │
│ 3    │ Int32          │
│ 4    │ Int64          │
└──────┴────────────────┘
```

```sql
SELECT d, d + 1 AS res, toTypeName(res), dynamicType(res) FROM test;
```

```text
┌─d────┬─res──┬─toTypeName(res)─┬─dynamicType(res)─┐
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Dynamic         │ None             │
│ 1    │ 2    │ Dynamic         │ Int16            │
│ 2    │ 3    │ Dynamic         │ Int32            │
│ 3    │ 4    │ Dynamic         │ Int64            │
│ 4    │ 5    │ Dynamic         │ Int64            │
└──────┴──────┴─────────────────┴──────────────────┘
```

```sql
SELECT d, d + d AS res, toTypeName(res), dynamicType(res) FROM test;
```

```text
┌─d────┬─res──┬─toTypeName(res)─┬─dynamicType(res)─┐
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Dynamic         │ None             │
│ 1    │ 2    │ Dynamic         │ Int16            │
│ 2    │ 4    │ Dynamic         │ Int32            │
│ 3    │ 6    │ Dynamic         │ Int64            │
│ 4    │ 8    │ Dynamic         │ Int64            │
└──────┴──────┴─────────────────┴──────────────────┘
```

```sql
SELECT d, d < 3 AS res, toTypeName(res) FROM test;
```

```text
┌─d────┬──res─┬─toTypeName(res)─┐
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Nullable(UInt8) │
│ 1    │    1 │ Nullable(UInt8) │
│ 2    │    1 │ Nullable(UInt8) │
│ 3    │    0 │ Nullable(UInt8) │
│ 4    │    0 │ Nullable(UInt8) │
└──────┴──────┴─────────────────┘
```

```sql
SELECT d, exp2(d) AS res, toTypeName(res) FROM test;
```

```sql
┌─d────┬──res─┬─toTypeName(res)───┐
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │ Nullable(Float64) │
│ 1    │    2 │ Nullable(Float64) │
│ 2    │    4 │ Nullable(Float64) │
│ 3    │    8 │ Nullable(Float64) │
│ 4    │   16 │ Nullable(Float64) │
└──────┴──────┴───────────────────┘
```

```sql
TRUNCATE TABLE test;
INSERT INTO test VALUES (NULL), ('str_1'), ('str_2');
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d─────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ  │ None           │
│ str_1 │ String         │
│ str_2 │ String         │
└───────┴────────────────┘
```

```sql
SELECT d, upper(d) AS res, toTypeName(res) FROM test;
```

```text
┌─d─────┬─res───┬─toTypeName(res)──┐
│ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ  │ Nullable(String) │
│ str_1 │ STR_1 │ Nullable(String) │
│ str_2 │ STR_2 │ Nullable(String) │
└───────┴───────┴──────────────────┘
```

```sql
SELECT d, extract(d, '([0-3])') AS res, toTypeName(res) FROM test;
```

```text
┌─d─────┬─res──┬─toTypeName(res)──┐
│ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ │ Nullable(String) │
│ str_1 │ 1    │ Nullable(String) │
│ str_2 │ 2    │ Nullable(String) │
└───────┴──────┴──────────────────┘
```

```sql
TRUNCATE TABLE test;
INSERT INTO test VALUES (NULL), ([1, 2]), ([3, 4]);
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d─────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ  │ None           │
│ [1,2] │ Array(Int64)   │
│ [3,4] │ Array(Int64)   │
└───────┴────────────────┘
```

```sql
SELECT d, d[1] AS res, toTypeName(res), dynamicType(res) FROM test;
```

```text
┌─d─────┬─res──┬─toTypeName(res)─┬─dynamicType(res)─┐
│ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ │ Dynamic         │ None             │
│ [1,2] │ 1    │ Dynamic         │ Int64            │
│ [3,4] │ 3    │ Dynamic         │ Int64            │
└───────┴──────┴─────────────────┴──────────────────┘
```

如果函数无法在 `Dynamic` 列中的某个类型上执行，将抛出异常：

```sql
INSERT INTO test VALUES (42), (43), ('str_1');
SELECT d, dynamicType(d) FROM test;
```


```text
┌─d─────┬─dynamicType(d)─┐
│ 42    │ Int64          │
│ 43    │ Int64          │
│ str_1 │ String         │
└───────┴────────────────┘
┌─d─────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ  │ None           │
│ [1,2] │ Array(Int64)   │
│ [3,4] │ Array(Int64)   │
└───────┴────────────────┘
```

```sql
SELECT d, d + 1 AS res, toTypeName(res), dynamicType(d) FROM test;
```

```text
Received exception:
Code: 43. DB::Exception: Illegal types Array(Int64) and UInt8 of arguments of function plus: while executing 'FUNCTION plus(__table1.d : 3, 1_UInt8 :: 1) -> plus(__table1.d, 1_UInt8) Dynamic : 0'. (ILLEGAL_TYPE_OF_ARGUMENT)
```

我们可以过滤掉不需要的类型：

```sql
SELECT d, d + 1 AS res, toTypeName(res), dynamicType(res) FROM test WHERE dynamicType(d) NOT IN ('String', 'Array(Int64)', 'None')
```

```text
┌─d──┬─res─┬─toTypeName(res)─┬─dynamicType(res)─┐
│ 42 │ 43  │ Dynamic         │ Int64            │
│ 43 │ 44  │ Dynamic         │ Int64            │
└────┴─────┴─────────────────┴──────────────────┘
```

或提取所需类型作为子列：

```sql
SELECT d, d.Int64 + 1 AS res, toTypeName(res) FROM test;
```

```text
┌─d─────┬──res─┬─toTypeName(res)─┐
│ 42    │   43 │ Nullable(Int64) │
│ 43    │   44 │ Nullable(Int64) │
│ str_1 │ ᴺᵁᴸᴸ │ Nullable(Int64) │
└───────┴──────┴─────────────────┘
┌─d─────┬──res─┬─toTypeName(res)─┐
│ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ │ Nullable(Int64) │
│ [1,2] │ ᴺᵁᴸᴸ │ Nullable(Int64) │
│ [3,4] │ ᴺᵁᴸᴸ │ Nullable(Int64) │
└───────┴──────┴─────────────────┘
```

## Using Dynamic type in ORDER BY and GROUP BY {#using-dynamic-type-in-order-by-and-group-by}

在 `ORDER BY` 和 `GROUP BY` 期间，`Dynamic` 类型的值与 `Variant` 类型的值的比较方式相同：
操作符 `<` 对于值 `d1`（底层类型为 `T1`）和 `d2`（底层类型为 `T2`）的 `Dynamic` 类型的结果定义如下：
- 如果 `T1 = T2 = T`，结果将是 `d1.T < d2.T`（基础值将被比较）。
- 如果 `T1 != T2`，结果将是 `T1 < T2`（类型名称将被比较）。

默认情况下，`GROUP BY`/`ORDER BY` 键中不允许使用 `Dynamic` 类型，如果您想使用它，请考虑其特殊比较规则，并启用 `allow_suspicious_types_in_group_by`/`allow_suspicious_types_in_order_by` 设置。

示例：
```sql
CREATE TABLE test (d Dynamic) ENGINE=Memory;
INSERT INTO test VALUES (42), (43), ('abc'), ('abd'), ([1, 2, 3]), ([]), (NULL);
```

```sql
SELECT d, dynamicType(d) FROM test;
```

```text
┌─d───────┬─dynamicType(d)─┐
│ 42      │ Int64          │
│ 43      │ Int64          │
│ abc     │ String         │
│ abd     │ String         │
│ [1,2,3] │ Array(Int64)   │
│ []      │ Array(Int64)   │
│ ᴺᵁᴸᴸ    │ None           │
└─────────┴────────────────┘
```

```sql
SELECT d, dynamicType(d) FROM test ORDER BY d SETTINGS allow_suspicious_types_in_order_by=1;
```

```sql
┌─d───────┬─dynamicType(d)─┐
│ []      │ Array(Int64)   │
│ [1,2,3] │ Array(Int64)   │
│ 42      │ Int64          │
│ 43      │ Int64          │
│ abc     │ String         │
│ abd     │ String         │
│ ᴺᵁᴸᴸ    │ None           │
└─────────┴────────────────┘
```

**注意：**具有不同数值类型的动态类型值被视为不同的值，并且不会相互比较，而是比较它们的类型名称。

示例：

```sql
CREATE TABLE test (d Dynamic) ENGINE=Memory;
INSERT INTO test VALUES (1::UInt32), (1::Int64), (100::UInt32), (100::Int64);
SELECT d, dynamicType(d) FROM test ORDER BY d SETTINGS allow_suspicious_types_in_order_by=1;
```

```text
┌─v───┬─dynamicType(v)─┐
│ 1   │ Int64          │
│ 100 │ Int64          │
│ 1   │ UInt32         │
│ 100 │ UInt32         │
└─────┴────────────────┘
```

```sql
SELECT d, dynamicType(d) FROM test GROUP by d SETTINGS allow_suspicious_types_in_group_by=1;
```

```text
┌─d───┬─dynamicType(d)─┐
│ 1   │ Int64          │
│ 100 │ UInt32         │
│ 1   │ UInt32         │
│ 100 │ Int64          │
└─────┴────────────────┘
```

**注意：**所描述的比较规则在执行比较函数时并不适用，例如 `<`/`>`/`=` 等，因为 [特殊工作](#using-dynamic-type-in-functions) 的函数具有 `Dynamic` 类型。

## Reaching the limit in number of different data types stored inside Dynamic {#reaching-the-limit-in-number-of-different-data-types-stored-inside-dynamic}

`Dynamic` 数据类型只能存储有限数量的不同数据类型作为独立子列。默认情况下，这个限制是 `32`，但您可以在类型声明中使用语法 `Dynamic(max_types=N)` 来更改它，其中 N 的范围在 0 到 254 之间（由于实现细节，无法存储超过 254 种不同数据类型作为独立子列）。
当达到限制时，所有插入到 `Dynamic` 列的新数据类型将插入到一个共享数据结构中，该结构以二进制形式存储具有不同数据类型的值。

让我们看看当达到限制时在不同场景下会发生什么。

### Reaching the limit during data parsing {#reaching-the-limit-during-data-parsing}

在从数据解析 `Dynamic` 值的过程中，当当前数据块达到限制时，所有新值将插入到共享数据结构中：

```sql
SELECT d, dynamicType(d), isDynamicElementInSharedData(d) FROM format(JSONEachRow, 'd Dynamic(max_types=3)', '
{"d" : 42}
{"d" : [1, 2, 3]}
{"d" : "Hello, World!"}
{"d" : "2020-01-01"}
{"d" : ["str1", "str2", "str3"]}
{"d" : {"a" : 1, "b" : [1, 2, 3]}}
')
```

```text
┌─d──────────────────────┬─dynamicType(d)─────────────────┬─isDynamicElementInSharedData(d)─┐
│ 42                     │ Int64                          │ false                           │
│ [1,2,3]                │ Array(Int64)                   │ false                           │
│ Hello, World!          │ String                         │ false                           │
│ 2020-01-01             │ Date                           │ true                            │
│ ['str1','str2','str3'] │ Array(String)                  │ true                            │
│ (1,[1,2,3])            │ Tuple(a Int64, b Array(Int64)) │ true                            │
└────────────────────────┴────────────────────────────────┴─────────────────────────────────┘
```

如我们所见，插入 3 种不同的数据类型 `Int64`、`Array(Int64)` 和 `String` 后，所有新类型均被插入到特殊共享数据结构中。

### During merges of data parts in MergeTree table engines {#during-merges-of-data-parts-in-mergetree-table-engines}

在 MergeTree 表中合并多个数据部分时，结果数据部分中的 `Dynamic` 列可能达到可以存储在独立子列中的不同数据类型的限制，并且将无法存储所有来自源部分的类型作为子列。
在这种情况下，ClickHouse 将选择哪些类型在合并后保持为独立子列，哪些类型将插入到共享数据结构中。在大多数情况下，ClickHouse 尝试保留最常见的类型，并将最稀有的类型存储在共享数据结构中，但这取决于具体实现。

让我们看看这样的合并示例。首先，让我们创建一个带有 `Dynamic` 列的表，将不同数据类型的限制设置为 `3`，并插入具有 `5` 种不同类型的值：

```sql
CREATE TABLE test (id UInt64, d Dynamic(max_types=3)) engine=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, number FROM numbers(5);
INSERT INTO test SELECT number, range(number) FROM numbers(4);
INSERT INTO test SELECT number, toDate(number) FROM numbers(3);
INSERT INTO test SELECT number, map(number, number) FROM numbers(2);
INSERT INTO test SELECT number, 'str_' || toString(number) FROM numbers(1);
```

每次插入将创建一个包含单一类型的独立数据部分：
```sql
SELECT count(), dynamicType(d), isDynamicElementInSharedData(d), _part FROM test GROUP BY _part, dynamicType(d), isDynamicElementInSharedData(d) ORDER BY _part, count();
```

```text
┌─count()─┬─dynamicType(d)──────┬─isDynamicElementInSharedData(d)─┬─_part─────┐
│       5 │ UInt64              │ false                           │ all_1_1_0 │
│       4 │ Array(UInt64)       │ false                           │ all_2_2_0 │
│       3 │ Date                │ false                           │ all_3_3_0 │
│       2 │ Map(UInt64, UInt64) │ false                           │ all_4_4_0 │
│       1 │ String              │ false                           │ all_5_5_0 │
└─────────┴─────────────────────┴─────────────────────────────────┴───────────┘
```

现在，让我们将所有部分合并为一个并看看会发生什么：

```sql
SYSTEM START MERGES test;
OPTIMIZE TABLE test FINAL;
SELECT count(), dynamicType(d), isDynamicElementInSharedData(d), _part FROM test GROUP BY _part, dynamicType(d), isDynamicElementInSharedData(d) ORDER BY _part, count() desc;
```

```text
┌─count()─┬─dynamicType(d)──────┬─isDynamicElementInSharedData(d)─┬─_part─────┐
│       5 │ UInt64              │ false                           │ all_1_5_2 │
│       4 │ Array(UInt64)       │ false                           │ all_1_5_2 │
│       3 │ Date                │ false                           │ all_1_5_2 │
│       2 │ Map(UInt64, UInt64) │ true                            │ all_1_5_2 │
│       1 │ String              │ true                            │ all_1_5_2 │
└─────────┴─────────────────────┴─────────────────────────────────┴───────────┘
```

如我们所见，ClickHouse 保留了最常见的类型 `UInt64` 和 `Array(UInt64)` 作为子列，并将所有其他类型插入到共享数据中。

## JSONExtract functions with Dynamic {#jsonextract-functions-with-dynamic}

所有 `JSONExtract*` 函数支持 `Dynamic` 类型：

```sql
SELECT JSONExtract('{"a" : [1, 2, 3]}', 'a', 'Dynamic') AS dynamic, dynamicType(dynamic) AS dynamic_type;
```

```text
┌─dynamic─┬─dynamic_type───────────┐
│ [1,2,3] │ Array(Nullable(Int64)) │
└─────────┴────────────────────────┘
```

```sql
SELECT JSONExtract('{"obj" : {"a" : 42, "b" : "Hello", "c" : [1,2,3]}}', 'obj', 'Map(String, Dynamic)') AS map_of_dynamics, mapApply((k, v) -> (k, dynamicType(v)), map_of_dynamics) AS map_of_dynamic_types
```

```text
┌─map_of_dynamics──────────────────┬─map_of_dynamic_types────────────────────────────────────┐
│ {'a':42,'b':'Hello','c':[1,2,3]} │ {'a':'Int64','b':'String','c':'Array(Nullable(Int64))'} │
└──────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

```sql
SELECT JSONExtractKeysAndValues('{"a" : 42, "b" : "Hello", "c" : [1,2,3]}', 'Dynamic') AS dynamics, arrayMap(x -> (x.1, dynamicType(x.2)), dynamics) AS dynamic_types```
```

```text
┌─dynamics───────────────────────────────┬─dynamic_types─────────────────────────────────────────────────┐
│ [('a',42),('b','Hello'),('c',[1,2,3])] │ [('a','Int64'),('b','String'),('c','Array(Nullable(Int64))')] │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────┘
```

### Binary output format {#binary-output-format}

在 RowBinary 格式中，`Dynamic` 类型的值以以下格式进行序列化：

```text
<binary_encoded_data_type><value_in_binary_format_according_to_the_data_type>
```
