---
'description': 'ClickHouse 中 FixedString 数据类型的文档'
'sidebar_label': 'FixedString(N)'
'sidebar_position': 10
'slug': '/sql-reference/data-types/fixedstring'
'title': 'FixedString(N)'
---


# FixedString(N)

一个长度为 `N` 字节的固定长度字符串（既不是字符也不是代码点）。

要声明一个 `FixedString` 类型的列，请使用以下语法：

```sql
<column_name> FixedString(N)
```

其中 `N` 是一个自然数。

当数据的长度恰好为 `N` 字节时，`FixedString` 类型是高效的。在所有其他情况下，它可能会降低效率。

可以高效存储在 `FixedString` 类型列中的值示例：

- IP 地址的二进制表示（`FixedString(16)` 用于 IPv6）。
- 语言代码（ru_RU, en_US ...）。
- 货币代码（USD, RUB ...）。
- 哈希的二进制表示（`FixedString(16)` 用于 MD5，`FixedString(32)` 用于 SHA256）。

要存储 UUID 值，请使用 [UUID](../../sql-reference/data-types/uuid.md) 数据类型。

在插入数据时，ClickHouse：

- 如果字符串少于 `N` 字节，则用空字节补充字符串。
- 如果字符串超过 `N` 字节，则抛出 `Too large value for FixedString(N)` 异常。

在选择数据时，ClickHouse 不会移除字符串末尾的空字节。如果使用 `WHERE` 子句，则应手动添加空字节以匹配 `FixedString` 值。以下示例说明了如何使用带有 `FixedString` 的 `WHERE` 子句。

让我们考虑以下只有单个 `FixedString(2)` 列的表：

```text
┌─name──┐
│ b     │
└───────┘
```

查询 `SELECT * FROM FixedStringTable WHERE a = 'b'` 不会返回任何数据作为结果。我们应该用空字节来补充过滤模式。

```sql
SELECT * FROM FixedStringTable
WHERE a = 'b\0'
```

```text
┌─a─┐
│ b │
└───┘
```

这种行为与 MySQL 的 `CHAR` 类型不同（在 MySQL 中，字符串用空格填充，并且输出时空格会被移除）。

请注意，`FixedString(N)` 值的长度是恒定的。即使 `FixedString(N)` 值仅用空字节填充，[length](/sql-reference/functions/array-functions#length) 函数仍会返回 `N`，但 [empty](../../sql-reference/functions/string-functions.md#empty) 函数在这种情况下会返回 `1`。
