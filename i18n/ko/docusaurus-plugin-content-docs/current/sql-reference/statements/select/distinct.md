---
'description': 'DISTINCT 절에 대한 문서'
'sidebar_label': 'DISTINCT'
'slug': '/sql-reference/statements/select/distinct'
'title': 'DISTINCT 절'
'doc_type': 'reference'
---


# DISTINCT 절

`SELECT DISTINCT`가 지정되면 쿼리 결과에는 고유한 행만 남게 됩니다. 따라서 결과에서 완전히 일치하는 행의 모든 집합 중 단일 행만 남습니다.

고유한 값을 가져야 하는 컬럼 목록을 지정할 수 있습니다: `SELECT DISTINCT ON (column1, column2,...)`. 컬럼이 지정되지 않으면 모든 컬럼이 고려됩니다.

테이블을 고려하십시오:

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

컬럼을 지정하지 않고 `DISTINCT` 사용:

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

컬럼을 지정하여 `DISTINCT` 사용:

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

## DISTINCT 및 ORDER BY {#distinct-and-order-by}

ClickHouse는 하나의 쿼리에서 서로 다른 컬럼에 대해 `DISTINCT` 및 `ORDER BY` 절을 사용하는 것을 지원합니다. `DISTINCT` 절은 `ORDER BY` 절보다 먼저 실행됩니다.

테이블을 고려하십시오:

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
서로 다른 정렬 방향으로 데이터 선택:

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

행 `2, 4`가 정렬 전에 잘렸습니다.

쿼리를 프로그래밍할 때 이 구현의 특성을 고려하십시오.

## Null 처리 {#null-processing}

`DISTINCT`는 [NULL](/sql-reference/syntax#null)와 함께 특정 값처럼 작동하며, `NULL==NULL`입니다. 즉, `DISTINCT` 결과에서 `NULL`이 포함된 서로 다른 조합은 단 한 번만 발생합니다. 이는 대부분의 다른 컨텍스트에서 NULL 처리와 다릅니다.

## 대안 {#alternatives}

집합 함수 없이 `SELECT` 절로 지정된 동일한 값 집합에 대해 [GROUP BY](/sql-reference/statements/select/group-by)를 적용하여 동일한 결과를 얻을 수 있습니다. 그러나 `GROUP BY` 접근 방식과는 몇 가지 차이점이 있습니다:

- `DISTINCT`는 `GROUP BY`와 함께 사용할 수 있습니다.
- [ORDER BY](../../../sql-reference/statements/select/order-by.md)가 생략되고 [LIMIT](../../../sql-reference/statements/select/limit.md)가 정의되면, 쿼리는 요구되는 서로 다른 행 수를 읽은 후 즉시 실행을 중지합니다.
- 데이터 블록은 전체 쿼리가 완료될 때까지 기다리지 않고 처리되는 대로 출력됩니다.
