---
'description': 'The `Atomic` engine supports non-blocking `DROP TABLE` and `RENAME
  TABLE` queries, and atomic `EXCHANGE TABLES`queries. The `Atomic` database engine
  is used by default.'
'sidebar_label': 'Atomic'
'sidebar_position': 10
'slug': '/engines/database-engines/atomic'
'title': 'Atomic'
---




# Atomic 

`Atomic` エンジンは、非ブロッキングの [`DROP TABLE`](#drop-detach-table) および [`RENAME TABLE`](#rename-table) クエリ、及び原子性のある [`EXCHANGE TABLES`](#exchange-tables) クエリをサポートしています。 `Atomic` データベースエンジンはデフォルトで使用されます。

:::note
ClickHouse Cloud では、デフォルトで `Replicated` データベースエンジンが使用されます。
:::

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE test [ENGINE = Atomic];
```

## 特徴と推奨事項 {#specifics-and-recommendations}

### テーブルUUID {#table-uuid}

`Atomic` データベース内の各テーブルは、永続的な [UUID](../../sql-reference/data-types/uuid.md) を持ち、以下のディレクトリにデータを保存します：

```text
/clickhouse_path/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/
```

ここで、`xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` はテーブルのUUIDです。

デフォルトでは、UUIDは自動的に生成されます。ただし、ユーザーはテーブルを作成する際にUUIDを明示的に指定することもできますが、これは推奨されません。

例えば：

```sql
CREATE TABLE name UUID '28f1c61c-2970-457a-bffe-454156ddcfef' (n UInt64) ENGINE = ...;
```

:::note
[show_table_uuid_in_table_create_query_if_not_nil](../../operations/settings/settings.md#show_table_uuid_in_table_create_query_if_not_nil) 設定を使用すると、`SHOW CREATE` クエリでUUIDを表示できます。
:::

### RENAME TABLE {#rename-table}

[`RENAME`](../../sql-reference/statements/rename.md) クエリは、UUIDを変更したりテーブルデータを移動したりしません。これらのクエリは即座に実行され、テーブルを使用している他のクエリが完了するのを待ちません。

### DROP/DETACH TABLE {#drop-detach-table}

`DROP TABLE` を使用する際に、データは削除されません。 `Atomic` エンジンは、メタデータを `/clickhouse_path/metadata_dropped/` に移動させることでテーブルを削除済みとしてマークし、バックグラウンドスレッドに通知します。最終的なテーブルデータの削除までの遅延は、[`database_atomic_delay_before_drop_table_sec`](../../operations/server-configuration-parameters/settings.md#database_atomic_delay_before_drop_table_sec) 設定で指定されます。 `SYNC` 修飾子を使用して同期モードを指定することができます。これを行うためには、[`database_atomic_wait_for_drop_and_detach_synchronously`](../../operations/settings/settings.md#database_atomic_wait_for_drop_and_detach_synchronously) 設定を使用してください。この場合、`DROP` はテーブルを使用している実行中の `SELECT`、`INSERT`、その他のクエリが完了するのを待ちます。テーブルは使用中でない時に削除されます。

### EXCHANGE TABLES/DICTIONARIES {#exchange-tables}

[`EXCHANGE`](../../sql-reference/statements/exchange.md) クエリは、テーブルまたはディクショナリを原子に入れ替えます。例えば、次の非原子的な操作の代わりに：

```sql title="Non-atomic"
RENAME TABLE new_table TO tmp, old_table TO new_table, tmp TO old_table;
```
原子性のあるものを使用できます：

```sql title="Atomic"
EXCHANGE TABLES new_table AND old_table;
```

### Atomic データベースにおける ReplicatedMergeTree {#replicatedmergetree-in-atomic-database}

[`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) テーブルの場合、ZooKeeper内のパスとレプリカ名のためのエンジンパラメータを指定しないことが推奨されます。この場合、設定パラメータ [`default_replica_path`](../../operations/server-configuration-parameters/settings.md#default_replica_path) および [`default_replica_name`](../../operations/server-configuration-parameters/settings.md#default_replica_name) が使用されます。エンジンパラメータを明示的に指定したい場合は、`{uuid}` マクロを使用することが推奨されます。これにより、ZooKeeper内の各テーブルに対してユニークなパスが自動的に生成されます。

## 参照 {#see-also}

- [system.databases](../../operations/system-tables/databases.md) システムテーブル
