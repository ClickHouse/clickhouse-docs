---
'description': 'バックアップからテーブル/データベースを読み取り専用モードで即座に接続することを許可します。'
'sidebar_label': 'バックアップ'
'sidebar_position': 60
'slug': '/engines/database-engines/backup'
'title': 'バックアップ'
'doc_type': 'reference'
---


# バックアップ

データベースバックアップは、[バックアップ](../../operations/backup)からテーブル/データベースを即座に読み取り専用モードでアタッチすることを可能にします。

データベースバックアップは、増分バックアップと非増分バックアップの両方で機能します。

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', 'backup_destination')
```

バックアップの宛先は、`Disk`、`S3`、`File`などの有効なバックアップ[宛先](../../operations/backup#configure-a-backup-destination)にすることができます。

`Disk`バックアップ宛先で、バックアップからデータベースを作成するためのクエリは次のようになります：

```sql
CREATE DATABASE backup_database
ENGINE = Backup('database_name_inside_backup', Disk('disk_name', 'backup_name'))
```

**エンジンパラメーター**

- `database_name_inside_backup` — バックアップ内のデータベースの名前。
- `backup_destination` — バックアップ宛先。

## 使用例 {#usage-example}

`Disk`バックアップ宛先を使用した例を見てみましょう。まず、`storage.xml`にバックアップディスクを設定しましょう：

```xml
<storage_configuration>
    <disks>
        <backups>
            <type>local</type>
            <path>/home/ubuntu/ClickHouseWorkDir/backups/</path>
        </backups>
    </disks>
</storage_configuration>
<backups>
    <allowed_disk>backups</allowed_disk>
    <allowed_path>/home/ubuntu/ClickHouseWorkDir/backups/</allowed_path>
</backups>
```

使用例です。テストデータベースを作成し、テーブルを作成し、データを挿入した後、バックアップを作成します：

```sql
CREATE DATABASE test_database;

CREATE TABLE test_database.test_table_1 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_1 VALUES (0, 'test_database.test_table_1');

CREATE TABLE test_database.test_table_2 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_2 VALUES (0, 'test_database.test_table_2');

CREATE TABLE test_database.test_table_3 (id UInt64, value String) ENGINE=MergeTree ORDER BY id;
INSERT INTO test_database.test_table_3 VALUES (0, 'test_database.test_table_3');

BACKUP DATABASE test_database TO Disk('backups', 'test_database_backup');
```

これで`test_database_backup`バックアップができましたので、データベースBackupを作成します：

```sql
CREATE DATABASE test_database_backup ENGINE = Backup('test_database', Disk('backups', 'test_database_backup'));
```

これで、データベースから任意のテーブルをクエリできます：

```sql
SELECT id, value FROM test_database_backup.test_table_1;

┌─id─┬─value──────────────────────┐
│  0 │ test_database.test_table_1 │
└────┴────────────────────────────┘

SELECT id, value FROM test_database_backup.test_table_2;

┌─id─┬─value──────────────────────┐
│  0 │ test_database.test_table_2 │
└────┴────────────────────────────┘

SELECT id, value FROM test_database_backup.test_table_3;

┌─id─┬─value──────────────────────┐
│  0 │ test_database.test_table_3 │
└────┴────────────────────────────┘
```

このデータベースBackupも通常のデータベースのように扱うことが可能です。たとえば、その中のテーブルをクエリすることができます：

```sql
SELECT database, name FROM system.tables WHERE database = 'test_database_backup':

┌─database─────────────┬─name─────────┐
│ test_database_backup │ test_table_1 │
│ test_database_backup │ test_table_2 │
│ test_database_backup │ test_table_3 │
└──────────────────────┴──────────────┘
```
