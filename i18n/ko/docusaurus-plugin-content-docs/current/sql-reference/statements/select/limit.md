---
'description': 'LIMIT 절에 대한 문서'
'sidebar_label': 'LIMIT'
'slug': '/sql-reference/statements/select/limit'
'title': 'LIMIT 절'
'doc_type': 'reference'
---


# LIMIT 절

`LIMIT m`은 결과에서 첫 번째 `m` 행을 선택할 수 있게 해줍니다.

`LIMIT n, m`은 첫 번째 `n` 행을 건너뛴 후 결과에서 `m` 행을 선택할 수 있게 해줍니다. `LIMIT m OFFSET n` 구문도 동일합니다.

위의 표준 형식에서 `n`과 `m`은 음이 아닌 정수입니다.

또한, 음수 한계를 지원합니다:

`LIMIT -m`은 결과에서 마지막 `m` 행을 선택합니다.

`LIMIT -m OFFSET -n`은 마지막 `n` 행을 건너뛴 후 마지막 `m` 행을 선택합니다. `LIMIT -n, -m` 구문도 동일합니다.

게다가, 결과의 일부를 선택하는 것도 지원됩니다:

`LIMIT m` - 0 < m < 1이면, 첫 번째 m * 100%의 행이 반환됩니다.

`LIMIT m OFFSET n` - 0 < m < 1 및 0 < n < 1이면, 첫 번째 m * 100%의 결과가 첫 번째 n * 100%의 행을 건너뛴 후 반환됩니다. `LIMIT n, m` 구문도 동일합니다.

예시:
    • `LIMIT 0.1` - 결과의 첫 10%를 선택합니다.
    • `LIMIT 1 OFFSET 0.5` - 중앙 행을 선택합니다.
    • `LIMIT 0.25 OFFSET 0.5` - 결과의 3사분면을 선택합니다.

> **참고**
> • 분수는 1보다 작고 0보다 큰 [Float64](../../data-types/float.md) 숫자여야 합니다.
> • 계산에서 나온 행의 분수가 있을 경우, 다음 정수로 올림됩니다.

> **참고**
> • 표준 제한과 분수 오프셋을 결합할 수 있습니다. 그 반대도 가능합니다.
> • 표준 제한과 음수 오프셋을 결합할 수 있습니다. 그 반대도 가능합니다.

명시적으로 결과를 정렬하는 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 절이 없으면, 결과의 행 선택은 임의이며 비결정적일 수 있습니다.

:::note    
결과 집합의 행 수는 [limit](../../../operations/settings/settings.md#limit) 설정에 따라서도 달라질 수 있습니다.
:::

## LIMIT ... WITH TIES 수정자 {#limit--with-ties-modifier}

`LIMIT n[,m]`에 대해 `WITH TIES` 수정자를 설정하고 `ORDER BY expr_list`를 지정하면, 결과에서 첫 번째 `n` 또는 `n,m` 행과 `LIMIT n`의 경우 `n` 위치의 행과 같은 `ORDER BY` 필드 값이 있는 모든 행을 얻습니다. 

> **참고**  
> • 현재 `WITH TIES`는 음수 `LIMIT`와 함께 지원되지 않습니다.  

이 수정자는 [ORDER BY ... WITH FILL 수정자](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier)와 결합할 수도 있습니다.

예를 들어, 다음 쿼리

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5
```

은

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

를 반환하지만 `WITH TIES` 수정자를 적용하면

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5 WITH TIES
```

다른 행 집합을 반환합니다

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
│ 2 │
└───┘
```

행 번호 6이 행 번호 5와 필드 `n`의 값이 "2"로 동일하기 때문입니다.
