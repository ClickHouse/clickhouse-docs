---
description: '경량 업데이트는 패치 파트를 사용하여 데이터베이스의 데이터를 업데이트하는 작업을 단순화합니다.'
keywords: ['update']
sidebar_label: 'UPDATE'
sidebar_position: 39
slug: /sql-reference/statements/update
title: '경량 UPDATE SQL 문'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
경량 업데이트는 현재 베타 단계입니다.
문제가 발생하면 [ClickHouse repository](https://github.com/clickhouse/clickhouse/issues)에 issue를 등록해 주십시오.
:::

경량 `UPDATE` SQL 문은 `filter_expr` 조건식과 일치하는 `[db.]table` 테이블의 행을 업데이트합니다.
이 기능은 전체 데이터 파트에서 컬럼 전체를 다시 쓰는 무거운 처리 방식인 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 쿼리와 구분하여 「경량 업데이트」라고 합니다.
[`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 테이블 엔진 패밀리에서만 사용할 수 있습니다.

```sql
UPDATE [db.]table [ON CLUSTER cluster] SET column1 = expr1 [, ...] [IN PARTITION partition_expr] WHERE filter_expr;
```

`filter_expr`는 `UInt8` 타입이어야 합니다. 이 쿼리는 `filter_expr`가 0이 아닌 값을 갖는 행에서 지정된 컬럼의 값을 각 컬럼에 대응하는 표현식의 값으로 업데이트합니다.
값은 `CAST` 연산자를 사용하여 컬럼 타입으로 변환됩니다. 기본 키 또는 파티션 키 계산에 사용되는 컬럼을 업데이트하는 것은 지원되지 않습니다.


## 예제 \{#examples\}

```sql
UPDATE hits SET Title = 'Updated Title' WHERE EventDate = today();

UPDATE wikistat SET hits = hits + 1, time = now() WHERE path = 'ClickHouse';
```


## Lightweight updates do not update data immediately \{#lightweight-update-does-not-update-data-immediately\}

경량 `UPDATE`는 **patch parts**라는, 업데이트된 컬럼과 행만을 포함하는 특수한 종류의 데이터 파트를 사용하여 구현됩니다.
경량 `UPDATE`는 patch parts를 생성하지만, 스토리지의 원본 데이터를 즉시 물리적으로 수정하지는 않습니다.
업데이트 과정은 `INSERT ... SELECT ...` 쿼리와 유사하지만, `UPDATE` 쿼리는 patch part 생성이 완료될 때까지 대기한 후에야 종료됩니다.

업데이트된 값은 다음과 같습니다.

- 패치가 적용되어 `SELECT` 쿼리에서 **즉시 조회**됩니다.
- 이후의 머지와 뮤테이션 시에만 **물리적으로 구체화**됩니다.
- 모든 활성 파트에 패치가 구체화되면 **자동으로 정리(삭제)**됩니다.

## 경량 업데이트 요구 사항 \{#lightweight-update-requirements\}

경량 업데이트는 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree), [`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree), [`CollapsingMergeTree`](/engines/table-engines/mergetree-family/collapsingmergetree), [`VersionedCollapsingMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/versionedcollapsingmergetree) 엔진과 해당 [`Replicated`](/engines/table-engines/mergetree-family/replication.md) 및 [`Shared`](/cloud/reference/shared-merge-tree) 버전에서 지원됩니다.

경량 업데이트를 사용하려면 `_block_number` 및 `_block_offset` 컬럼을 머티리얼라이즈(materialize)하도록 테이블 설정 [`enable_block_number_column`](/operations/settings/merge-tree-settings#enable_block_number_column) 및 [`enable_block_offset_column`](/operations/settings/merge-tree-settings#enable_block_offset_column)을 활성화해야 합니다.

## 경량한 삭제 \{#lightweight-delete\}

[경량한 `DELETE`](/sql-reference/statements/delete) 쿼리는 `ALTER UPDATE` mutation 대신 경량한 `UPDATE`로 실행할 수 있습니다. 경량한 `DELETE`의 구현 방식은 [`lightweight_delete_mode`](/operations/settings/settings#lightweight_delete_mode) SETTING을 통해 제어됩니다.

## 성능 고려 사항 \{#performance-considerations\}

**경량 업데이트의 장점:**

- 업데이트 지연 시간은 `INSERT ... SELECT ...` 쿼리의 지연 시간과 비슷합니다.
- 데이터 파트의 전체 컬럼이 아니라 변경된 컬럼과 값만 기록됩니다.
- 현재 실행 중인 머지/뮤테이션이 완료될 때까지 기다릴 필요가 없으므로 업데이트 지연 시간을 예측할 수 있습니다.
- 경량 업데이트를 병렬로 실행할 수 있습니다.

**성능에 미치는 잠재적 영향:**

- 패치를 적용해야 하는 `SELECT` 쿼리에 오버헤드가 추가됩니다.
- 적용할 패치가 있는 데이터 파트의 컬럼에는 [데이터 스키핑 인덱스](/engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)가 사용되지 않습니다. 테이블에 패치 파트가 있는 경우, 적용할 패치가 없는 데이터 파트에 대해서도 [프로젝션](/engines/table-engines/mergetree-family/mergetree.md/#projections)이 사용되지 않습니다.
- 너무 자주 수행되는 소규모 업데이트는 "too many parts" 오류를 유발할 수 있습니다. 여러 업데이트를 하나의 쿼리로 묶는 것이 좋으며, 예를 들어 업데이트할 ID를 하나의 `IN` 절에 모아 `WHERE` 절에서 사용하는 방법이 있습니다.
- 경량 업데이트는 적은 양의 행(테이블의 약 10%까지)을 업데이트하도록 설계되었습니다. 더 많은 양을 업데이트해야 하는 경우 [`ALTER TABLE ... UPDATE`](/sql-reference/statements/alter/update) 뮤테이션을 사용하는 것이 좋습니다.

## 동시 작업 \{#concurrent-operations\}

경량 업데이트는 무거운 뮤테이션과 달리, 현재 실행 중인 머지/뮤테이션이 완료될 때까지 기다리지 않습니다.
경량 업데이트가 동시로 실행될 때의 일관성은 설정 [`update_sequential_consistency`](/operations/settings/settings#update_sequential_consistency) 및 [`update_parallel_mode`](/operations/settings/settings#update_parallel_mode)로 제어됩니다.

## 업데이트 권한 \{#update-permissions\}

`UPDATE`에는 `ALTER UPDATE` 권한이 필요합니다. 특정 사용자에게 특정 테이블에서 `UPDATE` SQL 문을 사용할 수 있게 하려면 다음을 실행하십시오:

```sql
GRANT ALTER UPDATE ON db.table TO username;
```


## 구현 상세 \{#details-of-the-implementation\}

패치 파트는 일반 파트와 동일하지만, 업데이트된 컬럼과 몇 개의 시스템 컬럼만 포함합니다:

- `_part` - 원본 파트의 이름
- `_part_offset` - 원본 파트에서의 행 번호
- `_block_number` - 원본 파트에서 해당 행이 속한 블록 번호
- `_block_offset` - 원본 파트에서 해당 행의 블록 오프셋
- `_data_version` - 업데이트된 데이터의 데이터 버전 (`UPDATE` 쿼리를 위해 할당된 블록 번호)

평균적으로 패치 파트에서 업데이트된 각 행마다 약 40바이트(비압축 데이터)의 오버헤드가 발생합니다.
시스템 컬럼은 업데이트되어야 하는 원본 파트의 행을 찾는 데 도움이 됩니다.
시스템 컬럼은 패치 파트를 적용해야 하는 경우 읽기 위해 추가되는, 원본 파트의 [가상 컬럼](/engines/table-engines/mergetree-family/mergetree.md/#virtual-columns)과 연관됩니다.
패치 파트는 `_part` 및 `_part_offset` 기준으로 정렬됩니다.

패치 파트는 원본 파트와는 다른 파티션에 속합니다.
패치 파트의 파티션 ID는 `patch-<hash of column names in patch part>-<original_partition_id>`입니다.
따라서 서로 다른 컬럼을 가진 패치 파트는 서로 다른 파티션에 저장됩니다.
예를 들어 `SET x = 1 WHERE <cond>`, `SET y = 1 WHERE <cond>`, `SET x = 1, y = 1 WHERE <cond>`라는 세 개의 UPDATE 문은 세 개의 서로 다른 파티션에 세 개의 패치 파트를 생성합니다.

패치 파트는 `SELECT` 쿼리에서 적용해야 하는 패치 수와 오버헤드를 줄이기 위해 서로 간에 머지될 수 있습니다.
패치 파트의 머지는 `_data_version`을 버전 컬럼으로 사용하는 [replacing](/engines/table-engines/mergetree-family/replacingmergetree) 머지 알고리즘을 사용합니다.
따라서 패치 파트는 항상 해당 파트에서 각 업데이트된 행에 대해 최신 버전을 저장합니다.

경량 업데이트는 현재 실행 중인 머지와 뮤테이션이 완료되기를 기다리지 않고, 항상 현재 데이터 파트의 스냅샷을 사용하여 업데이트를 실행하고 패치 파트를 생성합니다.
이 때문에 패치 파트를 적용하는 경우는 두 가지가 있을 수 있습니다.

예를 들어 파트 `A`를 읽을 때 패치 파트 `X`를 적용해야 한다고 가정합니다:

- `X`에 파트 `A` 자체가 포함되어 있는 경우. 이는 `UPDATE`가 실행될 때 `A`가 머지에 참여하지 않았을 때 발생합니다.
- `X`에 파트 `B`와 `C`가 포함되어 있고, 이들이 파트 `A`에 의해 커버되는 경우. 이는 `UPDATE`가 실행될 때 (`B`, `C`) -> `A` 머지가 실행 중이었을 때 발생합니다.

이 두 경우에 대해 각각 패치 파트를 적용하는 두 가지 방식이 있습니다:

- 정렬된 컬럼 `_part`, `_part_offset`에 의한 머지 사용.
- `_block_number`, `_block_offset` 컬럼에 의한 조인 사용.

조인 모드는 머지 모드보다 느리고 더 많은 메모리를 필요로 하지만, 사용 빈도는 더 낮습니다.

## 관련 콘텐츠 \{#related-content\}

- [`ALTER UPDATE`](/sql-reference/statements/alter/update) - 대량 `UPDATE` 작업
- [경량 `DELETE`](/sql-reference/statements/delete) - 경량 `DELETE` 작업
- [`APPLY PATCHES`](/sql-reference/statements/alter/apply-patches) - 데이터 파트에 적용된 패치를 물리적으로 구체화하도록 강제하는 작업(뮤테이션 작업)