---
slug: /sql-reference/functions/string-replace-functions
sidebar_position: 150
sidebar_label: 文字列置換関数
---


# 文字列置換のための関数

[一般の文字列関数](string-functions.md) と [文字列中を検索するための関数](string-search-functions.md) は別途説明されています。

## overlay {#overlay}

文字列 `input` の一部を別の文字列 `replace` で置換します。1ベースのインデックス `offset` から開始します。

**構文**

```sql
overlay(s, replace, offset[, length])
```

**パラメータ**

- `s`: 文字列型 [String](../data-types/string.md)。
- `replace`: 文字列型 [String](../data-types/string.md)。
- `offset`: 整数型 [Int](../data-types/int-uint.md) (1ベース)。`offset` が負の場合、文字列 `s` の末尾からカウントされます。
- `length`: オプション。整数型 [Int](../data-types/int-uint.md)。`length` は入力文字列 `s` 内で置換されるスニペットの長さを指定します。`length` が指定されていない場合、`s` から削除されるバイト数は `replace` の長さに等しくなります。それ以外の場合、`length` バイトが削除されます。

**戻り値**

- [String](../data-types/string.md) 型の値。

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

文字列 `input` の一部を別の文字列 `replace` で置換します。1ベースのインデックス `offset` から開始します。

この関数は、文字列が有効なUTF-8エンコードされたテキストを含むと仮定します。
この仮定が破られた場合、例外はスローされず、結果は未定義です。

**構文**

```sql
overlayUTF8(s, replace, offset[, length])
```

**パラメータ**

- `s`: 文字列型 [String](../data-types/string.md)。
- `replace`: 文字列型 [String](../data-types/string.md)。
- `offset`: 整数型 [Int](../data-types/int-uint.md) (1ベース)。`offset` が負の場合、入力文字列 `s` の末尾からカウントされます。
- `length`: オプション。整数型 [Int](../data-types/int-uint.md)。`length` は入力文字列 `s` 内で置換されるスニペットの長さを指定します。`length` が指定されていない場合、`s` から削除される文字数は `replace` の長さに等しくなります。それ以外の場合、`length` 文字が削除されます。

**戻り値**

- [String](../data-types/string.md) 型の値。

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

`haystack` 内の最初の `pattern` の出現を `replacement` 文字列で置換します。

**構文**

```sql
replaceOne(haystack, pattern, replacement)
```

## replaceAll {#replaceall}

`haystack` 内のすべての `pattern` の出現を `replacement` 文字列で置換します。

**構文**

```sql
replaceAll(haystack, pattern, replacement)
```

エイリアス: `replace`。

## replaceRegexpOne {#replaceregexpone}

`haystack` 内の正規表現 `pattern` に一致する最初の出現を `replacement` 文字列で置換します。

`replacement` には置換 `\0-\9` を含めることができます。
置換 `\1-\9` は最初から第9キャプチャグループ（部分一致）に対応し、置換 `\0` は全体の一致に対応します。

`pattern` または `replacement` 文字列でそのまま `\` キャラクタを使用する場合、エスケープするために `\` を使用します。
文字列リテラルには追加のエスケープが必要であることに注意してください。

**構文**

```sql
replaceRegexpOne(haystack, pattern, replacement)
```

**例**

ISO日付をアメリカ形式に変換:

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

文字列を10回コピー:

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

`replaceRegexpOne` と同様ですが、パターンのすべての出現を置換します。

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

例外として、正規表現が空の部分文字列に作用した場合、置換は1回以上行われません。例えば:

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

正規表現で特別な意味を持つ以下の文字の前にバックスラッシュを追加します: `\0`, `\\`, `|`, `(`, `)`, `^`, `$`, `.`, `[`, `]`, `?`, `*`, `+`, `{`, `:`, `-`。

この実装は、re2::RE2::QuoteMeta とは若干異なります。ゼロバイトを `\0` でエスケープし、必要な文字のみをエスケープします。
詳細については、[RE2](https://github.com/google/re2/blob/master/re2/re2.cc#L473) を参照してください。

**構文**

```sql
regexpQuoteMeta(s)
```

## format {#format}

`pattern` 文字列を、引数にリストされた値（文字列、整数など）でフォーマットし、Python のフォーマットに似ています。パターン文字列には、中括弧 `{}` で囲まれた置換フィールドを含めることができます。中括弧に含まれていないものはすべてリテラルテキストと見なされ、出力にそのままコピーされます。リテラルの中括弧文字は二重中括弧でエスケープできます: `{{ '{{' }}` と `{{ '}}' }}`。フィールド名は数字（0から開始）または空のもの（その場合、自動的に単調増加する数字が与えられます）を使用できます。

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

暗黙の数字を使用した場合:

```sql
SELECT format('{} {}', 'Hello', 'World')
```

```result
┌─format('{} {}', 'Hello', 'World')─┐
│ Hello World                       │
└───────────────────────────────────┘
```

## translate {#translate}

文字列 `s` 内の文字を、`from` と `to` 文字列によって定義された1対1の文字マッピングを使用して置換します。
`from` と `to` は定数のASCII文字列でなければなりません。
`from` と `to` のサイズが等しい場合、`s` 内の最初の `first` の1文字目の出現は `to` の1文字目に置き換えられ、`first` の2文字目の出現は `to` の2文字目に置き換えられます。  
もし `from` に `to` よりも多くの文字が含まれている場合、`to` に対応する文字がない `from` の末尾のすべての文字の出現が `s` から削除されます。  
`s` 内の非ASCII文字はこの関数によって変更されません。

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

`from` と `to` の引数が異なる長さの場合:

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

[translate](#translate) と同様ですが、`s`、`from`、`to` は UTF-8 コードされた文字列であると仮定します。

**構文**

```sql
translateUTF8(s, from, to)
```

**パラメータ**

- `s`: 文字列型 [String](../data-types/string.md)。
- `from`: 文字列型 [String](../data-types/string.md)。
- `to`: 文字列型 [String](../data-types/string.md)。

**戻り値**

- [String](../data-types/string.md) 型の値。

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

`printf` 関数は、引数にリストされた値（文字列、整数、浮動小数点数など）で指定された文字列をフォーマットします。C++ の printf 関数に似ています。フォーマット文字列には `%` 文字で始まるフォーマット指定子を含めることができます。 `%` とその後のフォーマット指定子に含まれないものはすべてリテラルテキストと見なされ、出力にそのままコピーされます。リテラルの `%` 文字は `%%` でエスケープできます。

**構文**

```sql
printf(format, arg1, arg2, ...)
```

**例**

クエリ:

```sql
select printf('%%%s %s %d', 'Hello', 'World', 2024);
```

```response
┌─printf('%%%s %s %d', 'Hello', 'World', 2024)─┐
│ %Hello World 2024                            │
└──────────────────────────────────────────────┘
```
