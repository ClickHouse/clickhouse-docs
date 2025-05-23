---
'description': 'Documentation for Comparison Functions'
'sidebar_label': 'Comparison'
'sidebar_position': 35
'slug': '/sql-reference/functions/comparison-functions'
'title': '比较函数'
---


# 比较函数

下面的比较函数返回 `0` 或 `1`，类型为 [UInt8](/sql-reference/data-types/int-uint)。只有同一组内的值可以进行比较（例如 `UInt16` 和 `UInt64`），但不可以跨组比较（例如 `UInt16` 和 `DateTime`）。数字和字符串的比较是可能的，字符串与日期以及日期与时间之间的比较亦是如此。对于元组和数组，比较是按字典顺序进行的，这意味着比较是针对左侧和右侧元组/数组的每个对应元素进行的。

可以比较的类型有：
- 数字和小数
- 字符串和固定字符串
- 日期
- 带时间的日期
- 元组（字典顺序比较）
- 数组（字典顺序比较）

:::note
字符串是按字节逐字节进行比较的。如果其中一个字符串包含 UTF-8 编码的多字节字符，这可能会导致意外结果。
一个字符串 S1 如果以另一个字符串 S2 为前缀，则被认为比 S2 更长。
:::

## equals, `=`, `==` 操作符 {#equals}

**语法**

```sql
equals(a, b)
```

别名：
- `a = b`（操作符）
- `a == b`（操作符）

## notEquals, `!=`, `<>` 操作符 {#notequals}

**语法**

```sql
notEquals(a, b)
```

别名：
- `a != b`（操作符）
- `a <> b`（操作符）

## less, `<` 操作符 {#less}

**语法**

```sql
less(a, b)
```

别名：
- `a < b`（操作符）

## greater, `>` 操作符 {#greater}

**语法**

```sql
greater(a, b)
```

别名：
- `a > b`（操作符）

## lessOrEquals, `<=` 操作符 {#lessorequals}

**语法**

```sql
lessOrEquals(a, b)
```

别名：
- `a <= b`（操作符）

## greaterOrEquals, `>=` 操作符 {#greaterorequals}

**语法**

```sql
greaterOrEquals(a, b)
```

别名：
- `a >= b`（操作符）
