---
'description': 'ClickHouse 中 Enum 数据类型的文档，表示一组命名常量值'
'sidebar_label': 'Enum'
'sidebar_position': 20
'slug': '/sql-reference/data-types/enum'
'title': 'Enum'
'doc_type': 'reference'
---


# Enum

枚举类型由命名值组成。

命名值可以声明为 `'string' = integer` 对或 `'string'` 名称。 ClickHouse 仅存储数字，但通过其名称支持对值的操作。

ClickHouse 支持：

- 8位 `Enum`。它最多可以包含 256 个值，枚举范围为 `[-128, 127]`。
- 16位 `Enum`。它最多可以包含 65536 个值，枚举范围为 `[-32768, 32767]`。

ClickHouse 在插入数据时自动选择 `Enum` 的类型。您也可以使用 `Enum8` 或 `Enum16` 类型来确保存储的大小。

## Usage Examples {#usage-examples}

在这里，我们创建一个具有 `Enum8('hello' = 1, 'world' = 2)` 类型列的表：

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同样，您可以省略数字。 ClickHouse 会自动分配连续的数字。 默认情况下，数字从 1 开始分配。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

您还可以为第一个名称指定合法的起始数字。

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

列 `x` 只能存储类型定义中列出的值：`'hello'` 或 `'world'`。如果您尝试保存任何其他值，ClickHouse 将引发异常。此 `Enum` 的 8 位大小自动选择。

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

当您查询表中的数据时，ClickHouse 输出 `Enum` 的字符串值。

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

如果您需要查看行的数字对应值，您必须将 `Enum` 值强制转换为整数类型。

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

要在查询中创建 `Enum` 值，您还需要使用 `CAST`。

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## General Rules and Usage {#general-rules-and-usage}

每个值在 `Enum8` 的范围 `-128 ... 127` 或 `Enum16` 的范围 `-32768 ... 32767` 内分配一个数字。所有字符串和数字必须不同。允许为空字符串。如果此类型在表定义中指定，则数字可以以任意顺序出现。然而，顺序无关紧要。

`Enum` 中的字符串和值都不能为 [NULL](../../sql-reference/syntax.md)。

`Enum` 可以包含在 [Nullable](../../sql-reference/data-types/nullable.md) 类型中。因此，如果您使用查询创建一个表

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

它不仅可以存储 `'hello'` 和 `'world'`，还可以存储 `NULL`。

```sql
INSERT INTO t_enum_nullable VALUES('hello'),('world'),(NULL)
```

在 RAM 中，`Enum` 列的存储方式与相应数值的 `Int8` 或 `Int16` 相同。

以文本形式读取时，ClickHouse 将值解析为字符串并搜索与枚举值集中的相应字符串。如果没有找到，将引发异常。在读取文本格式时，字符串被读取，相应的数字值被查找。如果未找到，将抛出异常。
以文本形式写入时，写入其对应的字符串值。如果列数据包含垃圾（不在有效集合中的数字），则会引发异常。在以二进制形式读取和写入时，工作方式与 Int8 和 Int16 数据类型相同。
隐式默认值是最低数字值。

在 `ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` 等操作中，枚举的行为与相应数字相同。例如，ORDER BY 按数字排序。相等和比较运算符在枚举上的工作方式与在底层数字值上的工作方式相同。

枚举值不能与数字进行比较。枚举可以与常量字符串进行比较。如果比较的字符串不是枚举的有效值，将引发异常。支持将枚举放在左侧，字符串集合放在右侧的 IN 运算符。这些字符串是相应枚举的值。

大多数数字和字符串操作不适用于枚举值，例如将数字添加到枚举或将字符串连接到枚举。
但是，枚举具有自然的 `toString` 函数，返回其字符串值。

枚举值还可以使用 `toT` 函数转换为数值类型，其中 T 是数值类型。当 T 对应于枚举的底层数值类型时，该转换是零成本的。
如果仅更改值集合，则可以使用 ALTER 无成本地更改枚举类型。可以使用 ALTER 添加和移除枚举成员（移除是安全的，仅当被移除的值从未在表中使用）。作为安全措施，更改先前定义的枚举成员的数值将引发异常。

使用 ALTER，可以将 Enum8 更改为 Enum16，反之亦然，就像将 Int8 更改为 Int16 一样。
