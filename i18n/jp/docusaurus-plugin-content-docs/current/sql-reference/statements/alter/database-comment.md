---
'description': 'Documentation for ALTER DATABASE ... MODIFY COMMENT statements which
  allow adding, modifying, or removing database comments.'
'slug': '/sql-reference/statements/alter/database-comment'
'sidebar_position': 51
'sidebar_label': 'ALTER DATABASE ... MODIFY COMMENT'
'title': 'ALTER DATABASE ... MODIFY COMMENT Statements'
'keywords':
- 'ALTER DATABASE'
- 'MODIFY COMMENT'
---




# ALTER DATABASE ... MODIFY COMMENT

データベースのコメントを追加、変更、または削除します。これまで設定されていたかどうかに関わらず、コメントの変更は [`system.databases`](/operations/system-tables/databases.md) および `SHOW CREATE DATABASE` クエリに反映されます。

## Syntax {#syntax}

``` sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

コメント付きの `DATABASE` を作成するには:

``` sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT '一時的なデータベース';
```

コメントを変更するには:

``` sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT 'データベースに対する新しいコメント';
```

変更されたコメントを表示するには:

```sql
SELECT comment 
FROM system.databases 
WHERE name = 'database_with_comment';
```

```text
┌─comment─────────────────┐
│ データベースに対する新しいコメント │
└─────────────────────────┘
```

データベースのコメントを削除するには:

``` sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

コメントが削除されたことを確認するには:

```sql title="クエリ"
SELECT comment 
FROM system.databases 
WHERE  name = 'database_with_comment';
```

```text title="レスポンス"
┌─comment─┐
│         │
└─────────┘
```

## Related content {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
