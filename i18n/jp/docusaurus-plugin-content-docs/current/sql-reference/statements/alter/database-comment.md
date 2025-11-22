---
description: 'ALTER DATABASE ... MODIFY COMMENT ステートメントに関するドキュメント。これらのステートメントを使用すると、データベースコメントの追加、変更、削除を行えます。'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
title: 'ALTER DATABASE ... MODIFY COMMENT ステートメント'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER DATABASE ... MODIFY COMMENT

データベースのコメントを、設定済みかどうかに関係なく追加、変更、または削除します。コメントの変更は、[`system.databases`](/operations/system-tables/databases.md) と `SHOW CREATE DATABASE` クエリの両方に反映されます。



## 構文 {#syntax}

```sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## 例 {#examples}

コメント付きで`DATABASE`を作成するには:

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


## 関連コンテンツ {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
