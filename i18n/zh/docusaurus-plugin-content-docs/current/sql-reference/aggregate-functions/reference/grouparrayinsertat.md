---
description: '在指定位置向数组中插入值。'
sidebar_position: 140
slug: /sql-reference/aggregate-functions/reference/grouparrayinsertat
title: 'groupArrayInsertAt'
doc_type: 'reference'
---

# groupArrayInsertAt

在数组的指定位置插入一个值。

**语法**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

如果在一个查询中将多个值插入到同一位置，函数的行为如下：

* 如果查询在单线程中执行，将使用第一个插入的值。
* 如果查询在多线程中执行，结果值将是不确定的某个插入值。

**参数**

* `x` — 要插入的值。[表达式](/sql-reference/syntax#expressions)，其结果为某种[支持的数据类型](../../../sql-reference/data-types/index.md)。
* `pos` — 要将指定元素 `x` 插入到的位置。数组的索引从零开始计数。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。
* `default_x` — 用于填充空位置的默认值。可选参数。[表达式](/sql-reference/syntax#expressions)，其结果的数据类型应与参数 `x` 配置的类型一致。如果未定义 `default_x`，则使用[默认值](/sql-reference/statements/create/table)。
* `size` — 结果数组的长度。可选参数。使用该参数时，必须指定默认值 `default_x`。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。

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

多线程向同一位置插入多个元素。

查询：

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

该查询会返回一个位于 `[0,9]` 范围内的随机整数。例如：

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
