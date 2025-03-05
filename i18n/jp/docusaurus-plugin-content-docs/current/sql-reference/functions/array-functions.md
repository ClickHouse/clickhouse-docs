
---
slug: /sql-reference/functions/array-functions
sidebar_position: 10
sidebar_label: 配列
---

# 配列関数
## empty {#empty}

入力配列が空であるかどうかをチェックします。

**構文**

``` sql
empty([x])
```

配列が空であると見なされるのは、要素が全く含まれていない場合です。

:::note
[`optimize_functions_to_subcolumns` 設定](../../operations/settings/settings.md#optimize-functions-to-subcolumns)を有効にすることで最適化できます。 `optimize_functions_to_subcolumns = 1`の場合、関数は配列カラム全体を読み取るのではなく、[size0](/sql-reference/data-types/array#array-size)サブカラムのみを読み取ります。クエリ `SELECT empty(arr) FROM TABLE;` は `SELECT arr.size0 = 0 FROM TABLE;` に変換されます。
:::

この関数は[string](string-functions.md#empty)や[UUID](uuid-functions.md#empty)にも適用できます。

**引数**

- `[x]` — 入力配列。 [Array](/sql-reference/data-types/array)。

**返される値**

- 空の配列に対して `1` を、非空の配列に対して `0` を返します。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT empty([]);
```

結果:

```text
┌─empty(array())─┐
│              1 │
└────────────────┘
```
## notEmpty {#notempty}

入力配列が非空であるかどうかをチェックします。

**構文**

``` sql
notEmpty([x])
```

配列が非空であると見なされるのは、少なくとも1つの要素が含まれている場合です。

:::note
[optimize_functions_to_subcolumns](../../operations/settings/settings.md#optimize-functions-to-subcolumns)設定を有効にすることで最適化できます。 `optimize_functions_to_subcolumns = 1`の場合、関数は配列カラム全体を読み取るのではなく、[size0](/sql-reference/data-types/array#array-size)サブカラムのみを読み取ります。クエリ `SELECT notEmpty(arr) FROM table` は `SELECT arr.size0 != 0 FROM TABLE` に変換されます。
:::

この関数は[string](string-functions.md#notempty)や[UUID](uuid-functions.md#notempty)にも適用できます。

**引数**

- `[x]` — 入力配列。 [Array](/sql-reference/data-types/array)。

**返される値**

- 非空の配列に対して `1` を、空の配列に対して `0` を返します。 [UInt8](../data-types/int-uint.md)。

**例**

クエリ:

```sql
SELECT notEmpty([1,2]);
```

結果:

```text
┌─notEmpty([1, 2])─┐
│                1 │
└──────────────────┘
```
## length {#length}

配列のアイテム数を返します。
結果の型は UInt64 です。
この関数は文字列にも適用できます。

[optimize_functions_to_subcolumns](../../operations/settings/settings.md#optimize-functions-to-subcolumns)設定を有効にすることで最適化できます。 `optimize_functions_to_subcolumns = 1` の場合、関数は配列カラム全体を読み取るのではなく、[size0](/sql-reference/data-types/array#array-size)サブカラムのみを読み取ります。クエリ `SELECT length(arr) FROM table` は `SELECT arr.size0 FROM TABLE` に変換されます。

エイリアス: `OCTET_LENGTH`
## emptyArrayUInt8 {#emptyarrayuint8}

空の UInt8 配列を返します。

**構文**

```sql
emptyArrayUInt8()
```

**引数**

なし。

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayUInt8();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayUInt16();

```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayUInt32();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayUInt64();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayInt8();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayInt16();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayInt32();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayInt64();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayFloat32();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayFloat64();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayDateTime();
```

結果:

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

**返される値**

空の配列。

**例**

クエリ:

```sql
SELECT emptyArrayString();
```

結果:

```response
[]
```
## emptyArrayToSingle {#emptyarraytosingle}

空の配列を受け取り、デフォルト値に等しい1要素の配列を返します。
## range(end), range(\[start, \] end \[, step\]) {#rangeend-rangestart--end--step}

`start` から `end - 1` まで `step` ごとの数の配列を返します。サポートされている型は[UInt8, UInt16, UInt32, UInt64, Int8, Int16, Int32, Int64](../data-types/int-uint.md)です。

**構文**

``` sql
range([start, ] end [, step])
```

**引数**

- `start` — 配列の最初の要素。オプションで、`step` が使用された場合は必須。デフォルト値: 0。
- `end` — 配列が構築される前の数値。必須。
- `step` — 配列内の各要素間の増分ステップを決定します。オプションです。デフォルト値: 1。

**返される値**

- `start` から `end - 1` までの `step` ごとの数の配列。

**実装の詳細**

- すべての引数 `start`、`end`、`step` は次のデータ型の範囲内でなければなりません: `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Int8`, `Int16`, `Int32`, `Int64`、および返される配列の要素の型はすべての引数のスーパータイプです。
- クエリが配列の合計長が[function_range_max_elements_in_block](../../operations/settings/settings.md#function_range_max_elements_in_block)設定によって指定された数を超える場合、例外がスローされます。
- 任意の引数が Nullable(Nothing) 型の場合、Null を返します。任意の引数が Null 値 (Nullable(T) 型) を持つ場合、例外がスローされます。

**例**

クエリ:

``` sql
SELECT range(5), range(1, 5), range(1, 5, 2), range(-1, 5, 2);
```

結果:

```txt
┌─range(5)────┬─range(1, 5)─┬─range(1, 5, 2)─┬─range(-1, 5, 2)─┐
│ [0,1,2,3,4] │ [1,2,3,4]   │ [1,3]          │ [-1,1,3]        │
└─────────────┴─────────────┴────────────────┴─────────────────┘
```
## array(x1, ...), operator \[x1, ...\] {#arrayx1--operator-x1-}

関数引数から配列を作成します。
引数は定数である必要があり、最小の共通型を持つ必要があります。少なくとも1つの引数を渡す必要があります。そうでなければ、どの型の配列を作成するか不明です。つまり、この関数を使用して空の配列を作成することはできません (空の配列を作成するには、上記の 'emptyArray*' 関数を使用します)。
渡された引数の最小共通型である 'Array(T)' 型の結果を返します。
## arrayWithConstant(length, elem) {#arraywithconstantlength-elem}

長さ `length` の配列を作成し、定数 `elem` で満たします。
## arrayConcat {#arrayconcat}

引数として渡された配列を結合します。

``` sql
arrayConcat(arrays)
```

**引数**

- `arrays` – [Array](/sql-reference/data-types/array) 型の任意の数の引数。

**例**

``` sql
SELECT arrayConcat([1, 2], [3, 4], [5, 6]) AS res
```

``` text
┌─res───────────┐
│ [1,2,3,4,5,6] │
└───────────────┘
```
## arrayElement(arr, n), operator arr\[n\] {#arrayelementarr-n-operator-arrn}

配列 `arr` からインデックス `n` の要素を取得します。 `n` は任意の整数型でなければなりません。
配列内のインデックスは1から始まります。

負のインデックスもサポートされています。この場合、後ろから数えた対応する要素を選択します。たとえば、`arr[-1]` は配列の最後のアイテムです。

インデックスが配列の範囲外にある場合は、デフォルト値を返します (数字の場合は0、文字列の場合は空文字列など)。ただし、非定数配列と定数インデックス0の場合は、エラー `Array indices are 1-based` が発生します。
## has(arr, elem) {#hasarr-elem}

'arr' 配列に 'elem' 要素が存在するかどうかをチェックします。
要素が配列にない場合は0を、存在する場合は1を返します。

`NULL` は値として処理されます。

``` sql
SELECT has([1, 2, NULL], NULL)
```

``` text
┌─has([1, 2, NULL], NULL)─┐
│                       1 │
└─────────────────────────┘
```
## arrayElementOrNull(arr, n) {#arrayelementornullarr-n}

配列 `arr` からインデックス `n` の要素を取得します。 `n` は任意の整数型でなければなりません。
配列内のインデックスは1から始まります。

負のインデックスもサポートされています。この場合、後ろから数えた対応する要素を選択します。たとえば、`arr[-1]` は配列の最後のアイテムです。

インデックスが配列の範囲外にある場合は、デフォルト値の代わりに `NULL` を返します。
### 例 {#examples}

``` sql
SELECT arrayElementOrNull([1, 2, 3], 2), arrayElementOrNull([1, 2, 3], 4)
```

``` text
 ┌─arrayElementOrNull([1, 2, 3], 2)─┬─arrayElementOrNull([1, 2, 3], 4)─┐
 │                                2 │                             ᴺᵁᴸᴸ │
 └──────────────────────────────────┴──────────────────────────────────┘
```
## hasAll {#hasall}

1つの配列が別の配列の部分集合であるかどうかをチェックします。

``` sql
hasAll(set, subset)
```

**引数**

- `set` – 要素の集合を持つ任意の型の配列。
- `subset` – `set` と共通のスーパータイプを持つ要素を持つ任意の型の配列で、`set` の部分集合であるべき要素を含みます。

**返される値**

- `1`、もし `set` が `subset` のすべてのコレクションを含む場合。
- それ以外の場合は `0`。

セットとサブセットの要素が共通のスーパータイプを持たない場合、例外 `NO_COMMON_TYPE` がスローされます。

**特異な特性**

- 空の配列は任意の配列の部分集合です。
- `Null` は値として処理されます。
- 両方の配列の値の順序は重要ではありません。

**例**

`SELECT hasAll([], [])` は1を返します。

`SELECT hasAll([1, Null], [Null])` は1を返します。

`SELECT hasAll([1.0, 2, 3, 4], [1, 3])` は1を返します。

`SELECT hasAll(['a', 'b'], ['a'])` は1を返します。

`SELECT hasAll([1], ['a'])` は `NO_COMMON_TYPE` 例外をスローします。

`SELECT hasAll([[1, 2], [3, 4]], [[1, 2], [3, 5]])` は0を返します。
## hasAny {#hasany}

2つの配列がどれかの要素で交差しているかどうかをチェックします。

``` sql
hasAny(array1, array2)
```

**引数**

- `array1` – 要素の集合を持つ任意の型の配列。
- `array2` – `array1` と共通のスーパータイプを持つ任意の型の配列。

**返される値**

- `1`、もし `array1` と `array2` に少なくとも一つの同じ要素があれば。
- それ以外の場合は `0`。

array1 と array2 の要素が共通のスーパータイプを持たない場合、例外 `NO_COMMON_TYPE` が発生します。

**特異な特性**

- `Null` は値として処理されます。
- 両方の配列の値の順序は重要ではありません。

**例**

`SELECT hasAny([1], [])` は `0` を返します。

`SELECT hasAny([Null], [Null, 1])` は `1` を返します。

`SELECT hasAny([-128, 1., 512], [1])` は `1` を返します。

`SELECT hasAny([[1, 2], [3, 4]], ['a', 'c'])` は `NO_COMMON_TYPE` 例外をスローします。

`SELECT hasAll([[1, 2], [3, 4]], [[1, 2], [1, 2]])` は `1` を返します。
## hasSubstr {#hassubstr}

配列2のすべての要素が、配列1に同じ順序で現れるかどうかをチェックします。したがって、関数は `array1 = prefix + array2 + suffix` である場合にのみ1を返します。

``` sql
hasSubstr(array1, array2)
```

言い換えれば、関数は `array2` のすべての要素が `array1` に含まれているかどうかを `hasAll` 関数のようにチェックします。さらに、要素が両方の `array1` と `array2` で同じ順序で観察されることを確認します。

たとえば:

- `hasSubstr([1,2,3,4], [2,3])` は1を返します。ただし、`hasSubstr([1,2,3,4], [3,2])` は `0` を返します。
- `hasSubstr([1,2,3,4], [1,2,3])` は1を返します。ただし、`hasSubstr([1,2,3,4], [1,2,4])` は `0` を返します。

**引数**

- `array1` – 要素の集合を持つ任意の型の配列。
- `array2` – 要素の集合を持つ任意の型の配列。

**返される値**

- `1`、もし `array1` が `array2` を含んでいれば。
- それ以外の場合は `0`。

array1 と array2 の要素が共通のスーパータイプを持たない場合、例外 `NO_COMMON_TYPE` が発生します。

**特異な特性**

- `array2` が空の場合、関数は `1` を返します。
- `Null` は値として処理されます。言い換えれば、`hasSubstr([1, 2, NULL, 3, 4], [2,3])` は `0` を返します。ただし、`hasSubstr([1, 2, NULL, 3, 4], [2,NULL,3])` は `1` を返します。
- 両方の配列の値の順序は重要です。

**例**

`SELECT hasSubstr([], [])` は1を返します。

`SELECT hasSubstr([1, Null], [Null])` は1を返します。

`SELECT hasSubstr([1.0, 2, 3, 4], [1, 3])` は0を返します。

`SELECT hasSubstr(['a', 'b'], ['a'])` は1を返します。

`SELECT hasSubstr(['a', 'b' , 'c'], ['a', 'b'])` は1を返します。

`SELECT hasSubstr(['a', 'b' , 'c'], ['a', 'c'])` は0を返します。

`SELECT hasSubstr([[1, 2], [3, 4], [5, 6]], [[1, 2], [3, 4]])` は1を返します。

`SELECT hasSubstr([1, 2, NULL, 3, 4], ['a'])` は `NO_COMMON_TYPE` 例外をスローします。
## indexOf(arr, x) {#indexofarr-x}

配列内に値 'x' を持つ最初の要素のインデックスを返します (1 からスタート)。配列が検索対象の値を含まない場合、この関数は0を返します。

例:

``` sql
SELECT indexOf([1, 3, NULL, NULL], NULL)
```

``` text
┌─indexOf([1, 3, NULL, NULL], NULL)─┐
│                                 3 │
└───────────────────────────────────┘
```

`NULL` に設定された要素は通常の値として処理されます。
## indexOfAssumeSorted(arr, x) {#indexofassumesortedarr-x}

配列内に値 'x' を持つ最初の要素のインデックスを返します (1 からスタート)。配列が検索対象の値を含まない場合、この関数は0を返します。
配列が昇順にソートされていると仮定します (すなわち、関数は二分探索を使用します)。
配列がソートされていない場合、結果は未定義です。
内部配列が Nullable 型の場合、`indexOf` 関数が呼び出されます。

例:

``` sql
SELECT indexOfAssumeSorted([1, 3, 3, 3, 4, 4, 5], 4)
```

``` text
┌─indexOfAssumeSorted([1, 3, 3, 3, 4, 4, 5], 4)─┐
│                                             5 │
└───────────────────────────────────────────────┘
```
## arrayCount(\[func,\] arr1, ...) {#arraycountfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が0以外の値を返す要素の数を返します。 `func` が指定されていない場合、配列内の非ゼロ要素の数を返します。

`arrayCount` は[高次関数](/sql-reference/functions/overview#higher-order-functions)であることに注意してください。最初の引数としてラムダ関数を渡すことができます。
## arrayDotProduct {#arraydotproduct}

2つの配列の内積を返します。

**構文**

```sql
arrayDotProduct(vector1, vector2)
```

エイリアス: `scalarProduct`, `dotProduct`

**パラメータ**

- `vector1`: 最初のベクトル。 [Array](/sql-reference/data-types/array) または数値の [Tuple](../data-types/tuple.md) 。
- `vector2`: 2 番目のベクトル。 [Array](/sql-reference/data-types/array) または数値の [Tuple](../data-types/tuple.md) 。

:::note
2つのベクトルのサイズは等しい必要があります。配列とタプルは、混合要素型を含むことも可能です。
:::

**返される値**

- 2つのベクトルの内積。 [Numeric](/native-protocol/columns#numeric-types)。

:::note
返される型は引数の型によって決まります。配列やタプルが混合要素型を含む場合、結果の型はスーパータイプになります。
:::

**例**

クエリ:

```sql
SELECT arrayDotProduct([1, 2, 3], [4, 5, 6]) AS res, toTypeName(res);
```

結果:

```response
32	UInt16
```

クエリ:

```sql
SELECT dotProduct((1::UInt16, 2::UInt8, 3::Float32),(4::Int16, 5::Float32, 6::UInt8)) AS res, toTypeName(res);
```

結果:

```response
32	Float64
```
## countEqual(arr, x) {#countequalarr-x}

配列内の x と等しい要素の数を返します。 `arrayCount (elem -> elem = x, arr)` と等価です。

`NULL` 要素は別の値として処理されます。

例:

``` sql
SELECT countEqual([1, 2, NULL, NULL], NULL)
```

``` text
┌─countEqual([1, 2, NULL, NULL], NULL)─┐
│                                    2 │
└──────────────────────────────────────┘
```
## arrayEnumerate(arr) {#arrayenumeratearr}

配列 \[1, 2, 3, ..., length (arr) \] を返します。

この関数は通常 ARRAY JOIN と共に使用されます。ARRAY JOIN を適用した後、各配列について何かを一度だけカウントできます。例:

``` sql
SELECT
    count() AS Reaches,
    countIf(num = 1) AS Hits
FROM test.hits
ARRAY JOIN
    GoalsReached,
    arrayEnumerate(GoalsReached) AS num
WHERE CounterID = 160656
LIMIT 10
```

``` text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

この例では、Reaches は（ARRAY JOIN を適用した後に得られた文字列の）変換の数であり、Hits は（ARRAY JOIN の前の）ページビューの数です。この特定のケースでは、次の簡単な方法で同じ結果を得ることができます。

``` sql
SELECT
    sum(length(GoalsReached)) AS Reaches,
    count() AS Hits
FROM test.hits
WHERE (CounterID = 160656) AND notEmpty(GoalsReached)
```

``` text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

この関数は高次関数でも使用できます。たとえば、条件に一致する要素の配列インデックスを取得するために使用できます。
## arrayEnumerateUniq {#arrayenumerateuniq}

ソース配列と同じサイズの配列を返し、同じ値を持つ要素ごとにその位置を示します。
たとえば: arrayEnumerateUniq(\[10, 20, 10, 30\]) = \[1, 1, 2, 1\]。

この関数は、ARRAY JOIN と配列要素の集約を使用するときに便利です。
例:

``` sql
SELECT
    Goals.ID AS GoalID,
    sum(Sign) AS Reaches,
    sumIf(Sign, num = 1) AS Visits
FROM test.visits
ARRAY JOIN
    Goals,
    arrayEnumerateUniq(Goals.ID) AS num
WHERE CounterID = 160656
GROUP BY GoalID
ORDER BY Reaches DESC
LIMIT 10
```

``` text
┌──GoalID─┬─Reaches─┬─Visits─┐
│   53225 │    3214 │   1097 │
│ 2825062 │    3188 │   1097 │
│   56600 │    2803 │    488 │
│ 1989037 │    2401 │    365 │
│ 2830064 │    2396 │    910 │
│ 1113562 │    2372 │    373 │
│ 3270895 │    2262 │    812 │
│ 1084657 │    2262 │    345 │
│   56599 │    2260 │    799 │
│ 3271094 │    2256 │    812 │
└─────────┴─────────┴────────┘
```

この例では、各目標 ID に対して変換の数（Goals ネストデータ構造内の各要素は到達した目標、すなわち変換と呼ばれます）とセッションの数を計算しています。ARRAY JOIN がない場合、セッションの数を`sum(Sign)`としてカウントしていました。しかし、この特定のケースでは、行がネストされた Goals 構造によって倍増したため、この後に各セッションを一度だけカウントするための条件を `arrayEnumerateUniq(Goals.ID)` 関数の値に適用しています。

arrayEnumerateUniq 関数は、同じサイズの複数の配列を引数としてとることができます。この場合、同じ位置にある全ての配列のタプルに対してユニークさが考慮されます。

``` sql
SELECT arrayEnumerateUniq([1, 1, 1, 2, 2, 2], [1, 1, 2, 1, 1, 2]) AS res
```

``` text
┌─res───────────┐
│ [1,2,1,1,2,1] │
└───────────────┘
```

これは、ネストされたデータ構造を持つ ARRAY JOIN を使用し、複数の要素に対する集約を行う際に必要です。
## arrayEnumerateUniqRanked {#arrayenumerateuniqranked}

ソース配列と同じサイズの配列を返し、同じ値を持つ要素ごとにその位置を示します。マルチディメンショナル配列を枚挙する際にどの深さまで調べるかを指定できる機能を提供します。

**構文**

```sql
arrayEnumerateUniqRanked(clear_depth, arr, max_array_depth)
```

**パラメータ**

- `clear_depth`: 指定されたレベルで要素を別々に枚挙します。正の[整数](../data-types/int-uint.md)で、`max_arr_depth` 以下でなければなりません。
- `arr`: 枚挙する N 次元配列。 [Array](/sql-reference/data-types/array)。
- `max_array_depth`: 最大有効深度です。正の[整数](../data-types/int-uint.md)で、`arr` の深度以下でなければなりません。

**例**

`clear_depth=1` および `max_array_depth=1` の場合、`arrayEnumerateUniqRanked` の結果は、同じ配列で `arrayEnumerateUniq` が返すものと同一です。

クエリ:

``` sql
SELECT arrayEnumerateUniqRanked(1, [1,2,1], 1);
```

結果:

``` text
[1,1,2]
```

この例では、`arrayEnumerateUniqRanked` を使用して、マルチディメンショナル配列の各要素に対して、同じ値を持つ要素の中での位置を示す配列を取得することができます。渡された配列の最初の行 `[1,2,3]` に対して得られる結果は `[1,1,1]` であり、これは `1`、`2` および `3` が初めて出現したことを示しています。渡された配列の2行目 `[2,2,1]` の対応する結果は `[2,3,3]` であり、`2` が2回と3回出現し、`1` が2回出現したことを示しています。同様に、渡された配列の3行目 `[3]` の対応する結果は `[2]` であり、`3` が2回出現したことを示しています。

クエリ:

``` sql
SELECT arrayEnumerateUniqRanked(1, [[1,2,3],[2,2,1],[3]], 2);
```

結果:

``` text
[[1,1,1],[2,3,2],[2]]
```

`clear_depth=2` に変更すると、各行について要素が別々に枚挙される結果になります。

クエリ:

``` sql
SELECT arrayEnumerateUniqRanked(2, [[1,2,3],[2,2,1],[3]], 2);
```

結果:

``` text
[[1,1,1],[1,2,1],[1]]
```
## arrayPopBack {#arraypopback}

配列から最後の要素を削除します。

``` sql
arrayPopBack(array)
```

**引数**

- `array` – 配列。

**例**

``` sql
SELECT arrayPopBack([1, 2, 3]) AS res;
```

``` text
┌─res───┐
│ [1,2] │
└───────┘
```
## arrayPopFront {#arraypopfront}

配列から最初の要素を削除します。

``` sql
arrayPopFront(array)
```

**引数**

- `array` – 配列。

**例**

``` sql
SELECT arrayPopFront([1, 2, 3]) AS res;
```

``` text
┌─res───┐
│ [2,3] │
└───────┘
```
## arrayPushBack {#arraypushback}

配列の最後に1つのアイテムを追加します。

``` sql
arrayPushBack(array, single_value)
```

**引数**

- `array` – 配列。
- `single_value` – 単一の値。数字だけを持つ配列には数字のみが追加でき、文字列だけを持つ配列には文字列のみが追加できます。数字を追加する際、ClickHouse は自動的にデータ型に携わる `single_value` の型をセットします。ClickHouse のデータ型に関する詳細は「[データ型](../data-types/index.md#data_types)」を参照してください。`NULL` であっても構いません。この関数は配列に `NULL` 要素を追加し、配列要素の型が `Nullable` に変換されます。

**例**

``` sql
SELECT arrayPushBack(['a'], 'b') AS res;
```

``` text
┌─res───────┐
│ ['a','b'] │
└───────────┘
```
## arrayPushFront {#arraypushfront}

配列の先頭に1つの要素を追加します。

``` sql
arrayPushFront(array, single_value)
```

**引数**

- `array` – 配列。
- `single_value` – 単一の値。数字だけを持つ配列には数字のみを追加でき、文字列だけを持つ配列には文字列のみが追加できます。数字を追加する際、ClickHouse は自動的にデータ型に携わる `single_value` の型をセットします。ClickHouse のデータ型に関する詳細は「[データ型](../data-types/index.md#data_types)」を参照してください。`NULL` であっても構いません。この関数は配列に `NULL` 要素を追加し、配列要素の型が `Nullable` に変換されます。

**例**

``` sql
SELECT arrayPushFront(['b'], 'a') AS res;
```

``` text
┌─res───────┐
│ ['a','b'] │
└───────────┘
```
## arrayResize {#arrayresize}

配列の長さを変更します。

``` sql
arrayResize(array, size[, extender])
```

**引数:**

- `array` — 配列。
- `size` — 配列の必須の長さ。
  - `size` が配列の元のサイズより少ない場合、配列は右からトリミングされます。
- `size` が配列の初期サイズより大きい場合、配列は右側に `extender` 値または配列アイテムのデータ型に対するデフォルト値で拡張されます。
- `extender` — 配列を拡張するための値。`NULL` であっても構いません。

**返される値:**

長さ `size` の配列。

**呼び出しの例**

``` sql
SELECT arrayResize([1], 3);
```

``` text
┌─arrayResize([1], 3)─┐
│ [1,0,0]             │
└─────────────────────┘
```

``` sql
SELECT arrayResize([1], 3, NULL);
```

``` text
┌─arrayResize([1], 3, NULL)─┐
│ [1,NULL,NULL]             │
└───────────────────────────┘
```
## arraySlice {#arrayslice}

配列のスライスを返します。

``` sql
arraySlice(array, offset[, length])
```

**引数**

- `array` – データの配列。
- `offset` – 配列の端からのインデント。正の値は左からのオフセットを示し、負の値は右からのインデントを示します。配列アイテムの番号は1から始まります。
- `length` – 要求されるスライスの長さ。負の値を指定すると、関数はオープンスライス `[offset, array_length - length]` を返します。値を省略すると、関数は `[offset, the_end_of_array]` のスライスを返します。

**例**

``` sql
SELECT arraySlice([1, 2, NULL, 4, 5], 2, 3) AS res;
```

``` text
┌─res────────┐
│ [2,NULL,4] │
└────────────┘
```

配列に設定された `NULL` 要素は通常の値として処理されます。
## arrayShingles {#arrayshingles}

指定された長さの入力配列の「シングル」を生成する配列を生成します。

**構文**

``` sql
arrayShingles(array, length)
```

**引数**

- `array` — 入力配列。 [Array](/sql-reference/data-types/array)。
- `length` — 各シングルの長さ。

**返される値**

生成されたシングルの配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT arrayShingles([1,2,3,4], 3) as res;
```

結果:

``` text
┌─res───────────────┐
│ [[1,2,3],[2,3,4]] │
└───────────────────┘
```
## arraySort(\[func,\] arr, ...) {#sort}

`arr` 配列の要素を昇順にソートします。`func` 関数が指定されている場合、ソート順序は配列の要素に `func` 関数を適用した結果によって決まります。`func` が複数の引数を受け取る場合、`arraySort` 関数には `func` の引数に対応する複数の配列が渡されます。詳細な例は `arraySort` の説明の最後に示されています。

整数値のソートの例:

``` sql
SELECT arraySort([1, 3, 3, 0]);
```

``` text
┌─arraySort([1, 3, 3, 0])─┐
│ [0,1,3,3]               │
└─────────────────────────┘
```

文字列のソートの例:

``` sql
SELECT arraySort(['hello', 'world', '!']);
```

``` text
┌─arraySort(['hello', 'world', '!'])─┐
│ ['!','hello','world']              │
└────────────────────────────────────┘
```

`NULL`、`NaN`、`Inf` 値の次のソート順序を考慮してください:

``` sql
SELECT arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf]);
```

``` text
┌─arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf])─┐
│ [-inf,-4,1,2,3,inf,nan,nan,NULL,NULL]                     │
└───────────────────────────────────────────────────────────┘
```

- `-Inf` 値は配列の最初に来ます。
- `NULL` 値は配列の最後に来ます。
- `NaN` 値は `NULL` の直前に来ます。
- `Inf` 値は `NaN` の直前に来ます。

`arraySort` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。最初の引数としてラムダ関数を渡すことができます。この場合、ソート順序は配列の要素に適用されるラムダ関数の結果によって決まります。

以下の例を考えてみましょう:

``` sql
SELECT arraySort((x) -> -x, [1, 2, 3]) as res;
```

``` text
┌─res─────┐
│ [3,2,1] │
└─────────┘
```

ソース配列の各要素に対して、ラムダ関数はソートキーを返します。すなわち、\[1 –\> -1, 2 –\> -2, 3 –\> -3\] です。`arraySort` 関数はキーを昇順でソートするので、結果は \[3, 2, 1\] となります。したがって、`(x) –> -x` ラムダ関数はソートの [降順](#arrayreversesort) を設定します。

ラムダ関数は複数の引数を受け取ることができます。この場合、ラムダ関数の引数に対応する同じ長さの複数の配列を `arraySort` 関数に渡す必要があります。結果の配列は最初の入力配列の要素で構成されます。次の入力配列の要素はソートキーを指定します。例として:

``` sql
SELECT arraySort((x, y) -> y, ['hello', 'world'], [2, 1]) as res;
```

``` text
┌─res────────────────┐
│ ['world', 'hello'] │
└────────────────────┘
```

ここでは、2 番目の配列に渡される要素 (\[2, 1\]) が、ソース配列 (\['hello', 'world'\]) からの対応する要素のソートキーを定義します。すなわち、\['hello' –\> 2, 'world' –\> 1\] です。ラムダ関数は `x` を使用していないため、ソース配列の実際の値は結果の順序に影響しません。したがって、'hello' は結果の2番目の要素になり、'world' は最初の要素になります。

他の例は以下に示します。

``` sql
SELECT arraySort((x, y) -> y, [0, 1, 2], ['c', 'b', 'a']) as res;
```

``` text
┌─res─────┐
│ [2,1,0] │
└─────────┘
```

``` sql
SELECT arraySort((x, y) -> -y, [0, 1, 2], [1, 2, 3]) as res;
```

``` text
┌─res─────┐
│ [2,1,0] │
└─────────┘
```

:::note
ソート効率を改善するために、[シュワルツィアン変換](https://en.wikipedia.org/wiki/Schwartzian_transform) が使用されます。
:::
## arrayPartialSort(\[func,\] limit, arr, ...) {#arraypartialsortfunc-limit-arr-}

制限引数 `limit` により部分的ソートを可能にする `arraySort` と同様です。元の配列と同じサイズの配列を返しますが、範囲 `[1..limit]` 内の要素が昇順にソートされます。残りの要素 `(limit..N]` は未指定の順序の要素を含みます。
## arrayReverseSort {#arrayreversesort}

`arr` 配列の要素を降順にソートします。`func` 関数が指定されている場合、`arr` は配列の要素に適用される `func` 関数の結果に従ってソートされ、ソートされた配列は逆順にされます。`func` が複数の引数を受け取る場合、`arrayReverseSort` 関数には `func` の引数に対応する複数の配列が渡されます。詳細な例は `arrayReverseSort` の説明の最後に示されています。

**構文**

```sql
arrayReverseSort([func,] arr, ...)
```
整数値のソートの例:

``` sql
SELECT arrayReverseSort([1, 3, 3, 0]);
```

``` text
┌─arrayReverseSort([1, 3, 3, 0])─┐
│ [3,3,1,0]                      │
└────────────────────────────────┘
```

文字列のソートの例:

``` sql
SELECT arrayReverseSort(['hello', 'world', '!']);
```

``` text
┌─arrayReverseSort(['hello', 'world', '!'])─┐
│ ['world','hello','!']                     │
└───────────────────────────────────────────┘
```

`NULL`、`NaN`、`Inf` 値の次のソート順序を考慮してください:

``` sql
SELECT arrayReverseSort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf]) as res;
```

``` text
┌─res───────────────────────────────────┐
│ [inf,3,2,1,-4,-inf,nan,nan,NULL,NULL] │
└───────────────────────────────────────┘
```

- `Inf` 値は配列の最初に来ます。
- `NULL` 値は配列の最後に来ます。
- `NaN` 値は `NULL` の直前に来ます。
- `-Inf` 値は `NaN` の直前に来ます。

`arrayReverseSort` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。最初の引数としてラムダ関数を渡すことができます。以下に例を示します。

``` sql
SELECT arrayReverseSort((x) -> -x, [1, 2, 3]) as res;
```

``` text
┌─res─────┐
│ [1,2,3] │
└─────────┘
```

配列は次のようにソートされます:

1. まず、ソース配列 (\[1, 2, 3\]) は、配列の要素に適用されたラムダ関数の結果に従ってソートされます。結果は配列 \[3, 2, 1\] です。
2. 前のステップで得られた配列が逆順にされます。したがって、最終結果は \[1, 2, 3\] になります。

ラムダ関数は複数の引数を受け取ることができます。この場合、ラムダ関数の引数に対応する同じ長さの複数の配列を `arrayReverseSort` 関数に渡す必要があります。結果の配列は最初の入力配列の要素で構成され、その次の入力配列の要素がソートキーを指定します。例えば:

``` sql
SELECT arrayReverseSort((x, y) -> y, ['hello', 'world'], [2, 1]) as res;
```

``` text
┌─res───────────────┐
│ ['hello','world'] │
└───────────────────┘
```

この例では、配列は次のようにソートされます:

1. まず、ソース配列 (\['hello', 'world'\]) は、各配列の要素に適用されたラムダ関数の結果に従ってソートされます。2 番目の配列 (\[2, 1\]) に渡される要素は、ソース配列の対応する要素のソートキーを定義します。その結果は配列 \['world', 'hello'\] です。
2. 前のステップでソートされた配列が逆順にされます。したがって、最終結果は \['hello', 'world'\] になります。

他の例は以下に示されます。

``` sql
SELECT arrayReverseSort((x, y) -> y, [4, 3, 5], ['a', 'b', 'c']) AS res;
```

``` text
┌─res─────┐
│ [5,3,4] │
└─────────┘
```

``` sql
SELECT arrayReverseSort((x, y) -> -y, [4, 3, 5], [1, 2, 3]) AS res;
```

``` text
┌─res─────┐
│ [4,3,5] │
└─────────┘
```
## arrayPartialReverseSort(\[func,\] limit, arr, ...) {#arraypartialreversesortfunc-limit-arr-}

部分的なソートを可能にする `limit` 引数を追加した `arrayReverseSort` です。元の配列と同じサイズの配列を返しますが、範囲 `[1..limit]` 内の要素が降順にソートされます。残りの要素 `(limit..N]` は未指定の順序の要素を含みます。
## arrayShuffle {#arrayshuffle}

元の配列と同じサイズの配列を返し、要素をシャッフルされた順序で含みます。
要素は、すべての可能な順列が同じ確率で現れるように再配置されます。

**構文**

```sql
arrayShuffle(arr[, seed])
```

**パラメータ**

- `arr`: 部分的にシャッフルする配列。 [Array](/sql-reference/data-types/array)。
- `seed` (オプション): 乱数生成に使用されるシード。指定しない場合はランダムなものが使用されます。 [UInt または Int](../data-types/int-uint.md)。

**戻り値**

- シャッフルされた要素を持つ配列。

**実装の詳細**

:::note 
この関数は定数をマテリアライズしません。
:::

**例**

この例では、`arrayShuffle` をシードなしで使用すると、乱数によって生成されます。 

クエリ:

```sql
SELECT arrayShuffle([1, 2, 3, 4]);
```

注: [ClickHouse Fiddle](https://fiddle.clickhouse.com/) を使用する際、関数のランダムな性質により、正確な応答は異なる場合があります。

結果: 

```response
[1,4,2,3]
```

この例では、`arrayShuffle` にシードが提供されており、安定した結果を生成します。

クエリ:

```sql
SELECT arrayShuffle([1, 2, 3, 4], 41);
```

結果: 

```response
[3,2,1,4]
```
## arrayPartialShuffle {#arraypartialshuffle}

入力配列の基数 `N` に基づいて、サイズ `N` の配列を返し、範囲 `[1...limit]` 内の要素がシャッフルされ、範囲 `(limit...n]` 内の残りの要素は未シャッフルのままです。

**構文**

```sql
arrayPartialShuffle(arr[, limit[, seed]])
```

**パラメータ**

- `arr`: 部分的にシャッフルする配列のサイズ `N`。 [Array](/sql-reference/data-types/array)。
- `limit` (オプション): 要素のスワップに制限をかける数、範囲 `[1..N]` の値。 [UInt または Int](../data-types/int-uint.md)。
- `seed` (オプション): 乱数生成に使用されるシード値。指定しない場合はランダムなものが使用されます。 [UInt または Int](../data-types/int-uint.md)

**戻り値**

- 部分的にシャッフルされた要素を持つ配列。

**実装の詳細**

:::note 
この関数は定数をマテリアライズしません。

`limit` の値は `[1..N]` の範囲内でなければなりません。その範囲外の値は完全な [arrayShuffle](#arrayshuffle) を実行することと同等です。
:::

**例**

注: [ClickHouse Fiddle](https://fiddle.clickhouse.com/) を使用する際、関数のランダムな性質により、正確な応答は異なる場合があります。 

クエリ:

```sql
SELECT arrayPartialShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1)
```

結果:

要素の順序は保持されます (`[2,3,4,5], [7,8,9,10]`) が、シャッフルされた2つの要素 `[1, 6]` のみが変更されます。シードは指定されていないため、関数がランダムに選択します。

```response
[6,2,3,4,5,1,7,8,9,10]
```

この例では、`limit` が `2` に増やされ、シード値が提供されます。順序 

クエリ:

```sql
SELECT arrayPartialShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
```

要素の順序は保持されます (`[4, 5, 6, 7, 8], [10]`) が、シャッフルされた4つの要素 `[1, 2, 3, 9]` のみが変更されます。

結果: 
```response
[3,9,1,4,5,6,7,8,2,10]
```
## arrayUniq(arr, ...) {#arrayuniqarr-}

1つの引数が渡されると、配列内の異なる要素の数をカウントします。
複数の引数が渡されると、複数の配列の対応する位置にある異なるタプルの数をカウントします。

配列内のユニークなアイテムのリストを取得したい場合は、`arrayReduce('groupUniqArray', arr)` を使用できます。
## arrayJoin(arr) {#arrayjoinarr}

特別な関数です。「["ArrayJoin 関数"](../../sql-reference/functions/array-join.md#functions_arrayjoin)」セクションを参照してください。
## arrayDifference {#arraydifference}

隣接する配列要素間の差の配列を計算します。結果配列の最初の要素は 0 で、2 番目は `a[1] - a[0]`、3 番目は `a[2] - a[1]` となります。結果配列の要素の型は、引き算の型推論ルールによって決まります (例: `UInt8` - `UInt8` = `Int16`)。

**構文**

``` sql
arrayDifference(array)
```

**引数**

- `array` – [Array](/sql-reference/data-types/array)。

**戻り値**

隣接する配列要素間の差の配列を返します。 [UInt\*](/sql-reference/data-types/int-uint#integer-ranges)、 [Int\*](/sql-reference/data-types/int-uint#integer-ranges)、 [Float\*](/sql-reference/data-types/float).

**例**

クエリ:

``` sql
SELECT arrayDifference([1, 2, 3, 4]);
```

結果:

``` text
┌─arrayDifference([1, 2, 3, 4])─┐
│ [0,1,1,1]                     │
└───────────────────────────────┘
```

結果型が Int64 のオーバーフローの例:

クエリ:

``` sql
SELECT arrayDifference([0, 10000000000000000000]);
```

結果:

``` text
┌─arrayDifference([0, 10000000000000000000])─┐
│ [0,-8446744073709551616]                   │
└────────────────────────────────────────────┘
```
## arrayDistinct {#arraydistinct}

配列を受け取り、ユニークな要素のみを含む配列を返します。

**構文**

``` sql
arrayDistinct(array)
```

**引数**

- `array` – [Array](/sql-reference/data-types/array)。

**戻り値**

ユニークな要素を含む配列を返します。

**例**

クエリ:

``` sql
SELECT arrayDistinct([1, 2, 2, 3, 1]);
```

結果:

``` text
┌─arrayDistinct([1, 2, 2, 3, 1])─┐
│ [1,2,3]                        │
└────────────────────────────────┘
```
## arrayEnumerateDense {#arrayenumeratedense}

ソース配列と同じサイズの配列を返し、各要素がソース配列のどこに最初に現れるかを示します。

**構文**

```sql
arrayEnumerateDense(arr)
```

**例**

クエリ:

``` sql
SELECT arrayEnumerateDense([10, 20, 10, 30])
```

結果:

``` text
┌─arrayEnumerateDense([10, 20, 10, 30])─┐
│ [1,2,1,3]                             │
└───────────────────────────────────────┘
```
## arrayEnumerateDenseRanked {#arrayenumeratedenseranked}

ソース配列と同じサイズの配列を返し、各要素がソース配列のどこに最初に現れるかを示します。これは、多次元配列の列挙を可能にし、どの深さまで内部を調べるかを指定する能力を提供します。

**構文**

```sql
arrayEnumerateDenseRanked(clear_depth, arr, max_array_depth)
```

**引数**

- `clear_depth`: 指定されたレベルで要素を別々に列挙します。正の [Integer](../data-types/int-uint.md) で、`max_arr_depth` 以下である必要があります。
- `arr`: 列挙する N 次元配列。 [Array](/sql-reference/data-types/array)。
- `max_array_depth`: 最大有効深度。正の [Integer](../data-types/int-uint.md) で、`arr` の深度以下である必要があります。

**例**

`clear_depth=1` および `max_array_depth=1` の場合、結果は [arrayEnumerateDense](#arrayenumeratedense) が得るものと同じになります。

クエリ:

``` sql
SELECT arrayEnumerateDenseRanked(1,[10, 20, 10, 30],1);
```

結果:

``` text
[1,2,1,3]
```

この例では、`arrayEnumerateDenseRanked` を使用して、多次元配列の各要素について、その同値の要素の中での位置を示す配列を取得します。渡された配列の最初の行 `[10,10,30,20]` に対する結果の対応する最初の行は `[1,1,2,3]` であり、`10` が位置 1 と 2 で見つかった最初の数であり、`30` が位置 3 で見つかった次の数であり、`20` が位置 4 で見つかった3番目の数です。渡された配列の2 番目の行 `[40, 50, 10, 30]` に対する結果の対応する2 行目は `[4,5,1,2]` であり、`40` と `50` がその行の位置 1 と 2 で見つかった4 番目と 5 番目の数であり、別の `10` (最初に見つかった数) は位置 3 にあり、`30` (見つかった2 番目の数) は最後の位置にあります。

クエリ:

``` sql
SELECT arrayEnumerateDenseRanked(1,[[10,10,30,20],[40,50,10,30]],2);
```

結果:

``` text
[[1,1,2,3],[4,5,1,2]]
```

`clear_depth=2` に変更すると、各行ごとに新たに列挙が行われます。

クエリ:

``` sql
SELECT arrayEnumerateDenseRanked(2,[[10,10,30,20],[40,50,10,30]],2);
```
結果:

``` text
[[1,1,2,3],[1,2,3,4]]
```
## arrayUnion {#arrayunion}

複数の配列を受け取り、元の配列のいずれかに存在するすべての要素を含む配列を返します。
結果にはユニークな値のみが含まれます。

**構文**

``` sql
arrayUnion(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

関数は異なる型の任意の数の配列を受け取ることができます。

**戻り値**

- 元の配列からのユニークな要素を含む [Array](/sql-reference/data-types/array)。


**例**

クエリ:

```sql
SELECT
    arrayUnion([-2, 1], [10, 1], [-2], []) as num_example,
    arrayUnion(['hi'], [], ['hello', 'hi']) as str_example,
    arrayUnion([1, 3, NULL], [2, 3, NULL]) as null_example
```

結果:

```text
┌─num_example─┬─str_example────┬─null_example─┐
│ [10,-2,1]   │ ['hello','hi'] │ [3,2,1,NULL] │
└─────────────┴────────────────┴──────────────┘
```
## arrayIntersect {#arrayintersect}

複数の配列を受け取り、すべての元の配列に存在する要素を持つ配列を返します。
結果にはユニークな値のみが含まれます。

**構文**

``` sql
arrayIntersect(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

関数は異なる型の任意の数の配列を受け取ることができます。

**戻り値**

- すべての元の配列に存在するユニークな要素を持つ [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT
    arrayIntersect([1, 2], [1, 3], [2, 3]) AS empty_intersection,
    arrayIntersect([1, 2], [1, 3], [1, 4]) AS non_empty_intersection
```

結果:

``` text
┌─non_empty_intersection─┬─empty_intersection─┐
│ []                     │ [1]                │
└────────────────────────┴────────────────────┘
```
## arraySymmetricDifference {#arraysymmetricdifference}

複数の配列を受け取り、すべての元の配列に存在しない要素を持つ配列を返します。
結果にはユニークな値のみが含まれます。

:::note
2 つ以上の集合の対称差は [数学的には定義](https://en.wikipedia.org/wiki/Symmetric_difference#n-ary_symmetric_difference) されており、すべての入力要素のセットであり、これらは奇数回入力セットに現れます。
対照的に、関数 `arraySymmetricDifference` は単に、すべての入力セットに存在しない入力要素のセットを返します。
:::

**構文**

``` sql
arraySymmetricDifference(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

関数は異なる型の任意の数の配列を受け取ることができます。

**戻り値**

- すべての元の配列に存在しないユニークな要素を持つ [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT
    arraySymmetricDifference([1, 2], [1, 2], [1, 2]) AS empty_symmetric_difference,
    arraySymmetricDifference([1, 2], [1, 2], [1, 3]) AS non_empty_symmetric_difference,
```

結果:

``` text
┌─empty_symmetric_difference─┬─non_empty_symmetric_difference─┐
│ []                         │ [3]                            │
└────────────────────────────┴────────────────────────────────┘
```
## arrayJaccardIndex {#arrayjaccardindex}

2 つの配列の [ジャッカール指数](https://en.wikipedia.org/wiki/Jaccard_index) を返します。

**例**

クエリ:
``` sql
SELECT arrayJaccardIndex([1, 2], [2, 3]) AS res
```

結果:
``` text
┌─res────────────────┐
│ 0.3333333333333333 │
└────────────────────┘
```
## arrayReduce {#arrayreduce}

配列要素に集約関数を適用し、その結果を返します。集約関数の名前はシングルクオート `'max'`, `'sum'` で渡されます。パラメトリック集約関数を使用する場合、パラメータは関数名の後に括弧内で指定します `'uniqUpTo(6)'`。

**構文**

``` sql
arrayReduce(agg_func, arr1, arr2, ..., arrN)
```

**引数**

- `agg_func` — 定数 [文字列](../data-types/string.md) であるべき集約関数の名前。
- `arr` — 集約関数のパラメータとして任意の数の [array](/sql-reference/data-types/array) 型の列。

**戻り値**

**例**

クエリ:

``` sql
SELECT arrayReduce('max', [1, 2, 3]);
```

結果:

``` text
┌─arrayReduce('max', [1, 2, 3])─┐
│                             3 │
└───────────────────────────────┘
```

集約関数が複数の引数を受け取る場合、この関数は同じサイズの複数の配列に適用されなければなりません。

クエリ:

``` sql
SELECT arrayReduce('maxIf', [3, 5], [1, 0]);
```

結果:

``` text
┌─arrayReduce('maxIf', [3, 5], [1, 0])─┐
│                                    3 │
└──────────────────────────────────────┘
```

パラメトリック集約関数の例:

クエリ:

``` sql
SELECT arrayReduce('uniqUpTo(3)', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
```

結果:

``` text
┌─arrayReduce('uniqUpTo(3)', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])─┐
│                                                           4 │
└─────────────────────────────────────────────────────────────┘
```

**参照**

- [arrayFold](#arrayfold)
## arrayReduceInRanges {#arrayreduceinranges}

指定された範囲内の配列要素に集約関数を適用し、各範囲に対応する結果を含む配列を返します。この関数は、複数の `arrayReduce(agg_func, arraySlice(arr1, index, length), ...)` と同じ結果を返します。

**構文**

``` sql
arrayReduceInRanges(agg_func, ranges, arr1, arr2, ..., arrN)
```

**引数**

- `agg_func` — 定数 [文字列](../data-types/string.md) であるべき集約関数の名前。
- `ranges` — 各範囲のインデックスと長さを含む [tuple](../data-types/tuple.md) の [array](/sql-reference/data-types/array) であるべき集約する範囲。
- `arr` — 集約関数のパラメータとして任意の数の [Array](/sql-reference/data-types/array) 型の列。

**戻り値**

- 指定された範囲で集約関数の結果を含む配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT arrayReduceInRanges(
    'sum',
    [(1, 5), (2, 3), (3, 4), (4, 4)],
    [1000000, 200000, 30000, 4000, 500, 60, 7]
) AS res
```

結果:

``` text
┌─res─────────────────────────┐
│ [1234500,234000,34560,4567] │
└─────────────────────────────┘
```
## arrayFold {#arrayfold}

1 つまたは複数の同じサイズの配列にラムダ関数を適用し、累積結果を集めます。

**構文**

``` sql
arrayFold(lambda_function, arr1, arr2, ..., accumulator)
```

**例**

クエリ:

``` sql
SELECT arrayFold( acc,x -> acc + x*2,  [1, 2, 3, 4], toInt64(3)) AS res;
```

結果:

``` text
┌─res─┐
│  23 │
└─────┘
```

**フィボナッチ数列の例**

```sql
SELECT arrayFold( acc,x -> (acc.2, acc.2 + acc.1), range(number), (1::Int64, 0::Int64)).1 AS fibonacci
FROM numbers(1,10);

┌─fibonacci─┐
│         0 │
│         1 │
│         1 │
│         2 │
│         3 │
│         5 │
│         8 │
│        13 │
│        21 │
│        34 │
└───────────┘
```

**参照**

- [arrayReduce](#arrayreduce)
## arrayReverse {#arrayreverse}

元の配列と同じサイズの配列を返し、要素を逆順に含みます。

**構文**

```sql
arrayReverse(arr)
```

例:

``` sql
SELECT arrayReverse([1, 2, 3])
```

``` text
┌─arrayReverse([1, 2, 3])─┐
│ [3,2,1]                 │
└─────────────────────────┘
```
## reverse(arr) {#reversearr}

["arrayReverse"](#arrayreverse) の同義語です。
## arrayFlatten {#arrayflatten}

配列の配列をフラットな配列に変換します。

関数:

- ネストされた配列の任意の深さに適用されます。
- すでにフラットな配列は変更されません。

平坦化された配列には、すべてのソース配列からのすべての要素が含まれます。

**構文**

``` sql
flatten(array_of_arrays)
```

エイリアス: `flatten`.

**パラメータ**

- `array_of_arrays` — [Array](/sql-reference/data-types/array) の配列。例えば、`[[1,2,3], [4,5]]`.

**例**

``` sql
SELECT flatten([[[1]], [[2], [3]]]);
```

``` text
┌─flatten(array(array([1]), array([2], [3])))─┐
│ [1,2,3]                                     │
└─────────────────────────────────────────────┘
```
## arrayCompact {#arraycompact}

配列から連続する重複要素を削除します。結果の値の順序は、ソース配列の順序によって決まります。

**構文**

``` sql
arrayCompact(arr)
```

**引数**

`arr` — 検査する [array](/sql-reference/data-types/array)。

**戻り値**

重複なしの配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT arrayCompact([1, 1, nan, nan, 2, 3, 3, 3]);
```

結果:

``` text
┌─arrayCompact([1, 1, nan, nan, 2, 3, 3, 3])─┐
│ [1,nan,nan,2,3]                            │
└────────────────────────────────────────────┘
```
## arrayZip {#arrayzip}

複数の配列を単一の配列に組み合わせます。結果の配列には、ソース配列の対応する要素がタプルの中にグループ化されて含まれます。

**構文**

``` sql
arrayZip(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

関数は異なる型の任意の数の配列を受け取ることができます。すべての入力配列は同じサイズである必要があります。

**戻り値**

ソース配列からの要素がタプルにグループ化された [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT arrayZip(['a', 'b', 'c'], [5, 2, 1]);
```


結果:

``` text
┌─arrayZip(['a', 'b', 'c'], [5, 2, 1])─┐
│ [('a',5),('b',2),('c',1)]            │
└──────────────────────────────────────┘
```
## arrayZipUnaligned {#arrayzipunaligned}

複数の配列を単一の配列に組み合わせ、アラインされていない配列を許可します。結果の配列には、ソース配列の対応する要素がタプルの中にグループ化されて含まれます。

**構文**

``` sql
arrayZipUnaligned(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

関数は異なる型の任意の数の配列を受け取ることができます。

**戻り値**

ソース配列からの要素がタプルにグループ化された [Array](/sql-reference/data-types/array)。タプル内のデータ型は入力配列の型と同じで、配列が渡された順序と同じです。異なるサイズの配列がある場合、短い配列は `null` 値でパディングされます。

**例**

クエリ:

``` sql
SELECT arrayZipUnaligned(['a'], [1, 2, 3]);
```

結果:

``` text
┌─arrayZipUnaligned(['a'], [1, 2, 3])─┐
│ [('a',1),(NULL,2),(NULL,3)]         │
└─────────────────────────────────────┘
```
## arrayROCAUC {#arrayrocauc}

受信者動作特性 (ROC) 曲線の下の面積を計算します。
ROC 曲線は、TPR (真陽性率) を y 軸に、FPR (偽陽性率) を x 軸にプロットすることによって作成されます。
得られた値は 0 から 1 の範囲で、高い値はモデルのパフォーマンスが優れていることを示します。
ROC AUC（単に AUC とも呼ばれます）は、機械学習の概念です。
詳細については、[こちら](https://developers.google.com/machine-learning/glossary#pr-auc-area-under-the-pr-curve)、[こちら](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc#expandable-1)、および [こちら](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve) を参照してください。

**構文**

``` sql
arrayROCAUC(arr_scores, arr_labels[, scale[, arr_partial_offsets]])
```

エイリアス: `arrayAUC`

**引数**

- `arr_scores` — モデルが与えるスコア。 [Array](/sql-reference/data-types/array) の [整数](../data-types/int-uint.md) または [浮動小数点](../data-types/float.md)。
- `arr_labels` — サンプルのラベル、通常は陽性サンプルに対しては 1、陰性サンプルに対しては 0。 [Array](/sql-reference/data-types/array) の [整数](../data-types/int-uint.md) または [列挙型](../data-types/enum.md)。
- `scale` — 正規化された面積を返すかどうかを決定します。false の場合、TP (真陽性) x FP (偽陽性) 曲線の下の面積が返されます。デフォルト値: true。 [Bool](../data-types/boolean.md)。オプション。
- `arr_partial_offsets` — ROC 曲線の部分的な面積を計算するための 4 つの非負整数の配列（ROC 空間の縦バンドに相当）を、全体の AUC の代わりに使用します。このオプションは ROC AUC の分散計算に便利です。配列には次の要素が含まれている必要があります [`higher_partitions_tp`, `higher_partitions_fp`, `total_positives`, `total_negatives`]。 [Array](/sql-reference/data-types/array) の非負 [整数](../data-types/int-uint.md)。オプション。
    - `higher_partitions_tp`: より高いスコアのパーティションにおける陽性ラベルの数。
    - `higher_partitions_fp`: より高いスコアのパーティションにおける陰性ラベルの数。
    - `total_positives`: データセット全体の陽性サンプルの総数。
    - `total_negatives`: データセット全体の陰性サンプルの総数。

::::note
`arr_partial_offsets` が使用されるとき、`arr_scores` と `arr_labels` はデータセット全体の一部であり、スコアの範囲が含まれている必要があります。
データセットは連続したパーティションに分割され、各パーティションには、特定の範囲にスコアが含まれるデータのサブセットが含まれるべきです。
例えば:
- 1 つのパーティションには、範囲 [0, 0.5) 内のすべてのスコアが含まれるかもしれません。
- 別のパーティションには、範囲 [0.5, 1.0] 内のスコアが含まれるかもしれません。
::::

**戻り値**

受信者動作特性 (ROC) 曲線の下の面積を返します。 [Float64](../data-types/float.md)。

**例**

クエリ:

``` sql
select arrayROCAUC([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]);
```

結果:

``` text
┌─arrayROCAUC([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])─┐
│                                             0.75 │
└──────────────────────────────────────────────────┘
```

## arrayAUCPR {#arrayaucpr}

精度-再現率 (PR) 曲線の下の面積を計算します。
精度-再現率曲線は、すべての閾値に対して、y軸に精度、x軸に再現率をプロットすることによって作成されます。
結果の値は 0 から 1 の範囲であり、高い値はより良いモデルのパフォーマンスを示します。
PR AUC は、アンバランスデータセットに特に有用であり、それらのケースにおいて ROC AUC に比べてパフォーマンスの比較をより明確に提供します。
詳細については、[こちら](https://developers.google.com/machine-learning/glossary#pr-auc-area-under-the-pr-curve)、[こちら](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc#expandable-1)、および[こちら](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve)を参照してください。

**構文**

``` sql
arrayAUCPR(arr_scores, arr_labels[, arr_partial_offsets])
```

別名: `arrayPRAUC`

**引数**

- `arr_scores` — モデルが与える予測スコア。 [Array](/sql-reference/data-types/array) の [Integers](../data-types/int-uint.md) または [Floats](../data-types/float.md) の配列。
- `arr_labels` — サンプルのラベル、通常は正のサンプルには 1、負のサンプルには 0。 [Array](/sql-reference/data-types/array) の [Integers](../data-types/int-uint.md) または [Enums](../data-types/enum.md) の配列。
- `arr_partial_offsets` — オプション。 PR 曲線下の部分的な面積を計算するための 3 つの非負整数の [Array](/sql-reference/data-types/array)。これは、全体の AUC ではなく PR 空間の垂直バンドに相当します。このオプションは、PR AUC の分散計算に便利です。配列は以下の要素 [`higher_partitions_tp`, `higher_partitions_fp`, `total_positives`] を含まなければなりません。 [Array](/sql-reference/data-types/array) の非負の [Integers](../data-types/int-uint.md)。オプション。
    - `higher_partitions_tp`: スコアの高いパーティションにおける正のラベルの数。
    - `higher_partitions_fp`: スコアの高いパーティションにおける負のラベルの数。
    - `total_positives`: データセット全体の正のサンプルの合計数。

::::note
`arr_partial_offsets` が使用される場合、`arr_scores` と `arr_labels` は全体のデータセットの一部であり、スコアの範囲内にあるサブセットを含む必要があります。
データセットは連続したパーティションに分割されなければならず、各パーティションは特定の範囲内のスコアに該当するデータのサブセットを含む必要があります。
例えば:
- 1 つのパーティションには、範囲 [0, 0.5) 内のすべてのスコアが含まれることができます。
- もう 1 つのパーティションには、範囲 [0.5, 1.0] 内のスコアが含まれることができます。
::::

**返り値**

精度-再現率 (PR) 曲線の下の面積を返します。 [Float64](../data-types/float.md)。

**例**

クエリ:

``` sql
select arrayAUCPR([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]);
```

結果:

``` text
┌─arrayAUCPR([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])─┐
│                              0.8333333333333333 │
└─────────────────────────────────────────────────┘
```
## arrayMap(func, arr1, ...) {#arraymapfunc-arr1-}

元の配列から `func(arr1[i], ..., arrN[i])` を各要素に適用して得られた配列を返します。 配列 `arr1` ... `arrN` は同じ数の要素を持っている必要があります。

例:

``` sql
SELECT arrayMap(x -> (x + 2), [1, 2, 3]) as res;
```

``` text
┌─res─────┐
│ [3,4,5] │
└─────────┘
```

以下の例は、異なる配列から要素のタプルを作成する方法を示しています:

``` sql
SELECT arrayMap((x, y) -> (x, y), [1, 2, 3], [4, 5, 6]) AS res
```

``` text
┌─res─────────────────┐
│ [(1,4),(2,5),(3,6)] │
└─────────────────────┘
```

`arrayMap` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。
## arrayFilter(func, arr1, ...) {#arrayfilterfunc-arr1-}

`arr1` の中に `func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す要素のみを含む配列を返します。

例:

``` sql
SELECT arrayFilter(x -> x LIKE '%World%', ['Hello', 'abc World']) AS res
```

``` text
┌─res───────────┐
│ ['abc World'] │
└───────────────┘
```

``` sql
SELECT
    arrayFilter(
        (i, x) -> x LIKE '%World%',
        arrayEnumerate(arr),
        ['Hello', 'abc World'] AS arr)
    AS res
```

``` text
┌─res─┐
│ [2] │
└─────┘
```

`arrayFilter` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。
## arrayFill(func, arr1, ...) {#arrayfillfunc-arr1-}

`arr1` の最初の要素から最後の要素までスキャンし、`func(arr1[i], ..., arrN[i])` が 0 を返す場合は `arr1[i]` を `arr1[i - 1]` で置き換えます。 `arr1` の最初の要素は置き換えられません。

例:

``` sql
SELECT arrayFill(x -> not isNull(x), [1, null, 3, 11, 12, null, null, 5, 6, 14, null, null]) AS res
```

``` text
┌─res──────────────────────────────┐
│ [1,1,3,11,12,12,12,5,6,14,14,14] │
└──────────────────────────────────┘
```

`arrayFill` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。
## arrayReverseFill(func, arr1, ...) {#arrayreversefillfunc-arr1-}

`arr1` の最後の要素から最初の要素までスキャンし、`func(arr1[i], ..., arrN[i])` が 0 を返す場合は `arr1[i]` を `arr1[i + 1]` で置き換えます。 `arr1` の最後の要素は置き換えられません。

例:

``` sql
SELECT arrayReverseFill(x -> not isNull(x), [1, null, 3, 11, 12, null, null, 5, 6, 14, null, null]) AS res
```

``` text
┌─res────────────────────────────────┐
│ [1,3,3,11,12,5,5,5,6,14,NULL,NULL] │
└────────────────────────────────────┘
```

`arrayReverseFill` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。
## arraySplit(func, arr1, ...) {#arraysplitfunc-arr1-}

`arr1` を複数の配列に分割します。 `func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す場合、配列は要素の左側で分割されます。 配列は最初の要素の前で分割されることはありません。

例:

``` sql
SELECT arraySplit((x, y) -> y, [1, 2, 3, 4, 5], [1, 0, 0, 1, 0]) AS res
```

``` text
┌─res─────────────┐
│ [[1,2,3],[4,5]] │
└─────────────────┘
```

`arraySplit` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。
## arrayReverseSplit(func, arr1, ...) {#arrayreversesplitfunc-arr1-}

`arr1` を複数の配列に分割します。 `func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す場合、配列は要素の右側で分割されます。 配列は最後の要素の後で分割されることはありません。

例:

``` sql
SELECT arrayReverseSplit((x, y) -> y, [1, 2, 3, 4, 5], [1, 0, 0, 1, 0]) AS res
```

``` text
┌─res───────────────┐
│ [[1],[2,3,4],[5]] │
└───────────────────┘
```

`arrayReverseSplit` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。
## arrayExists(\[func,\] arr1, ...) {#arrayexistsfunc-arr1-}

`arr` に少なくとも 1 つの要素があり、`func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す場合は 1 を返します。そうでない場合は 0 を返します。

`arrayExists` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡すことができます。
## arrayAll(\[func,\] arr1, ...) {#arrayallfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が配列のすべての要素に対して 0 以外の何かを返す場合は 1 を返します。そうでない場合は 0 を返します。

`arrayAll` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡すことができます。
## arrayFirst(func, arr1, ...) {#arrayfirstfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す `arr1` 配列の最初の要素を返します。
## arrayFirstOrNull {#arrayfirstornull}

`func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す `arr1` 配列の最初の要素を返します。そうでない場合は `NULL` を返します。

**構文**

```sql
arrayFirstOrNull(func, arr1, ...)
```

**パラメーター**

- `func`: ラムダ関数。 [ラムダ関数](../functions/#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `arr1`: 操作対象の配列。 [Array](/sql-reference/data-types/array)。

**返り値**

- 渡された配列の最初の要素。
- それ以外の場合は `NULL` を返します。

**実装の詳細**

`arrayFirstOrNull` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。

**例**

クエリ:

```sql
SELECT arrayFirstOrNull(x -> x >= 2, [1, 2, 3]);
```

結果:

```response
2
```

クエリ:

```sql
SELECT arrayFirstOrNull(x -> x >= 2, emptyArrayUInt8());
```

結果:

```response
\N
```

クエリ:

```sql
SELECT arrayLastOrNull((x,f) -> f, [1,2,3,NULL], [0,1,0,1]);
```

結果:

```response
\N
```
## arrayLast(func, arr1, ...) {#arraylastfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す `arr1` 配列の最後の要素を返します。

`arrayLast` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。
## arrayLastOrNull {#arraylastornull}

`func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す `arr1` 配列の最後の要素を返します。そうでない場合は `NULL` を返します。

**構文**

```sql
arrayLastOrNull(func, arr1, ...)
```

**パラメーター**

- `func`: ラムダ関数。 [ラムダ関数](../functions/#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `arr1`: 操作対象の配列。 [Array](/sql-reference/data-types/array)。

**返り値**

- 渡された配列の最後の要素。
- それ以外の場合は `NULL` を返します。

**実装の詳細**

`arrayLastOrNull` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。

**例**

クエリ:

```sql
SELECT arrayLastOrNull(x -> x >= 2, [1, 2, 3]);
```

結果:

```response
3
```

クエリ:

```sql
SELECT arrayLastOrNull(x -> x >= 2, emptyArrayUInt8());
```

結果:

```response
\N
```
## arrayFirstIndex(func, arr1, ...) {#arrayfirstindexfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す `arr1` 配列の最初の要素のインデックスを返します。

`arrayFirstIndex` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。
## arrayLastIndex(func, arr1, ...) {#arraylastindexfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す `arr1` 配列の最後の要素のインデックスを返します。

`arrayLastIndex` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡す必要があり、省略することはできません。
## arrayMin {#arraymin}

ソース配列内の要素の最小値を返します。

`func` 関数が指定されている場合、これにより変換された要素の最小値が返されます。

`arrayMin` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡すことができます。

**構文**

```sql
arrayMin([func,] arr)
```

**引数**

- `func` — 関数。 [式](../data-types/special-data-types/expression.md)。
- `arr` — 配列。 [Array](/sql-reference/data-types/array)。

**返り値**

- 関数値の最小（または配列の最小）。

:::note
`func` が指定されている場合、返り値の型は `func` の返り値の型に一致し、そうでない場合は配列の要素の型に一致します。
:::

**例**

クエリ:

```sql
SELECT arrayMin([1, 2, 4]) AS res;
```

結果:

```text
┌─res─┐
│   1 │
└─────┘
```

クエリ:

```sql
SELECT arrayMin(x -> (-x), [1, 2, 4]) AS res;
```

結果:

```text
┌─res─┐
│  -4 │
└─────┘
```
## arrayMax {#arraymax}

ソース配列内の要素の最大値を返します。

`func` 関数が指定されている場合、これにより変換された要素の最大値が返されます。

`arrayMax` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡すことができます。

**構文**

```sql
arrayMax([func,] arr)
```

**引数**

- `func` — 関数。 [式](../data-types/special-data-types/expression.md)。
- `arr` — 配列。 [Array](/sql-reference/data-types/array)。

**返り値**

- 関数値の最大（または配列の最大）。

:::note
`func` が指定されている場合、返り値の型は `func` の返り値の型に一致し、そうでない場合は配列の要素の型に一致します。
:::

**例**

クエリ:

```sql
SELECT arrayMax([1, 2, 4]) AS res;
```

結果:

```text
┌─res─┐
│   4 │
└─────┘
```

クエリ:

```sql
SELECT arrayMax(x -> (-x), [1, 2, 4]) AS res;
```

結果:

```text
┌─res─┐
│  -1 │
└─────┘
```
## arraySum {#arraysum}

ソース配列内の要素の合計を返します。

`func` 関数が指定されている場合、これにより変換された要素の合計が返されます。

`arraySum` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡すことができます。

**構文**

```sql
arraySum([func,] arr)
```

**引数**

- `func` — 関数。 [式](../data-types/special-data-types/expression.md)。
- `arr` — 配列。 [Array](/sql-reference/data-types/array)。

**返り値**

- 関数値の合計（または配列の合計）。

:::note
返り値の型:

- ソース配列の小数型（または変換された値の場合、`func` が指定されている場合） — [Decimal128](../data-types/decimal.md)。
- 浮動小数点数の場合 — [Float64](../data-types/float.md)。
- 符号なし数値の場合 — [UInt64](../data-types/int-uint.md)。 
- 符号あり数値の場合 — [Int64](../data-types/int-uint.md)。
:::

**例**

クエリ:

```sql
SELECT arraySum([2, 3]) AS res;
```

結果:

```text
┌─res─┐
│   5 │
└─────┘
```

クエリ:

```sql
SELECT arraySum(x -> x*x, [2, 3]) AS res;
```

結果:

```text
┌─res─┐
│  13 │
└─────┘
```
## arrayAvg {#arrayavg}

ソース配列内の要素の平均を返します。

`func` 関数が指定されている場合、これにより変換された要素の平均が返されます。

`arrayAvg` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡すことができます。

**構文**

```sql
arrayAvg([func,] arr)
```

**引数**

- `func` — 関数。 [式](../data-types/special-data-types/expression.md)。
- `arr` — 配列。 [Array](/sql-reference/data-types/array)。

**返り値**

- 関数値の平均（または配列の平均）。 [Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT arrayAvg([1, 2, 4]) AS res;
```

結果:

```text
┌────────────────res─┐
│ 2.3333333333333335 │
└────────────────────┘
```

クエリ:

```sql
SELECT arrayAvg(x -> (x * x), [2, 4]) AS res;
```

結果:

```text
┌─res─┐
│  10 │
└─────┘
```
## arrayCumSum(\[func,\] arr1, ...) {#arraycumsumfunc-arr1-}

ソース配列 `arr1` の要素の部分的（累積）合計の配列を返します。 `func` が指定されている場合、合計は `arr1`, `arr2`, ..., `arrN` に `func` を適用することによって計算されます、すなわち `func(arr1[i], ..., arrN[i])` です。

**構文**

``` sql
arrayCumSum(arr)
```

**引数**

- `arr` — 数値の [Array](/sql-reference/data-types/array)。

**返り値**

- ソース配列の要素の部分合計の配列を返します。 [UInt\*](/sql-reference/data-types/int-uint#integer-ranges)、[Int\*](/sql-reference/data-types/int-uint#integer-ranges)、[Float\*](/sql-reference/data-types/float/)。

例:

``` sql
SELECT arrayCumSum([1, 1, 1, 1]) AS res
```

``` text
┌─res──────────┐
│ [1, 2, 3, 4] │
└──────────────┘
```

`arrayCumSum` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡すことができます。
## arrayCumSumNonNegative(\[func,\] arr1, ...) {#arraycumsumnonnegativefunc-arr1-}

`arrayCumSum` と同じで、ソース配列の要素の部分的（累積）合計の配列を返します。 `func` が指定されている場合、合計は `arr1`, `arr2`, ..., `arrN` に `func` を適用することによって計算されます、すなわち `func(arr1[i], ..., arrN[i])` です。 `arrayCumSum` とは異なり、現在の累積合計が 0 未満の場合は、0 に置き換えられます。

**構文**

``` sql
arrayCumSumNonNegative(arr)
```

**引数**

- `arr` — 数値の [Array](/sql-reference/data-types/array)。

**返り値**

- ソース配列の非負部分合計の配列を返します。 [UInt\*](/sql-reference/data-types/int-uint#integer-ranges)、[Int\*](/sql-reference/data-types/int-uint#integer-ranges)、[Float\*](/sql-reference/data-types/float/)。

``` sql
SELECT arrayCumSumNonNegative([1, 1, -4, 1]) AS res
```

``` text
┌─res───────┐
│ [1,2,0,1] │
└───────────┘
```

`arraySumNonNegative` は [高階関数](/docs/sql-reference/functions/overview#higher-order-functions) であることに注意してください。 最初の引数としてラムダ関数を渡すことができます。
## arrayProduct {#arrayproduct}

[配列](/sql-reference/data-types/array) の要素を掛け算します。

**構文**

``` sql
arrayProduct(arr)
```

**引数**

- `arr` — 数値の [Array](/sql-reference/data-types/array)。

**返り値**

- 配列の要素の積。 [Float64](../data-types/float.md)。

**例**

クエリ:

``` sql
SELECT arrayProduct([1,2,3,4,5,6]) as res;
```

結果:

``` text
┌─res───┐
│ 720   │
└───────┘
```

クエリ:

``` sql
SELECT arrayProduct([toDecimal64(1,8), toDecimal64(2,8), toDecimal64(3,8)]) as res, toTypeName(res);
```

返り値の型は常に [Float64](../data-types/float.md) です。結果:

``` text
┌─res─┬─toTypeName(arrayProduct(array(toDecimal64(1, 8), toDecimal64(2, 8), toDecimal64(3, 8))))─┐
│ 6   │ Float64                                                                                  │
└─────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```
## arrayRotateLeft {#arrayrotateleft}

指定された要素数だけ [配列](/sql-reference/data-types/array) を左に回転させます。
要素数が負の場合、配列は右に回転します。

**構文**

``` sql
arrayRotateLeft(arr, n)
```

**引数**

- `arr` — [Array](/sql-reference/data-types/array)。
- `n` — 回転する要素数。

**返り値**

- 指定された要素数だけ左に回転された配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT arrayRotateLeft([1,2,3,4,5,6], 2) as res;
```

結果:

``` text
┌─res───────────┐
│ [3,4,5,6,1,2] │
└───────────────┘
```

クエリ:

``` sql
SELECT arrayRotateLeft([1,2,3,4,5,6], -2) as res;
```

結果:

``` text
┌─res───────────┐
│ [5,6,1,2,3,4] │
└───────────────┘
```

クエリ:

``` sql
SELECT arrayRotateLeft(['a','b','c','d','e'], 3) as res;
```

結果:

``` text
┌─res───────────────────┐
│ ['d','e','a','b','c'] │
└───────────────────────┘
```
## arrayRotateRight {#arrayrotateright}

指定された要素数だけ [配列](/sql-reference/data-types/array) を右に回転させます。
要素数が負の場合、配列は左に回転します。

**構文**

``` sql
arrayRotateRight(arr, n)
```

**引数**

- `arr` — [Array](/sql-reference/data-types/array)。
- `n` — 回転する要素数。

**返り値**

- 指定された要素数だけ右に回転された配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT arrayRotateRight([1,2,3,4,5,6], 2) as res;
```

結果:

``` text
┌─res───────────┐
│ [5,6,1,2,3,4] │
└───────────────┘
```

クエリ:

``` sql
SELECT arrayRotateRight([1,2,3,4,5,6], -2) as res;
```

結果:

``` text
┌─res───────────┐
│ [3,4,5,6,1,2] │
└───────────────┘
```

クエリ:

``` sql
SELECT arrayRotateRight(['a','b','c','d','e'], 3) as res;
```

結果:

``` text
┌─res───────────────────┐
│ ['c','d','e','a','b'] │
└───────────────────────┘
```
## arrayShiftLeft {#arrayshiftleft}

指定された要素数だけ [配列](/sql-reference/data-types/array) を左にシフトします。
新しい要素は提供された引数または配列要素型をデフォルト値で埋めます。
要素数が負の場合、配列は右にシフトします。

**構文**

``` sql
arrayShiftLeft(arr, n[, default])
```

**引数**

- `arr` — [Array](/sql-reference/data-types/array)。
- `n` — シフトする要素数。
- `default` — オプション。 新しい要素のデフォルト値。

**返り値**

- 指定された要素数だけ左にシフトされた配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT arrayShiftLeft([1,2,3,4,5,6], 2) as res;
```

結果:

``` text
┌─res───────────┐
│ [3,4,5,6,0,0] │
└───────────────┘
```

クエリ:

``` sql
SELECT arrayShiftLeft([1,2,3,4,5,6], -2) as res;
```

結果:

``` text
┌─res───────────┐
│ [0,0,1,2,3,4] │
└───────────────┘
```

クエリ:

``` sql
SELECT arrayShiftLeft([1,2,3,4,5,6], 2, 42) as res;
```

結果:

``` text
┌─res─────────────┐
│ [3,4,5,6,42,42] │
└─────────────────┘
```

クエリ:

``` sql
SELECT arrayShiftLeft(['a','b','c','d','e','f'], 3, 'foo') as res;
```

結果:

``` text
┌─res─────────────────────────────┐
│ ['d','e','f','foo','foo','foo'] │
└─────────────────────────────────┘
```

クエリ:

``` sql
SELECT arrayShiftLeft([1,2,3,4,5,6] :: Array(UInt16), 2, 4242) as res;
```

結果:

``` text
┌─res─────────────────┐
│ [3,4,5,6,4242,4242] │
└─────────────────────┘
```
## arrayShiftRight {#arrayshiftright}

指定された要素数だけ [配列](/sql-reference/data-types/array) を右にシフトします。
新しい要素は提供された引数または配列要素型をデフォルト値で埋めます。
要素数が負の場合、配列は左にシフトします。

**構文**

``` sql
arrayShiftRight(arr, n[, default])
```

**引数**

- `arr` — [Array](/sql-reference/data-types/array)。
- `n` — シフトする要素数。
- `default` — オプション。 新しい要素のデフォルト値。

**返り値**

- 指定された要素数だけ右にシフトされた配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

``` sql
SELECT arrayShiftRight([1,2,3,4,5,6], 2) as res;
```

結果:

``` text
┌─res───────────┐
│ [0,0,1,2,3,4] │
└───────────────┘
```

クエリ:

``` sql
SELECT arrayShiftRight([1,2,3,4,5,6], -2) as res;
```

結果:

``` text
┌─res───────────┐
│ [3,4,5,6,0,0] │
└───────────────┘
```

クエリ:

``` sql
SELECT arrayShiftRight([1,2,3,4,5,6], 2, 42) as res;
```

結果:

``` text
┌─res─────────────┐
│ [42,42,1,2,3,4] │
└─────────────────┘
```

クエリ:

``` sql
SELECT arrayShiftRight(['a','b','c','d','e','f'], 3, 'foo') as res;
```

結果:

``` text
┌─res─────────────────────────────┐
│ ['foo','foo','foo','a','b','c'] │
└─────────────────────────────────┘
```

クエリ:

``` sql
SELECT arrayShiftRight([1,2,3,4,5,6] :: Array(UInt16), 2, 4242) as res;
```

結果:

``` text
┌─res─────────────────┐
│ [4242,4242,1,2,3,4] │
└─────────────────────┘
```
## arrayRandomSample {#arrayrandomsample}

`arrayRandomSample` 関数は、入力配列から `samples` 数のランダムな要素のサブセットを返します。 `samples` が入力配列のサイズを超える場合、サンプルサイズは配列のサイズに制限されます。すなわち、すべての配列要素が返されますが、その順序は保証されません。この関数は、フラット配列とネストされた配列の両方を処理できます。

**構文**

```sql
arrayRandomSample(arr, samples)
```

**引数**

- `arr` — 要素をサンプリングするための入力配列。 ([Array(T)](/sql-reference/data-types/array))
- `samples` — ランダムサンプルに含める要素の数 ([UInt*](../data-types/int-uint.md))

**返り値**

- 入力配列からのランダムサンプルの要素を含む配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

```sql
SELECT arrayRandomSample(['apple', 'banana', 'cherry', 'date'], 2) as res;
```

結果:

```response
┌─res────────────────┐
│ ['cherry','apple'] │
└────────────────────┘
```

クエリ:

```sql
SELECT arrayRandomSample([[1, 2], [3, 4], [5, 6]], 2) as res;
```

結果:

```response
┌─res───────────┐
│ [[3,4],[5,6]] │
└───────────────┘
```

クエリ:

```sql
SELECT arrayRandomSample([1, 2, 3], 5) as res;
```

結果:

```response
┌─res─────┐
│ [3,1,2] │
└─────────┘
```
## arrayNormalizedGini {#arraynormalizedgini}

正規化ジニ係数を計算します。

**構文**

```sql
arrayNormalizedGini(predicted, label)
```

**引数**

- `predicted` — 予測値 ([Array(T)](/sql-reference/data-types/array))
- `label` — 実値 ([Array(T)](/sql-reference/data-types/array))

**返り値**

- 予測値のジニ係数、正規化値のジニ係数、および正規化ジニ係数（= 前者の 2 つのジニ係数の比率）を含むタプル。

**例**

クエリ:

```sql
SELECT arrayNormalizedGini([0.9, 0.3, 0.8, 0.7], [6, 1, 0, 2]);
```

結果:

```response
┌─arrayNormalizedGini([0.9, 0.3, 0.8, 0.7], [6, 1, 0, 2])──────────┐
│ (0.18055555555555558,0.2638888888888889,0.6842105263157896) │
└─────────────────────────────────────────────────────────────┘
```
## Distance functions {#distance-functions}

すべてのサポートされている関数は [距離関数のドキュメント](../../sql-reference/functions/distance-functions.md) に記載されています。
```
