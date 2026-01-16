---
description: 'ClickHouse の Variant データ型に関するドキュメント'
sidebar_label: 'Variant(T1, T2, ...)'
sidebar_position: 40
slug: /sql-reference/data-types/variant
title: 'Variant(T1, T2, ...)'
doc_type: 'reference'
---

# Variant(T1, T2, ...) \{#variantt1-t2\}

この型は、他のデータ型のユニオン（共用体）を表します。型 `Variant(T1, T2, ..., TN)` は、この型の各行が
`T1`、`T2`、…、`TN` のいずれか、またはいずれでもない（`NULL` 値）であることを意味します。

ネストされた型の順序は問いません: Variant(T1, T2) = Variant(T2, T1) です。
ネストされた型には、Nullable(...)、LowCardinality(Nullable(...))、Variant(...) 型以外の任意の型を指定できます。

:::note
似たような型をバリアントとして使用すること（たとえば、`Variant(UInt32, Int64)` のような異なる数値型や、`Variant(Date, DateTime)` のような異なる日付型）は推奨されません。
そのような型の値を扱うと曖昧さを招く可能性があるためです。デフォルトでは、このような `Variant` 型を作成しようとすると例外がスローされますが、設定 `allow_suspicious_variant_types` を使用して有効化できます。
:::

## Variant の作成 \\{#creating-variant\\}

テーブル列を定義する際に `Variant` 型を使用する:

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

通常のカラムからの CAST の使用:

```sql
SELECT toTypeName(variant) AS type_name, 'Hello, World!'::Variant(UInt64, String, Array(UInt64)) as variant;
```

```text
┌─type_name──────────────────────────────┬─variant───────┐
│ Variant(Array(UInt64), String, UInt64) │ Hello, World! │
└────────────────────────────────────────┴───────────────┘
```

引数に共通の型がない場合に `if` / `multiIf` 関数を使用する（この場合、設定 `use_variant_as_common_type` を有効にしておく必要があります）:

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

配列要素やマップ値に共通の型がない場合は、関数 &#39;array/map&#39; を使用します（このとき設定 `use_variant_as_common_type` を有効にしておく必要があります）:

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


## Variant のネストされた型をサブカラムとして読み取る \\{#reading-variant-nested-types-as-subcolumns\\}

`Variant` 型は、`Variant` 列から型名をサブカラムとして指定することで、単一のネストされた型を読み取ることをサポートします。
そのため、列 `variant Variant(T1, T2, T3)` がある場合、`variant.T2` という構文を使って型 `T2` のサブカラムを読み取ることができます。
このサブカラムの型は、`T2` が `Nullable` でラップ可能な場合は `Nullable(T2)` になり、そうでない場合は `T2` になります。
このサブカラムは元の `Variant` 列と同じサイズとなり、元の `Variant` 列に型 `T2` が存在しないすべての行では、`NULL` 値（または `T2` を `Nullable` でラップできない場合は空値）を含みます。

Variant のサブカラムは、関数 `variantElement(variant_column, type_name)` を使って読み取ることもできます。

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

各行にどのバリアントの種類が格納されているかを確認するには、関数 `variantType(variant_column)` を使用できます。これは各行について、そのバリアント型名を表す `Enum` を返します（行が `NULL` の場合は `'None'` を返します）。

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


## Variant 列と他の列との変換 \\{#conversion-between-a-variant-column-and-other-columns\\}

`Variant` 型の列では、4 種類の変換を行うことができます。

### String 列を Variant 列に変換する \\{#converting-a-string-column-to-a-variant-column\\}

`String` から `Variant` への変換は、文字列値を解析して `Variant` 型の値を生成することで行われます。

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

````sql
SELECT CAST(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01'), 'Map(String, Variant(UInt64, Bool, Date))') AS map_of_variants, mapApply((k, v) -> (k, variantType(v)), map_of_variants) AS map_of_variant_types```
````

```text
┌─map_of_variants─────────────────────────────┬─map_of_variant_types──────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'UInt64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

`String` から `Variant` への変換時のパースを無効にするには、設定 `cast_string_to_dynamic_use_inference` を無効にします。

```sql
SET cast_string_to_variant_use_inference = 0;
SELECT '[1, 2, 3]'::Variant(String, Array(UInt64)) as variant, variantType(variant) as variant_type
```

```text
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```


### 通常のカラムを Variant カラムに変換する \\{#converting-an-ordinary-column-to-a-variant-column\\}

型 `T` を持つ通常のカラムを、その型を含む `Variant` カラムに変換できます。

```sql
SELECT toTypeName(variant) AS type_name, [1,2,3]::Array(UInt64)::Variant(UInt64, String, Array(UInt64)) as variant, variantType(variant) as variant_name
```

```text
┌─type_name──────────────────────────────┬─variant─┬─variant_name──┐
│ Variant(Array(UInt64), String, UInt64) │ [1,2,3] │ Array(UInt64) │
└────────────────────────────────────────┴─────────┴───────────────┘
```

注意: `String` 型からの変換は常にパースを通じて行われます。パースを行わずに `String` 列を `Variant` の `String` バリアントに変換する必要がある場合は、次のようにします:

```sql
SELECT '[1, 2, 3]'::Variant(String)::Variant(String, Array(UInt64), UInt64) as variant, variantType(variant) as variant_type
```

```sql
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```


### Variant列を通常の列に変換する \\{#converting-a-variant-column-to-an-ordinary-column\\}

`Variant` 列を通常の列に変換できます。この場合、すべてのネストされた Variant は指定した変換先の型に変換されます。

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


### Variant を別の Variant に変換する \\{#converting-a-variant-to-another-variant\\}

`Variant` 列を別の `Variant` 列に変換することも可能ですが、変換先の `Variant` 列が元の `Variant` 列に含まれるすべてのネストされた型を含んでいる場合に限られます。

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


## データからの Variant 型の読み取り \\{#reading-variant-type-from-the-data\\}

すべてのテキスト形式 (TSV、CSV、CustomSeparated、Values、JSONEachRow など) は `Variant` 型での読み取りをサポートしています。データの解析時に、ClickHouse は値を最も適切な Variant 型の要素に挿入しようとします。

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


## Variant 型の値の比較 \\{#comparing-values-of-variant-data\\}

`Variant` 型の値は、同じ `Variant` 型の値とのみ比較できます。

デフォルトでは、比較演算子は [Variant のデフォルト実装](#functions-with-variant-arguments) を使用し、
それぞれの Variant の型に対して個別に比較を適用します。この挙動は、`use_variant_default_implementation_for_comparisons = 0` 設定を使用して無効化し、
以下で説明するネイティブな Variant の比較ルールを使用できます。`ORDER BY` は常にネイティブな比較を使用することに **注意** してください。

**ネイティブな Variant の比較ルール：**

型 `Variant(..., T1, ... T2, ...)` に属し、それぞれの基底型が `T1` と `T2` である値 `v1` と `v2` に対する演算子 `<` の結果は、次のように定義されます。

* `T1 = T2 = T` の場合、結果は `v1.T < v2.T` になります（基底値どうしが比較されます）。
* `T1 != T2` の場合、結果は `T1 < T2` になります（型名どうしが比較されます）。

例：

```sql
SET allow_suspicious_types_in_order_by = 1;
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

特定の `Variant` 値を持つ行を見つける必要がある場合、次のいずれかの方法を使用できます。

* 値を対応する `Variant` 型にキャストする：

```sql
SELECT * FROM test WHERE v2 == [1,2,3]::Array(UInt32)::Variant(String, UInt64, Array(UInt32));
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```

* `Variant` サブカラムを必要な型と比較します。

```sql
SELECT * FROM test WHERE v2.`Array(UInt32)` == [1,2,3] -- or using variantElement(v2, 'Array(UInt32)')
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```


`Array/Map/Tuple` のような複合型を持つサブカラムは `Nullable` の中に含めることができず、異なる型を持つ行では `NULL` の代わりにデフォルト値が入るため、variant 型に対して追加のチェックを行っておくと有用な場合があります。

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

**注:** 数値型が異なる `Variant` の値は、別の `Variant` とみなされ、値同士は比較されません。代わりに、その型名同士が比較されます。

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

**注記** デフォルトでは `Variant` 型は `GROUP BY`/`ORDER BY` のキーとしては許可されていません。使用したい場合は、その特殊な比較ルールを考慮した上で、`allow_suspicious_types_in_group_by`/`allow_suspicious_types_in_order_by` 設定を有効にしてください。


## Variant における JSONExtract 関数 \\{#jsonextract-functions-with-variant\\}

すべての `JSONExtract*` 関数は `Variant` 型をサポートします。

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


## Variant 型引数を取る関数 \\{#functions-with-variant-arguments\\}

ClickHouse のほとんどの関数は、`Variant` 型の引数を **Variant 用のデフォルト実装** を通じて自動的にサポートします。
バージョン `26.1` 以降では、Variant 型を明示的に扱わない関数が Variant カラムを受け取った場合、ClickHouse は次のように動作します:

1. Variant カラムから各バリアント型を抽出する
2. 各バリアント型ごとに関数を個別に実行する
3. 結果型に応じて結果を適切に統合する

これにより、特別な処理なしで、通常の関数を Variant カラムに対して利用できます。

**例:**

```sql
CREATE TABLE test (v Variant(UInt32, String)) ENGINE = Memory;
INSERT INTO test VALUES (42), ('hello'), (NULL);
SELECT *, toTypeName(v) FROM test WHERE v = 42;
```

```text
   ┌─v──┬─toTypeName(v)───────────┐
1. │ 42 │ Variant(String, UInt32) │
   └────┴─────────────────────────┘
```

比較演算子は各 Variant 型に対して個別に自動適用され、Variant カラムに対するフィルタ処理が可能になります。

**結果型の挙動:**

結果型は、各 Variant 型に対して関数が返す型に依存します。

* **結果型が異なる場合**: `Variant(T1, T2, ...)`

  ```sql
  CREATE TABLE test2 (v Variant(UInt64, Float64)) ENGINE = Memory;
  INSERT INTO test2 VALUES (42::UInt64), (42.42);
  SELECT v + 1 AS result, toTypeName(result) FROM test2;
  ```

  ```text
  ┌─result─┬─toTypeName(plus(v, 1))──┐
  │     43 │ Variant(Float64, UInt64) │
  │  43.42 │ Variant(Float64, UInt64) │
  └────────┴─────────────────────────┘
  ```

* **型の非互換**: 非互換な Variant では `NULL`

  ```sql
  CREATE TABLE test3 (v Variant(Array(UInt32), UInt32)) ENGINE = Memory;
  INSERT INTO test3 VALUES ([1,2,3]), (42);
  SELECT v + 10 AS result, toTypeName(result) FROM test3;
  ```

  ```text
  ┌─result─┬─toTypeName(plus(v, 10))─┐
  │   ᴺᵁᴸᴸ │ Nullable(UInt64)        │
  │     52 │ Nullable(UInt64)        │
  └────────┴─────────────────────────┘
  ```

:::note
**エラー処理:** 関数がある Variant 型を処理できない場合、型関連のエラー（ILLEGAL&#95;TYPE&#95;OF&#95;ARGUMENT、
TYPE&#95;MISMATCH、CANNOT&#95;CONVERT&#95;TYPE、NO&#95;COMMON&#95;TYPE）のみがキャッチされ、その行の結果は NULL になります。ゼロ除算やメモリ不足などのその他のエラーは、実際の問題を暗黙に隠さないよう、通常どおりスローされます。
:::
