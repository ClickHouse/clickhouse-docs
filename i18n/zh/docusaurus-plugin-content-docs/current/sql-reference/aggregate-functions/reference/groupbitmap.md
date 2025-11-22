---
description: '对无符号整数列执行 Bitmap 或聚合计算，返回类型为 UInt64 的基数值；如果添加后缀 -State，则返回一个 bitmap 对象'
sidebar_position: 148
slug: /sql-reference/aggregate-functions/reference/groupbitmap
title: 'groupBitmap'
doc_type: 'reference'
---

# groupBitmap

对无符号整数列执行 Bitmap 或聚合计算，返回 UInt64 类型的基数值。如果添加后缀 -State，则返回[位图对象](../../../sql-reference/functions/bitmap-functions.md)。

```sql
groupBitmap(expr)
```

**参数**

`expr` – 其结果为 `UInt*` 类型的表达式。

**返回值**

`UInt64` 类型的值。

**示例**

测试数据：

```text
用户ID
1
1
2
3
```

查询：

```sql
SELECT groupBitmap(UserID) AS num FROM t
```

结果：

```text
num
3
```
