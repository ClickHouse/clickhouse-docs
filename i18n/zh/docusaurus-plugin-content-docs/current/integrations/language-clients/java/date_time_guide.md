---
sidebar_label: '在 JDBC 中处理日期和时间值'
sidebar_position: 4
keywords: ['java', 'jdbc', 'driver', '集成', '指南', 'Date', 'Time']
description: '在 JDBC 中使用日期和时间值的指南'
slug: /integrations/language-clients/java/jdbc_date_time_guide
title: '日期和时间值指南'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

# 在 JDBC 中处理 Date、Time 和 Timestamp \{#working-with-date-time-and-timestamp-in-jdbc\}

在使用 Date、Time 和 Timestamp 时需要格外注意，因为它们常常会引发一些常见问题。
最常见的问题是如何处理时区。另一个问题是字符串表示形式以及如何使用它。
除此之外，每个数据库和驱动程序都有各自的特性和限制。

本文档旨在通过描述相关任务、提供实现细节并解释其中的问题，为读者提供决策参考。

## 时区 \{#timezones\}

我们都知道，时区本身就很难处理（夏令时、时区偏移的变更等）。但本节要讨论的是与时区相关的另一类问题：时区与时间戳字符串表示之间的关系。

### ClickHouse 如何转换 DateTime 字符串 \{#clickhouse-datetime-string-conversion\}

ClickHouse 使用以下规则来转换 `DateTime` 字符串值：

- 如果列定义了时区（`DateTime64(9, 'Asia/Tokyo')`），则该字符串值会被视为该时区中的时间戳。`2026-01-01 13:00:00` 在 `UTC` 时间中将是 `2026-01-01 04:00:00`。
- 如果列没有时区定义，则只使用服务器时区。重要说明：`session_timezone` 设置不会产生影响。因此，如果服务器时区为 `UTC`，而会话时区为 `America/Los_Angeles`，那么 `2026-01-01 13:00:00` 将按 `UTC` 时间写入。
- 从没有时区定义的列中读取值时，会优先使用 `session_timezone`，如果未设置，则使用服务器时区。因此，以字符串形式读取时间戳会受到 `session_timezone` 的影响。这本身没有问题，但需要牢记这一点。

### 跨时区写入 timestamp \{#writing-timestamps-across-timezones\}

现在假设我们有一个应用运行在 `us-west` 区域，本地时区为 `UTC-8`，需要写入一个本地 timestamp `2026-01-01 02:00:00`，它在 `UTC` 下对应为 `2026-01-01 10:00:00`：

- 以字符串形式写入时，需要先将其转换为服务器时区或列时区。
- 以语言原生的时间结构写入时，要求驱动知道目标时区，但：
  - 这并不总是可行
  - 驱动 API 在这方面的设计并不理想
  - 唯一的办法是明确说明将执行哪些转换，以便应用可以进行补偿（或者将 Unix timestamp 以数值形式写入）

### Java 和 JDBC timestamp API \{#java-and-jdbc-timestamp-apis\}

Java 和 JDBC 提供了不同的方式来设置时间戳（timestamp）：

1. 使用 `Timestamp` 类，它本质上是一个 Unix 时间戳。
    1. 当与 `Calendar` 对象一起使用时，可以在该 `Calendar` 的时区中重新解释这个 `Timestamp`。
    2. `Timestamp` 具有一个不太显而易见的内部日历表示。
2. 使用 `LocalDateTime` 类，它很容易转换到任意时区，但没有允许你传入目标时区的方法。
3. 使用 `ZonedDateTime` 类，它在写入不带时区的 `DateTime` 时有助于进行时区转换（因为我们知道要使用服务器时区）。
    1. 但将 `ZonedDateTime` 写入具有已定义时区的列时，用户需要自行对驱动程序的转换进行补偿处理。
4. 使用 `Long` 来写入 Unix 时间戳的毫秒值。
5. 使用 `String` 在应用端完成所有转换（可移植性较差）。

:::warning
在通过 ID 搜索时区时，建议优先使用 `java.time.ZoneId#of(java.lang.String)`。
如果找不到该时区，此方法会抛出异常（`java.util.TimeZone#getTimeZone(java.lang.String)` 会静默回退到 `GMT`）。

获取 `Tokyo` 时区的正确方式是：

`TimeZone.getTimeZone(ZoneId.of("Asia/Tokyo"))`
:::

## Date \{#date\}

日期本身与时区无关。用于存储日期的类型有 `Date` 和 `Date32`。这两种类型都使用自 Unix 纪元（1970-01-01）起的天数。`Date` 只使用正数天数，因此其范围在 `2149-06-06` 结束。`Date32` 支持负数天数，以覆盖早于 `1970-01-01` 的日期，但其范围更小（从 `1900-01-01` 到 `2100-01-01`，其中 0 对应 `1970-01-01`）。ClickHouse 在任何时区中都将 `2026-01-01` 视为 `2026-01-01`，并且在列定义中不带时区参数。

### 使用 `java.time.LocalDate` \{#using-localdate\}

在 Java 中，最适合表示日期类型值的类是 `java.time.LocalDate`。客户端使用此类来存储 `Date` 和 `Date32` 列的值（读取时使用 `LocalDate.ofEpochDay((long)readUnsignedShortLE())`）。

我们建议使用 `java.time.LocalDate`，因为它不受时区转换影响，并且属于现代时间 API 的一部分。

### 使用 `java.sql.Date` \{#using-java-sql-date\}

`LocalDate` 是在 Java 8 中引入的。在此之前，`java.sql.Date` 被用于写入和读取日期。该类在内部是对一个 instant（表示绝对时间点的时间值）的包装。因此，`toString()` 会根据 JVM 所在的时区返回不同的日期。这就要求驱动程序在构造这些值时格外小心，并且要求用户对此行为有所了解。

### 基于日历的重新解释 \{#calendar-based-reinterpretation\}

`java.sql.ResultSet` 提供了一个获取日期值的方法，它可以接收一个 `Calendar`；在 `java.sql.PreparedStatement` 中也有类似的方法。其设计目的是让 JDBC 驱动能够在指定的时区中重新解释一个日期值。例如，数据库中的值是 `2026-01-01`，但应用程序希望将该日期视为 `Tokyo` 时区的午夜。这意味着返回的 `java.sql.Date` 对象将对应某个具体的时间点，当它再被转换为本地时区时，由于时差的原因，日期可能会改变。我们可以通过在 `LocalDate` 上使用 `java.time.LocalDate#atStartOfDay(java.time.ZoneId)` 来实现同样的效果。

ClickHouse JDBC 驱动始终返回一个指向**本地**日期午夜时刻的 `java.sql.Date` 对象。换句话说，如果日期是 `2026-01-01`，我们指的是 JVM 时区中的 `2026-01-01 12:00 AM`（与 PostgreSQL 和 MariaDB JDBC 驱动的行为相同）。

## Time \{#time\}

在大多数情况下，Time 值与 Date 值类似，是与时区无关的。ClickHouse 不会对时间字面量进行任何时区转换——`’6:30’` 无论在何处读取，其含义都是相同的。

### ClickHouse Time 类型 \{#clickhouse-time-types\}

`Time` 和 `Time64` 是在 `25.6` 版本中引入的。在此之前，会使用时间戳类型 `DateTime` 和 `DateTime64`（将在本指南后面讨论）。`Time` 以表示秒数的 32 位整数形式存储，取值范围为 `[-999:59:59, 999:59:59]`。`Time64` 被编码为无符号的 Decimal64，并根据精度存储不同的时间单位。常用的精度值为 3（毫秒）、6（微秒）和 9（纳秒）。精度取值范围为 `[0, 9]`。

### Java 类型映射 \{#java-type-mapping\}

客户端读取 `Time` 和 `Time64` 并将它们存储为 `LocalDateTime`。这样做是为了支持负时间范围（`LocalTime` 本身不支持负值）。在这种情况下，日期部分为纪元日期 `1970-01-01`，因此负值会落在此日期之前。

对时间类型的主要支持是通过 `LocalTime`（当值在一天之内时）以及 `Duration`（以覆盖整个取值范围）来实现的。`LocalDateTime` 只能用于读取。

### 使用 `java.sql.Time` \{#using-java-sql-time\}

`java.sql.Time` 的可表示范围仅限于 `LocalTime`。在内部，`java.sql.Time` 会被转换为字符串字面量。可以在 `PreparedStatement#setTime()` 中使用 `Calendar` 类型参数来更改该值。

### `toTime` 函数 \{#totime-function\}

:::note

- `toTime` 始终要求参数为 `Date`、`DateTime` 或其他类似类型，不接受字符串。相关 issue：https://github.com/ClickHouse/ClickHouse/issues/89896
- 它是 [`toTimeWithFixedDate`](/sql-reference/functions/date-time-functions#toTimeWithFixedDate) 的别名。
- 存在一个与时区相关的已知问题：https://github.com/ClickHouse/ClickHouse/pull/90310
:::

## Timestamp \{#timestamp\}

Timestamp 是表示时间上某一特定瞬间的值。例如，Unix 时间戳将任意时间点表示为相对于 `1970-01-01 00:00:00` `UTC` 的秒数（负数秒表示 Unix 时间之前的时间点，正数秒表示之后的时间点）。如果观察者处于 `UTC` 时区，或者统一使用 UTC 而不是本地时区，这种表示方式便于计算和处理。

### ClickHouse Timestamp 类型 \{#clickhouse-timestamp-types\}

ClickHouse 中有 `DateTime`（32 位整数，精度始终为秒）和 `DateTime64`（64 位整数，精度取决于定义）这两种 timestamp 类型。值始终以 UTC 时间戳形式存储。这意味着在以数值形式表示时，不会进行任何时区转换。

### 字符串表示形式和时区行为 \{#string-representation-and-timezone-behavior\}

字符串表示形式在时区处理上存在一些复杂性：

- 如果在列定义中未指定时区，并且写入时以字符串形式传入值，则该字符串会从服务器时区转换为 UTC 时间戳数值。从这样的列中读取值时，会将 UTC 时间戳转换为时间戳字面量，并使用服务器或会话时区（在表达式中，对于未显式指定时区的时间戳字面量也采用类似的处理方式）。
- 如果在列定义中指定了时区，那么在所有与字符串之间的转换中只会使用该时区。这与未指定时区时的逻辑不同，因此需要充分理解在查询中每一列的数据是如何写入的。
- 如果以包含时区信息的格式将日期作为字符串传入，则需要使用转换函数。通常使用 [`parseDateTimeBestEffort`](/sql-reference/functions/type-conversion-functions#parseDateTimeBestEffort)。

### JDBC 驱动程序如何处理时间戳 \{#how-jdbc-driver-handles-timestamps\}

在 JDBC 驱动程序中，我们会将时间戳转换为数值形式：

```java
"fromUnixTimestamp64Nano(" + epochSeconds * 1_000_000_000L + nanos + ")"
```

这种表示方式解决了大多数与时间戳值相关的转换问题，因为它以统一格式将数据发送到服务器。虽然这种方法需要对 SQL 语句做一些小的调整，但它提供了向任意列写入时间戳的最简单、最直接的方式。

`DateTime` 和 `DateTime64` 在客户端会以 `java.time.ZonedDateTime` 的形式读取和存储，这有助于将这些值转换为任意其他时区（时区信息会被保留）。


### 使用 `toDateTime64` 时的常见陷阱 \{#common-pitfall-todatetime64\}

下面的代码示例看起来是正确的，但在执行断言时会失败：

```java
String sql = "SELECT toDateTime64(?, 3)";
try (PreparedStatement stmt = conn.prepareStatement(sql)) {
    LocalDateTime localTs = LocalDateTime.parse("2021-01-01T01:34:56");
    stmt.setObject(1, localTs);
    try (ResultSet rs = stmt.executeQuery()) {
        rs.next();
        assertEquals(rs.getObject(1, LocalDateTime.class), localTs);
    }
}
```

这是因为 `toDateTime64` 使用的是服务器时区，并且不会考虑源时区。


## 转换表 \{#conversion-tables\}

如果下表中未提到某个转换对，则不支持该转换。例如，`Date` 列不能读取为 `java.sql.Timestamp`，因为其中不包含时间部分。

### 使用 `PreparedStatement#setObject` 写入值 \{#writing-values-setobject\}

下表展示了使用 `PreparedStatement#setObject(column, value)` 设置值时的转换方式：

| `value` 的类型  | 转换方式 |
| --- | --- |
| `java.time.LocalDate`  | 格式化为 `YYYY-MM-DD`。  |
| `java.sql.Date`  | 使用默认日历进行转换，并格式化为 `LocalDate`（`YYYY-MM-DD`）。  |
| `java.time.LocalTime`  | 格式化为 `HH:mm:ss`。  |
| `java.time.Duration` | 格式化为 `HHH:mm:ss`。值可以为负数。 |
| `java.sql.Time` | 使用默认日历进行转换，并格式化为 `LocalTime`（`HH:mm`）。   |
| `java.time.LocalDateTime`  | 转换为以纳秒为单位的 Unix 时间戳，并传递给 `fromUnixTimestamp64Nano`。 |
| `java.time.ZonedDateTime`  | 转换为以纳秒为单位的 Unix 时间戳，并传递给 `fromUnixTimestamp64Nano`。 |
| `java.sql.Timestamp`  | 转换为以纳秒为单位的 Unix 时间戳，并传递给 `fromUnixTimestamp64Nano`。 |

:::note
可以视为列的类型是未知的。由应用程序决定向 prepared statement 传递什么值。
:::

### 使用 `ResultSet#getObject` 读取值 \{#reading-values-getobject\}

下表展示了使用 `ResultSet#getObject(column, class)` 读取时值是如何转换的：

| `column` 的 ClickHouse 数据类型  | `class` 的取值  | 转换方式 |
| --- | --- | --- |
| `Date` 或 `Date32`  | `java.time.LocalDate`  | 将数据库中的值（天数）转换为 `LocalDate`。  |
| `Date` 或 `Date32`  | `java.sql.Date`  | 将数据库中的值（天数）转换为 `LocalDate`，然后再转换为 `java.sql.Date`，时间部分使用本地时区的午夜。如果使用了 `Calendar`，则使用该 `Calendar` 的时区而不是本地时区。示例：数据库值 `1970-01-10` → 转换后的 `LocalDate` 为 `1970-01-10`。  |
| `Time` 或 `Time64`  | `java.time.LocalTime`  | 将数据库中的值转换为 `LocalDateTime`，再转换为 `LocalTime`。仅适用于一天之内的时间。  |
| `Time` 或 `Time64`  | `java.time.LocalDateTime`  | 将数据库中的值转换为 `LocalDateTime`。  |
| `Time` 或 `Time64`  | `java.sql.Time`  | 将数据库中的值转换为 `LocalDateTime`，然后再使用默认 `Calendar` 转换为 `java.sql.Time`。仅适用于一天之内的时间。  |
| `Time` 或 `Time64`  | `java.time.Duration`  | 将数据库中的值转换为 `LocalDateTime`，然后再转换为 `Duration`。 |
| `DateTime` 或 `DateTime64`  | `java.time.LocalDateTime` | 将数据库中的值转换为 `ZonedDateTime`，再转换为 `LocalDateTime`。 |
| `DateTime` 或 `DateTime64`  | `java.time.ZonedDateTime` | 将数据库中的值转换为 `ZonedDateTime`。  |
| `DateTime` 或 `DateTime64`  | `java.sql.Timestamp` | 将数据库中的值转换为 `ZonedDateTime`，然后使用默认时区转换为 `java.sql.Timestamp`。  |

### 使用基于 Calendar 的方法 \{#using-calendar-based-methods\}

如果值是通过 `PreparedStatement#setTime(param, value, calendar)` 和 `PreparedStatement#setDate(param, value, calendar)` 存储的，则应相应地使用 `ResultSet#getTime(column, calendar)` 和 `ResultSet#getDate(column, calendar)`。