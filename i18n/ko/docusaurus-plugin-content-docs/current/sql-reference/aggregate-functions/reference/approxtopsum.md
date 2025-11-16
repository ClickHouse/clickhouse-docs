---
'description': '지정된 컬럼에서 대략적으로 가장 빈번한 값들과 그 개수를 포함하는 배열을 반환합니다.'
'sidebar_position': 108
'slug': '/sql-reference/aggregate-functions/reference/approxtopsum'
'title': 'approx_top_sum'
'doc_type': 'reference'
---


# approx_top_sum

지정된 컬럼에서 약간의 가장 자주 발생하는 값과 그 개수를 배열로 반환합니다. 결과 배열은 값 자체가 아닌 값의 대략적인 발생 빈도의 내림차순으로 정렬됩니다. 또한 값의 가중치도 고려됩니다.

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

이 함수는 보장된 결과를 제공하지 않습니다. 특정 상황에서는 오류가 발생할 수 있으며 가장 자주 발생하는 값이 아닌 자주 발생하는 값을 반환할 수 있습니다.

`N < 10` 값을 사용하는 것을 권장합니다. 큰 `N` 값에서는 성능이 저하됩니다. `N`의 최대 값은 65536입니다.

**매개변수**

- `N` — 반환할 요소의 수. 선택 사항. 기본값: 10.
- `reserved` — 값에 대해 예약된 셀의 수를 정의합니다. 만약 uniq(column) > reserved일 경우, topK 함수의 결과는 대략적입니다. 선택 사항. 기본값: N * 3.
 
**인수**

- `column` — 빈도를 계산할 값.
- `weight` — 가중치. 모든 값은 빈도 계산을 위해 `weight` 배 만큼 고려됩니다. [UInt64](../../../sql-reference/data-types/int-uint.md).

**예시**

쿼리:

```sql
SELECT approx_top_sum(2)(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

결과:

```text
┌─approx_top_sum(2)(k, w)─┐
│ [('z',10,0),('x',5,0)]  │
└─────────────────────────┘
```

**참고**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
