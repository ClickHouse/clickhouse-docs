---
'description': 'ALTER TABLE ... MODIFY COMMENT に関するドキュメントで、テーブルコメントの追加、変更、または削除を許可します。'
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

テーブルのコメントを追加、変更、または削除します。コメントが以前に設定されていたかどうかに関係なく、変更は反映されます。コメントの変更は [`system.tables`](../../../operations/system-tables/tables.md) と `SHOW CREATE TABLE` クエリの両方に反映されます。

## Syntax {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## Examples {#examples}

コメント付きのテーブルを作成するには:

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'The temporary table';
```

テーブルコメントを変更するには:

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'new comment on a table';
```

変更されたコメントを表示するには:

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

テーブルコメントを削除するには:

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

コメントが削除されたことを確認するには:

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

レプリケートされたテーブルの場合、コメントは異なるレプリカで異なる場合があります。コメントの変更は単一のレプリカに適用されます。

この機能はバージョン 23.9 から利用可能です。以前の ClickHouse バージョンでは動作しません。

## Related content {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
