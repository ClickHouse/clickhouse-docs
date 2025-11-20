---
'description': '입력 값의 이동 합계를 계산합니다.'
'sidebar_position': 144
'slug': '/sql-reference/aggregate-functions/reference/grouparraymovingsum'
'title': 'groupArrayMovingSum'
'doc_type': 'reference'
---


# groupArrayMovingSum

입력 값의 이동 합계를 계산합니다.

```sql
groupArrayMovingSum(numbers_for_summing)
groupArrayMovingSum(window_size)(numbers_for_summing)
```

함수는 창 크기를 매개변수로 받을 수 있습니다. 지정하지 않으면, 함수는 컬럼의 행 수와 같은 창 크기를 사용합니다.

**인자**

- `numbers_for_summing` — 숫자 데이터 유형 값을 생성하는 [표현식](/sql-reference/syntax#expressions).
- `window_size` — 계산 창의 크기.

**반환 값**

- 입력 데이터와 같은 크기 및 유형의 배열.

**예제**

샘플 테이블:

```sql
CREATE TABLE t
(
    `int` UInt8,
    `float` Float32,
    `dec` Decimal32(2)
)
ENGINE = TinyLog
```

```text
┌─int─┬─float─┬──dec─┐
│   1 │   1.1 │ 1.10 │
│   2 │   2.2 │ 2.20 │
│   4 │   4.4 │ 4.40 │
│   7 │  7.77 │ 7.77 │
└─────┴───────┴──────┘
```

쿼리:

```sql
SELECT
    groupArrayMovingSum(int) AS I,
    groupArrayMovingSum(float) AS F,
    groupArrayMovingSum(dec) AS D
FROM t
```

```text
┌─I──────────┬─F───────────────────────────────┬─D──────────────────────┐
│ [1,3,7,14] │ [1.1,3.3000002,7.7000003,15.47] │ [1.10,3.30,7.70,15.47] │
└────────────┴─────────────────────────────────┴────────────────────────┘
```

```sql
SELECT
    groupArrayMovingSum(2)(int) AS I,
    groupArrayMovingSum(2)(float) AS F,
    groupArrayMovingSum(2)(dec) AS D
FROM t
```

```text
┌─I──────────┬─F───────────────────────────────┬─D──────────────────────┐
│ [1,3,6,11] │ [1.1,3.3000002,6.6000004,12.17] │ [1.10,3.30,6.60,12.17] │
└────────────┴─────────────────────────────────┴────────────────────────┘
```
