---
'description': 'ALTER TABLE ... UPDATE 문에 대한 문서'
'sidebar_label': 'UPDATE'
'sidebar_position': 40
'slug': '/sql-reference/statements/alter/update'
'title': 'ALTER TABLE ... UPDATE 문'
'doc_type': 'reference'
---


# ALTER TABLE ... UPDATE 문

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

지정된 필터링 표현식과 일치하는 데이터를 조작합니다. [변형(mutation)](/sql-reference/statements/alter/index.md#mutations)으로 구현되었습니다.

:::note    
`ALTER TABLE` 접두사는 이 구문을 SQL을 지원하는 다른 시스템과 다르게 만듭니다. 이는 OLTP 데이터베이스의 유사 쿼리와는 달리 자주 사용하도록 설계되지 않은 무거운 작업임을 나타내기 위한 것입니다.
:::

`filter_expr`는 `UInt8` 유형이어야 합니다. 이 쿼리는 `filter_expr`가 0이 아닌 값을 가지는 행의 해당 표현식의 값으로 지정된 컬럼의 값을 업데이트합니다. 값은 `CAST` 연산자를 사용하여 컬럼 유형으로 변환됩니다. 기본 키 또는 파티션 키 계산에 사용되는 컬럼을 업데이트하는 것은 지원되지 않습니다.

하나의 쿼리는 쉼표로 구분된 여러 명령을 포함할 수 있습니다.

쿼리 처리의 동기성은 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 설정에 의해 정의됩니다. 기본적으로 비동기입니다.

**참고 사항**

- [변형(Mutations)](/sql-reference/statements/alter/index.md#mutations)
- [ALTER 쿼리의 동기성](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 설정

## 관련 내용 {#related-content}

- 블로그: [ClickHouse에서 업데이트 및 삭제 처리하기](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
