---
'description': 'ALTER DATABASE ... COMMENT 문서에 대한 설명으로, 데이터베이스 주석을 추가, 수정 또는 제거할 수
  있습니다.'
'slug': '/sql-reference/statements/alter/database-comment'
'sidebar_position': 51
'sidebar_label': 'ALTER DATABASE ... COMMENT 수정'
'title': 'ALTER DATABASE ... COMMENT 문 변경'
'keywords':
- 'ALTER DATABASE'
- 'MODIFY COMMENT'
'doc_type': 'reference'
---


# ALTER DATABASE ... MODIFY COMMENT

데이터베이스 주석을 추가, 수정 또는 제거하며, 이전에 설정되어 있었는지 여부에 관계없이 적용됩니다. 주석 변경 사항은 [`system.databases`](/operations/system-tables/databases.md)와 `SHOW CREATE DATABASE` 쿼리 모두에 반영됩니다.

## Syntax {#syntax}

```sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

주석이 있는 `DATABASE`를 생성하려면:

```sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT 'The temporary database';
```

주석을 수정하려면:

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT 'new comment on a database';
```

수정된 주석을 보려면:

```sql
SELECT comment 
FROM system.databases 
WHERE name = 'database_with_comment';
```

```text
┌─comment─────────────────┐
│ new comment on database │
└─────────────────────────┘
```

데이터베이스 주석을 제거하려면:

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

주석이 제거되었는지 확인하려면:

```sql title="Query"
SELECT comment 
FROM system.databases 
WHERE  name = 'database_with_comment';
```

```text title="Response"
┌─comment─┐
│         │
└─────────┘
```

## Related content {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 절
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
