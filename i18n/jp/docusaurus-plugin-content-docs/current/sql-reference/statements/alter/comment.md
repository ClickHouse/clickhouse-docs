---
description: 'ALTER TABLE ... MODIFY COMMENT に関するドキュメント。テーブルコメントの追加・変更・削除を行うための構文です'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
slug: /sql-reference/statements/alter/comment
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER TABLE ... MODIFY COMMENT

テーブルコメントを、コメントが事前に設定されていたかどうかに関係なく追加、変更、または削除します。コメントの変更は、[`system.tables`](../../../operations/system-tables/tables.md) と `SHOW CREATE TABLE` クエリの両方に反映されます。



## 構文

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## 例

コメント付きテーブルを作成するには、次のようにします。

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT '一時テーブル';
```

テーブルのコメントを変更するには:

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
│ テーブルに対する新しいコメント │
└────────────────────────┘
```

テーブルコメントを削除するには:

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

コメントが削除されたことを確認するには、次の手順を実行します。

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


## 注意事項 {#caveats}

Replicated テーブルの場合、コメントはレプリカごとに異なる場合があります。
コメントの変更は 1 つのレプリカにのみ適用されます。

この機能はバージョン 23.9 以降で利用可能です。以前の ClickHouse のバージョンでは使用できません。



## 関連コンテンツ {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
