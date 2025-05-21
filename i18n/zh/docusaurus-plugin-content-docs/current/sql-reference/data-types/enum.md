---
'description': 'ClickHouse中枚举数据类型的文档，用于表示一组命名常量值。'
'sidebar_label': '枚举'
'sidebar_position': 20
'slug': '/sql-reference/data-types/enum'
'title': '枚举'
---




# 枚举 (Enum)

包含命名值的枚举类型。

命名值可以声明为 `'string' = integer` 对或仅为 `'string'` 名称。 ClickHouse 仅存储数字，但支持通过其名称对值进行操作。

ClickHouse 支持：

- 8 位 `Enum`。它最多可以包含 `[-128, 127]` 范围内的 256 个值。
- 16 位 `Enum`。它最多可以包含 `[-32768, 32767]` 范围内的 65536 个值。

ClickHouse 在插入数据时会自动选择 `Enum` 的类型。您也可以使用 `Enum8` 或 `Enum16` 类型来确保存储的大小。

## 用法示例 {#usage-examples}

在这里，我们创建一个带有 `Enum8('hello' = 1, 'world' = 2)` 类型列的表：

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同样，您可以省略数字。 ClickHouse 会自动分配连续的数字。默认情况下，数字从 1 开始分配。

```sql
CREATE TABLE t_enum
(
    x Enum('hello', 'world')
)
ENGINE = TinyLog
```

您还可以指定第一个名称的合法起始数字。

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

列 `x` 只能存储在类型定义中列出的值：`'hello'` 或 `'world'`。如果您尝试保存任何其他值，ClickHouse 将引发异常。此 `Enum` 的 8 位大小为自动选择。

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

当您从表中查询数据时，ClickHouse 输出 `Enum` 的字符串值。

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

如果您需要查看行的数字等价值，则必须将 `Enum` 值转换为整数类型。

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

要在查询中创建一个 Enum 值，您还需要使用 `CAST`。

```sql
SELECT toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))
```

```text
┌─toTypeName(CAST('a', 'Enum(\'a\' = 1, \'b\' = 2)'))─┐
│ Enum8('a' = 1, 'b' = 2)                             │
└─────────────────────────────────────────────────────┘
```

## 通用规则和用法 {#general-rules-and-usage}

每个值在 `Enum8` 中分配范围为 `-128 ... 127` 的数字，在 `Enum16` 中分配范围为 `-32768 ... 32767` 的数字。所有字符串和数字必须不同。允许空字符串。如果此类型在表定义中指定，数字可以是任意顺序。然而，顺序并不重要。

在 `Enum` 中，字符串或数字值不能是 [NULL](../../sql-reference/syntax.md)。

`Enum` 可以包含在 [Nullable](../../sql-reference/data-types/nullable.md) 类型中。因此，如果您使用查询创建表

```sql
CREATE TABLE t_enum_nullable
(
    x Nullable( Enum8('hello' = 1, 'world' = 2) )
)
ENGINE = TinyLog
```

它不仅可以存储 `'hello'` 和 `'world'`，还可以存储 `NULL`。

```sql
INSERT INTO t_enum_nullable Values('hello'),('world'),(NULL)
```

在内存中，`Enum` 列以与相应数字值的 `Int8` 或 `Int16` 相同的方式存储。

以文本形式读取时，ClickHouse 会将值解析为字符串，并在 Enum 值的集合中搜索相应的字符串。如果未找到，则引发异常。以文本格式读取时，字符串被读取并查找相应的数字值。如果没有找到，将引发异常。
以文本形式写入时，它将值写为相应的字符串。如果列数据包含垃圾（不在有效集合中的数字），则将引发异常。以二进制形式读取和写入时，它的工作方式与 Int8 和 Int16 数据类型相同。
隐式默认值是数字最低的值。

在 `ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` 等操作中，Enums 的行为与相应数字相同。例如，ORDER BY 以数字方式对它们进行排序。相等和比较运算符在 Enums 上的工作方式与在其底层数字值上相同。

Enum 值不能与数字进行比较。Enums 可以与常量字符串进行比较。如果比较的字符串不是 Enum 的有效值，则将引发异常。支持左侧为 Enum，右侧为字符串集合的 IN 操作符。这些字符串是相应 Enum 的值。

大多数数字和字符串操作未定义于 Enum 值，例如将数字添加到 Enum 或将字符串连接到 Enum。
然而，Enum 具有自然的 `toString` 函数，返回其字符串值。

Enum 值也可以使用 `toT` 函数转换为数字类型，其中 T 是数字类型。当 T 与 Enum 的底层数字类型对应时，此转换是零成本的。
使用 ALTER 可以无成本更改 Enum 类型，仅在值集合发生更改时。可以通过 ALTER 添加和删除 Enum 成员（删除操作只有在被删除的值从未在表中使用过时才安全）。作为一个保障，改变先前定义的 Enum 成员的数字值将引发异常。

使用 ALTER，可以将 Enum8 更改为 Enum16 或反之亦然，就像将 Int8 更改为 Int16 一样。
