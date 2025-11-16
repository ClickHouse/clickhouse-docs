---
'description': '다양한 인수 값의 대략적인 수를 계산합니다.'
'sidebar_position': 205
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined'
'title': 'uniqCombined'
'doc_type': 'reference'
---


# uniqCombined

다양한 인자 값의 근사 수를 계산합니다.

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 함수는 서로 다른 값의 수를 계산하기에 좋은 선택입니다.

**인자**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)에서 셀의 수의 2를 밑으로 하는 로그. 선택적이며, `uniqCombined(x[, ...])`와 같이 함수를 사용할 수 있습니다. `HLL_precision`의 기본값은 17로, 실질적으로 96 KiB의 공간(2^17 셀, 각 셀 6비트)을 차지합니다.
- `X`: 가변 수의 매개변수. 매개변수는 `Tuple`, `Array`, `Date`, `DateTime`, `String` 또는 숫자 타입일 수 있습니다.

**반환 값**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 타입의 숫자.

**구현 세부사항**

`uniqCombined` 함수는:

- 집계의 모든 매개변수에 대해 해시(문자열의 경우 64비트 해시, 그 외의 경우 32비트 해시)를 계산한 후, 이를 계산에 사용합니다.
- 배열, 해시 테이블 및 HyperLogLog와 오류 수정 테이블의 세 가지 알고리즘 조합을 사용합니다.
  - 적은 수의 고유 요소의 경우 배열을 사용합니다. 
  - 집합 크기가 더 클 경우 해시 테이블을 사용합니다. 
  - 더 많은 요소의 경우 HyperLogLog를 사용하며, 이는 고정된 양의 메모리를 차지합니다.
- 결과를 결정적으로 제공합니다(쿼리 처리 순서에 의존하지 않음).

:::note    
비-`String` 유형에 대해 32비트 해시를 사용하기 때문에, 결과는 `UINT_MAX`보다 훨씬 큰 기수에 대해 매우 높은 오류를 가질 것입니다(몇십억 개의 고유 값 이후로 오류가 빠르게 증가함). 따라서 이 경우 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)를 사용해야 합니다.
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 함수와 비교하여, `uniqCombined` 함수는:

- 몇 배 적은 메모리를 소모합니다.
- 몇 배 더 높은 정확도로 계산합니다.
- 일반적으로 약간 낮은 성능을 가집니다. 경우에 따라 `uniqCombined`가 `uniq`보다 더 나은 성능을 발휘할 수 있습니다. 예를 들어, 네트워크를 통해 많은 수의 집계 상태를 전송하는 분산 쿼리에서 그렇습니다.

**예제**

쿼리:

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

결과:

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 1.00 million
└──────────────────────┘
```

더 큰 입력에 대한 `uniqCombined`와 `uniqCombined64`의 차이에 대한 예는 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) 섹션을 참조하세요.

**참조**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
