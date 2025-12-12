---
description: 'ALTER DATABASE ... MODIFY COMMENT 文に関するドキュメントで、データベースコメントの追加、変更、削除を行うことができます。'
slug: /sql-reference/statements/alter/database-comment
sidebar_position: 51
sidebar_label: 'ALTER DATABASE ... MODIFY COMMENT'
title: 'ALTER DATABASE ... MODIFY COMMENT 文'
keywords: ['ALTER DATABASE', 'MODIFY COMMENT']
doc_type: 'reference'
---

# ALTER DATABASE ... MODIFY COMMENT {#alter-database-modify-comment}

データベースのコメントを、あらかじめ設定されていたかどうかに関係なく追加、変更、または削除します。コメントの変更は、[`system.databases`](/operations/system-tables/databases.md) と `SHOW CREATE DATABASE` クエリの両方に反映されます。

## 構文 {#syntax}

```

## Examples {#examples}

To create a `DATABASE` with a comment:

```

## 例 {#examples}

コメント付きの `DATABASE` を作成するには：

```

To modify the comment:

```

コメントを編集するには:

```

To view the modified comment:

```

変更後のコメントを表示するには：

```

```

```

To remove the database comment:

```

データベースのコメントを削除するには：

```

To verify that the comment was removed:

```

コメントが削除されたことを確認するには：

```

```

```text title="Response"
┌─comment─┐
│         │
└─────────┘
```

## 関連コンテンツ {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER TABLE ... MODIFY COMMENT`](./comment.md)
