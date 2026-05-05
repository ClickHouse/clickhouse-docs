---
description: '경량한 삭제 기능은 데이터베이스에서 데이터를 삭제하는 과정을 단순화합니다.'
keywords: ['delete']
sidebar_label: 'DELETE'
sidebar_position: 36
slug: /sql-reference/statements/delete
title: '경량한 DELETE SQL 문'
doc_type: 'reference'
---

경량한 `DELETE` SQL 문은 표현식 `expr`을 만족하는 `[db.]table` 테이블의 행을 삭제합니다. 이 기능은 *MergeTree 테이블 엔진 계열에서만 사용할 수 있습니다.

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

이는 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 명령이 비용이 큰(heavyweight) 처리 과정이라는 점과 대비하여 「경량 `DELETE`」라고 부릅니다.


## 예시 \{#examples\}

```sql
-- Deletes all rows from the `hits` table where the `Title` column contains the text `hello`
DELETE FROM hits WHERE Title LIKE '%hello%';
```


## 경량 `DELETE`는 즉시 데이터를 삭제하지 않습니다 \{#lightweight-delete-does-not-delete-data-immediately\}

경량 `DELETE`는 [뮤테이션](/sql-reference/statements/alter#mutations)으로 구현되며, 행을 삭제된 것으로 표시할 뿐 즉시 물리적으로 삭제하지는 않습니다.

기본적으로 `DELETE` SQL 문은 행을 삭제된 것으로 표시하는 작업이 완료될 때까지 기다린 후에야 반환됩니다. 데이터 양이 많으면 이 작업에 오랜 시간이 소요될 수 있습니다. 대신 설정 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync)을 사용하여 백그라운드에서 비동기적으로 실행할 수 있습니다. 이 설정을 비활성화하면 `DELETE` SQL 문은 즉시 반환되지만, 백그라운드 뮤테이션이 완료될 때까지는 해당 데이터가 쿼리 결과에 계속 나타날 수 있습니다.

뮤테이션은 삭제된 것으로 표시된 행을 물리적으로 삭제하지 않으며, 이는 다음 머지(merge) 시점에만 발생합니다. 그 결과, 일정하지 않은 기간 동안 데이터는 실제로 스토리지에서 삭제되지 않고 삭제된 것으로만 표시되어 있을 수 있습니다.

데이터가 예측 가능한 시간 안에 스토리지에서 삭제되도록 보장해야 하는 경우, 테이블 설정 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds) 사용을 고려하십시오. 또는 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 명령을 사용할 수 있습니다. `ALTER TABLE ... DELETE`를 사용하여 데이터를 삭제하면 영향을 받는 모든 파트를 다시 생성하기 때문에 상당한 리소스를 소모할 수 있다는 점에 유의하십시오.



## 대량 데이터 삭제 \{#deleting-large-amounts-of-data\}

대량 삭제는 ClickHouse 성능에 부정적인 영향을 줄 수 있습니다. 테이블에서 모든 행을 삭제하려는 경우 [`TRUNCATE TABLE`](/sql-reference/statements/truncate) 명령을 사용하는 것을 고려하십시오.

삭제 작업이 자주 발생할 것으로 예상되면 [사용자 정의 파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key) 사용을 고려하십시오. 그런 다음 [`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) 명령을 사용하여 해당 파티션에 속한 모든 행을 빠르게 삭제할 수 있습니다.



## 경량 `DELETE`의 제한 사항 \{#limitations-of-lightweight-delete\}

### 프로젝션이 있는 경량 `DELETE` \{#lightweight-deletes-with-projections\}

기본적으로 `DELETE`는 프로젝션이 있는 테이블에서는 동작하지 않습니다. 이는 프로젝션 내 행이 `DELETE` 연산의 영향을 받을 수 있기 때문입니다. 그러나 동작을 변경하기 위한 [MergeTree 설정](/operations/settings/merge-tree-settings)인 `lightweight_mutation_projection_mode`가 있습니다.



## 경량 `DELETE` 사용 시 성능 고려 사항 \{#performance-considerations-when-using-lightweight-delete\}

**경량 `DELETE` 문으로 대량의 데이터를 삭제하면 SELECT 쿼리 성능에 부정적인 영향을 줄 수 있습니다.**

다음 항목들도 경량 `DELETE` 성능에 부정적인 영향을 줄 수 있습니다:

- `DELETE` 쿼리에서 복잡한 `WHERE` 조건을 사용하는 경우
- 뮤테이션 큐에 다른 뮤테이션이 많이 쌓여 있는 경우, 테이블에 대한 모든 뮤테이션이 순차적으로 실행되므로 성능 문제가 발생할 수 있습니다.
- 해당 테이블에 데이터 파트 수가 매우 많은 경우
- Compact 파트에 많은 데이터가 저장된 경우. Compact 파트에서는 모든 컬럼이 하나의 파일에 저장됩니다.



## 삭제 권한 \{#delete-permissions\}

`DELETE`를 실행하려면 `ALTER DELETE` 권한이 필요합니다. 특정 USER가 특정 테이블에서 `DELETE` SQL 문을 실행할 수 있도록 설정하려면 다음 명령을 실행하십시오:

```sql
GRANT ALTER DELETE ON db.table to username;
```


## ClickHouse에서 경량한 삭제(lightweight DELETE)가 내부적으로 동작하는 방식 \{#how-lightweight-deletes-work-internally-in-clickhouse\}

1. **영향을 받는 행에 "마스크"가 적용됨**

   `DELETE FROM table ...` 쿼리가 실행되면 ClickHouse는 각 행을 "existing"(존재) 또는 "deleted"(삭제됨)으로 표시하는 마스크를 저장합니다. 이렇게 "삭제된" 행들은 이후 쿼리에서 생략됩니다. 다만 실제로 행이 물리적으로 제거되는 것은 이후 머지 작업이 수행될 때입니다. 이 마스크를 기록하는 작업은 `ALTER TABLE ... DELETE` 쿼리가 수행하는 작업보다 훨씬 가볍습니다.

   이 마스크는 숨겨진 `_row_exists` 시스템 컬럼으로 구현되며, 이 컬럼은 보이는 모든 행에 대해 `True`, 삭제된 행에 대해서는 `False`를 저장합니다. 해당 파트에서 일부 행만 삭제된 경우에만 이 컬럼이 그 파트에 존재합니다. 파트의 모든 값이 `True`인 경우에는 이 컬럼이 존재하지 않습니다.

2. **`SELECT` 쿼리가 마스크를 포함하도록 변환됨**

   마스크가 적용된 컬럼이 쿼리에서 사용될 때, `SELECT ... FROM table WHERE condition` 쿼리는 내부적으로 `_row_exists`에 대한 프레디케이트가 추가되어 다음과 같이 변환됩니다:
   ```sql
   SELECT ... FROM table PREWHERE _row_exists WHERE condition
   ```
   실행 시점에 `_row_exists` 컬럼을 읽어서 어떤 행을 반환하지 말아야 하는지 결정합니다. 삭제된 행이 많을 경우, ClickHouse는 나머지 컬럼을 읽을 때 어떤 그래뉼을 완전히 건너뛸 수 있는지 판단할 수 있습니다.

3. **`DELETE` 쿼리가 `ALTER TABLE ... UPDATE` 쿼리로 변환됨**

   `DELETE FROM table WHERE condition`은 내부적으로 `ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` 뮤테이션(mutation)으로 변환됩니다.

   내부적으로 이 뮤테이션은 두 단계로 실행됩니다:

   1. 각 개별 파트에 대해, 해당 파트가 영향을 받는지 확인하기 위해 `SELECT count() FROM table WHERE condition` 명령이 실행됩니다.

   2. 위 명령을 기반으로 영향을 받는 파트는 뮤테이션이 적용되고, 영향을 받지 않은 파트에는 하드링크가 생성됩니다. 와이드 파트의 경우 각 행에 대한 `_row_exists` 컬럼이 업데이트되고, 나머지 모든 컬럼 파일은 하드링크로 처리됩니다. 컴팩트 파트의 경우 모든 컬럼이 하나의 파일에 함께 저장되므로 모든 컬럼을 다시 기록합니다.

   위 단계에서 알 수 있듯이, 마스킹 기법을 사용하는 경량한 `DELETE`는 영향을 받는 파트에 대해 모든 컬럼 파일을 다시 기록하지 않기 때문에 기존의 `ALTER TABLE ... DELETE`보다 성능이 향상됩니다.



## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse에서 업데이트 및 삭제 처리](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
