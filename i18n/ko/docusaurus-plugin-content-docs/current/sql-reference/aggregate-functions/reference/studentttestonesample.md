---
'description': '주어진 샘플과 알려진 모집단 평균에 대해 일표본 Student t-검정을 적용합니다.'
'sidebar_label': 'studentTTestOneSample'
'sidebar_position': 195
'slug': '/sql-reference/aggregate-functions/reference/studentttestonesample'
'title': 'studentTTestOneSample'
'doc_type': 'reference'
---


# studentTTestOneSample

일표본 Student의 t-검정을 적용하여 표본의 평균이 알려진 모평균과 차이가 있는지를 판단합니다.

정규성을 가정합니다. 귀무가설은 표본 평균이 모평균과 같다는 것입니다.

**구문**

```sql
studentTTestOneSample([confidence_level])(sample_data, population_mean)
```

선택적 `confidence_level`은 신뢰 구간 계산을 가능하게 합니다.

**인수**

- `sample_data` — 표본 데이터. 정수, 실수 또는 소수점.
- `population_mean` — 테스트할 알려진 모평균. 정수, 실수 또는 소수점 (일반적으로 상수).

**매개변수**

- `confidence_level` — 신뢰 구간에 대한 신뢰 수준. (0, 1) 범위의 실수.

노트:
- 최소 2개의 관측치가 필요합니다. 그렇지 않으면 결과는 `(nan, nan)`가 되며 (요청된 경우 간격도 `nan`입니다).
- 상수 또는 거의 상수인 입력은 제로(또는 효과적으로 제로) 표준 오차로 인해 `nan`을 반환합니다.

**반환 값**

[Tuple](../../../sql-reference/data-types/tuple.md)로 두 개 또는 네 개의 요소가 포함됩니다 (만약 `confidence_level`이 지정된 경우):

- 계산된 t-통계량. Float64.
- 계산된 p-값 (양측). Float64.
- 계산된 신뢰 구간 하한. Float64. (선택적)
- 계산된 신뢰 구간 상한. Float64. (선택적)

신뢰 구간은 주어진 신뢰 수준에서의 표본 평균에 대한 것입니다.

**예시**

입력 테이블:

```text
┌─value─┐
│  20.3 │
│  21.1 │
│  21.7 │
│  19.9 │
│  21.8 │
└───────┘
```

신뢰 구간 없이:

```sql
SELECT studentTTestOneSample()(value, 20.0) FROM t;
-- or simply
SELECT studentTTestOneSample(value, 20.0) FROM t;
```

신뢰 구간 포함 (95%):

```sql
SELECT studentTTestOneSample(0.95)(value, 20.0) FROM t;
```

**참조**

- [Student의 t-검정](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [studentTTest 함수](/sql-reference/aggregate-functions/reference/studentttest)
