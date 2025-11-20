---
description: 'ローカルディスクとの間でのバックアップおよびリストアの詳細'
sidebar_label: 'ローカルディスク / S3 ディスク'
slug: /operations/backup/disk
title: 'ClickHouse のバックアップとリストア'
doc_type: 'guide'
---

import GenericSettings from '@site/docs/operations_/backup_restore/_snippets/_generic_settings.md';
import S3Settings from '@site/docs/operations_/backup_restore/_snippets/_s3_settings.md';
import ExampleSetup from '@site/docs/operations_/backup_restore/_snippets/_example_setup.md';
import Syntax from '@site/docs/operations_/backup_restore/_snippets/_syntax.md';


# ディスクへのBACKUP / RESTORE {#backup-to-a-local-disk}


## 構文 {#syntax}

<Syntax />


## ディスクのバックアップ先を設定する {#configure-backup-destinations-for-disk}

### ローカルディスクのバックアップ先を設定する {#configure-a-backup-destination}

以下の例では、バックアップ先が `Disk('backups', '1.zip')` として指定されています。  
`Disk` バックアップエンジンを使用するには、まず以下のパスにバックアップ先を指定するファイルを追加する必要があります:

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

例えば、以下の設定では `backups` という名前のディスクを定義し、そのディスクを **backups** の **allowed_disk** リストに追加しています:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
<!--highlight-next-line -->
            <backups>
                <type>local</type>
                <path>/backups/</path>
            </backups>
        </disks>
    </storage_configuration>
<!--highlight-start -->
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path>
    </backups>
<!--highlight-end -->
</clickhouse>
```

### S3ディスクのバックアップ先を設定する {#backuprestore-using-an-s3-disk}

ClickHouseストレージ設定でS3ディスクを設定することにより、S3への `BACKUP`/`RESTORE` も可能です。ローカルディスクの場合と同様に、`/etc/clickhouse-server/config.d` にファイルを追加してディスクを設定します。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3_plain>
                <type>s3_plain</type>
                <endpoint></endpoint>
                <access_key_id></access_key_id>
                <secret_access_key></secret_access_key>
            </s3_plain>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3_plain</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>

    <backups>
        <allowed_disk>s3_plain</allowed_disk>
    </backups>
</clickhouse>
```

S3ディスクの `BACKUP`/`RESTORE` は、ローカルディスクと同じ方法で実行します:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note

- このディスクは `MergeTree` 自体には使用せず、`BACKUP`/`RESTORE` のみに使用してください
- テーブルがS3ストレージを使用しており、ディスクのタイプが異なる場合、
  パーツを宛先バケットにコピーする際に `CopyObject` 呼び出しを使用せず、代わりに
  ダウンロードとアップロードを行うため、非常に非効率的です。この場合は、
  `BACKUP ... TO S3(<endpoint>)` 構文の使用を推奨します。
  :::


## ローカルディスクへのバックアップ/リストアの使用例 {#usage-examples}

### テーブルのバックアップとリストア {#backup-and-restore-a-table}

<ExampleSetup />

テーブルをバックアップするには、次のコマンドを実行します:

```sql title="Query"
BACKUP TABLE test_db.test_table TO Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status─────────┐
1. │ 065a8baf-9db7-4393-9c3f-ba04d1e76bcd │ BACKUP_CREATED │
   └──────────────────────────────────────┴────────────────┘
```

テーブルが空の場合、次のコマンドでバックアップからテーブルをリストアできます:

```sql title="Query"
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status───┐
1. │ f29c753f-a7f2-4118-898e-0e4600cd2797 │ RESTORED │
   └──────────────────────────────────────┴──────────┘
```

:::note
上記の`RESTORE`は、テーブル`test.table`にデータが含まれている場合は失敗します。
設定`allow_non_empty_tables=true`を使用すると、`RESTORE TABLE`が空でないテーブルにデータを挿入できるようになります。これにより、テーブル内の既存データとバックアップから抽出されたデータが混在します。
この設定はテーブル内でデータの重複を引き起こす可能性があるため、注意して使用してください。
:::

既にデータが含まれているテーブルをリストアするには、次のコマンドを実行します:

```sql
RESTORE TABLE test_db.table_table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

テーブルは新しい名前でリストアまたはバックアップできます:

```sql
RESTORE TABLE test_db.table_table AS test_db.test_table_renamed FROM Disk('backups', '1.zip')
```

このバックアップのアーカイブは次の構造を持ちます:

```text
├── .backup
└── metadata
    └── test_db
        └── test_table.sql
```

<!-- TO DO: 
Explanation here about the backup format. See Issue 24a
https://github.com/ClickHouse/clickhouse-docs/issues/3968
-->

zip以外の形式も使用できます。詳細については、以下の["tarアーカイブとしてのバックアップ"](#backups-as-tar-archives)を参照してください。

### ディスクへの増分バックアップ {#incremental-backups}

ClickHouseにおけるベースバックアップとは、後続の増分バックアップが作成される元となる初回の完全バックアップです。増分バックアップはベースバックアップ以降の変更のみを保存するため、増分バックアップからリストアするにはベースバックアップを利用可能な状態に保つ必要があります。ベースバックアップの保存先は設定`base_backup`で指定できます。

:::note
増分バックアップはベースバックアップに依存します。増分バックアップからリストアできるようにするには、ベースバックアップを利用可能な状態に保つ必要があります。
:::

テーブルの増分バックアップを作成するには、まずベースバックアップを作成します:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'd.zip')
```

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'incremental-a.zip')
SETTINGS base_backup = Disk('backups', 'd.zip')
```

増分バックアップとベースバックアップのすべてのデータは、次のコマンドで新しいテーブル`test_db.test_table2`にリストアできます:

```sql
RESTORE TABLE test_db.test_table AS test_db.test_table2
FROM Disk('backups', 'incremental-a.zip');
```

### バックアップの保護 {#assign-a-password-to-the-backup}

ディスクに書き込まれるバックアップには、ファイルにパスワードを適用できます。
パスワードは`password`設定を使用して指定できます:

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

パスワード保護されたバックアップをリストアするには、`password`設定を使用して再度パスワードを指定する必要があります:

```sql
RESTORE TABLE test_db.test_table
FROM Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

### tarアーカイブとしてのバックアップ {#backups-as-tar-archives}

バックアップはzipアーカイブだけでなく、tarアーカイブとしても保存できます。
機能はzipと同じですが、tarアーカイブではパスワード保護がサポートされていません。さらに、tarアーカイブはさまざまな圧縮方式をサポートしています。

テーブルをtarとしてバックアップするには:


```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar')
```

tarアーカイブからリストアする場合：

```sql
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.tar')
```

圧縮方式を変更するには、バックアップ名に適切なファイル拡張子を追加します。例えば、tarアーカイブをgzipで圧縮する場合は次のように実行します：

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar.gz')
```

サポートされている圧縮ファイル拡張子は以下の通りです：

- `tar.gz`
- `.tgz`
- `tar.bz2`
- `tar.lzma`
- `.tar.zst`
- `.tzst`
- `.tar.xz`

### 圧縮設定 {#compression-settings}

圧縮方式と圧縮レベルは、それぞれ`compression_method`と`compression_level`設定を使用して指定できます。

<!-- TO DO:
More information needed on these settings and why you would want to do this
-->

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'filename.zip')
SETTINGS compression_method='lzma', compression_level=3
```

### 特定のパーティションのリストア {#restore-specific-partitions}

テーブルに関連付けられた特定のパーティションをリストアする必要がある場合、それらを指定できます。

4つのパーティションを持つシンプルなパーティションテーブルを作成し、データを挿入した後、1番目と4番目のパーティションのみをバックアップしてみましょう：

<details>

<summary>セットアップ</summary>

```sql
CREATE IF NOT EXISTS test_db;

-- パーティションテーブルを作成
CREATE TABLE test_db.partitioned (
    id UInt32,
    data String,
    partition_key UInt8
) ENGINE = MergeTree()
PARTITION BY partition_key
ORDER BY id;

INSERT INTO test_db.partitioned VALUES
(1, 'data1', 1),
(2, 'data2', 2),
(3, 'data3', 3),
(4, 'data4', 4);

SELECT count() FROM test_db.partitioned;

SELECT partition_key, count()
FROM test_db.partitioned
GROUP BY partition_key
ORDER BY partition_key;
```

```response
   ┌─count()─┐
1. │       4 │
   └─────────┘
   ┌─partition_key─┬─count()─┐
1. │             1 │       1 │
2. │             2 │       1 │
3. │             3 │       1 │
4. │             4 │       1 │
   └───────────────┴─────────┘
```

</details>

パーティション1と4をバックアップするには、次のコマンドを実行します：

```sql
BACKUP TABLE test_db.partitioned PARTITIONS '1', '4'
TO Disk('backups', 'partitioned.zip')
```

パーティション1と4をリストアするには、次のコマンドを実行します：

```sql
RESTORE TABLE test_db.partitioned PARTITIONS '1', '4'
FROM Disk('backups', 'partitioned.zip')
SETTINGS allow_non_empty_tables=true
```
