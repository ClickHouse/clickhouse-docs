---
'description': 'ALTER DATABASE ... MODIFY COMMENT ステートメントのドキュメンテーションで、データベースコメントの追加、修正、または削除を可能にします。'
'slug': '/sql-reference/statements/alter/database-comment'
'sidebar_position': 51
'sidebar_label': 'ALTER DATABASE ... MODIFY COMMENT'
'title': 'ALTER DATABASE ... MODIFY COMMENT ステートメント'
'keywords':
- 'ALTER DATABASE'
- 'MODIFY COMMENT'
'doc_type': 'reference'
---


# ALTER DATABASE ... MODIFY COMMENT

データベースのコメントを追加、変更、または削除します。以前に設定されていたかどうかにかかわらず、コメントの変更は [`system.databases`](/operations/system-tables/databases.md) と `SHOW CREATE DATABASE` クエリの両方に反映されます。

## Syntax {#syntax}

```sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

コメント付きの `DATABASE` を作成するには:

```sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT 'The temporary database';
```

コメントを変更するには:

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT 'new comment on a database';
```

変更されたコメントを表示するには:

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

データベースのコメントを削除するには:

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

コメントが削除されたことを確認するには:

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

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
