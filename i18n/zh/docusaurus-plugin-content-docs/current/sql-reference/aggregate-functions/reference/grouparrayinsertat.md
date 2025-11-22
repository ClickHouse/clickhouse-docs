---
description: '在数组的指定位置插入一个值。'
sidebar_position: 140
slug: /sql-reference/aggregate-functions/reference/grouparrayinsertat
title: 'groupArrayInsertAt'
doc_type: 'reference'
---

# groupArrayInsertAt

在指定位置将一个值插入数组中。

**语法**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

如果在一个查询中将多个值插入到同一位置，函数的行为如下：

* 如果查询在单线程中执行，将使用插入值中的第一个。
* 如果查询在多线程中执行，结果值将是不确定的某个插入值。

**参数**

* `x` — 要插入的值。[表达式](/sql-reference/syntax#expressions)，其结果为一种[支持的数据类型](../../../sql-reference/data-types/index.md)。
* `pos` — 要插入指定元素 `x` 的位置。数组的索引编号从零开始。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。
* `default_x` — 用于替换空位置的默认值。可选参数。[表达式](/sql-reference/syntax#expressions)，其结果类型为为 `x` 参数配置的数据类型。如果未定义 `default_x`，则使用[默认值](/sql-reference/statements/create/table)。
* `size` — 结果数组的长度。可选参数。使用此参数时，必须指定默认值 `default_x`。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

* 插入了值的数组。

类型：[Array](/sql-reference/data-types/array)。

**示例**

查询：

```sql
SELECT groupArrayInsertAt(toString(number), number * 2) FROM numbers(5);
```

结果：

```text
┌─groupArrayInsertAt(toString(number), multiply(number, 2))─┐
│ ['0','','1','','2','','3','','4']                         │
└───────────────────────────────────────────────────────────┘
```

查询：

```sql
SELECT groupArrayInsertAt('-')(toString(number), number * 2) FROM numbers(5);
```

结果：

```text
┌─groupArrayInsertAt('-')(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2','-','3','-','4']                          │
└────────────────────────────────────────────────────────────────┘
```

查询：

```sql
SELECT groupArrayInsertAt('-', 5)(toString(number), number * 2) FROM numbers(5);
```

结果：

```text
┌─groupArrayInsertAt('-', 5)(toString(number), multiply(number, 2))─┐
│ ['0','-','1','-','2']                                             │
└───────────────────────────────────────────────────────────────────┘
```

多线程将多个元素插入同一位置。

查询：

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

执行此查询后，将得到一个位于 `[0,9]` 范围内的随机整数。例如：

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
