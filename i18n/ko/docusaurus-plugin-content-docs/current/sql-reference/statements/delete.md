---
'description': '경량 삭제는 데이터베이스에서 데이터를 삭제하는 과정을 단순화합니다.'
'keywords':
- 'delete'
'sidebar_label': 'DELETE'
'sidebar_position': 36
'slug': '/sql-reference/statements/delete'
'title': '경량 삭제 인스트럭션'
'doc_type': 'reference'
---

The lightweight `DELETE` statement removes rows from the table `[db.]table` that match the expression `expr`. It is only available for the *MergeTree table engine family.

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [IN PARTITION partition_expr] WHERE expr;
```

이것은 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 명령과 대조하여 "경량 `DELETE`"라고 불립니다. 이는 무거운 프로세스입니다.

## Examples {#examples}

```sql
-- Deletes all rows from the `hits` table where the `Title` column contains the text `hello`
DELETE FROM hits WHERE Title LIKE '%hello%';
```

## Lightweight `DELETE` does not delete data immediately {#lightweight-delete-does-not-delete-data-immediately}

Lightweight `DELETE`는 행을 삭제된 것으로 표시하지만 즉시 물리적으로 삭제하지 않는 [변경](/sql-reference/statements/alter#mutations)으로 구현됩니다.

기본적으로, `DELETE` 문은 행을 삭제된 것으로 표시하는 작업이 완료될 때까지 기다린 후 반환됩니다. 데이터 양이 클 경우 시간이 오래 걸릴 수 있습니다. 또는 [`lightweight_deletes_sync`](/operations/settings/settings#lightweight_deletes_sync) 설정을 사용하여 백그라운드에서 비동기적으로 실행할 수 있습니다. 비활성화된 경우, `DELETE` 문은 즉시 반환되지만 백그라운드 변경 작업이 완료될 때까지 데이터는 여전히 쿼리에서 표시될 수 있습니다.

변경은 삭제된 것으로 표시된 행을 물리적으로 삭제하지 않으며, 이는 다음 병합 중에만 발생합니다. 따라서 지정되지 않은 기간 동안 데이터가 실제로 저장소에서 삭제되지 않고 삭제된 것으로만 표시될 가능성이 있습니다.

예측 가능한 시간 내에 데이터가 저장소에서 삭제되도록 보장해야 한다면, 테이블 설정 [`min_age_to_force_merge_seconds`](/operations/settings/merge-tree-settings#min_age_to_force_merge_seconds)를 사용하는 것을 고려하십시오. 또는 [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete) 명령을 사용할 수 있습니다. `ALTER TABLE ... DELETE`를 사용하여 데이터를 삭제하면 영향을 받는 모든 파트를 재생성하기 때문에 상당한 리소스를 소모할 수 있습니다.

## Deleting large amounts of data {#deleting-large-amounts-of-data}

대량 삭제는 ClickHouse의 성능에 부정적인 영향을 미칠 수 있습니다. 테이블에서 모든 행을 삭제하려고 하는 경우, [`TRUNCATE TABLE`](/sql-reference/statements/truncate) 명령을 사용하는 것을 고려하십시오.

빈번한 삭제를 예상하는 경우, [사용자 정의 파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key)를 사용하는 것을 고려하십시오. 그런 다음 [`ALTER TABLE ... DROP PARTITION`](/sql-reference/statements/alter/partition#drop-partitionpart) 명령을 사용하여 해당 파티션과 연관된 모든 행을 신속하게 삭제할 수 있습니다.

## Limitations of lightweight `DELETE` {#limitations-of-lightweight-delete}

### Lightweight `DELETE`s with projections {#lightweight-deletes-with-projections}

기본적으로, `DELETE`는 프로젝션이 있는 테이블에서 작동하지 않습니다. 이는 프로젝션의 행이 `DELETE` 작업의 영향을 받을 수 있기 때문입니다. 그러나 동작을 변경하기 위한 [MergeTree 설정](/operations/settings/merge-tree-settings) `lightweight_mutation_projection_mode`가 있습니다.

## Performance considerations when using lightweight `DELETE` {#performance-considerations-when-using-lightweight-delete}

**경량 `DELETE` 문을 사용하여 대량의 데이터를 삭제하면 SELECT 쿼리 성능에 부정적인 영향을 미칠 수 있습니다.**

다음은 경량 `DELETE` 성능에 부정적인 영향을 미칠 수 있습니다:

- `DELETE` 쿼리에서 무거운 `WHERE` 조건.
- 변경 작업 큐가 다른 많은 변경 작업으로 채워지면, 테이블의 모든 변경 작업이 순차적으로 실행되기 때문에 성능 문제를 일으킬 수 있습니다.
- 영향을 받는 테이블에 데이터 파트가 매우 많음.
- 컴팩트 파트에 많은 데이터가 있는 경우. 컴팩트 파트에서는 모든 컬럼이 하나의 파일에 저장됩니다.

## Delete permissions {#delete-permissions}

`DELETE`는 `ALTER DELETE` 권한이 필요합니다. 특정 테이블에서 주어진 사용자에 대해 `DELETE` 문을 활성화하려면 다음 명령을 실행하십시오:

```sql
GRANT ALTER DELETE ON db.table to username;
```

## How lightweight DELETEs work internally in ClickHouse {#how-lightweight-deletes-work-internally-in-clickhouse}

1. **영향을 받는 행에 "마스크"가 적용됩니다**

   `DELETE FROM table ...` 쿼리가 실행될 때 ClickHouse는 각 행이 "존재"하거나 "삭제됨"으로 표시된 마스크를 저장합니다. "삭제됨" 행은 후속 쿼리에서 생략됩니다. 그러나 행은 실제로 이후 병합에 의해만 제거됩니다. 이 마스크를 작성하는 것은 `ALTER TABLE ... DELETE` 쿼리에서 수행되는 작업보다 훨씬 더 경량입니다.

   마스크는 `_row_exists`라는 숨겨진 시스템 컬럼으로 구현되어 있으며, 모든 보이는 행에 대해 `True`, 삭제된 행에 대해 `False`를 저장합니다. 이 컬럼은 해당 파트에서 행이 삭제된 경우에만 존재합니다. 해당 파트에 모든 값이 `True`인 경우에는 이 컬럼이 존재하지 않습니다.

2. **`SELECT` 쿼리가 마스크를 포함하도록 변환됩니다**

   마스킹된 컬럼이 쿼리에서 사용될 때, `SELECT ... FROM table WHERE condition` 쿼리는 내부적으로 `_row_exists`에 대한 술어로 확장되고 다음과 같이 변환됩니다:
```sql
SELECT ... FROM table PREWHERE _row_exists WHERE condition
```
   실행 시간에, `_row_exists` 컬럼이 읽혀서 반환되지 말아야 할 행을 결정합니다. 삭제된 행이 많으면 ClickHouse는 나머지 컬럼을 읽을 때 완전히 건너뛸 수 있는 그라뉼이 어떤 것인지 판단할 수 있습니다.

3. **`DELETE` 쿼리가 `ALTER TABLE ... UPDATE` 쿼리로 변환됩니다**

   `DELETE FROM table WHERE condition`은 `ALTER TABLE table UPDATE _row_exists = 0 WHERE condition` 변경으로 변환됩니다.

   내부에서 이 변경은 두 단계로 실행됩니다:

   1. 각 개별 파트에 대해 영향을 받는지 판단하기 위해 `SELECT count() FROM table WHERE condition` 명령이 실행됩니다.

   2. 위의 명령에 따라 영향을 받는 파트가 변경되고, 영향을 받지 않는 파트에 대해 하드링크가 생성됩니다. 넓은 파트의 경우 각 행에 대한 `_row_exists` 컬럼이 업데이트되고, 모든 다른 컬럼 파일은 하드링크됩니다. 컴팩트 파트의 경우, 모든 컬럼이 하나의 파일에 함께 저장되므로 모든 컬럼이 재작성됩니다.

   위 단계를 통해, 마스킹 기법을 이용한 경량 `DELETE`는 영향을 받는 파트의 모든 컬럼 파일을 재작성하지 않기 때문에 전통적인 `ALTER TABLE ... DELETE`보다 성능을 향상시킴을 알 수 있습니다.

## Related content {#related-content}

- 블로그: [ClickHouse에서 업데이트 및 삭제 처리](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
