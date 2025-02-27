---
slug: /engines/database-engines/atomic
sidebar_label: Atomic
sidebar_position: 10
title: "Atomic"
description: "`Atomic`エンジンは、非ブロッキングの`DROP TABLE`および`RENAME TABLE`クエリ、ならびにアトミックな`EXCHANGE TABLES`クエリをサポートしています。`Atomic`データベースエンジンはデフォルトで使用されます。"
---

# Atomic 

`Atomic`エンジンは、非ブロッキングの[`DROP TABLE`](#drop-detach-table)および[`RENAME TABLE`](#rename-table)クエリ、ならびにアトミックな[`EXCHANGE TABLES`](#exchange-tables)クエリをサポートしています。`Atomic`データベースエンジンはデフォルトで使用されます。

:::note
ClickHouse Cloudでは、デフォルトで`Replicated`データベースエンジンが使用されます。
:::

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic];
```

## 特徴と推奨事項 {#specifics-and-recommendations}

### テーブルUUID {#table-uuid}

`Atomic`データベース内の各テーブルは永続的な[UUID](../../sql-reference/data-types/uuid.md)を持ち、データは以下のディレクトリに保存されます：

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

ここで、`xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy`はテーブルのUUIDです。

デフォルトでは、UUIDは自動的に生成されます。ただし、ユーザーはテーブル作成時にUUIDを明示的に指定することもできますが、お勧めしません。

例えば：

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
[`show_table_uuid_in_table_create_query_if_not_nil`](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil)設定を使用して、`SHOW CREATE`クエリでUUIDを表示することができます。 
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md)クエリはUUIDを変更したりテーブルデータを移動したりしません。これらのクエリは即座に実行され、テーブルを使用している他のクエリが完了するのを待つことはありません。

### DROP/DETACH TABLE {#drop-detach-table}

`DROP TABLE`を使用する場合、データは削除されません。`Atomic`エンジンはテーブルを削除されたものとしてマークし、そのメタデータを`/clickhouse_path/metadata_dropped/`に移動するだけです。その後、バックグラウンドスレッドに通知します。最終的なテーブルデータの削除までの遅延は、[`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec)設定によって指定されます。
`synchronize`モードを指定するには、`SYNC`修飾子を使用します。[`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously)設定を使用してこれを実行します。この場合、`DROP`は、テーブルを使用している実行中の`SELECT`、`INSERT`などのクエリが完了するのを待ちます。テーブルは使用されていないときに削除されます。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md)クエリは、テーブルまたは辞書をアトミックに交換します。たとえば、次の非アトミック操作の代わりに：

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```
アトミックな操作を使用できます：

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### AtomicデータベースのReplicatedMergeTree {#replicatedmergetree-in-atomic-database}

[`ReplicatedMergeTree`](../table-engines/mergetree-family/replication.md#table_engines-replication)テーブルの場合、ZooKeeper内のパスとレプリカ名のエンジンパラメータを指定しないことをお勧めします。この場合、構成パラメータ[`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path)および[`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name)が使用されます。エンジンパラメータを明示的に指定したい場合は、`{uuid}`マクロを使用することをお勧めします。これにより、ZooKeeper内の各テーブルに対して一意のパスが自動的に生成されます。

## さらに見る {#see-also}

- [system.databases](../../operations/system-tables/databases.md)システムテーブル
