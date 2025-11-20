---
'description': '히스토그램의 분위수를 선형 보간법을 사용하여 계산합니다.'
'sidebar_position': 364
'slug': '/sql-reference/aggregate-functions/reference/quantilePrometheusHistogram'
'title': 'quantilePrometheusHistogram'
'doc_type': 'reference'
---


# quantilePrometheusHistogram

히스토그램의 [분위수](https://en.wikipedia.org/wiki/Quantile)를 선형 보간법을 사용하여 계산하며, 각 히스토그램 버킷의 누적 값과 상한을 고려합니다.

보간된 값을 얻기 위해, 모든 전달된 값은 배열로 결합되어 해당 버킷 상한 값을 기준으로 정렬됩니다. 분산 보간은 기본 히스토그램의 PromQL [histogram_quantile()](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile) 함수와 유사하게 수행되며, 분위수 위치가 발견된 버킷의 하한 및 상한을 사용하여 선형 보간을 수행합니다.

**구문**

```sql
quantilePrometheusHistogram(level)(bucket_upper_bound, cumulative_bucket_value)
```

**인자**

- `level` — 분위수의 수준. 선택적 파라미터. 0에서 1 사이의 상수 부동 소수점 숫자. 우리는 `[0.01, 0.99]` 범위 내의 `level` 값을 사용하는 것을 권장합니다. 기본값: `0.5`. `level=0.5`에서 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.

- `bucket_upper_bound` — 히스토그램 버킷의 상한.

  - 가장 높은 버킷은 `+Inf`의 상한을 가져야 합니다.

- `cumulative_bucket_value` — 히스토그램 버킷의 누적 [UInt](../../../sql-reference/data-types/int-uint) 또는 [Float64](../../../sql-reference/data-types/float.md) 값.

  - 값은 버킷 상한이 증가함에 따라 단조롭게 증가해야 합니다.

**반환 값**

- 지정된 수준의 분위수.

유형:

- `Float64`.

**예시**

입력 테이블:

```text
   ┌─bucket_upper_bound─┬─cumulative_bucket_value─┐
1. │                  0 │                       6 │
2. │                0.5 │                      11 │
3. │                  1 │                      14 │
4. │                inf │                      19 │
   └────────────────────┴─────────────────────────┘
```

결과:

```text
   ┌─quantilePrometheusHistogram(bucket_upper_bound, cumulative_bucket_value)─┐
1. │                                                                     0.35 │
   └──────────────────────────────────────────────────────────────────────────┘
```

**참고**

- [중앙값](/sql-reference/aggregate-functions/reference/median)
- [분위수](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
