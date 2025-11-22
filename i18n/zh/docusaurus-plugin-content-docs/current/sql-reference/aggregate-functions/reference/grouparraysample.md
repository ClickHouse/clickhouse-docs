---
description: '创建一个由采样得到的参数值数组。结果数组的大小限制为最多 `max_size` 个元素。参数值将被随机选取并添加到数组中。'
sidebar_position: 145
slug: /sql-reference/aggregate-functions/reference/grouparraysample
title: 'groupArraySample'
doc_type: 'reference'
---

# groupArraySample

创建一个包含参数值样本的数组。结果数组的大小最多为 `max_size` 个元素。参数值会被随机选取并添加到数组中。

**语法**

```sql
groupArraySample(max_size[, seed])(x)
```

**参数**

* `max_size` — 结果数组的最大长度。[UInt64](../../data-types/int-uint.md)。
* `seed` — 随机数生成器的种子。可选。[UInt64](../../data-types/int-uint.md)。默认值：`123456`。
* `x` — 参数（列名或表达式）。

**返回值**

* 由随机选取的 `x` 值构成的数组。

类型：[Array](../../data-types/array.md)。

**示例**

假设有表 `colors`：

```text
┌─id─┬─color──┐
│  1 │ red    │
│  2 │ blue   │
│  3 │ green  │
│  4 │ white  │
│  5 │ orange │
└────┴────────┘
```

以列名作为参数的查询：

```sql
SELECT groupArraySample(3)(color) as newcolors FROM colors;
```

结果：

```text
┌─newcolors──────────────────┐
│ ['white','blue','green']   │
└────────────────────────────┘
```

使用列名并指定不同种子的查询：

```sql
SELECT groupArraySample(3, 987654321)(color) as newcolors FROM colors;
```

结果：

```text
┌─newcolors──────────────────┐
│ ['red','orange','green']   │
└────────────────────────────┘
```

使用表达式作为参数的查询：

```sql
SELECT groupArraySample(3)(concat('light-', color)) as newcolors FROM colors;
```

结果：

```text
┌─newcolors───────────────────────────────────┐
│ ['light-blue','light-orange','light-green'] │
└─────────────────────────────────────────────┘
```
