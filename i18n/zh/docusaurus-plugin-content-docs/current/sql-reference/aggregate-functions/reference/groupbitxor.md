---
description: '对一系列数值执行按位异或（`XOR`）运算。'
sidebar_position: 153
slug: /sql-reference/aggregate-functions/reference/groupbitxor
title: 'groupBitXor'
doc_type: 'reference'
---

# groupBitXor

对一系列数字执行按位异或（`XOR`）运算。

```sql
groupBitXor(expr)
```

**参数**

`expr` – 返回 `UInt*` 或 `Int*` 类型结果的表达式。

**返回值**

返回 `UInt*` 或 `Int*` 类型的值。

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
SELECT groupBitXor(num) FROM t
```

其中 `num` 是存放测试数据的列。

结果：

```text
二进制     十进制
01101000 = 104
```
