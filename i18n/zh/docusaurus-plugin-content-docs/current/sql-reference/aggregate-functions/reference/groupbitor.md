---
description: '对一系列数字进行按位 `OR` 运算。'
sidebar_position: 152
slug: /sql-reference/aggregate-functions/reference/groupbitor
title: 'groupBitOr'
doc_type: 'reference'
---

# groupBitOr {#groupbitor}

对一系列数字执行按位 `OR` 运算。

```sql
groupBitOr(expr)
```

**参数**

`expr` – 其结果为 `UInt*` 或 `Int*` 类型的表达式。

**返回值**

`UInt*` 或 `Int*` 类型的值。

**示例**

测试数据：

```text
binary     decimal
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

查询：

```sql
SELECT groupBitOr(num) FROM t
```

其中 `num` 是测试数据所在的列。

结果：

```text
binary     decimal
01111101 = 125
```
