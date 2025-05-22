---
'description': 'Array Functions 的文档'
'sidebar_label': '数组'
'sidebar_position': 10
'slug': '/sql-reference/functions/array-functions'
'title': '数组函数'
---


# 数组函数
## empty {#empty}

检查输入数组是否为空。

**语法**

```sql
empty([x])
```

如果数组不包含任何元素，则视为为空。

:::note
通过启用 [`optimize_functions_to_subcolumns` 设置](/operations/settings/settings#optimize_functions_to_subcolumns) 可以优化。设置 `optimize_functions_to_subcolumns = 1` 时，函数只读取 [size0](/sql-reference/data-types/array#array-size) 子列，而不是读取和处理整个数组列。查询 `SELECT empty(arr) FROM TABLE;` 转换为 `SELECT arr.size0 = 0 FROM TABLE;`。
:::

该函数也适用于 [字符串](string-functions.md#empty) 和 [UUID](uuid-functions.md#empty)。

**参数**

- `[x]` — 输入数组。 [Array](/sql-reference/data-types/array)。

**返回值**

- 返回 `1` 表示数组为空，返回 `0` 表示数组非空。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT empty([]);
```

结果：

```text
┌─empty(array())─┐
│              1 │
└────────────────┘
```
## notEmpty {#notempty}

检查输入数组是否非空。

**语法**

```sql
notEmpty([x])
```

如果数组至少包含一个元素，则视为非空。

:::note
通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置可以优化。设置 `optimize_functions_to_subcolumns = 1` 时，函数只读取 [size0](/sql-reference/data-types/array#array-size) 子列，而不是读取和处理整个数组列。查询 `SELECT notEmpty(arr) FROM table` 转换为 `SELECT arr.size0 != 0 FROM TABLE`。
:::

该函数也适用于 [字符串](string-functions.md#notempty) 和 [UUID](uuid-functions.md#notempty)。

**参数**

- `[x]` — 输入数组。 [Array](/sql-reference/data-types/array)。

**返回值**

- 返回 `1` 表示数组非空，返回 `0` 表示数组为空。 [UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT notEmpty([1,2]);
```

结果：

```text
┌─notEmpty([1, 2])─┐
│                1 │
└──────────────────┘
```
## length {#length}

返回数组中的项数。
返回值类型为 UInt64。
该函数也适用于字符串。

通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置可以优化。设置 `optimize_functions_to_subcolumns = 1` 时，函数只读取 [size0](/sql-reference/data-types/array#array-size) 子列，而不是读取和处理整个数组列。查询 `SELECT length(arr) FROM table` 转换为 `SELECT arr.size0 FROM TABLE`。

别名： `OCTET_LENGTH`
## emptyArrayUInt8 {#emptyarrayuint8}

返回一个空的 UInt8 数组。

**语法**

```sql
emptyArrayUInt8()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayUInt8();
```

结果：

```response
[]
```
## emptyArrayUInt16 {#emptyarrayuint16}

返回一个空的 UInt16 数组。

**语法**

```sql
emptyArrayUInt16()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayUInt16();

```

结果：

```response
[]
```
## emptyArrayUInt32 {#emptyarrayuint32}

返回一个空的 UInt32 数组。

**语法**

```sql
emptyArrayUInt32()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayUInt32();
```

结果：

```response
[]
```
## emptyArrayUInt64 {#emptyarrayuint64}

返回一个空的 UInt64 数组。

**语法**

```sql
emptyArrayUInt64()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayUInt64();
```

结果：

```response
[]
```
## emptyArrayInt8 {#emptyarrayint8}

返回一个空的 Int8 数组。

**语法**

```sql
emptyArrayInt8()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayInt8();
```

结果：

```response
[]
```
## emptyArrayInt16 {#emptyarrayint16}

返回一个空的 Int16 数组。

**语法**

```sql
emptyArrayInt16()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayInt16();
```

结果：

```response
[]
```
## emptyArrayInt32 {#emptyarrayint32}

返回一个空的 Int32 数组。

**语法**

```sql
emptyArrayInt32()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayInt32();
```

结果：

```response
[]
```
## emptyArrayInt64 {#emptyarrayint64}

返回一个空的 Int64 数组。

**语法**

```sql
emptyArrayInt64()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayInt64();
```

结果：

```response
[]
```
## emptyArrayFloat32 {#emptyarrayfloat32}

返回一个空的 Float32 数组。

**语法**

```sql
emptyArrayFloat32()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayFloat32();
```

结果：

```response
[]
```
## emptyArrayFloat64 {#emptyarrayfloat64}

返回一个空的 Float64 数组。

**语法**

```sql
emptyArrayFloat64()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayFloat64();
```

结果：

```response
[]
```
## emptyArrayDate {#emptyarraydate}

返回一个空的 Date 数组。

**语法**

```sql
emptyArrayDate()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayDate();
```
## emptyArrayDateTime {#emptyarraydatetime}

返回一个空的 DateTime 数组。

**语法**

```sql
[]
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayDateTime();
```

结果：

```response
[]
```
## emptyArrayString {#emptyarraystring}

返回一个空的 String 数组。

**语法**

```sql
emptyArrayString()
```

**参数**

无。

**返回值**

一个空数组。

**示例**

查询：

```sql
SELECT emptyArrayString();
```

结果：

```response
[]
```
## emptyArrayToSingle {#emptyarraytosingle}

接受一个空数组，返回一个等于默认值的一元素数组。
## range(end), range(\[start, \] end \[, step\]) {#rangeend-rangestart--end--step}

返回一个从 `start` 到 `end - 1` 的数字数组，步长为 `step`。支持的类型包括 [UInt8, UInt16, UInt32, UInt64, Int8, Int16, Int32, Int64](../data-types/int-uint.md)。

**语法**

```sql
range([start, ] end [, step])
```

**参数**

- `start` — 数组的第一个元素。可选，如果使用 `step` 则必需。默认值：0。
- `end` — 构建数组之前的数字。必需。
- `step` — 决定数组中每个元素之间的增量步长。可选。默认值：1。

**返回值**

- 从 `start` 到 `end - 1` 的数字数组，步长为 `step`。

**实现细节**

- 所有参数 `start`, `end`, `step` 必须小于数据类型：`UInt8`, `UInt16`, `UInt32`, `UInt64`,`Int8`, `Int16`, `Int32`, `Int64`，返回数组的元素类型为所有参数的超类型。
- 如果查询结果的数组总长度超过 [function_range_max_elements_in_block](../../operations/settings/settings.md#function_range_max_elements_in_block) 设置指定的元素数量，则抛出异常。
- 如果任何参数具有 Nullable(Nothing) 类型，则返回 Null。如果任何参数具有 Null 值（Nullable(T) 类型），则抛出异常。

**示例**

查询：

```sql
SELECT range(5), range(1, 5), range(1, 5, 2), range(-1, 5, 2);
```

结果：

```txt
┌─range(5)────┬─range(1, 5)─┬─range(1, 5, 2)─┬─range(-1, 5, 2)─┐
│ [0,1,2,3,4] │ [1,2,3,4]   │ [1,3]          │ [-1,1,3]        │
└─────────────┴─────────────┴────────────────┴─────────────────┘
```
## array(x1, ...), operator \[x1, ...\] {#arrayx1--operator-x1-}

从函数参数创建数组。
参数必须是常量，并且具有最小的公共类型。必须传入至少一个参数，因为否则无法明确要创建的数组类型。也就是说，您不能使用此函数创建空数组（要创建空数组，请使用上面描述的 'emptyArray\*' 函数）。
返回 'Array(T)' 类型结果，其中 'T' 是传入参数中的最小公共类型。
## arrayWithConstant(length, elem) {#arraywithconstantlength-elem}

创建一个长度为 `length` 用常量 `elem` 填充的数组。
## arrayConcat {#arrayconcat}

组合作为参数传入的数组。

```sql
arrayConcat(arrays)
```

**参数**

- `arrays` – 任意数量的 [Array](/sql-reference/data-types/array) 类型参数。

**示例**

```sql
SELECT arrayConcat([1, 2], [3, 4], [5, 6]) AS res
```

```text
┌─res───────────┐
│ [1,2,3,4,5,6] │
└───────────────┘
```
## arrayElement(arr, n), operator arr\[n\] {#arrayelementarr-n-operator-arrn}

从数组 `arr` 中获取索引为 `n` 的元素。 `n` 必须是任何整数类型。
数组中的索引从1开始。

支持负索引。在这种情况下，它选择从末尾编号的相应元素。例如，`arr[-1]` 是数组中的最后一个项。

如果索引超出数组的范围，则返回某个默认值（数字为 0，字符串为空字符串等），但对于非固定数组和固定索引为 0 的情况（在这种情况下将出现错误 `Array indices are 1-based`）。
## has(arr, elem) {#hasarr-elem}

检查数组 'arr' 是否拥有元素 'elem'。
如果该元素不在数组中，则返回 0；如果在数组中，则返回 1。

`NULL` 被视为一个值。

```sql
SELECT has([1, 2, NULL], NULL)
```

```text
┌─has([1, 2, NULL], NULL)─┐
│                       1 │
└─────────────────────────┘
```
## arrayElementOrNull(arr, n) {#arrayelementornullarr-n}

从数组 `arr` 中获取索引为 `n` 的元素。 `n` 必须是任何整数类型。
数组中的索引从1开始。

支持负索引。在这种情况下，它选择从末尾编号的相应元素。例如，`arr[-1]` 是数组中的最后一个项。

如果索引超出数组的范围，则返回 `NULL` 代替默认值。
### 示例 {#examples}

```sql
SELECT arrayElementOrNull([1, 2, 3], 2), arrayElementOrNull([1, 2, 3], 4)
```

```text
┌─arrayElementOrNull([1, 2, 3], 2)─┬─arrayElementOrNull([1, 2, 3], 4)─┐
│                                2 │                             ᴺᵁᴸᴸ │
└──────────────────────────────────┴──────────────────────────────────┘
```
## hasAll {#hasall}

检查一个数组是否为另一个数组的子集。

```sql
hasAll(set, subset)
```

**参数**

- `set` – 具有一组元素的任意类型数组。
- `subset` – 任何类型的数组，与 `set` 具有公共超类型，其元素应测试为 `set` 的子集。

**返回值**

- 如果 `set` 包含 `subset` 中的所有元素，则返回 `1`。
- 否则返回 `0`。

如果 `set` 和 `subset` 元素没有共享公共超类型，则引发 `NO_COMMON_TYPE` 异常。

**特殊性质**

- 空数组是任何数组的子集。
- `Null` 被视为一个值。
- 两个数组中值的顺序无关紧要。

**示例**

`SELECT hasAll([], [])` 返回 1。

`SELECT hasAll([1, Null], [Null])` 返回 1。

`SELECT hasAll([1.0, 2, 3, 4], [1, 3])` 返回 1。

`SELECT hasAll(['a', 'b'], ['a'])` 返回 1。

`SELECT hasAll([1], ['a'])` 引发 `NO_COMMON_TYPE` 异常。

`SELECT hasAll([[1, 2], [3, 4]], [[1, 2], [3, 5]])` 返回 0。
## hasAny {#hasany}

检查两个数组是否有任意元素的交集。

```sql
hasAny(array1, array2)
```

**参数**

- `array1` – 具有一组元素的任意类型数组。
- `array2` – 与 `array1` 具有公共超类型的任意类型数组。

**返回值**

- 如果 `array1` 和 `array2` 中至少有一个相似的元素，则返回 `1`。
- 否则返回 `0`。

如果 `array1` 和 `array2` 元素没有共享公共超类型，则引发 `NO_COMMON_TYPE` 异常。

**特殊性质**

- `Null` 被视为一个值。
- 两个数组中值的顺序无关紧要。

**示例**

`SELECT hasAny([1], [])` 返回 `0`。

`SELECT hasAny([Null], [Null, 1])` 返回 `1`。

`SELECT hasAny([-128, 1., 512], [1])` 返回 `1`。

`SELECT hasAny([[1, 2], [3, 4]], ['a', 'c'])` 引发 `NO_COMMON_TYPE` 异常。

`SELECT hasAll([[1, 2], [3, 4]], [[1, 2], [1, 2]])` 返回 `1`。
## hasSubstr {#hassubstr}

检查数组 `array1` 是否按照相同的确切顺序包含数组 `array2` 的所有元素。因此，只有当 `array1 = prefix + array2 + suffix` 时，函数才会返回 1。

```sql
hasSubstr(array1, array2)
```

换句话说，函数将检查 `array2` 的所有元素是否都包含在 `array1` 中，类似于 `hasAll` 函数。此外，它将检查两个数组 `array1` 和 `array2` 中元素的顺序是否一致。

例如：

- `hasSubstr([1,2,3,4], [2,3])` 返回 1。然而，`hasSubstr([1,2,3,4], [3,2])` 将返回 `0`。
- `hasSubstr([1,2,3,4], [1,2,3])` 返回 1。然而，`hasSubstr([1,2,3,4], [1,2,4])` 将返回 `0`。

**参数**

- `array1` – 具有一组元素的任意类型数组。
- `array2` – 具有一组元素的任意类型数组。

**返回值**

- 如果 `array1` 包含 `array2`，则返回 `1`。
- 否则返回 `0`。

如果 `array1` 和 `array2` 元素没有共享公共超类型，则引发 `NO_COMMON_TYPE` 异常。

**特殊性质**

- 如果 `array2` 为空，则函数将返回 `1`。
- `Null` 被视为一个值。换句话说, `hasSubstr([1, 2, NULL, 3, 4], [2,3])`将返回 `0`。然而，`hasSubstr([1, 2, NULL, 3, 4], [2,NULL,3])` 将返回 `1`。
- 两个数组中值的顺序非常重要。

**示例**

`SELECT hasSubstr([], [])` 返回 1。

`SELECT hasSubstr([1, Null], [Null])` 返回 1。

`SELECT hasSubstr([1.0, 2, 3, 4], [1, 3])` 返回 0。

`SELECT hasSubstr(['a', 'b'], ['a'])` 返回 1。

`SELECT hasSubstr(['a', 'b' , 'c'], ['a', 'b'])` 返回 1。

`SELECT hasSubstr(['a', 'b' , 'c'], ['a', 'c'])` 返回 0。

`SELECT hasSubstr([[1, 2], [3, 4], [5, 6]], [[1, 2], [3, 4]])` 返回 1。

`SELECT hasSubstr([1, 2, NULL, 3, 4], ['a'])` 将引发 `NO_COMMON_TYPE` 异常。
## indexOf(arr, x) {#indexofarr-x}

返回值为 'x' 的第一个元素的索引（从 1 开始），如果它在数组中。如果数组没有包含要查找的值，则该函数返回 0。

示例：

```sql
SELECT indexOf([1, 3, NULL, NULL], NULL)
```

```text
┌─indexOf([1, 3, NULL, NULL], NULL)─┐
│                                 3 │
└───────────────────────────────────┘
```

设置为 `NULL` 的元素按正常值处理。
## indexOfAssumeSorted(arr, x) {#indexofassumesortedarr-x}

返回值为 'x' 的第一个元素的索引（从 1 开始），如果它在数组中。如果数组没有包含要查找的值，则该函数返回 0。
假设数组是按升序排列的（即该函数使用二分查找）。
如果数组未排序，则结果未定义。
如果内部数组为 Nullable 类型，则将调用函数 'indexOf'。

示例：

```sql
SELECT indexOfAssumeSorted([1, 3, 3, 3, 4, 4, 5], 4)
```

```text
┌─indexOfAssumeSorted([1, 3, 3, 3, 4, 4, 5], 4)─┐
│                                             5 │
└───────────────────────────────────────────────┘
```
## arrayCount(\[func,\] arr1, ...) {#arraycountfunc-arr1-}

返回 `func(arr1[i], ..., arrN[i])` 返回非零的元素个数。如果未指定 `func`，则返回数组中非零元素的数量。

请注意，`arrayCount` 是一个 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递给它。
## arrayDotProduct {#arraydotproduct}

返回两个数组的点积。

**语法**

```sql
arrayDotProduct(vector1, vector2)
```

别名： `scalarProduct`, `dotProduct`

**参数**

- `vector1`: 第一个向量。 [Array](/sql-reference/data-types/array) 或 [Tuple](../data-types/tuple.md) 的数值。
- `vector2`: 第二个向量。 [Array](/sql-reference/data-types/array) 或 [Tuple](../data-types/tuple.md) 的数值。

:::note
两个向量的大小必须相等。数组和元组也可以包含混合元素类型。
:::

**返回值**

- 两个向量的点积。 [Numeric](/native-protocol/columns#numeric-types)。

:::note
返回类型由参数类型决定。如果数组或元组包含混合元素类型，则返回类型为超类型。
:::

**示例**

查询：

```sql
SELECT arrayDotProduct([1, 2, 3], [4, 5, 6]) AS res, toTypeName(res);
```

结果：

```response
32    UInt16
```

查询：

```sql
SELECT dotProduct((1::UInt16, 2::UInt8, 3::Float32),(4::Int16, 5::Float32, 6::UInt8)) AS res, toTypeName(res);
```

结果：

```response
32    Float64
```
## countEqual(arr, x) {#countequalarr-x}

返回数组中等于 x 的元素数量。等价于 arrayCount (elem -\> elem = x, arr)。

`NULL` 元素被视为单独的值。

示例：

```sql
SELECT countEqual([1, 2, NULL, NULL], NULL)
```

```text
┌─countEqual([1, 2, NULL, NULL], NULL)─┐
│                                    2 │
└──────────────────────────────────────┘
```
## arrayEnumerate(arr) {#arrayenumeratearr}

返回数组 \[1, 2, 3, ..., length (arr) \]

该函数通常与 `ARRAY JOIN` 一起使用。它允许在应用 `ARRAY JOIN` 后每个数组只计算一次某个值。例如：

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

在此示例中，Reaches 是转换的数量（在应用 ARRAY JOIN 后接收到的字符串），而 Hits 是页面浏览量（在 ARRAY JOIN 之前的字符串）。在这种情况下，您可以通过更简单的方式获得相同的结果：

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

该函数也可以在高阶函数中使用。例如，您可以使用它获取与条件匹配的元素的数组索引。
## arrayEnumerateUniq {#arrayenumerateuniq}

返回与源数组大小相同的数组，指示每个元素在具有相同值的元素中的位置。
例如： arrayEnumerateUniq(\[10, 20, 10, 30\]) = \[1, 1, 2, 1\]。

该函数在使用 ARRAY JOIN 和聚合数组元素时非常有用。
示例：

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

在此示例中，每个目标 ID 都计算了转换的数量（目标嵌套数据结构中的每个元素都是一个达到的目标，我们称之为转换）和会话的数量。如果没有 ARRAY JOIN，我们将以 sum(Sign) 的方式计算会话数量。但在此情况下，由于行被嵌套的 Goals 结构乘以，因此为了使每个会话在此之后计算一次，我们对 arrayEnumerateUniq(Goals.ID) 函数的值应用了条件。

arrayEnumerateUniq 函数可以接受相同大小的多个数组作为参数。在这种情况下，元素在所有数组中相同位置的元组被视为唯一。

```sql
SELECT arrayEnumerateUniq([1, 1, 1, 2, 2, 2], [1, 1, 2, 1, 1, 2]) AS res
```

```text
┌─res───────────┐
│ [1,2,1,1,2,1] │
└───────────────┘
```

在使用 ARRAY JOIN 与嵌套数据结构并进一步跨多个元素聚合时，这一点非常重要。
## arrayEnumerateUniqRanked {#arrayenumerateuniqranked}

返回与源数组大小相同的数组，指示每个元素在具有相同值的元素中的位置。它允许对多维数组进行枚举，并能够指定深入查找数组的深度。

**语法**

```sql
arrayEnumerateUniqRanked(clear_depth, arr, max_array_depth)
```

**参数**

- `clear_depth`: 在指定级别单独枚举元素。小于或等于 `max_arr_depth` 的正整数。
- `arr`: 要枚举的 N 维数组。 [Array](/sql-reference/data-types/array)。
- `max_array_depth`: 最大有效深度。小于或等于 `arr` 的深度的正整数。

**示例**

在 `clear_depth=1` 和 `max_array_depth=1` 的情况下，arrayEnumerateUniqRanked 的结果与 [`arrayEnumerateUniq`](#arrayenumerateuniq) 对同一数组给出的结果相同。

查询：

```sql
SELECT arrayEnumerateUniqRanked(1, [1,2,1], 1);
```

结果：

```text
[1,1,2]
```

在此示例中，`arrayEnumerateUniqRanked` 用于获得一个数组，指示每个多维数组元素在相同值元素中的位置。对于传入数组的第一行 `[1,2,3]`，相应的结果为 `[1,1,1]`，表明这是 `1`，`2` 和 `3` 被遇到的第一次。对于提供数组的第二行 `[2,2,1]`，相应的结果为 `[2,3,3]`，表示 `2` 被遇到了第二次和第三次，而 `1` 被遇到了第二次。同样，对于提供数组的第三行 `[3]`，相应的结果为 `[2]`，表示 `3` 被遇到了第二次。 

查询：

```sql
SELECT arrayEnumerateUniqRanked(1, [[1,2,3],[2,2,1],[3]], 2);
```

结果：

```text
[[1,1,1],[2,3,2],[2]]
```

将 `clear_depth=2`，结果为每行单独枚举的元素。

查询：

```sql
SELECT arrayEnumerateUniqRanked(2, [[1,2,3],[2,2,1],[3]], 2);
```

结果：

```text
[[1,1,1],[1,2,1],[1]]
```
## arrayPopBack {#arraypopback}

从数组中移除最后一个项目。

```sql
arrayPopBack(array)
```

**参数**

- `array` – 数组。

**示例**

```sql
SELECT arrayPopBack([1, 2, 3]) AS res;
```

```text
┌─res───┐
│ [1,2] │
└───────┘
```
## arrayPopFront {#arraypopfront}

从数组中移除第一个项目。

```sql
arrayPopFront(array)
```

**参数**

- `array` – 数组。

**示例**

```sql
SELECT arrayPopFront([1, 2, 3]) AS res;
```

```text
┌─res───┐
│ [2,3] │
└───────┘
```
## arrayPushBack {#arraypushback}

将一个项目添加到数组末尾。

```sql
arrayPushBack(array, single_value)
```

**参数**

- `array` – 数组。
- `single_value` – 单一值。只有数字可以添加到数字数组，只有字符串可以添加到字符串数组。当添加数字时，ClickHouse 会自动设置 `single_value` 为数组的数据类型。有关 ClickHouse 中数据类型的更多信息，请参见 "[数据类型](/sql-reference/data-types)"。可以是 `NULL`。该函数将 `NULL` 元素添加到数组中，数组元素的类型转换为 `Nullable`。

**示例**

```sql
SELECT arrayPushBack(['a'], 'b') AS res;
```

```text
┌─res───────┐
│ ['a','b'] │
└───────────┘
```
## arrayPushFront {#arraypushfront}

将一个元素添加到数组的开头。

```sql
arrayPushFront(array, single_value)
```

**参数**

- `array` – 数组。
- `single_value` – 单一值。只有数字可以添加到数字数组，只有字符串可以添加到字符串数组。当添加数字时，ClickHouse 会自动设置 `single_value` 为数组的数据类型。有关 ClickHouse 中数据类型的更多信息，请参见 "[数据类型](/sql-reference/data-types)"。可以是 `NULL`。该函数将 `NULL` 元素添加到数组中，数组元素的类型转换为 `Nullable`。

**示例**

```sql
SELECT arrayPushFront(['b'], 'a') AS res;
```

```text
┌─res───────┐
│ ['a','b'] │
└───────────┘
```
## arrayResize {#arrayresize}

改变数组的长度。

```sql
arrayResize(array, size[, extender])
```

**参数:**

- `array` — 数组。
- `size` — 数组的所需长度。
  - 如果 `size` 小于数组的原始大小，则将数组从右侧截断。
- 如果 `size` 大于数组的初始大小，则数组右侧将用 `extender` 值或数组项的数据类型的默认值进行扩展。
- `extender` — 用于扩展数组的值。可以是 `NULL`。

**返回值:**

长度为 `size` 的数组。

**调用示例**

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

返回数组的片段。

**参数**

- `array` – 数据数组。
- `offset` – 从数组边缘缩进。正值表示左侧缩进，负值表示右侧缩进。数组项目的编号从1开始。
- `length` – 所需切片的长度。如果指定负值，函数将返回一个开放式切片 `[offset, array_length - length]`。如果省略该值，函数返回切片 `[offset, the_end_of_array]`。

**示例**

```sql
SELECT arraySlice([1, 2, NULL, 4, 5], 2, 3) AS res;
```

```text
┌─res────────┐
│ [2,NULL,4] │
└────────────┘
```

设置为 `NULL` 的数组元素按正常值处理。
## arrayShingles {#arrayshingles}

生成一组"shingles"数组，即输入数组指定长度的连续子数组。

**语法**

```sql
arrayShingles(array, length)
```

**参数**

- `array` — 输入数组 [Array](/sql-reference/data-types/array)。
- `length` — 每个 shingles 的长度。

**返回值**

- 生成的 shingles 数组。 [Array](/sql-reference/data-types/array)。

**示例**

查询：

```sql
SELECT arrayShingles([1,2,3,4], 3) as res;
```

结果：

```text
┌─res───────────────┐
│ [[1,2,3],[2,3,4]] │
└───────────────────┘
```
## arraySort(\[func,\] arr, ...) {#sort}

按升序对 `arr` 数组的元素进行排序。如果指定了 `func` 函数，则排序顺序由应用于数组元素的 `func` 函数的结果确定。如果 `func` 接受多个参数，则 `arraySort` 函数将传递多个数组，`func` 的参数将与之对应。详细示例在 `arraySort` 描述的末尾给出。

整数值排序示例：

```sql
SELECT arraySort([1, 3, 3, 0]);
```

```text
┌─arraySort([1, 3, 3, 0])─┐
│ [0,1,3,3]               │
└─────────────────────────┘
```

字符串值排序示例：

```sql
SELECT arraySort(['hello', 'world', '!']);
```

```text
┌─arraySort(['hello', 'world', '!'])─┐
│ ['!','hello','world']              │
└────────────────────────────────────┘
```

考虑以下 `NULL`、`NaN` 和 `Inf` 值的排序顺序：

```sql
SELECT arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf]);
```

```text
┌─arraySort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf])─┐
│ [-inf,-4,1,2,3,inf,nan,nan,NULL,NULL]                     │
└───────────────────────────────────────────────────────────┘
```

- `-Inf` 值在数组中排在首位。
- `NULL` 值在数组中排在最后。
- `NaN` 值在 `NULL` 值之前。
- `Inf` 值在 `NaN` 值之前。

请注意，`arraySort` 是一个 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递给它。在这种情况下，排序顺序由应用于数组元素的 lambda 函数结果决定。

让我们考虑以下示例：

```sql
SELECT arraySort((x) -> -x, [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [3,2,1] │
└─────────┘
```

对于源数组的每个元素，lambda 函数返回排序键，即 \[1 –\> -1, 2 –\> -2, 3 –\> -3\]。由于 `arraySort` 函数按升序对键进行排序，因此结果为 \[3, 2, 1\]。因此，`(x) –> -x` lambda 函数设置了排序时的 [降序](#arrayreversesort)。

lambda 函数可以接受多个参数。在这种情况下，您需要传递多个相同长度的数组给 `arraySort` 函数，这些数组的 lambda 函数的参数将与之对应。结果数组将包含来自第一个输入数组的元素；后续输入数组中的元素指定排序键。例如：

```sql
SELECT arraySort((x, y) -> y, ['hello', 'world'], [2, 1]) as res;
```

```text
┌─res────────────────┐
│ ['world', 'hello'] │
└────────────────────┘
```

在这里，传递到第二个数组 (\[2, 1\]) 的元素为对应元素源数组 (\['hello', 'world'\]) 的排序键，即 \['hello' –\> 2, 'world' –\> 1\]。由于 lambda 函数未使用 `x`，源数组的实际值对结果顺序没有影响。因此，'hello' 将是结果中的第二个元素，而 'world' 将是第一个。

其他示例如下所示。

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
为了提高排序效率，使用了 [Schwartzian transform](https://en.wikipedia.org/wiki/Schwartzian_transform)。
:::
## arrayPartialSort(\[func,\] limit, arr, ...) {#arraypartialsortfunc-limit-arr-}

与 `arraySort` 相同，增加了 `limit` 参数以允许部分排序。返回与原始数组相同大小的数组，其中范围 `[1..limit]` 的元素按升序排序。剩余元素 `(limit..N]` 将包含未指定顺序的元素。
## arrayReverseSort {#arrayreversesort}

按降序对 `arr` 数组的元素进行排序。如果指定了 `func` 函数，则 `arr` 根据应用于数组元素的 `func` 函数的结果进行排序，然后对排序后的数组进行反转。如果 `func` 接受多个参数，则 `arrayReverseSort` 函数将传递多个数组，`func` 的参数将与之对应。详细示例在 `arrayReverseSort` 描述的末尾给出。

**语法**

```sql
arrayReverseSort([func,] arr, ...)
```
整数值排序示例：

```sql
SELECT arrayReverseSort([1, 3, 3, 0]);
```

```text
┌─arrayReverseSort([1, 3, 3, 0])─┐
│ [3,3,1,0]                      │
└────────────────────────────────┘
```

字符串值排序示例：

```sql
SELECT arrayReverseSort(['hello', 'world', '!']);
```

```text
┌─arrayReverseSort(['hello', 'world', '!'])─┐
│ ['world','hello','!']                     │
└───────────────────────────────────────────┘
```

考虑以下 `NULL`、`NaN` 和 `Inf` 值的排序顺序：

```sql
SELECT arrayReverseSort([1, nan, 2, NULL, 3, nan, -4, NULL, inf, -inf]) as res;
```

```text
┌─res───────────────────────────────────┐
│ [inf,3,2,1,-4,-inf,nan,nan,NULL,NULL] │
└───────────────────────────────────────┘
```

- `Inf` 值在数组中排在首位。
- `NULL` 值在数组中排在最后。
- `NaN` 值在 `NULL` 值之前。
- `-Inf` 值在 `NaN` 值之前。

请注意，`arrayReverseSort` 是一个 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递给它。示例如下所示。

```sql
SELECT arrayReverseSort((x) -> -x, [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [1,2,3] │
└─────────┘
```

数组按照以下方式排序：

1. 首先，源数组 (\[1, 2, 3\]) 根据应用于数组元素的 lambda 函数返回的结果进行排序。结果为数组 \[3, 2, 1\]。
2. 上一步获得的数组被反转。因此，最终结果为 \[1, 2, 3\]。

lambda 函数可以接受多个参数。在这种情况下，您需要将多个相同长度的数组传递给 `arrayReverseSort` 函数，这些数组的 lambda 函数的参数将与之对应。结果数组将包含来自第一个输入数组的元素；后续输入数组中的元素指定排序键。例如：

```sql
SELECT arrayReverseSort((x, y) -> y, ['hello', 'world'], [2, 1]) as res;
```

```text
┌─res───────────────┐
│ ['hello','world'] │
└───────────────────┘
```

在这个例子中，数组的排序方式如下：

1. 首先，源数组 (\['hello', 'world'\]) 根据应用于数组元素的 lambda 函数返回的结果进行排序。传递到第二个数组 (\[2, 1\]) 的元素为源数组相应元素的排序键。结果为数组 \['world', 'hello'\]。
2. 在上一步中排序的数组被反转。因此，最终结果为 \['hello', 'world'\]。

其他示例如下所示。

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

与 `arrayReverseSort` 相同，增加了 `limit` 参数以允许部分排序。返回与原始数组相同大小的数组，其中范围 `[1..limit]` 的元素按降序排序。剩余元素 `(limit..N]` 将包含未指定顺序的元素。
## arrayShuffle {#arrayshuffle}

返回与原始数组相同大小的数组，其中元素以洗牌顺序排列。
元素被重新排序，使得每个可能的排列都有平等的出现概率。

**语法**

```sql
arrayShuffle(arr[, seed])
```

**参数**

- `arr`: 要部分洗牌的数组。 [Array](/sql-reference/data-types/array)。
- `seed`（可选）：用于随机数生成的种子。如果未提供，则使用随机产生的种子。 [UInt 或 Int](../data-types/int-uint.md)。

**返回值**

- 混洗后的元素数组。

**实现细节**

:::note 
此函数不会使常量具体化。
:::

**示例**

在此示例中，`arrayShuffle` 未提供 `seed`，因此将随机生成一个。

查询：

```sql
SELECT arrayShuffle([1, 2, 3, 4]);
```

注意：使用 [ClickHouse Fiddle](https://fiddle.clickhouse.com/) 时，由于函数的随机性质，确切的响应可能有所不同。

结果：

```response
[1,4,2,3]
```

在此示例中，`arrayShuffle` 提供了一个 `seed`，因此将产生稳定的结果。

查询：

```sql
SELECT arrayShuffle([1, 2, 3, 4], 41);
```

结果：

```response
[3,2,1,4]
```

## arrayPartialShuffle {#arraypartialshuffle}

给定一个基数为 `N` 的输入数组，返回一个大小为 N 的数组，其中范围 `[1...limit]` 内的元素被随机打乱，而范围 `(limit...n]` 内的其余元素未被打乱。

**语法**

```sql
arrayPartialShuffle(arr[, limit[, seed]])
```

**参数**

- `arr`: 要部分打乱的数组，大小为 `N`。 [Array](/sql-reference/data-types/array).
- `limit`（可选）：限制元素交换的数量，范围为 `[1..N]`。 [UInt 或 Int](../data-types/int-uint.md).
- `seed`（可选）：用于随机数生成的种子值。如果未提供，则使用随机生成的一个。 [UInt 或 Int](../data-types/int-uint.md)

**返回值**

- 部分打乱的元素数组。

**实现细节**

:::note 
此函数不会对常量进行物化。

`limit` 的值应在范围 `[1..N]` 内。超出该范围的值相当于执行完整的 [arrayShuffle](#arrayshuffle)。
:::

**示例**

注意：使用 [ClickHouse Fiddle](https://fiddle.clickhouse.com/) 时，由于函数的随机性质，确切的响应可能会有所不同。

查询：

```sql
SELECT arrayPartialShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1)
```

结果：

元素的顺序被保留（`[2,3,4,5], [7,8,9,10]`），只有两个被打乱的元素 `[1, 6]`。没有提供 `seed`，因此函数自己随机选择。

```response
[6,2,3,4,5,1,7,8,9,10]
```

在这个例子中，将 `limit` 增加到 `2` 并提供了 `seed` 值。元素的顺序被保留

查询：

```sql
SELECT arrayPartialShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
```

元素的顺序被保留（`[4, 5, 6, 7, 8], [10]`），只有四个被打乱的元素 `[1, 2, 3, 9]`。

结果： 
```response
[3,9,1,4,5,6,7,8,2,10]
```
## arrayUniq(arr, ...) {#arrayuniqarr-}

如果只传递一个参数，则计算数组中不同元素的数量。 如果传递多个参数，则计算多个数组中对应位置元素的不同元组的数量。

如果要获取数组中的唯一项列表，可以使用 arrayReduce('groupUniqArray', arr)。
## arrayJoin(arr) {#arrayjoinarr}

一个特殊的函数。请参阅 ["ArrayJoin function"](/sql-reference/functions/array-join) 部分。
## arrayDifference {#arraydifference}

计算相邻数组元素之间的差异数组。结果数组的第一个元素为 0，第二个为 `a[1] - a[0]`，第三个为 `a[2] - a[1]`，依此类推。结果数组中元素的类型由减法的类型推断规则确定（例如 `UInt8` - `UInt8` = `Int16`）。

**语法**

```sql
arrayDifference(array)
```

**参数**

- `array` – [Array](/sql-reference/data-types/array).

**返回值**

返回相邻数组元素之间差异的数组。 [UInt*](/sql-reference/data-types/int-uint#integer-ranges), [Int*](/sql-reference/data-types/int-uint#integer-ranges), [Float*](/sql-reference/data-types/float).

**示例**

查询：

```sql
SELECT arrayDifference([1, 2, 3, 4]);
```

结果：

```text
┌─arrayDifference([1, 2, 3, 4])─┐
│ [0,1,1,1]                     │
└───────────────────────────────┘
```

由于结果类型 Int64 导致的溢出示例：

查询：

```sql
SELECT arrayDifference([0, 10000000000000000000]);
```

结果：

```text
┌─arrayDifference([0, 10000000000000000000])─┐
│ [0,-8446744073709551616]                   │
└────────────────────────────────────────────┘
```
## arrayDistinct {#arraydistinct}

接受一个数组，返回一个仅包含不同元素的数组。

**语法**

```sql
arrayDistinct(array)
```

**参数**

- `array` – [Array](/sql-reference/data-types/array).

**返回值**

返回一个包含不同元素的数组。

**示例**

查询：

```sql
SELECT arrayDistinct([1, 2, 2, 3, 1]);
```

结果：

```text
┌─arrayDistinct([1, 2, 2, 3, 1])─┐
│ [1,2,3]                        │
└────────────────────────────────┘
```
## arrayEnumerateDense {#arrayenumeratedense}

返回一个与源数组大小相同的数组，指示每个元素在源数组中首次出现的位置。

**语法**

```sql
arrayEnumerateDense(arr)
```

**示例**

查询：

```sql
SELECT arrayEnumerateDense([10, 20, 10, 30])
```

结果：

```text
┌─arrayEnumerateDense([10, 20, 10, 30])─┐
│ [1,2,1,3]                             │
└───────────────────────────────────────┘
```
## arrayEnumerateDenseRanked {#arrayenumeratedenseranked}

返回一个与源数组同样大小的数组，指示每个元素在源数组中首次出现的位置。它允许对多维数组进行枚举，并能够指定深入数组内部的层级。

**语法**

```sql
arrayEnumerateDenseRanked(clear_depth, arr, max_array_depth)
```

**参数**

- `clear_depth`: 单独枚举指定层级的元素。正整数 [Integer](../data-types/int-uint.md)，小于或等于 `max_arr_depth`。
- `arr`: 要枚举的 N 维数组。 [Array](/sql-reference/data-types/array).
- `max_array_depth`: 最大有效深度。正整数 [Integer](../data-types/int-uint.md)，小于或等于 `arr` 的深度。

**示例**

使用 `clear_depth=1` 和 `max_array_depth=1`，结果与 [arrayEnumerateDense](#arrayenumeratedense) 给出的结果相同。

查询：

```sql
SELECT arrayEnumerateDenseRanked(1,[10, 20, 10, 30],1);
```

结果：

```text
[1,2,1,3]
```

在这个例子中，使用 `arrayEnumerateDenseRanked` 来获得一个数组，指示每个多维数组元素在相同值的元素中的位置。对于传递数组的第一行 `[10,10,30,20]`，结果的对应第一行为 `[1,1,2,3]`，表明 `10` 在位置 1 和 2 首次遇到，`30` 在位置 3 第二次遇到，`20` 在位置 4 第三次遇到。对于第二行 `[40, 50, 10, 30]`，结果对应的第二行为 `[4,5,1,2]`，表明 `40` 和 `50` 在该行的位置 1 和 2 被遇到的第四和第五个数字，另一个 `10`（首次遇到的数字）在位置 3，而 `30`（第二次遇到的数字）在最后位置。

查询：

```sql
SELECT arrayEnumerateDenseRanked(1,[[10,10,30,20],[40,50,10,30]],2);
```

结果：

```text
[[1,1,2,3],[4,5,1,2]]
```

将 `clear_depth=2` 更改后，枚举会在每一行分别进行。

查询：

```sql
SELECT arrayEnumerateDenseRanked(2,[[10,10,30,20],[40,50,10,30]],2);
```
结果：

```text
[[1,1,2,3],[1,2,3,4]]
```
## arrayUnion {#arrayunion}

接受多个数组并返回一个包含源数组中所有元素的数组。结果仅包含唯一值。

**语法**

```sql
arrayUnion(arr1, arr2, ..., arrN)
```

**参数**

- `arrN` — [Array](/sql-reference/data-types/array).

该函数可以接受任意数量的不同类型的数组。

**返回值**

- [Array](/sql-reference/data-types/array) 其中包含源数组的不同元素。


**示例**

查询：

```sql
SELECT
    arrayUnion([-2, 1], [10, 1], [-2], []) as num_example,
    arrayUnion(['hi'], [], ['hello', 'hi']) as str_example,
    arrayUnion([1, 3, NULL], [2, 3, NULL]) as null_example
```

结果：

```text
┌─num_example─┬─str_example────┬─null_example─┐
│ [10,-2,1]   │ ['hello','hi'] │ [3,2,1,NULL] │
└─────────────┴────────────────┴──────────────┘
```
## arrayIntersect {#arrayintersect}

接受多个数组并返回一个包含所有源数组中元素的数组。结果仅包含唯一值。

**语法**

```sql
arrayIntersect(arr1, arr2, ..., arrN)
```

**参数**

- `arrN` — [Array](/sql-reference/data-types/array).

该函数可以接受任意数量的不同类型的数组。

**返回值**

- [Array](/sql-reference/data-types/array) 其中包含所有源数组中存在的不同元素。

**示例**

查询：

```sql
SELECT
    arrayIntersect([1, 2], [1, 3], [2, 3]) AS empty_intersection,
    arrayIntersect([1, 2], [1, 3], [1, 4]) AS non_empty_intersection
```

结果：

```text
┌─non_empty_intersection─┬─empty_intersection─┐
│ []                     │ [1]                │
└────────────────────────┴────────────────────┘
```
## arraySymmetricDifference {#arraysymmetricdifference}

接受多个数组并返回一个包含不在所有源数组中的元素的数组。结果仅包含唯一值。

:::note
两个以上集合的对称差是[数学上定义](https://en.wikipedia.org/wiki/Symmetric_difference#n-ary_symmetric_difference)为所有输入元素的集合，这些元素在输入集合中出现的次数为奇数。
相反，函数 `arraySymmetricDifference` 仅返回输入集合中未出现在所有输入集合中的元素集合。
:::

**语法**

```sql
arraySymmetricDifference(arr1, arr2, ..., arrN)
```

**参数**

- `arrN` — [Array](/sql-reference/data-types/array).

该函数可以接受任意数量的不同类型的数组。

**返回值**

- [Array](/sql-reference/data-types/array) 其中包含不在所有源数组中的不同元素。

**示例**

查询：

```sql
SELECT
    arraySymmetricDifference([1, 2], [1, 2], [1, 2]) AS empty_symmetric_difference
    arraySymmetricDifference([1, 2], [1, 2], [1, 3]) AS non_empty_symmetric_difference,
```

结果：

```text
┌─empty_symmetric_difference─┬─non_empty_symmetric_difference─┐
│ []                         │ [3]                            │
└────────────────────────────┴────────────────────────────────┘
```
## arrayJaccardIndex {#arrayjaccardindex}

返回两个数组的 [Jaccard 指数](https://en.wikipedia.org/wiki/Jaccard_index)。

**示例**

查询：
```sql
SELECT arrayJaccardIndex([1, 2], [2, 3]) AS res
```

结果：
```text
┌─res────────────────┐
│ 0.3333333333333333 │
└────────────────────┘
```
## arrayReduce {#arrayreduce}

对数组元素应用聚合函数并返回其结果。聚合函数的名称以字符串形式传递，例如 `'max'`、`'sum'`。使用参数化聚合函数时，参数在函数名称后用括号指定，例如 `'uniqUpTo(6)'`。

**语法**

```sql
arrayReduce(agg_func, arr1, arr2, ..., arrN)
```

**参数**

- `agg_func` — 应该是一个常量 [字符串](../data-types/string.md) 的聚合函数的名称。
- `arr` — 作为聚合函数参数的任意数量 [array](/sql-reference/data-types/array) 类型列。

**返回值**

**示例**

查询：

```sql
SELECT arrayReduce('max', [1, 2, 3]);
```

结果：

```text
┌─arrayReduce('max', [1, 2, 3])─┐
│                             3 │
└───────────────────────────────┘
```

如果聚合函数需要多个参数，则必须对多个相同大小的数组应用此函数。

查询：

```sql
SELECT arrayReduce('maxIf', [3, 5], [1, 0]);
```

结果：

```text
┌─arrayReduce('maxIf', [3, 5], [1, 0])─┐
│                                    3 │
└──────────────────────────────────────┘
```

参数化聚合函数的示例：

查询：

```sql
SELECT arrayReduce('uniqUpTo(3)', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
```

结果：

```text
┌─arrayReduce('uniqUpTo(3)', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])─┐
│                                                           4 │
└─────────────────────────────────────────────────────────────┘
```

**另请参阅**

- [arrayFold](#arrayfold)
## arrayReduceInRanges {#arrayreduceinranges}

对给定范围的数组元素应用聚合函数并返回包含每个范围对应结果的数组。该函数将返回与多次 `arrayReduce(agg_func, arraySlice(arr1, index, length), ...)` 相同的结果。

**语法**

```sql
arrayReduceInRanges(agg_func, ranges, arr1, arr2, ..., arrN)
```

**参数**

- `agg_func` — 应该是一个常量 [字符串](../data-types/string.md) 的聚合函数的名称。
- `ranges` — 要进行聚合的范围，应为包含每个范围的索引和长度的 [tuples](../data-types/tuple.md) 的 [array](/sql-reference/data-types/array)。
- `arr` — 作为聚合函数参数的任意数量 [Array](/sql-reference/data-types/array) 类型列。

**返回值**

- 包含在指定范围上聚合函数结果的数组。 [Array](/sql-reference/data-types/array).

**示例**

查询：

```sql
SELECT arrayReduceInRanges(
    'sum',
    [(1, 5), (2, 3), (3, 4), (4, 4)],
    [1000000, 200000, 30000, 4000, 500, 60, 7]
) AS res
```

结果：

```text
┌─res─────────────────────────┐
│ [1234500,234000,34560,4567] │
└─────────────────────────────┘
```
## arrayFold {#arrayfold}

对一个或多个相同大小的数组应用 lambda 函数并将结果收集到一个累加器中。

**语法**

```sql
arrayFold(lambda_function, arr1, arr2, ..., accumulator)
```

**示例**

查询：

```sql
SELECT arrayFold( acc,x -> acc + x*2,  [1, 2, 3, 4], toInt64(3)) AS res;
```

结果：

```text
┌─res─┐
│  23 │
└─────┘
```

**Fibonacci 序列示例**

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

**另请参阅**

- [arrayReduce](#arrayreduce)
## arrayReverse {#arrayreverse}

返回一个与原始数组大小相同的数组，包含元素的反向顺序。

**语法**

```sql
arrayReverse(arr)
```

示例：

```sql
SELECT arrayReverse([1, 2, 3])
```

```text
┌─arrayReverse([1, 2, 3])─┐
│ [3,2,1]                 │
└─────────────────────────┘
```
## reverse(arr) {#reversearr}

["arrayReverse"](#arrayreverse) 的同义词
## arrayFlatten {#arrayflatten}

将一个数组的数组转换为一个扁平数组。

函数：

- 适用于任何深度的嵌套数组。
- 不更改已经是扁平的数组。

扁平化后的数组包含来自所有源数组的所有元素。

**语法**

```sql
flatten(array_of_arrays)
```

别名：`flatten`。

**参数**

- `array_of_arrays` — [Array](/sql-reference/data-types/array) 的数组。例如，`[[1,2,3], [4,5]]`。

**示例**

```sql
SELECT flatten([[[1]], [[2], [3]]]);
```

```text
┌─flatten(array(array([1]), array([2], [3])))─┐
│ [1,2,3]                                     │
└─────────────────────────────────────────────┘
```
## arrayCompact {#arraycompact}

从数组中删除连续的重复元素。结果值的顺序由源数组中的顺序决定。

**语法**

```sql
arrayCompact(arr)
```

**参数**

`arr` — 要检查的 [array](/sql-reference/data-types/array)。

**返回值**

去重后的数组。 [Array](/sql-reference/data-types/array).

**示例**

查询：

```sql
SELECT arrayCompact([1, 1, nan, nan, 2, 3, 3, 3]);
```

结果：

```text
┌─arrayCompact([1, 1, nan, nan, 2, 3, 3, 3])─┐
│ [1,nan,nan,2,3]                            │
└────────────────────────────────────────────┘
```
## arrayZip {#arrayzip}

将多个数组组合成一个数组。结果数组包含源数组中对应元素的元组，按参数的列出顺序分组。

**语法**

```sql
arrayZip(arr1, arr2, ..., arrN)
```

**参数**

- `arrN` — [Array](/sql-reference/data-types/array).

该函数可以接受任意数量的不同类型的数组。所有输入数组必须具有相同的大小。

**返回值**

- 从源数组中分组到 [tuples](../data-types/tuple.md) 的数组。元组中的数据类型与输入数组的类型相同，并且按照传递的数组顺序排列。 [Array](/sql-reference/data-types/array).

**示例**

查询：

```sql
SELECT arrayZip(['a', 'b', 'c'], [5, 2, 1]);
```

结果：

```text
┌─arrayZip(['a', 'b', 'c'], [5, 2, 1])─┐
│ [('a',5),('b',2),('c',1)]            │
└──────────────────────────────────────┘
```
## arrayZipUnaligned {#arrayzipunaligned}

将多个数组组合成一个数组，允许不对齐的数组。结果数组包含源数组中对应元素的元组，按参数的列出顺序分组。

**语法**

```sql
arrayZipUnaligned(arr1, arr2, ..., arrN)
```

**参数**

- `arrN` — [Array](/sql-reference/data-types/array).

该函数可以接受任意数量的不同类型的数组。

**返回值**

- 从源数组中分组到 [tuples](../data-types/tuple.md) 的数组。元组中的数据类型与输入数组的类型相同，并且按照传递的数组顺序排列。 [Array](/sql-reference/data-types/array)。如果数组大小不同，较短的数组将被填充 `null` 值。

**示例**

查询：

```sql
SELECT arrayZipUnaligned(['a'], [1, 2, 3]);
```

结果：

```text
┌─arrayZipUnaligned(['a'], [1, 2, 3])─┐
│ [('a',1),(NULL,2),(NULL,3)]         │
└─────────────────────────────────────┘
```
## arrayROCAUC {#arrayrocauc}

计算接收者操作特征（ROC）曲线下的面积。
ROC 曲线是通过绘制正真率（TPR）在 y 轴上的值和假阳性率（FPR）在 x 轴上的值来创建的，涵盖所有阈值。
得到的值范围从 0 到 1，较高的值表示更好的模型性能。
ROC AUC（也称为 AUC）是机器学习中的一个概念。
有关更多详细信息，请参阅 [here](https://developers.google.com/machine-learning/glossary#pr-auc-area-under-the-pr-curve)、[here](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc#expandable-1) 和 [here](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve)。

**语法**

```sql
arrayROCAUC(arr_scores, arr_labels[, scale[, arr_partial_offsets]])
```

别名：`arrayAUC`

**参数**

- `arr_scores` — 模型预测的分数。 [Array](/sql-reference/data-types/array) 的 [Integers](../data-types/int-uint.md) 或 [Floats](../data-types/float.md)。
- `arr_labels` — 样本的标签，通常正样本为 1，负样本为 0。 [Array](/sql-reference/data-types/array) 的 [Integers](../data-types/int-uint.md) 或 [Enums](../data-types/enum.md)。
- `scale` — 决定是否返回归一化面积。如果为 false，则返回 TP（真正例）x FP（假正例）曲线下的面积。默认值：true。 [Bool](../data-types/boolean.md)。可选。
- `arr_partial_offsets` — 一个用于计算 ROC 曲线下部分区域的四个非负整数的数组（等同于 ROC 空间的垂直带），而不是整个 AUC。此选项对于 ROC AUC 的分布式计算很有用。该数组必须包含以下元素 [`higher_partitions_tp`, `higher_partitions_fp`, `total_positives`, `total_negatives`]。 [Array](/sql-reference/data-types/array) 的非负 [Integers](../data-types/int-uint.md)。可选。
    - `higher_partitions_tp`: 较高得分分区中的正标签数量。
    - `higher_partitions_fp`: 较高得分分区中的负标签数量。
    - `total_positives`: 整个数据集中正样本的总数。
    - `total_negatives`: 整个数据集中负样本的总数。

::::note
使用 `arr_partial_offsets` 时，`arr_scores` 和 `arr_labels` 应仅是整个数据集的一个分区，包含一个得分区间。
数据集应被划分为连续的分区，每个分区包含得分落在特定范围内的数据子集。
例如：
- 一个分区可以包含范围在 [0, 0.5) 的所有得分。
- 另一个分区可以包含范围在 [0.5, 1.0] 的得分。
::::

**返回值**

返回接收者操作特征（ROC）曲线下的面积。 [Float64](../data-types/float.md)。

**示例**

查询：

```sql
select arrayROCAUC([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]);
```

结果：

```text
┌─arrayROCAUC([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])─┐
│                                             0.75 │
└──────────────────────────────────────────────────┘
```
## arrayAUCPR {#arrayaucpr}

计算精确度-召回（PR）曲线下的面积。
精确度-召回曲线是通过绘制精确度在 y 轴上的值和召回率在 x 轴上的值来创建的，各阈值均历遍。
得到的值范围从 0 到 1，较高的值表示更好的模型性能。
PR AUC 特别适用于不平衡数据集，提供了相比 ROC AUC 更清晰的性能对比。
有关更多详细信息，请参阅 [here](https://developers.google.com/machine-learning/glossary#pr-auc-area-under-the-pr-curve)、[here](https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc#expandable-1) 和 [here](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve)。

**语法**

```sql
arrayAUCPR(arr_scores, arr_labels[, arr_partial_offsets])
```

别名：`arrayPRAUC`

**参数**

- `arr_scores` — 模型预测的分数。 [Array](/sql-reference/data-types/array) 的 [Integers](../data-types/int-uint.md) 或 [Floats](../data-types/float.md)。
- `arr_labels` — 样本的标签，通常正样本为 1，负样本为 0。 [Array](/sql-reference/data-types/array) 的 [Integers](../data-types/int-uint.md) 或 [Enums](../data-types/enum.md)。
- `arr_partial_offsets` — 可选。一个 [Array](/sql-reference/data-types/array) 的三个非负整数，用于计算 PR 曲线下的部分面积（等同于 PR 空间的垂直带），而不是整个 AUC。此选项对于 PR AUC 的分布式计算很有用。该数组必须包含以下元素 [`higher_partitions_tp`, `higher_partitions_fp`, `total_positives`]。 [Array](/sql-reference/data-types/array) 的非负 [Integers](../data-types/int-uint.md)。可选。
    - `higher_partitions_tp`: 较高得分分区中的正标签数量。
    - `higher_partitions_fp`: 较高得分分区中的负标签数量。
    - `total_positives`: 整个数据集中正样本的总数。

::::note
使用 `arr_partial_offsets` 时，`arr_scores` 和 `arr_labels` 应仅是整个数据集的一个分区，包含一个得分区间。
数据集应被划分为连续的分区，每个分区包含得分落在特定范围内的数据子集。
例如：
- 一个分区可以包含范围在 [0, 0.5) 的所有得分。
- 另一个分区可以包含范围在 [0.5, 1.0] 的得分。
::::

**返回值**

返回精确度-召回（PR）曲线下的面积。 [Float64](../data-types/float.md)。

**示例**

查询：

```sql
select arrayAUCPR([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1]);
```

结果：

```text
┌─arrayAUCPR([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])─┐
│                              0.8333333333333333 │
└─────────────────────────────────────────────────┘
```
## arrayMap(func, arr1, ...) {#arraymapfunc-arr1-}

返回一个由原始数组通过对每个元素应用 `func(arr1[i], ..., arrN[i])` 得到的数组。数组 `arr1` ... `arrN` 必须具有相同数量的元素。

示例：

```sql
SELECT arrayMap(x -> (x + 2), [1, 2, 3]) as res;
```

```text
┌─res─────┐
│ [3,4,5] │
└─────────┘
```

以下示例演示如何从不同数组中创建元素的元组：

```sql
SELECT arrayMap((x, y) -> (x, y), [1, 2, 3], [4, 5, 6]) AS res
```

```text
┌─res─────────────────┐
│ [(1,4),(2,5),(3,6)] │
└─────────────────────┘
```

注意，`arrayMap` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。
## arrayFilter(func, arr1, ...) {#arrayfilterfunc-arr1-}

返回一个数组，仅包含 `arr1` 中使 `func(arr1[i], ..., arrN[i])` 返回非零的元素。

示例：

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

注意，`arrayFilter` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。
## arrayFill(func, arr1, ...) {#arrayfillfunc-arr1-}

从第一个元素扫描 `arr1` 到最后一个元素，如果 `func(arr1[i], ..., arrN[i])` 返回 0，则用 `arr1[i - 1]` 替换 `arr1[i]`。`arr1` 的第一个元素不会被替换。

示例：

```sql
SELECT arrayFill(x -> not isNull(x), [1, null, 3, 11, 12, null, null, 5, 6, 14, null, null]) AS res
```

```text
┌─res──────────────────────────────┐
│ [1,1,3,11,12,12,12,5,6,14,14,14] │
└──────────────────────────────────┘
```

注意，`arrayFill` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。
## arrayReverseFill(func, arr1, ...) {#arrayreversefillfunc-arr1-}

从最后一个元素到第一个元素扫描 `arr1`，如果 `func(arr1[i], ..., arrN[i])` 返回 0，则用 `arr1[i + 1]` 替换 `arr1[i]`。`arr1` 的最后一个元素不会被替换。

示例：

```sql
SELECT arrayReverseFill(x -> not isNull(x), [1, null, 3, 11, 12, null, null, 5, 6, 14, null, null]) AS res
```

```text
┌─res────────────────────────────────┐
│ [1,3,3,11,12,5,5,5,6,14,NULL,NULL] │
└────────────────────────────────────┘
```

注意，`arrayReverseFill` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。
## arraySplit(func, arr1, ...) {#arraysplitfunc-arr1-}

将 `arr1` 拆分成多个数组。当 `func(arr1[i], ..., arrN[i])` 返回非零时，数组将在元素的左侧拆分。数组不会在第一个元素之前拆分。

示例：

```sql
SELECT arraySplit((x, y) -> y, [1, 2, 3, 4, 5], [1, 0, 0, 1, 0]) AS res
```

```text
┌─res─────────────┐
│ [[1,2,3],[4,5]] │
└─────────────────┘
```

注意，`arraySplit` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。
## arrayReverseSplit(func, arr1, ...) {#arrayreversesplitfunc-arr1-}

将 `arr1` 拆分成多个数组。当 `func(arr1[i], ..., arrN[i])` 返回非零时，数组将在元素的右侧拆分。数组不会在最后一个元素之后拆分。

示例：

```sql
SELECT arrayReverseSplit((x, y) -> y, [1, 2, 3, 4, 5], [1, 0, 0, 1, 0]) AS res
```

```text
┌─res───────────────┐
│ [[1],[2,3,4],[5]] │
└───────────────────┘
```

注意，`arrayReverseSplit` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。
## arrayExists(\[func,\] arr1, ...) {#arrayexistsfunc-arr1-}

如果 `arr` 中至少存在一个元素使 `func(arr1[i], ..., arrN[i])` 返回非零，则返回 1。否则，返回 0。

注意，`arrayExists` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递。
## arrayAll(\[func,\] arr1, ...) {#arrayallfunc-arr1-}

如果 `func(arr1[i], ..., arrN[i])` 对数组中的所有元素返回非零，则返回 1。否则，返回 0。

注意，`arrayAll` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递。
## arrayFirst(func, arr1, ...) {#arrayfirstfunc-arr1-}

返回 `arr1` 数组中使 `func(arr1[i], ..., arrN[i])` 返回非零的第一个元素。
## arrayFirstOrNull {#arrayfirstornull}

返回 `arr1` 数组中使 `func(arr1[i], ..., arrN[i])` 返回非零的第一个元素，否则返回 `NULL`。

**语法**

```sql
arrayFirstOrNull(func, arr1, ...)
```

**参数**

- `func`: Lambda 函数。 [Lambda 函数](/sql-reference/functions/overview#higher-order-functions).
- `arr1`: 要操作的数组。 [Array](/sql-reference/data-types/array).

**返回值**

- 传入数组中的第一个元素。
- 否则，返回 `NULL`

**实现细节**

注意，`arrayFirstOrNull` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。

**示例**

查询：

```sql
SELECT arrayFirstOrNull(x -> x >= 2, [1, 2, 3]);
```

结果：

```response
2
```

查询：

```sql
SELECT arrayFirstOrNull(x -> x >= 2, emptyArrayUInt8());
```

结果：

```response
\N
```

查询：

```sql
SELECT arrayLastOrNull((x,f) -> f, [1,2,3,NULL], [0,1,0,1]);
```

结果：

```response
\N
```
## arrayLast(func, arr1, ...) {#arraylastfunc-arr1-}

返回 `arr1` 数组中使 `func(arr1[i], ..., arrN[i])` 返回非零的最后一个元素。

注意，`arrayLast` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。
## arrayLastOrNull {#arraylastornull}

返回 `arr1` 数组中使 `func(arr1[i], ..., arrN[i])` 返回非零的最后一个元素，否则返回 `NULL`。

**语法**

```sql
arrayLastOrNull(func, arr1, ...)
```

**参数**

- `func`: Lambda 函数。 [Lambda 函数](/sql-reference/functions/overview#higher-order-functions).
- `arr1`: 要操作的数组。 [Array](/sql-reference/data-types/array).

**返回值**

- 传入数组中的最后一个元素。
- 否则，返回 `NULL`

**实现细节**

注意，`arrayLastOrNull` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。

**示例**

查询：

```sql
SELECT arrayLastOrNull(x -> x >= 2, [1, 2, 3]);
```

结果：

```response
3
```

查询：

```sql
SELECT arrayLastOrNull(x -> x >= 2, emptyArrayUInt8());
```

结果：

```response
\N
```
## arrayFirstIndex(func, arr1, ...) {#arrayfirstindexfunc-arr1-}

返回 `arr1` 数组中使 `func(arr1[i], ..., arrN[i])` 返回非零的第一个元素的索引。

注意，`arrayFirstIndex` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。
## arrayLastIndex(func, arr1, ...) {#arraylastindexfunc-arr1-}

返回 `arr1` 数组中使 `func(arr1[i], ..., arrN[i])` 返回非零的最后一个元素的索引。

注意，`arrayLastIndex` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您必须将 lambda 函数作为第一个参数传递，且不能省略。
## arrayMin {#arraymin}

返回源数组中元素的最小值。

如果指定了 `func` 函数，则返回通过该函数转换的元素的最小值。

注意，`arrayMin` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递。

**语法**

```sql
arrayMin([func,] arr)
```

**参数**

- `func` — 函数。 [表达式](../data-types/special-data-types/expression.md).
- `arr` — 数组。 [Array](/sql-reference/data-types/array).

**返回值**

- 函数值的最小值（或数组的最小值）。

:::note
如果指定了 `func`，那么返回类型与 `func` 的返回值类型匹配，否则与数组元素的类型匹配。
:::

**示例**

查询：

```sql
SELECT arrayMin([1, 2, 4]) AS res;
```

结果：

```text
┌─res─┐
│   1 │
└─────┘
```

查询：

```sql
SELECT arrayMin(x -> (-x), [1, 2, 4]) AS res;
```

结果：

```text
┌─res─┐
│  -4 │
└─────┘
```
## arrayMax {#arraymax}

返回源数组中元素的最大值。

如果指定了 `func` 函数，则返回通过该函数转换的元素的最大值。

注意，`arrayMax` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递。

**语法**

```sql
arrayMax([func,] arr)
```

**参数**

- `func` — 函数。 [表达式](../data-types/special-data-types/expression.md).
- `arr` — 数组。 [Array](/sql-reference/data-types/array).

**返回值**

- 函数值的最大值（或数组的最大值）。

:::note
如果指定了 `func`，那么返回类型与 `func` 的返回值类型匹配，否则与数组元素的类型匹配。
:::

**示例**

查询：

```sql
SELECT arrayMax([1, 2, 4]) AS res;
```

结果：

```text
┌─res─┐
│   4 │
└─────┘
```

查询：

```sql
SELECT arrayMax(x -> (-x), [1, 2, 4]) AS res;
```

结果：

```text
┌─res─┐
│  -1 │
└─────┘
```
## arraySum {#arraysum}

返回源数组中元素的总和。

如果指定了 `func` 函数，则返回通过该函数转换的元素的总和。

注意，`arraySum` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递。

**语法**

```sql
arraySum([func,] arr)
```

**参数**

- `func` — 函数。 [表达式](../data-types/special-data-types/expression.md).
- `arr` — 数组。 [Array](/sql-reference/data-types/array).

**返回值**

- 函数值的总和（或数组的总和）。

:::note
返回类型：

- 对于源数组中的十进制数字（或对于转换值，如果指定了 `func`） — [Decimal128](../data-types/decimal.md).
- 对于浮点数 — [Float64](../data-types/float.md).
- 对于无符号数字 — [UInt64](../data-types/int-uint.md). 
- 对于有符号数字 — [Int64](../data-types/int-uint.md).
:::

**示例**

查询：

```sql
SELECT arraySum([2, 3]) AS res;
```

结果：

```text
┌─res─┐
│   5 │
└─────┘
```

查询：

```sql
SELECT arraySum(x -> x*x, [2, 3]) AS res;
```

结果：

```text
┌─res─┐
│  13 │
└─────┘
```
## arrayAvg {#arrayavg}

返回源数组中元素的平均值。

如果指定了 `func` 函数，则返回通过该函数转换的元素的平均值。

注意，`arrayAvg` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递。

**语法**

```sql
arrayAvg([func,] arr)
```

**参数**

- `func` — 函数。 [表达式](../data-types/special-data-types/expression.md).
- `arr` — 数组。 [Array](/sql-reference/data-types/array).

**返回值**

- 函数值的平均值（或数组的平均值）。 [Float64](../data-types/float.md).

**示例**

查询：

```sql
SELECT arrayAvg([1, 2, 4]) AS res;
```

结果：

```text
┌────────────────res─┐
│ 2.3333333333333335 │
└────────────────────┘
```

查询：

```sql
SELECT arrayAvg(x -> (x * x), [2, 4]) AS res;
```

结果：

```text
┌─res─┐
│  10 │
└─────┘
```
## arrayCumSum(\[func,\] arr1, ...) {#arraycumsumfunc-arr1-}

返回源数组 `arr1` 中元素的部分和（累积和）数组。如果指定了 `func`，则总和由应用于 `arr1`、`arr2`、...、`arrN` 的 `func` 计算，即 `func(arr1[i], ..., arrN[i])`。

**语法**

```sql
arrayCumSum(arr)
```

**参数**

- `arr` — 数值的 [Array](/sql-reference/data-types/array).

**返回值**

- 返回源数组中元素的部分和的数组。 [UInt*](/sql-reference/data-types/int-uint#integer-ranges), [Int*](/sql-reference/data-types/int-uint#integer-ranges), [Float*](/sql-reference/data-types/float/).

示例：

```sql
SELECT arrayCumSum([1, 1, 1, 1]) AS res
```

```text
┌─res──────────┐
│ [1, 2, 3, 4] │
└──────────────┘
```

注意，`arrayCumSum` 是 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将 lambda 函数作为第一个参数传递。

## arrayCumSumNonNegative(\[func,\] arr1, ...) {#arraycumsumnonnegativefunc-arr1-}

与 `arrayCumSum` 相同，返回源数组中元素的部分（运行）和的数组。如果指定了 `func`，则通过将 `func` 应用于 `arr1`、`arr2`、...、`arrN` 来计算和，即 `func(arr1[i], ..., arrN[i])`。与 `arrayCumSum` 不同的是，如果当前的运行总和小于 `0`，则将其替换为 `0`。

**语法**

```sql
arrayCumSumNonNegative(arr)
```

**参数**

- `arr` — [Array](/sql-reference/data-types/array) 数值数组。

**返回值**

- 返回源数组中元素的非负部分和的数组。 [UInt\*](/sql-reference/data-types/int-uint#integer-ranges), [Int\*](/sql-reference/data-types/int-uint#integer-ranges), [Float\*](/sql-reference/data-types/float/).

```sql
SELECT arrayCumSumNonNegative([1, 1, -4, 1]) AS res
```

```text
┌─res───────┐
│ [1,2,0,1] │
└───────────┘
```

请注意，`arraySumNonNegative` 是一个 [高阶函数](/sql-reference/functions/overview#higher-order-functions)。您可以将一个 lambda 函数作为第一个参数传递给它。
## arrayProduct {#arrayproduct}

将 [array](/sql-reference/data-types/array) 的元素相乘。

**语法**

```sql
arrayProduct(arr)
```

**参数**

- `arr` — [Array](/sql-reference/data-types/array) 数值数组。

**返回值**

- 数组元素的乘积。 [Float64](../data-types/float.md)。

**示例**

查询：

```sql
SELECT arrayProduct([1,2,3,4,5,6]) as res;
```

结果：

```text
┌─res───┐
│ 720   │
└───────┘
```

查询：

```sql
SELECT arrayProduct([toDecimal64(1,8), toDecimal64(2,8), toDecimal64(3,8)]) as res, toTypeName(res);
```

返回值类型始终是 [Float64](../data-types/float.md)。结果：

```text
┌─res─┬─toTypeName(arrayProduct(array(toDecimal64(1, 8), toDecimal64(2, 8), toDecimal64(3, 8))))─┐
│ 6   │ Float64                                                                                  │
└─────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```
## arrayRotateLeft {#arrayrotateleft}

将 [array](/sql-reference/data-types/array) 向左旋转指定数量的元素。
如果元素数量为负，则数组向右旋转。

**语法**

```sql
arrayRotateLeft(arr, n)
```

**参数**

- `arr` — [Array](/sql-reference/data-types/array)。
- `n` — 要旋转的元素数量。

**返回值**

- 旋转到指定数量元素的左侧的数组。 [Array](/sql-reference/data-types/array)。

**示例**

查询：

```sql
SELECT arrayRotateLeft([1,2,3,4,5,6], 2) as res;
```

结果：

```text
┌─res───────────┐
│ [3,4,5,6,1,2] │
└───────────────┘
```

查询：

```sql
SELECT arrayRotateLeft([1,2,3,4,5,6], -2) as res;
```

结果：

```text
┌─res───────────┐
│ [5,6,1,2,3,4] │
└───────────────┘
```

查询：

```sql
SELECT arrayRotateLeft(['a','b','c','d','e'], 3) as res;
```

结果：

```text
┌─res───────────────────┐
│ ['d','e','a','b','c'] │
└───────────────────────┘
```
## arrayRotateRight {#arrayrotateright}

将 [array](/sql-reference/data-types/array) 向右旋转指定数量的元素。
如果元素数量为负，则数组向左旋转。

**语法**

```sql
arrayRotateRight(arr, n)
```

**参数**

- `arr` — [Array](/sql-reference/data-types/array)。
- `n` — 要旋转的元素数量。

**返回值**

- 旋转到指定数量元素的右侧的数组。 [Array](/sql-reference/data-types/array)。

**示例**

查询：

```sql
SELECT arrayRotateRight([1,2,3,4,5,6], 2) as res;
```

结果：

```text
┌─res───────────┐
│ [5,6,1,2,3,4] │
└───────────────┘
```

查询：

```sql
SELECT arrayRotateRight([1,2,3,4,5,6], -2) as res;
```

结果：

```text
┌─res───────────┐
│ [3,4,5,6,1,2] │
└───────────────┘
```

查询：

```sql
SELECT arrayRotateRight(['a','b','c','d','e'], 3) as res;
```

结果：

```text
┌─res───────────────────┐
│ ['c','d','e','a','b'] │
└───────────────────────┘
```
## arrayShiftLeft {#arrayshiftleft}

将 [array](/sql-reference/data-types/array) 向左移动指定数量的元素。
新元素填充为提供的参数或数组元素类型的默认值。
如果元素数量为负，则数组向右移动。

**语法**

```sql
arrayShiftLeft(arr, n[, default])
```

**参数**

- `arr` — [Array](/sql-reference/data-types/array)。
- `n` — 要移动的元素数量。
- `default` — 可选。新元素的默认值。

**返回值**

- 向左移动指定数量元素的数组。 [Array](/sql-reference/data-types/array)。

**示例**

查询：

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6], 2) as res;
```

结果：

```text
┌─res───────────┐
│ [3,4,5,6,0,0] │
└───────────────┘
```

查询：

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6], -2) as res;
```

结果：

```text
┌─res───────────┐
│ [0,0,1,2,3,4] │
└───────────────┘
```

查询：

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6], 2, 42) as res;
```

结果：

```text
┌─res─────────────┐
│ [3,4,5,6,42,42] │
└─────────────────┘
```

查询：

```sql
SELECT arrayShiftLeft(['a','b','c','d','e','f'], 3, 'foo') as res;
```

结果：

```text
┌─res─────────────────────────────┐
│ ['d','e','f','foo','foo','foo'] │
└─────────────────────────────────┘
```

查询：

```sql
SELECT arrayShiftLeft([1,2,3,4,5,6] :: Array(UInt16), 2, 4242) as res;
```

结果：

```text
┌─res─────────────────┐
│ [3,4,5,6,4242,4242] │
└─────────────────────┘
```
## arrayShiftRight {#arrayshiftright}

将 [array](/sql-reference/data-types/array) 向右移动指定数量的元素。
新元素填充为提供的参数或数组元素类型的默认值。
如果元素数量为负，则数组向左移动。

**语法**

```sql
arrayShiftRight(arr, n[, default])
```

**参数**

- `arr` — [Array](/sql-reference/data-types/array)。
- `n` — 要移动的元素数量。
- `default` — 可选。新元素的默认值。

**返回值**

- 向右移动指定数量元素的数组。 [Array](/sql-reference/data-types/array)。

**示例**

查询：

```sql
SELECT arrayShiftRight([1,2,3,4,5,6], 2) as res;
```

结果：

```text
┌─res───────────┐
│ [0,0,1,2,3,4] │
└───────────────┘
```

查询：

```sql
SELECT arrayShiftRight([1,2,3,4,5,6], -2) as res;
```

结果：

```text
┌─res───────────┐
│ [3,4,5,6,0,0] │
└───────────────┘
```

查询：

```sql
SELECT arrayShiftRight([1,2,3,4,5,6], 2, 42) as res;
```

结果：

```text
┌─res─────────────┐
│ [42,42,1,2,3,4] │
└─────────────────┘
```

查询：

```sql
SELECT arrayShiftRight(['a','b','c','d','e','f'], 3, 'foo') as res;
```

结果：

```text
┌─res─────────────────────────────┐
│ ['foo','foo','foo','a','b','c'] │
└─────────────────────────────────┘
```

查询：

```sql
SELECT arrayShiftRight([1,2,3,4,5,6] :: Array(UInt16), 2, 4242) as res;
```

结果：

```text
┌─res─────────────────┐
│ [4242,4242,1,2,3,4] │
└─────────────────────┘
```
## arrayRandomSample {#arrayrandomsample}

函数 `arrayRandomSample` 返回输入数组中 `samples` 个随机元素的子集。如果 `samples` 超过输入数组的大小，则样本大小被限制为数组的大小，即返回所有数组元素，但其顺序不保证。该函数可以处理平面数组和嵌套数组。

**语法**

```sql
arrayRandomSample(arr, samples)
```

**参数**

- `arr` — 要抽样元素的输入数组。 ([Array(T)](/sql-reference/data-types/array))
- `samples` — 要包含在随机样本中的元素数量 ([UInt*](../data-types/int-uint.md))

**返回值**

- 包含来自输入数组的随机样本元素的数组。 [Array](/sql-reference/data-types/array)。

**示例**

查询：

```sql
SELECT arrayRandomSample(['apple', 'banana', 'cherry', 'date'], 2) as res;
```

结果：

```response
┌─res────────────────┐
│ ['cherry','apple'] │
└────────────────────┘
```

查询：

```sql
SELECT arrayRandomSample([[1, 2], [3, 4], [5, 6]], 2) as res;
```

结果：

```response
┌─res───────────┐
│ [[3,4],[5,6]] │
└───────────────┘
```

查询：

```sql
SELECT arrayRandomSample([1, 2, 3], 5) as res;
```

结果：

```response
┌─res─────┐
│ [3,1,2] │
└─────────┘
```
## arrayNormalizedGini {#arraynormalizedgini}

计算规范化基尼系数。

**语法**

```sql
arrayNormalizedGini(predicted, label)
```

**参数**

- `predicted` — 预测值 ([Array(T)](/sql-reference/data-types/array))
- `label` — 实际值 ([Array(T)](/sql-reference/data-types/array))

**返回值**

- 包含预测值的基尼系数、规范化值的基尼系数和规范化基尼系数（= 前两个基尼系数的比率）的元组。

**示例**

查询：

```sql
SELECT arrayNormalizedGini([0.9, 0.3, 0.8, 0.7], [6, 1, 0, 2]);
```

结果：

```response
┌─arrayNormalizedGini([0.9, 0.3, 0.8, 0.7], [6, 1, 0, 2])──────────┐
│ (0.18055555555555558,0.2638888888888889,0.6842105263157896) │
└─────────────────────────────────────────────────────────────┘
```
## arrayLevenshteinDistance {#arraylevenshteindistance}

计算两个数组之间的勒文斯坦距离。

**语法**

```sql
arrayLevenshteinDistance(from, to)
```

**参数**

- `from` — 第一个数组
- `to` — 第二个数组

**返回值**

- 第一个和第二个数组之间的勒文斯坦距离

**示例**

查询：

```sql
SELECT arrayLevenshteinDistance([1, 2, 4], [1, 2, 3])
```

结果：

```text

┌─arrayLevenshteinDistance([1, 2, 4], [1, 2, 3])─┐
│                                              1 │
└────────────────────────────────────────────────┘

```
## arrayLevenshteinDistanceWeighted {#arraylevenshteindistanceweighted}

计算两个数组之间的勒文斯坦距离，自定义每个元素的权重。数组及其权重的元素数量应匹配。

**语法**

```sql
arrayLevenshteinDistanceWeighted(from, to, from_weights, to_weights)
```

**参数**

- `from` — 第一个数组
- `to` — 第二个数组
- `from_weights` — 第一个数组的权重
- `to_weights` — 第二个数组的权重

**返回值**

- 第一个和第二个数组之间的勒文斯坦距离，带有每个元素的自定义权重

**示例**

查询：

```sql
SELECT arrayLevenshteinDistanceWeighted(['A', 'B', 'C'], ['A', 'K', 'L'], [1.0, 2, 3], [3.0, 4, 5])
```

结果：

```text

┌─arrayLevenshteinDistanceWeighted(['A', 'B', 'C'], ['A', 'K', 'L'], [1.0, 2, 3], [3.0, 4, 5])─┐
│                                                                                           14 │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

```
## arraySimilarity {#arraysimilarity}

根据加权的勒文斯坦距离计算数组的相似性，范围为 0 到 1。接受与 `arrayLevenshteinDistanceWeighted` 函数相同的参数。

**语法**

```sql
arraySimilarity(from, to, from_weights, to_weights)
```

**参数**

- `from` — 第一个数组
- `to` — 第二个数组
- `from_weights` — 第一个数组的权重
- `to_weights` — 第二个数组的权重

**返回值**

- 基于加权勒文斯坦距离的两个数组的相似性

**示例**

查询：

```sql
SELECT arraySimilarity(['A', 'B', 'C'], ['A', 'K', 'L'], [1.0, 2, 3], [3.0, 4, 5])
```

结果：

```text

┌─arraySimilarity(['A', 'B', 'C'], ['A', 'K', 'L'], [1.0, 2, 3], [3.0, 4, 5])─┐
│                                                          0.2222222222222222 │
└─────────────────────────────────────────────────────────────────────────────┘

```
## 距离函数 {#distance-functions}

所有支持的函数在 [距离函数文档](../../sql-reference/functions/distance-functions.md) 中进行了描述。
