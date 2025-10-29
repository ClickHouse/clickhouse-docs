---
'description': 'Tuple マップ関数の Documentation'
'sidebar_label': 'マップ'
'slug': '/sql-reference/functions/tuple-map-functions'
'title': 'マップ関数'
'doc_type': 'reference'
---

## map {#map}

キーと値のペアから [Map(key, value)](../data-types/map.md) 型の値を作成します。

**構文**

```sql
map(key1, value1[, key2, value2, ...])
```

**引数**

- `key_n` — マップエントリのキー。 [Map](../data-types/map.md) のキータイプとしてサポートされている任意のタイプ。
- `value_n` — マップエントリの値。 [Map](../data-types/map.md) の値タイプとしてサポートされている任意のタイプ。

**返される値**

- `key:value` ペアを含むマップ。 [Map(key, value)](../data-types/map.md)。

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

キーの配列またはマップと、値の配列またはマップからマップを作成します。

この関数は `CAST([...], 'Map(key_type, value_type)')` 構文の便利な代替手段です。
たとえば、次のように記述する代わりに
- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')` もしくは
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

`mapFromArrays(['aa', 'bb'], [4, 5])` と書くことができます。

**構文**

```sql
mapFromArrays(keys, values)
```

エイリアス: `MAP_FROM_ARRAYS(keys, values)`

**引数**

- `keys` — マップを作成するためのキーの配列またはマップ。 [Array](../data-types/array.md) または [Map](../data-types/map.md)。`keys` が配列の場合、NULL値を含まない限り `Array(Nullable(T))` または `Array(LowCardinality(Nullable(T)))` としてそのタイプを受け入れます。
- `values`  - マップを作成するための値の配列またはマップ。[Array](../data-types/array.md) または [Map](../data-types/map.md)。

**返される値**

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

`mapFromArrays` は [Map](../data-types/map.md) 型の引数も受け入れます。これらは実行中にタプルの配列にキャストされます。

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
パースはノイズに対して寛容です（例: ログファイル）。
入力文字列のキーと値のペアは、キーの後にキーと値の区切り記号が続き、その後に値があります。
キーと値のペアはペアの区切り記号で分けられます。
キーと値は引用符で囲むことができます。

**構文**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

エイリアス:
- `str_to_map`
- `mapFromString`

**引数**

- `data` - キーと値のペアを抽出するための文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `key_value_delimiter` - キーと値を区切る単一文字。デフォルトは `:`。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `pair_delimiters` - ペアを区切る文字のセット。デフォルトは ` `, `,` と `;`。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `quoting_character` - 引用符として使用する単一文字。デフォルトは `"`。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `unexpected_quoting_character_strategy` - `read_key` と `read_value` フェーズ中に予期しない場所にある引用符を処理するための戦略。可能な値: "invalid", "accept" と "promote"。Invalidはキー/値を破棄し、`WAITING_KEY` 状態に戻ります。Acceptはそれを通常の文字として扱います。Promoteは `READ_QUOTED_{KEY/VALUE}` 状態に遷移し、次の文字から開始します。

**返される値**

- キーと値のペアのマップ。型: [Map(String, String)](../data-types/map.md) 

**例**

クエリ

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') AS kv
```

結果:

```Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

単一引用符 `'` を引用符として使用する場合:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

結果:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected_quoting_character_strategy の例:

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

エスケープシーケンスがエスケープシーケンスサポートなし:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

結果:

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

`toString` でシリアル化されたマップ文字列キーと値のペアを復元するには:

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

`extractKeyValuePairs` と同じですが、エスケープをサポートしています。

サポートされているエスケープシーケンス: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` および `\0`。
非標準エスケープシーケンスはそのまま（バックスラッシュを含む）返されますが、以下のいずれかである場合を除きます:
`\\`, `'`, `"`, ```バックティック```, `/`, `=` または ASCII 制御文字 (c &lt;= 31)。

この関数は、前エスケープおよび後エスケープが適していないユースケースを満たすことができます。たとえば、次の入力文字列を考えてみます: `a: "aaaa\"bbb"`。期待される出力は: `a: aaaa\"bbbb` です。
- 前エスケープ: 前エスケープすると、出力は `a: "aaaa"bbb"` になり、`extractKeyValuePairs` はその後 `a: aaaa` を出力します。
- 後エスケープ: `extractKeyValuePairs` は `a: aaaa\` を出力し、後エスケープはそれをそのまま保持します。

キーの先頭のエスケープシーケンスはスキップされ、値には無効と見なされます。

**例**

エスケープシーケンスがエスケープシーケンスサポートがオンの場合:

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

引数は [maps](../data-types/map.md) または 2つの [arrays](/sql-reference/data-types/array) の [tuples](/sql-reference/data-types/tuple) であり、最初の配列内の項目がキーを表し、2番目の配列が各キーの値を含みます。すべてのキー配列は同じタイプである必要があり、すべての値配列は1つの型に昇格されるアイテムを含む必要があります ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) または [Float64](/sql-reference/data-types/float))。共通の昇格型が結果の配列の型として使用されます。

**返される値**

- 引数に応じて、キーがソートされた配列とそれに対応する値を含む1つの [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) を返します。

**例**

`Map` 型のクエリ:

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

結果:

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

タプルでのクエリ:

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

引数は [maps](../data-types/map.md) または 2つの [arrays](/sql-reference/data-types/array) の [tuples](/sql-reference/data-types/tuple) であり、最初の配列内の項目がキーを表し、2番目の配列が各キーの値を含みます。すべてのキー配列は同じタイプである必要があり、すべての値配列は1つの型に昇格されるアイテムを含む必要があります ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) または [Float64](/sql-reference/data-types/float))。共通の昇格型が結果の配列の型として使用されます。

**返される値**

- 引数に応じて、キーがソートされた配列とそれに対応する値を含む1つの [map](../data-types/map.md) または [tuple](/sql-reference/data-types/tuple) を返します。

**例**

`Map` 型のクエリ:

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

結果:

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

タプルマップでのクエリ:

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

整数キーを持つマップの欠けているキーと値のペアを埋めます。
最大キーを指定することで、最大の値を超えるキーを拡張することもできます。
具体的には、この関数は、キーが最小キーから最大キー（または指定された `max` 引数）まで1ステップずつ形成されるマップを返し、それに対応する値も返します。
キーに対して値が指定されていない場合、デフォルト値が値として使用されます。
キーが繰り返された場合、最初の値（出現順序の中での）だけがそのキーに関連付けられます。

**構文**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

配列引数の場合、`keys` と `values` の要素数は各行で同じでなければなりません。

**引数**

引数は、[Maps](../data-types/map.md) または2つの [Arrays](/sql-reference/data-types/array) であり、最初の配列と2番目の配列が各キーのキーと値を含んでいます。

マップされた配列:

- `map` — 整数キーを持つマップ。[Map](../data-types/map.md)。

または

- `keys` — キーの配列。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `values` — 値の配列。[Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges))。
- `max` — 最大キー値。オプション。[Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges)。

**返される値**

- 引数に応じて、[Map](../data-types/map.md) または2つの [Arrays](/sql-reference/data-types/array) の [Tuple](/sql-reference/data-types/tuple): ソートされた順序でのキーとそれに対応するキーの値。

**例**

`Map` 型のクエリ:

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

結果:

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

マップされた配列でのクエリ:

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

与えられたマップのキーを返します。

この関数は、設定 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。
設定が有効な場合、関数はマップ全体の代わりに [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムのみを読み取ります。
クエリ `SELECT mapKeys(m) FROM table` は `SELECT m.keys FROM table` に変換されます。

**構文**

```sql
mapKeys(map)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。

**返される値**

- `map` からのすべてのキーを含む配列。[Array](../data-types/array.md)。

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

与えられたマップに特定のキーが含まれているかどうかを返します。

**構文**

```sql
mapContains(map, key)
```

エイリアス: `mapContainsKey(map, key)`

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `key` — キー。型は `map` のキー型と一致する必要があります。

**返される値**

- `map` が `key` を含む場合は `1`、そうでない場合は `0`。[UInt8](../data-types/int-uint.md)。

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
- `pattern`  - 一致させる文字列パターン。

**返される値**

- `map` が指定したパターンのような `key` を含む場合は `1`、そうでない場合は `0`。

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

文字列キーを持つマップと LIKE パターンを与えると、この関数はパターンに一致する要素を持つマップを返します。

**構文**

```sql
mapExtractKeyLike(map, pattern)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `pattern`  - 一致させる文字列パターン。

**返される値**

- 指定されたパターンに一致する要素を含むマップを返します。要素がパターンに一致しない場合、空のマップが返されます。

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

与えられたマップの値を返します。

この関数は、設定 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。
設定が有効な場合、関数はマップ全体の代わりに [values](/sql-reference/data-types/map#reading-subcolumns-of-map) サブカラムのみを読み取ります。
クエリ `SELECT mapValues(m) FROM table` は `SELECT m.values FROM table` に変換されます。

**構文**

```sql
mapValues(map)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。

**返される値**

- `map` からのすべての値を含む配列。[Array](../data-types/array.md)。

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

与えられたマップに特定の値が含まれているかどうかを返します。

**構文**

```sql
mapContainsValue(map, value)
```

エイリアス: `mapContainsValue(map, value)`

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `value` — 値。型は `map` の値型と一致する必要があります。

**返される値**

- `map` が `value` を含む場合は `1`、そうでない場合は `0`。[UInt8](../data-types/int-uint.md)。

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
- `pattern`  - 一致させる文字列パターン。

**返される値**

- `map` が指定したパターンのような `value` を含む場合は `1`、そうでない場合は `0`。

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

文字列値を持つマップと LIKE パターンを与えると、この関数はパターンに一致する要素を持つマップを返します。

**構文**

```sql
mapExtractValueLike(map, pattern)
```

**引数**

- `map` — マップ。[Map](../data-types/map.md)。
- `pattern`  - 一致させる文字列パターン。

**返される値**

- 指定されたパターンに一致する要素を含むマップを返します。要素がパターンに一致しない場合、空のマップが返されます。

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

**返される値**

- 各要素に対して `func(map1[i], ..., mapN[i])` を適用して得られた元のマップからのマップを返します。

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

マップをフィルタリングして、各マップ要素に関数を適用します。

**構文**

```sql
mapFilter(func, map)
```

**引数**

- `func`  - [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `map` — [Map](../data-types/map.md)。

**返される値**

- `func(map1[i], ..., mapN[i])` が0以外の何かを返す `map` の要素のみを含むマップを返します。

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

同じキーの等価性に基づいて複数のマップを連結します。
同じキーを持つ要素が複数の入力マップに存在する場合、すべての要素が結果のマップに追加されますが、最初の要素のみが `[]` 演算子を介してアクセス可能です。

**構文**

```sql
mapConcat(maps)
```

**引数**

-   `maps` – 任意の数の [Maps](../data-types/map.md)。

**返される値**

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

`map` に少なくとも1つのキーと値のペアが存在し、そのペアに対して `func(key, value)` が0以外の何かを返す場合は `1` を返します。そうでない場合は `0` を返します。

:::note
`mapExists` は [高階関数](/sql-reference/functions/overview#higher-order-functions)です。
最初の引数としてラムダ関数を渡すことができます。
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

`func(key, value)` が `map` のすべてのキーと値のペアに対して0以外の何かを返す場合は `1` を返します。そうでない場合は `0` を返します。

:::note
`mapAll` は [高階関数](/sql-reference/functions/overview#higher-order-functions)です。
最初の引数としてラムダ関数を渡すことができます。
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
`func` 関数が指定された場合、ソート順はマップのキーと値に適用された `func` 関数の結果によって決まります。

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

詳細については、`arraySort` 関数の [リファレンス](/sql-reference/functions/array-functions#arraySort) を参照してください。

## mapPartialSort {#mappartialsort}

マップの要素を昇順でソートし、追加の `limit` 引数を使用して部分的なソートを許可します。
`func` 関数が指定された場合、ソート順はマップのキーと値に適用された `func` 関数の結果によって決まります。

**構文**

```sql
mapPartialSort([func,] limit, map)
```
**引数**

- `func` – マップのキーと値に適用されるオプションの関数。[ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 範囲 [1..limit] の要素がソートされます。[(U)Int](../data-types/int-uint.md)。
- `map` – ソートするマップ。[Map](../data-types/map.md)。

**返される値**

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

マップの要素を降順でソートします。
`func` 関数が指定された場合、ソート順はマップのキーと値に適用された `func` 関数の結果によって決まります。

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

マップの要素を降順でソートし、追加の `limit` 引数を使用して部分的なソートを許可します。
`func` 関数が指定された場合、ソート順はマップのキーと値に適用された `func` 関数の結果によって決まります。

**構文**

```sql
mapPartialReverseSort([func,] limit, map)
```
**引数**

- `func` – マップのキーと値に適用されるオプションの関数。[ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `limit` – 範囲 [1..limit] の要素がソートされます。[(U)Int](../data-types/int-uint.md)。
- `map` – ソートするマップ。[Map](../data-types/map.md)。

**返される値**

- 部分的にソートされたマップ。[Map](../data-types/map.md)。

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
