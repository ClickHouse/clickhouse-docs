---
'description': 'Functions for Working with Strings のためのドキュメント'
'sidebar_label': 'String'
'slug': '/sql-reference/functions/string-functions'
'title': '文字列操作のための関数'
'doc_type': 'reference'
---

import VersionBadge from '@theme/badges/VersionBadge';


# 文字列操作のための関数

[文字列の検索](string-search-functions.md)や[文字列の置換](string-replace-functions.md)に関する関数は別々に説明されています。
## empty {#empty}

入力文字列が空であるかどうかをチェックします。文字列は、スペースやヌルバイトを含んでいる場合でも、バイトが1つ以上含まれている場合、非空と見なされます。

この関数は[配列](/sql-reference/functions/array-functions#empty)や[UUID](uuid-functions.md#empty)でも使用可能です。

**構文**

```sql
empty(x)
```

**引数**

- `x` — 入力値。[String](../data-types/string.md)。

**返される値**

- 空文字列の場合は `1` を、非空文字列の場合は `0` を返します。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT empty('');
```

結果:

```result
┌─empty('')─┐
│         1 │
└───────────┘
```
## notEmpty {#notempty}

入力文字列が非空であるかどうかをチェックします。文字列は、スペースやヌルバイトを含んでいる場合でも、バイトが1つ以上含まれている場合、非空と見なされます。

この関数は[配列](/sql-reference/functions/array-functions#notEmpty)や[UUID](uuid-functions.md#notempty)でも使用可能です。

**構文**

```sql
notEmpty(x)
```

**引数**

- `x` — 入力値。[String](../data-types/string.md)。

**返される値**

- 非空文字列の場合は `1` を、空文字列の場合は `0` を返します。[UInt8](../data-types/int-uint.md)。

**例**

```sql
SELECT notEmpty('text');
```

結果:

```result
┌─notEmpty('text')─┐
│                1 │
└──────────────────┘
```
## length {#length}

文字列の長さをバイト単位で返します。文字数やUnicodeコードポイントではなく、バイト単位で長さを返します。この関数は配列にも機能します。

エイリアス: `OCTET_LENGTH`

**構文**

```sql
length(s)
```

**引数**

- `s` — 入力文字列または配列。[String](../data-types/string)/[Array](../data-types/array)。

**返される値**

- バイト数で表された文字列または配列 `s` の長さ。[UInt64](../data-types/int-uint)。

**例**

クエリ:

```sql
SELECT length('Hello, world!');
```

結果: 

```response
┌─length('Hello, world!')─┐
│                      13 │
└─────────────────────────┘
```

クエリ:

```sql
SELECT length([1, 2, 3, 4]);
```

結果: 

```response
┌─length([1, 2, 3, 4])─┐
│                    4 │
└──────────────────────┘
```
## lengthUTF8 {#lengthutf8}

文字列の長さをUnicodeコードポイント単位で返します。バイトや文字数ではなく、Unicodeコードポイント単位で長さを返します。文字列が有効なUTF-8エンコードのテキストであると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

エイリアス:
- `CHAR_LENGTH`
- `CHARACTER_LENGTH`

**構文**

```sql
lengthUTF8(s)
```

**引数**

- `s` — 有効なUTF-8エンコードのテキストを含む文字列。[String](../data-types/string.md)。

**返される値**

- Unicodeコードポイント単位で表された文字列 `s` の長さ。[UInt64](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT lengthUTF8('Здравствуй, мир!');
```

結果: 

```response
┌─lengthUTF8('Здравствуй, мир!')─┐
│                             16 │
└────────────────────────────────┘
```
## left {#left}

指定された `offset` から左からの文字列 `s` の部分文字列を返します。

**構文**

```sql
left(s, offset)
```

**引数**

- `s` — 部分文字列を計算するための文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数です。[(U)Int*](../data-types/int-uint)。

**返される値**

- 正の `offset` の場合: 文字列の左側から `offset` バイト数の部分文字列。
- 負の `offset` の場合: 文字列の左側から `length(s) - |offset|` バイト数の部分文字列。
- 長さが 0 の場合は、空の文字列を返します。

**例**

クエリ:

```sql
SELECT left('Hello', 3);
```

結果:

```response
Hel
```

クエリ:

```sql
SELECT left('Hello', -3);
```

結果:

```response
He
```
## leftUTF8 {#leftutf8}

指定された `offset` から左からのUTF-8エンコードされた文字列 `s` の部分文字列を返します。

**構文**

```sql
leftUTF8(s, offset)
```

**引数**

- `s` — 部分文字列を計算するためのUTF-8エンコードされた文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数です。[(U)Int*](../data-types/int-uint)。

**返される値**

- 正の `offset` の場合: 文字列の左側から `offset` バイト数の部分文字列。
- 負の `offset` の場合: 文字列の左側から `length(s) - |offset|` バイト数の部分文字列。
- 長さが 0 の場合は、空の文字列を返します。

**例**

クエリ:

```sql
SELECT leftUTF8('Привет', 4);
```

結果:

```response
Прив
```

クエリ:

```sql
SELECT leftUTF8('Привет', -4);
```

結果:

```response
Пр
```
## leftPad {#leftpad}

文字列を左からスペースまたは指定した文字列でパディングし、結果の文字列が指定された `length` に達するまで繰り返します。

**構文**

```sql
leftPad(string, length[, pad_string])
```

エイリアス: `LPAD`

**引数**

- `string` — パディングすべき入力文字列。[String](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UInt or Int](../data-types/int-uint.md)。入力文字列の長さより小さい場合は、入力文字列が `length` 文字に短縮されます。
- `pad_string` — 入力文字列をパディングするための文字列。[String](../data-types/string.md)。オプション。指定しない場合は、入力文字列はスペースでパディングされます。

**返される値**

- 指定された長さの左パディングされた文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT leftPad('abc', 7, '*'), leftPad('def', 7);
```

結果:

```result
┌─leftPad('abc', 7, '*')─┬─leftPad('def', 7)─┐
│ ****abc                │     def           │
└────────────────────────┴───────────────────┘
```
## leftPadUTF8 {#leftpadutf8}

文字列を左からスペースまたは指定した文字列でパディングし、結果の文字列が指定された長さに達するまで繰り返します。[leftPad](#leftpad)とは異なり、文字列の長さはコードポイントで測定されます。

**構文**

```sql
leftPadUTF8(string, length[, pad_string])
```

**引数**

- `string` — パディングすべき入力文字列。[String](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UInt or Int](../data-types/int-uint.md)。入力文字列の長さより小さい場合は、入力文字列が `length` 文字に短縮されます。
- `pad_string` — 入力文字列をパディングするための文字列。[String](../data-types/string.md)。オプション。指定しない場合は、入力文字列はスペースでパディングされます。

**返される値**

- 指定された長さの左パディングされた文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT leftPadUTF8('абвг', 7, '*'), leftPadUTF8('дежз', 7);
```

結果:

```result
┌─leftPadUTF8('абвг', 7, '*')─┬─leftPadUTF8('дежз', 7)─┐
│ ***абвг                     │    дежз                │
└─────────────────────────────┴────────────────────────┘
```
## right {#right}

指定された `offset` から右からの文字列 `s` の部分文字列を返します。

**構文**

```sql
right(s, offset)
```

**引数**

- `s` — 部分文字列を計算するための文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数です。[(U)Int*](../data-types/int-uint)。

**返される値**

- 正の `offset` の場合: 文字列の右側から `offset` バイト数の部分文字列。
- 負の `offset` の場合: 文字列の右側から `length(s) - |offset|` バイト数の部分文字列。
- 長さが 0 の場合は、空の文字列を返します。

**例**

クエリ:

```sql
SELECT right('Hello', 3);
```

結果:

```response
llo
```

クエリ:

```sql
SELECT right('Hello', -3);
```

結果:

```response
lo
```
## rightUTF8 {#rightutf8}

指定された `offset` から右からのUTF-8エンコードされた文字列 `s` の部分文字列を返します。

**構文**

```sql
rightUTF8(s, offset)
```

**引数**

- `s` — 部分文字列を計算するためのUTF-8エンコードされた文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数です。[(U)Int*](../data-types/int-uint)。

**返される値**

- 正の `offset` の場合: 文字列の右側から `offset` バイト数の部分文字列。
- 負の `offset` の場合: 文字列の右側から `length(s) - |offset|` バイト数の部分文字列。
- 長さが 0 の場合は、空の文字列を返します。

**例**

クエリ:

```sql
SELECT rightUTF8('Привет', 4);
```

結果:

```response
ивет
```

クエリ:

```sql
SELECT rightUTF8('Привет', -4);
```

結果:

```response
ет
```
## rightPad {#rightpad}

文字列を右からスペースまたは指定した文字列でパディングし、結果の文字列が指定された `length` に達するまで繰り返します。

**構文**

```sql
rightPad(string, length[, pad_string])
```

エイリアス: `RPAD`

**引数**

- `string` — パディングすべき入力文字列。[String](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UInt or Int](../data-types/int-uint.md)。入力文字列の長さより小さい場合は、入力文字列が `length` 文字に短縮されます。
- `pad_string` — 入力文字列をパディングするための文字列。[String](../data-types/string.md)。オプション。指定しない場合は、入力文字列はスペースでパディングされます。

**返される値**

- 指定された長さの右パディングされた文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT rightPad('abc', 7, '*'), rightPad('abc', 7);
```

結果:

```result
┌─rightPad('abc', 7, '*')─┬─rightPad('abc', 7)─┐
│ abc****                 │ abc                │
└─────────────────────────┴────────────────────┘
```
## rightPadUTF8 {#rightpadutf8}

文字列を右からスペースまたは指定した文字列でパディングし、結果の文字列が指定された長さに達するまで繰り返します。[rightPad](#rightpad)とは異なり、文字列の長さはコードポイントで測定されます。

**構文**

```sql
rightPadUTF8(string, length[, pad_string])
```

**引数**

- `string` — パディングすべき入力文字列。[String](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UInt or Int](../data-types/int-uint.md)。入力文字列の長さより小さい場合は、入力文字列が `length` 文字に短縮されます。
- `pad_string` — 入力文字列をパディングするための文字列。[String](../data-types/string.md)。オプション。指定しない場合は、入力文字列はスペースでパディングされます。

**返される値**

- 指定された長さの右パディングされた文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT rightPadUTF8('абвг', 7, '*'), rightPadUTF8('абвг', 7);
```

結果:

```result
┌─rightPadUTF8('абвг', 7, '*')─┬─rightPadUTF8('абвг', 7)─┐
│ абвг***                      │ абвг                    │
└──────────────────────────────┴─────────────────────────┘
```
## compareSubstrings {#comparesubstrings}

二つの文字列を辞書式順序で比較します。

**構文**

```sql
compareSubstrings(string1, string2, string1_offset, string2_offset, num_bytes);
```

**引数**

- `string1` — 比較する最初の文字列。[String](../data-types/string.md)
- `string2` - 比較する第二の文字列。[String](../data-types/string.md)
- `string1_offset` — `string1` での比較の開始位置 (ゼロベース)。[UInt*](../data-types/int-uint.md)。
- `string2_offset` — `string2` での比較の開始位置 (ゼロベース)。[UInt*](../data-types/int-uint.md)。
- `num_bytes` — 両方の文字列で比較する最大バイト数。`string_offset` + `num_bytes` が入力文字列の終わりを超える場合、`num_bytes` はそれに応じて減少します。[UInt*](../data-types/int-uint.md)。

**返される値**

- -1 — `string1`[`string1_offset` : `string1_offset` + `num_bytes`] < `string2`[`string2_offset` : `string2_offset` + `num_bytes`] の場合。
- 0 — `string1`[`string1_offset` : `string1_offset` + `num_bytes`] = `string2`[`string2_offset` : `string2_offset` + `num_bytes`] の場合。
- 1 — `string1`[`string1_offset` : `string1_offset` + `num_bytes`] > `string2`[`string2_offset` : `string2_offset` + `num_bytes`] の場合。

**例**

クエリ:

```sql
SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result,
```

結果:

```result
┌─result─┐
│      0 │
└────────┘
```
## lower {#lower}

文字列内のASCIIラテン文字を小文字に変換します。

**構文**

```sql
lower(input)
```

エイリアス: `lcase`

**引数**

- `input`: 文字列タイプ [String](../data-types/string.md)。

**返される値**

- [String](../data-types/string.md) データ型の値を返します。

**例**

クエリ:

```sql
SELECT lower('CLICKHOUSE');
```

```response
┌─lower('CLICKHOUSE')─┐
│ clickhouse          │
└─────────────────────┘
```
## upper {#upper}

文字列内のASCIIラテン文字を大文字に変換します。

**構文**

```sql
upper(input)
```

エイリアス: `ucase`

**引数**

- `input` — 文字列タイプ [String](../data-types/string.md)。

**返される値**

- [String](../data-types/string.md) データ型の値を返します。

**例**

クエリ:

```sql
SELECT upper('clickhouse');
```

```response
┌─upper('clickhouse')─┐
│ CLICKHOUSE          │
└─────────────────────┘
```
## lowerUTF8 {#lowerutf8}

文字列を小文字に変換します。文字列が有効なUTF-8エンコードされたテキストであると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

:::note
言語を検出しません。たとえば、トルコ語では結果が正確ではない場合があります (i/İ vs. i/I)。UTF-8バイトシーケンスの長さが大文字と小文字で異なるコードポイント (例えば `ẞ` と `ß`) の場合は、このコードポイントの結果が正しくない場合があります。
:::

**構文**

```sql
lowerUTF8(input)
```

**引数**

- `input` — 文字列タイプ [String](../data-types/string.md)。

**返される値**

- [String](../data-types/string.md) データ型の値を返します。

**例**

クエリ:

```sql
SELECT lowerUTF8('MÜNCHEN') AS Lowerutf8;
```

結果:

```response
┌─Lowerutf8─┐
│ münchen   │
└───────────┘
```
## upperUTF8 {#upperutf8}

文字列を大文字に変換します。文字列が有効なUTF-8エンコードされたテキストであると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

:::note
言語を検出しません。たとえば、トルコ語では結果が正確ではない場合があります (i/İ vs. i/I)。UTF-8バイトシーケンスの長さが大文字と小文字で異なるコードポイント (例えば `ẞ` と `ß`) の場合は、このコードポイントの結果が正しくない場合があります。
:::

**構文**

```sql
upperUTF8(input)
```

**引数**

- `input` — 文字列タイプ [String](../data-types/string.md)。

**返される値**

- [String](../data-types/string.md) データ型の値を返します。

**例**

クエリ:

```sql
SELECT upperUTF8('München') AS Upperutf8;
```

結果:

```response
┌─Upperutf8─┐
│ MÜNCHEN   │
└───────────┘
```
## isValidUTF8 {#isvalidutf8}

バイトのセットが有効なUTF-8エンコードのテキストである場合は1を、そうでない場合は0を返します。

**構文**

```sql
isValidUTF8(input)
```

**引数**

- `input` — 文字列タイプ [String](../data-types/string.md)。

**返される値**

- バイトのセットが有効なUTF-8エンコードのテキストである場合は `1` を、そうでない場合は `0` を返します。

クエリ:

```sql
SELECT isValidUTF8('\xc3\xb1') AS valid, isValidUTF8('\xc3\x28') AS invalid;
```

結果:

```response
┌─valid─┬─invalid─┐
│     1 │       0 │
└───────┴─────────┘
```
## toValidUTF8 {#tovalidutf8}

無効なUTF-8文字を `�` (U+FFFD) 文字で置き換えます。連続する無効な文字がある場合、それらは一つの置換文字に圧縮されます。

**構文**

```sql
toValidUTF8(input_string)
```

**引数**

- `input_string` — [String](../data-types/string.md) データ型オブジェクトとして表される任意のバイトのセット。

**返される値**

- 有効なUTF-8文字列。

**例**

```sql
SELECT toValidUTF8('\x61\xF0\x80\x80\x80b');
```

```result
┌─toValidUTF8('a����b')─┐
│ a�b                   │
└───────────────────────┘
```
## repeat {#repeat}

文字列を指定された回数自分自身と連結します。

**構文**

```sql
repeat(s, n)
```

エイリアス: `REPEAT`

**引数**

- `s` — 繰り返す文字列。[String](../data-types/string.md)。
- `n` — 文字列を繰り返す回数。[UInt* または Int*](../data-types/int-uint.md)。

**返される値**

文字列 `s` が `n` 回繰り返された文字列。 `n` &lt;= 0 の場合、この関数は空の文字列を返します。[String](../data-types/string.md)。

**例**

```sql
SELECT repeat('abc', 10);
```

結果:

```result
┌─repeat('abc', 10)──────────────┐
│ abcabcabcabcabcabcabcabcabcabc │
└────────────────────────────────┘
```
## space {#space}

スペース (` `) を指定された回数自分自身と連結します。

**構文**

```sql
space(n)
```

エイリアス: `SPACE`.

**引数**

- `n` — スペースを繰り返す回数。[UInt* または Int*](../data-types/int-uint.md)。

**返される値**

スペース ` ` が `n` 回繰り返された文字列。 `n` &lt;= 0 の場合、この関数は空の文字列を返します。[String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT space(3);
```

結果:

```text
┌─space(3) ────┐
│              │
└──────────────┘
```
## reverse {#reverse}

文字列内のバイトのシーケンスを逆にします。
## reverseUTF8 {#reverseutf8}

文字列内のUnicodeコードポイントのシーケンスを逆にします。文字列が有効なUTF-8エンコードされたテキストであると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。
## concat {#concat}

与えられた引数を連結します。

**構文**

```sql
concat(s1, s2, ...)
```

**引数**

任意のタイプの値。

[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md) の型でない引数は、デフォルトのシリアル化を使用して文字列に変換されます。これにより性能が低下するため、非String/FixedStringの引数を使用することは推奨されません。

**返される値**

引数を連結して作成された文字列。

引数のいずれかが `NULL` の場合、関数は `NULL` を返します。

**例**

クエリ:

```sql
SELECT concat('Hello, ', 'World!');
```

結果:

```result
┌─concat('Hello, ', 'World!')─┐
│ Hello, World!               │
└─────────────────────────────┘
```

クエリ:

```sql
SELECT concat(42, 144);
```

結果:

```result
┌─concat(42, 144)─┐
│ 42144           │
└─────────────────┘
```

:::note `||` 演算子
文字列連結には `concat()` の簡潔な代替として `||` 演算子を使用します。たとえば、`'Hello, ' || 'World!'` は `concat('Hello, ', 'World!')` と等価です。
:::
## concatAssumeInjective {#concatassumeinjective}

[concat](#concat) と似ていますが、`concat(s1, s2, ...) → sn` が単射であると仮定しています。GROUP BYの最適化に使用できます。

関数が単射であるとは、異なる引数に対して異なる結果を返す場合を指します。言い換えれば：異なる引数は決して同一の結果を生じません。

**構文**

```sql
concatAssumeInjective(s1, s2, ...)
```

**引数**

String または FixedString の型の値。

**返される値**

引数を連結して作成された文字列。

引数のいずれかの値が `NULL` の場合、関数は `NULL` を返します。

**例**

入力テーブル:

```sql
CREATE TABLE key_val(`key1` String, `key2` String, `value` UInt32) ENGINE = TinyLog;
INSERT INTO key_val VALUES ('Hello, ','World',1), ('Hello, ','World',2), ('Hello, ','World!',3), ('Hello',', World!',2);
SELECT * from key_val;
```

```result
┌─key1────┬─key2─────┬─value─┐
│ Hello,  │ World    │     1 │
│ Hello,  │ World    │     2 │
│ Hello,  │ World!   │     3 │
│ Hello   │ , World! │     2 │
└─────────┴──────────┴───────┘
```

```sql
SELECT concat(key1, key2), sum(value) FROM key_val GROUP BY concatAssumeInjective(key1, key2);
```

結果:

```result
┌─concat(key1, key2)─┬─sum(value)─┐
│ Hello, World!      │          3 │
│ Hello, World!      │          2 │
│ Hello, World       │          3 │
└────────────────────┴────────────┘
```
## concatWithSeparator {#concatwithseparator}

指定された区切り文字で指定された文字列を連結します。

**構文**

```sql
concatWithSeparator(sep, expr1, expr2, expr3...)
```

エイリアス: `concat_ws`

**引数**

- sep — 区切り文字。定数の[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- exprN — 連結される式。非[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)型でない引数は、デフォルトのシリアル化を使用して文字列に変換されるため、性能が低下するため、使用は推奨されません。

**返される値**

引数を連結して作成された文字列。

引数のいずれかの値が `NULL` の場合、関数は `NULL` を返します。

**例**

```sql
SELECT concatWithSeparator('a', '1', '2', '3', '4')
```

結果:

```result
┌─concatWithSeparator('a', '1', '2', '3', '4')─┐
│ 1a2a3a4                                      │
└──────────────────────────────────────────────┘
```
## concatWithSeparatorAssumeInjective {#concatwithseparatorassumeinjective}

`concatWithSeparator` と似ていますが、`concatWithSeparator(sep, expr1, expr2, expr3...) → result` が単射であると仮定しています。GROUP BYの最適化に使用できます。

関数が単射であるとは、異なる引数に対して異なる結果を返す場合を指します。言い換えれば：異なる引数は決して同一の結果を生じません。
## substring {#substring}

指定したバイトインデックス `offset` から始まる文字列 `s` の部分文字列を返します。バイト数のカウントは1から始まります。もし `offset` が0であれば、空の文字列が返されます。もし `offset` が負数であれば、部分文字列は文字列の終わりから `pos` 文字の位置から始まります。オプションの引数 `length` は、返される部分文字列が持つ最大バイト数を指定します。

**構文**

```sql
substring(s, offset[, length])
```

エイリアス:
- `substr`
- `mid`
- `byteSlice`

**引数**

- `s` — 部分文字列を計算するための文字列。[String](../data-types/string.md)、[FixedString](../data-types/fixedstring.md) または [Enum](../data-types/enum.md)
- `offset` — `s` の部分文字列の開始位置。[(U)Int*](../data-types/int-uint.md)。
- `length` — 部分文字列の最大長さ。[(U)Int*](../data-types/int-uint.md)。オプション。

**返される値**

インデックス `offset` から開始する `s` の部分文字列、バイト数が `length` です。[String](../data-types/string.md)。

**例**

```sql
SELECT 'database' AS db, substr(db, 5), substr(db, 5, 1)
```

結果:

```result
┌─db───────┬─substring('database', 5)─┬─substring('database', 5, 1)─┐
│ database │ base                     │ b                           │
└──────────┴──────────────────────────┴─────────────────────────────┘
```
## substringUTF8 {#substringutf8}

指定したバイトインデックス `offset` から始まる文字列 `s` の部分文字列を返します。Unicodeコードポイントに対して。バイト数のカウントは1から始まります。もし `offset` が0であれば、空の文字列が返されます。もし `offset` が負数であれば、部分文字列は文字列の終わりから `pos` 文字の位置から始まります。オプションの引数 `length` は、返される部分文字列が持つ最大バイト数を指定します。

文字列が有効なUTF-8エンコードのテキストであると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**構文**

```sql
substringUTF8(s, offset[, length])
```

**引数**

- `s` — 部分文字列を計算するための文字列。[String](../data-types/string.md)、[FixedString](../data-types/fixedstring.md) または [Enum](../data-types/enum.md)
- `offset` — `s` の部分文字列の開始位置。[(U)Int*](../data-types/int-uint.md)。
- `length` — 部分文字列の最大長さ。[(U)Int*](../data-types/int-uint.md)。オプション。

**返される値**

インデックス `offset` から開始する `s` の部分文字列、バイト数が `length` です。

**実装の詳細**

文字列が有効なUTF-8エンコードのテキストであると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**例**

```sql
SELECT 'Täglich grüßt das Murmeltier.' AS str,
       substringUTF8(str, 9),
       substringUTF8(str, 9, 5)
```

```response
Täglich grüßt das Murmeltier.    grüßt das Murmeltier.    grüßt
```
## substringIndex {#substringindex}

`count` 回の区切り文字 `delim` の出現の前の `s` の部分文字列を返します。これはSparkやMySQLのように動作します。

**構文**

```sql
substringIndex(s, delim, count)
```
エイリアス: `SUBSTRING_INDEX`
**引数**

- s — 部分文字列を抽出するための文字列。[String](../data-types/string.md)。
- delim — 区切る文字。[String](../data-types/string.md)。
- count — 部分文字列を抽出する前に数える区切り文字の出現数。countが正数の場合、最後の区切り文字の左側のすべてが返されます (左から数える)。countが負数の場合、最後の区切り文字の右側のすべてが返されます (右から数える)。 [UInt または Int](../data-types/int-uint.md)

**例**

```sql
SELECT substringIndex('www.clickhouse.com', '.', 2)
```

結果:
```sql
┌─substringIndex('www.clickhouse.com', '.', 2)─┐
│ www.clickhouse                               │
└──────────────────────────────────────────────┘
```
## substringIndexUTF8 {#substringindexutf8}

`count` 回の区切り文字 `delim` の出現の前の `s` の部分文字列を返します。特にUnicodeコードポイントに対して。

文字列が有効なUTF-8エンコードのテキストであると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**構文**

```sql
substringIndexUTF8(s, delim, count)
```

**引数**

- `s` — 部分文字列を抽出するための文字列。[String](../data-types/string.md)。
- `delim` — 区切る文字。[String](../data-types/string.md)。
- `count` — 部分文字列を抽出する前に数える区切り文字の出現数。countが正数の場合、最後の区切り文字の左側のすべてが返されます (左から数える)。countが負数の場合、最後の区切り文字の右側のすべてが返されます (右から数える)。 [UInt または Int](../data-types/int-uint.md)

**返される値**

`delim` の `count` 回の出現の前の `s` の部分文字列。[String](../data-types/string.md)。

**実装の詳細**

文字列が有効なUTF-8エンコードのテキストであると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**例**

```sql
SELECT substringIndexUTF8('www.straßen-in-europa.de', '.', 2)
```

```response
www.straßen-in-europa
```
## appendTrailingCharIfAbsent {#appendtrailingcharifabsent}

文字列 `s` が非空であり、なおかつ `s` の末尾が文字 `c` で終わらない場合にのみ、文字 `c` を `s` に追加します。

**構文**

```sql
appendTrailingCharIfAbsent(s, c)
```
## convertCharset {#convertcharset}

文字列 `s` をエンコーディング `from` からエンコーディング `to` に変換した文字列を返します。

**構文**

```sql
convertCharset(s, from, to)
```
## base32Encode {#base32encode}

[Base32](https://datatracker.ietf.org/doc/html/rfc4648#section-6)を使用して文字列をエンコードします。

**構文**

```sql
base32Encode(plaintext)
```

**引数**

- `plaintext` — [String](../data-types/string.md) 列または定数。

**返される値**

- 引数のエンコードされた値を含む文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**例**

```sql
SELECT base32Encode('Encoded');
```

結果:

```result
┌─base32Encode('Encoded')─┐
│ IVXGG33EMVSA====        │
└─────────────────────────┘
```
## base32Decode {#base32decode}

文字列を受け取り、[Base32](https://datatracker.ietf.org/doc/html/rfc4648#section-6) エンコーディングスキームを使用してデコードします。

**構文**

```sql
base32Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。文字列が有効なBase32エンコードされた値でない場合、例外がスローされます。

**返される値**

- 引数のデコードされた値を含む文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT base32Decode('IVXGG33EMVSA====');
```

結果:

```result
┌─base32Decode('IVXGG33EMVSA====')─┐
│ Encoded                          │
└──────────────────────────────────┘
```
## tryBase32Decode {#trybase32decode}

`base32Decode` と同様ですが、エラーの場合には空の文字列を返します。

**構文**

```sql
tryBase32Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。文字列が有効なBase32エンコードされた値でない場合、エラー時に空の文字列を返します。

**返される値**

- 引数のデコードされた値を含む文字列。

**例**

クエリ:

```sql
SELECT tryBase32Decode('IVXGG33EMVSA====') AS res, tryBase32Decode('invalid') AS res_invalid;
```

```response
┌─res─────┬─res_invalid─┐
│ Encoded │             │
└─────────┴─────────────┘
```
## base58Encode {#base58encode}

[Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58)により、"Bitcoin" アルファベットを使用して文字列をエンコードします。

**構文**

```sql
base58Encode(plaintext)
```

**引数**

- `plaintext` — [String](../data-types/string.md) 列または定数。

**返される値**

- 引数のエンコードされた値を含む文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**例**

```sql
SELECT base58Encode('Encoded');
```

結果:

```result
┌─base58Encode('Encoded')─┐
│ 3dc8KtHrwM              │
└─────────────────────────┘
```
## base58Decode {#base58decode}

文字列を受け取り、"Bitcoin" アルファベットを使用して[Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58) エンコーディングスキームを使用してデコードします。

**構文**

```sql
base58Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。文字列が有効なBase58エンコードされた値でない場合、例外がスローされます。

**返される値**

- 引数のデコードされた値を含む文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT base58Decode('3dc8KtHrwM');
```

結果:

```result
┌─base58Decode('3dc8KtHrwM')─┐
│ Encoded                    │
└────────────────────────────┘
```
## tryBase58Decode {#trybase58decode}

`base58Decode` と同様ですが、エラーの場合には空の文字列を返します。

**構文**

```sql
tryBase58Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。文字列が有効なBase58エンコードされた値でない場合、エラー時に空の文字列を返します。

**返される値**

- 引数のデコードされた値を含む文字列。

**例**

クエリ:

```sql
SELECT tryBase58Decode('3dc8KtHrwM') AS res, tryBase58Decode('invalid') AS res_invalid;
```

```response
┌─res─────┬─res_invalid─┐
│ Encoded │             │
└─────────┴─────────────┘
```
## base64Encode {#base64encode}

文字列または固定文字列をbase64としてエンコードします。[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4) に従って。

エイリアス: `TO_BASE64`.

**構文**

```sql
base64Encode(plaintext)
```

**引数**

- `plaintext` — [String](../data-types/string.md) 列または定数。

**返される値**

- 引数のエンコードされた値を含む文字列。

**例**

```sql
SELECT base64Encode('clickhouse');
```

結果:

```result
┌─base64Encode('clickhouse')─┐
│ Y2xpY2tob3VzZQ==           │
└────────────────────────────┘
```
## base64URLEncode {#base64urlencode}

URL (String または FixedString) をbase64としてエンコードし、URLに特有の修正を加えます。[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5) に従って。

**構文**

```sql
base64URLEncode(url)
```

**引数**

- `url` — [String](../data-types/string.md) 列または定数。

**返される値**

- 引数のエンコードされた値を含む文字列。

**例**

```sql
SELECT base64URLEncode('https://clickhouse.com');
```

結果:

```result
┌─base64URLEncode('https://clickhouse.com')─┐
│ aHR0cDovL2NsaWNraG91c2UuY29t              │
└───────────────────────────────────────────┘
```
## base64Decode {#base64decode}

文字列を受け取り、base64からデコードします。[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4) に従って。エラーの場合には例外をスローします。

エイリアス: `FROM_BASE64`.

**構文**

```sql
base64Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) 列または定数。文字列が有効なBase64エンコードされた値でない場合、例外がスローされます。

**返される値**

- 引数のデコードされた値を含む文字列。

**例**

```sql
SELECT base64Decode('Y2xpY2tob3VzZQ==');
```

結果:

```result
┌─base64Decode('Y2xpY2tob3VzZQ==')─┐
│ clickhouse                       │
└──────────────────────────────────┘
```
## base64URLDecode {#base64urldecode}

base64エンコードされたURLを受け取り、base64からデコードし、URLに特有の修正を加えます。[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5) に従って。エラーの場合には例外をスローします。

**構文**

```sql
base64URLDecode(encodedUrl)
```

**引数**

- `encodedURL` — [String](../data-types/string.md) 列または定数。文字列が有効なBase64エンコードされた値でない場合、例外がスローされます。

**返される値**

- 引数のデコードされた値を含む文字列。

**例**

```sql
SELECT base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t');
```

結果:

```result
┌─base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t')─┐
│ https://clickhouse.com                          │
└─────────────────────────────────────────────────┘
```
## tryBase64Decode {#trybase64decode}

`base64Decode` と同様ですが、エラーの場合には空の文字列を返します。

**構文**

```sql
tryBase64Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) 列または定数。文字列が有効なBase64エンコードされた値でない場合、空の文字列を返します。

**返される値**

- 引数のデコードされた値を含む文字列。

**例**

クエリ:

```sql
SELECT tryBase64Decode('RW5jb2RlZA==') AS res, tryBase64Decode('invalid') AS res_invalid;
```

```response
┌─res────────┬─res_invalid─┐
│ clickhouse │             │
└────────────┴─────────────┘
```
## tryBase64URLDecode {#trybase64urldecode}

`base64URLDecode` と同様ですが、エラーの場合には空の文字列を返します。

**構文**

```sql
tryBase64URLDecode(encodedUrl)
```

**引数**

- `encodedURL` — [String](../data-types/string.md) 列または定数。文字列が有効なBase64エンコードされた値でない場合、空の文字列を返します。

**返される値**

- 引数のデコードされた値を含む文字列。

**例**

クエリ:

```sql
SELECT tryBase64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t') AS res, tryBase64Decode('aHR0cHM6Ly9jbGlja') AS res_invalid;
```

```response
┌─res────────────────────┬─res_invalid─┐
│ https://clickhouse.com │             │
└────────────────────────┴─────────────┘
```
## endsWith {#endswith}

文字列 `str` が `suffix` で終わるかどうかを返します。

**構文**

```sql
endsWith(str, suffix)
```
## endsWithUTF8 {#endswithutf8}

文字列 `str` が `suffix` で終わるかどうかを返します。`endsWithUTF8` と `endsWith` の違いは、`endsWithUTF8` が UTF-8 文字で `str` と `suffix` を一致させることです。

**構文**

```sql
endsWithUTF8(str, suffix)
```

**例**

```sql
SELECT endsWithUTF8('中国', '\xbd'), endsWith('中国', '\xbd')
```

結果:

```result
┌─endsWithUTF8('中国', '½')─┬─endsWith('中国', '½')─┐
│                        0 │                    1 │
└──────────────────────────┴──────────────────────┘
```
## startsWith {#startswith}

文字列 `str` が `prefix` で始まるかどうかを返します。

**構文**

```sql
startsWith(str, prefix)
```

**例**

```sql
SELECT startsWith('Spider-Man', 'Spi');
```
## startsWithUTF8 {#startswithutf8}

<VersionBadge minVersion='23.8' />

文字列 `str` が `prefix` で始まるかどうかを返します。`startsWithUTF8` と `startsWith` の違いは、`startsWithUTF8` が UTF-8 文字で `str` と `prefix` を一致させることです。

**例**

```sql
SELECT startsWithUTF8('中国', '\xe4'), startsWith('中国', '\xe4')
```

結果:

```result
┌─startsWithUTF8('中国', '⥩─┬─startsWith('中国', '⥩─┐
│                          0 │                      1 │
└────────────────────────────┴────────────────────────┘
```
## trim {#trim}

指定された文字を文字列の先頭または末尾から削除します。特に指定されない場合、関数は空白 (ASCII文字32) を削除します。

**構文**

```sql
trim([[LEADING|TRAILING|BOTH] trim_character FROM] input_string)
```

**引数**

- `trim_character` — 切り取る文字。[String](../data-types/string.md)。
- `input_string` — 切り取る対象の文字列。[String](../data-types/string.md)。

**返される値**

先頭および/または末尾の指定された文字が含まれていない文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT trim(BOTH ' ()' FROM '(   Hello, world!   )');
```

結果:

```result
┌─trim(BOTH ' ()' FROM '(   Hello, world!   )')─┐
│ Hello, world!                                 │
└───────────────────────────────────────────────┘
```
## trimLeft {#trimleft}

文字列の先頭から空白 (ASCII文字32) の連続発生を削除します。

**構文**

```sql
trimLeft(input_string[, trim_characters])
```

エイリアス: `ltrim`.

**引数**

- `input_string` — 切り取る対象の文字列。[String](../data-types/string.md)。
- `trim_characters` — 切り取る文字。オプション。[String](../data-types/string.md)。指定しない場合は、' ' (単一空白) が切り取り文字として使用されます。

**返される値**

先頭に一般的な空白が含まれていない文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT trimLeft('     Hello, world!     ');
```

結果:

```result
┌─trimLeft('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```
## trimRight {#trimright}

文字列の末尾から連続した空白文字 (ASCII文字32) を削除します。

**構文**

```sql
trimRight(input_string[, trim_characters])
```

エイリアス: `rtrim`.

**引数**

- `input_string` — トリムする文字列。 [String](../data-types/string.md).
- `trim_characters` — トリムする文字。オプション。 [String](../data-types/string.md). 指定されない場合は、`' '` (単一の空白) がトリム文字として使用されます。

**戻り値**

末尾の空白がない文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT trimRight('     Hello, world!     ');
```

結果:

```result
┌─trimRight('     Hello, world!     ')─┐
│      Hello, world!                   │
└──────────────────────────────────────┘
```

## trimBoth {#trimboth}

文字列の両端から連続した空白文字 (ASCII文字32) を削除します。

**構文**

```sql
trimBoth(input_string[, trim_characters])
```

エイリアス: `trim`.

**引数**

- `input_string` — トリムする文字列。 [String](../data-types/string.md).
- `trim_characters` — トリムする文字。オプション。 [String](../data-types/string.md). 指定されない場合は、`' '` (単一の空白) がトリム文字として使用されます。

**戻り値**

先頭と末尾の空白がない文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT trimBoth('     Hello, world!     ');
```

結果:

```result
┌─trimBoth('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```

## CRC32 {#crc32}

文字列のCRC32チェックサムを、CRC-32-IEEE 802.3多項式および初期値 `0xffffffff` (zlib実装) を使用して返します。

戻り値の型はUInt32です。

## CRC32IEEE {#crc32ieee}

文字列のCRC32チェックサムを、CRC-32-IEEE 802.3多項式を使用して返します。

戻り値の型はUInt32です。

## CRC64 {#crc64}

文字列のCRC64チェックサムを、CRC-64-ECMA多項式を使用して返します。

戻り値の型はUInt64です。

## normalizeUTF8NFC {#normalizeutf8nfc}

文字列を[NFC正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)に変換します。文字列が有効なUTF8エンコードされたテキストであると仮定します。

**構文**

```sql
normalizeUTF8NFC(words)
```

**引数**

- `words` — UTF8エンコードされた入力文字列。 [String](../data-types/string.md).

**戻り値**

- NFC正規化形式に変換された文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT length('â'), normalizeUTF8NFC('â') AS nfc, length(nfc) AS nfc_len;
```

結果:

```result
┌─length('â')─┬─nfc─┬─nfc_len─┐
│           2 │ â   │       2 │
└─────────────┴─────┴─────────┘
```

## normalizeUTF8NFD {#normalizeutf8nfd}

文字列を[NFD正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)に変換します。文字列が有効なUTF8エンコードされたテキストであると仮定します。

**構文**

```sql
normalizeUTF8NFD(words)
```

**引数**

- `words` — UTF8エンコードされた入力文字列。 [String](../data-types/string.md).

**戻り値**

- NFD正規化形式に変換された文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT length('â'), normalizeUTF8NFD('â') AS nfd, length(nfd) AS nfd_len;
```

結果:

```result
┌─length('â')─┬─nfd─┬─nfd_len─┐
│           2 │ â   │       3 │
└─────────────┴─────┴─────────┘
```

## normalizeUTF8NFKC {#normalizeutf8nfkc}

文字列を[NFKC正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)に変換します。文字列が有効なUTF8エンコードされたテキストであると仮定します。

**構文**

```sql
normalizeUTF8NFKC(words)
```

**引数**

- `words` — UTF8エンコードされた入力文字列。 [String](../data-types/string.md).

**戻り値**

- NFKC正規化形式に変換された文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT length('â'), normalizeUTF8NFKC('â') AS nfkc, length(nfkc) AS nfkc_len;
```

結果:

```result
┌─length('â')─┬─nfkc─┬─nfkc_len─┐
│           2 │ â    │        2 │
└─────────────┴──────┴──────────┘
```

## normalizeUTF8NFKD {#normalizeutf8nfkd}

文字列を[NFKD正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)に変換します。文字列が有効なUTF8エンコードされたテキストであると仮定します。

**構文**

```sql
normalizeUTF8NFKD(words)
```

**引数**

- `words` — UTF8エンコードされた入力文字列。 [String](../data-types/string.md).

**戻り値**

- NFKD正規化形式に変換された文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT length('â'), normalizeUTF8NFKD('â') AS nfkd, length(nfkd) AS nfkd_len;
```

結果:

```result
┌─length('â')─┬─nfkd─┬─nfkd_len─┐
│           2 │ â    │        3 │
└─────────────┴──────┴──────────┘
```

## encodeXMLComponent {#encodexmlcomponent}

特別な意味を持つXML文字をエスケープし、XMLテキストノードや属性に埋め込むことができるようにします。

次の文字が置換されます: `<`, `&`, `>`, `"`, `'`.
また、[XMLおよびHTMLの文字エンティティ参照のリスト](https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references)も参照してください。

**構文**

```sql
encodeXMLComponent(x)
```

**引数**

- `x` — 入力文字列。 [String](../data-types/string.md).

**戻り値**

- エスケープされた文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT encodeXMLComponent('Hello, "world"!');
SELECT encodeXMLComponent('<123>');
SELECT encodeXMLComponent('&clickhouse');
SELECT encodeXMLComponent('\'foo\'');
```

結果:

```result
Hello, &quot;world&quot;!
&lt;123&gt;
&amp;clickhouse
&apos;foo&apos;
```

## decodeXMLComponent {#decodexmlcomponent}

XMLで特別な意味を持つサブ文字列をデコードします。これらのサブ文字列は、`&quot;` `&amp;` `&apos;` `&gt;` `&lt;` です。

この関数はまた、数値文字参照をUnicode文字に置き換えます。十進法 (`&#10003;`) と16進法 (`&#x2713;`) の両方の形式がサポートされています。

**構文**

```sql
decodeXMLComponent(x)
```

**引数**

- `x` — 入力文字列。 [String](../data-types/string.md).

**戻り値**

- デコードされた文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT decodeXMLComponent('&apos;foo&apos;');
SELECT decodeXMLComponent('&lt; &#x3A3; &gt;');
```

結果:

```result
'foo'
< Σ >
```

## decodeHTMLComponent {#decodehtmlcomponent}

HTMLで特別な意味を持つサブ文字列をデコードします。例えば: `&hbar;` `&gt;` `&diamondsuit;` `&heartsuit;` `&lt;` など。

この関数はまた、数値文字参照をUnicode文字に置き換えます。十進法 (`&#10003;`) と16進法 (`&#x2713;`) の両方の形式がサポートされています。

**構文**

```sql
decodeHTMLComponent(x)
```

**引数**

- `x` — 入力文字列。 [String](../data-types/string.md).

**戻り値**

- デコードされた文字列。 [String](../data-types/string.md).

**例**

```sql
SELECT decodeHTMLComponent(''CH');
SELECT decodeHTMLComponent('I&heartsuit;ClickHouse');
```

結果:

```result
'CH'
I♥ClickHouse'
```

## extractTextFromHTML {#extracttextfromhtml}

この関数はHTMLまたはXHTMLからプレーンテキストを抽出します。

HTML、XML、XHTMLの仕様に100%準拠しているわけではありませんが、実装は合理的に正確で高速です。ルールは次のとおりです。

1. コメントはスキップされます。例: `<!-- test -->`。コメントは `-->` で終了する必要があります。ネストされたコメントは許可されません。
注意: `<!-->` や `<!--->` のような構文はHTMLでは有効なコメントではありませんが、他のルールによりスキップされます。
2. CDATAはそのまま貼り付けられます。注意: CDATAはXML/XHTML特有であり、「最善の努力」ベースで処理されます。
3. `script`および`style`要素は、その内容とともに削除されます。注意: 閉じタグは内容内に出現しないと仮定されます。たとえば、JSの文字列リテラルは `"<\/script>"`のようにエスケープする必要があります。
注意: `script`または`style`内ではコメントやCDATAが可能ですが、その場合、CDATA内で閉じタグは検索されません。例: `<script><![CDATA[</script>]]></script>`。 しかし、コメント内では検索されます。時には複雑になります: `<script>var x = "<!--"; </script> var y = "-->"; alert(x + y);</script>`。
注意: `script`および`style`はXML名前空間の名前である可能性があるため、その場合、通常の `script` または `style` 要素として扱われません。例: `<script:a>Hello</script:a>`。
注意: 閉じタグ名の後に空白が入ることはあります: `</script >` ですが、その前には入らないことが期待されます: `< / script>`。
4. 他のタグやタグのような要素は、内部コンテンツなしでスキップされます。例: `<a>.</a>`
注意: このHTMLは違法であることが期待されています: `<a test=">"></a>`
注意: `<>`や `<!>` のようなタグもスキップされます。
注意: 終了しないタグは入力の終わりまでスキップされます: `<hello   `。
5. HTMLおよびXMLエンティティはデコードされません。別の関数で処理する必要があります。
6. テキスト内の空白は特定のルールに従って折りたたまれるか挿入されます。
    - 開始と終了の空白が削除されます。
    - 連続する空白が折りたたまれます。
    - ただし、テキストが他の要素によって区切られ、空白がない場合は挿入されます。
    - これは不自然な例を引き起こす可能性があります: `Hello<b>world</b>`, `Hello<!-- -->world` - HTMLには空白がありませんが、関数はそれを挿入します。また考えてください: `Hello<p>world</p>`, `Hello<br>world`。この動作はデータ分析にとって合理的です。たとえば、HTMLを単語の袋に変換するためです。
7. 正確な空白処理には、`<pre></pre>` とCSSの `display` および `white-space` プロパティのサポートが必要です。

**構文**

```sql
extractTextFromHTML(x)
```

**引数**

- `x` — 入力テキスト。 [String](../data-types/string.md).

**戻り値**

- 抽出されたテキスト。 [String](../data-types/string.md).

**例**

最初の例にはいくつかのタグとコメントが含まれており、空白処理も示しています。
2番目の例は `CDATA` と `script` タグ処理を示しています。
3番目の例では、[url](../../sql-reference/table-functions/url.md)関数から受け取った完全なHTMLレスポンスからテキストが抽出されます。

```sql
SELECT extractTextFromHTML(' <p> A text <i>with</i><b>tags</b>. <!-- comments --> </p> ');
SELECT extractTextFromHTML('<![CDATA[The content within <b>CDATA</b>]]> <script>alert("Script");</script>');
SELECT extractTextFromHTML(html) FROM url('http://www.donothingfor2minutes.com/', RawBLOB, 'html String');
```

結果:

```result
A text with tags .
The content within <b>CDATA</b>
Do Nothing for 2 Minutes 2:00 &nbsp;
```

## ascii {#ascii}

文字列 `s` の最初の文字のASCIIコードポイント (Int32として) を返します。

`s` が空である場合、結果は0です。最初の文字がASCII文字でない場合や、Latin-1補完の範囲内にない場合、結果は未定義です。

**構文**

```sql
ascii(s)
```

## soundex {#soundex}

文字列の[Soundexコード](https://en.wikipedia.org/wiki/Soundex)を返します。

**構文**

```sql
soundex(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**戻り値**

- 入力値のSoundexコード。 [String](../data-types/string.md)

**例**

```sql
SELECT soundex('aksel');
```

結果:

```result
┌─soundex('aksel')─┐
│ A240             │
└──────────────────┘
```

## punycodeEncode {#punycodeencode}

文字列の[Punycode](https://en.wikipedia.org/wiki/Punycode)表現を返します。
文字列はUTF8エンコードされている必要があります。そうでない場合、動作は未定義です。

**構文**

```sql
punycodeEncode(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**戻り値**

- 入力値のPunycode表現。 [String](../data-types/string.md)

**例**

```sql
SELECT punycodeEncode('München');
```

結果:

```result
┌─punycodeEncode('München')─┐
│ Mnchen-3ya                │
└───────────────────────────┘
```

## punycodeDecode {#punycodedecode}

[Punycode](https://en.wikipedia.org/wiki/Punycode)エンコードされた文字列のUTF8エンコードされたプレーンテキストを返します。
無効なPunycodeエンコードされた文字列が与えられた場合、例外がスローされます。

**構文**

```sql
punycodeEncode(val)
```

**引数**

- `val` — Punycodeエンコードされた文字列。 [String](../data-types/string.md)

**戻り値**

- 入力値のプレーンテキスト。 [String](../data-types/string.md)

**例**

```sql
SELECT punycodeDecode('Mnchen-3ya');
```

結果:

```result
┌─punycodeDecode('Mnchen-3ya')─┐
│ München                      │
└──────────────────────────────┘
```

## tryPunycodeDecode {#trypunycodedecode}

`punycodeDecode`と同様ですが、有効なPunycodeエンコードされた文字列が与えられなかった場合は空の文字列を返します。

## idnaEncode {#idnaencode}

[国際化ドメイン名アプリケーションにおけるドメイン名](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA) メカニズムに従って、ドメイン名のASCII表現 (ToASCIIアルゴリズム) を返します。
入力文字列はUTFエンコードされ、ASCII文字列に変換可能でなければなりません。そうでない場合、例外がスローされます。
注意: パーセントデコーディングやタブ、スペース、制御文字のトリミングは行われません。

**構文**

```sql
idnaEncode(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**戻り値**

- 入力値のIDNAメカニズムに従ったASCII表現。 [String](../data-types/string.md)

**例**

```sql
SELECT idnaEncode('straße.münchen.de');
```

結果:

```result
┌─idnaEncode('straße.münchen.de')─────┐
│ xn--strae-oqa.xn--mnchen-3ya.de     │
└─────────────────────────────────────┘
```

## tryIdnaEncode {#tryidnaencode}

`idnaEncode`と同様ですが、例外をスローする代わりにエラー発生時に空の文字列を返します。

## idnaDecode {#idnadecode}

[国際化ドメイン名アプリケーションにおけるドメイン名](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA) メカニズムに従って、ドメイン名のUnicode (UTF-8) 表現 (ToUnicodeアルゴリズム) を返します。
エラーが発生した場合 (例: 入力が無効な場合)、入力文字列が返されます。
`idnaEncode()` と `idnaDecode()` を繰り返し適用することは、ケース正規化のために必ずしも元の文字列を返すわけではないことに注意してください。

**構文**

```sql
idnaDecode(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**戻り値**

- 入力値のIDNAメカニズムに従ったUnicode (UTF-8) 表現。 [String](../data-types/string.md)

**例**

```sql
SELECT idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de');
```

結果:

```result
┌─idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de')─┐
│ straße.münchen.de                             │
└───────────────────────────────────────────────┘
```

## byteHammingDistance {#bytehammingdistance}

2つのバイト文字列間の[ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance)を計算します。

**構文**

```sql
byteHammingDistance(string1, string2)
```

**例**

```sql
SELECT byteHammingDistance('karolin', 'kathrin');
```

結果:

```text
┌─byteHammingDistance('karolin', 'kathrin')─┐
│                                         3 │
└───────────────────────────────────────────┘
```

エイリアス: `mismatches`

## stringJaccardIndex {#stringjaccardindex}

2つのバイト文字列間の[Jaccard類似度指数](https://en.wikipedia.org/wiki/Jaccard_index)を計算します。

**構文**

```sql
stringJaccardIndex(string1, string2)
```

**例**

```sql
SELECT stringJaccardIndex('clickhouse', 'mouse');
```

結果:

```text
┌─stringJaccardIndex('clickhouse', 'mouse')─┐
│                                       0.4 │
└───────────────────────────────────────────┘
```

## stringJaccardIndexUTF8 {#stringjaccardindexutf8}

[80]中の>stringJaccardIndex](#stringjaccardindex)と同様ですが、UTF8エンコードされた文字列に対して動作します。

## editDistance {#editdistance}

2つのバイト文字列間の[編集距離](https://en.wikipedia.org/wiki/Edit_distance)を計算します。

**構文**

```sql
editDistance(string1, string2)
```

**例**

```sql
SELECT editDistance('clickhouse', 'mouse');
```

結果:

```text
┌─editDistance('clickhouse', 'mouse')─┐
│                                   6 │
└─────────────────────────────────────┘
```

エイリアス: `levenshteinDistance`

## editDistanceUTF8 {#editdistanceutf8}

2つのUTF8文字列間の[編集距離](https://en.wikipedia.org/wiki/Edit_distance)を計算します。

**構文**

```sql
editDistanceUTF8(string1, string2)
```

**例**

```sql
SELECT editDistanceUTF8('我是谁', '我是我');
```

結果:

```text
┌─editDistanceUTF8('我是谁', '我是我')──┐
│                                   1 │
└─────────────────────────────────────┘
```

エイリアス: `levenshteinDistanceUTF8`

## damerauLevenshteinDistance {#dameraulevenshteindistance}

2つのバイト文字列間の[Damerau-Levenshtein距離](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance)を計算します。

**構文**

```sql
damerauLevenshteinDistance(string1, string2)
```

**例**

```sql
SELECT damerauLevenshteinDistance('clickhouse', 'mouse');
```

結果:

```text
┌─damerauLevenshteinDistance('clickhouse', 'mouse')─┐
│                                                 6 │
└───────────────────────────────────────────────────┘
```

## jaroSimilarity {#jarosimilarity}

2つのバイト文字列間の[Jaro類似度](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro_similarity)を計算します。

**構文**

```sql
jaroSimilarity(string1, string2)
```

**例**

```sql
SELECT jaroSimilarity('clickhouse', 'click');
```

結果:

```text
┌─jaroSimilarity('clickhouse', 'click')─┐
│                    0.8333333333333333 │
└───────────────────────────────────────┘
```

## jaroWinklerSimilarity {#jarowinklersimilarity}

2つのバイト文字列間の[Jaro-Winkler類似度](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro%E2%80%93Winkler_similarity)を計算します。

**構文**

```sql
jaroWinklerSimilarity(string1, string2)
```

**例**

```sql
SELECT jaroWinklerSimilarity('clickhouse', 'click');
```

結果:

```text
┌─jaroWinklerSimilarity('clickhouse', 'click')─┐
│                           0.8999999999999999 │
└──────────────────────────────────────────────┘
```

## initcap {#initcap}

各単語の最初の文字を大文字にし、そのほかを小文字にします。単語は、非英数字文字で区切られた英数字の文字列です。

:::note
`initCap`は各単語の最初の文字のみを大文字に変換するため、アポストロフィや大文字を含む単語では予期しない動作が観察されることがあります。例えば:

```sql
SELECT initCap('mother''s daughter'), initCap('joe McAdam');
```

は次のように返されます。

```response
┌─initCap('mother\'s daughter')─┬─initCap('joe McAdam')─┐
│ Mother'S Daughter             │ Joe Mcadam            │
└───────────────────────────────┴───────────────────────┘
```

これは既知の動作であり、修正の計画は現在ありません。
:::

**構文**

```sql
initcap(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md).

**戻り値**

- 単語の最初の文字が大文字に変換された `val`。 [String](../data-types/string.md).

**例**

クエリ:

```sql
SELECT initcap('building for fast');
```

結果:

```text
┌─initcap('building for fast')─┐
│ Building For Fast            │
└──────────────────────────────┘
```

## initcapUTF8 {#initcaputf8}

[initcap](#initcap)と同様に、`initcapUTF8`は各単語の最初の文字を大文字にし、そのほかを小文字にします。有効なUTF-8エンコードされたテキストが含まれていると仮定します。
この仮定が破られた場合、例外はスローされず、結果は未定義になります。

:::note
この関数は言語を検出しません。例えば、トルコ語の場合、結果が正確でない場合があります (i/İ vs. i/I)。
UTF-8バイトシーケンスの長さが大文字と小文字で異なる場合、このコードポイントの結果が正しくない場合があります。
:::

**構文**

```sql
initcapUTF8(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md).

**戻り値**

- 単語の最初の文字が大文字に変換された `val`。 [String](../data-types/string.md).

**例**

クエリ:

```sql
SELECT initcapUTF8('не тормозит');
```

結果:

```text
┌─initcapUTF8('не тормозит')─┐
│ Не Тормозит                │
└────────────────────────────┘
```

## firstLine {#firstline}

複数行の文字列から最初の行を返します。

**構文**

```sql
firstLine(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**戻り値**

- 入力値の最初の行、または行区切りがない場合は全体の値。 [String](../data-types/string.md)

**例**

```sql
SELECT firstLine('foo\nbar\nbaz');
```

結果:

```result
┌─firstLine('foo\nbar\nbaz')─┐
│ foo                        │
└────────────────────────────┘
```

## stringCompare {#stringcompare}

2つの文字列を辞書式に比較します。

**構文**

```sql
stringCompare(string1, string2[, str1_off, string2_offset, num_bytes]);
```

**引数**

- `string1` — 比較する最初の文字列。 [String](../data-types/string.md)
- `string2` - 比較する2番目の文字列。 [String](../data-types/string.md)
- `string1_offset` — 比較が始まる `string1` 内の位置 (0ベース)。オプション、正の数。
- `string2_offset` — 比較が始まる `string2` 内の位置 (0ベース)。オプション、正の数。
- `num_bytes` — 両方の文字列で比較する最大バイト数。 `string_offset` + `num_bytes` が入力文字列の終わりを超える場合、`num_bytes` はそれに応じて減少します。

**戻り値**

- -1 — `string1`[`string1_offset`: `string1_offset` + `num_bytes`] < `string2`[`string2_offset`:`string2_offset` + `num_bytes`] かつ `string1_offset` < len(`string1`) かつ `string2_offset` < len(`string2`) の場合。
`string1_offset` >= len(`string1`) かつ `string2_offset` < len(`string2`) の場合。
- 0 — `string1`[`string1_offset`: `string1_offset` + `num_bytes`] = `string2`[`string2_offset`:`string2_offset` + `num_bytes`] かつ `string1_offset` < len(`string1`) かつ `string2_offset` < len(`string2`) の場合。
`string1_offset` >= len(`string1`) かつ `string2_offset` >= len(`string2`) の場合。
- 1 — `string1`[`string1_offset`: `string1_offset` + `num_bytes`] > `string2`[`string2_offset`:`string2_offset` + `num_bytes`] かつ `string1_offset` < len(`string1`) かつ `string2_offset` < len(`string2`) の場合。
`string1_offset` < len(`string1`) かつ `string2_offset` >= len(`string2`) の場合。

**例**

```sql
SELECT
    stringCompare('alice', 'bob', 0, 0, 3) AS result1,
    stringCompare('alice', 'alicia', 0, 0, 3) AS result2,
    stringCompare('bob', 'alice', 0, 0, 3) AS result3
```

結果:
```result
   ┌─result1─┬─result2─┬─result3─┐
1. │      -1 │       0 │       1 │
   └─────────┴─────────┴─────────┘
```

```sql
SELECT
    stringCompare('alice', 'alicia') AS result2,
    stringCompare('alice', 'alice') AS result1,
    stringCompare('bob', 'alice') AS result3
```

結果:
```result
   ┌─result2─┬─result1─┬─result3─┐
1. │      -1 │       0 │       1 │
   └─────────┴─────────┴─────────┘
```

## sparseGrams {#sparsegrams}

与えられた文字列のすべての部分文字列の中で、長さが少なくとも `n` であり、
部分文字列の境界にある(n-1)-グラムのハッシュが、部分文字列内部のいかなる(n-1)-グラムのハッシュよりも厳密に大きいものを見つけます。
ハッシュ関数として[crc32](./string-functions.md#crc32)を使用します。

**構文**

```sql
sparseGrams(s[, min_ngram_length]);
```

**引数**

- `s` — 入力文字列。 [String](../data-types/string.md)
- `min_ngram_length` — 抽出されるnグラムの最小長。デフォルトおよび最小値は3です。
- `max_ngram_length` — 抽出されるnグラムの最大長。デフォルト値は100です。 `min_ngram_length` よりも小さくない必要があります。

**戻り値**

- 選択された部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md)).

**例**

```sql
SELECT sparseGrams('alice', 3) AS result
```

結果:
```result
   ┌─result─────────────────────┐
1. │ ['ali','lic','lice','ice'] │
   └────────────────────────────┘
```

## sparseGramsUTF8 {#sparsegramsutf8}

与えられた文字列のすべての部分文字列の中で、長さが少なくとも `n` であり、
部分文字列の境界にある(n-1)-グラムのハッシュが、部分文字列内部のいかなる(n-1)-グラムのハッシュよりも厳密に大きいものを見つけます。
ハッシュ関数として[crc32](./string-functions.md#crc32)を使用します。
UTF-8文字列を期待し、無効なUTF-8シーケンスの場合は例外をスローします。

**構文**

```sql
sparseGramsUTF8(s[, min_ngram_length]);
```

**引数**

- `s` — 入力文字列。 [String](../data-types/string.md)
- `min_ngram_length` — 抽出されるnグラムの最小長。デフォルトおよび最小値は3です。
- `max_ngram_length` — 抽出されるnグラムの最大長。デフォルト値は100です。 `min_ngram_length` よりも小さくない必要があります。

**戻り値**

- 選択された部分文字列のcrc32-cハッシュの配列。 [Array](../data-types/array.md)([UInt32](../data-types/int-uint.md)).

**例**

```sql
SELECT sparseGramsUTF8('алиса', 3) AS result
```

結果:
```result
   ┌─result──────────────┐
1. │ ['али','лис','иса'] │
   └─────────────────────┘
```

## sparseGramsHashes {#sparsegramshashes}

与えられた文字列のすべての部分文字列の中で、長さが少なくとも `n` であり、
部分文字列の境界にある(n-1)-グラムのハッシュが、部分文字列内部のいかなる(n-1)-グラムのハッシュよりも厳密に大きいものを見つけます。
ハッシュ関数として[crc32](./string-functions.md#crc32)を使用します。

**構文**

```sql
sparseGramsHashes(s[, min_ngram_length]);
```

**引数**

- `s` — 入力文字列。 [String](../data-types/string.md)
- `min_ngram_length` — 抽出されるnグラムの最小長。デフォルトおよび最小値は3です。
- `max_ngram_length` — 抽出されるnグラムの最大長。デフォルト値は100です。 `min_ngram_length` よりも小さくない必要があります。

**戻り値**

- 選択された部分文字列のcrc32-cハッシュの配列。 [Array](../data-types/array.md)([UInt32](../data-types/int-uint.md)).

**例**

```sql
SELECT sparseGramsHashes('alice', 3) AS result
```

結果:
```result
   ┌─result────────────────────────────────────────┐
1. │ [1265796434,3725069146,1689963195,3410985998] │
   └───────────────────────────────────────────────┘
```

## sparseGramsHashesUTF8 {#sparsegramshashesutf8}

与えられた文字列のすべての部分文字列の中で、長さが少なくとも `n` であり、
部分文字列の境界にある(n-1)-グラムのハッシュが、部分文字列内部のいかなる(n-1)-グラムのハッシュよりも厳密に大きいものを見つけます。
ハッシュ関数として[crc32](./string-functions.md#crc32)を使用します。
UTF-8文字列を期待し、無効なUTF-8シーケンスの場合は例外をスローします。

**構文**

```sql
sparseGramsUTF8(s[, min_ngram_length]);
```

**引数**

- `s` — 入力文字列。 [String](../data-types/string.md)
- `min_ngram_length` — 抽出されるnグラムの最小長。デフォルトおよび最小値は3です。
- `max_ngram_length` — 抽出されるnグラムの最大長。デフォルト値は100です。 `min_ngram_length` よりも小さくない必要があります。

**戻り値**

- 選択された部分文字列のcrc32-cハッシュの配列。 [Array](../data-types/array.md)([UInt32](../data-types/int-uint.md)).

**例**

```sql
SELECT sparseGramsHashesUTF8('алиса', 3) AS result
```

結果:
```result
   ┌─result───────────────────────────┐
1. │ [417784657,728683856,3071092609] │
   └──────────────────────────────────┘
```

## stringBytesUniq {#stringbytesuniq}

文字列内の異なるバイトの数をカウントします。

**構文**

```sql
stringBytesUniq(s)
```

**引数**

- `s` — 分析する文字列。 [String](../data-types/string.md).

**戻り値**

- 文字列内の異なるバイトの数。 [UInt16](../data-types/int-uint.md).

**例**

```sql
SELECT stringBytesUniq('Hello');
```

結果:

```result
┌─stringBytesUniq('Hello')─┐
│                        4 │
└──────────────────────────┘
```

## stringBytesEntropy {#stringbytesentropy}

文字列内のバイト分布のシャノンエントロピーを計算します。

**構文**

```sql
stringBytesEntropy(s)
```

**引数**

- `s` — 分析する文字列。 [String](../data-types/string.md).

**戻り値**

- 文字列内のバイト分布のシャノンエントロピー。 [Float64](../data-types/float.md).

**例**

```sql
SELECT stringBytesEntropy('Hello, world!');
```

結果:

```result
┌─stringBytesEntropy('Hello, world!')─┐
│                         3.07049960  │
└─────────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
