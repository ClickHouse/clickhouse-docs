---
'description': 'ClickHouse 中 Enum 数据类型的文档，它表示一组命名的常量值'
'sidebar_label': '枚举'
'sidebar_position': 20
'slug': '/sql-reference/data-types/enum'
'title': '枚举'
---


# Enum

枚举类型，由命名值组成。

命名值可以被声明为 `'string' = integer` 对或仅为 `'string'` 名称。 ClickHouse 仅存储数字，但通过它们的名称支持与这些值的操作。

ClickHouse 支持：

- 8位 `Enum`。它可以包含最多 256 个值，列举在 `[-128, 127]` 范围内。
- 16位 `Enum`。它可以包含最多 65536 个值，列举在 `[-32768, 32767]` 范围内。

在插入数据时，ClickHouse 自动选择 `Enum` 的类型。你也可以使用 `Enum8` 或 `Enum16` 类型以确保存储的大小。

## 使用示例 {#usage-examples}

在这里，我们创建一个具有 `Enum8('hello' = 1, 'world' = 2)` 类型列的表：

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同样，你可以省略数字。ClickHouse 会自动分配连续的数字。数字默认从 1 开始分配。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

你也可以为第一个名称指定合法的起始数字。

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

列 `x` 只能存储在类型定义中列出的值：`'hello'` 或 `'world'`。如果你尝试保存任何其他值，ClickHouse 将引发异常。此 `Enum` 的 8 位大小是自动选择的。

```sql
INSERT INTO t_enum VALUES ('hello'), ('world'), ('hello')
```

```text
Ok.
```

```sql
INSERT INTO t_enum values('a')
```

```text
Exception on client:
Code: 49. DB::Exception: Unknown element 'a' for type Enum('hello' = 1, 'world' = 2)
```

当你从表中查询数据时，ClickHouse 输出 `Enum` 的字符串值。

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

如果你需要查看行的数字等效值，必须将 `Enum` 值转换为整数类型。

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

要在查询中创建 Enum 值，你也需要使用 `CAST`。

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## 一般规则和用法 {#general-rules-and-usage}

每个值在 `Enum8` 的范围内分配一个数字 `-128 ... 127` 或在 `Enum16` 的范围内 `-32768 ... 32767`。所有字符串和数字必须是不同的。允许使用空字符串。如果该类型在表定义中被指定，数字可以是任意顺序。然而，顺序并不重要。

`Enum` 中的字符串或数值都不能为 [NULL](../../sql-reference/syntax.md)。

`Enum` 可以包含在 [Nullable](../../sql-reference/data-types/nullable.md) 类型中。因此，如果你使用查询创建一个表

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

它可以存储的不仅是 `'hello'` 和 `'world'`，还可以是 `NULL`。

```sql
INSERT INTO t_enum_nullable Values('hello'),('world'),(NULL)
```

在 RAM 中，`Enum` 列与相应数值的 `Int8` 或 `Int16` 以相同方式存储。

在以文本形式读取时，ClickHouse 将值解析为字符串并搜索与 `Enum` 值集合对应的字符串。如果未找到，则会抛出异常。在以文本格式读取时，读取字符串并查找相应的数值。如果未找到，则会抛出异常。在以文本形式写入时，将值写入为相应字符串。如果列数据包含垃圾（不是有效集合中的数字），则会抛出异常。在以二进制形式读取和写入时，行为与 Int8 和 Int16 数据类型相同。
隐式默认值是最低数字的值。

在 `ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` 等操作中，Enums 的行为与相应的数字相同。例如，ORDER BY 对它们进行数字排序。相等和比较运算符在 Enums 上的工作方式与在基础数值上一样。

Enum 值不能与数字进行比较。Enums 可以与常量字符串进行比较。如果比较的字符串不是 Enum 的有效值，则会抛出异常。支持在左侧是 Enum 而右侧是一组字符串的 IN 运算符。这些字符串是相应 Enum 的值。

大多数数字和字符串操作对 Enum 值并未定义，例如将数字添加到 Enum 或将字符串连接到 Enum。
然而，Enum 有自然的 `toString` 函数，返回其字符串值。

Enum 值也可以通过 `toT` 函数转换为数字类型，其中 T 是数字类型。当 T 与枚举的基础数字类型对应时，此转换是零成本的。
Enum 类型可以通过 ALTER 在不产生成本的情况下更改，只要仅更改值集。使用 ALTER 既可以添加也可以移除 Enum 的成员（移除是安全的，前提是被移除的值从未在表中使用过）。作为一种保护机制，更改先前定义的 Enum 成员的数字值将引发异常。

使用 ALTER，可以将 Enum8 更改为 Enum16，反之亦然，就像将 Int8 更改为 Int16 一样。
