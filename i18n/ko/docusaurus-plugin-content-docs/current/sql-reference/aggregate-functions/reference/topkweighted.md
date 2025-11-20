---
'description': '지정된 컬럼에서 대략적으로 가장 빈번한 값들의 배열을 반환합니다. 결과 배열은 값들 자체가 아닌, 값의 대략적인 빈도에
  따라 내림차순으로 정렬됩니다. 또한, 값의 가중치도 고려됩니다.'
'sidebar_position': 203
'slug': '/sql-reference/aggregate-functions/reference/topkweighted'
'title': 'topKWeighted'
'doc_type': 'reference'
---


# topKWeighted

지정된 컬럼에서 대략적으로 가장 빈번한 값을 배열로 반환합니다. 결과 배열은 값 자체가 아니라 값의 대략적인 빈도가 내림차순으로 정렬됩니다. 또한 값의 가중치도 고려됩니다.

**문법**

```sql
topKWeighted(N)(column, weight)
topKWeighted(N, load_factor)(column, weight)
topKWeighted(N, load_factor, 'counts')(column, weight)
```

**매개변수**

- `N` — 반환할 요소의 수. 선택 사항. 기본값: 10.
- `load_factor` — 값에 대해 예약된 셀의 수를 정의합니다. uniq(column) > N * load_factor일 경우, topK 함수의 결과는 대략적입니다. 선택 사항. 기본값: 3.
- `counts` — 결과가 대략적인 개수와 오류 값을 포함해야 하는지 정의합니다.

**인수**

- `column` — 값.
- `weight` — 가중치. 모든 값은 빈도 계산을 위해 `weight` 만큼 계산됩니다. [UInt64](../../../sql-reference/data-types/int-uint.md).

**반환 값**

최대 대략 가중치의 합을 가진 값의 배열을 반환합니다.

**예시**

쿼리:

```sql
SELECT topKWeighted(2)(k, w) FROM
VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

결과:

```text
┌─topKWeighted(2)(k, w)──┐
│ ['z','x']              │
└────────────────────────┘
```

쿼리:

```sql
SELECT topKWeighted(2, 10, 'counts')(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

결과:

```text
┌─topKWeighted(2, 10, 'counts')(k, w)─┐
│ [('z',10,0),('x',5,0)]              │
└─────────────────────────────────────┘
```

**참고**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
