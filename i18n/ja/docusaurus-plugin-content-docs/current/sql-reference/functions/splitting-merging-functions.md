---
slug: /sql-reference/functions/splitting-merging-functions
sidebar_position: 165
sidebar_label: 文字列の分割
---

# 文字列を分割するための関数

## splitByChar {#splitbychar}

指定した文字で区切られた部分文字列に文字列を分割します。正確に1文字から成る定数文字列 `separator` を使用します。
選択された部分文字列の配列を返します。区切り文字が文字列の先頭または末尾に出現したり、連続した区切り文字が複数ある場合は、空の部分文字列が選択されることがあります。

**構文**

``` sql
splitByChar(separator, s[, max_substrings])
```

**引数**

- `separator` — 正確に1文字を含む区切り文字。[String](../data-types/string.md)。
- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64`、デフォルトは0。`max_substrings` > 0 の場合、返される配列には最大で `max_substrings` の部分文字列が含まれ、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

空の部分文字列が選択される場合:

- 区切り文字が文字列の先頭または末尾に出現する；
- 連続した区切り文字が複数存在する；
- 元の文字列 `s` が空である。

:::note
`max_substrings` パラメーターの動作は ClickHouse v22.11 から変更されました。それ以前のバージョンでは、`max_substrings > 0` の場合、`max_substrings` 回の分割が実行され、文字列の残りはリストの最後の要素として返されました。
例えば、
- v22.10 では: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b','c=d']` を返しました
- v22.11 では: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b']` を返しました

ClickHouse v22.11以前に似た動作を得るには、
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定します。
`SELECT splitByChar('=', 'a=b=c=d', 2) SETTINGS splitby_max_substrings_includes_remaining_string = 1 -- ['a', 'b=c=d']`
:::

**例**

``` sql
SELECT splitByChar(',', '1,2,3,abcde');
```

結果:

``` text
┌─splitByChar(',', '1,2,3,abcde')─┐
│ ['1','2','3','abcde']           │
└─────────────────────────────────┘
```

## splitByString {#splitbystring}

文字列で区切られた部分文字列に文字列を分割します。複数の文字から成る定数文字列 `separator` を区切り文字として使用します。`separator` が空の文字列である場合、文字列 `s` は単一文字の配列に分割されます。

**構文**

``` sql
splitByString(separator, s[, max_substrings])
```

**引数**

- `separator` — 区切り文字。[String](../data-types/string.md)。
- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64`、デフォルトは0。`max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` の数になり、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

空の部分文字列が選択される場合:

- 非空の区切り文字が文字列の先頭または末尾に出現する；
- 連続した非空の区切り文字が複数存在する；
- 元の文字列 `s` が空であり、区切り文字が非空である。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することにより（デフォルト: 0）、引数 `max_substrings` > 0 の場合、残りの文字列が結果の配列の最後の要素に含まれるかどうかを制御できます。
:::

**例**

``` sql
SELECT splitByString(', ', '1, 2 3, 4,5, abcde');
```

結果:

``` text
┌─splitByString(', ', '1, 2 3, 4,5, abcde')─┐
│ ['1','2 3','4,5','abcde']                 │
└───────────────────────────────────────────┘
```

``` sql
SELECT splitByString('', 'abcde');
```

結果:

``` text
┌─splitByString('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByRegexp {#splitbyregexp}

正規表現によって区切られた部分文字列に文字列を分割します。正規表現文字列 `regexp` を区切り文字として使用します。`regexp` が空の場合、文字列 `s` は単一文字の配列に分割されます。この正規表現に一致するものが見つからない場合、文字列 `s` は分割されません。

**構文**

``` sql
splitByRegexp(regexp, s[, max_substrings])
```

**引数**

- `regexp` — 正規表現。定数。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64`、デフォルトは0。`max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` の数になり、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

空の部分文字列が選択される場合:

- 非空の正規表現の一致が文字列の先頭または末尾に出現する；
- 連続した非空の正規表現の一致が複数存在する；
- 元の文字列 `s` が空であり、正規表現が非空である。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することにより（デフォルト: 0）、引数 `max_substrings` > 0 の場合、残りの文字列が結果の配列の最後の要素に含まれるかどうかを制御できます。
:::

**例**

``` sql
SELECT splitByRegexp('\\d+', 'a12bc23de345f');
```

結果:

``` text
┌─splitByRegexp('\\d+', 'a12bc23de345f')─┐
│ ['a','bc','de','f']                    │
└────────────────────────────────────────┘
```

``` sql
SELECT splitByRegexp('', 'abcde');
```

結果:

``` text
┌─splitByRegexp('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByWhitespace {#splitbywhitespace}

空白文字で区切られた部分文字列に文字列を分割します。
選択された部分文字列の配列を返します。

**構文**

``` sql
splitByWhitespace(s[, max_substrings])
```

**引数**

- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64`、デフォルトは0。`max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` の数になり、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することにより（デフォルト: 0）、引数 `max_substrings` > 0 の場合、残りの文字列が結果の配列の最後の要素に含まれるかどうかを制御できます。
:::

**例**

``` sql
SELECT splitByWhitespace('  1!  a,  b.  ');
```

結果:

``` text
┌─splitByWhitespace('  1!  a,  b.  ')─┐
│ ['1!','a,','b.']                    │
└─────────────────────────────────────┘
```

## splitByNonAlpha {#splitbynonalpha}

空白文字と句読点文字で区切られた部分文字列に文字列を分割します。
選択された部分文字列の配列を返します。

**構文**

``` sql
splitByNonAlpha(s[, max_substrings])
```

**引数**

- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64`、デフォルトは0。`max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` の数になり、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することにより（デフォルト: 0）、引数 `max_substrings` > 0 の場合、残りの文字列が結果の配列の最後の要素に含まれるかどうかを制御できます。
:::

**例**

``` sql
SELECT splitByNonAlpha('  1!  a,  b.  ');
```

``` text
┌─splitByNonAlpha('  1!  a,  b.  ')─┐
│ ['1','a','b']                     │
└───────────────────────────────────┘
```

## arrayStringConcat {#arraystringconcat}

配列内の値の文字列表現を区切り文字で連結します。`separator` はオプションのパラメータで、デフォルトは空文字列です。
文字列を返します。

**構文**

```sql
arrayStringConcat(arr[, separator])
```

**例**

``` sql
SELECT arrayStringConcat(['12/05/2021', '12:50:00'], ' ') AS DateString;
```

結果:

```text
┌─DateString──────────┐
│ 12/05/2021 12:50:00 │
└─────────────────────┘
```

## alphaTokens {#alphatokens}

a-z および A-Z の範囲内の連続するバイトから部分文字列を選択します。部分文字列の配列を返します。

**構文**

``` sql
alphaTokens(s[, max_substrings])
```

エイリアス: `splitByAlpha`

**引数**

- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — オプションの `Int64`、デフォルトは0。`max_substrings` > 0 の場合、返される部分文字列は最大で `max_substrings` の数になり、それ以外の場合は可能な限り多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することにより（デフォルト: 0）、引数 `max_substrings` > 0 の場合、残りの文字列が結果の配列の最後の要素に含まれるかどうかを制御できます。
:::

**例**

``` sql
SELECT alphaTokens('abca1abc');
```

``` text
┌─alphaTokens('abca1abc')─┐
│ ['abca','abc']          │
└─────────────────────────┘
```

## extractAllGroups {#extractallgroups}

正規表現によって一致する非重複の部分文字列からすべてのグループを抽出します。

**構文**

``` sql
extractAllGroups(text, regexp)
```

**引数**

- `text` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `regexp` — 正規表現。定数。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

- 関数が少なくとも1つの一致するグループを見つけた場合、`Array(Array(String))` 列を返し、グループIDでクラスタリングされます（1からN、Nは `regexp` のキャプチャグループの数）。一致するグループがない場合は、空の配列を返します。[Array](../data-types/array.md)。

**例**

``` sql
SELECT extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

結果:

``` text
┌─extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','123'],['8','"hkl"']]                                         │
└───────────────────────────────────────────────────────────────────────┘
```

## ngrams {#ngrams}

UTF-8 文字列を `ngramsize` シンボルの n-gram に分割します。

**構文** 

``` sql
ngrams(string, ngramsize)
```

**引数**

- `string` — 文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `ngramsize` — n-gram のサイズ。[UInt](../data-types/int-uint.md)。

**返される値**

- n-gram の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

**例**

``` sql
SELECT ngrams('ClickHouse', 3);
```

結果:

``` text
┌─ngrams('ClickHouse', 3)───────────────────────────┐
│ ['Cli','lic','ick','ckH','kHo','Hou','ous','use'] │
└───────────────────────────────────────────────────┘
```

## tokens {#tokens}

非アルファベットの ASCII 文字を区切りとして使用して文字列をトークンに分割します。

**引数**

- `input_string` — [String](../data-types/string.md) データ型オブジェクトとして表される任意のバイトのセット。

**返される値**

- 入力文字列から得られるトークンの結果の配列。[Array](../data-types/array.md)。

**例**

``` sql
SELECT tokens('test1,;\\ test2,;\\ test3,;\\   test4') AS tokens;
```

結果:

``` text
┌─tokens────────────────────────────┐
│ ['test1','test2','test3','test4'] │
└───────────────────────────────────┘
```
