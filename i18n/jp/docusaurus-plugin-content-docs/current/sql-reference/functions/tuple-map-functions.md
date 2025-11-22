---
description: 'タプル Map 関数に関するドキュメント'
sidebar_label: 'Map'
slug: /sql-reference/functions/tuple-map-functions
title: 'Map 関数'
doc_type: 'reference'
---



## map {#map}

キーと値のペアから[Map(key, value)](../data-types/map.md)型の値を作成します。

**構文**

```sql
map(key1, value1[, key2, value2, ...])
```

**引数**

- `key_n` — マップエントリのキー。[Map](../data-types/map.md)のキー型としてサポートされている任意の型を指定できます。
- `value_n` — マップエントリの値。[Map](../data-types/map.md)の値型としてサポートされている任意の型を指定できます。

**返される値**

- `key:value`ペアを含むマップ。[Map(key, value)](../data-types/map.md)型。

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

キーの配列またはマップと値の配列またはマップからマップを作成します。

この関数は、`CAST([...], 'Map(key_type, value_type)')`構文の便利な代替手段です。
例えば、以下のように記述する代わりに

- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')` または
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

`mapFromArrays(['aa', 'bb'], [4, 5])`と記述できます。

**構文**

```sql
mapFromArrays(keys, values)
```

エイリアス: `MAP_FROM_ARRAYS(keys, values)`

**引数**

- `keys` — マップを作成するためのキーの配列またはマップ [Array](../data-types/array.md) または [Map](../data-types/map.md)。`keys`が配列の場合、NULL値を含まない限り、その型として`Array(Nullable(T))`または`Array(LowCardinality(Nullable(T)))`を受け入れます。
- `values` — マップを作成するための値の配列またはマップ [Array](../data-types/array.md) または [Map](../data-types/map.md)。

**戻り値**

- キー配列と値配列/マップから構築されたキーと値を持つマップ。

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

`mapFromArrays`は[Map](../data-types/map.md)型の引数も受け入れます。これらは実行時にタプルの配列にキャストされます。

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
パース処理はノイズ(ログファイルなど)に対して寛容です。
入力文字列内のキーと値のペアは、キー、キーと値の区切り文字、値で構成されます。
キーと値のペアはペア区切り文字で区切られます。
キーと値は引用符で囲むことができます。

**構文**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

エイリアス:

- `str_to_map`
- `mapFromString`

**引数**

- `data` - キーと値のペアを抽出する文字列。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `key_value_delimiter` - キーと値を区切る単一文字。デフォルトは`:`。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `pair_delimiters` - ペアを区切る文字のセット。デフォルトは` `、`,`、`;`。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `quoting_character` - 引用符として使用される単一文字。デフォルトは`"`。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `unexpected_quoting_character_strategy` - `read_key`および`read_value`フェーズ中に予期しない場所に引用符文字が現れた場合の処理戦略。指定可能な値: "invalid"、"accept"、"promote"。invalidはキーと値を破棄し`WAITING_KEY`状態に戻ります。acceptは通常の文字として扱います。promoteは`READ_QUOTED_{KEY/VALUE}`状態に遷移し次の文字から開始します。

**返り値**

- キーと値のペアのマップ。型: [Map(String, String)](../data-types/map.md)

**例**

クエリ

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') AS kv
```

結果:

```結果:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

シングルクォート`'`を引用符文字として使用する場合:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

結果:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected_quoting_character_strategyの例:

unexpected_quoting_character_strategy=invalid

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

unexpected_quoting_character_strategy=accept

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

unexpected_quoting_character_strategy=promote

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

エスケープシーケンスサポートなしの場合のエスケープ:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

結果：

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

`toString` でシリアル化された map の文字列のキーと値のペアを復元するには：

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) AS map_serialized,
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

`extractKeyValuePairs`と同様ですが、エスケープ処理をサポートしています。

サポートされているエスケープシーケンス: `\x`、`\N`、`\a`、`\b`、`\e`、`\f`、`\n`、`\r`、`\t`、`\v`、`\0`
非標準のエスケープシーケンスは、以下のいずれかでない限り、そのまま(バックスラッシュを含む)返されます:
`\\`、`'`、`"`、`backtick`、`/`、`=`、またはASCII制御文字(c &lt;= 31)

この関数は、事前エスケープや事後エスケープが適切でないユースケースに対応します。例えば、次の
入力文字列を考えてみましょう: `a: "aaaa\"bbb"`。期待される出力は: `a: aaaa\"bbbb`です。

- 事前エスケープ: 事前エスケープを行うと出力は`a: "aaaa"bbb"`となり、`extractKeyValuePairs`はその後`a: aaaa`を出力します
- 事後エスケープ: `extractKeyValuePairs`は`a: aaaa\`を出力し、事後エスケープではそのまま保持されます。

キーの先頭のエスケープシーケンスはスキップされ、値では無効と見なされます。

**例**

エスケープシーケンスサポートを有効にした場合:

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

引数は[マップ](../data-types/map.md)または2つの[配列](/sql-reference/data-types/array)からなる[タプル](/sql-reference/data-types/tuple)です。最初の配列の要素はキーを表し、2番目の配列には各キーに対応する値が含まれます。すべてのキー配列は同じ型である必要があり、すべての値配列は単一の型([Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges)、または[Float64](/sql-reference/data-types/float))に昇格可能な要素を含む必要があります。共通の昇格型が結果配列の型として使用されます。

**戻り値**

- 引数に応じて、1つの[マップ](../data-types/map.md)または[タプル](/sql-reference/data-types/tuple)を返します。最初の配列にはソート済みのキーが含まれ、2番目の配列には値が含まれます。

**例**

`Map`型を使用したクエリ:

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
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) AS res, toTypeName(res) AS type;
```

結果:

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```


## mapSubtract {#mapsubtract}

すべてのキーを収集し、対応する値を減算します。

**構文**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**引数**

引数は[マップ](../data-types/map.md)または2つの[配列](/sql-reference/data-types/array)からなる[タプル](/sql-reference/data-types/tuple)です。最初の配列の要素はキーを表し、2番目の配列には各キーに対応する値が含まれます。すべてのキー配列は同じ型である必要があり、すべての値配列は単一の型([Int64](/sql-reference/data-types/int-uint#integer-ranges)、[UInt64](/sql-reference/data-types/int-uint#integer-ranges)、または[Float64](/sql-reference/data-types/float))に昇格可能な要素を含む必要があります。共通の昇格型が結果配列の型として使用されます。

**戻り値**

- 引数に応じて、1つの[マップ](../data-types/map.md)または[タプル](/sql-reference/data-types/tuple)を返します。最初の配列にはソート済みのキーが含まれ、2番目の配列には値が含まれます。

**例**

`Map`型を使用したクエリ:

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
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

結果:

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```


## mapPopulateSeries {#mappopulateseries}

整数キーを持つマップ内の欠落しているキーと値のペアを補完します。
最大値を超えてキーを拡張するために、最大キーを指定することができます。
より具体的には、この関数は最小キーから最大キー(または指定された場合は`max`引数)までステップサイズ1でキーが連続するマップを返し、対応する値を含みます。
キーに値が指定されていない場合は、デフォルト値が使用されます。
キーが重複する場合、(出現順で)最初の値のみがそのキーに関連付けられます。

**構文**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

配列引数の場合、各行において`keys`と`values`の要素数は同じでなければなりません。

**引数**

引数は[Map](../data-types/map.md)または2つの[Array](/sql-reference/data-types/array)で、1番目の配列と2番目の配列には各キーに対するキーと値が含まれます。

マップ配列:

- `map` — 整数キーを持つマップ。[Map](../data-types/map.md)。

または

- `keys` — キーの配列。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `values` — 値の配列。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `max` — 最大キー値。オプション。[Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**戻り値**

- 引数に応じて、[Map](../data-types/map.md)または2つの[Array](/sql-reference/data-types/array)の[Tuple](/sql-reference/data-types/tuple):ソート順のキーと、対応する値。

**例**

`Map`型を使用したクエリ:

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


## mapKeys {#mapkeys}

指定されたマップのキーを返します。

この関数は、[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns)設定を有効にすることで最適化できます。
設定を有効にすると、関数はマップ全体ではなく[keys](/sql-reference/data-types/map#reading-subcolumns-of-map)サブカラムのみを読み取ります。
クエリ`SELECT mapKeys(m) FROM table`は`SELECT m.keys FROM table`に変換されます。

**構文**

```sql
mapKeys(map)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。

**戻り値**

- `map`のすべてのキーを含む配列。[Array](../data-types/array.md)。

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


## mapContains {#mapcontains}

指定されたマップに指定されたキーが含まれているかどうかを返します。

**構文**

```sql
mapContains(map, key)
```

エイリアス: `mapContainsKey(map, key)`

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `key` — キー。型は`map`のキー型と一致する必要があります。

**戻り値**

- `map`に`key`が含まれる場合は`1`、含まれない場合は`0`。[UInt8](../data-types/int-uint.md)。

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


## mapContainsKeyLike {#mapcontainskeylike}

**構文**

```sql
mapContainsKeyLike(map, pattern)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `pattern` - マッチする文字列パターン。

**戻り値**

- `map`が指定されたパターンに一致する`key`を含む場合は`1`、含まない場合は`0`。

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

文字列キーを持つマップとLIKEパターンを指定すると、この関数はキーがパターンに一致する要素を含むマップを返します。

**構文**

```sql
mapExtractKeyLike(map, pattern)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `pattern` — 一致させる文字列パターン。

**戻り値**

- 指定されたパターンに一致するキーを持つ要素を含むマップ。パターンに一致する要素がない場合は、空のマップが返されます。

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


## mapValues {#mapvalues}

指定されたマップの値を返します。

この関数は、設定[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns)を有効にすることで最適化できます。
設定を有効にすると、関数はマップ全体ではなく[values](/sql-reference/data-types/map#reading-subcolumns-of-map)サブカラムのみを読み取ります。
クエリ`SELECT mapValues(m) FROM table`は`SELECT m.values FROM table`に変換されます。

**構文**

```sql
mapValues(map)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。

**戻り値**

- `map`のすべての値を含む配列。[Array](../data-types/array.md)。

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


## mapContainsValue {#mapcontainsvalue}

指定されたマップに指定された値が含まれているかどうかを返します。

**構文**

```sql
mapContainsValue(map, value)
```

エイリアス: `mapContainsValue(map, value)`

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `value` — 値。型は`map`の値型と一致する必要があります。

**戻り値**

- `map`に`value`が含まれる場合は`1`、含まれない場合は`0`。[UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContainsValue(a, '11') FROM tab;

```

結果:

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

- `map` — マップ。[Map](../data-types/map.md)。
- `pattern` - マッチする文字列パターン。

**戻り値**

- `map`が指定されたパターンに一致する`value`を含む場合は`1`、含まない場合は`0`。

**例**

クエリ:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

結果:

```text
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```


## mapExtractValueLike {#mapextractvaluelike}

文字列値を持つマップとLIKEパターンを指定すると、この関数は値がパターンに一致する要素を含むマップを返します。

**構文**

```sql
mapExtractValueLike(map, pattern)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `pattern` — 一致させる文字列パターン。

**戻り値**

- 指定されたパターンに一致する値を持つ要素を含むマップ。パターンに一致する要素がない場合は、空のマップが返されます。

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

- `func` — [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**戻り値**

- 各要素に対して `func(map1[i], ..., mapN[i])` を適用することで元のマップから得られるマップを返します。

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

- `func` - [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**戻り値**

- `func(map1[i], ..., mapN[i])` が0以外の値を返す要素のみを含むマップを返します。

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

- `map1` [Map](../data-types/map.md)
- `map2` [Map](../data-types/map.md)

**戻り値**

- map2内の対応するキーの値でmap1の値を更新したマップを返します。

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
同じキーを持つ要素が複数の入力マップに存在する場合、すべての要素が結果マップに追加されますが、演算子 `[]` でアクセスできるのは最初の要素のみです。

**構文**

```sql
mapConcat(maps)
```

**引数**

- `maps` – 任意の数の[Map](../data-types/map.md)。

**戻り値**

- 引数として渡されたマップを連結したマップを返します。

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

`map`内の少なくとも1つのキーと値のペアに対して`func(key, value)`が0以外の値を返す場合は1を返します。それ以外の場合は0を返します。

:::note
`mapExists`は[高階関数](/sql-reference/functions/overview#higher-order-functions)です。
第1引数としてラムダ関数を渡すことができます。
:::

**例**

クエリ:

```sql
SELECT mapExists((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

結果:

```response
┌─res─┐
│   1 │
└─────┘
```


## mapAll(\[func,\] map) {#mapallfunc-map}

`map`内のすべてのキーと値のペアに対して`func(key, value)`が0以外の値を返す場合は1を返します。それ以外の場合は0を返します。

:::note
`mapAll`は[高階関数](/sql-reference/functions/overview#higher-order-functions)です。
第一引数としてラムダ関数を渡すことができます。
:::

**例**

クエリ:

```sql
SELECT mapAll((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

結果:

```response
┌─res─┐
│   0 │
└─────┘
```


## mapSort(\[func,\], map) {#mapsortfunc-map}

マップの要素を昇順でソートします。
`func`関数が指定されている場合、ソート順序はマップのキーと値に`func`関数を適用した結果によって決定されます。

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

詳細については、`arraySort`関数の[リファレンス](/sql-reference/functions/array-functions#arraySort)を参照してください。


## mapPartialSort {#mappartialsort}

追加の`limit`引数により部分ソートを可能にし、マップの要素を昇順にソートします。
`func`関数が指定されている場合、ソート順序はマップのキーと値に適用された`func`関数の結果によって決定されます。

**構文**

```sql
mapPartialSort([func,] limit, map)
```

**引数**

- `func` – マップのキーと値に適用するオプションの関数。[ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – [1..limit]の範囲の要素がソートされます。[(U)Int](../data-types/int-uint.md)。
- `map` – ソート対象のマップ。[Map](../data-types/map.md)。

**戻り値**

- 部分的にソートされたマップ。[Map](../data-types/map.md)。

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

マップの要素を降順にソートします。
`func`関数が指定されている場合、ソート順序はマップのキーと値に`func`関数を適用した結果によって決定されます。

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

詳細については、[arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort)関数を参照してください。


## mapPartialReverseSort {#mappartialreversesort}

追加の`limit`引数により部分ソートを可能にし、マップの要素を降順にソートします。
`func`関数が指定されている場合、ソート順序はマップのキーと値に適用された`func`関数の結果によって決定されます。

**構文**

```sql
mapPartialReverseSort([func,] limit, map)
```

**引数**

- `func` – マップのキーと値に適用するオプション関数。[ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – [1..limit]の範囲内の要素がソートされます。[(U)Int](../data-types/int-uint.md)。
- `map` – ソート対象のマップ。[Map](../data-types/map.md)。

**戻り値**

- 部分ソートされたマップ。[Map](../data-types/map.md)。

**例**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

<!--
The inner content of the tags below are replaced at doc framework build time with
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
