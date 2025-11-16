---
'description': '지정된 컬럼에서 대략적으로 가장 빈번한 값들의 배열을 반환합니다. 결과 배열은 값들 자체가 아닌 값들의 대략적인 빈도에
  따라 내림차순으로 정렬됩니다.'
'sidebar_position': 202
'slug': '/sql-reference/aggregate-functions/reference/topk'
'title': 'topK'
'doc_type': 'reference'
---


# topK

지정된 컬럼에서 대략적으로 가장 빈번한 값들의 배열을 반환합니다. 결과 배열은 값 자체가 아닌 값의 대략적인 빈도에 따라 내림차순으로 정렬됩니다.

[Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) 알고리즘을 구현하여 TopK를 분석하며, 이는 [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003) 알고리즘의 reduce-and-combine 알고리즘을 기반으로 합니다.

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

이 함수는 보장된 결과를 제공하지 않습니다. 특정 상황에서는 오류가 발생할 수 있으며, 가장 빈번한 값이 아닌 빈번한 값을 반환할 수 있습니다.

`N < 10` 값을 사용하는 것을 권장합니다. 큰 `N` 값에서는 성능이 저하됩니다. 최대 `N` 값은 65536입니다.

**매개변수**

- `N` — 반환할 요소의 수. 선택적입니다. 기본값: 10.
- `load_factor` — 값에 대해 예약된 셀의 수를 정의합니다. uniq(column) > N * load_factor 일 경우, topK 함수의 결과는 대략적입니다. 선택적입니다. 기본값: 3.
- `counts` — 결과에 대략적인 개수와 오류 값을 포함해야 하는지를 정의합니다.

**인수**

- `column` — 빈도를 계산할 값입니다.

**예제**

[OnTime](../../../getting-started/example-datasets/ontime.md) 데이터 세트를 사용하여 `AirlineID` 컬럼에서 가장 빈번하게 발생하는 세 가지 값을 선택합니다.

```sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

```text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**관련 항목**

- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
