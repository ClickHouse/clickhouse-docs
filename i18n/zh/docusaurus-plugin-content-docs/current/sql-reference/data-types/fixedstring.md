
# FixedString(N)

固定长度字符串，长度为 `N` 字节（既不是字符也不是代码点）。

要声明一个 `FixedString` 类型的列，请使用以下语法：

```sql
<column_name> FixedString(N)
```

其中 `N` 是一个自然数。

当数据的长度恰好为 `N` 字节时，`FixedString` 类型是高效的。在其他情况下，它的效率可能会降低。

可以有效存储在 `FixedString` 类型列中的值示例：

- IP 地址的二进制表示（IPv6 的 `FixedString(16)`）。
- 语言代码（ru_RU, en_US ...）。
- 货币代码（USD, RUB ...）。
- 哈希的二进制表示（MD5 的 `FixedString(16)`，SHA256 的 `FixedString(32)`）。

要存储 UUID 值，请使用 [UUID](../../sql-reference/data-types/uuid.md) 数据类型。

在插入数据时，ClickHouse：

- 如果字符串的字节数少于 `N` 字节，则用空字节补充该字符串。
- 如果字符串的字节数超过 `N` 字节，则抛出 `Too large value for FixedString(N)` 异常。

在选择数据时，ClickHouse 不会去掉字符串末尾的空字节。如果使用 `WHERE` 子句，则应手动添加空字节以匹配 `FixedString` 值。以下示例说明了如何在与 `FixedString` 一起使用 `WHERE` 子句。

考虑以下仅有一个 `FixedString(2)` 列的表：

```text
┌─name──┐
│ b     │
└───────┘
```

查询 `SELECT * FROM FixedStringTable WHERE a = 'b'` 不会返回任何数据作为结果。我们应该用空字节补充过滤模式。

```sql
SELECT * FROM FixedStringTable
WHERE a = 'b\0'
```

```text
┌─a─┐
│ b │
└───┘
```

这种行为与 MySQL 的 `CHAR` 类型不同（在 MySQL 中，字符串用空格填充，输出时去掉空格）。

请注意，`FixedString(N)` 值的长度是恒定的。即使 `FixedString(N)` 值仅用空字节填充，[length](/sql-reference/functions/array-functions#length) 函数也会返回 `N`，但在这种情况下，[empty](../../sql-reference/functions/string-functions.md#empty) 函数会返回 `1`。
