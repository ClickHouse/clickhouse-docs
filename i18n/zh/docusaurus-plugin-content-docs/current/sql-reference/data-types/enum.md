---
slug: /sql-reference/data-types/enum
sidebar_position: 20
sidebar_label: '枚举（Enum）'
---


# 枚举（Enum）

由命名值组成的枚举类型。

命名值可以声明为 `'字符串' = 整数` 对或 `'字符串'` 名称。 ClickHouse 只存储数字，但通过名称支持与值的操作。

ClickHouse 支持：

- 8 位 `Enum`。它可以包含最多 256 个值，枚举范围为 `[-128, 127]`。
- 16 位 `Enum`。它可以包含最多 65536 个值，枚举范围为 `[-32768, 32767]`。

ClickHouse 在插入数据时自动选择 `Enum` 的类型。您也可以使用 `Enum8` 或 `Enum16` 类型以确保存储大小。

## 使用示例 {#usage-examples}

这里我们创建一个具有 `Enum8('hello' = 1, 'world' = 2)` 类型列的表：

``` sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

类似地，您可以省略数字。ClickHouse 会自动分配连续的数字。默认情况下，从 1 开始分配数字。

``` sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

您还可以为第一个名称指定合法的起始数字。

``` sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world')
)
ENGINE = TinyLog
```

``` sql
CREATE TABLE t_enum
(
    x Enum8('hello' = -129, 'world')
)
ENGINE = TinyLog
```

``` text
服务器异常：
代码: 69. DB::Exception: 对于元素 'hello' 的值 -129 超出了 Enum8 的范围。
```

列 `x` 只能存储类型定义中列出的值：`'hello'` 或 `'world'`。如果您尝试保存任何其他值，ClickHouse 将抛出异常。此 `Enum` 的 8 位大小是自动选择的。

``` sql
INSERT INTO t_enum VALUES ('hello'), ('world'), ('hello')
```

``` text
成功。
```

``` sql
INSERT INTO t_enum values('a')
```

``` text
客户端异常：
代码: 49. DB::Exception: 对于类型 Enum('hello' = 1, 'world' = 2)，未知元素 'a'
```

当您从表中查询数据时，ClickHouse 输出 `Enum` 的字符串值。

``` sql
SELECT * FROM t_enum
```

``` text
┌─x─────┐
│ hello │
│ world │
│ hello │
└───────┘
```

如果您需要查看行的数字等价物，必须将 `Enum` 值强制转换为整数类型。

``` sql
SELECT CAST(x, 'Int8') FROM t_enum
```

``` text
┌─CAST(x, 'Int8')─┐
│               1 │
│               2 │
│               1 │
└─────────────────┘
```

要在查询中创建一个 Enum 值，您还需要使用 `CAST`。

``` sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

``` text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## 一般规则和使用 {#general-rules-and-usage}

每个值在 `Enum8` 中分配一个范围为 `-128 ... 127` 的数字，或在 `Enum16` 中分配一个范围为 `-32768 ... 32767` 的数字。所有字符串和数字必须不同。允许使用空字符串。如果在表定义中指定此类型，则数字可以按任意顺序排列。然而，顺序并不重要。

在 `Enum` 中，字符串或数值不能为 [NULL](../../sql-reference/syntax.md)。

`Enum` 可以包含在 [Nullable](../../sql-reference/data-types/nullable.md) 类型中。因此，如果您使用查询创建一个表

``` sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

它可以存储不仅是 `'hello'` 和 `'world'`，还可以是 `NULL`。

``` sql
INSERT INTO t_enum_nullable Values('hello'),('world'),(NULL)
```

在 RAM 中，`Enum` 列的存储方式与相应数值（如 `Int8` 或 `Int16`）相同。

在以文本形式读取时，ClickHouse 将值解析为字符串，并在 `Enum` 值的集合中搜索相应的字符串。如果未找到，将抛出异常。在以文本格式读取时，字符串被读取，并查找对应的数值。如果未找到，将抛出异常。
以文本形式写入时，它以相应字符串的形式写入。如果列数据包含垃圾（不在有效集合中的数字），将抛出异常。在以二进制形式读取和写入时，它的行为与 Int8 和 Int16 数据类型相同。
隐含的默认值是数字最小的值。

在 `ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` 等操作中，枚举与相应的数字行为相同。例如，`ORDER BY` 按数字顺序排序。相等和比较运算符在枚举上的行为与在其底层数值上的行为相同。

枚举值不能与数字进行比较。枚举可以与常量字符串进行比较。如果与之比较的字符串不是有效的 `Enum` 值，将抛出异常。支持在左侧使用 `Enum` 和在右侧使用字符串集合的 IN 运算符。这些字符串是相应 `Enum` 的值。

对于枚举值，大多数数值和字符串操作未定义，例如将数字加到枚举上或将字符串拼接到枚举上。
然而，枚举有一个自然的 `toString` 函数，该函数返回其字符串值。

枚举值还可以使用 `toT` 函数转换为数值类型，其中 T 是数值类型。当 T 与枚举的底层数值类型相对应时，此转换无成本。
使用 ALTER，更改枚举类型而不增加成本是可能的，如果仅更改值集合。可以使用 ALTER 同时添加和删除枚举成员（删除操作只有在所删除的值从未在表中使用过时才是安全的）。作为一种保护措施，更改之前定义的枚举成员的数值将抛出异常。

使用 ALTER，可以将 Enum8 更改为 Enum16，反之亦然，就像将 Int8 更改为 Int16 一样。
