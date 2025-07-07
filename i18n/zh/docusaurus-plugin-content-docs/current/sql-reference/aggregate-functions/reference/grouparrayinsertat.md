---
'description': '在指定位置将值插入数组中。'
'sidebar_position': 140
'slug': '/sql-reference/aggregate-functions/reference/grouparrayinsertat'
'title': 'groupArrayInsertAt'
---


# groupArrayInsertAt

在指定位置插入一个值到数组中。

**语法**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

如果在一个查询中有多个值被插入到同一位置，此函数的行为如下：

- 如果在单线程中执行查询，则使用插入值中的第一个值。
- 如果在多线程中执行查询，则结果值是插入值中的一个未确定的值。

**参数**

- `x` — 要插入的值。 [表达式](/sql-reference/syntax#expressions)，结果为 [支持的数据类型](../../../sql-reference/data-types/index.md) 中的一种。
- `pos` — 指定元素 `x` 要插入的位置信息。数组中的索引编号从零开始。 [UInt32](/sql-reference/data-types/int-uint#integer-ranges)。
- `default_x` — 用于替代空位置的默认值。可选参数。 [表达式](/sql-reference/syntax#expressions)，结果为与 `x` 参数配置的数据类型。如果未定义 `default_x`，则使用 [默认值](/sql-reference/statements/create/table)。
- `size` — 结果数组的长度。可选参数。在使用此参数时，必须指定默认值 `default_x`。 [UInt32](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

- 包含插入值的数组。

类型: [Array](/sql-reference/data-types/array)。

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

多线程插入元素到一个位置。

查询：

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

作为此查询的结果，您会得到 `[0,9]` 范围内的随机整数。例如：

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
