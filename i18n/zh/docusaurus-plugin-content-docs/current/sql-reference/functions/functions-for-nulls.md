
# 处理 Nullable 值的函数

## isNull {#isnull}

返回参数是否为 [NULL](../../sql-reference/syntax.md#null)。

另见操作符 [`IS NULL`](../operators/index.md#is_null)。

**语法**

```sql
isNull(x)
```

别名: `ISNULL`。

**参数**

- `x` — 非复合数据类型的值。

**返回值**

- 如果 `x` 为 `NULL`，则返回 `1`。
- 如果 `x` 不为 `NULL`，则返回 `0`。

**示例**

表：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

查询：

```sql
SELECT x FROM t_null WHERE isNull(y);
```

结果：

```text
┌─x─┐
│ 1 │
└───┘
```

## isNullable {#isnullable}

如果列为 [Nullable](../data-types/nullable.md)（即允许 `NULL` 值），则返回 `1`，否则返回 `0`。

**语法**

```sql
isNullable(x)
```

**参数**

- `x` — 列。

**返回值**

- 如果 `x` 允许 `NULL` 值，则返回 `1`。[UInt8](../data-types/int-uint.md)。
- 如果 `x` 不允许 `NULL` 值，则返回 `0`。[UInt8](../data-types/int-uint.md)。

**示例**

查询：

```sql
CREATE TABLE tab (ordinary_col UInt32, nullable_col Nullable(UInt32)) ENGINE = Log;
INSERT INTO tab (ordinary_col, nullable_col) VALUES (1,1), (2, 2), (3,3);
SELECT isNullable(ordinary_col), isNullable(nullable_col) FROM tab;    
```

结果：

```text
   ┌───isNullable(ordinary_col)──┬───isNullable(nullable_col)──┐
1. │                           0 │                           1 │
2. │                           0 │                           1 │
3. │                           0 │                           1 │
   └─────────────────────────────┴─────────────────────────────┘
```

## isNotNull {#isnotnull}

返回参数是否不为 [NULL](/operations/settings/formats#input_format_null_as_default)。

另见操作符 [`IS NOT NULL`](../operators/index.md#is_not_null)。

```sql
isNotNull(x)
```

**参数：**

- `x` — 非复合数据类型的值。

**返回值**

- 如果 `x` 不为 `NULL`，则返回 `1`。
- 如果 `x` 为 `NULL`，则返回 `0`。

**示例**

表：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

查询：

```sql
SELECT x FROM t_null WHERE isNotNull(y);
```

结果：

```text
┌─x─┐
│ 2 │
└───┘
```

## isNotDistinctFrom {#isnotdistinctfrom}

执行安全的空值比较。用于比较包含 `NULL` 值的 JOIN 键，该值在 JOIN ON 部分中。
此函数将视为两个 `NULL` 值为相同，并将返回 `true`，这与通常的相等行为不同，在常规相等比较中，两个 `NULL` 值的比较会返回 `NULL`。

:::note
此函数是 JOIN ON 实现中使用的内部函数。请不要在查询中手动使用它。
:::

**语法**

```sql
isNotDistinctFrom(x, y)
```

**参数**

- `x` — 第一个 JOIN 键。
- `y` — 第二个 JOIN 键。

**返回值**

- 当 `x` 和 `y` 都为 `NULL` 时返回 `true`。
- 否则返回 `false`。

**示例**

有关完整示例，请参见：[JOIN 键中的 NULL 值](../../sql-reference/statements/select/join#null-values-in-join-keys)。

## isZeroOrNull {#iszeroornull}

返回参数是否为 0（零）或 [NULL](/operations/settings/formats#input_format_null_as_default)。

```sql
isZeroOrNull(x)
```

**参数：**

- `x` — 非复合数据类型的值。

**返回值**

- 如果 `x` 为 0（零）或 `NULL`，则返回 `1`。
- 否则返回 `0`。

**示例**

表：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    0 │
│ 3 │    3 │
└───┴──────┘
```

查询：

```sql
SELECT x FROM t_null WHERE isZeroOrNull(y);
```

结果：

```text
┌─x─┐
│ 1 │
│ 2 │
└───┘
```

## coalesce {#coalesce}

返回最左侧的非 `NULL` 参数。

```sql
coalesce(x,...)
```

**参数：**

- 任意数量的非复合类型参数。所有参数必须是相互兼容的数据类型。

**返回值**

- 第一个非 `NULL` 参数
- 如果所有参数均为 `NULL`，则返回 `NULL`。

**示例**

考虑一个可能指定多种联系客户方式的联系人列表。

```text
┌─name─────┬─mail─┬─phone─────┬──telegram─┐
│ client 1 │ ᴺᵁᴸᴸ │ 123-45-67 │       123 │
│ client 2 │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ      │      ᴺᵁᴸᴸ │
└──────────┴──────┴───────────┴───────────┘
```

`mail` 和 `phone` 字段为字符串类型，但 `telegram` 字段为 `UInt32`，因此需要转换为字符串。

获取客户联系列表中第一个可用的联系方式：

```sql
SELECT name, coalesce(mail, phone, CAST(telegram,'Nullable(String)')) FROM aBook;
```

```text
┌─name─────┬─coalesce(mail, phone, CAST(telegram, 'Nullable(String)'))─┐
│ client 1 │ 123-45-67                                                 │
│ client 2 │ ᴺᵁᴸᴸ                                                      │
└──────────┴───────────────────────────────────────────────────────────┘
```

## ifNull {#ifnull}

当参数为 `NULL` 时，返回替代值。

```sql
ifNull(x, alt)
```

**参数：**

- `x` — 要检查是否为 `NULL` 的值。
- `alt` — 如果 `x` 为 `NULL`，则函数返回该值。

**返回值**

- 如果 `x` 不为 `NULL`，则返回 `x`。
- 如果 `x` 为 `NULL`，则返回 `alt`。

**示例**

查询：

```sql
SELECT ifNull('a', 'b');
```

结果：

```text
┌─ifNull('a', 'b')─┐
│ a                │
└──────────────────┘
```

查询：

```sql
SELECT ifNull(NULL, 'b');
```

结果：

```text
┌─ifNull(NULL, 'b')─┐
│ b                 │
└───────────────────┘
```

## nullIf {#nullif}

如果两个参数相等，则返回 `NULL`。

```sql
nullIf(x, y)
```

**参数：**

`x`，`y` — 需要比较的值。必须是兼容的类型。

**返回值**

- 如果参数相等，则返回 `NULL`。
- 如果参数不相等，则返回 `x`。

**示例**

查询：

```sql
SELECT nullIf(1, 1);
```

结果：

```text
┌─nullIf(1, 1)─┐
│         ᴺᵁᴸᴸ │
└──────────────┘
```

查询：

```sql
SELECT nullIf(1, 2);
```

结果：

```text
┌─nullIf(1, 2)─┐
│            1 │
└──────────────┘
```

## assumeNotNull {#assumenotnull}

返回非 [Nullable](../data-types/nullable.md) 类型的对应值。如果原始值为 `NULL`，则可以返回任意结果。另见函数 `ifNull` 和 `coalesce`。

```sql
assumeNotNull(x)
```

**参数：**

- `x` — 原始值。

**返回值**

- 如果输入值不为 `NULL`，则返回非 `Nullable` 类型的输入值。
- 如果输入值为 `NULL`，则返回任意值。

**示例**

表：

```text

┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

查询：

```sql
SELECT assumeNotNull(y) FROM table;
```

结果：

```text
┌─assumeNotNull(y)─┐
│                0 │
│                3 │
└──────────────────┘
```

查询：

```sql
SELECT toTypeName(assumeNotNull(y)) FROM t_null;
```

结果：

```text
┌─toTypeName(assumeNotNull(y))─┐
│ Int8                         │
│ Int8                         │
└──────────────────────────────┘
```

## toNullable {#tonullable}

将参数类型转换为 `Nullable`。

```sql
toNullable(x)
```

**参数：**

- `x` — 非复合类型的值。

**返回值**

- 输入值，但为 `Nullable` 类型。

**示例**

查询：

```sql
SELECT toTypeName(10);
```

结果：

```text
┌─toTypeName(10)─┐
│ UInt8          │
└────────────────┘
```

查询：

```sql
SELECT toTypeName(toNullable(10));
```

结果：

```text
┌─toTypeName(toNullable(10))─┐
│ Nullable(UInt8)            │
└────────────────────────────┘
```
