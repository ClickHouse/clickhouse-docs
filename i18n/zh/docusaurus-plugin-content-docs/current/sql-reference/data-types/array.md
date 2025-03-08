---
slug: /sql-reference/data-types/array
sidebar_position: 32
sidebar_label: Array(T)
---


# Array(T)

一个 `T` 类型项目的数组，起始数组索引为 1。`T` 可以是任何数据类型，包括数组。

## 创建数组 {#creating-an-array}

您可以使用一个函数创建数组：

``` sql
array(T)
```

您也可以使用方括号。

``` sql
[]
```

创建数组的示例：

``` sql
SELECT array(1, 2) AS x, toTypeName(x)
```

``` text
┌─x─────┬─toTypeName(array(1, 2))─┐
│ [1,2] │ Array(UInt8)            │
└───────┴─────────────────────────┘
```

``` sql
SELECT [1, 2] AS x, toTypeName(x)
```

``` text
┌─x─────┬─toTypeName([1, 2])─┐
│ [1,2] │ Array(UInt8)       │
└───────┴────────────────────┘
```

## 使用数据类型 {#working-with-data-types}

在动态创建数组时，ClickHouse 会自动将参数类型定义为可以存储所有列出的参数的最窄数据类型。如果有任何 [Nullable](/sql-reference/data-types/nullable) 或文字 [NULL](/operations/settings/formats#input_format_null_as_default) 值，则数组元素的类型也会变为 [Nullable](../../sql-reference/data-types/nullable.md)。

如果 ClickHouse 无法确定数据类型，则会生成异常。例如，当尝试同时创建包含字符串和数字的数组时（`SELECT array(1, 'a')`）。

自动数据类型检测的示例：

``` sql
SELECT array(1, 2, NULL) AS x, toTypeName(x)
```

``` text
┌─x──────────┬─toTypeName(array(1, 2, NULL))─┐
│ [1,2,NULL] │ Array(Nullable(UInt8))        │
└────────────┴───────────────────────────────┘
```

如果您尝试创建 incompatible 数据类型的数组，ClickHouse 会抛出异常：

``` sql
SELECT array(1, 'a')
```

``` text
从服务器接收异常 (版本 1.1.54388):
代码: 386. DB::Exception: 从 localhost:9000, 127.0.0.1 接收。 DB::Exception: 对于类型 UInt8 和 String 没有超类型，因为其中一些是 String/FixedString，而其中一些不是。
```

## 数组大小 {#array-size}

可以通过使用 `size0` 子列而无需读取整个列来查找数组的大小。对于多维数组，您可以使用 `sizeN-1`，其中 `N` 是所需的维度。

**示例**

查询：

```sql
CREATE TABLE t_arr (`arr` Array(Array(Array(UInt32)))) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO t_arr VALUES ([[[12, 13, 0, 1],[12]]]);

SELECT arr.size0, arr.size1, arr.size2 FROM t_arr;
```

结果：

``` text
┌─arr.size0─┬─arr.size1─┬─arr.size2─┐
│         1 │ [2]       │ [[4,1]]   │
└───────────┴───────────┴───────────┘
```

## 从数组读取嵌套子列 {#reading-nested-subcolumns-from-array}

如果 `Array` 内的嵌套类型 `T` 具有子列（例如，如果它是 [命名元组](./tuple.md)），您可以使用相同的子列名称从 `Array(T)` 类型中读取其子列。子列的类型将是原始子列类型的 `Array`。

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
