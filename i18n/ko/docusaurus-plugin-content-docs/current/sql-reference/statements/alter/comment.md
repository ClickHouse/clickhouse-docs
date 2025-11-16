---
'description': 'ALTER TABLE ... MODIFY COMMENT에 대한 문서로, 테이블 주석을 추가, 수정 또는 제거할 수 있습니다.'
'sidebar_label': 'ALTER TABLE ... MODIFY COMMENT'
'sidebar_position': 51
'slug': '/sql-reference/statements/alter/comment'
'title': 'ALTER TABLE ... MODIFY COMMENT'
'keywords':
- 'ALTER TABLE'
- 'MODIFY COMMENT'
'doc_type': 'reference'
---


# ALTER TABLE ... MODIFY COMMENT

테이블의 주석을 추가, 수정 또는 제거하며, 이전에 설정되었는지 여부에 관계없이 적용됩니다. 주석 변경 사항은 [`system.tables`](../../../operations/system-tables/tables.md)와 `SHOW CREATE TABLE` 쿼리 모두에 반영됩니다.

## Syntax {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

주석이 있는 테이블을 생성하려면:

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'The temporary table';
```

테이블 주석을 수정하려면:

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'new comment on a table';
```

수정된 주석을 보려면:

```sql title="Query"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Response"
┌─comment────────────────┐
│ new comment on a table │
└────────────────────────┘
```

테이블 주석을 제거하려면:

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

주석이 제거되었는지 확인하려면:

```sql title="Query"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Response"
┌─comment─┐
│         │
└─────────┘
```

## Caveats {#caveats}

복제된 테이블의 경우, 주석이 서로 다른 복제본에서 다를 수 있습니다. 주석 수정은 단일 복제본에 적용됩니다.

이 기능은 버전 23.9부터 사용할 수 있으며, 이전 ClickHouse 버전에서는 작동하지 않습니다.

## Related content {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 절
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
