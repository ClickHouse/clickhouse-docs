---
'description': '데이터 세트의 샘플 분산을 계산합니다.'
'sidebar_position': 212
'slug': '/sql-reference/aggregate-functions/reference/varSamp'
'title': 'varSamp'
'doc_type': 'reference'
---

## varSamp {#varsamp}

데이터 세트의 샘플 분산을 계산합니다.

**구문**

```sql
varSamp(x)
```

별칭: `VAR_SAMP`.

**매개변수**

- `x`: 샘플 분산을 계산하고자 하는 모집단. [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md).

**반환 값**

- 입력 데이터 세트 `x`의 샘플 분산을 반환합니다. [Float64](../../data-types/float.md).

**구현 세부정보**

`varSamp` 함수는 다음 공식을 사용하여 샘플 분산을 계산합니다:

$$
\sum\frac{(x - \text{mean}(x))^2}{(n - 1)}
$$

여기서:

- `x`는 데이터 세트의 각 개별 데이터 포인트입니다.
- `mean(x)`는 데이터 세트의 산술 평균입니다.
- `n`은 데이터 세트의 데이터 포인트 수입니다.

이 함수는 입력 데이터 세트가 더 큰 모집단의 샘플을 나타낸다고 가정합니다. 전체 모집단의 분산을 계산하려는 경우 (전체 데이터 세트가 있을 때) [`varPop`](../reference/varpop.md)를 사용해야 합니다.

**예제**

쿼리:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x Float64
)
ENGINE = Memory;

INSERT INTO test_data VALUES (10.5), (12.3), (9.8), (11.2), (10.7);

SELECT round(varSamp(x),3) AS var_samp FROM test_data;
```

응답:

```response
┌─var_samp─┐
│    0.865 │
└──────────┘
```
