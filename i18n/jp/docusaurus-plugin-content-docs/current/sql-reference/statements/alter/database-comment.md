---
description: 'ALTER DATABASE ... MODIFY COMMENT ステートメントに関するドキュメントで、データベースコメントの追加、修正、または削除を行うことができます。'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
title: 'ALTER DATABASE ... MODIFY COMMENT ステートメント'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
---


# ALTER DATABASE ... MODIFY COMMENT

データベースコメントを追加、修正、または削除します。コメントが以前に設定されていたかどうかに関わらず、変更は [`system.databases`](/operations/system-tables/databases.md) と `SHOW CREATE DATABASE` クエリの両方に反映されます。

## 構文 {#syntax}

``` sql
ALTER DATABASE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## 例 {#examples}

コメント付きの `DATABASE` を作成するには：

``` sql
CREATE DATABASE database_with_comment ENGINE = Memory COMMENT '一時的なデータベース';
```

コメントを修正するには：

``` sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT 'データベースの新しいコメント';
```

修正されたコメントを表示するには：

```sql
SELECT comment 
FROM system.databases 
WHERE name = 'database_with_comment';
```

```text
┌─comment─────────────────┐
│ データベースの新しいコメント │
└─────────────────────────┘
```

データベースのコメントを削除するには：

``` sql
ALTER DATABASE database_with_comment 
MODIFY COMMENT '';
```

コメントが削除されたことを確認するには：

```sql title="Query"
SELECT comment 
FROM system.databases 
WHERE name = 'database_with_comment';
```

```text title="Response"
┌─comment─┐
│         │
└─────────┘
```

## 関連コンテンツ {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
