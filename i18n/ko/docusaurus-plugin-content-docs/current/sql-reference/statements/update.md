---
'description': '경량 업데이트는 패치 파트를 사용하여 데이터베이스에서 데이터를 업데이트하는 과정을 간소화합니다.'
'keywords':
- 'update'
'sidebar_label': 'UPDATE'
'sidebar_position': 39
'slug': '/sql-reference/statements/update'
'title': '경량 업데이트 문장'
'doc_type': 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

:::note
경량 업데이트는 현재 베타 상태입니다.
문제가 발생하면 [ClickHouse 저장소](https://github.com/clickhouse/clickhouse/issues)에 이슈를 열어주십시오.
:::

경량 `UPDATE` 문은 `filter_expr`와 일치하는 행을 가진 테이블 `[db.]table`의 행을 업데이트합니다.
그것은 데이터 파트의 전체 컬럼을 다시 쓰는 무거운 프로세스인 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 쿼리와 대비하여 "경량 업데이트"라고 불립니다.
이는 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 테이블 엔진 패밀리에서만 사용할 수 있습니다.

```sql
UPDATE [db.]table [ON CLUSTER cluster] SET column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr;
```

`filter_expr`는 `UInt8` 유형이어야 합니다. 이 쿼리는 `filter_expr`가 0이 아닌 값을 가지는 행에서 지정된 컬럼의 값을 해당 표현식의 값으로 업데이트합니다.
업데이트되는 값은 `CAST` 연산자를 사용하여 컬럼 유형으로 변환됩니다. 기본 키 또는 파티션 키 계산에 사용되는 컬럼의 업데이트는 지원되지 않습니다.

## 예제 {#examples}

```sql
UPDATE hits SET Title = 'Updated Title' WHERE EventDate = today();

UPDATE wikistat SET hits = hits + 1, time = now() WHERE path = 'ClickHouse';
```

## 경량 업데이트는 데이터를 즉시 업데이트하지 않습니다 {#lightweight-update-does-not-update-data-immediately}

경량 `UPDATE`는 업데이트된 컬럼과 행만 포함하는 특별한 유형의 데이터 파트인 **패치 파트**를 사용하여 구현됩니다.
경량 `UPDATE`는 패치 파트를 생성하지만 원래 데이터를 물리적으로 스토리지에서 즉시 수정하지는 않습니다.
업데이트 과정은 `INSERT ... SELECT ...` 쿼리와 유사하지만, `UPDATE` 쿼리는 패치 파트 생성이 완료될 때까지 기다린 후 반환됩니다.

업데이트된 값은 다음과 같습니다:
- **패치 적용을 통해 `SELECT` 쿼리에서 즉시 가시화됨**
- **후속 병합 및 변형에서만 물리적으로 실체화됨**
- **모든 활성 파트가 패치가 실체화되면 자동으로 정리됨**

## 경량 업데이트 요구 사항 {#lightweight-update-requirements}

경량 업데이트는 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree), [`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree), [`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree) 엔진 및 그들의 [`Replicated`](/engines/table-engines/mergetree-family/replication.md) 및 [`Shared`](/cloud/reference/shared-merge-tree) 버전에서 지원됩니다.

경량 업데이트를 사용하려면 테이블 설정 [`enable_block_number_column`](/operations/settings/merge-tree-settings#enable_block_number_column) 및 [`enable_block_offset_column`](/operations/settings/merge-tree-settings#enable_block_offset_column)에 따라 `_block_number` 및 `_block_offset` 컬럼의 실체화가 활성화되어야 합니다.

## 경량 삭제 {#lightweight-delete}

[경량 `DELETE`](/sql-reference/statements/delete) 쿼리는 `ALTER UPDATE` 변형 대신 경량 `UPDATE`로 실행될 수 있습니다. 경량 `DELETE`의 구현은 설정 [`lightweight_delete_mode`](/operations/settings/settings#lightweight_delete_mode)에 의해 제어됩니다.

## 성능 고려 사항 {#performance-considerations}

**경량 업데이트의 장점:**
- 업데이트의 대기 시간은 `INSERT ... SELECT ...` 쿼리의 대기 시간과 비슷합니다.
- 업데이트된 컬럼과 값만 기록되며, 데이터 파트의 전체 컬럼은 기록되지 않습니다.
- 현재 실행 중인 병합/변형이 완료될 때까지 기다릴 필요가 없으므로 업데이트의 대기 시간이 예측 가능합니다.
- 경량 업데이트의 병렬 실행이 가능합니다.

**잠재적인 성능 영향:**
- 패치를 적용해야 하는 `SELECT` 쿼리에 오버헤드를 추가합니다.
- 패치를 적용해야 하는 데이터 파트의 컬럼에 대해 [스킵 인덱스](/engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)는 사용되지 않습니다. 테이블에 패치 파트가 있을 경우 [프로젝션](/engines/table-engines/mergetree-family/mergetree.md/#projections)은 사용되지 않습니다.
- 너무 잦은 작은 업데이트는 "파트가 너무 많음" 오류를 초래할 수 있습니다. 예를 들어, 여러 업데이트를 하나의 쿼리로 배치하는 것이 추천되며, `WHERE` 절의 단일 `IN` 절에 업데이트할 id를 넣는 방법입니다.
- 경량 업데이트는 소량의 행(테이블의 약 10%까지)을 업데이트하도록 설계되었습니다. 더 큰 양을 업데이트해야 할 경우 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 변형을 사용하는 것이 좋습니다.

## 동시 작업 {#concurrent-operations}

경량 업데이트는 무거운 변형과 달리 현재 실행 중인 병합/변형이 완료될 때까지 기다리지 않습니다.
동시 경량 업데이트의 일관성은 [`update_sequential_consistency`](/operations/settings/settings#update_sequential_consistency) 및 [`update_parallel_mode`](/operations/settings/settings#update_parallel_mode) 설정에 의해 제어됩니다.

## 업데이트 권한 {#update-permissions}

`UPDATE`는 `ALTER UPDATE` 권한이 필요합니다. 특정 사용자가 특정 테이블에 `UPDATE` 문을 활성화하려면 다음을 실행하십시오:

```sql
GRANT ALTER UPDATE ON db.table TO username;
```

## 구현 세부정보 {#details-of-the-implementation}

패치 파트는 일반 파트와 동일하며 업데이트된 컬럼과 몇 개의 시스템 컬럼만 포함합니다:
- `_part` - 원래 파트의 이름
- `_part_offset` - 원래 파트에서의 행 번호
- `_block_number` - 원래 파트에서의 행의 블록 번호
- `_block_offset` - 원래 파트에서의 행의 블록 오프셋
- `_data_version` - 업데이트된 데이터의 데이터 버전(`UPDATE` 쿼리에 할당된 블록 번호)

평균적으로 패치 파트에서 업데이트된 행당 약 40바이트(압축되지 않은 데이터)의 오버헤드가 발생합니다.
시스템 컬럼은 업데이트해야 할 원래 파트의 행을 찾는 데 도움이 됩니다.
시스템 컬럼은 패치 파트를 적용해야 할 경우 읽기 위해 추가된 원래 파트의 [가상 컬럼](/engines/table-engines/mergetree-family/mergetree.md/#virtual-columns)과 관련이 있습니다.
패치 파트는 `_part` 및 `_part_offset`에 따라 정렬됩니다.

패치 파트는 원래 파트와 다른 파티션에 속합니다.
패치 파트의 파티션 ID는 `patch-<패치 파트의 컬럼 이름 해시>-<원래_partition_id>`입니다.
따라서 서로 다른 컬럼을 가진 패치 파트는 서로 다른 파티션에 저장됩니다.
예를 들어, 세 가지 업데이트 `SET x = 1 WHERE <cond>`, `SET y = 1 WHERE <cond>` 및 `SET x = 1, y = 1 WHERE <cond>`는 세 가지 다른 파티션에 세 개의 패치 파트를 생성합니다.

패치 파트는 서로 간에 병합될 수 있어 `SELECT` 쿼리에서 적용된 패치의 수를 줄이고 오버헤드를 줄일 수 있습니다. 패치 파트의 병합은 `_data_version`을 버전 컬럼으로 사용하는 [교체](/engines/table-engines/mergetree-family/replacingmergetree) 병합 알고리즘을 사용합니다.
따라서 패치 파트는 항상 파트에서 각 업데이트된 행의 최신 버전을 저장합니다.

경량 업데이트는 현재 실행 중인 병합 및 변형이 완료될 때까지 기다리지 않으며 항상 데이터를 업데이트하고 패치 파트를 생성하기 위해 현재 데이터 파트의 스냅샷을 사용합니다.
이로 인해 패치 파트를 적용하는 두 가지 경우가 발생할 수 있습니다.

예를 들어, 파트 `A`를 읽는다면 패치 파트 `X`를 적용해야 합니다:
- `X`가 `A` 자체를 포함하는 경우. 이는 `UPDATE`가 실행될 때 `A`가 병합에 참여하지 않았을 때 발생합니다.
- `X`가 `A`로 커버되는 파트 `B` 및 `C`를 포함하는 경우. 이는 `UPDATE`가 실행될 때 병합 (`B`, `C`) -> `A`가 실행 중일 때 발생합니다.

이 두 경우에 대해 패치 파트를 적용하는 두 가지 방법이 각각 있습니다:
- 정렬된 컬럼 `_part`, `_part_offset`를 사용한 병합.
- `_block_number`, `_block_offset` 컬럼에 의한 조인.

조인 모드는 병합 모드보다 느리고 메모리를 더 많이 요구하지만 덜 자주 사용됩니다.

## 관련 콘텐츠 {#related-content}

- [`ALTER UPDATE`](/sql-reference/statements/alter/update) - 무거운 `UPDATE` 작업
- [경량 `DELETE`](/sql-reference/statements/delete) - 경량 `DELETE` 작업
