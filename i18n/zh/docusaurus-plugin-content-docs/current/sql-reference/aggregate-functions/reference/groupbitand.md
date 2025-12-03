---
description: '对一组数值执行按位 `AND` 运算。'
sidebar_position: 147
slug: /sql-reference/aggregate-functions/reference/groupbitand
title: 'groupBitAnd'
doc_type: 'reference'
---

# groupBitAnd {#groupbitand}

对一系列数值执行按位 `AND` 运算。

```sql
groupBitAnd(expr)
```

**参数**

`expr` – 其计算结果为 `UInt*` 或 `Int*` 类型的表达式。

**返回值**

`UInt*` 或 `Int*` 类型的值。

**示例**

测试数据：

```text
二进制     十进制
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

查询：

```sql
SELECT groupBitAnd(num) FROM t
```

其中 `num` 是存放测试数据的列。

结果：

```text
二进制     十进制
00000100 = 4
```
