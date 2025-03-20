---
slug: /sql-reference/functions/comparison-functions
sidebar_position: 35
sidebar_label: 比较
---


# 比较函数

下面的比较函数返回 `0` 或 `1`，类型为 [UInt8](/sql-reference/data-types/int-uint)。只有同一组内的值可以比较（例如 `UInt16` 和 `UInt64`），而不能跨组比较（例如 `UInt16` 和 `DateTime`）。数字与字符串的比较是可能的，字符串与日期的比较以及日期与时间的比较也是可以的。对于元组和数组，比较是按字典序进行的，即比较是针对左侧和右侧元组/数组的每个对应元素进行的。

以下类型可以进行比较：
- 数字和小数
- 字符串和固定字符串
- 日期
- 带时间的日期
- 元组（字典序比较）
- 数组（字典序比较）

:::note
字符串是逐字节比较的。如果字符串之一包含 UTF-8 编码的多字节字符，这可能会导致意外结果。
字符串 S1 如果以另一个字符串 S2 为前缀，则被认为比 S2 更长。
:::

## equals, `=`, `==` 运算符 {#equals}

**语法**

```sql
equals(a, b)
```

别名：
- `a = b`（运算符）
- `a == b`（运算符）

## notEquals, `!=`, `<>` 运算符 {#notequals}

**语法**

```sql
notEquals(a, b)
```

别名：
- `a != b`（运算符）
- `a <> b`（运算符）

## less, `<` 运算符 {#less}

**语法**

```sql
less(a, b)
```

别名：
- `a < b`（运算符）

## greater, `>` 运算符 {#greater}

**语法**

```sql
greater(a, b)
```

别名：
- `a > b`（运算符）

## lessOrEquals, `<=` 运算符 {#lessorequals}

**语法**

```sql
lessOrEquals(a, b)
```

别名：
- `a <= b`（运算符）

## greaterOrEquals, `>=` 运算符 {#greaterorequals}

**语法**

```sql
greaterOrEquals(a, b)
```

别名：
- `a >= b`（运算符）
