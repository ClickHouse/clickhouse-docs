---
'description': 'Inserts a value into the array at the specified position.'
'sidebar_position': 140
'slug': '/sql-reference/aggregate-functions/reference/grouparrayinsertat'
'title': 'groupArrayInsertAt'
---




# groupArrayInsertAt

在指定位置将一个值插入到数组中。

**语法**

```sql
groupArrayInsertAt(default_x, size)(x, pos)
```

如果在一个查询中将多个值插入到同一位置，该函数的行为如下：

- 如果在单线程中执行查询，则使用插入值中的第一个。
- 如果在多线程中执行查询，则结果值是插入值中的一个，不确定是哪一个。

**参数**

- `x` — 要插入的值。 [表达式](/sql-reference/syntax#expressions)，其结果为一种 [支持的数据类型](../../../sql-reference/data-types/index.md)。
- `pos` — 指定元素 `x` 插入的位置。数组中的索引编号从零开始。 [UInt32](/sql-reference/data-types/int-uint#integer-ranges)。
- `default_x` — 用于替换空位置的默认值。可选参数。[表达式](/sql-reference/syntax#expressions)，其结果的类型与 `x` 参数配置的数据类型一致。如果未定义 `default_x`，则使用 [默认值](/sql-reference/statements/create/table)。
- `size` — 结果数组的长度。可选参数。使用此参数时，必须指定默认值 `default_x`。[UInt32](/sql-reference/data-types/int-uint#integer-ranges)。

**返回值**

- 包含插入值的数组。

类型: [数组](/sql-reference/data-types/array)。

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

多线程在一个位置插入元素。

查询：

```sql
SELECT groupArrayInsertAt(number, 0) FROM numbers_mt(10) SETTINGS max_block_size = 1;
```

作为此查询的结果，您将获得一个在 `[0,9]` 范围内的随机整数。例如：

```text
┌─groupArrayInsertAt(number, 0)─┐
│ [7]                           │
└───────────────────────────────┘
```
