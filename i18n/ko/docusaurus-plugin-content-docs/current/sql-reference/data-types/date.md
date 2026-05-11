---
description: "ClickHouse의 Date 데이터 타입에 대한 문서입니다"
sidebar_label: 'Date'
sidebar_position: 12
slug: /sql-reference/data-types/date
title: 'Date'
doc_type: 'reference'
---

# Date \{#date\}

날짜형입니다. 1970-01-01 이후 경과한 일 수를 나타내는 2바이트 부호 없는 정수로 저장됩니다. Unix Epoch 시작 직후부터 컴파일 단계에서 상수로 정의된 상한까지 값을 저장할 수 있습니다(현재는 2149년까지 저장 가능하지만, 완전히 지원되는 마지막 연도는 2148년입니다).

지원하는 값의 범위: [1970-01-01, 2149-06-06].

날짜 값은 시간대 정보 없이 저장됩니다.

**예시**

`Date` 타입 컬럼이 있는 테이블을 생성하고 데이터 를 삽입하는 예는 다음과 같습니다:

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

**함께 보기**

* [날짜와 시간을 다루는 함수](../../sql-reference/functions/date-time-functions.md)
* [날짜와 시간을 다루는 연산자](../../sql-reference/operators#operators-for-working-with-dates-and-times)
* [`DateTime` 데이터 타입](../../sql-reference/data-types/datetime.md)
