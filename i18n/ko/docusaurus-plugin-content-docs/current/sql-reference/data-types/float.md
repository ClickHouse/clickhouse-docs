---
'description': 'ClickHouse에서의 부동 소수점 데이터 유형에 관한 Documentation: Float32, Float64, 및
  BFloat16'
'sidebar_label': 'Float32 | Float64 | BFloat16'
'sidebar_position': 4
'slug': '/sql-reference/data-types/float'
'title': 'Float32 | Float64 | BFloat16 유형'
'doc_type': 'reference'
---

:::note
정확한 계산이 필요하다면, 특히 높은 정밀도가 요구되는 재무 또는 비즈니스 데이터 작업 시 [Decimal](../data-types/decimal.md) 사용을 고려해야 합니다.

[Floating Point Numbers](https://en.wikipedia.org/wiki/IEEE_754)는 아래와 같이 부정확한 결과를 초래할 수 있습니다:

```sql
CREATE TABLE IF NOT EXISTS float_vs_decimal
(
   my_float Float64,
   my_decimal Decimal64(3)
)
ENGINE=MergeTree
ORDER BY tuple();


# Generate 1 000 000 random numbers with 2 decimal places and store them as a float and as a decimal
INSERT INTO float_vs_decimal SELECT round(randCanonical(), 3) AS res, res FROM system.numbers LIMIT 1000000;
```
```sql
SELECT sum(my_float), sum(my_decimal) FROM float_vs_decimal;

┌──────sum(my_float)─┬─sum(my_decimal)─┐
│ 499693.60500000004 │      499693.605 │
└────────────────────┴─────────────────┘

SELECT sumKahan(my_float), sumKahan(my_decimal) FROM float_vs_decimal;

┌─sumKahan(my_float)─┬─sumKahan(my_decimal)─┐
│         499693.605 │           499693.605 │
└────────────────────┴──────────────────────┘
```
:::

ClickHouse와 C에서의 동등한 타입은 아래와 같습니다:

- `Float32` — `float`.
- `Float64` — `double`.

ClickHouse의 Float 타입은 다음과 같은 별칭을 가지고 있습니다:

- `Float32` — `FLOAT`, `REAL`, `SINGLE`.
- `Float64` — `DOUBLE`, `DOUBLE PRECISION`.

테이블을 생성할 때, 부동 소수점 숫자에 대한 숫자 매개변수를 설정할 수 있습니다 (예: `FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`), 하지만 ClickHouse는 이를 무시합니다.

## Using floating-point numbers {#using-floating-point-numbers}

- 부동 소수점 숫자와의 계산은 반올림 오류를 발생시킬 수 있습니다.

<!-- -->

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

- 계산 결과는 계산 방법에 따라 달라집니다 (프로세서 유형 및 컴퓨터 시스템의 아키텍처).
- 부동 소수점 계산은 무한대(`Inf`) 및 "숫자가 아님"(`NaN`)과 같은 숫자를 생성할 수 있습니다. 계산 결과를 처리할 때 이를 고려해야 합니다.
- 텍스트에서 부동 소수점 숫자를 파싱할 때, 결과는 가장 가까운 머신 표현 숫자가 아닐 수 있습니다.

## NaN and Inf {#nan-and-inf}

표준 SQL과는 달리 ClickHouse는 다음 카테고리의 부동 소수점 숫자를 지원합니다:

- `Inf` – 무한대.

<!-- -->

```sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

- `-Inf` — 음의 무한대.

<!-- -->

```sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

- `NaN` — 숫자가 아님.

<!-- -->

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

`NaN` 정렬에 대한 규칙은 [ORDER BY 절](../../sql-reference/statements/select/order-by.md) 섹션을 참조하십시오.

## BFloat16 {#bfloat16}

`BFloat16`은 8비트 지수, 부호 및 7비트 가수를 가진 16비트 부동 소수점 데이터 타입입니다.
기계 학습 및 AI 응용 프로그램에 유용합니다.

ClickHouse는 `Float32`와 `BFloat16` 간의 변환을 지원하며, 이를 [`toFloat32()`](../functions/type-conversion-functions.md/#tofloat32) 또는 [`toBFloat16`](../functions/type-conversion-functions.md/#tobfloat16) 함수를 사용하여 수행할 수 있습니다.

:::note
대부분의 다른 작업은 지원되지 않습니다.
:::
