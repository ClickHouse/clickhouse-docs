---
'description': '입력 값의 이동 평균을 계산합니다.'
'sidebar_position': 144
'slug': '/sql-reference/aggregate-functions/reference/grouparraymovingavg'
'title': 'groupArrayMovingAvg'
'doc_type': 'reference'
---


# groupArrayMovingAvg

입력 값의 이동 평균을 계산합니다.

```sql
groupArrayMovingAvg(numbers_for_summing)
groupArrayMovingAvg(window_size)(numbers_for_summing)
```

이 함수는 창 크기를 매개변수로 사용할 수 있습니다. 지정하지 않으면, 함수는 컬럼의 행 수와 동일한 창 크기를 취합니다.

**인수**

- `numbers_for_summing` — 숫자 데이터 유형 값을 결과로 하는 [표현식](/sql-reference/syntax#expressions).
- `window_size` — 계산 창의 크기.

**반환 값**

- 입력 데이터와 동일한 크기와 유형의 배열.

이 함수는 [부분적으로 0으로 반올림하는](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero) 방식을 사용합니다. 결과 데이터 유형에 대해 중요하지 않은 소수 자리를 잘라냅니다.

**예제**

샘플 테이블 `b`:

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
    groupArrayMovingAvg(int) AS I,
    groupArrayMovingAvg(float) AS F,
    groupArrayMovingAvg(dec) AS D
FROM t
```

```text
┌─I─────────┬─F───────────────────────────────────┬─D─────────────────────┐
│ [0,0,1,3] │ [0.275,0.82500005,1.9250001,3.8675] │ [0.27,0.82,1.92,3.86] │
└───────────┴─────────────────────────────────────┴───────────────────────┘
```

```sql
SELECT
    groupArrayMovingAvg(2)(int) AS I,
    groupArrayMovingAvg(2)(float) AS F,
    groupArrayMovingAvg(2)(dec) AS D
FROM t
```

```text
┌─I─────────┬─F────────────────────────────────┬─D─────────────────────┐
│ [0,1,3,5] │ [0.55,1.6500001,3.3000002,6.085] │ [0.55,1.65,3.30,6.08] │
└───────────┴──────────────────────────────────┴───────────────────────┘
```
