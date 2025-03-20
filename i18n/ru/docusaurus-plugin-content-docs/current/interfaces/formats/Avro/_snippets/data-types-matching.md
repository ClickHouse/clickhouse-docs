
Таблица ниже показывает все поддерживаемые типы данных формата Apache Avro и соответствующие типы данных ClickHouse в `INSERT` и `SELECT` запросах.

| Avro тип данных `INSERT`                     | ClickHouse тип данных                                                                                                       | Avro тип данных `SELECT`         |
|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|---------------------------------|
| `boolean`, `int`, `long`, `float`, `double` | [Int(8\16\32)](/sql-reference/data-types/int-uint.md), [UInt(8\16\32)](/sql-reference/data-types/int-uint.md) | `int`                           |
| `boolean`, `int`, `long`, `float`, `double` | [Int64](/sql-reference/data-types/int-uint.md), [UInt64](/sql-reference/data-types/int-uint.md)               | `long`                          |
| `boolean`, `int`, `long`, `float`, `double` | [Float32](/sql-reference/data-types/float.md)                                                                          | `float`                         |
| `boolean`, `int`, `long`, `float`, `double` | [Float64](/sql-reference/data-types/float.md)                                                                          | `double`                        |
| `bytes`, `string`, `fixed`, `enum`          | [String](/sql-reference/data-types/string.md)                                                                          | `bytes` или `string` \*        |
| `bytes`, `string`, `fixed`                  | [FixedString(N)](/sql-reference/data-types/fixedstring.md)                                                             | `fixed(N)`                      |
| `enum`                                      | [Enum(8\16)](/sql-reference/data-types/enum.md)                                                                        | `enum`                          |
| `array(T)`                                  | [Array(T)](/sql-reference/data-types/array.md)                                                                         | `array(T)`                      |
| `map(V, K)`                                 | [Map(V, K)](/sql-reference/data-types/map.md)                                                                          | `map(string, K)`                |
| `union(null, T)`, `union(T, null)`          | [Nullable(T)](/sql-reference/data-types/date.md)                                                                       | `union(null, T)`                |
| `union(T1, T2, …)` \**                      | [Variant(T1, T2, …)](/sql-reference/data-types/variant.md)                                                            | `union(T1, T2, …)` \**          |
| `null`                                      | [Nullable(Nothing)](/sql-reference/data-types/special-data-types/nothing.md)                                           | `null`                          |
| `int (date)` \**\*                          | [Date](/sql-reference/data-types/date.md), [Date32](/sql-reference/data-types/date32.md)                       | `int (date)` \**\*              |
| `long (timestamp-millis)` \**\*             | [DateTime64(3)](/sql-reference/data-types/datetime.md)                                                                | `long (timestamp-millis)` \**\* |
| `long (timestamp-micros)` \**\*             | [DateTime64(6)](/sql-reference/data-types/datetime.md)                                                                | `long (timestamp-micros)` \**\* |
| `bytes (decimal)`  \**\*                    | [DateTime64(N)](/sql-reference/data-types/datetime.md)                                                                | `bytes (decimal)`  \**\*        |
| `int`                                       | [IPv4](/sql-reference/data-types/ipv4.md)                                                                             | `int`                           |
| `fixed(16)`                                 | [IPv6](/sql-reference/data-types/ipv6.md)                                                                             | `fixed(16)`                     |
| `bytes (decimal)` \**\*                     | [Decimal(P, S)](/sql-reference/data-types/decimal.md)                                                                  | `bytes (decimal)` \**\*         |
| `string (uuid)` \**\*                       | [UUID](/sql-reference/data-types/uuid.md)                                                                             | `string (uuid)` \**\*           |
| `fixed(16)`                                 | [Int128/UInt128](/sql-reference/data-types/int-uint.md)                                                               | `fixed(16)`                     |
| `fixed(32)`                                 | [Int256/UInt256](/sql-reference/data-types/int-uint.md)                                                               | `fixed(32)`                     |
| `record`                                    | [Tuple](/sql-reference/data-types/tuple.md)                                                                           | `record`                        |

\* `bytes` по умолчанию, контролируется установкой [`output_format_avro_string_column_pattern`](/operations/settings/settings-formats.md/#output_format_avro_string_column_pattern)

\**  Тип [Variant](/sql-reference/data-types/variant) неявно принимает `null` как значение поля, поэтому, например, Avro `union(T1, T2, null)` будет преобразован в `Variant(T1, T2)`. В результате, при создании Avro из ClickHouse, мы всегда должны включать тип `null` в набор типов Avro `union`, так как мы не знаем, является ли любое значение на самом деле `null` во время вывода схемы.

\**\* [Логические типы Avro](https://avro.apache.org/docs/current/spec.html#Logical+Types)

Неподдерживаемые логические типы данных Avro:
- `time-millis`
- `time-micros`
- `duration`
```
