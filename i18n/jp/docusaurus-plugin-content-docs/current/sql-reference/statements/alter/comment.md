---
slug: /sql-reference/statements/alter/comment
sidebar_position: 51
sidebar_label: コメント
---


# ALTER TABLE ... MODIFY COMMENT

テーブルにコメントを追加、修正、または削除します。以前に設定されていたかどうかは関係ありません。コメントの変更は、[system.tables](../../../operations/system-tables/tables.md)および `SHOW CREATE TABLE` クエリの両方に反映されます。

**構文**

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'コメント'
```

**例**

コメント付きのテーブルを作成する（詳細については、[COMMENT](../../../sql-reference/statements/create/table.md#comment-table)句を参照）：

``` sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT '一時テーブル';
```

テーブルコメントの修正：

``` sql
ALTER TABLE table_with_comment MODIFY COMMENT 'テーブルの新しいコメント';
SELECT comment FROM system.tables WHERE database = currentDatabase() AND name = 'table_with_comment';
```

新しいコメントの出力：

```text
┌─comment────────────────┐
│ テーブルの新しいコメント │
└────────────────────────┘
```

テーブルコメントの削除：

``` sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
SELECT comment FROM system.tables WHERE database = currentDatabase() AND name = 'table_with_comment';
```

削除されたコメントの出力：

```text
┌─comment─┐
│         │
└─────────┘
```

**注意事項**

レプリケーションされたテーブルでは、コメントが異なるレプリカ間で異なる場合があります。コメントを修正すると、単一のレプリカにのみ適用されます。

この機能はバージョン23.9以降で利用可能であり、以前のClickHouseバージョンでは動作しません。
