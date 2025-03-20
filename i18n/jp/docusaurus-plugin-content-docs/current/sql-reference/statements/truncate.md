---
slug: '/sql-reference/statements/truncate'
sidebar_position: 52
sidebar_label: 'TRUNCATE'
---


# TRUNCATE ステートメント

## TRUNCATE TABLE {#truncate-table}
``` sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster]
```

テーブルからすべてのデータを削除します。`IF EXISTS`句を省略すると、テーブルが存在しない場合にクエリがエラーを返します。

`TRUNCATE`クエリは、[View](../../engines/table-engines/special/view.md)、[File](../../engines/table-engines/special/file.md)、[URL](../../engines/table-engines/special/url.md)、[Buffer](../../engines/table-engines/special/buffer.md)、および [Null](../../engines/table-engines/special/null.md) テーブルエンジンではサポートされていません。

[alter_sync](/operations/settings/settings#alter_sync)設定を使用して、レプリカでアクションが実行されるのを待機するように設定できます。

`TRUNCATE`クエリを実行するために待機する非アクティブなレプリカの最大待機時間（秒単位）を、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout)設定で指定できます。

:::note    
`alter_sync`が`2`に設定されていて、一部のレプリカが`replication_wait_for_inactive_replica_timeout`設定で指定された時間以上非アクティブの場合、`UNFINISHED`という例外がスローされます。
:::

## TRUNCATE ALL TABLES {#truncate-all-tables}
``` sql
TRUNCATE ALL TABLES FROM [IF EXISTS] db [ON CLUSTER cluster]
```

データベース内のすべてのテーブルからすべてのデータを削除します。

## TRUNCATE DATABASE {#truncate-database}
``` sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

データベースからすべてのテーブルを削除しますが、データベース自体は保持します。`IF EXISTS`句を省略すると、データベースが存在しない場合にクエリがエラーを返します。

:::note
`TRUNCATE DATABASE`は`Replicated`データベースではサポートされていません。その代わり、データベースを`DROP`して`CREATE`してください。
:::
