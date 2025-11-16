---
'description': 'Interval 특별 데이터 유형에 대한 Documentation'
'sidebar_label': '간격'
'sidebar_position': 61
'slug': '/sql-reference/data-types/special-data-types/interval'
'title': '간격'
'doc_type': 'reference'
---


# 인터벌

시간과 날짜 간격을 나타내는 데이터 유형의 집합. [INTERVAL](/sql-reference/operators#interval) 연산자의 결과 유형입니다.

구조:

- 부호 없는 정수 값으로 표현된 시간 간격.
- 간격의 유형.

지원되는 간격 유형:

- `NANOSECOND`
- `MICROSECOND`
- `MILLISECOND`
- `SECOND`
- `MINUTE`
- `HOUR`
- `DAY`
- `WEEK`
- `MONTH`
- `QUARTER`
- `YEAR`

각 간격 유형마다 별도의 데이터 유형이 있습니다. 예를 들어, `DAY` 간격은 `IntervalDay` 데이터 유형에 해당합니다.

```sql
SELECT toTypeName(INTERVAL 4 DAY)
```

```text
┌─toTypeName(toIntervalDay(4))─┐
│ IntervalDay                  │
└──────────────────────────────┘
```

## 사용 설명서 {#usage-remarks}

`Interval` 유형 값을 [Date](../../../sql-reference/data-types/date.md) 및 [DateTime](../../../sql-reference/data-types/datetime.md) 유형 값과의 산술 연산에 사용할 수 있습니다. 예를 들어, 현재 시간에 4일을 더할 수 있습니다:

```sql
SELECT now() AS current_date_time, current_date_time + INTERVAL 4 DAY
```

```text
┌───current_date_time─┬─plus(now(), toIntervalDay(4))─┐
│ 2019-10-23 10:58:45 │           2019-10-27 10:58:45 │
└─────────────────────┴───────────────────────────────┘
```

여러 간격을 동시에 사용할 수도 있습니다:

```sql
SELECT now() AS current_date_time, current_date_time + (INTERVAL 4 DAY + INTERVAL 3 HOUR)
```

```text
┌───current_date_time─┬─plus(current_date_time, plus(toIntervalDay(4), toIntervalHour(3)))─┐
│ 2024-08-08 18:31:39 │                                                2024-08-12 21:31:39 │
└─────────────────────┴────────────────────────────────────────────────────────────────────┘
```

그리고 서로 다른 간격을 가진 값을 비교할 수 있습니다:

```sql
SELECT toIntervalMicrosecond(3600000000) = toIntervalHour(1);
```

```text
┌─less(toIntervalMicrosecond(179999999), toIntervalMinute(3))─┐
│                                                           1 │
└─────────────────────────────────────────────────────────────┘
```

## 참고 {#see-also}

- [INTERVAL](/sql-reference/operators#interval) 연산자
- [toInterval](/sql-reference/functions/type-conversion-functions#tointervalyear) 형 변환 함수
