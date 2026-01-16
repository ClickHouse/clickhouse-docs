---
description: 'ローカルディスクへのバックアップおよびローカルディスクからのリストアの詳細'
sidebar_label: 'ローカルディスク / S3 ディスク'
slug: /operations/backup/disk
title: 'ClickHouse のバックアップとリストア'
doc_type: 'guide'
---

import GenericSettings from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_generic_settings.md';
import S3Settings from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_s3_settings.md';
import ExampleSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_example_setup.md';
import Syntax from '@site/i18n/jp/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';

# ローカルディスクへのバックアップ／リストア \\{#backup-to-a-local-disk\\}

## 構文 \\{#syntax\\}

<Syntax/>

## ディスク用のバックアップ先を構成する \\{#configure-backup-destinations-for-disk\\}

### ローカルディスク用のバックアップ先を構成する \\{#configure-a-backup-destination\\}

以下の例では、バックアップ先は `Disk('backups', '1.zip')` として指定されています。\
`Disk` バックアップエンジンを使用するには、まず以下のパスにバックアップ先を指定するファイルを追加する必要があります。

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

例えば、以下の構成では `backups` という名前のディスクを定義し、次にそのディスクを **backups** の **allowed&#95;disk** リストに追加します。

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

### S3 ディスク用のバックアップ先を設定する \\{#backuprestore-using-an-s3-disk\\}

ClickHouse のストレージ設定で S3 ディスクを構成することで、`BACKUP`/`RESTORE` の実行先として S3 を利用することも可能です。ローカルディスクの場合と同様に、`/etc/clickhouse-server/config.d` にファイルを追加して、このディスクを次のように設定します。

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

S3 ディスクに対する `BACKUP`／`RESTORE` は、ローカル ディスクの場合と同様に実行できます。

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note

* このディスクは `MergeTree` 自体には使用せず、`BACKUP`/`RESTORE` 用にのみ使用してください。
* もしテーブルが S3 ストレージをバックエンドとしており、ディスクの種類が異なる場合、
  パーツを宛先バケットにコピーする際に `CopyObject` 呼び出しは使用されず、
  代わりに一度ダウンロードしてからアップロードするため、非常に非効率です。このようなケースでは、
  この用途には `BACKUP ... TO S3(<endpoint>)` 構文の使用を推奨します。
  :::

## ローカルディスクへのバックアップ／リストアの使用例 \\{#usage-examples\\}

### テーブルのバックアップとリストア \\{#backup-and-restore-a-table\\}

<ExampleSetup />

テーブルをバックアップするには、次のコマンドを実行します：

```sql title="Query"
BACKUP TABLE test_db.test_table TO Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status─────────┐
1. │ 065a8baf-9db7-4393-9c3f-ba04d1e76bcd │ BACKUP_CREATED │
   └──────────────────────────────────────┴────────────────┘
```

テーブルが空の場合は、次のコマンドでバックアップからテーブルを復元できます。

```sql title="Query"
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status───┐
1. │ f29c753f-a7f2-4118-898e-0e4600cd2797 │ RESTORED │
   └──────────────────────────────────────┴──────────┘
```

:::note
上記の `RESTORE` は、テーブル `test.table` にデータが含まれている場合は失敗します。
設定 `allow_non_empty_tables=true` を有効にすると、`RESTORE TABLE` がデータを
空ではないテーブルに挿入できるようになります。これにより、テーブル内の既存データと、バックアップから復元されるデータが混在します。
そのため、この設定はテーブル内のデータが重複する可能性があるため、注意して使用する必要があります。
:::

既にデータが入っているテーブルを復元するには、次を実行します。

```sql
RESTORE TABLE test_db.table_table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

テーブルは新しい名前を付けてリストアまたはバックアップできます。

```sql
RESTORE TABLE test_db.table_table AS test_db.test_table_renamed FROM Disk('backups', '1.zip')
```

このバックアップのアーカイブは、次の構造になっています。

```text
├── .backup
└── metadata
    └── test_db
        └── test_table.sql
```

{/* TO DO: 
  ここにバックアップ形式の説明を追加すること。Issue 24a を参照。
  https://github.com/ClickHouse/clickhouse-docs/issues/3968
  */ }

zip 以外の形式も使用できます。詳細については、以下の [&quot;Backups as tar archives&quot;](#backups-as-tar-archives)
を参照してください。

### ディスクへの増分バックアップ \\{#incremental-backups\\}

ClickHouse におけるベースバックアップは、その後に作成される
増分バックアップの基準となる最初のフルバックアップです。増分バックアップには、
ベースバックアップ以降に行われた変更のみが保存されるため、任意の増分バックアップから
リストアできるように、ベースバックアップを利用可能な状態で保持しておく必要があります。
ベースバックアップの保存先は、設定 `base_backup` で指定できます。

:::note
増分バックアップはベースバックアップに依存します。増分バックアップから
リストアできるようにするには、ベースバックアップを利用可能な状態で保持しておく必要があります。
:::

テーブルの増分バックアップを作成するには、まずベースバックアップを作成してください。

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'd.zip')
```

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'incremental-a.zip')
SETTINGS base_backup = Disk('backups', 'd.zip')
```

増分バックアップとベースバックアップのすべてのデータは、次のコマンドで新しいテーブル `test_db.test_table2` に復元できます。

```sql
RESTORE TABLE test_db.test_table AS test_db.test_table2
FROM Disk('backups', 'incremental-a.zip');
```

### バックアップの保護 \\{#assign-a-password-to-the-backup\\}

ディスクに出力されるバックアップファイルには、パスワードを設定できます。
パスワードは `password` 設定を使用して指定します。

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

パスワードで保護されたバックアップを復元するには、`password` 設定でパスワードを再度指定する必要があります。

```sql
RESTORE TABLE test_db.test_table
FROM Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

### tar アーカイブとしてのバックアップ \\{#backups-as-tar-archives\\}

バックアップは zip アーカイブだけでなく、tar アーカイブとしても保存できます。
tar アーカイブに対する機能は zip アーカイブの場合と同様ですが、tar アーカイブではパスワード保護はサポートされていません。さらに、tar アーカイブではさまざまな圧縮方式がサポートされています。

テーブルを tar アーカイブとしてバックアップするには、次のようにします。

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar')
```

tar アーカイブから復元するには:

```sql
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.tar')
```

圧縮方式を変更するには、バックアップ名に正しいファイル拡張子を付ける必要があります。例えば、tar アーカイブを gzip で圧縮するには、次を実行します。

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar.gz')
```

サポートされている圧縮ファイルの拡張子は次のとおりです。

* `tar.gz`
* `.tgz`
* `tar.bz2`
* `tar.lzma`
* `.tar.zst`
* `.tzst`
* `.tar.xz`

### 圧縮設定 \\{#compression-settings\\}

圧縮方式と圧縮レベルは、それぞれ設定 `compression_method` と `compression_level` を使用して指定できます。

{/* TO DO:
  これらの設定の詳細と、それを行う理由についての情報を追記する
  */ }

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'filename.zip')
SETTINGS compression_method='lzma', compression_level=3
```

### 特定のパーティションを復元する \\{#restore-specific-partitions\\}

テーブルに関連付けられた特定のパーティションのみを復元する必要がある場合、それらを個別に指定できます。

4つのパーティションを持つ単純なパーティション分割テーブルを作成し、いくつかのデータを挿入してから、
最初と4番目のパーティションのみのバックアップを取得してみます。

<details>
  <summary>セットアップ</summary>

  ```sql
CREATE IF NOT EXISTS test_db;
       
-- Create a partitioned table
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

次のコマンドを実行して、パーティション 1 と 4 のバックアップを作成します。

```sql
BACKUP TABLE test_db.partitioned PARTITIONS '1', '4'
TO Disk('backups', 'partitioned.zip')
```

パーティション 1 と 4 を復元するには、以下のコマンドを実行します。

```sql
RESTORE TABLE test_db.partitioned PARTITIONS '1', '4'
FROM Disk('backups', 'partitioned.zip')
SETTINGS allow_non_empty_tables=true
```
