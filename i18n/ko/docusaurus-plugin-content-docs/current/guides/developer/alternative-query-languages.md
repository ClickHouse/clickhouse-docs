---
'slug': '/guides/developer/alternative-query-languages'
'sidebar_label': '대체 쿼리 언어'
'title': '대체 쿼리 언어'
'description': 'ClickHouse에서 대체 쿼리 언어 사용하기'
'keywords':
- 'alternative query languages'
- 'query dialects'
- 'MySQL dialect'
- 'PostgreSQL dialect'
- 'developer guide'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

ClickHouse는 표준 SQL 외에도 데이터를 쿼리하기 위한 다양한 대체 쿼리 언어를 지원합니다.

현재 지원되는 다이렉트는 다음과 같습니다:
- `clickhouse`: ClickHouse의 기본 [SQL 다이렉트](../../chdb/reference/sql-reference.md)
- `prql`: [파이프라인 관계형 쿼리 언어(Pipelined Relational Query Language, PRQL)](https://prql-lang.org/)
- `kusto`: [Kusto 쿼리 언어(Kusto Query Language, KQL)](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query)

어떤 쿼리 언어가 사용되는지는 `dialect`를 설정하여 제어됩니다.

## 표준 SQL {#standard-sql}

표준 SQL은 ClickHouse의 기본 쿼리 언어입니다.

```sql
SET dialect = 'clickhouse'
```

## 파이프라인 관계형 쿼리 언어 (PRQL) {#pipelined-relational-query-language-prql}

<ExperimentalBadge/>

PRQL을 활성화하려면:

```sql
SET allow_experimental_prql_dialect = 1; -- this SET statement is required only for ClickHouse versions >= v25.1
SET dialect = 'prql'
```

PRQL 쿼리 예제:

```prql
from trips
aggregate {
    ct = count this
    total_days = sum days
}
```

ClickHouse는 PRQL 쿼리를 실행하기 위해 PRQL에서 SQL로의 트랜스파일링을 사용합니다.

## Kusto 쿼리 언어 (KQL) {#kusto-query-language-kql}

<ExperimentalBadge/>

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

KQL 쿼리는 ClickHouse에서 정의된 모든 함수에 접근할 수 없을 수 있습니다.
