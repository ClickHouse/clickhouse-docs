---
slug: '/sql-reference/functions/string-search-functions'
sidebar_position: 160
sidebar_label: '文字列内の検索'
---


# 文字列内の検索に関する関数

このセクションのすべての関数は、デフォルトで大文字と小文字を区別して検索を行います。大文字と小文字を区別しない検索は通常、別の関数バリアントで提供されます。

:::note
大文字と小文字を区別しない検索は、英語の小文字と大文字のルールに従います。例えば、英語では大文字の `I` は `I` ですが、トルコ語では `İ` です。他の言語に対する結果は予期しないものになる場合があります。
:::

このセクションの関数も、検索する文字列（このセクションでは `haystack` と呼ばれます）と検索する文字列（このセクションでは `needle` と呼ばれます）がシングルバイトエンコードのテキストであると仮定しています。この仮定が破られると、例外はスローされず、結果は不定となります。UTF-8エンコードされた文字列での検索は通常、別の関数バリアントで提供されます。同様に、UTF-8関数バリアントが使用され、入力文字列がUTF-8エンコードのテキストでない場合、例外はスローされず、結果は不定です。自動Unicode正規化は行われませんが、これを行うために [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 関数を使用できます。

[一般的な文字列関数](string-functions.md) と [文字列内の置換関数](string-replace-functions.md) は別々に説明されています。

## position {#position}

文字列 `haystack` における部分文字列 `needle` の位置（バイト単位で、1から始まる）を返します。

**構文**

``` sql
position(haystack, needle[, start_pos])
```

エイリアス:
- `position(needle IN haystack)`

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md) または [Enum](../data-types/string.md)。
- `needle` — 検索対象の部分文字列。 [String](../data-types/string.md)。
- `start_pos` – 検索を開始する `haystack` 内の位置（1ベース）。 [UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 部分文字列が見つかった場合、1からカウントしたバイトの開始位置。 [UInt64](../data-types/int-uint.md)。
- 部分文字列が見つからなかった場合は 0。 [UInt64](../data-types/int-uint.md)。

部分文字列 `needle` が空の場合、これらのルールが適用されます：
- `start_pos` が指定されなかった場合: `1` を返す
- `start_pos = 0`: `1` を返す
- `start_pos >= 1` かつ `start_pos <= length(haystack) + 1`: `start_pos` を返す
- その他: `0` を返す

同じルールは、関数 `locate`、`positionCaseInsensitive`、`positionUTF8` および `positionCaseInsensitiveUTF8` にも適用されます。

**例**

クエリ:

``` sql
SELECT position('Hello, world!', '!');
```

結果:

``` text
┌─position('Hello, world!', '!')─┐
│                             13 │
└────────────────────────────────┘
```

`start_pos` 引数を使用した例:

クエリ:

``` sql
SELECT
    position('Hello, world!', 'o', 1),
    position('Hello, world!', 'o', 7)
```

結果:

``` text
┌─position('Hello, world!', 'o', 1)─┬─position('Hello, world!', 'o', 7)─┐
│                                 5 │                                 9 │
└───────────────────────────────────┴───────────────────────────────────┘
```

`needle IN haystack` 構文の例:

クエリ:

```sql
SELECT 6 = position('/' IN s) FROM (SELECT 'Hello/World' AS s);
```

結果:

```text
┌─equals(6, position(s, '/'))─┐
│                           1 │
└─────────────────────────────┘
```

空の `needle` 部分文字列を使用した例:

クエリ:

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

結果:

``` text
┌─position('abc', '')─┬─position('abc', '', 0)─┬─position('abc', '', 1)─┬─position('abc', '', 2)─┬─position('abc', '', 3)─┬─position('abc', '', 4)─┬─position('abc', '', 5)─┐
│                   1 │                      1 │                      1 │                      2 │                      3 │                      4 │                      0 │
└─────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘
```

## locate {#locate}

[位置](#position) と似ていますが、引数 `haystack` と `locate` が逆になっています。

この関数の動作は、ClickHouseのバージョンに依存します:
- バージョン < v24.3 では、`locate` は関数 `position` のエイリアスで、引数 `(haystack, needle[, start_pos])` を受け入れました。
- バージョン >= 24.3 では、`locate` は独立した関数（MySQLとの互換性を向上させるため）で、引数 `(needle, haystack[, start_pos])` を受け入れます。以前の動作は、設定 [function_locate_has_mysql_compatible_argument_order = false](/operations/settings/settings#function_locate_has_mysql_compatible_argument_order) を使用して復元できます。

**構文**

``` sql
locate(needle, haystack[, start_pos])
```

## positionCaseInsensitive {#positioncaseinsensitive}

[位置](#position) の大文字と小文字を区別しない不変版です。

**例**

クエリ:

``` sql
SELECT positionCaseInsensitive('Hello, world!', 'hello');
```

結果:

``` text
┌─positionCaseInsensitive('Hello, world!', 'hello')─┐
│                                                 1 │
└───────────────────────────────────────────────────┘
```

## positionUTF8 {#positionutf8}

[位置](#position) と似ていますが、`haystack` と `needle` がUTF-8エンコードされた文字列であることを前提としています。

**例**

関数 `positionUTF8` は、文字 `ö`（二点の部分で表現）が単一のUnicodeコードポイントとして正しくカウントされます:

クエリ:

``` sql
SELECT positionUTF8('Motörhead', 'r');
```

結果:

``` text
┌─position('Motörhead', 'r')─┐
│                          5 │
└────────────────────────────┘
```

## positionCaseInsensitiveUTF8 {#positioncaseinsensitiveutf8}

[位置UTF8](#positionutf8) と似ていますが、大文字と小文字を区別しない検索を行います。

## multiSearchAllPositions {#multisearchallpositions}

[位置](#position) と似ていますが、`haystack` 文字列内の複数の `needle` 部分文字列の位置（バイト単位で、1から始まる）を返します。

:::note
すべての `multiSearch*()` 関数は、最大 2<sup>8</sup> の needles をサポートします。
:::

**構文**

``` sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 部分文字列が見つかった場合の、1からカウントしたバイトの開始位置の配列。
- 部分文字列が見つからなかった場合は 0。

**例**

クエリ:

``` sql
SELECT multiSearchAllPositions('Hello, World!', ['hello', '!', 'world']);
```

結果:

``` text
┌─multiSearchAllPositions('Hello, World!', ['hello', '!', 'world'])─┐
│ [0,13,0]                                                          │
└───────────────────────────────────────────────────────────────────┘
```

## multiSearchAllPositionsCaseInsensitive {#multisearchallpositionscaseinsensitive}

[multiSearchAllPositions](#multisearchallpositions) と似ていますが、大文字と小文字を区別しません。

**構文**

```sql
multiSearchAllPositionsCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 部分文字列が見つかった場合の、1からカウントしたバイトの開始位置の配列（部分文字列が見つかった場合）。
- 0 は部分文字列が見つからなかった場合。

**例**

クエリ:

```sql
SELECT multiSearchAllPositionsCaseInsensitive('ClickHouse',['c','h']);
```

結果:

```response
["1","6"]
```

## multiSearchAllPositionsUTF8 {#multisearchallpositionsutf8}

[multiSearchAllPositions](#multisearchallpositions) と似ていますが、`haystack` と `needle` の部分文字列がUTF-8エンコードされた文字列であることを前提としています。

**構文**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8エンコードされた文字列。 [String](../data-types/string.md)。
- `needle` — 検索されるUTF-8エンコードされた部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 部分文字列が見つかった場合の、1からカウントしたバイトの開始位置の配列（部分文字列が見つかった場合）。
- 0 は部分文字列が見つからなかった場合。

**例**

`ClickHouse` をUTF-8文字列として与え、`C` (`\x43`) と `H` (`\x48`) の位置を見つけます。

クエリ:

```sql
SELECT multiSearchAllPositionsUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

結果:

```response
["1","6"]
```

## multiSearchAllPositionsCaseInsensitiveUTF8 {#multisearchallpositionscaseinsensitiveutf8}

[multiSearchAllPositionsUTF8](#multisearchallpositionsutf8) と似ていますが、大文字と小文字を区別しません。

**構文**

```sql
multiSearchAllPositionsCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8エンコードされた文字列。 [String](../data-types/string.md)。
- `needle` — 各UTF-8エンコードされた部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 部分文字列が見つかった場合の、1からカウントしたバイトの開始位置の配列（部分文字列が見つかった場合）。
- 0 は部分文字列が見つからなかった場合。

**例**

`ClickHouse` をUTF-8文字列として与え、`c` (`\x63`) と `h` (`\x68`) の位置を見つけます。

クエリ:

```sql
SELECT multiSearchAllPositionsCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x63','\x68']);
```

結果:

```response
["1","6"]
```

## multiSearchFirstPosition {#multisearchfirstposition}

[`position`](#position) と似ていますが、`haystack` 文字列内の複数の `needle` 文字列の中で、最も左のオフセットを返します。

関数 [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive)、[`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) と [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) は、この関数の大文字と小文字を区別しないおよび/またはUTF-8バリアントを提供します。

**構文**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 各部分文字列。 [Array](../data-types/array.md)。

**返される値**

- `haystack` 文字列内で、複数の `needle` 文字列の中で最も左のオフセット。
- 一致がない場合は 0。

**例**

クエリ:

```sql
SELECT multiSearchFirstPosition('Hello World',['llo', 'Wor', 'ld']);
```

結果:

```response
3
```

## multiSearchFirstPositionCaseInsensitive {#multisearchfirstpositioncaseinsensitive}

[`multiSearchFirstPosition`](#multisearchfirstposition) と似ていますが、大文字と小文字を区別しません。

**構文**

```sql
multiSearchFirstPositionCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 各部分文字列。 [Array](../data-types/array.md)。

**返される値**

- `haystack` 文字列内で、複数の `needle` 文字列の中で最も左のオフセット。
- 一致がない場合は 0。

**例**

クエリ:

```sql
SELECT multiSearchFirstPositionCaseInsensitive('HELLO WORLD',['wor', 'ld', 'ello']);
```

結果:

```response
2
```

## multiSearchFirstPositionUTF8 {#multisearchfirstpositionutf8}

[`multiSearchFirstPosition`](#multisearchfirstposition) と似ていますが、`haystack` と `needle` がUTF-8文字列であることを前提としています。

**構文**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — UTF-8文字列で、検索が行われる。 [String](../data-types/string.md)。
- `needle` — 各UTF-8部分文字列。 [Array](../data-types/array.md)。

**返される値**

- `haystack` 文字列内で、複数の `needle` 文字列の中で最も左のオフセット。
- 一致がない場合は 0。

**例**

UTF-8文字列 `hello world` で、与えられたニードルの中で一致するものの最も左のオフセットを見つけます。

クエリ:

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

結果:

```response
2
```

## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

[`multiSearchFirstPosition`](#multisearchfirstposition) と似ていますが、`haystack` と `needle` がUTF-8文字列であり、大文字と小文字を区別しません。

**構文**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — UTF-8文字列で、検索が行われる。 [String](../data-types/string.md)。
- `needle` — 各UTF-8部分文字列。 [Array](../data-types/array.md)。

**返される値**

- `haystack` 文字列内で、複数の `needle` 文字列の中で最も左のオフセット（大文字と小文字を区別しない）。
- 一致がない場合は 0。

**例**

UTF-8文字列 `HELLO WORLD` で、与えられたニードルの中で一致するものの最も左のオフセットを見つけます。

クエリ:

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

結果:

```response
2
```

## multiSearchFirstIndex {#multisearchfirstindex}

`haystack` 文字列内で最も左に見つかったニードルのインデックス `i`（1から始まる）を返します。一致がない場合は 0 を返します。

関数 [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive)、[`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8)、および [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) は、大文字と小文字を区別しないおよび/またはUTF-8バリアントを提供します。

**構文**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 各部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 最も左に見つかったニードルのインデックス `i`（1から始まる）。一致がない場合は 0。

**例**

クエリ:

```sql
SELECT multiSearchFirstIndex('Hello World',['World','Hello']);
```

結果:

```response
1
```

## multiSearchFirstIndexCaseInsensitive {#multisearchfirstindexcaseinsensitive}

最も左に見つかったニードルのインデックス `i`（1から始まる）を、大文字と小文字を区別せずに返します。

**構文**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 各部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 最も左に見つかったニードルのインデックス `i`（1から始まる）。一致がない場合は 0。

**例**

クエリ:

```sql
SELECT multiSearchFirstIndexCaseInsensitive('hElLo WoRlD',['World','Hello']);
```

結果:

```response
1
```

## multiSearchFirstIndexUTF8 {#multisearchfirstindexutf8}

最も左に見つかったニードルのインデックス `i`（1から始まる）を、`haystack` と `needle` がUTF-8エンコードの文字列であることを前提に返します。

**構文**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — UTF-8文字列で、検索が行われる。 [String](../data-types/string.md)。
- `needle` — 各UTF-8部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 最も左に見つかったニードルのインデックス `i`（1から始まる）。一致がない場合は 0。

**例**

UTF-8文字列 `Hello World` を与え、UTF-8文字列 `Hello` と `World` の最初のインデックスを見つけます。

クエリ:

```sql
SELECT multiSearchFirstIndexUTF8('\x48\x65\x6c\x6c\x6f\x20\x57\x6f\x72\x6c\x64',['\x57\x6f\x72\x6c\x64','\x48\x65\x6c\x6c\x6f']);
```

結果:

```response
1
```

## multiSearchFirstIndexCaseInsensitiveUTF8 {#multisearchfirstindexcaseinsensitiveutf8}

最も左に見つかったニードルのインデックス `i`（1から始まる）を、`haystack` と `needle` がUTF-8エンコードされた文字列であると仮定して、大文字と小文字を区別せずに返します。

**構文**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — UTF-8文字列で、検索が行われる。 [String](../data-types/string.md)。
- `needle` — 各UTF-8部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 最も左に見つかったニードルのインデックス `i`（1から始まる）。一致がない場合は 0。

**例**

UTF-8文字列 `HELLO WORLD` を与え、UTF-8文字列 `hello` と `world` の最初のインデックスを見つけます。

クエリ:

```sql
SELECT multiSearchFirstIndexCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['\x68\x65\x6c\x6c\x6f','\x77\x6f\x72\x6c\x64']);
```

結果:

```response
1
```

## multiSearchAny {#multisearchany}

少なくとも1つの文字列 `needle<sub>i</sub>` が文字列 `haystack` と一致する場合は 1 を返し、一致しない場合は 0 を返します。

関数 [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive)、[`multiSearchAnyUTF8`](#multisearchanyutf8) および [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) は、大文字と小文字を区別しないおよび/またはUTF-8バリアントを提供します。

**構文**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 各部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 一致があった場合は 1。
- 一致がなかった場合は 0。

**例**

クエリ:

```sql
SELECT multiSearchAny('ClickHouse',['C','H']);
```

結果:

```response
1
```

## multiSearchAnyCaseInsensitive {#multisearchanycaseinsensitive}

[multiSearchAny](#multisearchany) と似ていますが、大文字と小文字を区別しません。

**構文**

```sql
multiSearchAnyCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 各部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 大文字と小文字を区別せずに一致があった場合は 1。
- 大文字と小文字を区別しない一致がなかった場合は 0。

**例**

クエリ:

```sql
SELECT multiSearchAnyCaseInsensitive('ClickHouse',['c','h']);
```

結果:

```response
1
```

## multiSearchAnyUTF8 {#multisearchanyutf8}

[multiSearchAny](#multisearchany) と似ていますが、`haystack` と `needle` の部分文字列がUTF-8エンコードされた文字列であることを前提としています。

**構文**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — UTF-8文字列で、検索が行われる。 [String](../data-types/string.md)。
- `needle` — 各UTF-8部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 一致があった場合は 1。
- 一致がなかった場合は 0。

**例**

`ClickHouse` をUTF-8文字列として与え、`C` (`\x43`) または `H` (`\x48`) の文字が単語の中にあるかを確認します。

クエリ:

```sql
SELECT multiSearchAnyUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

結果:

```response
1
```

## multiSearchAnyCaseInsensitiveUTF8 {#multisearchanycaseinsensitiveutf8}

[multiSearchAnyUTF8](#multisearchanyutf8) と似ていますが、大文字と小文字を区別しません。

**構文**

```sql
multiSearchAnyCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — UTF-8文字列で、検索が行われる。 [String](../data-types/string.md)。
- `needle` — 各UTF-8部分文字列。 [Array](../data-types/array.md)。

**返される値**

- 一致があった場合は 1。
- 一致がなかった場合は 0。

**例**

`ClickHouse` をUTF-8文字列として与え、文字 `h` (`\x68`) が単語の中にあるかを、大文字と小文字を区別せずに確認します。

クエリ:

```sql
SELECT multiSearchAnyCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x68']);
```

結果:

```response
1
```

## match {#match}

文字列 `haystack` が正規表現 `pattern` に一致するかどうかを返します。[re2正規表現構文](https://github.com/google/re2/wiki/Syntax) に基づいています。

マッチングはUTF-8に基づいています。例えば、`.` はUTF-8で2バイトで表現されるUnicodeコードポイント `¥` に一致します。正規表現にはNULLバイトが含まれてはいけません。`haystack` または `pattern` が有効なUTF-8でない場合、動作は不定です。

re2のデフォルトの動作とは異なり、`.` は改行に一致します。これを無効にするには、パターンの前に `(?-s)` を追加してください。

文字列内の部分文字列を検索したいだけの場合は、関数 [like](#like) または [position](#position) を使用することができます。これらはこの関数よりも速く動作します。

**構文**

```sql
match(haystack, pattern)
```

エイリアス: `haystack REGEXP pattern operator`

## multiMatchAny {#multimatchany}

`match` のように、パターンの1つでも一致すれば 1 を返し、そうでなければ 0 を返します。

:::note
`multi[Fuzzy]Match*()` ファミリーの関数は、(Vectorscan)[https://github.com/VectorCamp/vectorscan] ライブラリを使用します。そのため、ClickHouse がベクトルスキャンのサポートでコンパイルされている場合のみ有効です。

すべてのハイパースキャンを使用する関数を無効にするには、設定 `SET allow_hyperscan = 0;` を使用します。

ベクトルスキャンの制約により、`haystack` 文字列の長さは 2<sup>32</sup> バイト未満でなければなりません。

ハイパースキャンは、一般的に正規表現のサービス拒否攻撃（ReDoS）の脆弱性があります（例えば、(ここ)[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova]、(ここ)[https://doi.org/10.1007/s10664-021-10033-1] および (ここ)[https://doi.org/10.1145/3236024.3236027] を参照してください）。ユーザーは、提供されたパターンを慎重に確認することを推奨します。
:::

文字列内の複数の部分文字列を検索したいだけの場合は、関数 [multiSearchAny](#multisearchany) を使用することができます。これらはこの関数よりも速く動作します。

**構文**

```sql
multiMatchAny(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiMatchAnyIndex {#multimatchanyindex}

`multiMatchAny` のように、`haystack` と一致する任意のインデックスを返します。

**構文**

```sql
multiMatchAnyIndex(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiMatchAllIndices {#multimatchallindices}

`multiMatchAny` のように、`haystack` に対して一致するすべてのインデックスの配列を返します。

**構文**

```sql
multiMatchAllIndices(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiFuzzyMatchAny {#multifuzzymatchany}

`multiMatchAny` のように、任意のパターンが恒常的な[編集距離](https://en.wikipedia.org/wiki/Edit_distance)内で `haystack` に一致する場合は 1 を返します。この関数は[ハイパースキャン](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching)ライブラリの実験的な機能に依存しており、一部の複雑なケースでは遅くなる可能性があります。パフォーマンスは編集距離の値や使用するパターンによって変わりますが、常に非ファジー変種と比較して高価です。

:::note
`multiFuzzyMatch*()` 関数ファミリーは、ハイパースキャンの制約により、UTF-8正規表現をサポートしていません（バイト列として扱います）。
:::

**構文**

```sql
multiFuzzyMatchAny(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

`multiFuzzyMatchAny` のように、恒常的な編集距離内で `haystack` に一致する任意のインデックスを返します。

**構文**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

`multiFuzzyMatchAny` のように、恒常的な編集距離内で `haystack` に一致するすべてのインデックスの配列を返します。

**構文**

```sql
multiFuzzyMatchAllIndices(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## extract {#extract}

文字列内の正規表現の最初の一致を返します。
`haystack` が `pattern` 正規表現に一致しない場合、空の文字列が返されます。 

正規表現にキャプチャグループがある場合、この関数は入力文字列を最初のキャプチャグループに対して一致させます。

**構文**

```sql
extract(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax) を用いた正規表現。

**返される値**

- `haystack` 文字列内の正規表現の最初の一致。 [String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT extract('number: 1, number: 2, number: 3', '\\d+') AS result;
```

結果:

```response
┌─result─┐
│ 1      │
└────────┘
```

## extractAll {#extractall}

文字列内の正規表現のすべての一致の配列を返します。`haystack` が `pattern` 正規表現に一致しない場合、空の文字列が返されます。

サブパターンに関する動作は、関数 [`extract`](#extract) と同様です。

**構文**

```sql
extractAll(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax) を用いた正規表現。

**返される値**

- `haystack` 文字列内の正規表現の一致の配列。 [Array](../data-types/array.md) ([String](../data-types/string.md))。

**例**

クエリ:

```sql
SELECT extractAll('number: 1, number: 2, number: 3', '\\d+') AS result;
```

結果:

```response
┌─result────────┐
│ ['1','2','3'] │
└───────────────┘
```

## extractAllGroupsHorizontal {#extractallgroupshorizontal}

`haystack` 文字列を `pattern` 正規表現を用いてマッチさせます。最初の配列には最初のグループに一致するすべてのフラグメントが含まれ、次の配列には2番目のグループに一致するものが含まれます。

この関数は、[extractAllGroupsVertical](#extractallgroupsvertical) よりも遅くなります。

**構文**

``` sql
extractAllGroupsHorizontal(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax) を用いた正規表現。グループを含み、各グループが括弧で囲まれている必要があります。`pattern` にグループが含まれていない場合は例外がスローされます。 [String](../data-types/string.md)。

**返される値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列が返されます。
:::

**例**

``` sql
SELECT extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果:

``` text
┌─extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','def','ghi'],['111','222','333']]                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## extractGroups {#extractgroups}

入力文字列を与えられた正規表現でマッチさせ、一致の配列の配列を返します。

**構文**

``` sql
extractGroups(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax) を用いた正規表現。グループを含み、各グループが括弧で囲まれている必要があります。`pattern` にグループが含まれていない場合は例外がスローされます。 [String](../data-types/string.md)。

**返される値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

**例**

``` sql
SELECT extractGroups('hello abc=111 world', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') AS result;
```

結果:

``` text
┌─result────────┐
│ ['abc','111'] │
└───────────────┘
```

## extractAllGroupsVertical {#extractallgroupsvertical}

`haystack` 文字列を `pattern` 正規表現を用いてマッチさせます。すべてのグループからの一致フラグメントを含む配列の配列を返します。フラグメントは、`haystack` 内での出現順にグループ化されます。

**構文**

``` sql
extractAllGroupsVertical(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax) を用いた正規表現。グループを含み、各グループが括弧で囲まれている必要があります。`pattern` にグループが含まれていない場合は例外がスローされます。 [String](../data-types/string.md)。

**返される値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列が返されます。
:::

**例**

``` sql
SELECT extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果:

``` text
┌─extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','111'],['def','222'],['ghi','333']]                                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## like {#like}

文字列 `haystack` が LIKE 表現 `pattern` に一致するかどうかを返します。

LIKE 表現には通常の文字と以下のメタシンボルを含めることができます：

- `%` は任意の数の任意の文字を示します（ゼロ文字を含む）。
- `_` は任意の1文字を示します。
- `\` はリテラル `%`、`_` および `\` をエスケープするために使用されます。

一致は UTF-8 に基づいています。たとえば、`_` は Unicode コードポイント `¥` に一致し、これは UTF-8 で 2 バイトで表現されます。

haystack または LIKE 表現が有効な UTF-8 でない場合、動作は未定義です。

自動的な Unicode 正規化は行われず、[normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 関数を使用できます。

リテラルの `%`、`_` および `\`（LIKE メタ文字）に一致させるためには、前にバックスラッシュを追加します：`\%`、`\_` および `\\`。
バックスラッシュが `%`、`_` または `\` 以外の文字の前に置かれている場合、それは特別な意味を失い（つまり、リテラルとして解釈されます）、ClickHouse では文字列内のバックスラッシュも [クオート処理が必要です](../syntax.md#string)、したがって実際には `\\%`、`\\_` および `\\\\` と書く必要があります。

`%needle%` の形の LIKE 表現では、この関数は `position` 関数と同じくらい速いです。
他のすべての LIKE 表現は内部的に正規表現に変換され、`match` 関数に類似したパフォーマンスで実行されます。

**構文**

```sql
like(haystack, pattern)
```

エイリアス： `haystack LIKE pattern` （演算子）

## notLike {#notlike}

`like` のように動作しますが、結果を否定します。

エイリアス： `haystack NOT LIKE pattern` （演算子）

## ilike {#ilike}

`like` のように動作しますが、大文字と小文字を区別せずに検索します。

エイリアス： `haystack ILIKE pattern` （演算子）

## notILike {#notilike}

`ilike` のように動作しますが、結果を否定します。

エイリアス： `haystack NOT ILIKE pattern` （演算子）

## ngramDistance {#ngramdistance}

`haystack` 文字列と `needle` 文字列の間の 4 グラム距離を計算します。これにより、2 つの 4 グラムの多集合間の対称差をカウントし、その数を両者の基数の合計で正規化します。0 と 1 の間の [Float32](/sql-reference/data-types/float) を返します。結果が小さいほど、文字列は互いに類似しています。

関数 [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive)、[`ngramDistanceUTF8`](#ngramdistanceutf8)、[`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) はこの関数の大文字と小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
ngramDistance(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。 [文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の比較文字列。 [文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 0 と 1 の間の値で、2 つの文字列の類似性を表します。 [Float32](/sql-reference/data-types/float)

**実装の詳細**

この関数は、定数 `needle` または `haystack` 引数が 32Kb より大きい場合に例外をスローします。非定数の `haystack` または `needle` 引数が 32Kb より大きい場合、距離は常に 1 になります。

**例**

2 つの文字列が互いに類似しているほど、結果は 0 に近づきます（同一）。

クエリ：

```sql
SELECT ngramDistance('ClickHouse','ClickHouse!');
```

結果：

```response
0.06666667
```

2 つの文字列が互いに類似していないほど、結果は大きくなります。

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

- `haystack`: 最初の比較文字列。 [文字リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の比較文字列。 [文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 0 と 1 の間の値で、2 つの文字列の類似性を表します。 [Float32](/sql-reference/data-types/float)

**例**

[ngramDistance](#ngramdistance) では、大文字と小文字の違いが類似性の値に影響します：

クエリ：

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

結果：

```response
0.71428573
```

[ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive) では、大文字と小文字は無視されるため、ケースのみが異なる2つの同一の文字列は、類似性の値が低くなります：

クエリ：

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

結果：

```response
0
```

## ngramDistanceUTF8 {#ngramdistanceutf8}

[ngramDistance](#ngramdistance) の UTF-8 バリアントを提供します。`needle` と `haystack` 文字列が UTF-8 エンコードされた文字列であると仮定します。

**構文**

```sql
ngramDistanceUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の UTF-8 エンコード比較文字列。 [文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の UTF-8 エンコード比較文字列。 [文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 0 と 1 の間の値で、2 つの文字列の類似性を表します。 [Float32](/sql-reference/data-types/float)

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

- `haystack`: 最初の UTF-8 エンコード比較文字列。 [文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の UTF-8 エンコード比較文字列。 [文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 0 と 1 の間の値で、2 つの文字列の類似性を表します。 [Float32](/sql-reference/data-types/float)

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

`ngramDistance` のように動作しますが、`needle` 文字列と `haystack` 文字列の非対称差を計算します。すなわち、needle からの n-グラムの数を、共通の n-グラム数から引いたものを、`needle` の n-グラムの数で正規化します。0 と 1 の間の [Float32](/sql-reference/data-types/float) を返します。結果が大きいほど、`needle` が `haystack` に存在する可能性が高くなります。この関数はファジー文字列検索に役立ちます。また、関数 [`soundex`](../../sql-reference/functions/string-functions#soundex) も参照してください。

関数 [`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive)、[`ngramSearchUTF8`](#ngramsearchutf8)、[`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8) はこの関数の大文字と小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
ngramSearch(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。 [文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の比較文字列。 [文字列リテラル](/sql-reference/syntax#string)

**返される値**

- `needle` が `haystack` に存在する可能性を示す0から1の間の値。 [Float32](/sql-reference/data-types/float)

**実装の詳細**

:::note
UTF-8 バリアントは 3-グラム距離を使用します。これは完全に公正な n-グラム距離ではありません。n-グラムをハッシュ化するために 2 バイトのハッシュを使用し、これらのハッシュテーブル間の（非）対称の差を計算します。衝突が発生する可能性があります。UTF-8 の大文字と小文字を区別しない形式では、公正な `tolower` 関数を使用していません。1 バイト以上のバイトがある場合は、各コードポイントバイトの 5 番目のビット（0 から始まる）とゼロバイトの最初のビットをゼロにします。これはラテン文字とほとんどすべてのキリル文字に対して機能します。
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

- `haystack`: 最初の比較文字列。 [文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の比較文字列。 [文字列リテラル](/sql-reference/syntax#string)

**返される値**

- `needle` が `haystack` に存在する可能性を示す0から1の間の値。 [Float32](/sql-reference/data-types/float)

結果が大きいほど、`needle` が `haystack` に存在する可能性が高くなります。

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

[ngramSearch](#ngramsearch) の UTF-8 バリアントを提供し、`needle` と `haystack` が UTF-8 エンコードされた文字列であることを想定しています。

**構文**

```sql
ngramSearchUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の UTF-8 エンコード比較文字列。 [文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の UTF-8 エンコード比較文字列。 [文字列リテラル](/sql-reference/syntax#string)

**返される値**

- `needle` が `haystack` に存在する可能性を示す0から1の間の値。 [Float32](/sql-reference/data-types/float)

結果が大きいほど、`needle` が `haystack` に存在する可能性が高くなります。

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

[ngramSearchUTF8](#ngramsearchutf8) の大文字と小文字を区別しないバリアントを提供します。

**構文**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の UTF-8 エンコード比較文字列。 [文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の UTF-8 エンコード比較文字列。 [文字列リテラル](/sql-reference/syntax#string)

**返される値**

- `needle` が `haystack` に存在する可能性を示す0から1の間の値。 [Float32](/sql-reference/data-types/float)

結果が大きいほど、`needle` が `haystack` に存在する可能性が高くなります。

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

部分文字列 `needle` が文字列 `haystack` に出現する回数を返します。

関数 [`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive) および [`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8) はそれぞれ大文字と小文字を区別しないおよび大文字と小文字を区別せず、UTF-8 バリアントを提供します。

**構文**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が実行される文字列。 [文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `needle` — 検索される部分文字列。 [文字列](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` 中の位置（1 から始まります）。 [UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 出現回数。 [UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT countSubstrings('aaaa', 'aa');
```

結果：

```text
┌─countSubstrings('aaaa', 'aa')─┐
│                             2 │
└───────────────────────────────┘
```

`start_pos` 引数を使用した例：

```sql
SELECT countSubstrings('abc___abc', 'abc', 4);
```

結果：

```text
┌─countSubstrings('abc___abc', 'abc', 4)─┐
│                                      1 │
└────────────────────────────────────────┘
```

## countSubstringsCaseInsensitive {#countsubstringscaseinsensitive}

部分文字列 `needle` が文字列 `haystack` に出現する回数を返します。大文字と小文字を無視します。

**構文**

```sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が実行される文字列。 [文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `needle` — 検索される部分文字列。 [文字列](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` 中の位置（1 から始まります）。 [UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 出現回数。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT countSubstringsCaseInsensitive('AAAA', 'aa');
```

結果：

```text
┌─countSubstringsCaseInsensitive('AAAA', 'aa')─┐
│                                            2 │
└──────────────────────────────────────────────┘
```

`start_pos` 引数を使用した例：

クエリ：

```sql
SELECT countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4);
```

結果：

```text
┌─countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4)─┐
│                                                           2 │
└─────────────────────────────────────────────────────────────┘
```

## countSubstringsCaseInsensitiveUTF8 {#countsubstringscaseinsensitiveutf8}

部分文字列 `needle` が文字列 `haystack` に出現する回数を返します。大文字と小文字を無視し、`haystack` が UTF8 文字列であると仮定します。

**構文**

```sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が実行される UTF-8 文字列。 [文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `needle` — 検索される部分文字列。 [文字列](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` 中の位置（1 から始まります）。 [UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 出現回数。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА');
```

結果：

```text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА')─┐
│                                                                  4 │
└────────────────────────────────────────────────────────────────────┘
```

`start_pos` 引数を使用した例：

クエリ：

```sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13);
```

結果：

```text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13)─┐
│                                                                      2 │
└────────────────────────────────────────────────────────────────────────┘
```

## countMatches {#countmatches}

`pattern` に対する `haystack` の正規表現一致の数を返します。

**構文**

```sql
countMatches(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。 [文字列](../data-types/string.md)。
- `pattern` — 正規表現（[re2 正規表現構文](https://github.com/google/re2/wiki/Syntax)）。 [文字列](../data-types/string.md)。

**返される値**

- 一致の数。 [UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT countMatches('foobar.com', 'o+');
```

結果：

```text
┌─countMatches('foobar.com', 'o+')─┐
│                                2 │
└──────────────────────────────────┘
```

```sql
SELECT countMatches('aaaa', 'aa');
```

結果：

```text
┌─countMatches('aaaa', 'aa')────┐
│                             2 │
└───────────────────────────────┘
```

## countMatchesCaseInsensitive {#countmatchescaseinsensitive}

`haystack` に対するパターンの正規表現一致の数を返します。`countMatches` と同様ですが、一致は大文字と小文字を無視します。

**構文**

```sql
countMatchesCaseInsensitive(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。 [文字列](../data-types/string.md)。
- `pattern` — 正規表現（[re2 正規表現構文](https://github.com/google/re2/wiki/Syntax)）。 [文字列](../data-types/string.md)。

**返される値**

- 一致の数。 [UInt64](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT countMatchesCaseInsensitive('AAAA', 'aa');
```

結果：

```text
┌─countMatchesCaseInsensitive('AAAA', 'aa')────┐
│                                            2 │
└──────────────────────────────────────────────┘
```

## regexpExtract {#regexpextract}

`haystack` で正規表現パターンに一致する最初の文字列を抽出し、正規表現グループインデックスに対応します。

**構文**

```sql
regexpExtract(haystack, pattern[, index])
```

エイリアス： `REGEXP_EXTRACT(haystack, pattern[, index])`。

**引数**

- `haystack` — 正規表現パターンが一致する文字列。 [文字列](../data-types/string.md)。
- `pattern` — 文字列、定数である正規表現。 [文字列](../data-types/string.md)。
- `index` – 整数で、0 以上の値でデフォルトは 1。どの正規表現グループを抽出するかを示します。 [UInt または Int](../data-types/int-uint.md)。オプション。

**返される値**

`pattern` は複数の正規表現グループを含む場合があり、`index` はどの正規表現グループを抽出するかを示します。インデックスが 0 の場合、全体の正規表現に一致します。 [文字列](../data-types/string.md)。

**例**

```sql
SELECT
    regexpExtract('100-200', '(\\d+)-(\\d+)', 1),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 2),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 0),
    regexpExtract('100-200', '(\\d+)-(\\d+)');
```

結果：

```text
┌─regexpExtract('100-200', '(\\d+)-(\\d+)', 1)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 2)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 0)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)')─┐
│ 100                                          │ 200                                          │ 100-200                                      │ 100                                       │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────────────────────┴───────────────────────────────────────────┘
```

## hasSubsequence {#hassubsequence}

`needle` が `haystack` の部分列である場合は 1 を返し、そうでない場合は 0 を返します。
文字列の部分列は、残りの要素の順序を変更することなく、ゼロまたはそれ以上の要素を削除することで与えられた文字列から導出できる列です。

**構文**

```sql
hasSubsequence(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。 [文字列](../data-types/string.md)。
- `needle` — 検索される部分列。 [文字列](../data-types/string.md)。

**返される値**

- needle が haystack の部分列である場合は 1、そうでない場合は 0。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT hasSubsequence('garbage', 'arg');
```

結果：

```text
┌─hasSubsequence('garbage', 'arg')─┐
│                                1 │
└──────────────────────────────────┘
```

## hasSubsequenceCaseInsensitive {#hassubsequencecaseinsensitive}

[hasSubsequence](#hassubsequence) のように動作しますが、大文字と小文字を区別せずに検索します。

**構文**

```sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。 [文字列](../data-types/string.md)。
- `needle` — 検索される部分列。 [文字列](../data-types/string.md)。

**返される値**

- needle が haystack の部分列である場合は 1、そうでない場合は 0。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT hasSubsequenceCaseInsensitive('garbage', 'ARG');
```

結果：

```text
┌─hasSubsequenceCaseInsensitive('garbage', 'ARG')─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```

## hasSubsequenceUTF8 {#hassubsequenceutf8}

[hasSubsequence](#hassubsequence) のように動作しますが、`haystack` と `needle` が UTF-8 エンコードされた文字列であると仮定します。

**構文**

```sql
hasSubsequenceUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。 UTF-8 エンコード [文字列](../data-types/string.md)。
- `needle` — 検索される部分列。 UTF-8 エンコード [文字列](../data-types/string.md)。

**返される値**

- needle が haystack の部分列である場合は 1、そうでない場合は 0。 [UInt8](../data-types/int-uint.md)。

クエリ：

**例**

```sql
select hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система');
```

結果：

```text
┌─hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система')─┐
│                                                                                         1 │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

## hasSubsequenceCaseInsensitiveUTF8 {#hassubsequencecaseinsensitiveutf8}

[hasSubsequenceUTF8](#hassubsequenceutf8) のように動作しますが、大文字と小文字を区別せずに検索します。

**構文**

```sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。 UTF-8 エンコード [文字列](../data-types/string.md)。
- `needle` — 検索される部分列。 UTF-8 エンコード [文字列](../data-types/string.md)。

**返される値**

- needle が haystack の部分列である場合は 1、そうでない場合は 0。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
select hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА');
```

結果：

```text
┌─hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА')─┐
│                                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## hasToken {#hastoken}

指定したトークンが haystack に存在する場合は 1 を返し、そうでない場合は 0 を返します。

**構文**

```sql
hasToken(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。 [文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2 つの非アルファベット ASCII 文字の間の最長部分文字列（または haystack の境界）の最大長。

**返される値**

- トークンが haystack に存在する場合は 1、そうでない場合は 0。 [UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数の文字列である必要があります。tokenbf_v1 インデックスの特殊化でサポートされています。

**例**

クエリ：

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```

## hasTokenOrNull {#hastokenornull}

指定したトークンが存在する場合は 1 を返し、存在しない場合は 0 を返し、トークンが不正な形式である場合は null を返します。

**構文**

```sql
hasTokenOrNull(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。 [文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2 つの非アルファベット ASCII 文字の間の最長部分文字列（または haystack の境界）の最大長。

**返される値**

- トークンが haystack に存在する場合は 1、トークンが存在しない場合は 0、トークンが不正な形式である場合は null を返します。

**実装の詳細**

トークンは定数の文字列である必要があります。tokenbf_v1 インデックスの特殊化でサポートされています。

**例**

不正な形式のトークンに対して `hasToken` がエラーをスローする場合、`hasTokenOrNull` は不正な形式のトークンに対して `null` を返します。

クエリ：

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```

## hasTokenCaseInsensitive {#hastokencaseinsensitive}

指定したトークンが haystack に存在する場合は 1 を返し、そうでない場合は 0 を返します。大文字と小文字を無視します。

**構文**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。 [文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2 つの非アルファベット ASCII 文字の間の最長部分文字列（または haystack の境界）の最大長。

**返される値**

- トークンが haystack に存在する場合は 1、そうでない場合は 0。 [UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数の文字列である必要があります。tokenbf_v1 インデックスの特殊化でサポートされています。

**例**

クエリ：

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```

## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitiveornull}

指定したトークンが haystack に存在する場合は 1 を返し、そうでない場合は 0 を返します。大文字と小文字を無視し、トークンが不正な形式である場合は null を返します。

**構文**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。 [文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2 つの非アルファベット ASCII 文字の間の最長部分文字列（または haystack の境界）の最大長。

**返される値**

- トークンが haystack に存在する場合は 1、トークンが存在しない場合は 0、そうでない場合は [`null`](../data-types/nullable.md) を返します。 [UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数の文字列である必要があります。tokenbf_v1 インデックスの特殊化でサポートされています。

**例**

不正な形式のトークンに対して `hasTokenCaseInsensitive` がエラーをスローする場合、`hasTokenCaseInsensitiveOrNull` は不正な形式のトークンに対して `null` を返します。

クエリ：

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```
