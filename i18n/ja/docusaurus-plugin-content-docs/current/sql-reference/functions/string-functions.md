---
slug: /sql-reference/functions/string-functions
sidebar_position: 170
sidebar_label: 文字列
---

import VersionBadge from '@theme/badges/VersionBadge';

# 文字列操作のための関数

文字列内での[検索](string-search-functions.md)や文字列内での[置換](string-replace-functions.md)については、別々に説明されています。

## empty {#empty}

入力文字列が空であるかどうかをチェックします。文字列は、空白やヌルバイトであっても、1バイト以上含まれていれば非空と見なされます。

この関数は、[配列](array-functions.md#function-empty)や[UUID](uuid-functions.md#empty)にも利用可能です。

**構文**

``` sql
empty(x)
```

**引数**

- `x` — 入力値。[文字列](../data-types/string.md)。

**返される値**

- 空の文字列に対しては `1`、非空の文字列に対しては `0` を返します。[UInt8](../data-types/int-uint.md)。

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

入力文字列が非空であるかどうかをチェックします。文字列は、空白やヌルバイトであっても、1バイト以上含まれていれば非空と見なされます。

この関数は、[配列](array-functions.md#function-notempty)や[UUID](uuid-functions.md#notempty)にも利用可能です。

**構文**

``` sql
notEmpty(x)
```

**引数**

- `x` — 入力値。[文字列](../data-types/string.md)。

**返される値**

- 非空の文字列に対しては `1`、空の文字列に対しては `0` を返します。[UInt8](../data-types/int-uint.md)。

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

文字列の長さをバイト単位で返します（文字数やUnicodeコードポイント単位ではありません）。この関数は配列にも対応しています。

エイリアス: `OCTET_LENGTH`

**構文**

```sql
length(s)
```

**引数**

- `s` — 入力文字列または配列。[文字列](../data-types/string)/[配列](../data-types/array)。

**返される値**

- 文字列または配列 `s` のバイト数における長さ。[UInt64](../data-types/int-uint)。

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

文字列の長さをUnicodeコードポイント単位で返します（バイトや文字ではありません）。文字列が有効なUTF-8エンコーディングされたテキストを含むと仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

エイリアス:
- `CHAR_LENGTH`
- `CHARACTER_LENGTH`

**構文**

```sql
lengthUTF8(s)
```

**引数**

- `s` — 有効なUTF-8エンコーディングされたテキストを含む文字列。[文字列](../data-types/string)。

**返される値**

- 文字列 `s` のUnicodeコードポイントにおける長さ。[UInt64](../data-types/int-uint.md)。

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

指定された `offset` から左側の文字列 `s` の部分文字列を返します。

**構文**

``` sql
left(s, offset)
```

**引数**

- `s` — 部分文字列を計算する文字列。[文字列](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**返される値**

- 正の `offset` の場合: 文字列の左側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の左側から `length(s) - |offset|` バイトの部分文字列。
- `length` が0の場合、空文字列。

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

指定された `offset` から左側のUTF-8エンコーディングされた文字列 `s` の部分文字列を返します。

**構文**

``` sql
leftUTF8(s, offset)
```

**引数**

- `s` — 部分文字列を計算するUTF-8エンコーディングされた文字列。[文字列](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**返される値**

- 正の `offset` の場合: 文字列の左側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の左側から `length(s) - |offset|` バイトの部分文字列。
- `length` が0の場合、空文字列。

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

文字列の左側に空白または指定された文字列でパディングし、結果の文字列が指定された `length` に達するまで（必要に応じて複数回）行います。

**構文**

``` sql
leftPad(string, length[, pad_string])
```

エイリアス: `LPAD`

**引数**

- `string` — パディングされるべき入力文字列。[文字列](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。入力文字列の長さがこの値より小さい場合、入力文字列は `length` 文字に短縮されます。
- `pad_string` — 入力文字列をパディングするための文字列。[文字列](../data-types/string.md)。省略可能。指定されない場合、入力文字列は空白でパディングされます。

**返される値**

- 指定された長さの左パディングされた文字列。[文字列](../data-types/string.md)。

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

文字列の左側に空白または指定された文字列でパディングし、結果の文字列が指定された長さに達するまで（必要に応じて複数回）行います。 [leftPad](#leftpad) とは異なり、文字列の長さはバイトではなくコードポイントで測定されます。

**構文**

``` sql
leftPadUTF8(string, length[, pad_string])
```

**引数**

- `string` — パディングされるべき入力文字列。[文字列](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。入力文字列の長さがこの値より小さい場合、入力文字列は `length` 文字に短縮されます。
- `pad_string` — 入力文字列をパディングするための文字列。[文字列](../data-types/string.md)。省略可能。指定されない場合、入力文字列は空白でパディングされます。

**返される値**

- 指定された長さの左パディングされた文字列。[文字列](../data-types/string.md)。

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

指定された `offset` から右側の文字列 `s` の部分文字列を返します。

**構文**

``` sql
right(s, offset)
```

**引数**

- `s` — 部分文字列を計算する文字列。[文字列](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**返される値**

- 正の `offset` の場合: 文字列の右側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の右側から `length(s) - |offset|` バイトの部分文字列。
- `length` が0の場合、空文字列。

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

指定された `offset` から右側のUTF-8エンコーディングされた文字列 `s` の部分文字列を返します。

**構文**

``` sql
rightUTF8(s, offset)
```

**引数**

- `s` — 部分文字列を計算するUTF-8エンコーディングされた文字列。[文字列](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `offset` — オフセットのバイト数。[(U)Int*](../data-types/int-uint)。

**返される値**

- 正の `offset` の場合: 文字列の右側から `offset` バイトの部分文字列。
- 負の `offset` の場合: 文字列の右側から `length(s) - |offset|` バイトの部分文字列。
- `length` が0の場合、空文字列。

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

文字列の右側に空白または指定された文字列でパディングし、結果の文字列が指定された `length` に達するまで（必要に応じて複数回）行います。

**構文**

``` sql
rightPad(string, length[, pad_string])
```

エイリアス: `RPAD`

**引数**

- `string` — パディングされるべき入力文字列。[文字列](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。入力文字列の長さがこの値より小さい場合、入力文字列は `length` 文字に短縮されます。
- `pad_string` — 入力文字列をパディングするための文字列。[文字列](../data-types/string.md)。省略可能。指定されない場合、入力文字列は空白でパディングされます。

**返される値**

- 指定された長さの右パディングされた文字列。[文字列](../data-types/string.md)。

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

文字列の右側に空白または指定された文字列でパディングし、結果の文字列が指定された長さに達するまで（必要に応じて複数回）行います。 [rightPad](#rightpad) とは異なり、文字列の長さはバイトではなくコードポイントで測定されます。

**構文**

``` sql
rightPadUTF8(string, length[, pad_string])
```

**引数**

- `string` — パディングされるべき入力文字列。[文字列](../data-types/string.md)。
- `length` — 結果の文字列の長さ。[UIntまたはInt](../data-types/int-uint.md)。入力文字列の長さがこの値より小さい場合、入力文字列は `length` 文字に短縮されます。
- `pad_string` — 入力文字列をパディングするための文字列。[文字列](../data-types/string.md)。省略可能。指定されない場合、入力文字列は空白でパディングされます。

**返される値**

- 指定された長さの右パディングされた文字列。[文字列](../data-types/string.md)。

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

2つの文字列を辞書順で比較します。

**構文**

```sql
compareSubstrings(string1, string2, string1_offset, string2_offset, num_bytes);
```

**引数**

- `string1` — 比較する最初の文字列。[文字列](../data-types/string.md)
- `string2` - 比較する2番目の文字列。[文字列](../data-types/string.md)
- `string1_offset` — 比較が始まる `string1` の位置（ゼロベース）。[UInt*](../data-types/int-uint.md)。
- `string2_offset` — 比較が始まる `string2` の位置（ゼロベース）。[UInt*](../data-types/int-uint.md)。
- `num_bytes` — 両文字列の最大比較バイト数。 `string_offset` + `num_bytes` が入力文字列の終わりを超える場合、`num_bytes` はそれに応じて減少します。[UInt*](../data-types/int-uint.md)。

**返される値**

- -1 — もし `string1`[`string1_offset` : `string1_offset` + `num_bytes`] < `string2`[`string2_offset` : `string2_offset` + `num_bytes`] であれば。
- 0 — もし `string1`[`string1_offset` : `string1_offset` + `num_bytes`] = `string2`[`string2_offset` : `string2_offset` + `num_bytes`] であれば。
- 1 — もし `string1`[`string1_offset` : `string1_offset` + `num_bytes`] > `string2`[`string2_offset` : `string2_offset` + `num_bytes`] であれば。

**例**

クエリ:

```sql
SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result;
```

結果:

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

**返される値**

-  [文字列](../data-types/string.md)データ型の値。

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

``` sql
upper(input)
```

エイリアス: `ucase`

**引数**

- `input` — 文字列タイプ [文字列](../data-types/string.md)。

**返される値**

-  [文字列](../data-types/string.md)データ型の値。

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

有効なUTF-8エンコーディングされたテキストが含まれていると仮定して、文字列を小文字に変換します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

:::note
言語を検出しません。たとえば、トルコ語の場合、結果が正確でない場合があります (i/İ vs. i/I)。UTF-8バイト列の大文字と小文字のコードポイントでの長さが異なる場合（例えば `ẞ` と `ß`）、このコードポイントに対して結果が不正確になる可能性があります。
:::

**構文**

```sql
lowerUTF8(input)
```

**引数**

- `input` — 文字列タイプ [文字列](../data-types/string.md)。

**返される値**

- [文字列](../data-types/string.md)データ型の値。

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

有効なUTF-8エンコーディングされたテキストが含まれていると仮定して、文字列を大文字に変換します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

:::note
言語を検出しません。たとえば、トルコ語の場合、結果が正確でない場合があります (i/İ vs. i/I)。UTF-8バイト列の大文字と小文字のコードポイントでの長さが異なる場合（例えば `ẞ` と `ß`）、このコードポイントに対して結果が不正確になる可能性があります。
:::

**構文**

```sql
upperUTF8(input)
```

**引数**

- `input` — 文字列タイプ [文字列](../data-types/string.md)。

**返される値**

- [文字列](../data-types/string.md)データ型の値。

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

バイトのセットが有効なUTF-8エンコーディングされたテキストを構成する場合は1を、そうでない場合は0を返します。

**構文**

``` sql
isValidUTF8(input)
```

**引数**

- `input` — 文字列タイプ [文字列](../data-types/string.md)。

**返される値**

- バイトのセットが有効なUTF-8エンコーディングされたテキストを構成する場合は `1`、そうでない場合は `0` を返します。

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

無効なUTF-8文字を `�` (U+FFFD) 文字に置換します。連続する無効文字はすべて1つの置換文字に折りたたまれます。

**構文**

``` sql
toValidUTF8(input_string)
```

**引数**

- `input_string` — [文字列](../data-types/string.md)データ型オブジェクトとして表現される任意のバイトセット。

**返される値**

- 有効なUTF-8文字列。

**例**

``` sql
SELECT toValidUTF8('\x61\xF0\x80\x80\x80b');
```

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

**返される値**

文字列 `s` が `n` 回繰り返された文字列。 `n` &lt;= 0 の場合、関数は空文字列を返します。[文字列](../data-types/string.md)。

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

空白 (` `) を指定された回数だけ自身と連結します。

**構文**

``` sql
space(n)
```

エイリアス: `SPACE`.

**引数**

- `n` — 空白を繰り返す回数。[UInt* または Int*](../data-types/int-uint.md)。

**返される値**

文字列 ` ` が `n` 回繰り返された文字列。 `n` &lt;= 0 の場合、関数は空文字列を返します。[文字列](../data-types/string.md)。

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

文字列内のバイトの順序を逆にします。

## reverseUTF8 {#reverseutf8}

文字列内のUnicodeコードポイントの順序を逆にします。有効なUTF-8エンコーディングされたテキストが含まれていると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

## concat {#concat}

指定された引数を結合します。

**構文**

``` sql
concat(s1, s2, ...)
```

**引数**

任意の型の値。

[文字列](../data-types/string.md) または [FixedString](../data-types/fixedstring.md) でない引数は、そのデフォルトのシリアル化を使用して文字列に変換されます。これによりパフォーマンスが低下するため、非String/FixedString引数の使用は推奨されません。

**返される値**

引数を結合して作成された文字列。

引数が `NULL` の場合、関数は `NULL` を返します。

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
`concat()` の簡潔な代替として、`||` 演算子を使用して文字列を結合できます。例えば、`'Hello, ' || 'World!'` は `concat('Hello, ', 'World!')` と同等です。
:::

## concatAssumeInjective {#concatassumeinjective}

[concat](#concat) と同様ですが、`concat(s1, s2, ...) → sn` が単射であると仮定します。GROUP BY の最適化に使用できます。

関数が単射であるとは、異なる引数に対して異なる結果を返すことを意味します。言い換えれば：異なる引数は決して同じ結果を生じさせない。

**構文**

``` sql
concatAssumeInjective(s1, s2, ...)
```

**引数**

文字列またはFixedString型の値。

**返される値**

引数を結合して作成された文字列。

引数値のいずれかが `NULL` の場合、関数は `NULL` を返します。

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

指定されたセパレーターで与えられた文字列を結合します。

**構文**

``` sql
concatWithSeparator(sep, expr1, expr2, expr3...)
```

エイリアス: `concat_ws`

**引数**

- sep — セパレーター。定数 [文字列](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- exprN — 結合される式。 [文字列](../data-types/string.md) または [FixedString](../data-types/fixedstring.md) でない引数は、そのデフォルトのシリアル化を使用して文字列に変換されます。これによりパフォーマンスが低下するため、非String/FixedString引数の使用は推奨されません。

**返される値**

引数を結合して作成された文字列。

引数値のいずれかが `NULL` の場合、関数は `NULL` を返します。

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

`concatWithSeparator` と同様ですが、`concatWithSeparator(sep, expr1, expr2, expr3...) → result` が単射であると仮定します。GROUP BY の最適化に使用できます。

関数が単射であるとは、異なる引数に対して異なる結果を返すことを意味します。言い換えれば：異なる引数は決して同じ結果を生じさせない。

## substring {#substring}

文字列 `s` の部分文字列を、指定されたバイトインデックス `offset` から返します。バイトのカウントは1から始まります。`offset` が0の場合、空文字列が返されます。`offset` が負の値の場合、部分文字列は文字列の先頭ではなく末尾から `pos` 文字の位置から始まります。オプションの引数 `length` では、返される部分文字列が持つ最大バイト数を指定できます。

**構文**

```sql
substring(s, offset[, length])
```

エイリアス:
- `substr`
- `mid`
- `byteSlice`

**引数**

- `s` — 部分文字列を計算する文字列。[文字列](../data-types/string.md)、[FixedString](../data-types/fixedstring.md) または [Enum](../data-types/enum.md)
- `offset` — `s` 内の部分文字列の開始位置。[(U)Int*](../data-types/int-uint.md)。
- `length` — 部分文字列の最大長。[(U)Int*](../data-types/int-uint.md)。省略可能。

**返される値**

インデックス `offset` から始まる `s` の部分文字列。[文字列](../data-types/string.md)。

**例**

``` sql
SELECT 'database' AS db, substr(db, 5), substr(db, 5, 1);
```

結果:

```result
┌─db───────┬─substring('database', 5)─┬─substring('database', 5, 1)─┐
│ database │ base                     │ b                           │
└──────────┴──────────────────────────┴─────────────────────────────┘
```

## substringUTF8 {#substringutf8}

文字列 `s` の部分文字列をUnicodeコードポイントの指定バイトインデックス `offset` から返します。バイトのカウントは1から始まります。`offset` が0の場合、空文字列が返されます。`offset` が負の値の場合、部分文字列は文字列の先頭ではなく末尾から `pos` 文字の位置から始まります。オプションの引数 `length` では、返される部分文字列が持つ最大バイト数を指定できます。

有効なUTF-8エンコーディングされたテキストが含まれていると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**構文**

```sql
substringUTF8(s, offset[, length])
```

**引数**

- `s` — 部分文字列を計算する文字列。[文字列](../data-types/string.md)、[FixedString](../data-types/fixedstring.md) または [Enum](../data-types/enum.md)
- `offset` — `s` 内の部分文字列の開始位置。[(U)Int*](../data-types/int-uint.md)。
- `length` — 部分文字列の最大長。[(U)Int*](../data-types/int-uint.md)。省略可能。

**返される値**

インデックス `offset` から始まる `s` の部分文字列。

**実装の詳細**

有効なUTF-8エンコーディングされたテキストが含まれていると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**例**

```sql
SELECT 'Täglich grüßt das Murmeltier.' AS str,
       substringUTF8(str, 9),
       substringUTF8(str, 9, 5);
```

```response
Täglich grüßt das Murmeltier.	grüßt das Murmeltier.	grüßt
```

## substringIndex {#substringindex}

区切り文字 `delim` の `count` 回の出現の前に、文字列 `s` の部分文字列を返します。SparkやMySQLと同様です。

**構文**

```sql
substringIndex(s, delim, count)
```
エイリアス: `SUBSTRING_INDEX`

**引数**

- s — 部分文字列を抽出するための文字列。[文字列](../data-types/string.md)。
- delim — スプリットする文字。[文字列](../data-types/string.md)。
- count — 部分文字列を抽出する前にカウントする区切り文字の回数。count が正の場合は、最終区切り文字の左側にあるすべてのものが返されます（左からカウント）。count が負の場合は、最終区切り文字の右側にあるすべてのものが返されます（右からカウント）。[UInt または Int](../data-types/int-uint.md)

**例**

``` sql
SELECT substringIndex('www.clickhouse.com', '.', 2);
```

結果:
```sql
┌─substringIndex('www.clickhouse.com', '.', 2)─┐
│ www.clickhouse                               │
└──────────────────────────────────────────────┘
```

## substringIndexUTF8 {#substringindexutf8}

区切り文字 `delim` の `count` 回の出現の前に、文字列 `s` の部分文字列を返します。特にUnicodeコードポイント用です。

有効なUTF-8エンコーディングされたテキストが含まれていると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**構文**

```sql
substringIndexUTF8(s, delim, count)
```

**引数**

- `s` — 部分文字列を抽出するための文字列。[文字列](../data-types/string.md)。
- `delim` — スプリットする文字。[文字列](../data-types/string.md)。
- `count` — 部分文字列を抽出する前にカウントする区切り文字の回数。count が正の場合は、最終区切り文字の左側にあるすべてのものが返されます（左からカウント）。count が負の場合は、最終区切り文字の右側にあるすべてのものが返されます（右からカウント）。[UInt または Int](../data-types/int-uint.md)

**返される値**

区切り文字の `count` 回の出現の前に `s` の部分文字列。[文字列](../data-types/string.md)。

**実装の詳細**

有効なUTF-8エンコーディングされたテキストが含まれていると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義となります。

**例**

```sql
SELECT substringIndexUTF8('www.straßen-in-europa.de', '.', 2);
```

```response
www.straßen-in-europa
```

## appendTrailingCharIfAbsent {#appendtrailingcharifabsent}

文字列 `s` が非空で、かつ `s` の末尾に文字 `c` が存在しない場合、`c` を文字列 `s` に追加します。

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

"Bitcoin"アルphabetを使用して、[Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58)で文字列をエンコードします。

**構文**

```sql
base58Encode(plaintext)
```

**引数**

- `plaintext` — [文字列](../data-types/string.md)カラムまたは定数。

**返される値**

- 引数のエンコードされた値を含む文字列。[文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。

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

文字列を受け取り、"Bitcoin"アルファベットを使用して[Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58)エンコーディングスキームを使用してデコードします。

**構文**

```sql
base58Decode(encoded)
```

**引数**

- `encoded` — [文字列](../data-types/string.md)または[FixedString](../data-types/fixedstring.md)。文字列が有効なBase58エンコード値でない場合、例外がスローされます。

**返される値**

- 引数のデコードされた値を含む文字列。[文字列](../data-types/string.md)。

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

`base58Decode` と同様ですが、エラーの場合は空文字列を返します。

**構文**

```sql
tryBase58Decode(encoded)
```

**引数**

- `encoded`: [文字列](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。文字列が有効なBase58エンコード値でない場合、エラー時に空文字列を返します。

**返される値**

- 引数のデコードされた値を含む文字列。

**例**

クエリ:

```sql
SELECT tryBase58Decode('3dc8KtHrwM') as res, tryBase58Decode('invalid') as res_invalid;
```

```response
┌─res─────┬─res_invalid─┐
│ Encoded │             │
└─────────┴─────────────┘
```

## base64Encode {#base64encode}

[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4)に従って、文字列または固定文字列をbase64としてエンコードします。

エイリアス: `TO_BASE64`。

**構文**

```sql
base64Encode(plaintext)
```

**引数**

- `plaintext` — [文字列](../data-types/string.md)カラムまたは定数。

**返される値**

- 引数のエンコードされた値を含む文字列。

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

URL（文字列または固定文字列）をURL特有の修正を施してbase64としてエンコードします。 [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5)に従います。

**構文**

```sql
base64URLEncode(url)
```

**引数**

- `url` — [文字列](../data-types/string.md)カラムまたは定数。

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

文字列を受け取り、[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4) に従って base64 からデコードします。エラーが発生した場合は例外をスローします。

エイリアス: `FROM_BASE64`。

**構文**

```sql
base64Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) カラムまたは定数。文字列が有効な Base64 コード化値でない場合は、例外がスローされます。

**戻り値**

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

base64 コード化された URL を受け取り、[RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5) に従って URL 特有の修正を施した後、base64 からデコードします。エラーが発生した場合は例外をスローします。

**構文**

```sql
base64URLDecode(encodedUrl)
```

**引数**

- `encodedURL` — [String](../data-types/string.md) カラムまたは定数。文字列が URL 特有の修正を施された有効な Base64 コード化値でない場合は、例外がスローされます。

**戻り値**

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

`base64Decode` と同様ですが、エラーが発生した場合は空の文字列を返します。

**構文**

```sql
tryBase64Decode(encoded)
```

**引数**

- `encoded` — [String](../data-types/string.md) カラムまたは定数。文字列が有効な Base64 コード化値でない場合、空の文字列を返します。

**戻り値**

- 引数のデコードされた値を含む文字列。

**例**

クエリ:

```sql
SELECT tryBase64Decode('RW5jb2RlZA==') as res, tryBase64Decode('invalid') as res_invalid;
```

```response
┌─res────────┬─res_invalid─┐
│ clickhouse │             │
└────────────┴─────────────┘
```

## tryBase64URLDecode {#trybase64urldecode}

`base64URLDecode` と同様ですが、エラーが発生した場合は空の文字列を返します。

**構文**

```sql
tryBase64URLDecode(encodedUrl)
```

**引数**

- `encodedURL` — [String](../data-types/string.md) カラムまたは定数。有効な URL 特有の修正を施された Base64 コード化値でない場合は、空の文字列を返します。

**戻り値**

- 引数のデコードされた値を含む文字列。

**例**

クエリ:

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

文字列 `str` が `suffix` で終わるかどうかを返します。`endsWithUTF8` と `endsWith` の違いは、`endsWithUTF8` が `str` と `suffix` を UTF-8 文字でマッチさせる点です。

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

文字列 `str` が `prefix` で始まるかどうかを返します。`startsWithUTF8` と `startsWith` の違いは、`startsWithUTF8` が `str` と `suffix` を UTF-8 文字でマッチさせる点です。

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

指定された文字を文字列の先頭または末尾から削除します。特に指定がない場合は、関数は空白（ASCII 文字 32）を削除します。

**構文**

```sql
trim([[LEADING|TRAILING|BOTH] trim_character FROM] input_string)
```

**引数**

- `trim_character` — 削除する文字。 [String](../data-types/string.md)。
- `input_string` — トリミングする文字列。 [String](../data-types/string.md)。

**戻り値**

指定された先頭および/または末尾の文字がない文字列。 [String](../data-types/string.md)。

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

文字列の先頭から連続した空白（ASCII 文字 32）を削除します。

**構文**

```sql
trimLeft(input_string[, trim_characters])
```

エイリアス: `ltrim`。

**引数**

- `input_string` — トリムする文字列。 [String](../data-types/string.md)。
- `trim_characters` — 削除する文字。オプションです。 [String](../data-types/string.md)。指定がない場合は、 `' '`（単一の空白）がトリミング文字として使用されます。

**戻り値**

先頭の共通空白がない文字列。 [String](../data-types/string.md)。

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

文字列の末尾から連続した空白（ASCII 文字 32）を削除します。

**構文**

```sql
trimRight(input_string[, trim_characters])
```

エイリアス: `rtrim`。

**引数**

- `input_string` — トリムする文字列。 [String](../data-types/string.md)。
- `trim_characters` — 削除する文字。オプションです。 [String](../data-types/string.md)。指定がない場合は、 `' '`（単一の空白）がトリミング文字として使用されます。

**戻り値**

末尾の共通空白がない文字列。 [String](../data-types/string.md)。

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

文字列の両端から連続した空白（ASCII 文字 32）を削除します。

**構文**

```sql
trimBoth(input_string[, trim_characters])
```

エイリアス: `trim`。

**引数**

- `input_string` — トリムする文字列。 [String](../data-types/string.md)。
- `trim_characters` — 削除する文字。オプションです。 [String](../data-types/string.md)。指定がない場合は、 `' '`（単一の空白）がトリミング文字として使用されます。

**戻り値**

先頭および末尾の共通空白がない文字列。 [String](../data-types/string.md)。

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

文字列の CRC32 チェックサムを、CRC-32-IEEE 802.3 多項式と初期値 `0xffffffff`（zlib 実装）を使用して返します。

結果の型は UInt32 です。

## CRC32IEEE {#crc32ieee}

文字列の CRC32 チェックサムを、CRC-32-IEEE 802.3 多項式を使用して返します。

結果の型は UInt32 です。

## CRC64 {#crc64}

文字列の CRC64 チェックサムを、CRC-64-ECMA 多項式を使用して返します。

結果の型は UInt64 です。

## normalizeUTF8NFC {#normalizeutf8nfc}

文字列を [NFC 正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms) に変換します。文字列が有効な UTF8 コード化テキストであると仮定します。

**構文**

```sql
normalizeUTF8NFC(words)
```

**引数**

- `words` — UTF8 コード化された入力文字列。 [String](../data-types/string.md)。

**戻り値**

- NFC 正規化形式に変換された文字列。 [String](../data-types/string.md)。

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

文字列を [NFD 正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms) に変換します。文字列が有効な UTF8 コード化テキストであると仮定します。

**構文**

```sql
normalizeUTF8NFD(words)
```

**引数**

- `words` — UTF8 コード化された入力文字列。 [String](../data-types/string.md)。

**戻り値**

- NFD 正規化形式に変換された文字列。 [String](../data-types/string.md)。

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

文字列を [NFKC 正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms) に変換します。文字列が有効な UTF8 コード化テキストであると仮定します。

**構文**

```sql
normalizeUTF8NFKC(words)
```

**引数**

- `words` — UTF8 コード化された入力文字列。 [String](../data-types/string.md)。

**戻り値**

- NFKC 正規化形式に変換された文字列。 [String](../data-types/string.md)。

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

文字列を [NFKD 正規化形式](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms) に変換します。文字列が有効な UTF8 コード化テキストであると仮定します。

**構文**

```sql
normalizeUTF8NFKD(words)
```

**引数**

- `words` — UTF8 コード化された入力文字列。 [String](../data-types/string.md)。

**戻り値**

- NFKD 正規化形式に変換された文字列。 [String](../data-types/string.md)。

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

XML 内で特別な意味を持つ文字をエスケープし、その後 XML テキストノードや属性に挿入できるようにします。

置き換えられる文字は次のとおりです: `<`, `&`, `>`, `"`, `'`。
また、[XML および HTML の文字エンティティ参照のリスト](https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references)も参照してください。

**構文**

```sql
encodeXMLComponent(x)
```

**引数**

- `x` — 入力文字列。 [String](../data-types/string.md) 。

**戻り値**

- エスケープされた文字列。 [String](../data-types/string.md)。

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

XML 内で特別な意味を持つ部分文字列をエスケープ解除します。これらの部分文字列は次のとおりです: `&quot;` `&amp;` `&apos;` `&gt;` `&lt;`

この関数はまた、数値文字参照を Unicode 文字に置き換えます。10進数（`&#10003;` のように）および16進数（`&#x2713;` のように）の形式がサポートされています。

**構文**

```sql
decodeXMLComponent(x)
```

**引数**

- `x` — 入力文字列。 [String](../data-types/string.md)。

**戻り値**

- デコードされた文字列。 [String](../data-types/string.md)。

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

HTML 内で特別な意味を持つ部分文字列をエスケープ解除します。たとえば: `&hbar;` `&gt;` `&diamondsuit;` `&heartsuit;` `&lt;` など。

この関数はまた、数値文字参照を Unicode 文字に置き換えます。10進数（`&#10003;` のように）および16進数（`&#x2713;` のように）の形式がサポートされています。

**構文**

```sql
decodeHTMLComponent(x)
```

**引数**

- `x` — 入力文字列。 [String](../data-types/string.md)。

**戻り値**

- デコードされた文字列。 [String](../data-types/string.md)。

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

この関数は HTML または XHTML からプレーンテキストを抽出します。

完全に HTML、XML、または XHTML 仕様に準拠しているわけではありませんが、実装は合理的に正確で迅速です。ルールは次のとおりです：

1. コメントがスキップされます。例: `<!-- test -->`。コメントは `-->` で終了する必要があります。ネストされたコメントは許可されていません。
注意: `<!-->` や `<!--->` のような構文は HTML では有効なコメントではありませんが、他のルールによってスキップされます。
2. CDATA はそのまま追加されます。注意: CDATA は XML/XHTML 特有のもので、 "最善を尽くす" 基準で処理されます。
3. `script` および `style` 要素は、その内容ごと削除されます。注意: 閉じタグは内容の中に現れることができないと仮定されます。たとえば、JS の文字列リテラルは `<\/script>` のようにエスケープする必要があります。
注意: コメントや CDATA は `script` または `style` の中に可能性があるため、その中で閉じタグは検索されることはありません。例: `<script><![CDATA[</script>]]></script>`。ただし、コメント中ではまだ検索されます。時には複雑になります: `<script>var x = "<!--"; </script> var y = "-->"; alert(x + y);</script>`
注意: `script` や `style` は XML 名前空間の名前である場合、それらは通常の `script` や `style` 要素のように扱われません。例: `<script:a>Hello</script:a>`。
注意: 閉じタグ名の後に空白が存在することは可能ですが、前には存在しません: `</script >`。
4. 他のタグまたはタグのような要素は、内部コンテンツなしでスキップされます。例: `<a>.</a>`
注意: この HTML は不正であると予想されます: `<a test=">"></a>`
注意: それはまた、タグのようなものをスキップします: `<>`, `<!>` など。
注意: 終わらないタグは入力の終わりまでスキップされます: `<hello   `
5. HTML および XML エンティティはデコードされません。これらは別の関数で処理する必要があります。
6. テキスト内の空白は特定のルールによって圧縮または挿入されます。
    - 最初と最後の空白は削除されます。
    - 連続する空白は圧縮されます。
    - ただし、テキストが他の要素によって区切られ、それに空白がない場合は、空白が挿入されます。
    - これにより不自然な例が発生する可能性があります: `Hello<b>world</b>`、`Hello<!-- -->world` - HTML 内に空白はありませんが、関数はこれを挿入します。また次のことも考慮してください `Hello<p>world</p>`、`Hello<br>world`。この動作はデータ分析にとって合理的であり、たとえば HTML を単語の束に変換するためです。
7. また、空白の正しい処理には `<pre></pre>` と CSS の `display` および `white-space` プロパティのサポートが必要です。

**構文**

```sql
extractTextFromHTML(x)
```

**引数**

- `x` — 入力テキスト。 [String](../data-types/string.md)。

**戻り値**

- 抽出されたテキスト。 [String](../data-types/string.md)。

**例**

最初の例には、いくつかのタグとコメントが含まれており、空白処理も示しています。2 番目の例は CDATA と script タグの処理を示しています。3 番目の例では、[url](../../sql-reference/table-functions/url.md) 関数から受け取ったフル HTML レスポンスからテキストが抽出されます。

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

文字列 `s` の最初の文字の ASCII コードポイント (Int32 型) を返します。

`s` が空の場合、結果は 0 です。最初の文字が ASCII 文字でない場合や、UTF-16 の Latin-1 補助範囲の一部でない場合、結果は未定義です。

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

- `val` — 入力値。 [String](../data-types/string.md)

**戻り値**

- 入力値の Soundex コード。 [String](../data-types/string.md)

**例**

```sql
select soundex('aksel');
```

結果:

```result
┌─soundex('aksel')─┐
│ A240             │
└──────────────────┘
```

## punycodeEncode {#punycodeencode}

文字列の [Punycode](https://en.wikipedia.org/wiki/Punycode) 表現を返します。
文字列は UTF8 コード化されている必要があります。そうでない場合、動作は未定義です。

**構文**

```sql
punycodeEncode(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**戻り値**

- 入力値の Punycode 表現。 [String](../data-types/string.md)

**例**

```sql
select punycodeEncode('München');
```

結果:

```result
┌─punycodeEncode('München')─┐
│ Mnchen-3ya                │
└───────────────────────────┘
```

## punycodeDecode {#punycodedecode}

[Punycode](https://en.wikipedia.org/wiki/Punycode) コード化された文字列の UTF8 コード化されたプレーンテキストを返します。
有効な Punycode コード化文字列が与えられない場合、例外がスローされます。

**構文**

```sql
punycodeEncode(val)
```

**引数**

- `val` — Punycode コード化文字列。 [String](../data-types/string.md)

**戻り値**

- 入力値のプレーンテキスト。 [String](../data-types/string.md)

**例**

```sql
select punycodeDecode('Mnchen-3ya');
```

結果:

```result
┌─punycodeDecode('Mnchen-3ya')─┐
│ München                      │
└──────────────────────────────┘
```

## tryPunycodeDecode {#trypunycodedecode}

`punycodeDecode` と同様ですが、有効な Punycode コード化文字列が与えられない場合は空の文字列を返します。

## idnaEncode {#idnaencode}

[国際化ドメイン名のアプリケーションにおける国際化](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA) メカニズムに従って、ドメイン名の ASCII 表現 (ToASCII アルゴリズム) を返します。
入力文字列は UTF コード化されている必要があり、ASCII 文字列に変換可能である必要があります。そうでない場合は、例外がスローされます。
注意: パーセントデコードやタブ、スペース、制御文字のトリミングは行われません。

**構文**

```sql
idnaEncode(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**戻り値**

- 入力値の IDNA メカニズムに従った ASCII 表現。 [String](../data-types/string.md)

**例**

```sql
select idnaEncode('straße.münchen.de');
```

結果:

```result
┌─idnaEncode('straße.münchen.de')─────┐
│ xn--strae-oqa.xn--mnchen-3ya.de     │
└─────────────────────────────────────┘
```

## tryIdnaEncode {#tryidnaencode}

`idnaEncode` と同様ですが、エラーが発生した場合は例外をスローするのではなく空の文字列を返します。

## idnaDecode {#idnadecode}

[国際化ドメイン名のアプリケーションにおける国際化](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA) メカニズムに従って、ドメイン名の Unicode (UTF-8) 表現 (ToUnicode アルゴリズム) を返します。
エラーが発生した場合（たとえば、入力が無効であるため）、入力文字列が返されます。
`idnaEncode()` および `idnaDecode()` を繰り返し適用すると、大文字小文字の正規化のために元の文字列が必ずしも返されないことに注意してください。

**構文**

```sql
idnaDecode(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)

**戻り値**

- 入力値の IDNA メカニズムに従った Unicode (UTF-8) 表現。 [String](../data-types/string.md)

**例**

```sql
select idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de');
```

結果:

```result
┌─idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de')─┐
│ straße.münchen.de                             │
└───────────────────────────────────────────────┘
```

## byteHammingDistance {#bytehammingdistance}

2 つのバイト列の [ハミング距離](https://en.wikipedia.org/wiki/Hamming_distance) を計算します。

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

2 つのバイト列の [ジャッカード類似性指数](https://en.wikipedia.org/wiki/Jaccard_index) を計算します。

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

[stringJaccardIndex](#stringjaccardindex) と同様ですが、UTF8 コード化された文字列のために使用します。

## editDistance {#editdistance}

2 つのバイト列の [編集距離](https://en.wikipedia.org/wiki/Edit_distance) を計算します。

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

2 つの UTF8 文字列の [編集距離](https://en.wikipedia.org/wiki/Edit_distance) を計算します。

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

2 つのバイト列の [ダメロー・レーヴェンシュタイン距離](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance) を計算します。

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

2 つのバイト列の [ジャロ類似性](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro_similarity) を計算します。

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

2 つのバイト列の [ジャロ・ウィンクラー類似性](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro%E2%80%93Winkler_similarity) を計算します。

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

各単語の最初の文字を大文字にし、残りを小文字に変換します。単語は、非アルファベット文字で区切られた英数字の文字のシーケンスです。

:::note
`initCap` は各単語の最初の文字のみを大文字に変換するため、アポストロフィや大文字を含む単語について予期しない動作が見られる場合があります。たとえば：

```sql
SELECT initCap('mother''s daughter'), initCap('joe McAdam');
```

は次のように返されます

```response
┌─initCap('mother\'s daughter')─┬─initCap('joe McAdam')─┐
│ Mother'S Daughter             │ Joe Mcadam            │
└───────────────────────────────┴───────────────────────┘
```

これは既知の動作であり、現在修正する計画はありません。
:::

**構文**

```sql
initcap(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)。

**戻り値**

- 各単語の最初の文字が大文字に変換された `val`。 [String](../data-types/string.md)。

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

[initcap](#initcap) と同様に、`initcapUTF8` は各単語の最初の文字を大文字にし、残りを小文字にします。文字列が有効な UTF-8 コード化テキストであると仮定します。
この仮定が破られた場合、例外はスローされず、結果は未定義です。

:::note
この関数は言語を検出しないため、たとえばトルコ語の場合、結果が正確でない場合があります（i/İ と i/I）。
UTF-8 バイトシーケンスの大文字と小文字での長さが異なる場合、そのコードポイントに対する結果が不正確になることがあります。
:::

**構文**

```sql
initcapUTF8(val)
```

**引数**

- `val` — 入力値。 [String](../data-types/string.md)。

**戻り値**

- 各単語の最初の文字が大文字に変換された `val`。 [String](../data-types/string.md)。

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

- 入力値の最初の行、または改行区切りが存在しない場合は全体の値。 [String](../data-types/string.md)

**例**

```sql
select firstLine('foo\nbar\nbaz');
```

結果:

```result
┌─firstLine('foo\nbar\nbaz')─┐
│ foo                        │
└────────────────────────────┘
```

## stringCompare {#stringcompare}

2 つの文字列を辞書式に比較します。

**構文**

```sql
stringCompare(string1, string2[, str1_off, string2_offset, num_bytes]);
```

**引数**

- `string1` — 比較する最初の文字列。 [String](../data-types/string.md)
- `string2` - 比較する2 番目の文字列。[String](../data-types/string.md)
- `string1_offset` — `string1` で比較を開始する位置（ゼロベース）。オプション、正の数。
- `string2_offset` — `string2` で比較を開始する位置（ゼロベースのインデックス）。オプション、正の数。
- `num_bytes` — 両方の文字列で比較する最大バイト数。`string_offset` + `num_bytes` が入力文字列の終わりを超えた場合、`num_bytes` はそれに応じて減少します。

**戻り値**

- -1 — `string1`[`string1_offset`: `string1_offset` + `num_bytes`] < `string2`[`string2_offset`:`string2_offset` + `num_bytes`] および `string1_offset` < len(`string1`) および `string2_offset` < len(`string2`) の場合。
`string1_offset` >= len(`string1`) および `string2_offset` < len(`string2`) の場合。
- 0 — `string1`[`string1_offset`: `string1_offset` + `num_bytes`] = `string2`[`string2_offset`:`string2_offset` + `num_bytes`] および `string1_offset` < len(`string1`) および `string2_offset` < len(`string2`) の場合。
`string1_offset` >= len(`string1`) および `string2_offset` >= len(`string2`) の場合。
- 1 — `string1`[`string1_offset`: `string1_offset` + `num_bytes`] > `string2`[`string2_offset`:`string2_offset` + `num_bytes`] および `string1_offset` < len(`string1`) および `string2_offset` < len(`string2`) の場合。
`string1_offset` < len(`string1`) および `string2_offset` >= len(`string2`) の場合。

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
