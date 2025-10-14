---
'description': 'Functions for Splitting Stringsのドキュメント'
'sidebar_label': '文字列分割'
'slug': '/sql-reference/functions/splitting-merging-functions'
'title': '文字列を分割するための関数'
'doc_type': 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';



# 文字列分割のための関数

## splitByChar {#splitbychar}

指定された文字で区切られた部分文字列に文字列を分割します。正確に1文字からなる定数文字列 `separator` を使用します。
選択された部分文字列の配列を返します。区切り文字が文字列の先頭または末尾に存在する場合、または複数の連続した区切り文字がある場合、空の部分文字列が選ばれることがあります。

**構文**

```sql
splitByChar(separator, s[, max_substrings]))
```

**引数**

- `separator` — 区切り文字は1バイトの文字でなければなりません。[String](../data-types/string.md)。
- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — 任意の `Int64` で、デフォルトは0です。`max_substrings` が > 0 の場合、返される配列は最大で `max_substrings` の部分文字列を含みます。それ以外の場合、関数はできるだけ多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

 空の部分文字列が選ばれることがあるのは次の場合です：

- 区切り文字が文字列の先頭または末尾に存在する場合；
- 複数の連続した区切り文字がある場合；
- 元の文字列 `s` が空の場合。

:::note
パラメータ `max_substrings` の動作は ClickHouse v22.11 から変更されました。それ以前のバージョンでは、`max_substrings` が > 0 の場合、`max_substring` 回だけ分割が行われ、文字列の残りがリストの最終要素として返されました。
例：
- v22.10 の場合: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b','c=d']` を返しました。
- v22.11 の場合: `SELECT splitByChar('=', 'a=b=c=d', 2);` は `['a','b']` を返しました。

ClickHouse v22.11以前のような動作を実現するには、
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)
を設定します。
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

文字列を文字列で区切られた部分文字列に分割します。複数の文字からなる定数文字列 `separator` を区切りとして使用します。`separator` が空の場合は、文字列 `s` を単一文字の配列に分割します。

**構文**

```sql
splitByString(separator, s[, max_substrings]))
```

**引数**

- `separator` — 区切り文字。[String](../data-types/string.md)。
- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — 任意の `Int64` で、デフォルトは0です。`max_substrings` が > 0 の場合、返される部分文字列は最大で `max_substrings` になります。それ以外の場合、関数はできるだけ多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

空の部分文字列が選ばれることがあるのは次の場合です：

- 空でない区切り文字が文字列の先頭または末尾に存在する場合；
- 複数の連続した空でない区切り文字がある場合；
- 元の文字列 `s` が空で、区切り文字が空でない場合。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することで（デフォルト: 0）、引数 `max_substrings` が > 0 の場合に結果配列の最後の要素に残りの文字列が含まれるかどうかを制御できます。
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

文字列を正規表現で区切られた部分文字列に分割します。正規表現文字列 `regexp` を区切りとして使用します。`regexp` が空の場合は、文字列 `s` を単一文字の配列に分割します。この正規表現に対して一致が見つからない場合、文字列 `s` は分割されません。

**構文**

```sql
splitByRegexp(regexp, s[, max_substrings]))
```

**引数**

- `regexp` — 正規表現。定数。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — 任意の `Int64` で、デフォルトは0です。`max_substrings` が > 0 の場合、返される部分文字列は最大で `max_substrings` になります。それ以外の場合、関数はできるだけ多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。
空の部分文字列が選ばれることがあるのは次の場合です：

- 空でない正規表現の一致が文字列の先頭または末尾に存在する場合；
- 複数の連続した空でない正規表現の一致がある場合；
- 元の文字列 `s` が空で、正規表現が空でない場合。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することで（デフォルト: 0）、引数 `max_substrings` が > 0 の場合に結果配列の最後の要素に残りの文字列が含まれるかどうかを制御できます。
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

文字列を空白文字で区切られた部分文字列に分割します。
選択された部分文字列の配列を返します。

**構文**

```sql
splitByWhitespace(s[, max_substrings]))
```

**引数**

- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — 任意の `Int64` で、デフォルトは0です。`max_substrings` が > 0 の場合、返される部分文字列は最大で `max_substrings` になります。それ以外の場合、関数はできるだけ多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することで（デフォルト: 0）、引数 `max_substrings` が > 0 の場合に結果配列の最後の要素に残りの文字列が含まれるかどうかを制御できます。
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

文字列を空白や句読点で区切られた部分文字列に分割します。
選択された部分文字列の配列を返します。

**構文**

```sql
splitByNonAlpha(s[, max_substrings]))
```

**引数**

- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — 任意の `Int64` で、デフォルトは0です。`max_substrings` が > 0 の場合、返される部分文字列は最大で `max_substrings` になります。それ以外の場合、関数はできるだけ多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することで（デフォルト: 0）、引数 `max_substrings` が > 0 の場合に結果配列の最後の要素に残りの文字列が含まれるかどうかを制御できます。
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

配列にリストされた値の文字列表現を区切り文字で連結します。`separator` は任意のパラメータで、デフォルトは空文字列に設定されています。
文字列を返します。

**構文**

```sql
arrayStringConcat(arr\[, separator\])
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

a-z および A-Z の範囲からの連続バイトの部分文字列を選択します。部分文字列の配列を返します。

**構文**

```sql
alphaTokens(s[, max_substrings]))
```

別名: `splitByAlpha`

**引数**

- `s` — 分割する文字列。[String](../data-types/string.md)。
- `max_substrings` — 任意の `Int64` で、デフォルトは0です。`max_substrings` が > 0 の場合、返される部分文字列は最大で `max_substrings` になります。それ以外の場合、関数はできるだけ多くの部分文字列を返します。

**返される値**

- 選択された部分文字列の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

:::note
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) を設定することで（デフォルト: 0）、引数 `max_substrings` が > 0 の場合に結果配列の最後の要素に残りの文字列が含まれるかどうかを制御できます。
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

正規表現によって一致した重複しない部分文字列からすべてのグループを抽出します。

**構文**

```sql
extractAllGroups(text, regexp)
```

**引数**

- `text` — [String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `regexp` — 正規表現。定数。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。

**返される値**

- 関数が少なくとも1つの一致グループを見つけた場合、`Array(Array(String))` カラムを返し、グループIDでクラスタリングされます（1からNまで、ここでNは `regexp` のキャプチャグループの数です）。一致グループがない場合、空の配列を返します。[Array](../data-types/array.md)。

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

UTF-8 文字列を `ngramsize` シンボルの n-gram に分割します。

**構文**

```sql
ngrams(string, ngramsize)
```

**引数**

- `string` — 文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `ngramsize` — n-gram のサイズ。[UInt](../data-types/int-uint.md)。

**返される値**

- n-gram の配列。[Array](../data-types/array.md)([String](../data-types/string.md))。

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

指定されたトークナイザーを使用して文字列をトークンに分割します。
デフォルトのトークナイザーは、非英数字ASCII文字を区切りとして使用します。

**引数**

- `value` — 入力文字列。[String](../data-types/string.md) または [FixedString](../data-types/fixedstring.md)。
- `tokenizer` — 使用するトークナイザー。有効な引数は `default`, `ngram`, `split`, および `no_op` です。オプションで、明示的に設定されていない場合はデフォルトで `default` になります。[const String](../data-types/string.md)
- `ngrams` — 引数 `tokenizer` が `ngram` の場合のみ関連します：n-grams の長さを定義するオプションのパラメータです。明示的に設定されていない場合はデフォルトで `3` になります。[UInt8](../data-types/int-uint.md)。
- `separators` — 引数 `tokenizer` が `split` の場合のみ関連します：区切り文字列を定義するオプションのパラメータです。明示的に設定されていない場合はデフォルトで `[' ']` になります。[Array(String)](../data-types/array.md)。

:::note
`split` トークナイザーの場合: トークンが [プレフィックスコード](https://en.wikipedia.org/wiki/Prefix_code) を形成しない場合、一致がより長い区切りを優先することを望む場合があります。
そのためには、区切りを長さの降順で渡してください。
例えば、区切りが `['%21', '%']` の場合、文字列 `%21abc` は `['abc']` にトークン化されますが、区切りが `['%', '%21']` の場合は `['21ac']` となります（これはおそらく望んでいたものではありません）。
:::

**返される値**

- 入力文字列からのトークンの結果配列。[Array](../data-types/array.md)。

**例**

デフォルトの設定を使用する場合：

```sql
SELECT tokens('test1,;\\ test2,;\\ test3,;\\   test4') AS tokens;
```

結果：

```text
┌─tokens────────────────────────────┐
│ ['test1','test2','test3','test4'] │
└───────────────────────────────────┘
```

ngram トークナイザーを使用し、ngram の長さを3に設定する場合：

```sql
SELECT tokens('abc def', 'ngram', 3) AS tokens;
```

結果：

```text
┌─tokens──────────────────────────┐
│ ['abc','bc ','c d',' de','def'] │
└─────────────────────────────────┘
```

<!-- 
以下のタグ内の内容は、ドキュメントフレームワークのビルド時に
system.functions から生成されたドキュメントに置き換えられます。変更したり削除したりしないでください。
参照: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
