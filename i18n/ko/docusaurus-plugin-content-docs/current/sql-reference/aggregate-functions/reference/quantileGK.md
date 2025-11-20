---
'description': '숫자 데이터 시퀀스의 분위수를 Greenwald-Khanna 알고리즘을 사용하여 계산합니다.'
'sidebar_position': 175
'slug': '/sql-reference/aggregate-functions/reference/quantileGK'
'title': 'quantileGK'
'doc_type': 'reference'
---


# quantileGK

수치 데이터 시퀀스의 [분위수](https://en.wikipedia.org/wiki/Quantile)를 [Greenwald-Khanna](http://infolab.stanford.edu/~datar/courses/cs361a/papers/quantiles.pdf) 알고리즘을 사용하여 계산합니다. Greenwald-Khanna 알고리즘은 데이터 스트림에서 분위수를 매우 효율적으로 계산하기 위해 사용되는 알고리즘입니다. 이 알고리즘은 2001년 Michael Greenwald와 Sanjeev Khanna에 의해 소개되었습니다. 대규모 데이터 스트림에서 실시간으로 정확한 분위수를 계산해야 하는 데이터베이스 및 빅 데이터 시스템에서 널리 사용됩니다. 이 알고리즘은 매우 효율적이며, 항목당 O(log n) 공간과 O(log log n) 시간만 소요됩니다(여기서 n은 입력의 크기입니다). 또, 높은 확률로 근사 분위수 값을 제공하여 매우 정확합니다.

`quantileGK`는 ClickHouse의 다른 분위수 함수들과는 달리, 사용자가 근사 분위수 결과의 정확도를 제어할 수 있도록 합니다.

**문법**

```sql
quantileGK(accuracy, level)(expr)
```

별칭: `medianGK`.

**인수**

- `accuracy` — 분위수의 정확도. 상수 양의 정수. 정확도 값이 클수록 오류가 적습니다. 예를 들어, accuracy 인수가 100으로 설정되면, 계산된 분위수의 오류는 높은 확률로 1%를 넘지 않습니다. 계산된 분위수의 정확도와 알고리즘의 계산 복잡성 간에는 균형이 필요합니다. 더 큰 정확도는 분위수를 정확하게 계산하기 위해 더 많은 메모리와 계산 자원을 필요로 하며, 반면에 더 작은 정확도 인수는 더 빠르고 메모리 효율적인 계산을 가능하게 하지만 정확도가 약간 낮아질 수 있습니다.

- `level` — 분위수의 수준. 선택적 매개변수. 0에서 1 사이의 상수 부동 소수점 숫자. 기본값: 0.5. `level=0.5`에서 함수는 [중간값](https://en.wikipedia.org/wiki/Median)을 계산합니다.

- `expr` — 숫자 [데이터 유형](/sql-reference/data-types) 또는 [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과를 제공하는 컬럼 값을 위한 표현식입니다.

**반환 값**

- 지정된 수준과 정확도의 분위수입니다.

유형:

- 숫자 데이터 유형 입력에 대해 [Float64](../../../sql-reference/data-types/float.md).
- 입력 값이 `Date` 유형인 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 유형인 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예제**

```sql
SELECT quantileGK(1, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(1, 0.25)(plus(number, 1))─┐
│                                    1 │
└──────────────────────────────────────┘

SELECT quantileGK(10, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(10, 0.25)(plus(number, 1))─┐
│                                   156 │
└───────────────────────────────────────┘

SELECT quantileGK(100, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(100, 0.25)(plus(number, 1))─┐
│                                    251 │
└────────────────────────────────────────┘

SELECT quantileGK(1000, 0.25)(number + 1)
FROM numbers(1000)

┌─quantileGK(1000, 0.25)(plus(number, 1))─┐
│                                     249 │
└─────────────────────────────────────────┘
```

**참고**

- [median](sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
