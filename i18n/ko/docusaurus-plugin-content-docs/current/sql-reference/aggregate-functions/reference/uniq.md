---
'description': '인수의 서로 다른 값의 대략적인 수를 계산합니다.'
'sidebar_position': 204
'slug': '/sql-reference/aggregate-functions/reference/uniq'
'title': 'uniq'
'doc_type': 'reference'
---


# uniq

인수의 다양한 값의 대략적인 수를 계산합니다.

```sql
uniq(x[, ...])
```

**인수**

이 함수는 가변 개수의 매개변수를 사용합니다. 매개변수는 `Tuple`, `Array`, `Date`, `DateTime`, `String`, 또는 숫자 유형이 될 수 있습니다.

**반환 값**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 유형의 숫자입니다.

**구현 세부정보**

함수:

- 집계에서 모든 매개변수의 해시를 계산한 다음 이를 계산에 사용합니다.

- 적응형 샘플링 알고리즘을 사용합니다. 계산 상태를 위해 함수는 최대 65536개의 요소 해시 값 샘플을 사용합니다. 이 알고리즘은 매우 정확하고 CPU에서 매우 효율적입니다. 쿼리에 이러한 함수가 여러 개 포함된 경우 `uniq`를 사용하는 것은 다른 집계 함수를 사용하는 것만큼 빠릅니다.

- 결과를 결정적으로 제공합니다(쿼리 처리 순서에 의존하지 않음).

거의 모든 시나리오에서 이 함수를 사용하는 것을 권장합니다.

**참고**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
