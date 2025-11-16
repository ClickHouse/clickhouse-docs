---
'description': 'ClickHouse의 Date 데이터 타입에 대한 문서'
'sidebar_label': '날짜'
'sidebar_position': 12
'slug': '/sql-reference/data-types/date'
'title': '날짜'
'doc_type': 'reference'
---


# 날짜

날짜입니다. 1970-01-01 이후의 날짜 수를 두 바이트로 저장합니다 (부호 없는 정수). 유닉스 에포크 초 시작 직후부터 컴파일 단계에서 정의된 상수에 의해 설정된 상한까지 값을 저장할 수 있습니다 (현재는 2149년까지 가능하지만, 최종적으로 완전히 지원되는 년도는 2148년입니다).

지원되는 값의 범위: \[1970-01-01, 2149-06-06\].

날짜 값은 시간대 없이 저장됩니다.

**예제**

`Date` 유형의 컬럼을 가진 테이블을 생성하고 데이터를 삽입하는 예:

```sql
CREATE TABLE dt
(
    `timestamp` Date,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse Date
-- - from string,
-- - from 'small' integer interpreted as number of days since 1970-01-01, and
-- - from 'big' integer interpreted as number of seconds since 1970-01-01.
INSERT INTO dt VALUES ('2019-01-01', 1), (17897, 2), (1546300800, 3);

SELECT * FROM dt;
```

```text
┌──timestamp─┬─event_id─┐
│ 2019-01-01 │        1 │
│ 2019-01-01 │        2 │
│ 2019-01-01 │        3 │
└────────────┴──────────┘
```

**참고**

- [날짜 및 시간 작업을 위한 함수](../../sql-reference/functions/date-time-functions.md)
- [날짜 및 시간 작업을 위한 연산자](../../sql-reference/operators#operators-for-working-with-dates-and-times)
- [`DateTime` 데이터 유형](../../sql-reference/data-types/datetime.md)
