---
'description': '`Atomic`エンジンは非ブロッキングの`DROP TABLE`および`RENAME TABLE`クエリ、そして原子的な`EXCHANGE
  TABLES`クエリをサポートしています。`Atomic`データベースエンジンはデフォルトで使用されます。'
'sidebar_label': 'Atomic'
'sidebar_position': 10
'slug': '/engines/database-engines/atomic'
'title': 'Atomic'
'doc_type': 'reference'
---


# Atomic 

`Atomic`エンジンは、非ブロッキングの[`DROP TABLE`](#drop-detach-table)および[`RENAME TABLE`](#rename-table)クエリ、及び原子的な[`EXCHANGE TABLES`](#exchange-tables)クエリをサポートしています。`Atomic`データベースエンジンは、オープンソースのClickHouseでデフォルトで使用されます。

:::note
ClickHouse Cloudでは、デフォルトで[`Shared`データベースエンジン](/cloud/reference/shared-catalog#shared-database-engine)が使用されており、前述の操作もサポートしています。
:::

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic] [SETTINGS disk=...];
```

## 特殊事項と推奨事項 {#specifics-and-recommendations}

### テーブルUUID {#table-uuid}

`Atomic`データベースの各テーブルには、永続的な[UUID](../../sql-reference/data-types/uuid.md)があり、そのデータは以下のディレクトリに保存されます：

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

ここで、`xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy`はテーブルのUUIDです。

デフォルトでは、UUIDは自動的に生成されます。ただし、ユーザーはテーブル作成時に明示的にUUIDを指定することもできますが、これは推奨されません。

例えば：

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
`SHOW CREATE`クエリでUUIDを表示するために、[show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil)設定を使用できます。
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md)クエリはUUIDを変更せず、テーブルデータを移動しません。これらのクエリは即座に実行され、テーブルを使用している他のクエリが完了するのを待つことはありません。

### DROP/DETACH TABLE {#drop-detach-table}

`DROP TABLE`を使用する場合、データは削除されません。`Atomic`エンジンは単にテーブルを削除されたとしてマークし、そのメタデータを`/clickhouse_path/metadata_dropped/`に移動し、バックグラウンドスレッドに通知します。最終的なテーブルデータ削除までの遅延は、[`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec)設定で指定されます。`SYNC`修飾子を使用して同期モードを指定できます。これを行うには、[`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously)設定を使用します。この場合、`DROP`は、テーブルを使用している実行中の`SELECT`、`INSERT`および他のクエリが終了するのを待ちます。テーブルは使用されていないときに削除されます。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md)クエリは、テーブルまたは辞書を原子的にスワップします。例えば、この非原子的な操作の代わりに：

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```
原子的な操作を使用できます：

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### atomicデータベースのReplicatedMergeTree {#replicatedmergetree-in-atomic-database}

[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication)テーブルに対しては、ZooKeeperのパスとレプリカ名に対してエンジンパラメータを指定しないことを推奨します。この場合、構成パラメータ[`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path)および[`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name)が使用されます。エンジンパラメータを明示的に指定したい場合は、`{uuid}`マクロを使用することを推奨します。これにより、ZooKeeper内の各テーブルに対してユニークなパスが自動的に生成されます。

### メタデータディスク {#metadata-disk}
`SETTINGS`で`disk`が指定されている場合、そのディスクはテーブルメタデータファイルを保存するために使用されます。
例えば：

```sql
CREATE TABLE db (n UInt64) ENGINE = Atomic SETTINGS disk=disk(type='local', path='/var/lib/clickhouse-disks/db_disk');
```
未指定の場合、`database_disk.disk`で定義されたディスクがデフォルトで使用されます。

## 参照 {#see-also}

- [system.databases](../../operations/system-tables/databases.md)システムテーブル
