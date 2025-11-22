---
description: '`Atomic` エンジンは、ブロックしない `DROP TABLE` および `RENAME TABLE` クエリと、アトミックな `EXCHANGE TABLES` クエリをサポートします。`Atomic` データベースエンジンはデフォルトのデータベースエンジンです。'
sidebar_label: 'Atomic'
sidebar_position: 10
slug: /engines/database-engines/atomic
title: 'Atomic'
doc_type: 'reference'
---



# Atomic 

`Atomic` エンジンは、ブロックしない [`DROP TABLE`](#drop-detach-table) および [`RENAME TABLE`](#rename-table) クエリと、アトミックな [`EXCHANGE TABLES`](#exchange-tables) クエリをサポートします。`Atomic` データベースエンジンは、オープンソース版 ClickHouse で既定のデータベースエンジンとして使用されます。 

:::note
ClickHouse Cloud では、[`Shared` データベースエンジン](/cloud/reference/shared-catalog#shared-database-engine) が既定で使用され、上記の操作もサポートします。
:::



## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic] [SETTINGS disk=...];
```


## 仕様と推奨事項 {#specifics-and-recommendations}

### テーブルUUID {#table-uuid}

`Atomic`データベース内の各テーブルは永続的な[UUID](../../sql-reference/data-types/uuid.md)を持ち、以下のディレクトリにデータを格納します:

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

ここで`xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy`はテーブルのUUIDです。

デフォルトでは、UUIDは自動的に生成されます。ただし、テーブル作成時にユーザーが明示的にUUIDを指定することも可能ですが、推奨されません。

例:

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
[show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil)設定を使用することで、`SHOW CREATE`クエリでUUIDを表示できます。
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md)クエリはUUIDを変更せず、テーブルデータも移動しません。これらのクエリは即座に実行され、テーブルを使用している他のクエリの完了を待機しません。

### DROP/DETACH TABLE {#drop-detach-table}

`DROP TABLE`を使用する場合、データは削除されません。`Atomic`エンジンは、メタデータを`/clickhouse_path/metadata_dropped/`に移動してテーブルを削除済みとしてマークし、バックグラウンドスレッドに通知するだけです。最終的なテーブルデータ削除までの遅延時間は、[`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec)設定で指定されます。
`SYNC`修飾子を使用して同期モードを指定できます。これには[`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously)設定を使用します。この場合、`DROP`はテーブルを使用している実行中の`SELECT`、`INSERT`、その他のクエリが完了するまで待機します。テーブルは使用されていない状態になると削除されます。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md)クエリは、テーブルまたはディクショナリをアトミックに交換します。例えば、次の非アトミック操作の代わりに:

```sql title="非アトミック"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```

アトミックな操作を使用できます:

```sql title="アトミック"
EXCHANGE TABLES new_table AND old_table;
```

### Atomicデータベース内のReplicatedMergeTree {#replicatedmergetree-in-atomic-database}

[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication)テーブルの場合、ZooKeeper内のパスとレプリカ名のエンジンパラメータを指定しないことが推奨されます。この場合、設定パラメータ[`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path)と[`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name)が使用されます。エンジンパラメータを明示的に指定する場合は、`{uuid}`マクロを使用することが推奨されます。これにより、ZooKeeper内の各テーブルに対して一意のパスが自動的に生成されます。

### メタデータディスク {#metadata-disk}

`SETTINGS`で`disk`が指定されている場合、そのディスクがテーブルメタデータファイルの保存に使用されます。
例:

```sql
CREATE TABLE db (n UInt64) ENGINE = Atomic SETTINGS disk=disk(type='local', path='/var/lib/clickhouse-disks/db_disk');
```

指定されていない場合、デフォルトで`database_disk.disk`で定義されたディスクが使用されます。


## 関連項目 {#see-also}

- [system.databases](../../operations/system-tables/databases.md) システムテーブル
