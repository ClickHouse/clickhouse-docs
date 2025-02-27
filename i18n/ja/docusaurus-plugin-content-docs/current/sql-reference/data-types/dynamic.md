---
slug: /sql-reference/data-types/dynamic
sidebar_position: 62
sidebar_label: 動的
---
import BetaBadge from '@theme/badges/BetaBadge';

# 動的

<BetaBadge/>

このタイプは、すべての値のタイプをあらかじめ知らなくても、任意のタイプの値を内部に格納することを可能にします。

`Dynamic`タイプのカラムを宣言するには、次の構文を使用します：

``` sql
<column_name> Dynamic(max_types=N)
```

ここで、`N` はオプションのパラメータで、`0` から `254` の間で、`Dynamic`タイプのカラムが一つのデータブロック内で格納できる異なるデータタイプの数を示します（たとえば、MergeTree テーブルの単一データパートにわたって）。この制限を超えると、新しいタイプの値は、バイナリ形式の特別な共有データ構造に一緒に格納されます。`max_types` のデフォルト値は `32` です。

:::note
Dynamic データタイプはベータ機能です。使用するには、`enable_dynamic_type = 1` を設定してください。
:::

## 動的の作成 {#creating-dynamic}

テーブルカラム定義での `Dynamic`タイプの使用：

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

通常のカラムからの CAST の使用：

```sql
SELECT 'Hello, World!'::Dynamic as d, dynamicType(d);
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ Hello, World! │ String         │
└───────────────┴────────────────┘
```

`Variant`カラムからの CAST の使用：

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


## 動的ネストされたタイプをサブカラムとして読み取る {#reading-dynamic-nested-types-as-subcolumns}

`Dynamic`タイプは、型名をサブカラムとして使用して、`Dynamic`カラムから単一のネストされたタイプを読み取ることをサポートしています。したがって、`d Dynamic`カラムがある場合は、構文 `d.T` を使用して任意の有効なタイプ `T` のサブカラムを読み取ることができます。このサブカラムは、`T` が `Nullable`内に存在できる場合は `Nullable(T)` 型となり、そうでない場合は `T` 型となります。このサブカラムは元の `Dynamic`カラムと同じサイズを持ち、元の `Dynamic`カラムに `T` タイプが存在しないすべての行に `NULL` 値（または `T` が `Nullable`内に存在できない場合は空の値）を含みます。

`Dynamic`サブカラムは、関数 `dynamicElement(dynamic_column, type_name)` を使用しても読み取ることができます。

例：

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
│ [1,2,3]       │ Array(Int64)   │ ᴺᵁᴸᴸ                        │                       ᴺᵁᴺᴬᵁᴸᴸ │ [1,2,3]                           │                      ᴺᵁᴸᴸ │ []                                 │
└───────────────┴────────────────┴─────────────────────────────┴────────────────────────────┴───────────────────────────────────┴───────────────────────────┴────────────────────────────────────┘
```

各行に格納されている変数が何であるかを知るために、関数 `dynamicType(dynamic_column)` を使用できます。これは各行の値の型名を持つ `String` を返します（または行が `NULL` の場合は `'None'`）。

例：

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

## 動的カラムとその他のカラムとの変換 {#conversion-between-dynamic-column-and-other-columns}

`Dynamic`カラムに対して行える変換は4つあります。

### 通常のカラムを動的カラムに変換する {#converting-an-ordinary-column-to-a-dynamic-column}

```sql
SELECT 'Hello, World!'::Dynamic as d, dynamicType(d);
```

```text
┌─d─────────────┬─dynamicType(d)─┐
│ Hello, World! │ String         │
└───────────────┴────────────────┘
```

### 文字列カラムを解析を介して動的カラムに変換する {#converting-a-string-column-to-a-dynamic-column-through-parsing}

`String`カラムから`Dynamic`タイプの値を解析するには、`cast_string_to_dynamic_use_inference` を有効にします：

```sql
SET cast_string_to_dynamic_use_inference = 1;
SELECT CAST(materialize(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01')), 'Map(String, Dynamic)') as map_of_dynamic, mapApply((k, v) -> (k, dynamicType(v)), map_of_dynamic) as map_of_dynamic_types;
```

```text
┌─map_of_dynamic──────────────────────────────┬─map_of_dynamic_types─────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'Int64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### 動的カラムを通常のカラムに変換する {#converting-a-dynamic-column-to-an-ordinary-column}

`Dynamic`カラムを通常のカラムに変換することができます。この場合、すべてのネストされたタイプは変換先のタイプに変換されます：

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

### バリアントカラムを動的カラムに変換する {#converting-a-variant-column-to-dynamic-column}

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('String'), ([1, 2, 3]);
SELECT v::Dynamic as d, dynamicType(d) from test; 
```

```text
┌─d───────┬─dynamicType(d)─┐
│ ᴺᵁᴺᴴ    │ None           │
│ 42      │ UInt64         │
│ String  │ String         │
│ [1,2,3] │ Array(UInt64)  │
└─────────┴────────────────┘
```

### 動的(max_types=N)カラムを別の動的(max_types=K)に変換する {#converting-a-dynamicmax_typesn-column-to-another-dynamicmax_typesk}

もし `K >= N` であれば、変換中のデータは変更されません：

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

もし `K < N` であれば、最もレアなタイプの値は単一の特別なサブカラムに挿入されますが、引き続きアクセス可能です：

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

関数 `isDynamicElementInSharedData` は、`Dynamic`内の特別な共有データ構造に格納されている行に `true` を返します。そして結果のカラムには共有データ構造に格納されていない2つのタイプだけが含まれていることがわかります。

もし `K=0` であれば、すべてのタイプは単一の特別なサブカラムに挿入されます：

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

## 動的タイプをデータから読む {#reading-dynamic-type-from-the-data}

すべてのテキスト形式（TSV、CSV、CustomSeparated、Values、JSONEachRowなど）は `Dynamic`タイプの読み取りをサポートしています。データ解析中に、ClickHouseは各値のタイプを推測し、それを `Dynamic`カラムへの挿入時に使用しようとします。

例：

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

## 動的タイプを関数で使用する {#using-dynamic-type-in-functions}

ほとんどの関数は `Dynamic`タイプの引数をサポートしています。この場合、関数は `Dynamic`カラム内に格納された各内部データタイプに対して個別に実行されます。
関数の結果のタイプが引数のタイプに依存する場合、そのような関数の結果は `Dynamic` となります。関数の結果のタイプが引数のタイプに依存しない場合、結果は `Nullable(T)` になり、`T`はこの関数の通常の結果タイプです。

例：

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

もし関数が `Dynamic`カラム内の任意のタイプに対して実行できない場合、例外がスローされます：

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

不要なタイプをフィルタリングすることができます：

```sql
SELECT d, d + 1 AS res, toTypeName(res), dynamicType(res) FROM test WHERE dynamicType(d) NOT IN ('String', 'Array(Int64)', 'None')
```

```text
┌─d──┬─res─┬─toTypeName(res)─┬─dynamicType(res)─┐
│ 42 │ 43  │ Dynamic         │ Int64            │
│ 43 │ 44  │ Dynamic         │ Int64            │
└────┴─────┴─────────────────┴──────────────────┘
```

または必要なタイプをサブカラムとして抽出することもできます：

```sql
SELECT d, d.Int64 + 1 AS res, toTypeName(res) FROM test;
```

```text
┌─d─────┬──res─┬─toTypeName(res)─┐
│ 42    │   43 │ Nullable(Int64) │
│ 43    │   44 │ Nullable(Int64) │
│ str_1 │ ᴺᵁᴸᴸ │ Nullable(Int64) │
└───────┴───────┴─────────────────┘
┌─d─────┬──res─┬─toTypeName(res)─┐
│ ᴺᵁᴸᴸ  │ ᴺᵁᴸᴸ │ Nullable(Int64) │
│ [1,2] │ ᴺᵁᴸᴸ │ Nullable(Int64) │
│ [3,4] │ ᴺᵁᴸᴸ │ Nullable(Int64) │
└───────┴──────┴─────────────────┘
```

## 動的タイプをORDER BYおよびGROUP BYで使用する {#using-dynamic-type-in-order-by-and-group-by}

`ORDER BY`および `GROUP BY` 中に、`Dynamic`タイプの値は `Variant`タイプの値と同様に比較されます。値 `d1` と `d2` の比較における結果は次のように定義されています：
- `T1 = T2 = T` である場合、結果は `d1.T < d2.T` となります（基になる値が比較されます）。
- `T1 != T2` である場合、結果は `T1 < T2` となります（タイプ名が比較されます）。

デフォルトでは、`GROUP BY`/`ORDER BY`キーで `Dynamic`タイプは許可されていませんが、特別な比較ルールを考慮して `allow_suspicious_types_in_group_by`/`allow_suspicious_types_in_order_by` 設定を有効にする必要があります。

例：
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

```text
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

**注意：** 異なる数値タイプの持つ動的タイプの値は異なる値と見なされ、互いに比較されず、タイプ名が比較されます。

例：

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

**注意：** 説明した比較ルールは、`<`/`>`/`=` などの比較関数の実行中には適用されません，その理由は [特別な動作](#using-dynamic-type-in-functions) が生じるためです。

## 動的内に異なるデータタイプの数に達する {#reaching-the-limit-in-number-of-different-data-types-stored-inside-dynamic}

`Dynamic`データタイプは、異なるデータタイプの限られた数のみを個別のサブカラムとして格納できます。デフォルトでは、この制限は `32` ですが、型宣言内で `Dynamic(max_types=N)` 構文を使用することで変更できます。その際、Nは `0` から `254` の間でなければなりません（実装の詳細により、`Dynamic`内に格納できる異なるデータタイプが254を超えることはできません）。
制限に達すると、すべての新しいデータタイプが`Dynamic`カラムに挿入され、バイナリ形式で異なるデータタイプの値を格納するための単一の共有データ構造に格納されます。

制限に達した場合に生じるさまざまなシナリオにおいて何が起こるかを見てみましょう。

### データ解析中に制限に達する {#reaching-the-limit-during-data-parsing}

データから `Dynamic`値を解析する際に、現在のデータブロックに対して制限に達した場合は、すべての新しい値が共有データ構造に挿入されます：

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

ご覧のとおり、3つの異なるデータタイプ `Int64`、`Array(Int64)`、および `String` を挿入した後、すべての新しいタイプが特別な共有データ構造に挿入されました。

### MergeTreeテーブルエンジンにおけるデータパーツのマージ中 {#during-merges-of-data-parts-in-mergetree-table-engines}

MergeTreeテーブル内の複数のデータパーツをマージする際に、結果のデータパート内の `Dynamic`カラムは、格納できる異なるデータタイプ数の制限に達する可能性があり、元のパーツからサブカラムとしてすべてのタイプを格納できない場合があります。
この場合、ClickHouseは、マージ後にどのタイプがサブカラムとして残り、どのタイプが共有データ構造に挿入されるかを決定します。通常、ClickHouseは最も頻度の高いタイプを保持し、最も希少なタイプを共有データ構造に格納しようとしますが、これは実装に依存します。

そのようなマージの例を見てみましょう。まず、`Dynamic`カラムを持つテーブルを作成し、異なるデータ型の制限を `3` に設定し、`5` 異なるタイプの値を挿入します：

```sql
CREATE TABLE test (id UInt64, d Dynamic(max_types=3)) engine=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, number FROM numbers(5);
INSERT INTO test SELECT number, range(number) FROM numbers(4);
INSERT INTO test SELECT number, toDate(number) FROM numbers(3);
INSERT INTO test SELECT number, map(number, number) FROM numbers(2);
INSERT INTO test SELECT number, 'str_' || toString(number) FROM numbers(1);
```

各挿入は、`Dynamic`カラム内に単一タイプを持つ別々のデータパートを作成します：
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

次に、すべてのパーツをマージして、何が起こるかを見てみましょう：

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

ご覧のように、ClickHouseは最も頻度の高いタイプ `UInt64` と `Array(UInt64)` をサブカラムとして保持し、他のすべてのタイプを共有データの中に格納しました。

## 動的と共に使用する JSONExtract 関数 {#jsonextract-functions-with-dynamic}

すべての `JSONExtract*` 関数は `Dynamic`タイプをサポートしています：

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

### バイナリ出力形式 {#binary-output-format}

RowBinary形式では、`Dynamic`タイプの値は次の形式でシリアライズされます：

```text
<binary_encoded_data_type><value_in_binary_format_according_to_the_data_type>
```
