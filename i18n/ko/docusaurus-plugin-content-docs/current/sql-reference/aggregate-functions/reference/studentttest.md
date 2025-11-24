---
'description': '두 모집단에서 샘플에 student t-test를 적용합니다.'
'sidebar_label': 'studentTTest'
'sidebar_position': 194
'slug': '/sql-reference/aggregate-functions/reference/studentttest'
'title': 'studentTTest'
'doc_type': 'reference'
---


# studentTTest

두 개의 모집단에서 샘플을 가져와 Student's t-test를 적용합니다.

**구문**

```sql
studentTTest([confidence_level])(sample_data, sample_index)
```

두 샘플의 값은 `sample_data` 컬럼에 있습니다. 만약 `sample_index`가 0이면 해당 행의 값은 첫 번째 모집단에서 가져온 샘플에 속합니다. 그렇지 않으면 두 번째 모집단에서 가져온 샘플에 속합니다.
영가설은 모집단의 평균이 같다는 것입니다. 동일한 분산을 가진 정규 분포가 가정됩니다.

**인수**

- `sample_data` — 샘플 데이터. [정수](../../../sql-reference/data-types/int-uint.md), [부동 소수점](../../../sql-reference/data-types/float.md) 또는 [십진수](../../../sql-reference/data-types/decimal.md).
- `sample_index` — 샘플 인덱스. [정수](../../../sql-reference/data-types/int-uint.md).

**매개변수**

- `confidence_level` — 신뢰 구간을 계산하기 위한 신뢰 수준. [부동 소수점](../../../sql-reference/data-types/float.md).

**반환 값**

[튜플](../../../sql-reference/data-types/tuple.md)로 두 개 또는 네 개의 요소(선택적 `confidence_level`이 지정된 경우)가 포함됩니다:

- 계산된 t-통계량. [Float64](../../../sql-reference/data-types/float.md).
- 계산된 p-값. [Float64](../../../sql-reference/data-types/float.md).
- [계산된 신뢰 구간 하한. [Float64](../../../sql-reference/data-types/float.md).]
- [계산된 신뢰 구간 상한. [Float64](../../../sql-reference/data-types/float.md).]

**예제**

입력 테이블:

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        21.1 │            0 │
│        21.9 │            1 │
│        21.7 │            0 │
│        19.9 │            1 │
│        21.8 │            1 │
└─────────────┴──────────────┘
```

쿼리:

```sql
SELECT studentTTest(sample_data, sample_index) FROM student_ttest;
```

결과:

```text
┌─studentTTest(sample_data, sample_index)───┐
│ (-0.21739130434783777,0.8385421208415731) │
└───────────────────────────────────────────┘
```

**참조**

- [Student's t-test](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [welchTTest 함수](/sql-reference/aggregate-functions/reference/welchttest)
