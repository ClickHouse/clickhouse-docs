---
description: 'ClickHouse 中 Enum 数据类型的文档，该类型表示一组具名的常量值'
sidebar_label: 'Enum'
sidebar_position: 20
slug: /sql-reference/data-types/enum
title: 'Enum'
doc_type: 'reference'
---



# Enum

由具名值组成的枚举类型。

具名值可以声明为 `'string' = integer` 对，或仅使用 `'string'` 名称。ClickHouse 只存储数字，但支持通过名称对这些值进行操作。

ClickHouse 支持：

- 8 位 `Enum`，最多可以包含 256 个值，这些值在 `[-128, 127]` 范围内枚举。
- 16 位 `Enum`，最多可以包含 65536 个值，这些值在 `[-32768, 32767]` 范围内枚举。

在插入数据时，ClickHouse 会自动选择 `Enum` 的类型。也可以显式使用 `Enum8` 或 `Enum16` 类型来确定存储大小。



## 使用示例 {#usage-examples}

这里我们创建一个包含 `Enum8('hello' = 1, 'world' = 2)` 类型列的表:

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同样,您可以省略数字。ClickHouse 会自动分配连续的数字。默认情况下,数字从 1 开始分配。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

您也可以为第一个名称指定合法的起始数字。

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world')
)
ENGINE = TinyLog
```

```sql
CREATE TABLE t_enum
(
    x Enum8('hello' = -129, 'world')
)
ENGINE = TinyLog
```

```text
Exception on server:
Code: 69. DB::Exception: Value -129 for element 'hello' exceeds range of Enum8.
```

列 `x` 只能存储类型定义中列出的值:`'hello'` 或 `'world'`。如果您尝试保存任何其他值,ClickHouse 会抛出异常。此 `Enum` 的 8 位大小会自动选择。

```sql
INSERT INTO t_enum VALUES ('hello'), ('world'), ('hello')
```

```text
Ok.
```

```sql
INSERT INTO t_enum VALUES('a')
```

```text
Exception on client:
Code: 49. DB::Exception: Unknown element 'a' for type Enum('hello' = 1, 'world' = 2)
```

当您从表中查询数据时,ClickHouse 会输出 `Enum` 的字符串值。

```sql
SELECT * FROM t_enum
```

```text
┌─x─────┐
│ hello │
│ world │
│ hello │
└───────┘
```

如果您需要查看行的数值等价物,必须将 `Enum` 值转换为整数类型。

```sql
SELECT CAST(x, 'Int8') FROM t_enum
```

```text
┌─CAST(x, 'Int8')─┐
│               1 │
│               2 │
│               1 │
└─────────────────┘
```

要在查询中创建 Enum 值,您也需要使用 `CAST`。

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```


## 通用规则和用法 {#general-rules-and-usage}

每个值都会被分配一个数字,对于 `Enum8` 范围为 `-128 ... 127`,对于 `Enum16` 范围为 `-32768 ... 32767`。所有字符串和数字必须各不相同。允许使用空字符串。如果在表定义中指定了此类型,数字可以按任意顺序排列。但是,顺序并不重要。

`Enum` 中的字符串值和数值都不能为 [NULL](../../sql-reference/syntax.md)。

`Enum` 可以包含在 [Nullable](../../sql-reference/data-types/nullable.md) 类型中。因此,如果使用以下查询创建表

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

它不仅可以存储 `'hello'` 和 `'world'`,还可以存储 `NULL`。

```sql
INSERT INTO t_enum_nullable VALUES('hello'),('world'),(NULL)
```

在内存中,`Enum` 列的存储方式与相应数值的 `Int8` 或 `Int16` 相同。

以文本形式读取时,ClickHouse 将值解析为字符串,并从 Enum 值集合中搜索相应的字符串。如果未找到,则抛出异常。以文本格式读取时,会读取字符串并查找相应的数值。如果未找到,则抛出异常。
以文本形式写入时,会将值写入为相应的字符串。如果列数据包含无效内容(不属于有效集合的数字),则抛出异常。以二进制形式读取和写入时,其工作方式与 Int8 和 Int16 数据类型相同。
隐式默认值是数字最小的值。

在 `ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` 等操作中,Enum 的行为与相应的数字相同。例如,ORDER BY 按数值对它们进行排序。相等和比较运算符在 Enum 上的工作方式与在底层数值上的工作方式相同。

Enum 值不能与数字进行比较。Enum 可以与常量字符串进行比较。如果比较的字符串不是 Enum 的有效值,则会抛出异常。IN 运算符支持左侧为 Enum,右侧为字符串集合。这些字符串是相应 Enum 的值。

大多数数值和字符串操作对 Enum 值未定义,例如将数字加到 Enum 或将字符串连接到 Enum。
但是,Enum 具有一个内置的 `toString` 函数,可返回其字符串值。

Enum 值还可以使用 `toT` 函数转换为数值类型,其中 T 是数值类型。当 T 对应于枚举的底层数值类型时,此转换是零成本的。
如果仅更改值集合,可以使用 ALTER 无成本地更改 Enum 类型。可以使用 ALTER 添加和删除 Enum 成员(仅当删除的值从未在表中使用过时,删除才是安全的)。作为保护措施,更改先前定义的 Enum 成员的数值将抛出异常。

使用 ALTER,可以将 Enum8 更改为 Enum16,反之亦然,就像将 Int8 更改为 Int16 一样。
