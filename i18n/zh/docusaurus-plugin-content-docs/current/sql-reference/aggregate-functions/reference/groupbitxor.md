---
description: '对一系列数字应用按位 `XOR` 运算。'
sidebar_position: 153
slug: /sql-reference/aggregate-functions/reference/groupbitxor
title: 'groupBitXor'
doc_type: 'reference'
---

# groupBitXor {#groupbitxor}

对一组数值执行按位 `XOR` 运算。

```sql
groupBitXor(expr)
```

**参数**

`expr` – 结果类型为 `UInt*` 或 `Int*` 的表达式。

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
SELECT groupBitXor(num) FROM t
```

其中 `num` 是测试数据所在的列。

结果：

```text
二进制     十进制
01101000 = 104
```
