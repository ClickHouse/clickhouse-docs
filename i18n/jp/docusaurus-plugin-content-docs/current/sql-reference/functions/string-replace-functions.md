---
'description': 'Functions for Replacing in Strings のドキュメント'
'sidebar_label': '文字列置換'
'slug': '/sql-reference/functions/string-replace-functions'
'title': '文字列内の置換機能'
'doc_type': 'reference'
---


# 文字列の置換に関する関数

[一般的な文字列関数](string-functions.md)と[文字列内の検索関数](string-search-functions.md)は別々に説明されています。

## overlay {#overlay}

文字列 `input` の一部を別の文字列 `replace` で置換します。置換は1から始まるインデックス `offset` から行います。

**構文**

```sql
overlay(s, replace, offset[, length])
```

**パラメータ**

- `s`: 文字列型 [String](../data-types/string.md)。
- `replace`: 文字列型 [String](../data-types/string.md)。
- `offset`: 整数型 [Int](../data-types/int-uint.md) (1から始まる)。もし `offset` が負の場合、文字列 `s` の末尾から数えます。
- `length`: 任意。整数型 [Int](../data-types/int-uint.md)。`length` は、入力文字列 `s` 内で置換されるスニペットの長さを指定します。`length` が指定されていない場合、`s` から削除されるバイト数は `replace` の長さに等しくなり、それ以外の場合は `length` バイトが削除されます。

**返される値**

- [String](../data-types/string.md) データ型の値。

**例**

```sql
SELECT overlay('My father is from Mexico.', 'mother', 4) AS res;
```

結果:

```text
┌─res──────────────────────┐
│ My mother is from Mexico.│
└──────────────────────────┘
```

```sql
SELECT overlay('My father is from Mexico.', 'dad', 4, 6) AS res;
```

結果:

```text
┌─res───────────────────┐
│ My dad is from Mexico.│
└───────────────────────┘
```

## overlayUTF8 {#overlayutf8}

文字列 `input` の一部を別の文字列 `replace` で置換します。置換は1から始まるインデックス `offset` から行います。

文字列が有効なUTF-8エンコードされたテキストであると仮定します。この仮定が破られた場合、例外はスローされず、結果は未定義です。

**構文**

```sql
overlayUTF8(s, replace, offset[, length])
```

**パラメータ**

- `s`: 文字列型 [String](../data-types/string.md)。
- `replace`: 文字列型 [String](../data-types/string.md)。
- `offset`: 整数型 [Int](../data-types/int-uint.md) (1から始まる)。もし `offset` が負の場合、入力文字列 `s` の末尾から数えます。
- `length`: 任意。整数型 [Int](../data-types/int-uint.md)。`length` は、入力文字列 `s` 内で置換されるスニペットの長さを指定します。`length` が指定されていない場合、`s` から削除される文字数は `replace` の長さに等しくなり、それ以外の場合は `length` 文字が削除されます。

**返される値**

- [String](../data-types/string.md) データ型の値。

**例**

```sql
SELECT overlay('Mein Vater ist aus Österreich.', 'der Türkei', 20) AS res;
```

結果:

```text
┌─res───────────────────────────┐
│ Mein Vater ist aus der Türkei.│
└───────────────────────────────┘
```

## replaceOne {#replaceone}

文字列 `haystack` の中の部分文字列 `pattern` の最初の出現を `replacement` 文字列で置き換えます。

**構文**

```sql
replaceOne(haystack, pattern, replacement)
```

## replaceAll {#replaceall}

文字列 `haystack` の中の部分文字列 `pattern` のすべての出現を `replacement` 文字列で置き換えます。

**構文**

```sql
replaceAll(haystack, pattern, replacement)
```

エイリアス: `replace`。

## replaceRegexpOne {#replaceregexpone}

正規表現 `pattern` に一致する部分文字列の最初の出現を `replacement` 文字列で置き換えます（[re2構文](https://github.com/google/re2/wiki/Syntax)に従う）。

`replacement` には `\0-\9` の置換が含まれます。
置換 `\1-\9` は1番目から9番目のキャプチャグループ（サブマッチ）に対応し、置換 `\0` は全体の一致に対応します。

`pattern` または `replacement` 文字列内でそのままの `\` 文字を使用するには、エスケープする必要があります。
また、文字列リテラルでは追加のエスケープが必要であることに注意してください。

**構文**

```sql
replaceRegexpOne(haystack, pattern, replacement)
```

**例**

ISO日付をアメリカ形式に変換：

```sql
SELECT DISTINCT
    EventDate,
    replaceRegexpOne(toString(EventDate), '(\\d{4})-(\\d{2})-(\\d{2})', '\\2/\\3/\\1') AS res
FROM test.hits
LIMIT 7
FORMAT TabSeparated
```

結果:

```text
2014-03-17      03/17/2014
2014-03-18      03/18/2014
2014-03-19      03/19/2014
2014-03-20      03/20/2014
2014-03-21      03/21/2014
2014-03-22      03/22/2014
2014-03-23      03/23/2014
```

文字列を10回コピー：

```sql
SELECT replaceRegexpOne('Hello, World!', '.*', '\\0\\0\\0\\0\\0\\0\\0\\0\\0\\0') AS res
```

結果:

```text
┌─res────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World! │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## replaceRegexpAll {#replaceregexpall}

`replaceRegexpOne` と同様ですが、パターンのすべての出現を置き換えます。

エイリアス: `REGEXP_REPLACE`。

**例**

```sql
SELECT replaceRegexpAll('Hello, World!', '.', '\\0\\0') AS res
```

結果:

```text
┌─res────────────────────────┐
│ HHeelllloo,,  WWoorrlldd!! │
└────────────────────────────┘
```

例外として、正規表現が空の部分文字列に作用した場合、置換は一度だけ行われます。例：

```sql
SELECT replaceRegexpAll('Hello, World!', '^', 'here: ') AS res
```

結果:

```text
┌─res─────────────────┐
│ here: Hello, World! │
└─────────────────────┘
```

## regexpQuoteMeta {#regexpquotemeta}

正規表現で特別な意味を持つこれらの文字の前にバックスラッシュを追加します: `\0`, `\\`, `|`, `(`, `)`, `^`, `$`, `.`, `[`, `]`, `?`, `*`, `+`, `{`, `:`, `-`。

この実装は re2::RE2::QuoteMeta とは若干異なります。ゼロバイトを `\0` としてエスケープし、必要な文字のみをエスケープします。
詳細については、[RE2](https://github.com/google/re2/blob/master/re2/re2.cc#L473)を参照してください。

**構文**

```sql
regexpQuoteMeta(s)
```

## format {#format}

`pattern` 文字列を、引数にリストされている値（文字列、整数など）でフォーマットします。Pythonでのフォーマットに似ています。パターン文字列には、中括弧 `{}` に囲まれた置換フィールドを含めることができます。中括弧に含まれていないものはリテラルテキストと見なされ、そのまま出力にコピーされます。リテラルの中括弧文字は、二重中括弧でエスケープできます: `{{ '{{' }}` および `{{ '}}' }}`。フィールド名は数字（ゼロから始まる）または空であり（その場合、省略されると単調に増加する数字が与えられます）。

**構文**

```sql
format(pattern, s0, s1, ...)
```

**例**

```sql
SELECT format('{1} {0} {1}', 'World', 'Hello')
```

```result
┌─format('{1} {0} {1}', 'World', 'Hello')─┐
│ Hello World Hello                       │
└─────────────────────────────────────────┘
```

暗黙の数字の場合:

```sql
SELECT format('{} {}', 'Hello', 'World')
```

```result
┌─format('{} {}', 'Hello', 'World')─┐
│ Hello World                       │
└───────────────────────────────────┘
```

## translate {#translate}

文字列 `s` 内の文字を、文字列 `from` と `to` で定義された1対1の文字マッピングを使用して置き換えます。
`from` と `to` は定数ASCII文字列でなければなりません。
`from` と `to` のサイズが等しい場合、`s` 内の `first` の1番目の文字の各出現は `to` の1番目の文字に置き換えられ、`s` 内の `first` の2番目の文字は `to` の2番目の文字に置き換えられます。
`from` に `to` よりも多くの文字が含まれている場合、`to` に対応する文字がない `from` の末尾の文字のすべての出現が `s` から削除されます。
`s` 内の非ASCII文字はこの関数で変更されません。

**構文**

```sql
translate(s, from, to)
```

**例**

```sql
SELECT translate('Hello, World!', 'delor', 'DELOR') AS res
```

結果:

```text
┌─res───────────┐
│ HELLO, WORLD! │
└───────────────┘
```

`from` と `to` の引数の長さが異なる場合:

```sql
SELECT translate('clickhouse', 'clickhouse', 'CLICK') AS res
```

結果:

```text
┌─res───┐
│ CLICK │
└───────┘
```

## translateUTF8 {#translateutf8}

[translate](#translate) と同様ですが、`s`、`from` および `to` はUTF-8エンコードされた文字列であると仮定します。

**構文**

```sql
translateUTF8(s, from, to)
```

**パラメータ**

- `s`: 文字列型 [String](../data-types/string.md)。
- `from`: 文字列型 [String](../data-types/string.md)。
- `to`: 文字列型 [String](../data-types/string.md)。

**返される値**

- [String](../data-types/string.md) データ型の値。

**例**

クエリ:

```sql
SELECT translateUTF8('Münchener Straße', 'üß', 'us') AS res;
```

```response
┌─res──────────────┐
│ Munchener Strase │
└──────────────────┘
```

## printf {#printf}

`printf` 関数は、C++のprintf関数に似た形で、引数にリストされている値（文字列、整数、浮動小数点数など）で指定された文字列をフォーマットします。フォーマット文字列は `%` 文字で始まるフォーマット指定子を含むことができます。 `%` とその後のフォーマット指定子に含まれないものはリテラルテキストと見なされ、そのまま出力にコピーされます。リテラルの `%` 文字は `%%` でエスケープできます。

**構文**

```sql
printf(format, arg1, arg2, ...)
```

**例**

クエリ:

```sql
SELECT printf('%%%s %s %d', 'Hello', 'World', 2024);
```
```response
┌─printf('%%%s %s %d', 'Hello', 'World', 2024)─┐
│ %Hello World 2024                            │
└──────────────────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
