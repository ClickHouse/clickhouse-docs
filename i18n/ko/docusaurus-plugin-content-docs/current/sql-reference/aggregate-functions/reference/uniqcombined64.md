---
'description': '다양한 인수 값의 대략적인 수를 계산합니다. 이는 uniqCombined과 동일하지만, String 데이터 유형뿐만 아니라
  모든 데이터 유형에 대해 64비트 해시를 사용합니다.'
'sidebar_position': 206
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined64'
'title': 'uniqCombined64'
'doc_type': 'reference'
---


# uniqCombined64

정확한 서로 다른 인수 값의 수를 계산합니다. 이는 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)과 동일하지만, String 데이터 유형에 대해서만 64비트 해시를 사용하는 대신 모든 데이터 유형에 대해 64비트 해시를 사용합니다.

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**매개변수**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)에서 셀 수의 이진 로그입니다. 선택적으로 `uniqCombined64(x[, ...])` 형식으로 함수를 사용할 수 있습니다. `HLL_precision`의 기본값은 17이며, 이는 사실상 96 KiB의 공간(2^17 셀, 셀당 6 비트)을 의미합니다.
- `X`: 가변 개수의 매개변수. 매개변수는 `Tuple`, `Array`, `Date`, `DateTime`, `String` 또는 숫자 유형이 될 수 있습니다.

**반환 값**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 유형의 숫자.

**구현 세부 사항**

`uniqCombined64` 함수:
- 집계의 모든 매개변수에 대해 해시(모든 데이터 유형에 대한 64비트 해시)를 계산한 다음, 이를 계산에 사용합니다.
- 배열, 해시 테이블 및 오류 수정 테이블이 포함된 HyperLogLog의 세 가지 알고리즘 조합을 사용합니다.
  - 적은 수의 고유 요소에 대해 배열이 사용됩니다.
  - 집합 크기가 더 클 때는 해시 테이블이 사용됩니다.
  - 더 많은 요소에 대해 HyperLogLog가 사용되며, 이는 고정된 메모리 양을 차지합니다.
- 결과는 결정론적으로 제공됩니다(쿼리 처리 순서에 의존하지 않음).

:::note
모든 유형에 대해 64비트 해시를 사용하므로 결과가 `UINT_MAX`보다 상당히 큰 카디널리티에 대해 매우 높은 오류를 겪지 않습니다. 이는 non-`String` 유형에 대해 32비트 해시를 사용하는 [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md)와 다릅니다.
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 함수와 비교하여, `uniqCombined64` 함수는:

- 메모리를 몇 배 적게 소모합니다.
- 정확도가 몇 배 더 높게 계산됩니다.

**예제**

아래의 예에서 `uniqCombined64`는 `1e10`개의 서로 다른 숫자에 대해 실행되며, 서로 다른 인수 값의 수에 대한 매우 근접한 근사를 반환합니다. 

쿼리:

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

결과:

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 10.00 billion
└────────────────────────┘
```

비교를 위해 `uniqCombined` 함수는 이 크기의 입력에 대해 다소 좋지 않은 근사를 반환합니다.

쿼리:

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

결과:

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 5.55 billion
└──────────────────────┘
```

**참고**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
