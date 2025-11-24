---
'description': '두 모집단의 샘플에 Mann-Whitney 순위 검정을 적용합니다.'
'sidebar_label': 'mannWhitneyUTest'
'sidebar_position': 161
'slug': '/sql-reference/aggregate-functions/reference/mannwhitneyutest'
'title': 'mannWhitneyUTest'
'doc_type': 'reference'
---


# mannWhitneyUTest

두 모집단에서 샘플에 대해 Mann-Whitney 순위 검정을 적용합니다.

**구문**

```sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

두 샘플의 값은 `sample_data` 컬럼에 있습니다. 만약 `sample_index`가 0이라면 해당 행의 값은 첫 번째 모집단의 샘플에 해당합니다. 그렇지 않으면 두 번째 모집단의 샘플에 속합니다. 귀무가설은 두 모집단이 확률적으로 동일하다는 것입니다. 또한 단측 가설도 검정할 수 있습니다. 이 검정은 데이터가 정규 분포를 따른다고 가정하지 않습니다.

**인수**

- `sample_data` — 샘플 데이터. [정수](../../../sql-reference/data-types/int-uint.md), [부동 소수점](../../../sql-reference/data-types/float.md) 또는 [십진수](../../../sql-reference/data-types/decimal.md).
- `sample_index` — 샘플 인덱스. [정수](../../../sql-reference/data-types/int-uint.md).

**매개변수**

- `alternative` — 대안 가설. (선택 사항, 기본값: `'two-sided'`.) [문자열](../../../sql-reference/data-types/string.md).
  - `'two-sided'`;
  - `'greater'`;
  - `'less'`.
- `continuity_correction` — 0이 아니면 p-값에 대한 정상 근사에서 연속성 보정이 적용됩니다. (선택 사항, 기본값: 1.) [UInt64](../../../sql-reference/data-types/int-uint.md).

**반환 값**

[튜플](../../../sql-reference/data-types/tuple.md) 두 요소:

- 계산된 U-통계량. [Float64](../../../sql-reference/data-types/float.md).
- 계산된 p-값. [Float64](../../../sql-reference/data-types/float.md).

**예제**

입력 테이블:

```text
┌─sample_data─┬─sample_index─┐
│          10 │            0 │
│          11 │            0 │
│          12 │            0 │
│           1 │            1 │
│           2 │            1 │
│           3 │            1 │
└─────────────┴──────────────┘
```

쿼리:

```sql
SELECT mannWhitneyUTest('greater')(sample_data, sample_index) FROM mww_ttest;
```

결과:

```text
┌─mannWhitneyUTest('greater')(sample_data, sample_index)─┐
│ (9,0.04042779918503192)                                │
└────────────────────────────────────────────────────────┘
```

**참조**

- [Mann–Whitney U test](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
- [Stochastic ordering](https://en.wikipedia.org/wiki/Stochastic_ordering)
