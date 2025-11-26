---
description: 'ClickHouse 中 Dynamic 数据类型的文档，它能够在单个列中存储多种类型的值'
sidebar_label: 'Dynamic'
sidebar_position: 62
slug: /sql-reference/data-types/dynamic
title: 'Dynamic'
doc_type: 'guide'
---



# Dynamic

此类型允许在其中存储任意类型的值，而无需预先了解或枚举所有可能的类型。

要声明一个 `Dynamic` 类型的列，请使用以下语法：

```sql
<列名> Dynamic(max_types=N)
```

其中 `N` 是一个可选参数，取值范围为 `0` 到 `254`，用于指示在一个单独存储的数据块内（例如 MergeTree 表的单个数据分片中），类型为 `Dynamic` 的列中可以作为独立子列存储的不同数据类型的数量上限。如果超过此限制，所有具有新类型的值将以二进制形式一起存储在一个特殊的共享数据结构中。`max_types` 的默认值为 `32`。


## 创建 Dynamic 类型

在表的列定义中使用 `Dynamic` 类型：

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

在普通列上使用 CAST：

```sql
SELECT 'Hello, World!'::Dynamic AS d, dynamicType(d);
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ Hello, World! │ String         │
└───────────────┴────────────────┘
```

对 `Variant` 列使用 CAST：

```sql
SET use_variant_as_common_type = 1;
SELECT multiIf((number % 3) = 0, number, (number % 3) = 1, range(number + 1), NULL)::Dynamic AS d, dynamicType(d) FROM numbers(3)
```

```text
┌─d─────┬─dynamicType(d)─┐
│ 0     │ UInt64         │
│ [0,1] │ Array(UInt64)  │
│ ᴺᵁᴸᴸ  │ None           │
└───────┴────────────────┘
```


## 以子列形式读取 Dynamic 中的嵌套类型

`Dynamic` 类型支持通过类型名作为子列名，从 `Dynamic` 列中读取单个嵌套类型。
因此，如果存在一列 `d Dynamic`，可以使用语法 `d.T` 读取任意有效类型 `T` 的子列，
当 `T` 可以被 `Nullable` 包裹时，该子列的类型为 `Nullable(T)`，否则为 `T`。该子列的大小将与原始 `Dynamic` 列相同，
并且在原始 `Dynamic` 列中不包含类型 `T` 的所有行里，该子列将包含 `NULL` 值（或者在 `T` 不能被 `Nullable` 包裹时为空值）。

也可以使用函数 `dynamicElement(dynamic_column, type_name)` 来读取 `Dynamic` 的子列。

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

````sql
SELECT d, dynamicType(d), dynamicElement(d, 'String'), dynamicElement(d, 'Int64'), dynamicElement(d, 'Array(Int64)'), dynamicElement(d, 'Date'), dynamicElement(d, 'Array(String)') FROM test;```
````


```text
┌─d─────────────┬─dynamicType(d)─┬─dynamicElement(d, 'String')─┬─dynamicElement(d, 'Int64')─┬─dynamicElement(d, 'Array(Int64)')─┬─dynamicElement(d, 'Date')─┬─dynamicElement(d, 'Array(String)')─┐
│ ᴺᵁᴸᴸ          │ None           │ ᴺᵁᴸᴸ                        │                       ᴺᵁᴸᴸ │ []                                │                      ᴺᵁᴸᴸ │ []                                 │
│ 42            │ Int64          │ ᴺᵁᴸᴸ                        │                         42 │ []                                │                      ᴺᵁᴸᴸ │ []                                 │
│ Hello, World! │ String         │ Hello, World!               │                       ᴺᵁᴸᴸ │ []                                │                      ᴺᵁᴸᴸ │ []                                 │
│ [1,2,3]       │ Array(Int64)   │ ᴺᵁᴸᴸ                        │                       ᴺᵁᴸᴸ │ [1,2,3]                           │                      ᴺᵁᴸᴸ │ []                                 │
└───────────────┴────────────────┴─────────────────────────────┴────────────────────────────┴───────────────────────────────────┴───────────────────────────┴────────────────────────────────────┘
```

要了解每一行中存储的是哪种变体类型，可以使用函数 `dynamicType(dynamic_column)`。它会返回一个 `String`，表示每一行的值类型名称（如果该行为 `NULL`，则返回 `'None'`）。

示例：

```sql
CREATE TABLE test (d Dynamic) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT dynamicType(d) FROM test;
```

```text
┌─dynamicType(d)─┐
│ None           │
│ Int64          │
│ String         │
│ Array(Int64)   │
└────────────────┘
```


## Dynamic 列与其他列之间的转换

`Dynamic` 列支持 4 种转换方式。

### 将普通列转换为 Dynamic 列

```sql
SELECT 'Hello, World!'::Dynamic AS d, dynamicType(d);
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ Hello, World! │ String         │
└───────────────┴────────────────┘
```

### 通过解析将 String 列转换为 Dynamic 列

要从 `String` 列中解析出 `Dynamic` 类型的值，可以开启 `cast_string_to_dynamic_use_inference` 设置：

```sql
SET cast_string_to_dynamic_use_inference = 1;
SELECT CAST(materialize(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01')), 'Map(String, Dynamic)') as map_of_dynamic, mapApply((k, v) -> (k, dynamicType(v)), map_of_dynamic) as map_of_dynamic_types;
```

```text
┌─map_of_dynamic──────────────────────────────┬─map_of_dynamic_types─────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'Int64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### 将 `Dynamic` 列转换为普通列

可以将 `Dynamic` 列转换为普通列。此时，所有嵌套类型都会被转换为目标类型：

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

### 将 Variant 列转换为 Dynamic 列

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('String'), ([1, 2, 3]);
SELECT v::Dynamic AS d, dynamicType(d) FROM test; 
```

```text
┌─d───────┬─dynamicType(d)─┐
│ ᴺᵁᴸᴸ    │ None           │
│ 42      │ UInt64         │
│ String  │ String         │
│ [1,2,3] │ Array(UInt64)  │
└─────────┴────────────────┘
```

### 将 Dynamic(max&#95;types=N) 列转换为另一列 Dynamic(max&#95;types=K)

如果 `K >= N`，则在转换过程中数据不会被更改：

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

如果 `K < N`，则具有最罕见类型的值将被插入到一个特殊子列中，但这些值仍然是可访问的：

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

函数 `isDynamicElementInSharedData` 对存储在 `Dynamic` 内部特殊共享数据结构中的行返回 `true`，并且如我们所见，结果列中只包含 2 种未存储在该共享数据结构中的类型。

如果 `K=0`，所有类型都会被插入到单个特殊子列中：

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


## 从数据中读取 Dynamic 类型

所有文本格式（TSV、CSV、CustomSeparated、Values、JSONEachRow 等）都支持读取 `Dynamic` 类型。在解析数据时，ClickHouse 会尝试推断每个值的类型，并在向 `Dynamic` 列插入数据时使用该类型。

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


## 在函数中使用 Dynamic 类型

大多数函数都支持类型为 `Dynamic` 的参数。在这种情况下，函数会分别在 `Dynamic` 列中存储的每种内部数据类型上执行。
当函数的结果类型依赖于参数类型时，使用 `Dynamic` 参数执行此类函数的结果类型将是 `Dynamic`。当函数的结果类型不依赖于参数类型时，结果类型将是 `Nullable(T)`，其中 `T` 是该函数在普通（非 Dynamic）情况下的结果类型。

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

如果某个函数无法对 `Dynamic` 列中的某种类型执行，就会抛出异常：

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
收到异常:
Code: 43. DB::Exception: 函数 plus 的参数类型不合法:Array(Int64) 和 UInt8,执行 'FUNCTION plus(__table1.d : 3, 1_UInt8 :: 1) -> plus(__table1.d, 1_UInt8) Dynamic : 0' 时。(ILLEGAL_TYPE_OF_ARGUMENT)
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


或者将所需的类型提取到子列中：

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


## 在 ORDER BY 和 GROUP BY 中使用 Dynamic 类型

在执行 `ORDER BY` 和 `GROUP BY` 时，`Dynamic` 类型的值会以类似于 `Variant` 类型的方式进行比较：
对于类型为 `Dynamic` 的值 `d1`（其底层类型为 `T1`）和 `d2`（其底层类型为 `T2`），运算符 `<` 的结果定义如下：

* 如果 `T1 = T2 = T`，则结果为 `d1.T < d2.T`（比较底层值）。
* 如果 `T1 != T2`，则结果为 `T1 < T2`（比较类型名称）。

默认情况下，在 `GROUP BY`/`ORDER BY` 键中不允许使用 `Dynamic` 类型；如果确有需要，请结合其上述特殊比较规则，并启用 `allow_suspicious_types_in_group_by`/`allow_suspicious_types_in_order_by` 设置。

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

**注意：** dynamic 类型中具有不同数值类型的值会被视为不同的值，彼此之间不会进行比较，而是仅比较它们的类型名称。

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
SELECT d, dynamicType(d) FROM test GROUP BY d SETTINGS allow_suspicious_types_in_group_by=1;
```

```text
┌─d───┬─dynamicType(d)─┐
│ 1   │ Int64          │
│ 100 │ UInt32         │
│ 1   │ UInt32         │
│ 100 │ Int64          │
└─────┴────────────────┘
```

**注意：** 由于对 `Dynamic` 类型的函数有[特殊处理](#using-dynamic-type-in-functions)，此处描述的比较规则在执行 `<`/`>`/`=` 等比较函数时不会生效。


## 在 Dynamic 中存储的不同数据类型数量达到上限

`Dynamic` 数据类型只能将有限数量的不同数据类型作为单独的子列进行存储。默认情况下，该上限为 32，但你可以在类型声明中使用语法 `Dynamic(max_types=N)` 进行修改，其中 N 的取值范围是 0 到 254（由于实现细节的限制，`Dynamic` 中作为单独子列存储的不同数据类型数量不可能超过 254）。
当达到该上限时，插入到 `Dynamic` 列中的所有新的数据类型的值将被写入到单一的共享数据结构中，该结构以二进制形式存储具有不同数据类型的值。

下面看看在不同场景下达到上限时会发生什么。

### 在数据解析过程中达到上限

在从数据中解析 `Dynamic` 值的过程中，当当前数据块中的类型数量达到上限时，所有新的值都会被插入到共享数据结构中：

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

可以看到，在插入 3 种不同的数据类型 `Int64`、`Array(Int64)` 和 `String` 之后，所有新类型都被插入到了特殊的共享数据结构中。

### 在 MergeTree 表引擎中合并数据片段时

在 MergeTree 表中合并多个数据片段时，结果数据片段中的 `Dynamic` 列可能会达到其内部可存储为独立子列的不同数据类型数量上限，从而无法再将所有类型都作为来自源数据片段的子列进行存储。
在这种情况下，ClickHouse 会选择在合并后哪些类型继续作为独立子列保留，哪些类型需要被插入到共享数据结构中。在大多数情况下，ClickHouse 会尝试保留最常见的类型，并将最罕见的类型存入共享数据结构，但这取决于具体实现。

下面来看一个这样的合并示例。首先，创建一个包含 `Dynamic` 列的表，将不同数据类型数量的上限设置为 `3`，并插入包含 `5` 种不同类型的值：

```sql
CREATE TABLE test (id UInt64, d Dynamic(max_types=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, number FROM numbers(5);
INSERT INTO test SELECT number, range(number) FROM numbers(4);
INSERT INTO test SELECT number, toDate(number) FROM numbers(3);
INSERT INTO test SELECT number, map(number, number) FROM numbers(2);
INSERT INTO test SELECT number, 'str_' || toString(number) FROM numbers(1);
```

每次插入都会创建一个单独的数据片段，其中 `Dynamic` 列只包含一种类型：

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

现在，我们把所有部分合在一起，看看会发生什么：

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

正如我们所见，ClickHouse 将最常见的类型 `UInt64` 和 `Array(UInt64)` 保留为子列，并将所有其他类型写入共享数据区。


## 支持 Dynamic 类型的 JSONExtract 函数

所有 `JSONExtract*` 函数都支持 `Dynamic` 类型：

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

````sql
SELECT JSONExtractKeysAndValues('{"a" : 42, "b" : "Hello", "c" : [1,2,3]}', 'Dynamic') AS dynamics, arrayMap(x -> (x.1, dynamicType(x.2)), dynamics) AS dynamic_types```
````

```text
┌─dynamics───────────────────────────────┬─dynamic_types─────────────────────────────────────────────────┐
│ [('a',42),('b','Hello'),('c',[1,2,3])] │ [('a','Int64'),('b','String'),('c','Array(Nullable(Int64))')] │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────┘
```

### 二进制输出格式

在 RowBinary 格式中，`Dynamic` 类型的值以如下格式序列化：

```text
<binary_encoded_data_type><value_in_binary_format_according_to_the_data_type>
```
