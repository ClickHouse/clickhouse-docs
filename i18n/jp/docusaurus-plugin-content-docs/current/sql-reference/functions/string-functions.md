---
'description': '文字列操作用の関数のドキュメント'
'sidebar_label': '文字列'
'sidebar_position': 170
'slug': '/sql-reference/functions/string-functions'
'title': 'Functions for Working with Strings'
---

import VersionBadge from '@theme/badges/VersionBadge';



# 文字列操作のための関数

[文字列の検索](string-search-functions.md)と[文字列の置換](string-replace-functions.md)に関する関数は、それぞれ別に説明されています。
## empty {#empty}

入力文字列が空かどうかをチェックします。文字列は、空白やヌルバイトを含んでいても、少なくとも1バイトを含んでいる場合、非空と見なされます。

この関数は[配列](/sql-reference/functions/array-functions#empty)と[UUID](uuid-functions.md#empty)にも使用できます。

**構文**

```sql
empty(x)
```

**引数**

- `x` — 入力値。[String](../data-types/string.md)。

**戻り値**

- 空の文字列の場合は `1` を、非空の文字列の場合は `0` を返します。[UInt8](../data-types/int-uint.md)。

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

入力文字列が非空かどうかをチェックします。文字列は、空白やヌルバイトを含んでいても、少なくとも1バイトを含んでいる場合、非空と見なされます。

この関数は[配列](/sql-reference/functions/array-functions#notempty)と[UUID](uuid-functions.md#notempty)にも使用できます。

**構文**

```sql
notEmpty(x)
```

**引数**

- `x` — 入力値。[String](../data-types/string.md)。

**戻り値**

- 非空の文字列の場合は `1` を、空の文字列の場合は `0` を返します。[UInt8](../data-types/int-uint.md)。

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

文字列の長さをバイト単位で返します。文字やUnicodeコードポイントではなくバイトで計算します。この関数は配列にも使用できます。

エイリアス: `OCTET_LENGTH`

**構文**

```sql
length(s)
```

**パラメータ**

- `s` — 入力文字列または配列。[String](../data-types/string)/[Array](../data-types/array)。

**戻り値**

- 文字列または配列 `s` の長さ（バイト単位）。[UInt64](../data-types/int-uint)。

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

文字列の長さをUnicodeコードポイント単位で返します。文字列が有効なUTF-8エンコードされたテキストを含んでいると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

エイリアス:
- `CHAR_LENGTH`
- `CHARACTER_LENGTH`

**構文**

```sql
lengthUTF8(s)
```

**パラメータ**

- `s` — 有効なUTF-8エンコードされたテキストを含む文字列。[String](../data-types/string.md)。

**戻り値**

- 文字列 `s` の長さ（Unicodeコードポイント単位）。[UInt64](../data-types/int-uint.md)。

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

文字列 `s` の指定された`offset`から左側の部分文字列を返します。

**構文**

```sql
left(s, offset)
```

**パラメータ**

- `s` — 部分文字列を計算するための文字列。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**戻り値**

- 正の`offset`の場合: 文字列の左側から`offset`バイトの部分文字列。
- 負の`offset`の場合: 文字列の左側から `length(s) - |offset|` バイトの部分文字列。
- `length` が 0 の場合、空の文字列。

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

UTF-8エンコードされた文字列 `s` の指定された `offset` から左側の部分文字列を返します。

**構文**

```sql
leftUTF8(s, offset)
```

**パラメータ**

- `s` — 部分文字列を計算するためのUTF-8エンコードされた文字列。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**戻り値**

- 正の`offset`の場合: 文字列の左側から`offset`バイトの部分文字列。
- 負の`offset`の場合: 文字列の左側から `length(s) - |offset|` バイトの部分文字列。
- `length` が 0 の場合、空の文字列。

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

文字列を左側からスペースまたは指定された文字列でパディングし、結果の文字列が指定された`length`に達するまで繰り返します。

**構文**

```sql
leftPad(string, length[, pad_string])
```

エイリアス: `LPAD`

**引数**

- `string` — パディングするべき入力文字列。[String](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。値が入力文字列の長さより小さい場合、入力文字列は`length`文字に短縮されます。
- `pad_string` — 入力文字列をパディングする文字列。[String](../data-types/string.md)。オプション。指定されていない場合、入力文字列はスペースでパディングされます。

**戻り値**

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

文字列を左側からスペースまたは指定された文字列でパディングし、結果の文字列が指定された長さに達するまで繰り返します。 [leftPad](#leftpad) はバイト単位で文字列の長さを測定しますが、この関数ではコードポイント単位で測定します。

**構文**

```sql
leftPadUTF8(string, length[, pad_string])
```

**引数**

- `string` — パディングするべき入力文字列。[String](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。値が入力文字列の長さより小さい場合、入力文字列は`length`文字に短縮されます。
- `pad_string` — 入力文字列をパディングする文字列。[String](../data-types/string.md)。オプション。指定されていない場合、入力文字列はスペースでパディングされます。

**戻り値**

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

文字列 `s` の指定された `offset` から右側の部分文字列を返します。

**構文**

```sql
right(s, offset)
```

**パラメータ**

- `s` — 部分文字列を計算するための文字列。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**戻り値**

- 正の `offset` の場合: 文字列の右側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の右側から `length(s) - |offset|` バイトの部分文字列。
- `length` が 0 の場合、空の文字列。

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

UTF-8エンコードされた文字列 `s` の指定された `offset` から右側の部分文字列を返します。

**構文**

```sql
rightUTF8(s, offset)
```

**パラメータ**

- `s` — 部分文字列を計算するためのUTF-8エンコードされた文字列。[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**戻り値**

- 正の `offset` の場合: 文字列の右側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の右側から `length(s) - |offset|` バイトの部分文字列。
- `length` が 0 の場合、空の文字列。

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

文字列を右側からスペースまたは指定された文字列でパディングし、結果の文字列が指定された`length`に達するまで繰り返します。

**構文**

```sql
rightPad(string, length[, pad_string])
```

エイリアス: `RPAD`

**引数**

- `string` — パディングするべき入力文字列。[String](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。値が入力文字列の長さより小さい場合、入力文字列は`length`文字に短縮されます。
- `pad_string` — 入力文字列をパディングする文字列。[String](../data-types/string.md)。オプション。指定されていない場合、入力文字列はスペースでパディングされます。

**戻り値**

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

文字列を右側からスペースまたは指定された文字列でパディングし、結果の文字列が指定された長さに達するまで繰り返します。[rightPad](#rightpad)はバイト単位で文字列の長さを測定しますが、この関数はコードポイント単位で測定します。

**構文**

```sql
rightPadUTF8(string, length[, pad_string])
```

**引数**

- `string` — パディングするべき入力文字列。[String](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。値が入力文字列の長さより小さい場合、入力文字列は`length`文字に短縮されます。
- `pad_string` — 入力文字列をパディングする文字列。[String](../data-types/string.md)。オプション。指定されていない場合、入力文字列はスペースでパディングされます。

**戻り値**

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

2つの文字列を辞書式に比較します。

**構文**

```sql
compareSubstrings(string1, string2, string1_offset, string2_offset, num_bytes);
```

**引数**

- `string1` — 比較する最初の文字列。[String](../data-types/string.md)
- `string2` - 比較する2番目の文字列。[String](../data-types/string.md)
- `string1_offset` — 比較開始位置（ゼロベース）を指定する `string1` の位置。[UInt*](../data-types/int-uint.md)。
- `string2_offset` — 比較開始位置（ゼロベース）を指定する `string2` の位置。[UInt*](../data-types/int-uint.md)。
- `num_bytes` — 両方の文字列で比較する最大バイト数。 `string_offset` + `num_bytes` が入力文字列の終端を超える場合、`num_bytes` はそれに応じて減少します。[UInt*](../data-types/int-uint.md)。

**戻り値**

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

文字列内のASCIIラテン記号を小文字に変換します。

*構文**

```sql
lower(input)
```

エイリアス: `lcase`

**パラメータ**

- `input`: 文字列型 [String](../data-types/string.md)。

**戻り値**

- [String](../data-types/string.md) データ型の値。

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

文字列内のASCIIラテン記号を大文字に変換します。

**構文**

```sql
upper(input)
```

エイリアス: `ucase`

**パラメータ**

- `input` — 文字列型 [String](../data-types/string.md)。

**戻り値**

- [String](../data-types/string.md) データ型の値。

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

文字列を小文字に変換します。文字列が有効なUTF-8エンコードされたテキストを含んでいると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

:::note
言語を検出することはできません。例えばトルコ語の場合、結果は正確でない可能性があります（i/İ と i/I）。もしUTF-8バイトシーケンスの長さが、コードポイントの大文字と小文字で異なる場合（`ẞ` と `ß` のように）、このコードポイントに対して結果が不正確になる可能性があります。
:::

**構文**

```sql
lowerUTF8(input)
```

**パラメータ**

- `input` — 文字列型 [String](../data-types/string.md)。

**戻り値**

- [String](../data-types/string.md) データ型の値。

**例**

クエリ:

```sql
SELECT lowerUTF8('MÜNCHEN') as Lowerutf8;
```

結果:

```response
┌─Lowerutf8─┐
│ münchen   │
└───────────┘
```
## upperUTF8 {#upperutf8}

文字列を大文字に変換します。文字列が有効なUTF-8エンコードされたテキストを含んでいると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

:::note
言語を検出することはできません。例えばトルコ語の場合、結果は正確でない可能性があります（i/İ と i/I）。もしUTF-8バイトシーケンスの長さが、コードポイントの大文字と小文字で異なる場合（`ẞ` と `ß` のように）、このコードポイントに対して結果が不正確になる可能性があります。
:::

**構文**

```sql
upperUTF8(input)
```

**パラメータ**

- `input` — 文字列型 [String](../data-types/string.md)。

**戻り値**

- [String](../data-types/string.md) データ型の値。

**例**

クエリ:

```sql
SELECT upperUTF8('München') as Upperutf8;
```

結果:

```response
┌─Upperutf8─┐
│ MÜNCHEN   │
└───────────┘
```
## isValidUTF8 {#isvalidutf8}

バイトのセットが有効なUTF-8エンコードされたテキストを構成している場合、1を返します。そうでない場合は0を返します。

**構文**

```sql
isValidUTF8(input)
```

**パラメータ**

- `input` — 文字列型 [String](../data-types/string.md)。

**戻り値**

- バイトのセットが有効なUTF-8エンコードされたテキストを構成している場合は`1`を、そうでない場合は`0`を返します。

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

無効なUTF-8文字を `�` (U+FFFD) 文字で置き換えます。連続して無効な文字は1つの置換文字にまとめられます。

**構文**

```sql
toValidUTF8(input_string)
```

**引数**

- `input_string` — [String](../data-types/string.md) データ型のオブジェクトで表された任意のバイトセット。

**戻り値**

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

指定された回数だけ文字列を連結します。

**構文**

```sql
repeat(s, n)
```

エイリアス: `REPEAT`

**引数**

- `s` — 繰り返す文字列。[String](../data-types/string.md)。
- `n` — 文字列を繰り返す回数。[UInt* または Int*](../data-types/int-uint.md)。

**戻り値**

文字列` s` が `n` 回繰り返された文字列。もし `n` &lt;= 0 の場合、関数は空の文字列を返します。[String](../data-types/string.md)。

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

指定された回数だけスペース（` `）を連結します。

**構文**

```sql
space(n)
```

エイリアス: `SPACE`。

**引数**

- `n` — スペースを繰り返す回数。[UInt* または Int*](../data-types/int-uint.md)。

**戻り値**

文字列` ` が `n` 回繰り返された文字列。もし `n` &lt;= 0 の場合、関数は空の文字列を返します。[String](../data-types/string.md)。

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

文字列のバイトシーケンスを反転します。
## reverseUTF8 {#reverseutf8}

文字列のUnicodeコードポイントのシーケンスを反転します。有効なUTF-8エンコードされたテキストを含んでいると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。
## concat {#concat}

与えられた引数を連結します。

**構文**

```sql
concat(s1, s2, ...)
```

**引数**

任意の型の値。

[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md) でない型の引数は、デフォルトのシリアル化を使用して文字列に変換されます。これによりパフォーマンスが低下するため、非 String/FixedString 引数の使用は推奨されません。

**戻り値**

引数を連結して作成された文字列。

いずれかの引数が `NULL` の場合、関数は `NULL` を返します。

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
文字列連結には `concat()` の簡潔な代替として `||` 演算子を使用してください。例えば、`'Hello, ' || 'World!'` は `concat('Hello, ', 'World!')` と同等です。
:::
## concatAssumeInjective {#concatassumeinjective}

[concat](#concat) と同様ですが、`concat(s1, s2, ...) → sn` が単射であると仮定します。GROUP BY の最適化に使用できます。

関数が単射と呼ばれるのは、異なる引数に対して異なる結果を返すときです。言い換えれば: 異なる引数は決して同じ結果を生成しません。

**構文**

```sql
concatAssumeInjective(s1, s2, ...)
```

**引数**

String または FixedString 型の値。

**戻り値**

引数を連結して作成された文字列。

いずれかの引数が `NULL` の場合、関数は `NULL` を返します。

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

指定された区切り文字で与えられた文字列を連結します。

**構文**

```sql
concatWithSeparator(sep, expr1, expr2, expr3...)
```

エイリアス: `concat_ws`

**引数**

- sep — 区切り文字。定数の[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- exprN — 連結される表現。非[String](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)型の引数は、デフォルトのシリアル化を使用して文字列に変換されます。これによりパフォーマンスが低下するため、非 String/FixedString 引数の使用は推奨されません。

**戻り値**

引数を連結して作成された文字列。

いずれかの引数が `NULL` の場合、関数は `NULL` を返します。

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

`concatWithSeparator` のようですが、`concatWithSeparator(sep, expr1, expr2, expr3...) → result` が単射であると仮定します。GROUP BYの最適化に使用できます。

関数が単射と呼ばれるのは、異なる引数に対して異なる結果を返すときです。言い換えれば: 異なる引数は決して同じ結果を生成しません。
## substring {#substring}

文字列 `s` の部分文字列を返します。部分文字列は指定されたバイトインデックス `offset` から始まります。バイトの数え方は1から始まります。もし `offset` が 0 の場合は、空の文字列が返されます。もし `offset` が負の数である場合、部分文字列は文字列の始まりではなく、文字列の終わりから`pos`文字の位置から始まります。オプションの引数 `length` では、返される部分文字列の最大バイト数を指定できます。

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
- `length` — 部分文字列の最大長。[(U)Int*](../data-types/int-uint.md)。オプション。

**戻り値**

インデックス `offset` から始まる `s` の部分文字列で、`length` バイト分です。[String](../data-types/string.md)。

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

文字列 `s` の部分文字列を返します。部分文字列は指定されたバイトインデックス `offset` で始まります。バイトの数え方は1から始まります。もし `offset` が 0 の場合は、空の文字列が返されます。もし `offset` が負の数である場合、部分文字列は文字列の終わりから`pos`文字の位置から始まります。オプションの引数 `length` では、返される部分文字列の最大バイト数を指定できます。

文字列が有効なUTF-8エンコードされたテキストを含んでいると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**構文**

```sql
substringUTF8(s, offset[, length])
```

**引数**

- `s` — 部分文字列を計算するための文字列。[String](../data-types/string.md)、[FixedString](../data-types/fixedstring.md) または [Enum](../data-types/enum.md)
- `offset` — `s` の部分文字列の開始位置。[(U)Int*](../data-types/int-uint.md)。
- `length` — 部分文字列の最大長。[(U)Int*](../data-types/int-uint.md)。オプション。

**戻り値**

インデックス `offset` から始まる `s` の部分文字列で、`length` バイト分です。

**実装の詳細**

文字列が有効なUTF-8エンコードされたテキストを含んでいると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

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

`count` 回のデリミタ `delim` の出現前の `s` の部分文字列を返します。これは、Spark または MySQL のように動作します。

**構文**

```sql
substringIndex(s, delim, count)
```
エイリアス: `SUBSTRING_INDEX`

**引数**

- s — 部分文字列を抽出するための文字列。[String](../data-types/string.md)。
- delim — スプリットする文字。[String](../data-types/string.md)。
- count — 部分文字列を抽出する前に数えるデリミタの出現回数。countが正の場合は、最終のデリミタの左側のすべてを返します（左から数えて）。countが負の場合は、最終のデリミタの右側のすべてを返します（右から数えて）。[UInt または Int](../data-types/int-uint.md)

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

`count` 回のデリミタ `delim` の出現前の `s` の部分文字列を返します。Unicodeコードポイント専用です。

文字列が有効なUTF-8エンコードされたテキストを含んでいると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**構文**

```sql
substringIndexUTF8(s, delim, count)
```

**引数**

- `s` — 部分文字列を抽出するための文字列。[String](../data-types/string.md)。
- `delim` — スプリットする文字。[String](../data-types/string.md)。
- `count` — 部分文字列を抽出する前に数えるデリミタの出現回数。countが正の場合は、最終のデリミタの左側のすべてを返します（左から数えて）。countが負の場合は、最終のデリミタの右側のすべてを返します（右から数えて）。[UInt または Int](../data-types/int-uint.md)

**戻り値**

`delim` の `count` 回の出現前の `s` の部分文字列。[String](../data-types/string.md)。

**実装の詳細**

文字列が有効なUTF-8エンコードされたテキストを含んでいると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**例**

```sql
SELECT substringIndexUTF8('www.straßen-in-europa.de', '.', 2)
```

```response
www.straßen-in-europa
```
## appendTrailingCharIfAbsent {#appendtrailingcharifabsent}

文字列 `s` が非空であり、`s` が文字 `c` で終わっていない場合、`c` を文字列 `s` に追加します。

**構文**

```sql
appendTrailingCharIfAbsent(s, c)
```
## convertCharset {#convertcharset}

エンコーディング `from` からエンコーディング `to` に変換された文字列 `s` を返します。

**構文**

```sql
convertCharset(s, from, to)
```
## base32Encode {#base32encode}

[string](https://datatracker.ietf.org/doc/html/rfc4648#section-6)を使用して文字列をエンコードします。

**構文**

```sql
base32Encode(plaintext)
```

**引数**

- `plaintext` — [String](../data-types/string.md) 列または定数。

**戻り値**

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

文字列を受け取り、[Base32](https://datatracker.ietf.org/doc/html/rfc4648#section-6) エンコーディングを使用してそれをデコードします。

**構文**

```sql
base32Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。文字列が有効なBase32エンコードされた値でない場合、例外がスローされます。

**戻り値**

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

`base32Decode` と同様ですが、エラーが発生した場合は空の文字列を返します。

**構文**

```sql
tryBase32Decode(encoded)
```

**パラメータ**

- `encoded`: [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。文字列が有効なBase32エンコードされた値でない場合、エラーが発生したときに空の文字列を返します。

**戻り値**

- 引数のデコードされた値を含む文字列。

**例**

クエリ:

```sql
SELECT tryBase32Decode('IVXGG33EMVSA====') as res, tryBase32Decode('invalid') as res_invalid;
```

```response
┌─res─────┬─res_invalid─┐
│ Encoded │             │
└─────────┴─────────────┘
```
## base58Encode {#base58encode}

[Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58) を使用して文字列をエンコードします。"Bitcoin" アルファベットを使用します。

**構文**

```sql
base58Encode(plaintext)
```

**引数**

- `plaintext` — [String](../data-types/string.md) 列または定数。

**戻り値**

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

文字列を受け取り、[Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58) エンコーディング方式を使用してデコードします。"Bitcoin" アルファベットを使用します。

**構文**

```sql
base58Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。文字列が有効な Base58 エンコード値でない場合、例外がスローされます。

**返される値**

- 引数のデコード値を含む文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT base58Decode('3dc8KtHrwM');
```

結果：

```result
┌─base58Decode('3dc8KtHrwM')─┐
│ Encoded                    │
└────────────────────────────┘
```
## tryBase58Decode {#trybase58decode}

`base58Decode` のように動作しますが、エラーが発生した場合は空の文字列を返します。

**構文**

```sql
tryBase58Decode(encoded)
```

**引数**

- `encoded`: [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。文字列が有効な Base58 エンコード値でない場合、エラー時に空の文字列を返します。

**返される値**

- 引数のデコード値を含む文字列。

**例**

クエリ：

```sql
SELECT tryBase58Decode('3dc8KtHrwM') as res, tryBase58Decode('invalid') as res_invalid;
```

```response
┌─res─────┬─res_invalid─┐
│ Encoded │             │
└─────────┴─────────────┘
```
## base64Encode {#base64encode}

文字列または FixedString を base64 でエンコードします。[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4) に従います。

エイリアス: `TO_BASE64`。

**構文**

```sql
base64Encode(plaintext)
```

**引数**

- `plaintext` — [String](../data-types/string.md) カラムまたは定数。

**返される値**

- 引数のエンコード値を含む文字列。

**例**

```sql
SELECT base64Encode('clickhouse');
```

結果：

```result
┌─base64Encode('clickhouse')─┐
│ Y2xpY2tob3VzZQ==           │
└────────────────────────────┘
```
## base64URLEncode {#base64urlencode}

URL（String または FixedString）を、URL 特有の修正を行った base64 でエンコードします。[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5) に従います。

**構文**

```sql
base64URLEncode(url)
```

**引数**

- `url` — [String](../data-types/string.md) カラムまたは定数。

**返される値**

- 引数のエンコード値を含む文字列。

**例**

```sql
SELECT base64URLEncode('https://clickhouse.com');
```

結果：

```result
┌─base64URLEncode('https://clickhouse.com')─┐
│ aHR0cDovL2NsaWNraG91c2UuY29t              │
└───────────────────────────────────────────┘
```
## base64Decode {#base64decode}

文字列を受け取り、base64 からデコードします。[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4) に従い、エラーの場合は例外をスローします。

エイリアス: `FROM_BASE64`。

**構文**

```sql
base64Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) カラムまたは定数。文字列が有効な Base64 エンコード値でない場合、例外がスローされます。

**返される値**

- 引数のデコード値を含む文字列。

**例**

```sql
SELECT base64Decode('Y2xpY2tob3VzZQ==');
```

結果：

```result
┌─base64Decode('Y2xpY2tob3VzZQ==')─┐
│ clickhouse                       │
└──────────────────────────────────┘
```
## base64URLDecode {#base64urldecode}

base64 でエンコードされた URL を受け取り、URL 特有の修正を行った state からデコードします。[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5) に従い、エラーの場合は例外をスローします。

**構文**

```sql
base64URLDecode(encodedUrl)
```

**引数**

- `encodedURL` — [String](../data-types/string.md) カラムまたは定数。文字列が有効な Base64 エンコード値でない場合、例外がスローされます。

**返される値**

- 引数のデコード値を含む文字列。

**例**

```sql
SELECT base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t');
```

結果：

```result
┌─base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t')─┐
│ https://clickhouse.com                          │
└─────────────────────────────────────────────────┘
```
## tryBase64Decode {#trybase64decode}

`base64Decode` のように動作しますが、エラーが発生した場合は空の文字列を返します。

**構文**

```sql
tryBase64Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) カラムまたは定数。文字列が有効な Base64 エンコード値でない場合、空の文字列を返します。

**返される値**

- 引数のデコード値を含む文字列。

**例**

クエリ：

```sql
SELECT tryBase64Decode('RW5jb2RlZA==') as res, tryBase64Decode('invalid') as res_invalid;
```

```response
┌─res────────┬─res_invalid─┐
│ clickhouse │             │
└────────────┴─────────────┘
```
## tryBase64URLDecode {#trybase64urldecode}

`base64URLDecode` のように動作しますが、エラーが発生した場合は空の文字列を返します。

**構文**

```sql
tryBase64URLDecode(encodedUrl)
```

**引数**

- `encodedURL` — [String](../data-types/string.md) カラムまたは定数。文字列が有効な Base64 エンコード値でない場合、空の文字列を返します。

**返される値**

- 引数のデコード値を含む文字列。

**例**

クエリ：

```sql
SELECT tryBase64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t') as res, tryBase64Decode('aHR0cHM6Ly9jbGlja') as res_invalid;
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

文字列 `str` が `suffix` で終わるかどうかを返します。`endsWithUTF8` と `endsWith` の違いは、`endsWithUTF8` が UTF-8 文字によって `str` と `suffix` をマッチングさせることです。

**構文**

```sql
endsWithUTF8(str, suffix)
```

**例**

```sql
SELECT endsWithUTF8('中国', '\xbd'), endsWith('中国', '\xbd')
```

結果：

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

文字列 `str` が `prefix` で始まるかどうかを返します。`startsWithUTF8` と `startsWith` の違いは、`startsWithUTF8` が UTF-8 文字によって `str` と `suffix` をマッチングさせることです。

**例**

```sql
SELECT startsWithUTF8('中国', '\xe4'), startsWith('中国', '\xe4')
```

結果：

```result
┌─startsWithUTF8('中国', '⥩─┬─startsWith('中国', '⥩─┐
│                          0 │                      1 │
└────────────────────────────┴────────────────────────┘
```
## trim {#trim}

指定された文字を文字列の先頭または末尾から削除します。特に指定されていない場合、関数は空白（ASCII 文字 32）を削除します。

**構文**

```sql
trim([[LEADING|TRAILING|BOTH] trim_character FROM] input_string)
```

**引数**

- `trim_character` — 削除する文字。[String](../data-types/string.md)。
- `input_string` — トリムする文字列。[String](../data-types/string.md)。

**返される値**

先頭および/または末尾の指定された文字がない文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT trim(BOTH ' ()' FROM '(   Hello, world!   )');
```

結果：

```result
┌─trim(BOTH ' ()' FROM '(   Hello, world!   )')─┐
│ Hello, world!                                 │
└───────────────────────────────────────────────┘
```
## trimLeft {#trimleft}

文字列の先頭から空白（ASCII 文字 32）の連続する発生を削除します。

**構文**

```sql
trimLeft(input_string[, trim_characters])
```

エイリアス: `ltrim`。

**引数**

- `input_string` — トリムする文字列。[String](../data-types/string.md)。
- `trim_characters` — 削除する文字。省略可能。[String](../data-types/string.md)。指定されていない場合、`' '`（単一の空白）がトリム文字として使用されます。

**返される値**

先頭に共通の空白がない文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT trimLeft('     Hello, world!     ');
```

結果：

```result
┌─trimLeft('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```
## trimRight {#trimright}

文字列の末尾から空白（ASCII 文字 32）の連続する発生を削除します。

**構文**

```sql
trimRight(input_string[, trim_characters])
```

エイリアス: `rtrim`。

**引数**

- `input_string` — トリムする文字列。[String](../data-types/string.md)。
- `trim_characters` — 削除する文字。省略可能。[String](../data-types/string.md)。指定されていない場合、`' '`（単一の空白）がトリム文字として使用されます。

**返される値**

末尾に共通の空白がない文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT trimRight('     Hello, world!     ');
```

結果：

```result
┌─trimRight('     Hello, world!     ')─┐
│      Hello, world!                   │
└──────────────────────────────────────┘
```
## trimBoth {#trimboth}

文字列の両端から空白（ASCII 文字 32）の連続する発生を削除します。

**構文**

```sql
trimBoth(input_string[, trim_characters])
```

エイリアス: `trim`。

**引数**

- `input_string` — トリムする文字列。[String](../data-types/string.md)。
- `trim_characters` — 削除する文字。省略可能。[String](../data-types/string.md)。指定されていない場合、`' '`（単一の空白）がトリム文字として使用されます。

**返される値**

先頭と末尾に共通の空白がない文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT trimBoth('     Hello, world!     ');
```

結果：

```result
┌─trimBoth('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```
## CRC32 {#crc32}

文字列の CRC32 チェックサムを返します。CRC-32-IEEE 802.3 多項式と初期値 `0xffffffff` （zlib 実装）を使用します。

結果の型は UInt32 です。
## CRC32IEEE {#crc32ieee}

文字列の CRC32 チェックサムを返します。CRC-32-IEEE 802.3 多項式を使用します。

結果の型は UInt32 です。
## CRC64 {#crc64}

文字列の CRC64 チェックサムを返します。CRC-64-ECMA 多項式を使用します。

結果の型は UInt64 です。
## normalizeUTF8NFC {#normalizeutf8nfc}

文字列を [NFC 正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms) に変換し、文字列が有効な UTF8 エンコードのテキストであると仮定します。

**構文**

```sql
normalizeUTF8NFC(words)
```

**引数**

- `words` — UTF8 エンコードの入力文字列。[String](../data-types/string.md)。

**返される値**

- NFC 正規化形式に変換された文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT length('â'), normalizeUTF8NFC('â') AS nfc, length(nfc) AS nfc_len;
```

結果：

```result
┌─length('â')─┬─nfc─┬─nfc_len─┐
│           2 │ â   │       2 │
└─────────────┴─────┴─────────┘
```
## normalizeUTF8NFD {#normalizeutf8nfd}

文字列を [NFD 正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms) に変換し、文字列が有効な UTF8 エンコードのテキストであると仮定します。

**構文**

```sql
normalizeUTF8NFD(words)
```

**引数**

- `words` — UTF8 エンコードの入力文字列。[String](../data-types/string.md)。

**返される値**

- NFD 正規化形式に変換された文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT length('â'), normalizeUTF8NFD('â') AS nfd, length(nfd) AS nfd_len;
```

結果：

```result
┌─length('â')─┬─nfd─┬─nfd_len─┐
│           2 │ â   │       3 │
└─────────────┴─────┴─────────┘
```
## normalizeUTF8NFKC {#normalizeutf8nfkc}

文字列を [NFKC 正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms) に変換し、文字列が有効な UTF8 エンコードのテキストであると仮定します。

**構文**

```sql
normalizeUTF8NFKC(words)
```

**引数**

- `words` — UTF8 エンコードの入力文字列。[String](../data-types/string.md)。

**返される値**

- NFKC 正規化形式に変換された文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT length('â'), normalizeUTF8NFKC('â') AS nfkc, length(nfkc) AS nfkc_len;
```

結果：

```result
┌─length('â')─┬─nfkc─┬─nfkc_len─┐
│           2 │ â    │        2 │
└─────────────┴──────┴──────────┘
```
## normalizeUTF8NFKD {#normalizeutf8nfkd}

文字列を [NFKD 正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms) に変換し、文字列が有効な UTF8 エンコードのテキストであると仮定します。

**構文**

```sql
normalizeUTF8NFKD(words)
```

**引数**

- `words` — UTF8 エンコードの入力文字列。[String](../data-types/string.md)。

**返される値**

- NFKD 正規化形式に変換された文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT length('â'), normalizeUTF8NFKD('â') AS nfkd, length(nfkd) AS nfkd_len;
```

結果：

```result
┌─length('â')─┬─nfkd─┬─nfkd_len─┐
│           2 │ â    │        3 │
└─────────────┴──────┴──────────┘
```
## encodeXMLComponent {#encodexmlcomponent}

XML 内で特別な意味を持つ文字をエスケープし、その後 XML テキストノードまたは属性に配置できるようにします。

置き換えられる文字は以下の通りです: `<`, `&`, `>`, `"`, `'`。
[XML と HTML の文字エンティティ参照のリスト](https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references) も参照してください。

**構文**

```sql
encodeXMLComponent(x)
```

**引数**

- `x` — 入力文字列。[String](../data-types/string.md)。

**返される値**

- エスケープされた文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT encodeXMLComponent('Hello, "world"!');
SELECT encodeXMLComponent('<123>');
SELECT encodeXMLComponent('&clickhouse');
SELECT encodeXMLComponent('\'foo\'');
```

結果：

```result
Hello, &quot;world&quot;!
&lt;123&gt;
&amp;clickhouse
&apos;foo&apos;
```
## decodeXMLComponent {#decodexmlcomponent}

XML 内で特別な意味を持つ部分文字列のエスケープを解除します。これらの部分文字列は: `&quot;` `&amp;` `&apos;` `&gt;` `&lt;`

この関数は、数値文字参照を Unicode 文字に置き換えます。両方の十進法（例えば `&#10003;`）および16進数（例えば `&#x2713;`）形式がサポートされています。

**構文**

```sql
decodeXMLComponent(x)
```

**引数**

- `x` — 入力文字列。[String](../data-types/string.md)。

**返される値**

- エスケープ解除された文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT decodeXMLComponent('&apos;foo&apos;');
SELECT decodeXMLComponent('&lt; &#x3A3; &gt;');
```

結果：

```result
'foo'
< Σ >
```
## decodeHTMLComponent {#decodehtmlcomponent}

HTML 内で特別な意味を持つ部分文字列のエスケープを解除します。例えば: `&hbar;` `&gt;` `&diamondsuit;` `&heartsuit;` `&lt;` など。

この関数は、数値文字参照を Unicode 文字に置き換えます。両方の十進法（例えば `&#10003;`）および16進数（例えば `&#x2713;`）形式がサポートされています。

**構文**

```sql
decodeHTMLComponent(x)
```

**引数**

- `x` — 入力文字列。[String](../data-types/string.md)。

**返される値**

- エスケープ解除された文字列。[String](../data-types/string.md)。

**例**

```sql
SELECT decodeHTMLComponent(''CH');
SELECT decodeHTMLComponent('I&heartsuit;ClickHouse');
```

結果：

```result
'CH'
I♥ClickHouse'
```
## extractTextFromHTML {#extracttextfromhtml}

この関数は、HTML または XHTML からプレーンテキストを抽出します。

完全には HTML、XML、または XHTML の仕様に準拠していませんが、実装は合理的に正確かつ高速です。ルールは以下の通りです：

1. コメントはスキップされます。例: `<!-- test -->`。コメントは `-->` で終わる必要があります。ネストされたコメントは許可されません。
ノート: `<!-->` および `<!--->` のような構文は HTML では有効なコメントではありませんが、他のルールによってスキップされます。
2. CDATA はそのまま貼り付けられます。ノート: CDATA は XML/XHTML 特有であり、「ベストエフォート」ベースで処理されます。
3. `script` および `style` 要素は、その全コンテンツを削除します。ノート: 閉じタグはコンテンツ内に表示されないと仮定されます。例えば、JS 文字列リテラルでは `"<\/script>"` のようにエスケープする必要があります。
ノート: コメントや CDATA は `script` または `style` 内で可能ですが、その中では閉じタグは見つかりません。例: `<script><![CDATA[</script>]]></script>`。しかし、コメント内ではまだ検索されます。時には複雑になる場合があります: `<script>var x = "<!--"; </script> var y = "-->"; alert(x + y);</script>`
ノート: `script` および `style` が XML 名前空間の名前である場合、それらは通常の `script` または `style` 要素のように扱われません。例: `<script:a>Hello</script:a>`。
ノート: 閉じタグ名の後には空白があることが可能ですが、前にはありません: `</script >` ですが `< / script>` は無効です。
4. 他のタグまたはタグのような要素は、内部コンテンツがない限りスキップされます。例: `<a>.</a>`
ノート: この HTML は不正なものと予想されています: `<a test=">"></a>`
ノート: `<>`, `<!>` など、タグのようなものもスキップされます。
ノート: 終わりがないタグは入力の終わりまでスキップされます: `<hello   `
5. HTML および XML エンティティはデコードされません。エンティティは別の関数で処理する必要があります。
6. テキスト内の空白は、特定のルールによって圧縮または挿入されます。
    - 先頭および末尾の空白が削除されます。
    - 連続する空白は圧縮されます。
    - ただし、テキストが他の要素によって区切られており、空白がない場合は、空白が挿入されます。
    - 不自然な場合が生じる可能性があります: `Hello<b>world</b>`, `Hello<!-- -->world` - HTML には空白がありませんが、関数はそれを挿入します。また、`Hello<p>world</p>`, `Hello<br>world` も考慮してください。この行動は、データ分析において合理的です。例えば、HTML を単語のバガーに変換するため。
7. 空白を適切に処理するには、`<pre></pre>` および CSS の `display` および `white-space` プロパティのサポートが必要です。

**構文**

```sql
extractTextFromHTML(x)
```

**引数**

- `x` — 入力テキスト。[String](../data-types/string.md)。

**返される値**

- 抽出されたテキスト。[String](../data-types/string.md)。

**例**

最初の例は、いくつかのタグとコメントを含んでおり、空白の処理も示しています。
2 番目の例は、CDATA およびスクリプトタグの処理を示しています。
3 番目の例では、[url](../../sql-reference/table-functions/url.md) 関数によって受信したフル HTML レスポンスからテキストが抽出されています。

```sql
SELECT extractTextFromHTML(' <p> A text <i>with</i><b>tags</b>. <!-- comments --> </p> ');
SELECT extractTextFromHTML('<![CDATA[The content within <b>CDATA</b>]]> <script>alert("Script");</script>');
SELECT extractTextFromHTML(html) FROM url('http://www.donothingfor2minutes.com/', RawBLOB, 'html String');
```

結果：

```result
A text with tags .
The content within <b>CDATA</b>
Do Nothing for 2 Minutes 2:00 &nbsp;
```
## ascii {#ascii}

文字列 `s` の最初の文字の ASCII コードポイント（Int32 として）を返します。

`s` が空である場合、結果は 0 です。最初の文字が ASCII 文字でない場合、または UTF-16 の Latin-1 サプリメント範囲に含まれていない場合、結果は未定義です。

**構文**

```sql
ascii(s)
```
## soundex {#soundex}

文字列の [Soundex コード](https://en.wikipedia.org/wiki/Soundex) を返します。

**構文**

```sql
soundex(val)
```

**引数**

- `val` — 入力値。[String](../data-types/string.md)

**返される値**

- 入力値の Soundex コード。[String](../data-types/string.md)

**例**

```sql
select soundex('aksel');
```

結果：

```result
┌─soundex('aksel')─┐
│ A240             │
└──────────────────┘
```
## punycodeEncode {#punycodeencode}

文字列の [Punycode](https://en.wikipedia.org/wiki/Punycode) 表現を返します。
文字列は UTF8 エンコードされている必要があります。そうでない場合、動作は未定義です。

**構文**

```sql
punycodeEncode(val)
```

**引数**

- `val` — 入力値。[String](../data-types/string.md)

**返される値**

- 入力値の Punycode 表現。[String](../data-types/string.md)

**例**

```sql
select punycodeEncode('München');
```

結果：

```result
┌─punycodeEncode('München')─┐
│ Mnchen-3ya                │
└───────────────────────────┘
```
## punycodeDecode {#punycodedecode}

Punycode エンコードされた文字列の UTF8 エンコードされたプレーンテキストを返します。
有効な Punycode エンコード文字列が与えられない場合、例外がスローされます。

**構文**

```sql
punycodeEncode(val)
```

**引数**

- `val` — Punycode エンコード文字列。[String](../data-types/string.md)

**返される値**

- 入力値のプレーンテキスト。[String](../data-types/string.md)

**例**

```sql
select punycodeDecode('Mnchen-3ya');
```

結果：

```result
┌─punycodeDecode('Mnchen-3ya')─┐
│ München                      │
└──────────────────────────────┘
```
## tryPunycodeDecode {#trypunycodedecode}

`punycodeDecode` のように動作しますが、有効な Punycode エンコード文字列が与えられない場合は空の文字列を返します。
## idnaEncode {#idnaencode}

[国際化ドメイン名のアプリケーションにおける国際化](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA) メカニズムに従って、ドメイン名の ASCII 表現（ToASCII アルゴリズム）を返します。
入力文字列は UTF エンコードされ、ASCII 文字列に変換可能である必要があります。そうでない場合、例外がスローされます。
ノート: パーセントデコーディングやタブ、スペース、制御文字のトリミングは実行されません。

**構文**

```sql
idnaEncode(val)
```

**引数**

- `val` — 入力値。[String](../data-types/string.md)

**返される値**

- IDNA メカニズムに従った入力値の ASCII 表現。[String](../data-types/string.md)

**例**

```sql
select idnaEncode('straße.münchen.de');
```

結果：

```result
┌─idnaEncode('straße.münchen.de')─────┐
│ xn--strae-oqa.xn--mnchen-3ya.de     │
└─────────────────────────────────────┘
```
## tryIdnaEncode {#tryidnaencode}

`idnaEncode` のように動作しますが、エラーが発生した場合は例外をスローするのではなく、空の文字列を返します。
## idnaDecode {#idnadecode}

[国際化ドメイン名のアプリケーションにおける国際化](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA) メカニズムに従い、ドメイン名の Unicode（UTF-8）表現（ToUnicode アルゴリズム）を返します。
エラーが発生した場合（例えば、入力が無効な場合）、入力文字列が返されます。
`idnaEncode()` と `idnaDecode()` の反復適用は、ケース正規化のため、元の文字列を必ずしも返すわけではありません。

**構文**

```sql
idnaDecode(val)
```

**引数**

- `val` — 入力値。[String](../data-types/string.md)

**返される値**

- IDNA メカニズムに従った入力値の Unicode（UTF-8）表現。[String](../data-types/string.md)

**例**

```sql
select idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de');
```

結果：

```result
┌─idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de')─┐
│ straße.münchen.de                             │
└───────────────────────────────────────────────┘
```
## byteHammingDistance {#bytehammingdistance}

二つのバイト文字列間の [ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance) を計算します。

**構文**

```sql
byteHammingDistance(string1, string2)
```

**例**

```sql
SELECT byteHammingDistance('karolin', 'kathrin');
```

結果：

```text
┌─byteHammingDistance('karolin', 'kathrin')─┐
│                                         3 │
└───────────────────────────────────────────┘
```

エイリアス: `mismatches`
## stringJaccardIndex {#stringjaccardindex}

二つのバイト文字列間の [ジャカード類似度指数](https://en.wikipedia.org/wiki/Jaccard_index) を計算します。

**構文**

```sql
stringJaccardIndex(string1, string2)
```

**例**

```sql
SELECT stringJaccardIndex('clickhouse', 'mouse');
```

結果：

```text
┌─stringJaccardIndex('clickhouse', 'mouse')─┐
│                                       0.4 │
└───────────────────────────────────────────┘
```
## stringJaccardIndexUTF8 {#stringjaccardindexutf8}

[stringJaccardIndex](#stringjaccardindex) と同様ですが、UTF8 エンコードの文字列に対して使用します。
## editDistance {#editdistance}

二つのバイト文字列間の [編集距離](https://en.wikipedia.org/wiki/Edit_distance) を計算します。

**構文**

```sql
editDistance(string1, string2)
```

**例**

```sql
SELECT editDistance('clickhouse', 'mouse');
```

結果：

```text
┌─editDistance('clickhouse', 'mouse')─┐
│                                   6 │
└─────────────────────────────────────┘
```

エイリアス: `levenshteinDistance`
## editDistanceUTF8 {#editdistanceutf8}

二つの UTF8 文字列間の [編集距離](https://en.wikipedia.org/wiki/Edit_distance) を計算します。

**構文**

```sql
editDistanceUTF8(string1, string2)
```

**例**

```sql
SELECT editDistanceUTF8('我是谁', '我是我');
```

結果：

```text
┌─editDistanceUTF8('我是谁', '我是我')──┐
│                                   1 │
└─────────────────────────────────────┘
```

エイリアス: `levenshteinDistanceUTF8`
## damerauLevenshteinDistance {#dameraulevenshteindistance}

二つのバイト文字列間の [ダメラウ・レヴィンシュタイン距離](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance) を計算します。

**構文**

```sql
damerauLevenshteinDistance(string1, string2)
```

**例**

```sql
SELECT damerauLevenshteinDistance('clickhouse', 'mouse');
```

結果：

```text
┌─damerauLevenshteinDistance('clickhouse', 'mouse')─┐
│                                                 6 │
└───────────────────────────────────────────────────┘
```
## jaroSimilarity {#jarosimilarity}

二つのバイト文字列間の [ジャロ類似度](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro_similarity) を計算します。

**構文**

```sql
jaroSimilarity(string1, string2)
```

**例**

```sql
SELECT jaroSimilarity('clickhouse', 'click');
```

結果：

```text
┌─jaroSimilarity('clickhouse', 'click')─┐
│                    0.8333333333333333 │
└───────────────────────────────────────┘
```
## jaroWinklerSimilarity {#jarowinklersimilarity}

二つのバイト文字列間の [ジャロ・ウィンクラー類似度](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro%E2%80%93Winkler_similarity) を計算します。

**構文**

```sql
jaroWinklerSimilarity(string1, string2)
```

**例**

```sql
SELECT jaroWinklerSimilarity('clickhouse', 'click');
```

結果：

```text
┌─jaroWinklerSimilarity('clickhouse', 'click')─┐
│                           0.8999999999999999 │
└──────────────────────────────────────────────┘
```
## initcap {#initcap}

各単語の最初の文字を大文字にし、残りを小文字に変換します。単語は、非英数字の文字で区切られた英数字の文字の連続です。

:::note
`initCap` は各単語の最初の文字のみを大文字に変換するため、アポストロフィや大文字を含む単語に対して予期しない動作が見られることがあります。例えば：

```sql
SELECT initCap('mother''s daughter'), initCap('joe McAdam');
```

は次を返します：

```response
┌─initCap('mother\'s daughter')─┬─initCap('joe McAdam')─┐
│ Mother'S Daughter             │ Joe Mcadam            │
└───────────────────────────────┴───────────────────────┘
```

これは既知の動作であり、現在修正する予定はありません。
:::

**構文**

```sql
initcap(val)
```

**引数**

- `val` — 入力値。[String](../data-types/string.md)。

**返される値**

- 各単語の最初の文字が大文字に変換された `val`。[String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT initcap('building for fast');
```

結果：

```text
┌─initcap('building for fast')─┐
│ Building For Fast            │
└──────────────────────────────┘
```
## initcapUTF8 {#initcaputf8}

[stringJaccardIndex](#initcap) と同様に、`initcapUTF8` は各単語の最初の文字を大文字にし、残りを小文字に変換します。文字列が有効な UTF-8 エンコードのテキストであると仮定します。
この仮定が破られた場合、例外はスローされず、結果は未定義になります。

:::note
この関数は言語を検出しません。例えば、トルコ語の場合、結果が完全に正確でない可能性があります（i/İ と i/I）。
UTF-8 バイトシーケンスの大文字と小文字の長さが異なる場合、結果はこのコードポイントに対して不正確なものになります。
:::

**構文**

```sql
initcapUTF8(val)
```

**引数**

- `val` — 入力値。[String](../data-types/string.md)。

**返される値**

- 各単語の最初の文字が大文字に変換された `val`。[String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT initcapUTF8('не тормозит');
```

結果：

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

- `val` — 入力値。[String](../data-types/string.md)

**返される値**

- 行区切りがない場合、入力値全体を返すか、入力値の最初の行。[String](../data-types/string.md)

**例**

```sql
select firstLine('foo\nbar\nbaz');
```

結果：

```result
┌─firstLine('foo\nbar\nbaz')─┐
│ foo                        │
└────────────────────────────┘
```

## stringCompare {#stringcompare}

2つの文字列を辞書式順序で比較します。

**構文**

```sql
stringCompare(string1, string2[, str1_off, string2_offset, num_bytes]);
```

**引数**

- `string1` — 比較する最初の文字列。[String](../data-types/string.md)
- `string2` - 比較する2番目の文字列。[String](../data-types/string.md)
- `string1_offset` — 文字列 `string1` の比較を開始する位置（ゼロベース）。オプション、正の数。
- `string2_offset` — 文字列 `string2` の比較を開始する位置（ゼロベース）。オプション、正の数。
- `num_bytes` — 両方の文字列で比較する最大バイト数。 `string_offset` + `num_bytes` が入力文字列の終わりを超える場合、`num_bytes` はそれに応じて減少します。

**返される値**

- -1 — `string1`[`string1_offset`: `string1_offset` + `num_bytes`] < `string2`[`string2_offset`:`string2_offset` + `num_bytes`] であり、かつ `string1_offset` < len(`string1`) および `string2_offset` < len(`string2`) の場合。
もし `string1_offset` >= len(`string1`) かつ `string2_offset` < len(`string2`) の場合。
- 0 — `string1`[`string1_offset`: `string1_offset` + `num_bytes`] = `string2`[`string2_offset`:`string2_offset` + `num_bytes`] であり、かつ `string1_offset` < len(`string1`) および `string2_offset` < len(`string2`) の場合。
もし `string1_offset` >= len(`string1`) かつ `string2_offset` >= len(`string2`) の場合。
- 1 — `string1`[`string1_offset`: `string1_offset` + `num_bytes`] > `string2`[`string2_offset`:`string2_offset` + `num_bytes`] であり、かつ `string1_offset` < len(`string1`) および `string2_offset` < len(`string2`) の場合。
もし `string1_offset` < len(`string1`) かつ `string2_offset` >= len(`string2`) の場合。

**例**

```sql
SELECT
    stringCompare('alice', 'bob', 0, 0, 3) as result1,
    stringCompare('alice', 'alicia', 0, 0, 3) as result2,
    stringCompare('bob', 'alice', 0, 0, 3) as result3
```
結果:
```result
   ┌─result1─┬─result2─┬─result3─┐
1. │      -1 │       0 │       1 │
   └─────────┴─────────┴─────────┘
```

```sql
SELECT
    stringCompare('alice', 'alicia') as result2,
    stringCompare('alice', 'alice') as result1,
    stringCompare('bob', 'alice') as result3
```
結果:
```result
   ┌─result2─┬─result1─┬─result3─┐
1. │      -1 │       0 │       1 │
   └─────────┴─────────┴─────────┘
```
## sparseGrams {#sparsegrams}

与えられた文字列のすべての部分文字列を見つけます。部分文字列の長さは少なくとも `n` であり、部分文字列の境界にある (n-1)-グラムのハッシュが、部分文字列の内部にあるいかなる (n-1)-グラムよりも厳密に大きい場合です。
[crc32](./string-functions.md#crc32) をハッシュ関数として使用します。

**構文**

```sql
sparseGrams(s[, min_ngram_length]);
```

**引数**

- `s` — 入力文字列。[String](../data-types/string.md)
- `min_ngram_length` — 抽出される ngram の最小長さ。デフォルトおよび最小値は 3 です。
- `max_ngram_length` — 抽出される ngram の最大長さ。デフォルト値は 100 です。「min_ngram_length」未満であってはいけません。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

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

与えられた文字列のすべての部分文字列を見つけます。部分文字列の長さは少なくとも `n` であり、部分文字列の境界にある (n-1)-グラムのハッシュが、部分文字列の内部にあるいかなる (n-1)-グラムよりも厳密に大きい場合です。
[crc32](./string-functions.md#crc32) をハッシュ関数として使用します。
UTF-8文字列を期待し、無効なUTF-8シーケンスの場合は例外をスローします。

**構文**

```sql
sparseGramsUTF8(s[, min_ngram_length]);
```

**引数**

- `s` — 入力文字列。[String](../data-types/string.md)
- `min_ngram_length` — 抽出される ngram の最小長さ。デフォルトおよび最小値は 3 です。
- `max_ngram_length` — 抽出される ngram の最大長さ。デフォルト値は 100 です。「min_ngram_length」未満であってはいけません。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

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

与えられた文字列のすべての部分文字列のハッシュを見つけます。部分文字列の長さは少なくとも `n` であり、部分文字列の境界にある (n-1)-グラムのハッシュが、部分文字列の内部にあるいかなる (n-1)-グラムよりも厳密に大きい場合です。
[crc32](./string-functions.md#crc32) をハッシュ関数として使用します。

**構文**

```sql
sparseGramsHashes(s[, min_ngram_length]);
```

**引数**

- `s` — 入力文字列。[String](../data-types/string.md)
- `min_ngram_length` — 抽出される ngram の最小長さ。デフォルトおよび最小値は 3 です。
- `max_ngram_length` — 抽出される ngram の最大長さ。デフォルト値は 100 です。「min_ngram_length」未満であってはいけません。

**返される値**

- 選択された部分文字列 crc32-c ハッシュの配列。[Array](../data-types/array.md)([UInt32](../data-types/int-uint.md))。

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

与えられた文字列のすべての部分文字列のハッシュを見つけます。部分文字列の長さは少なくとも `n` であり、部分文字列の境界にある (n-1)-グラムのハッシュが、部分文字列の内部にあるいかなる (n-1)-グラムよりも厳密に大きい場合です。
[crc32](./string-functions.md#crc32) をハッシュ関数として使用します。
UTF-8文字列を期待し、無効なUTF-8シーケンスの場合は例外をスローします。

**構文**

```sql
sparseGramsHashesUTF8(s[, min_ngram_length]);
```

**引数**

- `s` — 入力文字列。[String](../data-types/string.md)
- `min_ngram_length` — 抽出される ngram の最小長さ。デフォルトおよび最小値は 3 です。
- `max_ngram_length` — 抽出される ngram の最大長さ。デフォルト値は 100 です。「min_ngram_length」未満であってはいけません。

**返される値**

- 選択された部分文字列 crc32-c ハッシュの配列。[Array](../data-types/array.md)([UInt32](../data-types/int-uint.md))。

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

- `s` — 分析する文字列。[String](../data-types/string.md)。

**返される値**

- 文字列内の異なるバイトの数。[UInt16](../data-types/int-uint.md)。

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

- `s` — 分析する文字列。[String](../data-types/string.md)。

**返される値**

- 文字列内のバイト分布のシャノンエントロピー。[Float64](../data-types/float.md)。

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
