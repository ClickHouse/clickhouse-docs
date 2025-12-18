---
description: 'タプルマップ関数のドキュメント'
sidebar_label: 'マップ'
slug: /sql-reference/functions/tuple-map-functions
title: 'マップ関数'
doc_type: 'reference'
---

## map {#map}

キーと値のペアから、[Map(key, value)](../data-types/map.md) 型の値を作成します。

**構文**

```sql
map(key1, value1[, key2, value2, ...])
```

**引数**

* `key_n` — マップエントリのキー。[Map](../data-types/map.md) のキー型としてサポートされる任意の型。
* `value_n` — マップエントリの値。[Map](../data-types/map.md) の値型としてサポートされる任意の型。

**返り値**

* `key:value` ペアを含むマップ。[Map(key, value)](../data-types/map.md)。

**例**

クエリ:

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

キーの配列またはマップと値の配列またはマップから map を作成します。

この関数は、構文 `CAST([...], 'Map(key_type, value_type)')` の便利な代替手段です。
たとえば、次のように記述する代わりに

* `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')` や
* `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

`mapFromArrays(['aa', 'bb'], [4, 5])` と記述できます。

**構文**

```sql
mapFromArrays(keys, values)
```

Alias: `MAP_FROM_ARRAYS(keys, values)`

**引数**

* `keys` —  マップを作成するためのキーの配列またはマップ。[Array](../data-types/array.md) または [Map](../data-types/map.md) 型です。`keys` が配列の場合、その型として `Array(Nullable(T))` または `Array(LowCardinality(Nullable(T)))` を、NULL 値を含まない限り使用できます。
* `values`  - マップを作成するための値の配列またはマップ。[Array](../data-types/array.md) または [Map](../data-types/map.md) 型です。

**戻り値**

* キー配列および値配列/マップから構築されたマップ。

**例**

クエリ:

```sql
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

結果:

```response
┌─mapFromArrays(['a', 'b', 'c'], [1, 2, 3])─┐
│ {'a':1,'b':2,'c':3}                       │
└───────────────────────────────────────────┘
```

`mapFromArrays` は、[Map](../data-types/map.md) 型の引数も受け付けます。これらは、実行時にタプルの配列にキャストされます。

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
パース処理は（ログファイルなどの）ノイズに対して寛容です。
入力文字列中のキーと値のペアは、キー、キーと値の区切り文字、それに続く値から構成されます。
キーと値のペア同士は、ペア区切り文字で区切られます。
キーと値は引用符で囲むことができます。

**構文**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

Alias:

* `str_to_map`
* `mapFromString`

**引数**

* `data` - キーと値のペアを抽出する対象の文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
* `key_value_delimiter` - キーと値を区切る 1 文字の区切り文字。デフォルトは `:`。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
* `pair_delimiters` - ペア同士を区切る文字の集合。デフォルトは ` `、`,`、`;`。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
* `quoting_character` - クオート文字として使われる 1 文字。デフォルトは `"`. [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
* `unexpected_quoting_character_strategy` - `read_key` と `read_value` フェーズで、予期しない位置に現れたクオート文字をどのように扱うかの戦略。指定可能な値: `invalid`, `accept`, `promote`。`invalid` はキー／値を破棄し、`WAITING_KEY` 状態に戻る。`accept` は通常の文字として扱う。`promote` は `READ_QUOTED_{KEY/VALUE}` 状態に遷移し、次の文字から読み取りを再開する。

**返り値**

* キーと値のペアの集合。型: [Map(String, String)](../data-types/map.md)

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

引用文字としてシングルクォート（`'`）を使用する場合:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

結果：

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy の設定例:

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

エスケープシーケンス（エスケープシーケンス非対応環境向け）:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

結果：

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

`toString` でシリアライズされた map の文字列キーと値のペアを復元するには、次のようにします。

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) AS map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

結果：

```response
行 1:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

`extractKeyValuePairs` と同様ですが、エスケープシーケンスに対応しています。

サポートされるエスケープシーケンス: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v`, `\0`。
標準的でないエスケープシーケンスは、次のいずれかの場合を除き、そのまま（バックスラッシュを含めて）返されます:
`\\`, `'`, `"`, `backtick`, `/`, `=` または ASCII 制御文字 (c &lt;= 31)。

この関数は、事前エスケープや事後エスケープでは対処できないユースケースに適しています。たとえば、次の
入力文字列を考えます: `a: "aaaa\"bbb"`。期待される出力は: `a: aaaa\"bbbb` です。

* 事前エスケープ: 事前エスケープすると出力は `a: "aaaa"bbb"` となり、その後 `extractKeyValuePairs` は `a: aaaa` を出力します
* 事後エスケープ: `extractKeyValuePairs` は `a: aaaa\` を出力し、事後エスケープではそれをそのまま保持します。

キー内の先頭のエスケープシーケンスはスキップされ、値に対しては無効とみなされます。

**例**

エスケープシーケンスのサポートを有効にした場合の動作例:

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

すべてのキーを集めて、それぞれに対応する値を合計します。

**構文**

```sql
mapAdd(arg1, arg2 [, ...])
```

**引数**

引数は、2 つの[配列](/sql-reference/data-types/array)から構成される[map](../data-types/map.md)または[tuple](/sql-reference/data-types/tuple)であり、最初の配列の要素がキーを表し、2 番目の配列に各キーに対応する値が含まれます。すべてのキー配列は同じ型でなければならず、すべての値配列は 1 つの型（[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges)、または [Float64](/sql-reference/data-types/float)）へと昇格可能な要素を含んでいる必要があります。共通の昇格後の型が、結果配列の型として使用されます。

**戻り値**

* 引数に応じて、最初の配列にソート済みのキーを含み、2 番目の配列に値を含む [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) を 1 つ返します。

**例**

`Map` 型を使ったクエリ:

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

すべてのキーを集約し、対応する値の差を取ります。

**構文**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**引数**

引数は 2 つの [配列](/sql-reference/data-types/array)から構成される [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) であり、1 つ目の配列の要素がキーを表し、2 つ目の配列が各キーに対応する値を含みます。すべてのキー配列は同じ型である必要があり、すべての値配列は 1 つの共通の型（[Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges)、または [Float64](/sql-reference/data-types/float)）へ昇格される要素を含んでいる必要があります。この共通の昇格後の型が、結果配列の型として使用されます。

**戻り値**

* 引数に応じて 1 つの [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) を返し、1 つ目の配列にはソートされたキーが、2 つ目の配列には値が含まれます。

**例**

`Map` 型を使用したクエリ:

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

結果：

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

タプルマップを使用したクエリ：

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

結果：

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

整数キーを持つマップで、欠損しているキーと値のペアを補完します。
最大値を超えてキーを拡張できるように、最大キーを指定することができます。
より正確には、この関数は、キーが最小キーから最大キー（指定されていれば引数 `max`）までステップ幅 1 の数列を成し、それぞれに対応する値を持つマップを返します。
あるキーに対して値が指定されていない場合、そのキーの値としてデフォルト値が使用されます。
キーが重複している場合、そのキーには（出現順に）最初の値のみが対応付けられます。

**構文**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

配列引数の場合、各行ごとに `keys` と `values` の要素数は同じでなければなりません。

**Arguments**

引数は [Maps](../data-types/map.md) か、または 2 つの [Arrays](/sql-reference/data-types/array) で、1 つ目と 2 つ目の配列にはそれぞれキーと、その各キーに対応する値が含まれます。

マップされた配列:

* `map` — 整数キーを持つ Map。 [Map](../data-types/map.md)。

または

* `keys` — キーの配列。 [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
* `values` — 値の配列。 [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
* `max` — キーの最大値。省略可能。 [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**Returned value**

* 引数に応じて、[Map](../data-types/map.md) または 2 つの [Arrays](/sql-reference/data-types/array) からなる [Tuple](/sql-reference/data-types/tuple) が返されます。前者はソート済みのキー、後者はそれぞれのキーに対応する値です。

**Example**

`Map` 型を使ったクエリ:

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

結果：

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

マッピングされた配列に対するクエリ：

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

指定された map のキーを返します。

この関数は、setting [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。
この setting を有効にすると、この関数は map 全体ではなく [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムだけを読み取ります。
クエリ `SELECT mapKeys(m) FROM table` は `SELECT m.keys FROM table` に変換されます。

**構文**

```sql
mapKeys(map)
```

**引数**

* `map` — マップ。[Map](../data-types/map.md)。

**返される値**

* `map` に含まれるすべてのキーを含む配列。[Array](../data-types/array.md)。

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

指定したマップに指定したキーが含まれているかどうかを返します。

**構文**

```sql
mapContains(map, key)
```

エイリアス: `mapContainsKey(map, key)`

**引数**

* `map` — マップ。[Map](../data-types/map.md)。
* `key` — キー。型は `map` のキー型と一致している必要があります。

**返り値**

* `map` に `key` が含まれていれば `1`、含まれていなければ `0`。[UInt8](../data-types/int-uint.md)。

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

* `map` — Map 型。[Map](../data-types/map.md)。
* `pattern`  - マッチさせる文字列パターン。

**戻り値**

* `map` が指定されたパターンにマッチする `key` を含む場合は `1`、含まない場合は `0`。

**例**

クエリ:

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

文字列キーを持つ `Map` と LIKE パターンが与えられると、この関数はキーがそのパターンに一致する要素のみを含む `Map` を返します。

**構文**

```sql
mapExtractKeyLike(map, pattern)
```

**引数**

* `map` — Map 型。[Map](../data-types/map.md)。
* `pattern`  - マッチさせる文字列パターン。

**戻り値**

* 指定したパターンに一致するキーを持つ要素のみを含む Map。一致する要素がない場合は、空の Map が返されます。

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

指定された map の値を返します。

この関数は、設定 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。
この設定を有効にすると、関数は map 全体ではなく、[values](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムのみを読み取ります。
クエリ `SELECT mapValues(m) FROM table` は `SELECT m.values FROM table` に変換されます。

**構文**

```sql
mapValues(map)
```

**引数**

* `map` — Map 型。[Map](../data-types/map.md)。

**戻り値**

* `map` に含まれるすべての値を格納した配列。[Array](../data-types/array.md)。

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

指定した map に指定したキーが含まれているかどうかを返します。

**構文**

```sql
mapContainsValue(map, value)
```

別名: `mapContainsValue(map, value)`

**引数**

* `map` — マップ。[Map](../data-types/map.md)。
* `value` — 値。型は `map` の値の型と一致している必要があります。

**戻り値**

* `map` に `value` が含まれていれば `1`、含まれていなければ `0`。[UInt8](../data-types/int-uint.md)。

**例**

クエリ:

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

* `map` — Map。 [Map](../data-types/map.md)。
* `pattern`  - 照合する文字列パターン。

**返り値**

* `map` に、指定したパターンにマッチする `value` が含まれていれば `1`、含まれていなければ `0`。

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

文字列値を持つ Map と LIKE パターンを指定すると、この関数は値がパターンにマッチする要素のみを含む Map を返します。

**構文**

```sql
mapExtractValueLike(map, pattern)
```

**引数**

* `map` — Map。[Map](../data-types/map.md)。
* `pattern`  - 照合する文字列パターン。

**返り値**

* 値が指定したパターンに一致する要素を含む map。パターンに一致する要素がない場合は、空の map が返されます。

**例**

クエリ:

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

map の各要素に関数を適用します。

**構文**

```sql
mapApply(func, map)
```

**引数**

* `func` — [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
* `map` — [Map](../data-types/map.md)。

**返り値**

* 各要素に対して `func(map1[i], ..., mapN[i])` を適用することで、元のマップから得られるマップを返します。

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

* `func`  - [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
* `map` — [Map](../data-types/map.md)。

**戻り値**

* `func(map1[i], ..., mapN[i])` が 0 以外の値を返す要素のみを含む `map` を返します。

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

* `map1` [Map](../data-types/map.md)。
* `map2` [Map](../data-types/map.md)。

**戻り値**

* `map2` の対応するキーの値で値を更新した `map1` を返します。

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

キーの一致に基づいて複数の map を連結します。
同じキーを持つ要素が複数の入力 map に存在する場合、すべての要素が結果の map に追加されますが、`[]` 演算子でアクセスできるのは最初の要素のみです。

**構文**

```sql
mapConcat(maps)
```

**引数**

* `maps` – 任意数の[Map](../data-types/map.md)。

**返される値**

* 引数として渡された Map を連結した結果の Map を返します。

**例**

クエリ:

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

## mapExists([func,], map) {#mapexistsfunc-map}

`map` 内の少なくとも1つのキーと値のペアについて、`func(key, value)` が0以外を返す場合は1を返します。そうでない場合は0を返します。

:::note
`mapExists` は[高階関数](/sql-reference/functions/overview#higher-order-functions)です。
第1引数としてラムダ関数を渡すことができます。
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

`map` 内のすべてのキーと値のペアに対して `func(key, value)` が 0 以外の値を返す場合は 1 を返し、そうでない場合は 0 を返します。

:::note
`mapAll` は [高階関数](/sql-reference/functions/overview#higher-order-functions) です。
第 1 引数としてラムダ関数を渡すことができます。
:::

**例**

クエリ:

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
`func` 関数が指定されている場合、map のキーと値に `func` 関数を適用した結果によって並べ替え順が決定されます。

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

map の要素を昇順にソートします。`limit` 引数によって部分ソートを指定できます。
`func` 関数が指定された場合、map のキーおよび値に `func` 関数を適用した結果に基づいてソート順が決定されます。

**構文**

```sql
mapPartialSort([func,] limit, map)
```

**引数**

* `func` – map のキーと値に適用する任意の関数。[Lambda function](/sql-reference/functions/overview#higher-order-functions)。
* `limit` – 範囲 [1..limit] の要素がソートされます。[(U)Int](../data-types/int-uint.md)。
* `map` – ソートする map。[Map](../data-types/map.md)。

**戻り値**

* 部分的にソートされた map。[Map](../data-types/map.md)。

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

マップの要素を降順にソートします。
`func` 関数が指定されている場合、マップのキーおよび値に `func` 関数を適用した結果に基づいてソートされます。

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

詳細は、関数 [arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort) を参照してください。

## mapPartialReverseSort {#mappartialreversesort}

追加の `limit` 引数により、マップの要素を降順に部分ソートします。
`func` 関数が指定されている場合は、マップのキーおよび値に `func` 関数を適用した結果に基づいてソート順が決定されます。

**構文**

```sql
mapPartialReverseSort([func,] limit, map)
```

**引数**

* `func` – map のキーと値に適用する任意の関数。[Lambda 関数](/sql-reference/functions/overview#higher-order-functions)。
* `limit` – 範囲 [1..limit] 内の要素をソートします。[(U)Int](../data-types/int-uint.md)。
* `map` – ソート対象の map。[Map](../data-types/map.md)。

**戻り値**

* 部分的にソートされた map。[Map](../data-types/map.md)。

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
  以下のタグの内側の内容は、ドキュメントフレームワークのビルド時に
  system.functions から自動生成されたドキュメントで置き換えられます。タグを変更または削除しないでください。
  詳細は https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md を参照してください。
  */ }

{/*AUTOGENERATED_START*/ }

## extractKeyValuePairs {#extractKeyValuePairs}

導入バージョン: v

任意の文字列からキーと値のペアを抽出します。文字列は 100% キー・バリュー形式で構造化されている必要はありません。

ノイズ（例: ログファイル）を含んでいても問題ありません。解釈対象となるキー・バリュー形式は、関数の引数で指定する必要があります。

キーと値のペアは、キーに続いて `key_value_delimiter` と値が並ぶ形で構成されます。引用符付きのキーおよび値にも対応しています。キーと値のペア同士は、ペア区切り文字で区切られている必要があります。

**構文**

```sql
            extractKeyValuePairs(data, [key_value_delimiter], [pair_delimiter], [quoting_character])
```

**引数**

* `data` - キーと値のペアを抽出する対象の文字列。[String](../../sql-reference/data-types/string.md) または [FixedString](../../sql-reference/data-types/fixedstring.md)。
  * `key_value_delimiter` - キーと値の間の区切り文字として使用する文字。デフォルトは `:`。型は [String](../../sql-reference/data-types/string.md) または [FixedString](../../sql-reference/data-types/fixedstring.md)。
  * `pair_delimiters` - ペア間の区切り文字として使用する文字の集合。デフォルトは `\space`、`,`、`;`。型は [String](../../sql-reference/data-types/string.md) または [FixedString](../../sql-reference/data-types/fixedstring.md)。
  * `quoting_character` - クオート文字として使用する文字。デフォルトは `"`. 型は [String](../../sql-reference/data-types/string.md) または [FixedString](../../sql-reference/data-types/fixedstring.md)。
  * `unexpected_quoting_character_strategy` - `read_key` および `read_value` フェーズ中に想定外の位置に現れたクオート文字を処理するための戦略。指定可能な値: `invalid`、`accept`、`promote`。`invalid` はキー/値を破棄して `WAITING_KEY` 状態に戻ります。`accept` は通常の文字として扱います。`promote` は `READ_QUOTED_{KEY/VALUE}` 状態へ遷移し、次の文字から処理を開始します。デフォルト値は `INVALID` です。

**戻り値**

* 抽出されたキーと値のペアを Map(String, String) 型のマップとして返します。

**例**

クエリ:

**単純な例**

```sql
            arthur :) select extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv

            SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv

            Query id: f9e0ca6f-3178-4ee2-aa2c-a5517abb9cee

            ┌─kv──────────────────────────────────────────────────────────────────────┐
            │ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
            └─────────────────────────────────────────────────────────────────────────┘
```

**引用文字としての単一引用符**

```sql
            arthur :) select extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv

            SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv

            クエリ ID: 0e22bf6b-9844-414a-99dc-32bf647abd5e

            ┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
            │ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
            └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy の例:

unexpected&#95;quoting&#95;character&#95;strategy=invalid

```sql
            SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'INVALID') as kv;
```

```text
            ┌─kv────────────────┐
            │ {'abc':'5'}  │
            └───────────────────┘
```

```sql
            SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'INVALID') as kv;
```

```text
            ┌─kv──┐
            │ {}  │
            └─────┘
```

unexpected&#95;quoting&#95;character&#95;strategy=accept

```sql
            SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'ACCEPT') as kv;
```

```text
            ┌─kv────────────────┐
            │ {'name"abc':'5'}  │
            └───────────────────┘
```

```sql
            SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'ACCEPT') as kv;
```

```text
            ┌─kv─────────────────┐
            │ {'name"abc"':'5'}  │
            └────────────────────┘
```

unexpected&#95;quoting&#95;character&#95;strategy=promote

```sql
            SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'PROMOTE') as kv;
```

```text
            ┌─kv──┐
            │ {}  │
            └─────┘
```

```sql
            SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'PROMOTE') as kv;
```

```text
            ┌─kv───────────┐
            │ {'abc':'5'}  │
            └──────────────┘
```

**エスケープシーケンス非対応環境でのエスケープ**

```sql
            arthur :) select extractKeyValuePairs('age:a\\x0A\\n\\0') as kv

            SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv

            Query id: e9fd26ee-b41f-4a11-b17f-25af6fd5d356

            ┌─kv────────────────────┐
            │ {'age':'a\\x0A\\n\\0'} │
            └───────────────────────┘
```

**構文**

```sql
```

**別名**: `str_to_map`, `mapFromString`

**引数**

* なし。

**戻り値**

**例**

## extractKeyValuePairsWithEscaping {#extractKeyValuePairsWithEscaping}

導入バージョン: v

`extractKeyValuePairs` と同じですが、エスケープシーケンスに対応しています。

サポートされるエスケープシーケンス: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v`, `\0`。
標準外のエスケープシーケンスは、次のいずれかに該当しない限り、そのまま（バックスラッシュを含めて）返されます:
`\\`, `'`, `"`, `backtick`, `/`, `=` または ASCII 制御文字 (`c <= 31`)。

この関数は、事前エスケープおよび事後エスケープが適さないユースケースに適しています。例えば、次の入力文字列を考えます:
`a: "aaaa\"bbb"`。期待される出力は `a: aaaa\"bbbb` です。

* 事前エスケープ: 事前エスケープすると、出力は `a: "aaaa"bbb"` となり、その後 `extractKeyValuePairs` は `a: aaaa` を出力します。
  * 事後エスケープ: `extractKeyValuePairs` は `a: aaaa\` を出力し、事後エスケープを行ってもそのまま保持されます。

先頭のエスケープシーケンスはキーではスキップされ、値に対しては不正とみなされます。

**エスケープシーケンス対応が有効な場合のエスケープシーケンス**

```sql
            arthur :) select extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') as kv

            SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv

            Query id: 44c114f0-5658-4c75-ab87-4574de3a1645

            ┌─kv───────────────┐
            │ {'age':'a\n\n\0'} │
            └──────────────────┘
```

**構文**

```sql
```

**引数**

* なし。

**戻り値**

**例**

## map {#map}

導入バージョン: v21.1

キーと値のペアから、`Map(key, value)` 型の値を作成します。

**構文**

```sql
map(key1, value1[, key2, value2, ...])
```

**引数**

* `key_n` — マップエントリのキー。[`Any`](/sql-reference/data-types)
* `value_n` — マップエントリの値。[`Any`](/sql-reference/data-types)

**返り値**

キーと値のペアを含むマップを返します。[`Map(Any, Any)`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3)
```

```response title=Response
{'key1':0,'key2':0}
{'key1':1,'key2':2}
{'key1':2,'key2':4}
```

## mapAdd {#mapAdd}

導入バージョン: v20.7

すべてのキーを集約し、それぞれのキーに対応する値を合計します。

**構文**

```sql
mapAdd(arg1[, arg2, ...])
```

**引数**

* `arg1[, arg2, ...]` — 2 つの配列からなる Map またはタプルであり、1 つ目の配列の要素がキー、2 つ目の配列の要素が各キーに対応する値になります。[`Map(K, V)`](/sql-reference/data-types/map) または [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**戻り値**

Map またはタプルを返します。1 つ目の配列にはソート済みのキーが含まれ、2 つ目の配列には対応する値が含まれます。[`Map(K, V)`](/sql-reference/data-types/map) または [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**例**

**Map 型での使用例**

```sql title=Query
SELECT mapAdd(map(1, 1), map(1, 1))
```

```response title=Response
{1:2}
```

**タプルを使用する場合**

```sql title=Query
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1]))
```

```response title=Response
([1, 2], [2, 2])
```

## mapAll {#mapAll}

導入バージョン: v23.4

マップ内のすべてのキーと値のペアに対して、ある条件が成り立つかどうかを判定します。
`mapAll` は高階関数です。
第1引数としてラムダ関数を渡すことができます。

**構文**

```sql
mapAll([func,] map)
```

**引数**

* `func` — ラムダ関数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — 検査対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)

**返り値**

すべてのキーと値のペアが条件を満たす場合は `1`、それ以外の場合は `0` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT mapAll((k, v) -> v = 1, map('k1', 1, 'k2', 2))
```

```response title=Response
0
```

## mapApply {#mapApply}

導入バージョン: v22.3

関数を map の各要素に適用します。

**構文**

```sql
mapApply(func, map)
```

**引数**

* `func` — ラムダ関数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — 関数を適用する対象の Map。[`Map(K, V)`](/sql-reference/data-types/map)

**戻り値**

元の Map の各要素に `func` を適用して得られる新しい Map を返します。[`Map(K, V)`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
SELECT mapApply((k, v) -> (k, v * 2), map('k1', 1, 'k2', 2))
```

```response title=Response
{'k1':2,'k2':4}
```

## mapConcat {#mapConcat}

導入バージョン: v23.4

複数の `map` を、そのキーの等値性に基づいて連結します。
同じキーを持つ要素が複数の入力 `map` に存在する場合、すべての要素が結果の `map` に追加されますが、演算子 `[]` で参照できるのは最初の要素のみです。

**構文**

```sql
mapConcat(maps)
```

**引数**

* `maps` — 任意個の Map。[`Map`](/sql-reference/data-types/map)

**返り値**

引数として渡された Map を連結した Map を返します。[`Map`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
SELECT mapConcat(map('k1', 'v1'), map('k2', 'v2'))
```

```response title=Response
{'k1':'v1','k2':'v2'}
```

## mapContainsKey {#mapContainsKey}

導入バージョン: v21.2

マップにキーが含まれているかどうかを判定します。

**構文**

```sql
mapContains(map, key)
```

**エイリアス**: `mapContains`

**引数**

* `map` — 検索対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)
* `key` — 検索するキー。型はマップのキー型と一致している必要があります。[`Any`](/sql-reference/data-types)

**戻り値**

マップにキーが含まれていれば 1、含まれていなければ 0 を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT mapContainsKey(map('k1', 'v1', 'k2', 'v2'), 'k1')
```

```response title=Response
1
```

## mapContainsKeyLike {#mapContainsKeyLike}

導入バージョン: v23.4

マップに、`LIKE` で指定したパターンに一致するキーが含まれているかを判定します。

**構文**

```sql
mapContainsKeyLike(map, pattern)
```

**引数**

* `map` — 検索対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — キーと照合するパターン。[`const String`](/sql-reference/data-types/string)

**戻り値**

`map` に `pattern` に一致するキーが含まれていれば `1`、そうでなければ `0` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```

## mapContainsValue {#mapContainsValue}

導入バージョン: v25.6

マップに指定した値が含まれているかどうかを判定します。

**構文**

```sql
mapContainsValue(map, value)
```

**引数**

* `map` — 検索対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)
* `value` — 検索する値。型は `map` の値の型と一致している必要があります。[`Any`](/sql-reference/data-types)

**戻り値**

`map` に値が含まれていれば `1`、含まれていなければ `0` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT mapContainsValue(map('k1', 'v1', 'k2', 'v2'), 'v1')
```

```response title=Response
1
```

## mapContainsValueLike {#mapContainsValueLike}

導入バージョン: v25.5

マップに、指定したパターンに対して `LIKE` マッチする値が含まれているかをチェックします。

**構文**

```sql
mapContainsValueLike(map, pattern)
```

**引数**

* `map` — 検索対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — 値と照合するパターン。[`const String`](/sql-reference/data-types/string)

**戻り値**

`map` に `pattern` と一致する値が含まれている場合は `1`、それ以外は `0` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```

## mapExists {#mapExists}

導入バージョン: v23.4

マップ内の少なくとも 1 つのキーと値のペアについて、条件が成り立つかどうかをテストします。
`mapExists` は高階関数です。
第 1 引数としてラムダ関数を渡すことができます。

**構文**

```sql
mapExists([func,] map)
```

**引数**

* `func` — 省略可能。ラムダ関数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — チェック対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)

**返される値**

少なくとも 1 つのキーと値の組が条件を満たす場合は `1` を返し、それ以外の場合は `0` を返します。[`UInt8`](/sql-reference/data-types/int-uint)

**例**

**使用例**

```sql title=Query
SELECT mapExists((k, v) -> v = 1, map('k1', 1, 'k2', 2))
```

```response title=Response
1
```

## mapExtractKeyLike {#mapExtractKeyLike}

導入: v23.4

文字列キーを持つ map と `LIKE` パターンを引数に取り、この関数はキーがそのパターンにマッチする要素のみを含む map を返します。

**構文**

```sql
mapExtractKeyLike(map, pattern)
```

**引数**

* `map` — 抽出元となるマップ。[`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — キーと照合するためのパターン。[`const String`](/sql-reference/data-types/string)

**戻り値**

キーが指定したパターンにマッチする要素のみを含むマップを返します。パターンに一致する要素がない場合は、空のマップを返します。[`Map(K, V)`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```

## mapExtractValueLike {#mapExtractValueLike}

導入バージョン: v25.5

文字列値を持つマップと `LIKE` パターンを指定すると、この関数は値がそのパターンに一致する要素のみを含むマップを返します。

**構文**

```sql
mapExtractValueLike(map, pattern)
```

**引数**

* `map` — 抽出対象とするマップ。[`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — 値と照合するパターン。[`const String`](/sql-reference/data-types/string)

**戻り値**

指定したパターンにマッチする値を持つ要素だけを含むマップを返します。パターンにマッチする要素がない場合は、空のマップが返されます。[`Map(K, V)`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapExtractValueLike(a, 'a%')─┐
│ {'abc':'abc'}                │
│ {}                           │
└──────────────────────────────┘
```

## mapFilter {#mapFilter}

導入バージョン: v22.3

マップの各要素に関数を適用し、その結果に基づいてマップをフィルタリングします。

**構文**

```sql
mapFilter(func, map)
```

**引数**

* `func` — ラムダ関数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — フィルタ対象の Map。[`Map(K, V)`](/sql-reference/data-types/map)

**戻り値**

`func` が `0` 以外の値を返す要素だけを含む Map を返します。[`Map(K, V)`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
SELECT mapFilter((k, v) -> v > 1, map('k1', 1, 'k2', 2))
```

```response title=Response
{'k2':2}
```

## mapFromArrays {#mapFromArrays}

v23.3 で導入。

キーの配列（またはマップ）と値の配列（またはマップ）からマップを作成します。
この関数は、構文 `CAST([...], 'Map(key_type, value_type)')` の便利な代替手段です。

**構文**

```sql
mapFromArrays(keys, values)
```

**別名**: `MAP_FROM_ARRAYS`

**引数**

* `keys` — マップを作成するためのキーの配列またはマップ。[`Array`](/sql-reference/data-types/array) または [`Map`](/sql-reference/data-types/map)
* `values` — マップを作成するための値の配列またはマップ。[`Array`](/sql-reference/data-types/array) または [`Map`](/sql-reference/data-types/map)

**戻り値**

キー配列および値の配列/マップから構成されるキーと値を持つマップを返します。[`Map`](/sql-reference/data-types/map)

**例**

**基本的な使い方**

```sql title=Query
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

```response title=Response
{'a':1,'b':2,'c':3}
```

**map 型を入力とする場合**

```sql title=Query
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

```response title=Response
{1:('a', 1), 2:('b', 2), 3:('c', 3)}
```

## mapKeys {#mapKeys}

導入バージョン: v21.2

指定されたマップのキーを返します。
この関数は、設定 [`optimize_functions_to_subcolumns`](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。
この設定を有効にすると、関数はマップ全体ではなく `keys` サブカラムだけを読み取ります。
クエリ `SELECT mapKeys(m) FROM table` は `SELECT m.keys FROM table` に変換されます。

**構文**

```sql
mapKeys(map)
```

**引数**

* `map` — キーを抽出する対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)

**戻り値**

マップ内のすべてのキーを含む配列を返します。[`Array(T)`](/sql-reference/data-types/array)

**例**

**使用例**

```sql title=Query
SELECT mapKeys(map('k1', 'v1', 'k2', 'v2'))
```

```response title=Response
['k1','k2']
```

## mapPartialReverseSort {#mapPartialReverseSort}

導入バージョン: v23.4

map の要素を降順にソートし、追加の limit 引数によって先頭の一部だけをソートできます。
func 関数が指定されている場合、map のキーと値に func 関数を適用した結果に基づいてソート順が決まります。

**構文**

```sql
mapPartialReverseSort([func,] limit, map)
```

**引数**

* `func` — 省略可能。ラムダ関数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `limit` — 範囲 `[1..limit]` 内の要素がソートされます。[`(U)Int*`](/sql-reference/data-types/int-uint)
* `map` — ソート対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)

**返される値**

降順で部分的にソートされたマップを返します。[`Map(K, V)`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k1':3,'k3':2,'k2':1}
```

## mapPartialSort {#mapPartialSort}

導入バージョン: v23.4

`map` の要素を昇順にソートします。追加の `limit` 引数を指定することで、一部のみを対象とした「部分ソート」が可能です。
`func` 関数が指定されている場合は、`map` のキーおよび値に `func` 関数を適用した結果に基づいてソート順が決定されます。

**構文**

```sql
mapPartialSort([func,] limit, map)
```

**引数**

* `func` — 省略可能。Lambda 関数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `limit` — 範囲 `[1..limit]` 内の要素がソートされます。[`(U)Int*`](/sql-reference/data-types/int-uint)
* `map` — ソート対象の Map。[`Map(K, V)`](/sql-reference/data-types/map)

**戻り値**

部分的にソートされた Map を返します。[`Map(K, V)`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k2':1,'k3':2,'k1':3}
```

## mapPopulateSeries {#mapPopulateSeries}

導入バージョン: v20.10

整数キーを持つマップにおいて、欠けているキーと値のペアを補完します。
既存の最大値より大きいキーも拡張できるように、最大キーを指定できます。
より正確には、この関数は、キーが最小キーから最大キー（指定されている場合は `max` 引数）までステップ幅 1 の数列を形成し、それに対応する値を持つマップを返します。
あるキーに値が指定されていない場合、そのキーの値としてデフォルト値が使用されます。
キーが重複している場合、先に出現した値のみがそのキーに関連付けられます。

**構文**

```sql
mapPopulateSeries(map[, max]) | mapPopulateSeries(keys, values[, max])
```

**引数**

* `map` — 整数キーを持つ Map 型。[`Map((U)Int*, V)`](/sql-reference/data-types/map)
* `keys` — キーの配列。[`Array(T)`](/sql-reference/data-types/array)
* `values` — 値の配列。[`Array(T)`](/sql-reference/data-types/array)
* `max` — オプション。キーの最大値を指定します。[`Int8`](/sql-reference/data-types/int-uint) または [`Int16`](/sql-reference/data-types/int-uint) または [`Int32`](/sql-reference/data-types/int-uint) または [`Int64`](/sql-reference/data-types/int-uint) または [`Int128`](/sql-reference/data-types/int-uint) または [`Int256`](/sql-reference/data-types/int-uint)

**返される値**

ソート済みのキーを持つ Map、または 1 つ目にソート済みのキー、2 つ目に対応する値を持つ 2 つの配列からなるタプルを返します。[`Map(K, V)`](/sql-reference/data-types/map) または [`Tuple(Array(UInt*), Array(Any))`](/sql-reference/data-types/tuple)

**例**

**Map 型を使用する場合**

```sql title=Query
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6)
```

```response title=Response
{1:10, 2:0, 3:0, 4:0, 5:20, 6:0}
```

**マップされた配列を使う場合**

```sql title=Query
SELECT mapPopulateSeries([1, 2, 4], [11, 22, 44], 5)
```

```response title=Response
([1, 2, 3, 4, 5], [11, 22, 0, 44, 0])
```

## mapReverseSort {#mapReverseSort}

導入バージョン: v23.4

map の要素を降順に並べ替えます。
`func` 関数が指定されている場合、map のキーおよび値に `func` 関数を適用した結果によってソート順が決まります。

**構文**

```sql
mapReverseSort([func,] map)
```

**引数**

* `func` — オプションのラムダ関数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — ソート対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)

**戻り値**

降順にソートされたマップを返します。[`Map(K, V)`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
SELECT mapReverseSort((k, v) -> v, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k1':3,'k3':2,'k2':1}
```

## mapSort {#mapSort}

Introduced in: v23.4

マップの要素を昇順で並べ替えます。
`func` 関数が指定されている場合、マップのキーと値に `func` 関数を適用した結果によってソート順が決まります。

**構文**

```sql
mapSort([func,] map)
```

**引数**

* `func` — 任意。ラムダ関数。[`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — ソート対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)

**戻り値**

昇順にソートされたマップを返します。[`Map(K, V)`](/sql-reference/data-types/map)

**例**

**使用例**

```sql title=Query
SELECT mapSort((k, v) -> v, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k2':1,'k3':2,'k1':3}
```

## mapSubtract {#mapSubtract}

導入バージョン: v20.7

すべてのキーを取得し、対応する値同士の差を計算します。

**構文**

```sql
mapSubtract(arg1[, arg2, ...])
```

**引数**

* `arg1[, arg2, ...]` — 2 つの配列からなる Map またはタプル。1 つ目の配列の要素がキーを表し、2 つ目の配列には各キーに対応する値が含まれます。[`Map(K, V)`](/sql-reference/data-types/map) または [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**戻り値**

戻り値は 1 つの Map またはタプルで、1 つ目の配列にはソート済みのキーが含まれ、2 つ目の配列には値が含まれます。[`Map(K, V)`](/sql-reference/data-types/map) または [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**例**

**Map 型の場合**

```sql title=Query
SELECT mapSubtract(map(1, 1), map(1, 1))
```

```response title=Response
{1:0}
```

**タプルマップを使用する場合**

```sql title=Query
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1]))
```

```response title=Response
([1, 2], [-1, 0])
```

## mapUpdate {#mapUpdate}

導入バージョン: v22.3

2つのマップを受け取り、2つ目のマップの対応するキーの値で値を更新した1つ目のマップを返します。

**構文**

```sql
mapUpdate(map1, map2)
```

**引数**

* `map1` — 更新対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)
* `map2` — 更新に使用するマップ。[`Map(K, V)`](/sql-reference/data-types/map)

**返される値**

`map2` に含まれる同じキーの値で更新された `map1` を返します。[`Map(K, V)`](/sql-reference/data-types/map)

**使用例**

**基本的な使い方**

```sql title=Query
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10))
```

```response title=Response
{'key3':0,'key1':10,'key2':10}
```

## mapValues {#mapValues}

導入バージョン: v21.2

指定された map の値を返します。
この関数は、[`optimize_functions_to_subcolumns`](/operations/settings/settings#optimize_functions_to_subcolumns) の設定を有効にすることで最適化できます。
設定を有効にすると、この関数は map 全体ではなく `values` サブカラムのみを読み取ります。
クエリ `SELECT mapValues(m) FROM table` は `SELECT m.values FROM table` に変換されます。

**構文**

```sql
mapValues(map)
```

**引数**

* `map` — 値を抽出する対象のマップ。[`Map(K, V)`](/sql-reference/data-types/map)

**戻り値**

マップ内のすべての値を含む配列を返します。[`Array(T)`](/sql-reference/data-types/array)

**例**

**使用例**

```sql title=Query
SELECT mapValues(map('k1', 'v1', 'k2', 'v2'))
```

```response title=Response
['v1','v2']
```

{/*AUTOGENERATED_END*/ }
