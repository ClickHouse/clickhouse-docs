---
slug: '/sql-reference/functions/tuple-map-functions'
sidebar_position: 120
sidebar_label: 'マップ関数'
title: 'マップ関数'
keywords: ['ClickHouse', 'マップ関数']
description: 'ClickHouseのマップ関数に関する文書'
---

## map {#map}

[key-valueペア](../data-types/map.md)から[Map(key, value)](../data-types/map.md)タイプの値を作成します。

**構文**

```sql
map(key1, value1[, key2, value2, ...])
```

**引数**

- `key_n` — マップエントリのキー。 [Map](../data-types/map.md)のキータイプとしてサポートされている任意のタイプ。
- `value_n` — マップエントリの値。 [Map](../data-types/map.md)の値タイプとしてサポートされている任意のタイプ。

**返される値**

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

キーの配列またはマップと値の配列またはマップからマップを作成します。

この関数は、構文 `CAST([...], 'Map(key_type, value_type)')` の便利な代替手段です。
例えば、以下のように書く代わりに
- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`、または
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

次のように書くことができます。 `mapFromArrays(['aa', 'bb'], [4, 5])`。

**構文**

```sql
mapFromArrays(keys, values)
```

エイリアス: `MAP_FROM_ARRAYS(keys, values)`

**引数**

- `keys` — [Array](../data-types/array.md)または[Map](../data-types/map.md)からマップを作成するためのキーの配列またはマップ。`keys` が配列の場合、NULL値を含まない限り、そのタイプとして `Array(Nullable(T))` または `Array(LowCardinality(Nullable(T)))` を受け入れます。
- `values`  - [Array](../data-types/array.md)または[Map](../data-types/map.md)からマップを作成するための値の配列またはマップ。

**返される値**

- キー配列と値配列/マップから構築されたマップ。

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

`mapFromArrays` は、[Map](../data-types/map.md)タイプの引数も受け入れます。これらは、実行時にタプルの配列にキャストされます。

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

キーと値のペアの文字列を[Map(String, String)](../data-types/map.md)に変換します。
解析はノイズ（例：ログファイル）に対して耐性があります。
入力文字列のキー-バリューペアは、キーの後にキー-バリュー区切り文字が続き、その後に値が続きます。
キー-バリューペアはペアの区切りで分けられます。
キーと値は引用符で囲むことができます。

**構文**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character]]])
```

エイリアス:
- `str_to_map`
- `mapFromString`

**引数**

- `data` - キー-バリューペアを抽出するための文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `key_value_delimiter` - キーと値を区切る単一文字。デフォルトは `:`。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `pair_delimiters` - ペアを区切る文字のセット。デフォルトは ` `、`,` および `;`。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `quoting_character` - 引用符キャラクターとして使う単一文字。デフォルトは `"`。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

- キー-バリューペアの配列。タイプ: [Map(String, String)](../data-types/map.md)

**例**

クエリ

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv
```

結果:

``` response
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

引用符 `'` を引用文字として使った場合:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv
```

結果:

``` text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

エスケープシーケンスなしのエスケープシーケンス対応:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

結果:

``` text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

`toString`でシリアライズされたマップ文字列のキー-バリューペアを復元するには:

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

`extractKeyValuePairs` と同じですが、エスケープのサポートがあります。

サポートされているエスケープシーケンス: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` および `\0`。
非標準のエスケープシーケンスは、そのままの形（バックスラッシュを含む）で返されますが、以下のいずれかの場合を除きます: `\\`, `'`, `"`, `バックティック`, `/`, `=` または ASCII 制御文字 (c &lt;= 31)。

この関数は、事前のエスケープおよび後のエスケープが適さない使用ケースを満たします。
例えば、次の入力文字列を考えます: `a: "aaaa\"bbb"`。期待される出力は: `a: aaaa\"bbbb` です。
- 事前エスケープ: 事前エスケープすると出力は: `a: "aaaa"bbb` となり、`extractKeyValuePairs` の出力は: `a: aaaa`。
- 後エスケープ: `extractKeyValuePairs` の出力は `a: aaaa\` となり、後エスケープはそのままです。

キー内の先頭エスケープシーケンスはスキップされ、値に対して無効とみなされます。

**例**

エスケープシーケンスのサポートがオンになっている場合のエスケープシーケンス:

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

すべてのキーを収集し、対応する値を合計します。

**構文**

```sql
mapAdd(arg1, arg2 [, ...])
```

**引数**

引数は、[map](../data-types/map.md) または、2つの [arrays](/sql-reference/data-types/array) の[tuple](/sql-reference/data-types/tuple)です。
最初の配列の項目はキーを表し、2番目の配列は各キーに対する値を含みます。すべてのキー配列は同じタイプである必要があり、すべての値配列は、同じ型([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) または [Float64](/sql-reference/data-types/float))に昇格される項目を含む必要があります。
共通の昇格されたタイプが結果配列の型として使用されます。

**返される値**

- 引数に応じて、並べ替えられたキーを含む1つの[map](../data-types/map.md)または[tuple](/sql-reference/data-types/tuple)が返され、その第二配列には対応する値が含まれます。

**例**

`Map`タイプのクエリ:

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

結果:

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

タプルのクエリ:

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

すべてのキーを収集し、対応する値を引きます。

**構文**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**引数**

引数は、[map](../data-types/map.md) または、2つの [arrays](/sql-reference/data-types/array) の[tuple](/sql-reference/data-types/tuple)です。
最初の配列の項目はキーを表し、2番目の配列は各キーに対する値を含みます。すべてのキー配列は同じタイプである必要があり、すべての値配列は、同じ型([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) または [Float64](/sql-reference/data-types/float))に昇格される項目を含む必要があります。
共通の昇格されたタイプが結果配列の型として使用されます。

**返される値**

- 引数に応じて、並べ替えられたキーを含む1つの[map](../data-types/map.md)または[tuple](/sql-reference/data-types/tuple)が返され、その第二配列には対応する値が含まれます。

**例**

`Map`タイプのクエリ:

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

結果:

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

タプルのマップのクエリ:

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

整数キーのマップで欠落しているキー-バリューペアを埋めます。
キーを最大値を超えて拡張できるようにするために、最大キーを指定できます。
より具体的には、この関数は、最小キーから最大キーまで（または指定された場合は`max`引数）のキーをステップサイズ1で形成するマップを返し、対応する値も返します。
キーの値が指定されていない場合は、デフォルト値が使用されます。
キーが繰り返される場合は、最初の値のみ（出現順）にそのキーが関連付けられます。

**構文**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

配列引数の場合、各行の `keys` と `values` の要素数は同じでなければなりません。

**引数**

引数は、[Maps](../data-types/map.md) または2つの [Arrays](/sql-reference/data-types/array) で、最初の配列と第二の配列には、各キーに対するキーと値が含まれています。

マップ配列:

- `map` — 整数キーを持つマップ。 [Map](../data-types/map.md)。

または

- `keys` — キーの配列。 [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `values` — 値の配列。 [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `max` — 最大キー値。オプション。[Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

- 引数に応じて、[Map](../data-types/map.md)または2つの[Arrays](/sql-reference/data-types/array)の[Tuple](/sql-reference/data-types/tuple): ソートされた順序のキー、対応するキーの値。

**例**

`Map`タイプのクエリ:

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

結果:

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

マップ配列によるクエリ:

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

指定されたキーが指定されたマップに含まれているかどうかを返します。

**構文**

```sql
mapContains(map, key)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `key` — キー。型は `map` のキー型と一致しなければなりません。

**返される値**

- `map` が `key` を含む場合は `1`、含まない場合は `0` を返します。[UInt8](../data-types/int-uint.md)。

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

指定されたマップのキーを返します。

この関数は、設定 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。
設定が有効な場合、この関数はマップ全体ではなく、[keys](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムのみを読み取ります。
クエリ `SELECT mapKeys(m) FROM table` は `SELECT m.keys FROM table` に変換されます。

**構文**

```sql
mapKeys(map)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。

**返される値**

- マップからすべてのキーを含む配列。[Array](../data-types/array.md)。

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

指定されたマップの値を返します。

この関数は、設定 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。
設定が有効な場合、この関数はマップ全体ではなく、[values](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムのみを読み取ります。
クエリ `SELECT mapValues(m) FROM table` は `SELECT m.values FROM table` に変換されます。

**構文**

```sql
mapValues(map)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。

**返される値**

- マップからすべての値を含む配列。[Array](../data-types/array.md)。

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
- `map` — マップ。[Map](../data-types/map.md)。
- `pattern`  - 一致する文字列パターン。

**返される値**

- 指定されたパターンに似たキーが `map` に含まれている場合は `1`、そうでない場合は `0`。

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

文字列キーのマップを与えられた場合とLIKEパターンを指定すると、この関数は、キーがパターンに一致する要素を含むマップを返します。

**構文**

```sql
mapExtractKeyLike(map, pattern)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `pattern`  - 一致する文字列パターン。

**返される値**

- 指定されたパターンに一致するキーを持つ要素を含むマップ。要素がパターンに一致しない場合、空のマップが返されます。

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

- `func` — [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返される値**

- 元のマップから得られるマップを返します。これは、各要素に対して `func(map1[i], ..., mapN[i])` の適用によって得られます。

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

マップの各要素に関数を適用して、マップをフィルタリングします。

**構文**

```sql
mapFilter(func, map)
```

**引数**

- `func`  - [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返される値**

- `func(map1[i], ..., mapN[i])` が 0 以外の何かを返すマップの要素のみを含むマップを返します。

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

**返される値**

- `map2` の対応するキーに対して値が更新された `map1` を返します。

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

キーの等価性に基づいて複数のマップを結合します。
同じキーを持つ要素が複数の入力マップに存在する場合、すべての要素が結果マップに追加されますが、オペレーター `[]` を介してアクセスできるのは最初のものだけです。

**構文**

```sql
mapConcat(maps)
```

**引数**

-   `maps` – 任意の数の[Maps](../data-types/map.md)。

**返される値**

- 引数として渡された結合したマップを持つマップを返します。

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

`map` に少なくとも 1 つのキー-バリュー ペアが存在し、`func(key, value)` が 0 以外の何かを返す場合は 1 を返します。そうでなければ 0 を返します。

:::note
`mapExists` は[高階関数](/sql-reference/functions/overview#higher-order-functions)です。
最初の引数にラムダ関数を渡すことができます。
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

すべてのキー-バリューペアに対して、`func(key, value)` が 0 以外の何かを返す場合は 1 を返します。そうでなければ 0 を返します。

:::note
`mapAll` は[高階関数](/sql-reference/functions/overview#higher-order-functions)です。
最初の引数にラムダ関数を渡すことができます。
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
`func` 関数が指定されている場合、ソート順は、マップのキーと値に `func` 関数を適用した結果によって決まります。

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

詳細については、`arraySort` 関数の[リファレンス](/sql-reference/functions/array-functions#sort)をご覧ください。

## mapPartialSort {#mappartialsort}

追加の `limit` 引数を使って、マップの要素を昇順にソートし、部分的なソートを可能にします。
`func` 関数が指定されている場合、ソート順は、マップのキーと値に `func` 関数を適用した結果によって決まります。

**構文**

```sql
mapPartialSort([func,] limit, map)
```

**引数**

- `func` – マップのキーと値に適用するオプションの関数。[ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 範囲内の要素[1..limit]がソートされます。[(U)Int](../data-types/int-uint.md)。
- `map` – ソートするマップ。[Map](../data-types/map.md)。

**返される値**

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
`func` 関数が指定されている場合、ソート順は、マップのキーと値に `func` 関数を適用した結果によって決まります。

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

詳しい情報は、関数 [arrayReverseSort](/sql-reference/functions/array-functions#arrayreversesort) を参照してください。

## mapPartialReverseSort {#mappartialreversesort}

追加の `limit` 引数を持ち、降順でマップの要素をソートし、部分的なソートを可能にします。
`func` 関数が指定されている場合、ソート順は、マップのキーと値に `func` 関数を適用した結果によって決まります。

**構文**

```sql
mapPartialReverseSort([func,] limit, map)
```

**引数**

- `func` – マップのキーと値に適用するオプションの関数。[ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 範囲内の要素[1..limit]がソートされます。[(U)Int](../data-types/int-uint.md)。
- `map` – ソートするマップ。[Map](../data-types/map.md)。

**返される値**

- 部分的にソートされたマップ。[Map](../data-types/map.md)。

**例**

``` sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

``` text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
