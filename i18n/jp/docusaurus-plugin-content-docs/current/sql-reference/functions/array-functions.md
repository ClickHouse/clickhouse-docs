---
'description': 'Array Functionsのドキュメント'
'sidebar_label': '配列'
'sidebar_position': 10
'slug': '/sql-reference/functions/array-functions'
'title': 'Array Functions'
---





# 配列関数
## empty {#empty}

入力配列が空であるかどうかを確認します。

**構文**

```sql
empty([x])
```

配列は、要素を含まない場合、空と見なされます。

:::note
[`optimize_functions_to_subcolumns` 設定](/operations/settings/settings#optimize_functions_to_subcolumns) を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数は配列列全体を読み込んで処理するかわりに、[size0](/sql-reference/data-types/array#array-size) サブカラムのみを読み取ります。クエリ `SELECT empty(arr) FROM TABLE;` は `SELECT arr.size0 = 0 FROM TABLE;` に変換されます。
:::

この関数は、[文字列](string-functions.md#empty)や[UUID](uuid-functions.md#empty)にも適用できます。

**引数**

- `[x]` — 入力配列。[Array](/sql-reference/data-types/array)。

**返される値**

- 空の配列の場合は `1` を返し、非空の配列の場合は `0` を返します。[UInt8](../data-types/int-uint.md)。

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

入力配列が非空であるかどうかを確認します。

**構文**

```sql
notEmpty([x])
```

配列は、少なくとも1つの要素を含む場合、非空と見なされます。

:::note
[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数は配列列全体を読み込んで処理するかわりに、[size0](/sql-reference/data-types/array#array-size) サブカラムのみを読み取ります。クエリ `SELECT notEmpty(arr) FROM table` は `SELECT arr.size0 != 0 FROM TABLE` に変換されます。
:::

この関数は、[文字列](string-functions.md#notempty)や[UUID](uuid-functions.md#notempty)にも適用できます。

**引数**

- `[x]` — 入力配列。[Array](/sql-reference/data-types/array)。

**返される値**

- 非空の配列の場合は `1` を返し、空の配列の場合は `0` を返します。[UInt8](../data-types/int-uint.md)。

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

配列内のアイテム数を返します。
結果の型は UInt64 です。この関数は文字列にも適用できます。

[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 設定を有効にすることで最適化できます。`optimize_functions_to_subcolumns = 1` の場合、関数は配列列全体を読み込んで処理するかわりに、[size0](/sql-reference/data-types/array#array-size) サブカラムのみを読み取ります。クエリ `SELECT length(arr) FROM table` は `SELECT arr.size0 FROM TABLE` に変換されます。

別名: `OCTET_LENGTH`
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
## range(end), range([start, ] end [, step]) {#rangeend-rangestart--end--step}

`start` から `end - 1` まで `step` ごとに数値の配列を返します。サポートされる型は [UInt8, UInt16, UInt32, UInt64, Int8, Int16, Int32, Int64](../data-types/int-uint.md) です。

**構文**

```sql
range([start, ] end [, step])
```

**引数**

- `start` — 配列の最初の要素。任意。`step` が使用される場合必須。デフォルト値: 0。
- `end` — 配列が構築される前の数。必須。
- `step` — 配列の各要素間の増分ステップを決定します。任意。デフォルト値: 1。

**返される値**

- `start` から `end - 1` まで `step` ごとの数値の配列。

**実装の詳細**

- すべての引数 `start`、`end`、`step` はデータ型: `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、`Int64` のいずれかである必要があり、返される配列の要素型はすべての引数のスーパー型です。
- クエリの結果が、[function_range_max_elements_in_block](../../operations/settings/settings.md#function_range_max_elements_in_block) 設定で指定された要素数を超える配列になる場合、例外がスローされます。
- 引数のいずれかが Nullable(Nothing) 型の場合は Null を返します。引数のいずれかが Null 値 (Nullable(T) 型) の場合は例外がスローされます。

**例**

クエリ:

```sql
SELECT range(5), range(1, 5), range(1, 5, 2), range(-1, 5, 2);
```

結果:

```txt
┌─range(5)────┬─range(1, 5)─┬─range(1, 5, 2)─┬─range(-1, 5, 2)─┐
│ [0,1,2,3,4] │ [1,2,3,4]   │ [1,3]          │ [-1,1,3]        │
└─────────────┴─────────────┴────────────────┴─────────────────┘
```
## array(x1, ...), operator [x1, ...] {#arrayx1--operator-x1-}

関数引数から配列を作成します。
引数は定数であり、最小の共通型を持っている必要があります。少なくとも1つの引数を渡す必要があります。そうでない場合、どの型の配列を作成するかが不明です。つまり、この関数を使用して空の配列を作成することはできません（空の配列を作成するには、上記で説明した「emptyArray\*」関数を使用してください）。
渡された引数の最小共通型である 'Array(T)' 型の結果を返します。
## arrayWithConstant(length, elem) {#arraywithconstantlength-elem}

長さ `length` の配列を作成し、定数 `elem` で埋めます。
## arrayConcat {#arrayconcat}

引数として渡された配列を結合します。

```sql
arrayConcat(arrays)
```

**引数**

- `arrays` – 任意の数の [Array](/sql-reference/data-types/array) 型の引数。

**例**

```sql
SELECT arrayConcat([1, 2], [3, 4], [5, 6]) AS res
```

```text
┌─res───────────┐
│ [1,2,3,4,5,6] │
└───────────────┘
```
## arrayElement(arr, n), operator arr[n] {#arrayelementarr-n-operator-arrn}

配列 `arr` のインデックス `n` の要素を取得します。`n` は任意の整数型でなければなりません。
配列内のインデックスは1から始まります。

負のインデックスがサポートされています。この場合、末尾から数えた対応する要素を選択します。たとえば、`arr[-1]` は配列の最後のアイテムです。

インデックスが配列の境界を外れている場合、デフォルト値（数値の場合は0、文字列の場合は空文字列など）を返します。例外は、非定数配列と定数インデックス0の場合（この場合、エラー `Array indices are 1-based` が発生します）。

## has(arr, elem) {#hasarr-elem}

配列 'arr' に 'elem' 要素があるかどうかを確認します。
要素が配列に存在しない場合は0を返し、存在する場合は1を返します。

`NULL` は値として扱われます。

```sql
SELECT has([1, 2, NULL], NULL)
```

```text
┌─has([1, 2, NULL], NULL)─┐
│                       1 │
└─────────────────────────┘
```
## arrayElementOrNull(arr, n) {#arrayelementornullarr-n}

配列 `arr` のインデックス `n` の要素を取得します。`n` は任意の整数型でなければなりません。
配列内のインデックスは1から始まります。

負のインデックスがサポートされています。この場合、末尾から数えた対応する要素を選択します。たとえば、`arr[-1]` は配列の最後のアイテムです。

インデックスが配列の境界を外れている場合、デフォルト値の代わりに `NULL` を返します。
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

1つの配列が別の配列の部分集合であるかどうかを確認します。

```sql
hasAll(set, subset)
```

**引数**

- `set` – 要素の集合を持つ任意の型の配列。
- `subset` – `set` と共通のスーパー型を持ち、`set` の部分集合であるべき要素を含む任意の型の配列。

**返される値**

- `1`、`set` が `subset` のすべての要素を含む場合。
- それ以外の場合は `0`。

`set` と `subset` の要素が共通のスーパー型を持たない場合、例外 `NO_COMMON_TYPE` が発生します。

**特異な性質**

- 空の配列は任意の配列の部分集合です。
- `Null` は値として処理されます。
- 両方の配列の値の順序は重要ではありません。

**例**

`SELECT hasAll([], [])` は 1 を返します。

`SELECT hasAll([1, Null], [Null])` は 1 を返します。

`SELECT hasAll([1.0, 2, 3, 4], [1, 3])` は 1 を返します。

`SELECT hasAll(['a', 'b'], ['a'])` は 1 を返します。

`SELECT hasAll([1], ['a'])` は `NO_COMMON_TYPE` 例外を発生させます。

`SELECT hasAll([[1, 2], [3, 4]], [[1, 2], [3, 5]])` は 0 を返します。
## hasAny {#hasany}

2つの配列がいくつかの要素で交差しているかどうかを確認します。

```sql
hasAny(array1, array2)
```

**引数**

- `array1` – 要素の集合を持つ任意の型の配列。
- `array2` – `array1` と共通のスーパー型を持つ任意の型の配列。

**返される値**

- `1`、`array1` と `array2` のいずれかに共通の要素が1つ以上ある場合。
- それ以外の場合は `0`。

`array1` と `array2` の要素が共通のスーパー型を持たない場合、例外 `NO_COMMON_TYPE` が発生します。

**特異な性質**

- `Null` は値として処理されます。
- 両方の配列の値の順序は重要ではありません。

**例**

`SELECT hasAny([1], [])` は `0` を返します。

`SELECT hasAny([Null], [Null, 1])` は `1` を返します。

`SELECT hasAny([-128, 1., 512], [1])` は `1` を返します。

`SELECT hasAny([[1, 2], [3, 4]], ['a', 'c'])` は `NO_COMMON_TYPE` 例外を発生させます。

`SELECT hasAll([[1, 2], [3, 4]], [[1, 2], [1, 2]])` は `1` を返します。
## hasSubstr {#hassubstr}

配列2のすべての要素が配列1に同じ順序で出現するかどうかを確認します。したがって、関数は `array1 = prefix + array2 + suffix` の場合にのみ `1` を返します。

```sql
hasSubstr(array1, array2)
```

つまり、関数は `array1` にすべての `array2` の要素が含まれているかどうかを、`hasAll` 関数のように確認し、さらに `array1` と `array2` の両方で要素が同じ順序で観察されるかどうかをチェックします。

たとえば：

- `hasSubstr([1,2,3,4], [2,3])` は `1` を返します。しかし、`hasSubstr([1,2,3,4], [3,2])` は `0` を返します。
- `hasSubstr([1,2,3,4], [1,2,3])` は `1` を返します。しかし、`hasSubstr([1,2,3,4], [1,2,4])` は `0` を返します。

**引数**

- `array1` – 要素の集合を持つ任意の型の配列。
- `array2` – 要素の集合を持つ任意の型の配列。

**返される値**

- `1`、`array1` が `array2` を含む場合。
- それ以外の場合は `0`。

`array1` と `array2` の要素が共通のスーパー型を持たない場合、例外 `NO_COMMON_TYPE` が発生します。

**特異な性質**

- `array2` が空の場合、関数は `1` を返します。
- `Null` は値として処理されます。つまり、`hasSubstr([1, 2, NULL, 3, 4], [2,3])` は `0` を返します。しかし、`hasSubstr([1, 2, NULL, 3, 4], [2,NULL,3])` は `1` を返します。
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

値 'x' を持つ最初の要素のインデックスを返します（1から開始）。配列にその値が存在しない場合、関数は0を返します。

例：

```sql
SELECT indexOf([1, 3, NULL, NULL], NULL)
```

```text
┌─indexOf([1, 3, NULL, NULL], NULL)─┐
│                                 3 │
└───────────────────────────────────┘
```

`NULL` に設定された要素は通常の値として扱われます。
## indexOfAssumeSorted(arr, x) {#indexofassumesortedarr-x}

値 'x' を持つ最初の要素のインデックスを返します（1から開始）。配列にその値が存在しない場合、関数は0を返します。
配列は昇順にソートされていることを前提としています（すなわち、この関数は二分探索を使用します）。
配列がソートされていない場合、結果は未定義です。
内部配列が Nullable 型の場合、関数 'indexOf' が呼び出されます。

例：

```sql
SELECT indexOfAssumeSorted([1, 3, 3, 3, 4, 4, 5], 4)
```

```text
┌─indexOfAssumeSorted([1, 3, 3, 3, 4, 4, 5], 4)─┐
│                                             5 │
└───────────────────────────────────────────────┘
```
## arrayCount([func,] arr1, ...) {#arraycountfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が0以外の何かを返す要素の数を返します。`func` が指定されていない場合、配列内の非ゼロ要素の数を返します。

`arrayCount` は [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。最初の引数としてラムダ関数を渡すことができます。
## arrayDotProduct {#arraydotproduct}

2つの配列のドット積を返します。

**構文**

```sql
arrayDotProduct(vector1, vector2)
```

別名: `scalarProduct`, `dotProduct`

**パラメータ**

- `vector1`: 最初のベクター。[Array](/sql-reference/data-types/array) または [Tuple](../data-types/tuple.md) の数値。
- `vector2`: 2番目のベクター。[Array](/sql-reference/data-types/array) または [Tuple](../data-types/tuple.md) の数値。

:::note
2つのベクターのサイズは等しくなければなりません。配列とタプルは混合要素型を含むこともできます。
:::

**返される値**

- 2つのベクターのドット積。[Numeric](/native-protocol/columns#numeric-types)。

:::note
戻り値の型は引数の型によって決定されます。配列またはタプルが混合要素型を含む場合、結果の型はスーパー型となります。
:::

**例**

クエリ:

```sql
SELECT arrayDotProduct([1, 2, 3], [4, 5, 6]) AS res, toTypeName(res);
```

結果:

```response
32    UInt16
```

クエリ:

```sql
SELECT dotProduct((1::UInt16, 2::UInt8, 3::Float32),(4::Int16, 5::Float32, 6::UInt8)) AS res, toTypeName(res);
```

結果:

```response
32    Float64
```
## countEqual(arr, x) {#countequalarr-x}

配列内の値が x に等しい要素の数を返します。`arrayCount (elem -> elem = x, arr)` と同等です。

`NULL` 要素は別々の値として扱われます。

例：

```sql
SELECT countEqual([1, 2, NULL, NULL], NULL)
```

```text
┌─countEqual([1, 2, NULL, NULL], NULL)─┐
│                                    2 │
└──────────────────────────────────────┘
```
## arrayEnumerate(arr) {#arrayenumeratearr}

配列 \[1, 2, 3, ..., length (arr) \] を返します。

この関数は通常 `ARRAY JOIN` と共に使用されます。`ARRAY JOIN` を適用した後、各配列に対して何かを一度だけカウントすることを可能にします。例：

```sql
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

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

この例では、Reaches はコンバージョンの数（ARRAY JOIN 後に受信された文字列の数）、Hits はページビューの数（ARRAY JOIN 前の文字列の数）です。この特定のケースでは、次のように簡単に同じ結果を得ることができます：

```sql
SELECT
    sum(length(GoalsReached)) AS Reaches,
    count() AS Hits
FROM test.hits
WHERE (CounterID = 160656) AND notEmpty(GoalsReached)
```

```text
┌─Reaches─┬──Hits─┐
│   95606 │ 31406 │
└─────────┴───────┘
```

この関数は高階関数の中でも使用できます。例えば、条件に一致する要素の配列のインデックスを取得するために使用できます。
## arrayEnumerateUniq {#arrayenumerateuniq}

ソース配列と同じサイズの配列を返し、各要素が同じ値を持つ要素の中でその位置を示します。
例えば: arrayEnumerateUniq(\[10, 20, 10, 30\]) = \[1, 1, 2, 1\]。

この関数は、ARRAY JOIN と配列要素の集計が使用される場合に便利です。
例：

```sql
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

```text
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

この例では、各目標 ID に対してコンバージョンの数（Goals 構造体内の各要素は達成した目標であり、これをコンバージョンと呼びます）とセッションの数を計算しています。ARRAY JOIN なしでは、セッションの数を sum(Sign) としてカウントすることになります。しかし、この場合、行はネストされた Goals 構造体によって乗算されるため、これをカウントするためには、arrayEnumerateUniq(Goals.ID) 関数の値に条件を適用します。

arrayEnumerateUniq 関数は、同じサイズの複数の配列を引数として受け取ることができます。この場合、同じ位置にあるすべての配列の要素のタプルに対して一意性が考慮されます。

```sql
SELECT arrayEnumerateUniq([1, 1, 1, 2, 2, 2], [1, 1, 2, 1, 1, 2]) AS res
```

```text
┌─res───────────┐
│ [1,2,1,1,2,1] │
└───────────────┘
```

これは、ネストされたデータ構造を持つ ARRAY JOIN と他の要素を超えた集計を行う場合に必要です。
## arrayEnumerateUniqRanked {#arrayenumerateuniqranked}

ソース配列と同じサイズの配列を返し、各要素が同じ値を持つ要素の中でその位置を示します。同じ値を持つ要素を深さを指定して列挙できるようにします。

**構文**

```sql
arrayEnumerateUniqRanked(clear_depth, arr, max_array_depth)
```

**パラメータ**

- `clear_depth`: 指定されたレベルで個々の要素を別々に列挙します。正の [Integer](../data-types/int-uint.md) であり、`max_arr_depth` 以下である必要があります。
- `arr`: 列挙する N 次元配列。[Array](/sql-reference/data-types/array)。
- `max_array_depth`: 最大有効深度。正の [Integer](../data-types/int-uint.md) であり、`arr` の深さ以下である必要があります。

**例**

`clear_depth=1` および `max_array_depth=1` の場合、`arrayEnumerateUniqRanked` の結果は、同じ配列に対して `arrayEnumerateUniq` が返す結果と同じになります。

クエリ:

```sql
SELECT arrayEnumerateUniqRanked(1, [1,2,1], 1);
```

結果:

```text
[1,1,2]
```

この例では、`arrayEnumerateUniqRanked` を使用して、多次元配列の各要素が同じ値の要素の中でどの位置にあるかを示す配列を取得します。与えられた配列の最初の行 `[1,2,3]` の場合、対応する結果は `[1,1,1]` であり、これは `1`,`2` と `3` の初めての出現を示しています。与えられた配列の2行目 `[2,2,1]` の場合、対応する結果は `[2,3,3]` であり、これは `2` が2回目と3回目に出現し、`1` が2回目に出現することを示しています。同様に、与えられた配列の3行目 `[3]` の場合、対応する結果は `[2]` であり、`3` が2回目に出現していることを示します。

クエリ:

```sql
SELECT arrayEnumerateUniqRanked(1, [[1,2,3],[2,2,1],[3]], 2);
```

結果:

```text
[[1,1,1],[2,3,2],[2]]
```

`clear_depth=2` に変更すると、結果は各行ごとに個々の要素が列挙されます。

クエリ:

```sql
SELECT arrayEnumerateUniqRanked(2, [[1,2,3],[2,2,1],[3]], 2);
```

結果:

```text
[[1,1,1],[1,2,1],[1]]
```
## arrayPopBack {#arraypopback}

配列から最後のアイテムを削除します。

```sql
arrayPopBack(array)
```

**引数**

- `array` – 配列。

**例**

```sql
SELECT arrayPopBack([1, 2, 3]) AS res;
```

```text
┌─res───┐
│ [1,2] │
└───────┘
```
## arrayPopFront {#arraypopfront}

配列から最初のアイテムを削除します。

```sql
arrayPopFront(array)
```

**引数**

- `array` – 配列。

**例**

```sql
SELECT arrayPopFront([1, 2, 3]) AS res;
```

```text
┌─res───┐
│ [2,3] │
└───────┘
```
## arrayPushBack {#arraypushback}

配列の最後に1つのアイテムを追加します。

```sql
arrayPushBack(array, single_value)
```

**引数**

- `array` – 配列。
- `single_value` – 単一の値。数値の配列には数値のみを追加でき、文字列の配列には文字列のみを追加できます。数値を追加する場合、ClickHouse は自動的に配列のデータ型に対して `single_value` 型を設定します。ClickHouse のデータ型の詳細については、"[データ型](/sql-reference/data-types)" を参照してください。`NULL` も可能です。この関数は配列に `NULL` 要素を追加し、配列要素の型は `Nullable` に変換されます。

**例**

```sql
SELECT arrayPushBack(['a'], 'b') AS res;
```

```text
┌─res───────┐
│ ['a','b'] │
└───────────┘
```
## arrayPushFront {#arraypushfront}

配列の先頭に1つの要素を追加します。

```sql
arrayPushFront(array, single_value)
```

**引数**

- `array` – 配列。
- `single_value` – 単一の値。数値の配列には数値のみを追加でき、文字列の配列には文字列のみを追加できます。数値を追加する場合、ClickHouse は自動的に配列のデータ型に対して `single_value` 型を設定します。ClickHouse のデータ型の詳細については、"[データ型](/sql-reference/data-types)" を参照してください。`NULL` も可能です。この関数は配列に `NULL` 要素を追加し、配列要素の型は `Nullable` に変換されます。

**例**

```sql
SELECT arrayPushFront(['b'], 'a') AS res;
```

```text
┌─res───────┐
│ ['a','b'] │
└───────────┘
```
## arrayResize {#arrayresize}

配列の長さを変更します。

```sql
arrayResize(array, size[, extender])
```

**引数:**

- `array` — 配列。
- `size` — 必須の配列の長さ。
  - `size` が配列の元のサイズより小さい場合、配列は右から切り詰められます。
- `size` が配列の初期サイズより大きい場合、配列は右側に `extender` 値または配列アイテムのデータ型のデフォルト値で拡張されます。
- `extender` — 配列を拡張するための値。`NULL` も可能です。

**返される値:**

長さ `size` の配列。

**呼び出しの例**

```sql
SELECT arrayResize([1], 3);
```

```text
┌─arrayResize([1], 3)─┐
│ [1,0,0]             │
└─────────────────────┘
```

```sql
SELECT arrayResize([1], 3, NULL);
```

```text
┌─arrayResize([1], 3, NULL)─┐
│ [1,NULL,NULL]             │
└───────────────────────────┘
```
## arraySlice {#arrayslice}

配列のスライスを返します。

```sql
arraySlice(array, offset[, length])
```

**引数**

- `array` – データの配列。
- `offset` – 配列の端からのインデント。正の値は左へのオフセットを示し、負の値は右へのインデントを示します。配列アイテムの番号付けは1から始まります。
- `length` – 必要なスライスの長さ。負の値を指定すると、関数はオープンスライス `[offset, array_length - length]` を返します。値を省略すると、関数はスライス `[offset, the_end_of_array]` を返します。

**例**

```sql
SELECT arraySlice([1, 2, NULL, 4, 5], 2, 3) AS res;
```

```text
┌─res────────┐
│ [2,NULL,4] │
└────────────┘
```

配列要素に設定された `NULL` は通常の値として処理されます。
## arrayShingles {#arrayshingles}

指定された長さの入力配列の「シングル」を生成します。

**構文**

```sql
arrayShingles(array, length)
```

**引数**

- `array` — 入力配列 [Array](/sql-reference/data-types/array)。
- `length` — 各シングルの長さ。

**返される値**

- 生成されたシングルの配列。[Array](/sql-reference/data-types/array)。

**例**

クエリ:

```sql
SELECT arrayShingles([1,2,3,4], 3) as res;
```

結果:

```text
┌─res───────────────┐
│ [[1,2,3],[2,3,4]] │
└───────────────────┘
```

## arraySort(\[func,\] arr, ...) {#sort}

`arr` 配列の要素を昇順にソートします。`func` 関数が指定されている場合、ソート順は配列の要素に適用された `func` 関数の結果によって決まります。`func` が複数の引数を受け取る場合、`arraySort` 関数は、`func` の引数に対応する複数の配列を受け取ります。詳細な例は `arraySort` の説明の最後に示されています。

整数値のソートの例:

```sql
SELECT arraySort([1, 3, 3, 0]);
```

```text
┌─arraySort([1, 3, 3, 0])─┐
│ [0,1,3,3]               │
└─────────────────────────┘
```

文字列値のソートの例:

```sql
SELECT arraySort(['hello', 'world', '!']);
```

```text
┌─arraySort(['hello', 'world', '!'])─┐
│ ['!','hello','world']              │
└────────────────────────────────────┘
```

`NULL`、`NaN`、および `Inf` 値のソート順に関する考慮事項:

```sql
SELECT arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf]);
```

```text
┌─arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf])─┐
│ [-inf,-4,1,2,3,inf,nan,nan,NULL,NULL]                     │
└───────────────────────────────────────────────────────────┘
```

- `-Inf` 値が配列の最初に来ます。
- `NULL` 値が配列の最後に来ます。
- `NaN` 値が `NULL` の直前に来ます。
- `Inf` 値が `NaN` の直前に来ます。

`arraySort` は [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。最初の引数としてラムダ関数を渡すことができます。この場合、ソート順は配列の要素に適用されたラムダ関数の結果によって決まります。

次の例を考えてみましょう:

```sql
SELECT arraySort((x) -> -x, [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [3,2,1] │
└─────────┘
```

ソース配列の各要素に対して、ラムダ関数がソートキーを返します。すなわち、\[1 –\> -1, 2 –\> -2, 3 –\> -3\]。`arraySort` 関数がキーを昇順にソートするため、結果は \[3, 2, 1\] になります。したがって、`(x) –> -x` ラムダ関数はソートにおける [降順](#arrayreversesort) を設定します。

ラムダ関数は複数の引数を受け取ることができます。この場合、`arraySort` 関数には同じ長さの複数の配列を渡す必要があります。それにより、ラムダ関数の引数に対応する要素が配置されます。結果の配列は、最初の入力配列の要素で構成され、次の入力配列の要素がソートキーを指定します。例えば:

```sql
SELECT arraySort((x, y) -> y, ['hello', 'world'], [2, 1]) as res;
```

```text
┌─res────────────────┐
│ ['world', 'hello'] │
└────────────────────┘
```

ここで、第二の配列（\[2, 1\]）に渡された要素が、ソース配列（\['hello', 'world'\]）からの対応する要素のソートキーを定義します。すなわち、\['hello' –\> 2, 'world' –\> 1\]。ラムダ関数は `x` を使用しないため、ソース配列の実際の値は結果の順序に影響を与えません。したがって、'hello' は結果の第2の要素となり、'world' は第1の要素になります。

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
ソート効率を改善するために、[シュワルツィアン変換](https://en.wikipedia.org/wiki/Schwartzian_transform) が使用されます。
:::
## arrayPartialSort(\[func,\] limit, arr, ...) {#arraypartialsortfunc-limit-arr-}

`arraySort` と同様ですが、追加の `limit` 引数により部分ソートが可能です。元の配列と同じサイズの配列を返し、範囲 `[1..limit]` の要素が昇順にソートされます。残りの要素 `(limit..N]` には未指定の順序の要素が含まれます。
## arrayReverseSort {#arrayreversesort}

`arr` 配列の要素を降順にソートします。`func` 関数が指定されている場合、`arr` は配列の要素に適用された `func` 関数の結果に従ってソートされ、ソートされた配列が逆順にされます。`func` が複数の引数を受け取る場合、`arrayReverseSort` 関数は、`func` の引数に対応する複数の配列を受け取ります。詳細な例は `arrayReverseSort` の説明の最後に示されています。

**構文**

```sql
arrayReverseSort([func,] arr, ...)
```
整数値のソートの例:

```sql
SELECT arrayReverseSort([1, 3, 3, 0]);
```

```text
┌─arrayReverseSort([1, 3, 3, 0])─┐
│ [3,3,1,0]                      │
└────────────────────────────────┘
```

文字列値のソートの例:

```sql
SELECT arrayReverseSort(['hello', 'world', '!']);
```

```text
┌─arrayReverseSort(['hello', 'world', '!'])─┐
│ ['world','hello','!']                     │
└───────────────────────────────────────────┘
```

`NULL`、`NaN`、および `Inf` 値のソート順に関する考慮事項:

```sql
SELECT arrayReverseSort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf]) as res;
```

```text
┌─res───────────────────────────────────┐
│ [inf,3,2,1,-4,-inf,nan,nan,NULL,NULL] │
└───────────────────────────────────────┘
```

- `Inf` 値が配列の最初に来ます。
- `NULL` 値が配列の最後に来ます。
- `NaN` 値が `NULL` の直前に来ます。
- `-Inf` 値が `NaN` の直前に来ます。

`arrayReverseSort` は [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。最初の引数としてラムダ関数を渡すことができます。以下の例が示されています。

```sql
SELECT arrayReverseSort((x) -> -x, [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [1,2,3] │
└─────────┘
```

配列は次のようにソートされます:

1. 最初にソース配列（\[1, 2, 3\]）がラムダ関数に基づいてソートされます。その結果は配列 \[3, 2, 1\] です。
2. 前のステップで得られた配列が逆順にされます。したがって、最終的な結果は \[1, 2, 3\] です。

ラムダ関数は複数の引数を受け取ることができます。この場合、`arrayReverseSort` 関数には同じ長さの複数の配列を渡す必要があります。それにより、ラムダ関数の引数に対応する要素が配置されます。結果の配列は、最初の入力配列の要素で構成され、次の入力配列の要素がソートキーを指定します。例えば:

```sql
SELECT arrayReverseSort((x, y) -> y, ['hello', 'world'], [2, 1]) as res;
```

```text
┌─res───────────────┐
│ ['hello','world'] │
└───────────────────┘
```

この例では、配列は次のようにソートされます:

1. 最初にソース配列（\['hello', 'world'\]）がラムダ関数に基づいてソートされます。第二の配列（\[2, 1\]）に渡された要素が、ソース配列の対応する要素のソートキーを定義します。結果は配列 \['world', 'hello'\] です。
2. 前のステップでソートされた配列が逆順にされます。したがって、最終的な結果は \['hello', 'world'\] です。

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
## arrayPartialReverseSort(\[func,\] limit, arr, ...) {#arraypartialreversesortfunc-limit-arr-}

`arrayReverseSort` と同様ですが、追加の `limit` 引数により部分ソートが可能です。元の配列と同じサイズの配列を返し、範囲 `[1..limit]` の要素が降順にソートされます。残りの要素 `(limit..N]` には未指定の順序の要素が含まれます。
## arrayShuffle {#arrayshuffle}

元の配列と同じサイズの配列を返し、その要素をシャッフルした順序で含みます。
シャッフルされた要素は、すべての組み合わせの出現確率が等しいように再配置されます。

**構文**

```sql
arrayShuffle(arr[, seed])
```

**パラメータ**

- `arr`: 部分シャッフルする配列。 [Array](/sql-reference/data-types/array)。
- `seed` (オプション): ランダム番号生成に使用するシード。指定しない場合はランダムなものが使用されます。 [UInt または Int](../data-types/int-uint.md)。

**戻り値**

- シャッフルされた要素の配列。

**実装の詳細**

:::note 
この関数は定数をマテリアライズしません。
:::

**例**

この例では、`arrayShuffle` は `seed` を指定せずに使用され、したがってランダムに生成されます。

クエリ:

```sql
SELECT arrayShuffle([1, 2, 3, 4]);
```

注意: [ClickHouse Fiddle](https://fiddle.clickhouse.com/) を使用している場合、関数のランダムな性質から正確な応答は異なる場合があります。

結果: 

```response
[1,4,2,3]
```

この例では、`arrayShuffle` に `seed` が提供され、安定した結果を生成します。

クエリ:

```sql
SELECT arrayShuffle([1, 2, 3, 4], 41);
```

結果: 

```response
[3,2,1,4]
```
## arrayPartialShuffle {#arraypartialshuffle}

カーディナリティ `N` の入力配列が与えられた場合、サイズ N の配列を返し、範囲 `[1...limit]` の要素がシャッフルされ、範囲 `(limit...n]` の残りの要素は未シャッフルのままになります。

**構文**

```sql
arrayPartialShuffle(arr[, limit[, seed]])
```

**パラメータ**

- `arr`: 部分シャッフルする配列のサイズ `N`。 [Array](/sql-reference/data-types/array)。
- `limit` (オプション): 要素の入れ替えを制限する数、範囲 `[1..N]` の内。 [UInt または Int](../data-types/int-uint.md)。
- `seed` (オプション): ランダム番号生成に使用するシード値。指定しない場合はランダムなものが使用されます。 [UInt または Int](../data-types/int-uint.md)。

**戻り値**

- 要素が部分的にシャッフルされた配列。

**実装の詳細**

:::note 
この関数は定数をマテリアライズしません。

`limit` の値は `[1..N]` の範囲内である必要があります。その範囲外の値は、完全な [arrayShuffle](#arrayshuffle) を実行することと同等です。
:::

**例**

注意: [ClickHouse Fiddle](https://fiddle.clickhouse.com/) を使用している場合、関数のランダムな性質から正確な応答は異なる場合があります。 

クエリ:

```sql
SELECT arrayPartialShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1)
```

結果:

要素の順序は保持されます（`[2,3,4,5], [7,8,9,10]`）が、2つのシャッフルされた要素 `[1, 6]` は除外されます。シードは提供されていないため、関数はランダムに選択します。

```response
[6,2,3,4,5,1,7,8,9,10]
```

この例では、`limit` が `2` に増加し、シード値が提供されます。順序は 

クエリ:

```sql
SELECT arrayPartialShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
```

要素の順序は保持されます（`[4, 5, 6, 7, 8], [10]`）が、4つのシャッフルされた要素 `[1, 2, 3, 9]` は除外されます。

結果: 
```response
[3,9,1,4,5,6,7,8,2,10]
```
## arrayUniq(arr, ...) {#arrayuniqarr-}

引数が1つ渡されると、配列内の異なる要素の数をカウントします。
複数の引数が渡されると、複数の配列の対応する位置にある要素の異なるタプルの数をカウントします。

配列の一意のアイテムのリストを取得したい場合は、arrayReduce('groupUniqArray', arr) を使用できます。
## arrayJoin(arr) {#arrayjoinarr}

特別な関数です。["ArrayJoin function"](/sql-reference/functions/array-join) のセクションを参照してください。
## arrayDifference {#arraydifference}

隣接する配列要素間の差の配列を計算します。結果の配列の最初の要素は 0 になり、2 番目は `a[1] - a[0]`、3 番目は `a[2] - a[1]`、などとなります。結果の配列の要素の型は、引き算の型推論規則によって決まります（例： `UInt8` - `UInt8` = `Int16`）。

**構文**

```sql
arrayDifference(array)
```

**引数**

- `array` – [Array](/sql-reference/data-types/array)。

**戻り値**

隣接する配列要素間の差を含む配列を返します。 [UInt\*](/sql-reference/data-types/int-uint#integer-ranges)、 [Int\*](/sql-reference/data-types/int-uint#integer-ranges)、 [Float\*](/sql-reference/data-types/float)。

**例**

クエリ:

```sql
SELECT arrayDifference([1, 2, 3, 4]);
```

結果:

```text
┌─arrayDifference([1, 2, 3, 4])─┐
│ [0,1,1,1]                     │
└───────────────────────────────┘
```

結果型 Int64 によるオーバーフローの例:

クエリ:

```sql
SELECT arrayDifference([0, 10000000000000000000]);
```

結果:

```text
┌─arrayDifference([0, 10000000000000000000])─┐
│ [0,-8446744073709551616]                   │
└────────────────────────────────────────────┘
```
## arrayDistinct {#arraydistinct}

配列を受け取り、一意の要素のみを含む配列を返します。

**構文**

```sql
arrayDistinct(array)
```

**引数**

- `array` – [Array](/sql-reference/data-types/array)。

**戻り値**

一意の要素を含む配列を返します。

**例**

クエリ:

```sql
SELECT arrayDistinct([1, 2, 2, 3, 1]);
```

結果:

```text
┌─arrayDistinct([1, 2, 2, 3, 1])─┐
│ [1,2,3]                        │
└────────────────────────────────┘
```
## arrayEnumerateDense {#arrayenumeratedense}

ソース配列と同じサイズの配列を返し、各要素がソース配列に最初に出現する場所を示します。

**構文**

```sql
arrayEnumerateDense(arr)
```

**例**

クエリ:

```sql
SELECT arrayEnumerateDense([10, 20, 10, 30])
```

結果:

```text
┌─arrayEnumerateDense([10, 20, 10, 30])─┐
│ [1,2,1,3]                             │
└───────────────────────────────────────┘
```
## arrayEnumerateDenseRanked {#arrayenumeratedenseranked}

ソース配列と同じサイズの配列を返し、各要素がソース配列に最初に出現する場所を示します。多次元配列の列挙を可能にし、配列の中でどれだけ深く探すかを指定できます。

**構文**

```sql
arrayEnumerateDenseRanked(clear_depth, arr, max_array_depth)
```

**パラメータ**

- `clear_depth`: 指定されたレベルで要素を個別に列挙します。正の [Integer](../data-types/int-uint.md) で `max_arr_depth` 以下。
- `arr`: 列挙する N 次元配列。 [Array](/sql-reference/data-types/array)。
- `max_array_depth`: 最大有効深度。正の [Integer](../data-types/int-uint.md) で `arr` の深度以下。

**例**

`clear_depth=1`、`max_array_depth=1` の場合、結果は [arrayEnumerateDense](#arrayenumeratedense) が返すものと同じになります。

クエリ:

```sql
SELECT arrayEnumerateDenseRanked(1,[10, 20, 10, 30],1);
```

結果:

```text
[1,2,1,3]
```

この例では、`arrayEnumerateDenseRanked` を使用して、多次元配列の各要素について、その値が最初に出現した位置を示す配列を取得します。渡された配列の最初の行 `[10,10,30,20]` に対して、結果の対応する最初の行は `[1,1,2,3]` になります。これは、`10` が位置 1 および 2 で最初の数字として出現し、`30` が位置 3 で第2の数字として出現し、`20` が位置 4 で第3の数字として出現することを示しています。第二の行 `[40, 50, 10, 30]` に対して、結果の対応する第二の行は `[4,5,1,2]` になり、`40` と `50` が位置 1 および 2 でそれぞれ第4および第5の数字として出現し、別の `10` が位置 3 で最初の数字として、`30` が最後の位置で第2の数字として出現することを示しています。

クエリ:

```sql
SELECT arrayEnumerateDenseRanked(1,[[10,10,30,20],[40,50,10,30]],2);
```

結果:

```text
[[1,1,2,3],[4,5,1,2]]
```

`clear_depth=2` に変更すると、列挙が各行について新たに行われます。

クエリ:

```sql
SELECT arrayEnumerateDenseRanked(2,[[10,10,30,20],[40,50,10,30]],2);
```
結果:

```text
[[1,1,2,3],[1,2,3,4]]
```
## arrayUnion {#arrayunion}

複数の配列を受け取り、元の配列のいずれかに存在するすべての要素を含む配列を返します。
結果は一意の値のみを含みます。

**構文**

```sql
arrayUnion(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

この関数は異なる型の配列を任意の数受け取ることができます。

**戻り値**

- 元の配列からの一意の要素を持つ [Array](/sql-reference/data-types/array)。

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
結果は一意の値のみを含みます。

**構文**

```sql
arrayIntersect(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

この関数は異なる型の配列を任意の数受け取ることができます。

**戻り値**

- すべての元の配列に存在する一意の要素を持つ [Array](/sql-reference/data-types/array)。

**例**

クエリ:

```sql
SELECT
    arrayIntersect([1, 2], [1, 3], [2, 3]) AS empty_intersection,
    arrayIntersect([1, 2], [1, 3], [1, 4]) AS non_empty_intersection
```

結果:

```text
┌─non_empty_intersection─┬─empty_intersection─┐
│ []                     │ [1]                │
└────────────────────────┴────────────────────┘
```
## arraySymmetricDifference {#arraysymmetricdifference}

複数の配列を受け取り、すべての元の配列に存在しない要素を持つ配列を返します。
結果は一意の値のみを含みます。

:::note
2つ以上の集合の対称差は、[数学的に定義された](https://en.wikipedia.org/wiki/Symmetric_difference#n-ary_symmetric_difference)集合であり、奇数個の入力集合に存在するすべての入力要素の集合です。
対照的に `arraySymmetricDifference` 関数は、単にすべての入力集合に存在しない入力要素の集合を返します。
:::

**構文**

```sql
arraySymmetricDifference(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

この関数は異なる型の配列を任意の数受け取ることができます。

**戻り値**

- すべての元の配列に存在しない一意の要素を持つ [Array](/sql-reference/data-types/array)。

**例**

クエリ:

```sql
SELECT
    arraySymmetricDifference([1, 2], [1, 2], [1, 2]) AS empty_symmetric_difference,
    arraySymmetricDifference([1, 2], [1, 2], [1, 3]) AS non_empty_symmetric_difference,
```

結果:

```text
┌─empty_symmetric_difference─┬─non_empty_symmetric_difference─┐
│ []                         │ [3]                            │
└────────────────────────────┴────────────────────────────────┘
```
## arrayJaccardIndex {#arrayjaccardindex}

2つの配列の [ジャッカード指数](https://en.wikipedia.org/wiki/Jaccard_index) を返します。

**例**

クエリ:
```sql
SELECT arrayJaccardIndex([1, 2], [2, 3]) AS res
```

結果:
```text
┌─res────────────────┐
│ 0.3333333333333333 │
└────────────────────┘
```
## arrayReduce {#arrayreduce}

配列要素に集約関数を適用し、その結果を返します。集約関数の名前は、シングルクォートの中に文字列として渡されます（例： `'max'`、`'sum'`）。パラメトリック集約関数を使用する場合、関数名の後に括弧内にパラメータを示します（例： `'uniqUpTo(6)'`）。

**構文**

```sql
arrayReduce(agg_func, arr1, arr2, ..., arrN)
```

**引数**

- `agg_func` — 定数の集約関数名であるべき [string](../data-types/string.md)。
- `arr` — 集約関数のパラメータとして受け取る任意の数の [array](/sql-reference/data-types/array) 型のカラム。

**戻り値**

**例**

クエリ:

```sql
SELECT arrayReduce('max', [1, 2, 3]);
```

結果:

```text
┌─arrayReduce('max', [1, 2, 3])─┐
│                             3 │
└───────────────────────────────┘
```

集約関数が複数の引数を受け取る場合、この関数は同じサイズの複数の配列に適用されるべきです。

クエリ:

```sql
SELECT arrayReduce('maxIf', [3, 5], [1, 0]);
```

結果:

```text
┌─arrayReduce('maxIf', [3, 5], [1, 0])─┐
│                                    3 │
└──────────────────────────────────────┘
```

パラメトリック集約関数の例:

クエリ:

```sql
SELECT arrayReduce('uniqUpTo(3)', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
```

結果:

```text
┌─arrayReduce('uniqUpTo(3)', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])─┐
│                                                           4 │
└─────────────────────────────────────────────────────────────┘
```

**参照**

- [arrayFold](#arrayfold)
## arrayReduceInRanges {#arrayreduceinranges}

指定された範囲の配列要素に集約関数を適用し、各範囲に対応する結果を含む配列を返します。この関数は、複数の `arrayReduce(agg_func, arraySlice(arr1, index, length), ...)` から得られる結果と同じものを返します。

**構文**

```sql
arrayReduceInRanges(agg_func, ranges, arr1, arr2, ..., arrN)
```

**引数**

- `agg_func` — 定数の集約関数名であるべき [string](../data-types/string.md)。
- `ranges` — 各範囲のインデックスおよび長さを含む [tuples](../data-types/tuple.md) の [array](/sql-reference/data-types/array)。
- `arr` — 集約関数のパラメータとして受け取る任意の数の [Array](/sql-reference/data-types/array) 型のカラム。

**戻り値**

- 指定された範囲に対する集約関数の結果を含む配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

```sql
SELECT arrayReduceInRanges(
    'sum',
    [(1, 5), (2, 3), (3, 4), (4, 4)],
    [1000000, 200000, 30000, 4000, 500, 60, 7]
) AS res
```

結果:

```text
┌─res─────────────────────────┐
│ [1234500,234000,34560,4567] │
└─────────────────────────────┘
```
## arrayFold {#arrayfold}

1つ以上の同じサイズの配列にラムダ関数を適用し、結果を累積します。

**構文**

```sql
arrayFold(lambda_function, arr1, arr2, ..., accumulator)
```

**例**

クエリ:

```sql
SELECT arrayFold( acc,x -> acc + x*2,  [1, 2, 3, 4], toInt64(3)) AS res;
```

結果:

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

元の配列と同じサイズの配列を返し、要素を逆順にしたものを含みます。

**構文**

```sql
arrayReverse(arr)
```

例:

```sql
SELECT arrayReverse([1, 2, 3])
```

```text
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

フラットにされた配列には、すべての元の配列からの要素が含まれます。

**構文**

```sql
flatten(array_of_arrays)
```

別名: `flatten`。

**パラメータ**

- `array_of_arrays` — [Array](/sql-reference/data-types/array) の配列。例えば、`[[1,2,3], [4,5]]`。

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

配列から連続した重複要素を取り除きます。結果値の順序はソース配列の順序によって決まります。

**構文**

```sql
arrayCompact(arr)
```

**引数**

`arr` — 検査する [array](/sql-reference/data-types/array)。

**戻り値**

重複のない配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

```sql
SELECT arrayCompact([1, 1, nan, nan, 2, 3, 3, 3]);
```

結果:

```text
┌─arrayCompact([1, 1, nan, nan, 2, 3, 3, 3])─┐
│ [1,nan,nan,2,3]                            │
└────────────────────────────────────────────┘
```
## arrayZip {#arrayzip}

複数の配列を単一の配列に結合します。結果の配列には、ソース配列の対応する要素がタプルにグループ化されて含まれます。

**構文**

```sql
arrayZip(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

この関数は異なる型の配列を任意の数受け取ることができます。すべての入力配列は同じサイズでなければなりません。

**戻り値**

ソース配列からの要素がタプルにグループ化された配列。タプルのデータ型は入力配列の型と同じで、配列が渡される順序と同じになります。 [Array](/sql-reference/data-types/array)。

**例**

クエリ:

```sql
SELECT arrayZip(['a', 'b', 'c'], [5, 2, 1]);
```

結果:

```text
┌─arrayZip(['a', 'b', 'c'], [5, 2, 1])─┐
│ [('a',5),('b',2),('c',1)]            │
└──────────────────────────────────────┘
```
## arrayZipUnaligned {#arrayzipunaligned}

複数の配列を単一の配列に結合し、整列されていない配列を許可します。結果の配列には、ソース配列の対応する要素がタプルにグループ化されて含まれます。

**構文**

```sql
arrayZipUnaligned(arr1, arr2, ..., arrN)
```

**引数**

- `arrN` — [Array](/sql-reference/data-types/array)。

この関数は異なる型の配列を任意の数受け取ることができます。

**戻り値**

ソース配列からの要素がタプルにグループ化された配列。タプルのデータ型は入力配列の型と同じで、配列が渡される順序と同じになります。 [Array](/sql-reference/data-types/array)。配列のサイズが異なる場合、短い配列には `null` 値がパディングされます。

**例**

クエリ:

```sql
SELECT arrayZipUnaligned(['a'], [1, 2, 3]);
```

結果:

```text
┌─arrayZipUnaligned(['a'], [1, 2, 3])─┐
│ [('a',1),(NULL,2),(NULL,3)]         │
└─────────────────────────────────────┘
```
## arrayROCAUC {#arrayrocauc}

受信者動作特性 (ROC) 曲線の下の面積を計算します。
ROC 曲線は、すべてのしきい値にわたって y 軸に真陽性率 (TPR)、x 軸に偽陽性率 (FPR) をプロットすることで作成されます。
結果の値は 0 から 1 の範囲で、値が高いほどモデルのパフォーマンスが良好であることを示します。
ROC AUC (単に AUC とも呼ばれます) は、機械学習における概念です。
詳細については、[こちら](https://developers.google.com/machine-learning/glossary#pr-auc-area-under-the-pr-curve)、[こちら](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc#expandable-1)、および[こちら](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve)を参照してください。

**構文**

```sql
arrayROCAUC(arr_scores, arr_labels[, scale[, arr_partial_offsets]])
```

別名: `arrayAUC`

**引数**

- `arr_scores` — モデルが与えたスコア。 [Array](/sql-reference/data-types/array) の [Integers](../data-types/int-uint.md) または [Floats](../data-types/float.md)。
- `arr_labels` — サンプルのラベル。通常、1 は正のサンプル、0 は負のサンプルを示します。 [Array](/sql-reference/data-types/array) の [Integers](../data-types/int-uint.md) または [Enums](../data-types/enum.md)。
- `scale` — 正規化された面積を返すかどうかを決定します。false の場合、TP (真陽性) x FP (偽陽性) 曲線の下の面積が返されます。デフォルト値: true。 [Bool](../data-types/boolean.md)。オプション。
- `arr_partial_offsets` — ROC 曲線の下に部分面積を計算するための4つの非負整数の配列 (ROC空間の垂直バンドに相当)。これは ROC AUC の分散計算に便利です。配列は次の要素を含む必要があります [`higher_partitions_tp`, `higher_partitions_fp`, `total_positives`, `total_negatives`]。 [Array](/sql-reference/data-types/array) の非負の [Integers](../data-types/int-uint.md) 。オプション。
    - `higher_partitions_tp`: 高得点のパーティションにおける正のラベルの数。
    - `higher_partitions_fp`: 高得点のパーティションにおける負のラベルの数。
    - `total_positives`: データセット全体における正のサンプルの総数。
    - `total_negatives`: データセット全体における負のサンプルの総数。

::::note
`arr_partial_offsets` が使用されるとき、`arr_scores` および `arr_labels` は全データセットのパーティションのみになる必要があり、スコアの間隔を含む必要があります。
データセットは、連続したパーティションに分割する必要があり、それぞれのパーティションには、特定の範囲内のスコアに招聘されたデータのサブセットが含まれます。
たとえば:
- 一つのパーティションは、範囲 [0, 0.5) のすべてのスコアを含むことができます。
- 別のパーティションは、範囲 [0.5, 1.0] のスコアを含むことができます。
::::

**戻り値**

受信者動作特性 (ROC) 曲線の下の面積を返します。 [Float64](../data-types/float.md)。

**例**

クエリ:

```sql
select arrayROCAUC([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]);
```

結果:

```text
┌─arrayROCAUC([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])─┐
│                                             0.75 │
└──────────────────────────────────────────────────┘
```

## arrayAUCPR {#arrayaucpr}

精度-再現率 (PR) 曲線下の面積を計算します。
精度-再現率曲線は、すべての閾値にわたって、y軸に精度を、x軸に再現率をプロットすることによって作成されます。
得られる値は0から1の範囲で、高い値はより良いモデルのパフォーマンスを示します。
PR AUCは不均衡データセットに特に便利で、これらのケースに対するROC AUCと比較してパフォーマンスのより明確な比較を提供します。
詳細については、[こちら](https://developers.google.com/machine-learning/glossary#pr-auc-area-under-the-pr-curve)、[こちら](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc#expandable-1)、および[こちら](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve)を参照してください。

**構文**

```sql
arrayAUCPR(arr_scores, arr_labels[, arr_partial_offsets])
```

エイリアス: `arrayPRAUC`

**引数**

- `arr_scores` — 予測モデルが提供するスコア。 [Array](/sql-reference/data-types/array) の [Integers](../data-types/int-uint.md) または [Floats](../data-types/float.md) の配列。
- `arr_labels` — サンプルのラベル。通常、ポジティブサンプルは1、ネガティブサンプルは0です。 [Array](/sql-reference/data-types/array) の [Integers](../data-types/int-uint.md) または [Enums](../data-types/enum.md) の配列。
- `arr_partial_offsets` — オプション。PR曲線の部分領域を計算するための3つの非負整数の [Array](/sql-reference/data-types/array) で、全体のAUCではなく（PR空間の垂直バンドに相当）を計算します。このオプションは、PR AUCの分散計算に便利です。この配列は、次の要素[`higher_partitions_tp`, `higher_partitions_fp`, `total_positives`]を含む必要があります。非負の [Integers](../data-types/int-uint.md) の [Array](/sql-reference/data-types/array)。オプション。
    - `higher_partitions_tp`: 高スコアのパーティションにあるポジティブラベルの数。
    - `higher_partitions_fp`: 高スコアのパーティションにあるネガティブラベルの数。
    - `total_positives`: データセット全体のポジティブサンプルの総数。

::::note
`arr_partial_offsets`を使用する場合、`arr_scores` と `arr_labels` はデータセット全体の一部だけでなければならず、スコアの区間を含む部分にする必要があります。
データセットは、スコアが特定の範囲内にあるデータのサブセットを含む連続的なパーティションに分割する必要があります。
例えば：
- 1つのパーティションは範囲 [0, 0.5) のすべてのスコアを含むことができます。
- 別のパーティションは、範囲 [0.5, 1.0] のスコアを含むことができます。
::::

**返される値**

精度-再現率 (PR) 曲線下の面積を返します。 [Float64](../data-types/float.md)。

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

`func(arr1[i], ..., arrN[i])` を各要素に適用することによって得られた配列を返します。 配列 `arr1` ... `arrN` は同じ数の要素を持たなければなりません。

例：

```sql
SELECT arrayMap(x -> (x + 2), [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [3,4,5] │
└─────────┘
```

次の例は、異なる配列から要素のタプルを作成する方法を示しています：

```sql
SELECT arrayMap((x, y) -> (x, y), [1, 2, 3], [4, 5, 6]) AS res
```

```text
┌─res─────────────────┐
│ [(1,4),(2,5),(3,6)] │
└─────────────────────┘
```

`arrayMap` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

## arrayFilter(func, arr1, ...) {#arrayfilterfunc-arr1-}

`arr1` 内の要素のうち、`func(arr1[i], ..., arrN[i])` が 0 以外の値を返す要素のみを含む配列を返します。

例：

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

`arrayFilter` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

## arrayFill(func, arr1, ...) {#arrayfillfunc-arr1-}

`arr1` を最初の要素から最後の要素までスキャンし、`func(arr1[i], ..., arrN[i])` が 0 を返す場合、`arr1[i]` を `arr1[i - 1]` で置き換えます。`arr1` の最初の要素は置き換えられません。

例：

```sql
SELECT arrayFill(x -> not isNull(x), [1, null, 3, 11, 12, null, null, 5, 6, 14, null, null]) AS res
```

```text
┌─res──────────────────────────────┐
│ [1,1,3,11,12,12,12,5,6,14,14,14] │
└──────────────────────────────────┘
```

`arrayFill` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

## arrayReverseFill(func, arr1, ...) {#arrayreversefillfunc-arr1-}

`arr1` を最後の要素から最初の要素までスキャンし、`func(arr1[i], ..., arrN[i])` が 0 を返す場合、`arr1[i]` を `arr1[i + 1]` で置き換えます。`arr1` の最後の要素は置き換えられません。

例：

```sql
SELECT arrayReverseFill(x -> not isNull(x), [1, null, 3, 11, 12, null, null, 5, 6, 14, null, null]) AS res
```

```text
┌─res────────────────────────────────┐
│ [1,3,3,11,12,5,5,5,6,14,NULL,NULL] │
└────────────────────────────────────┘
```

`arrayReverseFill` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

## arraySplit(func, arr1, ...) {#arraysplitfunc-arr1-}

`arr1` を複数の配列に分割します。 `func(arr1[i], ..., arrN[i])` が 0 以外の値を返すと、要素の左側で配列が分割されます。配列は最初の要素の前では分割されません。

例：

```sql
SELECT arraySplit((x, y) -> y, [1, 2, 3, 4, 5], [1, 0, 0, 1, 0]) AS res
```

```text
┌─res─────────────┐
│ [[1,2,3],[4,5]] │
└─────────────────┘
```

`arraySplit` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

## arrayReverseSplit(func, arr1, ...) {#arrayreversesplitfunc-arr1-}

`arr1` を複数の配列に分割します。`func(arr1[i], ..., arrN[i])` が 0 以外の値を返すと、要素の右側で配列が分割されます。配列は最後の要素の後では分割されません。

例：

```sql
SELECT arrayReverseSplit((x, y) -> y, [1, 2, 3, 4, 5], [1, 0, 0, 1, 0]) AS res
```

```text
┌─res───────────────┐
│ [[1],[2,3,4],[5]] │
└───────────────────┘
```

`arrayReverseSplit` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

## arrayExists(\[func,\] arr1, ...) {#arrayexistsfunc-arr1-}

`arr` に `func(arr1[i], ..., arrN[i])` が 0 以外の値を返す要素が少なくとも一つ存在する場合は1を返します。そうでない場合は0を返します。

`arrayExists` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があります。

## arrayAll(\[func,\] arr1, ...) {#arrayallfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が配列のすべての要素に対して 0 以外の値を返す場合は 1 を返します。そうでない場合は 0 を返します。

`arrayAll` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があります。

## arrayFirst(func, arr1, ...) {#arrayfirstfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が 0 以外の値を返す最初の要素を `arr1` 配列から返します。

## arrayFirstOrNull {#arrayfirstornull}

`func(arr1[i], ..., arrN[i])` が 0 以外の値を返す `arr1` 配列の最初の要素を返します。そうでない場合は `NULL` を返します。

**構文**

```sql
arrayFirstOrNull(func, arr1, ...)
```

**パラメータ**

- `func`: ラムダ関数。 [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `arr1`: 操作対象の配列。 [Array](/sql-reference/data-types/array)。

**返される値**

- 渡された配列の最初の要素。
- そうでない場合は `NULL` を返します。

**実装の詳細**

`arrayFirstOrNull` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

**例**

クエリ：

```sql
SELECT arrayFirstOrNull(x -> x >= 2, [1, 2, 3]);
```

結果：

```response
2
```

クエリ：

```sql
SELECT arrayFirstOrNull(x -> x >= 2, emptyArrayUInt8());
```

結果：

```response
\N
```

クエリ：

```sql
SELECT arrayLastOrNull((x,f) -> f, [1,2,3,NULL], [0,1,0,1]);
```

結果：

```response
\N
```

## arrayLast(func, arr1, ...) {#arraylastfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が 0 以外の値を返す最後の要素を `arr1` 配列から返します。

`arrayLast` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

## arrayLastOrNull {#arraylastornull}

`func(arr1[i], ..., arrN[i])` が 0 以外の値を返す `arr1` 配列の最後の要素を返します。そうでない場合は `NULL` を返します。

**構文**

```sql
arrayLastOrNull(func, arr1, ...)
```

**パラメータ**

- `func`: ラムダ関数。 [ラムダ関数](/sql-reference/functions/overview#higher-order-functions)。
- `arr1`: 操作対象の配列。 [Array](/sql-reference/data-types/array)。

**返される値**

- 渡された配列の最後の要素。
- そうでない場合は `NULL` を返します。

**実装の詳細**

`arrayLastOrNull` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

**例**

クエリ：

```sql
SELECT arrayLastOrNull(x -> x >= 2, [1, 2, 3]);
```

結果：

```response
3
```

クエリ：

```sql
SELECT arrayLastOrNull(x -> x >= 2, emptyArrayUInt8());
```

結果：

```response
\N
```

## arrayFirstIndex(func, arr1, ...) {#arrayfirstindexfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が 0 以外の値を返す `arr1` 配列の最初の要素のインデックスを返します。

`arrayFirstIndex` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

## arrayLastIndex(func, arr1, ...) {#arraylastindexfunc-arr1-}

`func(arr1[i], ..., arrN[i])` が 0 以外の値を返す `arr1` 配列の最後の要素のインデックスを返します。

`arrayLastIndex` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があり、省略できません。

## arrayMin {#arraymin}

ソース配列の要素の最小値を返します。

`func` 関数が指定されている場合、この関数によって変換された要素の最小値を返します。

`arrayMin` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があります。

**構文**

```sql
arrayMin([func,] arr)
```

**引数**

- `func` — 関数。 [Expression](../data-types/special-data-types/expression.md)。
- `arr` — 配列。 [Array](/sql-reference/data-types/array)。

**返される値**

- 関数の値の最小値（または配列の最小値）。

:::note
`func` が指定されている場合、返す型は `func` の返り値の型に一致し、そうでない場合は配列の要素の型に一致します。
:::

**例**

クエリ：

```sql
SELECT arrayMin([1, 2, 4]) AS res;
```

結果：

```text
┌─res─┐
│   1 │
└─────┘
```

クエリ：

```sql
SELECT arrayMin(x -> (-x), [1, 2, 4]) AS res;
```

結果：

```text
┌─res─┐
│  -4 │
└─────┘
```

## arrayMax {#arraymax}

ソース配列の要素の最大値を返します。

`func` 関数が指定されている場合、この関数によって変換された要素の最大値を返します。

`arrayMax` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があります。

**構文**

```sql
arrayMax([func,] arr)
```

**引数**

- `func` — 関数。 [Expression](../data-types/special-data-types/expression.md)。
- `arr` — 配列。 [Array](/sql-reference/data-types/array)。

**返される値**

- 関数の値の最大値（または配列の最大値）。

:::note
`func` が指定されている場合、返す型は `func` の返り値の型に一致し、そうでない場合は配列の要素の型に一致します。
:::

**例**

クエリ：

```sql
SELECT arrayMax([1, 2, 4]) AS res;
```

結果：

```text
┌─res─┐
│   4 │
└─────┘
```

クエリ：

```sql
SELECT arrayMax(x -> (-x), [1, 2, 4]) AS res;
```

結果：

```text
┌─res─┐
│  -1 │
└─────┘
```

## arraySum {#arraysum}

ソース配列の要素の合計を返します。

`func` 関数が指定されている場合、この関数によって変換された要素の合計を返します。

`arraySum` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があります。

**構文**

```sql
arraySum([func,] arr)
```

**引数**

- `func` — 関数。 [Expression](../data-types/special-data-types/expression.md)。
- `arr` — 配列。 [Array](/sql-reference/data-types/array)。

**返される値**

- 関数の値の合計（または配列の合計）。

:::note
返す型：

- ソース配列における小数（または変換された値、`func` が指定されている場合）に対して — [Decimal128](../data-types/decimal.md)。
- 浮動小数点数に対して — [Float64](../data-types/float.md)。
- 符号なし数値に対して — [UInt64](../data-types/int-uint.md)。 
- 符号付き数値に対して — [Int64](../data-types/int-uint.md)。
:::

**例**

クエリ：

```sql
SELECT arraySum([2, 3]) AS res;
```

結果：

```text
┌─res─┐
│   5 │
└─────┘
```

クエリ：

```sql
SELECT arraySum(x -> x*x, [2, 3]) AS res;
```

結果：

```text
┌─res─┐
│  13 │
└─────┘
```

## arrayAvg {#arrayavg}

ソース配列の要素の平均を返します。

`func` 関数が指定されている場合、この関数によって変換された要素の平均を返します。

`arrayAvg` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があります。

**構文**

```sql
arrayAvg([func,] arr)
```

**引数**

- `func` — 関数。 [Expression](../data-types/special-data-types/expression.md)。
- `arr` — 配列。 [Array](/sql-reference/data-types/array)。

**返される値**

- 関数の値の平均（または配列の平均）。 [Float64](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT arrayAvg([1, 2, 4]) AS res;
```

結果：

```text
┌────────────────res─┐
│ 2.3333333333333335 │
└────────────────────┘
```

クエリ：

```sql
SELECT arrayAvg(x -> (x * x), [2, 4]) AS res;
```

結果：

```text
┌─res─┐
│  10 │
└─────┘
```

## arrayCumSum(\[func,\] arr1, ...) {#arraycumsumfunc-arr1-}

ソース配列 `arr1` の要素の部分的（累積）合計の配列を返します。 `func` が指定されている場合、合計は `arr1`, `arr2`, ..., `arrN` に `func` を適用することによって計算されます。つまり、`func(arr1[i], ..., arrN[i])` です。

**構文**

```sql
arrayCumSum(arr)
```

**引数**

- `arr` — 数値の [Array](/sql-reference/data-types/array)。

**返される値**

- ソース配列の要素の部分的な合計の配列を返します。 [UInt\*](/sql-reference/data-types/int-uint#integer-ranges)、[Int\*](/sql-reference/data-types/int-uint#integer-ranges)、[Float\*](/sql-reference/data-types/float/)。

例：

```sql
SELECT arrayCumSum([1, 1, 1, 1]) AS res
```

```text
┌─res──────────┐
│ [1, 2, 3, 4] │
└──────────────┘
```

`arrayCumSum` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があります。

## arrayCumSumNonNegative(\[func,\] arr1, ...) {#arraycumsumnonnegativefunc-arr1-}

`arrayCumSum` と同様、ソース配列の要素の部分的（累積）合計の配列を返します。 `func` が指定されている場合、合計は `arr1`, `arr2`, ..., `arrN` に `func` を適用することによって計算されます。つまり、`func(arr1[i], ..., arrN[i])` です。`arrayCumSum` と異なり、現在の累積合計が `0` より小さい場合は `0` で置き換えられます。

**構文**

```sql
arrayCumSumNonNegative(arr)
```

**引数**

- `arr` — 数値の [Array](/sql-reference/data-types/array)。

**返される値**

- ソース配列内の非負の要素の部分的な合計の配列を返します。 [UInt\*](/sql-reference/data-types/int-uint#integer-ranges)、[Int\*](/sql-reference/data-types/int-uint#integer-ranges)、[Float\*](/sql-reference/data-types/float/)。

```sql
SELECT arrayCumSumNonNegative([1, 1, -4, 1]) AS res
```

```text
┌─res───────┐
│ [1,2,0,1] │
└───────────┘
```

`arrayCumSumNonNegative` が [高階関数](/sql-reference/functions/overview#higher-order-functions) であることに注意してください。ラムダ関数を最初の引数として渡す必要があります。

## arrayProduct {#arrayproduct}

[配列](/sql-reference/data-types/array)の要素を掛け算します。

**構文**

```sql
arrayProduct(arr)
```

**引数**

- `arr` — 数値の [Array](/sql-reference/data-types/array)。

**返される値**

- 配列の要素の積。 [Float64](../data-types/float.md)。

**例**

クエリ：

```sql
SELECT arrayProduct([1,2,3,4,5,6]) as res;
```

結果：

```text
┌─res───┐
│ 720   │
└───────┘
```

クエリ：

```sql
SELECT arrayProduct([toDecimal64(1,8), toDecimal64(2,8), toDecimal64(3,8)]) as res, toTypeName(res);
```

返り値の型は常に [Float64](../data-types/float.md) です。結果：

```text
┌─res─┬─toTypeName(arrayProduct(array(toDecimal64(1, 8), toDecimal64(2, 8), toDecimal64(3, 8))))─┐
│ 6   │ Float64                                                                                  │
└─────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

## arrayRotateLeft {#arrayrotateleft}

指定された数の要素によって [配列](/sql-reference/data-types/array) を左に回転します。
要素の数が負の場合、配列は右に回転します。

**構文**

```sql
arrayRotateLeft(arr, n)
```

**引数**

- `arr` — [配列](/sql-reference/data-types/array)。
- `n` — 回転する要素の数。

**返される値**

- 指定された数の要素によって左に回転した配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ：

```sql
SELECT arrayRotateLeft([1,2,3,4,5,6], 2) as res;
```

結果：

```text
┌─res───────────┐
│ [3,4,5,6,1,2] │
└───────────────┘
```

クエリ：

```sql
SELECT arrayRotateLeft([1,2,3,4,5,6], -2) as res;
```

結果：

```text
┌─res───────────┐
│ [5,6,1,2,3,4] │
└───────────────┘
```

クエリ：

```sql
SELECT arrayRotateLeft(['a','b','c','d','e'], 3) as res;
```

結果：

```text
┌─res───────────────────┐
│ ['d','e','a','b','c'] │
└───────────────────────┘
```

## arrayRotateRight {#arrayrotateright}

指定された数の要素によって [配列](/sql-reference/data-types/array) を右に回転します。
要素の数が負の場合、配列は左に回転します。

**構文**

```sql
arrayRotateRight(arr, n)
```

**引数**

- `arr` — [配列](/sql-reference/data-types/array)。
- `n` — 回転する要素の数。

**返される値**

- 指定された数の要素によって右に回転した配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ：

```sql
SELECT arrayRotateRight([1,2,3,4,5,6], 2) as res;
```

結果：

```text
┌─res───────────┐
│ [5,6,1,2,3,4] │
└───────────────┘
```

クエリ：

```sql
SELECT arrayRotateRight([1,2,3,4,5,6], -2) as res;
```

結果：

```text
┌─res───────────┐
│ [3,4,5,6,1,2] │
└───────────────┘
```

クエリ：

```sql
SELECT arrayRotateRight(['a','b','c','d','e'], 3) as res;
```

結果：

```text
┌─res───────────────────┐
│ ['c','d','e','a','b'] │
└───────────────────────┘
```

## arrayShiftLeft {#arrayshiftleft}

指定された数の要素で [配列](/sql-reference/data-types/array) を左にシフトします。
新しい要素には指定された引数または配列要素の型のデフォルト値が埋め込まれます。
要素の数が負の場合、配列は右にシフトします。

**構文**

```sql
arrayShiftLeft(arr, n[, default])
```

**引数**

- `arr` — [配列](/sql-reference/data-types/array)。
- `n` — シフトする要素の数。
- `default` — オプション。新しい要素のデフォルト値。

**返される値**

- 指定された数の要素によって左にシフトした配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ：

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6], 2) as res;
```

結果：

```text
┌─res───────────┐
│ [3,4,5,6,0,0] │
└───────────────┘
```

クエリ：

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6], -2) as res;
```

結果：

```text
┌─res───────────┐
│ [0,0,1,2,3,4] │
└───────────────┘
```

クエリ：

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6], 2, 42) as res;
```

結果：

```text
┌─res─────────────┐
│ [3,4,5,6,42,42] │
└─────────────────┘
```

クエリ：

```sql
SELECT arrayShiftLeft(['a','b','c','d','e','f'], 3, 'foo') as res;
```

結果：

```text
┌─res─────────────────────────────┐
│ ['d','e','f','foo','foo','foo'] │
└─────────────────────────────────┘
```

クエリ：

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6] :: Array(UInt16), 2, 4242) as res;
```

結果：

```text
┌─res─────────────────┐
│ [3,4,5,6,4242,4242] │
└─────────────────────┘
```

## arrayShiftRight {#arrayshiftright}

指定された数の要素で [配列](/sql-reference/data-types/array) を右にシフトします。
新しい要素には指定された引数または配列要素の型のデフォルト値が埋め込まれます。
要素の数が負の場合、配列は左にシフトします。

**構文**

```sql
arrayShiftRight(arr, n[, default])
```

**引数**

- `arr` — [配列](/sql-reference/data-types/array)。
- `n` — シフトする要素の数。
- `default` — オプション。新しい要素のデフォルト値。

**返される値**

- 指定された数の要素によって右にシフトした配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ：

```sql
SELECT arrayShiftRight([1,2,3,4,5,6], 2) as res;
```

結果：

```text
┌─res───────────┐
│ [0,0,1,2,3,4] │
└───────────────┘
```

クエリ：

```sql
SELECT arrayShiftRight([1,2,3,4,5,6], -2) as res;
```

結果：

```text
┌─res───────────┐
│ [3,4,5,6,0,0] │
└───────────────┘
```

クエリ：

```sql
SELECT arrayShiftRight([1,2,3,4,5,6], 2, 42) as res;
```

結果：

```text
┌─res─────────────┐
│ [42,42,1,2,3,4] │
└─────────────────┘
```

クエリ：

```sql
SELECT arrayShiftRight(['a','b','c','d','e','f'], 3, 'foo') as res;
```

結果：

```text
┌─res─────────────────────────────┐
│ ['foo','foo','foo','a','b','c'] │
└─────────────────────────────────┘
```

クエリ：

```sql
SELECT arrayShiftRight([1,2,3,4,5,6] :: Array(UInt16), 2, 4242) as res;
```

結果：

```text
┌─res─────────────────┐
│ [4242,4242,1,2,3,4] │
└─────────────────────┘
```

## arrayRandomSample {#arrayrandomsample}

関数 `arrayRandomSample` は、入力配列から `samples` 個のランダムな要素を持つサブセットを返します。`samples` が入力配列のサイズを超える場合、サンプルサイズは配列のサイズに制限され、すべての配列要素が返されますが、その順序は保証されません。この関数は、平坦な配列と入れ子の配列の両方を処理できます。

**構文**

```sql
arrayRandomSample(arr, samples)
```

**引数**

- `arr` — 要素をサンプリングするための入力配列。 ([Array(T)](/sql-reference/data-types/array))
- `samples` — ランダムサンプルに含める要素の数 ([UInt*](../data-types/int-uint.md))

**返される値**

- 入力配列からのランダムサンプルの要素を持つ配列。 [Array](/sql-reference/data-types/array)。

**例**

クエリ：

```sql
SELECT arrayRandomSample(['apple', 'banana', 'cherry', 'date'], 2) as res;
```

結果：

```response
┌─res────────────────┐
│ ['cherry','apple'] │
└────────────────────┘
```

クエリ：

```sql
SELECT arrayRandomSample([[1, 2], [3, 4], [5, 6]], 2) as res;
```

結果：

```response
┌─res───────────┐
│ [[3,4],[5,6]] │
└───────────────┘
```

クエリ：

```sql
SELECT arrayRandomSample([1, 2, 3], 5) as res;
```

結果：

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
- `label` — 実際の値 ([Array(T)](/sql-reference/data-types/array))

**返される値**

- 予測値のジニ係数、正規化された値のジニ係数、および正規化ジニ係数（＝前者2つのジニ係数の比率）を含むタプル。

**例**

クエリ：

```sql
SELECT arrayNormalizedGini([0.9, 0.3, 0.8, 0.7], [6, 1, 0, 2]);
```

結果：

```response
┌─arrayNormalizedGini([0.9, 0.3, 0.8, 0.7], [6, 1, 0, 2])──────────┐
│ (0.18055555555555558,0.2638888888888889,0.6842105263157896) │
└─────────────────────────────────────────────────────────────┘
```

## arrayLevenshteinDistance {#arraylevenshteindistance}

2つの配列のレーヴェンシュタイン距離を計算します。

**構文**

```sql
arrayLevenshteinDistance(from, to)
```

**引数**

- `from` — 最初の配列
- `to` — 2番目の配列

**返される値**

- 最初の配列と2番目の配列のレーヴェンシュタイン距離

**例**

クエリ：

```sql
SELECT arrayLevenshteinDistance([1, 2, 4], [1, 2, 3])
```

結果：

```text

┌─arrayLevenshteinDistance([1, 2, 4], [1, 2, 3])─┐
│                                              1 │
└────────────────────────────────────────────────┘

```

## arrayLevenshteinDistanceWeighted {#arraylevenshteindistanceweighted}

各要素にカスタム重みを持つ2つの配列のレーヴェンシュタイン距離を計算します。配列とその重みの要素数は一致する必要があります。

**構文**

```sql
arrayLevenshteinDistanceWeighted(from, to, from_weights, to_weights)
```

**引数**

- `from` — 最初の配列
- `to` — 2番目の配列
- `from_weights` — 最初の配列の重み
- `to_weights` — 2番目の配列の重み

**返される値**

- 各要素に対するカスタム重みを持つ最初の配列と2番目の配列のレーヴェンシュタイン距離

**例**

クエリ：

```sql
SELECT arrayLevenshteinDistanceWeighted(['A', 'B', 'C'], ['A', 'K', 'L'], [1.0, 2, 3], [3.0, 4, 5])
```

結果：

```text

┌─arrayLevenshteinDistanceWeighted(['A', 'B', 'C'], ['A', 'K', 'L'], [1.0, 2, 3], [3.0, 4, 5])─┐
│                                                                                           14 │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

```

## arraySimilarity {#arraysimilarity}

重み付きレーヴェンシュタイン距離に基づいて、配列の類似性を0から1の範囲で計算します。引数は `arrayLevenshteinDistanceWeighted` 関数と同様です。

**構文**

```sql
arraySimilarity(from, to, from_weights, to_weights)
```

**引数**

- `from` — 最初の配列
- `to` — 2番目の配列
- `from_weights` — 最初の配列の重み
- `to_weights` — 2番目の配列の重み

**返される値**

- 重み付きレーヴェンシュタイン距離に基づいた2つの配列の類似性

**例**

クエリ：

```sql
SELECT arraySimilarity(['A', 'B', 'C'], ['A', 'K', 'L'], [1.0, 2, 3], [3.0, 4, 5])
```

結果：

```text

┌─arraySimilarity(['A', 'B', 'C'], ['A', 'K', 'L'], [1.0, 2, 3], [3.0, 4, 5])─┐
│                                                          0.2222222222222222 │
└─────────────────────────────────────────────────────────────────────────────┘

```

## Distance functions {#distance-functions}

すべてのサポートされている関数は、[距離関数のドキュメント](../../sql-reference/functions/distance-functions.md)に記載されています。
