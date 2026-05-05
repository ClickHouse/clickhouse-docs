---
description: '경량 업데이트에서 생성된 패치를 적용하는 방법에 대한 문서'
sidebar_label: 'APPLY PATCHES'
sidebar_position: 47
slug: /sql-reference/statements/alter/apply-patches
title: '경량 업데이트에서 패치 적용하기'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] APPLY PATCHES [IN PARTITION partition_id]
```

이 명령은 [경량 `UPDATE`](/sql-reference/statements/update) SQL 문으로 생성된 패치 파트를 물리적으로 구체화(materialization)하도록 수동으로 트리거합니다. 영향을 받는 컬럼만 다시 기록하여, 보류 중인 패치를 데이터 파트에 강제로 적용합니다.

:::note

* [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 패밀리([복제된](../../../engines/table-engines/mergetree-family/replication.md) 테이블 포함)에 속하는 테이블에서만 동작합니다.
* 이 작업은 변이(mutation) 연산이며, 백그라운드에서 비동기적으로 실행됩니다.
  :::


## APPLY PATCHES 사용 시점 \{#when-to-use\}

:::tip
일반적으로는 `APPLY PATCHES`를 사용할 필요가 없습니다.
:::

패치 파트는 [`apply_patches_on_merge`](/operations/settings/merge-tree-settings#apply_patches_on_merge) 설정이 활성화되어 있을 때(기본값) 머지 중에 자동으로 적용됩니다. 그러나 다음과 같은 경우에는 패치 적용을 수동으로 트리거해야 할 수 있습니다.

- `SELECT` 쿼리 실행 시 패치 적용으로 인한 오버헤드를 줄이기 위해
- 여러 패치 파트가 누적되기 전에 이를 미리 통합하기 위해
- 패치가 이미 구체화된 상태로 백업 또는 내보내기용 데이터를 준비하기 위해
- `apply_patches_on_merge`가 비활성화된 상태에서 패치 적용 시점을 직접 제어하려는 경우

## 예시 \{#examples\}

테이블에 대기 중인 모든 패치를 적용합니다:

```sql
ALTER TABLE my_table APPLY PATCHES;
```

특정 파티션에만 패치 적용:

```sql
ALTER TABLE my_table APPLY PATCHES IN PARTITION '2024-01';
```

다른 작업과 함께 사용하기:

```sql
ALTER TABLE my_table APPLY PATCHES, UPDATE column = value WHERE condition;
```


## 패치 적용 모니터링 \{#monitor\}

[`system.mutations`](/operations/system-tables/mutations) 테이블을 사용하여 패치 적용 상태를 모니터링할 수 있습니다:

```sql
SELECT * FROM system.mutations
WHERE table = 'my_table' AND command LIKE '%APPLY PATCHES%';
```


## 같이 보기 \{#see-also\}

- [경량 `UPDATE`](/sql-reference/statements/update) - 경량 업데이트로 패치 파트를 생성합니다
- [`apply_patches_on_merge` setting](/operations/settings/merge-tree-settings#apply_patches_on_merge) - 머지 시 패치 자동 적용을 제어합니다