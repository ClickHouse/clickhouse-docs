---
'description': '모든 범위(숫자 축의 세그먼트)의 합집합의 총 길이를 계산합니다.'
'sidebar_label': 'intervalLengthSum'
'sidebar_position': 155
'slug': '/sql-reference/aggregate-functions/reference/intervalLengthSum'
'title': 'intervalLengthSum'
'doc_type': 'reference'
---

모든 범위(숫자 축상의 세그먼트)의 합집합의 총 길이를 계산합니다.

**구문**

```sql
intervalLengthSum(start, end)
```

**인수**

- `start` — 구간의 시작 값입니다. [Int32](/sql-reference/data-types/int-uint#integer-ranges), [Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt32](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges), [Float32](/sql-reference/data-types/float), [Float64](/sql-reference/data-types/float), [DateTime](/sql-reference/data-types/datetime) 또는 [Date](/sql-reference/data-types/date).
- `end` — 구간의 끝 값입니다. [Int32](/sql-reference/data-types/int-uint#integer-ranges), [Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt32](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges), [Float32](/sql-reference/data-types/float), [Float64](/sql-reference/data-types/float), [DateTime](/sql-reference/data-types/datetime) 또는 [Date](/sql-reference/data-types/date).

:::note
인수는 동일한 데이터 타입이어야 합니다. 그렇지 않으면 예외가 발생합니다.
:::

**반환 값**

- 모든 범위(숫자 축상의 세그먼트)의 합집합의 총 길이입니다. 인수의 타입에 따라 반환 값은 [UInt64](/sql-reference/data-types/int-uint#integer-ranges) 또는 [Float64](/sql-reference/data-types/float) 타입이 될 수 있습니다.

**예제**

1. 입력 테이블:

```text
┌─id─┬─start─┬─end─┐
│ a  │   1.1 │ 2.9 │
│ a  │   2.5 │ 3.2 │
│ a  │     4 │   5 │
└────┴───────┴─────┘
```

이 예제에서는 Float32 유형의 인수가 사용됩니다. 이 함수는 Float64 유형의 값을 반환합니다.

결과는 구간 `[1.1, 3.2]`의 길이를 합한 값(구간 `[1.1, 2.9]`와 `[2.5, 3.2]`의 합집합)과 `[4, 5]`입니다.

쿼리:

```sql
SELECT id, intervalLengthSum(start, end), toTypeName(intervalLengthSum(start, end)) FROM fl_interval GROUP BY id ORDER BY id;
```

결과:

```text
┌─id─┬─intervalLengthSum(start, end)─┬─toTypeName(intervalLengthSum(start, end))─┐
│ a  │                           3.1 │ Float64                                   │
└────┴───────────────────────────────┴───────────────────────────────────────────┘
```

2. 입력 테이블:

```text
┌─id─┬───────────────start─┬─────────────────end─┐
│ a  │ 2020-01-01 01:12:30 │ 2020-01-01 02:10:10 │
│ a  │ 2020-01-01 02:05:30 │ 2020-01-01 02:50:31 │
│ a  │ 2020-01-01 03:11:22 │ 2020-01-01 03:23:31 │
└────┴─────────────────────┴─────────────────────┘
```

이 예제에서는 DateTime 유형의 인수가 사용됩니다. 이 함수는 초 단위의 값을 반환합니다.

쿼리:

```sql
SELECT id, intervalLengthSum(start, end), toTypeName(intervalLengthSum(start, end)) FROM dt_interval GROUP BY id ORDER BY id;
```

결과:

```text
┌─id─┬─intervalLengthSum(start, end)─┬─toTypeName(intervalLengthSum(start, end))─┐
│ a  │                          6610 │ UInt64                                    │
└────┴───────────────────────────────┴───────────────────────────────────────────┘
```

3. 입력 테이블:

```text
┌─id─┬──────start─┬────────end─┐
│ a  │ 2020-01-01 │ 2020-01-04 │
│ a  │ 2020-01-12 │ 2020-01-18 │
└────┴────────────┴────────────┘
```

이 예제에서는 Date 유형의 인수가 사용됩니다. 이 함수는 일 단위의 값을 반환합니다.

쿼리:

```sql
SELECT id, intervalLengthSum(start, end), toTypeName(intervalLengthSum(start, end)) FROM date_interval GROUP BY id ORDER BY id;
```

결과:

```text
┌─id─┬─intervalLengthSum(start, end)─┬─toTypeName(intervalLengthSum(start, end))─┐
│ a  │                             9 │ UInt64                                    │
└────┴───────────────────────────────┴───────────────────────────────────────────┘
```
