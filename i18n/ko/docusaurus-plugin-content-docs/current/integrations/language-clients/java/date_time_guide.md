---
sidebar_label: 'JDBC에서 Date/Time 값 사용하기'
sidebar_position: 4
keywords: ['java', 'jdbc', 'driver', 'integrate', 'guide', 'Date', 'Time']
description: 'JDBC에서 Date/Time 값을 사용하는 방법에 대한 가이드'
slug: /integrations/language-clients/java/jdbc_date_time_guide
title: 'Date/Time 값 사용 가이드'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

# JDBC에서 Date, Time, Timestamp 다루기 \{#working-with-date-time-and-timestamp-in-jdbc\}

Date, Time, Timestamp는 관련된 몇 가지 일반적인 문제가 있어 주의가 필요합니다.
가장 흔한 문제는 시간대를 어떻게 처리할 것인가 하는 점입니다. 또 다른 문제는 문자열 표현 방식과 이를 어떻게 사용할 것인가입니다.
그 외에도 각 데이터베이스와 드라이버마다 고유한 특성과 제약이 있습니다.

이 문서는 수행해야 할 작업을 정리하고, 구현 세부 정보를 제공하며, 문제점을 설명함으로써 의사결정에 도움이 되는 가이드를 제공하는 것을 목표로 합니다.

## Timezones \{#timezones\}

시간대는 처리하기 어렵다는 사실은 잘 알려져 있습니다(일광 절약 시간제, 상시적인 오프셋 변경 등). 하지만 이 절에서는 시간대와 관련된 또 다른 문제, 즉 시간대가 타임스탬프 문자열 표현과 어떤 관계가 있는지에 대해 설명합니다.

### ClickHouse가 DateTime 문자열을 변환하는 방식 \{#clickhouse-datetime-string-conversion\}

ClickHouse는 `DateTime` 문자열 값을 변환할 때 다음 규칙을 사용합니다.

- 컬럼이 타임존을 함께 지정해 정의된 경우(`DateTime64(9, ‘Asia/Tokyo’)`), 문자열 값은 해당 타임존의 타임스탬프로 처리됩니다. 예를 들어 `2026-01-01 13:00:00`은 `UTC` 시간으로 `2026-01-01 04:00:00`이 됩니다.
- 컬럼에 타임존 정의가 없으면 서버 타임존만 사용됩니다. 중요: `session_timezone` 설정은 아무런 영향을 주지 않습니다. 따라서 서버 타임존이 `UTC`이고 세션 타임존이 `America/Los_Angeles`인 경우, `2026-01-01 13:00:00`은 `UTC` 시간으로 기록됩니다.
- 타임존 정의가 없는 컬럼에서 값을 읽을 때는 `session_timezone`이 사용되며, 이 값이 설정되어 있지 않으면 서버 타임존이 사용됩니다. 이 때문에 타임스탬프를 문자열로 읽을 때 `session_timezone`의 영향을 받을 수 있습니다. 이는 잘못된 동작이 아니지만, 반드시 염두에 두어야 합니다.

### 여러 타임존에 걸쳐 타임스탬프 쓰기 \{#writing-timestamps-across-timezones\}

이제 `us-west` 리전에 로컬 타임존 `UTC-8`으로 동작하는 애플리케이션이 있고, 로컬 타임스탬프 `2026-01-01 02:00:00`를 기록해야 하는데, 이는 `UTC` 기준으로 `2026-01-01 10:00:00`이라고 가정합니다:

- 문자열로 기록하는 경우, 서버 타임존 또는 컬럼 타임존으로 변환해야 합니다.
- 언어 고유의 시간 구조로 기록하는 경우, 드라이버가 대상 타임존을 알아야 하지만:
  - 항상 가능한 것은 아닙니다.
  - 이를 위해 드라이버 API가 잘 설계되어 있지 않습니다.
  - 애플리케이션이 보정할 수 있도록 어떤 변환이 수행되는지 설명해 주는 방법(또는 Unix timestamp를 숫자로 기록하는 방법)밖에 없습니다.

### Java 및 JDBC timestamp API \{#java-and-jdbc-timestamp-apis\}

Java 및 JDBC에서는 timestamp를 설정하는 여러 가지 방법이 있습니다:

1. 실제로는 Unix timestamp인 `Timestamp` 클래스를 사용합니다.
    1. `Calendar` 객체와 함께 사용하면 해당 캘린더의 타임존에서 `Timestamp`를 다시 해석할 수 있습니다.
    2. `Timestamp`에는 잘 드러나지 않는 내부 캘린더가 있습니다.
2. 어떤 타임존으로도 쉽게 변환할 수 있는 `LocalDateTime` 클래스를 사용합니다. 하지만 대상 타임존을 전달할 수 있는 메서드는 없습니다.
3. 타임존이 없는 `DateTime`에 값을 쓸 때(서버 타임존을 사용해야 한다는 것을 알기 때문에) 타임존 변환에 도움이 되는 `ZonedDateTime` 클래스를 사용합니다.
    1. 그러나 타임존이 정의된 컬럼에 `ZonedDateTime`을 쓸 때는 사용자 측에서 드라이버 변환에 대한 보정을 직접 해 주어야 합니다.
4. `Long`을 사용하여 Unix timestamp 밀리초 값을 기록합니다.
5. `String`을 사용하여 애플리케이션 측에서 모든 변환을 수행합니다(이 방식은 이식성이 크게 떨어집니다).

:::warning
ID로 타임존을 검색할 때는 `java.time.ZoneId#of(java.lang.String)`를 사용하는 것이 좋습니다.
이 메서드는 타임존을 찾지 못하면 예외를 던지지만, `java.util.TimeZone#getTimeZone(java.lang.String)`은 아무 경고 없이 자동으로 `GMT`로 대체합니다.

`Tokyo` 타임존을 얻는 올바른 방법은 다음과 같습니다:

`TimeZone.getTimeZone(ZoneId.of("Asia/Tokyo"))`
:::

## Date \{#date\}

날짜는 본질적으로 타임존에 독립적입니다. 날짜를 저장하기 위해 `Date`와 `Date32` 타입이 있습니다. 두 타입 모두 Epoch(1970-01-01)를 기준으로 경과한 일(day) 수를 사용합니다. `Date`는 양수 일수만 사용하므로 범위의 끝이 `2149-06-06`입니다. `Date32`는 `1970-01-01` 이전 날짜를 포함하기 위해 음수 일수도 처리하지만, 범위는 더 작습니다(0이 `1970-01-01`인 상태에서 `1900-01-01`부터 `2100-01-01`까지). ClickHouse는 어떤 타임존에서도 `2026-01-01`을 `2026-01-01`로 인식하며, 컬럼 정의에는 타임존 파라미터가 없습니다.

### `java.time.LocalDate` 사용하기 \{#using-localdate\}

Java에서 날짜 값을 표현하기에 가장 적합한 클래스는 `java.time.LocalDate`입니다. 클라이언트는 이 클래스를 사용하여 `Date` 및 `Date32` 컬럼의 값을 저장하며, 읽을 때는 `LocalDate.ofEpochDay((long)readUnsignedShortLE())`를 사용합니다.

`java.time.LocalDate`는 타임존 변환의 영향을 받지 않으며 최신 시간 API의 일부이므로 사용을 권장합니다.

### `java.sql.Date` 사용 \{#using-java-sql-date\}

`LocalDate`는 Java 8에서 도입되었습니다. 그 이전에는 날짜를 읽고/쓰는 데 `java.sql.Date`가 사용되었습니다. 내부적으로 이 클래스는 인스턴트(절대 시점을 나타내는 시간 값)를 감싸는 래퍼입니다. 이로 인해 JVM이 어떤 시간대를 사용하는지에 따라 `toString()`이 다른 날짜를 반환합니다. 이에 따라 드라이버는 값을 신중하게 생성해야 하고, 사용자도 이러한 동작을 인지하고 있어야 합니다.

### 캘린더 기반 재해석 \{#calendar-based-reinterpretation\}

`java.sql.ResultSet`에는 날짜 값을 가져올 때 `Calendar`를 인자로 받는 메서드가 있으며, `java.sql.PreparedStatement`에도 유사한 메서드가 있습니다. 이는 지정된 타임존에서 JDBC 드라이버가 날짜 값을 재해석할 수 있도록 설계된 것입니다. 예를 들어, DB에는 `2026-01-01` 값이 있지만, 애플리케이션에서는 이 날짜를 `Tokyo` 타임존의 자정으로 보고자 할 수 있습니다. 이때 반환되는 `java.sql.Date` 객체는 특정 시점을 가리키게 되고, 이를 로컬 타임존으로 변환하면 시차 때문에 다른 날짜가 될 수 있습니다. `LocalDate`의 경우 `java.time.LocalDate#atStartOfDay(java.time.ZoneId)`를 사용하여 동일한 동작을 구현할 수 있습니다.

ClickHouse JDBC 드라이버는 항상 **로컬** 날짜의 자정을 가리키는 `java.sql.Date` 객체를 반환합니다. 다시 말해, 날짜가 `2026-01-01`이라면 JVM 타임존 기준으로 `2026-01-01 12:00 AM`을 의미하며, 이는 PostgreSQL 및 MariaDB JDBC 드라이버와 동일한 동작입니다.

## Time \{#time\}

Time 값은 Date 값과 마찬가지로 대부분의 경우 타임존과 무관합니다. ClickHouse는 Time 리터럴 값에 대해 어떤 타임존 변환도 수행하지 않습니다. 즉, `’6:30’`은 어디에서 읽더라도 동일합니다.

### ClickHouse Time 타입 \{#clickhouse-time-types\}

`Time`과 `Time64`는 `25.6` 버전에서 도입되었습니다. 그 이전에는 타임스탬프 타입으로 `DateTime`과 `DateTime64`가 사용되었습니다(이 가이드의 뒷부분에서 설명합니다). `Time`은 32비트 정수 초 단위로 저장되며, 범위는 `[-999:59:59, 999:59:59]`입니다. `Time64`는 부호 없는 Decimal64로 인코딩되며, 정밀도에 따라 서로 다른 시간 단위를 저장합니다. 일반적으로 3(밀리초), 6(마이크로초), 9(나노초)를 사용합니다. 정밀도 값의 범위는 `[0, 9]`입니다.

### Java 타입 매핑 \{#java-type-mapping\}

클라이언트는 `Time`과 `Time64`를 읽어 `LocalDateTime`으로 저장합니다. 이는 음수 시간 범위를 지원하기 위한 것으로, `LocalTime`은 이를 지원하지 않습니다. 이때 날짜 부분은 Epoch 날짜인 `1970-01-01`로 고정되며, 음수 값은 이 날짜 이전 시점으로 표현됩니다.

시간 타입에 대한 주요 지원은 (값이 하루 이내일 때) `LocalTime`과 전체 값 범위를 다루기 위한 `Duration`을 사용하여 구현됩니다. `LocalDateTime`은 읽을 때에만 사용할 수 있습니다.

### `java.sql.Time` 사용하기 \{#using-java-sql-time\}

`java.sql.Time`의 사용은 `LocalTime` 범위로 제한됩니다. 내부적으로 `java.sql.Time`은 문자열 리터럴로 변환됩니다. 값은 `PreparedStatement#setTime()`에 `Calendar` 매개변수를 함께 사용하여 변경할 수 있습니다.

### `toTime` 함수 \{#totime-function\}

:::note

- `toTime`은 항상 `Date`, `DateTime` 또는 이와 유사한 타입을 인수로 사용합니다. 문자열은 허용하지 않습니다. 관련 이슈: https://github.com/ClickHouse/ClickHouse/issues/89896
- [`toTimeWithFixedDate`](/sql-reference/functions/date-time-functions#toTimeWithFixedDate)의 별칭입니다.
- 타임존 관련 이슈가 있습니다: https://github.com/ClickHouse/ClickHouse/pull/90310
:::

## Timestamp \{#timestamp\}

Timestamp는 특정 시점을 나타내는 값입니다. 예를 들어 Unix timestamp는 임의의 시점을 `1970-01-01 00:00:00` `UTC`를 기준으로 한 초(second) 단위의 값으로 표현합니다(음수 초 값은 Unix 시간 이전의 timestamp를, 양수 초 값은 Unix 시간 이후의 timestamp를 나타냅니다). 이 표현 방식은 시간을 다루는 주체가 `UTC` 타임존에 있거나 로컬 타임존 대신 `UTC`를 사용할 때 계산하고 처리하기가 쉽습니다.

### ClickHouse Timestamp 타입 \{#clickhouse-timestamp-types\}

ClickHouse에는 `DateTime`(32비트 정수, 해상도는 항상 초 단위)와 `DateTime64`(64비트 정수, 해상도는 정의에 따라 달라짐) 두 가지 timestamp 타입이 있습니다. 값은 항상 UTC 타임스탬프로 저장됩니다. 따라서 숫자 값으로 표현될 때는 타임존 변환이 적용되지 않습니다.

### 문자열 표현 및 타임존 동작 \{#string-representation-and-timezone-behavior\}

문자열 표현에는 다음과 같은 복잡성이 있습니다.

- 컬럼 정의에 타임존이 지정되어 있지 않고, 데이터를 쓸 때 문자열이 전달되면 서버 타임존 기준에서 UTC 타임스탬프 숫자 값으로 변환됩니다. 이러한 컬럼에서 값을 읽을 때는 UTC 타임스탬프에서 서버 또는 세션 타임존을 사용한 타임스탬프 리터럴로 변환됩니다(타임존이 명시적으로 정의되지 않은 표현식의 타임스탬프 리터럴에도 유사한 방식이 적용됩니다).
- 컬럼 정의에 타임존이 지정된 경우, 모든 문자열 변환에서 해당 타임존만 사용됩니다. 이는 타임존이 지정되지 않았을 때의 로직과 상충하므로, 쿼리에서 각 컬럼에 데이터가 어떻게 기록되는지에 대한 충분한 이해가 필요합니다.
- 타임존을 포함하는 형식의 문자열로 날짜가 전달되는 경우, 변환 함수가 필요합니다. 일반적으로 [`parseDateTimeBestEffort`](/sql-reference/functions/type-conversion-functions#parseDateTimeBestEffort)가 사용됩니다.

### JDBC 드라이버가 타임스탬프를 처리하는 방식 \{#how-jdbc-driver-handles-timestamps\}

JDBC 드라이버에서는 타임스탬프를 숫자 형태로 변환합니다:

```java
"fromUnixTimestamp64Nano(" + epochSeconds * 1_000_000_000L + nanos + ")"
```

이 표현 방식은 데이터를 서버로 통합된 형식으로 전송하므로 타임스탬프 값 변환과 관련된 대부분의 문제를 해결합니다. 다만 이 방식은 SQL 문에 약간의 조정이 필요하지만, 어떤 컬럼에든 타임스탬프를 기록하는 가장 단순하고 직관적인 방법을 제공합니다.

`DateTime`과 `DateTime64`는 클라이언트에서 `java.time.ZonedDateTime`으로 읽고 저장되며, 이를 통해 이러한 값을 임의의 다른 시간대로 변환할 수 있습니다(시간대 정보가 유지됩니다).


### `toDateTime64`에서 자주 발생하는 함정 \{#common-pitfall-todatetime64\}

다음 코드 예시는 올바른 것처럼 보이지만 assertion(단언문)에서 실패합니다:

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

이는 `toDateTime64`가 서버의 타임존을 사용하고 소스 타임존을 인지하지 못하기 때문에 발생합니다.


## 변환 표 \{#conversion-tables\}

아래 표에 변환 쌍이 나와 있지 않다면 해당 변환은 지원되지 않습니다. 예를 들어 `Date` 컬럼에는 시간 정보가 없으므로 `java.sql.Timestamp`로 읽을 수 없습니다.

### `PreparedStatement#setObject`로 값 기록하기 \{#writing-values-setobject\}

다음 표는 `PreparedStatement#setObject(column, value)`로 설정할 때 값이 어떻게 변환되는지 보여줍니다:

| `value`의 Class  | 변환 방식 |
| --- | --- |
| `java.time.LocalDate`  | `YYYY-MM-DD` 형식으로 포맷됩니다.  |
| `java.sql.Date`  | 기본 캘린더를 사용해 변환된 후 `LocalDate` (`YYYY-MM-DD`) 형식으로 포맷됩니다.  |
| `java.time.LocalTime`  | `HH:mm:ss` 형식으로 포맷됩니다.  |
| `java.time.Duration` | `HHH:mm:ss` 형식으로 포맷됩니다. 값은 음수가 될 수 있습니다. |
| `java.sql.Time` | 기본 캘린더를 사용해 변환된 후 `LocalTime` (`HH:mm`) 형식으로 포맷됩니다.   |
| `java.time.LocalDateTime`  | 나노초 단위 Unix 타임스탬프로 변환된 뒤 `fromUnixTimestamp64Nano`로 감싸집니다. |
| `java.time.ZonedDateTime`  | 나노초 단위 Unix 타임스탬프로 변환된 뒤 `fromUnixTimestamp64Nano`로 감싸집니다. |
| `java.sql.Timestamp`  | 나노초 단위 Unix 타임스탬프로 변환된 뒤 `fromUnixTimestamp64Nano`로 감싸집니다. |

:::note
컬럼의 타입은 알 수 없는 것으로 간주합니다. PreparedStatement에 무엇을 전달할지는 애플리케이션에서 결정해야 합니다.
:::

### `ResultSet#getObject`로 값 읽기 \{#reading-values-getobject\}

다음 표는 `ResultSet#getObject(column, class)`로 읽을 때 값이 어떻게 변환되는지 보여줍니다:

| `column`의 ClickHouse 데이터 타입  | `class`의 값  | 변환 |
| --- | --- | --- |
| `Date` 또는 `Date32`  | `java.time.LocalDate`  | DB 값(일 수)이 `LocalDate`로 변환됩니다.  |
| `Date` 또는 `Date32`  | `java.sql.Date`  | DB 값(일 수)이 `LocalDate`로 변환된 다음, 시간 부분은 로컬 타임존의 자정으로 하여 `java.sql.Date`로 변환됩니다. `Calendar`가 사용되면 로컬 타임존 대신 해당 `Calendar`의 타임존이 사용됩니다. 예: DB 값 `1970-01-10` → `LocalDate`는 `1970-01-10`입니다.  |
| `Time` 또는 `Time64`  | `java.time.LocalTime`  | DB 값이 먼저 `LocalDateTime`으로 변환된 다음 `LocalTime`으로 변환됩니다. 이는 하루(24시간) 이내의 시간에만 동작합니다.  |
| `Time` 또는 `Time64`  | `java.time.LocalDateTime`  | DB 값이 `LocalDateTime`으로 변환됩니다.  |
| `Time` 또는 `Time64`  | `java.sql.Time`  | DB 값이 먼저 `LocalDateTime`으로 변환된 다음 기본 `Calendar`를 사용하여 `java.sql.Time`으로 변환됩니다. 이는 하루(24시간) 이내의 시간에만 동작합니다.  |
| `Time` 또는 `Time64`  | `java.time.Duration`  | DB 값이 먼저 `LocalDateTime`으로 변환된 다음 `Duration`으로 변환됩니다. |
| `DateTime` 또는 `DateTime64`  | `java.time.LocalDateTime` | DB 값이 `ZonedDateTime`으로 변환된 다음 `LocalDateTime`으로 변환됩니다. |
| `DateTime` 또는 `DateTime64`  | `java.time.ZonedDateTime` | DB 값이 `ZonedDateTime`으로 변환됩니다.  |
| `DateTime` 또는 `DateTime64`  | `java.sql.Timestamp` | DB 값이 `ZonedDateTime`으로 변환된 다음 기본 타임존을 사용하여 `java.sql.Timestamp`로 변환됩니다.  |

### Calendar 기반 메서드 사용 \{#using-calendar-based-methods\}

값이 `PreparedStatement#setTime(param, value, calendar)` 및 `PreparedStatement#setDate(param, value, calendar)`를 사용해 저장된 경우, 해당 값을 조회할 때 각각 `ResultSet#getTime(column, calendar)` 및 `ResultSet#getDate(column, calendar)`를 사용합니다.