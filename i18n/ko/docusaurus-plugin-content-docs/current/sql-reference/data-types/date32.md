---
'description': 'ClickHouse의 Date32 데이터 유형에 대한 문서로, Date에 비해 확장된 범위의 날짜를 저장합니다.'
'sidebar_label': 'Date32'
'sidebar_position': 14
'slug': '/sql-reference/data-types/date32'
'title': 'Date32'
'doc_type': 'reference'
---


# Date32

날짜. [DateTime64](../../sql-reference/data-types/datetime64.md)와 동일한 날짜 범위를 지원합니다. `1900-01-01` 이후의 일수를 나타내는 값을 갖는 네이티브 바이트 순서의 서명된 32비트 정수로 저장됩니다. **중요!** 0은 `1970-01-01`을 나타내며, 음수 값은 `1970-01-01` 이전의 날짜를 나타냅니다.

**예시**

`Date32` 유형의 컬럼으로 테이블을 생성하고 그에 데이터를 삽입하는 방법:

```sql
CREATE TABLE dt32
(
    `timestamp` Date32,
    `event_id` UInt8
)
ENGINE = TinyLog;
```

```sql
-- Parse Date
-- - from string,
-- - from 'small' integer interpreted as number of days since 1970-01-01, and
-- - from 'big' integer interpreted as number of seconds since 1970-01-01.
INSERT INTO dt32 VALUES ('2100-01-01', 1), (47482, 2), (4102444800, 3);

SELECT * FROM dt32;
```

```text
┌──timestamp─┬─event_id─┐
│ 2100-01-01 │        1 │
│ 2100-01-01 │        2 │
│ 2100-01-01 │        3 │
└────────────┴──────────┘
```

**관련 항목**

- [toDate32](../../sql-reference/functions/type-conversion-functions.md#todate32)
- [toDate32OrZero](/sql-reference/functions/type-conversion-functions#todate32orzero)
- [toDate32OrNull](/sql-reference/functions/type-conversion-functions#todate32ornull)
