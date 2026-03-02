---
description: '컬럼 통계 관리에 대한 문서'
sidebar_label: 'STATISTICS'
sidebar_position: 45
slug: /sql-reference/statements/alter/statistics
title: '컬럼 통계 관리'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 컬럼 통계 조작 \{#manipulating-column-statistics\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

다음 작업을 수행할 수 있습니다.

* `ALTER TABLE [db].table ADD STATISTICS [IF NOT EXISTS] (column list) TYPE (type list)` - 테이블 메타데이터에 통계 정의를 추가합니다.

* `ALTER TABLE [db].table MODIFY STATISTICS (column list) TYPE (type list)` - 테이블 메타데이터의 통계 정의를 수정합니다.

* `ALTER TABLE [db].table DROP STATISTICS [IF EXISTS] (column list)` - 지정된 컬럼 메타데이터에서 통계를 제거하고, 지정된 컬럼의 모든 파트에 있는 모든 통계 객체를 삭제합니다.

* `ALTER TABLE [db].table CLEAR STATISTICS [IF EXISTS] (column list)` - 지정된 컬럼의 모든 파트에 있는 모든 통계 객체를 삭제합니다. 통계 객체는 `ALTER TABLE MATERIALIZE STATISTICS`를 사용하여 다시 생성할 수 있습니다.

* `ALTER TABLE [db.]table MATERIALIZE STATISTICS (ALL | [IF EXISTS] (column list))` - 컬럼에 대한 통계를 다시 생성합니다. [뮤테이션](../../../sql-reference/statements/alter/index.md#mutations)으로 구현됩니다.

처음 두 명령은 메타데이터를 변경하거나 파일만 제거하므로 가벼운 작업입니다.

또한 이 두 명령은 복제되며, ZooKeeper를 통해 통계 메타데이터를 동기화합니다.

## 예시: \{#example\}

두 개의 컬럼에 두 가지 통계 유형을 추가하기:

```sql
ALTER TABLE t1 MODIFY STATISTICS c, d TYPE TDigest, Uniq;
```

:::note
통계는 [`*MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 엔진 테이블(복제된 변형 포함) 및 [replicated](../../../engines/table-engines/mergetree-family/replication.md) 변형에만 지원됩니다.
:::
