---
'description': '두 모집단의 샘플에 대해 평균 z-검정을 적용합니다.'
'sidebar_label': 'meanZTest'
'sidebar_position': 166
'slug': '/sql-reference/aggregate-functions/reference/meanztest'
'title': 'meanZTest'
'doc_type': 'reference'
---


# meanZTest

두 모집단의 샘플에 mean z-test를 적용합니다.

**구문**

```sql
meanZTest(population_variance_x, population_variance_y, confidence_level)(sample_data, sample_index)
```

두 샘플의 값은 `sample_data` 컬럼에 있습니다. `sample_index`가 0일 경우 해당 행의 값은 첫 번째 모집단의 샘플에 속합니다. 그렇지 않으면 두 번째 모집단의 샘플에 속합니다.
영가설은 모집단의 평균이 같다는 것입니다. 정규 분포를 가정합니다. 모집단은 불균형 분산을 가질 수 있으며, 분산은 알려져 있습니다.

**인수**

- `sample_data` — 샘플 데이터. [정수](../../../sql-reference/data-types/int-uint.md), [부동 소수점](../../../sql-reference/data-types/float.md) 또는 [십진수](../../../sql-reference/data-types/decimal.md).
- `sample_index` — 샘플 인덱스. [정수](../../../sql-reference/data-types/int-uint.md).

**파라미터**

- `population_variance_x` — 모집단 x의 분산. [부동 소수점](../../../sql-reference/data-types/float.md).
- `population_variance_y` — 모집단 y의 분산. [부동 소수점](../../../sql-reference/data-types/float.md).
- `confidence_level` — 신뢰 구간을 계산하기 위한 신뢰 수준. [부동 소수점](../../../sql-reference/data-types/float.md).

**반환 값**

[튜플](../../../sql-reference/data-types/tuple.md)로 네 개의 요소가 포함됩니다:

- 계산된 t-통계량. [Float64](../../../sql-reference/data-types/float.md).
- 계산된 p-값. [Float64](../../../sql-reference/data-types/float.md).
- 계산된 신뢰 구간 하한. [Float64](../../../sql-reference/data-types/float.md).
- 계산된 신뢰 구간 상한. [Float64](../../../sql-reference/data-types/float.md).

**예시**

입력 테이블:

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        21.9 │            0 │
│        22.1 │            0 │
│        18.9 │            1 │
│          19 │            1 │
│        20.3 │            1 │
└─────────────┴──────────────┘
```

쿼리:

```sql
SELECT meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index) FROM mean_ztest
```

결과:

```text
┌─meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index)────────────────────────────┐
│ (3.2841296025548123,0.0010229786769086013,0.8198428246768334,3.2468238419898365) │
└──────────────────────────────────────────────────────────────────────────────────┘
```
