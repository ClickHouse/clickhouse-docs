---
description: 'ALTER DATABASE ... MODIFY COMMENT 文に関するドキュメントで、データベースコメントの追加、変更、削除を行うことができます。'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
title: 'ALTER DATABASE ... MODIFY COMMENT 文'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER DATABASE ... MODIFY COMMENT

データベースのコメントを、あらかじめ設定されていたかどうかに関係なく追加、変更、または削除します。コメントの変更は、[`system.databases`](/operations/system-tables/databases.md) と `SHOW CREATE DATABASE` クエリの両方に反映されます。



## 構文

```sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## 例

コメント付きの `DATABASE` を作成するには：

```sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT '一時データベース';
```

コメントを編集するには:

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT 'データベースに関する新しいコメント';
```

変更後のコメントを表示するには：

```sql
SELECT comment 
FROM system.databases 
WHERE name = 'database_with_comment';
```

```text
┌─comment─────────────────┐
│ データベースに関する新しいコメント │
└─────────────────────────┘
```

データベースのコメントを削除するには：

```sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

コメントが削除されたことを確認するには：

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
