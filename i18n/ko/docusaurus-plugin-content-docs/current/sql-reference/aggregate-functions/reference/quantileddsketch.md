---
'description': '샘플의 대략적인 분위수를 상대 오차 보장을 가지고 계산합니다.'
'sidebar_position': 171
'slug': '/sql-reference/aggregate-functions/reference/quantileddsketch'
'title': 'quantileDD'
'doc_type': 'reference'
---

샘플의 대략적인 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산하며 상대 오차 보장이 제공됩니다. 이 기능은 [DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf)를 구축하여 작동합니다.

**구문**

```sql
quantileDD(relative_accuracy, [level])(expr)
```

**인수**

- `expr` — 숫자 데이터가 있는 컬럼. [정수](../../../sql-reference/data-types/int-uint.md), [부동 소수점](../../../sql-reference/data-types/float.md).

**매개변수**

- `relative_accuracy` — 분위수의 상대 정확도. 가능한 값은 0에서 1 사이입니다. [부동 소수점](../../../sql-reference/data-types/float.md). 스케치의 크기는 데이터의 범위와 상대 정확도에 따라 다릅니다. 범위가 클수록 상대 정확도가 작을수록 스케치의 크기가 커집니다. 스케치의 대략적인 메모리 크기는 `log(max_value/min_value)/relative_accuracy`입니다. 권장 값은 0.001 이상입니다.

- `level` — 분위수의 수준. 선택 사항. 가능한 값은 0에서 1 사이입니다. 기본값: 0.5. [부동 소수점](../../../sql-reference/data-types/float.md).

**반환 값**

- 지정된 수준의 대략적인 분위수.

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
SELECT quantileDD(0.01, 0.75)(a), quantileDD(0.01, 0.75)(b) FROM example_table;
```

결과:

```text
┌─quantileDD(0.01, 0.75)(a)─┬─quantileDD(0.01, 0.75)(b)─┐
│               2.974233423476717 │                            1.01 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**참고**

- [중간 값](/sql-reference/aggregate-functions/reference/median)
- [분위수들](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
