---
'description': 'EXCHANGE 문에 대한 문서'
'sidebar_label': 'EXCHANGE'
'sidebar_position': 49
'slug': '/sql-reference/statements/exchange'
'title': 'EXCHANGE 문'
'doc_type': 'reference'
---


# EXCHANGE 문

두 개의 테이블 또는 딕셔너리의 이름을 원자적으로 교환합니다. 이 작업은 임시 이름을 사용하여 [`RENAME`](./rename.md) 쿼리로도 수행할 수 있지만, 그 경우 작업이 원자적이지 않습니다.

:::note  
`EXCHANGE` 쿼리는 [`Atomic`](../../engines/database-engines/atomic.md) 및 [`Shared`](/cloud/reference/shared-catalog#shared-database-engine) 데이터베이스 엔진에서만 지원됩니다.
:::

**구문**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```

## EXCHANGE TABLES {#exchange-tables}

두 개의 테이블의 이름을 교환합니다.

**구문**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```

## EXCHANGE DICTIONARIES {#exchange-dictionaries}

두 개의 딕셔너리의 이름을 교환합니다.

**구문**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**참조**

- [딕셔너리](../../sql-reference/dictionaries/index.md)
