description: 'Tuple Map Functionsのドキュメンテーション'
sidebar_label: 'マップ'
sidebar_position: 120
slug: /sql-reference/functions/tuple-map-functions
title: 'マップ関数'
```

## map {#map}

[key-value ペア](../data-types/map.md)から [Map(key, value)](../data-types/map.md) 型の値を作成します。

**構文**

```sql
map(key1, value1[, key2, value2, ...])
```

**引数**

- `key_n` — マップエントリのキー。 [Map](../data-types/map.md) のキータイプとしてサポートされている任意のタイプ。
- `value_n` — マップエントリの値。 [Map](../data-types/map.md) のバリュータイプとしてサポートされている任意のタイプ。

**返される値**

- `key:value` ペアを含むマップ。 [Map(key, value)](../data-types/map.md)。

**例**

クエリ：

```sql
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3);
```

結果：

```text
┌─map('key1', number, 'key2', multiply(number, 2))─┐
│ {'key1':0,'key2':0}                              │
│ {'key1':1,'key2':2}                              │
│ {'key1':2,'key2':4}                              │
└──────────────────────────────────────────────────┘
```

## mapFromArrays {#mapfromarrays}

キーの配列またはマップと値の配列またはマップからマップを作成します。

この関数は、構文 `CAST([...], 'Map(key_type, value_type)')` の便利な代替手段です。例えば、以下のように書く代わりに
- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`、または
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

`mapFromArrays(['aa', 'bb'], [4, 5])` と書くことができます。

**構文**

```sql
mapFromArrays(keys, values)
```

エイリアス: `MAP_FROM_ARRAYS(keys, values)`

**引数**

- `keys` — マップを作成するためのキーの配列またはマップ。 [Array](../data-types/array.md) または [Map](../data-types/map.md)。 `keys` が配列の場合、 `Array(Nullable(T))` または `Array(LowCardinality(Nullable(T)))` というタイプを受け入れ、NULL値を含まない限り有効です。
- `values`  - マップを作成するための値の配列またはマップ。 [Array](../data-types/array.md) または [Map](../data-types/map.md)。

**返される値**

- キー配列と値配列/マップから構築されたマップ。

**例**

クエリ：

```sql
select mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

結果：

```response
┌─mapFromArrays(['a', 'b', 'c'], [1, 2, 3])─┐
│ {'a':1,'b':2,'c':3}                       │
└───────────────────────────────────────────┘
```

`mapFromArrays` は、型 [Map](../data-types/map.md) の引数も受け入れます。これらは実行中にタプルの配列にキャストされます。

```sql
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

結果：

```response
┌─mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))─┐
│ {1:('a',1),2:('b',2),3:('c',3)}                       │
└───────────────────────────────────────────────────────┘
```

```sql
SELECT mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])
```

結果：

```response
┌─mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])─┐
│ {('a',1):1,('b',2):2,('c',3):3}                       │
└───────────────────────────────────────────────────────┘
```

## extractKeyValuePairs {#extractkeyvaluepairs}

キーと値のペアの文字列を [Map(String, String)](../data-types/map.md) に変換します。
パースはノイズに対して寛容です（例: ログファイル）。
入力文字列のキー値ペアは、キーの後にキーと値の区切り文字が続き、値が続きます。
キー値ペアはペアの区切り文字で区切られます。
キーと値は引用符で囲むことができます。

**構文**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character]]])
```

エイリアス：
- `str_to_map`
- `mapFromString`

**引数**

- `data` - キーと値のペアを抽出するための文字列。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `key_value_delimiter` - キーと値を区切る単一文字。デフォルトは `:`。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `pair_delimiters` - ペアを区切る文字のセット。デフォルトは ` `、`,` と `;`。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `quoting_character` - 引用文字として使用される単一文字。デフォルトは `"`。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

- キーと値のペアのマップ。型: [Map(String, String)](../data-types/map.md) 

**例**

クエリ

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv
```

結果：

```Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

引用キャラクターとしてシングルクオート `'` を使用：

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv
```

結果：

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

エスケープシーケンスなしのエスケープシーケンスサポート：

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

結果：

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

`toString` でシリアライズされたマップ文字列のキーと値のペアを復元するには：

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) as map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

結果：

```response
Row 1:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

`extractKeyValuePairs` と同じですが、エスケープをサポートします。

サポートされるエスケープシーケンス: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v`、および `\0`。
非標準エスケープシーケンスはそのまま返されます（バックスラッシュを含む）が、以下のいずれかでない限り。
`\\`、`'`、`"`、`バックティック`、`/`、`=` または ASCII 制御文字（c &lt;= 31）。

この関数は、事前エスケープとポストエスケープが適切でないユースケースを満たします。以下の入力文字列を考えてみてください: `a: "aaaa\"bbb"`。期待される出力は: `a: aaaa\"bbbb`です。
- 事前エスケープ：事前にエスケープすると、出力は: `a: "aaaa"bbb` となり、その後 `extractKeyValuePairs` が出力するのは: `a: aaaa` です。
- ポストエスケープ: `extractKeyValuePairs` は `a: aaaa\` という出力を生成し、ポストエスケープはそのまま保持します。

先頭のエスケープシーケンスはキーでスキップされ、値には無効と見なされます。

**例**

エスケープシーケンスがサポートされるエスケープシーケンス：

```sql
SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv
```

結果：

```response
┌─kv────────────────┐
│ {'age':'a\n\n\0'} │
└───────────────────┘
```

## mapAdd {#mapadd}

すべてのキーを集計し、対応する値を合計します。

**構文**

```sql
mapAdd(arg1, arg2 [, ...])
```

**引数**

引数は [maps](../data-types/map.md) または [tuples](/sql-reference/data-types/tuple) の 2 つの [arrays](/sql-reference/data-types/array) で、最初の配列のアイテムがキーを表し、2 番目の配列が各キーの値を含みます。すべてのキー配列は同じタイプである必要があり、すべての値配列は昇格されて 1 つのタイプにする必要があります ([Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) または [Float64](/sql-reference/data-types/float))。共通の昇格されたタイプが結果配列のタイプとして使用されます。

**返される値**

- 引数に応じて 1 つの [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) を返し、最初の配列にはソートされたキーが含まれ、2 番目の配列には対応する値が含まれます。

**例**

`Map` タイプのクエリ：

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

結果：

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

タプルを使ったクエリ：

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) as res, toTypeName(res) as type;
```

結果：

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```

## mapSubtract {#mapsubtract}

すべてのキーを集計し、対応する値を減算します。

**構文**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**引数**

引数は [maps](../data-types/map.md) または [tuples](/sql-reference/data-types/tuple) の 2 つの [arrays](/sql-reference/data-types/array) で、最初の配列のアイテムがキーを表し、2 番目の配列が各キーの値を含みます。すべてのキー配列は同じタイプである必要があり、すべての値配列は昇格されて 1 つのタイプにする必要があります ([Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges) または [Float64](/sql-reference/data-types/float))。共通の昇格されたタイプが結果配列のタイプとして使用されます。

**返される値**

- 引数に応じて 1 つの [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) を返し、最初の配列にはソートされたキーが含まれ、2 番目の配列には対応する値が含まれます。

**例**

`Map` タイプのクエリ：

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

結果：

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

タプルマップを使ったクエリ：

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) as res, toTypeName(res) as type;
```

結果：

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

整数キーを持つマップに欠損しているキーと値のペアを填補します。
最大キーを指定して、キーを最大値を超えて拡張できるようにします。
具体的には、この関数は、最小キーから最大キー（または指定された `max` 引数）の間で、ステップサイズが 1 のキーから成る系列を形成し、それに対応する値を持つマップを返します。
キーに対する値が指定されていない場合、デフォルト値が使用されます。
キーが重複する場合、最初の値（出現順）だけがそのキーに関連付けられます。

**構文**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

配列引数の場合、`keys` と `values` の要素数は各行で同じでなければなりません。

**引数**

引数は [Maps](../data-types/map.md) または 2 つの [Arrays](/sql-reference/data-types/array) で、最初の配列と 2 番目の配列に各キーのキーと値が含まれます。

マッピングされた配列：

- `map` — 整数キーのマップ。 [Map](../data-types/map.md)。

または

- `keys` — キーの配列。 [Array](../data-types/array.md) ([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `values` — 値の配列。 [Array](../data-types/array.md) ([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `max` — 最大キー値。オプション。 [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

- 引数に応じて [Map](../data-types/map.md) または 2 つの [Arrays](/sql-reference/data-types/array) の [Tuple](/sql-reference/data-types/tuple): ソートされた順序のキー、及び対応するキーの値。

**例**

`Map` タイプのクエリ：

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

結果：

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

マッピングされた配列を使ったクエリ：

```sql
SELECT mapPopulateSeries([1,2,4], [11,22,44], 5) AS res, toTypeName(res) AS type;
```

結果：

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```


## mapKeys {#mapkeys}

与えられたマップのキーを返します。

この関数は [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) が有効になっている場合に最適化できます。
設定が有効になっている場合、この関数はマップ全体ではなく、その [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムだけを読み取ります。
クエリ `SELECT mapKeys(m) FROM table` は `SELECT m.keys FROM table` に変換されます。

**構文**

```sql
mapKeys(map)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。

**返される値**

- `map` からすべてのキーを含む配列。 [Array](../data-types/array.md)。

**例**

クエリ：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapKeys(a) FROM tab;
```

結果：

```text
┌─mapKeys(a)────────────┐
│ ['name','age']        │
│ ['number','position'] │
└───────────────────────┘
```

## mapContains {#mapcontains}

与えられたキーが与えられたマップに含まれているかどうかを返します。

**構文**

```sql
mapContains(map, key)
```

エイリアス: `mapContainsKey(map, key)`

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。
- `key` — キー。タイプは `map` のキータイプに一致する必要があります。

**返される値**

- `map` が `key` を含む場合は `1`、含まない場合は `0`。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContains(a, 'name') FROM tab;

```

結果：

```text
┌─mapContains(a, 'name')─┐
│                      1 │
│                      0 │
└────────────────────────┘
```

## mapContainsKeyLike {#mapcontainskeylike}

**構文**

```sql
mapContainsKeyLike(map, pattern)
```

**引数**
- `map` — マップ。 [Map](../data-types/map.md)。
- `pattern`  - 一致させる文字列パターン。

**返される値**

- `map` が指定されたパターンのようなキーを含む場合は `1`、含まない場合は `0`。

**例**

クエリ：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

結果：

```text
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```

## mapExtractKeyLike {#mapextractkeylike}

文字列キーを持つマップと LIKE パターンを与えると、この関数はパターンと一致するキーを持つ要素のマップを返します。

**構文**

```sql
mapExtractKeyLike(map, pattern)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。
- `pattern`  - 一致させる文字列パターン。

**返される値**

- 指定されたパターンに一致する要素を含むマップ。要素がパターンに一致しない場合は、空のマップが返されます。

**例**

クエリ：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

結果：

```text
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```

## mapValues {#mapvalues}

与えられたマップの値を返します。

この関数は [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) が有効になっている場合に最適化できます。
設定が有効になっている場合、この関数はマップ全体ではなく、その [values](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムだけを読み取ります。
クエリ `SELECT mapValues(m) FROM table` は `SELECT m.values FROM table` に変換されます。

**構文**

```sql
mapValues(map)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。

**返される値**

- `map` からすべての値を含む配列。 [Array](../data-types/array.md)。

**例**

クエリ：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapValues(a) FROM tab;
```

結果：

```text
┌─mapValues(a)─────┐
│ ['eleven','11']  │
│ ['twelve','6.0'] │
└──────────────────┘
```

## mapContainsValue {#mapcontainsvalue}

与えられた値が与えられたマップに含まれているかどうかを返します。

**構文**

```sql
mapContainsValue(map, value)
```

エイリアス: `mapContainsValue(map, value)`

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。
- `value` — 値。タイプは `map` の値タイプに一致する必要があります。

**返される値**

- `map` が `value` を含む場合は `1`、含まない場合は `0`。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContainsValue(a, '11') FROM tab;

```

結果：

```text
┌─mapContainsValue(a, '11')─┐
│                         1 │
│                         0 │
└───────────────────────────┘
```

## mapContainsValueLike {#mapcontainsvaluelike}

**構文**

```sql
mapContainsValueLike(map, pattern)
```

**引数**
- `map` — マップ。 [Map](../data-types/map.md)。
- `pattern`  - 一致させる文字列パターン。

**返される値**

- `map` が指定されたパターンのような値を含む場合は `1`、含まない場合は `0`。

**例**

クエリ：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

結果：

```text
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```

## mapExtractValueLike {#mapextractvaluelike}

文字列値を持つマップと LIKE パターンを与えると、この関数はパターンと一致する値を持つ要素のマップを返します。

**構文**

```sql
mapExtractValueLike(map, pattern)
```

**引数**

- `map` — マップ。 [Map](../data-types/map.md)。
- `pattern`  - 一致させる文字列パターン。

**返される値**

- 指定されたパターンに一致する要素を含むマップ。要素がパターンに一致しない場合は、空のマップが返されます。

**例**

クエリ：

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

結果：

```text
┌─mapExtractValueLike(a, 'a%')─┐
│ {'abc':'abc'}                │
│ {}                           │
└──────────────────────────────┘
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

- 元のマップから、各要素に対して `func(map1[i], ..., mapN[i])` を適用して得られるマップを返します。

**例**

クエリ：

```sql
SELECT mapApply((k, v) -> (k, v * 10), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

結果：

```text
┌─r─────────────────────┐
│ {'key1':0,'key2':0}   │
│ {'key1':10,'key2':20} │
│ {'key1':20,'key2':40} │
└───────────────────────┘
```

## mapFilter {#mapfilter}

マップの各要素に関数を適用してフィルタリングします。

**構文**

```sql
mapFilter(func, map)
```

**引数**

- `func`  - [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返される値**

- `func(map1[i], ..., mapN[i])` が 0 以外のものを返すマップの要素のみを含むマップを返します。

**例**

クエリ：

```sql
SELECT mapFilter((k, v) -> ((v % 2) = 0), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

結果：

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
- `map2` [Map](../data-types/map.md) 。

**返される値**

- map2 における対応するキーの値で更新された map1 を返します。

**例**

クエリ：

```sql
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10)) AS map;
```

結果：

```text
┌─map────────────────────────────┐
│ {'key3':0,'key1':10,'key2':10} │
└────────────────────────────────┘
```

## mapConcat {#mapconcat}

同じキーの同等性に基づいて複数のマップを連結します。
同じキーの要素が 2 つ以上の入力マップに存在する場合、すべての要素が結果マップに追加されますが、最初の要素のみが演算子 `[]` を介してアクセス可能です。

**構文**

```sql
mapConcat(maps)
```

**引数**

-   `maps` – 不特定多数の [Maps](../data-types/map.md)。

**返される値**

- 引数として渡されたマップを連結した結果のマップを返します。

**例**

クエリ：

```sql
SELECT mapConcat(map('key1', 1, 'key3', 3), map('key2', 2)) AS map;
```

結果：

```text
┌─map──────────────────────────┐
│ {'key1':1,'key3':3,'key2':2} │
└──────────────────────────────┘
```

クエリ：

```sql
SELECT mapConcat(map('key1', 1, 'key2', 2), map('key1', 3)) AS map, map['key1'];
```

結果：

```text
┌─map──────────────────────────┬─elem─┐
│ {'key1':1,'key2':2,'key1':3} │    1 │
└──────────────────────────────┴──────┘
```

## mapExists(\[func,\], map) {#mapexistsfunc-map}

`map` 内の少なくとも 1 つのキー値ペアが `func(key, value)` において 0 以外のものを返す場合、1 を返します。そうでない場合は 0 を返します。

:::note
`mapExists` は [Higher-order Function](/sql-reference/functions/overview#higher-order-functions) です。
最初の引数としてラムダ関数を渡すことができます。
:::

**例**

クエリ：

```sql
SELECT mapExists((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

結果：

```response
┌─res─┐
│   1 │
└─────┘
```

## mapAll(\[func,\] map) {#mapallfunc-map}

`func(key, value)` が `map` のすべてのキー値ペアに対して 0 以外のものを返す場合、1 を返します。そうでない場合は 0 を返します。

:::note
`mapAll` は [Higher-order Function](/sql-reference/functions/overview#higher-order-functions) です。
最初の引数としてラムダ関数を渡すことができます。
:::

**例**

クエリ：

```sql
SELECT mapAll((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

結果：

```response
┌─res─┐
│   0 │
└─────┘
```

## mapSort(\[func,\], map) {#mapsortfunc-map}

マップの要素を昇順にソートします。
`func` 関数が指定されている場合、ソート順はマップのキーと値に適用される `func` 関数の結果によって決まります。

**例**

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

詳細については、`arraySort` 関数の [リファレンス](/sql-reference/functions/array-functions#sort) を参照してください。

## mapPartialSort {#mappartialsort}

追加の `limit` 引数を使って、部分ソートを許す昇順でマップの要素をソートします。
`func` 関数が指定されている場合、ソート順はマップのキーと値に適用される `func` 関数の結果によって決まります。

**構文**

```sql
mapPartialSort([func,] limit, map)
```
**引数**

- `func` – マップのキーと値に適用するオプションの関数。 [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 範囲 [1..limit] の要素がソートされます。 [(U)Int](../data-types/int-uint.md)。
- `map` – ソート対象のマップ。 [Map](../data-types/map.md)。

**返される値**

- 部分ソートされたマップ。 [Map](../data-types/map.md)。

**例**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```

## mapReverseSort(\[func,\], map) {#mapreversesortfunc-map}

マップの要素を降順でソートします。
`func` 関数が指定されている場合、ソート順はマップのキーと値に適用される `func` 関数の結果によって決まります。

**例**

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

詳細については、関数 [arrayReverseSort](/sql-reference/functions/array-functions#arrayreversesort) を参照してください。

## mapPartialReverseSort {#mappartialreversesort}

追加の `limit` 引数を使って、部分ソートを許す降順でマップの要素をソートします。
`func` 関数が指定されている場合、ソート順はマップのキーと値に適用される `func` 関数の結果によって決まります。

**構文**

```sql
mapPartialReverseSort([func,] limit, map)
```
**引数**

- `func` – マップのキーと値に適用するオプションの関数。 [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 範囲 [1..limit] の要素がソートされます。 [(U)Int](../data-types/int-uint.md)。
- `map` – ソート対象のマップ。 [Map](../data-types/map.md)。

**返される値**

- 部分ソートされたマップ。 [Map](../data-types/map.md)。

**例**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
