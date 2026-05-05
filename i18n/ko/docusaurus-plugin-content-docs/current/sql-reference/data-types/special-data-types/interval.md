---
description: 'Interval 특수 데이터 타입 문서'
sidebar_label: 'Interval'
sidebar_position: 61
slug: /sql-reference/data-types/special-data-types/interval
title: 'Interval'
doc_type: 'reference'
---

# Interval \{#interval\}

시간 및 날짜 간격을 표현하는 데이터 타입 계열입니다. [INTERVAL](/sql-reference/operators#interval) 연산자의 결과 데이터 타입입니다.

구조:

* 부호 없는 정수 값으로 표현되는 시간 간격.
* 간격의 타입.

지원되는 간격 타입:

* `NANOSECOND`
* `MICROSECOND`
* `MILLISECOND`
* `SECOND`
* `MINUTE`
* `HOUR`
* `DAY`
* `WEEK`
* `MONTH`
* `QUARTER`
* `YEAR`

각 간격 타입마다 별도의 데이터 타입이 있습니다. 예를 들어, `DAY` 간격은 `IntervalDay` 데이터 타입에 해당합니다:

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```


## 사용 시 참고 사항 \{#usage-remarks\}

`Interval` 타입의 값은 [Date](../../../sql-reference/data-types/date.md) 및 [DateTime](../../../sql-reference/data-types/datetime.md) 타입의 값과 산술 연산에 사용할 수 있습니다. 예를 들어, 현재 시각에 4일을 더할 수 있습니다:

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

또한 여러 개의 구간(interval)을 동시에 사용할 수도 있습니다:

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

서로 다른 간격으로 값을 비교하려면:

```sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

```text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```


## 혼합형 인터벌 \{#mixed-type-intervals\}

여러 시간과 여러 분처럼 여러 단위를 조합한 인터벌은 `INTERVAL 'value' <from_kind> TO <to_kind>` 구문으로 생성할 수 있습니다.
결과는 2개 이상의 인터벌로 구성된 튜플입니다.

지원되는 조합:

| 구문                 | 문자열 형식    | 예시                                    |
| ------------------ | --------- | ------------------------------------- |
| `YEAR TO MONTH`    | `Y-M`     | `INTERVAL '2-6' YEAR TO MONTH`        |
| `DAY TO HOUR`      | `D H`     | `INTERVAL '5 12' DAY TO HOUR`         |
| `DAY TO MINUTE`    | `D H:M`   | `INTERVAL '5 12:30' DAY TO MINUTE`    |
| `DAY TO SECOND`    | `D H:M:S` | `INTERVAL '5 12:30:45' DAY TO SECOND` |
| `HOUR TO MINUTE`   | `H:M`     | `INTERVAL '1:30' HOUR TO MINUTE`      |
| `HOUR TO SECOND`   | `H:M:S`   | `INTERVAL '1:30:45' HOUR TO SECOND`   |
| `MINUTE TO SECOND` | `M:S`     | `INTERVAL '5:30' MINUTE TO SECOND`    |

선행 필드를 제외한 나머지 필드는 SQL 표준에 따라 검증됩니다: `MONTH` 0-11, `HOUR` 0-23, `MINUTE` 0-59, `SECOND` 0-59.

```sql
SELECT INTERVAL '1:30' HOUR TO MINUTE;
```

```text
┌─(toIntervalHour(1), toIntervalMinute(30))─┐
│ (1,30)                                     │
└────────────────────────────────────────────┘
```

앞에 오는 선택적 `+` 또는 `-` 부호는 모든 부분에 적용됩니다:

```sql
SELECT INTERVAL '+1:30' HOUR TO MINUTE;
-- this is equivalent to:
-- SELECT INTERVAL '1:30' HOUR TO MINUTE;
```

```text
┌─(toIntervalHour(1), toIntervalMinute(30))─┐
│ (1,30)                                     │
└────────────────────────────────────────────┘
```


## 같이 보기 \{#see-also\}

- [INTERVAL](/sql-reference/operators#interval) 연산자
- [toInterval](/sql-reference/functions/type-conversion-functions#toIntervalYear) 변환 함수