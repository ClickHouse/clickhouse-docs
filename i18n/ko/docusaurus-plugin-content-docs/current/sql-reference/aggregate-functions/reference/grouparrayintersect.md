---
'description': '주어진 배열의 교차점을 반환합니다 (주어진 모든 배열에 있는 배열의 모든 항목을 반환합니다).'
'sidebar_position': 141
'slug': '/sql-reference/aggregate-functions/reference/grouparrayintersect'
'title': 'groupArrayIntersect'
'doc_type': 'reference'
---


# groupArrayIntersect

주어진 배열의 교집합을 반환합니다 (모든 주어진 배열에 있는 항목을 반환합니다).

**문법**

```sql
groupArrayIntersect(x)
```

**인수**

- `x` — 인수 (컬럼 이름 또는 표현식).

**반환값**

- 모든 배열에 있는 요소를 포함하는 배열.

유형: [Array](../../data-types/array.md).

**예제**

테이블 `numbers`를 고려하세요:

```text
┌─a──────────────┐
│ [1,2,4]        │
│ [1,5,2,8,-1,0] │
│ [1,5,7,5,8,2]  │
└────────────────┘
```

컬럼 이름을 인수로 한 쿼리:

```sql
SELECT groupArrayIntersect(a) AS intersection FROM numbers;
```

결과:

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
