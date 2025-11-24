---
'description': '`cramersV` 함수의 결과는 0 (변수 간에 연관성이 없음을 나타냄)에서 1까지 범위를 가지며, 각 값이 서로에
  의해 완전히 결정될 때만 1에 도달할 수 있습니다. 이는 두 변수 간의 연관성을 최대 가능한 변화의 백분율로 볼 수 있습니다.'
'sidebar_position': 127
'slug': '/sql-reference/aggregate-functions/reference/cramersv'
'title': 'cramersV'
'doc_type': 'reference'
---


# cramersV

[Cramer's V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V) (가끔 Cramer's phi라고도 불립니다) 는 테이블의 두 컬럼 간의 연관성을 측정하는 값입니다. `cramersV` 함수의 결과는 0(변수 간의 연관성이 없음에 해당)에서 1까지 범위이며, 각 값이 서로에 의해 완전히 결정될 때에만 1에 도달할 수 있습니다. 이는 두 변수 간의 연관성을 최대 가능한 변동성의 백분율로 볼 수 있습니다.

:::note
Cramer's V의 편향 보정 버전은 다음을 참조하세요: [cramersVBiasCorrected](./cramersvbiascorrected.md)
:::

**구문**

```sql
cramersV(column1, column2)
```

**매개변수**

- `column1`: 비교할 첫 번째 컬럼.
- `column2`: 비교할 두 번째 컬럼.

**반환 값**

- 0(컬럼 값 간의 연관성이 없음에 해당)에서 1(완전한 연관성) 사이의 값.

유형: 항상 [Float64](../../../sql-reference/data-types/float.md).

**예제**

아래에서 비교되는 두 컬럼은 서로 간에 연관성이 없으므로 `cramersV` 결과는 0입니다:

쿼리:

```sql
SELECT
    cramersV(a, b)
FROM
    (
        SELECT
            number % 3 AS a,
            number % 5 AS b
        FROM
            numbers(150)
    );
```

결과:

```response
┌─cramersV(a, b)─┐
│              0 │
└────────────────┘
```

아래의 두 컬럼은 꽤 밀접한 연관성을 가지고 있어 `cramersV` 결과는 높은 값입니다:

```sql
SELECT
    cramersV(a, b)
FROM
    (
        SELECT
            number % 10 AS a,
            if(number % 12 = 0, (number + 1) % 5, number % 5) AS b
        FROM
            numbers(150)
    );
```

결과:

```response
┌─────cramersV(a, b)─┐
│ 0.9066801892162646 │
└────────────────────┘
```
