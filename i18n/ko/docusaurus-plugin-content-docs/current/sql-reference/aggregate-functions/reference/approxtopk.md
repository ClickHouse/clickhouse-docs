---
'description': '지정된 컬럼에서 대략적으로 가장 자주 나타나는 값들과 그 개수를 포함하는 배열을 반환합니다.'
'sidebar_position': 107
'slug': '/sql-reference/aggregate-functions/reference/approxtopk'
'title': 'approx_top_k'
'doc_type': 'reference'
---


# approx_top_k

지정된 컬럼에서 대략적으로 가장 빈번한 값과 그 개수를 포함하는 배열을 반환합니다. 결과 배열은 값 자체가 아닌 값의 대략적인 빈도에 따라 내림차순으로 정렬됩니다.

```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

이 함수는 보장된 결과를 제공하지 않습니다. 특정 상황에서는 오류가 발생할 수 있으며, 가장 빈번한 값이 아닌 다른 빈번한 값을 반환할 수 있습니다.

`N < 10` 값을 사용하는 것을 권장합니다. 큰 `N` 값은 성능을 저하시킵니다. 최대 `N` 값은 65536입니다.

**매개변수**

- `N` — 반환할 요소의 수입니다. 선택 사항입니다. 기본값: 10.
- `reserved` — 값에 대해 예약된 셀 수를 정의합니다. uniq(column) > reserved인 경우 topK 함수의 결과는 대략적입니다. 선택 사항입니다. 기본값: N * 3.
 
**인수**

- `column` — 빈도를 계산할 값입니다.

**예시**

쿼리:

```sql
SELECT approx_top_k(2)(k)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10));
```

결과:

```text
┌─approx_top_k(2)(k)────┐
│ [('y',3,0),('x',1,0)] │
└───────────────────────┘
```


# approx_top_count

`approx_top_k` 함수의 별칭입니다.

**참고**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
