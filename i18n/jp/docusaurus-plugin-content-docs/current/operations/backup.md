---
description: 'ClickHouseのデータベースおよびテーブルのバックアップと復元に関するガイド'
sidebar_label: 'バックアップと復元'
sidebar_position: 10
slug: /operations/backup
title: 'バックアップと復元'
---


# バックアップと復元

- [ローカルディスクへのバックアップ](#backup-to-a-local-disk)
- [S3エンドポイントを使用するバックアップ/復元の設定](#configuring-backuprestore-to-use-an-s3-endpoint)
- [S3ディスクを使用したバックアップ/復元](#backuprestore-using-an-s3-disk)
- [代替案](#alternatives)

## コマンド概要 {#command-summary}

```bash
 BACKUP|RESTORE
  TABLE [db.]table_name [AS [db.]table_name_in_backup]
    [PARTITION[S] partition_expr [,...]] |
  DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
  DATABASE database_name [AS database_name_in_backup]
    [EXCEPT TABLES ...] |
  TEMPORARY TABLE table_name [AS table_name_in_backup] |
  VIEW view_name [AS view_name_in_backup]
  ALL TEMPORARY TABLES [EXCEPT ...] |
  ALL [EXCEPT ...] } [,...]
  [ON CLUSTER 'cluster_name']
  TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
  [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]
```

:::note ALL
ClickHouseのバージョン23.4以前では、`ALL`は`RESTORE`コマンドにのみ適用されました。
:::

## 概要 {#background}

[レプリケーション](../engines/table-engines/mergetree-family/replication.md)はハードウェア障害からの保護を提供しますが、人為的なエラーから保護するものではありません: データの偶発的な削除、誤ったテーブルの削除、誤ったクラスター上のテーブルの削除、およびデータ処理またはデータ破損を引き起こすソフトウェアバグが含まれます。多くのケースで、こうしたミスはすべてのレプリカに影響を及ぼすことがあります。ClickHouseには一部のタイプのミスを防ぐための組込みの安全対策があります — たとえば、デフォルトでは[50 Gbを超えるデータを含むMergeTreeライクなエンジンのテーブルをドロップできない](/operations/settings/settings#max_table_size_to_drop)ようになっています。しかし、これらの安全対策はすべての可能なケースをカバーしているわけではなく、迂回される可能性があります。

人為的エラーの可能性を効果的に軽減するために、**事前に**データのバックアップと復元の戦略を慎重に準備する必要があります。

各企業は異なるリソースとビジネス要件を持っているため、すべての状況に適したClickHouseのバックアップと復元の普遍的な解決策は存在しません。一ギガバイトのデータに適したものは、十数ペタバイトには適さない可能性が高いです。さまざまな利点と欠点を持つ多様なアプローチがあり、これらについて以下で説明します。そのさまざまな欠点を補うために、一つの方法だけでなく、いくつかの方法を併用することをお勧めします。

:::note
バックアップした内容の復元を試しに行っていない場合、実際に必要なときに復元が正常に行われない可能性が高いです（少なくともビジネスが耐えられる以上の時間がかかるでしょう）。したがって、どのバックアップアプローチを選択しても、復元プロセスも自動化し、余分なClickHouseクラスター上で定期的に実施することが重要です。
:::

## ローカルディスクへのバックアップ {#backup-to-a-local-disk}

### バックアップ先の設定 {#configure-a-backup-destination}

以下の例では、バックアップ先が`Disk('backups', '1.zip')`のように指定されています。 ディスクの設定を行うには、`/etc/clickhouse-server/config.d/backup_disk.xml`にファイルを追加してバックアップ先を指定します。たとえば、このファイルでは`backups`という名前のディスクを定義し、そのディスクを**backups > allowed_disk**リストに追加しています：

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

### パラメータ {#parameters}

バックアップはフルバックアップまたは増分バックアップのいずれかにし、テーブル（マテリアライズドビュー、プロジェクション、辞書を含む）およびデータベースを含めることができます。バックアップは同期（デフォルト）または非同期で行うことができます。圧縮が可能です。バックアップはパスワードで保護することができます。

BACKUPおよびRESTORE文は、DATABASEおよびTABLE名のリスト、宛先（またはソース）、オプション、設定を受け取ります：
- バックアップの宛先、または復元のソース。これは前述のディスクに基づいています。たとえば`Disk('backups', 'filename.zip')`
- ASYNC: 非同期でバックアップまたは復元を行う
- PARTITIONS: 復元するパーティションのリスト
- SETTINGS:
    - `id`: バックアップまたは復元操作のIDで、手動で指定しない場合はランダムに生成されたUUIDが使用されます。同じ`id`を持つ実行中の操作がある場合は例外がスローされます。
    - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec)および圧縮レベル
    - ディスク上のファイルに対する`password`
    - `base_backup`: このソースの以前のバックアップの宛先。たとえば、`Disk('backups', '1.zip')`
    - `use_same_s3_credentials_for_base_backup`: 基本バックアップがS3の資格情報をクエリから継承するかどうか。これは`S3`の場合のみ機能します。
    - `use_same_password_for_base_backup`: 基本バックアップアーカイブがクエリからパスワードを継承するかどうか。
    - `structure_only`: 有効にすると、テーブルのデータなしでCREATE文だけをバックアップまたは復元することができます。
    - `storage_policy`: 復元されるテーブルのストレージポリシー。詳細は[データストレージに複数のブロックデバイスを使用する](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)を参照してください。この設定は`RESTORE`コマンドのみに適用されます。指定されたストレージポリシーは、`MergeTree`ファミリーのエンジンを持つテーブルにのみ適用されます。
    - `s3_storage_class`: S3バックアップに使用されるストレージクラス。たとえば、`STANDARD`
    - `azure_attempt_to_create_container`: Azure Blobストレージを使用する場合、指定されたコンテナが存在しない場合に作成を試みるかどうか。デフォルト: true。
    - [コア設定](/operations/settings/settings)もここで使用できます。

### 使用例 {#usage-examples}

テーブルをバックアップし、次に復元します：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

対応する復元：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
上記のRESTOREは、`test.table`テーブルにデータが含まれている場合は失敗します。RESTOREをテストするには、テーブルを削除する必要があります。あるいは、設定`allow_non_empty_tables=true`を使用してください：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```
:::

新しい名前でテーブルを復元またはバックアップすることができます：
```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### 増分バックアップ {#incremental-backups}

増分バックアップは`base_backup`を指定することで取得できます。
:::note
増分バックアップは基本バックアップに依存しています。増分バックアップから復元できるようにするためには、基本バックアップを利用可能な状態にしておかなければなりません。
:::

新しいデータを増分的にストアします。設定`base_backup`により、以前のバックアップからのデータが`Disk('backups', 'd.zip')`にストアされ、`Disk('backups', 'incremental-a.zip')`に保存されます：
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

増分バックアップとbase_backupからすべてのデータを新しいテーブル`test.table2`に復元します：
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### バックアップにパスワードを設定する {#assign-a-password-to-the-backup}

ディスクに書き込まれたバックアップには、ファイルにパスワードを適用できます：
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

復元：
```sql
RESTORE TABLE test.table
  FROM Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

### 圧縮設定 {#compression-settings}

圧縮方法やレベルを指定したい場合：
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### 特定のパーティションを復元する {#restore-specific-partitions}
テーブルに関連する特定のパーティションを復元する必要がある場合、これらを指定できます。バックアップからパーティション1および4を復元するために：
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### tarアーカイブとしてバックアップ {#backups-as-tar-archives}

バックアップはtarアーカイブとしても保存できます。機能はzipの場合と同様ですが、パスワードはサポートされていません。

バックアップをtarとして書き込む：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

対応する復元：
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

圧縮方法を変更するためには、バックアップ名に正しいファイル接尾辞を追加する必要があります。つまり、gzipを使用してtarアーカイブを圧縮するためには：
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

サポートされている圧縮ファイル接尾辞は`tar.gz`, `.tgz`, `tar.bz2`, `tar.lzma`, `.tar.zst`, `.tzst`, `.tar.xz`です。


### バックアップのステータスを確認する {#check-the-status-of-backups}

バックアップコマンドは`id`と`status`を返し、その`id`を使用してバックアップのステータスを取得できます。これは長時間のASYNCバックアップの進捗状況を確認するのに非常に便利です。以下の例は、既存のバックアップファイルを上書きしようとしたときに発生した失敗を示しています：
```sql
BACKUP TABLE helloworld.my_first_table TO Disk('backups', '1.zip') ASYNC
```
```response
┌─id───────────────────────────────────┬─status──────────┐
│ 7678b0b3-f519-4e6e-811f-5a0781a4eb52 │ CREATING_BACKUP │
└──────────────────────────────────────┴─────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

```sql
SELECT
    *
FROM system.backups
where id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
FORMAT Vertical
```
```response
Row 1:
──────
id:                7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:              Disk('backups', '1.zip')
#highlight-next-line
status:            BACKUP_FAILED
num_files:         0
uncompressed_size: 0
compressed_size:   0
#highlight-next-line
error:             Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 22.8.2.11 (official build))
start_time:        2022-08-30 09:21:46
end_time:          2022-08-30 09:21:46

1 row in set. Elapsed: 0.002 sec.
```

`system.backups`テーブルに加え、すべてのバックアップおよび復元操作は、システムログテーブル[backup_log](../operations/system-tables/backup_log.md)にも記録されています：
```sql
SELECT *
FROM system.backup_log
WHERE id = '7678b0b3-f519-4e6e-811f-5a0781a4eb52'
ORDER BY event_time_microseconds ASC
FORMAT Vertical
```
```response
Row 1:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.097414
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  CREATING_BACKUP
error:
start_time:              2023-08-18 11:13:43
end_time:                1970-01-01 03:00:00
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

Row 2:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.174782
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  BACKUP_FAILED
#highlight-next-line
error:                   Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 23.8.1.1)
start_time:              2023-08-18 11:13:43
end_time:                2023-08-18 11:13:43
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

2 rows in set. Elapsed: 0.075 sec.
```

## S3エンドポイントを使用するBACKUP/RESTOREの設定 {#configuring-backuprestore-to-use-an-s3-endpoint}

S3バケットにバックアップを書き込むには、次の3つの情報が必要です：
- S3エンドポイント、
  たとえば`https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- アクセスキーID、
  たとえば`ABC123`
- シークレットアクセスキー、
  たとえば`Abc+123`

:::note
S3バケットの作成については、[ClickHouseディスクとしてS3オブジェクトストレージを使用する](https://github.com/AlexAkulov/clickhouse-backup)で説明しています。ポリシーを保存した後、このドキュメントに戻っていただく必要がありますが、ClickHouseをS3バケットで使用するように構成する必要はありません。
:::

バックアップの宛先は次のように指定されます：

```sql
S3('<S3 endpoint>/<directory>', '<Access key ID>', '<Secret access key>')
```

```sql
CREATE TABLE data
(
    `key` Int,
    `value` String,
    `array` Array(String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 1000
```

### ベース（初期）バックアップを作成する {#create-a-base-initial-backup}

増分バックアップには、_ベース_バックアップが必要です。この例は後でベースバックアップとして使用されます。 S3宛先の最初のパラメータはS3エンドポイントで、その後にバックアップに使用するバケット内のディレクトリが続きます。この例では、ディレクトリには`my_backup`という名前が付けられています。

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### データを追加する {#add-more-data}

増分バックアップには、基本バックアップと現在バックアップしているテーブルの内容との間の差分が保存されます。増分バックアップを取得する前に、データを追加します：

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```
### 増分バックアップを取得する {#take-an-incremental-backup}

このバックアップコマンドは基本バックアップと似ていますが、`SETTINGS base_backup`と基本バックアップの場所を追加します。増分バックアップの宛先は基本バックアップと同じディレクトリではなく、同じエンドポイントでバケット内の異なるターゲットディレクトリになります。基本バックアップは`my_backup`にあり、増分バックアップは`my_incremental`に書き込まれます：
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
### 増分バックアップから復元する {#restore-from-the-incremental-backup}

このコマンドは増分バックアップを新しいテーブル`data3`に復元します。増分バックアップを復元する場合、基本バックアップも含まれます。復元時には、増分バックアップのみを指定します：
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### カウントを確認する {#verify-the-count}

元のテーブル`data`には、1,000行と100行の2つの挿入があります。合計1,100行です。復元されたテーブルに1,100行があることを確認します：
```sql
SELECT count()
FROM data3
```
```response
┌─count()─┐
│    1100 │
└─────────┘
```

### 内容を確認する {#verify-the-content}
これは元のテーブル`data`と復元されたテーブル`data3`の内容を比較します：
```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'Data does not match after BACKUP/RESTORE')
```
## S3ディスクを使用したBACKUP/RESTORE {#backuprestore-using-an-s3-disk}

ClickHouseのストレージ構成でS3ディスクを設定することにより、`BACKUP`/`RESTORE`をS3に行うことも可能です。次のようにディスクを構成し、`/etc/clickhouse-server/config.d`にファイルを追加します：

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

そして通常通り`BACKUP`/`RESTORE`を行います：

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
ただし、以下の点を考慮してください：
- このディスクは`MergeTree`自体には使用しないでください。`BACKUP`/`RESTORE`のみに使用してください。
- テーブルがS3ストレージによってバックアップされている場合、ディスクの種類が異なると、`CopyObject`呼び出しを使ってパーツを目的のバケットにコピーするのではなく、ダウンロードしてアップロードされるため、非常に非効率的です。このユースケースの場合は、`BACKUP ... TO S3(<endpoint>)`構文の使用が推奨されます。
:::

## 名前付きコレクションの使用 {#using-named-collections}

名前付きコレクションは`BACKUP/RESTORE`のパラメータとして使用できます。例については[こちら](./named-collections.md#named-collections-for-backups)をご覧ください。

## 代替案 {#alternatives}

ClickHouseはディスクにデータを保存し、バックアップのためのさまざまな方法があります。これらは過去に使用されてきた代替案であり、あなたの環境に適合するかもしれません。

### ソースデータの他の場所での複製 {#duplicating-source-data-somewhere-else}

ClickHouseに取り込まれたデータは、しばしば[Apache Kafka](https://kafka.apache.org)のような永続的なキューを通じて配信されます。この場合、ClickHouseに書き込まれている間に同じデータストリームを読み取る追加のサブスクライバーセットを設定し、コールドストレージに保存することができます。ほとんどの企業には、オブジェクトストアや[HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)のような分散ファイルシステムのようなデフォルトの推奨コールドストレージがあります。

### ファイルシステムのスナップショット {#filesystem-snapshots}

一部のローカルファイルシステムはスナップショット機能を提供します（たとえば、[ZFS](https://en.wikipedia.org/wiki/ZFS)）。ただし、ライブクエリの提供に最適とは限りません。考えられる解決策は、この種のファイルシステムを使用して追加のレプリカを作成し、`SELECT`クエリに使用される[Distributed](../engines/table-engines/special/distributed.md)テーブルから除外することです。そのようなレプリカのスナップショットに対しては、データを変更するクエリが行えなくなります。さらに、これらのレプリカは、各サーバーに接続されているより多くのディスクを持つ特別なハードウェア構成を持つことができ、そのコスト効率も良好です。

データ量が少ない場合は、リモートテーブルへの単純な`INSERT INTO ... SELECT ...`でも可能です。

### パーツの操作 {#manipulations-with-parts}

ClickHouseは`ALTER TABLE ... FREEZE PARTITION ...`クエリを使用して、テーブルパーティションのローカルコピーを作成することを許可しています。これは`/var/lib/clickhouse/shadow/`フォルダーへのハードリンクを使用して実装されているため、古いデータの追加ディスクスペースは通常消費されません。作成されたファイルのコピーはClickHouseサーバーによって管理されないため、そのままにしておくことができます。これにより、追加の外部システムを必要としないシンプルなバックアップが得られますが、それでもハードウェアの問題には脆弱です。このため、別の場所にリモートでコピーし、ローカルコピーを削除する方が良いです。分散ファイルシステムやオブジェクトストアは、このための良好な選択肢でもありますが、十分な容量を持つ通常の添付ファイルサーバーでも機能します（この場合、転送はネットワークファイルシステムまたは[rsync](https://en.wikipedia.org/wiki/Rsync)を介して行われます）。バックアップからデータを復元するには、`ALTER TABLE ... ATTACH PARTITION ...`を使用します。

パーティション操作に関連するクエリについての詳しい情報は、[ALTERのドキュメント](/sql-reference/statements/alter/partition)を参照してください。

このアプローチを自動化するためのサードパーティツールも利用可能です：[clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup)。

## 同時バックアップ/復元を許可しない設定 {#settings-to-disallow-concurrent-backuprestore}

同時バックアップ/復元を許可しないために、次の設定をそれぞれ使用できます。

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

両方のデフォルト値はtrueであるため、デフォルトでは同時にバックアップ/復元が行えます。
これらの設定がクラスターでfalseの場合、同時に実行できるバックアップ/復元は1つだけに制限されます。

## AzureBlobStorageエンドポイントを使用するBACKUP/RESTOREの設定 {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

AzureBlobStorageコンテナにバックアップを書き込むためには、次の情報が必要です：
- AzureBlobStorageエンドポイント接続文字列/URL、
- コンテナ、
- パス、
- アカウント名（URLが指定される場合）
- アカウントキー（URLが指定される場合）

バックアップの宛先は次のように指定されます：

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```

## システムテーブルのバックアップ {#backup-up-system-tables}

システムテーブルもバックアップおよび復元のワークフローに含めることができますが、その含有は特定の使用ケースによって異なります。

### ログテーブルのバックアップ {#backing-up-log-tables}

履歴データを保存するシステムテーブル（例：`query_log`や`part_log`など）は、他のテーブルと同様にバックアップおよび復元できます。使用ケースが履歴データの分析に依存している場合（たとえば、`query_log`を使用してクエリパフォーマンスを追跡したり、問題をデバッグする場合）、これらのテーブルをバックアップ戦略に含めることをお勧めします。ただし、これらのテーブルの履歴データが必要ない場合は、バックアップストレージスペースを節約するために除外できます。

### アクセス管理テーブルのバックアップ {#backing-up-access-management-tables}

ユーザー、ロール、行ポリシー、設定プロファイル、クォータなどのアクセス管理に関連するシステムテーブルは、バックアップおよび復元操作中に特別な扱いを受けます。これらのテーブルがバックアップに含まれる場合、その内容は特別な`accessXX.txt`ファイルにエクスポートされ、アクセスエンティティを作成および構成するための同等のSQL文がエンキャプスされます。復元時に、復元プロセスはこれらのファイルを解釈し、SQLコマンドを再適用してユーザー、ロール、その他の構成を再作成します。

この機能により、ClickHouseクラスターのアクセス制御構成をクラスター全体のセットアップの一部としてバックアップおよび復元できることが保証されます。

注：この機能は、SQLコマンドを介して管理される構成に対してのみ機能します（[「SQL駆動のアクセス制御およびアカウント管理」](/operations/access-rights#enabling-access-control)を参照）。ClickHouseサーバーの構成ファイル（例：`users.xml`）で定義されたアクセス構成は、バックアップに含まれず、この方法で復元することはできません。
