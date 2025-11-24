---
'description': '삭제된 행의 마스크 적용에 대한 문서'
'sidebar_label': 'APPLY DELETED MASK'
'sidebar_position': 46
'slug': '/sql-reference/statements/alter/apply-deleted-mask'
'title': '삭제된 행의 마스크 적용'
'doc_type': 'reference'
---


# 삭제된 행의 마스크 적용

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] APPLY DELETED MASK [IN PARTITION partition_id]
```

이 명령은 [경량 삭제](/sql-reference/statements/delete)로 생성된 마스크를 적용하고, 디스크에서 삭제된 것으로 표시된 행을 강제로 제거합니다. 이 명령은 헤비급 변형으로, 의미적으로 쿼리 ```ALTER TABLE [db].name DELETE WHERE _row_exists = 0```와 같습니다.

:::note
이 명령은 [`MergeTree`](../../../engines/table-engines/mergetree-family/mergetree.md) 계열(예: [복제된](../../../engines/table-engines/mergetree-family/replication.md) 테이블)의 테이블에서만 작동합니다.
:::

**참조**

- [경량 삭제](/sql-reference/statements/delete)
- [헤비급 삭제](/sql-reference/statements/alter/delete.md)
