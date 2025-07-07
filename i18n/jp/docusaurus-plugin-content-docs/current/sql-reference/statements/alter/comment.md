---
'description': 'ALTER TABLE ... MODIFY COMMENT により、テーブルコメントの追加、変更、削除が可能となるドキュメント'
'sidebar_label': 'ALTER TABLE ... MODIFY COMMENT'
'sidebar_position': 51
'slug': '/sql-reference/statements/alter/comment'
'title': 'ALTER TABLE ... MODIFY COMMENT'
'keywords':
- 'ALTER TABLE'
- 'MODIFY COMMENT'
---




# ALTER TABLE ... MODIFY COMMENT

テーブルコメントを追加、変更、または削除します。以前に設定されていたかどうかに関係なく、コメントの変更は、[`system.tables`](../../../operations/system-tables/tables.md) および `SHOW CREATE TABLE` クエリの両方に反映されます。

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
COMMENT '一時テーブル';
```

テーブルコメントを変更するには:

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'テーブルの新しいコメント';
```

変更されたコメントを表示するには:

```sql title="Query"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Response"
┌─comment────────────────┐
│ テーブルの新しいコメント │
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

レプリケーションテーブルの場合、コメントは異なるレプリカごとに異なる可能性があります。コメントの変更は単一のレプリカに適用されます。

この機能はバージョン23.9以降で利用可能であり、以前のClickHouseバージョンでは機能しません。

## Related content {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
