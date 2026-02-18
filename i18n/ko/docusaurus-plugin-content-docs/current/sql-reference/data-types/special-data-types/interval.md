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


## 같이 보기 \{#see-also\}

- [INTERVAL](/sql-reference/operators#interval) 연산자
- [toInterval](/sql-reference/functions/type-conversion-functions#toIntervalYear) 변환 함수