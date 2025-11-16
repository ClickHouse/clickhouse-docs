---
'title': 'TOAST 컬럼 처리'
'description': 'PostgreSQL에서 ClickHouse로 데이터를 복제할 때 TOAST 컬럼을 처리하는 방법을 배우십시오.'
'slug': '/integrations/clickpipes/postgres/toast'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

When replicating data from PostgreSQL to ClickHouse, it's important to understand the limitations and special considerations for TOAST (The Oversized-Attribute Storage Technique) columns. This guide will help you identify and properly handle TOAST columns in your replication process.

## What are TOAST columns in PostgreSQL? {#what-are-toast-columns-in-postgresql}

TOAST (The Oversized-Attribute Storage Technique)는 PostgreSQL의 큰 필드 값을 처리하기 위한 메커니즘입니다. 행이 최대 행 크기(일반적으로 2KB이지만 PostgreSQL 버전 및 정확한 설정에 따라 다를 수 있음)를 초과하면 PostgreSQL은 자동으로 큰 필드 값을 별도의 TOAST 테이블로 이동하며, 메인 테이블에는 포인터만 저장합니다.

Change Data Capture (CDC) 중에 변경되지 않은 TOAST 컬럼은 복제 스트림에 포함되지 않는다는 점에 유의해야 합니다. 이는 제대로 처리되지 않으면 불완전한 데이터 복제를 초래할 수 있습니다.

초기 로드(스냅샷) 중에는 TOAST 컬럼을 포함한 모든 컬럼 값이 크기와 관계없이 올바르게 복제됩니다. 이 가이드에서 설명하는 제한 사항은 주로 초기 로드 이후의 지속적인 CDC 프로세스에 영향을 미칩니다.

TOAST 및 PostgreSQL에서의 구현에 대해 더 읽으려면 여기를 방문하세요: https://www.postgresql.org/docs/current/storage-toast.html

## Identifying TOAST columns in a table {#identifying-toast-columns-in-a-table}

TOAST 컬럼이 있는 테이블을 식별하려면 다음 SQL 쿼리를 사용할 수 있습니다:

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

이 쿼리는 TOAST될 수 있는 컬럼의 이름과 데이터 유형을 반환합니다. 그러나 이 쿼리는 데이터 유형 및 저장 속성을 기반으로 TOAST 저장소에 적합한 컬럼만 식별한다는 점에 유의해야 합니다. 이러한 컬럼이 실제로 TOAST된 데이터를 포함하는지 확인하려면, 이러한 컬럼의 값이 크기를 초과하는지 고려해야 합니다. 데이터의 실제 TOAST 여부는 이러한 컬럼에 저장된 특정 내용에 따라 다릅니다.

## Ensuring proper handling of TOAST columns {#ensuring-proper-handling-of-toast-columns}

복제 중 TOAST 컬럼이 올바르게 처리되도록 하려면 테이블의 `REPLICA IDENTITY`를 `FULL`로 설정해야 합니다. 이렇게 하면 PostgreSQL은 UPDATE 및 DELETE 작업에 대해 WAL에 전체 이전 행을 포함하도록 지시하며, 이는 모든 컬럼 값(TOAST 컬럼 포함)이 복제를 위해 사용할 수 있도록 보장합니다.

다음 SQL 명령을 사용하여 `REPLICA IDENTITY`를 `FULL`로 설정할 수 있습니다:

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL`을 설정할 때 성능 고려 사항에 대한 [이 블로그 게시물](https://xata.io/blog/replica-identity-full-performance)을 참조하십시오.

## Replication behavior when REPLICA IDENTITY FULL is not set {#replication-behavior-when-replica-identity-full-is-not-set}

TOAST 컬럼이 있는 테이블에 대해 `REPLICA IDENTITY FULL`이 설정되지 않은 경우 ClickHouse로 복제할 때 다음과 같은 문제가 발생할 수 있습니다:

1. INSERT 작업의 경우 모든 컬럼(TOAST 컬럼 포함)이 올바르게 복제됩니다.

2. UPDATE 작업의 경우:
   - TOAST 컬럼이 수정되지 않으면 ClickHouse에 NULL 또는 빈 값으로 표시됩니다.
   - TOAST 컬럼이 수정되면 올바르게 복제됩니다.

3. DELETE 작업의 경우 TOAST 컬럼 값이 ClickHouse에 NULL 또는 빈 값으로 표시됩니다.

이러한 동작은 PostgreSQL 소스와 ClickHouse 대상 간의 데이터 불일치를 초래할 수 있습니다. 따라서 TOAST 컬럼이 있는 테이블에 대해 `REPLICA IDENTITY FULL`을 설정하는 것이 정확하고 완전한 데이터 복제를 보장하는 데 중요합니다.

## Conclusion {#conclusion}

TOAST 컬럼을 적절하게 처리하는 것은 PostgreSQL에서 ClickHouse로 복제할 때 데이터 무결성을 유지하는 데 필수적입니다. TOAST 컬럼을 식별하고 적절한 `REPLICA IDENTITY`를 설정함으로써, 데이터가 정확하고 완전하게 복제되도록 할 수 있습니다.
