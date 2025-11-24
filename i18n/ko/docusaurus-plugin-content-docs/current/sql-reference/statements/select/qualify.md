---
'description': 'QUALIFY 절에 대한 문서'
'sidebar_label': 'QUALIFY'
'slug': '/sql-reference/statements/select/qualify'
'title': 'QUALIFY 절'
'doc_type': 'reference'
---


# QUALIFY 절

창 함수 결과를 필터링할 수 있습니다. 이는 [WHERE](../../../sql-reference/statements/select/where.md) 절과 유사하지만, `WHERE`는 창 함수 평가 전에 수행되는 반면, `QUALIFY`는 그 이후에 수행된다는 차이가 있습니다.

`QUALIFY` 절에서 `SELECT` 절의 창 함수 결과를 해당 별칭을 통해 참조할 수 있습니다. 또는 `QUALIFY` 절은 쿼리 결과에 반환되지 않은 추가 창 함수의 결과를 필터링할 수 있습니다.

## 제한 사항 {#limitations}

창 함수를 평가할 것이 없으면 `QUALIFY`를 사용할 수 없습니다. 대신 `WHERE`를 사용하세요.

## 예제 {#examples}

예제:

```sql
SELECT number, COUNT() OVER (PARTITION BY number % 3) AS partition_count
FROM numbers(10)
QUALIFY partition_count = 4
ORDER BY number;
```

```text
┌─number─┬─partition_count─┐
│      0 │               4 │
│      3 │               4 │
│      6 │               4 │
│      9 │               4 │
└────────┴─────────────────┘
```
