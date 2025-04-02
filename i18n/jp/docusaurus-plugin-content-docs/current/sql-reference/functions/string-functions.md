---
slug: /sql-reference/functions/string-functions
sidebar_position: 170
sidebar_label: '文字列'
---

import VersionBadge from '@theme/badges/VersionBadge';

# 文字列を扱うための関数

文字列内の[検索](string-search-functions.md)および[置換](string-replace-functions.md)に関する関数は別途説明されています。
## empty {#empty}

入力された文字列が空であるかをチェックします。文字列は、少なくとも1バイトを含む場合、空でないとみなされます。このバイトがスペースやヌルバイトであっても同様です。

この関数は[配列](/sql-reference/functions/array-functions#empty)や[UUID](uuid-functions.md#empty)にも使用できます。

**構文**

``` sql
empty(x)
```

**引数**

- `x` — 入力値。 [文字列](../data-types/string.md)。

**戻り値**

- 空の文字列の場合は `1`、空でない文字列の場合は `0` を返します。 [UInt8](../data-types/int-uint.md)。

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

入力された文字列が空でないかをチェックします。文字列は、少なくとも1バイトを含む場合、空でないと見なされます。このバイトがスペースやヌルバイトであっても同様です。

この関数は[配列](/sql-reference/functions/array-functions#notempty)や[UUID](uuid-functions.md#notempty)にも使用できます。

**構文**

``` sql
notEmpty(x)
```

**引数**

- `x` — 入力値。 [文字列](../data-types/string.md)。

**戻り値**

- 空でない文字列の場合は `1`、空の文字列の場合は `0` を返します。[UInt8](../data-types/int-uint.md)。

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

文字列の長さをバイト数で返します。文字数やUnicodeコードポイントではありません。関数は配列にも対応しています。

エイリアス: `OCTET_LENGTH`

**構文**

```sql
length(s)
```

**引数**

- `s` — 入力文字列または配列。 [文字列](../data-types/string)/[配列](../data-types/array)。

**戻り値**

- 文字列または配列 `s` のバイト数の長さ。 [UInt64](../data-types/int-uint)。

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

文字列の長さをUnicodeコードポイントで返します。バイト数や文字数ではありません。文字列が有効なUTF-8エンコードテキストを含むと仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

エイリアス:
- `CHAR_LENGTH`
- `CHARACTER_LENGTH`

**構文**

```sql
lengthUTF8(s)
```

**引数**

- `s` — 有効なUTF-8エンコードテキストを含む文字列。 [文字列](../data-types/string)。

**戻り値**

- 文字列 `s` のUnicodeコードポイントの長さ。 [UInt64](../data-types/int-uint.md)。

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

指定されたオフセットから左側の文字列 `s` の部分文字列を返します。

**構文**

``` sql
left(s, offset)
```

**引数**

- `s` — 部分文字列を取得する文字列。[文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**戻り値**

- 正の `offset` の場合: 文字列の左側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の左側から `length(s) - |offset|` バイトの部分文字列。
- `length` が 0 の場合は空の文字列。

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

UTF-8エンコードされた文字列 `s` の指定されたオフセットから左側の部分文字列を返します。

**構文**

``` sql
leftUTF8(s, offset)
```

**引数**

- `s` — 部分文字列を取得するUTF-8エンコードされた文字列。[文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**戻り値**

- 正の `offset` の場合: 文字列の左側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の左側から `length(s) - |offset|` バイトの部分文字列。
- `length` が 0 の場合は空の文字列。

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

文字列を指定された `length` までスペースまたは指定された文字列で左側から埋めます（必要に応じて複数回）。

**構文**

``` sql
leftPad(string, length[, pad_string])
```

エイリアス: `LPAD`

**引数**

- `string` — 埋める対象の入力文字列。[文字列](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。値が入力文字列の長さより小さい場合、入力文字列は `length` 文字に短縮されます。
- `pad_string` — 入力文字列を埋めるための文字列。[文字列](../data-types/string.md)。省略可能。指定しない場合、入力文字列はスペースで埋められます。

**戻り値**

- 指定された長さの左に埋められた文字列。[文字列](../data-types/string.md)。

**例**

``` sql
SELECT leftPad('abc', 7, '*'), leftPad('def', 7);
```

結果:

```result
┌─leftPad('abc', 7, '*')─┬─leftPad('def', 7)─┐
│ ****abc                │     def           │
└────────────────────────┴───────────────────┘
```
## leftPadUTF8 {#leftpadutf8}

文字列を指定された `length` までスペースまたは指定された文字列で左側から埋めます。 [leftPad](#leftpad) がバイト数で文字列長を測定するのに対し、文字列長はコードポイントで測定されます。

**構文**

``` sql
leftPadUTF8(string, length[, pad_string])
```

**引数**

- `string` — 埋める対象の入力文字列。[文字列](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。値が入力文字列の長さより小さい場合、入力文字列は `length` 文字に短縮されます。
- `pad_string` — 入力文字列を埋めるための文字列。[文字列](../data-types/string.md)。省略可能。指定しない場合、入力文字列はスペースで埋められます。

**戻り値**

- 指定された長さの左に埋められた文字列。[文字列](../data-types/string.md)。

**例**

``` sql
SELECT leftPadUTF8('абвг', 7, '*'), leftPadUTF8('дежз', 7);
```

結果:

```result
┌─leftPadUTF8('абвг', 7, '*')─┬─leftPadUTF8('дежз', 7)─┐
│ ***абвг                     │    дежз                │
└─────────────────────────────┴────────────────────────┘
```
## right {#right}

文字列 `s` の指定されたオフセットから右側の部分文字列を返します。

**構文**

``` sql
right(s, offset)
```

**引数**

- `s` — 部分文字列を取得する文字列。[文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**戻り値**

- 正の `offset` の場合: 文字列の右側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の右側から `length(s) - |offset|` バイトの部分文字列。
- `length` が 0 の場合は空の文字列。

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

UTF-8エンコードされた文字列 `s` の指定されたオフセットから右側の部分文字列を返します。

**構文**

``` sql
rightUTF8(s, offset)
```

**引数**

- `s` — 部分文字列を取得するUTF-8エンコードされた文字列。[文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**戻り値**

- 正の `offset` の場合: 文字列の右側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の右側から `length(s) - |offset|` バイトの部分文字列。
- `length` が 0 の場合は空の文字列。

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

文字列を指定された `length` まで右側からスペースまたは指定された文字列で埋めます（必要に応じて複数回）。

**構文**

``` sql
rightPad(string, length[, pad_string])
```

エイリアス: `RPAD`

**引数**

- `string` — 埋める対象の入力文字列。[文字列](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。値が入力文字列の長さより小さい場合、入力文字列は `length` 文字に短縮されます。
- `pad_string` — 入力文字列を埋めるための文字列。[文字列](../data-types/string.md)。省略可能。指定しない場合、入力文字列はスペースで埋められます。

**戻り値**

- 指定された長さの右に埋められた文字列。[文字列](../data-types/string.md)。

**例**

``` sql
SELECT rightPad('abc', 7, '*'), rightPad('abc', 7);
```

結果:

```result
┌─rightPad('abc', 7, '*')─┬─rightPad('abc', 7)─┐
│ abc****                 │ abc                │
└─────────────────────────┴────────────────────┘
```
## rightPadUTF8 {#rightpadutf8}

文字列を指定された `length` まで右側からスペースまたは指定された文字列で埋めます。[rightPad](#rightpad) がバイト数で文字列長を測定するのに対し、文字列長はコードポイントで測定されます。

**構文**

``` sql
rightPadUTF8(string, length[, pad_string])
```

**引数**

- `string` — 埋める対象の入力文字列。[文字列](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。値が入力文字列の長さより小さい場合、入力文字列は `length` 文字に短縮されます。
- `pad_string` — 入力文字列を埋めるための文字列。[文字列](../data-types/string.md)。省略可能。指定しない場合、入力文字列はスペースで埋められます。

**戻り値**

- 指定された長さの右に埋められた文字列。[文字列](../data-types/string.md)。

**例**

``` sql
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

- `string1` — 比較する最初の文字列。[文字列](../data-types/string.md)
- `string2` - 比較する2番目の文字列。[文字列](../data-types/string.md)
- `string1_offset` — `string1` で比較が始まる位置（ゼロベース）。[UInt*](../data-types/int-uint.md)。
- `string2_offset` — `string2` で比較が始まる位置（ゼロベース）。[UInt*](../data-types/int-uint.md)。
- `num_bytes` — 両方の文字列で比較する最大バイト数。 `string_offset` + `num_bytes` が入力文字列の終りを超えるとき、 `num_bytes` はそれに応じて減少します。[UInt*](../data-types/int-uint.md)。

**戻り値**

- -1 — `string1`[`string1_offset` : `string1_offset` + `num_bytes`] < `string2`[`string2_offset` : `string2_offset` + `num_bytes`] の場合。
- 0 — `string1`[`string1_offset` : `string1_offset` + `num_bytes`] = `string2`[`string2_offset` : `string2_offset` + `num_bytes`] の場合。
- 1 — `string1`[`string1_offset` : `string1_offset` + `num_bytes`] > `string2`[`string2_offset` : `string2_offset` + `num_bytes`] の場合。

**例**

クエリ：

```sql
SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result,
```

結果：

```result
┌─result─┐
│      0 │
└────────┘
```
## lower {#lower}

文字列内のASCIIラテン記号を小文字に変換します。

**構文**

``` sql
lower(input)
```

エイリアス: `lcase`

**引数**

- `input`: 文字列タイプ [文字列](../data-types/string.md)。

**戻り値**

- [文字列](../data-types/string.md)データ型の値。

**例**

クエリ:

```sql
SELECT lower('CLICKHOUSE');
```

結果:

```response
┌─lower('CLICKHOUSE')─┐
│ clickhouse          │
└─────────────────────┘
```
## upper {#upper}

文字列内のASCIIラテン記号を大文字に変換します。

**構文**

``` sql
upper(input)
```

エイリアス: `ucase`

**引数**

- `input` — 文字列タイプ [文字列](../data-types/string.md)。

**戻り値**

- [文字列](../data-types/string.md)データ型の値。

**例**

クエリ:

```sql
SELECT upper('clickhouse');
```

結果:

``` response
┌─upper('clickhouse')─┐
│ CLICKHOUSE          │
└─────────────────────┘
```
## lowerUTF8 {#lowerutf8}

文字列を小文字に変換します。文字列が有効なUTF-8エンコードテキストを含むと仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

:::note
言語を検出しません。たとえば、トルコ語に対して結果が正確でない可能性があります（i/İ vs. i/I）。UTF-8バイトシーケンスの大文字と小文字のコードポイントの長さが異なる場合（たとえば `ẞ` と `ß`）、そのコードポイントの結果が正確でない可能性があります。
:::

**構文**

```sql
lowerUTF8(input)
```

**引数**

- `input` — 文字列タイプ [文字列](../data-types/string.md)。

**戻り値**

- [文字列](../data-types/string.md)データ型の値。

**例**

クエリ:

```sql
SELECT lowerUTF8('MÜNCHEN') as Lowerutf8;
```

結果:

``` response
┌─Lowerutf8─┐
│ münchen   │
└───────────┘
```
## upperUTF8 {#upperutf8}

文字列を大文字に変換します。文字列が有効なUTF-8エンコードテキストを含むと仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

:::note
言語を検出しません。たとえば、トルコ語に対して結果が正確でない可能性があります（i/İ vs. i/I）。UTF-8バイトシーケンスの大文字と小文字のコードポイントの長さが異なる場合（たとえば `ẞ` と `ß`）、そのコードポイントの結果が正確でない可能性があります。
:::

**構文**

```sql
upperUTF8(input)
```

**引数**

- `input` — 文字列タイプ [文字列](../data-types/string.md)。

**戻り値**

- [文字列](../data-types/string.md)データ型の値。

**例**

クエリ:

```sql
SELECT upperUTF8('München') as Upperutf8;
```

結果:

``` response
┌─Upperutf8─┐
│ MÜNCHEN   │
└───────────┘
```
## isValidUTF8 {#isvalidutf8}

バイトのセットが有効なUTF-8エンコードテキストである場合は1を返し、そうでない場合は0を返します。

**構文**

``` sql
isValidUTF8(input)
```

**引数**

- `input` — 文字列タイプ [文字列](../data-types/string.md)。

**戻り値**

- バイトのセットが有効なUTF-8エンコードテキストである場合は `1`、そうでない場合は `0` を返します。

クエリ:

``` sql
SELECT isValidUTF8('\xc3\xb1') AS valid, isValidUTF8('\xc3\x28') AS invalid;
```

結果:

``` response
┌─valid─┬─invalid─┐
│     1 │       0 │
└───────┴─────────┘
```
## toValidUTF8 {#tovalidutf8}

無効なUTF-8文字を `�` (U+FFFD) 文字に置き換えます。連続して無効な文字は1つの置換文字に圧縮されます。

**構文**

``` sql
toValidUTF8(input_string)
```

**引数**

- `input_string` — [文字列](../data-types/string.md)データ型として表された任意のバイトセット。

**戻り値**

- 有効なUTF-8文字列。

**例**

``` sql
SELECT toValidUTF8('\x61\xF0\x80\x80\x80b');
```

結果:

```result
┌─toValidUTF8('a����b')─┐
│ a�b                   │
└───────────────────────┘
```
## repeat {#repeat}

指定された回数だけ文字列を自身と連結します。

**構文**

``` sql
repeat(s, n)
```

エイリアス: `REPEAT`

**引数**

- `s` — 繰り返す文字列。[文字列](../data-types/string.md)。
- `n` — 文字列を繰り返す回数。[UInt* または Int*](../data-types/int-uint.md)。

**戻り値**

文字列 `s` を `n` 回繰り返した文字列。 `n` &lt;= 0 の場合、関数は空の文字列を返します。[文字列](../data-types/string.md)。

**例**

``` sql
SELECT repeat('abc', 10);
```

結果:

```result
┌─repeat('abc', 10)──────────────┐
│ abcabcabcabcabcabcabcabcabcabc │
└────────────────────────────────┘
```
## space {#space}

空白（` `）を指定された回数だけ繰り返します。

**構文**

``` sql
space(n)
```

エイリアス: `SPACE`.

**引数**

- `n` — 空白を繰り返す回数。[UInt* または Int*](../data-types/int-uint.md)。

**戻り値**

空白を `n` 回繰り返した文字列。 `n` &lt;= 0 の場合、関数は空の文字列を返します。[文字列](../data-types/string.md)。

**例**

クエリ:

``` sql
SELECT space(3);
```

結果:

``` text
┌─space(3) ────┐
│              │
└──────────────┘
```
## reverse {#reverse}

文字列内のバイトの順序を反転させます。
## reverseUTF8 {#reverseutf8}

文字列内のUnicodeコードポイントの順序を反転させます。文字列が有効なUTF-8エンコードテキストを含むと仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。
## concat {#concat}

与えられた引数を連結します。

**構文**

``` sql
concat(s1, s2, ...)
```

**引数**

任意の型の値。

[文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)でない引数は、デフォルトのシリアル化を使用して文字列に変換されます。これによりパフォーマンスが低下するため、非String/FixedString引数の使用は推奨されません。

**戻り値**

引数を連結して作成された文字列。

引数のいずれかが `NULL` の場合、関数は `NULL` を返します。

**例**

クエリ:

``` sql
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
文字列の連結には `concat()` の簡潔な代替として `||` 演算子を使用できます。たとえば、 `'Hello, ' || 'World!'` は `concat('Hello, ', 'World!')` と同じです。
:::
## concatAssumeInjective {#concatassumeinjective}

[concat](#concat) と同様ですが、`concat(s1, s2, ...) → sn` が単射であると仮定します。GROUP BYの最適化に使用できます。

関数が単射であるとは、異なる引数に対して異なる結果を返す場合を指します。言い換えれば、異なる引数は決して同じ結果を生成しません。

**構文**

``` sql
concatAssumeInjective(s1, s2, ...)
```

**引数**

文字列またはFixedString型の値。

**戻り値**

引数を連結して作成された文字列。

引数のいずれかの値が `NULL` の場合、関数は `NULL` を返します。

**例**

入力テーブル:

``` sql
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

``` sql
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

``` sql
concatWithSeparator(sep, expr1, expr2, expr3...)
```

エイリアス: `concat_ws`

**引数**

- sep — 区切り文字。[文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。
- exprN — 連結する式。 [文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)型でない引数は、デフォルトのシリアル化を使用して文字列に変換されます。これによりパフォーマンスが低下するため、非String/FixedString引数の使用は推奨されません。

**戻り値**

引数を連結して作成された文字列。

引数のいずれかの値が `NULL` の場合、関数は `NULL` を返します。

**例**

``` sql
SELECT concatWithSeparator('a', '1', '2', '3', '4')
```

結果:

```result
┌─concatWithSeparator('a', '1', '2', '3', '4')─┐
│ 1a2a3a4                                      │
└──────────────────────────────────────────────┘
```
## concatWithSeparatorAssumeInjective {#concatwithseparatorassumeinjective}

`concatWithSeparator` と同様ですが、 `concatWithSeparator(sep, expr1, expr2, expr3...) → result` が単射であると仮定します。GROUP BYの最適化に使用できます。

関数が単射であるとは、異なる引数に対して異なる結果を返す場合を指します。言い換えれば、異なる引数は決して同じ結果を生成しません。
## substring {#substring}

指定されたバイトインデックス `offset` から始まる文字列 `s` の部分文字列を返します。バイトのカウントは1から始まります。 `offset` が0の場合、空の文字列が返されます。 `offset` が負の場合、部分文字列は文字列の先頭ではなく末尾から `pos` 文字で始まります。オプションの引数 `length` は、返される部分文字列の最大バイト数を指定します。

**構文**

```sql
substring(s, offset[, length])
```

エイリアス:
- `substr`
- `mid`
- `byteSlice`

**引数**

- `s` — 部分文字列を取得する文字列。[文字列](../data-types/string.md)、[FixedString](../data-types/fixedstring.md)または[Enum](../data-types/enum.md)
- `offset` — `s` で部分文字列の開始位置。[(U)Int*](../data-types/int-uint.md)。
- `length` — 部分文字列の最大長。[(U)Int*](../data-types/int-uint.md)。オプション。

**戻り値**

`offset` で始まる `s` の部分文字列の長さだけのバイト。[文字列](../data-types/string.md)。

**例**

``` sql
SELECT 'database' AS db, substr(db, 5), substr(db, 5, 1)
```

結果:

```result
┌─db───────┬─substring('database', 5)─┬─substring('database', 5, 1)─┐
│ database │ base                     │ b                           │
└──────────┴──────────────────────────┴─────────────────────────────┘
```
## substringUTF8 {#substringutf8}

指定されたバイトインデックス `offset` から始まる文字列 `s` の部分文字列を返します。バイトのカウントは1から始まります。 `offset` が0の場合、空の文字列が返されます。 `offset` が負の場合、部分文字列は文字列の先頭ではなく末尾から `pos` 文字で始まります。オプションの引数 `length` は、返される部分文字列の最大バイト数を指定します。

文字列が有効なUTF-8エンコードテキストを含むと仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**構文**

```sql
substringUTF8(s, offset[, length])
```

**引数**

- `s` — 部分文字列を取得する文字列。[文字列](../data-types/string.md)、[FixedString](../data-types/fixedstring.md)または[Enum](../data-types/enum.md)
- `offset` — `s` で部分文字列の開始位置。[(U)Int*](../data-types/int-uint.md)。
- `length` — 部分文字列の最大長。[(U)Int*](../data-types/int-uint.md)。オプション。

**戻り値**

`offset` で始まる `s` の部分文字列の長さだけのバイト。

**実装の詳細**

文字列が有効なUTF-8エンコードテキストを含むと仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**例**

```sql
SELECT 'Täglich grüßt das Murmeltier.' AS str,
       substringUTF8(str, 9),
       substringUTF8(str, 9, 5)
```

結果:

```response
Täglich grüßt das Murmeltier.	grüßt das Murmeltier.	grüßt
```
## substringIndex {#substringindex}

`delim` の `count` 回出現する前の `s` の部分文字列を返します。SparkやMySQLと同様です。

**構文**

```sql
substringIndex(s, delim, count)
```
エイリアス: `SUBSTRING_INDEX`

**引数**

- s — 部分文字列を抽出する文字列。[文字列](../data-types/string.md)。
- delim — 分割する文字。[文字列](../data-types/string.md)。
- count — 部分文字列を抽出する前に数える区切り文字の出現回数。 count が正の場合、最後の区切り文字の左側のすべてが返されます（左から数えて）。 count が負の場合、最後の区切り文字の右側のすべてが返されます（右から数えて）。 [UIntまたはInt](../data-types/int-uint.md)

**例**

``` sql
SELECT substringIndex('www.clickhouse.com', '.', 2)
```

結果:
```sql
┌─substringIndex('www.clickhouse.com', '.', 2)─┐
│ www.clickhouse                               │
└──────────────────────────────────────────────┘
```
## substringIndexUTF8 {#substringindexutf8}

`delim` の `count` 回出現する前の `s` の部分文字列を返します。具体的にはUnicodeコードポイントのためです。

文字列が有効なUTF-8エンコードテキストを含むと仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**構文**

```sql
substringIndexUTF8(s, delim, count)
```

**引数**

- `s` — 部分文字列を抽出する文字列。[文字列](../data-types/string.md)。
- `delim` — 分割する文字。[文字列](../data-types/string.md)。
- `count` — 部分文字列を抽出する前に数える区切り文字の出現回数。 count が正の場合、最後の区切り文字の左側のすべてが返されます（左から数えて）。 count が負の場合、最後の区切り文字の右側のすべてが返されます（右から数えて）。 [UIntまたはInt](../data-types/int-uint.md)

**戻り値**

`delim` の `count` 回出現する前の `s` の部分文字列。[文字列](../data-types/string.md)。

**実装の詳細**

文字列が有効なUTF-8エンコードテキストを含むと仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**例**

```sql
SELECT substringIndexUTF8('www.straßen-in-europa.de', '.', 2)
```

結果:

```response
www.straßen-in-europa
```
## appendTrailingCharIfAbsent {#appendtrailingcharifabsent}

文字列 `s` が空でなく、文字 `c` で終わっていない場合、文字 `c` を文字列 `s` に追加します。

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
## base58Encode {#base58encode}

「Bitcoin」アルファベットで[Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58)を使用して文字列をエンコードします。

**構文**

```sql
base58Encode(plaintext)
```

**引数**

- `plaintext` — [文字列](../data-types/string.md)の列または定数。

**戻り値**

- 引数のエンコード値を含む文字列。[文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。

**例**

``` sql
SELECT base58Encode('Encoded');
```

結果:

```result
┌─base58Encode('Encoded')─┐
│ 3dc8KtHrwM              │
└─────────────────────────┘
```
## base58Decode {#base58decode}

文字列を受け取り、「Bitcoin」アルファベットを使用した[Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58)エンコーディング方式でデコードします。

**構文**

```sql
base58Decode(encoded)
```

**引数**

- `encoded` — [文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。文字列が有効なBase58エンコード値でない場合、例外がスローされます。

**戻り値**

- 引数のデコード値を含む文字列。[文字列](../data-types/string.md)。

**例**

``` sql
SELECT base58Decode('3dc8KtHrwM');
```

結果:

```result
┌─base58Decode('3dc8KtHrwM')─┐
│ Encoded                    │
└────────────────────────────┘
```
## tryBase58Decode {#trybase58decode}

`base58Decode` と同じですが、エラーが発生した場合には空の文字列を返します。

**構文**

```sql
tryBase58Decode(encoded)
```

**引数**

- `encoded`: [文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。文字列が有効なBase58エンコード値でない場合、エラー時に空の文字列を返します。

**戻り値**

- 引数のデコード値を含む文字列。

**例**

クエリ:

```sql
SELECT tryBase58Decode('3dc8KtHrwM') as res, tryBase58Decode('invalid') as res_invalid;
```

結果:

```response
┌─res─────┬─res_invalid─┐
│ Encoded │             │
└─────────┴─────────────┘
```
## base64Encode {#base64encode}

文字列またはFixedStringを、[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4) に従ってbase64としてエンコードします。

エイリアス: `TO_BASE64`.

**構文**

```sql
base64Encode(plaintext)
```

**引数**

- `plaintext` — [文字列](../data-types/string.md)の列または定数。

**戻り値**

- 引数のエンコード値を含む文字列。

**例**

``` sql
SELECT base64Encode('clickhouse');
```

結果:

```result
┌─base64Encode('clickhouse')─┐
│ Y2xpY2tob3VzZQ==           │
└────────────────────────────┘
```

## base64URLEncode {#base64urlencode}

URL（StringまたはFixedString）を、[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5)に従って、URL固有の修正を加えたbase64にエンコードします。

**構文**

```sql
base64URLEncode(url)
```

**引数**

- `url` — [String](../data-types/string.md) カラムまたは定数。

**返される値**

- 引数のエンコードされた値を含む文字列。

**例**

``` sql
SELECT base64URLEncode('https://clickhouse.com');
```

結果：

```result
┌─base64URLEncode('https://clickhouse.com')─┐
│ aHR0cDovL2NsaWNraG91c2UuY29t              │
└───────────────────────────────────────────┘
```
## base64Decode {#base64decode}

Stringを受け取り、[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4)に従ってbase64からデコードします。エラーが発生した場合は例外をスローします。

エイリアス: `FROM_BASE64`.

**構文**

```sql
base64Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) カラムまたは定数。文字列が有効なBase64エンコードの値でない場合、例外がスローされます。

**返される値**

- 引数のデコードされた値を含む文字列。

**例**

``` sql
SELECT base64Decode('Y2xpY2tob3VzZQ==');
```

結果：

```result
┌─base64Decode('Y2xpY2tob3VzZQ==')─┐
│ clickhouse                       │
└──────────────────────────────────┘
```
## base64URLDecode {#base64urldecode}

base64エンコードされたURLを受け取り、[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5)に従って、URL固有の修正を加えたbase64からデコードします。エラーが発生した場合は例外をスローします。

**構文**

```sql
base64URLDecode(encodedUrl)
```

**引数**

- `encodedURL` — [String](../data-types/string.md) カラムまたは定数。文字列が有効なBase64エンコードの値でURL固有の修正がされていない場合、例外がスローされます。

**返される値**

- 引数のデコードされた値を含む文字列。

**例**

``` sql
SELECT base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t');
```

結果：

```result
┌─base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t')─┐
│ https://clickhouse.com                          │
└─────────────────────────────────────────────────┘
```
## tryBase64Decode {#trybase64decode}

`base64Decode`と同様ですが、エラーが発生した場合は空の文字列を返します。

**構文**

```sql
tryBase64Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) カラムまたは定数。文字列が有効なBase64エンコードの値でない場合は空の文字列を返します。

**返される値**

- 引数のデコードされた値を含む文字列。

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

`base64URLDecode`と同様ですが、エラーが発生した場合は空の文字列を返します。

**構文**

```sql
tryBase64URLDecode(encodedUrl)
```

**引数**

- `encodedURL` — [String](../data-types/string.md) カラムまたは定数。文字列が有効なBase64エンコードの値でURL固有の修正がされていない場合は空の文字列を返します。

**返される値**

- 引数のデコードされた値を含む文字列。

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

文字列 `str` が `suffix` で終わるかどうかを返します。`endsWithUTF8` と `endsWith` の違いは、`endsWithUTF8` が `str` と `suffix` をUTF-8文字で一致させることです。

**構文**

```sql
endsWithUTF8(str, suffix)
```

**例**

``` sql
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

``` sql
SELECT startsWith('Spider-Man', 'Spi');
```
## startsWithUTF8 {#startswithutf8}

<VersionBadge minVersion='23.8' />

文字列 `str` が `prefix` で始まるかどうかを返します。`startsWithUTF8` と `startsWith` の違いは、`startsWithUTF8` が `str` と `suffix` をUTF-8文字で一致させることです。

**例**

``` sql
SELECT startsWithUTF8('中国', '\xe4'), startsWith('中国', '\xe4')
```

結果：

```result
┌─startsWithUTF8('中国', '⥩─┬─startsWith('中国', '⥩─┐
│                          0 │                      1 │
└────────────────────────────┴────────────────────────┘
```
## trim {#trim}

指定された文字を文字列の先頭または末尾から削除します。特に指定されていない場合、この関数は空白（ASCII文字32）を削除します。

**構文**

``` sql
trim([[LEADING|TRAILING|BOTH] trim_character FROM] input_string)
```

**引数**

- `trim_character` — トリムする文字。 [String](../data-types/string.md)。
- `input_string` — トリムする文字列。 [String](../data-types/string.md)。

**返される値**

先頭および/または末尾から指定された文字を削除した文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT trim(BOTH ' ()' FROM '(   Hello, world!   )');
```

結果：

```result
┌─trim(BOTH ' ()' FROM '(   Hello, world!   )')─┐
│ Hello, world!                                 │
└───────────────────────────────────────────────┘
```
## trimLeft {#trimleft}

文字列の先頭からの空白（ASCII文字32）の連続した出現を削除します。

**構文**

``` sql
trimLeft(input_string[, trim_characters])
```

エイリアス: `ltrim`.

**引数**

- `input_string` — トリムする文字列。 [String](../data-types/string.md)。
- `trim_characters` — 削除する文字。オプション。 [String](../data-types/string.md)。指定されていない場合は、`' '`（単一の空白）がトリム文字として使用されます。

**返される値**

一般的な空白なしの文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT trimLeft('     Hello, world!     ');
```

結果：

```result
┌─trimLeft('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```
## trimRight {#trimright}

文字列の末尾からの空白（ASCII文字32）の連続した出現を削除します。

**構文**

``` sql
trimRight(input_string[, trim_characters])
```

エイリアス: `rtrim`.

**引数**

- `input_string` — トリムする文字列。 [String](../data-types/string.md)。
- `trim_characters` — 削除する文字。オプション。 [String](../data-types/string.md)。指定されていない場合は、`' '`（単一の空白）がトリム文字として使用されます。

**返される値**

末尾から一般的な空白を削除した文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT trimRight('     Hello, world!     ');
```

結果：

```result
┌─trimRight('     Hello, world!     ')─┐
│      Hello, world!                   │
└──────────────────────────────────────┘
```
## trimBoth {#trimboth}

文字列の両端からの空白（ASCII文字32）の連続した出現を削除します。

**構文**

``` sql
trimBoth(input_string[, trim_characters])
```

エイリアス: `trim`.

**引数**

- `input_string` — トリムする文字列。 [String](../data-types/string.md)。
- `trim_characters` — 削除する文字。オプション。 [String](../data-types/string.md)。指定されていない場合は、`' '`（単一の空白）がトリム文字として使用されます。

**返される値**

先頭および末尾から一般的な空白を削除した文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT trimBoth('     Hello, world!     ');
```

結果：

```result
┌─trimBoth('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```
## CRC32 {#crc32}

文字列のCRC32チェックサムを返します。使用する多項式はCRC-32-IEEE 802.3で、初期値は`0xffffffff`（zlib実装）です。

結果の型はUInt32です。
## CRC32IEEE {#crc32ieee}

文字列のCRC32チェックサムを返します。使用する多項式はCRC-32-IEEE 802.3です。

結果の型はUInt32です。
## CRC64 {#crc64}

文字列のCRC64チェックサムを返します。使用する多項式はCRC-64-ECMAです。

結果の型はUInt64です。
## normalizeUTF8NFC {#normalizeutf8nfc}

文字列を[NFC標準化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)に変換します。文字列は有効なUTF8エンコードのテキストであると仮定します。

**構文**

``` sql
normalizeUTF8NFC(words)
```

**引数**

- `words` — UTF8エンコードされた入力文字列。 [String](../data-types/string.md)。

**返される値**

- NFC標準化形式に変換された文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT length('â'), normalizeUTF8NFC('â') AS nfc, length(nfc) AS nfc_len;
```

結果：

```result
┌─length('â')─┬─nfc─┬─nfc_len─┐
│           2 │ â   │       2 │
└─────────────┴─────┴─────────┘
```
## normalizeUTF8NFD {#normalizeutf8nfd}

文字列を[NFD標準化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)に変換します。文字列は有効なUTF8エンコードのテキストであると仮定します。

**構文**

``` sql
normalizeUTF8NFD(words)
```

**引数**

- `words` — UTF8エンコードされた入力文字列。 [String](../data-types/string.md)。

**返される値**

- NFD標準化形式に変換された文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT length('â'), normalizeUTF8NFD('â') AS nfd, length(nfd) AS nfd_len;
```

結果：

```result
┌─length('â')─┬─nfd─┬─nfd_len─┐
│           2 │ â   │       3 │
└─────────────┴─────┴─────────┘
```
## normalizeUTF8NFKC {#normalizeutf8nfkc}

文字列を[NFKC標準化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)に変換します。文字列は有効なUTF8エンコードのテキストであると仮定します。

**構文**

``` sql
normalizeUTF8NFKC(words)
```

**引数**

- `words` — UTF8エンコードされた入力文字列。 [String](../data-types/string.md)。

**返される値**

- NFKC標準化形式に変換された文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT length('â'), normalizeUTF8NFKC('â') AS nfkc, length(nfkc) AS nfkc_len;
```

結果：

```result
┌─length('â')─┬─nfkc─┬─nfkc_len─┐
│           2 │ â    │        2 │
└─────────────┴──────┴──────────┘
```
## normalizeUTF8NFKD {#normalizeutf8nfkd}

文字列を[NFKD標準化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms)に変換します。文字列は有効なUTF8エンコードのテキストであると仮定します。

**構文**

``` sql
normalizeUTF8NFKD(words)
```

**引数**

- `words` — UTF8エンコードされた入力文字列。 [String](../data-types/string.md)。

**返される値**

- NFKD標準化形式に変換された文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT length('â'), normalizeUTF8NFKD('â') AS nfkd, length(nfkd) AS nfkd_len;
```

結果：

```result
┌─length('â')─┬─nfkd─┬─nfkd_len─┐
│           2 │ â    │        3 │
└─────────────┴──────┴──────────┘
```
## encodeXMLComponent {#encodexmlcomponent}

XML内で特別な意味を持つ文字をエスケープして、XMLテキストノードまたは属性に配置できるようにします。

次の文字が置き換えられます: `<`, `&`, `>`, `"`, `'`。また、[XMLおよびHTML文字エンティティ参照のリスト](https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references)も参照してください。

**構文**

``` sql
encodeXMLComponent(x)
```

**引数**

- `x` — 入力文字列。 [String](../data-types/string.md)。

**返される値**

- エスケープされた文字列。 [String](../data-types/string.md)。

**例**

``` sql
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

XMLで特別な意味を持つ部分文字列のエスケープを解除します。これらの部分文字列は次のとおりです: `&quot;` `&amp;` `&apos;` `&gt;` `&lt;`

この関数は、数値文字参照をUnicode文字に置き換えます。両方の10進法（`&#10003;`）および16進法（`&#x2713;`）形式がサポートされています。

**構文**

``` sql
decodeXMLComponent(x)
```

**引数**

- `x` — 入力文字列。 [String](../data-types/string.md)。

**返される値**

- エスケープ解除された文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT decodeXMLComponent('&apos;foo&apos;');
SELECT decodeXMLComponent('&lt; &#x3A3; &gt;');
```

結果：

```result
'foo'
< Σ >
```
## decodeHTMLComponent {#decodehtmlcomponent}

HTMLで特別な意味を持つ部分文字列のエスケープを解除します。たとえば: `&hbar;` `&gt;` `&diamondsuit;` `&heartsuit;` `&lt;` など。

この関数は、数値文字参照をUnicode文字に置き換えます。両方の10進法（`&#10003;`）および16進法（`&#x2713;`）形式がサポートされています。

**構文**

``` sql
decodeHTMLComponent(x)
```

**引数**

- `x` — 入力文字列。 [String](../data-types/string.md)。

**返される値**

- エスケープ解除された文字列。 [String](../data-types/string.md)。

**例**

``` sql
SELECT decodeHTMLComponent(''CH');
SELECT decodeHTMLComponent('I&heartsuit;ClickHouse');
```

結果：

```result
'CH'
I♥ClickHouse'
```
## extractTextFromHTML {#extracttextfromhtml}

この関数は、HTMLまたはXHTMLからプレーンテキストを抽出します。

HTML、XML、またはXHTMLの仕様には100％準拠していませんが、実装は合理的に正確で高速です。ルールは次のとおりです。

1. コメントはスキップされます。例: `<!-- test -->`。コメントは`-->`で終わらなければなりません。入れ子コメントは許可されません。
   注意: `<!-->`や`<!--->`のような構造は、HTMLでは有効ではありませんが、他のルールによってスキップされます。
2. CDATAはそのまま貼り付けられます。注意: CDATAはXML/XHTML特有であり、"最善を尽くす"という原則で処理されます。
3. `script`および`style`要素は、その中のコンテンツごと削除されます。注意: 閉じるタグはコンテンツ内に現れないと仮定されています。たとえば、JS文字列リテラルは`"<\/script>"`のようにエスケープする必要があります。
   注意: コメントやCDATAは`scrip`または`style`の内部に存在する可能性があります - その場合、閉じるタグはCDATAの内部に検索されません。例: `<script><![CDATA[</script>]]></script>`。ただし、コメント内では検索されます。このように複雑な場合もあります: `<script>var x = "<!--"; </script> var y = "-->"; alert(x + y);</script>`
   注意: `script`および`style`はXML名前空間の名前である可能性があるため、通常の`script`または`style`要素として扱われません。例: `<script:a>Hello</script:a>`。
   注意: 閉じるタグ名の後に空白が存在する可能性があります: `</script >`ですが、前には空白が存在しません: `< / script>`。
4. 他のタグやタグのような要素は、内部にコンテンツがない場合にスキップされます。例: `<a>.</a>`
   注意: このHTMLは不正であると見込まれています: `<a test=">"></a>`
   注意: `<>`、`<!>`のようなタグもスキップされます。
   注意: 終わりのないタグは入力の終わりまでスキップされます: `<hello   `
5. HTMLおよびXMLエンティティはデコードされません。これらは別の関数で処理する必要があります。
6. テキスト内の空白は、特定のルールによって折りたたまれるか挿入されます。
   - 先頭と末尾の空白が削除されます。
   - 連続する空白が折りたたまれます。
   - ただし、テキストが他の要素によって区切られていて、空白がない場合、空白が挿入されます。
   - これは不自然な例を引き起こす可能性があります: `Hello<b>world</b>`, `Hello<!-- -->world` - HTMLでは空白がありませんが、関数はそれを挿入します。また考慮すべきは: `Hello<p>world</p>`, `Hello<br>world`です。この動作はデータ分析、例えばHTMLを単語の集合に変換する際には合理的です。
7. また、空白の正しい処理には、`<pre></pre>`およびCSSの`display`と`white-space`プロパティのサポートが必要です。

**構文**

``` sql
extractTextFromHTML(x)
```

**引数**

- `x` — 入力テキスト。 [String](../data-types/string.md)。

**返される値**

- 抽出されたテキスト。 [String](../data-types/string.md)。

**例**

最初の例は、いくつかのタグとコメントを含み、空白の処理も示しています。
2番目の例は、CDATAとscript要素の処理を示します。
3番目の例では、[url](../../sql-reference/table-functions/url.md)関数によって取得された完全なHTML応答からテキストを抽出しています。

``` sql
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

文字列 `s` の最初の文字のASCIIコードポイント（Int32として）を返します。

`s` が空である場合、結果は0です。最初の文字がASCII文字でない場合や、UTF-16のLatin-1サプリメント範囲にない場合、結果は未定義です。

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

**返される値**

- 入力値のSoundexコード。 [String](../data-types/string.md)

**例**

``` sql
select soundex('aksel');
```

結果：

```result
┌─soundex('aksel')─┐
│ A240             │
└──────────────────┘
```
## punycodeEncode {#punycodeencode}

文字列の[Punycode](https://en.wikipedia.org/wiki/Punycode)表現を返します。
文字列はUTF8エンコードされている必要があります。さもなくば、動作は未定義です。

**構文**

``` sql
punycodeEncode(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**返される値**

- 入力値のPunycode表現。 [String](../data-types/string.md)

**例**

``` sql
select punycodeEncode('München');
```

結果：

```result
┌─punycodeEncode('München')─┐
│ Mnchen-3ya                │
└───────────────────────────┘
```
## punycodeDecode {#punycodedecode}

[Punycode](https://en.wikipedia.org/wiki/Punycode)エンコードされた文字列のUTF8エンコードされた平文を返します。
有効なPunycodeエンコードされた文字列が与えられない場合、例外がスローされます。

**構文**

``` sql
punycodeEncode(val)
```

**引数**

- `val` — Punycodeエンコードされた文字列。 [String](../data-types/string.md)

**返される値**

- 入力値の平文。 [String](../data-types/string.md)

**例**

``` sql
select punycodeDecode('Mnchen-3ya');
```

結果：

```result
┌─punycodeDecode('Mnchen-3ya')─┐
│ München                      │
└──────────────────────────────┘
```
## tryPunycodeDecode {#trypunycodedecode}

`punycodeDecode`と同様ですが、有効なPunycodeエンコードされた文字列が与えられない場合、空の文字列を返します。
## idnaEncode {#idnaencode}

ドメイン名のASCII表現（ToASCIIアルゴリズム）を返します。これは、[アプリケーションにおける国際化ドメイン名](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications)（IDNA）メカニズムに従って行われます。入力文字列はUTF-エンコードされており、ASCII文字列に変換可能でなければなりません。そうでない場合は例外がスローされます。
注意: パーセントデコードやタブ、空白、制御文字のトリミングは行われません。

**構文**

```sql
idnaEncode(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**返される値**

- 入力値のIDNAメカニズムに従ったASCII表現。 [String](../data-types/string.md)

**例**

``` sql
select idnaEncode('straße.münchen.de');
```

結果：

```result
┌─idnaEncode('straße.münchen.de')─────┐
│ xn--strae-oqa.xn--mnchen-3ya.de     │
└─────────────────────────────────────┘
```
## tryIdnaEncode {#tryidnaencode}

`idnaEncode`と同様ですが、エラーが発生した場合は例外をスローするのではなく、空の文字列を返します。
## idnaDecode {#idnadecode}

ドメイン名のUnicode（UTF-8）表現（ToUnicodeアルゴリズム）を返します。これは、[アプリケーションにおける国際化ドメイン名](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications)（IDNA）メカニズムに従います。
エラーが発生した場合（たとえば、入力が無効な場合）、入力文字列が返されます。
`idnaEncode()`および`idnaDecode()`の繰り返し適用は、ケースの正規化のため、必ずしも元の文字列を返さないことに注意してください。

**構文**

```sql
idnaDecode(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**返される値**

- 入力値のIDNAメカニズムに従ったUnicode（UTF-8）表現。 [String](../data-types/string.md)

**例**

``` sql
select idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de');
```

結果：

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

``` sql
SELECT byteHammingDistance('karolin', 'kathrin');
```

結果：

``` text
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

``` sql
SELECT stringJaccardIndex('clickhouse', 'mouse');
```

結果：

``` text
┌─stringJaccardIndex('clickhouse', 'mouse')─┐
│                                       0.4 │
└───────────────────────────────────────────┘
```
## stringJaccardIndexUTF8 {#stringjaccardindexutf8}

[stringJaccardIndex](#stringjaccardindex)と同様ですが、UTF8エンコードされた文字列用です。
## editDistance {#editdistance}

2つのバイト文字列間の[編集距離](https://en.wikipedia.org/wiki/Edit_distance)を計算します。

**構文**

```sql
editDistance(string1, string2)
```

**例**

``` sql
SELECT editDistance('clickhouse', 'mouse');
```

結果：

``` text
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

``` sql
SELECT editDistanceUTF8('我是谁', '我是我');
```

結果：

``` text
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

``` sql
SELECT damerauLevenshteinDistance('clickhouse', 'mouse');
```

結果：

``` text
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

``` sql
SELECT jaroSimilarity('clickhouse', 'click');
```

結果：

``` text
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

``` sql
SELECT jaroWinklerSimilarity('clickhouse', 'click');
```

結果：

``` text
┌─jaroWinklerSimilarity('clickhouse', 'click')─┐
│                           0.8999999999999999 │
└──────────────────────────────────────────────┘
```
## initcap {#initcap}

各単語の最初の文字を大文字にし、残りを小文字に変換します。単語は、非英数字文字で区切られた英数字文字のシーケンスです。

:::note
`initCap`は各単語の最初の文字のみを大文字に変換します。そのため、アポストロフィや大文字を含む単語に対して、予期しない動作を観察する場合があります。たとえば：

```sql
SELECT initCap('mother''s daughter'), initCap('joe McAdam');
```

は次のように返されます

```response
┌─initCap('mother\'s daughter')─┬─initCap('joe McAdam')─┐
│ Mother'S Daughter             │ Joe Mcadam            │
└───────────────────────────────┴───────────────────────┘
```

これは既知の動作であり、現在修正の計画はありません。
:::

**構文**

```sql
initcap(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)。

**返される値**

- 各単語の最初の文字が大文字に変換された `val`。 [String](../data-types/string.md)。

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

[stringJaccardIndex](#initcap)のように、`initcapUTF8`は各単語の最初の文字を大文字にし、残りを小文字にします。有効なUTF-8エンコードされたテキストが含まれていると仮定します。
この仮定が守られない場合、例外はスローされず、結果は未定義になります。

:::note
この関数は言語を検出しません。たとえば、トルコ語の場合、結果が完全に正確ではない場合があります（i/İ対i/I）。
UTF-8バイトシーケンスの長さがコードポイントの大文字と小文字で異なる場合、このコードポイントに対して結果が不正確になる可能性があります。
:::

**構文**

```sql
initcapUTF8(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)。

**返される値**

- 各単語の最初の文字が大文字に変換された `val`。 [String](../data-types/string.md)。

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

- `val` — 入力値。 [String](../data-types/string.md)

**返される値**

- 行区切りがない場合、最初の行または全体の値。 [String](../data-types/string.md)

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

2つの文字列を辞書的に比較します。

**構文**

```sql
stringCompare(string1, string2[, str1_off, string2_offset, num_bytes]);
```

**引数**

- `string1` — 比較する最初の文字列。 [String](../data-types/string.md)
- `string2` - 比較する2番目の文字列。[String](../data-types/string.md)
- `string1_offset` — 比較が開始される `string1`内の位置（0ベース）。オプション、正の数。
- `string2_offset` — 比較が開始される `string2`内の位置（0ベースインデックス）。オプション、正の数。
- `num_bytes` — 両方の文字列で比較する最大バイト数。`string_offset` + `num_bytes` が入力文字列の末尾を超える場合、`num_bytes`はそれに応じて減算されます。

**返される値**

- -1 — もし`string1`[`string1_offset`: `string1_offset` + `num_bytes`] < `string2`[`string2_offset`:`string2_offset` + `num_bytes`] で、かつ `string1_offset` < len(`string1`) かつ `string2_offset` < len(`string2`)。
                もし `string1_offset` >= len(`string1`) かつ `string2_offset` < len(`string2`)。
- 0 — もし `string1`[`string1_offset`: `string1_offset` + `num_bytes`] = `string2`[`string2_offset`:`string2_offset` + `num_bytes`] で、かつ `string1_offset` < len(`string1`) かつ `string2_offset` < len(`string2`)。
                  もし `string1_offset` >= len(`string1`) かつ `string2_offset` >= len(`string2`)。
- 1 — もし`string1`[`string1_offset`: `string1_offset` + `num_bytes`] > `string2`[`string2_offset`:`string2_offset` + `num_bytes`] で、かつ `string1_offset` < len(`string1`) かつ `string2_offset` < len(`string2`)。
                もし `string1_offset` < len(`string1`) かつ `string2_offset` >= len(`string2`)。

**例**

```sql
SELECT
    stringCompare('alice', 'bob', 0, 0, 3) as result1,
    stringCompare('alice', 'alicia', 0, 0, 3) as result2,
    stringCompare('bob', 'alice', 0, 0, 3) as result3
```

結果：
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
結果：
```result
   ┌─result2─┬─result1─┬─result3─┐
1. │      -1 │       0 │       1 │
   └─────────┴─────────┴─────────┘
```
