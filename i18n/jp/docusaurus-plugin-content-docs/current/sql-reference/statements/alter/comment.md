---
description: 'テーブルコメントの追加、修正、または削除を可能にする ALTER TABLE ... MODIFY COMMENT のドキュメント'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
slug: /sql-reference/statements/alter/comment
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
---


# ALTER TABLE ... MODIFY COMMENT

テーブルコメントの追加、修正、または削除を行います。これは、以前に設定されていたかどうかに関わらず行われます。コメントの変更は、[`system.tables`](../../../operations/system-tables/tables.md) および `SHOW CREATE TABLE` クエリの両方に反映されます。

## 構文 {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

## 例 {#examples}

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

テーブルコメントを修正するには:

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'テーブルについての新しいコメント';
```

修正されたコメントを表示するには:

```sql title="クエリ"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="レスポンス"
┌─comment────────────────┐
│ テーブルについての新しいコメント │
└────────────────────────┘
```

テーブルコメントを削除するには:

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

コメントが削除されたことを確認するには:

```sql title="クエリ"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="レスポンス"
┌─comment─┐
│         │
└─────────┘
```

## 注意点 {#caveats}

レプリケートされたテーブルの場合、コメントは異なるレプリカで異なる場合があります。コメントの修正は1つのレプリカにのみ適用されます。

この機能はバージョン 23.9 から利用可能です。以前の ClickHouse バージョンでは動作しません。

## 関連コンテンツ {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
