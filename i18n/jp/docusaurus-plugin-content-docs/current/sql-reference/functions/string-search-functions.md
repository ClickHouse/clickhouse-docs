---
slug: /sql-reference/functions/string-search-functions
sidebar_position: 160
sidebar_label: 文字列の検索
---

# 文字列検索のための関数

このセクションのすべての関数は、デフォルトで大文字と小文字を区別して検索します。大文字と小文字を区別しない検索は、通常、別の関数バリアントで提供されます。

:::note
大文字と小文字を区別しない検索は、英語の小文字と大文字のルールに従います。例えば、英語では大文字の `i` は `I` ですが、トルコ語では `İ` です。英語以外の言語では、結果が予期しないものになることがあります。
:::

このセクションの関数は、検索対象の文字列（このセクションでは `haystack` と呼ばれます）と検索文字列（このセクションでは `needle` と呼ばれます）がシングルバイトエンコードのテキストであると仮定します。この仮定が違反された場合、例外はスローされず、結果は未定義になります。UTF-8 エンコードされた文字列での検索は、通常、別の関数バリアントで提供されます。同様に、UTF-8 関数バリアントが使用されていて、入力文字列が UTF-8 エンコードされたテキストでない場合、例外はスローされず、結果は未定義になります。自動的な Unicode 正規化は行われませんが、必要に応じて [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 関数を使用できます。

[一般的な文字列関数](string-functions.md) と [文字列の置き換えに関する関数](string-replace-functions.md) は別途説明されています。
## position {#position}

文字列 `haystack` における部分文字列 `needle` の位置（バイト単位、1から始まる）を返します。

**構文**

``` sql
position(haystack, needle[, start_pos])
```

エイリアス：
- `position(needle IN haystack)`

**引数**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md) または [Enum](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [String](../data-types/string.md)。
- `start_pos` – `haystack` 内の検索を開始する位置（1ベース）。 [UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 部分文字列が見つかった場合のバイト単位の開始位置（1から数えたもの）。 [UInt64](../data-types/int-uint.md)。
- 部分文字列が見つからなかった場合は 0。 [UInt64](../data-types/int-uint.md)。

部分文字列 `needle` が空である場合、以下のルールが適用されます：
- `start_pos` が指定されていない場合：`1` を返す
- `start_pos = 0` の場合：`1` を返す
- `start_pos >= 1` かつ `start_pos <= length(haystack) + 1` の場合：`start_pos` を返す
- それ以外の場合：`0` を返す

同じルールは、関数 `locate`、`positionCaseInsensitive`、`positionUTF8` および `positionCaseInsensitiveUTF8` にも適用されます。

**例**

クエリ：

``` sql
SELECT position('Hello, world!', '!');
```

結果：

``` text
┌─position('Hello, world!', '!')─┐
│                             13 │
└────────────────────────────────┘
```

`start_pos` 引数を使用した例：

クエリ：

``` sql
SELECT
    position('Hello, world!', 'o', 1),
    position('Hello, world!', 'o', 7)
```

結果：

``` text
┌─position('Hello, world!', 'o', 1)─┬─position('Hello, world!', 'o', 7)─┐
│                                 5 │                                 9 │
└───────────────────────────────────┴───────────────────────────────────┘
```

`needle IN haystack` 構文の例：

クエリ：

```sql
SELECT 6 = position('/' IN s) FROM (SELECT 'Hello/World' AS s);
```

結果：

```text
┌─equals(6, position(s, '/'))─┐
│                           1 │
└─────────────────────────────┘
```

空の `needle` 部分文字列を使用した例：

クエリ：

``` sql
SELECT
    position('abc', ''),
    position('abc', '', 0),
    position('abc', '', 1),
    position('abc', '', 2),
    position('abc', '', 3),
    position('abc', '', 4),
    position('abc', '', 5)
```

結果：

``` text
┌─position('abc', '')─┬─position('abc', '', 0)─┬─position('abc', '', 1)─┬─position('abc', '', 2)─┬─position('abc', '', 3)─┬─position('abc', '', 4)─┬─position('abc', '', 5)─┐
│                   1 │                      1 │                      1 │                      2 │                      3 │                      4 │                      0 │
└─────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘
```
## locate {#locate}

[position](#position) と同様ですが、引数 `haystack` と `needle` が反転しています。

この関数の動作は ClickHouse のバージョンによって異なります：
- バージョン < v24.3 では、`locate` は `position` 関数のエイリアスであり、引数 `(haystack, needle[, start_pos])` を受け入れていました。
- バージョン >= 24.3 では、`locate` は個別の関数（MySQL との互換性向上のため）であり、引数 `(needle, haystack[, start_pos])` を受け入れます。以前の動作は、設定 [function_locate_has_mysql_compatible_argument_order = false](../../operations/settings/settings.md#function-locate-has-mysql-compatible-argument-order) を使用することで復元できます。

**構文**

``` sql
locate(needle, haystack[, start_pos])
```
## positionCaseInsensitive {#positioncaseinsensitive}

[position](#position) の大文字と小文字を区別しないバリアントです。

**例**

クエリ：

``` sql
SELECT positionCaseInsensitive('Hello, world!', 'hello');
```

結果：

``` text
┌─positionCaseInsensitive('Hello, world!', 'hello')─┐
│                                                 1 │
└───────────────────────────────────────────────────┘
```
## positionUTF8 {#positionutf8}

[position](#position) と同様ですが、`haystack` と `needle` が UTF-8 エンコードされた文字列であると仮定します。

**例**

関数 `positionUTF8` は、文字 `ö`（2つのポイントで表される）を単一の Unicode コードポイントとして正しくカウントします：

クエリ：

``` sql
SELECT positionUTF8('Motörhead', 'r');
```

結果：

``` text
┌─position('Motörhead', 'r')─┐
│                          5 │
└────────────────────────────┘
```
## positionCaseInsensitiveUTF8 {#positioncaseinsensitiveutf8}

[positionUTF8](#positionutf8) の大文字と小文字を区別しないバリアントです。
## multiSearchAllPositions {#multisearchallpositions}

[position](#position) と同様ですが、`haystack` 文字列内の複数の `needle` 部分文字列の位置 (バイト単位、1 から始まる) の配列を返します。

:::note
すべての `multiSearch*()` 関数は、最大 2<sup>8</sup> 個の needle をサポートします。
:::

**構文**

``` sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 部分文字列が見つかった場合のバイト単位の開始位置の配列（1 から数えたもの）。
- 部分文字列が見つからなかった場合は 0。

**例**

クエリ：

``` sql
SELECT multiSearchAllPositions('Hello, World!', ['hello', '!', 'world']);
```

結果：

``` text
┌─multiSearchAllPositions('Hello, World!', ['hello', '!', 'world'])─┐
│ [0,13,0]                                                          │
└───────────────────────────────────────────────────────────────────┘
```
## multiSearchAllPositionsCaseInsensitive {#multisearchallpositionscaseinsensitive}

[multiSearchAllPositions](#multisearchallpositions) と同様ですが、大文字と小文字を区別しません。

**構文**

```sql
multiSearchAllPositionsCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 部分文字列が見つかった場合のバイト単位の開始位置の配列（1 から数えたもの）。
- 部分文字列が見つからなかった場合は 0。

**例**

クエリ：

```sql
SELECT multiSearchAllPositionsCaseInsensitive('ClickHouse',['c','h']);
```

結果：

```response
["1","6"]
```
## multiSearchAllPositionsUTF8 {#multisearchallpositionsutf8}

[multiSearchAllPositions](#multisearchallpositions) と同様ですが、`haystack` および `needle` の部分文字列が UTF-8 エンコードされた文字列であると仮定します。

**構文**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される UTF-8 エンコードされた文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 エンコードされた部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 部分文字列が見つかった場合のバイト単位の開始位置の配列（1 から数えたもの）。
- 部分文字列が見つからなかった場合は 0。

**例**

`ClickHouse` を UTF-8 文字列とし、`C` (`\x43`) および `H` (`\x48`) の位置を見つけます。

クエリ：

```sql
SELECT multiSearchAllPositionsUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

結果：

```response
["1","6"]
```
## multiSearchAllPositionsCaseInsensitiveUTF8 {#multisearchallpositionscaseinsensitiveutf8}

[multiSearchAllPositionsUTF8](#multisearchallpositionsutf8) と同様ですが、大文字と小文字を区別しません。

**構文**

```sql
multiSearchAllPositionsCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される UTF-8 エンコードされた文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 エンコードされた部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 部分文字列が見つかった場合のバイト単位の開始位置の配列（1 から数えたもの）。
- 部分文字列が見つからなかった場合は 0。

**例**

`ClickHouse` を UTF-8 文字列とし、`c` (`\x63`) および `h` (`\x68`) の位置を見つけます。

クエリ：

```sql
SELECT multiSearchAllPositionsCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x63','\x68']);
```

結果：

```response
["1","6"]
```
## multiSearchFirstPosition {#multisearchfirstposition}

[`position`](#position) のように、`haystack` 文字列内の複数の `needle` 文字列の中で一致する最も左のオフセットを返します。

関数 [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive)、[`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) および [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) は、この関数の大文字と小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 複数の `needle` 文字列に一致する `haystack` 文字列内の最も左のオフセット。
- 一致しなかった場合は 0。

**例**

クエリ：

```sql
SELECT multiSearchFirstPosition('Hello World',['llo', 'Wor', 'ld']);
```

結果：

```response
3
```
## multiSearchFirstPositionCaseInsensitive {#multisearchfirstpositioncaseinsensitive}

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、大文字と小文字を区別しません。

**構文**

```sql
multiSearchFirstPositionCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列の配列。 [Array](../data-types/array.md)。

**返される値**

- 複数の `needle` 文字列に一致する `haystack` 文字列内の最も左のオフセット。
- 一致しなかった場合は 0。

**例**

クエリ：

```sql
SELECT multiSearchFirstPositionCaseInsensitive('HELLO WORLD',['wor', 'ld', 'ello']);
```

結果：

```response
2
```
## multiSearchFirstPositionUTF8 {#multisearchfirstpositionutf8}

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、`haystack` と `needle` が UTF-8 文字列であると仮定します。

**構文**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 文字列の配列。 [Array](../data-types/array.md)。

**返される値**

- 複数の `needle` 文字列に一致する `haystack` 文字列内の最も左のオフセット。
- 一致しなかった場合は 0。

**例**

UTF-8 文字列 `hello world` 内の最も左のオフセットを見つけ、与えられた needles のいずれかに一致します。

クエリ：

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

結果：

```response
2
```
## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、`haystack` と `needle` が UTF-8 文字列であることを仮定し、大文字と小文字を区別しません。

**構文**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 文字列の配列。 [Array](../data-types/array.md)。

**返される値**

- 複数の `needle` 文字列に一致する `haystack` 文字列内の最も左のオフセット（大文字小文字の区別なし）。
- 一致しなかった場合は 0。

**例**

UTF-8 文字列 `HELLO WORLD` 内の最も左のオフセットを見つけ、与えられた needles のいずれかに一致します。

クエリ：

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

結果：

```response
2
```
## multiSearchFirstIndex {#multisearchfirstindex}

文字列 `haystack` 内で見つかった最も左の needle<sub>i</sub> のインデックス `i`（1 から始まる）を返し、それ以外の場合は 0 を返します。

関数 [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive)、[`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8) および [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) は、大文字小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```
**パラメータ**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 最も左に見つかった needle のインデックス（1 から始まる）。一致しなければ 0。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT multiSearchFirstIndex('Hello World',['World','Hello']);
```

結果：

```response
1
```
## multiSearchFirstIndexCaseInsensitive {#multisearchfirstindexcaseinsensitive}

文字列 `haystack` 内で見つかった最も左の needle<sub>i</sub> のインデックス `i`（1 から始まる）を返し、それ以外の場合は 0 を返します。大文字小文字を区別しません。

**構文**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 最も左に見つかった needle のインデックス（1 から始まる）。一致しなければ 0。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT multiSearchFirstIndexCaseInsensitive('hElLo WoRlD',['World','Hello']);
```

結果：

```response
1
```
## multiSearchFirstIndexUTF8 {#multisearchfirstindexutf8}

文字列 `haystack` 内で見つかった最も左の needle<sub>i</sub> のインデックス `i`（1 から始まる）を返し、それ以外の場合は 0 を返します。`haystack` と `needle` が UTF-8 エンコードされた文字列であると仮定します。

**構文**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 文字列の配列。 [Array](../data-types/array.md)。

**返される値**

- 最も左に見つかった needle のインデックス（1 から始まる）。一致しなければ 0。 [UInt8](../data-types/int-uint.md)。

**例**

`Hello World` を UTF-8 文字列として与え、UTF-8 文字列 `Hello` および `World` の最初のインデックスを見つけます。

クエリ：

```sql
SELECT multiSearchFirstIndexUTF8('\x48\x65\x6c\x6c\x6f\x20\x57\x6f\x72\x6c\x64',['\x57\x6f\x72\x6c\x64','\x48\x65\x6c\x6c\x6f']);
```

結果：

```response
1
```
## multiSearchFirstIndexCaseInsensitiveUTF8 {#multisearchfirstindexcaseinsensitiveutf8}

文字列 `haystack` 内で見つかった最も左の needle<sub>i</sub> のインデックス `i`（1 から始まる）を返し、それ以外の場合は 0 を返します。`haystack` と `needle` が UTF-8 エンコードされた文字列であると仮定し、大文字小文字を区別しません。

**構文**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 文字列の配列。 [Array](../data-types/array.md)。

**返される値**

- 最も左に見つかった needle のインデックス（1 から始まる）。一致しなければ 0。 [UInt8](../data-types/int-uint.md)。

**例**

UTF-8 文字列 `HELLO WORLD` における `hello` および `world` の最初のインデックスを見つけます。

クエリ：

```sql
SELECT multiSearchFirstIndexCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['\x68\x65\x6c\x6c\x6f','\x77\x6f\x72\x6c\x64']);
```

結果：

```response
1
```
## multiSearchAny {#multisearchany}

文字列 `haystack` に対して、少なくとも 1 つの文字列 needle<sub>i</sub> が一致する場合は 1 を返し、そうでない場合は 0 を返します。

関数 [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive)、[`multiSearchAnyUTF8`](#multisearchanyutf8) および [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) は、大文字小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 一致が 1 つ以上ある場合は 1。
- 一致がない場合は 0。

**例**

クエリ：

```sql
SELECT multiSearchAny('ClickHouse',['C','H']);
```

結果：

```response
1
```
## multiSearchAnyCaseInsensitive {#multisearchanycaseinsensitive}

[multiSearchAny](#multisearchany) と同様ですが、大文字小文字を区別しません。

**構文**

```sql
multiSearchAnyCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 大文字小文字を区別しない一致が 1 つ以上ある場合は 1。
- 一致がない場合は 0。

**例**

クエリ：

```sql
SELECT multiSearchAnyCaseInsensitive('ClickHouse',['c','h']);
```

結果：

```response
1
```
## multiSearchAnyUTF8 {#multisearchanyutf8}

[multiSearchAny](#multisearchany) と同様ですが、`haystack` および `needle` の部分文字列が UTF-8 エンコードされた文字列であると仮定します。

**構文**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される UTF-8 エンコードされた文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 エンコードされた部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 一致が 1 つ以上ある場合は 1。
- 一致がない場合は 0。

**例**

`ClickHouse` を UTF-8 文字列として与え、`C` (`\x43`) または `H` (`\x48`) の文字がその中にあるかどうかを確認します。

クエリ：

```sql
SELECT multiSearchAnyUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

結果：

```response
1
```
## multiSearchAnyCaseInsensitiveUTF8 {#multisearchanycaseinsensitiveutf8}

[multiSearchAnyUTF8](#multisearchanyutf8) と同様ですが、大文字小文字を区別しません。

**構文**

```sql
multiSearchAnyCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**パラメータ**

- `haystack` — 検索が実行される UTF-8 エンコードされた文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 エンコードされた部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 大文字小文字を区別しない一致が 1 つ以上ある場合は 1。
- 一致がない場合は 0。

**例**

`ClickHouse` を UTF-8 文字列として与え、`h` (`\x68`) のいずれかの文字がその中にあるかどうかを確認します（大文字小文字を区別しません）。

クエリ：

```sql
SELECT multiSearchAnyCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x68']);
```

結果：

```response
1
```
## match {#match}

文字列 `haystack` が正規表現 `pattern` にマッチするかどうかを返します。使用する正規表現は [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に従います。

マッチングは UTF-8 に基づいており、例えば `.` は UTF-8 で 2 バイトを使用して表現される Unicode コードポイント `¥` にマッチします。正規表現にはヌルバイトを含めることはできません。`haystack` または `pattern` が無効な UTF-8 の場合、動作は未定義になります。

re2 のデフォルトの動作とは異なり、`.` は改行にマッチします。これを無効にするには、パターンの先頭に `(?-s)` を追加します。

文字列内の部分文字列を検索するだけの場合は、関数 [like](#like) または [position](#position) を使用すると、これらの関数はこの関数よりもはるかに高速に動作します。

**構文**

```sql
match(haystack, pattern)
```

エイリアス: `haystack REGEXP pattern operator`
## multiMatchAny {#multimatchany}

`match` のように、少なくとも 1 つのパターンが一致すれば 1 を返し、そうでなければ 0 を返します。

:::note
`multi[Fuzzy]Match*()` ファミリーの関数は、[Vectorscan](https://github.com/VectorCamp/vectorscan) ライブラリを使用しています。このため、これらは ClickHouse がベクトルスキャンのサポートでコンパイルされている場合にのみ有効になります。

すべてのハイパースキャンを使用する関数を無効にするには、設定 `SET allow_hyperscan = 0;` を使用します。

ベクトルスキャンの制約により、`haystack` 文字列の長さは 2<sup>32</sup> バイト未満でなければなりません。

ハイパースキャンは、正規表現拒否サービス攻撃（ReDoS）に対して一般的に脆弱です（例として、(こちら)[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova]、(こちら)[https://doi.org/10.1007/s10664-021-10033-1] および (こちら)[https://doi.org/10.1145/3236024.3236027] を参照）。提供されたパターンを慎重に確認することをお勧めします。
:::

文字列内の複数の部分文字列を検索するだけの場合は、関数 [multiSearchAny](#multisearchany) を使用すると、これらの関数はこの関数よりもはるかに高速に動作します。

**構文**

```sql
multiMatchAny(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiMatchAnyIndex {#multimatchanyindex}

`multiMatchAny` と同様ですが、一致する `haystack` に関する任意のインデックスを返します。

**構文**

```sql
multiMatchAnyIndex(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiMatchAllIndices {#multimatchallindices}

`multiMatchAny` と同様ですが、ハイパースキャンの一致するすべてのインデックスの配列を返します。

**構文**

```sql
multiMatchAllIndices(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiFuzzyMatchAny {#multifuzzymatchany}

`multiMatchAny` と同様ですが、任意のパターンがある定数の [編集距離](https://en.wikipedia.org/wiki/Edit_distance) 内で `haystack` に一致すれば 1 を返します。この機能は、[hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) ライブラリの実験的な機能に依存しており、一部の特殊なケースでは遅くなる可能性があります。パフォーマンスは編集距離の値と使用されるパターンに依存しますが、常に非ファジーのバリアントと比較して高価です。

:::note
`multiFuzzyMatch*()` 関数ファミリーは、ハイパースキャンの制約により UTF-8 正規表現をサポートしていません（バイトのシーケンスとして扱われるため）。
:::

**構文**

```sql
multiFuzzyMatchAny(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

`multiFuzzyMatchAny` と同様ですが、定数の編集距離内で `haystack` に一致する任意のインデックスを返します。

**構文**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

`multiFuzzyMatchAny` と同様ですが、定数の編集距離内で `haystack` に一致するすべてのインデックスの配列を、任意の順序で返します。

**構文**

```sql
multiFuzzyMatchAllIndices(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## extract {#extract}

文字列内の正規表現の最初の一致を返します。`haystack` が `pattern` 正規表現に一致しない場合、空の文字列が返されます。

正規表現にキャプチャグループがある場合、この関数は入力文字列に対して最初のキャプチャグループに一致します。

**構文**

```sql
extract(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に従った正規表現。

**返される値**

- `haystack` 文字列における正規表現の最初の一致。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT extract('number: 1, number: 2, number: 3', '\\d+') AS result;
```

結果：

```response
┌─result─┐
│ 1      │
└────────┘
```
## extractAll {#extractall}

文字列内の正規表現のすべての一致の配列を返します。`haystack` が `pattern` 正規表現に一致しない場合、空の文字列が返されます。

サブパターンに関する動作は、関数 [`extract`](#extract) と同じです。

**構文**

```sql
extractAll(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に従った正規表現。

**返される値**

- `haystack` 文字列における正規表現の一致の配列。 [Array](../data-types/array.md)([String](../data-types/string.md))。

**例**

クエリ：

```sql
SELECT extractAll('number: 1, number: 2, number: 3', '\\d+') AS result;
```

結果：

```response
┌─result────────┐
│ ['1','2','3'] │
└───────────────┘
```
## extractAllGroupsHorizontal {#extractallgroupshorizontal}

`haystack` 文字列のすべてのグループを `pattern` 正規表現を使用してマッチします。最初の配列には最初のグループにマッチするすべてのフラグメントが含まれ、2 番目の配列には 2 番目のグループにマッチするフラグメントが含まれます。

この関数は [extractAllGroupsVertical](#extractallgroupsvertical) よりも遅くなります。

**構文**

``` sql
extractAllGroupsHorizontal(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に従った正規表現。グループを含む必要があります。各グループは括弧で囲まれています。`pattern` にグループが含まれていない場合、例外がスローされます。 [String](../data-types/string.md)。

**返される値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列の配列が返されます。
:::

**例**

``` sql
SELECT extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果：

``` text
┌─extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','def','ghi'],['111','222','333']]                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```
## extractGroups {#extractgroups}

与えられた入力文字列に対して、指定された正規表現でもってすべてのグループをマッチさせ、マッチの配列の配列を返します。

**構文**

``` sql
extractGroups(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に従った正規表現。グループを含む必要があります。各グループは括弧で囲まれています。`pattern` にグループが含まれていない場合、例外がスローされます。 [String](../data-types/string.md)。

**返される値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

**例**

``` sql
SELECT extractGroups('hello abc=111 world', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') AS result;
```

結果：

``` text
┌─result────────┐
│ ['abc','111'] │
└───────────────┘
```
## extractAllGroupsVertical {#extractallgroupsvertical}

`haystack` 文字列のすべてのグループを `pattern` 正規表現を使用してマッチします。各配列には、各グループからの一致するフラグメントが含まれます。フラグメントは `haystack` 内の出現順にグループ化されます。

**構文**

``` sql
extractAllGroupsVertical(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に従った正規表現。グループを含む必要があります。各グループは括弧で囲まれています。`pattern` にグループが含まれていない場合、例外がスローされます。 [String](../data-types/string.md)。

**返される値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列が返されます。
:::

**例**

``` sql
SELECT extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果：

``` text
┌─extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','111'],['def','222'],['ghi','333']]                                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
## like {#like}

文字列 `haystack` が LIKE 式 `pattern` に一致するかどうかを返します。

LIKE 式は通常の文字と以下のメタシンボルを含むことができます：

- `%` は任意の数の任意の文字（ゼロ文字を含む）を示します。
- `_` は任意の一文字を示します。
- `\` はリテラル `%`、`_` と `\` をエスケープするために使用します。

一致は UTF-8 に基づいています。たとえば、`_` は UTF-8 の2バイトで表現される Unicode コードポイント `¥` に一致します。

haystack または LIKE 式が無効な UTF-8 の場合、動作は未定義です。

自動的な Unicode 正規化は行われず、必要に応じて [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 関数を使ってください。

リテラル `%`、`_` と `\`（これらは LIKE のメタキャラクターです）に一致させるには、前にバックスラッシュを付けます： `\%`、`\_` および `\\` 。バックスラッシュは `%`、`_` または `\` とは異なる文字の前に付けると特別な意味を失い（すなわち、そのまま解釈されます）、ClickHouse では文字列内のバックスラッシュは [引用する必要がある](../syntax.md#string) ため、実際には `\\%`、`\\_` および `\\\\` と書かなければなりません。

形式が `%needle%` の LIKE 式では、関数は `position` 関数と同じくらい速いです。その他のすべての LIKE 式は内部的に正規表現に変換され、関数 `match` と同様のパフォーマンスで実行されます。

**構文**

```sql
like(haystack, pattern)
```

エイリアス: `haystack LIKE pattern` (演算子)

## notLike {#notlike}

`like` と同じですが、結果を反転します。

エイリアス: `haystack NOT LIKE pattern` (演算子)

## ilike {#ilike}

`like` と同じですが、大文字と小文字を区別しません。

エイリアス: `haystack ILIKE pattern` (演算子)

## notILike {#notilike}

`ilike` と同じですが、結果を反転します。

エイリアス: `haystack NOT ILIKE pattern` (演算子)

## ngramDistance {#ngramdistance}

`haystack` 文字列と `needle` 文字列の間の4-グラム距離を計算します。これには、2つの4-グラムの多重集合の対称差をカウントし、そのカードの合計で正規化します。0から1の間の [Float32](../data-types/float.md/#float32-float64) を返します。結果が小さいほど、文字列は互いに類似しています。

関数 [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive)、[`ngramDistanceUTF8`](#ngramdistanceutf8)、[`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) は、この関数の大文字と小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
ngramDistance(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。 [String literal](../syntax#string)
- `needle`: 2 番目の比較文字列。 [String literal](../syntax#string)

**返される値**

- 2つの文字列の類似性を表す0から1の間の値。[Float32](../data-types/float.md/#float32-float64)

**実装の詳細**

この関数は、定数の `needle` または `haystack` 引数が 32Kb を超えると例外をスローします。非定数の `haystack` または `needle` 引数が 32Kb を超える場合、距離は常に 1 になります。

**例**

2つの文字列が互いに類似しているほど、結果は0に近くなります（同一）。

クエリ：

```sql
SELECT ngramDistance('ClickHouse','ClickHouse!');
```

結果：

```response
0.06666667
```

2つの文字列が互いに似ていないほど、結果は大きくなります。

クエリ：

```sql
SELECT ngramDistance('ClickHouse','House');
```

結果：

```response
0.5555556
```

## ngramDistanceCaseInsensitive {#ngramdistancecaseinsensitive}

[ngramDistance](#ngramdistance) の大文字と小文字を区別しないバリアントを提供します。

**構文**

```sql
ngramDistanceCaseInsensitive(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。 [String literal](../syntax#string)
- `needle`: 2 番目の比較文字列。 [String literal](../syntax#string)

**返される値**

- 2つの文字列の類似性を表す0から1の間の値。[Float32](../data-types/float.md/#float32-float64)

**例**

[ngramDistance](#ngramdistance) ではケースの違いが類似性の値に影響します：

クエリ：

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

結果：

```response
0.71428573
```

[ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive) ではケースが無視されるため、ケースだけが異なる2つの同一の文字列は、現在は低い類似性値を返します：

クエリ：

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

結果：

```response
0
```

## ngramDistanceUTF8 {#ngramdistanceutf8}

[ngramDistance](#ngramdistance) の UTF-8 バリアントを提供します。`needle` と `haystack` の文字列は UTF-8 エンコードされていると仮定されます。

**構文**

```sql
ngramDistanceUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の UTF-8 エンコードされた比較文字列。 [String literal](../syntax#string)
- `needle`: 2 番目の UTF-8 エンコードされた比較文字列。 [String literal](../syntax#string)

**返される値**

- 2つの文字列の類似性を表す0から1の間の値。[Float32](../data-types/float.md/#float32-float64)

**例**

クエリ：

```sql
SELECT ngramDistanceUTF8('abcde','cde');
```

結果：

```response
0.5
```

## ngramDistanceCaseInsensitiveUTF8 {#ngramdistancecaseinsensitiveutf8}

[ngramDistanceUTF8](#ngramdistanceutf8) の大文字と小文字を区別しないバリアントを提供します。

**構文**

```sql
ngramDistanceCaseInsensitiveUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の UTF-8 エンコードされた比較文字列。 [String literal](../syntax#string)
- `needle`: 2 番目の UTF-8 エンコードされた比較文字列。 [String literal](../syntax#string)

**返される値**

- 2つの文字列の類似性を表す0から1の間の値。[Float32](../data-types/float.md/#float32-float64)

**例**

クエリ：

```sql
SELECT ngramDistanceCaseInsensitiveUTF8('abcde','CDE');
```

結果：

```response
0.5
```

## ngramSearch {#ngramsearch}

`ngramDistance` と同じですが、`needle` 文字列と `haystack` 文字列の非対称差を計算します。つまり、needle からの n-gram の数から、共通の n-gram の数を引き、その数を `needle` の n-gram の数で正規化します。0から1の間の [Float32](../data-types/float.md/#float32-float64) を返します。結果が大きいほど、`needle` が `haystack` に含まれる可能性が高くなります。この関数はファジー文字列検索に便利です。関数 [`soundex`](../../sql-reference/functions/string-functions#soundex) も参照してください。

関数 [`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive)、[`ngramSearchUTF8`](#ngramsearchutf8)、[`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8) は、この関数の大文字と小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
ngramSearch(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。 [String literal](../syntax#string)
- `needle`: 2 番目の比較文字列。 [String literal](../syntax#string)

**返される値**

- `needle` が `haystack` に含まれる可能性を示す0から1の間の値。[Float32](../data-types/float.md/#float32-float64)

**実装の詳細**

:::note
UTF-8 バリアントは 3-グラム距離を使用します。これらは完全に公平な n-gram 距離ではありません。2 バイトハッシュを使用して n-gram をハッシュ化し、これらのハッシュテーブル間の（非）対称差を計算します - 衝突が発生する可能性があります。UTF-8 大文字小文字無視形式では、公平な `tolower` 関数を使用せず、各コードポイントバイトの5ビット目（0から始まる）をゼロにし、バイトが複数の場合はゼロビット目の最初のビットをゼロにします。これにより、ラテン文字やほとんどのキリル文字が機能します。
:::

**例**

クエリ：

```sql
SELECT ngramSearch('Hello World','World Hello');
```

結果：

```response
0.5
```

## ngramSearchCaseInsensitive {#ngramsearchcaseinsensitive}

[ngramSearch](#ngramsearch) の大文字と小文字を区別しないバリアントを提供します。

**構文**

```sql
ngramSearchCaseInsensitive(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。 [String literal](../syntax#string)
- `needle`: 2 番目の比較文字列。 [String literal](../syntax#string)

**返される値**

- `needle` が `haystack` に含まれる可能性を示す0から1の間の値。[Float32](../data-types/float.md/#float32-float64)

結果が大きいほど、`needle` が `haystack` に含まれる可能性が高くなります。

**例**

クエリ：

```sql
SELECT ngramSearchCaseInsensitive('Hello World','hello');
```

結果：

```response
1
```

## ngramSearchUTF8 {#ngramsearchutf8}

[ngramSearch](#ngramsearch) の UTF-8 バリアントを提供します。`needle` と `haystack` は UTF-8 エンコードされた文字列であると仮定されます。

**構文**

```sql
ngramSearchUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の UTF-8 エンコードされた比較文字列。 [String literal](../syntax#string)
- `needle`: 2 番目の UTF-8 エンコードされた比較文字列。 [String literal](../syntax#string)

**返される値**

- `needle` が `haystack` に含まれる可能性を示す0から1の間の値。[Float32](../data-types/float.md/#float32-float64)

結果が大きいほど、`needle` が `haystack` に含まれる可能性が高くなります。

**例**

クエリ：

```sql
SELECT ngramSearchUTF8('абвгдеёжз', 'гдеёзд');
```

結果：

```response
0.5
```

## ngramSearchCaseInsensitiveUTF8 {#ngramsearchcaseinsensitiveutf8}

[ngramSearchUTF8](#ngramsearchutf8) の大文字と小文字を区別しないバリアントを提供します。`needle` と `haystack` は UTF-8 エンコードされた文字列であると仮定されます。

**構文**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の UTF-8 エンコードされた比較文字列。 [String literal](../syntax#string)
- `needle`: 2 番目の UTF-8 エンコードされた比較文字列。 [String literal](../syntax#string)

**返される値**

- `needle` が `haystack` に含まれる可能性を示す0から1の間の値。[Float32](../data-types/float.md/#float32-float64)

結果が大きいほど、`needle` が `haystack` に含まれる可能性が高くなります。

**例**

クエリ：

```sql
SELECT ngramSearchCaseInsensitiveUTF8('абвГДЕёжз', 'АбвгдЕЁжз');
```

結果：

```response
0.57142854
```

## countSubstrings {#countsubstrings}

部分文字列 `needle` が文字列 `haystack` に何回現れるかを返します。

関数 [`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive) と [`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8) は、それぞれ大文字小文字を区別しないおよび大文字小文字を区別しない + UTF-8 バリアントを提供します。

**構文**

``` sql
countSubstrings(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `needle` — 検索される部分文字列。 [String](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` 内の位置（1ベース）。 [UInt](../data-types/int-uint.md)。オプションです。

**返される値**

- 出現回数。[UInt64](../data-types/int-uint.md)。

**例**

``` sql
SELECT countSubstrings('aaaa', 'aa');
```

結果：

``` text
┌─countSubstrings('aaaa', 'aa')─┐
│                             2 │
└───────────────────────────────┘
```

`start_pos` 引数を使用した例：

```sql
SELECT countSubstrings('abc___abc', 'abc', 4);
```

結果：

``` text
┌─countSubstrings('abc___abc', 'abc', 4)─┐
│                                      1 │
└────────────────────────────────────────┘
```

## countSubstringsCaseInsensitive {#countsubstringscaseinsensitive}

部分文字列 `needle` が文字列 `haystack` に何回現れるかを返します。ケースは無視されます。

**構文**

``` sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が実行される文字列。 [String](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `needle` — 検索される部分文字列。 [String](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` 内の位置（1ベース）。 [UInt](../data-types/int-uint.md)。オプションです。

**返される値**

- 出現回数。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

``` sql
SELECT countSubstringsCaseInsensitive('AAAA', 'aa');
```

結果：

``` text
┌─countSubstringsCaseInsensitive('AAAA', 'aa')─┐
│                                            2 │
└──────────────────────────────────────────────┘
```

`start_pos` 引数を使った例：

クエリ：

```sql
SELECT countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4);
```

結果：

``` text
┌─countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4)─┐
│                                                           2 │
└─────────────────────────────────────────────────────────────┘
```

## countSubstringsCaseInsensitiveUTF8 {#countsubstringscaseinsensitiveutf8}

部分文字列 `needle` が文字列 `haystack` に何回現れるかを返します。ケースは無視され、`haystack` が UTF8 文字列であると見なされます。

**構文**

``` sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が実行される UTF-8 文字列。 [String](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `needle` — 検索される部分文字列。 [String](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` 内の位置（1ベース）。 [UInt](../data-types/int-uint.md)。オプションです。

**返される値**

- 出現回数。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

``` sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА');
```

結果：

``` text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА')─┐
│                                                                  4 │
└────────────────────────────────────────────────────────────────────┘
```

`start_pos` 引数を使った例：

クエリ：

```sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13);
```

結果：

``` text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13)─┐
│                                                                      2 │
└────────────────────────────────────────────────────────────────────────┘
```

## countMatches {#countmatches}

文字列 `haystack` 内の `pattern` に対する正規表現マッチの数を返します。

**構文**

``` sql
countMatches(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。[String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax)を用いた正規表現。[String](../data-types/string.md)。

**返される値**

- マッチの数。[UInt64](../data-types/int-uint.md)。

**例**

``` sql
SELECT countMatches('foobar.com', 'o+');
```

結果：

``` text
┌─countMatches('foobar.com', 'o+')─┐
│                                2 │
└──────────────────────────────────┘
```

``` sql
SELECT countMatches('aaaa', 'aa');
```

結果：

``` text
┌─countMatches('aaaa', 'aa')────┐
│                             2 │
└───────────────────────────────┘
```

## countMatchesCaseInsensitive {#countmatchescaseinsensitive}

`haystack` 内のパターンに対する正規表現マッチの数を返します。 [`countMatches`](#countmatches) と同様ですが、大文字小文字を無視してマッチします。

**構文**

``` sql
countMatchesCaseInsensitive(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。[String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax)を用いた正規表現。[String](../data-types/string.md)。

**返される値**

- マッチの数。[UInt64](../data-types/int-uint.md)。

**例**

クエリ：

``` sql
SELECT countMatchesCaseInsensitive('AAAA', 'aa');
```

結果：

``` text
┌─countMatchesCaseInsensitive('AAAA', 'aa')────┐
│                                            2 │
└──────────────────────────────────────────────┘
```

## regexpExtract {#regexpextract}

`haystack` の中で、正規表現パターンに一致し、正規表現グループインデックスに対応する最初の文字列を抽出します。

**構文**

``` sql
regexpExtract(haystack, pattern[, index])
```

エイリアス: `REGEXP_EXTRACT(haystack, pattern[, index])`。

**引数**

- `haystack` — 正規表現パターンがマッチする文字列。[String](../data-types/string.md)。
- `pattern` — 文字列、正規表現、定数である必要があります。[String](../data-types/string.md)。
- `index` — 0以上の整数で、デフォルトは1です。どの正規表現グループを抽出するかを表します。[UInt または Int](../data-types/int-uint.md)。オプションです。

**返される値**

`pattern` には複数の正規表現グループが含まれる場合があります。`index` はどの正規表現グループを抽出するかを示します。インデックス0は、正規表現全体にマッチします。[String](../data-types/string.md)。

**例**

``` sql
SELECT
    regexpExtract('100-200', '(\\d+)-(\\d+)', 1),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 2),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 0),
    regexpExtract('100-200', '(\\d+)-(\\d+)');
```

結果：

``` text
┌─regexpExtract('100-200', '(\\d+)-(\\d+)', 1)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 2)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 0)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)')─┐
│ 100                                          │ 200                                          │ 100-200                                      │ 100                                       │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────────────────────┴───────────────────────────────────────────┘
```

## hasSubsequence {#hassubsequence}

`needle` が `haystack` の部分列である場合は1を返し、そうでない場合は0を返します。
文字列の部分列とは、残りの要素の順序を変更することなく、ゼロまたはそれ以上の要素を削除することによって、与えられた文字列から導出できるシーケンスのことです。

**構文**

``` sql
hasSubsequence(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。[String](../data-types/string.md)。
- `needle` — 検索される部分列。[String](../data-types/string.md)。

**返される値**

- `needle` が `haystack` の部分列であれば1、そうでなければ0。[UInt8](../data-types/int-uint.md)。

**例**

クエリ：

``` sql
SELECT hasSubsequence('garbage', 'arg');
```

結果：

``` text
┌─hasSubsequence('garbage', 'arg')─┐
│                                1 │
└──────────────────────────────────┘
```

## hasSubsequenceCaseInsensitive {#hassubsequencecaseinsensitive}

[hasSubsequence](#hassubsequence) と同様ですが、大文字小文字を無視して検索します。

**構文**

``` sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。[String](../data-types/string.md)。
- `needle` — 検索される部分列。[String](../data-types/string.md)。

**返される値**

- `needle` が `haystack` の部分列であれば1、そうでなければ0。[UInt8](../data-types/int-uint.md)。

**例**

クエリ：

``` sql
SELECT hasSubsequenceCaseInsensitive('garbage', 'ARG');
```

結果：

``` text
┌─hasSubsequenceCaseInsensitive('garbage', 'ARG')─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```

## hasSubsequenceUTF8 {#hassubsequenceutf8}

[hasSubsequence](#hassubsequence) と同様ですが、`haystack` と `needle` は UTF-8 エンコードされた文字列であると仮定されます。

**構文**

``` sql
hasSubsequenceUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。UTF-8 エンコードされた [String](../data-types/string.md)。
- `needle` — 検索される部分列。UTF-8 エンコードされた [String](../data-types/string.md)。

**返される値**

- `needle` が `haystack` の部分列であれば1、そうでなければ0。[UInt8](../data-types/int-uint.md)。

クエリ：

**例**

``` sql
select hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система');
```

結果：

``` text
┌─hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система')─┐
│                                                                                         1 │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

## hasSubsequenceCaseInsensitiveUTF8 {#hassubsequencecaseinsensitiveutf8}

[hasSubsequenceUTF8](#hassubsequenceutf8) と同様ですが、大文字小文字を無視して検索します。

**構文**

``` sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。UTF-8 エンコードされた [String](../data-types/string.md)。
- `needle` — 検索される部分列。UTF-8 エンコードされた [String](../data-types/string.md)。

**返される値**

- `needle` が `haystack` の部分列であれば1、そうでなければ0。[UInt8](../data-types/int-uint.md)。

**例**

クエリ：

``` sql
select hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА');
```

結果：

``` text
┌─hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА')─┐
│                                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## hasToken {#hastoken}

指定されたトークンが haystack に存在する場合は 1 を、そうでない場合は 0 を返します。

**構文**

```sql
hasToken(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。[String](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2つの非アルファベット ASCII 文字の間にある最大の長さの部分文字列（または haystack の境界）。

**返される値**

- トークンが haystack に存在する場合は 1、そうでない場合は 0。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列である必要があります。tokenbf_v1 インデックスの特化に対応しています。

**例**

クエリ：

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```

## hasTokenOrNull {#hastokenornull}

指定されたトークンが存在する場合は 1 を返し、存在しない場合は 0 を返し、トークンが不正な形式の場合は null を返します。

**構文**

```sql
hasTokenOrNull(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。[String](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2つの非アルファベット ASCII 文字の間にある最大の長さの部分文字列（または haystack の境界）。

**返される値**

- トークンが haystack に存在する場合は 1、存在しない場合は 0、不正な形式の場合は null を返します。

**実装の詳細**

トークンは定数文字列である必要があります。tokenbf_v1 インデックスの特化に対応しています。

**例**

`hasToken` が不正なトークンに対してエラーをスローする場合、`hasTokenOrNull` は不正なトークンに対して null を返します。

クエリ：

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```

## hasTokenCaseInsensitive {#hastokencaseinsensitive}

指定されたトークンが haystack に存在する場合は 1 を、そうでない場合は 0 を返します。大文字小文字を区別しません。

**構文**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。[String](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2つの非アルファベット ASCII 文字の間にある最大の長さの部分文字列（または haystack の境界）。

**返される値**

- トークンが haystack に存在する場合は 1、そうでない場合は 0。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列である必要があります。tokenbf_v1 インデックスの特化に対応しています。

**例**

クエリ：

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```

## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitivelornull}

指定されたトークンが haystack に存在する場合は 1 を返し、存在しない場合は 0 を返し、不正な形式の場合は null を返します。大文字小文字を区別しません。

**構文**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。[String](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2つの非アルファベット ASCII 文字の間にある最大の長さの部分文字列（または haystack の境界）。

**返される値**

- トークンが haystack に存在する場合は 1、トークンが存在しない場合は 0、不正な形式の場合は [`null`](../data-types/nullable.md) を返します。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列である必要があります。tokenbf_v1 インデックスの特化に対応しています。

**例**

`hasTokenCaseInsensitive` が不正なトークンに対してエラーをスローする場合、`hasTokenCaseInsensitiveOrNull` は不正なトークンに対して null を返します。

クエリ：

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```
