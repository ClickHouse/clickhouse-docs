---
description: '키 표현식 변경에 대한 문서'
sidebar_label: 'ORDER BY'
sidebar_position: 41
slug: /sql-reference/statements/alter/order-by
title: '키 표현식 변경'
doc_type: 'reference'
---

# 키 표현식 조작하기 \{#manipulating-key-expressions\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY ORDER BY new_expression
```

이 명령은 테이블의 [정렬 키](../../../engines/table-engines/mergetree-family/mergetree.md)를 `new_expression`(식 또는 식의 튜플)으로 변경합니다. 기본 키는 그대로 유지됩니다.

이 명령은 메타데이터만 변경한다는 점에서 가벼운 명령입니다. 데이터 파트의 행이 정렬 키 식 기준으로 정렬되어 있다는 특성을 유지하려면, 기존 컬럼을 포함하는 식을 정렬 키에 추가할 수 없습니다(동일한 `ALTER` 쿼리에서 `ADD COLUMN` 명령으로 추가된 컬럼만 가능하며, 기본 컬럼 값 없이 추가해야 합니다).

:::note
[`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 패밀리([복제된](../../../engines/table-engines/mergetree-family/replication.md) 테이블 포함)의 테이블에서만 동작합니다.
:::
