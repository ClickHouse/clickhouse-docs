---
'description': '두 모집단의 샘플에 Welch의 t-검정을 적용합니다.'
'sidebar_label': 'welchTTest'
'sidebar_position': 214
'slug': '/sql-reference/aggregate-functions/reference/welchttest'
'title': 'welchTTest'
'doc_type': 'reference'
---


# welchTTest

두 모집단의 샘플에 Welch의 t-검정을 적용합니다.

**구문**

```sql
welchTTest([confidence_level])(sample_data, sample_index)
```

두 샘플의 값은 `sample_data` 컬럼에 있습니다. `sample_index`가 0이면 해당 행의 값은 첫 번째 모집단의 샘플에 속합니다. 그렇지 않으면 두 번째 모집단의 샘플에 속합니다.
영가설은 모집단의 평균이 같다는 것입니다. 정규 분포가 가정됩니다. 모집단은 불균형 분산을 가질 수 있습니다.

**인수**

- `sample_data` — 샘플 데이터. [정수](../../../sql-reference/data-types/int-uint.md), [부동 소수점](../../../sql-reference/data-types/float.md) 또는 [십진수](../../../sql-reference/data-types/decimal.md).
- `sample_index` — 샘플 인덱스. [정수](../../../sql-reference/data-types/int-uint.md).

**매개변수**

- `confidence_level` — 신뢰 구간을 계산하기 위한 신뢰 수준. [부동 소수점](../../../sql-reference/data-types/float.md).

**반환값**

[튜플](../../../sql-reference/data-types/tuple.md)로 두 개 또는 네 개의 요소(선택적 `confidence_level`이 지정된 경우)를 포함합니다.

- 계산된 t-통계량. [Float64](../../../sql-reference/data-types/float.md).
- 계산된 p-값. [Float64](../../../sql-reference/data-types/float.md).
- 계산된 신뢰 구간 하한. [Float64](../../../sql-reference/data-types/float.md).
- 계산된 신뢰 구간 상한. [Float64](../../../sql-reference/data-types/float.md).

**예**

입력 테이블:

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        22.1 │            0 │
│        21.9 │            0 │
│        18.9 │            1 │
│        20.3 │            1 │
│          19 │            1 │
└─────────────┴──────────────┘
```

쿼리:

```sql
SELECT welchTTest(sample_data, sample_index) FROM welch_ttest;
```

결과:

```text
┌─welchTTest(sample_data, sample_index)─────┐
│ (2.7988719532211235,0.051807360348581945) │
└───────────────────────────────────────────┘
```

**참고**

- [Welch의 t-검정](https://en.wikipedia.org/wiki/Welch%27s_t-test)
- [studentTTest 함수](/sql-reference/aggregate-functions/reference/studentttest)
