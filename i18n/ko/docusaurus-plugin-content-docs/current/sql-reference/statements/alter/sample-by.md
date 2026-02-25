---
description: 'SAMPLE BY 식 변경에 대한 문서'
sidebar_label: 'SAMPLE BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/sample-by
title: '샘플링 키(Sampling-Key) 식 변경'
doc_type: 'reference'
---

# SAMPLE BY 식 다루기 \{#manipulating-sample-by-expression\}

다음과 같은 연산을 사용할 수 있습니다.

## MODIFY \{#modify\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY SAMPLE BY new_expression
```

이 명령은 테이블의 [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md)를 `new_expression`(식 또는 식들의 튜플)으로 변경합니다. 기본 키에는 새 샘플링 키가 포함되어야 합니다.

## REMOVE \{#remove\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] REMOVE SAMPLE BY
```

이 명령은 테이블의 [sampling key](../../../engines/table-engines/mergetree-family/mergetree.md)를 제거합니다.

`MODIFY` 및 `REMOVE` 명령은 메타데이터만 변경하거나 파일만 제거한다는 점에서 경량 작업입니다.

:::note
이 기능은 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 패밀리의 테이블( [복제된 테이블(Replicated Table)](../../../engines/table-engines/mergetree-family/replication.md) 포함)에만 작동합니다.
:::
