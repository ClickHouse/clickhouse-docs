---
'description': '단순 (일차원) 선형 회귀를 수행합니다.'
'sidebar_position': 183
'slug': '/sql-reference/aggregate-functions/reference/simplelinearregression'
'title': 'simpleLinearRegression'
'doc_type': 'reference'
---


# simpleLinearRegression

단순 (1차원) 선형 회귀를 수행합니다.

```sql
simpleLinearRegression(x, y)
```

매개변수:

- `x` — 독립 변수 값이 포함된 컬럼.
- `y` — 종속 변수 값이 포함된 컬럼.

반환 값:

결과 선의 상수 `(k, b)`는 `y = k*x + b`입니다.

**예제**

```sql
SELECT arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [0, 1, 2, 3])
```

```text
┌─arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [0, 1, 2, 3])─┐
│ (1,0)                                                             │
└───────────────────────────────────────────────────────────────────┘
```

```sql
SELECT arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [3, 4, 5, 6])
```

```text
┌─arrayReduce('simpleLinearRegression', [0, 1, 2, 3], [3, 4, 5, 6])─┐
│ (1,3)                                                             │
└───────────────────────────────────────────────────────────────────┘
```
