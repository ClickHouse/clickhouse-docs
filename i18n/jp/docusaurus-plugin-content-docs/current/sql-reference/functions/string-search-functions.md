---
description: '文字列検索のための関数に関する文書'
sidebar_label: '文字列検索'
sidebar_position: 160
slug: /sql-reference/functions/string-search-functions
title: '文字列検索のための関数'
---

# 文字列検索のための関数

このセクションのすべての関数は、デフォルトで大文字と小文字を区別して検索を行います。大文字と小文字を区別しない検索は、通常、別の関数のバリアントによって提供されます。

:::note
大文字と小文字を区別しない検索は、英語の小文字と大文字のルールに従います。例えば、英語での大文字の `i` は `I` ですが、トルコ語では `İ` です。英語以外の言語の場合、結果は予期しないものになる可能性があります。
:::

このセクションの関数では、検索対象の文字列（このセクションでは `haystack` と呼ばれます）と検索する文字列（このセクションでは `needle` と呼ばれます）がシングルバイトエンコードのテキストであると仮定します。この仮定が破られると、例外はスローされず、結果は未定義になります。UTF-8エンコードされた文字列での検索は、通常、別の関数のバリアントによって提供されます。同様に、UTF-8 関数のバリアントが使用され、入力文字列が UTF-8 エンコードのテキストでない場合も、例外はスローされず、結果は未定義になります。自動的なUnicode正規化は行われませんが、[normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 関数を使用することができます。

[一般的な文字列関数](string-functions.md) と [文字列内の置換関数](string-replace-functions.md) は別々に記載されています。
## position {#position}

文字列 `haystack` 内の部分文字列 `needle` の位置（バイト単位、1から始まる）を返します。

**構文**

```sql
position(haystack, needle[, start_pos])
```

エイリアス:
- `position(needle IN haystack)`

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md) または [Enum](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [String](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` の位置（1ベース）。 [UInt](../data-types/int-uint.md)。オプション。

**返り値**

- 部分文字列が見つかった場合のバイト単位の開始位置（1から数える）。 [UInt64](../data-types/int-uint.md)。
- 部分文字列が見つからなかった場合は 0。 [UInt64](../data-types/int-uint.md)。

部分文字列 `needle` が空のとき、以下のルールが適用されます：
- `start_pos` が指定されなかった場合：`1` を返す
- `start_pos = 0` の場合：`1` を返す
- `start_pos >= 1` かつ `start_pos <= length(haystack) + 1` の場合：`start_pos` を返す
- それ以外の場合：`0` を返す

同じルールは `locate`、`positionCaseInsensitive`、`positionUTF8` および `positionCaseInsensitiveUTF8` 関数にも適用されます。

**例**

クエリ:

```sql
SELECT position('Hello, world!', '!');
```

結果:

```text
┌─position('Hello, world!', '!')─┐
│                             13 │
└────────────────────────────────┘
```

`start_pos` 引数を使用した例：

クエリ:

```sql
SELECT
    position('Hello, world!', 'o', 1),
    position('Hello, world!', 'o', 7)
```

結果:

```text
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

空の `needle` 部分文字列を持つ例：

クエリ:

```sql
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

```text
┌─position('abc', '')─┬─position('abc', '', 0)─┬─position('abc', '', 1)─┬─position('abc', '', 2)─┬─position('abc', '', 3)─┬─position('abc', '', 4)─┬─position('abc', '', 5)─┐
│                   1 │                      1 │                      1 │                      2 │                      3 │                      4 │                      0 │
└─────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘
```
## locate {#locate}

[ position](#position) と同様ですが、引数 `haystack` と `locate` の順番が入れ替わっています。

この関数の挙動は、ClickHouse のバージョンによって異なります：
- バージョン < v24.3 では、`locate` は関数 `position` のエイリアスであり、引数 `(haystack, needle[, start_pos])` を受け取ります。
- バージョン >= 24.3 では、`locate` は独立した関数（MySQL との互換性を高めるため）であり、引数 `(needle, haystack[, start_pos])` を受け取ります。前の動作は設定 [function_locate_has_mysql_compatible_argument_order = false](/operations/settings/settings#function_locate_has_mysql_compatible_argument_order) を使用することで復元できます。

**構文**

```sql
locate(needle, haystack[, start_pos])
```
## positionCaseInsensitive {#positioncaseinsensitive}

[ position](#position) の大文字小文字を区別しないバージョンです。

**例**

クエリ:

```sql
SELECT positionCaseInsensitive('Hello, world!', 'hello');
```

結果:

```text
┌─positionCaseInsensitive('Hello, world!', 'hello')─┐
│                                                 1 │
└───────────────────────────────────────────────────┘
```
## positionUTF8 {#positionutf8}

[ position](#position) と同様ですが、`haystack` と `needle` が UTF-8 エンコード文字列であると仮定します。

**例**

関数 `positionUTF8` は、文字 `ö`（2ポイントで表現される）を単一のUnicodeコードポイントとして正しくカウントします：

クエリ:

```sql
SELECT positionUTF8('Motörhead', 'r');
```

結果:

```text
┌─position('Motörhead', 'r')─┐
│                          5 │
└────────────────────────────┘
```
## positionCaseInsensitiveUTF8 {#positioncaseinsensitiveutf8}

[ positionUTF8](#positionutf8) と同様ですが、大文字小文字を区別しない検索を行います。
## multiSearchAllPositions {#multisearchallpositions}

[ position](#position) と同様ですが、`haystack` 文字列内の複数の `needle` 部分文字列に対して、位置の配列（バイト単位、1から始まる）を返します。

:::note
すべての `multiSearch*()` 関数は、最大 2<sup>8</sup> 個の needle にのみ対応しています。
:::

**構文**

```sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 部分文字列が見つかった場合のバイト単位の開始位置の配列（1から数える）。
- 部分文字列が見つからなかった場合は 0。

**例**

クエリ:

```sql
SELECT multiSearchAllPositions('Hello, World!', ['hello', '!', 'world']);
```

結果:

```text
┌─multiSearchAllPositions('Hello, World!', ['hello', '!', 'world'])─┐
│ [0,13,0]                                                          │
└───────────────────────────────────────────────────────────────────┘
```
## multiSearchAllPositionsCaseInsensitive {#multisearchallpositionscaseinsensitive}

[multiSearchAllPositions](#multisearchallpositions) と同様ですが、大文字小文字を区別しません。

**構文**

```sql
multiSearchAllPositionsCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 部分文字列が見つかった場合のバイト単位の開始位置の配列（1から数える）。
- 部分文字列が見つからなかった場合は 0。

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

[multiSearchAllPositions](#multisearchallpositions) と同様ですが、`haystack` と `needle` 部分文字列が UTF-8 エンコード文字列であると仮定します。

**構文**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる UTF-8 エンコード文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 エンコード部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 部分文字列が見つかった場合のバイト単位の開始位置の配列（1から数える）。
- 部分文字列が見つからなかった場合は 0。

**例**

`ClickHouse` を UTF-8 文字列として与え、`C` (`\x43`) と `H` (`\x48`) の位置を見つけます。

クエリ:

```sql
SELECT multiSearchAllPositionsUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

結果:

```response
["1","6"]
```
## multiSearchAllPositionsCaseInsensitiveUTF8 {#multisearchallpositionscaseinsensitiveutf8}

[multiSearchAllPositionsUTF8](#multisearchallpositionsutf8) と同様ですが、大文字小文字を区別しません。

**構文**

```sql
multiSearchAllPositionsCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる UTF-8 エンコード文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 エンコード部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 部分文字列が見つかった場合のバイト単位の開始位置の配列（1から数える）。
- 部分文字列が見つからなかった場合は 0。

**例**

`ClickHouse` を UTF-8 文字列として与え、`c` (`\x63`) と `h` (`\x68`) の位置を見つけます。

クエリ:

```sql
SELECT multiSearchAllPositionsCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x63','\x68']);
```

結果:

```response
["1","6"]
```
## multiSearchFirstPosition {#multisearchfirstposition}

[`position`](#position) と同様ですが、複数の `needle` 文字列のいずれかに一致する `haystack` 文字列内の最も左側のオフセットを返します。

関数 [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive)、[`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8)、および [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) では、この関数の大文字小文字を区別しないバージョンや UTF-8 バージョンを提供します。

**構文**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 複数の `needle` 文字列のいずれかに一致する `haystack` 文字列の最も左側のオフセット。
- 一致がなかった場合は 0。

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

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、大文字小文字を区別しません。

**構文**

```sql
multiSearchFirstPositionCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 複数の `needle` 文字列のいずれかに一致する `haystack` 文字列の最も左側のオフセット。
- 一致がなかった場合は 0。

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

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、`haystack` と `needle` を UTF-8 文字列とします。

**構文**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 複数の `needle` 文字列のいずれかに一致する `haystack` 文字列の最も左側のオフセット。
- 一致がなかった場合は 0。

**例**

UTF-8 文字列 `hello world` の中で、与えられた needle のいずれかに一致する最も左側のオフセットを見つけます。

クエリ:

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

結果:

```response
2
```
## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、`haystack` と `needle` を UTF-8 文字列とし、大文字小文字を区別しません。

**構文**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 複数の `needle` 文字列のいずれかに一致する `haystack` 文字列の最も左側のオフセット（大文字小文字を区別しない）。
- 一致がなかった場合は 0。

**例**

UTF-8 文字列 `HELLO WORLD` の中で、与えられた needle のいずれかに一致する最も左側のオフセットを見つけます。

クエリ:

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

結果:

```response
2
```
## multiSearchFirstIndex {#multisearchfirstindex}

文字列 `haystack` 内で見つかった最も左側の needle<sub>i</sub> のインデックス `i`（1 から始まる）を返します。見つからない場合は 0 を返します。

関数 [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive)、[`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8)、および [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) は、大文字小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 見つかった最も左側の needle のインデックス（1 から始まる）。一致がない場合は 0。 [UInt8](../data-types/int-uint.md)。

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

見つかった最も左側の needle のインデックス `i`（1から始まる）を返します。一致しない場合は 0 を返します。大文字小文字は区別しません。

**構文**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 見つかった最も左側の needle のインデックス（1 から始まる）。一致がなかった場合は 0。 [UInt8](../data-types/int-uint.md)。

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

文字列 `haystack` 内で見つかった最も左側の needle<sub>i</sub> のインデックス `i`（1 から始まる）を返します。見つからない場合は 0 を返します。`haystack` と `needle` は UTF-8 エンコード文字列であると仮定します。

**構文**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 見つかった最も左側の needle のインデックス（1 から始まる）。一致がなかった場合は 0。 [UInt8](../data-types/int-uint.md)。

**例**

`Hello World` を UTF-8 文字列として与え、`Hello` と `World` の最初のインデックスを見つけます。

クエリ:

```sql
SELECT multiSearchFirstIndexUTF8('\x48\x65\x6c\x6c\x6f\x20\x57\x6f\x72\x6c\x64',['\x57\x6f\x72\x6c\x64','\x48\x65\x6c\x6c\x6f']);
```

結果:

```response
1
```
## multiSearchFirstIndexCaseInsensitiveUTF8 {#multisearchfirstindexcaseinsensitiveutf8}

見つかった最も左側の needle のインデックス `i`（1 から始まる）を返します。見つからなかった場合は 0 を返します。`haystack` と `needle` は UTF-8 エンコード文字列であると仮定します。大文字小文字は区別しません。

**構文**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 見つかった最も左側の needle のインデックス（1 から始まる）。一致がなかった場合は 0。 [UInt8](../data-types/int-uint.md)。

**例**

`HELLO WORLD` を UTF-8 文字列として与え、`hello` と `world` の最初のインデックスを見つけます。

クエリ:

```sql
SELECT multiSearchFirstIndexCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['\x68\x65\x6c\x6c\x6f','\x77\x6f\x72\x6c\x64']);
```

結果:

```response
1
```
## multiSearchAny {#multisearchany}

文字列 `haystack` に一致する文字列 needle<sub>i</sub> が少なくとも 1 つある場合は 1 を返し、そうでなければ 0 を返します。

関数 [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive)、[`multiSearchAnyUTF8`](#multisearchanyutf8)、および [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) は、大文字小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 1、一致があった場合。
- 0、一致がなかった場合。

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

[multiSearchAny](#multisearchany) と同様ですが、大文字小文字を区別しません。

**構文**

```sql
multiSearchAnyCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 大文字小文字を区別しない一致があった場合は 1。
- そうでなければ 0。

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

[multiSearchAny](#multisearchany) と同様ですが、`haystack` と `needle` 部分文字列が UTF-8 エンコード文字列であると仮定します。

**構文**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 一致があった場合は 1。
- 一致がなかった場合は 0。

**例**

`ClickHouse` を UTF-8 文字列として与え、`C` (`\x43`) または `H` (`\x48`) の文字が単語にあるか確認します。

クエリ:

```sql
SELECT multiSearchAnyUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

結果:

```response
1
```
## multiSearchAnyCaseInsensitiveUTF8 {#multisearchanycaseinsensitiveutf8}

[multiSearchAnyUTF8](#multisearchanyutf8) と同様ですが、大文字小文字を区別しません。

**構文**

```sql
multiSearchAnyCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる UTF-8 文字列。 [String](../data-types/string.md)。
- `needle` — 検索される UTF-8 部分文字列。 [Array](../data-types/array.md)。

**返り値**

- 大文字小文字を区別しない一致があった場合は 1。
- 一致がなかった場合は 0。

**例**

`ClickHouse` を UTF-8 文字列として与え、文字 `h` (`\x68`) が単語にあるか確認します（大文字小文字を区別しない）。

クエリ:

```sql
SELECT multiSearchAnyCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x68']);
```

結果:

```response
1
```
## match {#match}

文字列 `haystack` が [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) の正規表現 `pattern` に一致するかどうかを返します。

一致は UTF-8 に基づいています。例えば、`.` は UTF-8 で2バイトで表現されるUnicodeコードポイント `¥` に一致します。正規表現には、ヌルバイトを含めることはできません。`haystack` または `pattern` が有効な UTF-8 でない場合、動作は未定義となります。

re2 のデフォルトの動作とは異なり、`.` は改行に一致します。この挙動を無効にするには、パターンの先頭に `(?-s)` を付けます。

文字列内の部分文字列を検索するだけであれば、[like](#like) や [position](#position) のような関数を使用すると、これらの関数はこの関数よりもずっと高速に動作します。

**構文**

```sql
match(haystack, pattern)
```

エイリアス: `haystack REGEXP pattern operator`
## multiMatchAny {#multimatchany}

`match` と同様ですが、パターンのいずれかに一致する場合は 1 を返し、一致しない場合は 0 を返します。

:::note
`multi[Fuzzy]Match*()` ファミリーの関数は (Vectorscan)[https://github.com/VectorCamp/vectorscan] ライブラリを使用します。このため、ClickHouse がベクトルスキャンサポートでコンパイルされている場合にのみ有効です。

すべての hyperscan を使用する関数をオフにするには、設定 `SET allow_hyperscan = 0;` を使用してください。

ベクトルスキャンの制約により、`haystack` 文字列の長さは 2<sup>32</sup> バイト未満でなければなりません。

Hyperscan は一般的に正規表現のサービス拒否攻撃 (ReDoS) に脆弱です (例: (ここ)[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova]、(ここ)[https://doi.org/10.1007/s10664-021-10033-1] および (ここ)[https://doi.org/10.1145/3236024.3236027])。ユーザーは提供されたパターンを注意深く確認することをお勧めします。
:::

文字列内の複数の部分文字列を検索したいだけの場合は、関数 [multiSearchAny](#multisearchany) を使用すると、この関数よりもはるかに高速に動作します。

**構文**

```sql
multiMatchAny(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiMatchAnyIndex {#multimatchanyindex}

`multiMatchAny` と同様ですが、`haystack` に一致する任意のインデックスを返します。

**構文**

```sql
multiMatchAnyIndex(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiMatchAllIndices {#multimatchallindices}

`multiMatchAny` と同様ですが、`haystack` に一致するすべてのインデックスの配列を返します。

**構文**

```sql
multiMatchAllIndices(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiFuzzyMatchAny {#multifuzzymatchany}

`multiMatchAny` と同様ですが、任意のパターンが定数 [編集距離](https://en.wikipedia.org/wiki/Edit_distance) で `haystack` に一致する場合は 1 を返します。この関数は、[hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) ライブラリの実験的機能に依存しており、一部のコーナーケースでは遅くなることがあります。性能は編集距離の値と使用されるパターンによって異なりますが、常にノンファジーのバリアントに比べてコストが高くなります。

:::note
`multiFuzzyMatch*()` 関数ファミリーは、hyperscan の制限により UTF-8 正規表現をサポートしていません（バイトのシーケンスとして扱われます）。
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

`multiFuzzyMatchAny` と同様ですが、定数の編集距離内で `haystack` に一致するすべてのインデックスの配列を返します。

**構文**

```sql
multiFuzzyMatchAllIndices(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## extract {#extract}

文字列内の正規表現の最初の一致を返します。
`haystack` が `pattern` 正規表現に一致しない場合は、空文字列が返されます。

正規表現にキャプチャグループがある場合、関数は入力文字列を最初のキャプチャグループに対して一致させます。

**構文**

```sql
extract(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に基づく正規表現。

**返り値**

- `haystack` 文字列に対する正規表現の最初の一致。 [String](../data-types/string.md)。

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

文字列内の正規表現に一致するすべての配列を返します。`haystack` が `pattern` 正規表現に一致しない場合は、空文字列が返されます。

サブパターンに関する挙動は [`extract`](#extract) 関数と同様です。

**構文**

```sql
extractAll(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に基づく正規表現。

**返り値**

- `haystack` 文字列に対する正規表現の一致の配列。 [Array](../data-types/array.md) ([String](../data-types/string.md))。

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

`haystack` 文字列のすべてのグループを `pattern` 正規表現を使用して一致させます。最初の配列は最初のグループに一致するすべての断片を含み、2 番目の配列は 2 番目のグループに一致するすべてを含むなど、配列の配列を返します。

この関数は、[extractAllGroupsVertical](#extractallgroupsvertical) よりも遅くなります。

**構文**

```sql
extractAllGroupsHorizontal(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に基づく正規表現。グループを含める必要があり、各グループは括弧で囲む必要があります。`pattern` にグループが含まれていない場合、例外がスローされます。 [String](../data-types/string.md)。

**返り値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列の配列が返されます。
:::

**例**

```sql
SELECT extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果:

```text
┌─extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','def','ghi'],['111','222','333']]                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```
## extractGroups {#extractgroups}

与えられた入力文字列のすべてのグループを、与えられた正規表現で一致させ、一致の配列の配列を返します。

**構文**

```sql
extractGroups(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に基づく正規表現。グループを含める必要があり、各グループは括弧で囲む必要があります。`pattern` にグループが含まれていない場合、例外がスローされます。 [String](../data-types/string.md)。

**返り値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

**例**

```sql
SELECT extractGroups('hello abc=111 world', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') AS result;
```

結果:

```text
┌─result────────┐
│ ['abc','111'] │
└───────────────┘
```
## extractAllGroupsVertical {#extractallgroupsvertical}

`haystack` 文字列のすべてのグループを `pattern` 正規表現を使用して一致させます。すべての配列は、グループごとに一致する断片を含み、`haystack` 内での出現順にグループ化されます。

**構文**

```sql
extractAllGroupsVertical(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に基づく正規表現。グループを含める必要があり、各グループは括弧で囲む必要があります。`pattern` にグループが含まれていない場合、例外がスローされます。 [String](../data-types/string.md)。

**返り値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列が返されます。
:::

**例**

```sql
SELECT extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果:

```text
┌─extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','111'],['def','222'],['ghi','333']]                                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## like {#like}

文字列 `haystack` が LIKE 式 `pattern` に一致するかどうかを返します。

LIKE 式には通常の文字と以下のメタシンボルが含まれることがあります：

- `%` は任意の数の任意の文字（ゼロ文字を含む）を示します。
- `_` は任意の1つの文字を示します。
- `\` はリテラル `%`、`_` および `\` をエスケープするために使用されます。

一致は UTF-8 に基づいており、例えば `_` は UTF-8 で2バイトで表現される Unicode コードポイント `¥` に一致します。

haystack または LIKE 式が有効な UTF-8 でない場合、動作は未定義です。

自動的な Unicode 正規化は行われません。必要な場合は、[normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 関数を使用できます。

リテラル `%`、`_` および `\`（LIKE メタ文字）に一致させるには、前にバックスラッシュを付けます： `\%`、`\_` および `\\` 。バックスラッシュは、`%`、`_` または `\` とは異なる文字を前に付けた場合、その特別な意味を失います（すなわち、リテラルとして解釈されます）。ClickHouse では、文字列内のバックスラッシュも [引用符で囲む必要があります](../syntax.md#string) 。したがって、実際には `\\%`、`\\_` および `\\\\` と書く必要があります。

形 `%needle%` の LIKE 式に対しては、この関数は `position` 関数と同じくらい速いです。
その他すべての LIKE 式は内部的に正規表現に変換され、関数 `match` に似たパフォーマンスで実行されます。

**構文**

```sql
like(haystack, pattern)
```

エイリアス：`haystack LIKE pattern` （オペレーター）
## notLike {#notlike}

`like` と同様ですが、結果を否定します。

エイリアス：`haystack NOT LIKE pattern` （オペレーター）
## ilike {#ilike}

`like` と同様ですが、大文字と小文字を区別しません。

エイリアス：`haystack ILIKE pattern` （オペレーター）
## notILike {#notilike}

`ilike` と同様ですが、結果を否定します。

エイリアス：`haystack NOT ILIKE pattern` （オペレーター）
## ngramDistance {#ngramdistance}

`haystack` 文字列と `needle` 文字列間の 4-グラム距離を計算します。これには、2 つの 4-グラムの多集合間の対称差をカウントし、その合計のカーディナリティで正規化します。0 と 1 の間の [Float32](/sql-reference/data-types/float) を返します。結果が小さいほど、文字列は互いに類似していることを示します。

関数 [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive)、[`ngramDistanceUTF8`](#ngramdistanceutf8)、[`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) は、この関数の大文字と小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
ngramDistance(haystack, needle)
```

**引数**

- `haystack`: 最初の比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 2 つの文字列間の類似性を表す 0 から 1 までの値。[Float32](/sql-reference/data-types/float)

**実装の詳細**

この関数は、定数 `needle` または `haystack` 引数が 32Kb を超える場合に例外をスローします。非定数 `haystack` または `needle` 引数が 32Kb を超える場合、距離は常に 1 になります。

**例**

2 つの文字列が互いに類似しているほど、結果は 0 に近くなります（同一）。

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

**引数**

- `haystack`: 最初の比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 2 つの文字列間の類似性を表す 0 から 1 までの値。[Float32](/sql-reference/data-types/float)

**例**

[ngramDistance](#ngramdistance) を使用すると、大文字と小文字の違いが類似性の値に影響します：

クエリ：

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

結果：

```response
0.71428573
```

[ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive) では、大文字と小文字を無視するため、大文字と小文字が異なるのみの 2 つの同一の文字列は、現在は低い類似性の値を返します：

クエリ：

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

結果：

```response
0
```
## ngramDistanceUTF8 {#ngramdistanceutf8}

[ngramDistance](#ngramdistance) の UTF-8 バリアントを提供します。`needle` および `haystack` 文字列が UTF-8 エンコードされていると仮定します。

**構文**

```sql
ngramDistanceUTF8(haystack, needle)
```

**引数**

- `haystack`: 最初の UTF-8 エンコードされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の UTF-8 エンコードされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 2 つの文字列間の類似性を表す 0 から 1 までの値。[Float32](/sql-reference/data-types/float)

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

**引数**

- `haystack`: 最初の UTF-8 エンコードされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の UTF-8 エンコードされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 2 つの文字列間の類似性を表す 0 から 1 までの値。[Float32](/sql-reference/data-types/float)

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

`ngramDistance` と同様ですが、`needle` 文字列と `haystack` 文字列間の非対称差を計算します。すなわち、needle からの n-グラムの数から共通の n-グラムの数を引き、`needle` の n-グラムの数で正規化します。[Float32](/sql-reference/data-types/float) を 0 と 1 の間で返します。結果が大きいほど、`needle` が `haystack` に存在する可能性が高くなります。この関数はファジー文字列検索に役立ちます。また、[`soundex`](../../sql-reference/functions/string-functions#soundex) 関数も参照してください。

関数 [`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive)、[`ngramSearchUTF8`](#ngramsearchutf8)、[`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8) は、この関数の大文字と小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
ngramSearch(haystack, needle)
```

**引数**

- `haystack`: 最初の比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

-  `needle` が `haystack` に存在する可能性を表す 0 から 1 までの値。[Float32](/sql-reference/data-types/float)

**実装の詳細**

:::note
UTF-8 バリアントは 3-グラム距離を使用します。これは完全にはフェアな n-グラム距離ではありません。n-グラムをハッシュ化するために 2 バイトのハッシュを使用し、これらのハッシュテーブル間の（非）対称差を計算します – 衝突が発生する可能性があります。UTF-8 の大文字と小文字を区別しない形式では、公正な `tolower` 関数は使用せず、各コードポイントバイトの5番目のビットをゼロにし、バイトが1より多い場合は最初のビットを置き換えます – これはラテン文字およびほとんどすべてのキリル文字で機能します。
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

**引数**

- `haystack`: 最初の比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

-  `needle` が `haystack` に存在する可能性を表す 0 から 1 までの値。[Float32](/sql-reference/data-types/float)

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

[ngramSearch](#ngramsearch) の UTF-8 バリアントを提供し、`needle` および `haystack` は UTF-8 エンコードされた文字列であると仮定します。

**構文**

```sql
ngramSearchUTF8(haystack, needle)
```

**引数**

- `haystack`: 最初の UTF-8 エンコードされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の UTF-8 エンコードされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

-  `needle` が `haystack` に存在する可能性を表す 0 から 1 までの値。[Float32](/sql-reference/data-types/float)

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

[ngramSearchUTF8](#ngramsearchutf8) の大文字と小文字を区別しないバリアントを提供し、`needle` と `haystack` に対して行います。

**構文**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**引数**

- `haystack`: 最初の UTF-8 エンコードされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 2 番目の UTF-8 エンコードされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

-  `needle` が `haystack` に存在する可能性を表す 0 から 1 までの値。[Float32](/sql-reference/data-types/float)

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

部分文字列 `needle` が文字列 `haystack` に何回現れるかを返します。

関数 [`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive) および [`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8) は、それぞれ大文字と小文字を区別しないバリアントおよび大文字と小文字を区別せずかつ UTF-8 バリアントを提供します。

**構文**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が行われる文字列。[文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `needle` — 検索される部分文字列。[文字列](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` 内の位置（1ベース）。[UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 出現回数。[UInt64](../data-types/int-uint.md)。

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

部分文字列 `needle` が文字列 `haystack` に何回現れるかを返します。大文字と小文字は無視されます。

**構文**

```sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が行われる文字列。[文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `needle` — 検索される部分文字列。[文字列](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` 内の位置（1ベース）。[UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 出現回数。[UInt64](../data-types/int-uint.md)。

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

部分文字列 `needle` が文字列 `haystack` に何回現れるかを返します。大文字と小文字は無視され、`haystack` は UTF8 文字列であると仮定されます。

**構文**

```sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が行われる UTF-8 文字列。[文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `needle` — 検索される部分文字列。[文字列](../data-types/string.md)。
- `start_pos` – 検索が開始される `haystack` 内の位置（1ベース）。[UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 出現回数。[UInt64](../data-types/int-uint.md)。

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

`haystack` 内の `pattern` に対する正規表現の一致数を返します。

**構文**

```sql
countMatches(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。[文字列](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) を使用した正規表現。[文字列](../data-types/string.md)。

**返される値**

- 一致の数。[UInt64](../data-types/int-uint.md)。

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

[`countMatches`](#countmatches) に似ていますが、大文字と小文字を無視します。

**構文**

```sql
countMatchesCaseInsensitive(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。[文字列](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) を使用した正規表現。[文字列](../data-types/string.md)。

**返される値**

- 一致の数。[UInt64](../data-types/int-uint.md)。

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

`haystack` 内で正規表現パターンに一致し、正規表現グループインデックスに対応する最初の文字列を抽出します。

**構文**

```sql
regexpExtract(haystack, pattern[, index])
```

エイリアス：`REGEXP_EXTRACT(haystack, pattern[, index])`。

**引数**

- `haystack` — 正規表現パターンがマッチする文字列。[文字列](../data-types/string.md)。
- `pattern` — 文字列、正規表現、定数である必要があります。[文字列](../data-types/string.md)。
- `index` – 0 以上の整数で、デフォルトは 1 です。どの正規表現グループを抽出するかを指定します。[UInt または Int](../data-types/int-uint.md)。オプション。

**返される値**

`pattern` は複数の正規表現グループを含むことができます。`index` はどの正規表現グループを抽出するかを示します。インデックスが 0 の場合、正規表現全体に一致します。[文字列](../data-types/string.md)。

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

`needle` が `haystack` の部分列であれば 1 を、そうでなければ 0 を返します。
文字列の部分列は、残りの要素の順序を変更することなく、ゼロまたは複数の要素を削除することによって与えられた文字列から導出できる順列です。

**構文**

```sql
hasSubsequence(haystack, needle)
```

**引数**

- `haystack` — 検索が行われる文字列。[文字列](../data-types/string.md)。
- `needle` — 検索される部分列。[文字列](../data-types/string.md)。

**返される値**

- `haystack` の部分列である場合は 1、そうでなければ 0。[UInt8](../data-types/int-uint.md)。

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

[hasSubsequence](#hassubsequence) と同様ですが、大文字と小文字を区別せずに検索します。

**構文**

```sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**引数**

- `haystack` — 検索が行われる文字列。[文字列](../data-types/string.md)。
- `needle` — 検索される部分列。[文字列](../data-types/string.md)。

**返される値**

- `haystack` の部分列である場合は 1、そうでなければ 0。[UInt8](../data-types/int-uint.md)。

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

[hasSubsequence](#hassubsequence) と同様ですが、`haystack` と `needle` が UTF-8 エンコードされた文字列であると仮定します。

**構文**

```sql
hasSubsequenceUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が行われる文字列。UTF-8 エンコードされた [文字列](../data-types/string.md)。
- `needle` — 検索される部分列。UTF-8 エンコードされた [文字列](../data-types/string.md)。

**返される値**

- `haystack` の部分列である場合は 1、そうでなければ 0。[UInt8](../data-types/int-uint.md)。

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

[hasSubsequenceUTF8](#hassubsequenceutf8) と同様ですが、大文字と小文字を区別せずに検索します。

**構文**

```sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が行われる文字列。UTF-8 エンコードされた [文字列](../data-types/string.md)。
- `needle` — 検索される部分列。UTF-8 エンコードされた [文字列](../data-types/string.md)。

**返される値**

- `haystack` の部分列である場合は 1、そうでなければ 0。[UInt8](../data-types/int-uint.md)。

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

指定されたトークンが `haystack` に存在すれば 1 を、存在しなければ 0 を返します。

**構文**

```sql
hasToken(haystack, token)
```

**引数**

- `haystack`: 検索が行われる文字列。[文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2つの非アルファベット ASCII 文字間にある最大長部分文字列（または haystack の境界）です。

**返される値**

- トークンが `haystack` に存在する場合は 1、そうでなければ 0。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列でなければなりません。トークンbf_v1 インデックスの特化によるサポート。

**例**

クエリ：

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```
## hasTokenOrNull {#hastokenornull}

トークンが存在すれば 1 を、存在しなければ 0 を、トークンが不正な形式であれば null を返します。

**構文**

```sql
hasTokenOrNull(haystack, token)
```

**引数**

- `haystack`: 検索が行われる文字列。[文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2つの非アルファベット ASCII 文字間にある最大長部分文字列（または haystack の境界）です。

**返される値**

- トークンが `haystack` に存在する場合は 1、存在しない場合は 0、不正な形式の場合は null。

**実装の詳細**

トークンは定数文字列でなければなりません。トークンbf_v1 インデックスの特化によるサポート。

**例**

不正な形式のトークンに対して `hasToken` がエラーをスローする場合でも、`hasTokenOrNull` は不正な形式のトークンに対して null を返します。

クエリ：

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```
## hasTokenCaseInsensitive {#hastokencaseinsensitive}

指定されたトークンが `haystack` に存在すれば 1 を、存在しなければ 0 を返します。大文字と小文字は無視されます。

**構文**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**引数**

- `haystack`: 検索が行われる文字列。[文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2つの非アルファベット ASCII 文字間にある最大長部分文字列（または haystack の境界）です。

**返される値**

- トークンが `haystack` に存在する場合は 1、存在しない場合は 0。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列でなければなりません。トークンbf_v1 インデックスの特化によるサポート。

**例**

クエリ：

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```
## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitiverenull}

指定されたトークンが `haystack` に存在すれば 1 を、存在しなければ 0 を返します。大文字と小文字は無視され、不正な形式の場合は null を返します。

**構文**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**引数**

- `haystack`: 検索が行われる文字列。[文字列](../data-types/string.md) または [Enum](../data-types/enum.md)。
- `token`: 2つの非アルファベット ASCII 文字間にある最大長部分文字列（または haystack の境界）です。

**返される値**

- トークンが `haystack` に存在する場合は 1、トークンが存在しない場合は 0、不正な形式の場合は [`null`](../data-types/nullable.md)。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列でなければなりません。トークンbf_v1 インデックスの特化によるサポート。

**例**

不正な形式のトークンに対して `hasTokenCaseInsensitive` がエラーをスローする場合でも、`hasTokenCaseInsensitiveOrNull` は不正な形式のトークンに対して null を返します。

クエリ：

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```
