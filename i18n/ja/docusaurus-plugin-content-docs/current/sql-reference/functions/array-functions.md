---
slug: /sql-reference/functions/array-functions
sidebar_position: 10
sidebar_label: 配列
---

# 配列関数

## empty {#empty}

入力配列が空かどうかをチェックします。

**構文**

``` sql
empty([x])
```

配列は要素を含まない場合に空とみなされます。

:::note
[`optimize_functions_to_subcolumns` 設定](../../operations/settings/settings.md#optimize-functions-to-subcolumns)を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数は配列全体を読み込んで処理する代わりに、[size0](../data-types/array.md#array-size) サブカラムのみを読み取ります。クエリ `SELECT empty(arr) FROM TABLE;` は `SELECT arr.size0 = 0 FROM TABLE;` に変換されます。
:::

この関数は [文字列](string-functions.md#empty) や [UUID](uuid-functions.md#empty) にも対応しています。

**引数**

- `[x]` — 入力配列。 [Array](../data-types/array.md).

**戻り値**

- 空の配列に対して `1`、非空の配列に対して `0` を返します。 [UInt8](../data-types/int-uint.md).

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

入力配列が非空かどうかをチェックします。

**構文**

``` sql
notEmpty([x])
```

配列は少なくとも1つの要素を含む場合に非空とみなされます。

:::note
[optimize_functions_to_subcolumns](../../operations/settings/settings.md#optimize-functions-to-subcolumns) 設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数は配列全体を読み込んで処理する代わりに、[size0](../data-types/array.md#array-size) サブカラムのみを読み取ります。クエリ `SELECT notEmpty(arr) FROM table` は `SELECT arr.size0 != 0 FROM TABLE` に変換されます。
:::

この関数は [文字列](string-functions.md#notempty) や [UUID](uuid-functions.md#notempty) にも対応しています。

**引数**

- `[x]` — 入力配列。 [Array](../data-types/array.md).

**戻り値**

- 非空の配列に対して `1`、空の配列に対して `0` を返します。 [UInt8](../data-types/int-uint.md).

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

配列の項目数を返します。
結果の型は UInt64 です。
この関数は文字列にも対応しています。

[optimize_functions_to_subcolumns](../../operations/settings/settings.md#optimize-functions-to-subcolumns) 設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数は配列全体を読み込む代わりに [size0](../data-types/array.md#array-size) サブカラムのみを読み取ります。クエリ `SELECT length(arr) FROM table` は `SELECT arr.size0 FROM TABLE` に変換されます。

エイリアス: `OCTET_LENGTH`

## emptyArrayUInt8 {#emptyarrayuint8}

空の UInt8 配列を返します。

**構文**

```sql
emptyArrayUInt8()
```

**引数**

なし。

**戻り値**

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

**戻り値**

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

**戻り値**

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

**戻り値**

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

**戻り値**

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

**戻り値**

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

**戻り値**

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

**戻り値**

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

**戻り値**

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

**戻り値**

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

**戻り値**

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
emptyArrayDateTime()
```

**引数**

なし。

**戻り値**

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

**戻り値**

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

`start` から `end - 1` まで `step` ごとの数値の配列を返します。サポートされている型は [UInt8, UInt16, UInt32, UInt64, Int8, Int16, Int32, Int64](../data-types/int-uint.md) です。

**構文**

``` sql
range([start, ] end [, step])
```

**引数**

- `start` — 配列の最初の要素。任意、`step` を使用する場合は必須。デフォルト値: 0。
- `end` — 配列が構築される前の数値。必須。
- `step` — 配列の各要素間の増分ステップを定義します。任意。デフォルト値: 1。

**戻り値**

- `start` から `end - 1` までの数値の配列 `step` ごと。

**実装の詳細**

- すべての引数 `start`, `end`, `step` はデータ型 `UInt8`, `UInt16`, `UInt32`, `UInt64`,`Int8`, `Int16`, `Int32`, `Int64` 未満でなければならず、返される配列の要素の型はすべての引数のスーパタイプである必要があります。
- クエリが [function_range_max_elements_in_block](../../operations/settings/settings.md#function_range_max_elements_in_block) 設定で指定された要素数を超える長さの配列を返す場合は例外がスローされます。
- いずれかの引数が Nullable(Nothing) 型の場合は Null を返します。いずれかの引数が Null 値 (Nullable(T) 型) の場合は例外がスローされます。

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

関数の引数から配列を作成します。
引数は定数であり、最小の共通型を持つ必要があります。少なくとも1つの引数を渡す必要があります。そうでないと、どの型の配列を作成するのかが不明だからです。つまり、この関数を使用して空の配列を作成することはできません（これを行うには、上記の 'emptyArray\*' 関数を使用してください）。
渡された引数の最小の共通型に対する 'Array(T)' 型の結果を返します。

## arrayWithConstant(length, elem) {#arraywithconstantlength-elem}

定数 `elem` で埋められた長さ `length` の配列を作成します。

## arrayConcat {#arrayconcat}

引数として渡された配列を結合します。

``` sql
arrayConcat(arrays)
```

**引数**

- `arrays` – 任意の数の [Array](../data-types/array.md) 型の引数。

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

配列 `arr` からインデックス `n` の要素を取得します。`n` は任意の整数型でなければなりません。
配列のインデックスは1から始まります。

負のインデックスもサポートされています。この場合、末尾から番号を付けた対応する要素を選択します。例えば、`arr[-1]` は配列の最後の項目です。

もしインデックスが配列の範囲外になると、デフォルト値 (数値の場合は0、文字列の場合は空文字列など) が返されます。ただし、非定数配列で定数インデックス0の場合は例外 `Array indices are 1-based` が発生します。

## has(arr, elem) {#hasarr-elem}

配列 'arr' に 'elem' 要素があるかどうかをチェックします。
要素が配列に含まれていない場合は 0 を、含まれている場合は 1 を返します。

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

配列 `arr` からインデックス `n` の要素を取得します。`n` は任意の整数型でなければなりません。
配列のインデックスは1から始まります。

負のインデックスもサポートされています。この場合、末尾から番号を付けた対応する要素を選択します。例えば、`arr[-1]` は配列の最後の項目です。

インデックスが配列の範囲外になると、デフォルト値の代わりに `NULL` を返します。

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

ある配列が別の配列の部分集合であるかどうかをチェックします。

``` sql
hasAll(set, subset)
```

**引数**

- `set` – 要素の集合を持つ任意の型の配列。
- `subset` – `set` と共通のスーパタイプを持つ任意の型の配列で、`set` の部分集合としてテストされる要素を含んでいます。

**戻り値**

- `1`、もし `set` が `subset` のすべての要素を含んでいる場合。
- そうでない場合は `0`。

`set` と `subset` 要素の共通のスーパタイプがない場合は例外 `NO_COMMON_TYPE` が発生します。

**特異な性質**

- 空の配列は任意の配列の部分集合です。
- `Null` は値として処理されます。
- 両方の配列での値の順序は重要ではありません。

**例**

`SELECT hasAll([], [])` は 1 を返します。

`SELECT hasAll([1, Null], [Null])` は 1 を返します。

`SELECT hasAll([1.0, 2, 3, 4], [1, 3])` は 1 を返します。

`SELECT hasAll(['a', 'b'], ['a'])` は 1 を返します。

`SELECT hasAll([1], ['a'])` は `NO_COMMON_TYPE` 例外を発生させます。

`SELECT hasAll([[1, 2], [3, 4]], [[1, 2], [3, 5]])` は 0 を返します。

## hasAny {#hasany}

2つの配列がいくつかの要素で交差しているかどうかをチェックします。

``` sql
hasAny(array1, array2)
```

**引数**

- `array1` – 要素の集合を持つ任意の型の配列。
- `array2` – `array1` と共通のスーパタイプを持つ任意の型の配列。

**戻り値**

- `1`、もし `array1` と `array2` が1つ以上の類似要素を持っている場合。
- そうでない場合は `0`。

`array1` と `array2` の要素が共通のスーパタイプを持たない場合は例外 `NO_COMMON_TYPE` が発生します。

**特異な性質**

- `Null` は値として処理されます。
- 両方の配列での値の順序は重要ではありません。

**例**

`SELECT hasAny([1], [])` は `0` を返します。

`SELECT hasAny([Null], [Null, 1])` は `1` を返します。

`SELECT hasAny([-128, 1., 512], [1])` は `1` を返します。

`SELECT hasAny([[1, 2], [3, 4]], ['a', 'c'])` は `NO_COMMON_TYPE` 例外を発生させます。

`SELECT hasAll([[1, 2], [3, 4]], [[1, 2], [1, 2]])` は `1` を返します。

## hasSubstr {#hassubstr}

配列2のすべての要素が配列1に同じ順序で現れるかどうかをチェックします。従って、もし `array1 = prefix + array2 + suffix` であれば、この関数は 1 を返します。

``` sql
hasSubstr(array1, array2)
```

言い換えれば、この関数は `hasAll` 関数のように `array2` のすべての要素が `array1` に含まれているかをチェックし、さらに両方の配列の要素が同じ順序で観察されていることもチェックします。

例:

- `hasSubstr([1,2,3,4], [2,3])` は 1 を返します。しかし、`hasSubstr([1,2,3,4], [3,2])` は `0` を返します。
- `hasSubstr([1,2,3,4], [1,2,3])` は 1 を返します。しかし、`hasSubstr([1,2,3,4], [1,2,4])` は `0` を返します。

**引数**

- `array1` – 要素の集合を持つ任意の型の配列。
- `array2` – 要素の集合を持つ任意の型の配列。

**戻り値**

- `1`、もし `array1` が `array2` を含んでいる場合。
- そうでない場合は `0`。

`array1` と `array2` の要素が共通のスーパタイプを持たない場合は例外 `NO_COMMON_TYPE` が発生します。

**特異な性質**

- 配列2が空であれば、この関数は `1` を返します。
- `Null` は値として処理されます。言い換えれば `hasSubstr([1, 2, NULL, 3, 4], [2,3])` は `0` を返します。しかし、`hasSubstr([1, 2, NULL, 3, 4], [2,NULL,3])` は `1` を返します。
- 両方の配列の値の順序は重要です。

**例**

`SELECT hasSubstr([], [])` は 1 を返します。

`SELECT hasSubstr([1, Null], [Null])` は 1 を返します。

`SELECT hasSubstr([1.0, 2, 3, 4], [1, 3])` は 0 を返します。

`SELECT hasSubstr(['a', 'b'], ['a'])` は 1 を返します。

`SELECT hasSubstr(['a', 'b' , 'c'], ['a', 'b'])` は 1 を返します。

`SELECT hasSubstr(['a', 'b' , 'c'], ['a', 'c'])` は 0 を返します。

`SELECT hasSubstr([[1, 2], [3, 4], [5, 6]], [[1, 2], [3, 4]])` は 1 を返します。

`SELECT hasSubstr([1, 2, NULL, 3, 4], ['a'])` は `NO_COMMON_TYPE` 例外を発生させます。

## indexOf(arr, x) {#indexofarr-x}

配列に値 'x' を最初に持つ要素のインデックスを返します (1から始まる)。配列に検索対象の値が含まれていない場合、この関数は 0 を返します。

例:

``` sql
SELECT indexOf([1, 3, NULL, NULL], NULL)
```

``` text
┌─indexOf([1, 3, NULL, NULL], NULL)─┐
│                                 3 │
└───────────────────────────────────┘
```

値が `NULL` に設定されている要素は通常の値として処理されます。

## indexOfAssumeSorted(arr, x) {#indexofassumesortedarr-x}

配列に値 'x' を最初に持つ要素のインデックスを返します (1から始まる)。配列に検索対象の値が含まれていない場合、この関数は 0 を返します。
配列が昇順にソートされていると仮定します (すなわち、この関数は二分探索を使用します)。
配列がソートされていない場合は結果は未定義です。
内部の配列が Nullable 型の場合は、関数 'indexOf' が呼び出されます。

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

`func(arr1[i], ..., arrN[i])` が 0 以外の何かを返す要素の数を返します。`func` が指定されていない場合、配列内の非ゼロ要素の数を返します。

注: `arrayCount` は [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数としてラムダ関数を渡すことができます。

## arrayDotProduct {#arraydotproduct}

2つの配列のドット積を返します。

**構文**

```sql
arrayDotProduct(vector1, vector2)
```

エイリアス: `scalarProduct`, `dotProduct`

**パラメータ**

- `vector1`: 最初のベクトル。 [Array](../data-types/array.md) または [Tuple](../data-types/tuple.md) の数値。
- `vector2`: 2番目のベクトル。 [Array](../data-types/array.md) または [Tuple](../data-types/tuple.md) の数値。

:::note
2つのベクトルのサイズは等しくなければなりません。配列とタプルは混合要素型を含むこともできます。
:::

**戻り値**

- 2つのベクトルのドット積。 [Numeric](/native-protocol/columns#numeric-types)。

:::note
戻り値の型は引数の型によって決まります。配列またはタプルが混合要素型を含む場合、結果の型はスーパタイプになります。
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

配列内で x と等しい要素の数を返します。これは arrayCount (elem -> elem = x, arr) と同じです。

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

この関数は通常 ARRAY JOIN で使用されます。ARRAY JOIN を適用した後、各配列ごとの計算を一度だけ行うことが可能です。例:

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

この例では、Reaches はコンバージョンの数 (ARRAY JOIN 適用後に得られた文字列数) であり、Hits はページビューの数 (ARRAY JOIN 前の文字列数) です。この場合、次のようにして同じ結果を得ることもできます。

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

この関数は高階関数でも使用できます。例えば、条件に合う要素の配列インデックスを得るために使用できます。

## arrayEnumerateUniq {#arrayenumerateuniq}

元の配列と同じサイズの配列を返し、同じ値を持つ要素の中でそれぞれの要素が何番目に存在するかを示します。
例えば: arrayEnumerateUniq(\[10, 20, 10, 30\]) = \[1, 1, 2, 1\]。

この関数は ARRAY JOIN と配列要素の集約で役立ちます。
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

この例では、各目標 ID に対してコンバージョン数 (Goals のネストされたデータ構造内の各要素は達成された目標を指し、これをコンバージョンと呼びます) とセッション数の計算を行っています。ARRAY JOIN を使用せずに、セッション数を sum(Sign) でカウントすることも可能です。しかし、この場合、行はネストされた Goals 構造によって重複するため、この後にこの値の条件を適用して arrayEnumerateUniq(Goals.ID) を使うことによって、各セッションを一度だけカウントします。

arrayEnumerateUniq 関数は、同じサイズの複数の配列を引数に取ることができます。この場合、同じ位置のすべての要素の組み合わせに対してユニーク性が考慮されます。

``` sql
SELECT arrayEnumerateUniq([1, 1, 1, 2, 2, 2], [1, 1, 2, 1, 1, 2]) AS res
```

``` text
┌─res───────────┐
│ [1,2,1,1,2,1] │
└───────────────┘
```

これは、ネストされたデータ構造の ARRAY JOIN を使用する際や、この構造内の複数の要素にわたって集約を行う際に必要となります。

## arrayEnumerateUniqRanked {#arrayenumerateuniqranked}

元の配列と同じサイズの配列を返し、同じ値を持つ要素の中でそれぞれの要素が何番目に存在するかを示します。配列の内部をどれだけ深く見て行うか指定することができ、マルチ次元配列の列挙が可能です。

**構文**

```sql
arrayEnumerateUniqRanked(clear_depth, arr, max_array_depth)
```

**パラメータ**

- `clear_depth`: 指定されたレベルで要素を個別に列挙します。max_arr_depth 以下の正の [Integer](../data-types/int-uint.md)。
- `arr`: 列挙する N 次元配列。 [Array](../data-types/array.md)。
- `max_array_depth`: 最大の有効深さ。正の [Integer](../data-types/int-uint.md) で `arr` の深さ以下。

**例**

`clear_depth=1` と `max_array_depth=1` の場合、`arrayEnumerateUniqRanked` の結果は同じ配列に対する [`arrayEnumerateUniq`](#arrayenumerateuniq) の結果と同じです。

クエリ:

``` sql
SELECT arrayEnumerateUniqRanked(1, [1,2,1], 1);
```

結果:

``` text
[1,1,2]
```

この例では、`arrayEnumerateUniqRanked` がマルチ次元配列の各要素に対して、それぞれが同じ値の要素の中で何番目に存在するかを示す配列を取得します。渡された配列の最初の行 ` [1,2,3]` に対する対応する結果は ` [1,1,1]` であり、これは `1`, `2`, `3` が初めて出現することを示しています。渡された配列の2番目の行 ` [2,2,1]` に対する結果は ` [2,3,3]` であり、`2` が2回目と3回目に出現し、`1` が2回目に出現することを示しています。同様に、渡された配列 ` [3]` の3番目の行に対する結果は ` [2]` であり、`3` が2回目に出現することを示します。

クエリ:

``` sql
SELECT arrayEnumerateUniqRanked(1, [[1,2,3],[2,2,1],[3]], 2);
```

結果:

``` text
[[1,1,1],[2,3,2],[2]]
```

`clear_depth=2` に変更すると、要素は各行ごとに個別に列挙されます。

クエリ:

``` sql
SELECT arrayEnumerateUniqRanked(2, [[1,2,3],[2,2,1],[3]], 2);
```

結果:

``` text
[[1,1,1],[1,2,1],[1]]
```

## arrayPopBack {#arraypopback}

配列の最後の項目を削除します。

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

配列の最初の項目を削除します。

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

配列の最後に1項目を追加します。

``` sql
arrayPushBack(array, single_value)
```

**引数**

- `array` – 配列。
- `single_value` – 単一の値。配列が数値の場合は数値のみ、文字列の場合は文字列のみを追加できます。数値を追加する場合、ClickHouse は自動的に `single_value` の型を配列のデータ型に設定します。ClickHouse のデータ型の詳細については、「[データ型](../data-types/index.md#data_types)」を参照してください。`NULL` も可能です。この関数は配列に `NULL` 要素を追加し、配列要素の型は `Nullable` に変換されます。

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

配列の最初に1項目を追加します。

``` sql
arrayPushFront(array, single_value)
```

**引数**

- `array` – 配列。
- `single_value` – 単一の値。配列が数値の場合は数値のみ、文字列の場合は文字列のみを追加できます。数値を追加する場合、ClickHouse は自動的に `single_value` の型を配列のデータ型に設定します。ClickHouse のデータ型の詳細については、「[データ型](../data-types/index.md#data_types)」を参照してください。`NULL` も可能です。この関数は配列に `NULL` 要素を追加し、配列要素の型は `Nullable` に変換されます。

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
- `size` — 必須の配列の長さ。
  - `size` が元の配列のサイズより小さい場合、配列は右から切り詰められます。
- `size` が配列の初期サイズより大きい場合、配列は右に `extender` 値または配列アイテムのデータ型のデフォルト値で拡張されます。
- `extender` — 配列を拡張するための値。`NULL` も可能。

**戻り値:**

長さが `size` の配列。

**例の呼び出し**

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
- `offset` – 配列の端からのインデント。正の値は左からのオフセットを示し、負の値は右からのインデントを示します。配列項目の番号付けは1から始まります。
- `length` – 必要なスライスの長さ。負の値を指定すると、関数はオープンスライス `[offset, array_length - length]` を返します。値を省略すると、関数は `[offset, the_end_of_array]` のスライスを返します。

**例**

``` sql
SELECT arraySlice([1, 2, NULL, 4, 5], 2, 3) AS res;
```

``` text
┌─res────────┐
│ [2,NULL,4] │
└────────────┘
```

配列要素が `NULL` に設定されている場合、通常の値として処理されます。

## arrayShingles {#arrayshingles}

入力配列とも呼ばれる「シングル」の配列を生成します。 
指定された長さでの連続したサブ配列です。

**構文**

``` sql
arrayShingles(array, length)
```

**引数**

- `array` — 入力配列 [Array](../data-types/array.md).
- `length` — 各シングルの長さ。

**戻り値**

生成されたシングルの配列。 [Array](../data-types/array.md).

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

配列 `arr` の要素を昇順にソートします。`func` 関数が指定された場合、ソート順序は配列の要素に適用された `func` 関数の結果によって決まります。`func` が複数の引数を取る場合、`arraySort` 関数には引数に対して複数の配列が渡され、その引数に `func` が対応します。詳細な例は `arraySort` の説明の最後に示されています。

整数値のソートの例:

``` sql
SELECT arraySort([1, 3, 3, 0]);
```

``` text
┌─arraySort([1, 3, 3, 0])─┐
│ [0,1,3,3]               │
└─────────────────────────┘
```

文字列値のソートの例:

``` sql
SELECT arraySort(['hello', 'world', '!']);
```

``` text
┌─arraySort(['hello', 'world', '!'])─┐
│ ['!','hello','world']              │
└────────────────────────────────────┘
```

次の `NULL`, `NaN`, `Inf` 値のソート順序を考慮してください。

``` sql
SELECT arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf]);
```

``` text
┌─arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf])─┐
│ [-inf,-4,1,2,3,inf,nan,nan,NULL,NULL]                     │
└───────────────────────────────────────────────────────────┘
```

- `-Inf` 値が最初に来ます。
- `NULL` 値は配列の最後に来ます。
- `NaN` 値は `NULL` の直前に来ます。
- `Inf` 値は `NaN` の直前に来ます。

`arraySort` は [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数としてラムダ関数を渡すことができます。この場合、ソート順序は配列の要素に適用されたラムダ関数の結果によって決まります。

次の例を考えてみましょう。

``` sql
SELECT arraySort((x) -> -x, [1, 2, 3]) as res;
```

``` text
┌─res─────┐
│ [3,2,1] │
└─────────┘
```

ソース配列の各要素に対して、ラムダ関数はソートキーを返します。すなわち、\[1 –\> -1, 2 –\> -2, 3 –\> -3\]です。`arraySort` 関数はキーを昇順にソートするため、結果は \[3, 2, 1\] になります。したがって、ラムダ関数 `(x) -> -x` はソートの [降順](#arrayreversesort) を設定します。

ラムダ関数は複数の引数を受け取ることができます。この場合、ソートキーを指定するために、`arraySort` 関数に同じ長さの複数の配列を渡す必要があります。結果の配列は最初の入力配列の要素で構成され、次の入力配列がソートキーを指定します。例えば：

``` sql
SELECT arraySort((x, y) -> y, ['hello', 'world'], [2, 1]) as res;
```

``` text
┌─res────────────────┐
│ ['world', 'hello'] │
└────────────────────┘
```

ここでは、2番目の配列 (\[2, 1\]) に渡された要素が、ソース配列 (\['hello', 'world'\]) の対応する要素のソートキーを定義しています。すなわち、\['hello' –\> 2, 'world' –\> 1\] です。ラムダ関数が `x` を使用していないため、ソース配列の実際の値は結果の順序には影響しません。したがって、'hello' は結果の2番目の要素になり、'world' は最初の要素になります。
他の例は以下に示されています。

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
ソートの効率を向上させるために、[シュワルツ変換](https://en.wikipedia.org/wiki/Schwartzian_transform)が使用されています。
:::

## arrayPartialSort（\[func,\] limit, arr, ...）{#arraypartialsortfunc-limit-arr-}

`arraySort`と同様ですが、追加の`limit`引数により部分ソートが可能です。元の配列と同じサイズの配列を返し、範囲`[1..limit]`内の要素は昇順にソートされます。残りの要素`(limit..N]`は未定義の順序で含まれます。

## arrayReverseSort {#arrayreversesort}

`arr`配列の要素を降順にソートします。`func`関数が指定されている場合、`arr`は配列の要素に適用された`func`関数の結果に従ってソートされ、ソートされた配列が逆順になります。`func`が複数の引数を受け入れる場合、`arrayReverseSort`関数には`func`の引数に対応するいくつかの配列が渡されます。詳細な例は`arrayReverseSort`の説明の最後に示されています。

**構文**

```sql
arrayReverseSort([func,] arr, ...)
```

整数値のソート例：

```sql
SELECT arrayReverseSort([1, 3, 3, 0]);
```

```text
┌─arrayReverseSort([1, 3, 3, 0])─┐
│ [3,3,1,0]                      │
└────────────────────────────────┘
```

文字列値のソート例：

```sql
SELECT arrayReverseSort(['hello', 'world', '!']);
```

```text
┌─arrayReverseSort(['hello', 'world', '!'])─┐
│ ['world','hello','!']                     │
└───────────────────────────────────────────┘
```

次のように`NULL`、`NaN`、`Inf`値のソート順序を考慮してください：

```sql
SELECT arrayReverseSort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf]) as res;
```

```text
┌─res───────────────────────────────────┐
│ [inf,3,2,1,-4,-inf,nan,nan,NULL,NULL] │
└───────────────────────────────────────┘
```

- `Inf`値は配列の最初に来ます。
- `NULL`値は配列の最後に来ます。
- `NaN`値は`NULL`の直前にあります。
- `-Inf`値は`NaN`の直前に来ます。

`arrayReverseSort`は[高階関数](../../sql-reference/functions/overview#higher-order-functions)であることに注意してください。最初の引数としてラムダ関数を渡すことができます。以下に例を示します。

```sql
SELECT arrayReverseSort((x) -> -x, [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [1,2,3] │
└─────────┘
```

配列は次のようにソートされます：

1. 最初に、ソース配列（\[1, 2, 3\]）は、配列の要素に適用されたラムダ関数の結果に従ってソートされます。結果は配列\[3, 2, 1\]です。
2. 前のステップで得られた配列は逆転します。したがって、最終的な結果は\[1, 2, 3\]です。

ラムダ関数はいくつかの引数を受け入れることができます。この場合、`arrayReverseSort`関数には、ラムダ関数の引数に対応する同じ長さの配列をいくつか渡す必要があります。結果の配列は最初の入力配列からの要素で構成されます。次の入力配列（複数可）は、対応する要素のソートキーを定義します。例えば：

```sql
SELECT arrayReverseSort((x, y) -> y, ['hello', 'world'], [2, 1]) as res;
```

```text
┌─res───────────────┐
│ ['hello','world'] │
└───────────────────┘
```

この例では、配列は次のようにソートされます：

1. 最初に、ソース配列（\['hello', 'world'\]）は、配列の要素に適用されたラムダ関数の結果に従ってソートされます。2番目の配列（\[2, 1\]）に渡された要素が、ソース配列の対応する要素のソートキーを定義します。結果は配列\['world', 'hello'\]です。
2. 前のステップでソートされた配列は逆転します。したがって、最終結果は\['hello', 'world'\]です。

他の例は以下に示されています。

```sql
SELECT arrayReverseSort((x, y) -> y, [4, 3, 5], ['a', 'b', 'c']) AS res;
```

```text
┌─res─────┐
│ [5,3,4] │
└─────────┘
```

```sql
SELECT arrayReverseSort((x, y) -> -y, [4, 3, 5], [1, 2, 3]) AS res;
```

```text
┌─res─────┐
│ [4,3,5] │
└─────────┘
```

## arrayPartialReverseSort（\[func,\] limit, arr, ...）{#arraypartialreversesortfunc-limit-arr-}

`arrayReverseSort`と同様ですが、追加の`limit`引数により部分ソートが可能です。元の配列と同じサイズの配列を返し、範囲`[1..limit]`内の要素は降順にソートされます。残りの要素`(limit..N]`は未定義の順序で含まれます。

## arrayShuffle {#arrayshuffle}

元の配列と同じサイズの配列をシャッフルされた順序で返します。
要素はそうすることで、これらの要素の各可能な順列が同じ出現確率を持つように再配置されます。

**構文**

```sql
arrayShuffle(arr[, seed])
```

**パラメータ**

- `arr`: 部分的にシャッフルする配列。[配列](../data-types/array.md)。
- `seed`（オプション）: ランダム数生成に使用されるシード。指定しなければ、ランダムなものが使用されます。[UIntまたはInt](../data-types/int-uint.md)。

**返される値**

- シャッフルされた要素を含む配列。

**実装の詳細**

:::note
この関数は定数を物質化しません。
:::

**例**

この例では、`arrayShuffle`はシードを指定せずに使用されるため、ランダムに選択します。

クエリ：

```sql
SELECT arrayShuffle([1, 2, 3, 4]);
```

注: [ClickHouse Fiddle](https://fiddle.clickhouse.com/)を使用する場合、関数のランダムな特性により、正確な応答は異なる可能性があります。

結果：

```response
[1,4,2,3]
```

この例では、`arrayShuffle`にシードが指定され、安定した結果を生成します。

クエリ：

```sql
SELECT arrayShuffle([1, 2, 3, 4], 41);
```

結果：

```response
[3,2,1,4]
```

## arrayPartialShuffle {#arraypartialshuffle}

入力配列の基数`N`が与えられると、サイズNの配列を返し、範囲`[1...limit]`の要素はシャッフルされ、範囲`(limit...n]`の残りの要素はシャッフルされません。

**構文**

```sql
arrayPartialShuffle(arr[, limit[, seed]])
```

**パラメータ**

- `arr`: 部分的にシャッフルする配列のサイズ`N`。[配列](../data-types/array.md)。
- `limit`（オプション）: 要素のスワップ数を制限する数、範囲`[1..N]`内。[UIntまたはInt](../data-types/int-uint.md)。
- `seed`（オプション）: ランダム数生成に使用されるシード値。指定しなければ、ランダムなものが使用されます。[UIntまたはInt](../data-types/int-uint.md)

**返される値**

- 部分的にシャッフルされた要素の配列。

**実装の詳細**

:::note
この関数は定数を物質化しません。

`limit`の値は範囲`[1..N]`内である必要があります。その範囲の外にある値は、完全な[arrayShuffle](#arrayshuffle)を実行するのと同等です。
:::

**例**

注: [ClickHouse Fiddle](https://fiddle.clickhouse.com/)を使用する場合、関数のランダムな特性により、正確な応答は異なる可能性があります。

クエリ：

```sql
SELECT arrayPartialShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1)
```

結果：

要素の順序は保持されます（`\[2,3,4,5], [7,8,9,10]`）が、シャッフルされた要素は`\[1, 6\]`のみです。シードは指定されておらず、関数は自分自身でランダムに選択します。

```response
[6,2,3,4,5,1,7,8,9,10]
```

この例では、`limit`が`2`に増加し、シード値が指定されています。順序は保持されますが、シャッフルされた要素は`\[1, 2, 3, 9\]`の4つです。

クエリ：

```sql
SELECT arrayPartialShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
```

結果：

```response
[3,9,1,4,5,6,7,8,2,10]
```

## arrayUniq(arr, ...) {#arrayuniqarr-}

1つの引数が渡された場合、配列内の異なる要素の数を数えます。
複数の引数が渡された場合、複数の配列内の対応する位置にある異なるタプルの数を数えます。

配列内のユニークなアイテムのリストを取得したい場合は、arrayReduce('groupUniqArray', arr)を使用できます。

## arrayJoin(arr) {#arrayjoinarr}

特別な関数です。「["ArrayJoin関数"](../../sql-reference/functions/array-join.md#functions_arrayjoin)」のセクションを参照してください。

## arrayDifference {#arraydifference}

隣接する配列要素間の差の配列を計算します。結果配列の最初の要素は0で、2番目は`a[1] - a[0]`、3番目は`a[2] - a[1]`、などです。結果配列の要素の型は引き算の型推論ルールによって決まります（例：`UInt8` - `UInt8` = `Int16`）。

**構文**

```sql
arrayDifference(array)
```

**引数**

- `array` – [配列](/data_types/array/)。

**戻り値**

隣接する配列要素間の差の配列を返します。[UInt\*](/data_types/int_uint/#uint-ranges)、[Int\*](/data_types/int_uint/#int-ranges)、[Float\*](/data_types/float/) のいずれかです。

**例**

クエリ：

```sql
SELECT arrayDifference([1, 2, 3, 4]);
```

結果：

```text
┌─arrayDifference([1, 2, 3, 4])─┐
│ [0,1,1,1]                     │
└───────────────────────────────┘
```

結果型Int64のオーバーフローの例：

クエリ：

```sql
SELECT arrayDifference([0, 10000000000000000000]);
```

結果：

```text
┌─arrayDifference([0, 10000000000000000000])─┐
│ [0,-8446744073709551616]                   │
└────────────────────────────────────────────┘
```

## arrayDistinct {#arraydistinct}

配列を受け取り、ユニークな要素のみを含む配列を返します。

**構文**

```sql
arrayDistinct(array)
```

**引数**

- `array` – [配列](/data_types/array/)。

**戻り値**

ユニークな要素を含む配列を返します。

**例**

クエリ：

```sql
SELECT arrayDistinct([1, 2, 2, 3, 1]);
```

結果：

```text
┌─arrayDistinct([1, 2, 2, 3, 1])─┐
│ [1,2,3]                        │
└────────────────────────────────┘
```

## arrayEnumerateDense {#arrayenumeratedense}

元の配列と同じサイズの配列を返し、各要素が元の配列に初めて出現する場所を示します。

**構文**

```sql
arrayEnumerateDense(arr)
```

**例**

クエリ：

```sql
SELECT arrayEnumerateDense([10, 20, 10, 30])
```

結果：

```text
┌─arrayEnumerateDense([10, 20, 10, 30])─┐
│ [1,2,1,3]                             │
└───────────────────────────────────────┘
```

## arrayEnumerateDenseRanked {#arrayenumeratedenseranked}

ソース配列と同じサイズの配列を返し、各要素が初めて出現する場所を示します。多次元配列の列挙を可能にし、配列内をどれだけ深く探すかを指定できる機能を持ちます。

**構文**

```sql
arrayEnumerateDenseRanked(clear_depth, arr, max_array_depth)
```

**パラメータ**

- `clear_depth`: 指定されたレベルで要素を別々に列挙します。`max_arr_depth`以下の正の[整数](../data-types/int-uint.md)。
- `arr`: 列挙するN次元配列。[配列](../data-types/array.md)。
- `max_array_depth`: 最大実効深度。`arr`の深さ以下の正の[整数](../data-types/int-uint.md)。

**例**

`clear_depth=1`および`max_array_depth=1`の場合、結果は[arrayEnumerateDense](#arrayenumeratedense)が返すものと同じです。

クエリ：

```sql
SELECT arrayEnumerateDenseRanked(1,[10, 20, 10, 30],1);
```

結果：

```text
[1,2,1,3]
```

この例では、`arrayEnumerateDenseRanked`が多次元配列の各要素に対して、その値が同じ要素の中での位置を示す配列を取得するために使用されています。渡された配列の最初の行`[10,10,30,20]`の対応する結果の最初の行は`[1,1,2,3]`であり、`10`が位置1と2で最初に遭遇した数字で、`30`が位置3で2番目に遭遇した数字で、`20`が位置4で3番目に遭遇した数字と表示します。第二の行`[40, 50, 10, 30]`では、対応する結果の第二の行は`[4,5,1,2]`で、`40`と`50`がその行の位置1と2でそれぞれ4番目と5番目の数字で、もう一つの`10`（最初に遭遇した数字）が位置3にあり、`30`（2番目に遭遇した数字）が最後の位置にあることを示しています。

クエリ：

```sql
SELECT arrayEnumerateDenseRanked(1,[[10,10,30,20],[40,50,10,30]],2);
```

結果：

```text
[[1,1,2,3],[4,5,1,2]]
```

`clear_depth=2`に変更すると、各行ごとに新たに列挙が行われます。

クエリ：

```sql
SELECT arrayEnumerateDenseRanked(2,[[10,10,30,20],[40,50,10,30]],2);
```

結果：

```text
[[1,1,2,3],[1,2,3,4]]
```

## arrayUnion {#arrayunion}

複数の配列を受け取り、一つの配列を返します。返された配列には、ソース配列のいずれかに存在するすべての要素が含まれます。
結果にはユニークな値のみが含まれます。

**構文**

```sql
arrayUnion(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [配列](../data-types/array.md)。

関数は異なる型の任意の数の配列を取ることができます。

**戻り値**

- ソース配列からの異なる要素を含む[配列](../data-types/array.md)。

**例**

クエリ：

```sql
SELECT
    arrayUnion([-2, 1], [10, 1], [-2], []) as num_example,
    arrayUnion(['hi'], [], ['hello', 'hi']) as str_example,
    arrayUnion([1, 3, NULL], [2, 3, NULL]) as null_example
```

結果：

```text
┌─num_example─┬─str_example────┬─null_example─┐
│ [10,-2,1]   │ ['hello','hi'] │ [3,2,1,NULL] │
└─────────────┴────────────────┴──────────────┘
```

## arrayIntersect {#arrayintersect}

複数の配列を受け取り、すべてのソース配列に存在する要素を持つ配列を返します。
結果にはユニークな値のみが含まれます。

**構文**

```sql
arrayIntersect(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [配列](../data-types/array.md)。

関数は異なる型の任意の数の配列を取ることができます。

**戻り値**

- すべてのソース配列に存在する異なる要素の[配列](../data-types/array.md)。

**例**

クエリ：

```sql
SELECT
    arrayIntersect([1, 2], [1, 3], [2, 3]) AS empty_intersection,
    arrayIntersect([1, 2], [1, 3], [1, 4]) AS non_empty_intersection
```

結果：

```text
┌─non_empty_intersection─┬─empty_intersection─┐
│ []                     │ [1]                │
└────────────────────────┴────────────────────┘
```

## arraySymmetricDifference {#arraysymmetricdifference}

複数の配列を受け取り、すべてのソース配列に存在しない要素の配列を返します。
結果にはユニークな値のみが含まれます。

:::note
_二つ以上の集合_ の対称差は、[数学的に定義された](https://en.wikipedia.org/wiki/Symmetric_difference#n-ary_symmetric_difference)もので、すべての入力要素が奇数回出現する入力集合の集合です。
対照的に、`arraySymmetricDifference`関数は、すべての入力集合に存在しない入力要素の集合を単に返します。
:::

**構文**

```sql
arraySymmetricDifference(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [配列](../data-types/array.md)。

関数は異なる型の任意の数の配列を取ることができます。

**戻り値**

- すべてのソース配列に存在しないユニークな要素の[配列](../data-types/array.md)。

**例**

クエリ：

```sql
SELECT
    arraySymmetricDifference([1, 2], [1, 2], [1, 2]) AS empty_symmetric_difference,
    arraySymmetricDifference([1, 2], [1, 2], [1, 3]) AS non_empty_symmetric_difference,
```

結果：

```text
┌─empty_symmetric_difference─┬─non_empty_symmetric_difference─┐
│ []                         │ [3]                            │
└────────────────────────────┴────────────────────────────────┘
```

## arrayJaccardIndex {#arrayjaccardindex}

二つの配列の[ジャッカード指数](https://en.wikipedia.org/wiki/Jaccard_index)を返します。

**例**

クエリ：

```sql
SELECT arrayJaccardIndex([1, 2], [2, 3]) AS res
```

結果：

```text
┌─res────────────────┐
│ 0.3333333333333333 │
└────────────────────┘
```

## arrayReduce {#arrayreduce}

配列要素に集約関数を適用し、その結果を返します。集約関数の名前はシングルクォート`'max'`、`'sum'`内の文字列として渡されます。パラメトリック集約関数を使用する場合は、関数名の後に括弧内でパラメータを示します`'uniqUpTo(6)'`。

**構文**

```sql
arrayReduce(agg_func, arr1, arr2, ..., arrN)
```

**引数**

- `agg_func` — 定数[文字列](../data-types/string.md)であるべき集約関数の名前。
- `arr` — 集約関数のパラメータとしての任意の数の[配列](../data-types/array.md)型の列。

**戻り値**

**例**

クエリ：

```sql
SELECT arrayReduce('max', [1, 2, 3]);
```

結果：

```text
┌─arrayReduce('max', [1, 2, 3])─┐
│                             3 │
└───────────────────────────────┘
```

集約関数が複数の引数を取る場合、この関数は同じサイズの複数の配列に適用されなければなりません。

クエリ：

```sql
SELECT arrayReduce('maxIf', [3, 5], [1, 0]);
```

結果：

```text
┌─arrayReduce('maxIf', [3, 5], [1, 0])─┐
│                                    3 │
└──────────────────────────────────────┘
```

パラメトリック集約関数を使った例：

クエリ：

```sql
SELECT arrayReduce('uniqUpTo(3)', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
```

結果：

```text
┌─arrayReduce('uniqUpTo(3)', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])─┐
│                                                           4 │
└─────────────────────────────────────────────────────────────┘
```

**参照**

- [arrayFold](#arrayfold)

## arrayReduceInRanges {#arrayreduceinranges}

与えられた範囲で配列要素に集約関数を適用し、各範囲に対応する結果を含む配列を返します。この関数は、複数の`arrayReduce(agg_func, arraySlice(arr1, index, length), ...)`と同じ結果を返します。

**構文**

```sql
arrayReduceInRanges(agg_func, ranges, arr1, arr2, ..., arrN)
```

**引数**

- `agg_func` — 定数[文字列](../data-types/string.md)であるべき集約関数の名前。
- `ranges` — 各範囲のインデックスと長さを含む[タプル](../data-types/tuple.md)の[配列](../data-types/array.md)。
- `arr` — 集約関数のパラメータとしての任意の数の[配列](../data-types/array.md)型の列。

**戻り値**

指定された範囲に対する集約関数の結果を含む配列。[配列](../data-types/array.md)。

**例**

クエリ：

```sql
SELECT arrayReduceInRanges(
    'sum',
    [(1, 5), (2, 3), (3, 4), (4, 4)],
    [1000000, 200000, 30000, 4000, 500, 60, 7]
) AS res
```

結果：

```text
┌─res─────────────────────────┐
│ [1234500,234000,34560,4567] │
└─────────────────────────────┘
```

## arrayFold {#arrayfold}

ラムダ関数を一つまたは複数の同じサイズの配列に適用し、結果を累積します。

**構文**

```sql
arrayFold(lambda_function, arr1, arr2, ..., accumulator)
```

**例**

クエリ：

```sql
SELECT arrayFold( acc,x -> acc + x*2,  [1, 2, 3, 4], toInt64(3)) AS res;
```

結果：

```text
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

元の配列と同じサイズの配列を返し、要素を逆順にします。

**構文**

```sql
arrayReverse(arr)
```

例：

```sql
SELECT arrayReverse([1, 2, 3])
```

```text
┌─arrayReverse([1, 2, 3])─┐
│ [3,2,1]                 │
└─────────────────────────┘
```

## reverse(arr) {#reversearr}

["arrayReverse"](#arrayreverse)の同義語です。

## arrayFlatten {#arrayflatten}

配列の配列をフラットな配列に変換します。

関数：

- ネストされた配列の任意の深さに適用されます。
- すでにフラットな配列は変更されません。

フラットにされた配列には、すべての元の配列からのすべての要素が含まれます。

**構文**

```sql
flatten(array_of_arrays)
```

エイリアス: `flatten`。

**パラメータ**

- `array_of_arrays` — [配列](../data-types/array.md)の配列。例えば、`[[1,2,3], [4,5]]`。

**例**

```sql
SELECT flatten([[[1]], [[2], [3]]]);
```

```text
┌─flatten(array(array([1]), array([2], [3])))─┐
│ [1,2,3]                                     │
└─────────────────────────────────────────────┘
```

## arrayCompact {#arraycompact}

配列から連続した重複要素を削除します。結果の値の順序は元の配列の順序によって決まります。

**構文**

```sql
arrayCompact(arr)
```

**引数**

`arr` — 検査する[配列](../data-types/array.md)。

**戻り値**

重複を除いた配列。[配列](../data-types/array.md)。

**例**

クエリ：

```sql
SELECT arrayCompact([1, 1, nan, nan, 2, 3, 3, 3]);
```

結果：

```text
┌─arrayCompact([1, 1, nan, nan, 2, 3, 3, 3])─┐
│ [1,nan,nan,2,3]                            │
└────────────────────────────────────────────┘
```

## arrayZip {#arrayzip}

複数の配列を一つの配列に結合します。結果の配列には、ソース配列の対応する要素がタプルにグループ化され、引数の伝えられた順序になります。

**構文**

```sql
arrayZip(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [配列](../data-types/array.md)。

関数は異なる型の任意の数の配列を取ることができます。すべての入力配列は同じサイズである必要があります。

**戻り値**

ソース配列からの要素が[タプル](../data-types/tuple.md)としてグループ化された配列。タプル内のデータ型は、入力配列の型と同じであり、配列が渡された順序と同じです。[配列](../data-types/array.md)。

**例**

クエリ：

```sql
SELECT arrayZip(['a', 'b', 'c'], [5, 2, 1]);
```

結果：

```text
┌─arrayZip(['a', 'b', 'c'], [5, 2, 1])─┐
│ [('a',5),('b',2),('c',1)]            │
└──────────────────────────────────────┘
```

## arrayZipUnaligned {#arrayzipunaligned}

複数の配列を一つの配列に結合し、アラインされていない配列を許可します。結果の配列には、ソース配列の対応する要素がタプルにグループ化され、引数の伝えられた順序になります。

**構文**

```sql
arrayZipUnaligned(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [配列](../data-types/array.md)。

関数は異なる型の任意の数の配列を取ることができます。

**戻り値**

ソース配列の要素が[タプル](../data-types/tuple.md)にグループ化された配列。タプル内のデータ型は、入力配列の型と同じであり、配列が渡された順序と同じです。[配列](../data-types/array.md)。配列のサイズが異なる場合、短い配列には`null`値がパディングされます。

**例**

クエリ：

```sql
SELECT arrayZipUnaligned(['a'], [1, 2, 3]);
```

結果：

```text
┌─arrayZipUnaligned(['a'], [1, 2, 3])─┐
│ [('a',1),(NULL,2),(NULL,3)]         │
└─────────────────────────────────────┘
```

## arrayROCAUC {#arrayrocauc}

受信者操作特性（ROC）曲線の下の面積を計算します。
ROC曲線は、すべての閾値にわたってy軸に真陽性率（TPR）、x軸に偽陽性率（FPR）をプロットすることで作成されます。
結果の値は0から1の範囲で、高い値はより良いモデル性能を示します。
ROC AUC（単にAUCとも呼ばれる）は機械学習の概念です。
詳しくは、[こちら](https://developers.google.com/machine-learning/glossary#pr-auc-area-under-the-pr-curve)、[こちら](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc#expandable-1)および[こちら](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve)をご覧ください。

**構文**

```sql
arrayROCAUC(arr_scores, arr_labels[, scale[, arr_partial_offsets]])
```

エイリアス: `arrayAUC`

**引数**

- `arr_scores` — モデルが与えるスコア。[配列](../data-types/array.md)の[整数](../data-types/int-uint.md)または[浮動小数点数](../data-types/float.md)。
- `arr_labels` — サンプルのラベル。通常、正のサンプルには1、負のサンプルには0が与えられます。[配列](../data-types/array.md)の[整数](../data-types/int-uint.md)または[列挙型](../data-types/enum.md)。
- `scale` — 正規化された面積を返すかどうかを決定します。falseの場合、TP（真陽性）x FP（偽陽性）曲線の下の面積を返します。デフォルト値: true。[ブール値](../data-types/boolean.md)。オプション。
- `arr_partial_offsets` — ROC曲線の下の部分的な面積を計算するための4つの非負整数の配列（ROC空間の垂直帯に相当）。このオプションは、ROC AUCの分散計算に便利です。配列には次の要素を含める必要があります[`higher_partitions_tp`, `higher_partitions_fp`, `total_positives`, `total_negatives`]。 [非負の[整数](../data-types/int-uint.md)]の[配列](../data-types/array.md)。オプション。
    - `higher_partitions_tp`: 高スコアパーティションにおける正ラベルの数。
    - `higher_partitions_fp`: 高スコアパーティションにおける負ラベルの数。
    - `total_positives`: データセット全体の正サンプルの総数。
    - `total_negatives`: データセット全体の負サンプルの総数。

::::note
`arr_partial_offsets`が使用されると、`arr_scores`と`arr_labels`は全体のデータセットの一部のみで、スコアの間隔を含む必要があります。
データセットは連続したパーティションに分けられる必要があり、各パーティションにはスコアが特定の範囲内にあるデータのサブセットが含まれます。
例えば：
- 一つのパーティションは範囲[0, 0.5)内のすべてのスコアを含むことができます。
- 他のパーティションは範囲[0.5, 1.0]内のすべてのスコアを含むことができます。
::::

**戻り値**

受信者操作特性（ROC）曲線の下の面積を返します。[Float64](../data-types/float.md)。

**例**

クエリ：

```sql
select arrayROCAUC([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]);
```

結果：

```text
┌─arrayROCAUC([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])─┐
│                                             0.75 │
└──────────────────────────────────────────────────┘
```

## arrayAUCPR {#arrayaucpr}

精度-再現率（PR）曲線の下の面積を計算します。
精度-再現率曲線は、y軸に精度、x軸に再現率をプロットすることで作成されます。
結果の値は0から1の範囲で、高い値はより良いモデル性能を示します。
PR AUCは、ROC AUCに比べて不均衡なデータセットの比較が明確になるため、特に有用です。
詳しくは、[こちら](https://developers.google.com/machine-learning/glossary#pr-auc-area-under-the-pr-curve)、[こちら](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc#expandable-1)および[こちら](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve)をご覧ください。

**構文**

```sql
arrayAUCPR(arr_scores, arr_labels[, arr_partial_offsets])
```

エイリアス: `arrayPRAUC`

**引数**

- `arr_scores` — モデルが与えるスコア。[配列](../data-types/array.md)の[整数](../data-types/int-uint.md)または[浮動小数点数](../data-types/float.md)。
- `arr_labels` — サンプルのラベル。通常、正のサンプルには1、負のサンプルには0が与えられます。[配列](../data-types/array.md)の[整数](../data-types/int-uint.md)または[列挙型](../data-types/enum.md)。
- `arr_partial_offsets` — オプション。PR曲線の下の部分的な面積を計算するための3つの非負整数の[配列](../data-types/array.md)（PR空間の垂直帯に相当）。このオプションは、PR AUCの分散計算に便利です。配列には次の要素を含める必要があります[`higher_partitions_tp`, `higher_partitions_fp`, `total_positives`]。 [非負の[整数](../data-types/int-uint.md)]の[配列](../data-types/array.md)。オプション。
    - `higher_partitions_tp`: 高スコアパーティションにおける正ラベルの数。
    - `higher_partitions_fp`: 高スコアパーティションにおける負ラベルの数。
    - `total_positives`: データセット全体の正サンプルの総数。

::::note
`arr_partial_offsets`が使用されると、`arr_scores`と`arr_labels`は全体のデータセットの一部のみで、スコアの間隔を含む必要があります。
データセットは連続したパーティションに分けられる必要があり、各パーティションにはスコアが特定の範囲内にあるデータのサブセットが含まれます。
例えば：
- 一つのパーティションは範囲[0, 0.5)内のすべてのスコアを含むことができます。
- 他のパーティションは範囲[0.5, 1.0]内のすべてのスコアを含むことができます。
::::

**戻り値**

精度-再現率（PR）曲線の下の面積を返します。[Float64](../data-types/float.md)。

**例**

クエリ：

```sql
select arrayAUCPR([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]);
```

結果：

```text
┌─arrayAUCPR([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])─┐
│                              0.8333333333333333 │
└─────────────────────────────────────────────────┘
```

## arrayMap(func, arr1, ...) {#arraymapfunc-arr1-}

元の配列から`func(arr1[i], ..., arrN[i])`の適用によって得られる配列を返します。配列`arr1`...`arrN`は同じ数の要素を持っている必要があります。

例：

```sql
SELECT arrayMap(x -> (x + 2), [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [3,4,5] │
└─────────┘
```

以下の例は、異なる配列からの要素のタプルを作成する方法を示しています：

```sql
SELECT arrayMap((x, y) -> (x, y), [1, 2, 3], [4, 5, 6]) AS res
```

```text
┌─res─────────────────┐
│ [(1,4),(2,5),(3,6)] │
└─────────────────────┘
```

`arrayMap`が[高階関数](../../sql-reference/functions/overview#higher-order-functions)であることに注意してください。最初の引数としてラムダ関数を渡さなければならず、省略できません。

## arrayFilter(func, arr1, ...) {#arrayfilterfunc-arr1-}

`func(arr1[i], ..., arrN[i])`が0以外の何かを返す配列`arr1`内の要素のみを含む配列を返します。

例：

```sql
SELECT arrayFilter(x -> x > 2, [1, 2, 3, 4]) AS result;
```

```text
┌─result────┐
│ [3,4]     │
└───────────┘
```
```sql
SELECT arrayFilter(x -> x LIKE '%World%', ['Hello', 'abc World']) AS res
```

```text
┌─res───────────┐
│ ['abc World'] │
└───────────────┘
```

```sql
SELECT
    arrayFilter(
        (i, x) -> x LIKE '%World%',
        arrayEnumerate(arr),
        ['Hello', 'abc World'] AS arr)
    AS res
```

```text
┌─res─┐
│ [2] │
└─────┘
```

`arrayFilter` は [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

## arrayFill(func, arr1, ...) {#arrayfillfunc-arr1-}

`arr1` の最初の要素から最後の要素までスキャンし、`func(arr1[i], ..., arrN[i])` が 0 を返す場合に `arr1[i]` を `arr1[i - 1]` で置き換えます。`arr1` の最初の要素は置き換えられません。

例:

```sql
SELECT arrayFill(x -> not isNull(x), [1, null, 3, 11, 12, null, null, 5, 6, 14, null, null]) AS res
```

```text
┌─res──────────────────────────────┐
│ [1,1,3,11,12,12,12,5,6,14,14,14] │
└──────────────────────────────────┘
```

`arrayFill` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

## arrayReverseFill(func, arr1, ...) {#arrayreversefillfunc-arr1-}

`arr1` を最後の要素から最初の要素までスキャンし、`func(arr1[i], ..., arrN[i])` が 0 を返す場合に `arr1[i]` を `arr1[i + 1]` で置き換えます。`arr1` の最後の要素は置き換えられません。

例:

```sql
SELECT arrayReverseFill(x -> not isNull(x), [1, null, 3, 11, 12, null, null, 5, 6, 14, null, null]) AS res
```

```text
┌─res────────────────────────────────┐
│ [1,3,3,11,12,5,5,5,6,14,NULL,NULL] │
└────────────────────────────────────┘
```

`arrayReverseFill` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

## arraySplit(func, arr1, ...) {#arraysplitfunc-arr1-}

`arr1` を複数の配列に分割します。`func(arr1[i], ..., arrN[i])` が 0 以外の値を返すと、その要素の左側で配列が分割されます。最初の要素の前で配列は分割されません。

例:

```sql
SELECT arraySplit((x, y) -> y, [1, 2, 3, 4, 5], [1, 0, 0, 1, 0]) AS res
```

```text
┌─res─────────────┐
│ [[1,2,3],[4,5]] │
└─────────────────┘
```

`arraySplit` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

## arrayReverseSplit(func, arr1, ...) {#arrayreversesplitfunc-arr1-}

`arr1` を複数の配列に分割します。`func(arr1[i], ..., arrN[i])` が 0 以外の値を返すと、その要素の右側で配列が分割されます。最後の要素の後で配列は分割されません。

例:

```sql
SELECT arrayReverseSplit((x, y) -> y, [1, 2, 3, 4, 5], [1, 0, 0, 1, 0]) AS res
```

```text
┌─res───────────────┐
│ [[1],[2,3,4],[5]] │
└───────────────────┘
```

`arrayReverseSplit` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

## arrayExists(\[func,\] arr1, ...) {#arrayexistsfunc-arr1-}

`arr` の中に `func(arr1[i], ..., arrN[i])` が 0 以外の値を返す要素が少なくとも一つ存在する場合は 1 を、そうでない場合は 0 を返します。

`arrayExists` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡すことができます。

## arrayAll(\[func,\] arr1, ...) {#arrayallfunc-arr1-}

`func(arr1[i], ..., arrN[i])` がすべての要素に対して 0 以外の値を返すと 1 を、それ以外の場合は 0 を返します。

`arrayAll` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡すことができます。

## arrayFirst(func, arr1, ...) {#arrayfirstfunc-arr1-}

`arr1` 配列の中で `func(arr1[i], ..., arrN[i])` が 0 以外の値を返す最初の要素を返します。

## arrayFirstOrNull {#arrayfirstornull}

`arr1` 配列の中で `func(arr1[i], ..., arrN[i])` が 0 以外の値を返す最初の要素を返します。そうでない場合は `NULL` を返します。

**構文**

```sql
arrayFirstOrNull(func, arr1, ...)
```

**パラメータ**

- `func`: ラムダ関数。[ラムダ関数](../functions/#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `arr1`: 操作する配列。[配列](../data-types/array.md)。

**返される値**

- 渡された配列の中の最初の要素。
- そうでない場合は `NULL` を返します。

**実装詳細**

`arrayFirstOrNull` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

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

`arr1` 配列の中で `func(arr1[i], ..., arrN[i])` が 0 以外の値を返す最後の要素を返します。

`arrayLast` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

## arrayLastOrNull {#arraylastornull}

`arr1` 配列の中で `func(arr1[i], ..., arrN[i])` が 0 以外の値を返す最後の要素を返します。そうでない場合は `NULL` を返します。

**構文**

```sql
arrayLastOrNull(func, arr1, ...)
```

**パラメータ**

- `func`: ラムダ関数。[ラムダ関数](../functions/#higher-order-functions---operator-and-lambdaparams-expr-function)。
- `arr1`: 操作する配列。[配列](../data-types/array.md)。

**返される値**

- 渡された配列の中の最後の要素。
- そうでない場合は `NULL` を返します。

**実装詳細**

`arrayLastOrNull` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

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

`arr1` 配列の中で `func(arr1[i], ..., arrN[i])` が 0 以外の値を返す最初の要素のインデックスを返します。

`arrayFirstIndex` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

## arrayLastIndex(func, arr1, ...) {#arraylastindexfunc-arr1-}

`arr1` 配列の中で `func(arr1[i], ..., arrN[i])` が 0 以外の値を返す最後の要素のインデックスを返します。

`arrayLastIndex` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡す必要があり、省略することはできません。

## arrayMin {#arraymin}

元の配列の要素の最小値を返します。

`func` 関数が指定されている場合は、この関数によって変換された要素の最小値を返します。

`arrayMin` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡すことができます。

**構文**

```sql
arrayMin([func,] arr)
```

**引数**

- `func` — 関数。[式](../data-types/special-data-types/expression.md)。
- `arr` — 配列。[配列](../data-types/array.md)。

**返される値**

- 関数の値の最小値（または配列の最小値）。

:::note
`func` が指定されている場合、戻り値の型は `func` の戻り値の型と一致します。そうでない場合は配列要素の型に一致します。
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

元の配列の要素の最大値を返します。

`func` 関数が指定されている場合は、この関数によって変換された要素の最大値を返します。

`arrayMax` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡すことができます。

**構文**

```sql
arrayMax([func,] arr)
```

**引数**

- `func` — 関数。[式](../data-types/special-data-types/expression.md)。
- `arr` — 配列。[配列](../data-types/array.md)。

**返される値**

- 関数の値の最大値（または配列の最大値）。

:::note
`func` が指定されている場合、戻り値の型は `func` の戻り値の型と一致します。そうでない場合は配列要素の型に一致します。
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

元の配列の要素の合計を返します。

`func` 関数が指定されている場合は、この関数によって変換された要素の合計を返します。

`arraySum` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡すことができます。

**構文**

```sql
arraySum([func,] arr)
```

**引数**

- `func` — 関数。[式](../data-types/special-data-types/expression.md)。
- `arr` — 配列。[配列](../data-types/array.md)。

**返される値**

- 関数の値の合計（または配列の合計）。

:::note
戻り値の型:

- 元の配列の小数の場合（または変換値の場合、`func` が指定されている場合） — [Decimal128](../data-types/decimal.md)。
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

元の配列の要素の平均値を返します。

`func` 関数が指定されている場合は、この関数によって変換された要素の平均値を返します。

`arrayAvg` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡すことができます。

**構文**

```sql
arrayAvg([func,] arr)
```

**引数**

- `func` — 関数。[式](../data-types/special-data-types/expression.md)。
- `arr` — 配列。[配列](../data-types/array.md)。

**返される値**

- 関数の値の平均（または配列の平均）。[Float64](../data-types/float.md)。

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

元の配列 `arr1` の部分和（累積和）の配列を返します。`func` が指定されている場合は、`arr1`、`arr2`、...、`arrN` に `func` を適用した結果から合計を計算します。すなわち、`func(arr1[i], ..., arrN[i])` です。

**構文**

```sql
arrayCumSum(arr)
```

**引数**

- `arr` — 数値の値を持つ [配列](../data-types/array.md)。

**返される値**

- 元の配列の部分和の配列を返します。[UInt\*](/data_types/int_uint/#uint-ranges)、[Int\*](/data_types/int_uint/#int-ranges)、[Float\*](/data_types/float/)。

例:

```sql
SELECT arrayCumSum([1, 1, 1, 1]) AS res
```

```text
┌─res──────────┐
│ [1, 2, 3, 4] │
└──────────────┘
```

`arrayCumSum` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡すことができます。

## arrayCumSumNonNegative(\[func,\] arr1, ...) {#arraycumsumnonnegativefunc-arr1-}

`arrayCumSum` と同様、元の配列の部分和（累積和）の配列を返します。`func` が指定されている場合は、`arr1`、`arr2`、...、`arrN` に `func` を適用した結果から合計を計算します。`arrayCumSum` とは異なり、現在の累積和が 0 より小さい場合は 0 で置き換えられます。

**構文**

```sql
arrayCumSumNonNegative(arr)
```

**引数**

- `arr` — 数値の値を持つ [配列](../data-types/array.md)。

**返される値**

- 元の配列の非負の部分和の配列を返します。[UInt\*](/data_types/int_uint/#uint-ranges)、[Int\*](/data_types/int_uint/#int-ranges)、[Float\*](/data_types/float/)。

```sql
SELECT arrayCumSumNonNegative([1, 1, -4, 1]) AS res
```

```text
┌─res───────┐
│ [1,2,0,1] │
└───────────┘
```

`arraySumNonNegative` も [高階関数](../../sql-reference/functions/overview#higher-order-functions) です。最初の引数にはラムダ関数を引き渡すことができます。

## arrayProduct {#arrayproduct}

[配列](../data-types/array.md)の要素を掛け算します。

**構文**

```sql
arrayProduct(arr)
```

**引数**

- `arr` — 数値の値を持つ [配列](../data-types/array.md)。

**返される値**

- 配列の要素の積。[Float64](../data-types/float.md)。

**例**

クエリ:

```sql
SELECT arrayProduct([1,2,3,4,5,6]) as res;
```

結果:

```text
┌─res───┐
│ 720   │
└───────┘
```

クエリ:

```sql
SELECT arrayProduct([toDecimal64(1,8), toDecimal64(2,8), toDecimal64(3,8)]) as res, toTypeName(res);
```

戻り値の型は常に [Float64](../data-types/float.md) です。結果:

```text
┌─res─┬─toTypeName(arrayProduct(array(toDecimal64(1, 8), toDecimal64(2, 8), toDecimal64(3, 8))))─┐
│ 6   │ Float64                                                                                  │
└─────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

## arrayRotateLeft {#arrayrotateleft}

指定された数の要素だけ左に [配列](../data-types/array.md) を回転させます。要素の数が負の場合、配列は右に回転します。

**構文**

```sql
arrayRotateLeft(arr, n)
```

**引数**

- `arr` — [配列](../data-types/array.md)。
- `n` — 回転する要素の数。

**返される値**

- 指定された数だけ左に回転された配列。[配列](../data-types/array.md)。

**例**

クエリ:

```sql
SELECT arrayRotateLeft([1,2,3,4,5,6], 2) as res;
```

結果:

```text
┌─res───────────┐
│ [3,4,5,6,1,2] │
└───────────────┘
```

クエリ:

```sql
SELECT arrayRotateLeft([1,2,3,4,5,6], -2) as res;
```

結果:

```text
┌─res───────────┐
│ [5,6,1,2,3,4] │
└───────────────┘
```

クエリ:

```sql
SELECT arrayRotateLeft(['a','b','c','d','e'], 3) as res;
```

結果:

```text
┌─res───────────────────┐
│ ['d','e','a','b','c'] │
└───────────────────────┘
```

## arrayRotateRight {#arrayrotateright}

指定された数の要素だけ右に [配列](../data-types/array.md) を回転させます。要素の数が負の場合、配列は左に回転します。

**構文**

```sql
arrayRotateRight(arr, n)
```

**引数**

- `arr` — [配列](../data-types/array.md)。
- `n` — 回転する要素の数。

**返される値**

- 指定された数だけ右に回転された配列。[配列](../data-types/array.md)。

**例**

クエリ:

```sql
SELECT arrayRotateRight([1,2,3,4,5,6], 2) as res;
```

結果:

```text
┌─res───────────┐
│ [5,6,1,2,3,4] │
└───────────────┘
```

クエリ:

```sql
SELECT arrayRotateRight([1,2,3,4,5,6], -2) as res;
```

結果:

```text
┌─res───────────┐
│ [3,4,5,6,1,2] │
└───────────────┘
```

クエリ:

```sql
SELECT arrayRotateRight(['a','b','c','d','e'], 3) as res;
```

結果:

```text
┌─res───────────────────┐
│ ['c','d','e','a','b'] │
└───────────────────────┘
```

## arrayShiftLeft {#arrayshiftleft}

指定された数の要素だけ左に [配列](../data-types/array.md) をシフトします。新しい要素は提供された引数または配列要素型のデフォルト値で埋められます。要素の数が負の場合、配列は右にシフトします。

**構文**

```sql
arrayShiftLeft(arr, n[, default])
```

**引数**

- `arr` — [配列](../data-types/array.md)。
- `n` — シフトする要素の数。
- `default` — オプション。新しい要素のデフォルト値。

**返される値**

- 指定された数だけ左にシフトされた配列。[配列](../data-types/array.md)。

**例**

クエリ:

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6], 2) as res;
```

結果:

```text
┌─res───────────┐
│ [3,4,5,6,0,0] │
└───────────────┘
```

クエリ:

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6], -2) as res;
```

結果:

```text
┌─res───────────┐
│ [0,0,1,2,3,4] │
└───────────────┘
```

クエリ:

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6], 2, 42) as res;
```

結果:

```text
┌─res─────────────┐
│ [3,4,5,6,42,42] │
└─────────────────┘
```

クエリ:

```sql
SELECT arrayShiftLeft(['a','b','c','d','e','f'], 3, 'foo') as res;
```

結果:

```text
┌─res─────────────────────────────┐
│ ['d','e','f','foo','foo','foo'] │
└─────────────────────────────────┘
```

クエリ:

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6] :: Array(UInt16), 2, 4242) as res;
```

結果:

```text
┌─res─────────────────┐
│ [3,4,5,6,4242,4242] │
└─────────────────────┘
```

## arrayShiftRight {#arrayshiftright}

指定された数の要素だけ右に [配列](../data-types/array.md) をシフトします。新しい要素は提供された引数または配列要素型のデフォルト値で埋められます。要素の数が負の場合、配列は左にシフトします。

**構文**

```sql
arrayShiftRight(arr, n[, default])
```

**引数**

- `arr` — [配列](../data-types/array.md)。
- `n` — シフトする要素の数。
- `default` — オプション。新しい要素のデフォルト値。

**返される値**

- 指定された数だけ右にシフトされた配列。[配列](../data-types/array.md)。

**例**

クエリ:

```sql
SELECT arrayShiftRight([1,2,3,4,5,6], 2) as res;
```

結果:

```text
┌─res───────────┐
│ [0,0,1,2,3,4] │
└───────────────┘
```

クエリ:

```sql
SELECT arrayShiftRight([1,2,3,4,5,6], -2) as res;
```

結果:

```text
┌─res───────────┐
│ [3,4,5,6,0,0] │
└───────────────┘
```

クエリ:

```sql
SELECT arrayShiftRight([1,2,3,4,5,6], 2, 42) as res;
```

結果:

```text
┌─res─────────────┐
│ [42,42,1,2,3,4] │
└─────────────────┘
```

クエリ:

```sql
SELECT arrayShiftRight(['a','b','c','d','e','f'], 3, 'foo') as res;
```

結果:

```text
┌─res─────────────────────────────┐
│ ['foo','foo','foo','a','b','c'] │
└─────────────────────────────────┘
```

クエリ:

```sql
SELECT arrayShiftRight([1,2,3,4,5,6] :: Array(UInt16), 2, 4242) as res;
```

結果:

```text
┌─res─────────────────┐
│ [4242,4242,1,2,3,4] │
└─────────────────────┘
```

## arrayRandomSample {#arrayrandomsample}

関数 `arrayRandomSample` は入力配列から `samples` 個のランダムな要素を持つ部分集合を返します。`samples` が入力配列のサイズを超える場合、サンプルサイズは配列のサイズに制限され、すべての配列要素が返されますが、その順序は保証されません。この関数は、フラット配列と入れ子の配列の両方を処理できます。

**構文**

```sql
arrayRandomSample(arr, samples)
```

**引数**

- `arr` — 要素をサンプリングするための入力配列。([Array(T)](../data-types/array.md))
- `samples` — ランダムサンプルに含める要素の数 ([UInt*](../data-types/int-uint.md))

**返される値**

- 入力配列からのランダムサンプルを含む配列。[配列](../data-types/array.md)。

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

正規化されたジニ係数を計算します。

**構文**

```sql
arrayNormalizedGini(predicted, label)
```

**引数**

- `predicted` — 予測された値 ([Array(T)](../data-types/array.md))
- `label` — 実際の値 ([Array(T)](../data-types/array.md))

**返される値**

- 予測値のジニ係数、正規化された値のジニ係数、及び正規化されたジニ係数（前者のジニ係数の比率）を含むタプル。

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

すべてのサポートされている関数については、[距離関数のドキュメント](../../sql-reference/functions/distance-functions.md)を参照してください。
