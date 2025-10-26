---
'description': 'Functions for Searching in Strings に関するドキュメント'
'sidebar_label': '文字列検索'
'slug': '/sql-reference/functions/string-search-functions'
'title': '文字列検索のための関数'
'doc_type': 'reference'
---


# 文字列内検索のための関数

このセクションのすべての関数は、デフォルトで大文字と小文字を区別して検索します。大文字小文字を区別しない検索は、通常、別の関数バリアントで提供されています。

:::note
大文字小文字を区別しない検索は、英語の小文字・大文字ルールに従います。例えば、英語での大文字の `i` は `I` ですが、トルコ語では `İ` です - 英語以外の言語に対する結果は予期しないものとなる場合があります。
:::

このセクションの関数は、検索対象の文字列（ここでは `haystack` と呼ばれます）および検索文字列（ここでは `needle` と呼ばれます）が、シングルバイトエンコードテキストであると仮定しています。この仮定が崩れると、例外はスローされず、結果は未定義です。UTF-8エンコードされた文字列での検索は、通常、別の関数バリアントで提供されています。同様に、UTF-8 関数バリアントが使用され、入力文字列がUTF-8エンコードテキストでない場合も例外はスローされず、結果は未定義です。自動的なUnicode正規化は行われませんが、そのためには [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 関数を使用できます。

[一般的な文字列関数](string-functions.md) と [文字列内の置換のための関数](string-replace-functions.md) は別途説明されています。
## position {#position}

文字列 `haystack` 内の部分文字列 `needle` の位置（バイト単位、1から始まる）を返します。

**構文**

```sql
position(haystack, needle[, start_pos])
```

エイリアス:
- `position(needle IN haystack)`

**引数**

- `haystack` — 検索を行う文字列。 [String](../data-types/string.md) または [Enum](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [String](../data-types/string.md)。
- `start_pos` – 検索を開始する `haystack` 内の位置（1ベース）。 [UInt](../data-types/int-uint.md)。オプション。

**戻り値**

- 部分文字列が見つかった場合、1からカウントしバイト単位の開始位置。 [UInt64](../data-types/int-uint.md)。
- 部分文字列が見つからなかった場合、0。 [UInt64](../data-types/int-uint.md)。

部分文字列 `needle` が空の場合、次のルールが適用されます：
- `start_pos` が指定されていない場合：`1` を返す
- `start_pos = 0` の場合：`1` を返す
- `start_pos >= 1` かつ `start_pos <= length(haystack) + 1` の場合：`start_pos` を返す
- それ以外の場合：`0` を返す

同じルールは、関数 `locate`、`positionCaseInsensitive`、`positionUTF8` および `positionCaseInsensitiveUTF8` にも適用されます。

**例**

クエリ：

```sql
SELECT position('Hello, world!', '!');
```

結果：

```text
┌─position('Hello, world!', '!')─┐
│                             13 │
└────────────────────────────────┘
```

`start_pos` 引数を使用した例：

クエリ：

```sql
SELECT
    position('Hello, world!', 'o', 1),
    position('Hello, world!', 'o', 7)
```

結果：

```text
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

空の `needle` 部分文字列の例：

クエリ：

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

結果：

```text
┌─position('abc', '')─┬─position('abc', '', 0)─┬─position('abc', '', 1)─┬─position('abc', '', 2)─┬─position('abc', '', 3)─┬─position('abc', '', 4)─┬─position('abc', '', 5)─┐
│                   1 │                      1 │                      1 │                      2 │                      3 │                      4 │                      0 │
└─────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘
```
## locate {#locate}

[position](#position) と同様ですが、引数 `haystack` と `locate` が入れ替わります。

この関数の動作は ClickHouse のバージョンによって依存します：
- v24.3 より前のバージョンでは、`locate` は関数 `position` のエイリアスであり、引数 `(haystack, needle[, start_pos])` を受け入れていました。
- v24.3 以降では、`locate` は個別の関数（MySQLとの互換性向上のため）であり、引数 `(needle, haystack[, start_pos])` を受け入れます。以前の動作は、設定 [function_locate_has_mysql_compatible_argument_order = false](/operations/settings/settings#function_locate_has_mysql_compatible_argument_order) を使用して復元できます。

**構文**

```sql
locate(needle, haystack[, start_pos])
```
## positionCaseInsensitive {#positioncaseinsensitive}

[機能](#position) の大文字小文字を区別しないバリアント。

**例**

クエリ：

```sql
SELECT positionCaseInsensitive('Hello, world!', 'hello');
```

結果：

```text
┌─positionCaseInsensitive('Hello, world!', 'hello')─┐
│                                                 1 │
└───────────────────────────────────────────────────┘
```
## positionUTF8 {#positionutf8}

[機能](#position) と同様ですが、`haystack` と `needle` がUTF-8エンコードされた文字列であると仮定します。

**例**

関数 `positionUTF8` は、文字 `ö`（二等点で表される）を単一のUnicodeコードポイントとして正しくカウントします：

クエリ：

```sql
SELECT positionUTF8('Motörhead', 'r');
```

結果：

```text
┌─position('Motörhead', 'r')─┐
│                          5 │
└────────────────────────────┘
```
## positionCaseInsensitiveUTF8 {#positioncaseinsensitiveutf8}

[機能](#positionutf8) と同様ですが、大文字小文字を区別せずに検索します。
## multiSearchAllPositions {#multisearchallpositions}

[機能](#position) と同様ですが、`haystack` 文字列内の複数の `needle` 部分文字列の位置を (バイト単位、1から始まる) 配列として返します。

:::note
すべての `multiSearch*()` 関数は、最大 2<sup>8</sup> の needles をサポートします。
:::

**構文**

```sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**戻り値**

- 部分文字列が見つかった場合、1からカウントしバイト単位の開始位置の配列。
- 部分文字列が見つからなかった場合、0。

**例**

クエリ：

```sql
SELECT multiSearchAllPositions('Hello, World!', ['hello', '!', 'world']);
```

結果：

```text
┌─multiSearchAllPositions('Hello, World!', ['hello', '!', 'world'])─┐
│ [0,13,0]                                                          │
└───────────────────────────────────────────────────────────────────┘
```
## multiSearchAllPositionsCaseInsensitive {#multisearchallpositionscaseinsensitive}

[機能](#multisearchallpositions) と同様ですが、大文字小文字を無視します。

**構文**

```sql
multiSearchAllPositionsCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**戻り値**

- 部分文字列が見つかった場合、1からカウントしバイト単位の開始位置の配列。
- 部分文字列が見つからなかった場合、0。

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

[機能](#multisearchallpositions) と同様ですが、`haystack` と `needle` 部分文字列がUTF-8エンコードされた文字列であると仮定します。

**構文**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8エンコードされた文字列。 [String](../data-types/string.md)。
- `needle` — 検索されるUTF-8エンコードされた部分文字列。 [Array](../data-types/array.md)。

**戻り値**

- 部分文字列が見つかった場合、1からカウントしバイト単位の開始位置の配列。
- 部分文字列が見つからなかった場合、0。

**例**

`ClickHouse` をUTF-8文字列として与え、`C`（`\x43`）および `H`（`\x48`）の位置を見つけます。

クエリ：

```sql
SELECT multiSearchAllPositionsUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

結果：

```response
["1","6"]
```
## multiSearchAllPositionsCaseInsensitiveUTF8 {#multisearchallpositionscaseinsensitiveutf8}

[機能](#multisearchallpositionsutf8) と同様ですが、大文字小文字を無視します。

**構文**

```sql
multiSearchAllPositionsCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8エンコードされた文字列。 [String](../data-types/string.md)。
- `needle` — 検索されるUTF-8エンコードされた部分文字列。 [Array](../data-types/array.md)。

**戻り値**

- 部分文字列が見つかった場合、1からカウントしバイト単位の開始位置の配列。
- 部分文字列が見つからなかった場合、0。

**例**

`ClickHouse` をUTF-8文字列として与え、`c`（`\x63`）および `h`（`\x68`）の位置を見つけます。

クエリ：

```sql
SELECT multiSearchAllPositionsCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x63','\x68']);
```

結果：

```response
["1","6"]
```
## multiSearchFirstPosition {#multisearchfirstposition}

[`position`](#position) と同様ですが、複数の `needle` 文字列のどれかに一致する `haystack` 文字列内の最も左側のオフセットを返します。

関数 [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive)、[`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) および [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) は、この関数の大文字小文字を区別しないおよび/またはUTF-8バリアントを提供します。

**構文**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列。 [Array](../data-types/array.md)。

**戻り値**

- 複数の `needle` 文字列のいずれかに一致する `haystack` 文字列内の最も左側のオフセット。
- 一致がなかった場合、0。

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

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、大文字小文字を無視します。

**構文**

```sql
multiSearchFirstPositionCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 複数の `needle` 文字列のいずれかに一致する `haystack` 文字列内の最も左側のオフセット。
- 一致がなかった場合、0。

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

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、`haystack` と `needle` がUTF-8文字列であると仮定します。

**構文**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8文字列。 [String](../data-types/string.md)。
- `needle` — 検索されるUTF-8部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 複数の `needle` 文字列のいずれかに一致する `haystack` 文字列内の最も左側のオフセット。
- 一致がなかった場合、0。

**例**

UTF-8文字列 `hello world` 内の、与えられたneedleに一致する最も左側のオフセットを見つけます。

クエリ：

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

結果：

```response
2
```
## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

[`multiSearchFirstPosition`](#multisearchfirstposition) と同様ですが、`haystack` と `needle` がUTF-8文字列であり、大文字小文字を無視します。

**構文**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8文字列。 [String](../data-types/string.md)。
- `needle` — 検索されるUTF-8部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 複数の `needle` 文字列のいずれかに一致する `haystack` 文字列内の最も左側のオフセット（大文字小文字を無視）。
- 一致がなかった場合、0。

**例**

UTF-8文字列 `HELLO WORLD` 内の、与えられたneedleに一致する最も左側のオフセットを見つけます。

クエリ：

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

結果：

```response
2
```
## multiSearchFirstIndex {#multisearchfirstindex}

`haystack` 文字列内の最も左側に見つかった `needle<sub>i</sub>` のインデックス `i`（1から開始）を返し、それ以外の場合は 0 を返します。

関数 [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive)、[`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8) および [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) は、この関数の大文字小文字を区別しないおよび/またはUTF-8バリアントを提供します。

**構文**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```
**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 最も左側に見つかった `needle` のインデックス（1から開始）。一致がなかった場合は 0。 [UInt8](../data-types/int-uint.md)。

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

`haystack` 文字列内の最も左側に見つかった `needle<sub>i</sub>` のインデックス `i`（1から開始）を返し、それ以外の場合は 0 を返します。大文字小文字を無視します。

**構文**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 最も左側に見つかった `needle` のインデックス（1から開始）。一致がなかった場合は 0。 [UInt8](../data-types/int-uint.md)。

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

`haystack` 文字列内の最も左側に見つかった `needle<sub>i</sub>` のインデックス `i`（1から開始）を返し、それ以外の場合は 0 を返します。`haystack` と `needle` がUTF-8エンコードされた文字列であると仮定します。

**構文**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8文字列。 [String](../data-types/string.md)。
- `needle` — 検索されるUTF-8部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 最も左側に見つかった `needle` のインデックス（1から開始）。一致がなかった場合は 0。 [UInt8](../data-types/int-uint.md)。

**例**

`Hello World` をUTF-8文字列として与え、UTF-8文字列 `Hello` と `World` の最初のインデックスを見つけます。

クエリ：

```sql
SELECT multiSearchFirstIndexUTF8('\x48\x65\x6c\x6c\x6f\x20\x57\x6f\x72\x6c\x64',['\x57\x6f\x72\x6c\x64','\x48\x65\x6c\x6c\x6f']);
```

結果：

```response
1
```
## multiSearchFirstIndexCaseInsensitiveUTF8 {#multisearchfirstindexcaseinsensitiveutf8}

`haystack` 文字列内の最も左側に見つかった `needle<sub>i</sub>` のインデックス `i`（1から開始）を返し、それ以外の場合は 0 を返します。`haystack` と `needle` がUTF-8エンコードされた文字列であると仮定します。大文字小文字を無視します。

**構文**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8文字列。 [String](../data-types/string.md)。
- `needle` — 検索されるUTF-8部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 最も左側に見つかった `needle` のインデックス（1から開始）。一致がなかった場合は 0。 [UInt8](../data-types/int-uint.md)。

**例**

`HELLO WORLD` をUTF-8文字列として与え、UTF-8文字列 `hello` と `world` の最初のインデックスを見つけます。

クエリ：

```sql
SELECT multiSearchFirstIndexCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['\x68\x65\x6c\x6c\x6f','\x77\x6f\x72\x6c\x64']);
```

結果：

```response
1
```
## multiSearchAny {#multisearchany}

文字列 `haystack` に対して、少なくとも1つの文字列 `needle<sub>i</sub>` が一致する場合は1を返し、それ以外の場合は0を返します。

関数 [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive)、[`multiSearchAnyUTF8`](#multisearchanyutf8) および [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) は、この関数の大文字小文字を区別しないおよび/またはUTF-8バリアントを提供します。

**構文**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 一致があった場合は1。
- 一致がなかった場合は0。

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

[機能](#multisearchany) と同様ですが、大文字小文字を無視します。

**構文**

```sql
multiSearchAnyCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われる文字列。 [String](../data-types/string.md)。
- `needle` — 検索される部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 大文字小文字を無視した一致があった場合は1。
- 一致がなかった場合は0。

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

[機能](#multisearchany) と同様ですが、`haystack` と `needle` の部分文字列がUTF-8エンコードされた文字列であると仮定します。

**構文**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8文字列。 [String](../data-types/string.md)。
- `needle` — 検索されるUTF-8部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 一致があった場合は1。
- 一致がなかった場合は0。

**例**

`ClickHouse` をUTF-8文字列として与え、単語内に `C`（'\x43'）または `H`（'\x48'）の文字があるかどうかを確認します。

クエリ：

```sql
SELECT multiSearchAnyUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

結果：

```response
1
```
## multiSearchAnyCaseInsensitiveUTF8 {#multisearchanycaseinsensitiveutf8}

[機能](#multisearchanyutf8) と同様ですが、大文字小文字を無視します。

**構文**

```sql
multiSearchAnyCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**引数**

- `haystack` — 検索が行われるUTF-8文字列。 [String](../data-types/string.md)。
- `needle` — 検索されるUTF-8部分文字列の配列。 [Array](../data-types/array.md)。

**戻り値**

- 大文字小文字を無視した一致があった場合は1。
- 一致がなかった場合は0。

**例**

`ClickHouse` をUTF-8文字列として与え、単語内に `h`（'\x68'）の文字があるかどうかを確認します（ケースを無視します）。

クエリ：

```sql
SELECT multiSearchAnyCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x68']);
```

結果：

```response
1
```
## hasAnyTokens {#hasanytokens}

:::note
この関数は、設定 [allow_experimental_full_text_index](/operations/settings/settings#allow_experimental_full_text_index) が有効な場合にのみ使用できます。
:::

文字列 `input` 列に対して、少なくとも1つの文字列 `needle<sub>i</sub>` が一致する場合は1を返し、それ以外の場合は0を返します。

**構文**

```sql
hasAnyTokens(input, ['needle1', 'needle2', ..., 'needleN'])
```

**引数**

- `input` — 入力列。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `needles` — 検索されるトークン。最大64トークンをサポートします。 [Array](../data-types/array.md)（[String](../data-types/string.md)）。

:::note
列 `input` は [テキストインデックス][../../engines/table-engines/mergetree-family/invertedindexes.md] を持っている必要があります。
:::

`input` 文字列は、インデックス定義のトークナイザーによってトークン化されます。

各 `needle` 配列要素トークン<sub>i</sub> は、単一のトークンと見なされ、さらなるトークン化は行われません。
例えば、`tokenizer = ngrams(5)` のインデックスで `ClickHouse` を検索したい場合、以下のようなトークンを提供します：`['Click', 'lickH', 'ickHo', 'ckHou', 'kHous', 'House']`。
トークンを生成するには、[tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 関数を使用できます。
重複トークンは無視されます。例えば `['ClickHouse', 'ClickHouse']` は `['ClickHouse']` と同じです。

**戻り値**

- 一致があった場合は1。
- 一致がなかった場合は0。

**例**

クエリ：

```sql
CREATE TABLE table (
    id UInt32,
    msg String,
    INDEX idx(msg) TYPE text(tokenizer = splitByString(['()', '\\'])
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO table VALUES (1, '()a,\\bc()d'), (2, '()\\a()bc\\d'), (3, ',()a\\,bc,(),d,');

SELECT count() FROM table WHERE hasAnyTokens(msg, ['a', 'd']);
```

結果：

```response
3
```

**`tokens` 関数を使用してトークンを生成**

クエリ：

```sql
SELECT count() FROM table WHERE hasAnyTokens(msg, tokens('a()d', 'splitByString', ['()', '\\']));
```

結果：

```response
3
```
## hasAllTokens {#hasalltokens}

:::note
この関数は、設定 [allow_experimental_full_text_index](/operations/settings/settings#allow_experimental_full_text_index) が有効な場合にのみ使用できます。
:::

[hasAnyTokens](#hasanytokens) と同様ですが、すべての文字列 `needle<sub>i</sub>` が `input` 列に一致する場合のみ1を返し、それ以外の場合は0を返します。

**構文**

```sql
hasAllTokens(input, ['needle1', 'needle2', ..., 'needleN'])
```

**引数**

- `input` — 入力列。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `needles` — 検索されるトークン。最大64トークンをサポートします。 [Array](../data-types/array.md)（[String](../data-types/string.md)）。

:::note
列 `input` は [テキストインデックス][../../engines/table-engines/mergetree-family/invertedindexes.md] を持っている必要があります。
:::

`input` 文字列は、インデックス定義のトークナイザーによってトークン化されます。

各 `needle` 配列要素トークン<sub>i</sub> は、単一のトークンと見なされ、さらなるトークン化は行われません。
例えば、`tokenizer = ngrams(5)` のインデックスで `ClickHouse` を検索したい場合、以下のようなトークンを提供します：`['Click', 'lickH', 'ickHo', 'ckHou', 'kHous', 'House']`。
トークンを生成するには、[tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens) 関数を使用できます。
重複トークンは無視されます。例えば `['ClickHouse', 'ClickHouse']` は `['ClickHouse']` と同じです。

**戻り値**

- すべてのトークンが一致した場合は1。
- 一致しなかった場合は0。

**例**

クエリ：

```sql
CREATE TABLE table (
    id UInt32,
    msg String,
    INDEX idx(msg) TYPE text(tokenizer = splitByString(['()', '\\'])
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO table VALUES (1, '()a,\\bc()d'), (2, '()\\a()bc\\d'), (3, ',()a\\,bc,(),d,');

SELECT count() FROM table WHERE hasAllTokens(msg, ['a', 'd']);
```

結果：

```response
1
```

**`tokens` 関数を使用してトークンを生成**

クエリ：

```sql
SELECT count() FROM table WHERE hasAllTokens(msg, tokens('a()d', 'splitByString', ['()', '\\']));
```

結果：

```response
1
```
## match {#match}

文字列 `haystack` が正規表現 `pattern` に一致するかどうかを返します。これは [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) に従います。

マッチングはUTF-8に基づいています。例として、`.` は二バイトで表現されるUnicodeコードポイント `¥` に一致します。正規表現にはヌルバイトを含めてはいけません。`haystack` または `pattern` が無効なUTF-8の場合、その動作は未定義です。

re2のデフォルトの動作とは異なり、`.` は改行に一致します。これを無効にするには、パターンの最初に `(?-s)` を前置します。

文字列内の部分文字列を検索したい場合は、[like](#like) や [position](#position) のような関数を使用することができます - これらはこの関数よりもはるかに高速です。

**構文**

```sql
match(haystack, pattern)
```

エイリアス：`haystack REGEXP pattern operator`
## multiMatchAny {#multimatchany}

`match` と同様ですが、少なくとも1つのパターンが一致すれば1を返し、それ以外の場合は0を返します。

:::note
`multi[Fuzzy]Match*()` 系の関数は (Vectorscan)[https://github.com/VectorCamp/vectorscan] ライブラリを使用します。したがって、ClickHouse がベクトルスキャンのサポートを有効にしてコンパイルされている場合にのみ使用可能です。

すべてのハイパースキャンを使用する関数をオフにするには、設定 `SET allow_hyperscan = 0;` を使用します。

ベクトルスキャンの制限により、`haystack` 文字列は 2<sup>32</sup> バイト未満でなければなりません。

ハイパースキャンは、一般に正規表現サービス拒否（ReDoS）攻撃に脆弱であるため、提供されるパターンを慎重に確認することをお勧めします。
:::

文字列内の複数の部分文字列を検索したい場合は、[multiSearchAny](#multisearchany) 関数を使用することができます - これはこの関数よりもはるかに高速です。

**構文**

```sql
multiMatchAny(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiMatchAnyIndex {#multimatchanyindex}

`multiMatchAny` と同様ですが、`haystack` に一致する任意のインデックスを返します。

**構文**

```sql
multiMatchAnyIndex(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiMatchAllIndices {#multimatchallindices}

`multiMatchAny` と同様ですが、`haystack` に一致するすべてのインデックスの配列を返します。

**構文**

```sql
multiMatchAllIndices(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAny {#multifuzzymatchany}

`multiMatchAny` と同様ですが、常に一定の [編集距離](https://en.wikipedia.org/wiki/Edit_distance) 内で `haystack` に一致する場合は1を返します。この関数は [hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) ライブラリの実験機能に依存しており、一部のコーナーケースでは遅くなることがあります。パフォーマンスは編集距離の値やパターンによって異なりますが、常に非ファジー系のバリアントよりもコストがかかります。

:::note
`multiFuzzyMatch*()` 系の関数は、ハイパースキャンの制限により、UTF-8正規表現をサポートしていません（バイト列として扱われます）。
:::

**構文**

```sql
multiFuzzyMatchAny(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

`multiFuzzyMatchAny` と同様ですが、一定の編集距離内で `haystack` に一致する任意のインデックスを返します。

**構文**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

`multiFuzzyMatchAny` と同様ですが、一定の編集距離内で `haystack` に一致するすべてのインデックスの配列を返します。

**構文**

```sql
multiFuzzyMatchAllIndices(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## extract {#extract}

文字列内の正規表現の最初の一致を返します。
`haystack` が `pattern` 正規表現に一致しない場合、空の文字列が返されます。

正規表現にキャプチャグループがある場合、関数は入力文字列を最初のキャプチャグループに対してマッチさせます。

**構文**

```sql
extract(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) の正規表現。

**戻り値**

- `haystack` 文字列内の正規表現の最初の一致。 [String](../data-types/string.md)。

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

文字列内の正規表現のすべての一致を配列として返します。`haystack` が `pattern` 正規表現に一致しない場合、空の文字列が返されます。

サブパターンに関する動作は、関数 [`extract`](#extract) と同じです。

**構文**

```sql
extractAll(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) の正規表現。

**戻り値**

- `haystack` 文字列内の正規表現の一致の配列。 [Array](../data-types/array.md)（[String](../data-types/string.md)）。

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

`haystack` 文字列のすべてのグループを `pattern` 正規表現を使用してマッチさせます。最初の配列には最初のグループに一致するすべてのフラグメントが含まれ、次の配列には2番目のグループに一致するものが含まれます。

この関数は [extractAllGroupsVertical](#extractallgroupsvertical) より遅いです。

**構文**

```sql
extractAllGroupsHorizontal(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) の正規表現。グループを含む必要があり、各グループは括弧で囲まれます。`pattern` にグループが含まれていない場合、例外がスローされます。 [String](../data-types/string.md)。

**戻り値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列が返されます。
:::

**例**

```sql
SELECT extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果：

```text
┌─extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','def','ghi'],['111','222','333']]                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```
## extractGroups {#extractgroups}

与えられた入力文字列を与えられた正規表現とマッチさせ、マッチの配列の配列を返します。

**構文**

```sql
extractGroups(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) の正規表現。グループを含む必要があり、各グループは括弧で囲まれます。`pattern` にグループが含まれていない場合、例外がスローされます。 [String](../data-types/string.md)。

**戻り値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

**例**

```sql
SELECT extractGroups('hello abc=111 world', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') AS result;
```

結果：

```text
┌─result────────┐
│ ['abc','111'] │
└───────────────┘
```
## extractAllGroupsVertical {#extractallgroupsvertical}

`haystack` 文字列のすべてのグループを `pattern` 正規表現を使用してマッチさせます。すべてのグループからの一致フラグメントを含む各配列を返します。フラグメントは `haystack` 内での出現順にグループ化されます。

**構文**

```sql
extractAllGroupsVertical(haystack, pattern)
```

**引数**

- `haystack` — 入力文字列。 [String](../data-types/string.md)。
- `pattern` — [re2 正規表現構文](https://github.com/google/re2/wiki/Syntax) の正規表現。グループを含む必要があり、各グループは括弧で囲まれます。`pattern` にグループが含まれていない場合、例外がスローされます。 [String](../data-types/string.md)。

**戻り値**

- 一致の配列の配列。 [Array](../data-types/array.md)。

:::note
`haystack` が `pattern` 正規表現に一致しない場合、空の配列が返されます。
:::

**例**

```sql
SELECT extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果：

```text
┌─extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','111'],['def','222'],['ghi','333']]                                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
## like {#like}

文字列 `haystack` が LIKE 式 `pattern` に一致するかどうかを返します。

LIKE 式には通常の文字と次のメタシンボルを含めることができます：

- `%` は任意の数の任意の文字（ゼロ文字を含む）を示します。
- `_` は任意の1文字を示します。
- `\` はリテラル `%`、`_` および `\` をエスケープするためのものです。

マッチングはUTF-8に基づいています。例として、`_` は二バイトで表現されるUnicodeコードポイント `¥` に一致します。

`haystack` または LIKE 式が無効なUTF-8である場合、その動作は未定義です。

自動的なUnicode正規化は行われないため、そのためには [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) 関数を使用できます。

リテラル `%`、`_` および `\`（LIKEのメタ文字）と一致させるには、前にバックスラッシュを付けます：`\%`、`\_` および `\\`。
バックスラッシュは特殊な意味を失い（リテラルとして解釈され）、`%`、`_` または `\` 以外の文字の前に付けられている場合は特に意味を持たなくなります。
ClickHouse では、文字列内のバックスラッシュも [引用符で囲む必要がある](../syntax.md#string) ため、実際には `\\%`、`\\_` および `\\\\` と書く必要があります。

`%needle%` 形式のLIKE式の場合、この関数は `position` 関数と同じ速度です。
それ以外のすべてのLIKE式は内部的に正規表現に変換され、`match` 関数に似たパフォーマンスで実行されます。

**構文**

```sql
like(haystack, pattern)
```

エイリアス: `haystack LIKE pattern` (演算子)
## notLike {#notlike}

`like` と同様ですが、結果を否定します。

エイリアス: `haystack NOT LIKE pattern` (演算子)
## ilike {#ilike}

`like` と同様ですが、大文字小文字を無視して検索します。

エイリアス: `haystack ILIKE pattern` (演算子)
## notILike {#notilike}

`ilike` と同様ですが、結果を否定します。

エイリアス: `haystack NOT ILIKE pattern` (演算子)
## ngramDistance {#ngramdistance}

`haystack` 文字列と `needle` 文字列の間の4-グラム距離を計算します。これには、2つのマルチセットの4-グラム間の対称差をカウントし、それを各マルチセットの基数の合計で正規化します。0から1の間の [Float32](/sql-reference/data-types/float) の値を返します。結果が小さいほど、文字列は互いに似ています。

関数 [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive)、[`ngramDistanceUTF8`](#ngramdistanceutf8)、[`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) は、大文字小文字を区別しないおよび/またはUTF-8のバリアントを提供します。

**構文**

```sql
ngramDistance(haystack, needle)
```

**引数**

- `haystack`: 最初の比較文字列。 [String literal](/sql-reference/syntax#string)
- `needle`: 2番目の比較文字列。 [String literal](/sql-reference/syntax#string)

**戻り値**

- 2つの文字列間の類似性を示す 0 から 1 の間の値。 [Float32](/sql-reference/data-types/float)

**実装の詳細**

この関数は、定数 `needle` または `haystack` 引数が32Kbを超えた場合、例外をスローします。もし任意の非定数 `haystack` か `needle` 引数が32Kbを超えている場合、距離は常に1になります。

**例**

2つの文字列が互いに似ているほど、結果は0に近づきます（同一）。

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

[ngramDistance](#ngramdistance) の大文字小文字を区別しないバリアントを提供します。

**構文**

```sql
ngramDistanceCaseInsensitive(haystack, needle)
```

**引数**

- `haystack`: 最初の比較文字列。 [String literal](/sql-reference/syntax#string)
- `needle`: 2番目の比較文字列。 [String literal](/sql-reference/syntax#string)

**戻り値**

- 2つの文字列間の類似性を示す 0 から 1 の間の値。 [Float32](/sql-reference/data-types/float)

**例**

[ngramDistance](#ngramdistance) では、大文字小文字の違いが類似性値に影響を与えます：

クエリ：

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

結果：

```response
0.71428573
```

[ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive) では大文字小文字が無視されるため、大文字小文字のみの違いがある2つの同一の文字列は、低い類似性値を返します：

クエリ：

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

結果：

```response
0
```
## ngramDistanceUTF8 {#ngramdistanceutf8}

提供するのは、[ngramDistance](#ngramdistance)のUTF-8バリアントです。`needle`と`haystack`の文字列はUTF-8エンコーディングされた文字列であると仮定します。

**構文**

```sql
ngramDistanceUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初のUTF-8エンコーディングされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 二番目のUTF-8エンコーディングされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 0から1の値で、2つの文字列の類似度を表します。[Float32](/sql-reference/data-types/float)

**例**

クエリ:

```sql
SELECT ngramDistanceUTF8('abcde','cde');
```

結果:

```response
0.5
```
## ngramDistanceCaseInsensitiveUTF8 {#ngramdistancecaseinsensitiveutf8}

提供するのは、[ngramDistanceUTF8](#ngramdistanceutf8)の大文字小文字を区別しないバリアントです。

**構文**

```sql
ngramDistanceCaseInsensitiveUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初のUTF-8エンコーディングされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 二番目のUTF-8エンコーディングされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- 0から1の値で、2つの文字列の類似度を表します。[Float32](/sql-reference/data-types/float)

**例**

クエリ:

```sql
SELECT ngramDistanceCaseInsensitiveUTF8('abcde','CDE');
```

結果:

```response
0.5
```
## ngramSearch {#ngramsearch}

`ngramDistance`と似ていますが、`needle`文字列と`haystack`文字列の非対称差を計算します。すなわち、needleのn-グラム数から共通のn-グラム数を引き、`needle`のn-グラム数で正規化したものです。0から1の間の[Float32](/sql-reference/data-types/float)を返します。結果が大きいほど、`needle`は`haystack`に含まれる可能性が高くなります。この関数はファジー文字列検索に役立ちます。関数[`soundex`](../../sql-reference/functions/string-functions#soundex)も参照してください。

関数[`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive)、[`ngramSearchUTF8`](#ngramsearchutf8)、[`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8)は、この関数の大文字小文字を区別しないおよび/またはUTF-8バリアントを提供します。

**構文**

```sql
ngramSearch(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 二番目の比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- `needle`が`haystack`に含まれる可能性を示す0から1の値。[Float32](/sql-reference/data-types/float)

**実装の詳細**

:::note
UTF-8バリアントは3-グラム距離を使用します。これらは完全には公平なn-グラム距離ではありません。n-グラムをハッシュ化するために2バイトハッシュを使用し、これらのハッシュテーブル間の（非）対称差を計算します – 衝突が発生する可能性があります。UTF-8大文字小文字を区別しない形式では公平な`tolower`関数を使用しておらず、各コードポイントバイトの5番目のビットをゼロにし、バイトが1以上の場合は最初のバイトの最初のビットをゼロにします – これはラテン文字およびほぼすべてのキリル文字に対して機能します。
:::

**例**

クエリ:

```sql
SELECT ngramSearch('Hello World','World Hello');
```

結果:

```response
0.5
```
## ngramSearchCaseInsensitive {#ngramsearchcaseinsensitive}

提供するのは、[ngramSearch](#ngramsearch)の大文字小文字を区別しないバリアントです。

**構文**

```sql
ngramSearchCaseInsensitive(haystack, needle)
```

**パラメータ**

- `haystack`: 最初の比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 二番目の比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- `needle`が`haystack`に含まれる可能性を示す0から1の値。[Float32](/sql-reference/data-types/float)

結果が大きいほど、`needle`は`haystack`に含まれる可能性が高くなります。

**例**

クエリ:

```sql
SELECT ngramSearchCaseInsensitive('Hello World','hello');
```

結果:

```response
1
```
## ngramSearchUTF8 {#ngramsearchutf8}

提供するのは、[ngramSearch](#ngramsearch)のUTF-8バリアントで、`needle`と`haystack`はUTF-8エンコーディングされた文字列であると仮定します。

**構文**

```sql
ngramSearchUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初のUTF-8エンコーディングされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 二番目のUTF-8エンコーディングされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- `needle`が`haystack`に含まれる可能性を示す0から1の値。[Float32](/sql-reference/data-types/float)

結果が大きいほど、`needle`は`haystack`に含まれる可能性が高くなります。

**例**

クエリ:

```sql
SELECT ngramSearchUTF8('абвгдеёжз', 'гдеёзд');
```

結果:

```response
0.5
```
## ngramSearchCaseInsensitiveUTF8 {#ngramsearchcaseinsensitiveutf8}

提供するのは、[ngramSearchUTF8](#ngramsearchutf8)の大文字小文字を区別しないバリアントです。

**構文**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**パラメータ**

- `haystack`: 最初のUTF-8エンコーディングされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)
- `needle`: 二番目のUTF-8エンコーディングされた比較文字列。[文字列リテラル](/sql-reference/syntax#string)

**返される値**

- `needle`が`haystack`に含まれる可能性を示す0から1の値。[Float32](/sql-reference/data-types/float)

結果が大きいほど、`needle`は`haystack`に含まれる可能性が高くなります。

**例**

クエリ:

```sql
SELECT ngramSearchCaseInsensitiveUTF8('абвГДЕёжз', 'АбвгдЕЁжз');
```

結果:

```response
0.57142854
```
## countSubstrings {#countsubstrings}

`needle`という部分文字列が`haystack`という文字列に何回出現するかを返します。

関数[`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive)および[`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8)は、それぞれ大文字小文字を区別しないおよび大文字小文字を区別しない + UTF-8バリアントを提供します。

**構文**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が行われる文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `needle` — 検索される部分文字列。[文字列](../data-types/string.md)。
- `start_pos` – 検索が開始される`haystack`内の位置（1から始まる）。[UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 出現回数。[UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT countSubstrings('aaaa', 'aa');
```

結果:

```text
┌─countSubstrings('aaaa', 'aa')─┐
│                             2 │
└───────────────────────────────┘
```

`start_pos`引数を使った例:

```sql
SELECT countSubstrings('abc___abc', 'abc', 4);
```

結果:

```text
┌─countSubstrings('abc___abc', 'abc', 4)─┐
│                                      1 │
└────────────────────────────────────────┘
```
## countSubstringsCaseInsensitive {#countsubstringscaseinsensitive}

`needle`という部分文字列が`haystack`という文字列に何回出現するかを返します。大文字小文字を無視します。

**構文**

```sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が行われる文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `needle` — 検索される部分文字列。[文字列](../data-types/string.md)。
- `start_pos` – 検索が開始される`haystack`内の位置（1から始まる）。[UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 出現回数。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT countSubstringsCaseInsensitive('AAAA', 'aa');
```

結果:

```text
┌─countSubstringsCaseInsensitive('AAAA', 'aa')─┐
│                                            2 │
└──────────────────────────────────────────────┘
```

`start_pos`引数を使った例:

クエリ:

```sql
SELECT countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4);
```

結果:

```text
┌─countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4)─┐
│                                                           2 │
└─────────────────────────────────────────────────────────────┘
```
## countSubstringsCaseInsensitiveUTF8 {#countsubstringscaseinsensitiveutf8}

`needle`という部分文字列が`haystack`という文字列に何回出現するかを返します。大文字小文字を無視し、`haystack`はUTF8文字列であると仮定します。

**構文**

```sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**引数**

- `haystack` — 検索が行われるUTF-8文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `needle` — 検索される部分文字列。[文字列](../data-types/string.md)。
- `start_pos` – 検索が開始される`haystack`内の位置（1から始まる）。[UInt](../data-types/int-uint.md)。オプション。

**返される値**

- 出現回数。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА');
```

結果:

```text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА')─┐
│                                                                  4 │
└────────────────────────────────────────────────────────────────────┘
```

`start_pos`引数を使った例:

クエリ:

```sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13);
```

結果:

```text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13)─┐
│                                                                      2 │
└────────────────────────────────────────────────────────────────────────┘
```
## countMatches {#countmatches}

`haystack`内の`pattern`に対する正規表現マッチの数を返します。

この関数の動作はClickHouseのバージョンによって異なります：
- バージョン < v25.6では、`countMatches`は、パターンが受け入れる場合でも、最初の空のマッチでカウントを停止します。
- バージョン >= 25.6では、`countMatches`は空のマッチが発生した場合でも実行を続けます。
  旧作の動作は設定[count_matches_stop_at_empty_match = true](/operations/settings/settings#count_matches_stop_at_empty_match)を使用して復元できます。

**構文**

```sql
countMatches(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。[文字列](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax)を使用した正規表現。[文字列](../data-types/string.md)。

**返される値**

- マッチの数。[UInt64](../data-types/int-uint.md)。

**例**

```sql
SELECT countMatches('foobar.com', 'o+');
```

結果:

```text
┌─countMatches('foobar.com', 'o+')─┐
│                                2 │
└──────────────────────────────────┘
```

```sql
SELECT countMatches('aaaa', 'aa');
```

結果:

```text
┌─countMatches('aaaa', 'aa')────┐
│                             2 │
└───────────────────────────────┘
```
## countMatchesCaseInsensitive {#countmatchescaseinsensitive}

`haystack`内のパターンに対する正規表現マッチの数を返します。`countMatches`と同様ですが、大文字小文字を無視します。

**構文**

```sql
countMatchesCaseInsensitive(haystack, pattern)
```

**引数**

- `haystack` — 検索対象の文字列。[文字列](../data-types/string.md)。
- `pattern` — [re2正規表現構文](https://github.com/google/re2/wiki/Syntax)を使用した正規表現。[文字列](../data-types/string.md)。

**返される値**

- マッチの数。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT countMatchesCaseInsensitive('AAAA', 'aa');
```

結果:

```text
┌─countMatchesCaseInsensitive('AAAA', 'aa')────┐
│                                            2 │
└──────────────────────────────────────────────┘
```
## regexpExtract {#regexpextract}

`haystack`内で正規表現パターンと一致する最初の文字列を抽出し、正規表現グループインデックスに対応します。

**構文**

エイリアス: `REGEXP_EXTRACT(haystack, pattern[, index])`。

**引数**

- `haystack` — 正規表現パターンが一致する文字列。[文字列](../data-types/string.md)。
- `pattern` — 文字列、正規表現式で、定数でなければなりません。[文字列](../data-types/string.md)。
- `index` – 0以上の整数で、デフォルトは1です。抽出する正規表現グループを表します。[UIntまたはInt](../data-types/int-uint.md)。オプション。

**返される値**

`pattern`は複数の正規表現グループを含む場合があり、`index`は抽出する正規表現グループを示します。インデックスが0の場合は、全体の正規表現との一致を意味します。[文字列](../data-types/string.md)。

**例**

```sql
SELECT
    regexpExtract('100-200', '(\\d+)-(\\d+)', 1),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 2),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 0),
    regexpExtract('100-200', '(\\d+)-(\\d+)');
```

結果:

```text
┌─regexpExtract('100-200', '(\\d+)-(\\d+)', 1)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 2)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 0)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)')─┐
│ 100                                          │ 200                                          │ 100-200                                      │ 100                                       │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────────────────────┴───────────────────────────────────────────┘
```
## hasSubsequence {#hassubsequence}

`needle`が`haystack`の部分列である場合は1を返し、そうでない場合は0を返します。
文字列の部分列とは、与えられた文字列から0個以上の要素を削除しても順序が変わらない、得られるシーケンスのことです。

**構文**

```sql
hasSubsequence(haystack, needle)
```

**引数**

- `haystack` — 検索が行われる文字列。[文字列](../data-types/string.md)。
- `needle` — 検索される部分列。[文字列](../data-types/string.md)。

**返される値**

- `needle`が`haystack`の部分列である場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT hasSubsequence('garbage', 'arg');
```

結果:

```text
┌─hasSubsequence('garbage', 'arg')─┐
│                                1 │
└──────────────────────────────────┘
```
## hasSubsequenceCaseInsensitive {#hassubsequencecaseinsensitive}

[hasSubsequence](#hassubsequence)と同様ですが、大文字小文字を無視して検索します。

**構文**

```sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**引数**

- `haystack` — 検索が行われる文字列。[文字列](../data-types/string.md)。
- `needle` — 検索される部分列。[文字列](../data-types/string.md)。

**返される値**

- `needle`が`haystack`の部分列である場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT hasSubsequenceCaseInsensitive('garbage', 'ARG');
```

結果:

```text
┌─hasSubsequenceCaseInsensitive('garbage', 'ARG')─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```
## hasSubsequenceUTF8 {#hassubsequenceutf8}

[hasSubsequence](#hassubsequence)と同様ですが、`haystack`と`needle`がUTF-8エンコーディングされた文字列であると仮定します。

**構文**

```sql
hasSubsequenceUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が行われる文字列。[UTF-8エンコーディングされた文字列](../data-types/string.md)。
- `needle` — 検索される部分列。[UTF-8エンコーディングされた文字列](../data-types/string.md)。

**返される値**

- `needle`が`haystack`の部分列である場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

クエリ:

**例**

```sql
SELECT hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система');
```

結果:

```text
┌─hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система')─┐
│                                                                                         1 │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```
## hasSubsequenceCaseInsensitiveUTF8 {#hassubsequencecaseinsensitiveutf8}

[hasSubsequenceUTF8](#hassubsequenceutf8)と同様ですが、大文字小文字を無視して検索します。

**構文**

```sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**引数**

- `haystack` — 検索が行われる文字列。[UTF-8エンコーディングされた文字列](../data-types/string.md)。
- `needle` — 検索される部分列。[UTF-8エンコーディングされた文字列](../data-types/string.md)。

**返される値**

- `needle`が`haystack`の部分列である場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА');
```

結果:

```text
┌─hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА')─┐
│                                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
## hasToken {#hastoken}

指定されたトークンがhaystackに存在する場合は1を返し、そうでない場合は0を返します。

**構文**

```sql
hasToken(haystack, token)
```

**パラメータ**

- `haystack`: 検索が行われる文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `token`: 2つの非英数字ASCII文字（またはhaystackの境界）の間の最大長の部分文字列。

**返される値**

- トークンがhaystackに存在する場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数の文字列でなければなりません。tokenbf_v1インデックスの特化がサポートされています。

**例**

クエリ:

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```
## hasTokenOrNull {#hastokenornull}

指定されたトークンが存在する場合は1を返し、存在しない場合は0を返し、トークンが不正な形式の場合はnullを返します。

**構文**

```sql
hasTokenOrNull(haystack, token)
```

**パラメータ**

- `haystack`: 検索が行われる文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `token`: 2つの非英数字ASCII文字（またはhaystackの境界）の間の最大長の部分文字列。

**返される値**

- トークンがhaystackに存在する場合は1、そうでない場合は0、不正なトークンの場合はnullを返します。

**実装の詳細**

トークンは定数の文字列でなければなりません。tokenbf_v1インデックスの特化がサポートされています。

**例**

`hasToken`が不正なトークンに対してエラーをスローする場合、`hasTokenOrNull`は不正なトークンに対してnullを返します。

クエリ:

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```
## hasTokenCaseInsensitive {#hastokencaseinsensitive}

指定されたトークンがhaystackに存在する場合は1を返し、そうでない場合は0を返します。大文字小文字を無視します。

**構文**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**パラメータ**

- `haystack`: 検索が行われる文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `token`: 2つの非英数字ASCII文字（またはhaystackの境界）の間の最大長の部分文字列。

**返される値**

- トークンがhaystackに存在する場合は1、そうでない場合は0。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数の文字列でなければなりません。tokenbf_v1インデックスの特化がサポートされています。

**例**

クエリ:

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```
## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitivesornull}

指定されたトークンがhaystackに存在する場合は1を返し、そうでない場合は0を返します。大文字小文字を無視し、不正なトークンの場合はnullを返します。

**構文**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**パラメータ**

- `haystack`: 検索が行われる文字列。[文字列](../data-types/string.md)または[列挙型](../data-types/enum.md)。
- `token`: 2つの非英数字ASCII文字（またはhaystackの境界）の間の最大長の部分文字列。

**返される値**

- トークンがhaystackに存在する場合は1、トークンが存在しない場合は0、他の場合は不正なトークンの場合は[`null`](../data-types/nullable.md)。[UInt8](../data-types/int-uint.md)。

**実装の詳細**

トークンは定数の文字列でなければなりません。tokenbf_v1インデックスの特化がサポートされています。

**例**

`hasTokenCaseInsensitive`が不正なトークンに対してエラーをスローする場合、`hasTokenCaseInsensitiveOrNull`は不正なトークンに対してnullを返します。

クエリ:

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
