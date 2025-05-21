---
description: '`Atomic`エンジンは、非ブロッキングの`DROP TABLE`および`RENAME TABLE`クエリ、ならびにアトミックな`EXCHANGE TABLES`クエリをサポートします。`Atomic`データベースエンジンはデフォルトで使用されます。'
sidebar_label: 'Atomic'
sidebar_position: 10
slug: /engines/database-engines/atomic
title: 'Atomic'
---


# Atomic 

`Atomic`エンジンは、非ブロッキングの[`DROP TABLE`](#drop-detach-table)および[`RENAME TABLE`](#rename-table)クエリ、ならびにアトミックな[`EXCHANGE TABLES`](#exchange-tables)クエリをサポートします。`Atomic`データベースエンジンはデフォルトで使用されます。

:::note
ClickHouse Cloudでは、`Replicated`データベースエンジンがデフォルトで使用されます。
:::

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic];
```

## 特徴と推奨事項 {#specifics-and-recommendations}

### テーブルUUID {#table-uuid}

`Atomic`データベース内の各テーブルには永続的な[UUID](../../sql-reference/data-types/uuid.md)があり、そのデータは次のディレクトリに保存されます：

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

ここで、`xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy`はテーブルのUUIDです。

デフォルトでは、UUIDは自動的に生成されますが、ユーザーはテーブル作成時にUUIDを明示的に指定できますが、推奨されません。

例えば：

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
[show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil)設定を使用して、`SHOW CREATE`クエリでUUIDを表示できます。
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md)クエリはUUIDを変更せず、テーブルデータを移動しません。これらのクエリは即座に実行され、テーブルを使用している他のクエリが完了するのを待ちません。

### DROP/DETACH TABLE {#drop-detach-table}

`DROP TABLE`を使用する際、データは削除されません。`Atomic`エンジンは、テーブルを削除されたとしてマークするだけで、メタデータを`/clickhouse_path/metadata_dropped/`に移動し、バックグラウンドスレッドに通知します。最終的なテーブルデータ削除の遅延は、[`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec)設定で指定されます。
`synchronous`モードを指定するには、`SYNC`修飾子を使用します。これを行うには、[`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously)設定を使用します。この場合、`DROP`は、テーブルを使用している`SELECT`、`INSERT`および他のクエリが完了するのを待ちます。テーブルが使用されていないときに削除されます。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md)クエリは、テーブルまたは辞書をアトミックに入れ替えます。例えば、次の非アトミック操作の代わりに：

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```
アトミックなものを使用できます：

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### Atomicデータベース内のReplicatedMergeTree {#replicatedmergetree-in-atomic-database}

[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication)テーブルについては、ZooKeeper内のパスのエンジンパラメータおよびレプリカ名を指定しないことをお勧めします。この場合、設定パラメータ[`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path)および[`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name)が使用されます。エンジンパラメータを明示的に指定したい場合は、`{uuid}`マクロを使用することをお勧めします。これにより、ZooKeeper内の各テーブルのためにユニークなパスが自動的に生成されます。

## その他 {#see-also}

- [system.databases](../../operations/system-tables/databases.md)システムテーブル
