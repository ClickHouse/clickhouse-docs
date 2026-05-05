---
description: 'ClickHouse의 부동 소수점 데이터 타입(Float32, Float64, BFloat16)에 대한 문서입니다.'
sidebar_label: 'Float32 | Float64 | BFloat16'
sidebar_position: 4
slug: /sql-reference/data-types/float
title: 'Float32 | Float64 | BFloat16 타입'
doc_type: 'reference'
---

:::note
정확한 계산, 특히 높은 정밀도가 필요한 금융 또는 비즈니스 데이터로 작업하는 경우에는 [Decimal](../data-types/decimal.md) 사용을 고려하는 것이 좋습니다.

[부동 소수점 수(Floating Point Numbers)](https://en.wikipedia.org/wiki/IEEE_754)는 아래 예시와 같이 부정확한 결과를 초래할 수 있습니다.

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

ClickHouse와 C에서의 동일한 타입은 다음과 같습니다.

* `Float32` — `float`.
* `Float64` — `double`.

ClickHouse의 부동 소수점 타입에는 다음과 같은 별칭이 있습니다.

* `Float32` — `FLOAT`, `REAL`, `SINGLE`.
* `Float64` — `DOUBLE`, `DOUBLE PRECISION`.

테이블을 생성할 때 부동 소수점 수에 대해 숫자 매개변수(예: `FLOAT(12)`, `FLOAT(15, 22)`, `DOUBLE(12)`, `DOUBLE(4, 18)`)를 지정할 수 있지만, ClickHouse에서는 이를 무시합니다.


## 부동소수점 수 사용 \{#using-floating-point-numbers\}

* 부동소수점 수를 사용한 계산에서는 반올림 오차가 발생할 수 있습니다.

{/* */ }

```sql
SELECT 1 - 0.9

┌───────minus(1, 0.9)─┐
│ 0.09999999999999998 │
└─────────────────────┘
```

* 계산 결과는 계산 방식(컴퓨터 시스템의 프로세서 종류와 아키텍처)에 따라 달라집니다.
* 부동소수점 계산은 무한대(`Inf`)나 「숫자가 아님(Not-a-Number)」(`NaN`)과 같은 값을 결과로 생성할 수 있습니다. 계산 결과를 처리할 때 이를 고려해야 합니다.
* 텍스트에서 부동소수점 숫자를 파싱할 때, 결과가 항상 가장 가까운 기계에서 표현 가능한 값이 아닐 수 있습니다.


## NaN 및 Inf \{#nan-and-inf\}

표준 SQL과 달리 ClickHouse는 다음과 같은 부동소수점 수 범주를 지원합니다.

* `Inf` – 무한대.

{/* */ }

```sql
SELECT 0.5 / 0

┌─divide(0.5, 0)─┐
│            inf │
└────────────────┘
```

* `-Inf` — 음의 무한대입니다.

{/* */ }

```sql
SELECT -0.5 / 0

┌─divide(-0.5, 0)─┐
│            -inf │
└─────────────────┘
```

* `NaN` — 숫자가 아님(Not a Number)을 나타냅니다.

{/* */ }

```sql
SELECT 0 / 0

┌─divide(0, 0)─┐
│          nan │
└──────────────┘
```

`NaN` 정렬 규칙은 [ORDER BY 절](../../sql-reference/statements/select/order-by.md) 섹션을 참조하십시오.


## BFloat16 \{#bfloat16\}

`BFloat16`은 8비트 지수, 부호, 7비트 가수를 갖는 16비트 부동 소수점 데이터 형식입니다. 
머신 러닝 및 AI 애플리케이션에서 유용하게 사용됩니다.

ClickHouse는 `Float32`와 `BFloat16` 간의 변환을 지원하며, 
[`toFloat32()`](../functions/type-conversion-functions.md/#toFloat32) 또는 [`toBFloat16`](../functions/type-conversion-functions.md/#toBFloat16) 함수를 사용해 수행할 수 있습니다.

:::note
대부분의 다른 연산은 지원되지 않습니다.
:::