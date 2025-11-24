---
'description': 'UNION 절에 대한 Documentation'
'sidebar_label': 'UNION'
'slug': '/sql-reference/statements/select/union'
'title': 'UNION 절'
'doc_type': 'reference'
---


# UNION 절

`UNION`을 사용하여 `UNION ALL` 또는 `UNION DISTINCT`를 명시적으로 지정할 수 있습니다.

`ALL` 또는 `DISTINCT`를 지정하지 않으면, `union_default_mode` 설정에 따라 다릅니다. `UNION ALL`과 `UNION DISTINCT`의 차이점은 `UNION DISTINCT`가 유니온 결과에 대해 중복 제거 변환을 수행한다는 것이며, 이는 `UNION ALL`을 포함하는 서브쿼리에서의 `SELECT DISTINCT`와 동일합니다.

`UNION`을 사용하여 여러 개의 `SELECT` 쿼리를 그 결과로 결합할 수 있습니다. 예:

```sql
SELECT CounterID, 1 AS table, toInt64(count()) AS c
    FROM test.hits
    GROUP BY CounterID

UNION ALL

SELECT CounterID, 2 AS table, sum(Sign) AS c
    FROM test.visits
    GROUP BY CounterID
    HAVING c > 0
```

결과 컬럼은 인덱스( `SELECT` 내부의 순서 )에 따라 일치합니다. 컬럼 이름이 일치하지 않는 경우, 최종 결과의 이름은 첫 번째 쿼리에서 가져옵니다.

유니온에 대해 타입 캐스팅이 수행됩니다. 예를 들어, 결합되는 두 쿼리가 호환 가능한 타입에서 비-`Nullable` 및 `Nullable` 타입의 동일한 필드를 가지고 있는 경우, 결과로 생성된 `UNION`은 `Nullable` 타입 필드를 가집니다.

`UNION`의 일부인 쿼리는 괄호로 묶을 수 있습니다. [ORDER BY](../../../sql-reference/statements/select/order-by.md) 및 [LIMIT](../../../sql-reference/statements/select/limit.md)는 최종 결과가 아닌 개별 쿼리에 적용됩니다. 최종 결과에 변환을 적용해야 하는 경우, 모든 쿼리를 `UNION`과 함께 [FROM](../../../sql-reference/statements/select/from.md) 절의 서브쿼리 안에 넣을 수 있습니다.

`UNION`을 사용할 때 `UNION ALL` 또는 `UNION DISTINCT`를 명시적으로 지정하지 않으면, [union_default_mode](/operations/settings/settings#union_default_mode) 설정을 사용하여 유니온 모드를 지정할 수 있습니다. 설정 값은 `ALL`, `DISTINCT` 또는 빈 문자열이 될 수 있습니다. 그러나 `union_default_mode` 설정을 빈 문자열로 사용하여 `UNION`을 사용할 경우, 예외가 발생합니다. 다음 예제는 서로 다른 값 설정의 쿼리 결과를 보여줍니다.

쿼리:

```sql
SET union_default_mode = 'DISTINCT';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

결과:

```text
┌─1─┐
│ 1 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 3 │
└───┘
```

쿼리:

```sql
SET union_default_mode = 'ALL';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

결과:

```text
┌─1─┐
│ 1 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 3 │
└───┘
```

`UNION/UNION ALL/UNION DISTINCT`의 일부인 쿼리는 동시에 실행할 수 있으며, 그 결과를 혼합할 수 있습니다.

**참고**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) 설정.
- [union_default_mode](/operations/settings/settings#union_default_mode) 설정.
