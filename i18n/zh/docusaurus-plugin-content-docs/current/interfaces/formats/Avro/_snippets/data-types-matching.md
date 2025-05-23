---
null
...
---

下面的表格显示了 Apache Avro 格式支持的所有数据类型，以及它们在 `INSERT` 和 `SELECT` 查询中的对应 ClickHouse [数据类型](/sql-reference/data-types/index.md)。

| Avro 数据类型 `INSERT`                     | ClickHouse 数据类型                                                                                                          | Avro 数据类型 `SELECT`         |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|---------------------------------|
| `boolean`, `int`, `long`, `float`, `double` | [Int(8\16\32)](/sql-reference/data-types/int-uint.md), [UInt(8\16\32)](/sql-reference/data-types/int-uint.md) | `int`                           |
| `boolean`, `int`, `long`, `float`, `double` | [Int64](/sql-reference/data-types/int-uint.md), [UInt64](/sql-reference/data-types/int-uint.md)               | `long`                          |
| `boolean`, `int`, `long`, `float`, `double` | [Float32](/sql-reference/data-types/float.md)                                                                         | `float`                         |
| `boolean`, `int`, `long`, `float`, `double` | [Float64](/sql-reference/data-types/float.md)                                                                         | `double`                        |
| `bytes`, `string`, `fixed`, `enum`          | [String](/sql-reference/data-types/string.md)                                                                         | `bytes` 或 `string` \*          |
| `bytes`, `string`, `fixed`                  | [FixedString(N)](/sql-reference/data-types/fixedstring.md)                                                            | `fixed(N)`                      |
| `enum`                                      | [Enum(8\16)](/sql-reference/data-types/enum.md)                                                                       | `enum`                          |
| `array(T)`                                  | [Array(T)](/sql-reference/data-types/array.md)                                                                        | `array(T)`                      |
| `map(V, K)`                                 | [Map(V, K)](/sql-reference/data-types/map.md)                                                                         | `map(string, K)`                |
| `union(null, T)`, `union(T, null)`          | [Nullable(T)](/sql-reference/data-types/date.md)                                                                      | `union(null, T)`                |
| `union(T1, T2, …)` \**                      | [Variant(T1, T2, …)](/sql-reference/data-types/variant.md)                                                            | `union(T1, T2, …)` \**          |
| `null`                                      | [Nullable(Nothing)](/sql-reference/data-types/special-data-types/nothing.md)                                          | `null`                          |
| `int (date)` \**\*                          | [Date](/sql-reference/data-types/date.md), [Date32](/sql-reference/data-types/date32.md)                       | `int (date)` \**\*              |
| `long (timestamp-millis)` \**\*             | [DateTime64(3)](/sql-reference/data-types/datetime.md)                                                                | `long (timestamp-millis)` \**\* |
| `long (timestamp-micros)` \**\*             | [DateTime64(6)](/sql-reference/data-types/datetime.md)                                                                | `long (timestamp-micros)` \**\* |
| `bytes (decimal)`  \**\*                    | [DateTime64(N)](/sql-reference/data-types/datetime.md)                                                                | `bytes (decimal)`  \**\*        |
| `int`                                       | [IPv4](/sql-reference/data-types/ipv4.md)                                                                             | `int`                           |
| `fixed(16)`                                 | [IPv6](/sql-reference/data-types/ipv6.md)                                                                             | `fixed(16)`                     |
| `bytes (decimal)` \**\*                     | [Decimal(P, S)](/sql-reference/data-types/decimal.md)                                                                 | `bytes (decimal)` \**\*         |
| `string (uuid)` \**\*                       | [UUID](/sql-reference/data-types/uuid.md)                                                                             | `string (uuid)` \**\*           |
| `fixed(16)`                                 | [Int128/UInt128](/sql-reference/data-types/int-uint.md)                                                               | `fixed(16)`                     |
| `fixed(32)`                                 | [Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                               | `fixed(32)`                     |
| `record`                                    | [Tuple](/sql-reference/data-types/tuple.md)                                                                           | `record`                        |

\* `bytes` 是默认值，由设置 [`output_format_avro_string_column_pattern`](/operations/settings/settings-formats.md/#output_format_avro_string_column_pattern) 控制。

\**  [Variant 类型](/sql-reference/data-types/variant) 隐式接受 `null` 作为字段值，因此，例如 Avro `union(T1, T2, null)` 将被转换为 `Variant(T1, T2)`。
因此，从 ClickHouse 生成 Avro 时，我们必须始终将 `null` 类型包括到 Avro `union` 类型集中，因为我们在模式推断过程中不知道任何值是否实际上为 `null`。

\**\* [Avro 逻辑类型](https://avro.apache.org/docs/current/spec.html#Logical+Types)

不支持的 Avro 逻辑数据类型：
- `time-millis`
- `time-micros`
- `duration`
