---
'description': '创建样本参数值数组。 结果数组的大小限制为`max_size`元素。 参数值是随机选择并添加到数组中。'
'sidebar_position': 145
'slug': '/sql-reference/aggregate-functions/reference/grouparraysample'
'title': 'groupArraySample'
---




# groupArraySample

创建一个样本参数值的数组。生成数组的大小限制为 `max_size` 个元素。参数值是随机选择并添加到数组中的。

**语法**

```sql
groupArraySample(max_size[, seed])(x)
```

**参数**

- `max_size` — 生成数组的最大大小。 [UInt64](../../data-types/int-uint.md)。
- `seed` — 随机数生成器的种子。可选。 [UInt64](../../data-types/int-uint.md)。 默认值： `123456`。
- `x` — 参数（列名或表达式）。

**返回值**

- 随机选择的 `x` 参数的数组。

类型：[Array](../../data-types/array.md)。

**示例**

考虑表 `colors`：

```text
┌─id─┬─color──┐
│  1 │ red    │
│  2 │ blue   │
│  3 │ green  │
│  4 │ white  │
│  5 │ orange │
└────┴────────┘
```

将列名作为参数的查询：

```sql
SELECT groupArraySample(3)(color) as newcolors FROM colors;
```

结果：

```text
┌─newcolors──────────────────┐
│ ['white','blue','green']   │
└────────────────────────────┘
```

将列名和不同种子作为参数的查询：

```sql
SELECT groupArraySample(3, 987654321)(color) as newcolors FROM colors;
```

结果：

```text
┌─newcolors──────────────────┐
│ ['red','orange','green']   │
└────────────────────────────┘
```

将表达式作为参数的查询：

```sql
SELECT groupArraySample(3)(concat('light-', color)) as newcolors FROM colors;
```

结果：

```text
┌─newcolors───────────────────────────────────┐
│ ['light-blue','light-orange','light-green'] │
└─────────────────────────────────────────────┘
```
