---
'description': '逻辑函数文档'
'sidebar_label': '逻辑'
'sidebar_position': 110
'slug': '/sql-reference/functions/logical-functions'
'title': '逻辑函数'
---




# 逻辑函数

以下函数对任意数字类型的参数执行逻辑操作。它们返回 0 或 1，作为 [UInt8](../data-types/int-uint.md)，在某些情况下返回 `NULL`。

将零作为参数视为 `false`，非零值视为 `true`。

## and {#and}

计算两个或多个值的逻辑与。

设置 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路求值。如果启用，只有在 `(val_1 AND val_2 AND ... AND val_{i-1})` 为 `true` 时，`val_i` 才会被评估。例如，通过短路求值，当执行查询 `SELECT and(number = 2, intDiv(1, number)) FROM numbers(5)` 时，不会抛出除以零的异常。

**语法**

```sql
and(val1, val2...)
```

别名: [AND 运算符](../../sql-reference/operators/index.md#logical-and-operator)。

**参数**

- `val1, val2, ...` — 至少两个值的列表。 [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) 或 [Nullable](../data-types/nullable.md)。

**返回值**

- 如果至少一个参数评估为 `false`，则返回 `0`，
- 如果没有参数评估为 `false` 且至少一个参数为 `NULL`，则返回 `NULL`，
- 否则返回 `1`。

类型: [UInt8](../../sql-reference/data-types/int-uint.md) 或 [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**示例**

```sql
SELECT and(0, 1, -2);
```

结果:

```text
┌─and(0, 1, -2)─┐
│             0 │
└───────────────┘
```

与 `NULL`：

```sql
SELECT and(NULL, 1, 10, -2);
```

结果:

```text
┌─and(NULL, 1, 10, -2)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```

## or {#or}

计算两个或多个值的逻辑或。

设置 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路求值。如果启用，只有在 `((NOT val_1) AND (NOT val_2) AND ... AND (NOT val_{i-1}))` 为 `true` 时，`val_i` 才会被评估。例如，通过短路求值，当执行查询 `SELECT or(number = 0, intDiv(1, number) != 0) FROM numbers(5)` 时，不会抛出除以零的异常。

**语法**

```sql
or(val1, val2...)
```

别名: [OR 运算符](../../sql-reference/operators/index.md#logical-or-operator)。

**参数**

- `val1, val2, ...` — 至少两个值的列表。 [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) 或 [Nullable](../data-types/nullable.md)。

**返回值**

- 如果至少一个参数评估为 `true`，则返回 `1`，
- 如果所有参数均评估为 `false`，则返回 `0`，
- 如果所有参数均评估为 `false` 且至少一个参数为 `NULL`，则返回 `NULL`。

类型: [UInt8](../../sql-reference/data-types/int-uint.md) 或 [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**示例**

```sql
SELECT or(1, 0, 0, 2, NULL);
```

结果:

```text
┌─or(1, 0, 0, 2, NULL)─┐
│                    1 │
└──────────────────────┘
```

与 `NULL`：

```sql
SELECT or(0, NULL);
```

结果:

```text
┌─or(0, NULL)─┐
│        ᴺᵁᴸᴸ │
└─────────────┘
```

## not {#not}

计算值的逻辑非。

**语法**

```sql
not(val);
```

别名: [否定运算符](../../sql-reference/operators/index.md#logical-negation-operator)。

**参数**

- `val` — 值。 [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) 或 [Nullable](../data-types/nullable.md)。

**返回值**

- 如果 `val` 评估为 `false`，则返回 `1`，
- 如果 `val` 评估为 `true`，则返回 `0`，
- 如果 `val` 为 `NULL`，则返回 `NULL`。

类型: [UInt8](../../sql-reference/data-types/int-uint.md) 或 [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**示例**

```sql
SELECT NOT(1);
```

结果:

```test
┌─not(1)─┐
│      0 │
└────────┘
```

## xor {#xor}

计算两个或多个值的逻辑异或。对于多个输入值，该函数首先对前两个值进行异或运算，然后将结果与第三个值进行异或，以此类推。

**语法**

```sql
xor(val1, val2...)
```

**参数**

- `val1, val2, ...` — 至少两个值的列表。 [Int](../data-types/int-uint.md), [UInt](../data-types/int-uint.md), [Float](../data-types/float.md) 或 [Nullable](../data-types/nullable.md)。

**返回值**

- 对于两个值：如果一个值评估为 `false` 而另一个值不评估为 `false`，则返回 `1`，
- 对于两个值：如果两个值均评估为 `false` 或均评估为 `true`，则返回 `0`，
- 如果至少一个输入为 `NULL`，则返回 `NULL`。

类型: [UInt8](../../sql-reference/data-types/int-uint.md) 或 [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**示例**

```sql
SELECT xor(0, 1, 1);
```

结果:

```text
┌─xor(0, 1, 1)─┐
│            0 │
└──────────────┘
```
