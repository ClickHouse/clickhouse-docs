---
'description': 'ClickHouse における Variant データ型に関する Documentation'
'sidebar_label': 'Variant(T1, T2, ...)'
'sidebar_position': 40
'slug': '/sql-reference/data-types/variant'
'title': 'Variant(T1, T2, ...)'
'doc_type': 'reference'
---


# Variant(T1, T2, ...)

この型は他のデータ型の合併を表します。型 `Variant(T1, T2, ..., TN)` は、この型の各行が型 `T1` または `T2` または ... または `TN` のいずれかの値を持つこと、またはそのいずれでもない（`NULL` 値）ことを意味します。

ネストされた型の順序は重要ではありません: Variant(T1, T2) = Variant(T2, T1)。
ネストされた型は Nullable(...)、LowCardinality(Nullable(...)) および Variant(...) 型以外の任意の型を使用できます。

:::note
類似の型をバリアントとして使用することは推奨されません（たとえば、`Variant(UInt32, Int64)` のような異なる数値型や `Variant(Date, DateTime)` のような異なる日付型）。
このような型の値を扱うことは曖昧さを引き起こす可能性があります。デフォルトでは、そのような `Variant` 型を作成することは例外を引き起こしますが、設定 `allow_suspicious_variant_types` を使用すると有効化することができます。
:::

## Creating Variant {#creating-variant}

テーブルカラム定義で `Variant` 型を使用する:

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT v FROM test;
```

```text
┌─v─────────────┐
│ ᴺᵁᴸᴸ          │
│ 42            │
│ Hello, World! │
│ [1,2,3]       │
└───────────────┘
```

通常のカラムからの CAST を使用する:

```sql
SELECT toTypeName(variant) AS type_name, 'Hello, World!'::Variant(UInt64, String, Array(UInt64)) as variant;
```

```text
┌─type_name──────────────────────────────┬─variant───────┐
│ Variant(Array(UInt64), String, UInt64) │ Hello, World! │
└────────────────────────────────────────┴───────────────┘
```

引数に共通の型がない場合、`if/multiIf` 関数を使用する（その場合、設定 `use_variant_as_common_type` を有効にする必要があります）:

```sql
SET use_variant_as_common_type = 1;
SELECT if(number % 2, number, range(number)) as variant FROM numbers(5);
```

```text
┌─variant───┐
│ []        │
│ 1         │
│ [0,1]     │
│ 3         │
│ [0,1,2,3] │
└───────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT multiIf((number % 4) = 0, 42, (number % 4) = 1, [1, 2, 3], (number % 4) = 2, 'Hello, World!', NULL) AS variant FROM numbers(4);
```

```text
┌─variant───────┐
│ 42            │
│ [1,2,3]       │
│ Hello, World! │
│ ᴺᵁᴸᴸ          │
└───────────────┘
```

配列要素/マップ値に共通の型がない場合、`array/map` 関数を使用する（その場合、設定 `use_variant_as_common_type` を有効にする必要があります）:

```sql
SET use_variant_as_common_type = 1;
SELECT array(range(number), number, 'str_' || toString(number)) as array_of_variants FROM numbers(3);
```

```text
┌─array_of_variants─┐
│ [[],0,'str_0']    │
│ [[0],1,'str_1']   │
│ [[0,1],2,'str_2'] │
└───────────────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT map('a', range(number), 'b', number, 'c', 'str_' || toString(number)) as map_of_variants FROM numbers(3);
```

```text
┌─map_of_variants───────────────┐
│ {'a':[],'b':0,'c':'str_0'}    │
│ {'a':[0],'b':1,'c':'str_1'}   │
│ {'a':[0,1],'b':2,'c':'str_2'} │
└───────────────────────────────┘
```

## Reading Variant nested types as subcolumns {#reading-variant-nested-types-as-subcolumns}

Variant 型は、サブカラムとして型名を使用して Variant カラムから単一のネストされた型を読み取ることをサポートします。
したがって、もし `variant Variant(T1, T2, T3)` というカラムがある場合、構文 `variant.T2` を使用して型 `T2` のサブカラムを読み取ることができます。このサブカラムは、`T2` が `Nullable` に存在できる場合は `Nullable(T2)` の型を持ち、それ以外の場合は `T2` になります。このサブカラムは元の `Variant` カラムと同じサイズを持ち、元の `Variant` カラムが型 `T2` を持たないすべての行には `NULL` 値（または `T2` が `Nullable` に存在できない場合は空の値）が含まれます。

Variant サブカラムは `variantElement(variant_column, type_name)` 関数を使用しても読み取ることができます。

例:

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT v, v.String, v.UInt64, v.`Array(UInt64)` FROM test;
```

```text
┌─v─────────────┬─v.String──────┬─v.UInt64─┬─v.Array(UInt64)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │     ᴺᵁᴸᴸ │ []              │
│ 42            │ ᴺᵁᴸᴸ          │       42 │ []              │
│ Hello, World! │ Hello, World! │     ᴺᵁᴸᴸ │ []              │
│ [1,2,3]       │ ᴺᵁᴸᴸ          │     ᴺᵁᴸᴸ │ [1,2,3]         │
└───────────────┴───────────────┴──────────┴─────────────────┘
```

```sql
SELECT toTypeName(v.String), toTypeName(v.UInt64), toTypeName(v.`Array(UInt64)`) FROM test LIMIT 1;
```

```text
┌─toTypeName(v.String)─┬─toTypeName(v.UInt64)─┬─toTypeName(v.Array(UInt64))─┐
│ Nullable(String)     │ Nullable(UInt64)     │ Array(UInt64)               │
└──────────────────────┴──────────────────────┴─────────────────────────────┘
```

```sql
SELECT v, variantElement(v, 'String'), variantElement(v, 'UInt64'), variantElement(v, 'Array(UInt64)') FROM test;
```

```text
┌─v─────────────┬─variantElement(v, 'String')─┬─variantElement(v, 'UInt64')─┬─variantElement(v, 'Array(UInt64)')─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ []                                 │
│ 42            │ ᴺᵁᴸᴸ                        │                          42 │ []                                 │
│ Hello, World! │ Hello, World!               │                        ᴺᵁᴸᴸ │ []                                 │
│ [1,2,3]       │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ [1,2,3]                            │
└───────────────┴─────────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

各行にどのバリアントが格納されているかを知るためには、関数 `variantType(variant_column)` を使用できます。これは各行のバリアント型名の `Enum` を返します（または行が `NULL` の場合は `'None'` を返します）。

例:

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT variantType(v) FROM test;
```

```text
┌─variantType(v)─┐
│ None           │
│ UInt64         │
│ String         │
│ Array(UInt64)  │
└────────────────┘
```

```sql
SELECT toTypeName(variantType(v)) FROM test LIMIT 1;
```

```text
┌─toTypeName(variantType(v))──────────────────────────────────────────┐
│ Enum8('None' = -1, 'Array(UInt64)' = 0, 'String' = 1, 'UInt64' = 2) │
└─────────────────────────────────────────────────────────────────────┘
```

## Conversion between a Variant column and other columns {#conversion-between-a-variant-column-and-other-columns}

`Variant` 型のカラムに対して実行できる変換は4つあります。

### Converting a String column to a Variant column {#converting-a-string-column-to-a-variant-column}

`String` から `Variant` への変換は、文字列値から `Variant` 型の値を解析することによって行われます:

```sql
SELECT '42'::Variant(String, UInt64) AS variant, variantType(variant) AS variant_type
```

```text
┌─variant─┬─variant_type─┐
│ 42      │ UInt64       │
└─────────┴──────────────┘
```

```sql
SELECT '[1, 2, 3]'::Variant(String, Array(UInt64)) as variant, variantType(variant) as variant_type
```

```text
┌─variant─┬─variant_type──┐
│ [1,2,3] │ Array(UInt64) │
└─────────┴───────────────┘
```

```sql
SELECT CAST(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01'), 'Map(String, Variant(UInt64, Bool, Date))') AS map_of_variants, mapApply((k, v) -> (k, variantType(v)), map_of_variants) AS map_of_variant_types```
```

```text
┌─map_of_variants─────────────────────────────┬─map_of_variant_types──────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'UInt64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

`String` から `Variant` への変換の際、解析を無効にするには、設定 `cast_string_to_dynamic_use_inference` を無効にすることができます。

```sql
SET cast_string_to_variant_use_inference = 0;
SELECT '[1, 2, 3]'::Variant(String, Array(UInt64)) as variant, variantType(variant) as variant_type
```

```text
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```

### Converting an ordinary column to a Variant column {#converting-an-ordinary-column-to-a-variant-column}

型 `T` の通常のカラムをこの型を含む `Variant` カラムに変換することができます:

```sql
SELECT toTypeName(variant) AS type_name, [1,2,3]::Array(UInt64)::Variant(UInt64, String, Array(UInt64)) as variant, variantType(variant) as variant_name
```

```text
┌─type_name──────────────────────────────┬─variant─┬─variant_name──┐
│ Variant(Array(UInt64), String, UInt64) │ [1,2,3] │ Array(UInt64) │
└────────────────────────────────────────┴─────────┴───────────────┘
```

注意: `String` 型から変換は常に解析を通じて行われます。解析なしで `String` カラムを `Variant` の `String` バリアントに変換する必要がある場合は、以下のようにできます:
```sql
SELECT '[1, 2, 3]'::Variant(String)::Variant(String, Array(UInt64), UInt64) as variant, variantType(variant) as variant_type
```

```sql
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```

### Converting a Variant column to an ordinary column {#converting-a-variant-column-to-an-ordinary-column}

`Variant` カラムを通常のカラムに変換することができます。この場合、すべてのネストされたバリアントが宛先型に変換されます:

```sql
CREATE TABLE test (v Variant(UInt64, String)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('42.42');
SELECT v::Nullable(Float64) FROM test;
```

```text
┌─CAST(v, 'Nullable(Float64)')─┐
│                         ᴺᵁᴸᴸ │
│                           42 │
│                        42.42 │
└──────────────────────────────┘
```

### Converting a Variant to another Variant {#converting-a-variant-to-another-variant}

`Variant` カラムを別の `Variant` カラムに変換することができますが、宛先の `Variant` カラムが元の `Variant` のすべてのネストされた型を含む場合に限ります:

```sql
CREATE TABLE test (v Variant(UInt64, String)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('String');
SELECT v::Variant(UInt64, String, Array(UInt64)) FROM test;
```

```text
┌─CAST(v, 'Variant(UInt64, String, Array(UInt64))')─┐
│ ᴺᵁᴸᴸ                                              │
│ 42                                                │
│ String                                            │
└───────────────────────────────────────────────────┘
```

## Reading Variant type from the data {#reading-variant-type-from-the-data}

すべてのテキストフォーマット（TSV、CSV、CustomSeparated、Values、JSONEachRow など）は、`Variant` 型の読み取りをサポートします。データの解析中に ClickHouse は、最も適切なバリアント型に値を挿入しようとします。

例:

```sql
SELECT
    v,
    variantElement(v, 'String') AS str,
    variantElement(v, 'UInt64') AS num,
    variantElement(v, 'Float64') AS float,
    variantElement(v, 'DateTime') AS date,
    variantElement(v, 'Array(UInt64)') AS arr
FROM format(JSONEachRow, 'v Variant(String, UInt64, Float64, DateTime, Array(UInt64))', $$
{"v" : "Hello, World!"},
{"v" : 42},
{"v" : 42.42},
{"v" : "2020-01-01 00:00:00"},
{"v" : [1, 2, 3]}
$$)
```

```text
┌─v───────────────────┬─str───────────┬──num─┬─float─┬────────────────date─┬─arr─────┐
│ Hello, World!       │ Hello, World! │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │                ᴺᵁᴸᴸ │ []      │
│ 42                  │ ᴺᵁᴸᴸ          │   42 │  ᴺᵁᴸᴸ │                ᴺᵁᴸᴸ │ []      │
│ 42.42               │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │ 42.42 │                ᴺᵁᴸᴸ │ []      │
│ 2020-01-01 00:00:00 │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │ 2020-01-01 00:00:00 │ []      │
│ [1,2,3]             │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │                ᴺᵁᴸᴸ │ [1,2,3] │
└─────────────────────┴───────────────┴──────┴───────┴─────────────────────┴─────────┘
```

## Comparing values of Variant type {#comparing-values-of-variant-data}

`Variant` 型の値は、同じ `Variant` 型の値とだけ比較できます。

型 `Variant(..., T1, ... T2, ...)` の基になる型 `T1` の値 `v1` と基になる型 `T2` の値 `v2` に対する演算子 `<` の結果は、次のように定義されます:
- `T1 = T2 = T` の場合、結果は `v1.T < v2.T` （基になる値が比較されます）。
- `T1 != T2` の場合、結果は `T1 < T2` （型名が比較されます）。

例:
```sql
CREATE TABLE test (v1 Variant(String, UInt64, Array(UInt32)), v2 Variant(String, UInt64, Array(UInt32))) ENGINE=Memory;
INSERT INTO test VALUES (42, 42), (42, 43), (42, 'abc'), (42, [1, 2, 3]), (42, []), (42, NULL);
```

```sql
SELECT v2, variantType(v2) AS v2_type FROM test ORDER BY v2;
```

```text
┌─v2──────┬─v2_type───────┐
│ []      │ Array(UInt32) │
│ [1,2,3] │ Array(UInt32) │
│ abc     │ String        │
│ 42      │ UInt64        │
│ 43      │ UInt64        │
│ ᴺᵁᴸᴸ    │ None          │
└─────────┴───────────────┘
```

```sql
SELECT v1, variantType(v1) AS v1_type, v2, variantType(v2) AS v2_type, v1 = v2, v1 < v2, v1 > v2 FROM test;
```

```text
┌─v1─┬─v1_type─┬─v2──────┬─v2_type───────┬─equals(v1, v2)─┬─less(v1, v2)─┬─greater(v1, v2)─┐
│ 42 │ UInt64  │ 42      │ UInt64        │              1 │            0 │               0 │
│ 42 │ UInt64  │ 43      │ UInt64        │              0 │            1 │               0 │
│ 42 │ UInt64  │ abc     │ String        │              0 │            0 │               1 │
│ 42 │ UInt64  │ [1,2,3] │ Array(UInt32) │              0 │            0 │               1 │
│ 42 │ UInt64  │ []      │ Array(UInt32) │              0 │            0 │               1 │
│ 42 │ UInt64  │ ᴺᵁᴸᴸ    │ None          │              0 │            1 │               0 │
└────┴─────────┴─────────┴───────────────┴────────────────┴──────────────┴─────────────────┘

```

特定の `Variant` 値を持つ行を見つける必要がある場合、次のいずれかを行うことができます:

- 値を対応する `Variant` 型にキャストする:

```sql
SELECT * FROM test WHERE v2 == [1,2,3]::Array(UInt32)::Variant(String, UInt64, Array(UInt32));
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```

- 必要な型を持つ `Variant` サブカラムと比較する:

```sql
SELECT * FROM test WHERE v2.`Array(UInt32)` == [1,2,3] -- or using variantElement(v2, 'Array(UInt32)')
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```

時々、`Array/Map/Tuple` のような複雑な型のサブカラムは `Nullable` に存在できず、異なる型の行では `NULL` の代わりにデフォルト値を持っているため、追加のチェックを行うことが有用です:

```sql
SELECT v2, v2.`Array(UInt32)`, variantType(v2) FROM test WHERE v2.`Array(UInt32)` == [];
```

```text
┌─v2───┬─v2.Array(UInt32)─┬─variantType(v2)─┐
│ 42   │ []               │ UInt64          │
│ 43   │ []               │ UInt64          │
│ abc  │ []               │ String          │
│ []   │ []               │ Array(UInt32)   │
│ ᴺᵁᴸᴸ │ []               │ None            │
└──────┴──────────────────┴─────────────────┘
```

```sql
SELECT v2, v2.`Array(UInt32)`, variantType(v2) FROM test WHERE variantType(v2) == 'Array(UInt32)' AND v2.`Array(UInt32)` == [];
```

```text
┌─v2─┬─v2.Array(UInt32)─┬─variantType(v2)─┐
│ [] │ []               │ Array(UInt32)   │
└────┴──────────────────┴─────────────────┘
```

**注意:** 異なる数値型を持つバリアントの値は異なるバリアントと見なされ、相互に比較されません。型名が代わりに比較されます。

例:

```sql
SET allow_suspicious_variant_types = 1;
CREATE TABLE test (v Variant(UInt32, Int64)) ENGINE=Memory;
INSERT INTO test VALUES (1::UInt32), (1::Int64), (100::UInt32), (100::Int64);
SELECT v, variantType(v) FROM test ORDER by v;
```

```text
┌─v───┬─variantType(v)─┐
│ 1   │ Int64          │
│ 100 │ Int64          │
│ 1   │ UInt32         │
│ 100 │ UInt32         │
└─────┴────────────────┘
```

**注意** デフォルトでは `Variant` 型は `GROUP BY` / `ORDER BY` キーでは許可されていません。使用したい場合は、その特別な比較ルールを考慮し、設定 `allow_suspicious_types_in_group_by` / `allow_suspicious_types_in_order_by` を有効にしてください。

## JSONExtract functions with Variant {#jsonextract-functions-with-variant}

すべての `JSONExtract*` 関数は `Variant` 型をサポートします:

```sql
SELECT JSONExtract('{"a" : [1, 2, 3]}', 'a', 'Variant(UInt32, String, Array(UInt32))') AS variant, variantType(variant) AS variant_type;
```

```text
┌─variant─┬─variant_type──┐
│ [1,2,3] │ Array(UInt32) │
└─────────┴───────────────┘
```

```sql
SELECT JSONExtract('{"obj" : {"a" : 42, "b" : "Hello", "c" : [1,2,3]}}', 'obj', 'Map(String, Variant(UInt32, String, Array(UInt32)))') AS map_of_variants, mapApply((k, v) -> (k, variantType(v)), map_of_variants) AS map_of_variant_types
```

```text
┌─map_of_variants──────────────────┬─map_of_variant_types────────────────────────────┐
│ {'a':42,'b':'Hello','c':[1,2,3]} │ {'a':'UInt32','b':'String','c':'Array(UInt32)'} │
└──────────────────────────────────┴─────────────────────────────────────────────────┘
```

```sql
SELECT JSONExtractKeysAndValues('{"a" : 42, "b" : "Hello", "c" : [1,2,3]}', 'Variant(UInt32, String, Array(UInt32))') AS variants, arrayMap(x -> (x.1, variantType(x.2)), variants) AS variant_types
```

```text
┌─variants───────────────────────────────┬─variant_types─────────────────────────────────────────┐
│ [('a',42),('b','Hello'),('c',[1,2,3])] │ [('a','UInt32'),('b','String'),('c','Array(UInt32)')] │
└────────────────────────────────────────┴───────────────────────────────────────────────────────┘
```
