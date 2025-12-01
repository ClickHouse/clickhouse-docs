---
description: '`Atomic` エンジンは、非ブロッキングな `DROP TABLE` および `RENAME TABLE` クエリと、アトミックな `EXCHANGE TABLES` クエリをサポートします。`Atomic` データベースエンジンはデフォルトで使用されます。'
sidebar_label: 'Atomic'
sidebar_position: 10
slug: /engines/database-engines/atomic
title: 'Atomic'
doc_type: 'reference'
---



# Atomic  {#atomic}

`Atomic` エンジンは、ノンブロッキングな [`DROP TABLE`](#drop-detach-table) および [`RENAME TABLE`](#rename-table) クエリに加え、アトミックな [`EXCHANGE TABLES`](#exchange-tables) クエリをサポートします。`Atomic` データベースエンジンは、オープンソース版の ClickHouse でデフォルトとして使用されています。 

:::note
ClickHouse Cloud では、デフォルトで [`Shared` データベースエンジン](/cloud/reference/shared-catalog#shared-database-engine) が使用されており、上記の操作もサポートしています。
:::



## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic] [SETTINGS disk=...];
```


## 詳細と推奨事項 {#specifics-and-recommendations}

### テーブル UUID {#table-uuid}

`Atomic` データベース内の各テーブルには永続的な [UUID](../../sql-reference/data-types/uuid.md) が付与されており、そのデータは以下のディレクトリに保存されます。

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

ここで、`xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` はテーブルの UUID です。

デフォルトでは UUID は自動的に生成されます。ただし、テーブル作成時に UUID を明示的に指定することも可能ですが、これは推奨されません。

例:

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
[`SHOW CREATE` クエリで UUID を表示するには、[show&#95;table&#95;uuid&#95;in&#95;table&#95;create&#95;query&#95;if&#95;not&#95;nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil) 設定を使用できます。
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md) クエリは UUID を変更せず、テーブルデータも移動しません。これらのクエリは即座に実行され、そのテーブルを使用している他のクエリの完了を待ちません。

### DROP/DETACH TABLE {#drop-detach-table}

`DROP TABLE` を使用しても、データはすぐには削除されません。`Atomic` エンジンは、メタデータを `/clickhouse_path/metadata_dropped/` に移動してテーブルを削除済みとしてマークし、バックグラウンドスレッドに通知するだけです。テーブルデータが最終的に削除されるまでの遅延は、[`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec) 設定で指定します。
`SYNC` 修飾子を使用して同期モードを指定できます。これを行うには、[`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously) 設定を使用します。この場合、`DROP` はテーブルを使用している実行中の `SELECT`、`INSERT` などのクエリが終了するまで待機します。テーブルは使用されていない状態になったときに削除されます。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md) クエリは、テーブルやディクショナリをアトミックに入れ替えます。たとえば、次のような非アトミックな操作の代わりに使用できます。

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```

アトミックなものも利用できます：

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### atomic データベースにおける ReplicatedMergeTree {#replicatedmergetree-in-atomic-database}

[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) テーブルでは、ZooKeeper 内のパスおよびレプリカ名を指定するエンジンパラメータは設定しないことを推奨します。この場合、設定パラメータ [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) と [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name) が使用されます。エンジンパラメータを明示的に指定したい場合は、`{uuid}` マクロを使用することを推奨します。これにより、ZooKeeper 内でテーブルごとに一意なパスが自動的に生成されます。

### メタデータディスク {#metadata-disk}

`SETTINGS` 内で `disk` が指定されている場合、そのディスクはテーブルのメタデータファイルの保存に使用されます。
例えば次のとおりです。

```sql
CREATE TABLE db (n UInt64) ENGINE = Atomic SETTINGS disk=disk(type='local', path='/var/lib/clickhouse-disks/db_disk');
```

未指定の場合は、`database_disk.disk` で定義されたディスクがデフォルトで使用されます。


## 関連項目 {#see-also}

- [system.databases](../../operations/system-tables/databases.md) システムテーブル
