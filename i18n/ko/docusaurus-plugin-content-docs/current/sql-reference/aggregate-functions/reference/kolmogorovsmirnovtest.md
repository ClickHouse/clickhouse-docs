---
'description': '두 모집단의 샘플에 Kolmogorov-Smirnov 테스트를 적용합니다.'
'sidebar_label': 'kolmogorovSmirnovTest'
'sidebar_position': 156
'slug': '/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest'
'title': 'kolmogorovSmirnovTest'
'doc_type': 'reference'
---


# kolmogorovSmirnovTest

두 모집단의 샘플에 Kolmogorov-Smirnov 테스트를 적용합니다.

**구문**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

두 샘플의 값은 `sample_data` 열에 있습니다. `sample_index`가 0이면 해당 행의 값은 첫 번째 모집단의 샘플에 해당합니다. 그렇지 않으면 두 번째 모집단의 샘플에 해당합니다.
샘플은 연속적인 일차원 확률 분포에 속해야 합니다.

**인수**

- `sample_data` — 샘플 데이터. [정수](../../../sql-reference/data-types/int-uint.md), [부동 소수점](../../../sql-reference/data-types/float.md) 또는 [십진법](../../../sql-reference/data-types/decimal.md).
- `sample_index` — 샘플 인덱스. [정수](../../../sql-reference/data-types/int-uint.md).

**매개변수**

- `alternative` — 대립 가설. (선택 사항, 기본값: `'two-sided'`.) [문자열](../../../sql-reference/data-types/string.md).
    F(x)와 G(x)를 첫 번째와 두 번째 분포의 CDF라고 하겠습니다.
  - `'two-sided'`
        귀무 가설은 샘플이 동일한 분포에서 나왔다고 가정합니다. 즉, 모든 x에 대해 `F(x) = G(x)`입니다.
        대립 가설은 분포가 동일하지 않다는 것입니다.
  - `'greater'`
        귀무 가설은 첫 번째 샘플의 값이 두 번째 샘플의 값보다 *확률적으로 작다*는 것입니다.
        즉, 첫 번째 분포의 CDF가 두 번째 분포의 CDF 위에 있고 따라서 왼쪽에 위치합니다.
        이는 실제로 모든 x에 대해 `F(x) >= G(x)`를 의미합니다. 이 경우 대립 가설은 적어도 하나의 x에 대해 `F(x) < G(x)`입니다.
  - `'less'`.
        귀무 가설은 첫 번째 샘플의 값이 두 번째 샘플의 값보다 *확률적으로 크다*는 것입니다.
        즉, 첫 번째 분포의 CDF가 두 번째 분포의 CDF 아래에 있고 따라서 오른쪽에 위치합니다.
        이는 실제로 모든 x에 대해 `F(x) <= G(x)`를 의미합니다. 이 경우 대립 가설은 적어도 하나의 x에 대해 `F(x) > G(x)`입니다.
- `computation_method` — p-값을 계산하는 데 사용되는 방법. (선택 사항, 기본값: `'auto'`.) [문자열](../../../sql-reference/data-types/string.md).
  - `'exact'` - 테스트 통계량의 정확한 확률 분포를 사용하여 계산이 수행됩니다. 샘플이 작을 때를 제외하고는 계산 집약적이며 낭비가 발생합니다.
  - `'asymp'` (`'asymptotic'`) - 근사를 사용하여 계산이 수행됩니다. 샘플 크기가 클 경우, 정확한 p-값과 비대칭 p-값은 매우 유사합니다.
  - `'auto'`  - 최대 샘플 수가 10'000 미만일 때 `'exact'` 방법이 사용됩니다.

**반환 값**

[튜플](../../../sql-reference/data-types/tuple.md) 형식으로 두 요소가 반환됩니다:

- 계산된 통계량. [Float64](../../../sql-reference/data-types/float.md).
- 계산된 p-값. [Float64](../../../sql-reference/data-types/float.md).

**예제**

쿼리:

```sql
SELECT kolmogorovSmirnovTest('less', 'exact')(value, num)
FROM
(
    SELECT
        randNormal(0, 10) AS value,
        0 AS num
    FROM numbers(10000)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(10000)
)
```

결과:

```text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

참고:
p-값이 0.05보다 커서(95% 신뢰 수준에서) 귀무 가설을 기각하지 않습니다.

쿼리:

```sql
SELECT kolmogorovSmirnovTest('two-sided', 'exact')(value, num)
FROM
(
    SELECT
        randStudentT(10) AS value,
        0 AS num
    FROM numbers(100)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(100)
)
```

결과:

```text
┌─kolmogorovSmirnovTest('two-sided', 'exact')(value, num)─┐
│ (0.4100000000000002,6.61735760482795e-8)                │
└─────────────────────────────────────────────────────────┘
```

참고:
p-값이 0.05보다 작아서(95% 신뢰 수준에서) 귀무 가설을 기각합니다.

**참조**

- [Kolmogorov-Smirnov'test](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)
