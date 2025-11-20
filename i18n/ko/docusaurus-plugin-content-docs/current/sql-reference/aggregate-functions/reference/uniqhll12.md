---
'description': '하이퍼로깅 기본 알고리즘을 사용하여 서로 다른 인수 값의 대략적인 수를 계산합니다.'
'sidebar_position': 208
'slug': '/sql-reference/aggregate-functions/reference/uniqhll12'
'title': 'uniqHLL12'
'doc_type': 'reference'
---


# uniqHLL12

다양한 인자 값의 대략적인 수를 계산하는 함수로, [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 알고리즘을 사용합니다.

```sql
uniqHLL12(x[, ...])
```

**인자**

이 함수는 가변적인 수의 매개변수를 받습니다. 매개변수는 `Tuple`, `Array`, `Date`, `DateTime`, `String`, 또는 숫자 유형일 수 있습니다.

**반환 값**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 형식의 숫자를 반환합니다.

**구현 세부사항**

함수:

- 집계의 모든 매개변수에 대해 해시를 계산한 후, 이를 계산에 사용합니다.

- HyperLogLog 알고리즘을 사용하여 다양한 인자 값의 수를 대략적으로 추정합니다.

        2^12 5비트 셀을 사용합니다. 상태의 크기는 약 2.5 KB보다 약간 더 큽니다. 결과는 작은 데이터 세트(&lt;10K 요소)에 대해 그리 정확하지 않으며(~10% 오류) 하지만, 고카디널리티 데이터 세트(10K-100M)에 대해서는 최대 ~1.6%의 오류로 꽤 정확합니다. 100M 이상의 경우 추정 오류가 증가하며, 매우 높은 카디널리티를 가진 데이터 세트(1B+ 요소)에 대해서는 함수가 매우 부정확한 결과를 반환할 것입니다.

- 결정적인 결과를 제공합니다(쿼리 처리 순서에 따라 달라지지 않습니다).

이 함수를 사용하는 것은 권장하지 않습니다. 대부분의 경우, [uniq](/sql-reference/aggregate-functions/reference/uniq) 또는 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 함수를 사용하는 것이 좋습니다.

**참고**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
