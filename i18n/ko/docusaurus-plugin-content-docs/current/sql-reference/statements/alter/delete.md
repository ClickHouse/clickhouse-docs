---
'description': 'ALTER TABLE ... DELETE 语句的文档'
'sidebar_label': 'DELETE'
'sidebar_position': 39
'slug': '/sql-reference/statements/alter/delete'
'title': 'ALTER TABLE ... DELETE 语句'
'doc_type': 'reference'
---


# ALTER TABLE ... DELETE 문

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

지정된 필터링 표현식과 일치하는 데이터를 삭제합니다. [변경](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

:::note
`ALTER TABLE` 접두사는 이 구문을 SQL을 지원하는 대부분의 다른 시스템과 다르게 만듭니다. 이는 OLTP 데이터베이스의 유사한 쿼리와는 달리 빈번한 사용을 위해 설계되지 않은 무거운 작업임을 나타내기 위한 것입니다. `ALTER TABLE`은 삭제가 이루어지기 전에 기본 데이터가 병합되어야 하는 무거운 작업으로 간주됩니다. MergeTree 테이블의 경우 경량 삭제를 수행하고 상당히 빠를 수 있는 [`DELETE FROM` 쿼리](/sql-reference/statements/delete.md)를 사용하는 것을 고려하십시오.
:::

`filter_expr`는 `UInt8` 타입이어야 합니다. 이 표현식이 0이 아닌 값을 취하는 테이블의 행이 삭제됩니다.

하나의 쿼리는 쉼표로 구분된 여러 명령을 포함할 수 있습니다.

쿼리 처리의 동기성은 [mutations_sync](/operations/settings/settings.md/#mutations_sync) 설정에 의해 정의됩니다. 기본적으로 비동기입니다.

**참고**

- [변경](/sql-reference/statements/alter/index.md#mutations)
- [ALTER 쿼리의 동기성](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- [mutations_sync](/operations/settings/settings.md/#mutations_sync) 설정

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse에서 업데이트 및 삭제 처리하기](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
