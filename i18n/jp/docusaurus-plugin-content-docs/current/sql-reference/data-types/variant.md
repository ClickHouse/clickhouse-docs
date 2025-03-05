---
slug: /sql-reference/data-types/variant
sidebar_position: 40
sidebar_label: Variant(T1, T2, ...)
---
import BetaBadge from '@theme/badges/BetaBadge';


# Variant(T1, T2, ...)

<BetaBadge/>

このタイプは他のデータ型のユニオンを表します。タイプ `Variant(T1, T2, ..., TN)` はこのタイプの各行が、`T1` または `T2` または ... 或いは `TN` のいずれかのタイプの値を持つ、またはそのいずれでもない (`NULL` 値) ことを意味します。

ネストされた型の順序は重要ではありません： Variant(T1, T2) = Variant(T2, T1)。
ネストされた型は Nullable(...)、LowCardinality(Nullable(...)) および Variant(...) 型を除く任意の型にすることができます。

:::note
類似の型をバリアントとして使用することは推奨されません（例えば、`Variant(UInt32, Int64)` のような異なる数値型や、`Variant(Date, DateTime)` のような異なる日付型）。
これらの型の値を操作することはあいまいさをもたらす可能性があります。デフォルトでは、このような `Variant` 型を作成することは例外を引き起こしますが、`allow_suspicious_variant_types` 設定を使用して有効にすることができます。
:::

:::note
Variant データ型はベータ機能です。使用するには、`enable_variant_type = 1` を設定してください。
:::

## Variantの作成 {#creating-variant}

テーブルカラムの定義で `Variant` 型を使用する：

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

通常のカラムからのCASTを使用する：

```sql
SELECT toTypeName(variant) as type_name, 'Hello, World!'::Variant(UInt64, String, Array(UInt64)) as variant;
```

```text
┌─type_name──────────────────────────────┬─variant───────┐
│ Variant(Array(UInt64), String, UInt64) │ Hello, World! │
└────────────────────────────────────────┴───────────────┘
```

共通型を持たない引数で関数 `if/multiIf` を使用する（設定 `use_variant_as_common_type` を有効にする必要があります）：

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

配列の要素/マップの値が共通の型を持たない場合に、関数 'array/map' を使用する（設定 `use_variant_as_common_type` を有効にする必要があります）：

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

## Variant ネスト型をサブカラムとして読み取る {#reading-variant-nested-types-as-subcolumns}

Variant 型は、Variant カラムから単一のネスト型をサブカラムとして読み取ることをサポートしています。したがって、`variant Variant(T1, T2, T3)` カラムがある場合、`variant.T2` 構文を使用して型 `T2` のサブカラムを読み取ることができます。このサブカラムは、`T2` が `Nullable` 内に配置できる場合は `Nullable(T2)` の型を持ち、そうでなければ `T2` の型を持ちます。このサブカラムは元の `Variant` カラムと同じサイズで、元の `Variant` カラムに型 `T2` が存在しないすべての行には `NULL` 値（または `T2` が `Nullable` 内に配置できない場合は空の値）を含みます。

Variant サブカラムは関数 `variantElement(variant_column, type_name)` を使用しても読み取ることができます。 

例：

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

各行に保存されているバリアントを知るには、関数 `variantType(variant_column)` を使用できます。この関数は、各行のバリアント型名を含む `Enum` を返します（行が `NULL` の場合は `'None'` が返されます）。

例：

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT variantType(v) from test;
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

## Variantカラムと他のカラムの変換 {#conversion-between-a-variant-column-and-other-columns}

`Variant` 型のカラムに対して行うことができる4つの変換があります。

### 文字列カラムからVariantカラムへの変換 {#converting-a-string-column-to-a-variant-column}

`String` から `Variant` への変換は、文字列値から `Variant` 型の値を解析することによって行われます：

```sql
SELECT '42'::Variant(String, UInt64) as variant, variantType(variant) as variant_type
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
SELECT CAST(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01'), 'Map(String, Variant(UInt64, Bool, Date))') as map_of_variants, mapApply((k, v) -> (k, variantType(v)), map_of_variants) as map_of_variant_types```
```

```text
┌─map_of_variants─────────────────────────────┬─map_of_variant_types──────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'UInt64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

### 通常のカラムからVariantカラムへの変換 {#converting-an-ordinary-column-to-a-variant-column}

通常のカラムを `Variant` カラムに変換することが可能で、その際、元の型を含む `Variant` カラムを作成します：

```sql
SELECT toTypeName(variant) as type_name, [1,2,3]::Array(UInt64)::Variant(UInt64, String, Array(UInt64)) as variant, variantType(variant) as variant_name
 ```

```text
┌─type_name──────────────────────────────┬─variant─┬─variant_name──┐
│ Variant(Array(UInt64), String, UInt64) │ [1,2,3] │ Array(UInt64) │
└────────────────────────────────────────┴─────────┴───────────────┘
```

注意：`String` 型からの変換は常に解析を通じて行われます。もし、`String` カラムを解析なしに `Variant` の `String` バリアントに変換したい場合は、次のようにします：
```sql
SELECT '[1, 2, 3]'::Variant(String)::Variant(String, Array(UInt64), UInt64) as variant, variantType(variant) as variant_type
```

```sql
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```

### Variantカラムから通常のカラムへの変換 {#converting-a-variant-column-to-an-ordinary-column}

`Variant` カラムを通常のカラムに変換することも可能です。この場合、すべてのネストされたバリアントが目的の型に変換されます：

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

### Variantから別のVariantへの変換 {#converting-a-variant-to-another-variant}

`Variant` カラムを別の `Variant` カラムに変換することも可能ですが、その際に目的の `Variant` カラムが元の `Variant` のすべてのネストされた型を含んでいる必要があります：

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


## データからVariant型を読み取る {#reading-variant-type-from-the-data}

すべてのテキストフォーマット（TSV、CSV、CustomSeparated、Values、JSONEachRowなど）は、`Variant` 型の読み取りをサポートしています。データ解析中に ClickHouse は、最も適切なバリアント型に値を挿入しようとします。

例：

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


## Variant型の値を比較する {#comparing-values-of-variant-data}

`Variant` 型の値は、同じ `Variant` 型の値のみと比較できます。

型 `Variant(..., T1, ... T2, ...)` において、基底型 `T1` と `T2` を持つ値 `v1` および `v2` に対する演算子 `<` の結果は以下のように定義されます：
- `T1 = T2 = T` の場合、結果は `v1.T < v2.T`（基底値が比較される）。
- `T1 != T2` の場合、結果は `T1 < T2`（型名が比較される）。

例：
```sql
CREATE TABLE test (v1 Variant(String, UInt64, Array(UInt32)), v2 Variant(String, UInt64, Array(UInt32))) ENGINE=Memory;
INSERT INTO test VALUES (42, 42), (42, 43), (42, 'abc'), (42, [1, 2, 3]), (42, []), (42, NULL);
```

```sql
SELECT v2, variantType(v2) as v2_type from test order by v2;
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
SELECT v1, variantType(v1) as v1_type, v2, variantType(v2) as v2_type, v1 = v2, v1 < v2, v1 > v2 from test;
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

特定の `Variant` 値を持つ行を見つける必要がある場合は、次のいずれかを行います。

- 値を対応する `Variant` 型にキャストします。

```sql
SELECT * FROM test WHERE v2 == [1,2,3]::Array(UInt32)::Variant(String, UInt64, Array(UInt32));
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```

- 必要な型の `Variant` サブカラムと比較します：

```sql
SELECT * FROM test WHERE v2.`Array(UInt32)` == [1,2,3] -- または variantElement(v2, 'Array(UInt32)')
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```

時には、`Nullable` 内に配置できない `Array/Map/Tuple` のような複雑な型を持つサブカラムに対して追加の確認を行うことが有用です。異なる型を持つ行には `NULL` の代わりにデフォルト値が入るためです：

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

**注意：** 異なる数値型のバリアントは異なるバリアントと見なされ、お互いに比較されず、型名が比較されます。

例：

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

**注意** デフォルトでは `Variant` 型は `GROUP BY` / `ORDER BY` キーに使用できません。使用したい場合は、その特別な比較ルールを考慮し、`allow_suspicious_types_in_group_by` / `allow_suspicious_types_in_order_by` 設定を有効にしてください。

## JSONExtract関数とVariant {#jsonextract-functions-with-variant}

すべての `JSONExtract*` 関数は `Variant` 型をサポートしています：

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
