---
slug: /sql-reference/functions/logical-functions
sidebar_position: 110
sidebar_label: 逻辑
---


# 逻辑函数

以下函数对任意数值类型的参数执行逻辑运算。它们返回 0 或 1 作为 [UInt8](../data-types/int-uint.md) 或在某些情况下返回 `NULL`。

零作为参数被视为 `false`，非零值被视为 `true`。

## and {#and}

计算两个或更多值的逻辑合取。

设置 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路求值。如果启用，`val_i` 仅在 `(val_1 AND val_2 AND ... AND val_{i-1})` 为 `true` 时评估。例如，使用短路求值时，执行查询 `SELECT and(number = 2, intDiv(1, number)) FROM numbers(5)` 时不会抛出除以零异常。

**语法**

``` sql
and(val1, val2...)
```

别名：The [AND operator](../../sql-reference/operators/index.md#logical-and-operator)。

**参数**

- `val1, val2, ...` — 至少两个值的列表。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Nullable](../data-types/nullable.md)。

**返回值**

- `0`，如果至少一个参数评估为 `false`，
- `NULL`，如果没有参数评估为 `false` 且至少一个参数为 `NULL`，
- `1`，否则。

类型：[UInt8](../../sql-reference/data-types/int-uint.md) 或 [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**示例**

``` sql
SELECT and(0, 1, -2);
```

结果：

``` text
┌─and(0, 1, -2)─┐
│             0 │
└───────────────┘
```

带 `NULL`：

``` sql
SELECT and(NULL, 1, 10, -2);
```

结果：

``` text
┌─and(NULL, 1, 10, -2)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```

## or {#or}

计算两个或多个值的逻辑析取。

设置 [short_circuit_function_evaluation](/operations/settings/settings#short_circuit_function_evaluation) 控制是否使用短路求值。如果启用，`val_i` 仅在 `((NOT val_1) AND (NOT val_2) AND ... AND (NOT val_{i-1}))` 为 `true` 时评估。例如，使用短路求值时，执行查询 `SELECT or(number = 0, intDiv(1, number) != 0) FROM numbers(5)` 时不会抛出除以零异常。

**语法**

``` sql
or(val1, val2...)
```

别名：The [OR operator](../../sql-reference/operators/index.md#logical-or-operator)。

**参数**

- `val1, val2, ...` — 至少两个值的列表。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Nullable](../data-types/nullable.md)。

**返回值**

- `1`，如果至少一个参数评估为 `true`，
- `0`，如果所有参数都评估为 `false`，
- `NULL`，如果所有参数都评估为 `false` 且至少一个参数为 `NULL`。

类型：[UInt8](../../sql-reference/data-types/int-uint.md) 或 [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**示例**

``` sql
SELECT or(1, 0, 0, 2, NULL);
```

结果：

``` text
┌─or(1, 0, 0, 2, NULL)─┐
│                    1 │
└──────────────────────┘
```

带 `NULL`：

``` sql
SELECT or(0, NULL);
```

结果：

``` text
┌─or(0, NULL)─┐
│        ᴺᵁᴸᴸ │
└─────────────┘
```

## not {#not}

计算值的逻辑否定。

**语法**

``` sql
not(val);
```

别名：The [Negation operator](../../sql-reference/operators/index.md#logical-negation-operator)。

**参数**

- `val` — 值。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Nullable](../data-types/nullable.md)。

**返回值**

- `1`，如果 `val` 评估为 `false`，
- `0`，如果 `val` 评估为 `true`，
- `NULL`，如果 `val` 为 `NULL`。

类型：[UInt8](../../sql-reference/data-types/int-uint.md) 或 [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**示例**

``` sql
SELECT NOT(1);
```

结果：

``` text
┌─not(1)─┐
│      0 │
└────────┘
```

## xor {#xor}

计算两个或多个值的逻辑异或。对于两个以上的输入值，该函数首先将前两个值进行异或运算，然后依次将结果与第三个值异或，依此类推。

**语法**

``` sql
xor(val1, val2...)
```

**参数**

- `val1, val2, ...` — 至少两个值的列表。[Int](../data-types/int-uint.md)、[UInt](../data-types/int-uint.md)、[Float](../data-types/float.md) 或 [Nullable](../data-types/nullable.md)。

**返回值**

- `1`，对于两个值：如果一个值评估为 `false` 而另一个值不为 `false`，
- `0`，对于两个值：如果两个值都评估为 `false` 或都评估为 `true`，
- `NULL`，如果至少一个输入为 `NULL`。

类型：[UInt8](../../sql-reference/data-types/int-uint.md) 或 [Nullable](../../sql-reference/data-types/nullable.md)([UInt8](../../sql-reference/data-types/int-uint.md))。

**示例**

``` sql
SELECT xor(0, 1, 1);
```

结果：

``` text
┌─xor(0, 1, 1)─┐
│            0 │
└──────────────┘
```
