---
'description': '마지막 인수 값의 배열을 생성합니다.'
'sidebar_position': 142
'slug': '/sql-reference/aggregate-functions/reference/grouparraylast'
'title': 'groupArrayLast'
'doc_type': 'reference'
---


# groupArrayLast

구문: `groupArrayLast(max_size)(x)`

마지막 인수 값의 배열을 생성합니다. 예를 들어, `groupArrayLast(1)(x)`는 `[anyLast (x)]`와 동일합니다.

일부 경우에서는 여전히 실행 순서에 의존할 수 있습니다. 이는 `SELECT`가 `ORDER BY`를 사용하는 서브 쿼리에서 나오는 경우에 적용되며, 서브 쿼리 결과가 충분히 작을 때 해당됩니다.

**예시**

쿼리:

```sql
SELECT groupArrayLast(2)(number+1) numbers FROM numbers(10)
```

결과:

```text
┌─numbers─┐
│ [9,10]  │
└─────────┘
```

`groupArray`와 비교할 때:

```sql
SELECT groupArray(2)(number+1) numbers FROM numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
