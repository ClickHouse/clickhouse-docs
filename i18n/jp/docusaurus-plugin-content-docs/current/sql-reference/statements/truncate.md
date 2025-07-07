---
'description': 'TRUNCATE ステートメントのドキュメント'
'sidebar_label': 'TRUNCATE'
'sidebar_position': 52
'slug': '/sql-reference/statements/truncate'
'title': 'TRUNCATE ステートメント'
---




# TRUNCATEステートメント

## TRUNCATE TABLE {#truncate-table}
```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster]
```

テーブルからすべてのデータを削除します。クローズ `IF EXISTS` が省略されると、テーブルが存在しない場合にエラーが返されます。

`TRUNCATE` クエリは、[View](../../engines/table-engines/special/view.md)、[File](../../engines/table-engines/special/file.md)、[URL](../../engines/table-engines/special/url.md)、[Buffer](../../engines/table-engines/special/buffer.md)、および [Null](../../engines/table-engines/special/null.md) テーブルエンジンではサポートされていません。

[alter_sync](/operations/settings/settings#alter_sync) 設定を使用して、レプリカでアクションが実行されるのを待つように設定できます。

[replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) 設定を使用して、非アクティブなレプリカが `TRUNCATE` クエリを実行するのを待つ時間（秒単位）を指定できます。

:::note    
`alter_sync` が `2` に設定されている場合、いくつかのレプリカが、`replication_wait_for_inactive_replica_timeout` 設定によって指定された時間以上非アクティブであると、例外 `UNFINISHED` がスローされます。
:::

## TRUNCATE ALL TABLES {#truncate-all-tables}
```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

データベース内のすべてのテーブルからすべてのデータを削除します。

## TRUNCATE DATABASE {#truncate-database}
```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

データベースからすべてのテーブルを削除しますが、データベース自体は保持します。クローズ `IF EXISTS` が省略されると、データベースが存在しない場合にエラーが返されます。

:::note
`TRUNCATE DATABASE` は `Replicated` データベースではサポートされていません。その代わりに、データベースを単に `DROP` して `CREATE` してください。
:::
