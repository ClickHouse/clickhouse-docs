---
'description': '오름차순으로 첫 N 항목이 포함된 배열을 반환합니다.'
'sidebar_position': 146
'slug': '/sql-reference/aggregate-functions/reference/grouparraysorted'
'title': 'groupArraySorted'
'doc_type': 'reference'
---


# groupArraySorted

오름차순으로 정렬된 처음 N 항목이 포함된 배열을 반환합니다.

```sql
groupArraySorted(N)(column)
```

**인수**

- `N` – 반환할 요소의 수입니다.

- `column` – 값 (정수, 문자열, 부동 소수점 및 기타 일반 유형).

**예제**

처음 10개의 숫자를 가져옵니다:

```sql
SELECT groupArraySorted(10)(number) FROM numbers(100)
```

```text
┌─groupArraySorted(10)(number)─┐
│ [0,1,2,3,4,5,6,7,8,9]        │
└──────────────────────────────┘
```

열의 모든 숫자의 문자열 구현을 가져옵니다:

```sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) AS str FROM numbers(5));
```

```text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
```
