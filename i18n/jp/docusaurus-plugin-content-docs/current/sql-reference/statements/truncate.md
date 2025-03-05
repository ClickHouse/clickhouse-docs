---
slug: /sql-reference/statements/truncate
sidebar_position: 52
sidebar_label: TRUNCATE
---


# TRUNCATEステートメント

## TRUNCATE TABLE {#truncate-table}
``` sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster]
```

テーブルからすべてのデータを削除します。`IF EXISTS`句を省略すると、テーブルが存在しない場合にクエリはエラーを返します。

`TRUNCATE`クエリは、[View](../../engines/table-engines/special/view.md)、[File](../../engines/table-engines/special/file.md)、[URL](../../engines/table-engines/special/url.md)、[Buffer](../../engines/table-engines/special/buffer.md)、および[Null](../../engines/table-engines/special/null.md)テーブルエンジンではサポートされていません。

[alter_sync](/operations/settings/settings#alter_sync)設定を使用して、レプリカで実行されるアクションを待機するように設定できます。

`TRUNCATE`クエリを実行するために非アクティブなレプリカがどのくらいの間（秒単位）待つかは、[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout)設定で指定できます。

:::note    
`alter_sync`が`2`に設定されている場合、いくつかのレプリカが`replication_wait_for_inactive_replica_timeout`設定で指定された時間よりも長く非アクティブであると、`UNFINISHED`という例外がスローされます。
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

データベースからすべてのテーブルを削除しますが、データベース自体は保持します。`IF EXISTS`句を省略すると、データベースが存在しない場合にクエリはエラーを返します。
