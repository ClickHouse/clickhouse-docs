---
slug: /guides/developer/alternative-query-languages
sidebar_label: '대체 쿼리 언어'
title: '대체 쿼리 언어'
description: 'ClickHouse에서 대체 쿼리 언어를 사용하기'
keywords: ['대체 쿼리 언어', '쿼리 방언', 'MySQL 방언', 'PostgreSQL 방언', '개발자 가이드']
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

표준 SQL 외에도 ClickHouse는 데이터 조회를 위한 다양한 대체 쿼리 언어를 지원합니다.

현재 지원되는 SQL 방언은 다음과 같습니다:

* `clickhouse`: ClickHouse의 기본 [SQL 방언(dialect)](../../chdb/reference/sql-reference.md)
* `prql`: [Pipelined Relational Query Language (PRQL)](https://prql-lang.org/)
* `kusto`: [Kusto Query Language (KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

사용되는 쿼리 언어는 `dialect` 설정으로 결정됩니다.

## 표준 SQL \{#standard-sql\}

표준 SQL은 ClickHouse에서 기본으로 사용하는 쿼리 언어입니다.

```sql
SET dialect = 'clickhouse'
```

## 파이프라인 방식 관계형 쿼리 언어(PRQL) \{#pipelined-relational-query-language-prql\}

<ExperimentalBadge />

PRQL을 활성화하려면 다음을 수행합니다:

```sql
SET allow_experimental_prql_dialect = 1; -- this SET statement is required only for ClickHouse versions >= v25.1
SET dialect = 'prql'
```

PRQL 쿼리 예시:

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

내부적으로 ClickHouse는 PRQL 쿼리를 실행하기 위해 PRQL을 SQL로 트랜스파일링합니다.

## Kusto 쿼리 언어(KQL) \{#kusto-query-language-kql\}

<ExperimentalBadge />

KQL을 활성화하려면:

```sql
SET allow_experimental_kusto_dialect = 1; -- this SET statement is required only for ClickHouse versions >= 25.1
SET dialect = 'kusto'
```

```kql title="Query"
numbers(10) | project number
```

```response title="Response"
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘
```

KQL 쿼리에서는 ClickHouse에 정의된 모든 함수를 사용하지 못할 수 있습니다.
