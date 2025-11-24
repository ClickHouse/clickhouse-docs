---
'description': '연속 행 간의 산술 차이를 합산합니다.'
'sidebar_position': 129
'slug': '/sql-reference/aggregate-functions/reference/deltasum'
'title': 'deltaSum'
'doc_type': 'reference'
---


# deltaSum

연속적인 행 간의 산술 차이를 합산합니다. 차이가 음수인 경우 무시됩니다.

:::note
이 함수가 제대로 작동하려면 기본 데이터가 정렬되어 있어야 합니다. 이 함수를 [물리화된 뷰](/sql-reference/statements/create/view#materialized-view)에서 사용하고자 하는 경우, 아마도 [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) 메소드를 사용해야 할 것입니다.
:::

**구문**

```sql
deltaSum(value)
```

**인수**

- `value` — 입력 값, [정수](../../data-types/int-uint.md) 또는 [부동 소수점](../../data-types/float.md) 유형이어야 합니다.

**반환 값**

- `Integer` 또는 `Float` 유형의 산술 차이 값입니다.

**예제**

쿼리:

```sql
SELECT deltaSum(arrayJoin([1, 2, 3]));
```

결과:

```text
┌─deltaSum(arrayJoin([1, 2, 3]))─┐
│                              2 │
└────────────────────────────────┘
```

쿼리:

```sql
SELECT deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]));
```

결과:

```text
┌─deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]))─┐
│                                             7 │
└───────────────────────────────────────────────┘
```

쿼리:

```sql
SELECT deltaSum(arrayJoin([2.25, 3, 4.5]));
```

결과:

```text
┌─deltaSum(arrayJoin([2.25, 3, 4.5]))─┐
│                                2.25 │
└─────────────────────────────────────┘
```

## 참조 {#see-also}

- [runningDifference](/sql-reference/functions/other-functions#runningDifference)
