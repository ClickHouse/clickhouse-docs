---
description: 'ALTER TABLE ... DELETE SQL 문 문서'
sidebar_label: 'DELETE'
sidebar_position: 39
slug: /sql-reference/statements/alter/delete
title: 'ALTER TABLE ... DELETE SQL 문'
doc_type: 'reference'
---



# ALTER TABLE ... DELETE 문 \{#alter-table-delete-statement\}

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

지정된 필터링 표현식과 일치하는 데이터를 삭제합니다. [뮤테이션](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

:::note
`ALTER TABLE` 접두사는 SQL을 지원하는 대부분의 다른 시스템과 이 구문의 형태가 다름을 의미합니다. 이는 OLTP 데이터베이스의 유사한 쿼리와 달리, 이 연산이 자주 사용하도록 설계되지 않은 무거운 연산임을 나타내기 위한 것입니다. `ALTER TABLE`은 삭제 전에 기본 데이터를 병합해야 하는 무거운 연산으로 간주됩니다. MergeTree 테이블에서는 경량한 삭제를 수행하며 훨씬 더 빠를 수 있는 [`DELETE FROM` 쿼리](/sql-reference/statements/delete.md) 사용을 고려하십시오.
:::

`filter_expr`는 `UInt8` 타입이어야 합니다. 쿼리는 이 표현식의 값이 0이 아닌 테이블의 행을 삭제합니다.

하나의 쿼리에 쉼표로 구분된 여러 명령을 포함할 수 있습니다.

쿼리 처리의 동기화 여부는 [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) SETTING으로 정의됩니다. 기본값은 비동기입니다.

**함께 보기**

* [뮤테이션](/sql-reference/statements/alter/index.md#mutations)
* [ALTER 쿼리의 동기화](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) SETTING


## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse에서 업데이트 및 삭제 처리](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
