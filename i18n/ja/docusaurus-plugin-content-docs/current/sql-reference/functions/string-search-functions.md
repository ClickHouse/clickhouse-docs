---
slug: /sql-reference/functions/string-search-functions
sidebar_position: 160
sidebar_label: 文字列の検索
---

# 文字列の検索に関する関数

このセクションのすべての関数はデフォルトで大文字と小文字を区別して検索します。大文字と小文字を区別しない検索は通常、別の関数バリアントで提供されます。

:::note
大文字と小文字を区別しない検索は、英語の小文字・大文字のルールに従います。例えば、英語における大文字の `i` は `I` ですが、トルコ語では `İ` です - 英語以外の言語の場合、結果が予期しないものになる可能性があります。
:::

このセクションの関数は、検索対象の文字列（このセクションでは `haystack` と呼称）と検索文字列（このセクションでは `needle` と呼称）が単バイトエンコードテキストであると仮定しています。この仮定が破られると、例外はスローされず、結果は未定義となります。UTF-8 エンコードされた文字列を使用した検索は通常、別の関数バリアントで提供されます。同様に、UTF-8 関数バリアントが使用され、入力文字列がUTF-8 エンコードテキストでない場合も、例外はスローされず、結果は未定義となります。自動Unicode正規化は行われませんが、そのために [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 関数を使用できます。

[一般的な文字列関数](string-functions.md) や [文字列内の置換関数](string-replace-functions.md) については別途説明されています。

## position {#position}

文字列 `haystack` 内の部分文字列 `needle` の位置（バイト数、1から始まる）を返します。

**構文**

```sql
position(haystack, needle[, start_pos])
```

エイリアス:
- `position(needle IN haystack)`

**引数**

- `haystack` — 検索を行う文字列。[String](../data-types/string.md) または [Enum](../data-types/string.md)。
- `needle` — 検索する部分文字列。[String](../data-types/string.md)。
- `start_pos` – 検索を開始する `haystack` 内の位置（1ベース）。[UInt](../data-types/int-uint.md)。省略可能です。

**戻り値**

- 部分文字列が見つかった場合、1から数えてバイトでの開始位置。[UInt64](../data-types/int-uint.md)。
- 部分文字列が見つからなかった場合、0。[UInt64](../data-types/int-uint.md)。

部分文字列 `needle` が空の場合、次の規則が適用されます：
- `start_pos` が指定されていない場合： `1` を返す
- `start_pos = 0` の場合： `1` を返す
- `start_pos >= 1` かつ `start_pos <= length(haystack) + 1` の場合： `start_pos` を返す
- それ以外の場合： `0` を返す

同じ規則は `locate`、`positionCaseInsensitive`、`positionUTF8` および `positionCaseInsensitiveUTF8` の各関数にも適用されます。

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

`start_pos` 引数を使用した例:

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

空の `needle` 部分文字列を使用した例:

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

[位置](#position) と同様ですが、引数 `haystack` と `locate` を入れ替えます。

この関数の動作は ClickHouse のバージョンに依存します：
- v24.3 未満のバージョンでは、`locate` は関数 `position` のエイリアスであり、引数 `(haystack, needle[, start_pos])` を受け入れていました。
- v24.3 以降、`locate` は独立した関数（MySQLとの互換性を向上させるため）であり、引数 `(needle, haystack[, start_pos])` を受け入れます。以前の動作は、設定 [function_locate_has_mysql_compatible_argument_order = false](../../operations/settings/settings.md#function-locate-has-mysql-compatible-argument-order) を使用することで復元できます。

**構文**

```sql
locate(needle, haystack[, start_pos])
```

## positionCaseInsensitive {#positioncaseinsensitive}

[位置](#position) の大文字と小文字を区別しないバリアント。

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

[位置](#position) と同様ですが、`haystack` と `needle` が UTF-8 エンコードされた文字列であることを仮定します。

**例**

関数 `positionUTF8` は、文字 `ö` （二点符号で表される）を単一の Unicode コードポイントとして正しくカウントします。

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

[成分位置UTF8](#positionutf8) と同様ですが、大文字小文字を区別せずに検索します。

## multiSearchAllPositions {#multisearchallpositions}

[位置](#position) と同様ですが、`haystack` 文字列内の複数の `needle` 部分文字列の位置の配列（バイト数、1から始まる）を返します。

:::note
すべての `multiSearch*()` 関数は、最大 2<sup>8</sup> のニードルをサポートします。
:::

**構文**

```sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う文字列。[String](../data-types/string.md)。
- `needle` — 検索する部分文字列。[Array](../data-types/array.md)。

**戻り値**

- 部分文字列が見つかった場合、1から数えてバイトの開始位置の配列。
- 部分文字列が見つからなかった場合、0。

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

- `haystack` — 検索を行う文字列。[String](../data-types/string.md)。
- `needle` — 検索する部分文字列。[Array](../data-types/array.md)。

**戻り値**

- 部分文字列が見つかった場合、1から数えてバイトの開始位置の配列。
- 部分文字列が見つからなかった場合、0。

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

[multiSearchAllPositions](#multisearchallpositions) と同様ですが、`haystack` と `needle` 部分文字列が UTF-8 エンコードされた文字列であることを仮定します。

**構文**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う UTF-8 エンコードされた文字列。[String](../data-types/string.md)。
- `needle` — 検索する UTF-8 エンコードされた部分文字列。[Array](../data-types/array.md)。

**戻り値**

- 部分文字列が見つかった場合、1から数えてバイトの開始位置の配列。
- 部分文字列が見つからなかった場合、0。

**例**

UTF-8 文字列として `ClickHouse` が与えられた場合、`C` （`\x43`）と `H` （`\x48`）の位置を見つけます。

クエリ:

```sql
SELECT multiSearchAllPositionsUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

結果:

```response
["1","6"]
```

## multiSearchAllPositionsCaseInsensitiveUTF8 {#multisearchallpositionscaseinsensitiveutf8}

[multiSearchAllPositionsUTF8](#multisearchallpositionsutf8) と同様ですが、大文字小文字を区別せずに検索します。

**構文**

```sql
multiSearchAllPositionsCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う UTF-8 エンコードされた文字列。[String](../data-types/string.md)。
- `needle` — 検索する UTF-8 エンコードされた部分文字列。[Array](../data-types/array.md)。

**戻り値**

- 部分文字列が見つかった場合、1から数えてバイトの開始位置の配列。
- 部分文字列が見つからなかった場合、0。

**例**

UTF-8 文字列として `ClickHouse` が与えられた場合、`c` （`\x63`）と `h` （`\x68`）の位置を見つけます。

クエリ:

```sql
SELECT multiSearchAllPositionsCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x63','\x68']);
```

結果:

```response
["1","6"]
```

## multiSearchFirstPosition {#multisearchfirstposition}

[`position`](#position) と似ていますが、`haystack` 文字列内の最も左にある `needle` 文字列のオフセットを返します。

関数 [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive)、[`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) および [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) は、この関数の大文字小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う文字列。[String](../data-types/string.md)。
- `needle` — 検索する部分文字列。[Array](../data-types/array.md)。

**戻り値**

- 最も左にある `haystack` 文字列のオフセット。
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

- `haystack` — 検索を行う文字列。[String](../data-types/string.md)。
- `needle` — 検索する部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 最も左にある `haystack` 文字列のオフセット。
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

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、`haystack` および `needle` が UTF-8 文字列であることを仮定します。

**構文**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う UTF-8 文字列。[String](../data-types/string.md)。
- `needle` — 検索する UTF-8 部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 最も左にある `haystack` 文字列のオフセット。
- 一致がなかった場合は 0。

**例**

UTF-8 文字列 `hello world` 内で、与えられたニードルのいずれかが最も左にあるオフセットを見つけます。

クエリ:

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

結果:

```response
2
```

## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、`haystack` および `needle` が UTF-8 文字列であることを仮定し、大文字小文字を区別しません。

**構文**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う UTF-8 文字列。[String](../data-types/string.md)。
- `needle` — 検索する UTF-8 部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 最も左にある `haystack` 文字列のオフセット（大文字小文字を区別しない）。
- 一致がなかった場合は 0。

**例**

UTF-8 文字列 `HELLO WORLD` で、与えられたニードルのいずれかが最も左にあるオフセットを見つけます。

クエリ:

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

結果:

```response
2
```

## multiSearchFirstIndex {#multisearchfirstindex}

`haystack` 内で最も左に見つかった `needle`<sub>i</sub> のインデックス `i`（1から始まる）を返し、一致がない場合は 0 を返します。

関数 [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive)、[`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8) および [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) は、大文字小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う文字列。[String](../data-types/string.md)。
- `needle` — 検索する部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 最も左に見つかったニードルのインデックス（1から始まる）。一致がなかった場合は 0。[UInt8](../data-types/int-uint.md)。

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

`haystack` 内で最も左に見つかった `needle`<sub>i</sub> のインデックス `i`（1から始まる）を返し、一致がない場合は 0 を返します。大文字小文字を区別しません。

**構文**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う文字列。[String](../data-types/string.md)。
- `needle` — 検索する部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 最も左に見つかったニードルのインデックス（1から始まる）。一致がなかった場合は 0。[UInt8](../data-types/int-uint.md)。

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

`haystack` 内で最も左に見つかった `needle`<sub>i</sub> のインデックス `i`（1から始まる）を返し、一致がない場合は 0 を返します。`haystack` と `needle` が UTF-8 エンコードされた文字列であることを仮定します。

**構文**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う UTF-8 文字列。[String](../data-types/string.md)。
- `needle` — 検索する UTF-8 部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 最も左に見つかったニードルのインデックス（1から始まる）。一致がなかった場合は 0。[UInt8](../data-types/int-uint.md)。

**例**

UTF-8 文字列 `Hello World` が与えられた場合、UTF-8 文字列 `Hello` と `World` の最初のインデックスを見つけます。

クエリ:

```sql
SELECT multiSearchFirstIndexUTF8('\x48\x65\x6c\x6c\x6f\x20\x57\x6f\x72\x6c\x64',['\x57\x6f\x72\x6c\x64','\x48\x65\x6c\x6c\x6f']);
```

結果:

```response
1
```

## multiSearchFirstIndexCaseInsensitiveUTF8 {#multisearchfirstindexcaseinsensitiveutf8}

`haystack` 内で最も左に見つかった `needle`<sub>i</sub> のインデックス `i`（1から始まる）を返し、一致がない場合は 0 を返します。`haystack` と `needle` が UTF-8 エンコードされた文字列であることを仮定します。大文字小文字を区別しません。

**構文**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う UTF-8 文字列。[String](../data-types/string.md)。
- `needle` — 検索する UTF-8 部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 最も左に見つかったニードルのインデックス（1から始まる）。一致がなかった場合は 0。[UInt8](../data-types/int-uint.md)。

**例**

UTF-8 文字列 `HELLO WORLD` が与えられた場合、UTF-8 文字列 `hello` と `world` の最初のインデックスを見つけます。

クエリ:

```sql
SELECT multiSearchFirstIndexCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['\x68\x65\x6c\x6c\x6f','\x77\x6f\x72\x6c\x64']);
```

結果:

```response
1
```

## multiSearchAny {#multisearchany}

`haystack` 文字列に一致する文字列 `needle`<sub>i</sub> が少なくとも 1 つある場合は 1 を返し、それ以外の場合は 0 を返します。

関数 [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive)、[`multiSearchAnyUTF8`](#multisearchanyutf8) および [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) は、大文字小文字を区別しないおよび/または UTF-8 バリアントを提供します。

**構文**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う文字列。[String](../data-types/string.md)。
- `needle` — 検索する部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 一致が少なくとも 1 つあった場合は 1。
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

[multiSearchAny](#multisearchany) と同様ですが、大文字小文字を区別しません。

**構文**

```sql
multiSearchAnyCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う文字列。[String](../data-types/string.md)。
- `needle` — 検索する部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 少なくとも 1 つの大文字小文字を区別しない一致があった場合は 1。
- 一致がなかった場合は 0。

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

[multiSearchAny](#multisearchany) と同様ですが、`haystack` および `needle` 部分文字列が UTF-8 エンコードされた文字列であることを仮定します。

**構文**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索を行う UTF-8 文字列。[String](../data-types/string.md)。
- `needle` — 検索する UTF-8 部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 一致が少なくとも 1 つあった場合は 1。
- 一致がなかった場合は 0。

**例**

UTF-8 文字列として `ClickHouse` が与えられた場合、`C` （`\x43`）または `H` （`\x48`）が単語に含まれるかどうかを確認します。

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

- `haystack` — 検索を行う UTF-8 文字列。[String](../data-types/string.md)。
- `needle` — 検索する UTF-8 部分文字列の配列。[Array](../data-types/array.md)。

**戻り値**

- 少なくとも 1 つの大文字小文字を区別しない一致があった場合は 1。
- 一致がなかった場合は 0。

**例**

UTF-8 文字列として `ClickHouse` が与えられた場合、単語に `h` （`\x68`）が含まれているかどうかを確認します（大文字小文字は区別しない）。

クエリ:

```sql
SELECT multiSearchAnyCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x68']);
```

結果:

```response
1
```

## match {#match}

文字列 `haystack` が正規表現 `pattern` に一致するかどうかを返します。[re2正規表現構文](https://github.com/google/re2/wiki/Syntax)を使用します。

マッチングはUTF-8に基づいており、例えば `.` は、UTF-8で2バイトを使用して表現されるUnicodeコードポイント `¥` に一致します。正規表現にはヌルバイトを含めることができません。`haystack` または `pattern` が有効なUTF-8でない場合、動作は未定義となります。

re2のデフォルトの振る舞いとは異なり、`.` は改行にも一致します。これを無効にするには、パターンの先頭に `(?-s)` を追加します。

文字列内の部分文字列を検索したい場合は、関数 [like](#like) や [position](#position) を代わりに使用できます。これらはこの関数よりもはるかに高速に動作します。

**構文**

```sql
match(haystack, pattern)
```

エイリアス: `haystack REGEXP pattern operator`

## multiMatchAny {#multimatchany}

`match` と同様ですが、少なくとも1つのパターンが一致する場合は1を返し、それ以外の場合は0を返します。

:::note
`multi[Fuzzy]Match*()`系の関数は、(Vectorscan)[https://github.com/VectorCamp/vectorscan]ライブラリを使用します。そのため、ClickHouseがハイパースキャンのサポートでコンパイルされている場合のみ使用可能です。

すべてのハイパースキャンを使用する関数を無効にするには、設定 `SET allow_hyperscan = 0;` を使用します。

ベクトルスキャンの制限により、`haystack` 文字列の長さは 2<sup>32</sup> バイト未満である必要があります。

ハイパースキャンは、正規表現によるサービス拒否攻撃（ReDoS）に一般的に脆弱です（例えば、(ここ)[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova]、(ここ)[https://doi.org/10.1007/s10664-021-10033-1]および(ここ)[https://doi.org/10.1145/3236024.3236027]を参照）。提供されたパターンを注意深く確認することをお勧めします。
:::

文字列内の複数の部分文字列を検索したい場合は、[multiSearchAny](#multisearchany) 関数を代わりに使用できます。これにより、はるかに高速に動作します。

**構文**

```sql
multiMatchAny(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiMatchAnyIndex {#multimatchanyindex}

`multiMatchAny` と同様ですが、haystackと一致する任意のインデックスを返します。

**構文**

```sql
multiMatchAnyIndex(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiMatchAllIndices {#multimatchallindices}

`multiMatchAny` と同様ですが、haystack 内で一致するすべてのインデックスの配列を返します。

**構文**

```sql
multiMatchAllIndices(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiFuzzyMatchAny {#multifuzzymatchany}

`multiMatchAny` と同様ですが、一定の[編集距離](https://ja.wikipedia.org/wiki/%E7%B7%A8%E8%BE%9E%E8%B7%9D%E9%9B%A2)内で一致する任意のパターンがある場合は1を返します。この関数は、[hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) ライブラリの実験的機能に依存しており、一部のケースで遅くなることがあります。パフォーマンスは編集距離の値と使用されるパターンに依存しますが、常に非ファジー版に比べて高コストです。

:::note
`multiFuzzyMatch*()` 関数群は、ハイパースキャンの制限によりUTF-8正規表現をサポートしていません（バイトのシーケンスとして扱います）。
:::

**構文**

```sql
multiFuzzyMatchAny(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

`multiFuzzyMatchAny` と同様ですが、一定の編集距離内で `haystack` に一致する任意のインデックスを返します。

**構文**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

`multiFuzzyMatchAny` と同様ですが、一定の編集距離内で `haystack` と一致するすべてのインデックスを配列として返します。

**構文**

```sql
multiFuzzyMatchAllIndices(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```

## extract {#extract}

文字列内の正規表現の最初の一致を返します。`haystack` が `pattern` 正規表現に一致しない場合、空の文字列が返されます。 

正規表現にキャプチャグループがある場合、最初のキャプチャグループに対して入力文字列が一致します。

**構文**

```sql
extract(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。[String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax)を使用した正規表現。

**戻り値**

- `haystack` 文字列内の正規表現の最初の一致。[String](../data-types/string.md)。

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

サブパターンに関する動作は[`extract`](#extract) 関数と同様です。

**構文**

```sql
extractAll(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。[String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax)を使用した正規表現。

**戻り値**

- `haystack` 文字列内の正規表現の一致の配列。[Array](../data-types/array.md) ([String](../data-types/string.md))。

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

`pattern` 正規表現を使用して `haystack` 文字列のすべてのグループを一致させます。最初の配列には最初のグループに一致するすべてのフラグメントが含まれ、次の配列には2番目のグループに一致するすべてのフラグメントが含まれます。

この関数は [extractAllGroupsVertical](#extractallgroupsvertical) よりも遅くなります。

**構文**

```sql
extractAllGroupsHorizontal(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。[String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax)を使用した正規表現。グループを含む必要があり、各グループは括弧で囲む必要があります。`pattern` にグループが含まれていない場合、例外がスローされます。[String](../data-types/string.md)。

**戻り値**

- 一致の配列の配列。[Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列が返されます。
:::

**例**

```sql
SELECT extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果:

``` text
┌─extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','def','ghi'],['111','222','333']]                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## extractGroups {#extractgroups}

指定された入力文字列を与えられた正規表現で一致させ、マッチの配列の配列を返します。

**構文**

```sql
extractGroups(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。[String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax)を使用した正規表現。グループを含む必要があり、各グループは括弧で囲む必要があります。`pattern` にグループが含まれていない場合、例外がスローされます。[String](../data-types/string.md)。

**戻り値**

- 一致の配列の配列。[Array](../data-types/array.md)。

**例**

```sql
SELECT extractGroups('hello abc=111 world', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') AS result;
```

結果:

``` text
┌─result────────┐
│ ['abc','111'] │
└───────────────┘
```

## extractAllGroupsVertical {#extractallgroupsvertical}

`pattern` 正規表現を使用して `haystack` 文字列のすべてのグループを一致させます。各配列は、すべてのグループからの一致するフラグメントを含む配列を返します。フラグメントは `haystack` 内の出現順にグループ化されます。

**構文**

```sql
extractAllGroupsVertical(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。[String](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax)を使用した正規表現。グループを含む必要があり、各グループは括弧で囲む必要があります。`pattern` にグループが含まれていない場合、例外がスローされます。[String](../data-types/string.md)。

**戻り値**

- 一致の配列の配列。[Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列が返されます。
:::

**例**

```sql
SELECT extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果:

``` text
┌─extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','111'],['def','222'],['ghi','333']]                                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## like {#like}

文字列 `haystack` が LIKE 式 `pattern` に一致するかどうかを返します。

LIKE 式には通常の文字と次のメタシンボルを含めることができます：

- `%` は任意の数の任意の文字（ゼロ文字を含む）を示します。
- `_` は任意の単一の文字を示します。
- `\` はリテラル `%`、`_` および `\` をエスケープします。

マッチングはUTF-8に基づき、例えば `_` は、UTF-8で2バイトを使用して表現されるUnicodeコードポイント `¥` に一致します。

`haystack` または LIKE 式が有効なUTF-8でない場合、動作は未定義となります。

```html
自動的なUnicode正規化は行われません。そのため、[normalizeUTF8*()](https://clickhouse.com../functions/string-functions/)関数を使用できます。

文字 `%`、`_` および `\` （LIKEメタキャラクター）に一致させるには、バックスラッシュを前に付けてください： `\%`、`\_` および `\\`。バックスラッシュは、`%`、`_` または `\` 以外の文字の前につけられた場合、その特別な意味を失い（つまり、文字通りに解釈されます）、注意が必要です。また、ClickHouseでは、文字列内のバックスラッシュは[引用符で囲む必要があります](../syntax.md#string)。そのため、実際には `\\%`、`\\_` および `\\\\` と記述する必要があります。

形式が `%needle%` のLIKE式の場合、関数は `position` 関数と同じくらい速くなります。
その他のLIKE式は、内部的に正規表現に変換され、`match`関数と同様のパフォーマンスで実行されます。

**構文**

```sql
like(haystack, pattern)
```

エイリアス： `haystack LIKE pattern`（演算子）

## notLike {#notlike}

`like`と同様ですが、結果を否定します。

エイリアス： `haystack NOT LIKE pattern`（演算子）

## ilike {#ilike}

`like`と同様ですが、大文字と小文字を区別せずに検索します。

エイリアス： `haystack ILIKE pattern`（演算子）

## notILike {#notilike}

`ilike`と同様ですが、結果を否定します。

エイリアス： `haystack NOT ILIKE pattern`（演算子）

## ngramDistance {#ngramdistance}

`haystack`文字列と`needle`文字列の間の4-グラム距離を計算します。これには、2つの多集合の4-グラム間の対称差をカウントし、その合計のカーディナリティで正規化します。0から1の範囲の[Float32](../data-types/float.md/#float32-float64)を返します。結果が小さいほど、文字列は互いに類似しています。

関数[`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive)、[`ngramDistanceUTF8`](#ngramdistanceutf8)、[`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8)は、この関数の大文字と小文字を区別しないおよび/またはUTF-8のバリアントを提供します。

**構文**

```sql
ngramDistance(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。[文字列リテラル](../syntax#string)
- `needle`: 2番目の比較文字列。[文字列リテラル](../syntax#string)

**戻り値**

- 2つの文字列間の類似性を表す0から1の値。[Float32](../data-types/float.md/#float32-float64)

**実装の詳細**

この関数は、定数`needle`または`haystack`引数が32Kbを超えると例外をスローします。定数ではない`haystack`または`needle`引数が32Kbを超えると、距離は常に1になります。

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

2つの文字列が互いに少ない類似性を持つほど、結果は大きくなります。

クエリ：

```sql
SELECT ngramDistance('ClickHouse','House');
```

結果：

```response
0.5555556
```

## ngramDistanceCaseInsensitive {#ngramdistancecaseinsensitive}

[ngramDistance](#ngramdistance)の大文字小文字を区別しないバリアントを提供します。

**構文**

```sql
ngramDistanceCaseInsensitive(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。[文字列リテラル](../syntax#string)
- `needle`: 2番目の比較文字列。[文字列リテラル](../syntax#string)

**戻り値**

- 2つの文字列間の類似性を表す0から1の値。[Float32](../data-types/float.md/#float32-float64)

**例**

[ngramDistance](#ngramdistance)を使用すると、大文字と小文字の違いが類似性値に影響を与えます。

クエリ：

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

結果：

```response
0.71428573
```

[ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive)では、大文字小文字は無視されるため、同一の2つの文字列が大文字小文字の違いだけである場合、低い類似性値が返されます。

クエリ：

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

結果：

```response
0
```

## ngramDistanceUTF8 {#ngramdistanceutf8}

[ngramDistance](#ngramdistance)のUTF-8のバリアントを提供します。`needle`および`haystack`文字列がUTF-8エンコードされていることを前提としています。

**構文**

```sql
ngramDistanceUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初のUTF-8エンコードされた比較文字列。[文字列リテラル](../syntax#string)
- `needle`: 2番目のUTF-8エンコードされた比較文字列。[文字列リテラル](../syntax#string)

**戻り値**

- 2つの文字列間の類似性を表す0から1の値。[Float32](../data-types/float.md/#float32-float64)

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

[ngramDistanceUTF8](#ngramdistanceutf8)の大文字小文字を区別しないバリアントを提供します。

**構文**

```sql
ngramDistanceCaseInsensitiveUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初のUTF-8エンコードされた比較文字列。[文字列リテラル](../syntax#string)
- `needle`: 2番目のUTF-8エンコードされた比較文字列。[文字列リテラル](../syntax#string)

**戻り値**

- 2つの文字列間の類似性を表す0から1の値。[Float32](../data-types/float.md/#float32-float64)

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

`ngramDistance`と同様ですが、`needle`文字列と`haystack`文字列の間の非対称差を計算します。つまり、`needle`からのn-グラムの数から共通のn-グラムの数を引いたものを、`needle` n-グラムの数で正規化します。0から1の範囲の[Float32](../data-types/float.md/#float32-float64)を返します。結果が大きいほど、`needle`が`haystack`にある可能性が高くなります。この関数は、ファジー文字列検索に便利です。また、関数[`soundex`](../../sql-reference/functions/string-functions#soundex)も参照してください。

関数[`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive)、[`ngramSearchUTF8`](#ngramsearchutf8)、[`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8)は、この関数の大文字小文字を区別しないおよび/またはUTF-8のバリアントを提供します。

**構文**

```sql
ngramSearch(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。[文字列リテラル](../syntax#string)
- `needle`: 2番目の比較文字列。[文字列リテラル](../syntax#string)

**戻り値**

- `needle`が`haystack`に存在する可能性を表す0から1の値。[Float32](../data-types/float.md/#float32-float64)

**実装の詳細**

:::note
UTF-8バリアントは3-グラム距離を使用します。これは完全に公平なn-グラム距離ではありません。n-グラムをハッシュ化するために2バイトのハッシュを使用し、その後、これらのハッシュテーブル間の（非）対称差を計算します - 衝突が発生する可能性があります。UTF-8の大文字小文字を区別しない形式では、公平な`tolower`関数は使用せず、各コードポイントバイトの5ビット目（ゼロから始まる）をゼロにし、バイトが1より多い場合はゼロ番目のバイトの最初のビットをゼロにしています - これにより、ラテン文字およびほとんどのキリル文字で機能します。
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

[ngramSearch](#ngramsearch)の大文字小文字を区別しないバリアントを提供します。

**構文**

```sql
ngramSearchCaseInsensitive(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。[文字列リテラル](../syntax#string)
- `needle`: 2番目の比較文字列。[文字列リテラル](../syntax#string)

**戻り値**

- `needle`が`haystack`に存在する可能性を表す0から1の値。[Float32](../data-types/float.md/#float32-float64)

結果が大きいほど、`needle`が`haystack`に存在する可能性が高くなります。

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

[ngramSearch](#ngramsearch)のUTF-8バリアントを提供します。この場合、`needle`と`haystack`はUTF-8エンコードされた文字列であると想定されます。

**構文**

```sql
ngramSearchUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初のUTF-8エンコードされた比較文字列。[文字列リテラル](../syntax#string)
- `needle`: 2番目のUTF-8エンコードされた比較文字列。[文字列リテラル](../syntax#string)

**戻り値**

- `needle`が`haystack`に存在する可能性を表す0から1の値。[Float32](../data-types/float.md/#float32-float64)

結果が大きいほど、`needle`が`haystack`に存在する可能性が高くなります。

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

[ngramSearchUTF8](#ngramsearchutf8)の大文字小文字を区別しないバリアントを提供します。

**構文**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初のUTF-8エンコードされた比較文字列。[文字列リテラル](../syntax#string)
- `needle`: 2番目のUTF-8エンコードされた比較文字列。[文字列リテラル](../syntax#string)

**戻り値**

- `needle`が`haystack`に存在する可能性を表す0から1の値。[Float32](../data-types/float.md/#float32-float64)

結果が大きいほど、`needle`が`haystack`に存在する可能性が高くなります。

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

サブストリング`needle`が文字列`haystack`にどのくらい出現するかを返します。

関数[`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive)および[`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8)は、それぞれ大文字小文字を区別しないおよび大文字小文字を区別しない + UTF-8のバリアントを提供します。

**構文**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が実行される文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `needle` — 検索されるサブストリング。[文字列](../data-types/string.md)。
- `start_pos` – 検索を開始する`haystack`内の位置（1ベース）。[UInt](../data-types/int-uint.md)。オプション。

**戻り値**

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

`start_pos`引数を使用した例：

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

サブストリング`needle`が文字列`haystack`にどのくらい出現するかを返します。大文字小文字は無視します。

**構文**

```sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が実行される文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `needle` — 検索されるサブストリング。[文字列](../data-types/string.md)。
- `start_pos` – 検索を開始する`haystack`内の位置（1ベース）。[UInt](../data-types/int-uint.md)。オプション。

**戻り値**

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

`start_pos`引数を使用した例：

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

サブストリング`needle`が文字列`haystack`にどのくらい出現するかを返します。大文字小文字は無視し、`haystack`がUTF-8文字列であると想定します。

**構文**

```sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が実行されるUTF-8文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `needle` — 検索されるサブストリング。[文字列](../data-types/string.md)。
- `start_pos` – 検索を開始する`haystack`内の位置（1ベース）。[UInt](../data-types/int-uint.md)。オプション。

**戻り値**

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

`start_pos`引数を使用した例：

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

`haystack`内の`pattern`に対する正規表現の一致回数を返します。

**構文**

```sql
countMatches(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。[文字列](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax)の正規表現。[文字列](../data-types/string.md)。

**戻り値**

- 一致数。[UInt64](../data-types/int-uint.md)。

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

`haystack`内のパターンに対する正規表現の一致回数を返します。`countMatches`に似ていますが、大文字と小文字は無視されます。

**構文**

```sql
countMatchesCaseInsensitive(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。[文字列](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax)の正規表現。[文字列](../data-types/string.md)。

**戻り値**

- 一致数。[UInt64](../data-types/int-uint.md)。

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

`haystack`内で正規表現パターンに一致し、正規表現グループインデックスに対応する最初の文字列を抽出します。

**構文**

```sql
regexpExtract(haystack, pattern[, index])
```

エイリアス： `REGEXP_EXTRACT(haystack, pattern[, index])`。

**引数**

- `haystack` — 正規表現パターンに一致する文字列。[文字列](../data-types/string.md)。
- `pattern` — 文字列、正規表現式、定数である必要があります。[文字列](../data-types/string.md)。
- `index` – 0以上の整数で、デフォルトは1です。抽出する正規表現グループを表します。[UIntまたはInt](../data-types/int-uint.md)。オプション。

**戻り値**

`pattern`には複数の正規表現グループが含まれる可能性があり、`index`はどの正規表現グループを抽出するかを示します。インデックス0は、全体の正規表現に一致することを意味します。[文字列](../data-types/string.md)。

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

`needle`が`haystack`の部分列である場合は1を、それ以外の場合は0を返します。
文字列の部分列は、与えられた文字列から0以上の要素を削除して変更せずに残りの要素の順序を保持できるシーケンスです。

**構文**

```sql
hasSubsequence(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。[文字列](../data-types/string.md)。
- `needle` — 検索される部分列。[文字列](../data-types/string.md)。

**戻り値**

- `needle`が`haystack`の部分列である場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

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

[hasSubsequence](#hassubsequence)と同様ですが、大文字と小文字を区別せずに検索します。

**構文**

```sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。[文字列](../data-types/string.md)。
- `needle` — 検索される部分列。[文字列](../data-types/string.md)。

**戻り値**

- `needle`が`haystack`の部分列である場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

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

[hasSubsequence](#hassubsequence)と同様ですが、`haystack`と`needle`がUTF-8エンコードされた文字列であると仮定します。

**構文**

```sql
hasSubsequenceUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。UTF-8エンコードされた[文字列](../data-types/string.md)。
- `needle` — 検索される部分列。UTF-8エンコードされた[文字列](../data-types/string.md)。

**戻り値**

- `needle`が`haystack`の部分列である場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

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

[hasSubsequenceUTF8](#hassubsequenceutf8)と同様ですが、大文字と小文字を区別せずに検索します。

**構文**

```sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が実行される文字列。UTF-8エンコードされた[文字列](../data-types/string.md)。
- `needle` — 検索される部分列。UTF-8エンコードされた[文字列](../data-types/string.md)。

**戻り値**

- `needle`が`haystack`の部分列である場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

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

与えられたトークンがhaystackに存在する場合は1を、そうでない場合は0を返します。

**構文**

```sql
hasToken(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `token`: 2つの非英数字ASCII文字の間の最大長サブストリング（またはhaystackの境界）。

**戻り値**

- トークンがhaystackに存在する場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列でなければなりません。tokenbf_v1インデックス特化にサポートされています。

**例**

クエリ：

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```

## hasTokenOrNull {#hastokenornull}

与えられたトークンが存在する場合は1、存在しない場合は0、トークンが不正な形式の場合はnullを返します。

**構文**

```sql
hasTokenOrNull(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `token`: 2つの非英数字ASCII文字の間の最大長サブストリング（またはhaystackの境界）。

**戻り値**

- トークンがhaystackに存在する場合は1、存在しない場合は0、不正な形式の場合は[`null`](../data-types/nullable.md)。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列でなければなりません。tokenbf_v1インデックス特化にサポートされています。

**例**

`hasToken`が不正な形式のトークンに対してエラーをスローする場合、`hasTokenOrNull`は不正な形式のトークンに対してnullを返します。

クエリ：

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```

## hasTokenCaseInsensitive {#hastokencaseinsensitive}

与えられたトークンがhaystackに存在する場合は1を、そうでない場合は0を返します。大文字小文字は無視されます。

**構文**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `token`: 2つの非英数字ASCII文字の間の最大長サブストリング（またはhaystackの境界）。

**戻り値**

- トークンがhaystackに存在する場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列でなければなりません。tokenbf_v1インデックス特化にサポートされています。

**例**

クエリ：

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```

## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitiveornull}

与えられたトークンがhaystackに存在する場合は1を、そうでない場合は0を返します。大文字小文字は無視され、不正な形式のトークンの場合はnullを返します。

**構文**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**パラメータ**

- `haystack`: 検索が実行される文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `token`: 2つの非英数字ASCII文字の間の最大長サブストリング（またはhaystackの境界）。

**戻り値**

- トークンがhaystackに存在する場合は1、存在しない場合は0、そうでない場合はトークンが不正な形式であるときに[`null`](../data-types/nullable.md)を返します。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数文字列でなければなりません。tokenbf_v1インデックス特化にサポートされています。

**例**

`hasTokenCaseInsensitive`が不正な形式のトークンに対してエラーをスローする場合、`hasTokenCaseInsensitiveOrNull`は不正な形式のトークンに対してnullを返します。

クエリ：

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```
