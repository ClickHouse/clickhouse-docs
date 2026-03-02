---
description: 'QUALIFY 절 문서'
sidebar_label: 'QUALIFY'
slug: /sql-reference/statements/select/qualify
title: 'QUALIFY 절'
doc_type: 'reference'
---



# QUALIFY 절 \{#qualify-clause\}

윈도우 함수 결과를 필터링하는 데 사용합니다. [WHERE](../../../sql-reference/statements/select/where.md) 절과 유사하지만, `WHERE`는 윈도우 함수가 계산되기 전에 수행되고, `QUALIFY`는 계산이 완료된 후에 수행된다는 차이가 있습니다.

`QUALIFY` 절에서는 `SELECT` 절에서 지정한 별칭을 통해 윈도우 함수 결과를 참조할 수 있습니다. 또는, 쿼리 결과에 포함되지 않는 추가 윈도우 함수의 결과를 기준으로 필터링하는 데 `QUALIFY` 절을 사용할 수도 있습니다.



## 제한 사항 \{#limitations\}

평가할 윈도우 함수가 없으면 `QUALIFY`를 사용할 수 없습니다. 대신 `WHERE`를 사용하십시오.



## 예제 \{#examples\}

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
