---
'description': '랭크 상관 계수를 계산합니다.'
'sidebar_position': 182
'slug': '/sql-reference/aggregate-functions/reference/rankCorr'
'title': 'rankCorr'
'doc_type': 'reference'
---


# rankCorr

랭크 상관 계수를 계산합니다.

**구문**

```sql
rankCorr(x, y)
```

**인수**

- `x` — 임의의 값. [Float32](/sql-reference/data-types/float) 또는 [Float64](/sql-reference/data-types/float).
- `y` — 임의의 값. [Float32](/sql-reference/data-types/float) 또는 [Float64](/sql-reference/data-types/float).

**반환값**

- x와 y의 랭크의 랭크 상관 계수를 반환합니다. 상관 계수의 값은 -1에서 +1까지 범위입니다. 인수가 2개 미만으로 전달되면 함수는 예외를 반환합니다. +1에 가까운 값은 높은 선형 관계를 나타내며, 하나의 랜덤 변수가 증가할 때 두 번째 랜덤 변수도 증가합니다. -1에 가까운 값은 높은 선형 관계를 나타내며, 하나의 랜덤 변수가 증가할 때 두 번째 랜덤 변수가 감소합니다. 0에 가까운 값 또는 0은 두 랜덤 변수 간의 관계가 없음을 나타냅니다.

유형: [Float64](/sql-reference/data-types/float).

**예제**

쿼리:

```sql
SELECT rankCorr(number, number) FROM numbers(100);
```

결과:

```text
┌─rankCorr(number, number)─┐
│                        1 │
└──────────────────────────┘
```

쿼리:

```sql
SELECT roundBankers(rankCorr(exp(number), sin(number)), 3) FROM numbers(100);
```

결과:

```text
┌─roundBankers(rankCorr(exp(number), sin(number)), 3)─┐
│                                              -0.037 │
└─────────────────────────────────────────────────────┘
```
**참고**

- [스피어만의 랭크 상관 계수](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient)
