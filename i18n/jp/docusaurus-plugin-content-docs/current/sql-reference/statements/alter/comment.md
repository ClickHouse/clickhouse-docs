---
description: 'ALTER TABLE ... MODIFY COMMENT によるテーブルコメントの追加・変更・削除について説明するドキュメント'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
slug: /sql-reference/statements/alter/comment
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER TABLE ... MODIFY COMMENT

テーブルコメントを追加、変更、または削除します。コメントが事前に設定されていたかどうかは問いません。コメントの変更は、[`system.tables`](../../../operations/system-tables/tables.md) と `SHOW CREATE TABLE` クエリの両方に反映されます。



## 構文 {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## 例 {#examples}

コメント付きのテーブルを作成する場合:

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'The temporary table';
```

テーブルのコメントを変更する場合:

```sql
ALTER TABLE table_with_comment
MODIFY COMMENT 'new comment on a table';
```

変更されたコメントを表示する場合:

```sql title="クエリ"
SELECT comment
FROM system.tables
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="レスポンス"
┌─comment────────────────┐
│ new comment on a table │
└────────────────────────┘
```

テーブルのコメントを削除する場合:

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

コメントが削除されたことを確認する場合:

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


## 注意事項 {#caveats}

Replicatedテーブルの場合、コメントはレプリカごとに異なる場合があります。
コメントの変更は単一のレプリカにのみ適用されます。

この機能はバージョン23.9以降で利用可能です。それ以前のClickHouseバージョンでは動作しません。


## 関連コンテンツ {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
