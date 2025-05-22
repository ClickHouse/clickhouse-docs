
# Enum

枚举类型，由命名值组成。

命名值可以被声明为 `'string' = integer` 对或仅为 `'string'` 名称。 ClickHouse 只存储数字，但通过其名称支持对值的操作。

ClickHouse 支持：

- 8位 `Enum`。它最多可以包含 `[-128, 127]` 范围内的256个值。
- 16位 `Enum`。它最多可以包含 `[-32768, 32767]` 范围内的65536个值。

ClickHouse 在数据插入时自动选择 `Enum` 的类型。您也可以使用 `Enum8` 或 `Enum16` 类型以确保存储的大小。

## Usage Examples {#usage-examples}

在这里，我们创建一个具有 `Enum8('hello' = 1, 'world' = 2)` 类型列的表：

```sql
CREATE TABLE t_enum
(
    x Enum('hello' = 1, 'world' = 2)
)
ENGINE = TinyLog
```

同样，您可以省略数字。 ClickHouse 会自动分配连续的数字。默认情况下，从1开始分配数字。

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

列 `x` 只能存储在类型定义中列出的值：`'hello'` 或 `'world'`。如果您尝试保存任何其他值，ClickHouse 将引发异常。此 `Enum` 的8位大小是自动选择的。

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

当您从表中查询数据时，ClickHouse 输出来自 `Enum` 的字符串值。

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

如果您需要查看行的数字等效，您必须将 `Enum` 值转换为整数类型。

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

## General Rules and Usage {#general-rules-and-usage}

每个值在 `Enum8` 中的范围是 `-128 ... 127` 或在 `Enum16` 中的范围是 `-32768 ... 32767`。所有的字符串和数字必须是不同的。允许使用空字符串。如果在表定义中指定了这个类型，数字可以是任意顺序的。但是，顺序并不重要。

在 `Enum` 中，字符串和值都不能是 [NULL](../../sql-reference/syntax.md)。

一个 `Enum` 可以包含在 [Nullable](../../sql-reference/data-types/nullable.md) 类型中。因此，如果您使用查询创建一个表

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

在内存中，`Enum` 列的存储方式与相应数值的 `Int8` 或 `Int16` 相同。

以文本格式读取时，ClickHouse 将值解析为字符串并从 Enum 值的集合中查找相应的字符串。如果未找到，则会引发异常。在以文本格式读取时，字符串被读取并查找相应的数值。如果未找到，将抛出异常。在以文本形式写入时，它将值写入为相应的字符串。如果列数据包含无效数据（不在有效集合中的数字），将抛出异常。在以二进制形式读取和写入时，其操作与 Int8 和 Int16 数据类型相同。
隐式默认值是数值最低的值。

在 `ORDER BY`、`GROUP BY`、`IN`、`DISTINCT` 等过程中，Enum 行为与相应的数字相同。例如，ORDER BY 按照数字排序。等式和比较运算符在 Enum 上的工作方式与在其基础数值上的工作方式相同。

Enum 值不能与数字进行比较。Enum 可以与常量字符串进行比较。如果与之比较的字符串不是 Enum 的有效值，将抛出异常。支持在左侧使用 Enum 和右侧使用字符串集合的 IN 运算符。字符串是相应 Enum 的值。

大多数数字和字符串操作并未为 Enum 值定义，例如将数字加到 Enum 或将字符串连接到 Enum。
然而，Enum 具有自然的 `toString` 函数，返回其字符串值。

Enum 值也可以使用 `toT` 函数转换为数值类型，其中 T 为数值类型。当 T 与枚举的基础数值类型相对应时，该转换是零成本的。
如果仅改变值的集合，可以使用 ALTER 在不产生成本的情况下更改 Enum 类型。可以使用 ALTER 添加和删除 Enum 的成员（删除是安全的，只有在被删除的值从未在表中使用时）。作为保护，改变先前定义的 Enum 成员的数值将引发异常。

使用 ALTER，可以将 Enum8 更改为 Enum16 或反之，类似于将 Int8 更改为 Int16。
