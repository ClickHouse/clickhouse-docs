---
'description': '하나의 경로로 분산 분석(ANOVA 테스트)을 위한 통계적 검정을 제공합니다. 이는 여러 개의 정규 분포 관측치 그룹에
  대한 테스트로, 모든 그룹이 동일한 평균을 가지는지 여부를 판별하는 데 사용됩니다.'
'sidebar_position': 101
'slug': '/sql-reference/aggregate-functions/reference/analysis_of_variance'
'title': 'analysisOfVariance'
'doc_type': 'reference'
---


# analysisOfVariance

일원 분산 분석(ANOVA 테스트)을 위한 통계적 테스트를 제공합니다. 이는 여러 개의 정규 분포 관측값 그룹을 통해 모든 그룹의 평균이 같은지 여부를 확인하는 테스트입니다.

**구문**

```sql
analysisOfVariance(val, group_no)
```

별칭: `anova`

**매개변수**
- `val`: 값.
- `group_no`: `val`이 속하는 그룹 번호.

:::note
그룹은 0부터 시작하여 테스트를 수행하기 위해서는 최소 두 개의 그룹이 필요합니다.
관측값이 하나 이상인 그룹이 최소 하나 이상 있어야 합니다.
:::

**반환 값**

- `(f_statistic, p_value)`. [Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md), [Float64](../../data-types/float.md)).

**예시**

쿼리:

```sql
SELECT analysisOfVariance(number, number % 2) FROM numbers(1048575);
```

결과:

```response
┌─analysisOfVariance(number, modulo(number, 2))─┐
│ (0,1)                                         │
└───────────────────────────────────────────────┘
```
