---
description: 'UNION 절 문서'
sidebar_label: 'UNION'
slug: /sql-reference/statements/select/union
title: 'UNION 절'
doc_type: 'reference'
---

# UNION 절 \{#union-clause\}

`UNION ALL` 또는 `UNION DISTINCT`를 명시적으로 지정하여 `UNION`을 사용할 수 있습니다.

`ALL` 또는 `DISTINCT`를 지정하지 않으면 `union_default_mode` 설정에 따라 동작이 달라집니다. `UNION ALL`과 `UNION DISTINCT`의 차이점은 `UNION DISTINCT`가 UNION 결과 집합에 대해 중복 제거를 수행한다는 점이며, 이는 `UNION ALL`이 포함된 서브쿼리에 대해 `SELECT DISTINCT`를 수행하는 것과 동일합니다.

`UNION`을 사용하여 결과를 확장하는 방식으로 임의 개수의 `SELECT` 쿼리를 결합할 수 있습니다. 예:

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

결과 컬럼은 인덱스(`SELECT` 안에서의 순서)로 매칭됩니다. 컬럼 이름이 일치하지 않으면 최종 결과의 컬럼 이름은 첫 번째 쿼리에서 가져옵니다.

`UNION` 실행 시 타입 캐스팅이 수행됩니다. 예를 들어, 결합되는 두 쿼리에 동일한 필드가 있고, 해당 필드의 타입이 호환 가능한 타입에서 각각 `Nullable`이 아닌 타입과 `Nullable` 타입으로 정의되어 있는 경우, 결과 `UNION`에는 `Nullable` 타입 필드가 사용됩니다.

`UNION`을 구성하는 쿼리는 소괄호로 감쌀 수 있습니다. [ORDER BY](../../../sql-reference/statements/select/order-by.md)와 [LIMIT](../../../sql-reference/statements/select/limit.md)은 최종 결과가 아니라 개별 쿼리에 적용됩니다. 최종 결과에 변환을 적용해야 하는 경우, `UNION`이 포함된 모든 쿼리를 [FROM](../../../sql-reference/statements/select/from.md) 절의 서브쿼리 안에 넣으면 됩니다.

`UNION ALL` 또는 `UNION DISTINCT`를 명시적으로 지정하지 않고 `UNION`을 사용하는 경우, [union&#95;default&#95;mode](/operations/settings/settings#union_default_mode) 설정을 사용하여 유니온 모드를 지정할 수 있습니다. 해당 설정 값은 `ALL`, `DISTINCT` 또는 빈 문자열이 될 수 있습니다. 그러나 `UNION`을 사용할 때 `union_default_mode` 설정을 빈 문자열로 지정하면 예외가 발생합니다. 다음 예시는 설정 값이 서로 다른 경우 쿼리 결과가 어떻게 달라지는지 보여줍니다.

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

`UNION/UNION ALL/UNION DISTINCT`를 구성하는 각 쿼리는 동시에 실행될 수 있으며, 그 결과는 하나로 병합됩니다.

**함께 보기**

* [insert&#95;null&#95;as&#95;default](../../../operations/settings/settings.md#insert_null_as_default) 설정.
* [union&#95;default&#95;mode](/operations/settings/settings#union_default_mode) 설정.
