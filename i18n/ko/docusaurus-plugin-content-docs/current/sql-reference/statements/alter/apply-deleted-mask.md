---
description: '삭제된 행 마스크 적용 문서'
sidebar_label: 'APPLY DELETED MASK'
sidebar_position: 46
slug: /sql-reference/statements/alter/apply-deleted-mask
title: '삭제된 행 마스크 적용'
doc_type: 'reference'
---

# 삭제된 행 마스크 적용하기 \{#apply-mask-of-deleted-rows\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

이 명령은 [lightweight delete](/sql-reference/statements/delete)로 생성된 마스크를 적용하여 삭제된 것으로 표시된 행을 디스크에서 강제로 제거합니다. 이 명령은 비용이 큰 mutation 작업이며, 의미상 `ALTER TABLE [db].name DELETE WHERE _row_exists = 0` 쿼리와 동일합니다.

:::note
[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 계열 테이블([복제된](../../../engines/table-engines/mergetree-family/replication.md) 테이블 포함)에만 동작합니다.
:::

**함께 보기**

* [경량한 삭제](/sql-reference/statements/delete)
* [무거운 삭제](/sql-reference/statements/alter/delete.md)
