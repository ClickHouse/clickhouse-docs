---
description: 'ClickHouse 中 Enum 数据类型的文档，用于表示一组具名常量值'
sidebar_label: 'Enum'
sidebar_position: 20
slug: /sql-reference/data-types/enum
title: 'Enum'
doc_type: 'reference'
---

# Enum {#enum}

由具名值组成的枚举类型。

具名值可以声明为 `'string' = integer` 键值对，或仅声明为 `'string'` 名称。ClickHouse 只存储数字，但支持通过名称对这些值进行操作。

ClickHouse 支持：

* 8 位 `Enum`，最多可以包含 256 个值，枚举范围为 `[-128, 127]`。
* 16 位 `Enum`，最多可以包含 65536 个值，枚举范围为 `[-32768, 32767]`。

在插入数据时，ClickHouse 会自动选择 `Enum` 的类型。也可以使用 `Enum8` 或 `Enum16` 类型来确保存储大小。

## 使用示例 {#usage-examples}

这里我们创建一个表，其中包含一个类型为 `Enum8('hello' = 1, 'world' = 2)` 的列：

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同样可以省略编号。ClickHouse 会自动分配连续编号。默认情况下，从 1 开始编号。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

你也可以为第一个名称指定一个合法的起始编号。

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
服务器异常：
代码：69. DB::Exception：元素 'hello' 的值 -129 超出了 Enum8 的取值范围。
```

列 `x` 只能存储在类型定义中列出的值：`'hello'` 或 `'world'`。如果尝试保存其他任何值，ClickHouse 会引发异常。该 `Enum` 的 8 位大小是自动确定的。

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
客户端异常：
代码：49. DB::Exception：类型 Enum('hello' = 1, 'world' = 2) 的未知元素 'a'
```

当从该表查询数据时，ClickHouse 会输出 `Enum` 中的字符串值。

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

如果你需要查看这些行对应的数值表示，必须将 `Enum` 值强制转换为整数类型。

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

在查询中创建 Enum 值时，也需要使用 `CAST`。

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## 一般规则和用法 {#general-rules-and-usage}

对于 `Enum8`，每个值被分配到 `-128 ... 127` 范围内的一个数字；对于 `Enum16`，则分配到 `-32768 ... 32767` 范围内的一个数字。所有字符串和数字都必须互不相同。允许使用空字符串。如果在（表定义中）指定了这种类型，数字可以按任意顺序给出。不过，顺序并不重要。

在 `Enum` 中，字符串值和数值都不能为 [NULL](../../sql-reference/syntax.md)。

`Enum` 可以用作 [Nullable](../../sql-reference/data-types/nullable.md) 类型的内部类型。因此，如果你使用如下查询来创建一张表：

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

它不仅可以存储 `'hello'` 和 `'world'`，还可以存储 `NULL` 值。

```sql
INSERT INTO t_enum_nullable VALUES('hello'),('world'),(NULL)
```

在内存中，`Enum` 列的存储方式与对应数值的 `Int8` 或 `Int16` 相同。

以文本形式读取时，ClickHouse 会先将该值解析为字符串，并在 Enum 值集合中查找对应的字符串。如果未找到，则抛出异常。以文本格式读取时，本质上是读取字符串并查找对应的数值；如果未找到，同样会抛出异常。
以文本形式写入时，会将该值写为对应的字符串。如果列数据包含无效数据（不在合法集合中的数字），将抛出异常。以二进制形式读写时，其行为与 `Int8` 和 `Int16` 数据类型相同。
隐式默认值是数值最小的那个值。

在 `ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` 等操作期间，Enum 的行为与对应的数值相同。例如，ORDER BY 会按数值对它们进行排序。相等和比较运算符在 Enum 上的工作方式与在其底层数值上的工作方式相同。

Enum 值不能与数字进行比较。Enum 可以与常量字符串进行比较。如果用于比较的字符串不是该 Enum 的有效值，将抛出异常。`IN` 运算符支持左侧为 Enum，右侧为字符串集合。这些字符串是对应 Enum 的各个取值。

大多数数值和字符串运算对 Enum 值都是未定义的，例如，对 Enum 加上一个数字，或将字符串与 Enum 进行拼接。
不过，Enum 提供了一个内置的 `toString` 函数，该函数返回其字符串值。

Enum 值也可以使用 `toT` 函数转换为数值类型，其中 T 为某个数值类型。当 T 与 Enum 的底层数值类型相对应时，此转换是零开销的。
如果仅修改值集合，Enum 类型可以通过 ALTER 以零开销进行更改。可以使用 ALTER 添加和删除 Enum 成员（只有在某个被删除的值从未在表中使用过时，删除才是安全的）。作为保护措施，更改先前已定义 Enum 成员的数值将会抛出异常。

使用 ALTER，可以像将 `Int8` 更改为 `Int16` 一样，将 `Enum8` 更改为 `Enum16`，或反之亦然。
