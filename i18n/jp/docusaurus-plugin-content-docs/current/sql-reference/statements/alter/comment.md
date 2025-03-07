---
slug: '/sql-reference/statements/alter/comment'
sidebar_position: 51
sidebar_label: 'コメント'
---


# ALTER TABLE ... MODIFY COMMENT

テーブルにコメントを追加、修正、または削除します。これは、以前にコメントが設定されていたかどうかに関係なく行われます。コメントの変更は、[system.tables](../../../operations/system-tables/tables.md) と `SHOW CREATE TABLE` クエリの両方に反映されます。

**構文**

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'コメント'
```

**例**

コメント付きのテーブルを作成する（詳細については、[COMMENT](/sql-reference/statements/create/table#comment-clause) 句を参照してください）:

``` sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT '一時テーブル';
```

テーブルのコメントを修正する:

``` sql
ALTER TABLE table_with_comment MODIFY COMMENT 'テーブルへの新しいコメント';
SELECT comment FROM system.tables WHERE database = currentDatabase() AND name = 'table_with_comment';
```

新しいコメントの出力:

```text
┌─comment────────────────┐
│ テーブルへの新しいコメント │
└────────────────────────┘
```

テーブルのコメントを削除する:

``` sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
SELECT comment FROM system.tables WHERE database = currentDatabase() AND name = 'table_with_comment';
```

削除されたコメントの出力:

```text
┌─comment─┐
│         │
└─────────┘
```

**注意点**

レプリケーションされたテーブルの場合、コメントは異なるレプリカで異なることがあります。コメントの修正は単一のレプリカに適用されます。

この機能はバージョン 23.9 から利用可能です。以前の ClickHouse バージョンでは動作しません。
