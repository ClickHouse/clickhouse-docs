---
'description': '제약 조건 조작에 대한 Documentation'
'sidebar_label': 'CONSTRAINT'
'sidebar_position': 43
'slug': '/sql-reference/statements/alter/constraint'
'title': '제약 조건 조작'
'doc_type': 'reference'
---


# 제약 조건 조작

제약 조건은 다음 구문을 사용하여 추가하거나 삭제할 수 있습니다:

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] ADD CONSTRAINT [IF NOT EXISTS] constraint_name CHECK expression;
ALTER TABLE [db].name [ON CLUSTER cluster] DROP CONSTRAINT [IF EXISTS] constraint_name;
```

자세한 내용은 [제약 조건](../../../sql-reference/statements/create/table.md#constraints)을 참조하세요.

쿼리는 테이블의 제약 조건에 대한 메타데이터를 추가하거나 제거하므로 즉시 처리됩니다.

:::tip
제약 조건이 추가된 경우 기존 데이터에 대해 **검사가 실행되지 않습니다**.
:::

복제된 테이블에서의 모든 변경 사항은 ZooKeeper에 브로드캐스트되며 다른 복제본에도 적용됩니다.
