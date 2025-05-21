---
description: '文字列を分割するための関数に関するドキュメント'
sidebar_label: '文字列の分割'
sidebar_position: 165
slug: /sql-reference/functions/splitting-merging-functions
title: '文字列を分割するための関数'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# 文字列を分割するための関数

## splitByChar {#splitbychar}

指定された文字で区切られた部分文字列に文字列を分割します。正確に1文字から成る定数文字列 `separator` を使用します。
選択された部分文字列の配列を返します。区切り文字が文字列の先頭または末尾に現れる場合や、連続して複数の区切り文字がある場合、空の部分文字列が選択されることがあります。

**構文**

```sql
splitByChar(separator, s[, max_substrings])
```

**引数**

- `separator` — 区切り文字は単一バイトの文字である必要があります。[String](../data-types/string.md).
- `s` — 分割する文字列。[String](../data-types/string.md).
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される配列には最大で `max_substrings` の部分文字列が含まれ、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md)).

 空の部分文字列が選択される場合：

- 区切り文字が文字列の先頭または末尾に現れるとき；
- 連続して複数の区切り文字があるとき；
- 元の文字列 `s` が空のとき。

:::note
パラメータ `max_substrings` の動作は ClickHouse v22.11 から変更されました。それより古いバージョンでは、`max_substrings` > 0 は `max_substring` 回の分割が行われ、文字列の残りがリストの最後の要素として返されることを意味しました。
例えば、
- v22.10 では: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b','c=d']` を返しました。
- v22.11 では: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b']` を返しました。

ClickHouse の v22.11 より前の動作に似た動作は、[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することで達成できます。
`SELECT splitByChar('=', 'a=b=c=d', 2) SETTINGS splitby_max_substrings_includes_remaining_string = 1 -- ['a', 'b=c=d']`
:::

**例**

```sql
SELECT splitByChar(',', '1,2,3,abcde');
```

結果:

```text
┌─splitByChar(',', '1,2,3,abcde')─┐
│ ['1','2','3','abcde']           │
└─────────────────────────────────┘
```

## splitByString {#splitbystring}

文字列を文字列で区切られた部分文字列に分割します。複数の文字から成る定数文字列 `separator` を区切りとして使用します。 `separator` が空の場合は、文字列 `s` を単一の文字の配列に分割します。

**構文**

```sql
splitByString(separator, s[, max_substrings])
```

**引数**

- `separator` — 区切り文字。[String](../data-types/string.md).
- `s` — 分割する文字列。[String](../data-types/string.md).
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` 個になります。それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md)).

空の部分文字列が選択される場合：

- 非空の区切り文字が文字列の先頭または末尾に現れるとき；
- 複数の連続した非空の区切り文字があるとき；
- 元の文字列 `s` が空のとき、区切り文字が空でない場合。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) の設定（デフォルト: 0）は、引数 `max_substrings` > 0 の場合に結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。
:::

**例**

```sql
SELECT splitByString(', ', '1, 2 3, 4,5, abcde');
```

結果:

```text
┌─splitByString(', ', '1, 2 3, 4,5, abcde')─┐
│ ['1','2 3','4,5','abcde']                 │
└───────────────────────────────────────────┘
```

```sql
SELECT splitByString('', 'abcde');
```

結果:

```text
┌─splitByString('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByRegexp {#splitbyregexp}

正規表現で区切られた部分文字列に文字列を分割します。`regexp` として正規表現の文字列を区切りとして使用します。`regexp` が空の場合は、文字列 `s` を単一の文字の配列に分割します。この正規表現に対する一致が見つからない場合、文字列 `s` は分割されません。

**構文**

```sql
splitByRegexp(regexp, s[, max_substrings])
```

**引数**

- `regexp` — 正規表現。定数。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md).
- `s` — 分割する文字列。[String](../data-types/string.md).
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` 個、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md)).

空の部分文字列が選択される場合：

- 非空の正規表現一致が文字列の先頭または末尾に現れるとき；
- 複数の連続した非空の正規表現一致があるとき；
- 元の文字列 `s` が空のとき、正規表現が空でない場合。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) の設定（デフォルト: 0）は、引数 `max_substrings` > 0 の場合に結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。
:::

**例**

```sql
SELECT splitByRegexp('\\d+', 'a12bc23de345f');
```

結果:

```text
┌─splitByRegexp('\\d+', 'a12bc23de345f')─┐
│ ['a','bc','de','f']                    │
└────────────────────────────────────────┘
```

```sql
SELECT splitByRegexp('', 'abcde');
```

結果:

```text
┌─splitByRegexp('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByWhitespace {#splitbywhitespace}

ホワイトスペース文字で区切られた部分文字列に文字列を分割します。 
選択された部分文字列の配列を返します。

**構文**

```sql
splitByWhitespace(s[, max_substrings])
```

**引数**

- `s` — 分割する文字列。[String](../data-types/string.md).
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` 個、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md)).
 
:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) の設定（デフォルト: 0）は、引数 `max_substrings` > 0 の場合に結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。
:::

**例**

```sql
SELECT splitByWhitespace('  1!  a,  b.  ');
```

結果:

```text
┌─splitByWhitespace('  1!  a,  b.  ')─┐
│ ['1!','a,','b.']                    │
└─────────────────────────────────────┘
```

## splitByNonAlpha {#splitbynonalpha}

ホワイトスペースおよび句読点文字で区切られた部分文字列に文字列を分割します。 
選択された部分文字列の配列を返します。

**構文**

```sql
splitByNonAlpha(s[, max_substrings])
```

**引数**

- `s` — 分割する文字列。[String](../data-types/string.md).
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` 個、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) の設定（デフォルト: 0）は、引数 `max_substrings` > 0 の場合に結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。
:::

**例**

```sql
SELECT splitByNonAlpha('  1!  a,  b.  ');
```

```text
┌─splitByNonAlpha('  1!  a,  b.  ')─┐
│ ['1','a','b']                     │
└───────────────────────────────────┘
```

## arrayStringConcat {#arraystringconcat}

配列にリストされた値の文字列表現を区切り文字で連結します。 `separator` はオプションのパラメーターで、デフォルトは空の文字列に設定されています。
文字列を返します。

**構文**

```sql
arrayStringConcat(arr[, separator])
```

**例**

```sql
SELECT arrayStringConcat(['12/05/2021', '12:50:00'], ' ') AS DateString;
```

結果:

```text
┌─DateString──────────┐
│ 12/05/2021 12:50:00 │
└─────────────────────┘
```

## alphaTokens {#alphatokens}

範囲 a-z および A-Z からの連続したバイトの部分文字列を選択します。選択された部分文字列の配列を返します。

**構文**

```sql
alphaTokens(s[, max_substrings])
```

エイリアス: `splitByAlpha`

**引数**

- `s` — 分割する文字列。[String](../data-types/string.md).
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` 個、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) の設定（デフォルト: 0）は、引数 `max_substrings` > 0 の場合に結果配列の最後の要素に残りの文字列を含めるかどうかを制御します。
:::

**例**

```sql
SELECT alphaTokens('abca1abc');
```

```text
┌─alphaTokens('abca1abc')─┐
│ ['abca','abc']          │
└─────────────────────────┘
```

## extractAllGroups {#extractallgroups}

正規表現によって一致した非重複部分文字列からすべてのグループを抽出します。

**構文**

```sql
extractAllGroups(text, regexp)
```

**引数**

- `text` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md).
- `regexp` — 正規表現。定数。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md).

**返される値**

- この関数が少なくとも1つの一致したグループを見つけた場合、グループ ID でクラスター化された `Array(Array(String))` 列を返します（1 から N、ここで N は `regexp` のキャプチャグループの数）。一致するグループがない場合、空の配列を返します。[Array](../data-types/array.md).

**例**

```sql
SELECT extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果:

```text
┌─extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','123'],['8','"hkl"']]                                         │
└───────────────────────────────────────────────────────────────────────┘
```

## ngrams {#ngrams}

<DeprecatedBadge/>

UTF-8 文字列を `ngramsize` シンボルの n-grams に分割します。
この関数は廃止予定です。将来的には [tokens](#tokens) の `ngram` トークナイザを使用することを推奨します。
この関数は将来的に削除される可能性があります。

**構文**

```sql
ngrams(string, ngramsize)
```

**引数**

- `string` — 文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md).
- `ngramsize` — n-gram のサイズ。[UInt](../data-types/int-uint.md).

**返される値**

- n-grams の配列。[Array](../data-types/array.md)([String](../data-types/string.md)).

**例**

```sql
SELECT ngrams('ClickHouse', 3);
```

結果:

```text
┌─ngrams('ClickHouse', 3)───────────────────────────┐
│ ['Cli','lic','ick','ckH','kHo','Hou','ous','use'] │
└───────────────────────────────────────────────────┘
```

## tokens {#tokens}

トークナイザを使用して文字列をトークンに分割します。
デフォルトのトークナイザは非アルファベットの ASCII 文字を区切りとして使用します。

**引数**

- `value` — 入力文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md).
- `tokenizer` — 使用するトークナイザ。有効な引数は `default`、`ngram`、および `noop` です。オプションであり、明示的に設定されていない場合はデフォルトで `default` に設定されます。[const String](../data-types/string.md)
- `ngrams` — 引数 `tokenizer` が `ngram` の場合のみに関連します：オプションのパラメーターで、ngram の長さを定義します。明示的に設定されない場合はデフォルトで `3` に設定されます。[UInt8](../data-types/int-uint.md).

**返される値**

- 入力文字列から得られるトークンの配列。[Array](../data-types/array.md).

**例**

デフォルトの設定を使用した場合：

```sql
SELECT tokens('test1,;\\ test2,;\\ test3,;\\   test4') AS tokens;
```

結果:

```text
┌─tokens────────────────────────────┐
│ ['test1','test2','test3','test4'] │
└───────────────────────────────────┘
```

ngram トークナイザを使用し、ngram の長さを3に設定した場合：

```sql
SELECT tokens('abc def', 'ngram', 3) AS tokens;
```

結果:

```text
┌─tokens──────────────────────────┐
│ ['abc','bc ','c d',' de','def'] │
└─────────────────────────────────┘
