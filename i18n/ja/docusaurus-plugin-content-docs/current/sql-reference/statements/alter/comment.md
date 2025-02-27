---
slug: /sql-reference/statements/alter/comment
sidebar_position: 51
sidebar_label: コメント
---

# ALTER TABLE ... MODIFY COMMENT

テーブルへのコメントを追加、変更、または削除します。以前に設定されていたかどうかは問いません。コメントの変更は、[system.tables](../../../operations/system-tables/tables.md)および `SHOW CREATE TABLE` クエリの両方に反映されます。

**構文**

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'コメント'
```

**例**

コメント付きのテーブルを作成する（詳細については、[COMMENT](../../../sql-reference/statements/create/table.md#comment-table) 句を参照）:

``` sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT '一時テーブル';
```

テーブルコメントの変更:

``` sql
ALTER TABLE table_with_comment MODIFY COMMENT 'テーブルの新しいコメント';
SELECT comment FROM system.tables WHERE database = currentDatabase() AND name = 'table_with_comment';
```

新しいコメントの出力:

```text
┌─comment────────────────┐
│ テーブルの新しいコメント │
└────────────────────────┘
```

テーブルコメントの削除:

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

**注意事項**

レプリケートされたテーブルでは、コメントは異なるレプリカで異なる場合があります。コメントの変更は単一のレプリカにのみ適用されます。

この機能はバージョン23.9から利用可能です。以前のClickHouseバージョンでは動作しません。
