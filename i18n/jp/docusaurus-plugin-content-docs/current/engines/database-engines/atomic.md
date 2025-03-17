---
slug: /engines/database-engines/atomic
sidebar_label: Atomic
sidebar_position: 10
title: "Atomic"
description: "`Atomic`エンジンは、ブロックしない`DROP TABLE`および`RENAME TABLE`クエリ、ならびに原子性のある`EXCHANGE TABLES`クエリをサポートします。デフォルトでは、`Atomic`データベースエンジンが使用されます。"
---


# Atomic 

`Atomic`エンジンは、ブロックしない [`DROP TABLE`](#drop-detach-table) および [`RENAME TABLE`](#rename-table) クエリ、ならびに原子性のある [`EXCHANGE TABLES`](#exchange-tables) クエリをサポートします。デフォルトでは、`Atomic`データベースエンジンが使用されます。

:::note
ClickHouse Cloud では、デフォルトで `Replicated` データベースエンジンが使用されます。
:::

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic];
```

## 特徴と推奨事項 {#specifics-and-recommendations}

### テーブルUUID {#table-uuid}

`Atomic`データベース内の各テーブルには永久的な [UUID](../../sql-reference/data-types/uuid.md) があり、次のディレクトリにデータを格納します。

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

ここで `xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` はテーブルのUUIDです。

デフォルトでは、UUIDは自動的に生成されます。ただし、ユーザーはテーブルを作成する際にUUIDを明示的に指定できますが、これは推奨されません。

例えば：

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
`SHOW CREATE`クエリでUUIDを表示するには、[show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil) 設定を使用できます。
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md) クエリはUUIDを変更したり、テーブルデータを移動したりしません。これらのクエリは即座に実行され、テーブルを使用している他のクエリの完了を待ちません。

### DROP/DETACH TABLE {#drop-detach-table}

`DROP TABLE`を使用する場合、データは削除されません。`Atomic`エンジンは、テーブルを削除されたとマークするだけで、メタデータを`/clickhouse_path/metadata_dropped/`に移動し、バックグラウンドスレッドに通知します。最終的なテーブルデータの削除までの遅延は、[`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec) 設定で指定されます。
`synchronous`モードを指定するには、`SYNC`修飾子を使用します。これを行うには、[`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously) 設定を使用します。この場合、`DROP`はテーブルを使用している実行中の`SELECT`、`INSERT`および他のクエリが完了するのを待ちます。テーブルが使用されていないときに削除されます。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md) クエリは、テーブルまたはディクショナリを原子性をもって交換します。例えば、この非原子性の操作の代わりに：

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```
原子性のある操作を使用できます：

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### AtomicデータベースにおけるReplicatedMergeTree {#replicatedmergetree-in-atomic-database}

[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) テーブルの場合、ZooKeeper内のパスやレプリカ名のためのエンジンパラメータを指定しないことを推奨します。この場合、設定パラメータ [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) および [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name) が使用されます。エンジンパラメータを明示的に指定したい場合は、`{uuid}` マクロを使用することを推奨します。これにより、ZooKeeper内の各テーブルのユニークなパスが自動的に生成されます。

## 参考情報 {#see-also}

- [system.databases](../../operations/system-tables/databases.md) システムテーブル
