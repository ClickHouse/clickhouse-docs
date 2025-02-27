---
slug: /sql-reference/statements/truncate
sidebar_position: 52
sidebar_label: TRUNCATE
---

# TRUNCATE ステートメント

## TRUNCATE TABLE {#truncate-table}
``` sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster]
```

テーブルからすべてのデータを削除します。`IF EXISTS`句が省略されると、テーブルが存在しない場合にクエリはエラーを返します。

`TRUNCATE`クエリは、[View](../../engines/table-engines/special/view.md)、[File](../../engines/table-engines/special/file.md)、[URL](../../engines/table-engines/special/url.md)、[Buffer](../../engines/table-engines/special/buffer.md)、および[Null](../../engines/table-engines/special/null.md)テーブルエンジンにはサポートされていません。

[alter_sync](../../operations/settings/settings.md#alter-sync)設定を使用して、レプリカでアクションが実行されるのを待機するように設定できます。

非アクティブなレプリカが`TRUNCATE`クエリを実行するまでの待機時間（秒単位）を、[replication_wait_for_inactive_replica_timeout](../../operations/settings/settings.md#replication-wait-for-inactive-replica-timeout)設定を使用して指定できます。

:::note    
`alter_sync`が`2`に設定されており、`replication_wait_for_inactive_replica_timeout`設定で指定された時間以上非アクティブなレプリカがある場合、例外`UNFINISHED`がスローされます。
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

データベースからすべてのテーブルを削除しますが、データベース自体は保持します。`IF EXISTS`句が省略されると、データベースが存在しない場合にクエリはエラーを返します。
