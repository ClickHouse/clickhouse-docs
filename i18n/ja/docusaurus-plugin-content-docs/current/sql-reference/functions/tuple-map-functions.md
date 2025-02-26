---
slug: /sql-reference/functions/tuple-map-functions
sidebar_position: 120
sidebar_label: マップ
title: マップ関数
---

## map {#map}

キーと値のペアから [Map(key, value)](../data-types/map.md) 型の値を生成します。

**構文**

```sql
map(key1, value1[, key2, value2, ...])
```

**引数**

- `key_n` — マップエントリのキー。 [Map](../data-types/map.md) のキータイプとしてサポートされる任意の型。
- `value_n` — マップエントリの値。 [Map](../data-types/map.md) のバリュータイプとしてサポートされる任意の型。

**戻り値**

- `key:value`ペアを含むマップ。 [Map(key, value)](../data-types/map.md)。

**例**

クエリ:

```sql
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3);
```

結果:

``` text
┌─map('key1', number, 'key2', multiply(number, 2))─┐
│ {'key1':0,'key2':0}                              │
│ {'key1':1,'key2':2}                              │
│ {'key1':2,'key2':4}                              │
└──────────────────────────────────────────────────┘
```

## mapFromArrays {#mapfromarrays}

キーの配列またはマップと値の配列またはマップからマップを生成します。

この関数は `CAST([...], 'Map(key_type, value_type)')` 構文の便利な代替手段です。
例えば、次の代わりに次のように書くことができます。
- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')` または
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

`mapFromArrays(['aa', 'bb'], [4, 5])` と書けます。

**構文**

```sql
mapFromArrays(keys, values)
```

エイリアス: `MAP_FROM_ARRAYS(keys, values)`

**引数**

- `keys` — マップを作成するためのキーの配列またはマップ。サポートされる型は [Array](../data-types/array.md) または [Map](../data-types/map.md) です。もし `keys` が配列であるなら、`Array(Nullable(T))` または `Array(LowCardinality(Nullable(T)))` を型として受け入れますが、NULL 値を含んでいてはいけません。
- `values`  - マップを作成するための値の配列またはマップ。サポートされる型は [Array](../data-types/array.md) または [Map](../data-types/map.md) です。

**戻り値**

- キーの配列と値の配列/マップから構築されたマップ。

**例**

クエリ:

```sql
select mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

結果:

```response
┌─mapFromArrays(['a', 'b', 'c'], [1, 2, 3])─┐
│ {'a':1,'b':2,'c':3}                       │
└───────────────────────────────────────────┘
```

`mapFromArrays` は [Map](../data-types/map.md) の型の引数も受け入れます。これらは実行時にタプルの配列にキャストされます。

```sql
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

結果:

```response
┌─mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))─┐
│ {1:('a',1),2:('b',2),3:('c',3)}                       │
└───────────────────────────────────────────────────────┘
```

```sql
SELECT mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])
```

結果:

```response
┌─mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])─┐
│ {('a',1):1,('b',2):2,('c',3):3}                       │
└───────────────────────────────────────────────────────┘
```

## extractKeyValuePairs {#extractkeyvaluepairs}

キーと値のペアの文字列を [Map(String, String)](../data-types/map.md) に変換します。
解析はノイズに対して寛容です（例: ログファイル）。入力文字列のキーと値のペアは、キー、キーと値の区切り文字、値の順に構成されています。
キーと値のペアはペア区切り文字で区切られています。
キーと値は引用符で囲むことができます。

**構文**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character]]])
```

エイリアス:
- `str_to_map`
- `mapFromString`

**引数**

- `data` - キーと値のペアを抽出するための文字列。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `key_value_delimiter` - キーと値を区切る単一文字。デフォルトは `:` です。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `pair_delimiters` - ペアを区切る文字のセット。デフォルトは ` `、 `,` および `;` です。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `quoting_character` - 引用文字として使用される単一文字。デフォルトは `"` です。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- キーと値のペアのマップ。型: [Map(String, String)](../data-types/map.md) 

**例**

クエリ:

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv
```

結果:

``` Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

引用文字としてシングルクオート `'` を使う場合:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv
```

結果:

``` text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

エスケープシーケンスがサポートされていない場合のエスケープシーケンス:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

結果:

``` text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

`toString` で直列化されたマップの文字列キーと値のペアを復元するためのクエリ:

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) as map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

結果:

```response
Row 1:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

`extractKeyValuePairs` と同じですが、エスケープをサポートします。

サポートされるエスケープシーケンス: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` および `\0`。
非標準のエスケープシーケンスは、そのまま（バックスラッシュを含む）返されます。ただし、以下のいずれかである場合は除きます：
`\\`, `'`, `"`, `backtick`, `/`, `=` または ASCII 制御文字（c &lt;= 31）。

この関数は、事前のエスケープおよび後処理のエスケープが適切でないユースケースを満たします。例えば、次の入力文字列を考えてみてください：`a: "aaaa\"bbb"`。期待される出力は `a: aaaa\"bbbb` です。
- 事前エスケープ: 事前にエスケープすると、出力は `a: "aaaa"bbb"` になり、`extractKeyValuePairs` は `a: aaaa` を出力します。
- 後処理: `extractKeyValuePairs` は `a: aaaa\` を出力し、後処理ではそのままになります。

キーの先頭のエスケープシーケンスはスキップされ、値では無効と見なされます。

**例**

エスケープシーケンスがエスケープサポートを有効にした状態でのシーケンス:

```sql
SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv
```

結果:

```response
┌─kv────────────────┐
│ {'age':'a\n\n\0'} │
└───────────────────┘
```

## mapAdd {#mapadd}

すべてのキーを集め、対応する値を合計します。

**構文**

```sql
mapAdd(arg1, arg2 [, ...])
```

**引数**

引数は [map](../data-types/map.md) または二つの [arrays](../data-types/array.md#data-type-array) の [tuples](../data-types/tuple.md#tuplet1-t2) であり、最初の配列の項目はキーを表し、第二の配列は各キーの値を含みます。すべてのキー配列は同じ型でなければならず、すべての値配列は一つの型に昇格される項目を含まなければなりません（[Int64](../data-types/int-uint.md#int-ranges)、[UInt64](../data-types/int-uint.md#uint-ranges) または [Float64](../data-types/float.md#float32-float64)）。共通の昇格型が結果配列の型として使用されます。

**戻り値**

- 引数に応じて、ソートされたキーを含む最初の配列と、それに対応する値を含む第二の配列のいずれかの [map](../data-types/map.md) または [tuple](../data-types/tuple.md#tuplet1-t2) を返します。

**例**

`Map` 型を使用したクエリ:

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

結果:

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

タプルを使用したクエリ:

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) as res, toTypeName(res) as type;
```

結果:

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```

## mapSubtract {#mapsubtract}

すべてのキーを集め、対応する値を引きます。

**構文**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**引数**

引数は [maps](../data-types/map.md) または二つの [arrays](../data-types/array.md#data-type-array) の [tuples](../data-types/tuple.md#tuplet1-t2) であり、最初の配列の項目はキーを表し、第二の配列は各キーの値を含みます。すべてのキー配列は同じ型でなければならず、すべての値配列は一つの型に昇格される項目を含まなければなりません（[Int64](../data-types/int-uint.md#int-ranges)、[UInt64](../data-types/int-uint.md#uint-ranges) または [Float64](../data-types/float.md#float32-float64)）。共通の昇格型が結果配列の型として使用されます。

**戻り値**

- 引数に応じて、ソートされたキーを含む最初の配列と、それに対応する値を含む第二の配列のいずれかの [map](../data-types/map.md) または [tuple](../data-types/tuple.md#tuplet1-t2) を返します。

**例**

`Map` 型を使用したクエリ:

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

結果:

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

タプルマップを使用したクエリ:

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) as res, toTypeName(res) as type;
```

結果:

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

整数キーのマップで不足しているキーと値のペアを埋めます。
最大キーを指定することで、キーを最大値以上に拡張することができます。
より具体的には、この関数は、キーが最小から最大キー（または指定された場合は `max` 引数）までのシリーズを形成し、対応する値を持つマップを返します。
キーに値が指定されない場合は、デフォルト値がその値とされます。
キーが重複する場合、最初の値（出現順）がキーに関連付けられます。

**構文**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

配列引数の場合、`keys` と `values` の要素数は各行で同じでなければなりません。

**引数**

引数は [Maps](../data-types/map.md) または二つの [Arrays](../data-types/array.md#data-type-array) であり、最初の配列と第二の配列は、各キーのキーと値を含んでいます。

マップされた配列:

- `map` — 整数キーのマップ。[Map](../data-types/map.md)。

または

- `keys` — キーの配列。 [Array](../data-types/array.md#data-type-array)([Int](../data-types/int-uint.md#uint-ranges))。
- `values` — 値の配列。 [Array](../data-types/array.md#data-type-array)([Int](../data-types/int-uint.md#uint-ranges))。
- `max` — 最大キー値。オプション。 [Int8, Int16, Int32, Int64, Int128, Int256](../data-types/int-uint.md#int-ranges)。

**戻り値**

- 引数に応じて、[Map](../data-types/map.md) または二つの [Arrays](../data-types/array.md#data-type-array) の [Tuple](../data-types/tuple.md#tuplet1-t2): ソート順のキーと、対応するキーの値。

**例**

`Map` 型を使用したクエリ:

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

結果:

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

マップされた配列を使用したクエリ:

```sql
SELECT mapPopulateSeries([1,2,4], [11,22,44], 5) AS res, toTypeName(res) AS type;
```

結果:

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```

## mapContains {#mapcontains}

与えられたマップに指定されたキーが含まれているかを返します。

**構文**

```sql
mapContains(map, key)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。
- `key` — キー。型は `map` のキータイプに一致しなければなりません。

**戻り値**

- `map` が `key` を含む場合は `1`、含まない場合は `0`。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContains(a, 'name') FROM tab;

```

結果:

```text
┌─mapContains(a, 'name')─┐
│                      1 │
│                      0 │
└────────────────────────┘
```

## mapKeys {#mapkeys}

指定したマップのキーを返します。

この関数は、設定 [optimize_functions_to_subcolumns](../../operations/settings/settings.md#optimize-functions-to-subcolumns) を有効にすることで最適化できます。
設定が有効な場合、この関数はマップ全体ではなく、[keys](../data-types/map.md#map-subcolumns) サブカラムのみを読み取ります。
クエリ `SELECT mapKeys(m) FROM table` は `SELECT m.keys FROM table` に変換されます。

**構文**

```sql
mapKeys(map)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。

**戻り値**

- `map` からすべてのキーを含む配列。 [Array](../data-types/array.md)。

**例**

クエリ:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapKeys(a) FROM tab;
```

結果:

```text
┌─mapKeys(a)────────────┐
│ ['name','age']        │
│ ['number','position'] │
└───────────────────────┘
```

## mapValues {#mapvalues}

指定したマップの値を返します。

この関数は、設定 [optimize_functions_to_subcolumns](../../operations/settings/settings.md#optimize-functions-to-subcolumns) を有効にすることで最適化できます。
設定が有効な場合、この関数はマップ全体ではなく、[values](../data-types/map.md#map-subcolumns) サブカラムのみを読み取ります。
クエリ `SELECT mapValues(m) FROM table` は `SELECT m.values FROM table` に変換されます。

**構文**

```sql
mapValues(map)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。

**戻り値**

- `map` からすべての値を含む配列。 [Array](../data-types/array.md)。

**例**

クエリ:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapValues(a) FROM tab;
```

結果:

```text
┌─mapValues(a)─────┐
│ ['eleven','11']  │
│ ['twelve','6.0'] │
└──────────────────┘
```

## mapContainsKeyLike {#mapcontainskeylike}

**構文**

```sql
mapContainsKeyLike(map, pattern)
```

**引数**
- `map` — マップ。 [Map](../data-types/map.md)。
- `pattern`  - 一致させる文字列パターン。

**戻り値**

- 指定したパターンのようなキーが `map` に含まれていれば `1`、含まれていなければ `0` を返します。

**例**

クエリ:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

結果:

```text
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```

## mapExtractKeyLike {#mapextractkeylike}

文字列キーを持つマップとLIKEパターンを考慮すると、この関数はキーがパターンに一致する要素を含むマップを返します。

**構文**

```sql
mapExtractKeyLike(map, pattern)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。
- `pattern`  - 一致させる文字列パターン。

**戻り値**

- 指定したパターンに一致するキーを持つ要素を含むマップ。パターンに一致する要素がない場合は、空のマップが返されます。

**例**

クエリ:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

結果:

```text
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```

## mapApply {#mapapply}

マップの各要素に関数を適用します。

**構文**

```sql
mapApply(func, map)
```

**引数**

- `func` — [ラムダ関数](../../sql-reference/functions/overview#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `map` — [Map](../data-types/map.md)。

**戻り値**

- 元のマップから `func(map1[i], ..., mapN[i])` を各要素に適用して得られたマップを返します。

**例**

クエリ:

```sql
SELECT mapApply((k, v) -> (k, v * 10), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

結果:

```text
┌─r─────────────────────┐
│ {'key1':0,'key2':0}   │
│ {'key1':10,'key2':20} │
│ {'key1':20,'key2':40} │
└───────────────────────┘
```

## mapFilter {#mapfilter}

各マップ要素に関数を適用してマップをフィルタリングします。

**構文**

```sql
mapFilter(func, map)
```

**引数**

- `func`  - [ラムダ関数](../../sql-reference/functions/overview#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `map` — [Map](../data-types/map.md)。

**戻り値**

- `func(map1[i], ..., mapN[i])` が 0 以外の何かを返す `map` 内の要素のみを含むマップを返します。

**例**

クエリ:

```sql
SELECT mapFilter((k, v) -> ((v % 2) = 0), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

結果:

```text
┌─r───────────────────┐
│ {'key1':0,'key2':0} │
│ {'key2':2}          │
│ {'key1':2,'key2':4} │
└─────────────────────┘
```

## mapUpdate {#mapupdate}

**構文**

```sql
mapUpdate(map1, map2)
```

**引数**

- `map1` [Map](../data-types/map.md)。
- `map2` [Map](../data-types/map.md)。

**戻り値**

- `map2` の対応するキーの値で更新された `map1` を返します。

**例**

クエリ:

```sql
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10)) AS map;
```

結果:

```text
┌─map────────────────────────────┐
│ {'key3':0,'key1':10,'key2':10} │
└────────────────────────────────┘
```

## mapConcat {#mapconcat}

キーの等価性に基づいて複数のマップを連結します。
同じキーを持つ要素が複数の入力マップに存在する場合、すべての要素が結果のマップに追加されますが、オペレーター `[]` を介してアクセスできるのは最初の要素だけです。

**構文**

```sql
mapConcat(maps)
```

**引数**

-   `maps` – 任意の数の [Maps](../data-types/map.md)。

**戻り値**

- 引数として渡された連結されたマップを持つマップを返します。

**例**

クエリ:

```sql
SELECT mapConcat(map('key1', 1, 'key3', 3), map('key2', 2)) AS map;
```

結果:

```text
┌─map──────────────────────────┐
│ {'key1':1,'key3':3,'key2':2} │
└──────────────────────────────┘
```

クエリ:

```sql
SELECT mapConcat(map('key1', 1, 'key2', 2), map('key1', 3)) AS map, map['key1'];
```

結果:

```text
┌─map──────────────────────────┬─elem─┐
│ {'key1':1,'key2':2,'key1':3} │    1 │
└──────────────────────────────┴──────┘
```

## mapExists(\[func,\], map) {#mapexistsfunc-map}

`map` 内で `func(key, value)` が 0 以外の値を返すキーと値のペアが少なくとも一つ存在すれば 1 を返します。そうでない場合は 0 を返します。

:::note
`mapExists` は [高次関数](../../sql-reference/functions/overview#higher-order-functions) です。
最初の引数としてラムダ関数を渡すことができます。
:::

**例**

クエリ:

```sql
SELECT mapExists((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

結果:

```
┌─res─┐
│   1 │
└─────┘
```

## mapAll(\[func,\] map) {#mapallfunc-map}

`func(key, value)` が `map` のすべてのキーと値のペアに対して 0 以外の値を返す場合は 1、それ以外は 0 を返します。

:::note
`mapAll` も [高次関数](../../sql-reference/functions/overview#higher-order-functions) です。
最初の引数としてラムダ関数を渡すことができます。
:::

**例**

クエリ:

```sql
SELECT mapAll((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

結果:

```
┌─res─┐
│   0 │
└─────┘
```

## mapSort(\[func,\], map) {#mapsortfunc-map}

マップの要素を昇順にソートします。
`func` 関数が指定されている場合、ソート順はマップのキーと値に適用される `func` 関数の結果によって決まります。

**例**

``` sql
SELECT mapSort(map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

``` text
┌─map──────────────────────────┐
│ {'key1':3,'key2':2,'key3':1} │
└──────────────────────────────┘
```

``` sql
SELECT mapSort((k, v) -> v, map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

``` text
┌─map──────────────────────────┐
│ {'key3':1,'key2':2,'key1':3} │
└──────────────────────────────┘
```

詳細については、`arraySort` 関数の [リファレンス](../../sql-reference/functions/array-functions.md#array_functions-sort) を参照してください。 

## mapPartialSort {#mappartialsort}

追加の `limit` 引数を指定して、マップの要素を昇順にソートし、部分的なソートを可能にします。
`func` 関数が指定されている場合、ソート順はマップのキーと値に適用される `func` 関数の結果によって決まります。

**構文**

```sql
mapPartialSort([func,] limit, map)
```
**引数**

- `func` – マップのキーと値に対して適用するオプションの関数。 [ラムダ関数](../../sql-reference/functions/overview#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `limit` – [1..limit] の範囲内の要素がソートされます。 [(U)Int](../data-types/int-uint.md)。
- `map` – ソートするマップ。 [Map](../data-types/map.md)。

**戻り値**

- 部分的にソートされたマップ。 [Map](../data-types/map.md)。

**例**

``` sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

``` text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```

## mapReverseSort(\[func,\], map) {#mapreversesortfunc-map}

マップの要素を降順にソートします。
`func` 関数が指定されている場合、ソート順はマップのキーと値に適用される `func` 関数の結果によって決まります。

**例**

``` sql
SELECT mapReverseSort(map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

``` text
┌─map──────────────────────────┐
│ {'key3':1,'key2':2,'key1':3} │
└──────────────────────────────┘
```

``` sql
SELECT mapReverseSort((k, v) -> v, map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

``` text
┌─map──────────────────────────┐
│ {'key1':3,'key2':2,'key3':1} │
└──────────────────────────────┘
```

詳細については、関数 [arrayReverseSort](../../sql-reference/functions/array-functions.md#array_functions-reverse-sort) を参照してください。

## mapPartialReverseSort {#mappartialreversesort}

追加の `limit` 引数を指定して、マップの要素を降順にソートし、部分的なソートが可能になります。
`func` 関数が指定されている場合、ソート順はマップのキーと値に適用される `func` 関数の結果によって決まります。

**構文**

```sql
mapPartialReverseSort([func,] limit, map)
```
**引数**

- `func` – マップのキーと値に適用するオプションの関数。 [ラムダ関数](../../sql-reference/functions/overview#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `limit` – [1..limit] の範囲内の要素がソートされます。 [(U)Int](../data-types/int-uint.md)。
- `map` – ソートするマップ。 [Map](../data-types/map.md)。

**戻り値**

- 部分的にソートされたマップ。 [Map](../data-types/map.md)。

**例**

``` sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

``` text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```
