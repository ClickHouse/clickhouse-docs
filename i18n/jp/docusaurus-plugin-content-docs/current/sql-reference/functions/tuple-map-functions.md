---
slug: /sql-reference/functions/tuple-map-functions
sidebar_position: 120
sidebar_label: マップ
title: マップ関数
---

## map {#map}

キーと値のペアから [Map(key, value)](../data-types/map.md) タイプの値を生成します。

**構文**

```sql
map(key1, value1[, key2, value2, ...])
```

**引数**

- `key_n` — マップエントリのキー。 [Map](../data-types/map.md) のキータイプとしてサポートされている任意のタイプ。
- `value_n` — マップエントリの値。 [Map](../data-types/map.md) のバリュタイプとしてサポートされている任意のタイプ。

**戻り値**

- `key:value` ペアを含むマップ。 [Map(key, value)](../data-types/map.md)。

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
例えば、次のように書く代わりに
- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`、または
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

`mapFromArrays(['aa', 'bb'], [4, 5])` と書くことができます。

**構文**

```sql
mapFromArrays(keys, values)
```

エイリアス: `MAP_FROM_ARRAYS(keys, values)`

**引数**

- `keys` — マップを生成するためのキーの配列またはマップ。 [Array](../data-types/array.md) または [Map](../data-types/map.md)。 `keys` が配列の場合、NULL値を含まない限り、 `Array(Nullable(T))` または `Array(LowCardinality(Nullable(T)))` タイプを受け入れます。
- `values`  - マップを生成するための値の配列またはマップ。 [Array](../data-types/array.md) または [Map](../data-types/map.md)。

**戻り値**

- キー配列と値配列/マップから構成されたマップ。

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

`mapFromArrays` は [Map](../data-types/map.md) タイプの引数も受け付けます。これらは実行時にタプルの配列にキャストされます。

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
解析はノイズに対して寛容です（例: ログファイル）。
入力文字列のキー・バリューペアは、キーの後にキーと値のデリミタが続き、値が続きます。
キー・バリューペアはペアのデリミタで区切られます。
キーと値はクォートされている場合があります。

**構文**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character]]])
```

エイリアス:
- `str_to_map`
- `mapFromString`

**引数**

- `data` - キー・バリューペアを抽出するための文字列。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `key_value_delimiter` - キーと値を区切る単一文字。デフォルトは `:` です。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `pair_delimiters` - ペアを区切る文字のセット。デフォルトは ` `, `,` および `;` です。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `quoting_character` - クォート文字として使用される単一文字。デフォルトは `"` です。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**戻り値**

- キー・バリューペアの配列。 タイプ: [Map(String, String)](../data-types/map.md)。

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

シングルクォート `'` をクォート文字として使用した場合:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv
```

結果:

``` text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

エスケープシーケンスをサポートしないエスケープシーケンス:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

結果:

``` text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

`toString` でシリアライズされたマップ文字列キー・バリューペアを復元するには:

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

`extractKeyValuePairs` と同様ですが、エスケープをサポートしています。

サポートされているエスケープシーケンス: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` と `\0`。
標準外のエスケープシーケンスはそのまま返されます（バックスラッシュを含む）、以下のいずれかでない限り:
`\\`, `'`, `"`, バックティック、`/`, `=` または ASCII コントロール文字（c &lt;= 31）。

この関数は、プレエスケープとポストエスケープが適していない use case を満たすことができます。例えば、次のような入力文字列を考えてください: `a: "aaaa\"bbb"`。期待される出力は: `a: aaaa\"bbbb` です。
- プレエスケープ: プレエスケープすると、出力は `a: "aaaa"bbb"` になり、 `extractKeyValuePairs` はその後 `a: aaaa` を出力します。
- ポストエスケープ: `extractKeyValuePairs` は `a: aaaa\` を出力し、ポストエスケープはそれをそのまま保持します。

先頭のエスケープシーケンスはキーの先頭でスキップされ、値には無効と見なされます。

**例**

エスケープシーケンスサポートがオンの場合のエスケープシーケンス:

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

すべてのキーを集めて対応する値を合計します。

**構文**

```sql
mapAdd(arg1, arg2 [, ...])
```

**引数**

引数は [maps](../data-types/map.md) または [tuples](../data-types/tuple.md#tuplet1-t2) の2つの [arrays](../data-types/array.md#data-type-array) であり、最初の配列のアイテムはキーを表し、2番目の配列には各キーの値が含まれます。すべてのキー配列は同じタイプでなければならず、すべての値配列は1つのタイプに昇格可能なアイテムを含まなければなりません ([Int64](../data-types/int-uint.md#int-ranges)、 [UInt64](/sql-reference/data-types/int-uint#integer-ranges) または [Float64](../data-types/float.md#float32-float64))。共通の昇格タイプは結果配列のタイプとして使用されます。

**戻り値**

- 引数に応じて、1つの [map](../data-types/map.md) または [tuple](../data-types/tuple.md#tuplet1-t2) を返します。最初の配列にはソートされたキーが含まれ、2番目の配列にはそれに対応する値が含まれます。

**例**

`Map` タイプを使用したクエリ:

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

すべてのキーを集めて対応する値を引きます。

**構文**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**引数**

引数は [maps](../data-types/map.md) または [tuples](../data-types/tuple.md#tuplet1-t2) の2つの [arrays](../data-types/array.md#data-type-array) であり、最初の配列のアイテムはキーを表し、2番目の配列には各キーの値が含まれます。すべてのキー配列は同じタイプでなければならず、すべての値配列は1つのタイプに昇格可能なアイテムを含まなければなりません ([Int64](../data-types/int-uint.md#int-ranges)、 [UInt64](/sql-reference/data-types/int-uint#integer-ranges) または [Float64](../data-types/float.md#float32-float64))。共通の昇格タイプは結果配列のタイプとして使用されます。

**戻り値**

- 引数に応じて、1つの [map](../data-types/map.md) または [tuple](../data-types/tuple.md#tuplet1-t2) を返します。最初の配列にはソートされたキーが含まれ、2番目の配列にはそれに対応する値が含まれます。

**例**

`Map` タイプを使用したクエリ:

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

整数キーのマップ内の不足しているキー・バリューペアを埋めます。
最大キーバリュを指定することで、最大値を超えてキーを拡張することができます。
具体的には、この関数は、最小のキーから最大のキー（または指定された `max` 引数）までのシリーズを形成し、それに対応する値を持つマップを返します。
キーの値が指定されていない場合、デフォルト値が使用されます。
キーが重複する場合、最初の値（出現順）だけがそのキーに関連付けられます。

**構文**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

配列引数の場合、各行の `keys` と `values` の要素数は同じでなければなりません。

**引数**

引数は [Maps](../data-types/map.md) または2つの [Arrays](../data-types/array.md#data-type-array)、最初の配列は各キーのためのキー、2番目の配列は各キーに対応する値からなります。

マップされた配列:

- `map` — 整数キーを持つマップ。 [Map](../data-types/map.md)。

または

- `keys` — キーの配列。 [Array](../data-types/array.md#data-type-array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `values` — 値の配列。 [Array](../data-types/array.md#data-type-array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `max` — 最大キーバリュ。オプション。 [Int8, Int16, Int32, Int64, Int128, Int256](../data-types/int-uint.md#int-ranges)。

**戻り値**

- 引数に応じて、ソートされた順序の [Map](../data-types/map.md) または2つの [Arrays](../data-types/array.md#data-type-array) の [Tuple](../data-types/tuple.md#tuplet1-t2): 対応するキーの値。

**例**

`Map` タイプを使用したクエリ:

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

結果:

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

マップ配列を使用したクエリ:

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

指定されたキーが与えられたマップに含まれているかどうかを返します。

**構文**

```sql
mapContains(map, key)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。
- `key` — キー。型は `map` のキータイプと一致しなければなりません。

**戻り値**

- `map` に `key` が含まれている場合は `1`、含まれていない場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

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

与えられたマップのキーを返します。

この関数は、設定 [optimize_functions_to_subcolumns](../../operations/settings/settings.md#optimize-functions-to-subcolumns) を有効にすることで最適化されます。
設定が有効になっている場合、この関数はマップ全体ではなく [keys](../data-types/map.md#map-subcolumns) サブカラムのみを読み取ります。
クエリ `SELECT mapKeys(m) FROM table` は `SELECT m.keys FROM table` に変換されます。

**構文**

```sql
mapKeys(map)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。

**戻り値**

- `map` からのすべてのキーを含む配列。 [Array](../data-types/array.md)。

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

与えられたマップの値を返します。

この関数は、設定 [optimize_functions_to_subcolumns](../../operations/settings/settings.md#optimize-functions-to-subcolumns) を有効にすることで最適化されます。
設定が有効になっている場合、この関数はマップ全体ではなく [values](../data-types/map.md#map-subcolumns) サブカラムのみを読み取ります。
クエリ `SELECT mapValues(m) FROM table` は `SELECT m.values FROM table` に変換されます。

**構文**

```sql
mapValues(map)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。

**戻り値**

- `map` からのすべての値を含む配列。 [Array](../data-types/array.md)。

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
- `pattern`  - マッチする文字列パターン。

**戻り値**

- 指定されたパターンのようなキーを含む場合は `1`、含まれていない場合は `0` を返します。

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

文字列キーを持つマップとLIKEパターンを与えると、この関数はパターンに一致するキーを持つ要素のマップを返します。

**構文**

```sql
mapExtractKeyLike(map, pattern)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。
- `pattern`  - マッチする文字列パターン。

**戻り値**

- 指定されたパターンに一致する要素を含むマップ。マッチする要素がない場合は空のマップが返されます。

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

- `func` — [ラムダ関数](/docs/sql-reference/functions/overview#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `map` — [Map](../data-types/map.md)。

**戻り値**

- 各要素に対して `func(map1[i], ..., mapN[i])` を適用したことによって得られる元のマップからのマップを返します。

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

マップの各要素に関数を適用することによって、マップをフィルタリングします。

**構文**

```sql
mapFilter(func, map)
```

**引数**

- `func`  - [ラムダ関数](/docs/sql-reference/functions/overview#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `map` — [Map](../data-types/map.md)。

**戻り値**

- `func(map1[i], ..., mapN[i])` が 0 以外の結果を返す `map` の要素のみを含むマップを返します。

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
同じキーを持つ要素が複数の入力マップに存在する場合、すべての要素は結果マップに追加されますが、最初の要素のみが `[]` 演算子を介してアクセス可能です。

**構文**

```sql
mapConcat(maps)
```

**引数**

-   `maps` – 任意の数の [Maps](../data-types/map.md)。

**戻り値**

- 引数として渡された連結マップからなるマップを返します。

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

`map` の少なくとも1つのキー・バリューペアが存在し、`func(key, value)` が 0 以外の値を返す場合は 1 を返します。そうでない場合は 0 を返します。

:::note
`mapExists` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) です。
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

`func(key, value)` が `map` のすべてのキー・バリューペアに対して 0 以外の値を返す場合は 1 を返します。そうでない場合は 0 を返します。

:::note
`mapAll` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) です。
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
`func` 関数が指定されている場合、ソート順はマップのキーと値に対する `func` 関数の結果によって決まります。

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

詳細については、 [arraySort](../../sql-reference/functions/array-functions.md#array_functions-sort) 関数のリファレンスを参照してください。

## mapPartialSort {#mappartialsort}

追加の `limit` 引数を使ってマップの要素を昇順にソートし、部分的なソートを可能にします。
`func` 関数が指定されている場合、ソート順はマップのキーと値に対する `func` 関数の結果によって決まります。

**構文**

```sql
mapPartialSort([func,] limit, map)
```
**引数**

- `func` – マップのキーと値に適用するオプションの関数。[ラムダ関数](/docs/sql-reference/functions/overview#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `limit` – 範囲 [1..limit] の要素がソートされます。[(U)Int](../data-types/int-uint.md)。
- `map` – ソートするマップ。[Map](../data-types/map.md)。

**戻り値**

- 部分的にソートされたマップ。[Map](../data-types/map.md)。

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
`func` 関数が指定されている場合、ソート順はマップのキーと値に対する `func` 関数の結果によって決まります。

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

詳細については、 [arrayReverseSort](../../sql-reference/functions/array-functions.md#array_functions-reverse-sort) 関数を参照してください。

## mapPartialReverseSort {#mappartialreversesort}

追加の `limit` 引数を使ってマップの要素を降順にソートし、部分的なソートを可能にします。
`func` 関数が指定されている場合、ソート順はマップのキーと値に対する `func` 関数の結果によって決まります。

**構文**

```sql
mapPartialReverseSort([func,] limit, map)
```
**引数**

- `func` – マップのキーと値に適用するオプションの関数。[ラムダ関数](/docs/sql-reference/functions/overview#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `limit` – 範囲 [1..limit] の要素がソートされます。[(U)Int](../data-types/int-uint.md)。
- `map` – ソートするマップ。[Map](../data-types/map.md)。

**戻り値**

- 部分的にソートされたマップ。[Map](../data-types/map.md)。

**例**

``` sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

``` text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```
