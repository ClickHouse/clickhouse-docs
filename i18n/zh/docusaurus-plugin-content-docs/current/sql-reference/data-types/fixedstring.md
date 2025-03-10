---
slug: /sql-reference/data-types/fixedstring
sidebar_position: 10
sidebar_label: 固定长度字符串 (FixedString(N))
---


# 固定长度字符串 (FixedString(N))

长度为 `N` 字节的固定长度字符串（既不是字符也不是代码点）。

要声明一个 `FixedString` 类型的列，请使用以下语法：

``` sql
<column_name> FixedString(N)
```

其中 `N` 是一个自然数。

当数据长度恰好为 `N` 字节时，`FixedString` 类型是高效的。在所有其他情况下，它可能会降低效率。

可以有效存储在 `FixedString` 类型列中的值的示例：

- IP 地址的二进制表示（IPv6 使用 `FixedString(16)`）。
- 语言代码（比如 ru_RU, en_US ...）。
- 货币代码（比如 USD, RUB ...）。
- 哈希的二进制表示（MD5 使用 `FixedString(16)`，SHA256 使用 `FixedString(32)`）。

要存储 UUID 值，请使用 [UUID](../../sql-reference/data-types/uuid.md) 数据类型。

在插入数据时，ClickHouse 会：

- 如果字符串的字节数少于 `N`，则用空字节补全字符串。
- 如果字符串的字节数超过 `N`，则抛出 `Too large value for FixedString(N)` 异常。

在选择数据时，ClickHouse 不会去除字符串末尾的空字节。如果使用 `WHERE` 子句，应手动添加空字节以匹配 `FixedString` 值。以下示例说明了如何使用 `WHERE` 子句与 `FixedString`。

我们考虑以下只有一个 `FixedString(2)` 列的表：

``` text
┌─name──┐
│ b     │
└───────┘
```

查询 `SELECT * FROM FixedStringTable WHERE a = 'b'` 不返回任何数据作为结果。我们应该用空字节补全过滤模式。

``` sql
SELECT * FROM FixedStringTable
WHERE a = 'b\0'
```

``` text
┌─a─┐
│ b │
└───┘
```

这种行为与 MySQL 对 `CHAR` 类型的处理不同（在 MySQL 中，字符串填充空格，并且输出时会移除空格）。

请注意，`FixedString(N)` 值的长度是固定的。即使 `FixedString(N)` 值仅填充了空字节， [length](/sql-reference/functions/array-functions#length) 函数仍返回 `N`，但是 [empty](../../sql-reference/functions/string-functions.md#empty) 函数在这种情况下返回 `1`。
