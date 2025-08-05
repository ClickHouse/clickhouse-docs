---
description: 'Documentation for Functions for Splitting Strings'
sidebar_label: 'Splitting Strings'
sidebar_position: 165
slug: '/sql-reference/functions/splitting-merging-functions'
title: 'Functions for Splitting Strings'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

# 文字列を分割するための関数

## splitByChar {#splitbychar}

指定された文字で区切られた部分文字列に文字列を分割します。正確に1文字からなる定数文字列 `separator` を使用します。
選択した部分文字列の配列を返します。セパレーターが文字列の先頭または末尾に現れる場合や、複数の連続したセパレーターがある場合には、空の部分文字列が選択されることがあります。

**構文**

```sql
splitByChar(separator, s[, max_substrings])
```

**引数**

- `separator` — セパレーターは単一バイトの文字でなければなりません。 [String](../data-types/string.md)。
- `s` — 分割する文字列。 [String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される配列には `max_substrings` 個以内の部分文字列が含まれ、それ以外の場合は関数が可能な限り多くの部分文字列を返します。

**返される値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md))。

次の条件で空の部分文字列が選択されることがあります：

- セパレーターが文字列の先頭または末尾に出現する場合；
- 複数の連続したセパレーターがある場合；
- 元の文字列 `s` が空の場合。

:::note
パラメーター `max_substrings` の挙動は ClickHouse v22.11 から変更されました。それ以前のバージョンでは、`max_substrings` > 0 の場合、`max_substrings` 個の分割が行われ、文字列の残りがリストの最後の要素として返されました。
たとえば、
- v22.10 では: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b','c=d']` を返しました。
- v22.11 では: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b']` を返しました。

ClickHouse v22.11 より前のような挙動は、次の設定を行うことで再現できます：
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)
`SELECT splitByChar('=', 'a=b=c=d', 2) SETTINGS splitby_max_substrings_includes_remaining_string = 1 -- ['a', 'b=c=d']`
:::

**例**

```sql
SELECT splitByChar(',', '1,2,3,abcde');
```

結果：

```text
┌─splitByChar(',', '1,2,3,abcde')─┐
│ ['1','2','3','abcde']           │
└─────────────────────────────────┘
```

## splitByString {#splitbystring}

文字列を文字列で区切られた部分文字列に分割します。複数の文字からなる定数文字列 `separator` をセパレーターとして使用します。`separator` が空の場合、文字列 `s` を1文字の配列に分割します。

**構文**

```sql
splitByString(separator, s[, max_substrings])
```

**引数**

- `separator` — セパレーター。 [String](../data-types/string.md)。
- `s` — 分割する文字列。 [String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は `max_substrings` 個以内で、それ以外の場合は関数が可能な限り多くの部分文字列を返します。

**返される値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md))。

次の条件で空の部分文字列が選択されることがあります：

- 非空のセパレーターが文字列の先頭または末尾に出現する場合；
- 複数の連続した非空のセパレーターがある場合；
- 元の文字列 `s` が空で、セパレーターが空でない場合。

:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) は、引数 `max_substrings` > 0 の場合に残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
:::

**例**

```sql
SELECT splitByString(', ', '1, 2 3, 4,5, abcde');
```

結果：

```text
┌─splitByString(', ', '1, 2 3, 4,5, abcde')─┐
│ ['1','2 3','4,5','abcde']                 │
└───────────────────────────────────────────┘
```

```sql
SELECT splitByString('', 'abcde');
```

結果：

```text
┌─splitByString('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByRegexp {#splitbyregexp}

正規表現によって区切られた部分文字列に文字列を分割します。正規表現文字列 `regexp` をセパレーターとして使用します。`regexp` が空の場合、文字列 `s` を1文字の配列に分割します。この正規表現に一致するものが見つからない場合、文字列 `s` は分割されません。

**構文**

```sql
splitByRegexp(regexp, s[, max_substrings])
```

**引数**

- `regexp` — 正規表現。定数。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `s` — 分割する文字列。 [String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は `max_substrings` 個以内で、それ以外の場合は関数が可能な限り多くの部分文字列を返します。


**返される値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md))。

次の条件で空の部分文字列が選択されることがあります：

- 非空の正規表現一致が文字列の先頭または末尾に出現する場合；
- 複数の連続した非空の正規表現一致がある場合；
- 元の文字列 `s` が空で、正規表現が空でない場合。

:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) は、引数 `max_substrings` > 0 の場合に残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
:::

**例**

```sql
SELECT splitByRegexp('\\d+', 'a12bc23de345f');
```

結果：

```text
┌─splitByRegexp('\\d+', 'a12bc23de345f')─┐
│ ['a','bc','de','f']                    │
└────────────────────────────────────────┘
```

```sql
SELECT splitByRegexp('', 'abcde');
```

結果：

```text
┌─splitByRegexp('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByWhitespace {#splitbywhitespace}

ホワイトスペース文字で区切られた部分文字列に文字列を分割します。 
選択した部分文字列の配列を返します。

**構文**

```sql
splitByWhitespace(s[, max_substrings])
```

**引数**

- `s` — 分割する文字列。 [String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は `max_substrings` 個以内で、それ以外の場合は関数が可能な限り多くの部分文字列を返します。


**返される値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md)).
 
:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) は、引数 `max_substrings` > 0 の場合に残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
:::

**例**

```sql
SELECT splitByWhitespace('  1!  a,  b.  ');
```

結果：

```text
┌─splitByWhitespace('  1!  a,  b.  ')─┐
│ ['1!','a,','b.']                    │
└─────────────────────────────────────┘
```

## splitByNonAlpha {#splitbynonalpha}

ホワイトスペースおよび句読点文字で区切られた部分文字列に文字列を分割します。 
選択した部分文字列の配列を返します。

**構文**

```sql
splitByNonAlpha(s[, max_substrings])
```

**引数**

- `s` — 分割する文字列。 [String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は `max_substrings` 個以内で、それ以外の場合は関数が可能な限り多くの部分文字列を返します。


**返される値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) は、引数 `max_substrings` > 0 の場合に残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
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

配列にリストされている値の文字列表現を、セパレーターで結合します。 `separator` はオプションのパラメーターで、デフォルトは空の文字列に設定されています。
文字列を返します。

**構文**

```sql
arrayStringConcat(arr[, separator])
```

**例**

```sql
SELECT arrayStringConcat(['12/05/2021', '12:50:00'], ' ') AS DateString;
```

結果：

```text
┌─DateString──────────┐
│ 12/05/2021 12:50:00 │
└─────────────────────┘
```

## alphaTokens {#alphatokens}

範囲a-zおよびA-Zの連続したバイトの部分文字列を選択します。部分文字列の配列を返します。

**構文**

```sql
alphaTokens(s[, max_substrings])
```

エイリアス: `splitByAlpha`

**引数**

- `s` — 分割する文字列。 [String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64` で、デフォルトは0です。 `max_substrings` > 0 の場合、返される部分文字列は `max_substrings` 個以内で、それ以外の場合は関数が可能な限り多くの部分文字列を返します。

**返される値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) は、引数 `max_substrings` > 0 の場合に残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
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

- `text` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `regexp` — 正規表現。定数。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

- 関数が少なくとも1つの一致するグループを見つけた場合、グループID（1からN、Nは `regexp` のキャプチャグループの数）によってクラスタリングされた `Array(Array(String))` カラムを返します。一致するグループがない場合、空の配列を返します。 [Array](../data-types/array.md)。

**例**

```sql
SELECT extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果：

```text
┌─extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','123'],['8','"hkl"']]                                         │
└───────────────────────────────────────────────────────────────────────┘
```

## ngrams {#ngrams}

<DeprecatedBadge/>

UTF-8 文字列を `ngramsize` シンボルのn-gramに分割します。
この関数は非推奨です。 [tokens](#tokens) を使用し、`ngram` トークナイザーを使用することをお勧めします。
この関数は将来的に削除される可能性があります。

**構文**

```sql
ngrams(string, ngramsize)
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `ngramsize` — n-gramのサイズ。 [UInt](../data-types/int-uint.md)。

**返される値**

- n-gramの配列。 [Array](../data-types/array.md)([String](../data-types/string.md))。

**例**

```sql
SELECT ngrams('ClickHouse', 3);
```

結果：

```text
┌─ngrams('ClickHouse', 3)───────────────────────────┐
│ ['Cli','lic','ick','ckH','kHo','Hou','ous','use'] │
└───────────────────────────────────────────────────┘
```

## tokens {#tokens}

文字列を指定されたトークナイザーを使用してトークンに分割します。
デフォルトのトークナイザーは、非アルファベットのASCII文字をセパレーターとして使用します。

**引数**

- `value` — 入力文字列。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `tokenizer` — 使用するトークナイザー。 有効な引数は `default`, `ngram`, および `noop` です。オプションで、明示的に設定されていない場合はデフォルトが `default` になります。 [const String](../data-types/string.md)
- `ngrams` — 引数 `tokenizer` が `ngram` の場合のみ関連があります：n-gramsの長さを定義するオプションのパラメーターです。明示的に設定されていない場合はデフォルトが `3` になります。 [UInt8](../data-types/int-uint.md)。

**返される値**

- 入力文字列から得られたトークンの結果配列。 [Array](../data-types/array.md)。

**例**

デフォルト設定を使用する場合：

```sql
SELECT tokens('test1,;\\ test2,;\\ test3,;\\   test4') AS tokens;
```

結果：

```text
┌─tokens────────────────────────────┐
│ ['test1','test2','test3','test4'] │
└───────────────────────────────────┘
```

n-gram トークナイザーをngram長3で使用する場合：

```sql
SELECT tokens('abc def', 'ngram', 3) AS tokens;
```

結果：

```text
┌─tokens──────────────────────────┐
│ ['abc','bc ','c d',' de','def'] │
└─────────────────────────────────┘
```
