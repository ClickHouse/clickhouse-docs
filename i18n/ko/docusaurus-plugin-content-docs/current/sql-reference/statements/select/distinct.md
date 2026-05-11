---
description: 'DISTINCT 절 문서'
sidebar_label: 'DISTINCT'
slug: /sql-reference/statements/select/distinct
title: 'DISTINCT 절'
doc_type: 'reference'
---



# DISTINCT 절 \{#distinct-clause\}

`SELECT DISTINCT`를 지정하면 쿼리 결과에는 중복되지 않는 행만 남습니다. 따라서 결과에서 서로 완전히 동일한 행들의 각 집합마다 단일 행만 남게 됩니다.

중복되지 않는 값을 가져야 하는 컬럼 목록을 `SELECT DISTINCT ON (column1, column2,...)`와 같이 지정할 수 있습니다. 컬럼을 지정하지 않으면 모든 컬럼이 고려됩니다.

다음 테이블을 가정해 보겠습니다:

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

특정 컬럼을 지정하지 않고 `DISTINCT`를 사용하는 경우:

```sql
SELECT DISTINCT * FROM t1;
```

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

특정 컬럼에 대해 `DISTINCT` 사용하기:

```sql
SELECT DISTINCT ON (a,b) * FROM t1;
```

```text
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```


## DISTINCT와 ORDER BY \{#distinct-and-order-by\}

ClickHouse에서는 하나의 쿼리에서 서로 다른 컬럼에 대해 `DISTINCT` 절과 `ORDER BY` 절을 함께 사용할 수 있습니다. `DISTINCT` 절이 `ORDER BY` 절보다 먼저 실행됩니다.

다음과 같은 테이블을 가정합니다:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 1 │ 2 │
│ 3 │ 3 │
│ 2 │ 4 │
└───┴───┘
```

데이터 선택:

```sql
SELECT DISTINCT a FROM t1 ORDER BY b ASC;
```

```text
┌─a─┐
│ 2 │
│ 1 │
│ 3 │
└───┘
```

다른 정렬 방향으로 데이터 선택하기:

```sql
SELECT DISTINCT a FROM t1 ORDER BY b DESC;
```

```text
┌─a─┐
│ 3 │
│ 1 │
│ 2 │
└───┘
```

정렬을 수행하기 전에 `2, 4` 행이 잘려 나갔습니다.

쿼리를 작성할 때 이러한 구현상의 특성을 고려하십시오.


## Null 처리 \{#null-processing\}

`DISTINCT`는 [NULL](/sql-reference/syntax#null)을 하나의 특정 값으로 간주하여 `NULL==NULL`인 것처럼 동작합니다. 즉, `DISTINCT` 결과에서는 `NULL`이 포함된 서로 다른 조합이 각각 한 번씩만 나타납니다. 이는 대부분의 다른 문맥에서의 `NULL` 처리와는 다릅니다.



## 대안 \{#alternatives\}

`SELECT` 절에 지정된 것과 동일한 값 집합에 대해 [GROUP BY](/sql-reference/statements/select/group-by)를 적용하고, 어떤 집계 함수도 사용하지 않아도 동일한 결과를 얻을 수 있습니다. 그러나 `GROUP BY` 방식과는 몇 가지 차이점이 있습니다.

- `DISTINCT`는 `GROUP BY`와 함께 적용할 수 있습니다.
- [ORDER BY](../../../sql-reference/statements/select/order-by.md)가 생략되고 [LIMIT](../../../sql-reference/statements/select/limit.md)이 정의된 경우, 필요한 개수의 서로 다른 행이 읽히는 즉시 쿼리 실행이 중지됩니다.
- 전체 쿼리 실행이 끝날 때까지 기다리지 않고, 데이터 블록이 처리되는 대로 출력됩니다.
