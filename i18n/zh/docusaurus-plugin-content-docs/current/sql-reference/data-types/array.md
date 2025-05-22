
# Array(T)

一个 `T` 类型项的数组，起始数组索引为 1。`T` 可以是任何数据类型，包括数组。

## 创建数组 {#creating-an-array}

您可以使用函数来创建数组：

```sql
array(T)
```

您也可以使用方括号。

```sql
[]
```

创建数组的示例：

```sql
SELECT array(1, 2) AS x, toTypeName(x)
```

```text
┌─x─────┬─toTypeName(array(1, 2))─┐
│ [1,2] │ Array(UInt8)            │
└───────┴─────────────────────────┘
```

```sql
SELECT [1, 2] AS x, toTypeName(x)
```

```text
┌─x─────┬─toTypeName([1, 2])─┐
│ [1,2] │ Array(UInt8)       │
└───────┴────────────────────┘
```

## 处理数据类型 {#working-with-data-types}

在动态创建数组时，ClickHouse 自动将参数类型定义为可以存储所有列出参数的最窄数据类型。如果有任何 [Nullable](/sql-reference/data-types/nullable) 或字面量 [NULL](/operations/settings/formats#input_format_null_as_default) 值，数组元素的类型也会变为 [Nullable](../../sql-reference/data-types/nullable.md)。

如果 ClickHouse 无法确定数据类型，则会生成异常。例如，当试图同时创建包含字符串和数字的数组时（`SELECT array(1, 'a')`）。

自动数据类型检测的示例：

```sql
SELECT array(1, 2, NULL) AS x, toTypeName(x)
```

```text
┌─x──────────┬─toTypeName(array(1, 2, NULL))─┐
│ [1,2,NULL] │ Array(Nullable(UInt8))        │
└────────────┴───────────────────────────────┘
```

如果您尝试创建一个不兼容数据类型的数组，ClickHouse 会抛出异常：

```sql
SELECT array(1, 'a')
```

```text
Received exception from server (version 1.1.54388):
Code: 386. DB::Exception: Received from localhost:9000, 127.0.0.1. DB::Exception: There is no supertype for types UInt8, String because some of them are String/FixedString and some of them are not.
```

## 数组大小 {#array-size}

可以使用 `size0` 子列找到数组的大小，而无需读取整个列。对于多维数组，您可以使用 `sizeN-1`，其中 `N` 是所需的维度。

**示例**

查询：

```sql
CREATE TABLE t_arr (`arr` Array(Array(Array(UInt32)))) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO t_arr VALUES ([[[12, 13, 0, 1],[12]]]);

SELECT arr.size0, arr.size1, arr.size2 FROM t_arr;
```

结果：

```text
┌─arr.size0─┬─arr.size1─┬─arr.size2─┐
│         1 │ [2]       │ [[4,1]]   │
└───────────┴───────────┴───────────┘
```

## 从数组中读取嵌套子列 {#reading-nested-subcolumns-from-array}

如果嵌套类型 `T` 在 `Array` 里面有子列（例如，如果它是一个 [命名元组](./tuple.md)），您可以使用相同的子列名称从 `Array(T)` 类型中读取其子列。子列的类型将是原始子列类型的 `Array`。

**示例**

```sql
CREATE TABLE t_arr (arr Array(Tuple(field1 UInt32, field2 String))) ENGINE = MergeTree ORDER BY tuple();
INSERT INTO t_arr VALUES ([(1, 'Hello'), (2, 'World')]), ([(3, 'This'), (4, 'is'), (5, 'subcolumn')]);
SELECT arr.field1, toTypeName(arr.field1), arr.field2, toTypeName(arr.field2) from t_arr;
```

```test
┌─arr.field1─┬─toTypeName(arr.field1)─┬─arr.field2────────────────┬─toTypeName(arr.field2)─┐
│ [1,2]      │ Array(UInt32)          │ ['Hello','World']         │ Array(String)          │
│ [3,4,5]    │ Array(UInt32)          │ ['This','is','subcolumn'] │ Array(String)          │
└────────────┴────────────────────────┴───────────────────────────┴────────────────────────┘
```
