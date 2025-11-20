---
'description': 'bfloat16 숫자로 구성된 샘플의 근사 quantile을 계산합니다.'
'sidebar_position': 171
'slug': '/sql-reference/aggregate-functions/reference/quantilebfloat16'
'title': 'quantileBFloat16'
'doc_type': 'reference'
---


# quantileBFloat16Weighted

`quantileBFloat16`와 유사하지만 각 시퀀스 멤버의 가중치를 고려합니다.

[bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) 숫자로 구성된 샘플의 근사치 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다. `bfloat16`는 1개의 부호 비트, 8개의 지수 비트, 7개의 분수 비트를 가진 부동 소수점 데이터 유형입니다. 이 함수는 입력 값을 32비트 부동 소수점으로 변환하고 가장 중요한 16비트를 취합니다. 그런 다음 `bfloat16` 분위수 값을 계산하고 결과에 제로 비트를 추가하여 64비트 부동 소수점으로 변환합니다. 이 함수는 상대 오류가 0.390625%를 넘지 않는 빠른 분위수 추정기입니다.

**문법**

```sql
quantileBFloat16[(level)](expr)
```

별칭: `medianBFloat16`

**인수**

- `expr` — 숫자 데이터가 포함된 컬럼. [정수](../../../sql-reference/data-types/int-uint.md), [부동 소수점](../../../sql-reference/data-types/float.md).

**매개변수**

- `level` — 분위수의 수준. 선택 사항. 가능한 값은 0에서 1까지의 범위입니다. 기본 값: 0.5. [부동 소수점](../../../sql-reference/data-types/float.md).

**반환 값**

- 지정된 수준의 근사치 분위수.

유형: [Float64](/sql-reference/data-types/float).

**예시**

입력 테이블에는 정수 및 부동 소수점 컬럼이 있습니다:

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

0.75-분위수(세 번째 사분위수)를 계산하는 쿼리:

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

결과:

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
예시의 모든 부동 소수점 값은 `bfloat16`으로 변환될 때 1.0으로 잘림을 주의하세요.

**참고 자료**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
