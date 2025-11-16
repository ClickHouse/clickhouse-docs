---
'description': '연속된 행 사이의 차이를 더합니다. 차이가 음수인 경우 무시됩니다.'
'sidebar_position': 130
'slug': '/sql-reference/aggregate-functions/reference/deltasumtimestamp'
'title': 'deltaSumTimestamp'
'doc_type': 'reference'
---

연속적인 행 간의 차이를 추가합니다. 차이가 음수인 경우 무시됩니다.

이 함수는 주로 일부 시간 버킷 정렬된 타임스탬프(예: `toStartOfMinute` 버킷)로 데이터를 저장하는 [물리화된 뷰](/sql-reference/statements/create/view#materialized-view) 용입니다. 이러한 물리화된 뷰의 행은 모두 동일한 타임스탬프를 가지므로, 원본의 반올림되지 않은 타임스탬프 값을 저장하지 않고는 올바른 순서로 병합하는 것이 불가능합니다. `deltaSumTimestamp` 함수는 본 함수가 본 값들의 원래 `timestamp`를 추적하기 때문에, 파트를 병합하는 동안 함수의 값(상태)이 올바르게 계산됩니다.

정렬된 컬렉션에서 델타 합계를 계산하려면 간단히 [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) 함수를 사용할 수 있습니다.

**구문**

```sql
deltaSumTimestamp(value, timestamp)
```

**인수**

- `value` — 입력 값. 반드시 [정수](../../data-types/int-uint.md) 형식, [부동 소수점](../../data-types/float.md) 형식, [날짜](../../data-types/date.md) 형식 또는 [날짜 및 시간](../../data-types/datetime.md) 형식이어야 합니다.
- `timestamp` — 값의 정렬을 위한 파라미터, 반드시 [정수](../../data-types/int-uint.md) 형식, [부동 소수점](../../data-types/float.md) 형식, [날짜](../../data-types/date.md) 형식 또는 [날짜 및 시간](../../data-types/datetime.md) 형식이어야 합니다.

**반환 값**

- `timestamp` 파라미터에 따라 정렬된 연속 값 간의 누적 차이입니다.

형식: [정수](../../data-types/int-uint.md) 또는 [부동 소수점](../../data-types/float.md) 또는 [날짜](../../data-types/date.md) 또는 [날짜 및 시간](../../data-types/datetime.md).

**예제**

쿼리:

```sql
SELECT deltaSumTimestamp(value, timestamp)
FROM (SELECT number AS timestamp, [0, 4, 8, 3, 0, 0, 0, 1, 3, 5][number] AS value FROM numbers(1, 10));
```

결과:

```text
┌─deltaSumTimestamp(value, timestamp)─┐
│                                  13 │
└─────────────────────────────────────┘
```
