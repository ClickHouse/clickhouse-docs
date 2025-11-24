---
'description': 'HAVING 절에 대한 문서'
'sidebar_label': 'HAVING'
'slug': '/sql-reference/statements/select/having'
'title': 'HAVING 절'
'doc_type': 'reference'
---


# HAVING 절

[GROUP BY](/sql-reference/statements/select/group-by)로 생성된 집계 결과를 필터링할 수 있습니다. 이는 [WHERE](../../../sql-reference/statements/select/where.md) 절과 유사하지만, `WHERE`는 집계 전에 수행되며, `HAVING`은 집계 후에 수행된다는 점이 다릅니다.

`HAVING` 절에서는 별칭을 통해 `SELECT` 절의 집계 결과를 참조할 수 있습니다. 또는 `HAVING` 절은 쿼리 결과에 반환되지 않는 추가 집계 결과를 필터링할 수도 있습니다.

## 예제 {#example}
다음과 같이 `sales` 테이블이 있을 경우:
```sql
CREATE TABLE sales
(
    region String,
    salesperson String,
    amount Float64
)
ORDER BY (region, salesperson);
```

다음과 같이 쿼리할 수 있습니다:
```sql
SELECT
    region,
    salesperson,
    sum(amount) AS total_sales
FROM sales
GROUP BY
    region,
    salesperson
HAVING total_sales > 10000
ORDER BY total_sales DESC;
```
이는 자신의 지역에서 총 판매가 10,000 이상인 판매원을 나열합니다.
## 제한 사항 {#limitations}

집계가 수행되지 않는 경우 `HAVING`을 사용할 수 없습니다. 대신 `WHERE`를 사용하십시오.
