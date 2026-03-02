---
description: 'HAVING 절에 대한 설명서'
sidebar_label: 'HAVING'
slug: /sql-reference/statements/select/having
title: 'HAVING 절'
doc_type: 'reference'
---

# HAVING 절 \{#having-clause\}

[GROUP BY](/sql-reference/statements/select/group-by)를 사용해 생성된 집계 결과를 필터링합니다. [WHERE](../../../sql-reference/statements/select/where.md) 절과 유사하지만, `WHERE`는 집계가 수행되기 전에 실행되고 `HAVING`은 집계가 수행된 후에 실행된다는 차이가 있습니다.

`HAVING` 절에서는 `SELECT` 절에서 별칭(alias)으로 지정된 집계 결과를 참조할 수 있습니다. 또는 `HAVING` 절에서 최종 쿼리 결과에 포함되지 않는 추가 집계 결과를 기준으로 필터링할 수도 있습니다.

## 예시 \{#example\}

다음과 같은 `sales` 테이블이 있다고 가정해 보겠습니다:

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

이는 해당 지역에서 총매출이 10,000을 초과하는 영업 담당자를 나열합니다.

## Limitations \{#limitations\}

집계를 수행하지 않으면 `HAVING`을 사용할 수 없습니다. 대신 `WHERE`를 사용하십시오.
