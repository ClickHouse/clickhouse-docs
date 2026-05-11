---
description: 'CONSTRAINT 관리에 대한 문서'
sidebar_label: 'CONSTRAINT'
sidebar_position: 43
slug: /sql-reference/statements/alter/constraint
title: 'CONSTRAINT 관리'
doc_type: 'reference'
---

# CONSTRAINT 관리 \{#manipulating-constraints\}

CONSTRAINT를 다음 구문을 사용하여 추가하거나 삭제할 수 있습니다:

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

[제약 조건](../../../sql-reference/statements/create/table.md#constraints)에 대해 더 자세한 내용은 이 문서를 참고하십시오.

제약 조건 메타데이터를 테이블에 추가하거나 제거하는 쿼리는 즉시 처리됩니다.

:::tip
제약 조건이 추가되더라도 기존 데이터에 대해서는 **검사가 실행되지 않습니다**.
:::

모든 복제된 테이블(Replicated Table)에 대한 변경 사항은 ZooKeeper를 통해 브로드캐스트되며, 다른 레플리카에도 동일하게 적용됩니다.
