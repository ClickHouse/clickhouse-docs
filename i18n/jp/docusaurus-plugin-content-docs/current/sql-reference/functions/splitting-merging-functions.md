---
slug: /sql-reference/functions/splitting-merging-functions
sidebar_position: 165
sidebar_label: 文字列の分割
---


# 文字列の分割のための関数

## splitByChar {#splitbychar}

指定された文字で区切られた部分文字列に文字列を分割します。一文字から成る定数文字列 `separator` を使用します。
選択した部分文字列の配列を返します。区切り文字が文字列の先頭または末尾に出現した場合や、複数の連続した区切り文字がある場合は、空の部分文字列が選択されることがあります。

**構文**

``` sql
splitByChar(separator, s[, max_substrings]))
```

**引数**

- `separator` — 一文字の区切り文字。 [String](../data-types/string.md).
- `s` — 分割する文字列。 [String](../data-types/string.md).
- `max_substrings` — 省略可能な `Int64` でデフォルトは 0 です。`max_substrings` が 0 より大きい場合、返される配列には `max_substrings` 部分文字列が含まれることが最大の制限となり、それ以外の場合は可能な限り多くの部分文字列が返されます。

**戻り値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md)).

 空の部分文字列が選択される場合:

- 区切り文字が文字列の先頭または末尾に出現する場合;
- 複数の連続した区切り文字がある場合;
- オリジナルの文字列 `s` が空の場合。

:::note
パラメーター `max_substrings` の動作は ClickHouse v22.11 から変更されました。それ以前のバージョンでは、`max_substrings` が 0 より大きい場合、`max_substrings` 分の分割が行われ、残りの文字列はリストの最後の要素として返されました。
例えば、
- v22.10 では: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b','c=d']` を返しました。
- v22.11 では: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b']` を返しました。

ClickHouse の v22.11 より前の動作に似た動作を行うには、次のように設定します。
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)
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

文字列を指定した文字列で区切られた部分文字列に分割します。複数の文字からなる定数文字列 `separator` を区切り文字として使用します。`separator` が空の場合、文字列 `s` を一文字の配列に分割します。

**構文**

``` sql
splitByString(separator, s[, max_substrings]))
```

**引数**

- `separator` — 区切り文字。 [String](../data-types/string.md).
- `s` — 分割する文字列。 [String](../data-types/string.md).
- `max_substrings` — 省略可能な `Int64` でデフォルトは 0 です。`max_substrings` が 0 より大きい場合、返される部分文字列の数は `max_substrings` を超えないようにし、そうでない場合はできるだけ多くの部分文字列が返されます。

**戻り値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md)).

空の部分文字列が選択される場合:

- 非空の区切り文字が文字列の先頭または末尾に出現する場合;
- 複数の連続した非空の区切り文字がある場合;
- 元の文字列 `s` が空で、区切り文字が空でない場合。

:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) により、引数 `max_substrings` が 0 より大きい場合に、残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
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

正規表現で区切られた部分文字列に文字列を分割します。区切りとして正規表現文字列 `regexp` を使用します。`regexp` が空の場合、文字列 `s` を一文字の配列に分割します。この正規表現に対する一致が見つからない場合、文字列 `s` は分割されません。

**構文**

``` sql
splitByRegexp(regexp, s[, max_substrings]))
```

**引数**

- `regexp` — 正規表現。定数。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md).
- `s` — 分割する文字列。 [String](../data-types/string.md).
- `max_substrings` — 省略可能な `Int64` でデフォルトは 0 です。`max_substrings` が 0 より大きい場合、返される部分文字列の数は `max_substrings` を超えないようにし、そうでない場合はできるだけ多くの部分文字列が返されます。

**戻り値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md)).

空の部分文字列が選択される場合:

- 非空の正規表現の一致が文字列の先頭または末尾に出現する場合;
- 複数の連続した非空の正規表現の一致がある場合;
- 元の文字列 `s` が空で、正規表現が空でない場合。

:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) により、引数 `max_substrings` が 0 より大きい場合に、残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
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
選択した部分文字列の配列を返します。

**構文**

``` sql
splitByWhitespace(s[, max_substrings]))
```

**引数**

- `s` — 分割する文字列。 [String](../data-types/string.md).
- `max_substrings` — 省略可能な `Int64` でデフォルトは 0 です。`max_substrings` が 0 より大きい場合、返される部分文字列の数は `max_substrings` を超えないようにし、そうでない場合はできるだけ多くの部分文字列が返されます。

**戻り値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md)).
 
:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) により、引数 `max_substrings` が 0 より大きい場合に、残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
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
選択した部分文字列の配列を返します。

**構文**

``` sql
splitByNonAlpha(s[, max_substrings]))
```

**引数**

- `s` — 分割する文字列。 [String](../data-types/string.md).
- `max_substrings` — 省略可能な `Int64` でデフォルトは 0 です。`max_substrings` が 0 より大きい場合、返される部分文字列の数は `max_substrings` を超えないようにし、そうでない場合はできるだけ多くの部分文字列が返されます。

**戻り値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) により、引数 `max_substrings` が 0 より大きい場合に、残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
:::

**例**

``` sql
SELECT splitByNonAlpha('  1!  a,  b.  ');
```

結果:

``` text
┌─splitByNonAlpha('  1!  a,  b.  ')─┐
│ ['1','a','b']                     │
└───────────────────────────────────┘
```

## arrayStringConcat {#arraystringconcat}

配列にリストされた値の文字列表現を区切り文字で連結します。`separator` は省略可能なパラメーターで、デフォルトは空の文字列です。
文字列を返します。

**構文**

```sql
arrayStringConcat(arr\[, separator\])
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

連続したバイトの部分文字列を a-z および A-Z の範囲から選択します。部分文字列の配列を返します。

**構文**

``` sql
alphaTokens(s[, max_substrings]))
```

エイリアス: `splitByAlpha`

**引数**

- `s` — 分割する文字列。 [String](../data-types/string.md).
- `max_substrings` — 省略可能な `Int64` でデフォルトは 0 です。`max_substrings` が 0 より大きい場合、返される部分文字列の数は `max_substrings` を超えないようにし、そうでない場合はできるだけ多くの部分文字列が返されます。

**戻り値**

- 選択した部分文字列の配列。 [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
設定 [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (デフォルト: 0) により、引数 `max_substrings` が 0 より大きい場合に、残りの文字列が結果配列の最後の要素に含まれるかどうかを制御します。
:::

**例**

``` sql
SELECT alphaTokens('abca1abc');
```

結果:

``` text
┌─alphaTokens('abca1abc')─┐
│ ['abca','abc']          │
└─────────────────────────┘
```

## extractAllGroups {#extractallgroups}

正規表現によって一致した非重複部分文字列からすべてのグループを抽出します。

**構文**

``` sql
extractAllGroups(text, regexp)
```

**引数**

- `text` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md).
- `regexp` — 正規表現。定数。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md).

**戻り値**

- 関数が少なくとも1つの一致グループを見つけた場合、グループID（1からN）（Nは `regexp` のキャプチャグループ数）でクラスタリングされた `Array(Array(String))` 型のカラムを返します。一致グループがない場合は、空の配列を返します。 [Array](../data-types/array.md).

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

UTF-8文字列を `ngramsize` シンボルの n-グラムに分割します。

**構文** 

``` sql
ngrams(string, ngramsize)
```

**引数**

- `string` — 文字列。 [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md).
- `ngramsize` — n-グラムのサイズ。 [UInt](../data-types/int-uint.md).

**戻り値**

- n-グラムの配列。 [Array](../data-types/array.md)([String](../data-types/string.md)).

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

非アルファベットのASCII文字を区切りとして使用して文字列をトークンに分割します。

**引数**

- `input_string` — [String](../data-types/string.md) データ型オブジェクトとして表されたバイトの任意のセット。

**戻り値**

- 入力文字列から得られたトークンの配列。 [Array](../data-types/array.md).

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
