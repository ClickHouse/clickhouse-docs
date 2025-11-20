---
'description': '컬럼의 첫 번째로 발견된 값을 선택합니다.'
'sidebar_position': 102
'slug': '/sql-reference/aggregate-functions/reference/any'
'title': 'any'
'doc_type': 'reference'
---


# any

열에서 처음으로 발견된 값을 선택합니다.

:::warning
쿼리가 임의의 순서로 실행될 수 있으므로, 이 함수의 결과는 비결정적입니다.
임의이지만 결정적인 결과가 필요하면 [`min`](../reference/min.md) 또는 [`max`](../reference/max.md) 함수를 사용하십시오.
:::

기본적으로 이 함수는 NULL 값을 반환하지 않으며, 즉 입력 열의 NULL 값을 무시합니다.
그러나 `RESPECT NULLS` 수정자를 사용하여 함수를 호출하면 NULL 여부에 관계없이 읽은 첫 번째 값을 반환합니다.

**구문**

```sql
any(column) [RESPECT NULLS]
```

별칭 `any(column)` ( `RESPECT NULLS` 없이)
- `any_value`
- [`first_value`](../reference/first_value.md).

`any(column) RESPECT NULLS`의 별칭
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**매개변수**
- `column`: 열 이름.

**반환 값**

처음으로 발견된 값.

:::note
함수의 반환 타입은 입력 타입과 동일하나 LowCardinality는 무시됩니다.
즉, 입력 행이 없을 경우 해당 타입의 기본값(정수의 경우 0, Nullable() 열의 경우 Null)을 반환합니다.
이 동작을 수정하려면 `-OrNull` [조합기](../../../sql-reference/aggregate-functions/combinators.md)를 사용할 수 있습니다.
:::

**구현 세부사항**

경우에 따라 실행 순서에 의존할 수 있습니다.
이는 `SELECT`가 `ORDER BY`를 사용하는 서브쿼리에서 올 때 적용됩니다.

`SELECT` 쿼리가 `GROUP BY` 절을 가지고 있거나 최소한 하나의 집계 함수가 있는 경우, ClickHouse는 (MySQL과는 달리) `SELECT`, `HAVING`, 및 `ORDER BY` 절의 모든 표현식이 키 또는 집계 함수에서 계산되도록 요구합니다.
즉, 테이블에서 선택된 각 열은 키 또는 집계 함수 내에서 사용되어야 합니다.
MySQL처럼 동작하기를 원하면 다른 열을 `any` 집계 함수에 넣을 수 있습니다.

**예제**

쿼리:

```sql
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;

INSERT INTO tab (city) VALUES (NULL), ('Amsterdam'), ('New York'), ('Tokyo'), ('Valencia'), (NULL);

SELECT any(city), anyRespectNulls(city) FROM tab;
```

```response
┌─any(city)─┬─anyRespectNulls(city)─┐
│ Amsterdam │ ᴺᵁᴸᴸ                  │
└───────────┴───────────────────────┘
```
