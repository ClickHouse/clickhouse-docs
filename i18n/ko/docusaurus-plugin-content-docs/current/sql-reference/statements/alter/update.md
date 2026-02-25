---
description: 'ALTER TABLE ... UPDATE SQL 문 문서'
sidebar_label: 'UPDATE'
sidebar_position: 40
slug: /sql-reference/statements/alter/update
title: 'ALTER TABLE ... UPDATE SQL 문'
doc_type: 'reference'
---

# ALTER TABLE ... UPDATE SQL 문 \{#alter-table-update-statements\}

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

지정된 필터링 표현식과 일치하는 데이터를 변경합니다. [뮤테이션](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

:::note
`ALTER TABLE` 접두사는 이 구문이 SQL을 지원하는 대부분의 다른 시스템과 다른 구문임을 나타냅니다. 이는 OLTP 데이터베이스의 유사한 쿼리와 달리, 자주 사용하는 용도로 설계되지 않은 무거운 연산임을 의미합니다.
:::

`filter_expr`는 `UInt8` 타입이어야 합니다. 이 쿼리는 `filter_expr`가 0이 아닌 값을 갖는 행에서, 지정된 컬럼의 값을 해당 컬럼에 대해 지정된 표현식의 값으로 업데이트합니다. 값은 `CAST` 연산자를 사용하여 컬럼 타입으로 캐스팅됩니다. 기본 키나 파티션 키 계산에 사용되는 컬럼은 업데이트할 수 없습니다.

하나의 쿼리에는 쉼표로 구분된 여러 명령을 포함할 수 있습니다.

쿼리 처리의 동기/비동기 방식은 [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 설정에 의해 결정됩니다. 기본적으로 비동기식입니다.

**관련 항목**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [ALTER 쿼리의 동기/비동기 처리](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync) 설정
* [경량 `UPDATE`](/sql-reference/statements/update) - 패치 파트(patch parts)를 사용하는 대체 경량 업데이트
* [`APPLY PATCHES`](/sql-reference/statements/alter/apply-patches) - 경량 업데이트에서 생성된 패치를 수동으로 적용


## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse에서 업데이트 및 삭제 처리하기](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)