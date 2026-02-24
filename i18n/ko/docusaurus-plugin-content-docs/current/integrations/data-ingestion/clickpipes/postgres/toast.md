---
title: 'TOAST 컬럼 처리하기'
description: 'PostgreSQL에서 ClickHouse로 데이터를 복제할 때 TOAST 컬럼을 처리하는 방법을 알아봅니다.'
slug: /integrations/clickpipes/postgres/toast
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

PostgreSQL에서 ClickHouse로 데이터를 복제할 때는 TOAST(The Oversized-Attribute Storage Technique) 컬럼에 대한 제한 사항과 특별한 고려 사항을 이해하는 것이 중요합니다. 이 가이드는 복제 과정에서 TOAST 컬럼을 식별하고 올바르게 처리하는 방법을 설명합니다.

## PostgreSQL에서 TOAST 컬럼이란 무엇입니까? \{#what-are-toast-columns-in-postgresql\}

TOAST (The Oversized-Attribute Storage Technique)는 큰 필드 값을 처리하기 위한 PostgreSQL의 메커니즘입니다. 하나의 행이 허용되는 최대 행 크기(일반적으로 2KB이지만 PostgreSQL 버전과 구체적인 설정에 따라 달라질 수 있음)를 초과하면, PostgreSQL은 자동으로 큰 필드 값을 별도의 TOAST 테이블로 이동시키고 메인 테이블에는 포인터만 저장합니다.

CDC(Change Data Capture)를 수행할 때 변경되지 않은 TOAST 컬럼은 복제 스트림에 포함되지 않는다는 점이 중요합니다. 이를 적절히 처리하지 않으면 데이터 복제가 불완전해질 수 있습니다.

초기 적재(스냅샷) 동안에는 TOAST 컬럼을 포함한 모든 컬럼 값이 크기에 관계없이 올바르게 복제됩니다. 이 가이드에서 설명하는 제한 사항은 주로 초기 적재 이후에 진행되는 CDC 과정에 영향을 줍니다.

PostgreSQL에서 TOAST와 그 구현 방식에 대한 자세한 내용은 다음 문서를 참고하십시오: https://www.postgresql.org/docs/current/storage-toast.html

## 테이블에서 TOAST 컬럼 확인하기 \{#identifying-toast-columns-in-a-table\}

테이블에 TOAST 컬럼이 있는지 확인하려면 다음 SQL 쿼리를 사용할 수 있습니다.

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

이 쿼리는 TOAST될 가능성이 있는 컬럼의 이름과 데이터 타입을 반환합니다. 다만 이 쿼리는 데이터 타입과 저장 속성을 기준으로 TOAST 저장 대상이 될 수 있는 컬럼만 식별한다는 점에 유의해야 합니다. 이러한 컬럼에 실제로 TOAST된 데이터가 포함되어 있는지 판단하려면, 해당 컬럼의 값이 크기 한계를 초과하는지 여부를 살펴봐야 합니다. 데이터가 실제로 TOAST 처리되는지는 이 컬럼들에 저장된 구체적인 내용에 따라 달라집니다.


## TOAST 컬럼이 올바르게 처리되도록 보장하기 \{#ensuring-proper-handling-of-toast-columns\}

복제 과정에서 TOAST 컬럼이 올바르게 처리되도록 하려면 테이블의 `REPLICA IDENTITY`를 `FULL`로 설정해야 합니다. 이렇게 하면 PostgreSQL이 UPDATE 및 DELETE 작업에 대해 WAL에 전체 이전 행을 포함하도록 하여, TOAST 컬럼을 포함한 모든 컬럼 값이 복제에 사용 가능하도록 보장합니다.

다음 SQL 명령을 사용하여 `REPLICA IDENTITY`를 `FULL`로 설정할 수 있습니다:

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL`을 설정할 때의 성능 관련 고려 사항은 [이 블로그 글](https://xata.io/blog/replica-identity-full-performance)을 참조하십시오.


## `REPLICA IDENTITY FULL`이 설정되지 않았을 때의 복제 동작 \{#replication-behavior-when-replica-identity-full-is-not-set\}

TOAST 컬럼이 있는 테이블에 `REPLICA IDENTITY FULL`이 설정되어 있지 않으면 ClickHouse로 복제할 때 다음과 같은 문제가 발생할 수 있습니다:

1. INSERT 작업의 경우, 모든 컬럼(TOAST 컬럼 포함)이 올바르게 복제됩니다.

2. UPDATE 작업의 경우:
   - TOAST 컬럼이 수정되지 않은 경우, 해당 값은 ClickHouse에서 NULL 또는 빈 값으로 나타납니다.
   - TOAST 컬럼이 수정된 경우, 올바르게 복제됩니다.

3. DELETE 작업의 경우, TOAST 컬럼 값은 ClickHouse에서 NULL 또는 빈 값으로 나타납니다.

이러한 동작은 PostgreSQL 소스와 ClickHouse 대상 간 데이터 불일치로 이어질 수 있습니다. 따라서 TOAST 컬럼이 있는 테이블에 대해 정확하고 완전한 데이터 복제를 보장하려면 `REPLICA IDENTITY FULL`을 설정하는 것이 중요합니다.

## 결론 \{#conclusion\}

PostgreSQL에서 ClickHouse로 복제할 때 데이터 무결성을 유지하려면 TOAST 컬럼을 올바르게 처리하는 것이 중요합니다. TOAST 컬럼을 식별하고 적절한 `REPLICA IDENTITY`를 설정하면 데이터가 정확하고 완전하게 복제되도록 할 수 있습니다.