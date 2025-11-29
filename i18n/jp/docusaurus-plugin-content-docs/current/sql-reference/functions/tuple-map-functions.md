---
description: 'タプルマップ関数のドキュメント'
sidebar_label: 'マップ'
slug: /sql-reference/functions/tuple-map-functions
title: 'マップ関数'
doc_type: 'reference'
---

## map {#map}

キーと値のペアから [Map(key, value)](../data-types/map.md) 型の値を生成します。

**構文**

```sql
map(key1, value1[, key2, value2, ...])
```

**引数**

* `key_n` — マップエントリのキー。[Map](../data-types/map.md) のキー型としてサポートされる任意の型。
* `value_n` — マップエントリの値。[Map](../data-types/map.md) の値型としてサポートされる任意の型。

**戻り値**

* `key:value` のペアを含むマップ。[Map(key, value)](../data-types/map.md)。

**例**

クエリ:

```sql
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3);
```

結果:

```text
┌─map('key1', number, 'key2', multiply(number, 2))─┐
│ {'key1':0,'key2':0}                              │
│ {'key1':1,'key2':2}                              │
│ {'key1':2,'key2':4}                              │
└──────────────────────────────────────────────────┘
```

## mapFromArrays {#mapfromarrays}

キーの配列またはマップと、値の配列またはマップから map を作成します。

この関数は、構文 `CAST([...], 'Map(key_type, value_type)')` の便利な代替手段です。
たとえば、次のように書く代わりに

* `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')` や
* `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

`mapFromArrays(['aa', 'bb'], [4, 5])` と記述できます。

**構文**

```sql
mapFromArrays(keys, values)
```

エイリアス: `MAP_FROM_ARRAYS(keys, values)`

**引数**

* `keys` —  マップを作成するためのキーの配列またはマップ。[Array](../data-types/array.md) または [Map](../data-types/map.md)。`keys` が配列の場合、その型として `Array(Nullable(T))` または `Array(LowCardinality(Nullable(T)))` を許容しますが、NULL 値を含んではいけません。
* `values`  - マップを作成するための値の配列またはマップ。[Array](../data-types/array.md) または [Map](../data-types/map.md)。

**返される値**

* キー配列および値の配列/マップから構成されるキーと値を持つマップ。

**例**

クエリ:

```sql
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

結果：

```response
┌─mapFromArrays(['a', 'b', 'c'], [1, 2, 3])─┐
│ {'a':1,'b':2,'c':3}                       │
└───────────────────────────────────────────┘
```

`mapFromArrays` は、[Map](../data-types/map.md) 型の引数も受け付けます。これらの引数は、実行時にタプルの配列にキャストされます。

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

キーと値のペアからなる文字列を [Map(String, String)](../data-types/map.md) に変換します。
解析はノイズ（例: ログファイル）を含んでいても許容されます。
入力文字列内のキーと値のペアは、キー、キーと値の区切り文字、それに続く値で構成されます。
キーと値のペア同士はペア区切り文字で区切られます。
キーと値は引用符で囲むことができます。

**構文**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

別名:

* `str_to_map`
* `mapFromString`

**引数**

* `data` - キーと値のペアを抽出する対象の文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
* `key_value_delimiter` - キーと値を区切る 1 文字の区切り文字。デフォルトは `:`。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
* `pair_delimiters` - ペア同士を区切る文字の集合。デフォルトは ` `、`,`、`;`。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
* `quoting_character` - クオート文字として使用される 1 文字。デフォルトは `"`. [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
* `unexpected_quoting_character_strategy` - `read_key` および `read_value` フェーズ中に想定外の位置で現れたクオート文字を処理する戦略。取りうる値: `invalid`、`accept`、`promote`。`invalid` はキー/値を破棄し、`WAITING_KEY` 状態に戻る。`accept` は通常の文字として扱う。`promote` は `READ_QUOTED_{KEY/VALUE}` 状態へ遷移し、次の文字から開始する。

**返される値**

* キーと値のペアからなるマップ。型: [Map(String, String)](../data-types/map.md)

**使用例**

クエリ

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') AS kv
```

結果：

```Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

クォート文字としてシングルクォート `'` を使用する場合:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

結果：

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy の例:

unexpected&#95;quoting&#95;character&#95;strategy=invalid

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'INVALID') AS kv;
```

```text
┌─kv────────────────┐
│ {'abc':'5'}  │
└───────────────────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'INVALID') AS kv;
```

```text
┌─kv──┐
│ {}  │
└─────┘
```

unexpected&#95;quoting&#95;character&#95;strategy=accept

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'ACCEPT') AS kv;
```

```text
┌─kv────────────────┐
│ {'name"abc':'5'}  │
└───────────────────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'ACCEPT') AS kv;
```

```text
┌─kv─────────────────┐
│ {'name"abc"':'5'}  │
└────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy=promote

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'PROMOTE') AS kv;
```

```text
┌─kv──┐
│ {}  │
└─────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'PROMOTE') AS kv;
```

```text
┌─kv───────────┐
│ {'abc':'5'}  │
└──────────────┘
```

エスケープシーケンス非対応環境でのエスケープシーケンス：

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

結果：

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

`toString` でシリアライズされた Map&lt;string, string&gt; のキーと値のペアを復元するには:

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) AS map_serialized,
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

`extractKeyValuePairs` と同様ですが、エスケープシーケンスをサポートします。

サポートされているエスケープシーケンス: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v`, `\0`。
標準ではないエスケープシーケンスは、次のいずれかの場合を除き（バックスラッシュを含めて）そのまま返されます:
`\\`, `'`, `"`, `backtick`, `/`, `=` または ASCII 制御文字 (c &lt;= 31)。

この関数は、事前エスケープおよび事後エスケープが適さないユースケースに有用です。例えば、次の
入力文字列を考えます: `a: "aaaa\"bbb"`。期待される出力は: `a: aaaa\"bbbb` です。

* 事前エスケープ: 事前エスケープすると、出力は `a: "aaaa"bbb"` となり、その後 `extractKeyValuePairs` は `a: aaaa` を出力します
* 事後エスケープ: `extractKeyValuePairs` は `a: aaaa\` を出力し、事後エスケープではそれがそのまま維持されます。

キー内の先頭にあるエスケープシーケンスはスキップされ、値に対しては不正と見なされます。

**例**

エスケープシーケンスサポートを有効にした場合のエスケープシーケンスの例:

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

すべてのキーを収集し、対応する値を合計します。

**構文**

```sql
mapAdd(arg1, arg2 [, ...])
```

**引数**

引数は 2 つの[配列](/sql-reference/data-types/array)からなる [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) で、最初の配列の要素がキーを表し、2 番目の配列がそれぞれのキーに対応する値を保持します。すべてのキー配列は同じ型でなければならず、すべての値配列は 1 つの型（[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges)、または [Float64](/sql-reference/data-types/float)）へ昇格可能な要素を含んでいる必要があります。共通の昇格後の型が、結果の配列の型として使用されます。

**返される値**

* 引数に応じて 1 つの [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) を返し、1 番目の配列にはソート済みのキーが含まれ、2 番目の配列には値が含まれます。

**例**

`Map` 型を用いたクエリ:

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

結果：

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

タプルを用いたクエリ：

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) AS res, toTypeName(res) AS type;
```

結果：

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```

## mapSubtract {#mapsubtract}

すべてのキーを収集し、対応する値同士を減算します。

**構文**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**引数**

引数は 2 つの[配列](/sql-reference/data-types/array)からなる [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) であり、1 つ目の配列の要素がキーを表し、2 つ目の配列に各キーに対応する値が格納されます。すべてのキー配列は同じ型でなければならず、すべての値配列の要素は、型昇格によって 1 つの型（[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges)、または [Float64](/sql-reference/data-types/float)）に統一できる必要があります。昇格後の共通型が、結果の配列の型として使用されます。

**戻り値**

* 引数に応じて、1 つの [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) を返します。このとき、1 つ目の配列にはソートされたキーが、2 つ目の配列には値が格納されます。

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

タプルマップを使用したクエリ：

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

結果:

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

整数キーを持つマップに対して、欠けているキーと値の組を補完します。
既存の最大キーより大きいキーまで拡張できるように、上限となる最大キーを指定できます。
より正確には、この関数は、キーが最小のキーから最大のキー（または指定されている場合は `max` 引数）まで 1 刻みの数列を成し、それに対応する値を持つマップを返します。
あるキーに対して値が指定されていない場合、そのキーの値としてデフォルト値が使用されます。
キーが重複している場合、そのキーには最初の値（出現順）が関連付けられます。

**構文**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

配列引数の場合、各行において `keys` と `values` の要素数は同じでなければなりません。

**引数**

引数は、[Map](../data-types/map.md) か 2 つの [Array](/sql-reference/data-types/array) であり、1 つ目と 2 つ目の配列には、それぞれキーおよび各キーに対応する値が格納されます。

マップされた配列:

* `map` — 整数キーを持つ Map。[Map](../data-types/map.md)。

または

* `keys` — キーの配列。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
* `values` — 値の配列。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
* `max` — キーの最大値。省略可能。[Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**戻り値**

* 引数に応じて、[Map](../data-types/map.md) か、ソートされた順序のキー配列とそれに対応する値配列からなる 2 つの [Array](/sql-reference/data-types/array) の [Tuple](/sql-reference/data-types/tuple)。

**例**

`Map` 型を用いたクエリ:

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

結果:

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```

## mapKeys {#mapkeys}

指定された map のキーを返します。

この関数は、設定 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。
この設定を有効にすると、関数は map 全体ではなく、[keys](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムのみを読み取ります。
クエリ `SELECT mapKeys(m) FROM table` は `SELECT m.keys FROM table` に変換されます。

**構文**

```sql
mapKeys(map)
```

**引数**

* `map` — マップ。[Map](../data-types/map.md)。

**戻り値**

* `map` 内のすべてのキーを含む配列。[Array](../data-types/array.md)。

**例**

クエリ：

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

## mapContains {#mapcontains}

指定された map に、指定されたキーが含まれているかどうかを返します。

**構文**

```sql
mapContains(map, key)
```

エイリアス: `mapContainsKey(map, key)`

**引数**

* `map` — マップ。[Map](../data-types/map.md)。
* `key` — キー。型は `map` のキー型と一致している必要があります。

**戻り値**

* `map` が `key` を含む場合は `1`、含まない場合は `0`。[UInt8](../data-types/int-uint.md)。

**例**

クエリ:

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

* `map` — Map。 [Map](../data-types/map.md)。
* `pattern`  - 照合に使用する文字列パターン。

**戻り値**

* `map` に `pattern` で指定したパターンにマッチする `key` が含まれている場合は `1`、含まれていない場合は `0`。

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

文字列キーを持つ `map` と LIKE パターンが与えられると、この関数はキーがそのパターンにマッチする要素のみを含む `map` を返します。

**構文**

```sql
mapExtractKeyLike(map, pattern)
```

**引数**

* `map` — マップ。[Map](../data-types/map.md)。
* `pattern`  - マッチさせる文字列パターン。

**返される値**

* 指定したパターンに一致するキーを持つ要素を含むマップ。パターンに一致する要素がない場合は、空のマップが返されます。

**例**

クエリ:

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

指定された map の値を返します。

この関数は、設定 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。
この設定を有効にすると、関数は map 全体ではなく、[values](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムのみを読み取ります。
クエリ `SELECT mapValues(m) FROM table` は `SELECT m.values FROM table` に書き換えられます。

**構文**

```sql
mapValues(map)
```

**引数**

* `map` — マップ。 [Map](../data-types/map.md)。

**戻り値**

* `map` に含まれるすべての値を含む配列。 [Array](../data-types/array.md)。

**例**

クエリ:

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

指定された map に指定されたキーが含まれているかどうかを返します。

**構文**

```sql
mapContainsValue(map, value)
```

Alias: `mapContainsValue(map, value)`

**引数**

* `map` — マップ。[Map](../data-types/map.md)。
* `value` — 値。型は `map` の値の型と一致している必要があります。

**戻り値**

* `map` に `value` が含まれていれば `1`、含まれていなければ `0`。[UInt8](../data-types/int-uint.md)。

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

* `map` — マップ。[Map](../data-types/map.md)。
* `pattern`  - 照合する文字列パターン。

**返される値**

* `map` に `pattern` で指定したパターンにマッチする `value` が含まれている場合は `1`、含まれていない場合は `0`。

**例**

クエリ:

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

文字列値を持つマップと `LIKE` パターンを指定すると、この関数は値がパターンに一致する要素のみを含むマップを返します。

**構文**

```sql
mapExtractValueLike(map, pattern)
```

**引数**

* `map` — マップ。[Map](../data-types/map.md)。
* `pattern`  - マッチさせる文字列パターン。

**戻り値**

* 値が指定したパターンにマッチする要素だけで構成されるマップ。パターンにマッチする要素がない場合は、空のマップが返されます。

**例**

クエリ:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

結果:

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

* `func` — [Lambda 関数](/sql-reference/functions/overview#higher-order-functions)。
* `map` — [Map 型](../data-types/map.md)。

**返される値**

* 各要素ごとに `func(map1[i], ..., mapN[i])` を適用して、元のマップから生成されたマップを返します。

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

map の各要素に関数を適用してフィルタ処理を行います。

**構文**

```sql
mapFilter(func, map)
```

**引数**

* `func`  - [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
* `map` — [Map](../data-types/map.md)。

**戻り値**

* `func(map1[i], ..., mapN[i])` が 0 以外の値を返す、`map` 内の要素のみを含む map を返します。

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

* `map1` [Map](../data-types/map.md)。
* `map2` [Map](../data-types/map.md)。

**戻り値**

* `map2` 内の対応するキーの値で更新された `map1` を返します。

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

キーが等しいことに基づいて複数の Map を連結します。
同じキーを持つ要素が 2 つ以上の入力 Map に存在する場合、すべての要素が結果の Map に追加されますが、演算子 `[]` でアクセスできるのは最初の要素だけです。

**構文**

```sql
mapConcat(maps)
```

**引数**

* `maps` – 任意の数の [Maps](../data-types/map.md)。

**返り値**

* 引数として渡されたマップを連結したマップを返します。

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

## mapExists([func,], map) {#mapexistsfunc-map}

`map` 内に、`func(key, value)` が 0 以外の値を返すキーと値のペアが 1 つ以上存在する場合は 1 を、それ以外の場合は 0 を返します。

:::note
`mapExists` は[高階関数](/sql-reference/functions/overview#higher-order-functions)です。
最初の引数としてラムダ関数を渡すことができます。
:::

**例**

クエリ:

```sql
SELECT mapExists((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

結果：

```response
┌─res─┐
│   1 │
└─────┘
```

## mapAll([func,] map) {#mapallfunc-map}

`map` 内のすべてのキー・値ペアについて、`func(key, value)` が 0 以外の値を返した場合は 1 を返します。そうでない場合は 0 を返します。

:::note
`mapAll` は[高階関数](/sql-reference/functions/overview#higher-order-functions)です。
第 1 引数としてラムダ関数を渡すことができます。
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

## mapSort([func,], map) {#mapsortfunc-map}

map の要素を昇順に並べ替えます。
`func` 関数が指定されている場合は、map のキーと値に `func` 関数を適用した結果に基づいて並び順が決まります。

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

詳細については、`arraySort` 関数の[リファレンス](/sql-reference/functions/array-functions#arraySort)を参照してください。

## mapPartialSort {#mappartialsort}

`limit` 引数を追加で指定することで、マップの要素を昇順に並べ替える際に、ソートする要素数を制限できます。
`func` 関数が指定されている場合は、マップのキーと値に対して `func` 関数を適用した結果に基づいてソート順が決まります。

**構文**

```sql
mapPartialSort([func,] limit, map)
```

**引数**

* `func` – マップのキーと値に適用する省略可能な関数。[Lambda function](/sql-reference/functions/overview#higher-order-functions)。
* `limit` – 範囲 [1..limit] の要素がソートされます。[(U)Int](../data-types/int-uint.md)。
* `map` – ソート対象のマップ。[Map](../data-types/map.md)。

**戻り値**

* 部分的にソートされたマップ。[Map](../data-types/map.md)。

**例**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```

## mapReverseSort([func,], map) {#mapreversesortfunc-map}

map の要素を降順でソートします。
`func` 関数が指定されている場合、map のキーと値に `func` 関数を適用した結果によって、ソート順が決定されます。

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

詳細については、関数 [arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort) を参照してください。

## mapPartialReverseSort {#mappartialreversesort}

`limit` 引数を指定すると、マップの要素を降順で部分的にソートします。
`func` 関数が指定されている場合、マップのキーおよび値に対して `func` を適用した結果に基づいてソート順が決定されます。

**構文**

```sql
mapPartialReverseSort([func,] limit, map)
```

**引数**

* `func` – マップのキーと値に適用するオプションの関数。[ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
* `limit` – 範囲 [1..limit] の要素がソートされます。[(U)Int](../data-types/int-uint.md)。
* `map` – ソートするマップ。[Map](../data-types/map.md)。

**戻り値**

* 部分的にソートされたマップ。[Map](../data-types/map.md)。

**例**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

{/* 
  以下のタグ内の内容は、ドキュメントフレームワークのビルド時に
  system.functions から自動生成されたドキュメントで置き換えられます。タグを変更または削除しないでください。
  詳細は https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
