---
description: '配列関数のドキュメント'
sidebar_label: '配列'
sidebar_position: 10
slug: /sql-reference/functions/array-functions
title: '配列関数'
---

# 配列関数
## empty {#empty}

入力配列が空かどうかをチェックします。

**構文**

```sql
empty([x])
```

要素を含まない配列は空と見なされます。

:::ノート
[`optimize_functions_to_subcolumns`](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にして最適化することができます。`optimize_functions_to_subcolumns = 1` の場合、この関数は[サイズ0](/sql-reference/data-types/array#array-size) サブカラムだけを読み取り、配列全体を読み取って処理しません。クエリ `SELECT empty(arr) FROM TABLE;` は `SELECT arr.size0 = 0 FROM TABLE;` に変換されます。
:::

この機能は[文字列](string-functions.md#empty)または [UUID](uuid-functions.md#empty)に対しても機能します。

**引数**

- `[x]` — 入力配列。[配列](/sql-reference/data-types/array)。

**返り値**

- 空の配列の場合は`1`、空でない配列の場合は`0` を返します。[UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT empty([]);
```

結果：

```text
┌─empty(array())─┐
│              1 │
└────────────────┘
```
## notEmpty {#notempty}

入力配列が空でないかどうかをチェックします。

**構文**

```sql
notEmpty([x])
```

要素が少なくとも 1 つ含まれている場合、配列は空でないと見なされます。

:::ノート
[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にすることで最適化することができます。`optimize_functions_to_subcolumns = 1` の場合、この関数は[サイズ0](/sql-reference/data-types/array#array-size) サブカラムだけを読み取り、配列全体を読み取って処理しません。クエリ `SELECT notEmpty(arr) FROM table` は `SELECT arr.size0 != 0 FROM TABLE` に変換されます。
:::

この機能は[文字列](string-functions.md#notempty)または [UUID](uuid-functions.md#notempty)に対しても機能します。

**引数**

- `[x]` — 入力配列。[配列](/sql-reference/data-types/array)。

**返り値**

- 空でない配列の場合は `1`、空の配列の場合は `0` を返します。[UInt8](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT notEmpty([1,2]);
```

結果：

```text
┌─notEmpty([1, 2])─┐
│                1 │
└──────────────────┘
```
## length {#length}

配列内の項目数を返します。 戻り値の型は UInt64 です。 この機能は文字列に対しても機能します。

[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にして最適化することができます。`optimize_functions_to_subcolumns = 1` の場合、この関数は[サイズ0](/sql-reference/data-types/array#array-size) サブカラムだけを読み取り、配列全体を読み取って処理しません。 クエリ `SELECT length(arr) FROM table` は `SELECT arr.size0 FROM TABLE` に変換されます。

エイリアス：`OCTET_LENGTH`
## emptyArrayUInt8 {#emptyarrayuint8}

空の UInt8 配列を返します。

**構文**

```sql
emptyArrayUInt8()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayUInt8();
```

結果：

```response
[]
```
## emptyArrayUInt16 {#emptyarrayuint16}

空の UInt16 配列を返します。

**構文**

```sql
emptyArrayUInt16()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayUInt16();

```

結果：

```response
[]
```
## emptyArrayUInt32 {#emptyarrayuint32}

空の UInt32 配列を返します。

**構文**

```sql
emptyArrayUInt32()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayUInt32();
```

結果：

```response
[]
```
## emptyArrayUInt64 {#emptyarrayuint64}

空の UInt64 配列を返します。

**構文**

```sql
emptyArrayUInt64()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayUInt64();
```

結果：

```response
[]
```
## emptyArrayInt8 {#emptyarrayint8}

空の Int8 配列を返します。

**構文**

```sql
emptyArrayInt8()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayInt8();
```

結果：

```response
[]
```
## emptyArrayInt16 {#emptyarrayint16}

空の Int16 配列を返します。

**構文**

```sql
emptyArrayInt16()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayInt16();
```

結果：

```response
[]
```
## emptyArrayInt32 {#emptyarrayint32}

空の Int32 配列を返します。

**構文**

```sql
emptyArrayInt32()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayInt32();
```

結果：

```response
[]
```
## emptyArrayInt64 {#emptyarrayint64}

空の Int64 配列を返します。

**構文**

```sql
emptyArrayInt64()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayInt64();
```

結果：

```response
[]
```
## emptyArrayFloat32 {#emptyarrayfloat32}

空の Float32 配列を返します。

**構文**

```sql
emptyArrayFloat32()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayFloat32();
```

結果：

```response
[]
```
## emptyArrayFloat64 {#emptyarrayfloat64}

空の Float64 配列を返します。

**構文**

```sql
emptyArrayFloat64()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayFloat64();
```

結果：

```response
[]
```
## emptyArrayDate {#emptyarraydate}

空の Date 配列を返します。

**構文**

```sql
emptyArrayDate()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayDate();
```
## emptyArrayDateTime {#emptyarraydatetime}

空の DateTime 配列を返します。

**構文**

```sql
[]
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayDateTime();
```

結果：

```response
[]
```
## emptyArrayString {#emptyarraystring}

空の String 配列を返します。

**構文**

```sql
emptyArrayString()
```

**引数**

なし。

**返り値**

空の配列。

**例**

クエリ：

```sql
SELECT emptyArrayString();
```

結果：

```response
[]
```
## emptyArrayToSingle {#emptyarraytosingle}

空の配列を受け取り、デフォルト値と等しい一要素配列を返します。
## range(end), range(\[start, \] end \[, step\]) {#rangeend-rangestart--end--step}

`start` から `end - 1` までの数字の配列を返します。サポートされる型は [UInt8, UInt16, UInt32, UInt64, Int8, Int16, Int32, Int64](../data-types/int-uint.md)です。

**構文**

```sql
range([start, ] end [, step])
```

**引数**

- `start` — 配列の最初の要素。オプションで、`step` を使用する場合に必要です。デフォルト値: 0。
- `end` — 配列が構築される直前の数値。必須です。
- `step` — 配列内の各要素間の増分を決定します。オプションです。デフォルト値: 1。

**返り値**

- `start` から `end - 1` までの数字の配列。

**実装の詳細**

- 全ての引数 `start`, `end`, `step` は `UInt8`, `UInt16`, `UInt32`, `UInt64`,`Int8`, `Int16`, `Int32`, `Int64` の下にある必要があります。 また、返される配列の要素も引数のすべての型のスーパータイプである必要があります。
- [function_range_max_elements_in_block](../../operations/settings/settings.md#function_range_max_elements_in_block) 設定で指定された要素数よりも長い配列がクエリの結果になる場合は例外がスローされます。
- いずれかの引数が Nullable(Nothing) 型である場合は Null を返します。 いずれかの引数が Null 値 (Nullable(T) 型) である場合は例外がスローされます。

**例**

クエリ：

```sql
SELECT range(5), range(1, 5), range(1, 5, 2), range(-1, 5, 2);
```

結果:

```txt
┌─range(5)────┬─range(1, 5)─┬─range(1, 5, 2)─┬─range(-1, 5, 2)─┐
│ [0,1,2,3,4] │ [1,2,3,4]   │ [1,3]          │ [-1,1,3]        │
└─────────────┴─────────────┴────────────────┴─────────────────┘
```
## array(x1, ...), operator \[x1, ...\] {#arrayx1--operator-x1-}

関数引数から配列を作成します。 引数は定数でなければならず、最も共通の型を持っていなければなりません。 少なくとも 1 つの引数が渡されなければなりません。 そうでない場合、作成する配列のタイプがわかりません。 すなわち、この関数を使用して空の配列を作成することはできません（その場合は、上記で説明した 'emptyArray\*' 関数を使用してください）。 戻り値は、渡された引数のうち最小の共通型 'T' である 'Array(T)' 型です。
## arrayWithConstant(length, elem) {#arraywithconstantlength-elem}

定数 `elem` で満たされた長さ `length` の配列を作成します。
## arrayConcat {#arrayconcat}

引数として渡された配列を結合します。

```sql
arrayConcat(arrays)
```

**引数**

- `arrays` — [Array](/sql-reference/data-types/array) 型の任意の数の引数。

**例**

```sql
SELECT arrayConcat([1, 2], [3, 4], [5, 6]) AS res
```

```text
┌─res───────────┐
│ [1,2,3,4,5,6] │
└───────────────┘
```
## arrayElement(arr, n), operator arr\[n\] {#arrayelementarr-n-operator-arrn}

配列 `arr` からインデックス `n` の要素を取得します。 `n` は任意の整数型でなければなりません。 配列のインデックスは 1 から始まります。

負のインデックスもサポートされます。この場合、配列の末尾から番号付けされた対応する要素が選択されます。 例えば、 `arr[-1]` は配列の最後の要素です。

インデックスが配列の範囲外にある場合、数字の場合はデフォルト値 (数値の場合は 0、文字列の場合は空の文字列など) が返されます。ただし、非定数の配列と定数のインデックスが 0 の場合はエラーが発生します（この場合、エラーメッセージは `Array indices are 1-based` です）。
## has(arr, elem) {#hasarr-elem}

'arr' 配列に 'elem' 要素が含まれているかどうかをチェックします。 配列内に要素が含まれていない場合は `0`、含まれている場合は `1` を返します。

`NULL` は値として処理されます。

```sql
SELECT has([1, 2, NULL], NULL)
```

```text
┌─has([1, 2, NULL], NULL)─┐
│                       1 │
└─────────────────────────┘
```
## arrayElementOrNull(arr, n) {#arrayelementornullarr-n}

配列 `arr` からインデックス `n` の要素を取得します。 `n` は任意の整数型でなければなりません。 配列のインデックスは 1 から始まります。

負のインデックスもサポートされます。この場合、配列の末尾から番号付けされた対応する要素が選択されます。 例えば、 `arr[-1]` は配列の最後の要素です。

インデックスが配列の範囲外にある場合、デフォルト値の代わりに `NULL` が返されます。
### 例 {#examples}

```sql
SELECT arrayElementOrNull([1, 2, 3], 2), arrayElementOrNull([1, 2, 3], 4)
```

```text
 ┌─arrayElementOrNull([1, 2, 3], 2)─┬─arrayElementOrNull([1, 2, 3], 4)─┐
 │                                2 │                             ᴺᵁᴸᴸ │
 └──────────────────────────────────┴──────────────────────────────────┘
```
## hasAll {#hasall}

1 つの配列が他の配列の部分集合かどうかをチェックします。

```sql
hasAll(set, subset)
```

**引数**

- `set` — 要素のセットを持つ任意の型の配列。
- `subset` — `set` と共通の上位型を持つ任意の型の配列で、`set` の部分集合である要素を含みます。

**
## arraySort(\[func,\] arr, ...) {#sort}

`arr`配列の要素を昇順に並べ替えます。`func`関数が指定されている場合、ソート順は配列の要素に`func`関数を適用した結果によって決定されます。`func`が複数の引数を受け取る場合、`arraySort`関数は、`func`の引数に対応する複数の配列が渡されます。詳細な例は、`arraySort`の説明の最後に示されます。

整数値のソートの例：

```sql
SELECT arraySort([1, 3, 3, 0]);
```

```text
┌─arraySort([1, 3, 3, 0])─┐
│ [0,1,3,3]               │
└─────────────────────────┘
```

文字列値のソートの例：

```sql
SELECT arraySort(['hello', 'world', '!']);
```

```text
┌─arraySort(['hello', 'world', '!'])─┐
│ ['!','hello','world']              │
└────────────────────────────────────┘
```

`NULL`、`NaN`、`Inf`値のソート順序を考慮した例：

```sql
SELECT arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf]);
```

```text
┌─arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf])─┐
│ [-inf,-4,1,2,3,inf,nan,nan,NULL,NULL]                     │
└───────────────────────────────────────────────────────────┘
```

- `-Inf`値は配列の先頭に配置されます。
- `NULL`値は配列の最後に配置されます。
- `NaN`値は`NULL`の直前に配置されます。
- `Inf`値は`NaN`の直前に配置されます。

`arraySort`は[高階関数](/sql-reference/functions/overview#higher-order-functions)であることに注意してください。最初の引数としてラムダ関数を渡すことができます。この場合、ソート順序は配列の要素にラムダ関数を適用した結果によって決定されます。

以下の例を考えます：

```sql
SELECT arraySort((x) -> -x, [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [3,2,1] │
└─────────┘
```

ソース配列の各要素に対して、ラムダ関数はソートキー、つまり、\[1 –\> -1, 2 –\> -2, 3 –\> -3\]を返します。`arraySort`関数はキーを昇順にソートするため、結果は\[3, 2, 1\]となります。したがって、`(x) –> -x`のラムダ関数は、ソートで[降順](#arrayreversesort)を設定します。

ラムダ関数は複数の引数を受け取ることができます。この場合、`arraySort`関数にラムダ関数の引数に対応する複数の同じ長さの配列を渡す必要があります。結果の配列には最初の入力配列の要素が含まれ、次の入力配列の要素はソートキーを指定します。例：

```sql
SELECT arraySort((x, y) -> y, ['hello', 'world'], [2, 1]) as res;
```

```text
┌─res────────────────┐
│ ['world', 'hello'] │
└────────────────────┘
```

ここでは、第二の配列（\[2, 1\]）に渡された要素が、ソース配列（\['hello', 'world'\]）の対応する要素に対するソートキーを定義し、\['hello' –\> 2, 'world' –\> 1\]になります。ラムダ関数は`x`を使用していないため、ソース配列の実際の値は結果の順序に影響しません。したがって、'hello'は結果の2番目の要素になり、'world'は最初の要素になります。

その他の例は以下の通りです。

```sql
SELECT arraySort((x, y) -> y, [0, 1, 2], ['c', 'b', 'a']) as res;
```

```text
┌─res─────┐
│ [2,1,0] │
└─────────┘
```

```sql
SELECT arraySort((x, y) -> -y, [0, 1, 2], [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [2,1,0] │
└─────────┘
```

:::note
ソート効率を向上させるために、[Schwartzian変換](https://en.wikipedia.org/wiki/Schwartzian_transform)が使用されます。
:::
## arrayAUCPR {#arrayaucpr}

適合率-再現率(PR)曲線の下の領域を計算します。
適合率-再現率曲線は、すべてのしきい値にわたってy軸に適合率、x軸に再現率をプロットして作成されます。
結果の値は0から1の範囲で、より高い値はモデルの性能が良いことを示します。
PR AUCは、不均衡なデータセットに特に有用であり、ROC AUCと比較してパフォーマンスをより明確に比較できます。
詳細については、[こちら](https://developers.google.com/machine-learning/glossary#pr-auc-area-under-the-pr-curve)、[こちら](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc#expandable-1)、および[こちら](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve)を参照してください。

**構文**

```sql
arrayAUCPR(arr_scores, arr_labels[, arr_partial_offsets])
```

エイリアス: `arrayPRAUC`

**引数**

- `arr_scores` — モデルの予測値。[整数](../data-types/int-uint.md)または[浮動小数点数](../data-types/float.md)の[配列](/sql-reference/data-types/array)。
- `arr_labels` — サンプルのラベル。通常、正のサンプルには1、負のサンプルには0が設定されます。[整数](../data-types/int-uint.md)または[列挙](../data-types/enum.md)の[配列](/sql-reference/data-types/array)。
- `arr_partial_offsets` — オプションです。PR曲線の部分面積を計算するための3つの非負整数の配列（PR空間の垂直バンドに相当）です。このオプションは、PR AUCの分散計算に役立ちます。配列は次の要素 [`higher_partitions_tp`, `higher_partitions_fp`, `total_positives`] を含んでいる必要があります。非負整数の[整数](../data-types/int-uint.md)の[配列](/sql-reference/data-types/array)。オプション。
    - `higher_partitions_tp`: より高いスコアの分割に含まれる正のラベルの数。
    - `higher_partitions_fp`: より高いスコアの分割に含まれる負のラベルの数。
    - `total_positives`: 全データセット内の正のサンプルの総数。

::::Note
`arr_partial_offsets`を使用する場合、`arr_scores`および`arr_labels`は、データセット全体の一部であるべきであり、特定の範囲内のデータスコアを含んでいるパーティションのみである必要があります。
データセットは連続するパーティションに分割され、各パーティションには特定の範囲内のスコアに該当するデータの部分集合が含まれている必要があります。
例:
- あるパーティションには、範囲[0, 0.5)のすべてのスコアが含まれます。
- 別のパーティションには、範囲[0.5, 1.0]のスコアが含まれます。
::::

**返り値**

適合率-再現率(PR)曲線の下の面積を返します。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
select arrayAUCPR([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]);
```

結果:

```text
┌─arrayAUCPR([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])─┐
│                              0.8333333333333333 │
└─────────────────────────────────────────────────┘
```
