---
'description': 'ClickHouse의 Decimal 데이터 타입에 대한 문서로, 구성 가능한 정밀도로 고정 소수점 산술을 제공합니다.'
'sidebar_label': 'Decimal'
'sidebar_position': 6
'slug': '/sql-reference/data-types/decimal'
'title': 'Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S),
  Decimal256(S)'
'doc_type': 'reference'
---


# Decimal, Decimal(P), Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

정수 부분과 소수 부분의 정밀도를 유지하는 고정소수점 수입니다. 나눗셈의 경우 가장 낮은 자리 수는 폐기됩니다(반올림되지 않음).

## Parameters {#parameters}

- P - 정밀도. 유효 범위: \[ 1 : 76 \]. 숫자가 가질 수 있는 소수 자릿수의 총 개수를 결정합니다(소수 부분 포함). 기본적으로 정밀도는 10입니다.
- S - 스케일. 유효 범위: \[ 0 : P \]. 소수 부분이 가질 수 있는 자릿수의 개수를 결정합니다.

Decimal(P)는 Decimal(P, 0)에 해당합니다. 비슷하게, Decimal 구문은 Decimal(10, 0)에 해당합니다.

P 매개변수 값에 따라 Decimal(P, S)은 다음과 같은 동의어입니다:
- P가 \[ 1 : 9 \]인 경우 - Decimal32(S)
- P가 \[ 10 : 18 \]인 경우 - Decimal64(S)
- P가 \[ 19 : 38 \]인 경우 - Decimal128(S)
- P가 \[ 39 : 76 \]인 경우 - Decimal256(S)

## Decimal Value Ranges {#decimal-value-ranges}

- Decimal(P, S) - ( -1 \* 10^(P - S), 1 \* 10^(P - S) )
- Decimal32(S) - ( -1 \* 10^(9 - S), 1 \* 10^(9 - S) )
- Decimal64(S) - ( -1 \* 10^(18 - S), 1 \* 10^(18 - S) )
- Decimal128(S) - ( -1 \* 10^(38 - S), 1 \* 10^(38 - S) )
- Decimal256(S) - ( -1 \* 10^(76 - S), 1 \* 10^(76 - S) )

예를 들어, Decimal32(4)는 -99999.9999 부터 99999.9999 까지 0.0001의 단계로 숫자를 포함할 수 있습니다.

## Internal Representation {#internal-representation}

내부적으로 데이터는 해당 비트 폭을 가진 정상 부호 정수로 표현됩니다. 메모리에 저장할 수 있는 실제 값 범위는 위에서 지정된 것보다 약간 더 큽니다. 이는 문자열에서 변환할 때만 확인됩니다.

현대 CPU가 128비트 및 256비트 정수를 기본적으로 지원하지 않기 때문에 Decimal128 및 Decimal256에 대한 연산은 에뮬레이션됩니다. 따라서 Decimal128 및 Decimal256은 Decimal32/Decimal64보다 상당히 느리게 작동합니다.

## Operations and Result Type {#operations-and-result-type}

Decimal에 대한 이항 연산은 더 넓은 결과 유형을 생성합니다(인수의 순서와 상관없이).

- `Decimal64(S1) <op> Decimal32(S2) -> Decimal64(S)`
- `Decimal128(S1) <op> Decimal32(S2) -> Decimal128(S)`
- `Decimal128(S1) <op> Decimal64(S2) -> Decimal128(S)`
- `Decimal256(S1) <op> Decimal<32|64|128>(S2) -> Decimal256(S)`

스케일에 대한 규칙:

- 더하기, 빼기: S = max(S1, S2).
- 곱하기: S = S1 + S2.
- 나누기: S = S1.

Decimal과 정수 간의 유사한 연산의 결과는 인수와 같은 크기의 Decimal입니다.

Decimal과 Float32/Float64 간의 연산은 정의되어 있지 않습니다. 필요할 경우, toDecimal32, toDecimal64, toDecimal128 또는 toFloat32, toFloat64 내장 함수를 사용하여 명시적으로 인수 중 하나를 캐스팅할 수 있습니다. 결과는 정밀도를 잃게 되며, 유형 변환은 컴퓨팅 비용이 많이 드는 작업임을 유의하십시오.

Decimal에 대한 일부 함수는 결과를 Float64로 반환합니다(예: var 또는 stddev). 중간 계산은 여전히 Decimal로 수행될 수 있으며, 이로 인해 동일한 값을 가진 Float64와 Decimal 입력 간의 결과가 다를 수 있습니다.

## Overflow Checks {#overflow-checks}

Decimal에서 계산할 때 정수 오버플로우가 발생할 수 있습니다. 소수 부분의 과도한 자릿수는 폐기됩니다(반올림되지 않음). 정수 부분의 과도한 자릿수는 예외를 발생시킵니다.

:::warning
Decimal128 및 Decimal256에 대해 오버플로우 검사는 구현되지 않았습니다. 오버플로우가 발생할 경우 잘못된 결과가 반환되며, 예외가 발생하지 않습니다.
:::

```sql
SELECT toDecimal32(2, 4) AS x, x / 3
```

```text
┌──────x─┬─divide(toDecimal32(2, 4), 3)─┐
│ 2.0000 │                       0.6666 │
└────────┴──────────────────────────────┘
```

```sql
SELECT toDecimal32(4.2, 8) AS x, x * x
```

```text
DB::Exception: Scale is out of bounds.
```

```sql
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
DB::Exception: Decimal math overflow.
```

오버플로우 검사는 연산 속도를 느리게 합니다. 오버플로우가 발생하지 않는 것이 확실할 경우, `decimal_check_overflow` 설정을 사용하여 검사를 비활성화하는 것이 바람직합니다. 검사가 비활성화되고 오버플로우가 발생하면 결과는 잘못됩니다:

```sql
SET decimal_check_overflow = 0;
SELECT toDecimal32(4.2, 8) AS x, 6 * x
```

```text
┌──────────x─┬─multiply(6, toDecimal32(4.2, 8))─┐
│ 4.20000000 │                     -17.74967296 │
└────────────┴──────────────────────────────────┘
```

오버플로우 검사는 산술 연산뿐만 아니라 값 비교에서도 발생합니다:

```sql
SELECT toDecimal32(1, 8) < 100
```

```text
DB::Exception: Can't compare.
```

**참고**
- [isDecimalOverflow](/sql-reference/functions/other-functions#isDecimalOverflow)
- [countDigits](/sql-reference/functions/other-functions#countDigits)
